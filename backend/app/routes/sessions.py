from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession

from app.database import get_db
from app.models import Customer, Session as SessionModel
from app.schemas import (
    SendSessionLinkRequest,
    SendSessionLinkResponse,
    SessionCompleteRequest,
    SessionCompleteResponse,
    SessionJoinResponse,
    SessionRead,
)
from app.services.analytics_service import analyze_transcript_task, _normalize_analysis, _upsert_analytics
from app.services.gemini_service import analyze_transcript
from app.services.session_service import (
    build_session_url,
    create_session,
    get_active_session,
    mark_completed,
    mark_joined,
)
from app.services.sms_service import send_session_link

router = APIRouter(tags=["sessions"])


@router.post("/send-session-link", response_model=SendSessionLinkResponse)
async def send_session_link_endpoint(
    payload: SendSessionLinkRequest,
    db: DbSession = Depends(get_db),
) -> SendSessionLinkResponse:
    customer = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if customer is None:
        customer = Customer(name=payload.customer_name, phone=payload.phone)
        db.add(customer)
        db.commit()
        db.refresh(customer)
    elif customer.name != payload.customer_name:
        customer.name = payload.customer_name
        db.commit()

    session = create_session(db, customer.id, payload.company_name, payload.purpose, payload.language_code)
    session_url = build_session_url(session.token)

    try:
        await send_session_link(payload.phone, session_url, payload.company_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    session.status = "sms_sent"
    db.commit()
    db.refresh(session)

    return SendSessionLinkResponse(
        session_id=session.id,
        token=session.token,
        status=session.status,
        session_url=session_url,
        expires_at=session.expires_at,
    )


@router.get("/sessions", response_model=List[SessionRead])
async def list_sessions(db: DbSession = Depends(get_db)) -> List[SessionRead]:
    return db.query(SessionModel).order_by(SessionModel.created_at.desc()).all()


@router.get("/session/{token}", response_model=SessionRead)
async def get_session(token: str, db: DbSession = Depends(get_db)) -> SessionRead:
    session, reason = get_active_session(db, token)
    if session is None:
        detail = "Session expired" if reason == "expired" else "Session not found"
        status_code = 410 if reason == "expired" else 404
        raise HTTPException(status_code=status_code, detail=detail)
    return session


@router.post("/session/{token}/join", response_model=SessionJoinResponse)
async def join_session(token: str, db: DbSession = Depends(get_db)) -> SessionJoinResponse:
    session, reason = get_active_session(db, token)
    if session is None:
        detail = "Session expired" if reason == "expired" else "Session not found"
        status_code = 410 if reason == "expired" else 404
        raise HTTPException(status_code=status_code, detail=detail)
    if session.status == "completed":
        raise HTTPException(status_code=409, detail="Session already completed")

    mark_joined(db, session)
    db.refresh(session)

    return SessionJoinResponse(
        session_id=session.id,
        status=session.status,
        expires_at=session.expires_at,
    )


@router.post("/session/{token}/complete", response_model=SessionCompleteResponse)
async def complete_session(
    token: str,
    payload: SessionCompleteRequest,
    db: DbSession = Depends(get_db),
) -> SessionCompleteResponse:
    session, reason = get_active_session(db, token)
    if session is None:
        detail = "Session expired" if reason == "expired" else "Session not found"
        status_code = 410 if reason == "expired" else 404
        raise HTTPException(status_code=status_code, detail=detail)
    if session.status == "completed":
        raise HTTPException(status_code=409, detail="Session already completed")

    mark_completed(db, session, payload.transcript, payload.duration, payload.recording_url)
    db.refresh(session)

    # Run analytics inline (guaranteed, no Celery dependency)
    try:
        raw_analysis = analyze_transcript(payload.transcript)
        analysis = _normalize_analysis(raw_analysis)
        _upsert_analytics(db, session, analysis)
        print(f"[complete_session] Analytics saved for session {session.id}.")
    except Exception as e:
        print(f"[complete_session] Analytics failed (non-fatal): {e}")
        # Attempt Celery as a secondary try
        try:
            analyze_transcript_task.delay(session.id, payload.transcript)
        except Exception:
            pass

    return SessionCompleteResponse(session_id=session.id, status=session.status)
