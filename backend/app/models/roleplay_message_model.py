from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class RoleplayMessage(Base):
    __tablename__ = "roleplay_messages"

    id = Column(Integer, primary_key=True, index=True)
    roleplay_id = Column(Integer, ForeignKey("roleplay.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    roleplay = relationship("Roleplay", back_populates="messages")
    user = relationship("User", back_populates="roleplay_messages")

    __table_args__ = (
        Index("ix_roleplay_messages_roleplay_created", "roleplay_id", "created_at"),
    )
