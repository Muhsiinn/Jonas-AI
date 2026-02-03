from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Roleplay(Base):
    __tablename__ = "roleplay"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    goal = Column(String,nullable=False)
    user_role = Column(String,nullable=False)
    ai_role = Column(String,nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship ("User",back_populates="roleplay")
    messages = relationship("RoleplayMessage", back_populates="roleplay")
