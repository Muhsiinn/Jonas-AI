from pydantic import BaseModel
from typing_extensions import TypedDict
from typing import Annotated ,List,Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from app.schemas.user import UserProfileRequest
from sqlalchemy.orm import Session
class LessonOutput(BaseModel):
    user_id : int | None 
    title : str
    paragraphs: List[str]

class Question(BaseModel):
    id : int 
    type : Literal ["mcq","short"]
    options : List[str] | None
    question : str



class QuestionOutput(BaseModel):
    questions : List[Question]

class VocabItem(BaseModel):
    term: str
    meaning: str
    example: str

class Vocabs(BaseModel):
    vocab: List[VocabItem]

class AgentOutput(BaseModel):
    lesson : LessonOutput
    questions : List[Question]
    vocabs : List[VocabItem]
    

class State(TypedDict):
    db : Session
    lesson : LessonOutput
    questions : List[Question]
    user_profile : UserProfileRequest
    daily_situation : str 
    current_user : str | None 
    vocabs : List[VocabItem]

class SitationOutput(BaseModel):
    situation : str

class EvaluateAnswer(BaseModel):
    question_id: int
    answer: str

class EvaluateLessonRequest(BaseModel):
    answers: List[EvaluateAnswer]

class EvaluateLessonOutput(BaseModel):
    score : int
    summary : str
    focus_areas : List[str]