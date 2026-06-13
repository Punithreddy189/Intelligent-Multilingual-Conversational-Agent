import os
import hashlib
from gtts import gTTS

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "audio_cache")

# Create audio cache directory if it doesn't exist
os.makedirs(CACHE_DIR, exist_ok=True)

def generate_tts_file(text: str, language: str) -> str:
    """
    Generates an MP3 file using gTTS for the given text and language, and returns the file path.
    Caches results using MD5 of text and language.
    """
    if not text:
        return ""
        
    lang_map = {
        "Tamil": "ta",
        "Telugu": "te",
        "Hindi": "hi",
        "English": "en"
    }
    
    lang_code = lang_map.get(language, "en")
    
    # Generate a unique hash for caching
    hash_input = f"{text}_{lang_code}".encode('utf-8')
    file_hash = hashlib.md5(hash_input).hexdigest()
    file_path = os.path.join(CACHE_DIR, f"{file_hash}.mp3")
    
    # If already cached, return it
    if os.path.exists(file_path):
        return file_path
        
    try:
        # Generate and save TTS audio
        tts = gTTS(text=text, lang=lang_code, slow=False)
        tts.save(file_path)
        return file_path
    except Exception as e:
        print(f"TTS generation error: {e}")
        # Return empty or raise
        raise e
