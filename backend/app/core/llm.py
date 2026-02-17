from langchain_openai import ChatOpenAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

MODEL_NAME = "arcee-ai/trinity-large-preview:free"

class LLMClient:
    def __init__(self) -> None:
        self._client : ChatOpenAI | None = None
        self._max_retries: int = 4

    def get_client(self, model) -> ChatOpenAI:
        if self._client is None:
            api_key = settings.OPENROUTER_API_KEY
            if not api_key:
                raise ValueError(
                    "OPENROUTER_API_KEY is not set. Please configure it in your .env file. "
                    "Get your key from: https://openrouter.ai/keys"
                )
            
            # Strip whitespace in case there's any
            api_key = api_key.strip()
            
            # Log key info for debugging (without exposing full key)
            if api_key:
                logger.info(f"Using OpenRouter API key (starts with: {api_key[:15]}..., length: {len(api_key)})")
            
            if not api_key.startswith("sk-or-v1-"):
                logger.warning(f"OpenRouter API key format may be incorrect. Expected to start with 'sk-or-v1-', got: {api_key[:15]}...")
            
            self._client = ChatOpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
                model=model,
                temperature=0,
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

