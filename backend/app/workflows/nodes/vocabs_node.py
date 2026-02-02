from app.core.llm import LLMClient
from app.core.utils import open_yaml
from app.schemas.agents_schema import State
from app.schemas.agents_schema import Vocabs

async def make_vocabs(state:State):
    llm = LLMClient()
    chat = llm.get_client("nvidia/nemotron-3-nano-30b-a3b:free")
    lesson = " ".join(state['lesson'].paragraphs)
    yaml_prompts = open_yaml("app/core/prompts.yaml")
    p = yaml_prompts['vocab_prompt']
    system_prompt = (
    p.replace("{{ lesson_text }}", lesson))

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    result = await chat.with_structured_output(Vocabs).ainvoke(messages)
    
    return {
        "vocabs": result.vocab
    }