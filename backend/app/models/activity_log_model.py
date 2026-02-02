from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_log"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    points_earned = Column(Integer, nullable=False, default=0)
    reference_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="activity_logs")
    
    __table_args__ = (
        Index("ix_activity_log_user_created", "user_id", "created_at"),
    )
