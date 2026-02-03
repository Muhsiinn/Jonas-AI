from pydantic import BaseModel
from typing_extensions import TypedDict
from typing import List,Literal,Optional
from app.schemas.user_schema import UserProfileRequest
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

class GrammarExample(BaseModel):
    sentence: str
    explanation: str

class GrammarItem(BaseModel):
    rule: str
    explanation: str
    examples: List[GrammarExample]

class GrammarOutput(BaseModel):
    grammar: List[GrammarItem]

class AgentOutput(BaseModel):
    lesson : LessonOutput
    questions : List[Question]
    vocabs : List[VocabItem]
    grammar : List[GrammarItem]
    

class State(TypedDict):
    db : Session
    lesson : LessonOutput
    questions : List[Question]
    user_profile : UserProfileRequest
    daily_situation : str 
    current_user : str | None 
    vocabs : List[VocabItem]
    grammar : List[GrammarItem]

class SitationOutput(BaseModel):
    situation : str

class EvaluateAnswer(BaseModel):
    question_id: int
    answer: str

class EvaluateLessonRequest(BaseModel):
    answers: List[EvaluateAnswer]

class QuestionFeedback(BaseModel):
    question_id: int
    correct: bool
    correct_option_index: Optional[int] = None  
    ideal_answer: Optional[str] = None 
    explanation: Optional[str] = None  

class EvaluateLessonOutput(BaseModel):
    score: int
    summary: str
    focus_areas: List[str]
    per_question: List[QuestionFeedback]

class LessonProgress(BaseModel):
    current_step: str = "vocab"
    vocab_read: List[bool] = []
    article_read_once: bool = False
    answers: dict = {}
    active_vocab_index: int = 0
    active_question_index: int = 0

class UpdateProgressRequest(BaseModel):
    progress: LessonProgress

