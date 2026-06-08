from sarvamai import SarvamAI

from app.config import settings


def text_to_speech(text: str) -> str | None:
    """
    Convert text to speech using Sarvam AI SDK.
    Returns a base64-encoded WAV audio string, or None on failure.
    """
    print("[TTS] Starting Sarvam TTS conversion...")

    try:
        client = SarvamAI(api_subscription_key=settings.SARVAM_API_KEY)

        response = client.text_to_speech.convert(
            text=text,
            target_language_code="en-IN",
        )

        if response.audios and len(response.audios) > 0:
            audio_b64 = response.audios[0]
            print("[TTS] Success — audio received from Sarvam.")
            return audio_b64

        print("[TTS] Warning — Sarvam returned no audio chunks.")
        return None

    except Exception as e:
        # Log the error type/message but never log the API key
        print(f"[TTS] Error during Sarvam TTS: {type(e).__name__}: {e}")
        return None