import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCommunication } from '../context/CommunicationContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';
import {
  Send,
  Paperclip,
  Users,
  Compass,
  Sparkles,
  ArrowLeft,
  Search,
  MessageSquare,
  ChevronRight,
  MessageCircle,
  MessageCircleMore
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
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const communityList = communities || [];

  // Sync active community with URL parameter & screen width (Mobile 2-step vs Desktop split view)
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;

    if (communityIdFromUrl && communityList.some((c) => c.id === communityIdFromUrl)) {
      setActiveCommunityId(communityIdFromUrl);
    } else if (isDesktop && communityList.length > 0) {
      // Desktop: default select first community
      setActiveCommunityId(communityList[0].id);
    } else {
      // Mobile: start at Step 1 (All Communities List)
      setActiveCommunityId(null);
    }
  }, [communityIdFromUrl, communityList]);

  // Filtered community channels for search bar
  const filteredCommunities = communityList.filter((comm) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      comm.name.toLowerCase().includes(q) ||
      (comm.theme && comm.theme.toLowerCase().includes(q))
    );
  });

  const handleSelectCommunity = (commId: string) => {
    setActiveCommunityId(commId);
    navigate(`/community-chat?id=${commId}`, { replace: true });
  };

  const handleBackToList = () => {
    setActiveCommunityId(null);
    navigate('/community-chat', { replace: true });
  };

  const activeCommunity = communityList.find((c) => c.id === activeCommunityId);

  // Filter messages for active community group chat
  const groupMessages = (messages || []).filter(
    (m: Message) => Boolean(m.isGroup) && (m.communityId === activeCommunityId || m.receiverId === activeCommunityId)
  );

  // Auto-scroll chat history to bottom
  useEffect(() => {
    if (chatScrollRef.current && activeCommunityId) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [groupMessages, isTyping, activeCommunityId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeCommunityId) return;

    if (sendGroupMessage) {
      sendGroupMessage(activeCommunityId, inputText.trim());
    }
    setInputText('');
  };

  return (
    <div className="community-chat-container">
      {/* Top Banner Header */}
      <div className="community-page-header">
        <div className="community-header-title-block">
          <div className="community-title-row">
            {/* <MessageCircleMore size={24} className="text-cyan" /> */}
            <h1>Messages</h1>
          </div>
          <span className="community-channel-count-badge">{communityList.length} Communities</span>
        </div>
      </div>

      <div className={`community-chat-page glass-panel ${activeCommunityId ? 'has-active-chat' : 'show-list-only'}`}>

        {/* ══════════════ STEP 1: All Communities List (Mobile Step 1 & Desktop Left Panel) ══════════════ */}
        <div className="community-chat-sidebar">
          {/* Sidebar Search Bar */}
          <div className="community-sidebar-top">
            <div className="community-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>

          {/* Communities List */}
          <div className="community-channels-list">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((comm) => {
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
                        {lastMsg && <span className="community-channel-time">{lastMsg.timestamp}</span>}
                      </div>
                      <div className="community-channel-sub">
                        <span className="community-channel-snippet">
                          {lastMsg
                            ? `${senderPrefix}${lastMsg.content}`
                            : `${(comm.theme || 'COMMUNITY').toUpperCase()} Channel`}
                        </span>
                        <span className="community-theme-tag">{comm.theme}</span>
                      </div>
                    </div>

                    <ChevronRight size={16} className="community-item-chevron" />
                  </div>
                );
              })
            ) : (
              <div className="community-no-results">
                <Search size={28} className="text-muted mb-2" />
                <p>No communities matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════ STEP 2: Selected Community Chat Room (Mobile Step 2 & Desktop Right Viewport) ══════════════ */}
        {activeCommunity ? (
          <div className="community-chat-viewport">
            {/* Header Bar with Mobile Back Button */}
            <div className="community-chat-header-bar">
              <div className="community-header-left">
                {/* 👈 BACK BUTTON (Active on Mobile to return to Step 1 List) */}
                <button
                  className="community-back-btn"
                  onClick={handleBackToList}
                  title="Back to Communities List"
                >
                  <ArrowLeft size={18} />
                  {/* <span className="back-btn-text">Back</span> */}
                </button>

                <div
                  className="community-header-info"
                  onClick={() => navigate(`/community-details/${activeCommunity.id}`)}
                >
                  <img src={activeCommunity.image} alt={activeCommunity.name} className="community-header-avatar" />
                  <div className="community-header-text">
                    <div className="community-header-title-row">
                      <span className="community-header-name">#{activeCommunity.name}</span>
                      {/* <span className="community-theme-pill">{activeCommunity.theme}</span> */}
                    </div>
                    <span className="community-header-sub">
                      <Users size={12} /> {activeCommunity.attendees?.length || 1} Active Members
                    </span>
                  </div>
                </div>
              </div>

              {/* <div className="community-header-actions">
                <button
                  className="btn-icon btn-icon-cyan"
                  onClick={() => navigate(`/community-details/${activeCommunity.id}`)}
                  title="View Community Details"
                >
                  <Compass size={16} />
                </button>
              </div> */}
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
          /* Desktop Welcome Screen when no community selected */
          <div className="community-chat-welcome-state">
            <div className="welcome-content-card">
              <div className="welcome-icon-box">
                <MessageSquare size={44} className="text-cyan" />
              </div>
              <h2>Select a Community Chat</h2>
              <p>Choose a community from the list on the left to view group conversations and chat with members.</p>

              <div className="quick-community-launch-grid">
                {communityList.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    className="quick-community-pill"
                    onClick={() => handleSelectCommunity(c.id)}
                  >
                    <img src={c.image} alt={c.name} />
                    <span>#{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
