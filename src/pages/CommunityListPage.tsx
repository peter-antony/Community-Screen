import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunication } from '../context/CommunicationContext';
import type { User } from '../types';
import {
  Search,
  UserCheck,
  UserPlus,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommunityListPage.css';

export const CommunityListPage: React.FC = () => {
  const { users, toggleFollow } = useCommunication();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Track responsive screen size for mobile spatial 3D constellation layout
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      u.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Default alphabetical sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => a.name.localeCompare(b.name));

  const totalClusters = Math.ceil(sortedUsers.length / 7) || 1;
  const clusterStep = isMobile ? 460 : 500;
  const stageHeight = Math.max(isMobile ? 500 : 560, totalClusters * clusterStep + 40);

  // Helper to compute spatial 3D coordinates ("here and there") for card [index]
  const getSpatialCardStyle = (index: number): React.CSSProperties => {
    const clusterIndex = Math.floor(index / 7);
    const subIndex = index % 7;
    const baseTop = clusterIndex * clusterStep; // Step per constellation cluster so NO OVERLAP

    // Desktop Spatial Positions ("here and there")
    const desktopPositions = [
      { left: '50%', top: baseTop + 140, transform: 'translate(-50%, -50%) scale(1.04)', zIndex: 12 }, // 0: Center Featured Card
      { left: '12%', top: baseTop + 35, transform: 'rotateX(4deg) rotateY(6deg)', zIndex: 6 },        // 1: Top Left
      { left: '14%', top: baseTop + 300, transform: 'rotateX(4deg) rotateY(6deg)', zIndex: 6 },       // 2: Bottom Left
      { right: '12%', top: baseTop + 45, transform: 'rotateX(4deg) rotateY(-6deg)', zIndex: 6 },     // 3: Top Right
      { right: '14%', top: baseTop + 290, transform: 'rotateX(4deg) rotateY(-6deg)', zIndex: 6 },     // 4: Bottom Right
      { left: '32%', top: baseTop + 430, transform: 'scale(0.95)', zIndex: 5 },                        // 5: Bottom Mid Left
      { right: '32%', top: baseTop + 430, transform: 'scale(0.95)', zIndex: 5 }                        // 6: Bottom Mid Right
    ];

    // Mobile Spatial Positions ("here and there" floating constellation layout tuned for mobile screens)
    const mobilePositions = [
      { left: '50%', top: baseTop + 130, transform: 'translate(-50%, -50%) scale(0.92)', zIndex: 12 }, // 0: Center Featured Card
      { left: '2%', top: baseTop + 25, transform: 'scale(0.82)', zIndex: 6 },                          // 1: Top Left
      { left: '4%', top: baseTop + 250, transform: 'scale(0.82)', zIndex: 6 },                         // 2: Bottom Left
      { right: '2%', top: baseTop + 35, transform: 'scale(0.82)', zIndex: 6 },                         // 3: Top Right
      { right: '4%', top: baseTop + 240, transform: 'scale(0.82)', zIndex: 6 },                        // 4: Bottom Right
      { left: '16%', top: baseTop + 360, transform: 'scale(0.78)', zIndex: 5 },                        // 5: Bottom Mid Left
      { right: '16%', top: baseTop + 360, transform: 'scale(0.78)', zIndex: 5 }                        // 6: Bottom Mid Right
    ];

    const positions = isMobile ? mobilePositions : desktopPositions;
    const pos = positions[subIndex];
    return {
      position: 'absolute',
      ...(pos.left ? { left: pos.left } : {}),
      ...(pos.right ? { right: pos.right } : {}),
      top: `${pos.top}px`,
      transform: pos.transform,
      zIndex: pos.zIndex
    };
  };

  return (
    <div className="community-list-page">

      {/* Top Floating Glass Search & Controls Bar */}
      <div className="spatial-top-bar">
        <div className="spatial-search-container">
          <div className="spatial-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="spatial-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter Tabs (Top Right) */}
        <div className="spatial-status-filter">
          {['All', 'Online', 'Away', 'Offline'].map((st) => (
            <button
              key={st}
              className={`spatial-status-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Floating Spatial Constellation Arena (Scrollable Canvas) */}
      <div className="spatial-arena-stage" style={{ height: `${stageHeight}px` }}>

        {/* SVG Constellation Lines Canvas */}
        <svg className="constellation-svg-canvas" style={{ height: `${stageHeight}px` }}>
          {Array.from({ length: totalClusters }).map((_, cIdx) => {
            const baseTop = cIdx * clusterStep;
            return (
              <g key={cIdx}>
                {/* Center to Top-Left */}
                <path
                  className="constellation-line"
                  d={`M 500 ${baseTop + 140} Q 320 ${baseTop + 85} 140 ${baseTop + 35}`}
                />
                {/* Center to Bottom-Left */}
                <path
                  className="constellation-line"
                  d={`M 500 ${baseTop + 140} Q 340 ${baseTop + 220} 160 ${baseTop + 300}`}
                />
                {/* Center to Top-Right */}
                <path
                  className="constellation-line"
                  d={`M 500 ${baseTop + 140} Q 680 ${baseTop + 90} 860 ${baseTop + 45}`}
                />
                {/* Center to Bottom-Right */}
                <path
                  className="constellation-line"
                  d={`M 500 ${baseTop + 140} Q 680 ${baseTop + 215} 840 ${baseTop + 290}`}
                />
                <circle className="constellation-node-dot" cx="320" cy={baseTop + 85} r="3.5" />
                <circle className="constellation-node-dot amber" cx="320" cy={baseTop + 220} r="3.5" />
                <circle className="constellation-node-dot" cx="680" cy={baseTop + 90} r="3.5" />
                <circle className="constellation-node-dot amber" cx="680" cy={baseTop + 215} r="3.5" />
              </g>
            );
          })}
        </svg>

        <AnimatePresence mode="popLayout">
          {sortedUsers.map((pioneer, index) => {
            const isFeatured = index % 7 === 0;
            return (
              <motion.div
                layout
                key={pioneer.id}
                className={`spatial-card-node ${isFeatured ? 'is-featured-node' : ''}`}
                style={getSpatialCardStyle(index)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.05 }}
              >
                {/* 3D Glass Block Main Card */}
                <div className="pioneer-3d-card">
                  {/* Top Avatar with Status Dot */}
                  <div className="card-3d-avatar-container" onClick={() => navigate(`/profile/${pioneer.id}`)}>
                    <img src={pioneer.avatar} alt={pioneer.name} className="card-3d-avatar" />
                    <span className={`card-3d-status-dot ${pioneer.status}`} />
                  </div>

                  {/* Name */}
                  <h3 className="card-3d-name">
                    {pioneer.name}
                  </h3>

                  {/* Location Subtitle */}
                  <div className="card-3d-role-location">
                    <div className="location-pill">
                      <MapPin size={11} />
                      <span>{pioneer.location}</span>
                    </div>
                  </div>

                  <div className="followDiv">
                    {/* Stats: Followers */}
                    <div className="card-3d-stats">
                      <span className="stat-label-top">Followers</span>
                      <span className="stat-value">{pioneer.followersCount}</span>
                    </div>

                    {/* Follow Button */}
                    <button
                      className={`card-3d-follow-btn ${pioneer.isFollowing ? 'following' : ''}`}
                      onClick={() => toggleFollow(pioneer.id)}
                    >
                      {pioneer.isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      <span>{pioneer.isFollowing ? 'Following' : 'Follow'}</span>
                    </button>
                  </div>
                </div>

                {/* Ambient Underglow */}
                <div className={`card-underglow ${pioneer.status}`} />

                {/* Floating Status Label Below Card */}
                <div className={`card-3d-status-label ${pioneer.status}`}>
                  {pioneer.status === 'online' && 'Online'}
                  {pioneer.status === 'away' && 'Away'}
                  {pioneer.status === 'offline' && 'Offline'}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sortedUsers.length === 0 && (
        <div className="empty-results glass-panel">
          <p>No digital pioneers found matching the current search parameters.</p>
        </div>
      )}
    </div>
  );
};
