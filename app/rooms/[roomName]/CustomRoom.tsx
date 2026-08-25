'use client';

import React, { useState, useRef } from 'react';
import {
  useTracks,
  useLocalParticipant,
  useRemoteParticipants,
  DisconnectButton,
  TrackToggle,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '../../../styles/custom-room.css';
import { CustomChat } from './CustomChat';
import Draggable from 'react-draggable';

export function CustomRoom() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const localPipRef = useRef(null);
  const localScreenSharePipRef = useRef(null);
  const remotePipRef = useRef(null);
  
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  
  // Get camera and screen share tracks
  const cameraTracks = useTracks([Track.Source.Camera]);
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  
  // Find tracks
  const remoteVideoTrack = cameraTracks.find((t) => t.participant.identity !== localParticipant.identity);
  const localVideoTrack = cameraTracks.find((t) => t.participant.identity === localParticipant.identity);
  
  const remoteScreenShareTrack = screenShareTracks.find((t) => t.participant.identity !== localParticipant.identity);
  const localScreenShareTrack = screenShareTracks.find((t) => t.participant.identity === localParticipant.identity);
  const primaryRemoteTrack = remoteScreenShareTrack || remoteVideoTrack;

  return (
    <div className="custom-room-container">
      {/* 1. Remote Participant Fullscreen Background */}
      {remoteParticipants.length > 0 ? (
        <div className="remote-participant-fullscreen">
          {primaryRemoteTrack?.publication?.track ? (
            <video 
              key={primaryRemoteTrack.publication.trackSid}
              ref={(el) => {
                if (el) primaryRemoteTrack.publication?.track?.attach(el);
              }} 
              autoPlay 
              playsInline
            />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', marginBottom: '16px' }}>
                {(remoteParticipants[0].name || remoteParticipants[0].identity || '?')[0].toUpperCase()}
              </div>
              <div style={{ color: 'white', fontSize: '1.2rem' }}>
                {remoteParticipants[0].name || remoteParticipants[0].identity}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.5)' }}>
          Waiting for the other person to join...
        </div>
      )}

      {/* 2. Local Participant Floating PiP */}
      {localVideoTrack?.publication?.track && (
        <Draggable bounds="parent" nodeRef={localPipRef}>
          <div ref={localPipRef} className="local-participant-pip" style={{ cursor: 'move' }}>
            <video 
              ref={(el) => {
                if (el) localVideoTrack.publication?.track?.attach(el);
              }} 
              autoPlay 
              playsInline 
              muted 
            />
          </div>
        </Draggable>
      )}

      {/* 2.25. Local Screen Share Preview PiP */}
      {localScreenShareTrack?.publication?.track && (
        <Draggable bounds="parent" nodeRef={localScreenSharePipRef}>
          <div ref={localScreenSharePipRef} className="local-screenshare-pip" style={{ cursor: 'move', position: 'absolute', top: '20px', left: '20px', width: '240px', height: '135px', borderRadius: '12px', overflow: 'hidden', zIndex: 10, border: '2px solid rgba(0, 255, 0, 0.4)', background: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            <div style={{ position: 'absolute', top: '4px', left: '8px', zIndex: 11, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#0f0' }}>Bạn đang chia sẻ</div>
            <video 
              key={localScreenShareTrack.publication.trackSid}
              ref={(el) => {
                if (el) localScreenShareTrack.publication?.track?.attach(el);
              }} 
              autoPlay 
              playsInline 
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </Draggable>
      )}

      {/* 2.5. Remote Participant Camera PiP (shows if they are sharing screen) */}
      {remoteScreenShareTrack?.publication?.track && remoteVideoTrack?.publication?.track && (
        <Draggable bounds="parent" nodeRef={remotePipRef}>
          <div ref={remotePipRef} className="remote-participant-pip" style={{ cursor: 'move', position: 'absolute', top: '280px', right: '20px', width: '180px', height: '240px', borderRadius: '16px', overflow: 'hidden', zIndex: 10, border: '1px solid rgba(255,255,255,0.2)', background: '#000' }}>
            <video 
              key={remoteVideoTrack.publication.trackSid}
              ref={(el) => {
                if (el) remoteVideoTrack.publication?.track?.attach(el);
              }} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </Draggable>
      )}

      {/* 3. Glassmorphism Control Bar */}
      <div className="custom-control-bar">
        <TrackToggle source={Track.Source.Microphone} />
        <TrackToggle source={Track.Source.Camera} />
        <TrackToggle source={Track.Source.ScreenShare} />
        
        <button className="lk-button custom-chat-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        
        <DisconnectButton className="lk-disconnect-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
            <line x1="23" y1="1" x2="1" y2="23"></line>
          </svg>
        </DisconnectButton>
      </div>

      {/* 4. Chat Overlay */}
      <div className={`custom-chat-overlay ${isChatOpen ? 'open' : ''}`}>
        <div className="custom-chat-header">
          <span>Tin nhắn</span>
          <button className="close-chat-btn" onClick={() => setIsChatOpen(false)}>×</button>
        </div>
        <CustomChat />
      </div>
    </div>
  );
}
