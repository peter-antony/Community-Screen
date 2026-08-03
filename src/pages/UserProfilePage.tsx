import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import {
  MapPin,
  Briefcase,
  Phone,
  Video,
  UserCheck,
  UserPlus,
  Edit3,
  Check,
  Cpu,
  ArrowLeft,
  MessageCircleMore,
  Users,
  Sparkles
} from 'lucide-react';
import type { User } from '../types';
import { supabase } from '../supabaseClient';
import './UserProfilePage.css';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser, updateProfile } = useAuth();
  const { users, toggleFollow, startCall, setActiveChatUserId } = useCommunication();
  const navigate = useNavigate();

  const isOwnProfile = id === authUser?.id || !id;

  const [profileUser, setProfileUser] = useState<User | null>(
    isOwnProfile ? authUser : (users.find((u) => u.id === id) || null)
  );
  const [userCommunities, setUserCommunities] = useState<string[]>(['Koramangala Tech Club', 'Bangalore Sports Hub']);
  const [loading, setLoading] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    loadUserData();
  }, [id, authUser]);

  const loadUserData = async () => {
    const targetId = id || authUser?.id;
    if (!targetId) return;

    try {
      setLoading(true);
      // Fetch user profile data from Supabase users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single();

      if (!error && data) {
        const mappedUser: User = {
          id: String(data.id),
          name: data.name || 'User',
          username: data.username || 'user',
          role: data.role || 'Community Member',
          location: data.location || 'Bengaluru, India',
          bio: data.bio || 'Passionate community member interested in tech, networking and events.',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          coverImage: data.cover_image || data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          status: data.status || 'online',
          followersCount: Number(data.followers_count || 42),
          followingCount: Number(data.following_count || 28),
          skills: Array.isArray(data.skills)
            ? data.skills
            : (typeof data.skills === 'string' ? JSON.parse(data.skills) : ['Networking', 'Leadership', 'React', 'Design']),
          isFollowing: Boolean(data.is_following || data.isFollowing || false),
        };

        setProfileUser(mappedUser);
        setEditName(mappedUser.name);
        setEditRole(mappedUser.role);
        setEditBio(mappedUser.bio);
        setEditLocation(mappedUser.location);

        if (data.communities) {
          try {
            const parsed = typeof data.communities === 'string' ? JSON.parse(data.communities) : data.communities;
            if (Array.isArray(parsed)) {
              setUserCommunities(parsed);
            }
          } catch (e) { }
        }
      } else {
        // Fallback to authUser or local context
        const localFound = isOwnProfile ? authUser : users.find((u) => u.id === targetId);
        if (localFound) {
          setProfileUser(localFound);
          setEditName(localFound.name);
          setEditRole(localFound.role);
          setEditBio(localFound.bio);
          setEditLocation(localFound.location);
        }
      }

      // Query community_map to bind joined communities as badges
      const { data: mapData } = await supabase.from('community_map').select('*');
      if (mapData && mapData.length > 0) {
        const targetName = (data?.name || authUser?.name || '').toLowerCase();
        const matched: string[] = [];

        mapData.forEach((c: any) => {
          let memberOfComm = false;
          if (c.host_name && targetName && c.host_name.toLowerCase().includes(targetName)) {
            memberOfComm = true;
          }
          if (c.attendees) {
            try {
              const attendeesList = typeof c.attendees === 'string' ? JSON.parse(c.attendees) : c.attendees;
              if (Array.isArray(attendeesList) && attendeesList.some((a: any) => a.name && targetName && a.name.toLowerCase().includes(targetName))) {
                memberOfComm = true;
              }
            } catch (e) { }
          }
          if (memberOfComm && c.name && !matched.includes(c.name)) {
            matched.push(c.name);
          }
        });

        if (matched.length > 0) {
          setUserCommunities(prev => Array.from(new Set([...prev, ...matched])));
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profileUser) {
    return (
      <div className="profile-error glass-panel">
        <h3>User Profile Not Found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/network')}>
          Return to Network
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    updateProfile({
      name: editName,
      role: editRole,
      bio: editBio,
      location: editLocation,
    });

    setProfileUser(prev => prev ? {
      ...prev,
      name: editName,
      role: editRole,
      bio: editBio,
      location: editLocation
    } : null);

    try {
      await supabase.from('users').update({
        name: editName,
        role: editRole,
        bio: editBio,
        location: editLocation
      }).eq('id', profileUser.id);
    } catch (err) {
      console.error('Error saving user profile to database:', err);
    }

    setIsEditing(false);
  };

  const handleOpenChat = () => {
    setActiveChatUserId(profileUser.id);
    navigate('/chat');
  };

  const handleCall = (type: 'audio' | 'video') => {
    startCall(profileUser, type);
    navigate('/call');
  };

  return (
    <div className="user-profile-page">
      {/* Cover Banner */}
      <div
        className="profile-cover"
        style={{ backgroundImage: `url(${profileUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'})` }}
      >
        <button
          className="cover-back-btn"
          onClick={() => navigate('/network')}
          title="Back to Network Page"
          aria-label="Back to Network Page"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="cover-overlay" />
      </div>

      {/* Profile Header Card */}
      <section className="profile-header-card glass-panel">
        <div className="profile-main-layout">
          <div className="profile-avatar-block">
            <img src={profileUser.avatar} alt={profileUser.name} className="profile-avatar" />
            <span className={`profile-status-dot ${profileUser.status}`} />
          </div>

          <div className="profile-name-details">
            {isEditing ? (
              <div className="edit-fields-row">
                <input
                  type="text"
                  className="form-input edit-name-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input edit-role-input"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="name-with-badge">
                  <h1>{profileUser.name}</h1>
                  {isOwnProfile && <span className="own-badge">YOU</span>}
                </div>
                <span className="profile-role-title">{profileUser.role}</span>
              </>
            )}

            <div className="profile-meta-row">
              <div className="meta-item">
                <MapPin size={14} />
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input inline-edit-input"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                ) : (
                  <span>{profileUser.location || 'Bengaluru, India'}</span>
                )}
              </div>

              <div className="meta-item">
                <Briefcase size={14} />
                <span>Pioneer Hub</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-action-controls">
            {isOwnProfile ? (
              isEditing ? (
                <button className="btn btn-primary btn-glow" onClick={handleSave}>
                  <Check size={16} />
                  <span>Save Changes</span>
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )
            ) : (
              <div className="profile-btn-group">
                <button
                  className={`btn ${profileUser.isFollowing ? 'btn-secondary' : 'btn-primary btn-glow'}`}
                  onClick={() => toggleFollow(profileUser.id)}
                >
                  {profileUser.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  <span>{profileUser.isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                <button className="btn-icon-glass" onClick={handleOpenChat} title="Send Message">
                  <MessageCircleMore size={18} />
                </button>

                <button
                  className="btn-icon-glass"
                  onClick={() => handleCall('audio')}
                  title="Voice Call"
                  disabled={profileUser.status === 'offline'}
                >
                  <Phone size={18} />
                </button>

                <button
                  className="btn-icon-glass"
                  onClick={() => handleCall('video')}
                  title="Video Call"
                  disabled={profileUser.status === 'offline'}
                >
                  <Video size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Counts Strip */}
        <div className="profile-counts-strip">
          <div className="count-unit">
            <span className="count-val">{profileUser.followersCount}</span>
            <span className="count-lbl">FOLLOWERS</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{profileUser.followingCount}</span>
            <span className="count-lbl">FOLLOWING</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{userCommunities.length}</span>
            <span className="count-lbl">COMMUNITIES</span>
          </div>
        </div>
      </section>

      {/* Profile Details Content Section */}
      <section className="profile-tabs-section">
        <div className="tab-viewport glass-panel">
          <div className="about-tab-content">
            {/* Bio Box */}
            <div className="profile-bio-box">
              <h4>ABOUT BIO</h4>
              {isEditing ? (
                <textarea
                  className="form-textarea profile-textarea"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                />
              ) : (
                <p>{profileUser.bio || 'Active member contributing to community meetups, events, and networking activities.'}</p>
              )}
            </div>

            {/* Communities Badges */}
            <div className="profile-skills-box">
              <h4>JOINED COMMUNITIES</h4>
              <div className="skills-cloud">
                {userCommunities.map((commName, i) => (
                  <span key={i} className="capability-tag community-badge" style={{ background: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
                    <Users size={14} className="tag-cap-icon" style={{ color: '#60a5fa' }} />
                    <span>{commName}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Capabilities & Skills */}
            <div className="profile-skills-box">
              <h4>SYSTEM CAPABILITIES & SKILLS</h4>
              <div className="skills-cloud">
                {profileUser.skills.map((skill, i) => (
                  <span key={i} className="capability-tag">
                    <Cpu size={14} className="tag-cap-icon" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
