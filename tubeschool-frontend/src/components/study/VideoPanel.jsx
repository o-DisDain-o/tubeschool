import React, { useEffect, useRef } from 'react';
import Card from '../common/Card';

export const VideoPanel = ({ videoId, onVideoEnd, onTimeUpdate }) => {
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onVideoEnd?.();
            }
          },
        },
      });

      // Track current time
      const interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          onTimeUpdate?.(Math.floor(currentTime));
        }
      }, 1000);

      return () => clearInterval(interval);
    };
  }, [videoId, onVideoEnd, onTimeUpdate]);

  return (
    <div className="flex-1 p-4">
      <Card noPadding className="h-full overflow-hidden">
        <div className="relative w-full h-full">
          <div id="youtube-player" className="w-full h-full" />
        </div>
      </Card>
    </div>
  );
};

export default VideoPanel;