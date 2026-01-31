from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

class Lesson(Base):
    __tablename__ = "lesson"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    vocab = Column(JSONB, nullable=False)
    paragraphs = Column(ARRAY(String), nullable=False)
    questions = Column(JSONB, nullable=False)
    answers = Column(JSONB, nullable=True)
    score = Column(Integer, nullable=True)
    summary = Column(String, nullable=True)
    focus_areas = Column(ARRAY(String), nullable=True)
    per_question = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="lesson")
