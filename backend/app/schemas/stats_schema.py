from pydantic import BaseModel
from typing import List

class UserStatsResponse(BaseModel):
    total_points: int
    current_streak: int
    longest_streak: int
    activities_count: int

class ActivityHeatmapItem(BaseModel):
    date: str
    count: int

class LeaderboardUser(BaseModel):
    rank: int
    display_name: str
    points: int
    is_current_user: bool

class LeaderboardResponse(BaseModel):
    current_user_rank: int
    current_user_points: int
    top_percent: float
    users: List[LeaderboardUser]

class ActivityCompletionResponse(BaseModel):
    lesson_completed: bool
    roleplay_completed: bool
    writing_completed: bool
