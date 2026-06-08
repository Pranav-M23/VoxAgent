from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from uuid import uuid4

from sqlalchemy.orm import Session as DbSession

from app.config import settings
from app.models import Session as SessionModel


def generate_token() -> str:
    return uuid4().hex


def build_session_url(token: str) -> str:
    base = settings.SESSION_BASE_URL.rstrip("/")
    return f"{base}/{token}"


def create_session(
    db: DbSession,
    customer_id: int,
    company_name: str,
) -> SessionModel:
    token = generate_token()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.SESSION_EXPIRY_MINUTES
    )

    session = SessionModel(
        customer_id=customer_id,
        token=token,
        company_name=company_name,
        status="pending",
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def _is_expired(session: SessionModel) -> bool:
    if session.expires_at is None:
        return False
    # PostgreSQL returns timezone-aware datetimes; SQLite returns naive ones.
    # Strip tzinfo from both sides so the comparison works universally.
    expires = session.expires_at.replace(tzinfo=None) if session.expires_at.tzinfo else session.expires_at
    now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
    return expires <= now_naive


def get_active_session(
    db: DbSession,
    token: str,
) -> Tuple[Optional[SessionModel], Optional[str]]:
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if session is None:
        return None, "not_found"
    if _is_expired(session):
        if session.status != "expired":
            session.status = "expired"
            db.commit()
        return None, "expired"
    return session, None


def mark_joined(db: DbSession, session: SessionModel) -> None:
    if session.status not in {"pending", "sms_sent", "joined"}:
        return
    if session.joined_at is None:
        session.joined_at = datetime.now(timezone.utc)
    session.status = "joined"
    db.commit()


def mark_completed(
    db: DbSession,
    session: SessionModel,
    transcript: str,
    duration: Optional[int],
    recording_url: Optional[str],
) -> None:
    session.transcript = transcript
    if duration is not None:
        try:
            session.duration = int(duration)
        except (TypeError, ValueError):
            pass
    if recording_url:
        session.recording_url = recording_url
    session.completed_at = datetime.now(timezone.utc)
    session.status = "completed"
    db.commit()
