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
from app.schemas.agents import AgentOutput
from app.models.lesson import Lesson
from app.core.workflow import build_workflow
router  = APIRouter()

@router.get("/create_lesson", response_model=AgentOutput)

async def make_lesson(current_user: User = Depends(get_current_user), db:Session = Depends(get_db)): 

    today = date.today()

    start = datetime.combine(today, datetime.min.time())

    end = start + timedelta(days=1) 

    

    daily_situation = db.query(DailySituation).filter(DailySituation.user_id==current_user.id,DailySituation.created_at>=start,DailySituation.created_at<end).first()

    daily_situation  = daily_situation.daily_situation



    initial_state = {

    "db":db,

    "current_user":current_user,



    "daily_situation": daily_situation,

    "user_profile": current_user.profile,

    } 

    

    app = build_workflow()

    final_state = await app.ainvoke(initial_state)

    

    return final_state



