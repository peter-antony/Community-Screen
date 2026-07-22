import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { User, Message, CallState } from '../types';
import { mockMessages as initialMessages, botResponses } from '../services/mockData';
import { supabase } from '../supabaseClient';

interface CommunicationContextType {
  users: User[];
  messages: Message[];
  callState: CallState;
  activeChatUserId: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  startCall: (user: User, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  endCall: () => void;
  toggleFollow: (userId: string) => void;
  setActiveChatUserId: (userId: string | null) => void;
  triggerIncomingCall: (user: User, type: 'audio' | 'video') => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('community_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [callState, setCallState] = useState<CallState>({
    currentCall: null,
    status: 'idle',
    type: 'video',
    callDuration: 0,
  });

  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const callTimerRef = useRef<any>(null);
  const botReplyTimerRef = useRef<any>(null);
  const botTypingTimerRef = useRef<any>(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*')
    if (error) return console.error(error)

    const mapped = data.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      location: u.location,
      bio: u.bio,
      avatar: u.avatar,
      coverImage: u.cover_image,
      status: u.status,
      followersCount: u.followers_count,
      followingCount: u.following_count,
      skills: u.skills,
      isFollowing: u.is_following,
    }))

    setUsers(mapped)
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sync users to LocalStorage
  // useEffect(() => {
  //   localStorage.setItem('community_users', JSON.stringify(users));
  // }, [users]);

  // Sync messages to LocalStorage
  useEffect(() => {
    localStorage.setItem('community_messages', JSON.stringify(messages));
  }, [messages]);

  // Call duration counter
  useEffect(() => {
    if (callState.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallState((prev) => ({
          ...prev,
          callDuration: prev.callDuration + 1,
        }));
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState.status]);

  // Cleanup bot timers on unmount
  useEffect(() => {
    return () => {
      if (botReplyTimerRef.current) clearTimeout(botReplyTimerRef.current);
      if (botTypingTimerRef.current) clearTimeout(botTypingTimerRef.current);
    };
  }, []);

  const toggleFollow = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const nextFollowing = !u.isFollowing;
          return {
            ...u,
            isFollowing: nextFollowing,
            followersCount: nextFollowing ? u.followersCount + 1 : u.followersCount - 1,
          };
        }
        return u;
      })
    );
  };

  const sendMessage = (content: string) => {
    if (!activeChatUserId) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user_1',
      receiverId: activeChatUserId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      type: 'text',
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulate Bot typing and response
    if (botReplyTimerRef.current) clearTimeout(botReplyTimerRef.current);
    if (botTypingTimerRef.current) clearTimeout(botTypingTimerRef.current);

    botTypingTimerRef.current = setTimeout(() => {
      setIsTyping(true);

      botReplyTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        const responses = botResponses[activeChatUserId] || botResponses.default;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const botMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          senderId: activeChatUserId,
          receiverId: 'current_user_1',
          content: randomResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'text',
        };

        setMessages((prev) => [...prev, botMsg]);
      }, 1500); // typing duration
    }, 1000); // delay before typing starts
  };

  const startCall = (user: User, type: 'audio' | 'video') => {
    setCallState({
      currentCall: user,
      status: 'calling',
      type,
      callDuration: 0,
    });

    // Simulate answer after 3 seconds
    setTimeout(() => {
      setCallState((prev) => {
        if (prev.status === 'calling' && prev.currentCall?.id === user.id) {
          return { ...prev, status: 'connected' };
        }
        return prev;
      });
    }, 3000);
  };

  const triggerIncomingCall = (user: User, type: 'audio' | 'video') => {
    setCallState({
      currentCall: user,
      status: 'incoming',
      type,
      callDuration: 0,
    });
  };

  const acceptCall = () => {
    setCallState((prev) => {
      if (prev.status === 'incoming') {
        return { ...prev, status: 'connected' };
      }
      return prev;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const endCall = () => {
    setCallState((prev) => {
      if (prev.currentCall) {
        // Append a call log message to chat history
        const logMsg: Message = {
          id: `msg_call_log_${Date.now()}`,
          senderId: prev.status === 'incoming' ? prev.currentCall.id : 'current_user_1',
          receiverId: prev.status === 'incoming' ? 'current_user_1' : prev.currentCall.id,
          content: `${prev.type === 'video' ? 'Video call' : 'Voice call'} ended. Duration: ${formatDuration(prev.callDuration)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
          type: 'call_log',
        };
        setTimeout(() => setMessages((msgs) => [...msgs, logMsg]), 100);
      }

      return {
        currentCall: null,
        status: 'idle',
        type: 'video',
        callDuration: 0,
      };
    });
  };

  return (
    <CommunicationContext.Provider
      value={{
        users,
        messages,
        callState,
        activeChatUserId,
        isTyping,
        sendMessage,
        startCall,
        acceptCall,
        endCall,
        toggleFollow,
        setActiveChatUserId,
        triggerIncomingCall,
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (context === undefined) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
