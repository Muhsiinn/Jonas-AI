#we need to make a sep workflow. pass in the input from database. 
from app.core.database import get_db 
from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.auth import get_current_user
from app.models.lesson_model import Lesson
from app.models.user_model import User
from sqlalchemy.orm import Session
from datetime import datetime, date,timedelta,timezone
from app.core.utils import open_yaml
from app.core.llm import LLMClient
from app.schemas.roleplay_schema import Goal, ChatMessage
from app.models.goal_model import Roleplay
from app.models.roleplay_message_model import RoleplayMessage
from collections import defaultdict
from typing import List
from app.workflows.roleplay_workflow import build_workflow
from app.workflows.nodes.roleplay import build_system_prompt

router = APIRouter()
@router.get("/goal")
async def goal_maker(current_user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1) 

    lesson = db.query(Lesson).filter(
        Lesson.user_id==current_user.id,
        Lesson.created_at>=start,
        Lesson.created_at<end
    ).first()
    if lesson is None:
        raise HTTPException(status_code=404, detail="No lesson found for today.")

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
    llm = LLMClient()
    chat = llm.get_client("tngtech/tng-r1t-chimera:free")

    result = await chat.with_structured_output(Goal).ainvoke(messages)
    res = Roleplay(
        user_id = current_user.id,
        goal = result.goal,
        user_role = result.user_role,
        ai_role = result.ai_role
    )
    db.add(res)
    db.commit() 
    return result 

@router.post("/chat")
async def chat(user_input:str,current_user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1) 

    lesson = db.query(Lesson).filter(
        Lesson.user_id==current_user.id,
        Lesson.created_at>=start,
        Lesson.created_at<end
    ).first()
    goal = db.query(Roleplay).filter(
        Roleplay.user_id==current_user.id,
        Roleplay.created_at>=start,
        Roleplay.created_at<end
    ).first()
    if goal is None:
        raise HTTPException(status_code=404, detail="No roleplay goal found for today.")
    #lesson.title, goal.goal , lesson.paragraphs

    existing_messages = (
        db.query(RoleplayMessage)
        .filter(RoleplayMessage.roleplay_id == goal.id)
        .order_by(RoleplayMessage.created_at.asc())
        .all()
    )
    chat_history = [ChatMessage(role=m.role, content=m.content) for m in existing_messages]

    if not chat_history:
        system_message = ChatMessage(
            role="system",
            content=build_system_prompt(
                lesson.title,
                " ".join(lesson.paragraphs),
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

    previous_len = len(chat_history)

    initial_state = {
            "lesson_title": lesson.title,
            "lesson_body": " ".join(lesson.paragraphs),
            "goal_text": goal.goal,
            "user_role": goal.user_role,
            "ai_role": goal.ai_role,
            "chat_history": chat_history,
            "user_input": user_input,
            "turn_count": 0,
            "max_turns": 1
        }
    
    app = build_workflow()
    result = await app.ainvoke(initial_state)
    new_history = result.get("chat_history", chat_history)
    new_messages = new_history[previous_len:]
    for msg in new_messages:
        db.add(RoleplayMessage(
            roleplay_id=goal.id,
            user_id=current_user.id,
            role=msg.role,
            content=msg.content
        ))
    if new_messages:
        db.commit()

    return {"reply": result["reply"]}


