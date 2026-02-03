from fastapi import APIRouter, Depends, HTTPException,status,Query
from fastapi.responses import StreamingResponse, Response
from app.core.llm import LLMClient
from app.api.v1.auth import get_current_user
from app.models.user_model import User
from app.core.database import get_db
from app.models.daily_situation_model import DailySituation
from datetime import timedelta,datetime,date,timezone
from app.core.utils import open_yaml
from sqlalchemy.orm import Session
from app.schemas.agents_schema import EvaluateLessonOutput, EvaluateLessonRequest, UpdateProgressRequest
import json
import httpx
from urllib.parse import quote
from app.models.lesson_model import Lesson
from app.workflows.lesson_workflow import build_workflow
from app.api.v1.stats import update_user_stats

router  = APIRouter()

@router.get("/create_lesson")
async def make_lesson(current_user: User = Depends(get_current_user), db:Session = Depends(get_db)): 
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1) 

    lesson_exists = db.query(Lesson).filter(
        Lesson.user_id==current_user.id,
        Lesson.created_at>=start,
        Lesson.created_at<end
    ).first()

    if lesson_exists:
        existing_data = {
            'lesson': {
                'id': lesson_exists.id,
                'user_id': lesson_exists.user_id,
                'title': lesson_exists.title,
                'paragraphs': lesson_exists.paragraphs
            },
            'vocabs': lesson_exists.vocab,
            'grammar': lesson_exists.grammar or [],
            'questions': lesson_exists.questions,
            'progress': lesson_exists.progress or {},
            'completed': lesson_exists.completed,
            'evaluation': {
                'score': lesson_exists.score,
                'summary': lesson_exists.summary,
                'focus_areas': lesson_exists.focus_areas,
                'per_question': lesson_exists.per_question or []
            } if lesson_exists.score is not None else None
        }
        
        async def existing_lesson_generator():
            yield f"data: {json.dumps({'type': 'complete', 'data': existing_data}, ensure_ascii=False)}\n\n"
        
        return StreamingResponse(
            existing_lesson_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
        )

    daily_situation = db.query(DailySituation).filter(
        DailySituation.user_id==current_user.id,
        DailySituation.created_at>=start,
        DailySituation.created_at<end
    ).first()

    if not daily_situation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No daily situation found")

    situation_text = daily_situation.daily_situation
    user_id = current_user.id
    user_profile = current_user.profile

    async def event_generator():
        yield f"data: {json.dumps({'type': 'progress', 'step': 'started', 'message': 'Starting lesson creation...'})}\n\n"

        initial_state = {
            "db": db,
            "current_user": current_user,
            "daily_situation": situation_text,
            "user_profile": user_profile,
        } 

        app = build_workflow()
        final_state = {}

        async for event in app.astream(initial_state, stream_mode="updates"):
            for node_name, node_output in event.items():
                final_state.update(node_output)
                
                if node_name == "lesson_maker":
                    yield f"data: {json.dumps({'type': 'progress', 'step': 'lesson', 'message': 'Article generated!'})}\n\n"
                elif node_name == "vocab_maker":
                    yield f"data: {json.dumps({'type': 'progress', 'step': 'vocab', 'message': 'Vocabulary generated!'})}\n\n"
                elif node_name == "grammar_maker":
                    yield f"data: {json.dumps({'type': 'progress', 'step': 'grammar', 'message': 'Grammar extracted!'})}\n\n"
                elif node_name == "question_maker":
                    yield f"data: {json.dumps({'type': 'progress', 'step': 'questions', 'message': 'Questions generated!'})}\n\n"

        lesson = Lesson(
            user_id=user_id,
            vocab=[v.model_dump() for v in final_state['vocabs']],
            paragraphs=list(final_state['lesson'].paragraphs),
            grammar=[g.model_dump() for g in final_state['grammar']],
            questions=[q.model_dump() for q in final_state['questions']],
            title=final_state['lesson'].title,
        )
        db.add(lesson)
        db.commit()

        complete_data = {
            'lesson': final_state['lesson'].model_dump(),
            'vocabs': [v.model_dump() for v in final_state['vocabs']],
            'grammar': [g.model_dump() for g in final_state['grammar']],
            'questions': [q.model_dump() for q in final_state['questions']]
        }
        yield f"data: {json.dumps({'type': 'complete', 'data': complete_data}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )

@router.post("/evaluate_lesson", response_model=EvaluateLessonOutput)
async def evaluate_lesson(
    request: EvaluateLessonRequest,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_lesson = db.query(Lesson).filter(Lesson.user_id==current_user.id).order_by(Lesson.created_at.desc()).first()

    if not db_lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No lesson found")

    if db_lesson.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lesson already evaluated")

    answers_dict = {a.question_id: a.answer for a in request.answers}
    db_lesson.answers = answers_dict
    db.commit()

    yaml_prompts = open_yaml("app/workflows/prompts.yaml")
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
    db_lesson.per_question = [q.model_dump() for q in result.per_question]
    db_lesson.completed = True
    db.commit()
    
    points_earned = result.score + 10
    update_user_stats(db, current_user.id, points_earned, "lesson", db_lesson.id)
    
    return result

@router.get("/tts")
async def text_to_speech(
    text: str = Query(..., description="Text to convert to speech"),
    lang: str = Query("de", description="Language code")
):
    def split_text(text: str, max_len: int = 180) -> list[str]:
        sentences = []
        current = ""
        for part in text.replace(". ", ".|").replace("? ", "?|").replace("! ", "!|").replace(": ", ":|").replace("; ", ";|").split("|"):
            if len(current) + len(part) < max_len:
                current += part + " "
            else:
                if current.strip():
                    sentences.append(current.strip())
                current = part + " "
        if current.strip():
            sentences.append(current.strip())
        return sentences if sentences else [text[:max_len]]

    chunks = split_text(text)
    audio_parts = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for chunk in chunks:
            encoded_text = quote(chunk)
            url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encoded_text}"
            
            response = await client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="TTS service unavailable")
            
            audio_parts.append(response.content)
    
    combined_audio = b"".join(audio_parts)
    
    return Response(
        content=combined_audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "public, max-age=86400"}
    )

@router.get("/explain")
async def explain_text(
    text: str = Query(..., description="German text to explain"),
    current_user: User = Depends(get_current_user)
):
    async with httpx.AsyncClient(timeout=10.0) as client:
        encoded = quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&dt=t&q={encoded}"
        
        response = await client.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        
        if response.status_code == 200:
            data = response.json()
            translation = "".join([part[0] for part in data[0] if part[0]])
            return {"term": text, "meaning": translation, "example": ""}
        
        return {"term": text, "meaning": "Translation unavailable", "example": ""}

@router.put("/progress")
async def update_progress(
    request: UpdateProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    lesson = db.query(Lesson).filter(
        Lesson.user_id == current_user.id,
        Lesson.created_at >= start,
        Lesson.created_at < end
    ).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No lesson found for today")

    if lesson.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lesson already completed")

    lesson.progress = request.progress.model_dump()
    
    if request.progress.answers:
        lesson.answers = request.progress.answers
    
    db.commit()

    return {"status": "ok", "progress": lesson.progress}

@router.get("/lessons")
async def get_lessons_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lessons = db.query(Lesson).filter(
        Lesson.user_id == current_user.id
    ).order_by(Lesson.created_at.desc()).limit(30).all()

    return [
        {
            'id': lesson.id,
            'title': lesson.title,
            'score': lesson.score,
            'completed': lesson.completed,
            'created_at': lesson.created_at.isoformat() if lesson.created_at else None
        }
        for lesson in lessons
    ]

@router.get("/lessons/{lesson_id}")
async def get_lesson_by_id(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.user_id == current_user.id
    ).first()

    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    today = date.today()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    is_today = lesson.created_at >= start and lesson.created_at < end

    return {
        'lesson': {
            'id': lesson.id,
            'user_id': lesson.user_id,
            'title': lesson.title,
            'paragraphs': lesson.paragraphs
        },
        'vocabs': lesson.vocab,
        'grammar': lesson.grammar or [],
        'questions': lesson.questions,
        'progress': lesson.progress or {},
        'completed': lesson.completed,
        'is_today': is_today,
        'created_at': lesson.created_at.isoformat() if lesson.created_at else None,
        'evaluation': {
            'score': lesson.score,
            'summary': lesson.summary,
            'focus_areas': lesson.focus_areas,
            'per_question': lesson.per_question or []
        } if lesson.score is not None else None
    }
