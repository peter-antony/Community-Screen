import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { useTheme } from '../context/ThemeContext';
import { NetworkBackground } from '../components/NetworkBackground';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Video,
  User as UserIcon,
  Network,
  LogOut,
  LayoutDashboard,
  UserCheck,
  UserPlus,
  X,
  Sun,
  Moon,
  Users
} from 'lucide-react';
import type { User, CommunityItem } from '../types';
import './NetworkConstellationPage.css';
import { communitiesData } from '../services/mockData';

// Hook to get responsive stage dimensions — always fits within viewport
const useStageSize = () => {
  const getSize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Reserve space for header + padding (header ~70px + margins ~40px + breathing room)
    const headerReserve = w <= 480 ? 80 : w <= 768 ? 90 : 110;
    const availableH = h - headerReserve;
    const isMobile = w <= 480;
    const isTablet = w > 480 && w <= 768;

    // Stage must fit both horizontally and vertically
    const horizontalMax = isMobile ? w - 32 : isTablet ? w - 64 : w <= 1024 ? w - 80 : 700;
    const size = Math.max(Math.min(horizontalMax, availableH), isMobile ? 260 : 320);

    const ratios = isMobile
      ? { inner: 0.25, outer: 0.44, center: 0.22, innerSat: 0.18, outerSat: 0.1 }
      : isTablet
        ? { inner: 0.24, outer: 0.44, center: 0.20, innerSat: 0.17, outerSat: 0.09 }
        : w <= 1024
          ? { inner: 0.23, outer: 0.43, center: 0.19, innerSat: 0.16, outerSat: 0.085 }
          : { inner: 0.22, outer: 0.42, center: 0.18, innerSat: 0.16, outerSat: 0.08 };

    return {
      stageSize: size,
      innerRadius: size * ratios.inner,
      outerRadius: size * ratios.outer,
      centerSize: size * ratios.center,
      innerSatSize: size * ratios.innerSat,
      outerSatSize: size * ratios.outerSat,
      isMobile,
      isTablet,
    };
  }, []);

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    const handleResize = () => setSize(getSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getSize]);

  return size;
};

export const NetworkConstellationPage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { users, toggleFollow, startCall, setActiveChatUserId } = useCommunication();
  const navigate = useNavigate();

  const [selectedNode, setSelectedNode] = useState<
    | { type: 'user'; data: User }
    | { type: 'community'; data: CommunityItem }
    | null
  >(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stage = useStageSize();

  if (!authUser) return null;

  // Selected node helpers
  const selectedUser = selectedNode?.type === 'user' ? (selectedNode.data as User) : null;
  const selectedCommunity = selectedNode?.type === 'community' ? (selectedNode.data as CommunityItem) : null;

  // Distribute users & communities dynamically: 6 in inner circle, rest in outer circle
  const satelliteUsers = users.filter(u => u.id !== authUser.id);
  const constellationCommunities = communitiesData.slice(0, 4); // Show first 4 communities in constellation

  const innerOrbitUsers = satelliteUsers.slice(0, Math.min(6, satelliteUsers.length));
  const outerOrbitUsers = satelliteUsers.slice(Math.min(6, satelliteUsers.length));

  // Mix users and communities in orbits
  const innerOrbitNodes = [
    ...innerOrbitUsers.slice(0, 4).map(u => ({ type: 'user' as const, id: u.id, name: u.name, avatar: u.avatar, data: u })),
    ...constellationCommunities.slice(0, 2).map(c => ({ type: 'community' as const, id: c.id, name: c.name, avatar: c.image, data: c }))
  ];

  const outerOrbitNodes = [
    ...outerOrbitUsers.map(u => ({ type: 'user' as const, id: u.id, name: u.name, avatar: u.avatar, data: u })),
    ...constellationCommunities.slice(2).map(c => ({ type: 'community' as const, id: c.id, name: c.name, avatar: c.image, data: c }))
  ];


  const getCoordinates = (index: number, count: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y };
  };

  const handleNodeClick = (e: React.MouseEvent, nodeData: User | CommunityItem, type: 'user' | 'community') => {
    e.stopPropagation();
    if (stage.isMobile || stage.isTablet) {
      // On mobile/tablet, show bottom sheet — no position needed
      setSelectedNode(prev => prev?.data.id === nodeData.id ? null : { type, data: nodeData } as any);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = type === 'community' ? 320 : 220; // safe estimation of max height
      const headerHeight = 90;
      const margin = 16;

      // Calculate horizontal position (centered by default)
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      if (x < margin) {
        x = margin;
      } else if (x + tooltipWidth > window.innerWidth - margin) {
        x = window.innerWidth - tooltipWidth - margin;
      }

      // Calculate vertical position (above by default)
      let y = rect.top - tooltipHeight - 12;
      if (y < headerHeight) {
        // Place below the node
        y = rect.bottom + 12;

        // If placing below also goes off-screen vertically, clamp it
        if (y + tooltipHeight > window.innerHeight - margin) {
          y = Math.max(headerHeight, window.innerHeight - tooltipHeight - margin);
        }
      }

      setTooltipPos({ x, y });
      setSelectedNode(prev => prev?.data.id === nodeData.id ? null : { type, data: nodeData } as any);
    }
  };

  const handleOpenChat = (userId: string) => {
    setActiveChatUserId(userId);
    navigate('/chat');
  };

  const handleLaunchCall = (user: User, type: 'audio' | 'video') => {
    startCall(user, type);
    navigate('/call');
  };

  return (
    <div className="constellation-page" onClick={() => { setSelectedNode(null); setMobileMenuOpen(false); }}>
      <NetworkBackground />
      {/* <CanvasBackground /> */}

      {/* Futuristic Floating Header */}
      <header className="constellation-header glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="logo-container" onClick={() => navigate('/')}>
          <Network size={20} className="text-cyan animate-pulse" />
          <span className="logo-text">COMMUNITY</span>
        </div>

        {/* Desktop Nav */}
        {/* <nav className="constellation-nav desktop-nav">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={16} />
            <span>Console</span>
          </button>
          <button className="nav-link-btn" onClick={() => navigate('/community')}>
            <UserIcon size={16} />
            <span>Directory</span>
          </button>
        </nav> */}

        {/* Desktop User Controls */}
        <div className="constellation-user-control">
          <button
            className="btn-icon theme-toggle-btn"
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ marginRight: '8px' }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className="user-pill" onClick={() => navigate(`/profile/${authUser.id}`)}>
            <img src={authUser.avatar} alt={authUser.name} className="header-avatar" />
            <span className='desktop-controls'>{authUser.name}</span>
          </div>
          <button className="btn-icon btn-icon-rose" onClick={() => { logout(); navigate('/'); }} title="Log Out">
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        {/* <button
          className="mobile-menu-toggle"
          onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button> */}
      </header>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-dropdown glass-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="mobile-nav-link" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
              <LayoutDashboard size={18} />
              <span>Console</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate('/community'); setMobileMenuOpen(false); }}>
              <UserIcon size={18} />
              <span>Directory</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate(`/profile/${authUser.id}`); setMobileMenuOpen(false); }}>
              <img src={authUser.avatar} alt={authUser.name} className="header-avatar" />
              <span>{authUser.name}</span>
            </button>
            <button className="mobile-nav-link logout-link" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Constellation Arena */}
      <main className="constellation-arena">
        <div
          className="constellation-stage"
          style={{ width: stage.stageSize, height: stage.stageSize }}
        >



          {/* Ambient Dust Particles */}
          <div className="ambient-particles">
            <span className="dust p-pink" style={{ top: '35%', left: '25%' }} />
            <span className="dust p-purple" style={{ top: '65%', left: '72%' }} />
            <span className="dust p-orange" style={{ top: '22%', left: '60%' }} />
            <span className="dust p-pink" style={{ top: '50%', left: '80%' }} />
            <span className="dust p-green" style={{ top: '78%', left: '32%' }} />
            <span className="dust p-purple" style={{ top: '15%', left: '38%' }} />
          </div>

          {/* CENTRAL NODE (Silhouette User Profile) */}
          <motion.div
            className="constellation-node center-node"
            style={{ width: stage.centerSize, height: stage.centerSize }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            onClick={() => navigate(`/profile/${authUser.id}`)}
          >
            <div className="center-node-glow" style={{ width: stage.centerSize * 1.75, height: stage.centerSize * 1.75 }} />
            <div className="center-silhouette">
              <UserIcon size={stage.centerSize * 0.45} className="silhouette-icon" />
            </div>
            <span className="node-pulse-ring" />
          </motion.div>

          {/* INNER SATELLITE NODES (Large size) */}
          {innerOrbitNodes.map((node, idx) => {
            const coords = getCoordinates(idx, innerOrbitNodes.length, stage.innerRadius);
            const isCommunity = node.type === 'community';
            return (
              <motion.div
                key={node.id}
                className={`constellation-node satellite-node inner-sat ${isCommunity ? 'community-node' : ''}`}
                style={{
                  width: stage.innerSatSize,
                  height: stage.innerSatSize,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, node.data, node.type)}
              >
                <div className={`satellite-glow-ring ${isCommunity ? 'community-glow' : node.data.status}`} />
                <img src={node.avatar} alt={node.name} className="node-avatar-img" />
                {isCommunity && (
                  <div className="node-group-badge">
                    <Users size={10} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* OUTER SATELLITE NODES (Small size) */}
          {outerOrbitNodes.map((node, idx) => {
            const coords = getCoordinates(idx, outerOrbitNodes.length, stage.outerRadius);
            const isCommunity = node.type === 'community';
            return (
              <motion.div
                key={node.id}
                className={`constellation-node satellite-node outer-sat ${isCommunity ? 'community-node' : ''}`}
                style={{
                  width: stage.outerSatSize,
                  height: stage.outerSatSize,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + 0.05 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, node.data, node.type)}
              >
                <div className={`satellite-glow-ring ${isCommunity ? 'community-glow' : node.data.status}`} />
                <img src={node.avatar} alt={node.name} className="node-avatar-img" />
                {isCommunity && (
                  <div className="node-group-badge">
                    <Users size={8} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Tooltip / Detail Card */}
      <AnimatePresence>
        {selectedNode && (
          <>
            {/* Mobile/Tablet: Bottom Sheet Overlay */}
            {(stage.isMobile || stage.isTablet) ? (
              <>
                <motion.div
                  className="mobile-overlay-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedNode(null)}
                />
                <motion.div
                  className="mobile-detail-sheet glass-panel"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sheet-handle" />
                  <button className="sheet-close-btn" onClick={() => setSelectedNode(null)}>
                    <X size={18} />
                  </button>

                  {selectedNode.type === 'user' && selectedUser ? (
                    <>
                      <div className="sheet-profile-section">
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="sheet-avatar"
                          onClick={() => navigate(`/profile/${selectedUser.id}`)}
                        />
                        <h3 className="sheet-name">{selectedUser.name}</h3>
                        <span className="sheet-role">{selectedUser.role}</span>
                        <span className="sheet-status">
                          <span className={`status-indicator ${selectedUser.status}`} />
                          {selectedUser.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="sheet-bio">{selectedUser.bio}</p>

                      <div className="tooltip-actions">
                        <button
                          className={`tooltip-btn-follow ${selectedUser.isFollowing ? 'following' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleFollow(selectedUser.id); }}
                        >
                          {selectedUser.isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                          <span>{selectedUser.isFollowing ? 'Following' : 'Follow'}</span>
                        </button>

                        <div className="tooltip-comms">
                          <button
                            className="btn-icon btn-icon-cyan"
                            onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedUser.id); }}
                            title="Chat"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            className="btn-icon btn-icon-violet"
                            onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'audio'); }}
                            disabled={selectedUser.status === 'offline'}
                            title="Audio Link"
                          >
                            <Phone size={14} />
                          </button>
                          <button
                            className="btn-icon btn-icon-rose"
                            onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'video'); }}
                            disabled={selectedUser.status === 'offline'}
                            title="Video Stream"
                          >
                            <Video size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="sheet-profile-link"
                        onClick={() => navigate(`/profile/${selectedUser.id}`)}
                      >
                        View Full Profile →
                      </button>
                    </>
                  ) : (
                    selectedCommunity && (
                      <>
                        <div className="community-sheet-cover-wrapper" style={{ cursor: 'pointer' }} onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}>
                          <img src={selectedCommunity.image} alt={selectedCommunity.name} className="community-sheet-cover" />
                          <div className="community-sheet-host-badge">
                            <img src={selectedCommunity.host.avatar} alt={selectedCommunity.host.name} className="sheet-host-avatar" />
                            <span>by {selectedCommunity.host.name.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="community-sheet-details">
                          <h3 className="community-sheet-title">{selectedCommunity.name}</h3>
                          <div className="community-sheet-meta">
                            <span>{selectedCommunity.dateStr} at {selectedCommunity.timeStr}</span>
                            <span className="meta-dot">•</span>
                            <span>{selectedCommunity.distance}</span>
                          </div>
                        </div>

                        <div className="community-sheet-attendees-section">
                          <span className="community-members-label">Members joined</span>
                          <div className="attendee-stack">
                            {selectedCommunity.attendees.slice(0, 3).map((attendee, idx) => (
                              <img
                                key={idx}
                                src={attendee.avatar}
                                alt={attendee.name}
                                className="attendee-avatar"
                                style={{ zIndex: 3 - idx }}
                              />
                            ))}
                            {selectedCommunity.attendees.length > 3 && (
                              <div className="attendee-excess" style={{ zIndex: 0 }}>
                                +{selectedCommunity.attendees.length - 3}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          className="sheet-profile-link"
                          style={{ marginTop: '16px' }}
                          onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}
                        >
                          View Event Details →
                        </button>
                      </>
                    )
                  )}
                </motion.div>
              </>
            ) : (
              /* Desktop: Floating Glass Tooltip */
              <motion.div
                className={`constellation-tooltip glass-panel ${selectedNode.type === 'community' ? 'community-tooltip' : ''}`}
                style={{
                  position: 'fixed',
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                }}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {selectedNode.type === 'user' && selectedUser ? (
                  <>
                    <div
                      className="tooltip-user-row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${selectedUser.id}`)}
                      title="View Identity Profile"
                    >
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="tooltip-avatar" />
                      <div>
                        <h4 className="tooltip-name">{selectedUser.name}</h4>
                        <span className="tooltip-role">{selectedUser.role}</span>
                        <span className="tooltip-status-text">
                          <span className={`status-indicator ${selectedUser.status}`} />{' '}
                          {selectedUser.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="tooltip-bio">{selectedUser.bio}</p>

                    <div className="tooltip-actions">
                      <button
                        className={`tooltip-btn-follow ${selectedUser.isFollowing ? 'following' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFollow(selectedUser.id); }}
                      >
                        {selectedUser.isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                        <span>{selectedUser.isFollowing ? 'Following' : 'Follow'}</span>
                      </button>

                      <div className="tooltip-comms">
                        <button
                          className="btn-icon btn-icon-cyan"
                          onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedUser.id); }}
                          title="Chat"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          className="btn-icon btn-icon-violet"
                          onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'audio'); }}
                          disabled={selectedUser.status === 'offline'}
                          title="Audio Link"
                        >
                          <Phone size={14} />
                        </button>
                        <button
                          className="btn-icon btn-icon-rose"
                          onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'video'); }}
                          disabled={selectedUser.status === 'offline'}
                          title="Video Stream"
                        >
                          <Video size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  selectedCommunity && (
                    <>
                      <div className="community-tooltip-cover-wrapper" style={{ cursor: 'pointer' }} onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}>
                        <img src={selectedCommunity.image} alt={selectedCommunity.name} className="community-tooltip-cover" />
                        <div className="community-tooltip-host-badge">
                          <img src={selectedCommunity.host.avatar} alt={selectedCommunity.host.name} className="tooltip-host-avatar" />
                          <span>by {selectedCommunity.host.name.split(' ')[0]}</span>
                        </div>
                        <button className="tooltip-close-btn-overlay" onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}>
                          <X size={12} />
                        </button>
                      </div>

                      <div className="community-tooltip-details" style={{ cursor: 'pointer' }} onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }} title="View Event Details">
                        <h3 className="community-tooltip-title">{selectedCommunity.name}</h3>
                        <div className="community-tooltip-meta">
                          <span>{selectedCommunity.dateStr} at {selectedCommunity.timeStr}</span>
                          <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{selectedCommunity.distance}</span>
                          </div>
                        </div>
                      </div>

                      <div className="community-tooltip-attendees-section">
                        <span className="community-members-label">Members joined</span>
                        <div className="attendee-stack">
                          {selectedCommunity.attendees.slice(0, 3).map((attendee, idx) => (
                            <img
                              key={idx}
                              src={attendee.avatar}
                              alt={attendee.name}
                              className="attendee-avatar"
                              style={{ zIndex: 3 - idx }}
                            />
                          ))}
                          {selectedCommunity.attendees.length > 3 && (
                            <div className="attendee-excess" style={{ zIndex: 0 }}>
                              +{selectedCommunity.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
