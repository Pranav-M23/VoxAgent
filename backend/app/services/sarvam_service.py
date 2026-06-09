import io
import wave

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


def speech_to_text(audio_bytes: bytes, mime_type: str = "audio/webm") -> str | None:
    """
    Transcribe audio bytes using Sarvam AI speech-to-text (saaras:v3).
    Accepts raw audio bytes (webm/ogg from MediaRecorder, or wav).
    Returns the transcript string, or None on failure.
    """
    print(f"[STT] Starting Sarvam STT transcription ({len(audio_bytes)} bytes, {mime_type})...")

    try:
        client = SarvamAI(api_subscription_key=settings.SARVAM_API_KEY)

        # Sarvam expects a file-like object with a .name attribute for MIME detection.
        # Wrap bytes in a BytesIO and give it a filename so the SDK sets the right Content-Type.
        audio_file = io.BytesIO(audio_bytes)

        # Choose filename extension based on incoming MIME
        if "webm" in mime_type:
            audio_file.name = "audio.webm"
        elif "ogg" in mime_type:
            audio_file.name = "audio.ogg"
        elif "mp4" in mime_type or "m4a" in mime_type:
            audio_file.name = "audio.mp4"
        else:
            audio_file.name = "audio.wav"

        response = client.speech_to_text.transcribe(
            file=audio_file,
            model="saaras:v3",
            mode="transcribe",
        )

        transcript = getattr(response, "transcript", None)
        if not transcript:
            # Fallback: try .text or first item in a list
            transcript = getattr(response, "text", None)
        if transcript:
            print(f"[STT] Transcript: {transcript[:80]}...")
            return transcript.strip()

        print("[STT] Warning — Sarvam returned no transcript.")
        return None

    except Exception as e:
        print(f"[STT] Error during Sarvam STT: {type(e).__name__}: {e}")
        return None