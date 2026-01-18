from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserProfile(Base):
    __tablename__ = "user_profile"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    user_goal = Column(String, nullable=False)
    user_level_speaking = Column(String, nullable=False)
    user_level_reading = Column(String, default=True)
    user_region = Column(String, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship ("User",back_populates="profile")