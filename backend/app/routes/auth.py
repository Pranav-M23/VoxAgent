"""
Auth routes — uses ONLY Python stdlib (hashlib, hmac, secrets).
No passlib, no jose required.
"""
import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session as DBSession
from fastapi import Depends

from app.database import get_db
from app.models import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Password hashing (pbkdf2_hmac — stdlib, no passlib needed) ──
ITERATIONS = 260_000


def _hash_password(password: str) -> str:
    """Return 'salt$hash' using PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), ITERATIONS)
    return f"{salt}${dk.hex()}"


def _verify_password(plain: str, stored: str) -> bool:
    try:
        salt, dk_hex = stored.split("$", 1)
        dk = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), ITERATIONS)
        return hmac.compare_digest(dk.hex(), dk_hex)
    except Exception:
        return False


# ── Token (HMAC-SHA256 signed, no jose needed) ──
TOKEN_TTL_DAYS = 30


def _create_token(user_id: int) -> str:
    payload = json.dumps({"uid": user_id, "exp": int(time.time()) + TOKEN_TTL_DAYS * 86400})
    payload_b64 = base64.urlsafe_b64encode(payload.encode()).decode()
    sig = hmac.new(settings.JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def _decode_token(token: str) -> Optional[int]:
    try:
        payload_b64, sig = token.rsplit(".", 1)
        expected = hmac.new(settings.JWT_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(base64.urlsafe_b64decode(payload_b64 + "=="))
        if data["exp"] < int(time.time()):
            return None
        return int(data["uid"])
    except Exception:
        return None


# ── Schemas ──────────────────────────────────────────────────────
class SignUpRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(...)
    company: Optional[str] = None
    password: str = Field(..., min_length=8)


class SignInRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: int
    name: str
    email: str
    company: Optional[str] = None


# ── Routes ───────────────────────────────────────────────────────
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignUpRequest, db: DBSession = Depends(get_db)):
    email = body.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = User(
        name=body.name.strip(),
        email=email,
        company=body.company.strip() if body.company else None,
        hashed_password=_hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(
        token=_create_token(user.id),
        user_id=user.id,
        name=user.name,
        email=user.email,
        company=user.company,
    )


@router.post("/signin", response_model=AuthResponse)
def signin(body: SignInRequest, db: DBSession = Depends(get_db)):
    email = body.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not _verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    return AuthResponse(
        token=_create_token(user.id),
        user_id=user.id,
        name=user.name,
        email=user.email,
        company=user.company,
    )
