from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from datetime import datetime

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sessions = relationship(
        "Session",
        back_populates="customer",
        cascade="all, delete-orphan",
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    token = Column(String(64), unique=True, index=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    purpose = Column(String(255), nullable=True, default="feedback")  # e.g. feedback, sales, bill_payment, autopay_reminder
    language_code = Column(String(10), nullable=True, default="en-IN")  # BCP-47 code, e.g. hi-IN, ta-IN
    status = Column(String(50), nullable=False, default="pending")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Integer, nullable=True)
    transcript = Column(Text, nullable=True)
    recording_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    customer = relationship("Customer", back_populates="sessions")
    analytics = relationship(
        "Analytics",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), unique=True, nullable=False)
    sentiment = Column(String(50), nullable=True)
    satisfaction_score = Column(Integer, nullable=True)
    complaint_category = Column(String(255), nullable=True)
    escalation_required = Column(Boolean, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("Session", back_populates="analytics")

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    role = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )