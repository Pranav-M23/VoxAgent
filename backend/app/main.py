from fastapi import FastAPI

from app.database import Base, engine
from app.routes import analytics, sessions

app = FastAPI(title="VoxAgent API")

app.include_router(sessions.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
