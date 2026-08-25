'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat, useLocalParticipant } from '@livekit/components-react';

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export function CustomChat() {
  const { send, chatMessages, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [inputValue, setInputValue] = useState('');
  const [replyTo, setReplyTo] = useState<{name: string, text: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = useRef(chatMessages.length);

  // Auto scroll and sound notification
  useEffect(() => {
    if (chatMessages.length > prevMessagesLengthRef.current) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.from?.identity !== localParticipant.identity) {
        playNotificationSound();
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = chatMessages.length;
  }, [chatMessages, localParticipant.identity]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let finalMessage = inputValue;
    if (replyTo) {
      finalMessage = `> Trả lời ${replyTo.name}: "${replyTo.text}"\n\n${inputValue}`;
    }

    send(finalMessage);
    setInputValue('');
    setReplyTo(null);
    
    // Giữ focus lại cho ô input sau khi gửi
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleReplyClick = (name: string, actualMessage: string) => {
    const shortMsg = actualMessage.length > 50 ? actualMessage.substring(0, 50) + '...' : actualMessage;
    setReplyTo({ name, text: shortMsg });
  };

  return (
    <div className="custom-chat-wrapper">
      <div className="custom-chat-messages-container">
        {chatMessages.map((msg) => {
          const isLocal = msg.from?.identity === localParticipant.identity;
          
          const isReply = msg.message.startsWith('> Trả lời ');
          let replyText = '';
          let replyToName = '';
          let actualMessage = msg.message;
          
          if (isReply) {
            const match = msg.message.match(/^> Trả lời (.*?): "(.*)"\n\n([\s\S]*)$/);
            if (match) {
              replyToName = match[1];
              replyText = match[2];
              actualMessage = match[3];
            }
          }

          const senderName = msg.from?.name || msg.from?.identity || 'Ai đó';

          return (
            <div key={msg.id} className={`custom-chat-bubble-wrapper ${isLocal ? 'local' : 'remote'}`}>
              {!isLocal && (
                <button className="bubble-reply-btn outside" onClick={() => handleReplyClick(senderName, actualMessage)}>
                  Trả lời
                </button>
              )}
              <div className="custom-chat-bubble">
                <div className="bubble-header">
                  <span className="bubble-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                {replyText && (
                  <div className="bubble-reply-quote">
                    Bạn đã trả lời {replyToName}
                  </div>
                )}
                
                <div className="bubble-content">{actualMessage}</div>
              </div>
              {isLocal && (
                <button className="bubble-reply-btn outside" onClick={() => handleReplyClick(senderName, actualMessage)}>
                  Trả lời
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="custom-chat-input-area">
        {replyTo && (
          <div className="replying-to-indicator">
            <div className="replying-text">
              <small>Đang trả lời {replyTo.name}:</small>
              <div>{replyTo.text}</div>
            </div>
            <button className="cancel-reply-btn" onClick={() => setReplyTo(null)}>×</button>
          </div>
        )}
        <form onSubmit={handleSend} className="custom-chat-form">
          <input
            ref={inputRef}
            className="custom-chat-input"
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className="custom-chat-send-btn" disabled={!inputValue.trim()}>
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
