import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Phone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Video,
  X,
  PhoneCall,
  Laptop,
  Network,
  Menu,
  Sun,
  Moon,
  Compass,
  Map
} from 'lucide-react';
import './AppLayout.css';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { callState, acceptCall, endCall, users, triggerIncomingCall } = useCommunication();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const menuItems = [
    { path: '/network', label: 'Network', icon: Network },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/community-map', label: 'Map View', icon: Map },
    { path: '/explore-communities', label: 'Discover', icon: Compass },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/chat', label: 'Messages', icon: MessageSquare },
    { path: '/call', label: 'Voice & Video', icon: Phone },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to trigger a simulation of an incoming call for testing
  const handleTriggerSimulatedCall = (type: 'audio' | 'video') => {
    const availableCallers = users.filter(u => u.status === 'online');
    const randomCaller = availableCallers[Math.floor(Math.random() * availableCallers.length)] || users[0];
    triggerIncomingCall(randomCaller, type);
  };

  return (
    <div className="app-container" onClick={() => setMobileMenuOpen(false)}>
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-glow-dot" />
            <span className="logo-text">COMMUNITY</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <div className="nav-item-glow" />
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at Sidebar Bottom */}
        <div className="sidebar-footer">
          <Link to={`/profile/${user.id}`} className="sidebar-user-card">
            <img src={user.avatar} alt={user.name} className="sidebar-avatar" />
            <div className="sidebar-user-details">
              <span className="sidebar-username">{user.name}</span>
              <span className="sidebar-userrole">{user.role}</span>
            </div>
          </Link>
          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="main-workspace">
        <header className="workspace-header glass-panel" onClick={(e) => e.stopPropagation()}>
          <div className="header-breadcrumbs">
            <button
              className="mobile-menu-toggle"
              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2>
              {location.pathname === '/dashboard' && 'Core Console'}
              {location.pathname === '/community-map' && 'Community Map'}
              {location.pathname === '/explore-communities' && 'Discover Circles'}
              {location.pathname === '/community' && 'Network Directory'}
              {location.pathname === '/chat' && 'Quantum Encrypted Chats'}
              {location.pathname === '/call' && 'Teleportation Node'}
              {location.pathname.startsWith('/profile') && 'Identity Matrix'}
            </h2>
          </div>

          <div className="header-actions">
            {/* Call State Floating Alert inside Header if call is active but we are elsewhere */}
            {callState.status === 'connected' && location.pathname !== '/call' && (
              <Link to="/call" className="floating-call-badge">
                <span className="pulse-red-dot" />
                <span>Call Active ({callState.type})</span>
              </Link>
            )}

            {/* Inbound Call Simulator Quick Actions */}
            {/* <div className="tester-pill">
              <span className="tester-label">Simulate Inbound:</span>
              <button
                className="tester-btn btn-cyan"
                onClick={() => handleTriggerSimulatedCall('audio')}
                disabled={callState.status !== 'idle'}
              >
                <Phone size={12} /> Voice
              </button>
              <button
                className="tester-btn btn-violet"
                onClick={() => handleTriggerSimulatedCall('video')}
                disabled={callState.status !== 'idle'}
              >
                <Video size={12} /> Video
              </button>
            </div>

            <div className="system-indicator">
              <Laptop size={16} />
              <span>DevMode ACTIVE</span>
            </div> */}

            <button
              className="theme-toggle-btn btn-icon"
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
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
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                className="mobile-nav-link"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
              </button>
              <button
                className="mobile-nav-link logout-link"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className={`workspace-content${location.pathname === '/community-map' ? ' workspace-content--map' : ''}`}>
          {children}
        </main>
      </div>

      {/* Global Inbound Call Modal Overlay */}
      {callState.status === 'incoming' && callState.currentCall && (
        <div className="incoming-call-overlay">
          <div className="incoming-call-modal glass-panel">
            <div className="modal-glow-bg" />
            <div className="caller-info">
              <div className="caller-avatar-wrapper">
                <img
                  src={callState.currentCall.avatar}
                  alt={callState.currentCall.name}
                  className="caller-avatar"
                />
                <div className="incoming-pulse" />
              </div>
              <h3>{callState.currentCall.name}</h3>
              <p className="caller-role">{callState.currentCall.role}</p>
              <span className="call-type-indicator">
                Incoming {callState.type === 'video' ? 'Video Call...' : 'Audio Call...'}
              </span>
            </div>

            <div className="call-actions">
              <button
                className="accept-call-btn"
                onClick={() => {
                  acceptCall();
                  navigate('/call');
                }}
              >
                <PhoneCall size={22} />
                <span>Accept</span>
              </button>
              <button className="decline-call-btn" onClick={endCall}>
                <X size={22} />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
