import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

export const CourseCompletionModal = ({ show, onClose, sessionId }) => {
  const [activeTab, setActiveTab] = useState('test');
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/test/${sessionId}`);
  };

  const handleDownloadNotes = () => {
    // Placeholder - implement when backend provides notes endpoint
    alert('Notes download feature coming soon!');
  };

  const handleStudySomethingElse = () => {
    navigate('/');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Nice work! Ready to wrap up this lesson?
            </h2>
            <p className="text-tubes-muted mb-6">
              Choose what you'd like to do next
            </p>

            {/* Tab Selector */}
            <div className="flex rounded-full bg-slate-800 p-1 mb-6">
              <button
                onClick={() => setActiveTab('test')}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'test'
                    ? 'bg-tubes-accent text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ClipboardCheck size={16} className="inline mr-2" />
                Take Test
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-tubes-accent text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Download size={16} className="inline mr-2" />
                Download Notes
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-6">
              {activeTab === 'test' ? (
                <div className="space-y-4">
                  <p className="text-slate-300">
                    We'll generate a personalized quiz based on the doubts you asked during this session.
                    This helps reinforce what you've learned!
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartTest}
                    className="w-full"
                  >
                    <ClipboardCheck size={20} />
                    Start Test
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-300">
                    Download AI-generated summary and key points from this video for future reference.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleDownloadNotes}
                    className="w-full"
                  >
                    <Download size={20} />
                    Download Notes
                  </Button>
                </div>
              )}
            </div>

            {/* Secondary Action */}
            <Button
              variant="ghost"
              size="md"
              onClick={handleStudySomethingElse}
              className="w-full"
            >
              Study something else
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseCompletionModal;