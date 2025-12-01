# 🎓 TubeSchool Backend API

Transform YouTube videos into interactive learning experiences with AI-powered doubt clearing and personalized quizzes.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Qdrant Cloud account (free tier)
- Google API key for Gemini

### Installation

1. **Clone and setup**
```bash
git clone 
cd tubeschool-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Get API Keys**

**Qdrant Cloud** (Vector Database):
- Go to https://cloud.qdrant.io/
- Sign up for free account
- Create a cluster
- Copy URL and API key to `.env`

**Google Gemini** (Free LLM):
- Go to https://makersuite.google.com/app/apikey
- Create API key
- Add to `.env` as `GOOGLE_API_KEY`

4. **Run the server**
```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

---

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