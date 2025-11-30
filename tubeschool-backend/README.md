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
git clone <your-repo>
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

---

## 🚢 Deployment (100% Free)

### Option 1: Render.com

1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
4. Connect GitHub repo
5. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from `.env`
7. Deploy!

### Option 2: Railway.app

1. Push to GitHub
2. Go to https://railway.app
3. "New Project" → "Deploy from GitHub"
4. Select repo
5. Add environment variables
6. Railway auto-detects Python and deploys

### Frontend Integration

Your frontend should use these endpoints:
```javascript
const API_BASE = 'https://your-api.onrender.com/api/v1';

// Start session
const session = await fetch(`${API_BASE}/sessions`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({youtube_url: url})
});

// Ask question
const answer = await fetch(`${API_BASE}/sessions/${sessionId}/questions`, {
  method: 'POST',
  body: JSON.stringify({question: q, timestamp_sec: time})
});
```

---

## 🧪 Testing with cURL

```bash
# Start session
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"youtube_url":"https://www.youtube.com/watch?v=aircAruvnKk"}'

# Ask question (replace SESSION_ID)
curl -X POST http://localhost:8000/api/v1/sessions/SESSION_ID/questions \
  -H "Content-Type: application/json" \
  -d '{"question":"What is a neural network?","timestamp_sec":0}'

# Generate quiz
curl http://localhost:8000/api/v1/sessions/SESSION_ID/quiz?num_questions=3
```

---

## 🐛 Troubleshooting

**"No transcript available"**
- Video must have captions/subtitles
- Try another video with auto-generated captions

**Qdrant connection errors**
- Check `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
- Verify cluster is running in Qdrant Cloud dashboard

**LLM errors**
- Check `GOOGLE_API_KEY` is valid
- Free tier has rate limits (60 requests/minute)

---

## 📊 Monitoring & Logs

Check logs for debugging:
```bash
# Local
tail -f logs/app.log

# Render/Railway
View logs in dashboard
```

---

## 🔧 Configuration Options

Edit `config.py` or `.env` for:
- `CHUNK_SIZE`: Transcript chunk size (default: 500 chars)
- `EMBEDDING_MODEL`: Change embedding model
- `LLM_PROVIDER`: Switch between google/huggingface/azure
- `TEMPERATURE`: LLM creativity (0.0-1.0)

---

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement session persistence (PostgreSQL)
- [ ] Add video metadata caching
- [ ] Implement rate limiting
- [ ] Add analytics/tracking
- [ ] Support multiple languages

---

## 📞 Support

For hackathon questions:
- Check `/docs` endpoint for interactive API documentation
- Review error messages in response body
- Enable debug mode: `uvicorn app.main:app --reload --log-level debug`

---

## 📄 License

MIT License - Free for hackathon use!