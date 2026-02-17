from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.models.daily_situation_model import DailySituation
from app.models.user_model import User
from app.workflows.writing_workflow import build_workflow
from app.schemas.writing_schema import WritingState, Goal
from app.core.llm import LLMClient, MODEL_NAME
from app.models.writng_model import Writing

router = APIRouter()
def make_prompt(daily_situation: str) -> str:
    return f"""
You are a goal-setting assistant for a German learning app.

Your job is to generate a NEW writing goal based ONLY on the provided daily situation.

IMPORTANT:
- Do NOT reuse or repeat any of the example goals.
- Do NOT copy example wording.
- The output must be completely adapted to the given situation.
- If the situation is different, the goal must also be different.

The goal must:
- Be written in English
- Describe WHAT the user should write
- Specify WHO it is for (if relevant)
- Explain WHY it is written
- Mention the TYPE of text
- Indicate the TONE

Output rules:
- Output ONLY the goal
- 1–2 sentences maximum
- No explanations
- No formatting
- No examples

--- EXAMPLES (for structure reference only, DO NOT reuse) ---

Daily situation: I was sick today and missed university.
Goal: Write a formal email to your professor explaining that you were sick and missed class and politely ask for the materials.

Daily situation: I want to reflect on my first week in Austria.
Goal: Write a short diary entry about your first week in Austria and describe your feelings and impressions.

--- END OF EXAMPLES ---

Now generate a goal based strictly on this situation:

Daily situation:
{daily_situation}
""".strip()




@router.get("/create_goal")
async def writing(current_user: User = Depends(get_current_user),db:Session = Depends(get_db)):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1) 
    existing_goal = db.query(Writing).filter(
        Writing.user_id == current_user.id,
        Writing.created_at >= start,
        Writing.created_at < end
    ).first()
    if existing_goal:
        return {"goal": existing_goal.goal}

    daily_situation = db.query(DailySituation).filter(
        DailySituation.user_id==current_user.id,
        DailySituation.created_at>=start,
        DailySituation.created_at<end
    ).first()
    if not daily_situation:
        raise HTTPException(status_code=404, detail="Daily situation not found for today")

    system_prompt = make_prompt(daily_situation.daily_situation)
    messages = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]
    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)

    result = await chat.with_structured_output(Goal).ainvoke(messages)
    user_id = current_user.id

    goal = Writing(
        user_id = user_id,
        goal = result.goal,

    )

    db.add(goal)
    db.commit()
    db.refresh(goal)
    print(daily_situation)

    return {"goal": result.goal}

