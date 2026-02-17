from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.core.llm import LLMClient, MODEL_NAME
from app.models.user_model import User
from app.models.writng_model import Writing
from app.schemas.evaluate_writing_schema import (
    WritingEvaluation,
    WritingEvaluationRequest,
    WritingEvaluationResponse,
)

router = APIRouter()


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

    return WritingEvaluationResponse(goal=writing.goal, evaluation=evaluation)
