import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CanvasBackground } from '../components/CanvasBackground';
import { LogIn, Key, Mail } from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide a simulation key and passcode.');
      return;
    }

    // Standard mock login as Creative Developer
    login('creative_developer');
    navigate('/network');
  };

  // const handleQuickLogin = (role: 'creative_developer' | 'designer' | 'guest') => {
  //   login(role);
  //   navigate('/network');
  // };

  return (
    <div className="login-page">
      <CanvasBackground />

      <div className="login-container">
        <div className="login-card glass-panel">
          <div className="login-glow-bg" />

          <div className="login-header">
            <div className="logo-container logo-center">
              <div className="logo-glow-dot" />
              <span className="logo-text">COMMUNITY</span>
            </div>
            {/* <h3>Authentication Protocol</h3>
            <p>Access the network overlay console</p> */}
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password </label>
              <div className="input-with-icon">
                <Key size={16} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-login">
              <LogIn size={18} />
              <span>Login</span>
            </button>
          </form>

          {/* Quick Access Roles */}
          {/* <div className="quick-access-section">
            <div className="quick-access-title">
              <span className="line" />
              <span>Quick Access Nodes</span>
              <span className="line" />
            </div>

            <div className="role-grid">
              <button
                className="role-node-btn cyan"
                onClick={() => handleQuickLogin('creative_developer')}
              >
                <Terminal size={16} />
                <div className="role-text-desc">
                  <span className="role-name">Alex Mercer</span>
                  <span className="role-sub">Developer</span>
                </div>
              </button>

              <button
                className="role-node-btn violet"
                onClick={() => handleQuickLogin('designer')}
              >
                <Paintbrush size={16} />
                <div className="role-text-desc">
                  <span className="role-name">Sarah Connor</span>
                  <span className="role-sub">Designer</span>
                </div>
              </button>

              <button
                className="role-node-btn"
                onClick={() => handleQuickLogin('guest')}
              >
                <Globe size={16} />
                <div className="role-text-desc">
                  <span className="role-name">Guest Node</span>
                  <span className="role-sub">Innovator</span>
                </div>
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
