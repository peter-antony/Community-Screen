import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { User, Message, CallState, CommunityItem } from '../types';
import { mockMessages as initialMessages, botResponses } from '../services/mockData';
import { supabase } from '../supabaseClient';

interface CommunicationContextType {
  users: User[];
  communities: CommunityItem[];
  messages: Message[];
  callState: CallState;
  activeChatUserId: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => void;
  sendGroupMessage: (communityId: string, content: string) => void;
  startCall: (user: User, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  endCall: () => void;
  toggleFollow: (userId: string) => void;
  setActiveChatUserId: (userId: string | null) => void;
  triggerIncomingCall: (user: User, type: 'audio' | 'video') => void;
  fetchCommunities: () => Promise<void>;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);

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
    const { data: posts, error } = await supabase
        .from('users')
        .select('*')
    if (error || !posts) return console.error(error || "No user data returned from database");

    const mapped = posts.map((u) => ({
      id: u.id,
      name: u.name || 'User',
      username: u.username || 'user',
      role: u.role || 'Member',
      location: u.location || '',
      bio: u.bio || '',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      coverImage: u.cover_image || '',
      status: u.status || 'offline',
      followersCount: u.followers_count || 0,
      followingCount: u.following_count || 0,
      skills: u.skills || [],
      isFollowing: u.is_following || false,
    }));

    setUsers(mapped);
  };

  useEffect(() => {
    fetchUsers();
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const { data, error } = await supabase.from('community_list').select('*');
    if (error) return console.error(error);

    if (data) {
      const mapped: CommunityItem[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        theme: c.theme,
        image: c.image || c.image_url,
        status: c.status,
        dateStr: c.date_str || c.dateStr || '',
        timeStr: c.time_str || c.timeStr || '',
        distance: c.distance,
        host: typeof c.host === 'string' ? JSON.parse(c.host) : c.host,
        attendees: typeof c.attendees === 'string' ? JSON.parse(c.attendees) : (c.attendees || []),
      }));
      setCommunities(mapped);
    }
  };

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

  // Direct 1-on-1 Message Sending
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

  // Community Group Message Sending
  const sendGroupMessage = (communityId: string, content: string) => {
    if (!communityId) return;

    const newGroupMsg: Message = {
      id: `msg_grp_${Date.now()}`,
      senderId: 'current_user_1',
      receiverId: communityId,
      communityId: communityId,
      isGroup: true,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      type: 'text',
      senderName: 'Alex Mercer',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    setMessages((prev) => [...prev, newGroupMsg]);

    // Simulate Group Member Response
    if (botReplyTimerRef.current) clearTimeout(botReplyTimerRef.current);
    if (botTypingTimerRef.current) clearTimeout(botTypingTimerRef.current);

    botTypingTimerRef.current = setTimeout(() => {
      setIsTyping(true);

      botReplyTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        const activeComm = communities.find((c) => c.id === communityId);
        const membersList = activeComm?.attendees?.length
          ? activeComm.attendees
          : [
            { name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
            { name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
            { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
          ];

        const randomMember = membersList[Math.floor(Math.random() * membersList.length)];
        const sampleResponses = [
          'That sounds amazing! Count me in.',
          'Awesome initiative! Looking forward to seeing everyone there.',
          'Great plan! Let us know if we need to bring anything.',
          'Thanks for sharing! See you all soon 🎉',
          'I will be joining as well!'
        ];
        const randomText = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];

        const botGroupMsg: Message = {
          id: `msg_grp_${Date.now() + 1}`,
          senderId: `grp_bot_${Date.now()}`,
          receiverId: communityId,
          communityId: communityId,
          isGroup: true,
          content: randomText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'text',
          senderName: randomMember.name,
          senderAvatar: randomMember.avatar
        };

        setMessages((prev) => [...prev, botGroupMsg]);
      }, 1500);
    }, 1000);
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
        communities,
        messages,
        callState,
        activeChatUserId,
        isTyping,
        sendMessage,
        sendGroupMessage,
        startCall,
        acceptCall,
        endCall,
        toggleFollow,
        setActiveChatUserId,
        triggerIncomingCall,
        fetchCommunities,
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
