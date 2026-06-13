import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
use_gemini = False

if api_key:
    try:
        genai.configure(api_key=api_key)
        use_gemini = True
    except Exception as e:
        print(f"Gemini configuration error: {e}. Falling back to template-based responses.")

# Knowledge base dictionary for similarity matching
knowledge_base = {
    # --- GREETINGS ---
    "hello": "Hello! How can I assist you today?",
    "hi": "Hello! How can I assist you today?",
    "vanakkam": "Hello! How can I assist you today?",
    "வணக்கம்": "Hello! How can I assist you today?",
    "நமస్కారం": "Hello! How can I assist you today?",
    "नमस्ते": "Hello! How can I assist you today?",
    "నమస్కారం": "Hello! How can I assist you today?",

    # --- GENERAL KNOWLEDGE & UPSC PREPARATION ---
    "red fort": "The Red Fort is a historic fort located in Delhi, India. It was built by Mughal Emperor Shah Jahan in 1648 and served as the residence of Mughal rulers. It is a UNESCO World Heritage Site and plays an important role in Indian history.",
    "redfort": "The Red Fort is a historic fort located in Delhi, India. It was built by Mughal Emperor Shah Jahan in 1648 and served as the residence of Mughal rulers. It is a UNESCO World Heritage Site and plays an important role in Indian history.",
    "taj mahal": "The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal.",
    "india": "India is a country in South Asia. It is the seventh-largest country by area, the most populous country, and the most populous democracy in the world. Its capital is New Delhi, and its constitution was adopted in 1950.",
    "भारतीय": "India is a country in South Asia. It is the seventh-largest country by area, the most populous country, and the most populous democracy in the world. Its capital is New Delhi, and its constitution was adopted in 1950.",
    "இந்தியாவைப் பற்றி கூறுங்கள்": "India is a country in South Asia. It is the seventh-largest country by area, the most populous country, and the most populous democracy in the world. Its capital is New Delhi, and its constitution was adopted in 1950.",
    "இந்தியா": "India is a country in South Asia. It is the seventh-largest country by area, the most populous country, and the most populous democracy in the world. Its capital is New Delhi, and its constitution was adopted in 1950.",
    "history": "History is the systematic study and documentation of past human events. It helps us understand past societies, cultures, and how our present world was shaped.",
    "constitution": "The Constitution of India is the supreme law of India. The document lays down the framework that demarcates fundamental political code, structure, procedures, powers, and duties of government institutions and sets out fundamental rights, directive principles, and the duties of citizens. Dr. B.R. Ambedkar is known as the Father of the Indian Constitution.",
    "freedom fighters": "Prominent Indian freedom fighters include Mahatma Gandhi, Subhas Chandra Bose, Bhagat Singh, Rani Lakshmibai, and Jawaharlal Nehru. They fought against British rule to secure India's independence in 1947.",
    "upsc": "1. Who is known as the Father of the Indian Constitution?\n\n2. Which article deals with Fundamental Rights?\n\n3. Who was the first President of India?\n\n4. Which river is called the Ganga of the South?\n\n5. In which year did India gain independence?",
    "ias": "1. Who is known as the Father of the Indian Constitution?\n\n2. Which article deals with Fundamental Rights?\n\n3. Who was the first President of India?\n\n4. Which river is called the Ganga of the South?\n\n5. In which year did India gain independence?",
    "current affairs": "1. Who is known as the Father of the Indian Constitution?\n\n2. Which article deals with Fundamental Rights?\n\n3. Who was the first President of India?\n\n4. Which river is called the Ganga of the South?\n\n5. In which year did India gain independence?",

    # --- SCIENCE ---
    "photosynthesis": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    "ஒளிச்சேர்க்கை": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    "ஒளிச்சேர்க்கை என்றால் என்ன?": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    "प्रकाश संश्लेषण क्या है?": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    "प्रकाश संश्लेषण": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    "కాంతి సంయోగక్రియ అంటే ఏమిటి?": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    "కాంతి సంయోగక్రియ": "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. The general chemical equation is: 6CO₂ + 6H₂O + light energy -> C₆H₁₂O₆ + 6O₂.",
    
    "gravity": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    "புவியீர்ப்பு விசை என்றால் என்ன?": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    "புவியீர்ப்பு விசை": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    "गुरुत्वाकर्षण क्या है?": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    "गुरुत्वाकर्षण": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    "గురుత్వాకర్షణ అంటే ఏమిటి?": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    "గురుత్వాకర్షణ": "Gravity is a fundamental force of attraction that exists between any two masses, any two bodies, any two particles. Sir Isaac Newton formulated the Law of Universal Gravitation, stating that the force is proportional to the product of their masses and inversely proportional to the square of the distance between them: F = G * (m1*m2)/r².",
    
    "newton": "Newton's laws of motion are three physical laws that lay the foundation for classical mechanics. 1. Law of Inertia: An object remains at rest or in uniform motion unless acted upon by an external force. 2. F = ma: Force equals mass times acceleration. 3. Action-Reaction: For every action, there is an equal and opposite reaction.",
    "newton's laws": "Newton's laws of motion are three physical laws that lay the foundation for classical mechanics. 1. Law of Inertia: An object remains at rest or in uniform motion unless acted upon by an external force. 2. F = ma: Force equals mass times acceleration. 3. Action-Reaction: For every action, there is an equal and opposite reaction.",
    "newtons laws": "Newton's laws of motion are three physical laws that lay the foundation for classical mechanics. 1. Law of Inertia: An object remains at rest or in uniform motion unless acted upon by an external force. 2. F = ma: Force equals mass times acceleration. 3. Action-Reaction: For every action, there is an equal and opposite reaction.",
    "laws of motion": "Newton's laws of motion are three physical laws that lay the foundation for classical mechanics. 1. Law of Inertia: An object remains at rest or in uniform motion unless acted upon by an external force. 2. F = ma: Force equals mass times acceleration. 3. Action-Reaction: For every action, there is an equal and opposite reaction.",
    "cell": "A cell is the basic structural, functional, and biological unit of all known living organisms. Cells are the smallest units of life, categorized into prokaryotic (lacking a nucleus, like bacteria) and eukaryotic (containing a nucleus, like animal and plant cells).",
    "atom": "An atom is the basic unit of a chemical element. It consists of a dense central nucleus containing positively charged protons and neutral neutrons, surrounded by a cloud of negatively charged electrons orbiting in shells.",
    "electricity": "Electricity is the set of physical phenomena associated with the presence and flow of electric charge. It powers modern appliances, lighting, and computing devices, and is governed by Ohm's Law: V = I * R.",

    # --- MATHEMATICS ---
    "algebra": "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. These symbols (like x and y) represent variables that can take different values to solve equations.",
    "trigonometry": "Trigonometry is a branch of mathematics that studies relationships between side lengths and angles of triangles. The primary functions are sine, cosine, and tangent, crucial for geometry and physics.",
    "calculus": "Calculus is the mathematical study of continuous change. It consists of two major branches: Differential Calculus (slopes and rates of change) and Integral Calculus (areas under curves and accumulation of quantities).",
    "integration": "Integration is a branch of calculus used to determine area under curves and reverse differentiation.",
    "differentiation": "Differentiation is a branch of calculus used to determine the rate of change of a function with respect to a variable, representing the slope of the curve at any point.",

    # --- PROGRAMMING ---
    "python loop": "Loops are control structures used to repeat a block of code multiple times. Python provides for loops and while loops.",
    "python loops": "Loops are control structures used to repeat a block of code multiple times. Python provides for loops and while loops.",
    "python": "Python is a high-level, interpreted, general-purpose programming language. It is famous for its clean syntax, readability, and versatile libraries used in Web development, Data Science, and Artificial Intelligence.",
    "java": "Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible, adhering to the 'Write Once, Run Anywhere' (WORA) principle.",
    "c++": "C++ is a general-purpose programming language created by Bjarne Stroustrup as an extension of the C programming language. It supports object-oriented, generic, and functional programming features.",
    "loops": "Loops are control structures used to repeat a block of code multiple times. Programming languages typically provide for loops and while loops to iterate over collections or repeat actions.",
    "loop": "Loops are control structures used to repeat a block of code multiple times. Programming languages typically provide for loops and while loops to iterate over collections or repeat actions.",
    "arrays": "An array is a data structure consisting of a collection of elements (values or variables), each identified by at least one array index or key, stored in contiguous memory locations.",
    "array": "An array is a data structure consisting of a collection of elements (values or variables), each identified by at least one array index or key, stored in contiguous memory locations.",
    "functions": "A function is a reusable block of organized, readable code used to perform a single, related action. Functions provide better modularity for applications.",
    "function": "A function is a reusable block of organized, readable code used to perform a single, related action. Functions provide better modularity for applications."
}

# Alias for backward compatibility if needed
KNOWLEDGE_BASE = knowledge_base

def get_words(text: str):
    import re
    return [w for w in re.findall(r'[a-zA-Z0-9\+\#\u0900-\u097f\u0b80-\u0bff\u0c00-\u0c7f]+', text.lower()) if w]

def calculate_match_score(key_words, query_words, key_str, query_str):
    key_lower = key_str.lower()
    query_lower = query_str.lower()
    
    # Check direct substring matching (highest priority)
    if key_lower in query_lower:
        return 1000 + len(key_lower)
        
    # Word-level overlap
    matched_words = 0
    for kw in key_words:
        for qw in query_words:
            # Match exactly or as prefix/suffix (handles simple singulars/plurals/suffixes)
            if kw == qw or (len(kw) > 3 and kw in qw) or (len(qw) > 3 and qw in kw):
                matched_words += 1
                break
                
    if matched_words == 0:
        return 0
        
    score = matched_words * 1000 + len(key_lower)
    
    if matched_words < len(key_words):
        # Penalty for unmatched key words
        score -= (len(key_words) - matched_words) * 800
        
    return score

def generate_fallback_response(query: str, subject: str = "", original_query: str = "") -> str:
    """
    Returns a structured local fallback response using token-based similarity matching.
    """
    query_lower = query.lower().strip() if query else ""
    query_words = get_words(query_lower) if query_lower else []
    
    best_key = None
    best_score = 0
    
    # Try matching query (English translated)
    if query_lower:
        for key in knowledge_base:
            key_words = get_words(key)
            score = calculate_match_score(key_words, query_words, key, query_lower)
            if score > best_score:
                best_score = score
                best_key = key
                
    # If no English match, try matching original query directly (Tamil, Hindi, Telugu)
    if best_score == 0 and original_query:
        orig_lower = original_query.lower().strip()
        orig_words = get_words(orig_lower)
        
        for key in knowledge_base:
            key_words = get_words(key)
            score = calculate_match_score(key_words, orig_words, key, orig_lower)
            if score > best_score:
                best_score = score
                best_key = key
                
    if best_score > 0 and best_key:
        return knowledge_base[best_key]
        
    return (
        "[Offline AI Tutor]\n\n"
        "I couldn't find an exact answer. Please ask questions related to "
        "Mathematics, Science, Programming, General Knowledge, or UPSC preparation."
    )

def generate_chatbot_response(user_query: str, subject: str, history_messages: list, original_query: str = "") -> str:
    """
    Generates a response using Gemini API or falls back to template-based responses.
    """
    if not use_gemini:
        res = generate_fallback_response(user_query, subject, original_query)
        if not res:
            res = (
                "[Offline AI Tutor]\n\n"
                "I couldn't find an exact answer. Please ask questions related to "
                "Mathematics, Science, Programming, General Knowledge, or UPSC preparation."
            )
        return res
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Build prompt with educational context and chat history
        prompt_parts = [
            "You are an intelligent multilingual conversational AI tutor for students.",
            f"Subject Context: The student is asking about {subject}.",
            "Guidelines: Keep responses educational, accurate, clear, and structured. Use Markdown. Break down complex concepts.",
            "\nConversation History:"
        ]
        
        # Add past history (limit to last 6 messages to prevent overflow)
        for msg in history_messages[-6:]:
            role = "Student" if msg.sender == "user" else "Tutor"
            text = msg.translated_text if msg.sender == "user" else msg.response_text
            prompt_parts.append(f"{role}: {text}")
            
        # Add current query
        prompt_parts.append(f"Student: {user_query}")
        prompt_parts.append("Tutor:")
        
        prompt = "\n".join(prompt_parts)
        
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        if res_text:
            return res_text
            
    except Exception as e:
        print(f"Gemini API call failed: {e}. Using local fallback.")
        
    res = generate_fallback_response(user_query, subject, original_query)
    if not res:
        res = (
            "[Offline AI Tutor]\n\n"
            "I couldn't find an exact answer. Please ask questions related to "
            "Mathematics, Science, Programming, General Knowledge, or UPSC preparation."
        )
    return res
