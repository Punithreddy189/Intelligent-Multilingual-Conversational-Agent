from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

# Translation schemas
class TranslationRequest(BaseModel):
    text: str

class TranslationResponse(BaseModel):
    language: str
    translated_text: str

# Chat schemas
class ChatRequest(BaseModel):
    text: str
    session_id: Optional[int] = None
    subject: str = "General Knowledge"  # Mathematics, Science, Programming, General Knowledge

class ChatResponse(BaseModel):
    response: str
    intent: str
    entities: Dict[str, Any]
    language: str
    translated_text: str
    session_id: int
    message_id: int
    created_at: datetime

class ChatSessionCreate(BaseModel):
    title: str

class ChatSessionOut(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageOut(BaseModel):
    id: int
    sender: str
    original_text: str
    detected_language: Optional[str] = None
    translated_text: Optional[str] = None
    response_text: str
    intent: Optional[str] = None
    entities: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Resource schemas
class ResourceCreate(BaseModel):
    title: str
    subject: str
    type: str
    url_or_path: str
    description: Optional[str] = None

class ResourceOut(BaseModel):
    id: int
    title: str
    subject: str
    type: str
    url_or_path: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# PDF Q&A schemas
class PDFQARequest(BaseModel):
    pdf_path: str
    question: str

class PDFQAResponse(BaseModel):
    answer: str
    matched_chunks: List[str]

# TTS schema
class TTSRequest(BaseModel):
    text: str
    language: str

# Analytics schemas
class DailyActivity(BaseModel):
    date: str
    count: int

class MonthlyActivity(BaseModel):
    month: str
    count: int

class LanguageUsage(BaseModel):
    language: str
    count: int

class AnalyticsSummary(BaseModel):
    total_users: int
    questions_asked: int
    active_sessions: int
    most_used_languages: List[LanguageUsage]
    daily_activity: List[DailyActivity]
    monthly_activity: List[MonthlyActivity]
