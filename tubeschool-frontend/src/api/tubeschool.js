import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tubeschoolAPI = {
  // Session Management
  createSession: async (youtubeUrl) => {
    const response = await api.post('/sessions', {
      youtube_url: youtubeUrl,
    });
    return response.data;
  },

  // Question/Doubt Handling
  askQuestion: async (sessionId, question, timestampSec = null) => {
    const response = await api.post(`/sessions/${sessionId}/questions`, {
      question,
      timestamp_sec: timestampSec,
    });
    return response.data;
  },

  // Quiz Generation
  generateQuiz: async (sessionId, numQuestions = 5) => {
    const response = await api.get(`/sessions/${sessionId}/quiz`, {
      params: { num_questions: numQuestions },
    });
    return response.data;
  },

  // Quiz Submission
  submitQuiz: async (sessionId, answers) => {
    const response = await api.post(`/sessions/${sessionId}/quiz/submit`, {
      answers,
    });
    return response.data;
  },

  // Admin - Reset Vector Store
  resetVectorStore: async () => {
    const response = await api.delete('/admin/reset-vectorstore');
    return response.data;
  },
};

export default tubeschoolAPI;