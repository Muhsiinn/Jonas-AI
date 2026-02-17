from app.core.llm import LLMClient, MODEL_NAME
from app.schemas.roleplay_schema import RoleplayState, RoleplayEvaluationOutput
from app.core.utils import open_yaml
import json
import re
from typing import Any


def _state_get(state: Any, key: str, default: Any = None) -> Any:
    if isinstance(state, dict):
        return state.get(key, default)
    return getattr(state, key, default)


def _msg_get(msg: Any, key: str, default: Any = None) -> Any:
    if isinstance(msg, dict):
        return msg.get(key, default)
    return getattr(msg, key, default)


async def evaluate_roleplay(state: RoleplayState | dict):
    yaml_prompts = open_yaml("app/workflows/prompts.yaml")
    prompt_template = yaml_prompts.get('evaluate_roleplay_prompt', '')
    
    chat_history = _state_get(state, "chat_history", []) or []
    user_messages = [_msg_get(msg, "content", "") for msg in chat_history if _msg_get(msg, "role") == "user"]
    ai_messages = [_msg_get(msg, "content", "") for msg in chat_history if _msg_get(msg, "role") == "assistant"]
    
    conversation_text = "\n".join([
        f"User: {user_messages[i]}\nAI: {ai_messages[i]}" 
        for i in range(min(len(user_messages), len(ai_messages)))
    ])
    
    prompt = prompt_template.replace("{{ lesson_title }}", _state_get(state, "lesson_title", ""))
    prompt = prompt.replace("{{ lesson_body }}", _state_get(state, "lesson_body", ""))
    prompt = prompt.replace("{{ goal_text }}", _state_get(state, "goal_text", ""))
    prompt = prompt.replace("{{ conversation }}", conversation_text)
    prompt = prompt.replace("{{ user_role }}", _state_get(state, "user_role", ""))
    prompt = prompt.replace("{{ ai_role }}", _state_get(state, "ai_role", ""))
    
    messages = [
        {
            "role": "system",
            "content": prompt
        }
    ]
    
    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)
    
    try:
        # Primary path: enforce schema via structured output
        result = await chat.with_structured_output(RoleplayEvaluationOutput).ainvoke(messages)
    except Exception:
        # Fallback: ask for raw JSON and parse manually (some free models are flaky with structured output)
        raw = await chat.ainvoke(messages)
        text = raw.content if hasattr(raw, "content") else str(raw)

        # Extract first JSON object from the response
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise

        data = json.loads(match.group(0))
        result = RoleplayEvaluationOutput(**data)
    
    return {
        "evaluation": result.model_dump(),
        "done": True,
        "reply": _state_get(state, "reply", "")
    }


