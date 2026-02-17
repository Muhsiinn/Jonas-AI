from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel


class VocabItem(BaseModel):
    term: str
    meaning: str
    example: str


class WritingState(BaseModel):
    daily_situation: str
    goal: Optional[str] = None
    vocabs: Optional[List[VocabItem]] = None


class Goal(BaseModel):
    goal: str


class Vocabs(BaseModel):
    vocab: List[VocabItem]


class WritingHistoryItem(BaseModel):
    id: int
    goal: str
    created_at: datetime
    completed: bool
    user_input: Optional[str] = None
