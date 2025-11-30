import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, Power, Loader2 } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

// CHANGE: Configuration from your app.js
const API_CONFIG = {
  serverUrl: "https://api.heygen.com",
  token: "sk_V2_hgu_kFXB7wOulld_HV9PFfVALCxucs6bV4GqUDainQDz9Dol",
  avatarId: "Elenora_IT_Sitting_public"
};

export const AvatarPanel = ({ textToSpeak }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Ready to start...');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to hold non-react state variables from your app.js
  const sessionInfoRef = useRef(null);
  const roomRef = useRef(null);

  // CHANGE: Load LiveKit SDK dynamically
  useEffect(() => {
    const loadLiveKit = async () => {
      if (window.LivekitClient) return;

      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/livekit-client/2.15.7/livekit-client.umd.js";
      script.async = true;
      document.body.appendChild(script);

      return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    };

    loadLiveKit().catch(err => {
      console.error("Failed to load LiveKit", err);
      setStatus("Error loading Avatar SDK");
    });

    return () => {
        // Cleanup session on unmount
        closeSession();
    };
  }, []);

  // CHANGE: Listen for text changes from ChatPanel and speak
  useEffect(() => {
    if (textToSpeak && isSessionActive) {
        sendTextToAvatar(textToSpeak);
    }
  }, [textToSpeak, isSessionActive]);

  const waitForLiveKit = () => {
    return new Promise((resolve, reject) => {
        if (window.LivekitClient) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.LivekitClient) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error('LiveKit SDK failed to load'));
            }, 10000);
        }
    });
  };

  // CHANGE: Logic ported from createSession()
  const createSession = async () => {
    setIsLoading(true);
    try {
        setStatus('Checking LiveKit SDK...');
        await waitForLiveKit();
        setStatus('Creating session...');

        // Step 1: Create new session
        const createResponse = await fetch(`${API_CONFIG.serverUrl}/v1/streaming.new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_CONFIG.token}`
            },
            body: JSON.stringify({
                version: "v2",
                avatar_id: API_CONFIG.avatarId,
                quality: "medium", // Changed to medium for better performance
                video_encoding: "H264"
            })
        });

        if (!createResponse.ok) throw new Error(`Failed to create session: ${createResponse.status}`);

        const createData = await createResponse.json();
        if (!createData.data) throw new Error('No session data received');

        sessionInfoRef.current = createData.data;
        setStatus('Session created. Starting stream...');

        // Step 2: Start streaming
        const startResponse = await fetch(`${API_CONFIG.serverUrl}/v1/streaming.start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_CONFIG.token}`
            },
            body: JSON.stringify({
                session_id: sessionInfoRef.current.session_id
            })
        });

        if (!startResponse.ok) throw new Error(`Failed to start stream: ${startResponse.status}`);

        setStatus('Connecting to LiveKit...');

        // Step 3: Connect to LiveKit room
        const Room = window.LivekitClient.Room;
        const RoomEvent = window.LivekitClient.RoomEvent;
        const Track = window.LivekitClient.Track;

        roomRef.current = new Room({
            adaptiveStream: true,
            dynacast: true
        });

        roomRef.current.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === Track.Kind.Video) {
                track.attach(videoRef.current);
                setStatus('Avatar ready');
                setIsSessionActive(true);
            } else if (track.kind === Track.Kind.Audio) {
                track.attach(); // Attaches to a new audio element automatically
            }
        });

        roomRef.current.on(RoomEvent.Disconnected, () => {
            setStatus('Disconnected');
            setIsSessionActive(false);
        });

        await roomRef.current.connect(sessionInfoRef.current.url, sessionInfoRef.current.access_token);
        
    } catch (error) {
        console.error('Error creating session:', error);
        setStatus(`Error: ${error.message}`);
        setIsSessionActive(false);
    } finally {
        setIsLoading(false);
    }
  };

  // CHANGE: Logic ported from closeSession()
  const closeSession = async () => {
    try {
        if (sessionInfoRef.current) {
            await fetch(`${API_CONFIG.serverUrl}/v1/streaming.stop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_CONFIG.token}`
                },
                body: JSON.stringify({
                    session_id: sessionInfoRef.current.session_id
                })
            });
        }

        if (roomRef.current) {
            roomRef.current.disconnect();
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        sessionInfoRef.current = null;
        roomRef.current = null;
        setIsSessionActive(false);
        setStatus('Session ended');

    } catch (error) {
        console.error('Error closing session:', error);
    }
  };

  // CHANGE: Logic ported from sendText()
  const sendTextToAvatar = async (text) => {
    if (!text || !sessionInfoRef.current) return;

    try {
        setStatus('Avatar speaking...');
        const response = await fetch(`${API_CONFIG.serverUrl}/v1/streaming.task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_CONFIG.token}`
            },
            body: JSON.stringify({
                session_id: sessionInfoRef.current.session_id,
                text: text,
                task_type: "repeat"
            })
        });

        if (!response.ok) throw new Error(`Failed to send text: ${response.status}`);
        
        // Reset status after a delay
        setTimeout(() => {
            if (isSessionActive) setStatus('Avatar ready');
        }, 2000);

    } catch (error) {
        console.error('Error sending text:', error);
        setStatus('Error speaking');
    }
  };

  return (
    <div className="p-4 pb-2">
      <Card className="h-64 relative overflow-hidden flex flex-col items-center justify-center bg-black">
        
        {/* CHANGE: Video Element for Avatar */}
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`absolute inset-0 w-full h-full object-cover ${!isSessionActive ? 'hidden' : ''}`}
        />

        {/* CHANGE: Placeholder/Status Overlay */}
        {!isSessionActive && (
            <div className="z-10 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <GraduationCap size={32} className="text-tubes-accent" />
                </div>
                <h3 className="text-white font-semibold">AI Teacher</h3>
                <p className="text-sm text-tubes-muted mt-2 mb-4">{status}</p>
                
                <Button 
                    onClick={createSession} 
                    disabled={isLoading}
                    variant="primary"
                    size="sm"
                >
                    {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Connecting...</>
                    ) : (
                        <><Power size={16} /> Start Session</>
                    )}
                </Button>
            </div>
        )}

        {/* CHANGE: Status indicator when active */}
        {isSessionActive && (
             <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
                <span className="bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-xs text-white border border-white/10">
                    {status}
                </span>
                <Button 
                    onClick={closeSession} 
                    variant="secondary"
                    size="sm"
                    className="!py-1 !px-2 !text-xs bg-red-500/20 hover:bg-red-500/40 border-red-500/50 text-red-200"
                >
                    Stop
                </Button>
            </div>
        )}

      </Card>
    </div>
  );
};

export default AvatarPanel;