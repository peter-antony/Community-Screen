import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, MessageSquare, Video, ArrowRight } from 'lucide-react';
import { CanvasBackground } from '../components/CanvasBackground';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }
    }
  };

  const featureCards = [
    {
      icon: MessageSquare,
      title: 'Quantum Chat',
      desc: 'Instant, encrypted message channels with typing simulations and file share integration.',
      color: 'cyan'
    },
    {
      icon: Video,
      title: 'Cinematic Calls',
      desc: 'Crystal-clear audio and video calling featuring real-time audio soundbars and visual streams.',
      color: 'violet'
    },
    {
      icon: Shield,
      title: 'Secure Nodes',
      desc: 'Robust client-side privacy controls. Your communication is sandboxed and encrypted.',
      color: 'rose'
    }
  ];

  return (
    <div className="landing-page">
      <CanvasBackground />

      <header className="landing-header">
        <div className="logo-container">
          <div className="logo-glow-dot" />
          <span className="logo-text">COMMUNITY</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </header>

      <main className="landing-main">
        <motion.div
          className="hero-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="badge-wrapper" variants={itemVariants}>
            <div className="cyber-badge">
              <Zap size={12} className="text-cyan animate-pulse" />
              <span>COMMUNITY OVERLAY PROTOCOL V3.0</span>
            </div>
          </motion.div>

          <motion.h1 className="hero-title" variants={itemVariants}>
            Next-Gen Space for <br />
            <span className="gradient-text-cyan-violet">Digital Pioneers</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={itemVariants}>
            A premium network dashboard engineered for collaborative creators. Connect instantly via quantum chats, video portals, and rich profiles designed with cinematic aesthetics.
          </motion.p>

          <motion.div className="cta-wrapper" variants={itemVariants}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              <span>Enter Console</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Features Grid */}
        <motion.section
          className="features-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="section-header">
            <span className="section-tag">Core Modules</span>
            <h2>Platform Architecture</h2>
          </div>

          <div className="features-grid">
            {featureCards.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className={`feature-card glass-panel glass-panel-hover float-animation`}
                  style={{ animationDelay: `${index * 1.5}s` }}
                >
                  <div className={`icon-wrapper ${feat.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Global Statistics */}
        <section className="stats-section">
          <div className="stats-grid glass-panel">
            <div className="stat-item">
              <span className="stat-value text-cyan">99.9%</span>
              <span className="stat-label">Console Uptime</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value text-violet">25.4k</span>
              <span className="stat-label">Pioneers Online</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value text-rose">&lt; 15ms</span>
              <span className="stat-label">Audio Latency</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© 2026 Antigravity Inc. Powered by Vite & React.</span>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#docs">API Docs</a>
        </div>
      </footer>
    </div>
  );
};
