from app.core.llm import LLMClient
from app.schemas.roleplay_schema import RoleplayState


async def end_check_node(state: RoleplayState):
    prompt = f"""
Check if the roleplay conversation should end now.

Goal:
{state.goal_text}

Last AI message:
{state.reply}

Answer ONLY: YES or NO
""".strip()

    llm = LLMClient()
    chat = llm.get_client("tngtech/tng-r1t-chimera:free")
    response = await chat.ainvoke([{"role": "user", "content": prompt}])
    result = response.content.strip().upper()

    return {
        "done": result.startswith("YES")
    }
