import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  ChevronLeft,
  SlidersHorizontal,
  Plus,
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import '../assets/css/ExploreCommunitiesPage.css';
import type { CommunityItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';


// SVG Illustration Component themed dynamically
export const ThematicIllustration: React.FC<{ theme: CommunityItem['theme'] }> = ({ theme }) => {
  switch (theme) {
    case 'football':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <rect width="400" height="180" fill="#16a34a" />
          {/* Pitch markings */}
          <rect x="20" y="20" width="360" height="140" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <line x1="200" y1="20" x2="200" y2="160" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <circle cx="200" cy="90" r="35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <circle cx="200" cy="90" r="5" fill="rgba(255,255,255,0.7)" />
          {/* Penalty box outlines */}
          <rect x="20" y="50" width="40" height="80" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <rect x="340" y="50" width="40" height="80" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          {/* Soccer Ball */}
          <circle cx="200" cy="90" r="16" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
          <polygon points="200,78 209,85 205,95 195,95 191,85" fill="#1f2937" />
          <line x1="200" y1="78" x2="200" y2="74" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="209" y1="85" x2="213" y2="87" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="205" y1="95" x2="208" y2="99" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="195" y1="95" x2="192" y2="99" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="191" y1="85" x2="187" y2="87" stroke="#1f2937" strokeWidth="1.5" />
        </svg>
      );
    case 'cricket':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <rect width="400" height="180" fill="#eab308" />
          {/* Pitch ground shadow */}
          <rect x="60" y="30" width="280" height="120" fill="#ca8a04" opacity="0.3" rx="10" />
          {/* Wickets/Stumps */}
          <g transform="translate(140, 55)" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round">
            <line x1="0" y1="0" x2="0" y2="65" />
            <line x1="14" y1="0" x2="14" y2="65" />
            <line x1="28" y1="0" x2="28" y2="65" />
            <line x1="-3" y1="0" x2="31" y2="0" strokeWidth="4.5" />
          </g>
          {/* Cricket Ball */}
          <circle cx="240" cy="90" r="15" fill="#dc2626" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))" />
          <path d="M 225 90 Q 240 102 255 90" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        </svg>
      );
    case 'music':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <rect width="400" height="180" fill="#6b21a8" />
          {/* Music equalizer bars */}
          <g fill="#c084fc" opacity="0.85">
            <rect x="60" y="90" width="16" height="60" rx="4" />
            <rect x="90" y="55" width="16" height="95" rx="4" />
            <rect x="120" y="35" width="16" height="115" rx="4" />
            <rect x="150" y="75" width="16" height="75" rx="4" />
            <rect x="180" y="105" width="16" height="45" rx="4" />
            <rect x="210" y="45" width="16" height="105" rx="4" />
            <rect x="240" y="25" width="16" height="125" rx="4" />
            <rect x="270" y="65" width="16" height="85" rx="4" />
            <rect x="300" y="85" width="16" height="65" rx="4" />
            <rect x="330" y="115" width="16" height="35" rx="4" />
          </g>
          {/* Floating musical note outlines */}
          <path d="M 140 30 Q 150 15 160 30 L 160 10 L 180 20 L 180 40" fill="none" stroke="#f3e8ff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M 260 20 Q 270 5 280 20 L 280 0 L 300 10 L 300 30" fill="none" stroke="#f3e8ff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case 'party':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <rect width="400" height="180" fill="#9d174d" />
          {/* Retro laser beams */}
          <polygon points="0,0 130,180 210,180" fill="rgba(236,72,153,0.25)" />
          <polygon points="400,0 270,180 190,180" fill="rgba(244,63,94,0.25)" />
          {/* Floating Confetti */}
          <circle cx="80" cy="50" r="5" fill="#facc15" />
          <rect x="140" y="80" width="8" height="8" transform="rotate(45 140 80)" fill="#60a5fa" />
          <circle cx="320" cy="65" r="4.5" fill="#34d399" />
          <rect x="270" y="120" width="6" height="12" fill="#ec4899" />
          {/* Disco Mirror Ball */}
          <circle cx="200" cy="45" r="26" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))" />
          <line x1="200" y1="0" x2="200" y2="19" stroke="#9ca3af" strokeWidth="2.5" />
          {/* grid lines of disco ball */}
          <path d="M 174 45 Q 200 55 226 45" stroke="#d1d5db" strokeWidth="1" fill="none" />
          <path d="M 178 35 Q 200 45 222 35" stroke="#d1d5db" strokeWidth="1" fill="none" />
          <path d="M 178 55 Q 200 65 222 55" stroke="#d1d5db" strokeWidth="1" fill="none" />
          <line x1="200" y1="19" x2="200" y2="71" stroke="#d1d5db" strokeWidth="1" />
          <line x1="187" y1="25" x2="187" y2="65" stroke="#d1d5db" strokeWidth="1" />
          <line x1="213" y1="25" x2="213" y2="65" stroke="#d1d5db" strokeWidth="1" />
        </svg>
      );
    case 'travel':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-travel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9a9e" />
              <stop offset="60%" stopColor="#fecfef" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="mountain-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#84fab0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8fd3f4" />
            </linearGradient>
            <linearGradient id="mountain-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#30cfd0" />
              <stop offset="100%" stopColor="#330867" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-travel)" />
          <circle cx="200" cy="80" r="32" fill="#fff7ad" filter="drop-shadow(0px 0px 8px #ffb347)" />
          <polygon points="40,180 160,80 280,180" fill="url(#mountain-back)" />
          <polygon points="140,180 270,70 380,180" fill="url(#mountain-back)" opacity="0.6" />
          <polygon points="100,180 220,100 320,180" fill="url(#mountain-front)" />
          <polygon points="0,180 90,120 190,180" fill="url(#mountain-front)" opacity="0.75" />
          <polygon points="60,180 70,165 80,180" fill="#2d3748" />
          <polygon points="75,180 85,160 95,180" fill="#1a202c" />
          <polygon points="260,180 275,155 290,180" fill="#2d3748" />
          <path d="M 220 180 Q 215 160 218 150 T 220 120" stroke="#fbd38d" strokeWidth="3" fill="none" strokeDasharray="4 2" />
        </svg>
      );
    case 'drinks':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-drinks" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f39c12" />
              <stop offset="50%" stopColor="#e74c3c" />
              <stop offset="100%" stopColor="#9b59b6" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-drinks)" />
          <circle cx="60" cy="50" r="10" fill="#ffffff" opacity="0.15" />
          <circle cx="340" cy="80" r="15" fill="#ffffff" opacity="0.1" />
          <circle cx="120" cy="140" r="8" fill="#ffffff" opacity="0.2" />

          {/* Left Cocktail Glass */}
          <g transform="translate(130, 45)">
            <polygon points="20,70 50,70 35,100" fill="#f1c40f" opacity="0.85" />
            <polygon points="10,60 60,60 35,105" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="35" y1="105" x2="35" y2="135" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="20" y1="135" x2="50" y2="135" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="30" y1="75" x2="5" y2="45" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Right Wine Glass */}
          <g transform="translate(200, 35)">
            <path d="M 22 80 C 22 105, 48 105, 48 80 Z" fill="#9b2c2c" opacity="0.9" />
            <path d="M 20 65 L 20 80 C 20 110, 50 110, 50 65 Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="35" y1="107" x2="35" y2="145" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="20" y1="145" x2="50" y2="145" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="65" r="9" fill="#f1c40f" stroke="#ffffff" strokeWidth="1" />
            <line x1="18" y1="56" x2="18" y2="74" stroke="#ffffff" strokeWidth="0.5" />
            <line x1="9" y1="65" x2="27" y2="65" stroke="#ffffff" strokeWidth="0.5" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

const PRESET_IMAGES: Record<CommunityItem['theme'], string[]> = {
  football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=60'
  ],
  cricket: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60'
  ],
  music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60'
  ],
  party: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60'
  ],
  travel: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60'
  ],
  drinks: [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=60'
  ]
};

export const ExploreCommunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Today' | 'This week' | 'Past'>('All');
  const [layoutMode] = useState<'web' | 'mobile'>('web');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    theme: 'music' as CommunityItem['theme'],
    image: '',
    dateStr: 'Saturday',
    timeStr: '6:00 PM',
    distance: '1.5 km away'
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen]);

  // GET - fetch all
  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from('community_list')
      .select('*');
    if (error) {
      console.error(error);
    } else if (data) {
      const mapped = data.map((c) => ({
        id: c.id,
        name: c.name,
        theme: c.theme,
        image: c.image || c.image,
        status: c.status,
        dateStr: c.date_str || c.dateStr || '',
        timeStr: c.time_str || c.timeStr || '',
        distance: c.distance,
        host: typeof c.host === 'string' ? JSON.parse(c.host) : c.host,
        attendees: typeof c.attendees === 'string' ? JSON.parse(c.attendees) : (c.attendees || []),
      }));
      setCommunities(mapped);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const hostObj = {
      name: user?.name || 'Community Leader',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    const selectedImage = formData.image || PRESET_IMAGES[formData.theme][0];

    // Calculate auto-incremented ID in comm_X format (e.g. comm_13, comm_14)
    let maxIdNum = 0;
    communities.forEach((c) => {
      if (c.id) {
        const match = String(c.id).match(/^comm_(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxIdNum) {
            maxIdNum = num;
          }
        }
      }
    });
    const generatedId = `comm_${maxIdNum + 1}`;

    const newRecordPayload = {
      id: generatedId,
      name: formData.name.trim(),
      theme: formData.theme,
      image: selectedImage,
      status: 'Upcoming',
      date_str: formData.dateStr || 'Saturday',
      time_str: formData.timeStr || '6:00 PM',
      distance: formData.distance || '1.5 km away',
      host: JSON.stringify(hostObj),
      attendees: JSON.stringify([hostObj])
    };

    console.log("newRecordPayload ===", newRecordPayload);

    try {
      const { error } = await supabase
        .from('community_list')
        .insert(newRecordPayload);

      // if (error) {
      //   console.error('Error inserting into Supabase:', error);
      // }

      // const newItem: CommunityItem = {
      //   id: generatedId,
      //   name: formData.name.trim(),
      //   theme: formData.theme,
      //   image: selectedImage,
      //   status: 'Saturday',
      //   dateStr: formData.dateStr || 'Saturday',
      //   timeStr: formData.timeStr || '6:00 PM',
      //   distance: formData.distance || '1.5 km away',
      //   host: hostObj,
      //   attendees: [hostObj]
      // };
      // setCommunities((prev) => [newItem, ...prev]);
      fetchCommunities();
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        theme: 'music',
        image: '',
        dateStr: 'Saturday',
        timeStr: '6:00 PM',
        distance: '1.5 km away'
      });
    } catch (err) {
      console.error('Failed to create community:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Filtering Logic
  const filteredCommunities = communities.filter((item) => {
    // 1. Text Search matching
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.host?.name && item.host.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // 2. Tab Category matching
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Today') {
      return item.status === 'Today';
    }
    if (activeFilter === 'This week') {
      return item.status !== 'Ended';
    }
    if (activeFilter === 'Past') {
      return item.status === 'Ended';
    }
    return true;
  });

  // Render Card Component
  const renderCard = (item: CommunityItem) => {
    return (
      <div key={item.id} className="community-card" onClick={() => navigate(`/community-details/${item.id}`)} style={{ cursor: "pointer" }}>
        {/* Cover Image Container */}
        <div className="card-cover-container">
          <img src={item.image} alt={item.name} className="card-cover-image" />
        </div>

        {/* Card Body Details */}
        <div className="card-details">
          <h3 className="community-title">{item.name}</h3>

          <div className="community-meta">
            <span>{item.dateStr} at {item.timeStr}</span>
            <span className="meta-dot">•</span>
            <span>{item.distance}</span>
          </div>
        </div>

        {/* Card Footer Row */}
        <div className="card-footer">
          <div className="attendee-stack">
            {item.attendees && item.attendees.slice(0, 3).map((attendee, idx) => (
              <img
                key={idx}
                src={attendee.avatar}
                alt={attendee.name}
                className="attendee-avatar"
                style={{ zIndex: 3 - idx }}
              />
            ))}
            {item.attendees && item.attendees.length > 3 && (
              <div className="attendee-excess" style={{ zIndex: 0 }}>
                +{item.attendees.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="explore-communities-container">
      {/* Header Controls */}
      <div className="explore-header-row">
        <div className="explore-title-block">
          <div>
            <h1>Communities</h1>
            <p className="explore-subtitle">Discover people and plans near you</p>
          </div>
        </div>

        {/* Action Button: Create Community */}
        <button
          className="create-community-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          <span>Community</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="explore-main-workspace">
        {layoutMode === 'web' ? (
          <div className="web-layout-container">
            {/* Search and Filters Strip */}
            <div className="filter-controls-strip">
              <div className="search-box-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search communities or hosts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                />
              </div>

              <div className="filter-tabs-group">
                {(['All', 'Today', 'This week', 'Past'] as const).map((filter) => (
                  <button
                    key={filter}
                    className={`filter-tab-btn ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                    {activeFilter === filter && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="active-tab-underline"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display */}
            {filteredCommunities.length > 0 ? (
              <div className="communities-web-grid">
                {filteredCommunities.map(renderCard)}
              </div>
            ) : (
              <div className="empty-search-state">
                <Compass size={48} className="empty-state-icon" />
                <h3>No communities match your criteria</h3>
                <p>Try searching for a different keyword or create your own community!</p>
                <button
                  className="clear-search-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus size={16} style={{ marginRight: 6 }} />
                  Create First Community
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mobile-simulator-wrapper">
            <div className="simulator-instructions">
              <h4>Mobile Device Emulator</h4>
              <p>Experience the exact mobile rendering flow of the page, configured inside a pixel-perfect viewport frame.</p>
            </div>

            <div className="smartphone-device">
              <div className="smartphone-speaker" />
              <div className="smartphone-notch" />
              <div className="smartphone-screen-content">
                <div className="mobile-status-bar">
                  <span className="status-bar-time">9:41</span>
                  <div className="status-bar-symbols">
                    <span className="network-signal">📶</span>
                    <span className="battery-percentage">98% 🔋</span>
                  </div>
                </div>

                <div className="mobile-app-header">
                  <button className="mobile-header-back-btn">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="mobile-header-title">Discover</span>
                  <button className="mobile-header-action-btn" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} />
                  </button>
                </div>

                <div className="mobile-scrollable-area">
                  <div className="mobile-intro-section">
                    <h2>Explore Communities</h2>
                    <p>Find local meetups happening around you</p>
                  </div>

                  <div className="mobile-search-wrapper">
                    <Search size={16} className="mobile-search-icon" />
                    <input
                      type="text"
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mobile-search-input"
                    />
                  </div>

                  <div className="mobile-filters-scroller">
                    {(['All', 'Today', 'This week', 'Past'] as const).map((filter) => (
                      <button
                        key={filter}
                        className={`mobile-filter-pill ${activeFilter === filter ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {filteredCommunities.length > 0 ? (
                    <div className="communities-mobile-list">
                      {filteredCommunities.map(renderCard)}
                    </div>
                  ) : (
                    <div className="mobile-empty-state">
                      <Compass size={36} className="empty-state-icon" />
                      <h4>No groups found</h4>
                      <p>Modify search filters</p>
                    </div>
                  )}
                </div>

                <div className="mobile-home-indicator" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE COMMUNITY MODAL */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="modal-backdrop-overlay" onClick={() => setIsCreateModalOpen(false)}>
              <motion.div
                className="create-community-modal glass-panel"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="modal-header-bar">
                  <div className="modal-header-title">
                    <Sparkles size={20} className="modal-header-icon" />
                    <div>
                      <h3>Create New Community</h3>
                      <p>Enter details to start a local meetup or interest group</p>
                    </div>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleCreateCommunity} className="modal-form-body">
                  <div className="form-group">
                    <label className="form-label">Community Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangalore Indie Acoustic Club"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label">Category / Theme</label>
                      <select
                        value={formData.theme}
                        onChange={(e) => {
                          const newTheme = e.target.value as CommunityItem['theme'];
                          setFormData({
                            ...formData,
                            theme: newTheme,
                            image: PRESET_IMAGES[newTheme][0]
                          });
                        }}
                        className="form-select"
                      >
                        <option value="music">🎵 Music & Jam</option>
                        <option value="football">⚽ Football & Sports</option>
                        <option value="cricket">🏏 Cricket & Games</option>
                        <option value="party">🎉 Party & Social</option>
                        <option value="travel">🏔️ Travel & Adventure</option>
                        <option value="drinks">🍸 Drinks & Nightlife</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location / Distance</label>
                      <input
                        type="text"
                        placeholder="e.g. Koramangala • 1.5 km away"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Saturday or July 26"
                        value={formData.dateStr}
                        onChange={(e) => setFormData({ ...formData, dateStr: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 6:00 PM"
                        value={formData.timeStr}
                        onChange={(e) => setFormData({ ...formData, timeStr: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Preset Image Selector */}
                  <div className="form-group">
                    <label className="form-label">Cover Image</label>
                    <div className="preset-images-wrapper">
                      <div className="preset-images-grid">
                        {PRESET_IMAGES[formData.theme].map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`preset-img-thumb ${formData.image === imgUrl || (!formData.image && idx === 0) ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, image: imgUrl })}
                          >
                            <img src={imgUrl} alt={`Preset ${idx}`} />
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste custom image URL..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="form-input custom-url-input"
                      />
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="modal-footer-actions">
                    <button
                      type="button"
                      className="btn-create-cancel"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.name.trim()}
                      className="btn-create-submit"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Community'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
