import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { useTheme } from '../context/ThemeContext';
import { NetworkBackground } from '../components/NetworkBackground';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Video,
  User as UserIcon,
  Network,
  LogOut,
  LayoutDashboard,
  UserCheck,
  UserPlus,
  X,
  Sun,
  Moon,
  Compass,
  Map,
  MessageCircleMore,
  Menu,
  Users,
  Search,
  Navigation2,
  Star,
  Plus,
  Minus,
  Clock,
  MapPin,
  ChevronDown,
  Calendar,
  Send,
  Mail,
  CheckCircle2
} from 'lucide-react';
import type { User, CommunityItem } from '../types';
import './NetworkConstellationPage.css';
import { supabase } from '../supabaseClient';

export interface EventCategoryOption {
  id: string;
  label: string;
  emoji: string;
  categoryKey: string;
  image: string;
}

const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = [
  { id: 'sport', label: 'sport', emoji: '🏃', categoryKey: 'Match', image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=60' },
  { id: 'night_out', label: 'night out', emoji: '🕺', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60' },
  { id: 'picnic', label: 'picnic', emoji: '🧺', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800&auto=format&fit=crop&q=60' },
  { id: 'event', label: 'event', emoji: '🎪', categoryKey: 'Meetup', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60' },
  { id: 'fitness', label: 'fitness', emoji: '🏋️', categoryKey: 'Practice', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60' },
  { id: 'house_party', label: 'house party', emoji: '🏡', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60' },
  { id: 'volleyball', label: 'beach volleyball', emoji: '🏐', categoryKey: 'Match', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=60' },
  { id: 'swimming', label: 'swimming', emoji: '🏊', categoryKey: 'Practice', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=60' },
  { id: 'climbing', label: 'climbing', emoji: '🧗', categoryKey: 'Practice', image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop&q=60' },
  { id: 'skating', label: 'skating', emoji: '🛼', categoryKey: 'Practice', image: 'https://images.unsplash.com/photo-1547051981-197857e2b75e?w=800&auto=format&fit=crop&q=60' },
  { id: 'dancing', label: 'dancing', emoji: '💃', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop&q=60' },
  { id: 'campfire', label: 'campfire', emoji: '🪵', categoryKey: 'Meetup', image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=800&auto=format&fit=crop&q=60' },
  { id: 'flex_working', label: 'flex working', emoji: '💻', categoryKey: 'Workshop', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60' },
  { id: 'walking', label: 'walking', emoji: '🥾', categoryKey: 'Meetup', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=60' },
  { id: 'adventure', label: 'adventure', emoji: '🚀', categoryKey: 'Meetup', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=60' },
  { id: 'creative', label: 'creative', emoji: '🎨', categoryKey: 'Workshop', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=60' },
  { id: 'dinner_party', label: 'dinner party', emoji: '🍽️', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60' },
  { id: 'drinks', label: 'drinks', emoji: '🍻', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60' },
  { id: 'games', label: 'games', emoji: '🎲', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=60' },
  { id: 'padel', label: 'padel', emoji: '🎾', categoryKey: 'Match', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=60' },
  { id: 'coffee', label: 'coffee', emoji: '☕', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=60' },
  { id: 'drinks_park', label: 'drinks in the park', emoji: '🍹', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&auto=format&fit=crop&q=60' },
];

// ─────────────────────────────────────────────
// CONSTANTS & MERCATOR MATH
// ─────────────────────────────────────────────
const MAP_TILE_SIZE = 256;
const MAP_BANGALORE = { lat: 12.9716, lng: 77.5946 };
const MAP_MIN_ZOOM = 10;
const MAP_MAX_ZOOM = 18;
const MAP_DEFAULT_ZOOM = 13;

const UI_COMMUNITY_COLOR_PALETTES = [
  { color: '#10b981', bgColor: '#d1fae5', glowColor: 'rgba(16, 185, 129, 0.55)' },
  { color: '#3b82f6', bgColor: '#dbeafe', glowColor: 'rgba(59, 130, 246, 0.55)' },
  { color: '#f59e0b', bgColor: '#fef3c7', glowColor: 'rgba(245, 158, 11, 0.55)' },
  { color: '#ef4444', bgColor: '#fee2e2', glowColor: 'rgba(239, 68, 68, 0.55)' },
  { color: '#8b5cf6', bgColor: '#ede9fe', glowColor: 'rgba(139, 92, 246, 0.55)' },
  { color: '#06b6d4', bgColor: '#cffafe', glowColor: 'rgba(6, 182, 212, 0.55)' },
  { color: '#f97316', bgColor: '#ffedd5', glowColor: 'rgba(249, 115, 22, 0.55)' },
  { color: '#f43f5e', bgColor: '#ffe4e6', glowColor: 'rgba(244, 63, 94, 0.55)' },
  { color: '#84cc16', bgColor: '#ecfccb', glowColor: 'rgba(132, 204, 22, 0.55)' },
  { color: '#ec4899', bgColor: '#fce7f3', glowColor: 'rgba(236, 72, 153, 0.55)' },
];

interface LocationOption {
  name: string;
  lat: number;
  lng: number;
  area: string;
}

const BANGALORE_LOCATIONS: LocationOption[] = [
  { name: 'JP Nagar 3rd Phase, Bengaluru', lat: 12.9105, lng: 77.5958, area: 'South Bangalore' },
  { name: 'JP Nagar 1st Phase, Bengaluru', lat: 12.9166, lng: 77.5855, area: 'South Bangalore' },
  { name: 'JP Nagar 6th Phase, Bengaluru', lat: 12.9056, lng: 77.5812, area: 'South Bangalore' },
  { name: 'JP Nagar 2nd Phase, Bengaluru', lat: 12.9140, lng: 77.5900, area: 'South Bangalore' },
  { name: 'Koramangala 4th Block, Bengaluru', lat: 12.9348, lng: 77.6254, area: 'South-East Bangalore' },
  { name: 'Koramangala 5th Block, Bengaluru', lat: 12.9352, lng: 77.6245, area: 'South-East Bangalore' },
  { name: 'Indiranagar 100ft Road, Bengaluru', lat: 12.9784, lng: 77.6408, area: 'East Bangalore' },
  { name: 'Indiranagar 12th Main, Bengaluru', lat: 12.9723, lng: 77.6421, area: 'East Bangalore' },
  { name: 'Cubbon Park, Bengaluru', lat: 12.9763, lng: 77.5929, area: 'Central Bangalore' },
  { name: 'MG Road, Bengaluru', lat: 12.9756, lng: 77.6015, area: 'Central Bangalore' },
  { name: 'HSR Layout Sector 1, Bengaluru', lat: 12.9116, lng: 77.6474, area: 'South-East Bangalore' },
  { name: 'HSR Layout Sector 3, Bengaluru', lat: 12.9142, lng: 77.6385, area: 'South-East Bangalore' },
  { name: 'Jayanagar 4th Block, Bengaluru', lat: 12.9250, lng: 77.5938, area: 'South Bangalore' },
  { name: 'Ulsoor Lake, Bengaluru', lat: 12.9831, lng: 77.6210, area: 'East Bangalore' },
  { name: 'Lalbagh Botanical Garden, Bengaluru', lat: 12.9507, lng: 77.5848, area: 'South Bangalore' },
  { name: 'Bannerghatta Road, Bengaluru', lat: 12.8638, lng: 77.5765, area: 'South Bangalore' },
  { name: 'Whitefield ITPL, Bengaluru', lat: 12.9866, lng: 77.7381, area: 'East Bangalore' },
  { name: 'BTM Layout 2nd Stage, Bengaluru', lat: 12.9166, lng: 77.6101, area: 'South Bangalore' },
  { name: 'Marathahalli, Bengaluru', lat: 12.9592, lng: 77.6974, area: 'East Bangalore' },
  { name: 'Hebbal, Bengaluru', lat: 13.0358, lng: 77.5970, area: 'North Bangalore' },
  { name: 'Electronic City Phase 1, Bengaluru', lat: 12.8452, lng: 77.6602, area: 'South Bangalore' },
  { name: 'Malleshwaram, Bengaluru', lat: 12.9984, lng: 77.5709, area: 'North-West Bangalore' },
  { name: 'Rajajinagar, Bengaluru', lat: 12.9880, lng: 77.5540, area: 'West Bangalore' },
  { name: 'Bellandur, Bengaluru', lat: 12.9279, lng: 77.6806, area: 'East Bangalore' },
];

interface CommunityAttendee {
  name: string;
  avatar: string;
  role?: string;
}

interface MapCommunity {
  id: string; name: string;
  lat: number; lng: number;
  locationName?: string;
  category: string; emoji: string; color: string; bgColor: string;
  members: number; schedule: string; distance: string;
  image: string; hostName: string; hostAvatar: string;
  description: string; tags: string[];
  glowColor: string;
  attendees?: CommunityAttendee[];
}

interface MapTile {
  x: number; y: number; px: number; py: number; key: string;
}

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

function mapComputeTiles(
  cLat: number, cLng: number,
  vpW: number, vpH: number,
  panX: number, panY: number,
  zoom: number
): MapTile[] {
  const cx = mapLng2frac(cLng, zoom) - panX / MAP_TILE_SIZE;
  const cy = mapLat2frac(cLat, zoom) - panY / MAP_TILE_SIZE;
  const hx = Math.ceil(vpW / 2 / MAP_TILE_SIZE) + 1;
  const hy = Math.ceil(vpH / 2 / MAP_TILE_SIZE) + 1;
  const n = Math.pow(2, zoom);
  const tiles: MapTile[] = [];
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

const MAP_CATEGORIES = [
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

interface NetworkMapProps {
  communityGroups: MapCommunity[];
  onRefreshCommunities?: () => Promise<void> | void;
}

// ─────────────────────────────────────────────
// NETWORK MAP COMPONENT — Interactive Zoom & Pan Map
// ─────────────────────────────────────────────
const NetworkMap: React.FC<NetworkMapProps> = ({ communityGroups, onRefreshCommunities }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<MapCommunity | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [membersModalCommunity, setMembersModalCommunity] = useState<MapCommunity | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberCommunity, setAddMemberCommunity] = useState<MapCommunity | null>(null);
  const [inviteContact, setInviteContact] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'tech',
    emoji: '💻',
    description: '',
    schedule: '',
    distance: '1.5 km',
    image: '',
    tags: '',
    locationName: 'JP Nagar 3rd Phase, Bengaluru',
    lat: 12.9105,
    lng: 77.5958,
  });
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationOption[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Create Event Modal states
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventModalCommunity, setEventModalCommunity] = useState<MapCommunity | null>(null);
  const [eventCategoryItem, setEventCategoryItem] = useState<EventCategoryOption>(EVENT_CATEGORY_OPTIONS[0]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventDateStr, setEventDateStr] = useState('');
  const [eventTimeStr, setEventTimeStr] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventSuccess, setEventSuccess] = useState(false);

  // Events List Modal states
  const [eventsModalCommunity, setEventsModalCommunity] = useState<MapCommunity | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [communityEventsList, setCommunityEventsList] = useState<any[]>([]);

  const fetchEventsForCommunity = async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('community_id', communityId);

      if (!error && data && data.length > 0) {
        setCommunityEventsList(data);
      } else {
        setCommunityEventsList([
          {
            id: `evt_mock_1`,
            community_id: communityId,
            title: `3v3 Community Tournament & Warmup`,
            category: `sport`,
            image: `https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=60`,
            date_str: `Tomorrow`,
            time_str: `6:00 PM`,
            location: `Community Turf Ground`,
            description: `Quick 3v3 mini tournament with round-robin matches. Winner stays on court!`
          },
          {
            id: `evt_mock_2`,
            community_id: communityId,
            title: `Weekly Meetup & Social Gathering`,
            category: `night out`,
            image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60`,
            date_str: `Saturday`,
            time_str: `7:30 PM`,
            location: `Central Social Cafe`,
            description: `Relax with members, discuss upcoming plans, and enjoy weekend refreshments.`
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching community events:", err);
    }
  };
  const selectedCatObj = useMemo(() => MAP_CATEGORIES.find(c => c.id === category) || MAP_CATEGORIES[0], [category]);
  const [mapCenter, setMapCenter] = useState(MAP_BANGALORE);
  const [zoom, setZoom] = useState(MAP_DEFAULT_ZOOM);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMapSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setMapSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const filtered = useMemo(() =>
    (communityGroups || []).filter(c => {
      const matchCat = category === 'all' || c.category === category;
      const matchQ = !search || c.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    }), [communityGroups, category, search]);

  const tiles = useMemo(() =>
    mapComputeTiles(mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    [mapCenter, mapSize, panOffset, zoom]);

  const pins = useMemo(() =>
    (communityGroups || []).map(c => ({
      ...c,
      ...mapToPixel(c.lat, c.lng, mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom)
    })), [communityGroups, mapCenter, mapSize, panOffset, zoom]);

  const userDot = useMemo(() =>
    mapToPixel(MAP_BANGALORE.lat, MAP_BANGALORE.lng, mapCenter.lat, mapCenter.lng, mapSize.w, mapSize.h, panOffset.x, panOffset.y, zoom),
    [mapCenter, mapSize, panOffset, zoom]);

  // Drag pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.nm-pin, .nm-popup, .nm-topbar, .nm-ctrl, .nm-cat-dropdown-container, .nm-search-box-container, .nm-top-left-controls, .nm-members-modal-backdrop, .nm-members-modal-card, .nm-add-member-modal-backdrop, .nm-add-member-modal-card, .create-community-btn, .nm-create-modal-backdrop, .nm-create-modal-card, .nm-location-dropdown, .nm-location-item, .nm-events-modal-backdrop, .nm-events-modal-card')) return;
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
    const cx = mapLng2frac(mapCenter.lng, zoom) - dx / MAP_TILE_SIZE;
    const cy = mapLat2frac(mapCenter.lat, zoom) - dy / MAP_TILE_SIZE;
    setMapCenter({ lat: mapFracToLat(cy, zoom), lng: mapFracToLng(cx, zoom) });
    setPanOffset({ x: 0, y: 0 });
  }, [dragging, dragStart, mapCenter, zoom]);

  // Touch pan handlers
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.nm-pin, .nm-popup, .nm-topbar, .nm-ctrl, .nm-cat-dropdown-container, .nm-search-box-container, .nm-top-left-controls, .nm-members-modal-backdrop, .nm-members-modal-card, .nm-add-member-modal-backdrop, .nm-add-member-modal-card, .create-community-btn, .nm-create-modal-backdrop, .nm-create-modal-card, .nm-location-dropdown, .nm-location-item, .nm-events-modal-backdrop, .nm-events-modal-card')) return;
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
    const cx = mapLng2frac(mapCenter.lng, zoom) - dx / MAP_TILE_SIZE;
    const cy = mapLat2frac(mapCenter.lat, zoom) - dy / MAP_TILE_SIZE;
    setMapCenter({ lat: mapFracToLat(cy, zoom), lng: mapFracToLng(cx, zoom) });
    setPanOffset({ x: 0, y: 0 });
  }, [dragging, panOffset, mapCenter, zoom]);

  const recenter = useCallback(() => {
    setMapCenter(MAP_BANGALORE);
    setPanOffset({ x: 0, y: 0 });
    setZoom(MAP_DEFAULT_ZOOM);
  }, []);

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 1, MAP_MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 1, MAP_MIN_ZOOM)), []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.nm-cat-dropdown-container, .nm-popup, .nm-ctrl')) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    setZoom(z => Math.min(Math.max(z + delta, MAP_MIN_ZOOM), MAP_MAX_ZOOM));
  }, []);

  // Smart popup positioning
  const getPopupPos = (pin: typeof pins[0]) => {
    const pw = 292, ph = 420;
    let left = pin.x + 36;
    let top = pin.y - 80;
    if (left + pw > mapSize.w - 16) left = pin.x - pw - 16;
    if (top + ph > mapSize.h - 16) top = mapSize.h - ph - 16;
    if (top < 80) top = 40;
    if (left < 16) left = 16;
    return { left, top };
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    let maxNum = 0;
    communityGroups.forEach(g => {
      const match = String(g.id).match(/^bg(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    if (maxNum === 0) {
      maxNum = communityGroups.length;
    }
    const newId = `bg${maxNum + 1}`;
    const palette = UI_COMMUNITY_COLOR_PALETTES[communityGroups.length % UI_COMMUNITY_COLOR_PALETTES.length];

    const targetLat = selectedLocation ? selectedLocation.lat : (createForm.lat || MAP_BANGALORE.lat);
    const targetLng = selectedLocation ? selectedLocation.lng : (createForm.lng || MAP_BANGALORE.lng);
    const targetLocName = selectedLocation ? selectedLocation.name : (locationInput.trim() || createForm.locationName || 'Bengaluru');

    const tagsText = createForm.tags.trim() || 'Networking';
    const tagsArray = tagsText.split(',').map(t => t.trim()).filter(Boolean);

    const newObj: MapCommunity = {
      id: newId,
      name: createForm.name.trim(),
      lat: targetLat,
      lng: targetLng,
      locationName: targetLocName,
      category: createForm.category || 'tech',
      emoji: createForm.emoji || '📌',
      color: palette.color,
      bgColor: palette.bgColor,
      glowColor: palette.glowColor,
      members: 1,
      schedule: createForm.schedule || 'Weekly Meetings',
      distance: createForm.distance || '1.2 km',
      image: createForm.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=85',
      hostName: 'You',
      hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
      description: createForm.description || 'Welcome to our new community!',
      tags: tagsArray,
      attendees: [
        { name: 'You (Host)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Host' }
      ],
    };

    // Persist to Supabase community_map table if available
    try {
      await supabase.from('community_map').insert([
        {
          id: newId,
          name: newObj.name,
          lat: targetLat,
          lng: targetLng,
          location_name: targetLocName,
          category: newObj.category,
          emoji: newObj.emoji,
          color: newObj.color,
          bg_color: newObj.bgColor,
          glow_color: newObj.glowColor,
          members: 1,
          schedule: newObj.schedule,
          distance: newObj.distance,
          image: newObj.image,
          host_name: 'You',
          host_avatar: newObj.hostAvatar,
          description: newObj.description,
          tags: tagsText,
          attendees: JSON.stringify(newObj.attendees),
        }
      ]);

      if (onRefreshCommunities) {
        await onRefreshCommunities();
      }
    } catch (err) {
      console.error("Error inserting community to Supabase:", err);
    }

    // Update UI state & Center Map on newly created location
    communityGroups.push(newObj);
    setMapCenter({ lat: targetLat, lng: targetLng });
    setCreateSuccess(true);
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEventId = `evt_${Date.now()}`;
    const targetCommunityId = eventModalCommunity?.id || '';
    const newEventObj = {
      id: newEventId,
      community_id: targetCommunityId,
      title: eventTitle.trim(),
      category: eventCategoryItem.label,
      image: eventImage || eventCategoryItem.image,
      date_str: eventDateStr || 'Upcoming',
      time_str: eventTimeStr || '7:00 PM',
      location: eventLocation || eventModalCommunity?.name,
      description: eventDescription,
    };
    try {
      await supabase.from('events').insert(newEventObj);
    } catch (err) {
      console.error("Error saving event:", err);
    }

    setCommunityEventsList(prev => [newEventObj, ...prev]);
    setEventSuccess(true);
  }

  return (
    <div
      ref={mapRef}
      className={`nm-root ${dragging ? 'nm-dragging' : ''}`}
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
      {/* MAP TILES WITH THEME STYLING */}
      {tiles.map(t => (
        <img
          key={t.key}
          className="nm-tile"
          src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
          alt=""
          style={{ left: t.px, top: t.py }}
          draggable={false}
        />
      ))}

      {/* Bangalore "You are here" indicator */}
      <div
        className="nm-you-dot"
        style={{
          left: userDot.x,
          top: userDot.y,
        }}
      >
        <span className="nm-you-ripple-1" />
        <span className="nm-you-ripple-2" />
        <span className="nm-you-core" />
        <span className="nm-you-label">You</span>
      </div>

      {/* COMMUNITY PINS */}
      {pins.map((pin, idx) => {
        const visible = filtered.some(f => f.id === pin.id);
        const isSel = selected?.id === pin.id;
        const isHov = hovered === pin.id;
        const isDaily = pin.schedule.toLowerCase().includes('daily');
        const animClass = `nm-float-${(idx % 3) + 1}`;
        const popupPos = isSel ? getPopupPos(pin) : { left: 0, top: 0 };
        return (
          <React.Fragment key={pin.id}>
            <button
              className={`nm-pin ${animClass} ${isSel ? 'nm-pin-sel' : ''} ${isHov ? 'nm-pin-hov' : ''} ${!visible ? 'nm-pin-dim' : ''}`}
              style={{
                left: pin.x,
                top: pin.y,
                '--nm-glow': pin.glowColor,
                '--nm-color': pin.color,
              } as React.CSSProperties}
              onClick={e => { e.stopPropagation(); setSelected(isSel ? null : pin); }}
              onMouseEnter={() => setHovered(pin.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={pin.name}
            >
              {/* Glow ring */}
              <span className="nm-pin-glow-ring" style={{ borderColor: pin.color, boxShadow: `0 0 14px ${pin.glowColor}` }} />
              {/* Pulse for daily */}
              {isDaily && <span className="nm-pin-pulse" style={{ background: pin.color }} />}
              {/* Avatar image */}
              <img src={pin.image} alt={pin.name} className="nm-pin-img" />
              {/* Emoji badge */}
              <span className="nm-pin-badge" style={{ background: pin.color }}>{pin.emoji}</span>
              {/* Member count */}
              <span className="nm-pin-count" style={{ background: pin.color }}>
                {pin.members > 99 ? '99+' : pin.members}
              </span>
              {/* Hover name tooltip */}
              {isHov && !isSel && (
                <span className="nm-pin-tooltip">{pin.name}</span>
              )}
            </button>

            {/* POPUP CARD */}
            {isSel && (
              <div
                className="nm-popup"
                style={{ left: popupPos.left, top: popupPos.top }}
                onClick={e => e.stopPropagation()}
              >
                <div className="nm-popup-cover">
                  <img src={pin.image} alt={pin.name} />
                  <div className="nm-popup-gradient" style={{ background: `linear-gradient(to bottom, transparent 40%, ${pin.color}22 100%)` }} />
                  <button className="nm-popup-close" onClick={() => setSelected(null)}><X size={13} /></button>
                  <span className="nm-popup-cat-badge" style={{ background: pin.color }}>
                    {pin.emoji} {pin.category}
                  </span>
                </div>
                <div className="nm-popup-body">
                  <h3 className="nm-popup-title" style={{ color: pin.color }}>{pin.name}</h3>
                  <p className="nm-popup-desc">{pin.description}</p>
                  <div className="nm-popup-meta">
                    <span><Clock size={12} /> {pin.schedule}</span>
                    <div className="nm-popup-meta-row">
                      <span><MapPin size={12} /> {pin.distance}</span>
                      <span><Users size={12} /> {pin.members} members</span>
                    </div>
                  </div>
                  {/* <div className="nm-popup-tags">
                    {pin.tags.map(tag => (
                      <span key={tag} className="nm-popup-tag" style={{ color: pin.color, borderColor: `${pin.color}44`, background: `${pin.color}15` }}>{tag}</span>
                    ))}
                  </div> */}

                  {/* ── CARD ACTION BUTTONS: Members, Events & Chat ── */}
                  <div className="nm-popup-actions-row">
                    <button
                      className="nm-card-btn nm-card-btn-members"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMembersModalCommunity(pin);
                      }}
                      title="View Community Members"
                    >
                      <Users size={13} />
                      <span>Members</span>
                    </button>

                    <button
                      className="nm-card-btn nm-card-btn-event"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventsModalCommunity(pin);
                        setEventSearch('');
                        fetchEventsForCommunity(pin.id);
                      }}
                      title="View Community Events"
                    >
                      <Calendar size={13} />
                      <span>Events</span>
                    </button>

                    <button
                      className="nm-card-btn nm-card-btn-chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/community-chat?id=${pin.id}`);
                      }}
                      title="Chat in Community Channel"
                    >
                      <MessageCircleMore size={13} />
                      <span>Chat</span>
                    </button>
                  </div>

                  <div className="nm-popup-host">
                    <img src={pin.hostAvatar} alt={pin.hostName} />
                    <span>Hosted by <strong>{pin.hostName}</strong></span>
                    <Star size={11} style={{ color: pin.color, marginLeft: 'auto' }} />
                  </div>
                  <button className="nm-popup-btn" style={{ background: `linear-gradient(135deg, ${pin.color}, ${pin.color}bb)`, boxShadow: `0 4px 16px ${pin.glowColor}` }}>
                    Join Community →
                  </button>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* TOP CONTROLS: CATEGORY DROPDOWN, SEARCH BOX & CREATE COMMUNITY */}
      <div className="nm-top-left-controls">
        <div
          className="nm-cat-dropdown-container"
          onClick={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
          onMouseEnter={() => setCatMenuOpen(true)}
          onMouseLeave={() => setCatMenuOpen(false)}
        >
          <button
            className="nm-cat-trigger-btn"
            onClick={() => setCatMenuOpen(open => !open)}
            aria-label="Filter by Category"
          >
            <span className="nm-cat-trigger-emoji">{selectedCatObj.emoji}</span>
            <span className="nm-cat-trigger-label">{selectedCatObj.label}</span>
            <ChevronDown size={14} className={`nm-cat-chevron ${catMenuOpen ? 'open' : ''}`} />
          </button>

          {catMenuOpen && (
            <div className="nm-cat-menu-list" onWheel={e => e.stopPropagation()}>
              {MAP_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`nm-cat-menu-item ${category === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(cat.id);
                    setCatMenuOpen(false);
                  }}
                >
                  <span className="nm-cat-item-emoji">{cat.emoji}</span>
                  <span className="nm-cat-item-label">{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH BOX FOR COMMUNITY NAME */}
        <div
          className="nm-search-box-container"
          onClick={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
        >
          <Search size={14} className="nm-search-box-icon" />
          <input
            type="text"
            className="nm-search-box-input"
            placeholder="Search communities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="nm-search-box-clear"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Futuristic Holographic Action Node: Create Community */}
        <button
          className="create-community-btn cyber-action-node"
          onClick={(e) => {
            e.stopPropagation();
            setCreateForm({
              name: '',
              category: 'tech',
              emoji: '💻',
              description: '',
              schedule: '',
              distance: '1.5 km',
              image: '',
              tags: '',
              locationName: null,
              lat: null,
              lng: null,
            });
            setCreateSuccess(false);
            setShowCreateCommunityModal(true);
          }}
          title="Create New Community"
        >
          <span className="cyber-pulse-ring" />
          <span className="cyber-orbit-glow" />
          <div className="cyber-node-icon">
            <Plus size={17} strokeWidth={3} className="cyber-plus-svg" />
          </div>
          <span className="cyber-node-text">
            {/* <span className="cyber-node-sub">NEW</span> */}
            <span className="cyber-node-main">Community</span>
          </span>
        </button>
      </div>

      {/* MAP ZOOM & RECENTER CONTROLS */}
      <div className="nm-ctrl" onClick={e => e.stopPropagation()}>
        <button className="nm-ctrl-btn" onClick={zoomIn} disabled={zoom >= MAP_MAX_ZOOM} title="Zoom in" aria-label="Zoom in">
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <div className="nm-zoom-label">{zoom}</div>
        <button className="nm-ctrl-btn" onClick={zoomOut} disabled={zoom <= MAP_MIN_ZOOM} title="Zoom out" aria-label="Zoom out">
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <div className="nm-ctrl-sep" />
        <button className="nm-ctrl-btn" onClick={recenter} title="Back to my location" aria-label="Recenter location">
          <Navigation2 size={17} />
        </button>
      </div>

      {/* ATTRIBUTION */}
      <p className="nm-attr">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors
      </p>

      {/* ── OPTION 2: SEPARATE POPUP MODAL VIEW ── */}
      {membersModalCommunity && (
        <div
          className="nm-members-modal-backdrop"
          onClick={() => setMembersModalCommunity(null)}
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="nm-members-modal-card"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="nm-modal-header" style={{ borderColor: `${membersModalCommunity.color}44` }}>
              <div className="nm-modal-header-info">
                <h3 className="nm-modal-title">{membersModalCommunity.name}</h3>
                <span className="nm-modal-badge" style={{ background: membersModalCommunity.color }}>
                  {membersModalCommunity.emoji} {membersModalCommunity.category}
                </span>
              </div>

              <div className="nm-modal-header-actions">
                <button
                  className="nm-modal-add-btn"
                  onClick={() => {
                    setAddMemberCommunity(membersModalCommunity);
                    setMembersModalCommunity(null);
                    setSelected(null);
                    setInviteContact('');
                    setInviteSuccess(false);
                    setShowAddMemberModal(true);
                  }}
                  title="Add new member to this community"
                >
                  <UserPlus size={13} />
                  <span>Add Member</span>
                </button>

                <button
                  className="nm-modal-close-btn"
                  onClick={() => setMembersModalCommunity(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Search */}
            <div className="nm-modal-search-wrap">
              <Search size={14} className="nm-modal-search-icon" />
              <input
                className="nm-modal-search-inp"
                placeholder="Search members by name..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
              />
              {memberSearch && (
                <button className="nm-modal-search-x" onClick={() => setMemberSearch('')}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Modal Members Grid */}
            <div className="nm-modal-members-grid">
              {(membersModalCommunity.attendees || [])
                .filter(m => !memberSearch || m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                .map((mem, mIdx) => (
                  <div key={mIdx} className="nm-modal-member-card">
                    <div className="nm-modal-avatar-wrap">
                      <img src={mem.avatar} alt={mem.name} />
                      <span className={`nm-modal-status-dot ${mem.role === 'Host' ? 'host' : 'online'}`} />
                    </div>
                    <div className="nm-modal-member-meta">
                      <span className="nm-modal-member-name">{mem.name}</span>
                    </div>
                    <button className="nm-modal-msg-btn" title="Info" >
                      <span className={`nm-modal-member-tag ${mem.role === 'Host' ? 'host' : ''}`}>
                        {mem.role || 'Member'}
                      </span>
                    </button>
                    {/* <button
                      className="nm-modal-msg-btn"
                      onClick={() => navigate('/chat')}
                      title="Send Message"
                    >
                      Message
                    </button> */}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EVENTS LIST POPUP MODAL VIEW ── */}
      {eventsModalCommunity && (
        <div
          className="nm-members-modal-backdrop"
          onClick={() => setEventsModalCommunity(null)}
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="nm-members-modal-card"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            {/* Modal Header */}
            <div className="nm-modal-header" style={{ borderColor: `${eventsModalCommunity.color}44` }}>
              <div className="nm-modal-header-info">
                <h3 className="nm-modal-title">{eventsModalCommunity.name}</h3>
                <span className="nm-modal-badge" style={{ background: eventsModalCommunity.color }}>
                  <Calendar size={11} style={{ marginRight: 4 }} /> Events ({communityEventsList.length})
                </span>
              </div>

              <div className="nm-modal-header-actions">
                <button
                  className="nm-modal-add-btn"
                  onClick={() => {
                    const targetComm = eventsModalCommunity;
                    setEventsModalCommunity(null);
                    setSelected(null);
                    setEventModalCommunity(targetComm);
                    setEventCategoryItem(EVENT_CATEGORY_OPTIONS[0]);
                    setEventTitle('');
                    setEventImage(EVENT_CATEGORY_OPTIONS[0].image);
                    setEventDateStr('');
                    setEventTimeStr('');
                    setEventLocation(targetComm.name || targetComm.locationName || '');
                    setEventDescription('');
                    setEventSuccess(false);
                    setShowCreateEventModal(true);
                  }}
                  title="Add Event for this Community"
                  style={{
                    background: `linear-gradient(135deg, ${eventsModalCommunity.color}, ${eventsModalCommunity.color}cc)`
                  }}
                >
                  <Plus size={13} />
                  <span>Add Event</span>
                </button>

                <button
                  className="nm-modal-close-btn"
                  onClick={() => setEventsModalCommunity(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Search */}
            <div className="nm-modal-search-wrap">
              <Search size={14} className="nm-modal-search-icon" />
              <input
                className="nm-modal-search-inp"
                placeholder="Search events by title or location..."
                value={eventSearch}
                onChange={e => setEventSearch(e.target.value)}
              />
              {eventSearch && (
                <button className="nm-modal-search-clear" onClick={() => setEventSearch('')}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Events List Body */}
            <div className="nm-members-list-body">
              {(() => {
                const filteredEvents = communityEventsList.filter(evt =>
                  evt.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
                  evt.location?.toLowerCase().includes(eventSearch.toLowerCase()) ||
                  evt.category?.toLowerCase().includes(eventSearch.toLowerCase())
                );

                if (filteredEvents.length === 0) {
                  return (
                    <div className="nm-members-empty">
                      <Calendar size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                      <p>No events found for <strong>{eventsModalCommunity.name}</strong></p>
                    </div>
                  );
                }

                return filteredEvents.map((evt) => (
                  <div key={evt.id} className="nm-event-card-item">
                    {evt.image && (
                      <img src={evt.image} alt={evt.title} className="nm-event-card-img" />
                    )}
                    <div className="nm-event-card-content">
                      <div className="nm-event-card-header">
                        <h4 className="nm-event-card-title">{evt.title}</h4>
                        <span className="nm-event-cat-badge" style={{ background: `${eventsModalCommunity.color}22`, color: eventsModalCommunity.color, borderColor: `${eventsModalCommunity.color}55` }}>
                          {evt.category || 'Event'}
                        </span>
                      </div>
                      <div className="nm-event-card-meta">
                        <span><Clock size={11} /> {evt.date_str || evt.dateStr || 'Upcoming'} at {evt.time_str || evt.timeStr || '7:00 PM'}</span>
                        <span><MapPin size={11} /> {evt.location || 'Venue'}</span>
                      </div>
                      {evt.description && (
                        <p className="nm-event-card-desc">{evt.description}</p>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── NEW POPUP MODAL: ADD / INVITE MEMBER ── */}
      {showAddMemberModal && (
        <div
          className="nm-add-member-modal-backdrop"
          onClick={() => setShowAddMemberModal(false)}
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="nm-add-member-modal-card"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="nm-add-modal-header">
              <div className="nm-add-modal-header-left">
                <div className="nm-add-modal-icon-badge" style={{ background: addMemberCommunity?.color || '#06b6d4' }}>
                  <UserPlus size={18} color="#fff" />
                </div>
                <div>
                  <h3 className="nm-add-modal-title">Add Member</h3>
                  <p className="nm-add-modal-subtitle">
                    Invite new member to <strong>{addMemberCommunity?.name || 'Community'}</strong>
                  </p>
                </div>
              </div>
              <button
                className="nm-modal-close-btn"
                onClick={() => setShowAddMemberModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="nm-add-modal-body">
              {inviteSuccess ? (
                <div className="nm-add-modal-success">
                  <CheckCircle2 size={44} className="nm-success-icon" />
                  <h4>Invitation Sent!</h4>
                  <p>An invite link has been dispatched to <strong>{inviteContact}</strong></p>
                  <button
                    className="nm-invite-send-btn"
                    onClick={() => setShowAddMemberModal(false)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inviteContact.trim()) return;
                    setInviteSuccess(true);
                  }}
                  className="nm-add-modal-form"
                >
                  <label className="nm-add-modal-label">
                    Please enter mobile number or email address
                  </label>
                  <div className="nm-add-input-wrap">
                    <Mail size={16} className="nm-add-input-icon" />
                    <input
                      type="text"
                      className="nm-add-modal-inp"
                      placeholder="e.g. +91 98765 43210 or name@example.com"
                      value={inviteContact}
                      onChange={e => setInviteContact(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="nm-add-modal-footer">
                    <button
                      type="button"
                      className="nm-add-cancel-btn"
                      onClick={() => setShowAddMemberModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="nm-invite-send-btn"
                      disabled={!inviteContact.trim()}
                      style={{
                        background: addMemberCommunity
                          ? `linear-gradient(135deg, ${addMemberCommunity.color}, ${addMemberCommunity.color}bb)`
                          : undefined
                      }}
                    >
                      <Send size={14} />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── NEW POPUP MODAL: CREATE COMMUNITY FORM ── */}
      {showCreateCommunityModal && (
        <div
          className="nm-create-modal-backdrop"
          onClick={() => setShowCreateCommunityModal(false)}
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="nm-create-modal-card"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="nm-create-modal-header">
              <div className="nm-create-header-left">
                <div className="nm-create-badge">
                  <Plus size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="nm-create-title">Create Community</h3>
                  <p className="nm-create-subtitle">Build and host a new local community group</p>
                </div>
              </div>
              <button
                className="nm-modal-close-btn"
                onClick={() => setShowCreateCommunityModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="nm-create-modal-body">
              {createSuccess ? (
                <div className="nm-add-modal-success">
                  <CheckCircle2 size={44} className="nm-success-icon" />
                  <h4>Community Created!</h4>
                  <p>Your community <strong>{createForm.name}</strong> is now live on the map.</p>
                  <button
                    className="nm-invite-send-btn"
                    onClick={() => setShowCreateCommunityModal(false)}
                  >
                    View on Map
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateCommunity} className="nm-create-form" >
                  {/* Community Name */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Name *</label>
                    <input
                      type="text"
                      className="nm-form-inp"
                      placeholder="Community Name"
                      value={createForm.name}
                      onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Location Picker Input (Google Style Autocomplete with Lat/Lng) */}
                  <div className="nm-form-group nm-location-group">
                    <label className="nm-form-label">
                      Location *
                      {selectedLocation && (
                        <span className="nm-location-coords-badge">
                          📍 Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                        </span>
                      )}
                    </label>

                    <div className="nm-location-input-wrap">
                      <MapPin size={16} className="nm-location-icon" />
                      <input
                        type="text"
                        className="nm-form-inp nm-location-inp"
                        placeholder="Start typing location..."
                        value={locationInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLocationInput(val);
                          setSelectedLocation(null);

                          if (val.trim().length > 0) {
                            const filtered = BANGALORE_LOCATIONS.filter(l =>
                              l.name.toLowerCase().includes(val.toLowerCase()) ||
                              l.area.toLowerCase().includes(val.toLowerCase())
                            );
                            setLocationSuggestions(filtered);
                            setShowLocationDropdown(true);

                            // Fetch live geocoding suggestions for custom addresses
                            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val + ', Bangalore')}&limit=5`)
                              .then(res => res.json())
                              .then(geoData => {
                                if (Array.isArray(geoData) && geoData.length > 0) {
                                  const geoOptions: LocationOption[] = geoData.map((g: any) => ({
                                    name: g.display_name.split(',').slice(0, 3).join(','),
                                    lat: parseFloat(g.lat),
                                    lng: parseFloat(g.lon),
                                    area: 'Bengaluru'
                                  }));
                                  setLocationSuggestions(prev => {
                                    const combined = [...prev];
                                    geoOptions.forEach(opt => {
                                      if (!combined.some(c => c.name === opt.name)) combined.push(opt);
                                    });
                                    return combined;
                                  });
                                }
                              })
                              .catch(() => { });
                          } else {
                            setLocationSuggestions([]);
                            setShowLocationDropdown(false);
                          }
                        }}
                        onFocus={() => {
                          if (locationInput.trim().length > 0) {
                            setShowLocationDropdown(true);
                          } else {
                            setShowLocationDropdown(false);
                          }
                        }}
                      />
                      {locationInput && (
                        <button
                          type="button"
                          className="nm-location-clear-btn"
                          onClick={() => {
                            setLocationInput('');
                            setSelectedLocation(null);
                            setLocationSuggestions([]);
                            setShowLocationDropdown(false);
                          }}
                          title="Clear location"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Google Style Autocomplete Suggestions Dropdown */}
                    {showLocationDropdown && locationSuggestions.length > 0 && (
                      <div className="nm-location-dropdown" onMouseDown={e => e.stopPropagation()}>
                        <div className="nm-location-dropdown-title">Matching Bangalore Locations</div>
                        {locationSuggestions.map((loc, lIdx) => (
                          <div
                            key={lIdx}
                            className="nm-location-item"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setLocationInput(loc.name);
                              setCreateForm(prev => ({
                                ...prev,
                                locationName: loc.name,
                                lat: loc.lat,
                                lng: loc.lng,
                                distance: '1.2 km'
                              }));
                              setShowLocationDropdown(false);
                            }}
                          >
                            <div className="nm-location-item-icon">
                              <MapPin size={15} />
                            </div>
                            <div className="nm-location-item-meta">
                              <span className="nm-location-item-name">{loc.name}</span>
                              <span className="nm-location-item-area">{loc.area} • Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Selection Grid / Chips */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Category *</label>
                    <div className="nm-category-grid-picker">
                      {MAP_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const isSelected = createForm.category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            className={`nm-category-pick-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setCreateForm({
                                ...createForm,
                                category: cat.id,
                                emoji: cat.emoji
                              });
                            }}
                          >
                            <span className="nm-cat-pick-emoji">{cat.emoji}</span>
                            <span className="nm-cat-pick-label">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Schedule / Meeting Time</label>
                    <input
                      type="text"
                      className="nm-form-inp"
                      placeholder="e.g. Every Friday · 7:00 PM"
                      value={createForm.schedule}
                      onChange={e => setCreateForm({ ...createForm, schedule: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Description</label>
                    <textarea
                      className="nm-form-textarea"
                      rows={3}
                      placeholder="Briefly describe what your community is about..."
                      value={createForm.description}
                      onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                    />
                  </div>

                  {/* Cover Image URL */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Cover Image URL</label>
                    <input
                      type="url"
                      className="nm-form-inp"
                      placeholder="https://images.unsplash.com/..."
                      value={createForm.image}
                      onChange={e => setCreateForm({ ...createForm, image: e.target.value })}
                    />
                  </div>

                  {/* Tags */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Tags</label>
                    <input
                      type="text"
                      className="nm-form-inp"
                      placeholder="Tags"
                      value={createForm.tags}
                      onChange={e => setCreateForm({ ...createForm, tags: e.target.value })}
                    />
                  </div>

                  {/* Footer Buttons */}
                  <div className="nm-add-modal-footer">
                    <button
                      type="button"
                      className="nm-add-cancel-btn"
                      onClick={() => setShowCreateCommunityModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="nm-invite-send-btn"
                      disabled={!createForm.name.trim()}
                    >
                      <Plus size={16} />
                      <span>Create Community</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── POPUP MODAL: CREATE EVENT / ACTIVITY FOR COMMUNITY ── */}
      {showCreateEventModal && (
        <div
          className="nm-create-modal-backdrop"
          onClick={() => setShowCreateEventModal(false)}
          onMouseDown={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
        >
          <div
            className="nm-create-modal-card"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="nm-create-modal-header">
              <div className="nm-create-header-left">
                <div
                  className="nm-create-badge"
                  style={{ background: eventModalCommunity ? `linear-gradient(135deg, ${eventModalCommunity.color}, ${eventModalCommunity.color}dd)` : undefined }}
                >
                  <Calendar size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="nm-create-title">Create Event</h3>
                  <p className="nm-create-subtitle">
                    Add new activity for <strong>{eventModalCommunity?.name || 'Community'}</strong>
                  </p>
                </div>
              </div>
              <button
                className="nm-modal-close-btn"
                onClick={() => setShowCreateEventModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="nm-create-modal-body">
              {eventSuccess ? (
                <div className="nm-add-modal-success">
                  <CheckCircle2 size={44} className="nm-success-icon" />
                  <h4>Event Created!</h4>
                  <p>Your event <strong>{eventTitle}</strong> is now posted for {eventModalCommunity?.name}.</p>
                  <button
                    className="nm-invite-send-btn"
                    onClick={() => setShowCreateEventModal(false)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleCreateEvent}
                  className="nm-create-form"
                >
                  {/* Category Picker Selector (2-row scrollable circle grid from CommunityDetailsPage) */}
                  <div className="nm-form-group category-picker-group">
                    <label className="nm-form-label">Category *</label>
                    <div className="category-scroll-container" onWheel={e => e.stopPropagation()}>
                      <div className="category-items-grid">
                        {EVENT_CATEGORY_OPTIONS.map((cat) => {
                          const isSelected = eventCategoryItem.id === cat.id;
                          return (
                            <div
                              key={cat.id}
                              className={`category-item-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setEventCategoryItem(cat);
                                if (!eventImage) setEventImage(cat.image);
                              }}
                            >
                              <div className="category-icon-circle">
                                <span className="category-emoji">{cat.emoji}</span>
                              </div>
                              <span className="category-item-label">{cat.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Activity Title */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Activity Title *</label>
                    <input
                      type="text"
                      className="nm-form-inp"
                      placeholder="e.g. 3v3 Friendly Football Match"
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Date & Time Row */}
                  <div className="nm-form-row">
                    <div className="nm-form-group flex-1">
                      <label className="nm-form-label">Date</label>
                      <input
                        type="text"
                        className="nm-form-inp"
                        placeholder="e.g. Tomorrow or July 28"
                        value={eventDateStr}
                        onChange={e => setEventDateStr(e.target.value)}
                      />
                    </div>
                    <div className="nm-form-group flex-1">
                      <label className="nm-form-label">Time</label>
                      <input
                        type="text"
                        className="nm-form-inp"
                        placeholder="e.g. 6:00 PM"
                        value={eventTimeStr}
                        onChange={e => setEventTimeStr(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Location / Venue */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Location / Venue</label>
                    <input
                      type="text"
                      className="nm-form-inp"
                      placeholder="e.g. Koramangala Turf Ground Pitch 1"
                      value={eventLocation}
                      onChange={e => setEventLocation(e.target.value)}
                    />
                  </div>

                  {/* Cover Image URL */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Cover Image URL</label>
                    <input
                      type="url"
                      className="nm-form-inp"
                      placeholder="https://images.unsplash.com/..."
                      value={eventImage}
                      onChange={e => setEventImage(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="nm-form-group">
                    <label className="nm-form-label">Description</label>
                    <textarea
                      className="nm-form-textarea"
                      rows={3}
                      placeholder="Brief details about rules, equipment required, or plan..."
                      value={eventDescription}
                      onChange={e => setEventDescription(e.target.value)}
                    />
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="nm-add-modal-footer">
                    <button
                      type="button"
                      className="nm-add-cancel-btn"
                      onClick={() => setShowCreateEventModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="nm-invite-send-btn"
                      disabled={!eventTitle.trim()}
                      style={{
                        background: eventModalCommunity
                          ? `linear-gradient(135deg, ${eventModalCommunity.color}, ${eventModalCommunity.color}bb)`
                          : undefined
                      }}
                    >
                      <Plus size={16} />
                      <span>Create Event</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Hook to get responsive stage dimensions — always fits within viewport
const useStageSize = () => {
  const getSize = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Reserve space for header + padding (header ~70px + margins ~40px + breathing room)
    const headerReserve = w <= 480 ? 80 : w <= 768 ? 90 : 110;
    const availableH = h - headerReserve;
    const isMobile = w <= 480;
    const isTablet = w > 480 && w <= 768;

    // Stage must fit both horizontally and vertically
    const horizontalMax = isMobile ? w - 32 : isTablet ? w - 64 : w <= 1024 ? w - 80 : 700;
    const size = Math.max(Math.min(horizontalMax, availableH), isMobile ? 260 : 320);

    const ratios = isMobile
      ? { inner: 0.24, outer: 0.38, center: 0.16, innerSat: 0.14, outerSat: 0.08 }
      : isTablet
        ? { inner: 0.26, outer: 0.42, center: 0.16, innerSat: 0.16, outerSat: 0.085 }
        : w <= 1024
          ? { inner: 0.28, outer: 0.46, center: 0.16, innerSat: 0.16, outerSat: 0.085 }
          : { inner: 0.28, outer: 0.46, center: 0.16, innerSat: 0.16, outerSat: 0.08 };

    return {
      stageSize: size,
      innerRadius: size * ratios.inner,
      outerRadius: size * ratios.outer,
      centerSize: size * ratios.center,
      innerSatSize: size * ratios.innerSat,
      outerSatSize: size * ratios.outerSat,
      isMobile,
      isTablet,
    };
  }, []);

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    const handleResize = () => setSize(getSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getSize]);

  return size;
};

export const NetworkConstellationPage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleFollow, startCall, setActiveChatUserId } = useCommunication();
  const navigate = useNavigate();

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [communityGroups, setCommunityGroups] = useState<MapCommunity[]>([]);

  useEffect(() => {
    fetchCommunities();
    fetchCommunityGroups();
  }, []);

  const fetchCommunityGroups = async () => {
    const { data, error } = await supabase.from('community_map').select('*');

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const mapped: MapCommunity[] = data.map((g, idx) => {
        const palette = UI_COMMUNITY_COLOR_PALETTES[idx % UI_COMMUNITY_COLOR_PALETTES.length];
        let parsedAttendees = [
          { name: g.host_name || 'Host', avatar: g.host_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Host' },
          { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80', role: 'Member' },
          { name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80', role: 'Member' },
          { name: 'Rohan Kumar', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80', role: 'Member' },
          { name: 'Kavya B.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=60&q=80', role: 'Member' },
        ];
        if (g.attendees) {
          try {
            const raw = typeof g.attendees === 'string' ? JSON.parse(g.attendees) : g.attendees;
            if (Array.isArray(raw) && raw.length > 0) {
              parsedAttendees = raw.map((a: any) => ({
                name: typeof a === 'string' ? a : a.name || 'Member',
                avatar: typeof a === 'object' && a.avatar ? a.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80',
                role: typeof a === 'object' && a.role ? a.role : 'Member',
              }));
            }
          } catch (e) {
            console.error('Error parsing attendees:', e);
          }
        }
        return {
          id: String(g.id),
          name: g.name || '',
          lat: Number(g.lat),
          lng: Number(g.lng),
          locationName: g.location_name || g.location || '',
          category: g.category || 'all',
          emoji: g.emoji || '📌',
          color: palette.color,
          bgColor: palette.bgColor,
          glowColor: palette.glowColor,
          members: Number(g.members || parsedAttendees.length),
          schedule: g.schedule || '',
          distance: g.distance || '',
          image: g.image || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=320&q=85',
          hostName: g.host_name || g.hostName || '',
          hostAvatar: g.host_avatar || g.hostAvatar || '',
          description: g.description || '',
          tags: g.tags || '',
          attendees: parsedAttendees,
        };
      });

      setCommunityGroups(mapped);
    }
  };

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


  const [selectedNode, setSelectedNode] = useState<
    | { type: 'user'; data: User }
    | { type: 'community'; data: CommunityItem }
    | null
  >(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stage = useStageSize();

  if (!authUser) return null;

  // Selected node helpers
  const selectedUser = selectedNode?.type === 'user' ? (selectedNode.data as User) : null;
  const selectedCommunity = selectedNode?.type === 'community' ? (selectedNode.data as CommunityItem) : null;

  const THEME_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
    football: { border: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)', text: '#22c55e', bg: 'rgba(34, 197, 94, 0.05)' },
    cricket: { border: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', text: '#eab308', bg: 'rgba(234, 179, 8, 0.05)' },
    music: { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', text: '#a855f7', bg: 'rgba(168, 85, 247, 0.05)' },
    party: { border: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', text: '#ec4899', bg: 'rgba(236, 72, 153, 0.05)' },
    travel: { border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)', text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.05)' },
    drinks: { border: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', text: '#f97316', bg: 'rgba(249, 115, 22, 0.05)' },
  };

  const themeColorInfo = selectedCommunity
    ? (THEME_COLORS[selectedCommunity.theme] || THEME_COLORS.music)
    : THEME_COLORS.music;

  const customThemeVars = {
    '--theme-border': themeColorInfo.border,
    '--theme-glow': themeColorInfo.glow,
    '--theme-text': themeColorInfo.text,
    '--theme-bg': themeColorInfo.bg,
  } as React.CSSProperties;

  const generateScatterOffsets = (count: number, maxRadius: number) => {
    const offsets: { x: number; y: number }[] = [];
    const nodeSize = getMemberNodeSize(count);
    const nodeRadius = nodeSize / 2;

    const R_min = count <= 3 ? 75 : 82;
    const R_max = Math.max(R_min + 15, maxRadius - (nodeRadius + 18));

    let ringRadii: number[] = [];
    if (count <= 6) {
      ringRadii = [(R_min + R_max) / 2];
    } else if (count <= 14) {
      ringRadii = [R_min + 5, R_max];
    } else {
      ringRadii = [R_min, R_min + (R_max - R_min) * 0.52, R_max];
    }

    const ringCapacities = [8, 8, 8, 8];

    let placed = 0;
    for (let r = 0; r < ringRadii.length && placed < count; r++) {
      const radius = ringRadii[r];
      const capacity = Math.min(ringCapacities[r], count - placed);

      for (let i = 0; i < capacity; i++) {
        let angleOffset = r % 2 === 1 ? Math.PI / capacity : 0;
        if (capacity === 2) {
          angleOffset = Math.PI / 4;
        }

        const angle = (2 * Math.PI * i) / capacity - Math.PI / 2 + angleOffset;
        offsets.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        placed++;
      }
    }

    let extraRing = 0;
    while (placed < count) {
      const radius = R_max + (extraRing + 1) * 35;
      const capacity = Math.min(8, count - placed);
      for (let i = 0; i < capacity && placed < count; i++) {
        const angleOffset = capacity === 2 ? Math.PI / 4 : (extraRing % 2 === 1 ? Math.PI / capacity : 0);
        const angle = (2 * Math.PI * i) / capacity - Math.PI / 2 + angleOffset;
        offsets.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        placed++;
      }
      extraRing++;
    }
    return offsets;
  };

  const getMemberNodeSize = (count: number): number => {
    if (count <= 3) return 40;
    if (count <= 8) return 34;
    if (count <= 16) return 28;
    return 24;
  };

  const getProfileIdByName = (name: string): string => {
    if (name.includes('Alex')) return 'current_user_1';
    if (name.includes('Sophia')) return 'user_1';
    if (name.includes('Marcus')) return 'user_2';
    if (name.includes('Elena')) return 'user_3';
    if (name.includes('David')) return 'user_4';
    if (name.includes('Aisha')) return 'user_5';
    if (name.includes('Leo')) return 'user_6';
    if (name.includes('Ravi')) return 'user_7';
    if (name.includes('Priya')) return 'user_8';
    if (name.includes('Arjun')) return 'user_9';
    if (name.includes('Meera')) return 'user_10';
    if (name.includes('Karthik')) return 'user_11';
    if (name.includes('Nisha')) return 'user_12';
    if (name.includes('Vikram')) return 'user_13';
    if (name.includes('Anjali')) return 'user_14';
    if (name.includes('Rohan')) return 'user_15';
    if (name.includes('Sneha')) return 'user_16';
    if (name.includes('Pranav')) return 'user_17';
    if (name.includes('Divya')) return 'user_18';
    if (name.includes('Suresh')) return 'user_19';
    if (name.includes('Lakshmi')) return 'user_20';
    if (name.includes('Amit')) return 'user_21';
    return 'user_1';
  };

  const getCommunityTooltipSize = (item: CommunityItem | null): number => {
    if (!item) return 280;
    const membersCount = [item.host, ...item.attendees].length;
    if (membersCount <= 3) return 280;
    if (membersCount <= 6) return 320;
    if (membersCount <= 12) return 380;
    if (membersCount <= 20) return 440;
    return Math.min(640, 480 + (membersCount - 20) * 6);
  };

  const THEME_EMOJIS: Record<string, string> = {
    football: '⚽',
    cricket: '🏏',
    music: '🎵',
    party: '🎉',
    travel: '✈️',
    drinks: '🍹'
  };

  // Distribute communities in orbits: 6 in inner circle, 6 in outer circle
  const innerOrbitNodes = communities.slice(0, 6).map(c => ({
    type: 'community' as const,
    id: c.id,
    name: c.name,
    avatar: c.image,
    data: c
  }));

  const outerOrbitNodes = communities.slice(6).map(c => ({
    type: 'community' as const,
    id: c.id,
    name: c.name,
    avatar: c.image,
    data: c
  }));


  const getCoordinates = (index: number, count: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y };
  };

  const handleNodeClick = (e: React.MouseEvent, nodeData: User | CommunityItem, type: 'user' | 'community') => {
    e.stopPropagation();
    if (stage.isMobile || stage.isTablet) {
      // On mobile/tablet, show bottom sheet — no position needed
      setSelectedNode(prev => prev?.data.id === nodeData.id ? null : { type, data: nodeData } as any);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = type === 'community' ? getCommunityTooltipSize(nodeData as CommunityItem) : 280;
      const tooltipHeight = type === 'community' ? getCommunityTooltipSize(nodeData as CommunityItem) : 220;
      const headerHeight = 90;
      const margin = 16;

      // Calculate horizontal position (centered by default)
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      if (x < margin) {
        x = margin;
      } else if (x + tooltipWidth > window.innerWidth - margin) {
        x = window.innerWidth - tooltipWidth - margin;
      }

      // Calculate vertical position (above by default)
      let y = rect.top - tooltipHeight - 12;
      if (y < headerHeight) {
        // Place below the node
        y = rect.bottom + 12;

        // If placing below also goes off-screen vertically, clamp it
        if (y + tooltipHeight > window.innerHeight - margin) {
          y = Math.max(headerHeight, window.innerHeight - tooltipHeight - margin);
        }
      }

      setTooltipPos({ x, y });
      setSelectedNode(prev => prev?.data.id === nodeData.id ? null : { type, data: nodeData } as any);
    }
  };

  const handleOpenChat = (userId: string) => {
    setActiveChatUserId(userId);
    navigate('/chat');
  };

  const handleLaunchCall = (user: User, type: 'audio' | 'video') => {
    startCall(user, type);
    navigate('/call');
  };

  return (
    <div className="constellation-page" onClick={() => { setSelectedNode(null); setMobileMenuOpen(false); }}>
      <NetworkBackground />
      {/* <CanvasBackground /> */}

      {/* Futuristic Floating Header */}
      <header className="constellation-header glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="logo-container" onClick={() => navigate('/')}>
          <Network size={20} className="text-cyan animate-pulse" />
          <span className="logo-text">COMMUNITY</span>
        </div>

        {/* Desktop Nav */}
        {/* <nav className="constellation-nav desktop-nav">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={16} />
            <span>Console</span>
          </button>
          <button className="nav-link-btn" onClick={() => navigate('/community')}>
            <UserIcon size={16} />
            <span>Directory</span>
          </button>
        </nav> */}

        {/* Desktop User Controls */}
        <div className="constellation-user-control">
          <button
            className="btn-icon theme-toggle-btn"
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ marginRight: '8px' }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className="user-pill" onClick={() => navigate(`/profile/${authUser.id}`)}>
            <img src={authUser.avatar} alt={authUser.name} className="header-avatar" />
            <span className='desktop-controls'>{authUser.name}</span>
          </div>
          <button className="btn-icon btn-icon-rose" onClick={() => { logout(); navigate('/'); }} title="Log Out">
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        {/* <button
          className="mobile-menu-toggle"
          onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button> */}
      </header>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-dropdown glass-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="mobile-nav-link" onClick={() => { navigate('/network'); setMobileMenuOpen(false); }}>
              <Network size={18} />
              <span>Network</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate('/community-map'); setMobileMenuOpen(false); }}>
              <Map size={18} />
              <span>Map View</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate('/explore-communities'); setMobileMenuOpen(false); }}>
              <Compass size={18} />
              <span>Communities</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate('/community-chat'); setMobileMenuOpen(false); }}>
              <MessageCircleMore size={18} />
              <span>Messages</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate('/community'); setMobileMenuOpen(false); }}>
              <Users size={18} />
              <span>Users</span>
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate(`/profile/${authUser.id}`); setMobileMenuOpen(false); }}>
              <img src={authUser.avatar} alt={authUser.name} className="header-avatar" />
              <span>{authUser.name}</span>
            </button>
            <button className="mobile-nav-link logout-link" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Area */}
      <main className="constellation-arena">
        <NetworkMap communityGroups={communityGroups} onRefreshCommunities={fetchCommunityGroups} />
      </main>

      {/* Tooltip / Detail Card */}
      <AnimatePresence>
        {selectedNode && (
          <>
            {/* Mobile/Tablet: Bottom Sheet Overlay */}
            {(stage.isMobile || stage.isTablet) ? (
              <>
                <motion.div
                  className="mobile-overlay-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedNode(null)}
                />
                <motion.div
                  className={`mobile-detail-sheet glass-panel ${selectedNode.type === 'community' ? 'community-sheet' : ''}`}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  style={selectedNode.type === 'community' && selectedCommunity ? {
                    borderColor: 'var(--theme-border)',
                    boxShadow: '0 -10px 30px var(--theme-glow)',
                    background: 'rgba(3, 7, 18, 0.98)',
                    ...customThemeVars
                  } : {}}
                >
                  {selectedNode.type === 'user' && selectedUser ? (
                    <>
                      <div className="sheet-handle" />
                      <button className="sheet-close-btn" onClick={() => setSelectedNode(null)}>
                        <X size={18} />
                      </button>

                      <div className="sheet-profile-section">
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="sheet-avatar"
                          onClick={() => navigate(`/profile/${selectedUser.id}`)}
                        />
                        <h3 className="sheet-name">{selectedUser.name}</h3>
                        <span className="sheet-role">{selectedUser.role}</span>
                        <span className="sheet-status">
                          <span className={`status-indicator ${selectedUser.status}`} />
                          {selectedUser.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="sheet-bio">{selectedUser.bio}</p>

                      <div className="tooltip-actions">
                        <button
                          className={`tooltip-btn-follow ${selectedUser.isFollowing ? 'following' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleFollow(selectedUser.id); }}
                        >
                          {selectedUser.isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                          <span>{selectedUser.isFollowing ? 'Following' : 'Follow'}</span>
                        </button>

                        <div className="tooltip-comms">
                          <button
                            className="btn-icon btn-icon-cyan"
                            onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedUser.id); }}
                            title="Chat"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            className="btn-icon btn-icon-violet"
                            onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'audio'); }}
                            disabled={selectedUser.status === 'offline'}
                            title="Audio Link"
                          >
                            <Phone size={14} />
                          </button>
                          <button
                            className="btn-icon btn-icon-rose"
                            onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'video'); }}
                            disabled={selectedUser.status === 'offline'}
                            title="Video Stream"
                          >
                            <Video size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="sheet-profile-link"
                        onClick={() => navigate(`/profile/${selectedUser.id}`)}
                      >
                        View Full Profile →
                      </button>
                    </>
                  ) : (
                    selectedCommunity && (() => {
                      const mobileMembers = [selectedCommunity.host, ...selectedCommunity.attendees];
                      const mobileContainerSize = 320;
                      const mobileMaxRadius = mobileContainerSize / 2;
                      const mobileOffsets = generateScatterOffsets(mobileMembers.length, mobileMaxRadius);
                      const mobileNodeSize = getMemberNodeSize(mobileMembers.length);
                      const safeRadius = Math.max(70, mobileMaxRadius - 55);
                      const ringRadii = [
                        mobileMembers.length <= 3 ? safeRadius * 0.75 : safeRadius * 0.65,
                        safeRadius
                      ];
                      return (
                        <div className="community-mini-constellation-container" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                          {/* Top Action Header Bar (No Overlap with Orbit Nodes) */}
                          <div className="community-popup-top-bar">
                            <div className="community-quick-actions">
                              <button
                                className="btn-community-action btn-chat-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNode(null);
                                  navigate(`/community-chat?id=${selectedCommunity.id}`);
                                }}
                                title="Chat in Community Group"
                              >
                                <MessageCircleMore size={14} />
                                <span>Chat</span>
                              </button>

                              <button
                                className="btn-community-action btn-add-members-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNode(null);
                                  navigate(`/community?addMemberFor=${selectedCommunity.id}`);
                                }}
                                title="Add Members to Community"
                              >
                                <UserPlus size={14} />
                                <span>Add Members</span>
                              </button>
                            </div>

                            <button className="community-close-btn-new" onClick={() => setSelectedNode(null)}>
                              <X size={14} />
                            </button>
                          </div>

                          <div className="community-mini-constellation" style={{ width: mobileContainerSize, height: mobileContainerSize, minHeight: mobileContainerSize, alignSelf: 'center', position: 'relative' }}>
                            {/* Orbit Rings */}
                            {ringRadii.map((radius, rIdx) => (
                              <div
                                key={rIdx}
                                className="mini-orbit-ring"
                                style={{
                                  width: radius * 2,
                                  height: radius * 2,
                                  borderColor: 'var(--theme-border)',
                                  opacity: 0.15 + (rIdx * 0.03),
                                }}
                              />
                            ))}

                            {/* Centered Name */}
                            <div
                              className="mini-constellation-center"
                              onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}
                            >
                              <h3>{selectedCommunity.name}</h3>
                              <span className="view-details-sub">View Details →</span>
                            </div>

                            {/* Orbiting Member Nodes */}
                            {mobileMembers.map((member, idx) => {
                              const offset = mobileOffsets[idx] || { x: 0, y: 0 };
                              const profileId = getProfileIdByName(member.name);
                              return (
                                <div
                                  key={idx}
                                  className={`mini-member-node float-anim-${(idx % 3) + 1}`}
                                  style={{
                                    width: mobileNodeSize,
                                    height: mobileNodeSize,
                                    left: `calc(50% + ${offset.x}px)`,
                                    top: `calc(50% + ${offset.y}px)`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(null);
                                    navigate(`/profile/${profileId}`);
                                  }}
                                  title={`${member.name} (View Profile)`}
                                >
                                  <img src={member.avatar} alt={member.name} className="mini-member-img" />
                                  <span className="mini-member-glow" />
                                </div>
                              );
                            })}
                          </div>

                          <div className="community-sparkle-ornament">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
                            </svg>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </motion.div>
              </>
            ) : (
              /* Desktop: Floating Glass Tooltip */
              <motion.div
                className={`constellation-tooltip glass-panel ${selectedNode.type === 'community' ? 'community-tooltip' : ''}`}
                style={{
                  position: 'fixed',
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  ...(selectedNode.type === 'community' && selectedCommunity ? {
                    width: getCommunityTooltipSize(selectedCommunity),
                    height: getCommunityTooltipSize(selectedCommunity),
                    borderColor: 'var(--theme-border)',
                    boxShadow: '0 0 25px var(--theme-glow), inset 0 0 15px rgba(0, 0, 0, 0.6)',
                    background: 'rgba(3, 7, 18, 0.98)',
                  } : {}),
                  ...customThemeVars
                }}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {selectedNode.type === 'user' && selectedUser ? (
                  <>
                    <div
                      className="tooltip-user-row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${selectedUser.id}`)}
                      title="View Identity Profile"
                    >
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="tooltip-avatar" />
                      <div>
                        <h4 className="tooltip-name">{selectedUser.name}</h4>
                        <span className="tooltip-role">{selectedUser.role}</span>
                        <span className="tooltip-status-text">
                          <span className={`status-indicator ${selectedUser.status}`} />{' '}
                          {selectedUser.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="tooltip-bio">{selectedUser.bio}</p>

                    <div className="tooltip-actions">
                      <button
                        className={`tooltip-btn-follow ${selectedUser.isFollowing ? 'following' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFollow(selectedUser.id); }}
                      >
                        {selectedUser.isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                        <span>{selectedUser.isFollowing ? 'Following' : 'Follow'}</span>
                      </button>

                      <div className="tooltip-comms">
                        <button
                          className="btn-icon btn-icon-cyan"
                          onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedUser.id); }}
                          title="Chat"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          className="btn-icon btn-icon-violet"
                          onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'audio'); }}
                          disabled={selectedUser.status === 'offline'}
                          title="Audio Link"
                        >
                          <Phone size={14} />
                        </button>
                        <button
                          className="btn-icon btn-icon-rose"
                          onClick={(e) => { e.stopPropagation(); handleLaunchCall(selectedUser, 'video'); }}
                          disabled={selectedUser.status === 'offline'}
                          title="Video Stream"
                        >
                          <Video size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  selectedCommunity && (
                    <div className="community-mini-constellation-container">
                      {/* Top Action Header Bar (No Overlap with Orbit Nodes) */}
                      <div className="community-popup-top-bar">
                        <div className="community-quick-actions">
                          <button
                            className="btn-community-action btn-chat-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(null);
                              navigate(`/community-chat?id=${selectedCommunity.id}`);
                            }}
                            title="Chat in Community Group"
                          >
                            <MessageCircleMore size={14} />
                            <span>Chat</span>
                          </button>

                          <button
                            className="btn-community-action btn-add-members-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(null);
                              navigate(`/community?addMemberFor=${selectedCommunity.id}`);
                            }}
                            title="Add Members to Community"
                          >
                            <UserPlus size={14} />
                            <span>Add Members</span>
                          </button>
                        </div>

                        <button className="community-close-btn-new" onClick={() => setSelectedNode(null)}>
                          <X size={14} />
                        </button>
                      </div>

                      <div className="community-mini-constellation">
                        {/* Centered Name */}
                        <div
                          className="mini-constellation-center"
                          onClick={() => { setSelectedNode(null); navigate(`/community-details/${selectedCommunity.id}`); }}
                          title="View Event Details"
                        >
                          <h3>{selectedCommunity.name}</h3>
                          <span className="view-details-sub">View Details →</span>
                        </div>

                        {/* Orbiting Member Nodes */}
                        {(() => {
                          const desktopMembers = [selectedCommunity.host, ...selectedCommunity.attendees];
                          const tooltipSize = getCommunityTooltipSize(selectedCommunity);
                          const desktopMaxRadius = tooltipSize / 2;
                          const desktopOffsets = generateScatterOffsets(desktopMembers.length, desktopMaxRadius);
                          const nodeSize = getMemberNodeSize(desktopMembers.length);
                          const safeRadius = Math.max(92, desktopMaxRadius - (nodeSize / 2 + 30));
                          const ringRadii = [
                            safeRadius,
                            safeRadius * 1.35,
                            safeRadius * 1.65
                          ].slice(0, Math.ceil(desktopMembers.length / 8));
                          return (
                            <>
                              {/* Orbit Rings */}
                              {ringRadii.map((radius, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="mini-orbit-ring"
                                  style={{
                                    width: radius * 2,
                                    height: radius * 2,
                                    borderColor: 'var(--theme-border)',
                                    opacity: 0.15 + (rIdx * 0.03),
                                  }}
                                />
                              ))}

                              {/* Orbiting Member Images */}
                              {desktopMembers.map((member, idx) => {
                                const offset = desktopOffsets[idx] || { x: 0, y: 0 };
                                const profileId = getProfileIdByName(member.name);
                                return (
                                  <div
                                    key={idx}
                                    className={`mini-member-node float-anim-${(idx % 3) + 1}`}
                                    style={{
                                      width: nodeSize,
                                      height: nodeSize,
                                      left: `calc(50% + ${offset.x}px)`,
                                      top: `calc(50% + ${offset.y}px)`,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedNode(null);
                                      navigate(`/profile/${profileId}`);
                                    }}
                                    title={`${member.name} (View Profile)`}
                                  >
                                    <img src={member.avatar} alt={member.name} className="mini-member-img" />
                                    <span className="mini-member-glow" />
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>

                      <div className="community-sparkle-ornament">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
                        </svg>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
