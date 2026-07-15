import React, { useState, useEffect } from 'react';
import { useCommunication } from '../context/CommunicationContext';
import { 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Network,
  Clock
} from 'lucide-react';
import './CallPage.css';

export const CallPage: React.FC = () => {
  const { callState, endCall, startCall, users } = useCommunication();
  
  const [micMuted, setMicMuted] = useState(false);
  const [camMuted, setCamMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // Audio wave height bars simulation
  const [waveHeights, setWaveHeights] = useState<number[]>(new Array(16).fill(10));

  useEffect(() => {
    let waveInterval: any;
    if (callState.status === 'connected' && !micMuted) {
      waveInterval = setInterval(() => {
        setWaveHeights(
          new Array(16).fill(0).map(() => Math.floor(10 + Math.random() * 60))
        );
      }, 120);
    } else {
      setWaveHeights(new Array(16).fill(8));
    }

    return () => {
      if (waveInterval) clearInterval(waveInterval);
    };
  }, [callState.status, micMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLaunchCall = (user: any, type: 'audio' | 'video') => {
    startCall(user, type);
  };

  const activeOnlineUsers = users.filter(u => u.status === 'online');

  return (
    <div className="call-page-container">
      {callState.status === 'idle' ? (
        /* Call Panel Idle Console */
        <div className="call-idle-dashboard glass-panel">
          <div className="idle-glow-bg" />
          <div className="idle-header">
            <Network size={36} className="text-cyan" />
            <h3>Unified Communication Center</h3>
            <p>Select a digital pioneer node to establish a high-fidelity connection stream.</p>
          </div>

          <div className="active-nodes-list">
            <h4>Available Pioneers ({activeOnlineUsers.length})</h4>
            {activeOnlineUsers.map((pioneer) => (
              <div key={pioneer.id} className="call-node-item glass-panel">
                <div className="node-info">
                  <img src={pioneer.avatar} alt={pioneer.name} className="node-avatar" />
                  <div>
                    <span className="node-name">{pioneer.name}</span>
                    <span className="node-role">{pioneer.role}</span>
                  </div>
                </div>

                <div className="node-call-actions">
                  <button 
                    className="btn btn-cyan btn-sm"
                    onClick={() => handleLaunchCall(pioneer, 'audio')}
                  >
                    <Phone size={14} />
                    <span>Audio Link</span>
                  </button>
                  <button 
                    className="btn btn-violet btn-sm"
                    onClick={() => handleLaunchCall(pioneer, 'video')}
                  >
                    <Video size={14} />
                    <span>Video stream</span>
                  </button>
                </div>
              </div>
            ))}

            {activeOnlineUsers.length === 0 && (
              <p className="no-nodes text-muted">All pioneer channels are currently offline.</p>
            )}
          </div>
        </div>
      ) : (
        /* Active Call Window */
        <div className="active-call-workspace glass-panel">
          <div className="call-hud-header">
            <div className="call-hud-info">
              <span className="hud-status">
                {callState.status === 'calling' ? (
                  <span className="text-cyan animate-pulse">CONNECTING OVERLAY LINK...</span>
                ) : (
                  <span className="text-green">CONNECTION SECURED</span>
                )}
              </span>
              <h3>{callState.currentCall?.name}</h3>
              <span className="hud-role">{callState.currentCall?.role}</span>
            </div>

            <div className="call-timer-box">
              <Clock size={14} className="text-cyan" />
              <span>{formatTime(callState.callDuration)}</span>
            </div>
          </div>

          {/* Call Feed Window */}
          <div className="call-feeds-viewport">
            {callState.type === 'video' ? (
              /* Video Stream viewports */
              <div className="video-viewport-layout">
                {camMuted ? (
                  <div className="remote-camera-placeholder">
                    <img 
                      src={callState.currentCall?.avatar} 
                      alt={callState.currentCall?.name} 
                      className="placeholder-avatar" 
                    />
                    <span>Stream Muted</span>
                  </div>
                ) : (
                  /* Animated gradient video simulation */
                  <div className="video-stream-simulator">
                    <div className="moving-gradient-orb" />
                    <img 
                      src={callState.currentCall?.avatar} 
                      alt={callState.currentCall?.name} 
                      className="video-overlay-avatar" 
                    />
                    <span className="live-pill">REMOTE PORTAL</span>
                  </div>
                )}

                {/* Self Camera Picture-in-Picture */}
                <div className="self-pip-window glass-panel">
                  <div className="pip-video-simulator">
                    <span>Alex (You)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Audio call waveform viewports */
              <div className="audio-viewport-layout">
                <div className="audio-avatar-glow">
                  <div className="avatar-pulse-circle ring1" />
                  <div className="avatar-pulse-circle ring2" />
                  <img 
                    src={callState.currentCall?.avatar} 
                    alt={callState.currentCall?.name} 
                    className="audio-avatar" 
                  />
                </div>

                {/* Animated Waveform soundbars */}
                <div className="audio-soundbar-waves">
                  {waveHeights.map((h, i) => (
                    <div 
                      key={i} 
                      className="soundwave-bar" 
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons footer bar */}
          <div className="call-controls-footer">
            <button 
              className={`btn-icon ${micMuted ? 'btn-icon-rose active' : ''}`}
              onClick={() => setMicMuted(!micMuted)}
              title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button 
              className={`btn-icon ${camMuted ? 'btn-icon-rose active' : ''}`}
              onClick={() => setCamMuted(!camMuted)}
              title={camMuted ? 'Turn Camera On' : 'Turn Camera Off'}
              disabled={callState.type === 'audio'}
            >
              {camMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button 
              className={`btn-icon ${speakerMuted ? 'btn-icon-rose active' : ''}`}
              onClick={() => setSpeakerMuted(!speakerMuted)}
              title={speakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            >
              {speakerMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <button 
              className={`btn-icon ${isSharingScreen ? 'btn-icon-cyan active' : ''}`}
              onClick={() => setIsSharingScreen(!isSharingScreen)}
              title={isSharingScreen ? 'Stop Screen Share' : 'Share Screen'}
              disabled={callState.status !== 'connected'}
            >
              <Monitor size={20} />
            </button>

            <div className="button-spacer" />

            <button 
              className="decline-call-btn btn-hangup"
              onClick={endCall}
              title="Hang Up"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
