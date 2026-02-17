from app.core.database import get_db 
from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.auth import get_current_user
from app.models.lesson_model import Lesson
from app.models.user_model import User
from sqlalchemy.orm import Session
from datetime import datetime, date,timedelta,timezone
from app.core.utils import open_yaml
from app.core.llm import LLMClient, MODEL_NAME
from app.models.goal_model import Roleplay
from app.schemas.roleplay_schema import ChatMessage
from app.schemas.roleplay_schema import RoleplayState

from collections import defaultdict
from typing import List

def build_system_prompt(title: str, body: str, goal: str,user_role:str,ai_role:str) -> str:
    return f"""
    You are participating in a roleplay conversation.

Context:
- Lesson title: {title}
- Lesson content: {body}
- End goal: {goal}

Roles:
- User role: {user_role}
- Your role: {ai_role}

Core Rules (Strict):
- You are permanently locked into the role: {ai_role}. Never break character.
- Respond ONLY as {ai_role}.
- The user always leads the conversation.
- Reply ONLY to the user’s last message.
- Output ONLY spoken dialogue.
- Do NOT include:
  - Scene descriptions
  - Actions (e.g. *opens door*, *raises hand*)
  - Inner thoughts
  - Emotions in brackets
  - Narration or storytelling
  - Explanations or teaching unless explicitly asked
- Do NOT advance the scene on your own.
- Do NOT introduce new events, settings, or characters.
- Do NOT summarize or restate the lesson content.
- Keep responses short, natural, and realistic.

Interaction Rules:
- Answer only what the user asks.
- If the user’s input is unclear, ask a short clarification question IN CHARACTER.
- If the user says nothing or pauses, remain silent.
- If the end goal is reached, naturally conclude in character without explanation.

Output Format:
- Plain text dialogue only.
- No markdown.
- No meta commentary."""



async def chat(state:RoleplayState): 

    lesson_title = state.lesson_title
    lesson_body = state.lesson_body
    goal_text = state.goal_text
    user_role = state.user_role
    ai_role = state.ai_role
    history = state.chat_history
    user_input = state.user_input

    if not history:
        history.append(ChatMessage(
            role="system",
            content=build_system_prompt(
                lesson_title,
                lesson_body,
                goal_text,
                user_role,
                ai_role
            )))

    history.append(ChatMessage(role="user", content=user_input))

    system_msg = None
    if history and history[0].role == "system":
        system_msg = history[0]
        recent_messages = history[-10:] if len(history) > 11 else history[1:]
        messages_list = [system_msg] + recent_messages
    else:
        messages_list = history[-10:] if len(history) > 10 else history

    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in messages_list
    ]

    llm = LLMClient()
    chat_client = llm.get_client(MODEL_NAME)
    response = await chat_client.ainvoke(messages)

    cleaned_reply = response.content.strip() if response.content else ""

    history.append(ChatMessage(
        role="assistant",
        content=cleaned_reply
    ))

    return {
        "reply": cleaned_reply,
        "chat_history": history,
        "turn_count": state.turn_count + 1
    }
def should_continue(state: RoleplayState):
    if state.done:
        return "end"
    return "continue"





