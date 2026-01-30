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

class AgentOutput(BaseModel):
    lesson : LessonOutput
    questions : List[Question]
    
    

class QuestionOutput(BaseModel):
    questions : List[Question]

class VocabItem(BaseModel):
    term: str
    meaning: str
    example: str

class Vocabs(BaseModel):
    vocab: List[VocabItem]


class State(TypedDict):
    db : Session
    lesson : LessonOutput
    questions : QuestionOutput
    user_profile : UserProfileRequest
    daily_situation : str 
    current_user : str | None 
    vocabs : Vocabs

class SitationOutput(BaseModel):
    situation : str
