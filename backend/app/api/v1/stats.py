from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from typing import List
from app.core.database import get_db
from app.models.user_model import User
from app.models.user_stats_model import UserStats
from app.models.activity_log_model import ActivityLog
from app.models.leaderboard_cache_model import LeaderboardCache
from app.models.lesson_model import Lesson
from app.api.v1.auth import get_current_user
from app.schemas.stats_schema import UserStatsResponse,ActivityHeatmapItem, LeaderboardResponse, LeaderboardUser, ActivityCompletionResponse

router = APIRouter()

@router.get("/me", response_model=UserStatsResponse)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    
    if not stats:
        return UserStatsResponse(
            total_points=0,
            current_streak=0,
            longest_streak=0,
            activities_count=0
        )
    
    return UserStatsResponse(
        total_points=stats.total_points,
        current_streak=stats.current_streak,
        longest_streak=stats.longest_streak,
        activities_count=stats.activities_count
    )

@router.get("/activity-heatmap", response_model=List[ActivityHeatmapItem])
def get_activity_heatmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    start_date = today - timedelta(days=89)
    
    activities = db.query(
        func.date(ActivityLog.created_at).label('activity_date'),
        func.count(ActivityLog.id).label('count')
    ).filter(
        ActivityLog.user_id == current_user.id,
        func.date(ActivityLog.created_at) >= start_date
    ).group_by(
        func.date(ActivityLog.created_at)
    ).all()
    
    activity_map = {str(a.activity_date): a.count for a in activities}
    
    result = []
    for i in range(90):
        d = start_date + timedelta(days=i)
        result.append(ActivityHeatmapItem(
            date=str(d),
            count=activity_map.get(str(d), 0)
        ))
    
    return result

@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cached = db.query(LeaderboardCache).order_by(LeaderboardCache.rank).limit(50).all()
    
    if not cached:
        refresh_leaderboard_cache(db)
        cached = db.query(LeaderboardCache).order_by(LeaderboardCache.rank).limit(50).all()
    
    user_cache = db.query(LeaderboardCache).filter(LeaderboardCache.user_id == current_user.id).first()
    
    total_users = db.query(LeaderboardCache).count()
    
    current_user_rank = user_cache.rank if user_cache else total_users + 1
    current_user_points = user_cache.total_points if user_cache else 0
    top_percent = ((total_users - current_user_rank + 1) / max(total_users, 1)) * 100 if total_users > 0 else 0
    
    users = []
    for c in cached:
        users.append(LeaderboardUser(
            rank=c.rank,
            display_name=c.display_name,
            points=c.total_points,
            is_current_user=(c.user_id == current_user.id)
        ))
    
    if user_cache and user_cache.rank > 50:
        users.append(LeaderboardUser(
            rank=user_cache.rank,
            display_name=user_cache.display_name,
            points=user_cache.total_points,
            is_current_user=True
        ))
    
    return LeaderboardResponse(
        current_user_rank=current_user_rank,
        current_user_points=current_user_points,
        top_percent=round(top_percent, 1),
        users=users
    )

@router.post("/refresh-leaderboard")
def trigger_leaderboard_refresh(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    refresh_leaderboard_cache(db)
    return {"status": "ok"}

@router.get("/today-activities", response_model=ActivityCompletionResponse)
def get_today_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)
    
    lesson = db.query(Lesson).filter(
        Lesson.user_id == current_user.id,
        Lesson.created_at >= start,
        Lesson.created_at < end
    ).first()
    
    lesson_completed = lesson.completed if lesson else False
    print(lesson_completed)
    
    roleplay_activity = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_type == "roleplay",
        ActivityLog.created_at >= start,
        ActivityLog.created_at < end
    ).first()
    
    roleplay_completed = roleplay_activity is not None
    
    writing_activity = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_type == "writing",
        ActivityLog.created_at >= start,
        ActivityLog.created_at < end
    ).first()
    
    writing_completed = writing_activity is not None
    
    return ActivityCompletionResponse(
        lesson_completed=lesson_completed,
        roleplay_completed=roleplay_completed,
        writing_completed=writing_completed
    )

def refresh_leaderboard_cache(db: Session):
    db.query(LeaderboardCache).delete()
    
    stats = db.query(
        UserStats.user_id,
        UserStats.total_points,
        User.full_name
    ).join(User, User.id == UserStats.user_id).order_by(
        desc(UserStats.total_points)
    ).all()
    
    for rank, stat in enumerate(stats, 1):
        cache_entry = LeaderboardCache(
            user_id=stat.user_id,
            rank=rank,
            total_points=stat.total_points,
            display_name=stat.full_name[:20] if stat.full_name else "User"
        )
        db.add(cache_entry)
    
    db.commit()

def update_user_stats(db: Session, user_id: int, points_earned: int, activity_type: str, reference_id: int = None):
    today = date.today()
    
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    if not stats:
        stats = UserStats(
            user_id=user_id,
            total_points=0,
            current_streak=0,
            longest_streak=0,
            activities_count=0
        )
        db.add(stats)
    
    stats.total_points += points_earned
    stats.activities_count += 1
    
    if stats.last_activity_date is None:
        stats.current_streak = 1
    elif stats.last_activity_date == today:
        pass
    elif stats.last_activity_date == today - timedelta(days=1):
        stats.current_streak += 1
    else:
        stats.current_streak = 1
    
    stats.longest_streak = max(stats.longest_streak, stats.current_streak)
    stats.last_activity_date = today
    
    activity = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        points_earned=points_earned,
        reference_id=reference_id
    )
    db.add(activity)
    
    db.commit()
