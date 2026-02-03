from app.core.llm import LLMClient
from app.schemas.roleplay_schema import RoleplayState, RoleplayEvaluationOutput, ChatMessage
from app.core.utils import open_yaml
import json

async def evaluate_roleplay(state: RoleplayState):
    yaml_prompts = open_yaml("app/workflows/prompts.yaml")
    prompt_template = yaml_prompts.get('evaluate_roleplay_prompt', '')
    
    user_messages = [msg.content for msg in state.chat_history if msg.role == "user"]
    ai_messages = [msg.content for msg in state.chat_history if msg.role == "assistant"]
    
    conversation_text = "\n".join([
        f"User: {user_messages[i]}\nAI: {ai_messages[i]}" 
        for i in range(min(len(user_messages), len(ai_messages)))
    ])
    
    prompt = prompt_template.replace("{{ lesson_title }}", state.lesson_title)
    prompt = prompt.replace("{{ lesson_body }}", state.lesson_body)
    prompt = prompt.replace("{{ goal_text }}", state.goal_text)
    prompt = prompt.replace("{{ conversation }}", conversation_text)
    prompt = prompt.replace("{{ user_role }}", state.user_role)
    prompt = prompt.replace("{{ ai_role }}", state.ai_role)
    
    messages = [
        {
            "role": "system",
            "content": prompt
        }
    ]
    
    llm = LLMClient()
    chat = llm.get_client("tngtech/tng-r1t-chimera:free")
    
    result = await chat.with_structured_output(RoleplayEvaluationOutput).ainvoke(messages)
    
    return {
        "evaluation": result.model_dump(),
        "done": True
    }
