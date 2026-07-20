import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  Star,
  Share2,
  Calendar,
  MapPin,
  Languages,
  ChevronRight,
  Users,
  Compass
} from 'lucide-react';
import { communitiesData } from '../services/mockData';
import './CommunityDetailsPage.css';

interface ThemeConfig {
  type: string;
  emoji: string;
  color: string;
  bgColor: string;
  aboutText: string;
  ageText: string;
  communityName: string;
  languages: string;
  mapImage: string;
}

const THEME_MAPS: Record<string, ThemeConfig> = {
  hiking: {
    type: 'Hiking',
    emoji: '🥾',
    color: '#f43f5e',
    bgColor: '#ffe4e6',
    aboutText: 'Let\'s hike the beautiful scenic hills and enjoy sunset trails together. All experience levels welcome!',
    ageText: 'Age 16-65',
    communityName: 'Sunset Trails Club',
    languages: 'English, Spanish',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.5946,12.9716,12,0/400x200?access_token=mock'
  },
  drinks: {
    type: 'Mixology',
    emoji: '🍹',
    color: '#f97316',
    bgColor: '#ffedd5',
    aboutText: 'Sip, socialize and learn craft cocktail mixing secrets at Happy Brew Koramangala.',
    ageText: 'Age 21+',
    communityName: 'BLR House Party Club',
    languages: 'English, Hindi',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6245,12.9352,14,0/400x200?access_token=mock'
  },
  tech: {
    type: 'Hackathon',
    emoji: '💻',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    aboutText: 'Build the future of AI & tech. Collaborate on hacking, prototyping, and design systems.',
    ageText: 'Age 18-45',
    communityName: 'AI Creators Hub',
    languages: 'English, Python',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6408,12.9784,13,0/400x200?access_token=mock'
  },
  books: {
    type: 'Book Circle',
    emoji: '📚',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    aboutText: 'Read, discuss, and enjoy literature, coffee, and storytelling with cozy book worms.',
    ageText: 'Age 18-99',
    communityName: 'Jayanagar Literary Circle',
    languages: 'English, Hindi, Kannada',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.5938,12.9250,14,0/400x200?access_token=mock'
  },
  cycling: {
    type: 'Cycling Ride',
    emoji: '🚴',
    color: '#06b6d4',
    bgColor: '#cffafe',
    aboutText: 'Weekend group ride through the green outskirts of Bangalore. Gear and helmet mandatory.',
    ageText: 'Age 15-60',
    communityName: 'HSR Cycling Crew',
    languages: 'English, Kannada',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6474,12.9116,13,0/400x200?access_token=mock'
  },
  yoga: {
    type: 'Yoga Class',
    emoji: '🧘',
    color: '#10b981',
    bgColor: '#d1fae5',
    aboutText: 'Morning yoga, pranayama, and mindfulness in the quiet, scenic Cubbon Park gardens.',
    ageText: 'Age 12-80',
    communityName: 'Cubbon Park Yoga Circle',
    languages: 'English, Sanskrit, Hindi',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.5929,12.9763,14,0/400x200?access_token=mock'
  },
  art: {
    type: 'Art Workshop',
    emoji: '🎨',
    color: '#f43f5e',
    bgColor: '#ffe4e6',
    aboutText: 'Unleash your creative skills. 3D Spline and retro pixel art drawing session.',
    ageText: 'Age 10-60',
    communityName: 'Pixel Art Creators',
    languages: 'English, Visual Art',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6015,12.9756,14,0/400x200?access_token=mock'
  }
};

export const CommunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'present' | 'interested'>('info');
  const [isJoined, setIsJoined] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Find community details
  const community = communitiesData.find(c => c.id === id);

  if (!community) {
    return (
      <div className="community-details-error">
        <Compass size={48} className="error-icon" />
        <h3>Community Event Not Found</h3>
        <button onClick={() => navigate('/network')} className="btn-back-constellation">
          Return to Constellation
        </button>
      </div>
    );
  }

  // Get dynamic config based on theme, fallback if needed
  const config = THEME_MAPS[community.theme] || THEME_MAPS.drinks;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(`Link to "${community.name}" copied to clipboard!`);
  };

  return (
    <div className="user-profile-page community-profile-page">

      {/* Cover Banner */}
      <div
        className="profile-cover"
        style={{ backgroundImage: `url(${community.image})` }}
      >
        <div className="cover-overlay" />
        {/* <button 
          className="circular-action-btn close-btn" 
          onClick={() => navigate('/network')} 
          title="Go Back" 
          style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}
        >
          <X size={20} />
        </button> */}
      </div>

      {/* Profile Header Details */}
      <section className="profile-header-card glass-panel">
        <div className="profile-main-layout">
          <div className="profile-avatar-block">
            <div className="profile-avatar theme-badge-circle-avatar" style={{ backgroundColor: config.color }}>
              <span className="theme-emoji-profile">{config.emoji}</span>
            </div>
          </div>

          <div className="profile-name-details">
            <div className="name-with-badge">
              <h1>{community.name}</h1>
            </div>
            <span className="profile-role-title">{config.type} Activity</span>

            <div className="profile-meta-row">
              <div className="meta-item">
                <MapPin size={14} />
                <span>{community.distance}</span>
              </div>
              <div className="meta-item">
                <Users size={14} />
                <span>Hosted by {community.host.name}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="profile-action-controls">
            <button
              className={`btn ${isJoined ? 'btn-secondary following' : 'btn-primary'}`}
              onClick={() => setIsJoined(!isJoined)}
            >
              <span className="join-btn-text">{isJoined ? 'Going' : 'Join'}</span>
              <div className="join-count-badge">
                +{isJoined ? community.attendees.length + 1 : community.attendees.length}
              </div>
            </button>

            <div className="profile-btn-group">
              <button
                className={`btn-icon ${isFavorite ? 'btn-icon-amber bookmarked' : 'btn-icon-grey'}`}
                onClick={() => setIsFavorite(!isFavorite)}
                title="Favorite"
              >
                <Star size={18} fill={isFavorite ? '#f59e0b' : 'none'} stroke={isFavorite ? '#f59e0b' : 'currentColor'} />
              </button>
              <button className="btn-icon btn-icon-cyan" onClick={handleShare} title="Share">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Counts indicators */}
        <div className="profile-counts-strip">
          <div className="count-unit">
            <span className="count-val">{community.attendees.length}</span>
            <span className="count-lbl">Pioneers Joined</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{community.attendees.length + 12}</span>
            <span className="count-lbl">Interested</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{config.ageText.split(' ')[1] || config.ageText}</span>
            <span className="count-lbl">Age Group</span>
          </div>
        </div>
      </section>

      {/* Main Profile Tabs */}
      <section className="profile-tabs-section">
        <div className="tabs-header-bar">
          <button
            className={`tab-anchor ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            About Activity
          </button>
          <button
            className={`tab-anchor ${activeTab === 'present' ? 'active' : ''}`}
            onClick={() => setActiveTab('present')}
          >
            Present ({community.attendees.length + 1})
          </button>
          <button
            className={`tab-anchor ${activeTab === 'interested' ? 'active' : ''}`}
            onClick={() => setActiveTab('interested')}
          >
            Interested ({community.attendees.length + 12})
          </button>
        </div>

        <div className="tab-viewport glass-panel">
          {activeTab === 'info' ? (
            <div className="about-tab-content community-info-tab">
              <div className="profile-bio-box">
                <h4>Activity Description</h4>
                <p className="details-description-statement">
                  {config.aboutText}
                </p>
              </div>

              <div className="activity-about-grid">
                {/* Host Info */}
                <div className="about-item-row" onClick={() => navigate(`/profile/user_1`)}>
                  <div className="about-item-icon-wrapper host-avatar-wrapper">
                    <img src={community.host.avatar} alt={community.host.name} className="item-host-avatar" />
                  </div>
                  <div className="about-item-info">
                    <span className="item-label">Host</span>
                    <span className="item-value">{community.host.name}</span>
                  </div>
                  <ChevronRight size={16} className="item-arrow-right" />
                </div>

                {/* Present / Participants */}
                <div className="about-item-row" onClick={() => setActiveTab('present')}>
                  <div className="about-item-icon-wrapper stack-wrapper">
                    <div className="avatar-overlap-circle">
                      {community.attendees.slice(0, 2).map((a, i) => (
                        <img key={i} src={a.avatar} alt={a.name} className="overlap-img" />
                      ))}
                    </div>
                  </div>
                  <div className="about-item-info">
                    <span className="item-label">Present</span>
                    <span className="item-value">View participants</span>
                  </div>
                  <ChevronRight size={16} className="item-arrow-right" />
                </div>

                {/* Community Group */}
                <div className="about-item-row" onClick={() => navigate('/explore-communities')}>
                  <div className="about-item-icon-wrapper standard-icon-bg">
                    <Users size={18} className="item-svg-icon" />
                  </div>
                  <div className="about-item-info">
                    <span className="item-value">{config.communityName}</span>
                    <span className="item-label-sub">Part of a community</span>
                  </div>
                  <ChevronRight size={16} className="item-arrow-right" />
                </div>

                {/* Time details */}
                <div className="about-item-row">
                  <div className="about-item-icon-wrapper standard-icon-bg">
                    <Calendar size={18} className="item-svg-icon" />
                  </div>
                  <div className="about-item-info">
                    <span className="item-value">{community.dateStr}</span>
                    <span className="item-label-sub">{community.timeStr}</span>
                  </div>
                </div>

                {/* Location Venue */}
                <div className="about-item-row">
                  <div className="about-item-icon-wrapper standard-icon-bg">
                    <MapPin size={18} className="item-svg-icon" />
                  </div>
                  <div className="about-item-info">
                    <span className="item-value">{community.name}</span>
                    <span className="item-label-sub">{community.distance}</span>
                  </div>
                </div>

                {/* Spoken languages */}
                <div className="about-item-row">
                  <div className="about-item-icon-wrapper standard-icon-bg">
                    <Languages size={18} className="item-svg-icon" />
                  </div>
                  <div className="about-item-info">
                    <span className="item-label">Spoken languages</span>
                    <span className="item-value">{config.languages}</span>
                  </div>
                </div>
              </div>

              {/* Map Preview Graphic */}
              <div className="details-map-section">
                <div className="map-view-card">
                  <div className="google-map-mock-bg">
                    <div className="map-grid-layer" />
                    <div className="map-glow-pin" style={{ background: config.color }}>
                      <span className="pin-emoji">{config.emoji}</span>
                      <span className="pin-pulse-wave" style={{ borderColor: config.color }} />
                    </div>
                    <div className="map-floating-label">
                      <span className="venue-name-bold">{community.name.split(' ')[0]}</span>
                      <span className="venue-dist-detail">{community.distance}</span>
                    </div>
                  </div>
                  <button className="btn-open-map-app" onClick={() => window.open('https://maps.google.com')}>
                    Maps <Share2 size={12} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              </div>

            </div>
          ) : activeTab === 'present' ? (
            <div className="present-tab-content">
              <h4 className="tab-section-heading">Event Attendees ({community.attendees.length + 1})</h4>
              <div className="attendee-list-scroll">
                <div className="participant-row-item host-participant">
                  <img src={community.host.avatar} alt={community.host.name} className="participant-avatar" />
                  <div className="participant-info">
                    <span className="participant-name">{community.host.name}</span>
                    <span className="participant-role-tag">Host</span>
                  </div>
                </div>
                {community.attendees.map((attendee, idx) => (
                  <div className="participant-row-item" key={idx}>
                    <img src={attendee.avatar} alt={attendee.name} className="participant-avatar" />
                    <div className="participant-info">
                      <span className="participant-name">{attendee.name}</span>
                      <span className="participant-role-tag member">Member</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="present-tab-content">
              <h4 className="tab-section-heading">Pioneers Interested ({community.attendees.length + 12})</h4>
              <div className="attendee-list-scroll">
                {community.attendees.concat(community.attendees).map((attendee, idx) => (
                  <div className="participant-row-item" key={idx}>
                    <img src={attendee.avatar} alt={attendee.name} className="participant-avatar" />
                    <div className="participant-info">
                      <span className="participant-name">{attendee.name}</span>
                      <span className="participant-status-text">Interested to join</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
