import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';

export const QuizQuestion = ({ question, index, answer, onAnswerChange }) => {
  const { question_id, question_text, question_type, options, topic } = question;

  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-tubes-accent/20 flex items-center justify-center">
          <span className="text-sm font-bold text-tubes-accent">
            {index + 1}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-white font-medium leading-relaxed">
            {question_text}
          </p>
          {topic && (
            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-400">
              {topic}
            </span>
          )}
        </div>
      </div>

      <div className="pl-11">
        {question_type === 'mcq' ? (
          <div className="space-y-2">
            {options?.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-tubes-accent/50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={question_id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onAnswerChange(question_id, e.target.value)}
                  className="w-4 h-4 text-tubes-accent"
                />
                <span className="text-slate-200">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-2">
            <textarea
              placeholder="Type your answer here..."
              value={answer || ''}
              onChange={(e) => onAnswerChange(question_id, e.target.value)}
              className="w-full h-24 bg-transparent text-white placeholder-slate-500 outline-none resize-none p-2"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuizQuestion;