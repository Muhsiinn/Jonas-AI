from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.models.daily_situation_model import DailySituation
from app.models.user_model import User
from app.workflows.writing_workflow import build_workflow

router = APIRouter()

@router.get("/create_goal")
async def make_lesson(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    daily_situation = db.query(DailySituation).filter(
        DailySituation.user_id == current_user.id,
        DailySituation.created_at >= start,
        DailySituation.created_at < end,
    ).first()

    if daily_situation is None:
        raise HTTPException(
            status_code=404,
            detail="No daily situation found for today. Please create one first.",
        )

    initial_state = {
        "daily_situation": daily_situation.daily_situation
    }

    app = build_workflow()
    result = await app.ainvoke(initial_state)
    return {"goal": result}


