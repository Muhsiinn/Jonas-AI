# schemas/chat.py
from typing import Literal, List,Annotated
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
    max_turns: int = 1


