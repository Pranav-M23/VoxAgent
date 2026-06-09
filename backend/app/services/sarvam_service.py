import io

from sarvamai import SarvamAI

from app.config import settings


def text_to_speech(text: str, language_code: str = "en-IN") -> str | None:
    """
    Convert text to speech using Sarvam AI SDK (Bulbul model).
    language_code: BCP-47 code supported by Sarvam TTS, e.g. en-IN, hi-IN, ta-IN.
    Returns a base64-encoded WAV audio string, or None on failure.
    """
    print(f"[TTS] Converting to speech in {language_code} ({len(text)} chars)...")

    try:
        client = SarvamAI(api_subscription_key=settings.SARVAM_API_KEY)

        response = client.text_to_speech.convert(
            text=text,
            target_language_code=language_code,
        )

        if response.audios and len(response.audios) > 0:
            audio_b64 = response.audios[0]
            print(f"[TTS] Success — audio received from Sarvam ({language_code}).")
            return audio_b64

        print("[TTS] Warning — Sarvam returned no audio chunks.")
        return None

    except Exception as e:
        print(f"[TTS] Error during Sarvam TTS: {type(e).__name__}: {e}")
        return None


def speech_to_text(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    language_code: str = "en-IN",
) -> str | None:
    """
    Transcribe audio bytes using Sarvam AI speech-to-text (saaras:v3).
    saaras:v3 auto-detects language but language_code is passed as a hint
    for improved accuracy when the expected language is known.
    Returns the transcript string, or None on failure.
    """
    print(f"[STT] Transcribing {len(audio_bytes)} bytes ({mime_type}, hint: {language_code})...")

    try:
        client = SarvamAI(api_subscription_key=settings.SARVAM_API_KEY)

        # Sarvam expects a file-like object with a .name attribute for MIME detection.
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
            # language_code hint — saaras:v3 accepts this for accuracy
            language_code=language_code,
        )

        transcript = getattr(response, "transcript", None)
        if not transcript:
            transcript = getattr(response, "text", None)
        if transcript:
            print(f"[STT] Transcript ({language_code}): {transcript[:80]}...")
            return transcript.strip()

        print("[STT] Warning — Sarvam returned no transcript.")
        return None

    except Exception as e:
        print(f"[STT] Error during Sarvam STT: {type(e).__name__}: {e}")
        # If language_code param caused an error, retry without it
        try:
            print("[STT] Retrying without language_code hint...")
            audio_file2 = io.BytesIO(audio_bytes)
            audio_file2.name = "audio.webm"
            response2 = client.speech_to_text.transcribe(
                file=audio_file2,
                model="saaras:v3",
                mode="transcribe",
            )
            transcript2 = getattr(response2, "transcript", None) or getattr(response2, "text", None)
            if transcript2:
                return transcript2.strip()
        except Exception as e2:
            print(f"[STT] Retry also failed: {e2}")
        return None