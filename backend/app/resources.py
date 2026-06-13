import os
import re
import math
import PyPDF2
from collections import Counter
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models import LearningResource
import google.generativeai as genai

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory store for PDF text chunks (to avoid re-reading files constantly)
# Format: { resource_id: [chunk1, chunk2, ...] }
pdf_chunks_cache: Dict[int, List[str]] = {}

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts plain text from a PDF file using PyPDF2.
    """
    text = ""
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
    """
    Splits text into chunks of chunk_size with overlap characters.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start += chunk_size - overlap
    return chunks

def get_pdf_chunks(resource_id: int, pdf_path: str) -> List[str]:
    """
    Retrieves chunks from cache or loads from file.
    """
    if resource_id in pdf_chunks_cache:
        return pdf_chunks_cache[resource_id]
        
    if not os.path.exists(pdf_path):
        return []
        
    text = extract_text_from_pdf(pdf_path)
    chunks = chunk_text(text)
    if chunks:
        pdf_chunks_cache[resource_id] = chunks
    return chunks

# --- TF-IDF Custom Matcher ---
def tokenize(text: str) -> List[str]:
    return re.findall(r'\w+', text.lower())

def search_chunks(query: str, chunks: List[str], top_n: int = 3) -> List[Tuple[str, float]]:
    """
    Ranks text chunks by TF-IDF similarity to the query.
    Returns list of (chunk_text, score) tuples.
    """
    if not chunks or not query:
        return []
        
    query_tokens = tokenize(query)
    doc_tokens_list = [tokenize(c) for c in chunks]
    N = len(chunks)
    
    # Calculate Document Frequency (DF)
    df = Counter()
    for doc_tokens in doc_tokens_list:
        unique_tokens = set(doc_tokens)
        for token in unique_tokens:
            df[token] += 1
            
    # Compute Term Frequency - Inverse Document Frequency (TF-IDF) for chunks
    tfidf_docs = []
    for doc_tokens in doc_tokens_list:
        tf = Counter(doc_tokens)
        doc_len = len(doc_tokens) or 1
        tfidf = {}
        for token, count in tf.items():
            # idf with smoothing
            idf = math.log((N + 1) / (df[token] + 1))
            tfidf[token] = (count / doc_len) * idf
        tfidf_docs.append(tfidf)
        
    # Compute TF-IDF for query
    query_tf = Counter(query_tokens)
    query_len = len(query_tokens) or 1
    tfidf_query = {}
    for token, count in query_tf.items():
        idf = math.log((N + 1) / (df[token] + 1))
        tfidf_query[token] = (count / query_len) * idf
        
    # Compute Cosine Similarity
    scores = []
    for idx, doc_tfidf in enumerate(tfidf_docs):
        dot_product = sum(val * doc_tfidf.get(token, 0) for token, val in tfidf_query.items())
        
        query_norm = math.sqrt(sum(val**2 for val in tfidf_query.values())) or 1.0
        doc_norm = math.sqrt(sum(val**2 for val in doc_tfidf.values())) or 1.0
        
        score = dot_product / (query_norm * doc_norm)
        scores.append((chunks[idx], score))
        
    # Sort by score descending
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_n]

# --- Question Answering over PDF ---
def answer_pdf_question(resource_id: int, pdf_path: str, question: str) -> Dict:
    """
    Finds context chunks in the PDF and uses Gemini to answer the question,
    or returns the chunks as a fallback.
    """
    chunks = get_pdf_chunks(resource_id, pdf_path)
    if not chunks:
        return {
            "answer": "Sorry, I could not extract any text from this document.",
            "matched_chunks": []
        }
        
    # Search for top matches
    matches = search_chunks(question, chunks, top_n=3)
    matched_texts = [m[0] for m in matches if m[1] > 0.0]
    
    # If no keywords match, take top 2 text pieces anyway to have context
    if not matched_texts:
        matched_texts = [matches[i][0] for i in range(min(2, len(matches)))]
        
    context = "\n---\n".join(matched_texts)
    
    # Call Gemini if API key is present
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "You are an educational AI assistant helping a student study their document.\n"
                "Answer the student's question based strictly on the provided context. If the answer is "
                "not in the context, synthesize a helpful answer but state that it's inferred.\n\n"
                f"Context from document:\n{context}\n\n"
                f"Student's Question: {question}\n\n"
                "Answer:"
            )
            response = model.generate_content(prompt)
            return {
                "answer": response.text.strip(),
                "matched_chunks": matched_texts
            }
        except Exception as e:
            print(f"Gemini QA failed: {e}. Falling back to context snippet.")
            
    # Fallback response (Local QA Summary)
    answer = (
        "Here are the most relevant sections found in the document regarding your question:\n\n"
        + "\n\n... ".join([f"• \"{text.strip()}\"" for text in matched_texts])
    )
    return {
        "answer": answer,
        "matched_chunks": matched_texts
    }
