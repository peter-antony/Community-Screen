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
  Moon
} from 'lucide-react';
import type { User, CommunityItem } from '../types';
import './NetworkConstellationPage.css';
import { supabase } from '../supabaseClient';

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
      ? { inner: 0.29, outer: 0.47, center: 0.18, innerSat: 0.18, outerSat: 0.1 }
      : isTablet
        ? { inner: 0.28, outer: 0.47, center: 0.17, innerSat: 0.17, outerSat: 0.09 }
        : w <= 1024
          ? { inner: 0.28, outer: 0.46, center: 0.16, innerSat: 0.16, outerSat: 0.085 }
          : { inner: 0.28, outer: 0.46, center: 0.16, innerSat: 0.16, outerSat: 0.08 };

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
  const { toggleFollow, startCall, setActiveChatUserId } = useCommunication();
  const navigate = useNavigate();

  const [communities, setCommunities] = useState<CommunityItem[]>([])

  useEffect(() => {
    console.log("communities: ", communities)
    fetchCommunities();
  }, []);

  // GET - fetch all
  const fetchCommunities = async () => {
    console.log("fetched communities...")
    const { data, error } = await supabase
      .from('community_list')
      .select('*')
    console.log("data success ==", data);
    console.log("error ==", error);
    if (error) {
      console.error(error)
    } else if (data) {
      const mapped = data.map((c) => ({
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
      }))
      setCommunities(mapped)
    }
  }


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

  const THEME_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
    football: { border: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)', text: '#22c55e', bg: 'rgba(34, 197, 94, 0.05)' },
    cricket: { border: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', text: '#eab308', bg: 'rgba(234, 179, 8, 0.05)' },
    music: { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', text: '#a855f7', bg: 'rgba(168, 85, 247, 0.05)' },
    party: { border: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', text: '#ec4899', bg: 'rgba(236, 72, 153, 0.05)' },
    travel: { border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)', text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.05)' },
    drinks: { border: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', text: '#f97316', bg: 'rgba(249, 115, 22, 0.05)' },
  };

  const themeColorInfo = selectedCommunity
    ? (THEME_COLORS[selectedCommunity.theme] || THEME_COLORS.music)
    : THEME_COLORS.music;

  const customThemeVars = {
    '--theme-border': themeColorInfo.border,
    '--theme-glow': themeColorInfo.glow,
    '--theme-text': themeColorInfo.text,
    '--theme-bg': themeColorInfo.bg,
  } as React.CSSProperties;

  const generateScatterOffsets = (count: number, maxRadius: number) => {
    const offsets: { x: number; y: number }[] = [];
    const ringRadii = [85, 135, 185, 235];
    const ringCapacities = [8, 6, 6, 4];

    // Scale radii if maxRadius is smaller (like on mobile)
    const scale = maxRadius / 240;
    const scaledRadii = ringRadii.map(r => r * scale);

    let placed = 0;
    for (let r = 0; r < scaledRadii.length && placed < count; r++) {
      const radius = scaledRadii[r];
      const capacity = Math.min(ringCapacities[r], count - placed);

      for (let i = 0; i < capacity; i++) {
        // Distribute angles evenly around this ring
        const angleOffset = r % 2 === 1 ? Math.PI / capacity : 0;
        const angle = (2 * Math.PI * i) / capacity - Math.PI / 2 + angleOffset;
        offsets.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        placed++;
      }
    }
    // If there are still more members, distribute them on outer concentric rings
    let extraRing = 0;
    while (placed < count) {
      const radius = (235 + (extraRing + 1) * 40) * scale;
      const capacity = Math.min(8, count - placed);
      for (let i = 0; i < capacity && placed < count; i++) {
        const angle = (2 * Math.PI * i) / capacity - Math.PI / 2 + (extraRing % 2 === 1 ? Math.PI / capacity : 0);
        offsets.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        placed++;
      }
      extraRing++;
    }
    return offsets;
  };

  const getMemberNodeSize = (count: number): number => {
    if (count <= 8) return 32;
    if (count <= 16) return 28;
    if (count <= 30) return 24;
    return 20;
  };

  const getProfileIdByName = (name: string): string => {
    if (name.includes('Alex')) return 'current_user_1';
    if (name.includes('Sophia')) return 'user_1';
    if (name.includes('Marcus')) return 'user_2';
    if (name.includes('Elena')) return 'user_3';
    if (name.includes('David')) return 'user_4';
    if (name.includes('Aisha')) return 'user_5';
    if (name.includes('Leo')) return 'user_6';
    if (name.includes('Ravi')) return 'user_7';
    if (name.includes('Priya')) return 'user_8';
    if (name.includes('Arjun')) return 'user_9';
    if (name.includes('Meera')) return 'user_10';
    if (name.includes('Karthik')) return 'user_11';
    if (name.includes('Nisha')) return 'user_12';
    if (name.includes('Vikram')) return 'user_13';
    if (name.includes('Anjali')) return 'user_14';
    if (name.includes('Rohan')) return 'user_15';
    if (name.includes('Sneha')) return 'user_16';
    if (name.includes('Pranav')) return 'user_17';
    if (name.includes('Divya')) return 'user_18';
    if (name.includes('Suresh')) return 'user_19';
    if (name.includes('Lakshmi')) return 'user_20';
    if (name.includes('Amit')) return 'user_21';
    return 'user_1';
  };

  const getCommunityTooltipSize = (item: CommunityItem | null): number => {
    if (!item) return 300;
    const membersCount = [item.host, ...item.attendees].length;
    if (membersCount <= 6) return Math.max(200, 160 + membersCount * 22);
    if (membersCount <= 12) return 280 + (membersCount - 6) * 15;
    if (membersCount <= 25) return 370 + (membersCount - 12) * 10;
    return Math.min(700, 500 + (membersCount - 25) * 5);
  };

  const THEME_EMOJIS: Record<string, string> = {
    football: '⚽',
    cricket: '🏏',
    music: '🎵',
    party: '🎉',
    travel: '✈️',
    drinks: '🍹'
  };

  // Distribute communities in orbits: 6 in inner circle, 6 in outer circle
  const innerOrbitNodes = communities.slice(0, 6).map(c => ({
    type: 'community' as const,
    id: c.id,
    name: c.name,
    avatar: c.image,
    data: c
  }));

  const outerOrbitNodes = communities.slice(6).map(c => ({
    type: 'community' as const,
    id: c.id,
    name: c.name,
    avatar: c.image,
    data: c
  }));


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
      const tooltipWidth = type === 'community' ? 340 : 280;
      const tooltipHeight = type === 'community' ? 600 : 220;
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
              <img src={authUser.avatar} alt={authUser.name} className="silhouette-icon" />
              {/* <UserIcon size={stage.centerSize * 0.45} className="silhouette-icon" /> */}
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
                  width: 45,
                  height: 45,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, node.data, node.type)}
              >
                <div className={`satellite-glow-ring ${isCommunity ? `community-glow ${node.data.theme}-glow` : node.data.status}`} />
                <img src={node.avatar} alt={node.name} className="node-avatar-img" />
                {isCommunity && (
                  <div className={`node-group-badge ${node.data.theme}-badge`}>
                    <span style={{ fontSize: '10px', lineHeight: 1 }}>{THEME_EMOJIS[node.data.theme]}</span>
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
                  width: 45,
                  height: 45,
                  transform: `translate(-50%, -50%)`,
                  left: `calc(50% + ${coords.x}px)`,
                  top: `calc(50% + ${coords.y}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + 0.05 * idx, type: 'spring' }}
                onClick={(e) => handleNodeClick(e, node.data, node.type)}
              >
                <div className={`satellite-glow-ring ${isCommunity ? `community-glow ${node.data.theme}-glow` : node.data.status}`} />
                <img src={node.avatar} alt={node.name} className="node-avatar-img" />
                {isCommunity && (
                  <div className={`node-group-badge ${node.data.theme}-badge`}>
                    <span style={{ fontSize: '8px', lineHeight: 1 }}>{THEME_EMOJIS[node.data.theme]}</span>
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
                  className={`mobile-detail-sheet glass-panel ${selectedNode.type === 'community' ? 'community-sheet' : ''}`}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  style={selectedNode.type === 'community' && selectedCommunity ? {
                    borderColor: 'var(--theme-border)',
                    boxShadow: '0 -10px 30px var(--theme-glow)',
                    background: 'rgba(3, 7, 18, 0.98)',
                    ...customThemeVars
                  } : {}}
                >
                  {selectedNode.type === 'user' && selectedUser ? (
                    <>
                      <div className="sheet-handle" />
                      <button className="sheet-close-btn" onClick={() => setSelectedNode(null)}>
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
                    selectedCommunity && (() => {
                      const mobileMembers = [selectedCommunity.host, ...selectedCommunity.attendees];
                      const mobileContainerSize = 300;
                      const mobileMaxRadius = mobileContainerSize / 2;
                      const mobileOffsets = generateScatterOffsets(mobileMembers.length, mobileMaxRadius);
                      const mobileNodeSize = getMemberNodeSize(mobileMembers.length);
                      const scale = mobileMaxRadius / 240;
                      const ringRadii = [85, 135, 185, 235].map(r => r * scale);
                      return (
                        <div className="community-mini-constellation-container" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                          <button className="community-close-btn-new" onClick={() => setSelectedNode(null)}>
                            <X size={14} />
                          </button>

                          <div className="community-mini-constellation" style={{ width: mobileContainerSize, height: mobileContainerSize, minHeight: mobileContainerSize, alignSelf: 'center', position: 'relative' }}>
                            {/* Orbit Rings */}
                            {ringRadii.map((radius, rIdx) => (
                              <div
                                key={rIdx}
                                className="mini-orbit-ring"
                                style={{
                                  width: radius * 2,
                                  height: radius * 2,
                                  borderColor: 'var(--theme-border)',
                                  opacity: 0.15 + (rIdx * 0.03),
                                }}
                              />
                            ))}

                            {/* Centered Name */}
                            <div
                              className="mini-constellation-center"
                              onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}
                            >
                              <h3>{selectedCommunity.name}</h3>
                              <span className="view-details-sub">View Details →</span>
                            </div>

                            {/* Orbiting Member Nodes */}
                            {mobileMembers.map((member, idx) => {
                              const offset = mobileOffsets[idx] || { x: 0, y: 0 };
                              const profileId = getProfileIdByName(member.name);
                              return (
                                <div
                                  key={idx}
                                  className={`mini-member-node float-anim-${(idx % 3) + 1}`}
                                  style={{
                                    width: mobileNodeSize,
                                    height: mobileNodeSize,
                                    left: `calc(50% + ${offset.x}px)`,
                                    top: `calc(50% + ${offset.y}px)`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(null);
                                    navigate(`/profile/${profileId}`);
                                  }}
                                  title={`${member.name} (View Profile)`}
                                >
                                  <img src={member.avatar} alt={member.name} className="mini-member-img" />
                                  <span className="mini-member-glow" />
                                </div>
                              );
                            })}
                          </div>

                          <div className="community-sparkle-ornament">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
                            </svg>
                          </div>
                        </div>
                      );
                    })()
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
                  ...(selectedNode.type === 'community' && selectedCommunity ? {
                    width: getCommunityTooltipSize(selectedCommunity),
                    height: getCommunityTooltipSize(selectedCommunity),
                    borderColor: 'var(--theme-border)',
                    boxShadow: '0 0 25px var(--theme-glow), inset 0 0 15px rgba(0, 0, 0, 0.6)',
                    background: 'rgba(3, 7, 18, 0.98)',
                  } : {}),
                  ...customThemeVars
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
                    <div className="community-mini-constellation-container">
                      <button className="community-close-btn-new" onClick={() => setSelectedNode(null)}>
                        <X size={14} />
                      </button>

                      <div className="community-mini-constellation">
                        {/* Centered Name */}
                        <div
                          className="mini-constellation-center"
                          onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}
                          title="View Event Details"
                        >
                          <h3>{selectedCommunity.name}</h3>
                          <span className="view-details-sub">View Details →</span>
                        </div>

                        {/* Orbiting Member Nodes */}
                        {(() => {
                          const desktopMembers = [selectedCommunity.host, ...selectedCommunity.attendees];
                          const desktopMaxRadius = 240;
                          const desktopOffsets = generateScatterOffsets(desktopMembers.length, desktopMaxRadius);
                          const nodeSize = getMemberNodeSize(desktopMembers.length);
                          const ringRadii = [85, 135, 185, 235];
                          return (
                            <>
                              {/* Orbit Rings */}
                              {ringRadii.map((radius, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="mini-orbit-ring"
                                  style={{
                                    width: radius * 2,
                                    height: radius * 2,
                                    borderColor: 'var(--theme-border)',
                                    opacity: 0.15 + (rIdx * 0.03),
                                  }}
                                />
                              ))}

                              {/* Orbiting Member Images */}
                              {desktopMembers.map((member, idx) => {
                                const offset = desktopOffsets[idx] || { x: 0, y: 0 };
                                const profileId = getProfileIdByName(member.name);
                                return (
                                  <div
                                    key={idx}
                                    className={`mini-member-node float-anim-${(idx % 3) + 1}`}
                                    style={{
                                      width: nodeSize,
                                      height: nodeSize,
                                      left: `calc(50% + ${offset.x}px)`,
                                      top: `calc(50% + ${offset.y}px)`,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedNode(null);
                                      navigate(`/profile/${profileId}`);
                                    }}
                                    title={`${member.name} (View Profile)`}
                                  >
                                    <img src={member.avatar} alt={member.name} className="mini-member-img" />
                                    <span className="mini-member-glow" />
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>

                      <div className="community-sparkle-ornament">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
                        </svg>
                      </div>
                    </div>
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
