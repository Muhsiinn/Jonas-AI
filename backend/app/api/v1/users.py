from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.v1.auth import get_current_user
from app.schemas.user import UserProfileRequest
from app.models.user_profile import UserProfile

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/userprofile")
async def create_user_profile(request: UserProfileRequest,current_user:User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_profile = UserProfile(
        user_id = current_user.id,
        user_goal = request.user_goal,
        user_level_speaking = request.user_level_speaking,
        user_level_reading = request.user_level_reading,
        user_region = request.user_region

    )

    db.add(user_profile)
    db.commit()
    db.refresh(user_profile)
    
    return user_profile


