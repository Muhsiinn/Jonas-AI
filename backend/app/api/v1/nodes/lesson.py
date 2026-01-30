from fastapi import APIRouter, Depends, HTTPException,status,Query,Request
from app.core.llm import LLMClient
from app.api.v1.auth import get_current_user
from app.schemas.agents import LessonOutput
from app.models.user import User
from app.core.database import get_db
from app.models import DailySituation
from datetime import timedelta,datetime,date
from app.core.utils import open_yaml
from sqlalchemy.orm import Session
from app.schemas.agents import State
from app.schemas.agents import SitationOutput
from app.models.lesson import Lesson
from fastapi import APIRouter

async def make_lesson(state:State): 
    print(">"*80)
    print(state)
    print(">"*80)
   

    current_user = state["current_user"]
    daily_situation = state["daily_situation"]
    print(">"*80)
    print(current_user)
    print(">"*80)


    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1) 
    
    llm = LLMClient()
    chat = llm.get_client("tngtech/tng-r1t-chimera:free")
    yaml_prompts = open_yaml("app/core/prompts.yaml")
    user_speaking_level = current_user.profile.user_level_speaking
    user_reading_level = current_user.profile.user_level_reading
    user_goal = current_user.profile.user_goal
    user_region = current_user.profile.user_region

    p = yaml_prompts['lesson_prompt']

    system_prompt = (
    p.replace("{{ situation }}", daily_situation)
     .replace("{{ user_reading_level }}", user_reading_level)
     .replace("{{ user_speaking_level }}", user_speaking_level)
     .replace("{{ user_region }}", user_region)
     .replace("{{ user_goal }}", user_goal)
)


    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    result = await chat.with_structured_output(LessonOutput).ainvoke(messages)
    
    lesson = Lesson(

        user_id = current_user.id,
        title = result.title,
        paragraphs = result.paragraphs
    )
    # db.add(lesson)
    # db.commit()
    # db.refresh(lesson)
    return {
        "lesson":lesson}