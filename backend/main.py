from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, agents, stats, roleplay, writing, teacher, subscription
import stripe
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Jonas API",
    description="German Language Learning Platform API",
    version="1.0.0",
)

logger.info(f"OpenRouter key loaded: {bool(settings.OPENROUTER_API_KEY)}")
if settings.OPENROUTER_API_KEY:
    key = settings.OPENROUTER_API_KEY.strip()
    logger.info(f"OpenRouter key length: {len(key)}, starts with: {key[:15]}...")
else:
    logger.warning("OPENROUTER_API_KEY not set - LLM features will not work")

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    logger.info("Stripe API key configured")
else:
    logger.warning("STRIPE_SECRET_KEY not set - subscription features will not work")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(roleplay.router, prefix="/api/v1/roleplay", tags=["roleplay"])
app.include_router(writing.router, prefix="/api/v1/writing", tags=["writing"])
app.include_router(teacher.router, prefix="/api/v1/teacher", tags=["teacher"])
app.include_router(subscription.router, prefix="/api/v1/subscription", tags=["subscription"])

@app.get("/")
async def root():
    return {"message": "Jonas API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
