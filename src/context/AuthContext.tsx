import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { currentUser as defaultUser } from '../services/mockData';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: 'creative_developer' | 'designer' | 'guest') => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, fullName: string, username: string) => Promise<{ success: boolean; error?: string }>;
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

  // Listen to Supabase auth state changes to keep sessions in sync
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        console.log("select users")
        // Fetch custom profile data from public.users table (synced by database trigger)
        const { data: profile, error } = await supabase
          .from('posts')
          .select('*').single();

        if (profile && !error) {
          const mappedUser: User = {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            role: profile.role || 'Member',
            location: profile.location || '',
            bio: profile.bio || '',
            avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            status: (profile.status === 'busy' ? 'away' : profile.status) as 'online' | 'offline' | 'away' || 'offline',
            followersCount: profile.followers_count || 0,
            followingCount: profile.following_count || 0,
            skills: profile.skills || [],
            isFollowing: profile.is_following || false,
            coverImage: profile.cover_image || ''
          };
          setUser(mappedUser);
          localStorage.setItem('community_auth_user', JSON.stringify(mappedUser));
        } else {
          console.warn("Could not retrieve custom user profile from public.users:", error?.message);
          // Fallback: construct profile from session metadata
          const metadata = session.user.user_metadata || {};
          const fallbackUser: User = {
            id: session.user.id,
            name: metadata.full_name || metadata.name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
            username: metadata.username || (session.user.email ? session.user.email.split('@')[0] : 'user'),
            role: 'Member',
            location: '',
            bio: '',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            status: 'online',
            followersCount: 0,
            followingCount: 0,
            skills: [],
            isFollowing: false
          };
          setUser(fallbackUser);
          localStorage.setItem('community_auth_user', JSON.stringify(fallbackUser));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('community_auth_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user) {
      // Profile retrieval is handled by the subscription above
      return { success: true };
    }

    return { success: false, error: 'Login session failed to initialize' };
  };

  const signupWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          username: username
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user) {
      return { success: true };
    }

    return { success: false, error: 'Registration failed' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginWithEmail, signupWithEmail, logout, updateProfile }}>
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
