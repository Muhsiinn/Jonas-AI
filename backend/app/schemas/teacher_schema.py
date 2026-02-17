from typing import List, Optional

from pydantic import BaseModel


class TeacherChatRequest(BaseModel):
    message: str


class TeacherChatResponse(BaseModel):
    reply: str


class TeacherMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: str


class TeacherConversationResponse(BaseModel):
    id: int
    created_at: str


class TeacherHistoryResponse(BaseModel):
    id: int
    created_at: str
    message_count: int


class LessonVocabItem(BaseModel):
    term: str
    meaning: str
    example: Optional[str] = None


class LessonGrammarItem(BaseModel):
    rule: str
    explanation: str
    example: Optional[str] = None


class RoleplayVocabItem(BaseModel):
    term: str
    meaning: str


class RoleplayContext(BaseModel):
    goal: str
    user_role: str
    ai_role: str
    suggested_vocab: Optional[List[RoleplayVocabItem]] = None


class TeacherContextResponse(BaseModel):
    lesson_vocab: Optional[List[LessonVocabItem]] = None
    lesson_grammar: Optional[List[LessonGrammarItem]] = None
    roleplay_context: Optional[RoleplayContext] = None
    lesson_title: Optional[str] = None

