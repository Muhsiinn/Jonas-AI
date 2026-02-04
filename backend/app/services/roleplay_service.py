from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.daily_situation_model import DailySituation
from app.models.goal_model import Roleplay
from app.models.lesson_model import Lesson
from app.models.roleplay_message_model import RoleplayMessage
from app.models.user_model import User
from app.schemas.roleplay_schema import ChatMessage, RoleplayState
from app.workflows.lesson_workflow import build_workflow as build_lesson_workflow
from app.workflows.nodes.end_node import end_check_node


async def check_end_in_background_task(
    goal_id: int,
    reply: str,
    lesson_title: str,
    lesson_body: str,
    goal_text: str,
    user_role: str,
    ai_role: str,
) -> None:
    """
    Background task to check if the conversation should end (based on last AI reply)
    and persist the result on the roleplay goal for the next request.
    """
    db = SessionLocal()
    try:
        goal = db.query(Roleplay).filter(Roleplay.id == goal_id).first()
        if not goal:
            return

        messages = (
            db.query(RoleplayMessage)
            .filter(RoleplayMessage.roleplay_id == goal.id)
            .order_by(RoleplayMessage.created_at.asc())
            .all()
        )
        chat_history = [ChatMessage(role=m.role, content=m.content) for m in messages]

        state = RoleplayState(
            lesson_title=lesson_title,
            lesson_body=lesson_body,
            goal_text=goal_text,
            user_role=user_role,
            ai_role=ai_role,
            chat_history=chat_history,
            user_input="",
            reply=reply,
            turn_count=0,
            goal_id=goal_id,
        )

        end_result = await end_check_node(state)
        should_end = bool(end_result.get("done", False))

        goal.should_end = should_end
        db.commit()
    finally:
        db.close()


def normalize_roleplay_evaluation(evaluation: Any) -> dict:
    """
    Best-effort normalization for older/badly-shaped evaluation payloads so the UI
    can still render (prevents blank sections / parsing errors).
    """
    if not isinstance(evaluation, dict):
        return {}

    def pick(d: dict, keys: list[str]) -> str:
        for k in keys:
            v = d.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
        return ""

    km = evaluation.get("keyMistake") or {}
    if not isinstance(km, dict):
        km = {}
    isec = evaluation.get("improvedSentence") or {}
    if not isinstance(isec, dict):
        isec = {}
    vu = evaluation.get("vocabularyUpgrade") or {}
    if not isinstance(vu, dict):
        vu = {}

    return {
        "grammarScore": int(evaluation.get("grammarScore", 0) or 0),
        "clarityScore": int(evaluation.get("clarityScore", 0) or 0),
        "naturalnessScore": int(evaluation.get("naturalnessScore", 0) or 0),
        "keyMistake": {
            "original": pick(km, ["original", "originalSentence", "original_sentence", "wrong", "incorrect"]),
            "corrected": pick(
                km, ["corrected", "correctedSentence", "corrected_sentence", "right", "correction"]
            ),
            "explanation": pick(km, ["explanation", "why", "reason"]),
        },
        "improvedSentence": {
            "original": pick(isec, ["original", "yourVersion", "your_version", "student", "studentVersion"]),
            "improved": pick(isec, ["improved", "native", "nativeVersion", "native_version", "better"]),
            "explanation": pick(isec, ["explanation", "why", "reason"]),
        },
        "vocabularyUpgrade": {
            "original": pick(vu, ["original", "used", "youUsed", "you_used"]),
            "upgraded": pick(vu, ["upgraded", "better", "alternative", "betterAlternative", "better_alternative"]),
            "explanation": pick(vu, ["explanation", "why", "reason"]),
        },
    }


async def create_lesson_from_daily_situation(
    current_user: User,
    daily_situation: DailySituation,
    db: Session,
) -> Lesson:
    """Create a Lesson from a DailySituation using the existing lesson workflow."""
    situation_text = daily_situation.daily_situation
    user_profile = current_user.profile

    if not user_profile:
        raise HTTPException(status_code=400, detail="User profile not found. Please complete your profile first.")

    initial_state = {
        "db": db,
        "current_user": current_user,
        "daily_situation": situation_text,
        "user_profile": user_profile,
    }

    app = build_lesson_workflow()
    final_state: dict = {}

    async for event in app.astream(initial_state, stream_mode="updates"):
        for _node_name, node_output in event.items():
            final_state.update(node_output)

    lesson = Lesson(
        user_id=current_user.id,
        vocab=[v.model_dump() for v in final_state.get("vocabs", [])],
        paragraphs=list(final_state["lesson"].paragraphs),
        grammar=[g.model_dump() for g in final_state.get("grammar", [])],
        questions=[q.model_dump() for q in final_state.get("questions", [])],
        title=final_state["lesson"].title,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


async def get_or_create_today_lesson(
    *,
    current_user: User,
    db: Session,
    start: datetime,
    end: datetime,
) -> Lesson:
    """
    Get today's lesson. If none exists, try to create it from today's DailySituation.
    """
    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.user_id == current_user.id,
            Lesson.created_at >= start,
            Lesson.created_at < end,
        )
        .first()
    )
    if lesson:
        return lesson

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
        raise HTTPException(status_code=404, detail="No lesson or daily situation found for today.")

    return await create_lesson_from_daily_situation(current_user=current_user, daily_situation=daily_situation, db=db)

