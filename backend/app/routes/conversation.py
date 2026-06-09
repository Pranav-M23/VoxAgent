from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ConversationMessage
from app.schemas import (
    ConversationRequest,
    ConversationResponse,
    TTSRequest,
    TTSResponse,
)
from app.services.analytics_service import _normalize_analysis, _upsert_analytics
from app.services.gemini_service import analyze_transcript, generate_reply
from app.services.sarvam_service import speech_to_text, text_to_speech
from app.services.session_service import get_active_session, mark_completed

router = APIRouter()


@router.post(
    "/conversation",
    response_model=ConversationResponse,
)
def conversation(
    payload: ConversationRequest,
    db: Session = Depends(get_db),
):
    # ── 1. Validate session token ────────────────────────────────────────────
    print(f"[CONV] Validating session token: {payload.session_token[:8]}...")
    session, reason = get_active_session(db, payload.session_token)
    if session is None:
        detail = "Session expired" if reason == "expired" else "Session not found"
        status_code = 410 if reason == "expired" else 404
        raise HTTPException(status_code=status_code, detail=detail)
    if session.status == "completed":
        raise HTTPException(status_code=409, detail="Session already completed")

    # ── 2. Load conversation history (before saving new message) ─────────────
    history_rows = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.session_id == session.id)
        .order_by(ConversationMessage.created_at.asc())
        .all()
    )
    history = [{"role": m.role, "message": m.message} for m in history_rows]
    print(f"[CONV] Loaded {len(history)} prior turns for session {session.id}.")

    # ── 3. Save customer message ─────────────────────────────────────────────
    print("[CONV] Saving customer message...")
    customer_message = ConversationMessage(
        session_id=session.id,
        role="customer",
        message=payload.message,
    )
    db.add(customer_message)
    db.commit()

    # ── 4. Generate AI reply via Gemini (with full history) ──────────────────
    print("[CONV] Calling Gemini for reply...")
    language_code = session.language_code or "en-IN"
    reply, end_call = generate_reply(
        payload.message,
        history=history,
        company_name=session.company_name,
        purpose=session.purpose or "feedback",
        language_code=language_code,
    )
    print(f"[CONV] Reply generated ({len(reply)} chars). end_call={end_call}")

    # ── 5. Save AI reply ─────────────────────────────────────────────────────
    print("[CONV] Saving AI message...")
    ai_message = ConversationMessage(
        session_id=session.id,
        role="ai",
        message=reply,
    )
    db.add(ai_message)
    db.commit()

    # ── 6. Convert reply to speech via Sarvam TTS ────────────────────────────
    audio_b64 = text_to_speech(reply, language_code=language_code)
    if audio_b64:
        print("[CONV] Audio ready — returning reply + audio.")
    else:
        print("[CONV] TTS unavailable — returning reply only (audio=null).")

    # ── 7. Session completion (synchronous — no Celery required) ─────────────
    if end_call:
        print("[CONV] Gemini signalled END_CALL — completing session...")

        # Build full transcript for analytics
        all_messages = (
            db.query(ConversationMessage)
            .filter(ConversationMessage.session_id == session.id)
            .order_by(ConversationMessage.created_at.asc())
            .all()
        )
        transcript_text = "\n".join(
            f"{'Customer' if m.role == 'customer' else 'Agent'}: {m.message}"
            for m in all_messages
        )

        # Mark session completed
        mark_completed(db, session, transcript_text, duration=None, recording_url=None)
        print(f"[CONV] Session {session.id} marked completed.")

        # Run analytics inline (Gemini stub for now — upgrade later)
        try:
            raw_analysis = analyze_transcript(transcript_text)
            analysis = _normalize_analysis(raw_analysis)
            _upsert_analytics(db, session, analysis)
            print(f"[CONV] Analytics saved for session {session.id}.")
        except Exception as e:
            print(f"[CONV] Analytics failed (non-fatal): {e}")

    # ── 8. Return response ───────────────────────────────────────────────────
    return ConversationResponse(
        reply=reply,
        audio=audio_b64,
        end_call=end_call,
    )


# ──────────────────────────────────────────────────────────────────────────────
# TTS endpoint — used by the frontend to speak the intro greeting on page load
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/tts", response_model=TTSResponse)
def tts(payload: TTSRequest):
    print(f"[TTS endpoint] Converting {len(payload.text)} chars to speech in {payload.language_code}...")
    audio_b64 = text_to_speech(payload.text, language_code=payload.language_code)
    return TTSResponse(audio=audio_b64)


# ──────────────────────────────────────────────────────────────────────────────
# STT endpoint — used by the mobile frontend as a fallback when the browser's
# Web Speech API is unavailable (e.g. iOS Safari, Android WebView).
# Accepts a multipart audio file upload, returns a JSON transcript.
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/stt")
async def stt(audio: UploadFile = File(...), language_code: str = "en-IN"):
    print(f"[STT endpoint] Received file: {audio.filename}, lang: {language_code}")
    audio_bytes = await audio.read()
    mime_type = audio.content_type or "audio/webm"
    transcript = speech_to_text(audio_bytes, mime_type=mime_type, language_code=language_code)
    if transcript is None:
        raise HTTPException(status_code=422, detail="Could not transcribe audio")
    return {"transcript": transcript}