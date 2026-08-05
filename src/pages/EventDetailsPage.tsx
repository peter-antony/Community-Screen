import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Pencil,
  X,
  CheckCircle2,
  Users
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
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
  lat?: number;
  lng?: number;
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

// ─────────────────────────────────────────────
// MERCATOR MATH & TILE COMPUTATION FOR DYNAMIC MAP & PIN
// ─────────────────────────────────────────────
const MAP_TILE_SIZE = 256;
const DEFAULT_BANGALORE_CENTER = { lat: 12.9352, lng: 77.6245 };

function mapLng2frac(lng: number, z: number): number {
  return ((lng + 180) / 360) * Math.pow(2, z);
}
function mapLat2frac(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z);
}
function mapFracToLng(fracX: number, z: number): number {
  return (fracX / Math.pow(2, z)) * 360 - 180;
}
function mapFracToLat(fracY: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * fracY) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function mapToPixel(
  lat: number, lng: number,
  cLat: number, cLng: number,
  vpW: number, vpH: number,
  panX: number, panY: number,
  zoom: number
): { x: number; y: number } {
  const cx = mapLng2frac(cLng, zoom) - panX / MAP_TILE_SIZE;
  const cy = mapLat2frac(cLat, zoom) - panY / MAP_TILE_SIZE;
  return {
    x: vpW / 2 + (mapLng2frac(lng, zoom) - cx) * MAP_TILE_SIZE,
    y: vpH / 2 + (mapLat2frac(lat, zoom) - cy) * MAP_TILE_SIZE,
  };
}

function mapComputeTiles(
  cLat: number, cLng: number,
  vpW: number, vpH: number,
  panX: number, panY: number,
  zoom: number
) {
  const cx = mapLng2frac(cLng, zoom) - panX / MAP_TILE_SIZE;
  const cy = mapLat2frac(cLat, zoom) - panY / MAP_TILE_SIZE;
  const hx = Math.ceil(vpW / MAP_TILE_SIZE / 2) + 2;
  const hy = Math.ceil(vpH / MAP_TILE_SIZE / 2) + 2;
  const n = Math.pow(2, zoom);
  const tiles: Array<{ x: number; y: number; px: number; py: number; key: string }> = [];
  for (let dy = -hy; dy <= hy; dy++) {
    for (let dx = -hx; dx <= hx; dx++) {
      const tx = Math.floor(cx) + dx;
      const ty = Math.floor(cy) + dy;
      if (tx < 0 || tx >= n || ty < 0 || ty >= n) continue;
      tiles.push({
        x: tx, y: ty,
        px: vpW / 2 + (tx - cx) * MAP_TILE_SIZE,
        py: vpH / 2 + (ty - cy) * MAP_TILE_SIZE,
        key: `${zoom}-${tx}-${ty}`,
      });
    }
  }
  return tiles;
}

const getCoordinates = (location: string, latVal?: number, lngVal?: number) => {
  if (latVal && lngVal && !isNaN(Number(latVal)) && !isNaN(Number(lngVal))) {
    return { lat: Number(latVal), lng: Number(lngVal) };
  }

  const locLower = (location || '').toLowerCase();
  if (locLower.includes('koramangala')) return { lat: 12.9352, lng: 77.6245 };
  if (locLower.includes('indiranagar')) return { lat: 12.9784, lng: 77.6408 };
  if (locLower.includes('jp nagar')) return { lat: 12.9105, lng: 77.5958 };
  if (locLower.includes('hsr')) return { lat: 12.9116, lng: 77.6474 };
  if (locLower.includes('jayanagar')) return { lat: 12.9250, lng: 77.5938 };
  if (locLower.includes('cubbon park')) return { lat: 12.9763, lng: 77.5929 };
  if (locLower.includes('mg road')) return { lat: 12.9756, lng: 77.6015 };
  if (locLower.includes('whitefield')) return { lat: 12.9866, lng: 77.7381 };
  if (locLower.includes('electronic city')) return { lat: 12.8452, lng: 77.6602 };

  return DEFAULT_BANGALORE_CENTER;
};

// ─────────────────────────────────────────────
// DYNAMIC EVENT LOCATION MAP WITH THEME SUPPORT & ANCHORED PIN
// ─────────────────────────────────────────────
interface EventLocationMapProps {
  locationStr: string;
  eventLat?: number;
  eventLng?: number;
}

const EventLocationMap: React.FC<EventLocationMapProps> = ({ locationStr, eventLat, eventLng }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const targetCoords = getCoordinates(locationStr, eventLat, eventLng);
  const [mapCenter, setMapCenter] = useState(targetCoords);
  const [zoom, setZoom] = useState(15);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ w: 800, h: 260 });

  useEffect(() => {
    setMapCenter(targetCoords);
    setPanOffset({ x: 0, y: 0 });
  }, [locationStr, eventLat, eventLng]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMapSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setMapSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const tiles = useMemo(() =>
    mapComputeTiles(mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    [mapCenter, mapSize, panOffset, zoom]
  );

  const pinPixelPos = useMemo(() =>
    mapToPixel(targetCoords.lat, targetCoords.lng, mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    [targetCoords, mapCenter, mapSize, panOffset, zoom]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const cx = mapLng2frac(mapCenter.lng, zoom) - dx / MAP_TILE_SIZE;
    const cy = mapLat2frac(mapCenter.lat, zoom) - dy / MAP_TILE_SIZE;
    setMapCenter({ lat: mapFracToLat(cy, zoom), lng: mapFracToLng(cx, zoom) });
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(z => Math.min(z + 1, 18));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(z => Math.max(z - 1, 11));
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMapCenter(targetCoords);
    setPanOffset({ x: 0, y: 0 });
    setZoom(15);
  };

  return (
    <div
      ref={containerRef}
      className={`event-map-container ${dragging ? 'dragging' : ''}`}
      style={{
        position: 'relative',
        height: '260px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(6, 182, 212, 0.25)',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        background: isLight ? '#f1f5f9' : '#091224'
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* OpenStreetMap Rendered Tiles with Theme Filter */}
      {tiles.map(t => (
        <img
          key={t.key}
          src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
          alt=""
          style={{
            position: 'absolute',
            left: t.px,
            top: t.py,
            width: MAP_TILE_SIZE,
            height: MAP_TILE_SIZE,
            pointerEvents: 'none',
            filter: isLight
              ? 'brightness(104%) contrast(90%) saturate(30%) hue-rotate(195deg)'
              : 'invert(100%) hue-rotate(180deg) brightness(85%) contrast(125%)',
            opacity: isLight ? 0.95 : 0.85
          }}
          draggable={false}
        />
      ))}

      {/* DYNAMICALLY ANCHORED PIN MARKER */}
      <div
        className="map-pin-overlay-marker"
        style={{
          position: 'absolute',
          left: pinPixelPos.x,
          top: pinPixelPos.y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div className="map-pin-ripple" />
        <div className="map-pin-badge-icon">
          <MapPin size={22} className="map-pin-svg" />
        </div>
      </div>

      {/* Map Interactive Controls (Zoom & Recenter) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(9, 18, 36, 0.88)',
          backdropFilter: 'blur(12px)',
          padding: '4px',
          borderRadius: '10px',
          border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(6, 182, 212, 0.25)',
          boxShadow: isLight ? '0 4px 14px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: isLight ? '#2563eb' : '#67e8f9',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: isLight ? '#2563eb' : '#67e8f9',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          -
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter Pin"
          style={{
            background: isLight ? 'rgba(37, 99, 235, 0.12)' : 'rgba(6, 182, 212, 0.15)',
            border: isLight ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)',
            color: isLight ? '#2563eb' : '#67e8f9',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🎯
        </button>
      </div>

      {/* Location Name Badge */}
      <div
        className="map-location-badge"
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(9, 18, 36, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '8px 14px',
          borderRadius: '12px',
          border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: isLight ? '0 4px 14px rgba(0, 0, 0, 0.08)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: 'calc(100% - 24px)',
          zIndex: 5
        }}
      >
        <MapPin size={14} style={{ color: isLight ? '#2563eb' : '#06b6d4', flexShrink: 0 }} />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isLight ? '#0f172a' : '#f8fafc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {locationStr}
        </span>
      </div>
    </div>
  );
};

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Passed state from navigation
  const stateEvent = (location.state as any)?.event;
  const stateCommunity = (location.state as any)?.community;

  const [eventData, setEventData] = useState<EventDetailsData | null>(stateEvent || null);
  const [communityName, setCommunityName] = useState<string>(stateCommunity?.name || (stateEvent as any)?.community_name || '');
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
        if ((data as any).community_name) {
          setCommunityName((data as any).community_name);
        } else if (data.community_id) {
          const { data: comm } = await supabase
            .from('community_map')
            .select('name')
            .eq('id', data.community_id)
            .maybeSingle();
          if (comm?.name) {
            setCommunityName(comm.name);
          }
        }

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
          lat: 12.9352,
          lng: 77.6245,
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
  const eventLat = eventData?.lat || stateEvent?.lat;
  const eventLng = eventData?.lng || stateEvent?.lng;

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

          <div className="profile-name-details" style={{ flex: 1 }}>
            <div className="name-with-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1>{title}</h1>
                <span className="own-badge">{category.toUpperCase()}</span>
              </div>
              {/* <button
                type="button"
                className="btn-directions"
                onClick={openEditModal}
                style={{
                  background: isLight ? 'rgba(37, 99, 235, 0.12)' : 'rgba(6, 182, 212, 0.15)',
                  border: isLight ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)',
                  color: isLight ? '#2563eb' : '#67e8f9',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Edit this Event"
              >
                <Pencil size={13} />
                <span>Edit Event</span>
              </button> */}
            </div>

            <span>
              {(communityName || stateCommunity?.name) && (
                <>
                  <span style={{ color: isLight ? '#2563eb' : '#06b6d4', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={13} /> {communityName || stateCommunity?.name}
                  </span>
                </>
              )}
            </span>

            <div className="profile-meta-row">
              <span className="profile-role-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                <span>Hosted by {hostName}</span>
              </span>
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
            <span className="count-val">{timeStr}</span>
            <span className="count-lbl">Event Time</span>
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

            {/* Event Location & Venue Interactive Dynamic Map */}
            <div className="event-location-map-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  Event Location & Venue
                </h4>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-directions"
                >
                  <Navigation size={13} />
                  <span>Get Directions</span>
                </a>
              </div>

              <EventLocationMap locationStr={locationStr} eventLat={eventLat} eventLng={eventLng} />
            </div>
          </div>

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
