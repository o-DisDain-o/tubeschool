import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import HeaderBar from '../components/study/HeaderBar.jsx';
import VideoPanel from '../components/study/VideoPanel.jsx';
import AvatarPanel from '../components/study/AvatarPanel.jsx';
import ChatPanel from '../components/study/ChatPanel.jsx';
import CourseCompletionModal from '../components/study/CourseCompletionModal.jsx';

export const StudyScreen = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const videoId = location.state?.videoId;

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  // State to store the text the avatar needs to speak
  const [avatarCaption, setAvatarCaption] = useState('');

  const handleVideoEnd = () => {
    setShowCompletionModal(true);
  };

  const handleTestClick = () => {
    setShowCompletionModal(true);
  };

  return (
    <div className="h-screen bg-tubes-bg flex flex-col overflow-hidden">
      <HeaderBar
        sessionId={sessionId}
        videoTitle="Learning Session"
        onTestClick={handleTestClick}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Panel */}
        <div className="w-[65%] flex flex-col">
          <VideoPanel
            videoId={videoId}
            onVideoEnd={handleVideoEnd}
            onTimeUpdate={setCurrentTimestamp}
          />
        </div>

        {/* Right: Avatar + Chat */}
        <div className="w-[35%] flex flex-col">
          {/* Passed avatarCaption to AvatarPanel */}
          <AvatarPanel textToSpeak={avatarCaption} />
          
          <div className="flex-1 overflow-hidden">
            {/* Passed onResponseReceived to capture teacher's text */}
            <ChatPanel
              sessionId={sessionId}
              currentTimestamp={currentTimestamp}
              onResponseReceived={(text) => setAvatarCaption(text)}
            />
          </div>
        </div>
      </div>

      <CourseCompletionModal
        show={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        sessionId={sessionId}
      />
    </div>
  );
};

export default StudyScreen;