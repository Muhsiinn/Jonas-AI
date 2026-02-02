from app.core.llm import LLMClient
from app.schemas.agents_schema import QuestionOutput
from app.core.utils import open_yaml
from app.schemas.agents_schema import State

async def make_question(state:State): 
    daily_situation = state["daily_situation"]
    current_user = state["current_user"]
    llm = LLMClient()
    chat = llm.get_client("arcee-ai/trinity-large-preview:free")
    yaml_prompts = open_yaml("app/core/prompts.yaml")
    user_speaking_level = current_user.profile.user_level_speaking
    user_reading_level = current_user.profile.user_level_reading
    user_goal = current_user.profile.user_goal
    user_region = current_user.profile.user_region
    lesson_text = " ".join(state['lesson'].paragraphs)

    grammar_rules = state.get('grammar', [])
    grammar_text = "\n".join([
        f"- {g.rule}: {g.explanation}" 
        for g in grammar_rules
    ]) if grammar_rules else "No grammar rules available"

    p = yaml_prompts['question_prompt']

    system_prompt = (
        p.replace("{{ situation }}", daily_situation)
        .replace("{{ user_reading_level }}", user_reading_level)
        .replace("{{ user_speaking_level }}", user_speaking_level)
        .replace("{{ user_region }}", user_region)
        .replace("{{ user_goal }}", user_goal)
        .replace("{{ lesson_text }}", lesson_text)
        .replace("{{ grammar_rules }}", grammar_text)
    )

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    result = await chat.with_structured_output(QuestionOutput).ainvoke(messages)
    
    return {
        "questions": result.questions
    }