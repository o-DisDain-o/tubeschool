import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to manage YouTube Player instance
 * @param {string} videoId - YouTube video ID
 * @param {function} onEnd - Callback when video ends
 * @param {function} onTimeUpdate - Callback with current time
 * @returns {object} Player ref and state
 */
export const useYouTubePlayer = (videoId, onEnd, onTimeUpdate) => {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState(null);

  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              setIsReady(true);
            },
            onStateChange: (event) => {
              setPlayerState(event.data);
              
              // Video ended
              if (event.data === window.YT.PlayerState.ENDED) {
                onEnd?.();
              }
            },
          },
        });

        // Track current time
        const interval = setInterval(() => {
          if (playerRef.current && playerRef.current.getCurrentTime) {
            try {
              const currentTime = playerRef.current.getCurrentTime();
              onTimeUpdate?.(Math.floor(currentTime));
            } catch (err) {
              // Player not ready yet
            }
          }
        }, 1000);

        return () => {
          clearInterval(interval);
          if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy();
          }
        };
      }
    };

    // Check if API is ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onEnd, onTimeUpdate]);

  // Helper functions
  const play = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  };

  const pause = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  };

  const seekTo = (seconds) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  const getCurrentTime = () => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      return playerRef.current.getCurrentTime();
    }
    return 0;
  };

  const getDuration = () => {
    if (playerRef.current && playerRef.current.getDuration) {
      return playerRef.current.getDuration();
    }
    return 0;
  };

  return {
    player: playerRef.current,
    isReady,
    playerState,
    play,
    pause,
    seekTo,
    getCurrentTime,
    getDuration,
  };
};

export default useYouTubePlayer;