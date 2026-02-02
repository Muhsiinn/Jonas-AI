from app.core.llm import LLMClient
from app.core.utils import open_yaml
from app.schemas.agents_schema import State, GrammarOutput

async def make_grammar(state: State):
    current_user = state["current_user"]
    
    llm = LLMClient()
    chat = llm.get_client("nvidia/nemotron-3-nano-30b-a3b:free")
    lesson = " ".join(state['lesson'].paragraphs)
    
    yaml_prompts = open_yaml("app/core/prompts.yaml")
    p = yaml_prompts['grammar_prompt']
    
    user_speaking_level = current_user.profile.user_level_speaking
    user_reading_level = current_user.profile.user_level_reading
    
    system_prompt = (
        p.replace("{{ lesson_text }}", lesson)
        .replace("{{ user_reading_level }}", user_reading_level)
        .replace("{{ user_speaking_level }}", user_speaking_level)
    )

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    result = await chat.with_structured_output(GrammarOutput).ainvoke(messages)
    
    return {
        "grammar": result.grammar
    }
