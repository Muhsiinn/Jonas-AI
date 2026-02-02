from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserResponse
from app.api.v1.auth import get_current_user
from app.schemas.user_schema import UserProfileRequest ,SituationOutput, UserProfileResponse
from app.models.user_profile_model import UserProfile
from app.models.daily_situation_model import DailySituation
from datetime import date, datetime, timedelta
from app.core.llm import LLMClient
from app.core.utils import open_yaml
from langchain_core.prompts import ChatPromptTemplate
router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/profile/exists")
async def check_profile_exists(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return {"exists": profile is not None}

@router.post("/userprofile", response_model=UserProfileResponse)
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

@router.get("/dailysituation",response_model=SituationOutput,status_code=status.HTTP_200_OK)
async def get_daily_situation(current_user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)
    
    daily_situation = db.query(DailySituation).filter(
        DailySituation.user_id==current_user.id,
        DailySituation.created_at>=start,
        DailySituation.created_at<end
        ).first()
    if daily_situation :
        return SituationOutput.model_validate({
            "situation" : daily_situation.daily_situation
        })
    
    if not current_user.profile:
        raise HTTPException (
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No user profile"
        )

    seven_days_ago = today - timedelta(days=7)
    
    last_seven_days_situations_db = db.query(DailySituation).filter(
        DailySituation.user_id==current_user.id,
        DailySituation.created_at>=seven_days_ago,
        DailySituation.created_at<end
        ).all()
    
    last_seven_days_situations = [situation.daily_situation for situation in last_seven_days_situations_db]
        
    llm = LLMClient()
    llm = llm.get_client("arcee-ai/trinity-mini:free")

    yaml_prompts = open_yaml("app/core/prompts.yaml")
    p = yaml_prompts['situation_generate']
    prompt = ChatPromptTemplate.from_messages([
    ("system", p["system"]),
    ("human", p["human"]),
    ])

    messages = prompt.invoke({
        "name":current_user.full_name,
        "speaking": current_user.profile.user_level_speaking,
        "reading": current_user.profile.user_level_reading,
        "goal":current_user.profile.user_goal,
        "region":current_user.profile.user_region,
        "last_seven_days_situations":last_seven_days_situations
    })

    print(messages)
    try:
        response = await llm.with_structured_output(SituationOutput).ainvoke(messages)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to generate daily situation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate daily situation: {e}"
        )

    daily_situation = DailySituation(
        daily_situation = response.situation,
        user_id = current_user.id
    )

    db.add(daily_situation)
    db.commit()
    db.refresh(daily_situation)

    return SituationOutput.model_validate(response)
    



    