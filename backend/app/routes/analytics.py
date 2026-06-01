from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Analytics
from app.schemas import AnalyticsRead

router = APIRouter(tags=["analytics"])


@router.get("/analytics/{session_id}", response_model=AnalyticsRead)
async def get_analytics(session_id: int, db: Session = Depends(get_db)) -> AnalyticsRead:
    analytics = db.query(Analytics).filter(Analytics.session_id == session_id).first()
    if analytics is None:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return analytics
