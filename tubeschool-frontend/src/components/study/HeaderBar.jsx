import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';

export const HeaderBar = ({ sessionId, videoTitle, onTestClick }) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-tubes-bg-soft/80 backdrop-blur">
      <div className="flex items-center gap-4">
        <Logo size="sm" />
        {videoTitle && (
          <div className="hidden md:block px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/40">
            <p className="text-xs text-slate-300 truncate max-w-md">
              {videoTitle}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {sessionId && (
          <div className="hidden sm:block px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-slate-400 font-mono">
              Session: {sessionId.slice(0, 8)}...
            </p>
          </div>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={onTestClick}
        >
          <ClipboardCheck size={16} />
          Finish & Test
        </Button>
      </div>
    </header>
  );
};

export default HeaderBar;