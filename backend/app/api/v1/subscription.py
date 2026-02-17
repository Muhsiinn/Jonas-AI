from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user_model import User


router = APIRouter()


class CheckoutRequest(BaseModel):
    price_id: str


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class SubscriptionStatusResponse(BaseModel):
    plan: str
    status: str
    current_period_end: str | None
    cancel_at_period_end: bool


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SubscriptionStatusResponse:
    user = db.query(User).filter(User.id == current_user.id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    plan = user.subscription_plan or "free"
    status_value = user.subscription_status or "free"
    current_end = (
        user.subscription_current_period_end.isoformat()
        if user.subscription_current_period_end
        else None
    )
    cancel_at_period_end = status_value == "canceled"
    return SubscriptionStatusResponse(
        plan=plan,
        status=status_value,
        current_period_end=current_end,
        cancel_at_period_end=cancel_at_period_end,
    )


@router.post("/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
) -> CheckoutSessionResponse:
    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_PRICE_ID_PREMIUM:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stripe is not configured for subscriptions",
        )
    price_id = data.price_id or settings.STRIPE_PRICE_ID_PREMIUM
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            success_url=f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/checkout/cancel",
            client_reference_id=str(current_user.id),
            customer_email=current_user.email,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )
    return CheckoutSessionResponse(session_id=session.id, url=session.url)


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription to cancel",
        )
    try:
        stripe.Subscription.delete(user.stripe_subscription_id)
    except Exception as e:
        message = str(e)
        if "No such subscription" not in message:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=message,
            )
    user.subscription_plan = "free"
    user.subscription_status = "free"
    user.subscription_current_period_end = None
    user.stripe_subscription_id = None
    db.commit()
    return {"success": True, "message": "Subscription canceled"}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook secret is not configured",
        )
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})
    if event_type == "checkout.session.completed":
        subscription_id = data.get("subscription")
        client_reference_id = data.get("client_reference_id")
        if subscription_id and client_reference_id:
            user = (
                db.query(User)
                .filter(User.id == int(client_reference_id))
                .first()
            )
            if user:
                try:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                except Exception:
                    subscription = None
                if subscription:
                    status_value = subscription.get("status", "active")
                    current_period_end = subscription.get("current_period_end")
                    user.subscription_plan = "premium"
                    user.subscription_status = status_value
                    user.stripe_subscription_id = subscription.get("id")
                    if current_period_end:
                        user.subscription_current_period_end = datetime.fromtimestamp(
                            current_period_end, tz=timezone.utc
                        )
                    db.commit()
    elif event_type == "customer.subscription.updated":
        subscription_id = data.get("id")
        if subscription_id:
            user = (
                db.query(User)
                .filter(User.stripe_subscription_id == subscription_id)
                .first()
            )
            if user:
                status_value = data.get("status", "active")
                current_period_end = data.get("current_period_end")
                user.subscription_status = status_value
                if status_value in ["active", "trialing", "past_due"]:
                    user.subscription_plan = "premium"
                elif status_value == "canceled":
                    user.subscription_plan = "free"
                if current_period_end:
                    user.subscription_current_period_end = datetime.fromtimestamp(
                        current_period_end, tz=timezone.utc
                    )
                db.commit()
    elif event_type == "customer.subscription.deleted":
        subscription_id = data.get("id")
        if subscription_id:
            user = (
                db.query(User)
                .filter(User.stripe_subscription_id == subscription_id)
                .first()
            )
            if user:
                user.subscription_plan = "free"
                user.subscription_status = "free"
                user.subscription_current_period_end = None
                user.stripe_subscription_id = None
                db.commit()
    return {"status": "ok"}

