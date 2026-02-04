from app.core.database import SessionLocal
from app.models.goal_model import Roleplay
from app.schemas.roleplay_schema import RoleplayState


async def check_db_end_status(state: RoleplayState):
    """
    Check the database for whether the previous message indicated
    the conversation should end. Preserves the current reply.
    """
    if not state.goal_id:
        return {"done": False, "reply": state.reply}
    
    db = SessionLocal()
    try:
        goal = db.query(Roleplay).filter(Roleplay.id == state.goal_id).first()
        
        if goal and goal.should_end:
            goal.should_end = False
            db.commit()
            return {
                "done": True,
                "reply": state.reply
            }
        
        return {"done": False, "reply": state.reply}
    finally:
        db.close()
