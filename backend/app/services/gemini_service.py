import json
from typing import Any, Dict

import httpx

from app.config import settings


def _extract_text(response_json: Dict[str, Any]) -> str:
    candidates = response_json.get("candidates") or []
    if not candidates:
        return ""
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    if not parts:
        return ""
    return parts[0].get("text") or ""


def _parse_json(text: str) -> Dict[str, Any]:
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                return {}
        return {}


def _coerce_bool(value: Any) -> Any:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "1"}:
            return True
        if lowered in {"false", "no", "0"}:
            return False
    return value


def analyze_transcript(transcript: str) -> Dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        raise ValueError("Gemini API key is not configured.")
    if not transcript:
        return {
            "sentiment": "unknown",
            "satisfaction_score": None,
            "complaint_category": None,
            "escalation_required": None,
            "summary": "",
        }

    prompt = (
        "You are an analytics engine for call transcripts. "
        "Return only valid JSON with keys: sentiment, satisfaction_score, "
        "complaint_category, escalation_required, summary. "
        "Use sentiment as positive, neutral, or negative. "
        "satisfaction_score must be an integer 1-10. "
        "escalation_required must be a boolean. "
        "Transcript:\n"
        f"{transcript}"
    )

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    }

    url = (
        f"{settings.GEMINI_BASE_URL}/models/gemini-2.5-flash:generateContent"
        f"?key={settings.GEMINI_API_KEY}"
    )

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            response_json = response.json()
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Gemini request failed: {exc}") from exc

    text = _extract_text(response_json)
    parsed = _parse_json(text)

    score = parsed.get("satisfaction_score")
    if isinstance(score, str):
        try:
            score = int(score)
        except ValueError:
            score = None

    escalation = _coerce_bool(parsed.get("escalation_required"))
    if isinstance(escalation, str):
        escalation = None

    return {
        "sentiment": parsed.get("sentiment") or "unknown",
        "satisfaction_score": score,
        "complaint_category": parsed.get("complaint_category"),
        "escalation_required": escalation,
        "summary": parsed.get("summary") or "",
    }
