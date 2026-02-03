# schemas/roleplay_schema.py
from typing import Literal, List, Annotated, Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

Role = Literal["system", "user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str
    
class state(TypedDict):
    messages : Annotated[list,add_messages]

class EvalState(TypedDict):
    lesson_goal: str
    chat_history: List[str]
    should_end: bool

class Goal(BaseModel):
    goal : str 
    user_role : str
    ai_role : str

class RoleplayState(BaseModel):
    lesson_title: str
    lesson_body: str
    goal_text: str
    user_role: str
    ai_role: str
    chat_history: List[ChatMessage]
    user_input: str
    reply: str = ""
    done: bool = False
    turn_count: int = 0
    evaluation: Optional[dict] = None

class ChatRequest(BaseModel):
    user_input: str

class ChatResponse(BaseModel):
    reply: str
    done: Optional[bool] = False
    evaluation: Optional[dict] = None

class SessionResponse(BaseModel):
    title: str
    userRole: str
    aiRole: str
    learningGoal: str
    suggestedVocab: List[dict]

class MessageResponse(BaseModel):
    id: str
    speaker: str
    text: str
    timestamp: str
    hasCorrection: Optional[bool] = False

class RoleplayHistoryResponse(BaseModel):
    id: int
    title: str
    completed: bool
    score: Optional[int] = None
    created_at: Optional[str] = None

class RoleplayEvaluationOutput(BaseModel):
    grammarScore: int
    clarityScore: int
    naturalnessScore: int
    keyMistake: dict
    improvedSentence: dict
    vocabularyUpgrade: dict

class FinishSessionResponse(BaseModel):
    evaluation: RoleplayEvaluationOutput
    score: int


