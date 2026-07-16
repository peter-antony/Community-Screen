import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { useTheme } from '../context/ThemeContext';
import { CanvasBackground } from '../components/CanvasBackground';
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
  Moon
} from 'lucide-react';
import type { User } from '../types';
import './NetworkConstellationPage.css';

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
      ? { inner: 0.16, mid: 0.3, outer: 0.44, center: 0.12, sat: 0.085 }
      : isTablet
        ? { inner: 0.17, mid: 0.31, outer: 0.45, center: 0.12, sat: 0.08 }
        : w <= 1024
          ? { inner: 0.15, mid: 0.28, outer: 0.42, center: 0.11, sat: 0.075 }
          : { inner: 0.14, mid: 0.27, outer: 0.42, center: 0.1, sat: 0.07 };

    return {
      stageSize: size,
      innerRadius: Math.max(size * ratios.inner, isMobile ? 45 : 60),
      midRadius: Math.max(size * ratios.mid, isMobile ? 85 : 110),
      outerRadius: Math.max(size * ratios.outer, isMobile ? 120 : 160),
      centerSize: Math.max(size * ratios.center, isMobile ? 38 : 50),
      satelliteSize: Math.max(size * ratios.sat, isMobile ? 28 : 36),
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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stage = useStageSize();

  if (!authUser) return null;

  // Distribute users dynamically across 3 orbit rings
  const satelliteUsers = users.filter(u => u.id !== authUser.id);
  const total = satelliteUsers.length;
  // Split into roughly equal thirds: inner gets ~30%, mid ~35%, outer rest
  const innerCount = Math.round(total * 0.3);
  const midCount = Math.round(total * 0.35);
  const innerOrbitUsers = satelliteUsers.slice(0, innerCount);
  const midOrbitUsers = satelliteUsers.slice(innerCount, innerCount + midCount);
  const outerOrbitUsers = satelliteUsers.slice(innerCount + midCount);

  const getCoordinates = (index: number, count: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y };
  };

  const handleNodeClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    if (stage.isMobile || stage.isTablet) {
      // On mobile/tablet, show bottom sheet — no position needed
      setSelectedUser(prev => prev?.id === user.id ? null : user);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 220; // safe estimation of max height
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
      setSelectedUser(prev => prev?.id === user.id ? null : user);
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

  const svgCenter = stage.stageSize / 2;

  return (
    <div className="constellation-page" onClick={() => { setSelectedUser(null); setMobileMenuOpen(false); }}>
      <CanvasBackground />

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

          {/* Background SVG Orbits & Geometric Lines */}
          <svg className="constellation-svg" viewBox={`0 0 ${stage.stageSize} ${stage.stageSize}`}>
            {/* Concentric Orbit Paths */}
            <circle cx={svgCenter} cy={svgCenter} r={stage.innerRadius} className="orbit-circle orbit-inner-path" />
            <circle cx={svgCenter} cy={svgCenter} r={stage.midRadius} className="orbit-circle orbit-mid-path" />
            <circle cx={svgCenter} cy={svgCenter} r={stage.outerRadius} className="orbit-circle orbit-outer-path" />

            {/* Elliptical Overlay Paths */}
            <ellipse cx={svgCenter} cy={svgCenter} rx={stage.outerRadius} ry={stage.midRadius} className="orbit-ellipse ellipse-1" />
            <ellipse cx={svgCenter} cy={svgCenter} rx={stage.outerRadius} ry={stage.innerRadius} className="orbit-ellipse ellipse-2" />

            {/* Connection Lines — Inner */}
            {innerOrbitUsers.map((_, idx) => {
              const coords = getCoordinates(idx, innerOrbitUsers.length, stage.innerRadius);
              return (
                <line
                  key={`line-inner-${idx}`}
                  x1={svgCenter}
                  y1={svgCenter}
                  x2={svgCenter + coords.x}
                  y2={svgCenter + coords.y}
                  className="connector-line line-cyan"
                />
              );
            })}

            {/* Connection Lines — Middle */}
            {midOrbitUsers.map((_, idx) => {
              const coords = getCoordinates(idx, midOrbitUsers.length, stage.midRadius);
              return (
                <line
                  key={`line-mid-${idx}`}
                  x1={svgCenter}
                  y1={svgCenter}
                  x2={svgCenter + coords.x}
                  y2={svgCenter + coords.y}
                  className="connector-line line-violet"
                />
              );
            })}

            {/* Connection Lines — Outer */}
            {outerOrbitUsers.map((_, idx) => {
              const coords = getCoordinates(idx, outerOrbitUsers.length, stage.outerRadius);
              return (
                <line
                  key={`line-outer-${idx}`}
                  x1={svgCenter}
                  y1={svgCenter}
                  x2={svgCenter + coords.x}
                  y2={svgCenter + coords.y}
                  className="connector-line line-rose"
                />
              );
            })}
          </svg>

          {/* Ambient Dust Particles */}
          <div className="ambient-particles">
            <span className="dust p-pink" style={{ top: '35%', left: '25%' }} />
            <span className="dust p-purple" style={{ top: '65%', left: '72%' }} />
            <span className="dust p-orange" style={{ top: '22%', left: '60%' }} />
            <span className="dust p-pink" style={{ top: '50%', left: '80%' }} />
            <span className="dust p-green" style={{ top: '78%', left: '32%' }} />
            <span className="dust p-purple" style={{ top: '15%', left: '38%' }} />
          </div>

          {/* CENTRAL NODE (Logged In User) */}
          <motion.div
            className="constellation-node center-node"
            style={{ width: stage.centerSize, height: stage.centerSize }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            onClick={() => navigate(`/profile/${authUser.id}`)}
          >
            <div className="center-node-glow" style={{ width: stage.centerSize * 1.75, height: stage.centerSize * 1.75 }} />
            <img src={authUser.avatar} alt={authUser.name} className="node-avatar-img" />
            <span className="node-pulse-ring" />
          </motion.div>

          {/* INNER SATELLITE NODES */}
          {innerOrbitUsers.map((satellite, idx) => {
            const coords = getCoordinates(idx, innerOrbitUsers.length, stage.innerRadius);
            return (
              <motion.div
                key={satellite.id}
                className="constellation-node satellite-node inner-sat"
                style={{
                  width: stage.satelliteSize,
                  height: stage.satelliteSize,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, satellite)}
              >
                <div className={`satellite-glow-ring ${satellite.status}`} />
                <img src={satellite.avatar} alt={satellite.name} className="node-avatar-img" />
              </motion.div>
            );
          })}

          {/* MIDDLE SATELLITE NODES */}
          {midOrbitUsers.map((satellite, idx) => {
            const coords = getCoordinates(idx, midOrbitUsers.length, stage.midRadius);
            return (
              <motion.div
                key={satellite.id}
                className="constellation-node satellite-node mid-sat"
                style={{
                  width: stage.satelliteSize,
                  height: stage.satelliteSize,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + 0.08 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, satellite)}
              >
                <div className={`satellite-glow-ring ${satellite.status}`} />
                <img src={satellite.avatar} alt={satellite.name} className="node-avatar-img" />
              </motion.div>
            );
          })}

          {/* OUTER SATELLITE NODES */}
          {outerOrbitUsers.map((satellite, idx) => {
            const coords = getCoordinates(idx, outerOrbitUsers.length, stage.outerRadius);
            return (
              <motion.div
                key={satellite.id}
                className="constellation-node satellite-node outer-sat"
                style={{
                  width: stage.satelliteSize,
                  height: stage.satelliteSize,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + 0.06 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, satellite)}
              >
                <div className={`satellite-glow-ring ${satellite.status}`} />
                <img src={satellite.avatar} alt={satellite.name} className="node-avatar-img" />
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Tooltip / Detail Card */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Mobile/Tablet: Bottom Sheet Overlay */}
            {(stage.isMobile || stage.isTablet) ? (
              <>
                <motion.div
                  className="mobile-overlay-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedUser(null)}
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
                  <button className="sheet-close-btn" onClick={() => setSelectedUser(null)}>
                    <X size={18} />
                  </button>

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

                  {/* <div className="sheet-actions">
                    <button
                      className={`sheet-btn-follow ${selectedUser.isFollowing ? 'following' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFollow(selectedUser.id); }}
                    >
                      {selectedUser.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      <span>{selectedUser.isFollowing ? 'Following' : 'Follow'}</span>
                    </button>

                    <button
                      className="sheet-action-btn btn-icon-cyan"
                      onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedUser.id); }}
                    >
                      <MessageSquare size={18} />
                      <span>Message</span>
                    </button>

                    <button
                      className="sheet-action-btn btn-icon-violet"
                      onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser as any, 'audio'); }}
                      disabled={selectedUser.status === 'offline'}
                    >
                      <Phone size={18} />
                      <span>Call</span>
                    </button>

                    <button
                      className="sheet-action-btn btn-icon-rose"
                      onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser as any, 'video'); }}
                      disabled={selectedUser.status === 'offline'}
                    >
                      <Video size={18} />
                      <span>Video</span>
                    </button>
                  </div> */}

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
                        onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser as any, 'audio'); }}
                        disabled={selectedUser.status === 'offline'}
                        title="Audio Link"
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        className="btn-icon btn-icon-rose"
                        onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser as any, 'video'); }}
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
                </motion.div>
              </>
            ) : (
              /* Desktop: Floating Glass Tooltip */
              <motion.div
                className="constellation-tooltip glass-panel"
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
                      onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser as any, 'audio'); }}
                      disabled={selectedUser.status === 'offline'}
                      title="Audio Link"
                    >
                      <Phone size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon-rose"
                      onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser as any, 'video'); }}
                      disabled={selectedUser.status === 'offline'}
                      title="Video Stream"
                    >
                      <Video size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
