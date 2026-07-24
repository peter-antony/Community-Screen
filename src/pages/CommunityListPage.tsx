import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunication } from '../context/CommunicationContext';
import type { User } from '../types';
import {
  Search,
  MapPin,
  MessageSquare,
  Phone,
  Video,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommunityListPage.css';

export const CommunityListPage: React.FC = () => {
  const { users, toggleFollow, startCall, setActiveChatUserId } = useCommunication();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Derive roles for filter tabs
  const roles = ['All', 'Developer', 'Designer', 'Strategist', 'Artist'];

  // Handle filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'All' ||
      u.role.toLowerCase().includes(selectedRole.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      u.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Default alphabetical sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenChat = (userId: string) => {
    setActiveChatUserId(userId);
    navigate('/chat');
  };

  const handleLaunchCall = (user: User, type: 'audio' | 'video') => {
    startCall(user, type);
    navigate('/call');
  };

  return (
    <div className="community-list-page">
      <div className="explore-title-block">
        {/* <Compass className="explore-compass-icon" size={28} /> */}
        <div>
          <h1>Users</h1>
        </div>
      </div>
      {/* Filters Toolbar */}
      <section className="toolbar-panel glass-panel">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, role, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          {/* Status selector */}
          <div className="control-select">
            <span className="control-label">Status:</span>
            {['All', 'Online', 'Away', 'Offline'].map((st) => (
              <button
                key={st}
                className={`filter-tab ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Role Tabs */}
      {/* <section className="role-tabs-container">
        {roles.map((role) => (
          <button
            key={role}
            className={`role-tab-btn ${selectedRole === role ? 'active' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            {role === 'All' ? 'All Pioneers' : `${role}s`}
          </button>
        ))}
      </section> */}

      {/* Pioneer Cards Grid */}
      <motion.section
        className="pioneers-grid"
        layout
      >
        <AnimatePresence mode="popLayout">
          {sortedUsers.map((pioneer) => (
            <motion.div
              layout
              key={pioneer.id}
              className="pioneer-card glass-panel glass-panel-hover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Card Banner */}
              <div
                className="card-banner"
                style={{ backgroundImage: `url(${pioneer.coverImage})` }}
              >
                <span className={`status-badge-absolute ${pioneer.status}`}>
                  {pioneer.status === 'online' && 'ONLINE'}
                  {pioneer.status === 'away' && 'AWAY'}
                  {pioneer.status === 'offline' && 'OFFLINE'}
                </span>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <div className="card-avatar-wrapper" onClick={() => navigate(`/profile/${pioneer.id}`)}>
                  <img src={pioneer.avatar} alt={pioneer.name} className="card-avatar" />
                  <span className={`avatar-status-ring ${pioneer.status}`} />
                </div>

                <div className="card-main-info" onClick={() => navigate(`/profile/${pioneer.id}`)}>
                  <h3>{pioneer.name}</h3>
                  {/* <span className="pioneer-role">{pioneer.role}</span> */}
                  <div className="location-wrapper">
                    <MapPin size={12} />
                    <span>{pioneer.location}</span>
                  </div>
                </div>

                <p className="pioneer-bio">{pioneer.bio}</p>

                <div className="skills-row">
                  {pioneer.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                  {pioneer.skills.length > 3 && (
                    <span className="skill-tag-more">+{pioneer.skills.length - 3}</span>
                  )}
                </div>

                <div className="card-stats-row">
                  <div className="card-stat">
                    <span className="stat-v">{pioneer.followersCount}</span>
                    <span className="stat-l">Followers</span>
                  </div>
                  <div className="card-stat">
                    <span className="stat-v">{pioneer.followingCount}</span>
                    <span className="stat-l">Following</span>
                  </div>
                </div>
              </div>

              {/* Card Actions Panel */}
              <div className="card-actions-panel">
                <button
                  className={`follow-card-btn ${pioneer.isFollowing ? 'following' : ''}`}
                  onClick={() => toggleFollow(pioneer.id)}
                  title={pioneer.isFollowing ? 'Unfollow Pioneer' : 'Follow Pioneer'}
                >
                  {pioneer.isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                  <span>{pioneer.isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                <div className="comms-actions-group">
                  <button
                    className="btn-icon btn-icon-cyan"
                    onClick={() => handleOpenChat(pioneer.id)}
                    title="Quantum Message"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    className="btn-icon btn-icon-violet"
                    onClick={() => handleLaunchCall(pioneer, 'audio')}
                    title="Voice Call"
                    disabled={pioneer.status === 'offline'}
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    className="btn-icon btn-icon-rose"
                    onClick={() => handleLaunchCall(pioneer, 'video')}
                    title="Video Stream Portal"
                    disabled={pioneer.status === 'offline'}
                  >
                    <Video size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>

      {sortedUsers.length === 0 && (
        <div className="empty-results glass-panel">
          <p>No digital pioneers found matching the current search parameters.</p>
        </div>
      )}
    </div>
  );
};
