# 🎓 TubeSchool Frontend

A beautiful, modern React frontend for TubeSchool - transforming YouTube videos into interactive learning experiences.

---

## 🎯 User Flow

1. **Home** → User pastes YouTube URL
2. **API Call** → `POST /api/v1/sessions`
3. **Study Screen** → Watch video + ask questions
4. **Questions** → `POST /api/v1/sessions/{id}/questions`
5. **Completion Modal** → Choose to take test or download notes
6. **Test Screen** → `GET /api/v1/sessions/{id}/quiz`
7. **Submit** → `POST /api/v1/sessions/{id}/quiz/submit`
8. **Results** → Show score and feedback
