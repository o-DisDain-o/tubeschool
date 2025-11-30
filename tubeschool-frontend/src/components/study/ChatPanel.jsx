import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import tubeschoolAPI from '../../api/tubeschool.js';

// CHANGE: Added onResponseReceived prop
export const ChatPanel = ({ sessionId, currentTimestamp, onResponseReceived }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'teacher',
      text: "Hi! I'm here to help you understand this video. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await tubeschoolAPI.askQuestion(
        sessionId,
        input,
        currentTimestamp
      );

      const teacherMessage = {
        id: Date.now() + 1,
        type: 'teacher',
        text: response.answer,
        timestamp: response.relevant_timestamp,
      };

      setMessages((prev) => [...prev, teacherMessage]);

      // CHANGE: Trigger the avatar to speak this response
      if (onResponseReceived) {
        onResponseReceived(response.answer);
      }

    } catch (error) {
      console.error('Failed to get answer:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'teacher',
        text: "Sorry, I couldn't answer that. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 p-4 pt-2">
      <Card className="h-full flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  message.type === 'user'
                    ? 'bg-tubes-accent text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.timestamp && (
                  <p className="text-xs opacity-70 mt-1">
                    Related to {Math.floor(message.timestamp / 60)}:
                    {String(message.timestamp % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl px-4 py-2.5">
                <Loader2 size={16} className="animate-spin text-tubes-accent" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-2 p-2 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !input.trim()}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChatPanel;