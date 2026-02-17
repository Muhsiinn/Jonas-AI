from app.core.llm import LLMClient, MODEL_NAME
from app.schemas.writing_schema import Vocabs, WritingState

def make_vocab_prompt(goal: str) -> str:
    return f"""
You are a German vocabulary generator for a language learning app.

You MUST generate MULTIPLE vocabulary items to help the user complete the writing goal.

OUTPUT FORMAT (MUST MATCH EXACTLY):

Vocabs {{
  vocab: [
    {{
      term: string,
      meaning: string,
      example: string
    }}
  ]
}}

HARD REQUIREMENTS (non-negotiable):
- Generate AT LEAST 10 vocabulary items
- Generate NO MORE THAN 15 vocabulary items
- Each item MUST be relevant to the goal
- Output ONLY valid JSON
- Do NOT include explanations or comments
- Do NOT include sentences

FIELD RULES:
- term: German word or short phrase (1-3 words)
- meaning: short English translation
- example: short usage fragment (2-4 words), NOT a sentence

FAILURE CONDITIONS (avoid these):
- Returning fewer than 10 vocab items
- Returning only 1 vocab item
- Returning sentences in any field
- Returning text outside JSON

Writing goal:
{goal}
""".strip()



async def make_vocabs(state: WritingState):
    llm = LLMClient()
    chat = llm.get_client(MODEL_NAME)
    goal = state.goal
    if not goal:
        return {"vocabs": []}
    system_prompt = make_vocab_prompt(goal)

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]

    result = await chat.with_structured_output(Vocabs).ainvoke(messages)

    return {
        "vocabs": result.vocab,
    }


