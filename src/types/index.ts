export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  location: string;
  bio: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  followersCount: number;
  followingCount: number;
  skills: string[];
  isFollowing: boolean;
  coverImage?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO string or simple display time
  isRead: boolean;
  type: 'text' | 'image' | 'call_log';
}

export interface CallState {
  currentCall: User | null;
  status: 'idle' | 'calling' | 'incoming' | 'connected';
  type: 'audio' | 'video';
  callDuration: number;
}
