from app.schemas.writing_schema import WritingState, Goal
from app.core.llm import LLMClient, MODEL_NAME


def make_prompt(daily_situation: str) -> str:
    return f"""
You are a goal-setting assistant for a German learning app.

Your task is to convert the given daily situation into ONE clear, concrete writing goal.

The goal should describe:
- WHAT the user needs to write
- WHO it is for (if applicable)
- WHY it is written
- The TYPE of text (email, letter, message, diary entry, etc.)
- The TONE (formal, semi-formal, informal, polite, friendly, apologetic, etc.)

Rules:
- The goal MUST be a writing task
- The goal MUST be written in German
- Do NOT write the actual text
- Do NOT include explanations
- Output ONLY the goal as 1-2 sentences
- Be specific and practical (real-life usable)

Examples:
Daily situation: "I was sick today and missed university"
Goal: "Schreibe eine formelle E-Mail an deinen Professor und erkl?re, dass du krank warst und den Unterricht verpasst hast."

Daily situation: "I want to reflect on my first week in Austria"
Goal: "Schreibe einen kurzen Tagebucheintrag ?ber deine erste Woche in ?sterreich und deine Gef?hle dabei."

Daily situation: "I need a day off from work tomorrow"
Goal: "Schreibe eine h?fliche E-Mail an deinen Vorgesetzten und bitte um einen freien Tag f?r morgen."

Now generate the goal for this daily situation:

Daily situation:
{daily_situation}
""".strip()


async def writing(state: WritingState):
    daily_situation = state.daily_situation
    system_prompt = make_prompt(daily_situation)
    messages = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]
    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)

    result = await chat.with_structured_output(Goal).ainvoke(messages)

    return {"goal": result.goal}


