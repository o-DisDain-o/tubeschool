import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import tubeschoolAPI from '../../api/tubeschool';

export const VideoUrlForm = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);

    try {
      const response = await tubeschoolAPI.createSession(url);
      navigate(`/study/${response.session_id}`, { 
        state: { videoId: response.video_id } 
      });
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(
        err.response?.data?.detail || 
        'Failed to load video. Please check the URL and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="flex w-full rounded-2xl bg-slate-900/70 border border-slate-700/60 p-2 gap-2">
          <Input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="shrink-0"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Start Studying
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4">
          {error}
        </div>
      )}

      <p className="text-center text-sm text-tubes-muted">
        Try it with any educational video that has captions enabled
      </p>
    </div>
  );
};

export default VideoUrlForm;