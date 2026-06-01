from typing import Any, Dict

import httpx

from app.config import settings


def _validate_twilio_config() -> None:
    if not settings.TWILIO_ACCOUNT_SID:
        raise ValueError("Twilio account SID is not configured.")
    if not settings.TWILIO_AUTH_TOKEN:
        raise ValueError("Twilio auth token is not configured.")
    if not settings.TWILIO_SMS_NUMBER:
        raise ValueError("Twilio SMS number is not configured.")


async def send_session_link(
    phone: str,
    session_url: str,
    company_name: str,
) -> Dict[str, Any]:
    _validate_twilio_config()

    body = f"{company_name} requests your service fee: {session_url}"
    url = (
        "https://api.twilio.com/2010-04-01/Accounts/"
        f"{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    )
    payload = {
        "To": phone,
        "From": settings.TWILIO_SMS_NUMBER,
        "Body": body,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                data=payload,
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Twilio SMS request failed: {exc}") from exc
