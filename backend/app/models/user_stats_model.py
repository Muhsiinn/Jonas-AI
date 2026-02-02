from sqlalchemy import Column, Integer, Date, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    total_points = Column(Integer, nullable=False, default=0)
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_activity_date = Column(Date, nullable=True)
    activities_count = Column(Integer, nullable=False, default=0)
    
    user = relationship("User", back_populates="stats")
    
    __table_args__ = (
        Index("ix_user_stats_total_points", "total_points"),
    )
