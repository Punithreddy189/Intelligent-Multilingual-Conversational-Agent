from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.models import AnalyticsLog, User, ChatMessage, ChatSession
from typing import Dict, Any, List

def log_action(db: Session, user_id: int, action: str, language: str = None):
    """
    Saves an analytics event log to the database.
    """
    try:
        log = AnalyticsLog(
            user_id=user_id,
            action=action,
            language=language,
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to log analytics action: {e}")

def get_analytics_summary(db: Session) -> Dict[str, Any]:
    """
    Aggregates database metrics to return a complete analytics dashboard summary.
    """
    # 1. Total counts
    total_users = db.query(User).count()
    
    # We count ChatMessages sent by 'user' as questions asked
    questions_asked = db.query(ChatMessage).filter(ChatMessage.sender == "user").count()
    active_sessions = db.query(ChatSession).count()
    
    # 2. Most Used Languages (aggregated from user messages)
    lang_counts = (
        db.query(ChatMessage.detected_language, func.count(ChatMessage.id))
        .filter(ChatMessage.sender == "user")
        .group_by(ChatMessage.detected_language)
        .all()
    )
    
    # Clean languages list
    languages_summary = []
    for lang, count in lang_counts:
        if lang:
            languages_summary.append({"language": lang, "count": count})
    
    # Sort languages by count descending
    languages_summary.sort(key=lambda x: x["count"], reverse=True)
    
    # If empty, add a default English block to avoid empty charts
    if not languages_summary:
        languages_summary = [{"language": "English", "count": 0}]

    # 3. Daily Activity (questions asked over the last 30 days)
    # SQLite-compatible date formatting: strftime('%Y-%m-%d', created_at)
    daily_stats = (
        db.query(
            func.strftime("%Y-%m-%d", ChatMessage.created_at).label("day"),
            func.count(ChatMessage.id).label("count")
        )
        .filter(ChatMessage.sender == "user")
        .group_by("day")
        .order_by("day")
        .limit(30)
        .all()
    )
    
    daily_activity = [{"date": day, "count": count} for day, count in daily_stats]
    if not daily_activity:
        daily_activity = [{"date": datetime.utcnow().strftime("%Y-%m-%d"), "count": 0}]

    # 4. Monthly Activity
    monthly_stats = (
        db.query(
            func.strftime("%Y-%m", ChatMessage.created_at).label("month"),
            func.count(ChatMessage.id).label("count")
        )
        .filter(ChatMessage.sender == "user")
        .group_by("month")
        .order_by("month")
        .all()
    )
    
    monthly_activity = [{"month": month, "count": count} for month, count in monthly_stats]
    if not monthly_activity:
        monthly_activity = [{"month": datetime.utcnow().strftime("%Y-%m"), "count": 0}]

    return {
        "total_users": total_users,
        "questions_asked": questions_asked,
        "active_sessions": active_sessions,
        "most_used_languages": languages_summary,
        "daily_activity": daily_activity,
        "monthly_activity": monthly_activity
    }
