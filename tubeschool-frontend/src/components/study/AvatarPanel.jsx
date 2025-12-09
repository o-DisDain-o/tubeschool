import React, { useEffect, useState } from 'react';
import Card from '../common/Card';

const IDLE_URL = "https://lottie.host/fa25c183-c169-42c5-a404-d0ee64a69475/e7mg40uyoE.lottie";
const SPEAKING_URL = "https://lottie.host/023a3866-b473-41f4-99ba-3cf17e64c32f/tBSfxCWvnL.lottie";

export const AvatarPanel = ({ textToSpeak }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Load the Lottie Player Script dynamically
  useEffect(() => {
    const loadLottieScript = () => {
      if (document.querySelector('script[src*="dotlottie-player"]')) return;
      
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs";
      script.type = "module";
      document.body.appendChild(script);
    };

    loadLottieScript();
  }, []);

  // Handle Text-to-Speech
  useEffect(() => {
    if (!textToSpeak) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Select a voice (prefer female/natural if available)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

    // Event Handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    // Speak
    window.speechSynthesis.speak(utterance);

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [textToSpeak]);

  return (
    <div className="p-4 pb-2">
      <Card className="h-64 relative overflow-hidden flex flex-col items-center justify-center bg-slate-900/50">
        
        {/* We render BOTH players and toggle visibility to prevent 
           flickering/reloading delays when switching states.
        */}

        {/* Idle State Animation */}
        <div className={`w-full h-full ${isSpeaking ? 'hidden' : 'block'}`}>
          <dotlottie-player
            src={IDLE_URL}
            background="transparent"
            speed="1"
            style={{ width: '100%', height: '100%' }}
            loop
            autoplay
          ></dotlottie-player>
        </div>

        {/* Speaking State Animation */}
        <div className={`w-full h-full ${isSpeaking ? 'block' : 'hidden'}`}>
          <dotlottie-player
            src={SPEAKING_URL}
            background="transparent"
            speed="1"
            style={{ width: '100%', height: '100%' }}
            loop
            autoplay
          ></dotlottie-player>
        </div>

      </Card>
    </div>
  );
};

export default AvatarPanel;