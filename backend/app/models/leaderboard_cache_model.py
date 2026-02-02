from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class LeaderboardCache(Base):
    __tablename__ = "leaderboard_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True)
    rank = Column(Integer, nullable=False)
    total_points = Column(Integer, nullable=False)
    display_name = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
