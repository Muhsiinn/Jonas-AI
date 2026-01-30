
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
from app.schemas.agents import SitationOutput
from app.models.lesson import Lesson
from typing import List



async def make_question(state:State): 
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1) 
    
    daily_situation = state["daily_situation"]
    current_user = state["current_user"]
    llm = LLMClient()
    chat = llm.get_client("tngtech/tng-r1t-chimera:free")
    yaml_prompts = open_yaml("app/core/prompts.yaml")
    user_speaking_level = current_user.profile.user_level_speaking
    user_reading_level = current_user.profile.user_level_reading
    user_goal = current_user.profile.user_goal
    user_region = current_user.profile.user_region
    lesson_text = " ".join(state['lesson'].paragraphs)

    p = yaml_prompts['question_prompt']

    system_prompt = (
    p.replace("{{ situation }}", daily_situation)
     .replace("{{ user_reading_level }}", user_reading_level)
     .replace("{{ user_speaking_level }}", user_speaking_level)
     .replace("{{ user_region }}", user_region)
     .replace("{{ user_goal }}", user_goal)
     .replace("{{ lesson_text }}", lesson_text)
)


    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    result = await chat.with_structured_output(QuestionOutput).ainvoke(messages)
    
    
    return {
        "questions": result.questions
    }