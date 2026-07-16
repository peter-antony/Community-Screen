import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunication } from '../context/CommunicationContext';
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  User,
  ShieldCheck
} from 'lucide-react';
import './ChatPage.css';

export const ChatPage: React.FC = () => {
  const {
    users,
    messages,
    activeChatUserId,
    isTyping,
    sendMessage,
    setActiveChatUserId,
    startCall
  } = useCommunication();

  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Filter out the active chatting contacts list
  const activeContacts = users;

  // Set default active chat user if none is selected
  useEffect(() => {
    if (!activeChatUserId && activeContacts.length > 0) {
      setActiveChatUserId(activeContacts[0].id);
    }
  }, [activeChatUserId, activeContacts, setActiveChatUserId]);

  const activeContact = users.find(u => u.id === activeChatUserId);

  // Get conversation history for active contact
  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === 'current_user_1' && m.receiverId === activeChatUserId) ||
      (m.senderId === activeChatUserId && m.receiverId === 'current_user_1')
  );

  // Auto-scroll chat history
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversationMessages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleCall = (type: 'audio' | 'video') => {
    if (!activeContact) return;
    startCall(activeContact, type);
    navigate('/call');
  };

  return (
    <div className="chat-page glass-panel">
      {/* Contacts Left Panel */}
      <div className="contacts-sidebar">
        <div className="sidebar-search-container">
          <h3>Active Channels</h3>
          <span className="channel-count">{activeContacts.length} nodes</span>
        </div>

        <div className="contacts-list">
          {activeContacts.map((contact) => {
            const isActive = contact.id === activeChatUserId;
            // Get last message snippet
            const contactMsgs = messages.filter(
              (m) =>
                (m.senderId === 'current_user_1' && m.receiverId === contact.id) ||
                (m.senderId === contact.id && m.receiverId === 'current_user_1')
            );
            const lastMsg = contactMsgs[contactMsgs.length - 1];

            // Check unread messages
            const unreadCount = messages.filter(
              (m) => m.senderId === contact.id && m.receiverId === 'current_user_1' && !m.isRead
            ).length;

            return (
              <div
                key={contact.id}
                className={`contact-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveChatUserId(contact.id)}
              >
                <div className="contact-avatar-wrapper">
                  <img src={contact.avatar} alt={contact.name} className="contact-avatar" />
                  <span className={`contact-status-ring ${contact.status}`} />
                </div>
                <div className="contact-details">
                  <div className="contact-header-row">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-time">{lastMsg ? lastMsg.timestamp : ''}</span>
                  </div>
                  <div className="contact-sub-row">
                    <span className="contact-snippet">
                      {lastMsg ? lastMsg.content : contact.role}
                    </span>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Pane */}
      {activeContact ? (
        <div className="chat-viewport">
          {/* Chat Header */}
          <div className="chat-header-bar">
            <div className="chat-header-user" onClick={() => navigate(`/profile/${activeContact.id}`)}>
              <img src={activeContact.avatar} alt={activeContact.name} className="header-avatar" />
              <div>
                <span className="header-name">{activeContact.name}</span>
                {/* <span className="header-sub">
                  {activeContact.status === 'online' ? (
                    <span className="text-cyan font-bold">● CONNECTED</span>
                  ) : (
                    <span>● DISCONNECTED</span>
                  )}
                  <span className="header-role"> — {activeContact.role}</span>
                </span> */}
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                className="btn-icon btn-icon-cyan"
                onClick={() => handleCall('audio')}
                disabled={activeContact.status === 'offline'}
                title="Establish Audio Link"
              >
                <Phone size={16} />
              </button>
              <button
                className="btn-icon btn-icon-violet"
                onClick={() => handleCall('video')}
                disabled={activeContact.status === 'offline'}
                title="Initiate Video Feed"
              >
                <Video size={16} />
              </button>
              <button className="btn-icon" onClick={() => navigate(`/profile/${activeContact.id}`)} title="View Identity">
                <User size={16} />
              </button>
            </div>
          </div>

          {/* Conversation history area */}
          <div className="chat-messages-container" ref={chatScrollRef}>
            <div className="security-notice">
              <ShieldCheck size={14} className="text-cyan" />
              <span>END-TO-END QUANTUM ENCRYPTION PROTOCOL SHIELDED</span>
            </div>

            {conversationMessages.map((msg) => {
              const isMe = msg.senderId === 'current_user_1';

              if (msg.type === 'call_log') {
                return (
                  <div key={msg.id} className="call-log-message">
                    <span>{msg.content}</span>
                    <span className="call-log-time">{msg.timestamp}</span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`message-bubble-wrapper ${isMe ? 'outgoing' : 'incoming'}`}>
                  {!isMe && (
                    <img src={activeContact.avatar} alt={activeContact.name} className="message-avatar" />
                  )}
                  <div className="message-body">
                    <div className="message-content">
                      <p>{msg.content}</p>
                    </div>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {/* Bouncing Typing Animation */}
            {isTyping && (
              <div className="message-bubble-wrapper incoming">
                <img src={activeContact.avatar} alt={activeContact.name} className="message-avatar" />
                <div className="message-body">
                  <div className="message-content typing-box">
                    <span className="typing-dot" />
                    <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messaging Input Area */}
          <form className="chat-input-bar" onSubmit={handleSend}>
            <button type="button" className="input-bar-btn" title="Add Media">
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              className="chat-composer-input"
              placeholder={`Send encrypted message to ${activeContact.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button type="button" className="input-bar-btn" title="Emojis">
              <Smile size={18} />
            </button>

            <button type="submit" className="composer-send-btn" disabled={!inputText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-empty-state">
          <h3>No channel open</h3>
          <p>Select a digital pioneer on the left to initialize quantum transmission channels.</p>
        </div>
      )}
    </div>
  );
};
