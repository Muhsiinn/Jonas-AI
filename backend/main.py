from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, agents, stats,roleplay

app = FastAPI(
    title="Jonas API",
    description="German Language Learning Platform API",
    version="1.0.0",
)

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
app.include_router(roleplay.router, prefix="/api/v1/goal", tags=["stats"])

@app.get("/")
async def root():
    return {"message": "Jonas API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
