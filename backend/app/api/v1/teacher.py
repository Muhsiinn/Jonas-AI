from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_premium
from app.core.database import get_db
from app.core.llm import LLMClient, MODEL_NAME
from app.core.utils import open_yaml
from app.models.goal_model import Roleplay
from app.models.lesson_model import Lesson
from app.models.teacher_model import TeacherConversation, TeacherMessage
from app.models.user_model import User
from app.schemas.teacher_schema import (
    TeacherChatRequest,
    TeacherChatResponse,
    TeacherConversationResponse,
    TeacherContextResponse,
    TeacherHistoryResponse,
    TeacherMessageResponse,
    LessonGrammarItem,
    LessonVocabItem,
    RoleplayContext,
    RoleplayVocabItem,
)


router = APIRouter()


def get_or_create_conversation(current_user: User, db: Session) -> TeacherConversation:
    conversation = (
        db.query(TeacherConversation)
        .filter(TeacherConversation.user_id == current_user.id)
        .order_by(TeacherConversation.created_at.desc())
        .first()
    )
    if conversation is not None:
        return conversation
    conversation = TeacherConversation(user_id=current_user.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def build_teacher_context(current_user: User, db: Session) -> TeacherContextResponse:
    lesson = (
        db.query(Lesson)
        .filter(Lesson.user_id == current_user.id)
        .order_by(Lesson.created_at.desc())
        .first()
    )

    lesson_vocab_items: List[LessonVocabItem] = []
    lesson_grammar_items: List[LessonGrammarItem] = []
    lesson_title: str | None = None

    if lesson is not None:
        lesson_title = lesson.title
        if isinstance(lesson.vocab, list):
            for item in lesson.vocab:
                if isinstance(item, dict):
                    lesson_vocab_items.append(
                        LessonVocabItem(
                            term=str(item.get("term", "")),
                            meaning=str(item.get("meaning", "")),
                            example=item.get("example"),
                        )
                    )
        if isinstance(lesson.grammar, list):
            for item in lesson.grammar:
                if isinstance(item, dict):
                    lesson_grammar_items.append(
                        LessonGrammarItem(
                            rule=str(item.get("rule", "")),
                            explanation=str(item.get("explanation", "")),
                            example=item.get("example"),
                        )
                    )

    roleplay = (
        db.query(Roleplay)
        .filter(Roleplay.user_id == current_user.id)
        .order_by(Roleplay.created_at.desc())
        .first()
    )

    roleplay_context: RoleplayContext | None = None

    if roleplay is not None:
        suggested_vocab_items: List[RoleplayVocabItem] = []
        if isinstance(roleplay.suggested_vocab, list):
            for item in roleplay.suggested_vocab:
                if isinstance(item, dict):
                    term = item.get("term")
                    meaning = item.get("meaning")
                    if term and meaning:
                        suggested_vocab_items.append(
                            RoleplayVocabItem(term=str(term), meaning=str(meaning))
                        )
        roleplay_context = RoleplayContext(
            goal=roleplay.goal,
            user_role=roleplay.user_role,
            ai_role=roleplay.ai_role,
            suggested_vocab=suggested_vocab_items or None,
        )

    return TeacherContextResponse(
        lesson_vocab=lesson_vocab_items or None,
        lesson_grammar=lesson_grammar_items or None,
        roleplay_context=roleplay_context,
        lesson_title=lesson_title,
    )


@router.get("/conversation", response_model=TeacherConversationResponse)
async def get_conversation(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> TeacherConversationResponse:
    conversation = get_or_create_conversation(current_user=current_user, db=db)
    created_at = conversation.created_at or datetime.utcnow()
    return TeacherConversationResponse(id=conversation.id, created_at=created_at.isoformat())


@router.get("/messages", response_model=List[TeacherMessageResponse])
async def get_messages(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> List[TeacherMessageResponse]:
    conversation = get_or_create_conversation(current_user=current_user, db=db)
    messages = (
        db.query(TeacherMessage)
        .filter(TeacherMessage.conversation_id == conversation.id)
        .order_by(TeacherMessage.created_at.asc())
        .all()
    )
    result: List[TeacherMessageResponse] = []
    for msg in messages:
        ts = msg.created_at or datetime.utcnow()
        result.append(
            TeacherMessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                timestamp=ts.isoformat(),
            )
        )
    return result


@router.get("/messages/{conversation_id}", response_model=List[TeacherMessageResponse])
async def get_messages_by_conversation(
    conversation_id: int,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> List[TeacherMessageResponse]:
    conversation = (
        db.query(TeacherConversation)
        .filter(
            TeacherConversation.id == conversation_id,
            TeacherConversation.user_id == current_user.id,
        )
        .first()
    )
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    messages = (
        db.query(TeacherMessage)
        .filter(TeacherMessage.conversation_id == conversation.id)
        .order_by(TeacherMessage.created_at.asc())
        .all()
    )
    result: List[TeacherMessageResponse] = []
    for msg in messages:
        ts = msg.created_at or datetime.utcnow()
        result.append(
            TeacherMessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                timestamp=ts.isoformat(),
            )
        )
    return result


@router.get("/context", response_model=TeacherContextResponse)
async def get_context(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> TeacherContextResponse:
    return build_teacher_context(current_user=current_user, db=db)


@router.post("/chat", response_model=TeacherChatResponse)
async def chat_with_teacher(
    request: TeacherChatRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> TeacherChatResponse:
    conversation = get_or_create_conversation(current_user=current_user, db=db)

    user_message = TeacherMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    context = build_teacher_context(current_user=current_user, db=db)
    yaml_prompts = open_yaml("app/workflows/prompts.yaml")
    prompt_template = yaml_prompts["german_teacher_prompt"]

    import json

    context_json = json.dumps(context.model_dump(), ensure_ascii=False)
    system_prompt = prompt_template.replace("{{ context }}", context_json)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.message},
    ]

    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)
    result = await chat.ainvoke(messages)
    if hasattr(result, "content"):
        reply_text = result.content
    else:
        reply_text = str(result)

    assistant_message = TeacherMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="assistant",
        content=reply_text,
    )
    db.add(assistant_message)
    db.commit()

    return TeacherChatResponse(reply=reply_text)


@router.get("/history", response_model=List[TeacherHistoryResponse])
async def get_history(
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> List[TeacherHistoryResponse]:
    conversations = (
        db.query(TeacherConversation)
        .filter(TeacherConversation.user_id == current_user.id)
        .order_by(TeacherConversation.created_at.desc())
        .limit(30)
        .all()
    )
    if not conversations:
        return []

    counts = (
        db.query(
            TeacherMessage.conversation_id,
            func.count(TeacherMessage.id).label("cnt"),
        )
        .filter(TeacherMessage.conversation_id.in_([c.id for c in conversations]))
        .group_by(TeacherMessage.conversation_id)
        .all()
    )
    count_map = {row.conversation_id: row.cnt for row in counts}

    result: List[TeacherHistoryResponse] = []
    for conv in conversations:
        created_at = conv.created_at or datetime.utcnow()
        result.append(
            TeacherHistoryResponse(
                id=conv.id,
                created_at=created_at.isoformat(),
                message_count=count_map.get(conv.id, 0),
            )
        )
    return result

