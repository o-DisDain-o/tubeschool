import hashlib
from datetime import datetime
from typing import Any, Dict

def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix"""
    timestamp = datetime.utcnow().isoformat()
    hash_obj = hashlib.md5(timestamp.encode())
    return f"{prefix}{hash_obj.hexdigest()[:12]}" if prefix else hash_obj.hexdigest()[:12]

def format_timestamp(seconds: float) -> str:
    """Convert seconds to MM:SS format"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    return " ".join(text.split()).strip()

def validate_youtube_url(url: str) -> bool:
    """Basic YouTube URL validation"""
    valid_domains = ['youtube.com', 'youtu.be', 'www.youtube.com']
    return any(domain in url for domain in valid_domains)