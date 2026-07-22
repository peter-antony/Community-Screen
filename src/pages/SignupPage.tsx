import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CanvasBackground } from '../components/CanvasBackground';
import { UserPlus, Key, Mail, User, AtSign } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './LoginPage.css';

export const SignupPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      setError('Please fill in all the registration fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Trigger Supabase signUp with user options metadata
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    setLoading(false);

    if (!signUpError && data?.user) {
      alert('Sign up successful! Please check your email inbox to verify your account or login directly.');
      navigate('/login');
    } else {
      setError(signUpError?.message || 'Registration failed.');
    }
  };

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
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Full Name </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username </label>
              <div className="input-with-icon">
                <AtSign size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="alex_m"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  required
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
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-login">
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
