
from fastapi import APIRouter, Depends, HTTPException,status,Query,Request
from app.core.llm import LLMClient
from app.api.v1.auth import get_current_user
from app.schemas.agents import QuestionOutput
from app.models.user import User
from app.core.database import get_db
from app.models import DailySituation
from datetime import timedelta,datetime,date
from app.core.utils import open_yaml
from sqlalchemy.orm import Session
from app.schemas.agents import State
from app.schemas.agents import Vocabs
from typing import List

async def make_vocabs(state:State):
    llm = LLMClient()
    chat = llm.get_client("nvidia/nemotron-3-nano-30b-a3b:free")
    lesson = " ".join(state['lesson'].paragraphs)
    print(lesson)
    yaml_prompts = open_yaml("app/core/prompts.yaml")
    p = yaml_prompts['vocab_prompt']
    system_prompt = (
    p.replace("{{ lesson_text }}", lesson))

    print(system_prompt)
    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    result = await chat.with_structured_output(Vocabs).ainvoke(messages)
    print(result)
    
    return {
        "vocabs": result.vocab
    }