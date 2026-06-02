from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ConversationMessage
from app.schemas import (
    ConversationRequest,
    ConversationResponse,
)
from app.services.gemini_service import generate_reply

router = APIRouter()

@router.post(
    "/conversation",
    response_model=ConversationResponse,
)
def conversation(
    payload: ConversationRequest,
    db: Session = Depends(get_db),
):
    # Save customer message
    customer_message = ConversationMessage(
        session_id=payload.session_id,
        role="customer",
        message=payload.message,
    )
    print("SAVING customer MESSAGE")
    db.add(customer_message)
    db.commit()

    # Generate AI reply
    reply = generate_reply(payload.message)

    # Save AI reply
    ai_message = ConversationMessage(
        session_id=payload.session_id,
        role="ai",
        message=reply,
    )
    print("SAVING AI MESSAGE")
    db.add(ai_message)
    db.commit()

    return ConversationResponse(
        reply=reply
    )