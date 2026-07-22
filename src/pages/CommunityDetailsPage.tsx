import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Share2,
  Calendar,
  MapPin,
  Languages,
  ChevronRight,
  Users,
  Compass,
  MessageSquare,
  MessageCircleMore
} from 'lucide-react';
import type { CommunityItem } from '../types';
import './CommunityDetailsPage.css';
import { supabase } from '../supabaseClient';

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
  football: {
    type: 'Football',
    emoji: '⚽',
    color: '#22c55e',
    bgColor: '#dcfce7',
    aboutText: 'Weekly friendly football matches and skill practices in Koramangala Turf. All skill levels welcome!',
    ageText: 'Age 15-50',
    communityName: 'Koramangala Football Club',
    languages: 'English, Kannada, Hindi',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6245,12.9352,14,0/400x200?access_token=mock'
  },
  cricket: {
    type: 'Cricket',
    emoji: '🏏',
    color: '#eab308',
    bgColor: '#fef9c3',
    aboutText: 'Weekend leather ball cricket matches and net practice sessions. Bring your gears!',
    ageText: 'Age 16-60',
    communityName: 'Indiranagar Cricket League',
    languages: 'English, Kannada',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6408,12.9784,13,0/400x200?access_token=mock'
  },
  music: {
    type: 'Music Jam',
    emoji: '🎵',
    color: '#a855f7',
    bgColor: '#f3e8ff',
    aboutText: 'Acoustic jam sessions, vocals, keyboard, and percussion. Collab with local visual artists & musicians.',
    ageText: 'Age 18-40',
    communityName: 'Bangalore Jam Session',
    languages: 'English, Hindi, Kannada',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.5938,12.9250,14,0/400x200?access_token=mock'
  },
  party: {
    type: 'Club Party',
    emoji: '🎉',
    color: '#ec4899',
    bgColor: '#fce7f3',
    aboutText: 'Weekend lounge parties, DJ sets, dancing, and networking at premium lounges.',
    ageText: 'Age 21-45',
    communityName: 'Happy Brew Bar Party',
    languages: 'English, Hindi',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6474,12.9116,13,0/400x200?access_token=mock'
  },
  travel: {
    type: 'Travel Meetup',
    emoji: '✈️',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    aboutText: 'Plan road trips, backpacking journeys, and explore offbeat trekking spots with travel bloggers.',
    ageText: 'Age 18-65',
    communityName: 'Backpackers Travel Club',
    languages: 'English, Spanish',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.5929,12.9763,14,0/400x200?access_token=mock'
  },
  drinks: {
    type: 'Craft Beer Tour',
    emoji: '🍹',
    color: '#f97316',
    bgColor: '#ffedd5',
    aboutText: 'Sip and socialize at premium microbreweries. Explore craft beers and cocktail workshop secrets.',
    ageText: 'Age 21+',
    communityName: 'Mixology & Craft Beer Tour',
    languages: 'English, Hindi',
    mapImage: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.6015,12.9756,14,0/400x200?access_token=mock'
  }
};

export const CommunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'present' | 'interested'>('info');
  const [isJoined, setIsJoined] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [communities, setCommunities] = useState<CommunityItem[]>([])

  useEffect(() => {
    console.log("communities: ", communities)
    fetchCommunities()
  }, [])

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

  // Find community details
  const community = communities.find(c => c.id === id);

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

  // Extract coordinates from config.mapImage URL
  const getCoordinates = (mapImageUrl: string) => {
    const match = mapImageUrl.match(/static\/([\d.-]+),([\d.-]+)/);
    if (match) {
      // Mapbox uses longitude,latitude -> Google Maps uses latitude,longitude
      const lng = match[1];
      const lat = match[2];
      return { lat, lng };
    }
    return null;
  };

  const coords = getCoordinates(config.mapImage);
  const mapUrl = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=15&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(community.name + ', Bangalore')}&hl=en&z=15&ie=UTF8&iwloc=&output=embed`;

  const externalMapUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(community.name + ', Bangalore')}`;

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
              <button
                className="btn-icon btn-icon-cyan"
                onClick={() => navigate(`/community-chat?id=${community.id}`)}
                title="Community Chat"
              >
                <MessageCircleMore size={18} />
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
                    <iframe
                      title="Google Map Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={mapUrl}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <button className="btn-open-map-app" onClick={() => window.open(externalMapUrl, '_blank')}>
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
