import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import useDownloadNotes from '../../hooks/useDownloadNotes.js';

export const QuizSummary = ({ result, sessionId }) => {
  const navigate = useNavigate();
  const { score, total_questions, correct_answers, feedback } = result;
  
  // Use the custom hook for downloading notes
  const { downloadNotes, downloading } = useDownloadNotes();

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = () => {
    if (score >= 80) return 'Excellent work!';
    if (score >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center space-y-4">
          <Award size={64} className={`mx-auto ${getScoreColor()}`} />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {getScoreMessage()}
            </h2>
            <div className="flex items-center justify-center gap-4 text-tubes-muted">
              <span>
                {correct_answers} / {total_questions} correct
              </span>
              <span>•</span>
              <span className={`text-2xl font-bold ${getScoreColor()}`}>
                {score.toFixed(0)}%
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Feedback */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Question Breakdown
        </h3>
        {feedback?.map((item, index) => (
          <motion.div
            key={item.question_id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="space-y-3">
              <div className="flex items-start gap-3">
                {item.is_correct ? (
                  <CheckCircle2 size={24} className="text-green-400 shrink-0" />
                ) : (
                  <XCircle size={24} className="text-red-400 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium mb-2">
                    {item.question_text}
                  </p>
                  
                  {item.user_answer && (
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-400">
                        Your answer:{' '}
                        <span className={item.is_correct ? 'text-green-400' : 'text-red-400'}>
                          {item.user_answer}
                        </span>
                      </p>
                      {!item.is_correct && item.correct_answer && (
                        <p className="text-slate-400">
                          Correct answer:{' '}
                          <span className="text-green-400">
                            {item.correct_answer}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {item.explanation && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <p className="text-sm text-slate-300">
                        {item.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
          className="flex-1"
        >
          Study Something Else
        </Button>
        
        <Button
          variant="secondary"
          size="lg"
          onClick={() => downloadNotes(sessionId)}
          disabled={downloading}
          className="flex-1"
        >
          {downloading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={20} />
              Download Notes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuizSummary;