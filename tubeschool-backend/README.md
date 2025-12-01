# 🎓 TubeSchool Backend API

Transform YouTube videos into interactive learning experiences with AI-powered doubt clearing and personalized quizzes.


## 📡 API Endpoints

### 1. Create Session
```bash
POST /api/v1/sessions
{
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}

Response:
{
  "session_id": "uuid",
  "video_id": "dQw4w9WgXcQ",
  "transcript_loaded": true
}
```

### 2. Ask Question
```bash
POST /api/v1/sessions/{session_id}/questions
{
  "question": "What is gradient descent?",
  "timestamp_sec": 120
}

Response:
{
  "answer": "Gradient descent is...",
  "relevant_timestamp": 115,
  "confidence": 0.89
}
```

### 3. Generate Quiz
```bash
GET /api/v1/sessions/{session_id}/quiz?num_questions=5

Response:
{
  "session_id": "uuid",
  "questions": [...],
  "total_questions": 5,
  "weak_topics": ["gradient descent", "backpropagation"]
}
```

### 4. Submit Quiz
```bash
POST /api/v1/sessions/{session_id}/quiz/submit
{
  "answers": [
    {"question_id": "q1", "answer": "Option A"},
    {"question_id": "q2", "answer": "Neural networks..."}
  ]
}

Response:
{
  "score": 80.0,
  "total_questions": 5,
  "correct_answers": 4,
  "feedback": [...]
}
```

---

## 🏗️ Project Structure

```
tubeschool-backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Settings & env vars
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── transcript_service.py   # YouTube transcript handling
│   │   ├── vector_service.py       # Qdrant operations
│   │   ├── note_service.py         # Note generation
│   │   ├── qa_service.py           # LLM Q&A
│   │   └── quiz_service.py         # Quiz generation
│   ├── routes/
│   │   └── sessions.py      # API endpoints
│   └── utils/
│       └── helpers.py       # Utility functions
├── requirements.txt
├── .env
└── README.md
```