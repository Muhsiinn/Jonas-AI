from datetime import date, datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.models.daily_situation_model import DailySituation
from app.models.user_model import User
from app.schemas.writing_schema import Goal, WritingHistoryItem
from app.core.llm import LLMClient, MODEL_NAME
from app.models.writng_model import Writing
from app.schemas.evaluate_writing_schema import (
    WritingEvaluation,
    WritingEvaluationRequest,
    WritingEvaluationResponse,
)
from app.api.v1.stats import update_user_stats
from app.models.activity_log_model import ActivityLog

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
async def writing(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1) 
    existing_goal = (
        db.query(Writing)
        .filter(
            Writing.user_id == current_user.id,
            Writing.created_at >= start,
            Writing.created_at < end,
        )
        .first()
    )
    if existing_goal:
        return {"goal": existing_goal.goal}

    daily_situation = (
        db.query(DailySituation)
        .filter(
            DailySituation.user_id == current_user.id,
            DailySituation.created_at >= start,
            DailySituation.created_at < end,
        )
        .first()
    )
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
        user_id=user_id,
        goal=result.goal,
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return {"goal": result.goal}


@router.get("/history", response_model=List[WritingHistoryItem])
async def get_writing_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    writings = (
        db.query(Writing)
        .filter(Writing.user_id == current_user.id)
        .order_by(Writing.created_at.desc())
        .all()
    )

    history: List[WritingHistoryItem] = []
    for item in writings:
        history.append(
            WritingHistoryItem(
                id=item.id,
                goal=item.goal,
                created_at=item.created_at,
                completed=bool(item.user_input and item.user_input.strip()),
                user_input=item.user_input,
            )
        )

    return history


def make_evaluation_prompt(goal: str, user_input: str) -> str:
    return f"""
You are a supportive German writing coach in a German learning app.

Your task is to evaluate the learner’s writing based on the given goal.

Evaluate how well the learner’s writing matches the goal.

Focus on:
- Task completion (Did they fully respond to what the goal asked?)
- Grammar and sentence structure
- Clarity and coherence
- Appropriateness of tone (formal, informal, polite, etc., if required)

Be constructive, encouraging, and specific.
Highlight what the learner did well before suggesting improvements.

Return your evaluation in the following structured format:

score: integer from 0 to 100  
strengths: short, positive feedback highlighting what was done well  
improvements: short, actionable advice explaining how to improve  
review: 2–4 sentences of friendly overall feedback, motivating the learner to keep improving  

Do NOT rewrite the entire text.
Do NOT provide a corrected full version unless explicitly asked.
Keep feedback clear, supportive, and concise.

Goal:
{goal}

Learner writing:
{user_input}
""".strip()


@router.post("/evaluate", response_model=WritingEvaluationResponse)
async def evaluate_writing(
    payload: WritingEvaluationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    writing = (
        db.query(Writing)
        .filter(
            Writing.user_id == current_user.id,
            Writing.created_at >= start,
            Writing.created_at < end,
        )
        .order_by(Writing.created_at.desc())
        .first()
    )
    if not writing:
        raise HTTPException(status_code=404, detail="No writing goal found for today")

    prompt = make_evaluation_prompt(writing.goal, payload.user_input)
    messages = [{"role": "system", "content": prompt}]

    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)
    evaluation = await chat.with_structured_output(WritingEvaluation).ainvoke(messages)

    writing.user_input = payload.user_input
    db.commit()

    writing_activity = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.activity_type == "writing",
            ActivityLog.created_at >= start,
            ActivityLog.created_at < end,
        )
        .first()
    )

    if writing_activity is None:
        points_earned = evaluation.score + 10
        update_user_stats(db, current_user.id, points_earned, "writing", writing.id)

    return WritingEvaluationResponse(goal=writing.goal, evaluation=evaluation)

