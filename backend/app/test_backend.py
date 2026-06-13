import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import User, LearningResource, ChatSession, ChatMessage
from app.auth import get_password_hash, verify_password, create_access_token
from app.nlp import detect_language, translate_text, process_nlp
from app.chatbot import generate_chatbot_response
from app.voice import generate_tts_file

# Use separate test database
TEST_DATABASE_URL = "sqlite:///./test_agent.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after test completes
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    try:
        if os.path.exists("./test_agent.db"):
            os.remove("./test_agent.db")
    except Exception:
        pass

def test_database_creation():
    db = TestingSessionLocal()
    try:
        # Add user
        hashed = get_password_hash("testpass")
        user = User(username="testuser", email="test@example.com", hashed_password=hashed)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        assert user.id is not None
        assert user.username == "testuser"
        
        # Verify fetching
        fetched = db.query(User).filter(User.username == "testuser").first()
        assert fetched is not None
        assert fetched.email == "test@example.com"
    finally:
        db.close()

def test_user_authentication():
    # Test password hashing
    password = "MySecurePassword123"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False
    
    # Test token generation
    token = create_access_token(data={"sub": "testuser"})
    assert token is not None
    assert isinstance(token, str)

def test_language_detection():
    # Test Tamil detection
    assert detect_language("வணக்கம்") == "Tamil"
    
    # Test Telugu detection
    assert detect_language("నమస్కారం") == "Telugu"
    
    # Test Hindi detection
    assert detect_language("नमस्ते") == "Hindi"
    
    # Test English detection
    assert detect_language("Hello, how are you?") == "English"

def test_translation():
    # Test deep-translator (if online). Mock-safe.
    # Hello in Tamil: "வணக்கம்" -> Should translate to "Hello" (or contain it)
    translated_ta = translate_text("வணக்கம்", source_lang="Tamil", target_lang="English")
    assert isinstance(translated_ta, str)
    
    # English stays English
    translated_en = translate_text("Artificial Intelligence", source_lang="English", target_lang="English")
    assert translated_en == "Artificial Intelligence"

def test_nlp_processing():
    text = "Solve this quadratic equation: x^2 + 5x + 6 = 0"
    nlp_res = process_nlp(text)
    
    assert "tokens" in nlp_res
    assert isinstance(nlp_res["tokens"], list)
    
    # Intent detection should trigger Mathematics
    assert nlp_res["intent"] == "Mathematics / Calculation"

def test_chatbot_fallback():
    # Test fallback responses without Gemini API key
    resp_math = generate_chatbot_response("Solve a matrix", "Mathematics", [])
    assert "Offline AI Tutor" in resp_math
    assert "Mathematics" in resp_math or "Offline" in resp_math
    
    resp_code = generate_chatbot_response("Write a python loop", "Programming", [])
    assert "loop" in resp_code or "programming" in resp_code or "Python" in resp_code

def test_tts_generation():
    # Test gTTS creation
    text = "Welcome to the Multilingual Educational Assistant"
    file_path = generate_tts_file(text, "English")
    
    assert file_path != ""
    assert os.path.exists(file_path)
    assert file_path.endswith(".mp3")
    
    # Cleanup generated tts file after testing
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass

def test_offline_chatbot_improved():
    # 1. Test Red Fort similarity matching
    r1 = generate_chatbot_response("history of Red Fort", "General Knowledge", [])
    r2 = generate_chatbot_response("tell me about red fort", "General Knowledge", [])
    r3 = generate_chatbot_response("when was red fort built", "General Knowledge", [])
    
    assert "Mughal Emperor Shah Jahan" in r1
    assert r1 == r2 == r3
    
    # 2. Test UPSC preparation questions
    r_upsc = generate_chatbot_response("I need some UPSC questions", "General Knowledge", [])
    assert "Father of the Indian Constitution?" in r_upsc
    assert "Fundamental Rights?" in r_upsc
    assert "Ganga of the South?" in r_upsc
    
    # 3. Test Science subjects
    r_photo = generate_chatbot_response("tell me about photosynthesis", "Science", [])
    assert "6CO₂ + 6H₂O" in r_photo
    
    r_grav = generate_chatbot_response("what is gravity", "Science", [])
    assert "Sir Isaac Newton formulated the Law of Universal Gravitation" in r_grav
    
    r_newton = generate_chatbot_response("Newton's laws", "Science", [])
    assert "three physical laws" in r_newton
    
    # 4. Test Mathematics
    r_integ = generate_chatbot_response("What is integration?", "Mathematics", [])
    assert r_integ == "Integration is a branch of calculus used to determine area under curves and reverse differentiation."
    
    # 5. Test Programming
    r_loop = generate_chatbot_response("What is a Python loop?", "Programming", [])
    assert r_loop == "Loops are control structures used to repeat a block of code multiple times. Python provides for loops and while loops."
    
    # 6. Test Default Response (No Match)
    r_default = generate_chatbot_response("Solve a matrix", "Mathematics", [])
    assert r_default == (
        "[Offline AI Tutor]\n\n"
        "I couldn't find an exact answer. Please ask questions related to "
        "Mathematics, Science, Programming, General Knowledge, or UPSC preparation."
    )


def test_multilingual_greetings_and_queries():
    # 1. Test greeting translation and chatbot response
    greetings = ["hello", "hi", "vanakkam", "வணக்கம்", "नमस्ते", "నమస్కారం", "நమస్కారం"]
    for g in greetings:
        detected = detect_language(g)
        translated = translate_text(g, source_lang=detected)
        response = generate_chatbot_response(translated, "General Knowledge", [], original_query=g)
        assert response == "Hello! How can I assist you today?"
        
    # 2. Test Tamil queries
    # ஒளிச்சேர்க்கை என்றால் என்ன?
    q_ta = "ஒளிச்சேர்க்கை என்றால் என்ன?"
    det_ta = detect_language(q_ta)
    trans_ta = translate_text(q_ta, source_lang=det_ta)
    assert trans_ta == "photosynthesis"
    resp_ta = generate_chatbot_response(trans_ta, "Science", [], original_query=q_ta)
    assert "6CO₂ + 6H₂O" in resp_ta
    
    # 3. Test Hindi queries
    # प्रकाश संश्लेषण क्या है?
    q_hi = "प्रकाश संश्लेषण क्या है?"
    det_hi = detect_language(q_hi)
    trans_hi = translate_text(q_hi, source_lang=det_hi)
    assert trans_hi == "photosynthesis"
    resp_hi = generate_chatbot_response(trans_hi, "Science", [], original_query=q_hi)
    assert "6CO₂ + 6H₂O" in resp_hi
    
    # 4. Test Telugu queries
    # కాంతి సంయోగక్రియ అంటే ఏమిటి?
    q_te = "కాంతి సంయోగక్రియ అంటే ఏమిటి?"
    det_te = detect_language(q_te)
    trans_te = translate_text(q_te, source_lang=det_te)
    assert trans_te == "photosynthesis"
    resp_te = generate_chatbot_response(trans_te, "Science", [], original_query=q_te)
    assert "6CO₂ + 6H₂O" in resp_te


