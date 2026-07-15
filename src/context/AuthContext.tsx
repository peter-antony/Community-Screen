import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';
import { currentUser as defaultUser } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: 'creative_developer' | 'designer' | 'guest') => void;
  logout: () => void;
  updateProfile: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('community_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  const login = (role: 'creative_developer' | 'designer' | 'guest') => {
    let mockProfile = { ...defaultUser };
    if (role === 'designer') {
      mockProfile = {
        ...mockProfile,
        id: 'mock_designer_user',
        name: 'Sarah Connor',
        username: 'sarahc',
        role: 'Senior Product Designer',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research']
      };
    } else if (role === 'guest') {
      mockProfile = {
        ...mockProfile,
        id: 'mock_guest_user',
        name: 'Guest Innovator',
        username: 'guestuser',
        role: 'Tech Enthusiast',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        skills: ['Networking', 'Ideation', 'Collaboration']
      };
    }
    setUser(mockProfile);
    localStorage.setItem('community_auth_user', JSON.stringify(mockProfile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('community_auth_user');
  };

  const updateProfile = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('community_auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
