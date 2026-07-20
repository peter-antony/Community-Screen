import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Search, X, Navigation2, MapPin,
  Clock, ChevronRight, Users, Star,
  Plus, Minus
} from 'lucide-react';
import '../assets/css/CommunityMapPage.css';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const TILE_SIZE = 256;
const BANGALORE = { lat: 12.9716, lng: 77.5946 };
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 13;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Community {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  emoji: string;
  color: string;
  bgColor: string;
  members: number;
  schedule: string;
  distance: string;
  image: string;
  hostName: string;
  hostAvatar: string;
  description: string;
  tags: string[];
}

interface Tile {
  x: number;
  y: number;
  px: number;
  py: number;
  key: string;
}

// ─────────────────────────────────────────────
// MAP MATH
// ─────────────────────────────────────────────
function lng2frac(lng: number, z: number): number {
  return ((lng + 180) / 360) * Math.pow(2, z);
}
function lat2frac(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z);
}
function fracToLng(fracX: number, z: number): number {
  return (fracX / Math.pow(2, z)) * 360 - 180;
}
function fracToLat(fracY: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * fracY) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function computeTiles(
  cLat: number, cLng: number,
  vpW: number, vpH: number,
  panX: number, panY: number,
  zoom: number
): Tile[] {
  const cx = lng2frac(cLng, zoom) - panX / TILE_SIZE;
  const cy = lat2frac(cLat, zoom) - panY / TILE_SIZE;
  const hx = Math.ceil(vpW / 2 / TILE_SIZE) + 1;
  const hy = Math.ceil(vpH / 2 / TILE_SIZE) + 1;
  const n = Math.pow(2, zoom);
  const tiles: Tile[] = [];
  for (let dy = -hy; dy <= hy; dy++) {
    for (let dx = -hx; dx <= hx; dx++) {
      const tx = Math.floor(cx) + dx;
      const ty = Math.floor(cy) + dy;
      if (tx < 0 || tx >= n || ty < 0 || ty >= n) continue;
      tiles.push({
        x: tx, y: ty,
        px: vpW / 2 + (tx - cx) * TILE_SIZE,
        py: vpH / 2 + (ty - cy) * TILE_SIZE,
        key: `${zoom}-${tx}-${ty}`,
      });
    }
  }
  return tiles;
}

function toPixel(
  lat: number, lng: number,
  cLat: number, cLng: number,
  vpW: number, vpH: number,
  panX: number, panY: number,
  zoom: number
): { x: number; y: number } {
  const cx = lng2frac(cLng, zoom) - panX / TILE_SIZE;
  const cy = lat2frac(cLat, zoom) - panY / TILE_SIZE;
  return {
    x: vpW / 2 + (lng2frac(lng, zoom) - cx) * TILE_SIZE,
    y: vpH / 2 + (lat2frac(lat, zoom) - cy) * TILE_SIZE,
  };
}

// ─────────────────────────────────────────────
// DATA — 10 BANGALORE COMMUNITIES
// ─────────────────────────────────────────────
const COMMUNITIES: Community[] = [
  {
    id: 'bg1', name: 'Cubbon Park Yoga Circle',
    lat: 12.9763, lng: 77.5929,
    category: 'yoga', emoji: '🧘', color: '#10b981', bgColor: '#d1fae5',
    members: 34, schedule: 'Sat & Sun · 6:00 AM', distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=320&q=85',
    hostName: 'Priya S.', hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
    description: 'Morning yoga & pranayama in the serene Cubbon Park gardens. All levels welcome.',
    tags: ['Outdoor', 'Beginner OK', 'Free'],
  },
  {
    id: 'bg2', name: 'Koramangala Tech Meetup',
    lat: 12.9352, lng: 77.6245,
    category: 'tech', emoji: '💻', color: '#3b82f6', bgColor: '#dbeafe',
    members: 142, schedule: 'Every Friday · 7:00 PM', distance: '5.8 km',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=85',
    hostName: 'Arjun M.', hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80',
    description: 'Weekly tech talks, hackathons and startup showcases in Koramangala.',
    tags: ['Networking', 'Startups', 'Drinks'],
  },
  {
    id: 'bg3', name: 'Indiranagar Friday Night',
    lat: 12.9784, lng: 77.6408,
    category: 'social', emoji: '🎉', color: '#f59e0b', bgColor: '#fef3c7',
    members: 89, schedule: 'Every Friday · 9:00 PM', distance: '4.1 km',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=320&q=85',
    hostName: 'Rohan K.', hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80',
    description: 'Friday evening hangout at the best spots on 12th Main, Indiranagar.',
    tags: ['Social', 'Nightlife', 'All Welcome'],
  },
  {
    id: 'bg4', name: 'Nandi Hills Sunrise Hike',
    lat: 13.0047, lng: 77.6822,
    category: 'hiking', emoji: '🥾', color: '#ef4444', bgColor: '#fee2e2',
    members: 42, schedule: 'Last Sunday · 4:00 AM', distance: '10.2 km',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=320&q=85',
    hostName: 'Vikram N.', hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
    description: 'Early morning trek to Nandi Hills for breathtaking sunrise panoramas.',
    tags: ['Adventure', 'Nature', 'Carpool'],
  },
  {
    id: 'bg5', name: 'Jayanagar Book Circle',
    lat: 12.9250, lng: 77.5938,
    category: 'books', emoji: '📚', color: '#8b5cf6', bgColor: '#ede9fe',
    members: 23, schedule: 'Every Tuesday · 6:30 PM', distance: '5.4 km',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=320&q=85',
    hostName: 'Meena R.', hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
    description: 'Monthly book discussions at Blossoms bookstore and cozy cafés near 4th Block.',
    tags: ['Literature', 'Discussion', 'Coffee'],
  },
  {
    id: 'bg6', name: 'Ulsoor Lake Morning Walk',
    lat: 12.9831, lng: 77.6210,
    category: 'walking', emoji: '🚶', color: '#06b6d4', bgColor: '#cffafe',
    members: 67, schedule: 'Daily · 6:00 AM', distance: '2.3 km',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=320&q=85',
    hostName: 'Suresh P.', hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=60&q=80',
    description: 'Daily morning walk around scenic Ulsoor Lake for fitness and fresh air.',
    tags: ['Daily', 'Fitness', 'Pet Friendly'],
  },
  {
    id: 'bg7', name: 'HSR Layout Cycling Crew',
    lat: 12.9116, lng: 77.6474,
    category: 'cycling', emoji: '🚴', color: '#f97316', bgColor: '#ffedd5',
    members: 58, schedule: 'Sun & Wed · 6:30 AM', distance: '8.1 km',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=320&q=85',
    hostName: 'Ankit T.', hostAvatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=60&q=80',
    description: 'Weekend rides covering 30–50 km through Bangalore outskirts.',
    tags: ['Active', 'Intermediate+', 'Gear Needed'],
  },
  {
    id: 'bg8', name: 'MG Road Craft Cocktails',
    lat: 12.9756, lng: 77.6015,
    category: 'drinks', emoji: '🍹', color: '#f43f5e', bgColor: '#ffe4e6',
    members: 45, schedule: 'Every Saturday · 8:00 PM', distance: '1.8 km',
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=320&q=85',
    hostName: 'Divya L.', hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
    description: 'Craft cocktail tastings at top bars and speakeasies on MG Road.',
    tags: ['Nightlife', '21+', 'Reservation'],
  },
  {
    id: 'bg9', name: 'Lalbagh Meditation Garden',
    lat: 12.9507, lng: 77.5848,
    category: 'meditation', emoji: '🪷', color: '#84cc16', bgColor: '#ecfccb',
    members: 29, schedule: 'Daily · 7:00 AM', distance: '3.5 km',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=320&q=85',
    hostName: 'Kavya B.', hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=60&q=80',
    description: 'Silent meditation and mindfulness sessions in the Lalbagh botanical garden.',
    tags: ['Mindfulness', 'Silent', 'Beginners OK'],
  },
  {
    id: 'bg10', name: 'Bannerghatta Art Workshop',
    lat: 12.8638, lng: 77.5765,
    category: 'art', emoji: '🎨', color: '#ec4899', bgColor: '#fce7f3',
    members: 18, schedule: 'Every Saturday · 3:00 PM', distance: '12.6 km',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=320&q=85',
    hostName: 'Shreya M.', hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
    description: 'Watercolor and acrylic painting sessions in nature near Bannerghatta.',
    tags: ['Creative', 'Supplies', 'All Levels'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🗺️' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'social', label: 'Social', emoji: '🎉' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'walking', label: 'Walk', emoji: '🚶' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'drinks', label: 'Drinks', emoji: '🍹' },
  { id: 'meditation', label: 'Meditate', emoji: '🪷' },
  { id: 'art', label: 'Art', emoji: '🎨' },
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export const CommunityMapPage: React.FC = () => {
  const [selected, setSelected] = useState<Community | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [mapCenter, setMapCenter] = useState(BANGALORE);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapSize, setMapSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const mapRef = useRef<HTMLDivElement>(null);

  // ── Responsive size ──
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setMapSize({ w: el.clientWidth, h: el.clientHeight })
    );
    ro.observe(el);
    setMapSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ── Filtered pins ──
  const filtered = useMemo(() =>
    COMMUNITIES.filter(c => {
      const matchCat = category === 'all' || c.category === category;
      const matchQ = !search || c.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    }), [category, search]);

  // ── Tiles ──
  const tiles = useMemo(() =>
    computeTiles(mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    [mapCenter, mapSize, panOffset, zoom]);

  // ── Pin pixel positions ──
  const pins = useMemo(() =>
    COMMUNITIES.map(c => ({
      ...c,
      ...toPixel(c.lat, c.lng, mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    })), [mapCenter, mapSize, panOffset, zoom]);

  // ── User dot ──
  const userDot = useMemo(() =>
    toPixel(BANGALORE.lat, BANGALORE.lng, mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    [mapCenter, mapSize, panOffset, zoom]);

  // ── Drag pan ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-pin, .cmp-popup, .cmp-topbar, .cmp-ctrl')) return;
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const cx = lng2frac(mapCenter.lng, zoom) - dx / TILE_SIZE;
    const cy = lat2frac(mapCenter.lat, zoom) - dy / TILE_SIZE;
    setMapCenter({ lat: fracToLat(cy, zoom), lng: fracToLng(cx, zoom) });
    setPanOffset({ x: 0, y: 0 });
  }, [dragging, dragStart, mapCenter, zoom]);

  // ── Touch pan ──
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDragging(true);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    setPanOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  }, [dragging, dragStart]);
  const onTouchEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const dx = panOffset.x;
    const dy = panOffset.y;
    const cx = lng2frac(mapCenter.lng, zoom) - dx / TILE_SIZE;
    const cy = lat2frac(mapCenter.lat, zoom) - dy / TILE_SIZE;
    setMapCenter({ lat: fracToLat(cy, zoom), lng: fracToLng(cx, zoom) });
    setPanOffset({ x: 0, y: 0 });
  }, [dragging, panOffset, mapCenter, zoom]);

  const recenter = useCallback(() => {
    setMapCenter(BANGALORE);
    setPanOffset({ x: 0, y: 0 });
    setZoom(DEFAULT_ZOOM);
  }, []);

  // ── Zoom handlers ──
  const zoomIn  = useCallback(() => setZoom(z => Math.min(z + 1, MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 1, MIN_ZOOM)), []);

  // ── Scroll-wheel zoom (centered on cursor) ──
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    setZoom(z => Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  // ── Popup position (smart: flip if too close to edge) ──
  const popupPos = useMemo(() => {
    if (!selected) return { left: 0, top: 0 };
    const pin = pins.find(p => p.id === selected.id)!;
    const left = pin.x + 28 > mapSize.w - 310 ? pin.x - 318 : pin.x + 28;
    const top = Math.min(Math.max(pin.y - 80, 80), mapSize.h - 380);
    return { left, top };
  }, [selected, pins, mapSize]);

  return (
    <div
      ref={mapRef}
      className={`cmp-root ${dragging ? 'cmp-dragging' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      onClick={() => { if (!dragging) setSelected(null); }}
    >
      {/* ── OSM TILES ── */}
      {tiles.map(t => (
        <img
          key={t.key}
          className="cmp-tile"
          src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
          alt=""
          style={{ left: t.px, top: t.py }}
          draggable={false}
        />
      ))}

      {/* ── COMMUNITY PINS ── */}
      {pins.map(pin => {
        const visible = filtered.some(f => f.id === pin.id);
        const isSel = selected?.id === pin.id;
        const isHov = hovered === pin.id;
        return (
          <button
            key={pin.id}
            className={`map-pin ${isSel ? 'pin-sel' : ''} ${isHov ? 'pin-hov' : ''} ${!visible ? 'pin-dim' : ''}`}
            style={{
              left: pin.x,
              top: pin.y,
              '--pin-color': pin.color,
            } as React.CSSProperties}
            onClick={e => { e.stopPropagation(); setSelected(pin); }}
            onMouseEnter={() => setHovered(pin.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={pin.name}
          >
            <img src={pin.image} alt={pin.name} />
            {/* pulse for daily communities */}
            {pin.schedule.toLowerCase().includes('daily') && (
              <span className="pin-pulse" style={{ background: pin.color }} />
            )}
            {/* count badge */}
            <span className="pin-count" style={{ background: pin.color }}>
              {pin.members > 99 ? '99+' : pin.members}
            </span>
            {/* hover tooltip */}
            {isHov && !isSel && (
              <span className="pin-tooltip">{pin.emoji} {pin.name}</span>
            )}
          </button>
        );
      })}

      {/* ── USER DOT ── */}
      <div className="cmp-user-dot" style={{ left: userDot.x, top: userDot.y }}>
        <span className="user-dot-ripple" />
        <span className="user-dot-core" />
        <span className="user-dot-label">You</span>
      </div>

      {/* ══════════════════════════════
          TOP BAR — search + filters
         ══════════════════════════════ */}
      <div className="cmp-topbar" onClick={e => e.stopPropagation()}>
        {/* Location pill */}
        <div className="cmp-loc-pill">
          <Navigation2 size={13} />
          <span>Bangalore, India</span>
        </div>

        {/* Search toggle */}
        <button
          className="cmp-search-toggle"
          onClick={() => setShowSearch(s => !s)}
          aria-label="Toggle search"
        >
          {showSearch ? <X size={16} /> : <Search size={16} />}
        </button>

        {/* Expandable search input */}
        {showSearch && (
          <div className="cmp-search-wrap">
            <Search size={14} className="cmp-si" />
            <input
              autoFocus
              className="cmp-search-inp"
              placeholder="Search communities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="cmp-search-x" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Category chips */}
        <div className="cmp-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cmp-chip ${category === cat.id ? 'cmp-chip-active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          POPUP CARD on pin click
         ══════════════════════════════ */}
      {selected && (
        <div
          className="cmp-popup"
          style={{ left: popupPos.left, top: popupPos.top }}
          onClick={e => e.stopPropagation()}
        >
          {/* Cover image */}
          <div className="cmp-popup-cover">
            <img src={selected.image} alt={selected.name} />
            <div className="cmp-popup-gradient" />
            <button className="cmp-popup-close" onClick={() => setSelected(null)}>
              <X size={13} />
            </button>
            <span className="cmp-popup-cat-badge" style={{ background: selected.color }}>
              {selected.emoji} {selected.category}
            </span>
          </div>

          {/* Content */}
          <div className="cmp-popup-body">
            <h3 className="cmp-popup-title">{selected.name}</h3>
            <p className="cmp-popup-desc">{selected.description}</p>

            <div className="cmp-popup-meta">
              <span><Clock size={12} /> {selected.schedule}</span>
              <span><MapPin size={12} /> {selected.distance}</span>
              <span><Users size={12} /> {selected.members} members</span>
            </div>

            <div className="cmp-popup-tags">
              {selected.tags.map(tag => (
                <span key={tag} className="cmp-popup-tag"
                  style={{ color: selected.color, background: selected.bgColor }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="cmp-popup-host">
              <img src={selected.hostAvatar} alt={selected.hostName} />
              <span>Hosted by <strong>{selected.hostName}</strong></span>
              <Star size={11} style={{ color: selected.color, marginLeft: 'auto' }} />
            </div>

            <button className="cmp-popup-btn" style={{ background: selected.color }}>
              Join Community <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          MAP CONTROLS (bottom-right)
         ══════════════════════════════ */}
      <div className="cmp-ctrl" onClick={e => e.stopPropagation()}>
        {/* Zoom in */}
        <button
          className="cmp-ctrl-btn"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>

        {/* Zoom level label */}
        <div className="cmp-zoom-label">{zoom}</div>

        {/* Zoom out */}
        <button
          className="cmp-ctrl-btn"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>

        <div className="cmp-ctrl-sep" />

        {/* Recenter */}
        <button className="cmp-ctrl-btn" onClick={recenter} title="Back to my location">
          <Navigation2 size={17} />
        </button>
      </div>

      {/* ── OSM Attribution ── */}
      <p className="cmp-attr">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors
      </p>
    </div>
  );
};
