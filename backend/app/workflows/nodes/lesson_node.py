from app.core.llm import LLMClient, MODEL_NAME
from app.schemas.agents_schema import LessonOutput
from datetime import timedelta,datetime,date
from app.core.utils import open_yaml
from app.schemas.agents_schema import State

async def make_lesson(state:State): 
    current_user = state["current_user"]
    daily_situation = state["daily_situation"]

    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1) 
    
    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)
    yaml_prompts = open_yaml("app/workflows/prompts.yaml")
    user_speaking_level = current_user.profile.user_level_speaking
    user_reading_level = current_user.profile.user_level_reading
    user_goal = current_user.profile.user_goal
    user_region = current_user.profile.user_region

    p = yaml_prompts['lesson_prompt']

    system_prompt = (
    p.replace("{{ situation }}", daily_situation)
     .replace("{{ user_reading_level }}", user_reading_level)
     .replace("{{ user_speaking_level }}", user_speaking_level)
     .replace("{{ user_region }}", user_region)
     .replace("{{ user_goal }}", user_goal)
)


    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    try:
        result = await chat.with_structured_output(LessonOutput).ainvoke(messages)
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "Authentication" in error_msg or "User not found" in error_msg:
            raise ValueError(
                "OpenRouter API authentication failed. Please check your OPENROUTER_API_KEY in .env file. "
                "Get your key from: https://openrouter.ai/keys"
            ) from e
        raise
 
    return {"lesson":result}