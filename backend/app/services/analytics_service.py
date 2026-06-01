from typing import Any, Dict

from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Analytics, Session as SessionModel
from app.services.gemini_service import analyze_transcript


def _upsert_analytics(
    db: Session, session: SessionModel, analysis: Dict[str, Any]
) -> Analytics:
    analytics = db.query(Analytics).filter(Analytics.session_id == session.id).first()
    if analytics is None:
        analytics = Analytics(session_id=session.id)
        db.add(analytics)

    analytics.sentiment = analysis.get("sentiment")
    analytics.satisfaction_score = analysis.get("satisfaction_score")
    analytics.complaint_category = analysis.get("complaint_category")
    analytics.escalation_required = analysis.get("escalation_required")
    analytics.summary = analysis.get("summary")

    db.commit()
    db.refresh(analytics)
    return analytics


def _normalize_analysis(analysis: Dict[str, Any]) -> Dict[str, Any]:
    score = analysis.get("satisfaction_score")
    if isinstance(score, str):
        try:
            score = int(score)
        except ValueError:
            score = None

    escalation = analysis.get("escalation_required")
    if isinstance(escalation, str):
        lowered = escalation.strip().lower()
        if lowered in {"true", "yes", "1"}:
            escalation = True
        elif lowered in {"false", "no", "0"}:
            escalation = False
        else:
            escalation = None

    return {
        "sentiment": analysis.get("sentiment"),
        "satisfaction_score": score,
        "complaint_category": analysis.get("complaint_category"),
        "escalation_required": escalation,
        "summary": analysis.get("summary"),
    }


@celery_app.task(name="voxagent.analyze_transcript")
def analyze_transcript_task(session_id: int, transcript: str) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if session is None:
            return {"status": "not_found"}
        analysis = _normalize_analysis(analyze_transcript(transcript))
        analytics = _upsert_analytics(db, session, analysis)
        return {"status": "ok", "analytics_id": analytics.id}
    finally:
        db.close()
