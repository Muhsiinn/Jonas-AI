from sqlalchemy import Column, Integer, String, Boolean, DateTime,ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("UserProfile",back_populates="user",uselist=False)
    daily_situation = relationship("DailySituation",back_populates="user")
    lesson = relationship("Lesson",back_populates="user")
    stats = relationship("UserStats",back_populates="user",uselist=False)
    activity_logs = relationship("ActivityLog",back_populates="user")
    roleplay = relationship('Roleplay',back_populates="user")
    roleplay_messages = relationship("RoleplayMessage", back_populates="user")
