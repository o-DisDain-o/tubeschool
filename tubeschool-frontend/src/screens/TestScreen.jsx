import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/common/Button.jsx';
import QuizQuestion from '../components/test/QuizQuestion.jsx';
import QuizSummary from '../components/test/QuizSummary.jsx';
import tubeschoolAPI from '../api/tubeschool.js';

export const TestScreen = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [sessionId]);

  const loadQuiz = async () => {
    try {
      const data = await tubeschoolAPI.generateQuiz(sessionId, 5);
      setQuiz(data);
      
      // Initialize answers object
      const initialAnswers = {};
      data.questions.forEach((q) => {
        initialAnswers[q.question_id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setError(
        err.response?.data?.detail ||
        'Failed to generate quiz. Make sure you asked some questions during the video!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = Object.values(answers).filter((a) => !a.trim()).length;
    if (unanswered > 0) {
      alert(`Please answer all questions. ${unanswered} remaining.`);
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));

      const resultData = await tubeschoolAPI.submitQuiz(sessionId, formattedAnswers);
      setResult(resultData);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tubes-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-tubes-accent mx-auto" />
          <p className="text-tubes-muted">Generating your personalized quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tubes-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-400 text-lg">{error}</div>
          <Button variant="primary" onClick={() => (window.location.href = '/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tubes-bg">
      {/* Header */}
      <header className="border-b border-slate-800 bg-tubes-bg-soft/80 backdrop-blur px-6 py-4">
        <Logo size="sm" />
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {!result ? (
          <>
            {/* Quiz Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Lesson Quiz
              </h1>
              <p className="text-tubes-muted">
                {quiz?.total_questions} questions based on your doubts
              </p>
              {quiz?.weak_topics?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {quiz.weak_topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-tubes-accent/20 text-tubes-accent text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-8">
              {quiz?.questions.map((question, index) => (
                <QuizQuestion
                  key={question.question_id}
                  question={question}
                  index={index}
                  answer={answers[question.question_id]}
                  onAnswerChange={handleAnswerChange}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full shadow-lg shadow-tubes-accent/30"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </div>
          </>
        ) : (
          <QuizSummary result={result} sessionId={sessionId} />
        )}
      </div>
    </div>
  );
};

export default TestScreen;