import spacy
from deep_translator import GoogleTranslator

# Load spaCy model with rule-based fallback
nlp = None
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    # If the model is not downloaded, we will use a fallback or try to load blank
    try:
        nlp = spacy.blank("en")
    except Exception:
        nlp = None

def detect_language(text: str) -> str:
    """
    Detects language based on Unicode block analysis (Tamil, Telugu, Hindi, English).
    """
    if not text or not isinstance(text, str):
        return "English"
        
    # Unicode block scanning
    has_tamil = any('\u0b80' <= char <= '\u0bff' for char in text)
    has_telugu = any('\u0c00' <= char <= '\u0c7f' for char in text)
    has_hindi = any('\u0900' <= char <= '\u097f' for char in text)
    
    if has_tamil:
        return "Tamil"
    elif has_telugu:
        return "Telugu"
    elif has_hindi:
        return "Hindi"
    
    return "English"

def translate_text(text: str, source_lang: str, target_lang: str = "English") -> str:
    """
    Translates text between languages using deep-translator (GoogleTranslator) with offline fallback.
    """
    if not text:
        return ""
        
    # Manual translations for greetings and academic queries to guarantee correct offline mapping
    manual_map = {
        # Greetings
        "வணக்கம்": "hello",
        "நமస్కாரம்": "hello",
        "नमस्ते": "hello",
        "నమస్కారం": "hello",
        "hello": "hello",
        "hi": "hello",
        "vanakkam": "hello",
        
        # Tamil queries
        "ஒளிச்சேர்க்கை என்றால் என்ன?": "photosynthesis",
        "ஒளிச்சேர்க்கை": "photosynthesis",
        "புவியீர்ப்பு விசை என்றால் என்ன?": "gravity",
        "புவியீர்ப்பு விசை": "gravity",
        "இந்தியாவைப் பற்றி கூறுங்கள்": "india",
        "இந்தியா": "india",
        
        # Hindi queries
        "प्रकाश संश्लेषण क्या है?": "photosynthesis",
        "प्रकाश संश्लेषण": "photosynthesis",
        "गुरुत्वाकर्षण क्या है?": "gravity",
        "गुरुत्वाकर्षण": "gravity",
        
        # Telugu queries
        "కాంతి సంయోగక్రియ అంటే ఏమిటి?": "photosynthesis",
        "కాంతి సంయోగక్రియ": "photosynthesis",
        "గురుత్వాకర్షణ అంటే ఏమిటి?": "gravity",
        "గురుత్వాకర్షణ": "gravity"
    }
    
    clean_text = text.strip().lower().rstrip('?').strip()
    clean_text_with_q = text.strip().lower()
    
    # Check manual translation dictionary
    for key, val in manual_map.items():
        key_clean = key.strip().lower().rstrip('?').strip()
        key_with_q = key.strip().lower()
        if clean_text == key_clean or clean_text_with_q == key_with_q:
            return val
            
    if source_lang == target_lang:
        return text
        
    lang_map = {
        "Tamil": "ta",
        "Telugu": "te",
        "Hindi": "hi",
        "English": "en"
    }
    
    src = lang_map.get(source_lang, "auto")
    dest = lang_map.get(target_lang, "en")
    
    try:
        translated = GoogleTranslator(source=src, target=dest).translate(text)
        return translated if translated else text
    except Exception as e:
        print(f"Translation warning: {e}. Returning original text.")
        return text

def process_nlp(text: str):
    """
    Uses spaCy for tokenization, Named Entity Recognition, and computes custom intent detection.
    """
    tokens = []
    entities = {}
    intent = "General Inquiry"
    
    # Text translation cleanup
    text_clean = text.lower().strip()
    
    # 1. Intent Detection
    import re
    words = set(re.findall(r'\w+', text_clean))
    greetings = {"hello", "hi", "hey", "வணக்கம்", "namaste", "hola"}
    
    if greetings.intersection(words):
        intent = "Greeting"
    elif any(word in text_clean for word in ["calculate", "solve", "math", "equation", "formula", "derivative", "integral", "+", "-", "*", "/"]):
        intent = "Mathematics / Calculation"
    elif any(word in text_clean for word in ["code", "program", "python", "javascript", "function", "compile", "bug", "algorithm"]):
        intent = "Programming / Coding"
    elif any(word in text_clean for word in ["why", "explain", "what is", "how does", "define", "concept"]):
        intent = "Concept Explanation"
    elif any(word in text_clean for word in ["who", "when", "where", "history", "president", "capital"]):
        intent = "Fact Retrieval"

    # 2. Tokenization and Named Entity Recognition
    if nlp:
        try:
            doc = nlp(text)
            tokens = [token.text for token in doc]
            for ent in doc.ents:
                entities[ent.label_] = ent.text
        except Exception:
            # Fallback tokenization
            tokens = text.split()
    else:
        tokens = text.split()
        
    # Extra rule-based entity extractors for educational subjects
    subjects = ["mathematics", "science", "programming", "history", "geography", "physics", "chemistry", "biology"]
    extracted_subjects = [subj for subj in subjects if subj in text_clean]
    if extracted_subjects:
        entities["SUBJECT"] = extracted_subjects[0].capitalize()

    return {
        "tokens": tokens,
        "intent": intent,
        "entities": entities
    }
