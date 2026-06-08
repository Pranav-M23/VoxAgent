import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./voxagent.db"
         )
        self.SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
        self.TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.TWILIO_SMS_NUMBER = os.getenv("TWILIO_SMS_NUMBER", "")
        self.LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
        self.LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        
        self.GEMINI_BASE_URL = os.getenv(
            "GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta",
        )
        self.SESSION_BASE_URL = os.getenv(
            "SESSION_BASE_URL",
            "http://localhost:3000/session",
        )
        self.SESSION_EXPIRY_MINUTES = self._parse_int(
            os.getenv("SESSION_EXPIRY_MINUTES", "1440"),
            default=1440,
        )

    @staticmethod
    def _parse_int(value: str, default: int) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return default


settings = Settings()
