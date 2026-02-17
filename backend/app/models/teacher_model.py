from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class TeacherConversation(Base):
    __tablename__ = "teacher_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="teacher_conversations")
    messages = relationship("TeacherMessage", back_populates="conversation")


class TeacherMessage(Base):
    __tablename__ = "teacher_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("teacher_conversations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("TeacherConversation", back_populates="messages")
    user = relationship("User", back_populates="teacher_messages")

    __table_args__ = (
        Index("ix_teacher_messages_conversation_created", "conversation_id", "created_at"),
    )

