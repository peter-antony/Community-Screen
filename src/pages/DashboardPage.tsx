import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Phone,
  Activity,
  Sparkles,
  ArrowUpRight,
  Heart,
  TrendingUp
} from 'lucide-react';
import './DashboardPage.css';

interface ConsoleActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'follow' | 'chat' | 'call' | 'system';
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { users, messages } = useCommunication();
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ConsoleActivity[]>([
    { id: '1', user: 'Sophia Chen', action: 'updated UI mockup design assets', time: 'Just now', type: 'system' },
    { id: '2', user: 'Marcus Vance', action: 'initiated a code optimization push', time: '2m ago', type: 'system' },
    { id: '3', user: 'Aisha Rahman', action: 'joined the voice channel', time: '15m ago', type: 'call' },
    { id: '4', user: 'Elena Rostova', action: 'sent you a workspace invite', time: '1h ago', type: 'chat' }
  ]);

  // Telemetry states
  const [telemetry, setTelemetry] = useState({ cpu: 42, ram: 58, ping: 24 });

  // Simulate active system logs ticking
  useEffect(() => {
    const activityInterval = setInterval(() => {
      const names = ['Sophia Chen', 'Marcus Vance', 'Elena Rostova', 'David Kim', 'Aisha Rahman', 'Leo Fontaine'];
      const actions = [
        'synchronized a new git branch',
        'went online from London',
        'updated their status to Away',
        'uploaded custom Spline coordinates',
        'linked a Figma Design file',
        'ended an encrypted communication call'
      ];
      const types: ('follow' | 'chat' | 'call' | 'system')[] = ['system', 'chat', 'follow', 'call'];

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];

      const newActivity: ConsoleActivity = {
        id: `act_${Date.now()}`,
        user: randomName,
        action: randomAction,
        time: 'Just now',
        type: randomType
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 8000);

    const telemetryInterval = setInterval(() => {
      setTelemetry({
        cpu: Math.floor(35 + Math.random() * 15),
        ram: Math.floor(55 + Math.random() * 5),
        ping: Math.floor(20 + Math.random() * 8)
      });
    }, 3000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  const totalFollowers = users.reduce((acc, u) => acc + (u.isFollowing ? 1 : 0), 0);
  const unreadMessages = messages.filter(m => !m.isRead && m.senderId !== 'current_user_1').length;

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="welcome-banner glass-panel">
        <div className="banner-glow-bg" />
        <div className="welcome-info">
          <div className="welcome-tag">
            <Sparkles size={14} className="welcome-spark" />
            <span>OPERATIONAL SYSTEM ONLINE</span>
          </div>
          <h1>System Console, {user?.name}</h1>
          <p>Deploy assets, connect with peers, and initialize calling interfaces.</p>
        </div>
        <div className="welcome-meta">
          <span className="meta-time">{new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <span className="meta-status"><span className="pulse-green-dot" /> Encryption Layer Active</span>
        </div>
      </section>

      {/* Grid Statistics */}
      <section className="dashboard-grid">
        <div className="stat-card glass-panel glass-panel-hover" onClick={() => navigate('/community')}>
          <div className="stat-card-icon cyan">
            <Users size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Network Directory</span>
            <span className="stat-num">{users.length} Users</span>
            <span className="stat-sub">Active Pioneers</span>
          </div>
          <ArrowUpRight size={18} className="card-arrow" />
        </div>

        <div className="stat-card glass-panel glass-panel-hover" onClick={() => navigate('/chat')}>
          <div className="stat-card-icon violet">
            <MessageSquare size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Quantum Encrypted Chats</span>
            <span className="stat-num">{unreadMessages > 0 ? unreadMessages : messages.length}</span>
            <span className="stat-sub">{unreadMessages > 0 ? 'Unread messages' : 'Messages total'}</span>
          </div>
          <ArrowUpRight size={18} className="card-arrow" />
        </div>

        <div className="stat-card glass-panel glass-panel-hover" onClick={() => navigate('/call')}>
          <div className="stat-card-icon rose">
            <Phone size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Active Connection Portals</span>
            <span className="stat-num">Audio / Video</span>
            <span className="stat-sub">Ultra-low Latency</span>
          </div>
          <ArrowUpRight size={18} className="card-arrow" />
        </div>

        <div className="stat-card glass-panel glass-panel-hover" onClick={() => navigate('/community')}>
          <div className="stat-card-icon amber">
            <Heart size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Following Pioneers</span>
            <span className="stat-num">{totalFollowers} Nodes</span>
            <span className="stat-sub">Network Connections</span>
          </div>
          <ArrowUpRight size={18} className="card-arrow" />
        </div>
      </section>

      <section className="dashboard-content-layout">
        {/* Weekly Activities Vector Plot */}
        <div className="chart-wrapper glass-panel">
          <div className="chart-header">
            <div>
              <h3>Quantum Traffic Frequency</h3>
              <p>Weekly communication transmission volume</p>
            </div>
            <div className="chart-badge">
              <TrendingUp size={14} />
              <span>+18.4%</span>
            </div>
          </div>

          <div className="chart-svg-container">
            <svg viewBox="0 0 500 180" className="chart-svg">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="chart-glow-violet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-violet)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.03)" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.03)" />

              {/* Area Plots */}
              <path
                d="M 0 160 Q 70 80 140 100 T 280 40 T 420 110 L 500 90 L 500 180 L 0 180 Z"
                fill="url(#chart-glow)"
              />
              <path
                d="M 0 160 Q 70 80 140 100 T 280 40 T 420 110 L 500 90"
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M 0 170 Q 60 120 150 130 T 300 80 T 410 140 L 500 120 L 500 180 L 0 180 Z"
                fill="url(#chart-glow-violet)"
              />
              <path
                d="M 0 170 Q 60 120 150 130 T 300 80 T 410 140 L 500 120"
                fill="none"
                stroke="var(--accent-violet)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />

              {/* Data Node Points */}
              <circle cx="280" cy="40" r="5" fill="var(--accent-cyan)" stroke="var(--bg-primary)" strokeWidth="2" />
              <circle cx="420" cy="110" r="4" fill="var(--accent-violet)" stroke="var(--bg-primary)" strokeWidth="2" />
            </svg>
          </div>

          <div className="chart-footer">
            <span className="footer-day">Mon</span>
            <span className="footer-day">Tue</span>
            <span className="footer-day">Wed</span>
            <span className="footer-day">Thu</span>
            <span className="footer-day">Fri</span>
            <span className="footer-day">Sat</span>
            <span className="footer-day">Sun</span>
          </div>
        </div>

        <div className="dashboard-sidebar-widgets">
          {/* Telemetry Panel */}
          <div className="telemetry-panel glass-panel">
            <h3>System Telemetry</h3>
            <div className="telemetry-grid">
              <div className="telemetry-item">
                <div className="telemetry-label">CPU LOAD</div>
                <div className="telemetry-value text-cyan">{telemetry.cpu}%</div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill cyan" style={{ width: `${telemetry.cpu}%` }} />
                </div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">RAM ALLOC</div>
                <div className="telemetry-value text-violet">{telemetry.ram}%</div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill violet" style={{ width: `${telemetry.ram}%` }} />
                </div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">NETWORK LATENCY</div>
                <div className="telemetry-value text-rose">{telemetry.ping} ms</div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill rose" style={{ width: `${(telemetry.ping / 50) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Console Activity Feed */}
          <div className="activity-feed glass-panel">
            <div className="feed-header">
              <h3>Telemetry Log</h3>
              <Activity size={16} className="text-cyan animate-pulse" />
            </div>

            <div className="feed-list">
              <AnimatePresence initial={false}>
                {activities.map((act) => (
                  <motion.div
                    key={act.id}
                    className="feed-item"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <div className={`feed-dot ${act.type}`} />
                    <div className="feed-details">
                      <p>
                        <span className="feed-user">{act.user}</span>{' '}
                        <span className="feed-action">{act.action}</span>
                      </p>
                      <span className="feed-time">{act.time}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
