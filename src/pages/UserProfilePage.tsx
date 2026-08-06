import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Plus,
  X,
  Camera,
  ChevronRight
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
  const [editAvatar, setEditAvatar] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editDob, setEditDob] = useState('1998-05-15');
  const [interests, setInterests] = useState<string[]>(["Running", "Hiking", "Gym", "Yoga", "Swimming"]);
  const [newInterestInput, setNewInterestInput] = useState('');

  // Active expanded section in Edit mode
  const [expandedSection, setExpandedSection] = useState<'description' | 'name' | 'dob' | 'interests' | 'avatar' | null>(null);

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
        setEditAvatar(mappedUser.avatar);
        setEditCoverImage(mappedUser.coverImage || '');

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
          setEditAvatar(localFound.avatar);
          setEditCoverImage(localFound.coverImage || '');
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
      avatar: editAvatar || profileUser.avatar,
      coverImage: editCoverImage || profileUser.coverImage,
    });

    setProfileUser(prev => prev ? {
      ...prev,
      name: editName,
      role: editRole,
      bio: editBio,
      location: editLocation,
      avatar: editAvatar || profileUser.avatar,
      coverImage: editCoverImage || profileUser.coverImage
    } : null);

    try {
      await supabase.from('users').update({
        name: editName,
        role: editRole,
        bio: editBio,
        location: editLocation,
        avatar: editAvatar || profileUser.avatar,
        cover_image: editCoverImage || profileUser.coverImage
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

  const toggleSection = (section: 'description' | 'name' | 'dob' | 'interests' | 'avatar') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className="user-profile-page" style={{ overflowX: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="user-profile-view-wrapper"
          >
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
                  <div className="name-with-badge">
                    <h1>{profileUser.name}</h1>
                    {isOwnProfile && <span className="own-badge">YOU</span>}
                  </div>

                  <div className="profile-meta-row">
                    <div className="meta-item">
                      <span>{profileUser.location || 'chowdeswara.rao@jenesystech.com'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="profile-action-controls">
                  {isOwnProfile ? (
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                      <Edit3 size={16} />
                      <span>Edit Profile</span>
                    </button>
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
                  <span className="count-lbl">Favourites</span>
                </div>
                <div className="count-divider" />
                <div className="count-unit">
                  <span className="count-val">{profileUser.followingCount}</span>
                  <span className="count-lbl">Joined</span>
                </div>
                <div className="count-divider" />
                <div className="count-unit">
                  <span className="count-val">{userCommunities.length}</span>
                  <span className="count-lbl">Hosted</span>
                </div>
              </div>
            </section>

            {/* Profile Details Content Section */}
            <section className="profile-tabs-section">
              <div className="tab-viewport glass-panel">
                <div className="about-tab-content">
                  {/* Bio Box */}
                  <div className="profile-bio-box">
                    <h4>ABOUT</h4>
                    <p>{profileUser.bio || 'Active member contributing to community meetups, events, and networking activities.'}</p>
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
                    <h4>INTERESTS</h4>
                    <div className="skills-cloud">
                      {interests.map((interest, i) => (
                        <span key={i} className="capability-tag">
                          <span>{interest}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="profile-edit"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            className="edit-profile-view-wrapper"
          >
            {/* Header Bar matching screenshot */}
            <div className="edit-profile-header-bar">
              <button
                className="edit-circular-back-btn"
                onClick={() => handleSave()}
                title="Back to Profile"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="edit-panel-title-centered">Edit profile</h2>
              <div className="edit-header-spacer" style={{ width: 44, height: 44 }} />
            </div>

            {/* Centered Avatar with Purple Plus Badge */}
            <div className="edit-avatar-centered-section">
              <div
                className="edit-avatar-big-wrap"
                onClick={() => toggleSection('avatar')}
                title="Click to update picture"
              >
                <img src={editAvatar || profileUser.avatar} alt="Avatar" className="edit-avatar-big-img" />
                <div className="edit-avatar-purple-plus">
                  <Plus size={20} strokeWidth={2.8} />
                </div>
              </div>

              {expandedSection === 'avatar' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="edit-avatar-url-drawer"
                >
                  <label className="edit-field-label">Avatar Picture URL</label>
                  <input
                    type="text"
                    className="form-input edit-url-input"
                    placeholder="https://..."
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                  />
                </motion.div>
              )}
            </div>

            {/* Expandable Section Menu Cards List */}
            <div className="edit-menu-cards-list">
              {/* Card 1: Edit profile description */}
              <div className="edit-menu-card-item">
                <div
                  className="edit-menu-card-header"
                  onClick={() => toggleSection('description')}
                >
                  <h3 className="edit-menu-card-title">Edit profile description</h3>
                  <ChevronRight size={18} className={`edit-menu-card-chevron ${expandedSection === 'description' ? 'open' : ''}`} />
                </div>
                {expandedSection === 'description' && (
                  <div className="edit-menu-card-body">
                    <textarea
                      className="form-textarea"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                )}
              </div>

              {/* Combined Card 2: Name & DOB */}
              <div className="edit-menu-card-item">
                <div
                  className="edit-menu-card-header"
                  onClick={() => toggleSection('name')}
                >
                  <div>
                    <h3 className="edit-menu-card-title">Name & DOB</h3>
                    <span className="edit-card-subval">{editName} • {editDob || 'Select DOB'}</span>
                  </div>
                  <ChevronRight size={18} className={`edit-menu-card-chevron ${expandedSection === 'name' ? 'open' : ''}`} />
                </div>
                {expandedSection === 'name' && (
                  <div className="edit-menu-card-body" style={{ gap: '16px' }}>
                    <div className="edit-form-group">
                      <label className="edit-field-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your full name..."
                      />
                    </div>
                    <div className="edit-form-group">
                      <label className="edit-field-label">Date of Birth (DOB)</label>
                      <input
                        type="date"
                        className="form-input"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: My interests */}
              <div className="edit-menu-card-item">
                <div
                  className="edit-menu-card-header"
                  onClick={() => toggleSection('interests')}
                >
                  <div>
                    <h3 className="edit-menu-card-title">My interests</h3>
                    <span className="edit-card-subval">{interests.join(', ')}</span>
                  </div>
                  <ChevronRight size={18} className={`edit-menu-card-chevron ${expandedSection === 'interests' ? 'open' : ''}`} />
                </div>
                {expandedSection === 'interests' && (
                  <div className="edit-menu-card-body">
                    <div className="edit-interests-manager">
                      <div className="interests-pill-cloud">
                        {interests.map((interest, idx) => (
                          <span key={idx} className="edit-interest-pill">
                            <span>{interest}</span>
                            <button
                              type="button"
                              className="remove-interest-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInterests(interests.filter((_, i) => i !== idx));
                              }}
                              title="Remove interest"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="add-interest-row">
                        <input
                          type="text"
                          className="form-input add-interest-input"
                          placeholder="Add new interest (e.g. Cycling)..."
                          value={newInterestInput}
                          onChange={(e) => setNewInterestInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newInterestInput.trim()) {
                                setInterests([...interests, newInterestInput.trim()]);
                                setNewInterestInput('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary add-interest-btn"
                          onClick={() => {
                            if (newInterestInput.trim()) {
                              setInterests([...interests, newInterestInput.trim()]);
                              setNewInterestInput('');
                            }
                          }}
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
