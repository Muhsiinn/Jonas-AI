from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None


class UserProfileRequest(BaseModel):
    user_goal: str
    user_level_speaking: str
    user_level_reading: str
    user_region: str 

class SituationOutput(BaseModel):
    situation: str

class UserProfileResponse(BaseModel):
    user_goal: str
    user_level_speaking: str
    user_level_reading: str
    user_region: str

    class Config:
        from_attributes = True