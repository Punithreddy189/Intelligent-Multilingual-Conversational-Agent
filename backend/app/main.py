import os
import sys
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime
import json

from app.database import get_db, Base, engine
from app.models import User, ChatSession, ChatMessage, LearningResource, AnalyticsLog
from app.schemas import (
    UserCreate, UserOut, Token, TranslationRequest, TranslationResponse,
    ChatRequest, ChatResponse, ChatSessionCreate, ChatSessionOut, ChatMessageOut,
    ResourceOut, PDFQARequest, PDFQAResponse, TTSRequest
)
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.nlp import detect_language, translate_text, process_nlp
from app.chatbot import generate_chatbot_response
from app.voice import generate_tts_file
from app.resources import UPLOAD_DIR, answer_pdf_question
from app.analytics import log_action, get_analytics_summary
from app.seed import seed_resources

app = FastAPI(title="Intelligent Multilingual Educational Agent")

# Enable CORS for React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://punithreddy189.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional authentication helper to support guest/axios chatbot posts
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.auth import SECRET_KEY, ALGORITHM
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username:
            return db.query(User).filter(User.username == username).first()
    except Exception:
        pass
    return None

# Mount static files folder to serve the built-in frontend
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.on_event("startup")
def startup_db_and_seed():
    # Automatically create tables and seed default resources
    Base.metadata.create_all(bind=engine)
    seed_resources()

# ================= AUTHENTICATION ENDPOINTS =================

@app.post("/api/auth/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log analytics action
    log_action(db, new_user.id, "register")
    return new_user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Standard OAuth2 form login (used by Swagger and backend testing)
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_access_token(data={"sub": user.username})
    log_action(db, user.id, "login")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login-json", response_model=Token)
def login_json(user_in: UserCreate, db: Session = Depends(get_db)):
    # Optional JSON-payload login for easier frontend API calls
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_access_token(data={"sub": user.username})
    log_action(db, user.id, "login")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# ================= MODULE 1: MULTILINGUAL TRANSLATION =================

@app.post("/translate", response_model=TranslationResponse)
@app.post("/api/nlp/translate", response_model=TranslationResponse)
def translate(payload: TranslationRequest, db: Session = Depends(get_db)):
    detected_lang = detect_language(payload.text)
    translated_text = translate_text(payload.text, source_lang=detected_lang, target_lang="English")
    
    # Log anonymous or general action
    log_action(db, user_id=None, action="translate", language=detected_lang)
    
    return {
        "language": detected_lang,
        "translated_text": translated_text
    }

# ================= MODULE 2: AI CHATBOT ENDPOINTS =================

@app.get("/api/chatbot/sessions", response_model=list[ChatSessionOut])
def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()

@app.post("/api/chatbot/sessions", response_model=ChatSessionOut)
def create_session(session: ChatSessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_session = ChatSession(user_id=current_user.id, title=session.title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.get("/api/chatbot/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
def get_session_messages(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validate session owner
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()

@app.post("/chat", response_model=ChatResponse)
@app.post("/api/chatbot/chat", response_model=ChatResponse)
def chatbot_chat(payload: ChatRequest, current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    # 6. Add debugging logs (Backend)
    print("Received:", payload.text)
    print("Subject:", payload.subject)

    # 1. Verify or create session
    session_id = payload.session_id or 0
    if current_user:
        if not session_id:
            # Create a new session automatically
            new_session = ChatSession(user_id=current_user.id, title=payload.text[:30] + "... ")
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            session_id = new_session.id
        else:
            # Validate session owner
            session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")
            
    # 2. Process query: Detect language & translate
    detected_lang = detect_language(payload.text)
    translated_query = translate_text(payload.text, source_lang=detected_lang, target_lang="English")
    
    # 3. NLP tasks: Intent and NER using spaCy
    nlp_results = process_nlp(translated_query)
    intent = nlp_results["intent"]
    entities = nlp_results["entities"]
    
    # 4. Get session message history for context
    history = []
    if current_user and session_id:
        history = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    
    # 5. Generate Response in English
    english_response = generate_chatbot_response(translated_query, payload.subject, history, original_query=payload.text)
    if not english_response:
        english_response = (
            "[Offline AI Tutor]\n\n"
            "I couldn't find an exact answer. Please ask questions related to "
            "Mathematics, Science, Programming, General Knowledge, or UPSC preparation."
        )
    
    # 6. Translate response back to user's native language
    native_response = translate_text(english_response, source_lang="English", target_lang=detected_lang)
    if not native_response:
        native_response = english_response
    
    message_id = 0
    created_at = datetime.utcnow()

    # 7. Save User & Bot Message if logged in
    if current_user:
        user_message = ChatMessage(
            session_id=session_id,
            sender="user",
            original_text=payload.text,
            detected_language=detected_lang,
            translated_text=translated_query,
            response_text="",  # User messages don't have response fields
            intent=intent,
            entities=json.dumps(entities)
        )
        db.add(user_message)
        
        bot_message = ChatMessage(
            session_id=session_id,
            sender="bot",
            original_text=native_response,
            detected_language=detected_lang,
            translated_text=english_response,
            response_text=native_response,
            intent=intent,
            entities=json.dumps(entities)
        )
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)
        message_id = bot_message.id
        created_at = bot_message.created_at
        
        # Log analytics action
        log_action(db, current_user.id, "ask_question", language=detected_lang)
    else:
        # Log guest analytics action
        log_action(db, None, "ask_question", language=detected_lang)
    
    # 9. Add debugging:
    text = payload.text
    language = detected_lang
    translated_text = translated_query
    response = native_response
    print("Original:", text)
    print("Language:", language)
    print("Translated:", translated_text)
    print("Bot response:", response)

    return {
        "response": native_response,
        "intent": intent,
        "entities": entities,
        "language": detected_lang,
        "translated_text": english_response,
        "session_id": session_id,
        "message_id": message_id,
        "created_at": created_at
    }

# ================= MODULE 3: VOICE INTERACTION =================

@app.post("/tts")
@app.post("/api/voice/tts")
def tts_stream(payload: TTSRequest, db: Session = Depends(get_db)):
    try:
        file_path = generate_tts_file(payload.text, payload.language)
        
        # Log analytics action
        log_action(db, user_id=None, action="text_to_speech", language=payload.language)
        
        return FileResponse(file_path, media_type="audio/mp3", filename="tts.mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate TTS: {str(e)}")

# ================= MODULE 4: LEARNING RESOURCES =================

@app.get("/api/resources", response_model=list[ResourceOut])
def get_resources(subject: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(LearningResource)
    if subject:
        query = query.filter(LearningResource.subject == subject)
    return query.all()

@app.post("/upload-pdf", response_model=ResourceOut)
@app.post("/api/resources/upload-pdf", response_model=ResourceOut)
def upload_pdf(
    title: str = Form(...),
    subject: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    # Generate path and save file
    file_path = os.path.join(UPLOAD_DIR, f"{datetime.utcnow().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Save LearningResource record
    resource = LearningResource(
        title=title,
        subject=subject,
        type="pdf",
        url_or_path=file_path,
        description=description
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    # Log analytics action
    log_action(db, current_user.id, "upload_pdf")
    
    return resource

@app.post("/pdf-qa", response_model=PDFQAResponse)
@app.post("/api/resources/pdf-qa", response_model=PDFQAResponse)
def pdf_qa(payload: PDFQARequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find resource by path
    resource = db.query(LearningResource).filter(LearningResource.url_or_path == payload.pdf_path).first()
    resource_id = resource.id if resource else 0
    
    qa_results = answer_pdf_question(resource_id, payload.pdf_path, payload.question)
    
    # Log analytics action
    log_action(db, current_user.id, "pdf_qa")
    
    return qa_results

# ================= MODULE 5: ANALYTICS DASHBOARD =================

@app.get("/api/analytics/summary")
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Restrict to logged-in users
    return get_analytics_summary(db)
