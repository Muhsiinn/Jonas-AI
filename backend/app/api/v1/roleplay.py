from app.core.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from app.api.v1.auth import get_current_user
from app.models.lesson_model import Lesson
from app.models.user_model import User
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta, timezone
import json
import re
from app.core.utils import open_yaml
from app.core.llm import LLMClient
from app.schemas.roleplay_schema import (
    Goal, 
    ChatMessage, 
    ChatRequest, 
    ChatResponse, 
    SessionResponse, 
    MessageResponse, 
    RoleplayHistoryResponse,
    FinishSessionResponse
)
from app.schemas.agents_schema import Vocabs
from app.api.v1.stats import update_user_stats, refresh_leaderboard_cache
from app.models.goal_model import Roleplay
from app.models.roleplay_message_model import RoleplayMessage
from typing import List
from app.workflows.roleplay_workflow import build_workflow
from app.workflows.nodes.roleplay import build_system_prompt
from app.workflows.nodes.roleplay_evaluation_node import evaluate_roleplay
from app.services.roleplay_service import (
    check_end_in_background_task,
    get_or_create_today_lesson,
    normalize_roleplay_evaluation,
)

router = APIRouter()

@router.get("/session", response_model=SessionResponse)
async def get_session(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    lesson = await get_or_create_today_lesson(current_user=current_user, db=db, start=start, end=end)

    goal = db.query(Roleplay).filter(
        Roleplay.user_id == current_user.id,
        Roleplay.created_at >= start,
        Roleplay.created_at < end
    ).first()
    
    if goal is None:
        raise HTTPException(
            status_code=404, 
            detail="No roleplay goal found for today. Please create a goal first."
        )

    suggested_vocab = []
    if goal.suggested_vocab:
        suggested_vocab = goal.suggested_vocab
    elif lesson.vocab:
        for vocab_item in lesson.vocab[:5]:
            if isinstance(vocab_item, dict):
                suggested_vocab.append({
                    "term": vocab_item.get("term", ""),
                    "meaning": vocab_item.get("meaning", "")
                })

    return SessionResponse(
        title=lesson.title,
        userRole=goal.user_role,
        aiRole=goal.ai_role,
        learningGoal=goal.goal,
        suggestedVocab=suggested_vocab
    )

@router.get("/goal", response_model=Goal)
async def goal_maker(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    existing_goal = db.query(Roleplay).filter(
        Roleplay.user_id == current_user.id,
        Roleplay.created_at >= start,
        Roleplay.created_at < end
    ).first()
    
    if existing_goal:
        return Goal(
            goal=existing_goal.goal,
            user_role=existing_goal.user_role,
            ai_role=existing_goal.ai_role
        )

    lesson = await get_or_create_today_lesson(current_user=current_user, db=db, start=start, end=end)

    title = lesson.title
    text = " ".join(lesson.paragraphs)

    yaml_prompt = open_yaml("app/workflows/prompts.yaml")
    prompt_block = yaml_prompt["roleplay_goal_generator"]

    system_prompt = prompt_block["system"]
    human_prompt = prompt_block["human"]

    system_prompt = system_prompt.replace("{{ lesson_title }}", title)
    system_prompt = system_prompt.replace("{{ lesson_body }}", text)

    human_prompt = human_prompt.replace("{{ lesson_title }}", title)
    human_prompt = human_prompt.replace("{{ lesson_body }}", text)

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": human_prompt,
        }
    ]
    
    goal_llm = LLMClient()
    goal_chat = goal_llm.get_client("tngtech/tng-r1t-chimera:free")
    result = await goal_chat.with_structured_output(Goal).ainvoke(messages)
    
    vocab_prompt = yaml_prompt.get('vocab_prompt', '')
    vocab_system_prompt = vocab_prompt.replace("{{ lesson_text }}", text)
    
    vocab_messages = [
        {
            "role": "system",
            "content": vocab_system_prompt
        }
    ]

    vocab_items = []
    try:
        # Use a separate client instance for structured JSON (LLMClient caches internally)
        vocab_llm = LLMClient()
        vocab_chat = vocab_llm.get_client("nvidia/nemotron-3-nano-30b-a3b:free")
        vocab_result = await vocab_chat.with_structured_output(Vocabs).ainvoke(vocab_messages)
        vocab_items = vocab_result.vocab
    except Exception:
        # Fallback: parse JSON manually (free models can return extra text or truncated JSON)
        try:
            vocab_llm = LLMClient()
            vocab_chat = vocab_llm.get_client("nvidia/nemotron-3-nano-30b-a3b:free")
            raw = await vocab_chat.ainvoke(vocab_messages)
            raw_text = raw.content if hasattr(raw, "content") else str(raw)
            match = re.search(r"\{[\s\S]*\}", raw_text)
            if match:
                data = json.loads(match.group(0))
                vocab_items = Vocabs(**data).vocab
        except Exception:
            vocab_items = []
    
    suggested_vocab = []
    for vocab_item in vocab_items[:5]:
        if getattr(vocab_item, "term", None) and getattr(vocab_item, "meaning", None):
            suggested_vocab.append({
                "term": vocab_item.term,
                "meaning": vocab_item.meaning
            })
    
    res = Roleplay(
        user_id=current_user.id,
        goal=result.goal,
        user_role=result.user_role,
        ai_role=result.ai_role,
        suggested_vocab=suggested_vocab
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    
    return result

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    lesson = await get_or_create_today_lesson(current_user=current_user, db=db, start=start, end=end)

    goal = db.query(Roleplay).filter(
        Roleplay.user_id == current_user.id,
        Roleplay.created_at >= start,
        Roleplay.created_at < end
    ).first()
    
    if goal is None:
        raise HTTPException(status_code=404, detail="No roleplay goal found for today.")

    existing_messages = (
        db.query(RoleplayMessage)
        .filter(RoleplayMessage.roleplay_id == goal.id)
        .order_by(RoleplayMessage.created_at.asc())
        .all()
    )
    chat_history = [ChatMessage(role=m.role, content=m.content) for m in existing_messages]

    if not chat_history:
        lesson_title = lesson.title
        lesson_body = " ".join(lesson.paragraphs)

        system_message = ChatMessage(
            role="system",
            content=build_system_prompt(
                lesson_title,
                lesson_body,
                goal.goal,
                goal.user_role,
                goal.ai_role
            )
        )
        chat_history.append(system_message)
        db.add(RoleplayMessage(
            roleplay_id=goal.id,
            user_id=current_user.id,
            role=system_message.role,
            content=system_message.content
        ))
        db.commit()

    user_message = ChatMessage(role="user", content=request.user_input)
    previous_len = len(chat_history)
    
    # Save user message first
    db.add(RoleplayMessage(
        roleplay_id=goal.id,
        user_id=current_user.id,
        role=user_message.role,
        content=user_message.content
    ))
    db.commit()
    
    chat_history.append(user_message)

    lesson_title = lesson.title
    lesson_body = " ".join(lesson.paragraphs)

    initial_state = {
        "lesson_title": lesson_title,
        "lesson_body": lesson_body,
        "goal_text": goal.goal,
        "user_role": goal.user_role,
        "ai_role": goal.ai_role,
        "chat_history": chat_history,
        "user_input": request.user_input,
        "turn_count": 0,
        "goal_id": goal.id
    }
    
    app = build_workflow()
    result = await app.ainvoke(initial_state)
    new_history = result.get("chat_history", chat_history)
    new_messages = new_history[previous_len:]
    
    # Save only new messages (AI response and any system messages)
    for msg in new_messages:
        if msg.role != "user":  # User message already saved
            db.add(RoleplayMessage(
                roleplay_id=goal.id,
                user_id=current_user.id,
                role=msg.role,
                content=msg.content
            ))
    
    if new_messages:
        db.commit()

    reply = result.get("reply", "").strip()
    for msg in new_messages:
        if msg.role == "assistant" and not reply:
            reply = msg.content.strip()
    
    evaluation = result.get("evaluation")
    done = result.get("done", False)
    
    # If workflow evaluated (conversation ended), save evaluation and update stats
    if evaluation and done:
        avg_score = (
            evaluation.get("grammarScore", 0) + 
            evaluation.get("clarityScore", 0) + 
            evaluation.get("naturalnessScore", 0)
        ) // 3
        
        goal.evaluation = evaluation
        goal.completed = True
        goal.score = avg_score
        db.commit()
        
        points_earned = avg_score + 10
        update_user_stats(db, current_user.id, points_earned, "roleplay", goal.id)
        refresh_leaderboard_cache(db)
        
        # Return reply + evaluation in same response
        return ChatResponse(reply=reply, done=True, evaluation=evaluation)
    
    # Trigger background end_check for THIS reply (for next message)
    if reply:
        background_tasks.add_task(
            check_end_in_background_task,
            goal.id,
            reply,
            lesson_title,
            lesson_body,
            goal.goal,
            goal.user_role,
            goal.ai_role
        )
    
    return ChatResponse(reply=reply, done=False, evaluation=None)

@router.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    goal = db.query(Roleplay).filter(
        Roleplay.user_id == current_user.id,
        Roleplay.created_at >= start,
        Roleplay.created_at < end
    ).first()
    
    if goal is None:
        return []

    messages = (
        db.query(RoleplayMessage)
        .filter(
            RoleplayMessage.roleplay_id == goal.id,
            RoleplayMessage.role.in_(["user", "assistant"])
        )
        .order_by(RoleplayMessage.created_at.asc())
        .all()
    )

    result = []
    for msg in messages:
        speaker = "user" if msg.role == "user" else "ai"
        result.append(MessageResponse(
            id=str(msg.id),
            speaker=speaker,
            text=msg.content,
            timestamp=msg.created_at.isoformat() if msg.created_at else datetime.now(timezone.utc).isoformat(),
            hasCorrection=False
        ))
    
    return result

@router.get("/history", response_model=List[RoleplayHistoryResponse])
async def get_roleplay_history(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    goals = (
        db.query(Roleplay)
        .filter(Roleplay.user_id == current_user.id)
        .order_by(Roleplay.created_at.desc())
        .limit(30)
        .all()
    )

    result = []
    for goal in goals:
        lesson = db.query(Lesson).filter(
            Lesson.user_id == current_user.id,
            Lesson.created_at >= goal.created_at.replace(hour=0, minute=0, second=0, microsecond=0),
            Lesson.created_at < (goal.created_at.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1))
        ).first()
        
        title = lesson.title if lesson else "Unknown"
        
        has_evaluation = goal.evaluation is not None and goal.evaluation != {}
        result.append(RoleplayHistoryResponse(
            id=goal.id,
            title=title,
            completed=has_evaluation,
            score=goal.score if hasattr(goal, 'score') else None,
            created_at=goal.created_at.isoformat() if goal.created_at else None
        ))
    
    return result

@router.post("/finish", response_model=FinishSessionResponse)
async def finish_session(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    lesson = await get_or_create_today_lesson(current_user=current_user, db=db, start=start, end=end)

    goal = db.query(Roleplay).filter(
        Roleplay.user_id == current_user.id,
        Roleplay.created_at >= start,
        Roleplay.created_at < end
    ).first()
    
    if goal is None:
        raise HTTPException(status_code=404, detail="No roleplay goal found for today.")

    if goal.evaluation and goal.evaluation != {}:
        from app.schemas.roleplay_schema import RoleplayEvaluationOutput
        try:
            evaluation = RoleplayEvaluationOutput(**goal.evaluation)
        except Exception:
            evaluation = RoleplayEvaluationOutput(**normalize_roleplay_evaluation(goal.evaluation))
        return FinishSessionResponse(
            evaluation=evaluation,
            score=goal.score or 0
        )

    existing_messages = (
        db.query(RoleplayMessage)
        .filter(RoleplayMessage.roleplay_id == goal.id)
        .order_by(RoleplayMessage.created_at.asc())
        .all()
    )
    chat_history = [ChatMessage(role=m.role, content=m.content) for m in existing_messages]

    if not chat_history:
        raise HTTPException(status_code=400, detail="No conversation found. Cannot evaluate empty session.")

    initial_state = {
        "lesson_title": lesson.title,
        "lesson_body": " ".join(lesson.paragraphs),
        "goal_text": goal.goal,
        "user_role": goal.user_role,
        "ai_role": goal.ai_role,
        "chat_history": chat_history,
        "user_input": "",
        "turn_count": 0,
        "goal_id": goal.id
    }
    
    evaluation_result = await evaluate_roleplay(initial_state)
    evaluation = evaluation_result.get("evaluation")
    
    if not evaluation:
        raise HTTPException(status_code=500, detail="Failed to generate evaluation.")

    from app.schemas.roleplay_schema import RoleplayEvaluationOutput
    evaluation_output = RoleplayEvaluationOutput(**normalize_roleplay_evaluation(evaluation))
    
    avg_score = (
        evaluation.get("grammarScore", 0) + 
        evaluation.get("clarityScore", 0) + 
        evaluation.get("naturalnessScore", 0)
    ) // 3
    
    goal.evaluation = evaluation
    goal.completed = True
    goal.score = avg_score
    db.commit()
    
    points_earned = avg_score + 10
    update_user_stats(db, current_user.id, points_earned, "roleplay", goal.id)
    refresh_leaderboard_cache(db)

    return FinishSessionResponse(
        evaluation=evaluation_output,
        score=avg_score
    )