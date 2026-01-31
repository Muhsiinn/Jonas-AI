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
from app.schemas.agents import AgentOutput, EvaluateLessonOutput, EvaluateLessonRequest
import json
from app.models.lesson import Lesson
from app.core.workflow import build_workflow
router  = APIRouter()

@router.get("/create_lesson", response_model=AgentOutput)

async def make_lesson(current_user: User = Depends(get_current_user), db:Session = Depends(get_db)): 

    today = date.today()

    start = datetime.combine(today, datetime.min.time())

    end = start + timedelta(days=1) 

    

    daily_situation = db.query(DailySituation).filter(DailySituation.user_id==current_user.id,DailySituation.created_at>=start,DailySituation.created_at<end).first()

    if not daily_situation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No daily situation found")

    daily_situation  = daily_situation.daily_situation



    initial_state = {

    "db":db,

    "current_user":current_user,



    "daily_situation": daily_situation,

    "user_profile": current_user.profile,

    } 

    

    app = build_workflow()

    final_state = await app.ainvoke(initial_state)

    lesson = Lesson(
        user_id=current_user.id,
        vocab=[v.model_dump() for v in final_state['vocabs']],
        paragraphs=list(final_state['lesson'].paragraphs),
        questions=[q.model_dump() for q in final_state['questions']],
        title=final_state['lesson'].title,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return final_state

@router.post("/evaluate_lesson", response_model=EvaluateLessonOutput)
async def evaluate_lesson(
    request: EvaluateLessonRequest,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_lesson = db.query(Lesson).filter(Lesson.user_id==current_user.id).order_by(Lesson.created_at.desc()).first()

    if not db_lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No lesson found")

    answers_dict = {a.question_id: a.answer for a in request.answers}
    db_lesson.answers = answers_dict
    db.commit()

    yaml_prompts = open_yaml("app/core/prompts.yaml")
    prompt = yaml_prompts['evaluate_lesson_prompt']

    prompt = prompt.replace("{{ article }}", json.dumps(db_lesson.paragraphs, ensure_ascii=False))
    prompt = prompt.replace("{{ answers }}", json.dumps(answers_dict, ensure_ascii=False))
    prompt = prompt.replace("{{ vocab }}", json.dumps(db_lesson.vocab, ensure_ascii=False))
    prompt = prompt.replace("{{ questions }}", json.dumps(db_lesson.questions, ensure_ascii=False))

    messages = [
        {
            "role": "system",
            "content": prompt
        }
    ]

    llm = LLMClient()
    chat = llm.get_client("tngtech/tng-r1t-chimera:free")

    result = await chat.with_structured_output(EvaluateLessonOutput).ainvoke(messages)
    
    db_lesson.score = result.score
    db_lesson.summary = result.summary
    db_lesson.focus_areas = result.focus_areas
    db.commit()
    
    return result