from fastapi import Depends, HTTPException, status
from app.api.v1.auth import get_current_user
from app.models.user_model import User

def require_premium(current_user: User = Depends(get_current_user)) -> User:
    if current_user.subscription_plan != "premium" or current_user.subscription_status not in ["active", "trialing"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required"
        )
    return current_user
