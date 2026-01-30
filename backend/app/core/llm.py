from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
from app.core.config import settings

class LLMClient:
    def __init__(self) -> None:
        self._client : ChatOpenAI | None = None
        self._max_retries: int = 4

    def get_client(self,model) -> ChatOpenAI:
        if self._client is None :
            self._client = ChatOpenAI(
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                model = model,
                temperature= 0,
                default_headers={
            "HTTP-Referer": "http://localhost",
            "X-Title": "jonas agent",
            }

            )
        return self._client
    
    async def close(self) -> None:
        if self._client:
            await self._client.close()
            self._client = None

