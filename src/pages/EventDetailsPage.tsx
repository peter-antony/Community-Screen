import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import './EventDetailsPage.css';

export interface EventDetailsData {
  id: string;
  community_id?: string;
  title: string;
  category: string;
  image?: string;
  date_str?: string;
  dateStr?: string;
  time_str?: string;
  timeStr?: string;
  location?: string;
  description?: string;
  host_name?: string;
  hostName?: string;
  host_avatar?: string;
  hostAvatar?: string;
  participants_count?: number;
  participantsCount?: number;
  max_participants?: number;
  maxParticipants?: number;
  is_joined?: boolean;
  isJoined?: boolean;
  attendees?: Array<{ name: string; avatar: string; role?: string }>;
  tags?: string[];
}

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Passed state from navigation
  const stateEvent = (location.state as any)?.event;
  const stateCommunity = (location.state as any)?.community;

  const [eventData, setEventData] = useState<EventDetailsData | null>(stateEvent || null);
  const [loading, setLoading] = useState<boolean>(!stateEvent);
  const [attendees, setAttendees] = useState<Array<{ name: string; avatar: string; role?: string }>>([]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        let parsedAttendees = [
          { name: data.host_name || stateCommunity?.hostName || 'Host', avatar: data.host_avatar || stateCommunity?.hostAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Host' },
          { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
          { name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
          { name: 'Rohan Kumar', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
        ];
        if (data.attendees) {
          try {
            const raw = typeof data.attendees === 'string' ? JSON.parse(data.attendees) : data.attendees;
            if (Array.isArray(raw) && raw.length > 0) {
              parsedAttendees = raw;
            }
          } catch (e) {
            console.error('Error parsing event attendees:', e);
          }
        }
        setEventData(data);
        setAttendees(parsedAttendees);
      } else if (!stateEvent) {
        const fallbackObj: EventDetailsData = {
          id: id,
          title: '3v3 Community Tournament & Warmup',
          category: 'sport',
          image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
          date_str: 'Saturday, Aug 8',
          time_str: '5:30 PM - 8:30 PM',
          location: 'Koramangala Turf Arena, Bengaluru',
          description: 'Join us for an exciting 3v3 weekend community meetup tournament! Perfect for all skill levels. We provide energy drinks, referee, gear, and high-tempo music throughout the evening.',
          host_name: stateCommunity?.hostName || 'Ananya Rao',
          host_avatar: stateCommunity?.hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          participants_count: 14,
          max_participants: 24,
          tags: ['Match', 'Community Meetup', 'Outdoor', 'Weekend Special'],
        };
        setEventData(fallbackObj);
        setAttendees([
          { name: fallbackObj.host_name || 'Host', avatar: fallbackObj.host_avatar || '', role: 'Host' },
          { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
          { name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
          { name: 'Rohan Kumar', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
          { name: 'Kavya B.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
        ]);
      } else {
        setAttendees([
          { name: stateEvent.host_name || stateCommunity?.hostName || 'Host', avatar: stateEvent.host_avatar || stateCommunity?.hostAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Host' },
          { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
          { name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80', role: 'Attendee' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="event-details-loading">
          <div className="event-loading-spinner" />
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  const title = eventData?.title || stateEvent?.title || 'Community Event';
  const category = eventData?.category || stateEvent?.category || 'Event';
  const image = eventData?.image || stateEvent?.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80';
  const dateStr = eventData?.date_str || eventData?.dateStr || stateEvent?.date_str || stateEvent?.dateStr || 'Upcoming Date';
  const timeStr = eventData?.time_str || eventData?.timeStr || stateEvent?.time_str || stateEvent?.timeStr || '7:00 PM';
  const locationStr = eventData?.location || stateEvent?.location || 'Bengaluru Community Venue';
  const description = eventData?.description || stateEvent?.description || 'Join us for this exciting community gathering and meet fellow members in your area!';
  const hostName = eventData?.host_name || eventData?.hostName || stateEvent?.host_name || stateCommunity?.hostName || 'Community Lead';

  return (
    <div className="user-profile-page event-profile-page">
      {/* Cover Banner with Back Button */}
      <div
        className="profile-cover"
        style={{ backgroundImage: `url(${image})` }}
      >
        <button
          className="cover-back-btn"
          onClick={() => navigate('/network')}
          title="Back to Network Page"
          aria-label="Back to Network Page"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="cover-overlay" />
      </div>

      {/* Profile/Event Header Card */}
      <section className="profile-header-card glass-panel">
        <div className="profile-main-layout">
          <div className="profile-avatar-block">
            <img src={image} alt={title} className="profile-avatar" style={{ borderRadius: '20px' }} />
            <span className="profile-status-dot online" />
          </div>

          <div className="profile-name-details">
            <div className="name-with-badge">
              <h1>{title}</h1>
              <span className="own-badge">{category.toUpperCase()}</span>
            </div>

            <span className="profile-role-title">Hosted by {hostName}</span>

            <div className="profile-meta-row">
              <div className="meta-item">
                <Clock size={14} />
                <span>{timeStr}</span>
              </div>
              <div className="meta-item">
                <MapPin size={14} />
                <span>{locationStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Counts Strip */}
        <div className="profile-counts-strip">
          <div className="count-unit">
            <span className="count-val">{attendees.length}</span>
            <span className="count-lbl">ATTENDEES</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">{dateStr.split(',')[0]}</span>
            <span className="count-lbl">EVENT DAY</span>
          </div>
          <div className="count-divider" />
          <div className="count-unit">
            <span className="count-val">FREE</span>
            <span className="count-lbl">ENTRY</span>
          </div>
        </div>
      </section>

      {/* Event Details Unified Single View Section */}
      <section className="profile-tabs-section">
        <div className="tab-viewport glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* About & Overview */}
          <div className="about-tab-content">
            <div className="profile-bio-box">
              <h4>About This Event</h4>
              <p>{description}</p>
            </div>

            <div className="profile-skills-box" style={{ marginTop: '20px' }}>
              <h4>Event Highlights</h4>
              <div className="skills-cloud">
                <span className="capability-tag">
                  <ShieldCheck size={14} className="tag-cap-icon" /> Verified Event
                </span>
                <span className="capability-tag">
                  <Users size={14} className="tag-cap-icon" /> Open Community Gathering
                </span>
                <span className="capability-tag">
                  <Sparkles size={14} className="tag-cap-icon" /> Equipment Provided
                </span>
              </div>
            </div>
          </div>

          {/* <div style={{ height: '1px', background: 'var(--border-glass, rgba(255, 255, 255, 0.08))' }} /> */}

          {/* Confirmed Attendees */}
          <div className="about-tab-content">
            <div className="profile-bio-box">
              <h4>Registered Participants ({attendees.length})</h4>
              <div className="attendees-grid" style={{ marginTop: '16px' }}>
                {attendees.map((mem, idx) => (
                  <div key={idx} className="attendee-card">
                    <img src={mem.avatar} alt={mem.name} className="attendee-avatar" />
                    <div className="attendee-info">
                      <span className="attendee-name">{mem.name}</span>
                      <span className={`attendee-role ${mem.role === 'Host' ? 'host' : ''}`}>
                        {mem.role || 'Attendee'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
