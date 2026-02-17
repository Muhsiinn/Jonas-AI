from pydantic_settings import BaseSettings
from typing import List
import logging

logger = logging.getLogger(__name__)



class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    OPENROUTER_API_KEY: str
    
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@jonas.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "Jonas"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    
    FRONTEND_URL: str = "http://localhost:3000"
    
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_PREMIUM: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def validate_stripe_config(self) -> bool:
        """Validate that Stripe configuration is complete for subscription features."""
        required_for_subscriptions = [
            ("STRIPE_SECRET_KEY", self.STRIPE_SECRET_KEY),
            ("STRIPE_PUBLISHABLE_KEY", self.STRIPE_PUBLISHABLE_KEY),
            ("STRIPE_PRICE_ID_PREMIUM", self.STRIPE_PRICE_ID_PREMIUM),
        ]
        
        missing = [name for name, value in required_for_subscriptions if not value]
        
        if missing:
            logger.warning(f"Missing Stripe configuration: {', '.join(missing)}. Subscription features will not work.")
            return False
        
        if not self.STRIPE_WEBHOOK_SECRET:
            logger.warning("STRIPE_WEBHOOK_SECRET not set. Webhooks will not work. See WEBHOOK_SETUP.md for setup instructions.")
        
        return True
    
    def validate_openrouter_config(self) -> bool:
        """Validate that OpenRouter configuration is set."""
        api_key = self.OPENROUTER_API_KEY.strip() if self.OPENROUTER_API_KEY else ""
        if not api_key:
            logger.error("OPENROUTER_API_KEY is not set. LLM features will not work.")
            return False
        if not api_key.startswith("sk-or-v1-"):
            logger.warning(f"OPENROUTER_API_KEY format may be incorrect. Should start with 'sk-or-v1-', got: {api_key[:20]}...")
        else:
            logger.info(f"OpenRouter API key configured (length: {len(api_key)}, starts with: {api_key[:15]}...)")
        return True

settings = Settings()

if __name__ != "__main__":
    settings.validate_stripe_config()
    settings.validate_openrouter_config()
