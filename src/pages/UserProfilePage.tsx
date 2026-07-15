import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  Phone, 
  Video, 
  UserCheck, 
  UserPlus, 
  Edit3, 
  Check,
  Cpu,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import './UserProfilePage.css';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser, updateProfile } = useAuth();
  const { users, toggleFollow, startCall, setActiveChatUserId } = useCommunication();
  const navigate = useNavigate();

  const isOwnProfile = id === authUser?.id || !id;

  // Find target user
  const profileUser = isOwnProfile 
    ? authUser 
    : users.find((u) => u.id === id);

  const [activeTab, setActiveTab] = useState<'about' | 'projects'>('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editRole, setEditRole] = useState(profileUser?.role || '');
  const [editBio, setEditBio] = useState(profileUser?.bio || '');
  const [editLocation, setEditLocation] = useState(profileUser?.location || '');

  if (!profileUser) {
    return (
      <div className="profile-error glass-panel">
        <h3>Pioneer Profile Not Found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile({
      name: editName,
      role: editRole,
      bio: editBio,
      location: editLocation,
    });
    setIsEditing(false);
  };

  const handleOpenChat = () => {
    setActiveChatUserId(profileUser.id);
    navigate('/chat');
  };

  const handleCall = (type: 'audio' | 'video') => {
    startCall(profileUser, type);
    navigate('/call');
  };

  const mockProjects = [
    {
      title: 'Constellation WebGL Engine',
      desc: 'High-performance particle renderer optimized for immersive browser experiences, building 3D meshes using fragment shaders.',
      tags: ['Three.js', 'WebGL', 'GLSL'],
      url: 'https://github.com'
    },
    {
      title: 'Obsidian UI Kit',
      desc: 'A futuristic glassmorphic UI kit crafted with vanilla CSS custom properties and standard accessible semantic components.',
      tags: ['CSS Modules', 'React', 'Framer'],
      url: 'https://figma.com'
    },
    {
      title: 'Quantum Synapse Broker',
      desc: 'Simulated decentralized state synchronization router for multi-agent network overlays.',
      tags: ['TypeScript', 'RxJS', 'WebSockets'],
      url: 'https://npm.org'
    }
  ];

  return (
    <div className="user-profile-page">
      {/* Cover Banner */}
      <div 
        className="profile-cover" 
        style={{ backgroundImage: `url(${profileUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'})` }}
      >
        <div className="cover-overlay" />
      </div>

      {/* Profile Header Details */}
      <section className="profile-header-card glass-panel">
        <div className="profile-main-layout">
          <div className="profile-avatar-block">
            <img src={profileUser.avatar} alt={profileUser.name} className="profile-avatar" />
            <span className={`profile-status-dot ${profileUser.status}`} />
          </div>

          <div className="profile-name-details">
            {isEditing ? (
              <div className="edit-fields-row">
                <input 
                  type="text" 
                  className="form-input edit-name-input" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                />
                <input 
                  type="text" 
                  className="form-input edit-role-input" 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)} 
                />
              </div>
            ) : (
              <>
                <div className="name-with-badge">
                  <h1>{profileUser.name}</h1>
                  {isOwnProfile && <span className="own-badge">YOU</span>}
                </div>
                <span className="profile-role-title">{profileUser.role}</span>
              </>
            )}

            <div className="profile-meta-row">
              <div className="meta-item">
                <MapPin size={14} />
                {isEditing ? (
                  <input 
                    type="text" 
                    className="form-input edit-meta-input" 
                    value={editLocation} 
                    onChange={(e) => setEditLocation(e.target.value)} 
                  />
                ) : (
                  <span>{profileUser.location}</span>
                )}
              </div>
              <div className="meta-item">
                <Briefcase size={14} />
                <span>Pioneer Hub</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="profile-action-controls">
            {isOwnProfile ? (
              isEditing ? (
                <button className="btn btn-primary btn-save" onClick={handleSave}>
                  <Check size={18} />
                  <span>Save Changes</span>
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )
            ) : (
              <>
                <button 
                  className={`btn ${profileUser.isFollowing ? 'btn-secondary following' : 'btn-primary'}`}
                  onClick={() => toggleFollow(profileUser.id)}
                >
                  {profileUser.isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                  <span>{profileUser.isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                <div className="profile-btn-group">
                  <button className="btn-icon btn-icon-cyan" onClick={handleOpenChat} title="Message">
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    className="btn-icon btn-icon-violet" 
                    onClick={() => handleCall('audio')}
                    title="Audio Portal"
                    disabled={profileUser.status === 'offline'}
                  >
                    <Phone size={18} />
                  </button>
                  <button 
                    className="btn-icon btn-icon-rose" 
                    onClick={() => handleCall('video')}
                    title="Video Stream"
                    disabled={profileUser.status === 'offline'}
                  >
                    <Video size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Counts indicators */}
        <div className="profile-counts-strip">
          <div className="count-unit">
            <span className="count-val">{profileUser.followersCount}</span>
            <span className="count-lbl">Followers</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{profileUser.followingCount}</span>
            <span className="count-lbl">Following</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{profileUser.skills.length}</span>
            <span className="count-lbl">Capabilities</span>
          </div>
        </div>
      </section>

      {/* Main Profile Tabs */}
      <section className="profile-tabs-section">
        <div className="tabs-header-bar">
          <button 
            className={`tab-anchor ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Capabilities & Bio
          </button>
          <button 
            className={`tab-anchor ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Digital Assets ({mockProjects.length})
          </button>
        </div>

        <div className="tab-viewport glass-panel">
          {activeTab === 'about' ? (
            <div className="about-tab-content">
              <div className="profile-bio-box">
                <h4>Quantum Bio</h4>
                {isEditing ? (
                  <textarea 
                    className="form-input profile-textarea"
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                ) : (
                  <p>{profileUser.bio}</p>
                )}
              </div>

              <div className="profile-skills-box">
                <h4>System Capabilities</h4>
                <div className="skills-cloud">
                  {profileUser.skills.map((skill, index) => (
                    <div key={index} className="capability-tag">
                      <Cpu size={12} className="tag-cap-icon" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="projects-tab-content">
              {mockProjects.map((proj, idx) => (
                <div key={idx} className="project-card glass-panel">
                  <div className="project-header">
                    <div className="project-title-group">
                      <Bookmark size={16} className="project-icon" />
                      <h5>{proj.title}</h5>
                    </div>
                    <a href={proj.url} target="_blank" rel="noreferrer" className="project-link">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="project-desc">{proj.desc}</p>
                  <div className="project-tags-row">
                    {proj.tags.map((t, i) => (
                      <span key={i} className="skill-tag">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
