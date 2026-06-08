import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import analytics, sessions
from app.routes.conversation import router as conversation_router

app = FastAPI(title="VoxAgent API")

# CORS — ALLOWED_ORIGINS is a comma-separated list of origins set on Render.
# Falls back to localhost for local development.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    sessions.router,
    prefix="/api"
)

app.include_router(
    analytics.router,
    prefix="/api"
)

app.include_router(
    conversation_router,
    prefix="/api",
    tags=["conversation"]
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
async def health():
    return {"status": "ok"}