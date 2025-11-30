from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

# Session Models
class SessionCreate(BaseModel):
    youtube_url: str

class SessionResponse(BaseModel):
    session_id: str
    video_id: str
    video_title: Optional[str] = None
    duration_seconds: Optional[int] = None
    transcript_loaded: bool

# Question/Doubt Models
class QuestionRequest(BaseModel):
    question: str
    timestamp_sec: Optional[int] = None

class QuestionResponse(BaseModel):
    answer: str
    relevant_timestamp: Optional[int] = None
    confidence: Optional[float] = None

# Quiz Models
class QuizQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: str  # "mcq" or "short_answer"
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: Optional[str] = None  # Hidden from response
    topic: Optional[str] = None

class QuizResponse(BaseModel):
    session_id: str
    video_id: str
    questions: List[QuizQuestion]
    total_questions: int
    weak_topics: Optional[List[str]] = None

class QuizAnswer(BaseModel):
    question_id: str
    answer: str

class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    feedback: List[Dict[str, Any]]
    weak_concepts: Optional[List[str]] = None

# Internal Models for Vector Store
class VideoChunk(BaseModel):
    video_id: str
    chunk_index: int
    text: str
    start_time_sec: float
    end_time_sec: float
    topic_tags: Optional[List[str]] = None

class UserDoubt(BaseModel):
    session_id: str
    video_id: str
    question: str
    answer: str
    timestamp_sec: Optional[int] = None
    topic: Optional[str] = None
    created_at: datetime = datetime.utcnow()

class NotesResponse(BaseModel):
    session_id: str
    video_id: str
    note_content: str