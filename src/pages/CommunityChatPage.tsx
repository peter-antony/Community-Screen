import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCommunication } from '../context/CommunicationContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';
import {
  Send,
  Smile,
  Paperclip,
  Users,
  Compass,
  Sparkles
} from 'lucide-react';
import './CommunityChatPage.css';

export const CommunityChatPage: React.FC = () => {
  const { user } = useAuth();
  const {
    communities = [],
    messages = [],
    sendGroupMessage,
    isTyping
  } = useCommunication();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const communityIdFromUrl = searchParams.get('id') || searchParams.get('communityId');

  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const communityList = communities || [];

  // Sync active community with URL parameter
  useEffect(() => {
    if (communityIdFromUrl && communityList.some((c) => c.id === communityIdFromUrl)) {
      setActiveCommunityId(communityIdFromUrl);
    } else if (!activeCommunityId && communityList.length > 0) {
      setActiveCommunityId(communityList[0].id);
    }
  }, [communityIdFromUrl, communityList]);

  const handleSelectCommunity = (commId: string) => {
    setActiveCommunityId(commId);
    navigate(`/community-chat?id=${commId}`, { replace: true });
  };

  const activeCommunity = communityList.find((c) => c.id === activeCommunityId);

  // Filter messages for active community group chat
  const groupMessages = (messages || []).filter(
    (m: Message) => Boolean(m.isGroup) && (m.communityId === activeCommunityId || m.receiverId === activeCommunityId)
  );

  // Auto-scroll chat history to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [groupMessages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeCommunityId) return;

    if (sendGroupMessage) {
      sendGroupMessage(activeCommunityId, inputText.trim());
    }
    setInputText('');
  };

  return (
    <div className="community-chat-page glass-panel">
      {/* Community Channels Left Panel */}
      <div className="community-chat-sidebar">
        <div className="community-sidebar-header">
          <h3>
            <Users size={18} className="text-cyan" />
            <span>Community Chat</span>
          </h3>
          <span className="community-channel-count">{communityList.length} groups</span>
        </div>

        <div className="community-channels-list">
          {communityList.map((comm) => {
            const isActive = comm.id === activeCommunityId;
            const commMsgs = (messages || []).filter(
              (m: Message) => Boolean(m.isGroup) && (m.communityId === comm.id || m.receiverId === comm.id)
            );
            const lastMsg = commMsgs[commMsgs.length - 1];
            const senderPrefix = lastMsg?.senderName ? `${lastMsg.senderName.split(' ')[0]}: ` : '';

            return (
              <div
                key={comm.id}
                className={`community-channel-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectCommunity(comm.id)}
              >
                <div className="community-avatar-wrapper">
                  <img src={comm.image} alt={comm.name} className="community-avatar" />
                  <span className="community-badge-tag">👥</span>
                </div>

                <div className="community-channel-details">
                  <div className="community-channel-header-row">
                    <span className="community-channel-name">#{comm.name}</span>
                    <span className="community-channel-time">{lastMsg ? lastMsg.timestamp : ''}</span>
                  </div>
                  <div className="community-channel-sub">
                    <span className="community-channel-snippet">
                      {lastMsg
                        ? `${senderPrefix}${lastMsg.content}`
                        : `${(comm.theme || 'COMMUNITY').toUpperCase()} Channel`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Group Chat Viewport */}
      {activeCommunity ? (
        <div className="community-chat-viewport">
          {/* Header Bar */}
          <div className="community-chat-header-bar">
            <div
              className="community-header-info"
              onClick={() => navigate(`/community-details/${activeCommunity.id}`)}
            >
              <img src={activeCommunity.image} alt={activeCommunity.name} className="community-header-avatar" />
              <div className="community-header-text">
                <div className="community-header-title-row">
                  <span className="community-header-name">#{activeCommunity.name}</span>
                  <span className="community-theme-pill">{activeCommunity.theme}</span>
                </div>
                <span className="community-header-sub">
                  <Users size={12} /> {activeCommunity.attendees?.length || 1} Active Members
                </span>
              </div>
            </div>

            <div className="community-header-actions">
              <button
                className="btn-icon btn-icon-cyan"
                onClick={() => navigate(`/community-details/${activeCommunity.id}`)}
                title="View Community Details"
              >
                <Compass size={16} />
              </button>
            </div>
          </div>

          {/* Group Messages History */}
          <div className="community-chat-messages-container" ref={chatScrollRef}>
            <div className="community-security-notice">
              <Users size={14} className="text-cyan" />
              <span>OFFICIAL COMMUNITY GROUP CHAT • ALL MEMBERS CAN POST MESSAGES</span>
            </div>

            {groupMessages.length > 0 ? (
              groupMessages.map((msg: Message) => {
                const isMe = msg.senderId === 'current_user_1';
                const avatar = isMe
                  ? user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                  : msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                const senderName = isMe ? 'You' : msg.senderName || 'Community Member';

                return (
                  <div key={msg.id} className={`group-message-wrapper ${isMe ? 'outgoing' : 'incoming'}`}>
                    {!isMe && <img src={avatar} alt={senderName} className="group-message-avatar" />}
                    <div className="group-message-body">
                      {!isMe && <span className="group-message-sender-name">{senderName}</span>}
                      <div className="group-message-content">
                        <p>{msg.content}</p>
                      </div>
                      <span className="group-message-time">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="community-chat-empty-state">
                <Sparkles size={36} className="text-cyan mb-2" />
                <h3>Welcome to #{activeCommunity.name}!</h3>
                <p>Be the first member to start the conversation in this group channel.</p>
              </div>
            )}

            {isTyping && (
              <div className="group-message-wrapper incoming">
                <div className="group-message-body">
                  <span className="group-message-sender-name">Member is typing...</span>
                  <div className="group-message-content community-typing-box">
                    <span className="typing-dot" />
                    <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group Input Composer */}
          <form className="community-chat-input-bar" onSubmit={handleSend}>
            <button type="button" className="btn-icon" title="Add Attachment">
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              className="community-chat-input"
              placeholder={`Send message to #${activeCommunity.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              type="submit"
              className="community-send-btn"
              disabled={!inputText.trim()}
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <div className="community-chat-empty-state">
          <Compass size={48} className="text-cyan mb-2" />
          <h3>No Community Group Selected</h3>
          <p>Choose a community channel on the left to join group discussions.</p>
        </div>
      )}
    </div>
  );
};
