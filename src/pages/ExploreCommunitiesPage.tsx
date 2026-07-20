import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Search,
  ChevronLeft,
  SlidersHorizontal
} from 'lucide-react';
import '../assets/css/ExploreCommunitiesPage.css';

import { communitiesData } from '../services/mockData';
import type { CommunityItem } from '../types';


// SVG Illustration Component themed dynamically
export const ThematicIllustration: React.FC<{ theme: CommunityItem['theme'] }> = ({ theme }) => {
  switch (theme) {
    case 'hiking':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-hiking" x1="0" y1="0" x2="0" y2="1">
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
          {/* Sky background */}
          <rect width="400" height="180" fill="url(#sky-hiking)" />
          {/* Sun */}
          <circle cx="200" cy="80" r="32" fill="#fff7ad" filter="drop-shadow(0px 0px 8px #ffb347)" />
          {/* Back Mountains */}
          <polygon points="40,180 160,80 280,180" fill="url(#mountain-back)" />
          <polygon points="140,180 270,70 380,180" fill="url(#mountain-back)" opacity="0.6" />
          {/* Foreground Mountain */}
          <polygon points="100,180 220,100 320,180" fill="url(#mountain-front)" />
          <polygon points="0,180 90,120 190,180" fill="url(#mountain-front)" opacity="0.75" />
          {/* Trees / Forest details */}
          <polygon points="60,180 70,165 80,180" fill="#2d3748" />
          <polygon points="75,180 85,160 95,180" fill="#1a202c" />
          <polygon points="260,180 275,155 290,180" fill="#2d3748" />
          {/* Hiking Trail */}
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
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="400" height="180" fill="url(#sky-drinks)" />
          {/* Decorative party bubbles */}
          <circle cx="60" cy="50" r="10" fill="#ffffff" opacity="0.15" />
          <circle cx="340" cy="80" r="15" fill="#ffffff" opacity="0.1" />
          <circle cx="120" cy="140" r="8" fill="#ffffff" opacity="0.2" />

          {/* Left Cocktail Glass */}
          <g transform="translate(130, 45)">
            {/* Liquid */}
            <polygon points="20,70 50,70 35,100" fill="#f1c40f" opacity="0.85" />
            {/* Glass frame */}
            <polygon points="10,60 60,60 35,105" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Stem */}
            <line x1="35" y1="105" x2="35" y2="135" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="20" y1="135" x2="50" y2="135" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Straw */}
            <line x1="30" y1="75" x2="5" y2="45" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Right Wine Glass */}
          <g transform="translate(200, 35)">
            {/* Liquid */}
            <path d="M 22 80 C 22 105, 48 105, 48 80 Z" fill="#9b2c2c" opacity="0.9" />
            {/* Glass Bowl */}
            <path d="M 20 65 L 20 80 C 20 110, 50 110, 50 65 Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Stem */}
            <line x1="35" y1="107" x2="35" y2="145" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="20" y1="145" x2="50" y2="145" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Lemon Slice */}
            <circle cx="18" cy="65" r="9" fill="#f1c40f" stroke="#ffffff" strokeWidth="1" />
            <line x1="18" y1="56" x2="18" y2="74" stroke="#ffffff" strokeWidth="0.5" />
            <line x1="9" y1="65" x2="27" y2="65" stroke="#ffffff" strokeWidth="0.5" />
          </g>
        </svg>
      );
    case 'tech':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-tech" x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="grid-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-tech)" />
          {/* Cyan Grid Lines */}
          <path d="M 0 130 L 400 130 M 0 150 L 400 150 M 0 170 L 400 170" stroke="#1e293b" strokeWidth="1" />
          <path d="M 50 180 L 100 120 M 150 180 L 180 120 M 250 180 L 220 120 M 350 180 L 300 120" stroke="#1e293b" strokeWidth="1" />

          {/* Circuit Lines */}
          <path d="M 50 40 L 120 40 L 150 70 L 280 70 L 310 40 L 370 40" fill="none" stroke="#06b6d4" strokeWidth="2.5" opacity="0.8" />
          <path d="M 100 90 L 170 90 L 200 120 L 250 120" fill="none" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.6" />
          
          {/* Circuit Nodes */}
          <circle cx="50" cy="40" r="5" fill="#22d3ee" filter="drop-shadow(0 0 4px #06b6d4)" />
          <circle cx="150" cy="70" r="4" fill="#a78bfa" />
          <circle cx="280" cy="70" r="4" fill="#a78bfa" />
          <circle cx="370" cy="40" r="5" fill="#22d3ee" filter="drop-shadow(0 0 4px #06b6d4)" />

          {/* Central AI Processor Graphic */}
          <g transform="translate(170, 30)">
            <rect x="0" y="0" width="60" height="60" rx="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" filter="drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))" />
            <rect x="12" y="12" width="36" height="36" rx="4" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" />
            {/* Glowing core */}
            <circle cx="30" cy="30" r="8" fill="#06b6d4" opacity="0.8" />
            <circle cx="30" cy="30" r="4" fill="#ffffff" />
            {/* Outer Pins */}
            <line x1="30" y1="-5" x2="30" y2="0" stroke="#06b6d4" strokeWidth="2.5" />
            <line x1="15" y1="-5" x2="15" y2="0" stroke="#06b6d4" strokeWidth="2.5" />
            <line x1="45" y1="-5" x2="45" y2="0" stroke="#06b6d4" strokeWidth="2.5" />
            <line x1="30" y1="60" x2="30" y2="65" stroke="#06b6d4" strokeWidth="2.5" />
            <line x1="15" y1="60" x2="15" y2="65" stroke="#06b6d4" strokeWidth="2.5" />
            <line x1="45" y1="60" x2="45" y2="65" stroke="#06b6d4" strokeWidth="2.5" />
          </g>
        </svg>
      );
    case 'books':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-books" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff1eb" />
              <stop offset="100%" stopColor="#ace0f9" />
            </linearGradient>
            <linearGradient id="book-spine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d39e82" />
              <stop offset="100%" stopColor="#b56f4d" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-books)" />
          {/* Table Surface */}
          <rect x="0" y="130" width="400" height="50" fill="#e2e8f0" />
          <line x1="0" y1="130" x2="400" y2="130" stroke="#cbd5e1" strokeWidth="2" />

          {/* Book Stack */}
          <g transform="translate(90, 60)">
            {/* Book 1 (Bottom, Red) */}
            <rect x="0" y="50" width="100" height="20" rx="2" fill="#c53030" stroke="#742a2a" strokeWidth="1" />
            <rect x="94" y="52" width="6" height="16" fill="#f7fafc" />
            {/* Book 2 (Middle, Green) */}
            <rect x="10" y="32" width="85" height="18" rx="2" fill="#2f855a" stroke="#22543d" strokeWidth="1" />
            <rect x="89" y="34" width="6" height="14" fill="#f7fafc" />
            {/* Book 3 (Top, Yellow/Brown) */}
            <rect x="5" y="15" width="90" height="17" rx="2" fill="#d69e2e" stroke="#975a16" strokeWidth="1" />
            <rect x="90" y="17" width="5" height="13" fill="#f7fafc" />
          </g>

          {/* Cozy Coffee Cup */}
          <g transform="translate(240, 95)">
            {/* Heat vapor */}
            <path d="M 12 -12 Q 8 -25 15 -35" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 22 -10 Q 18 -20 22 -30" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Cup */}
            <path d="M 0 0 L 5 25 C 5 35, 30 35, 30 25 L 35 0 Z" fill="#3182ce" />
            {/* Handle */}
            <path d="M 32 5 C 40 5, 40 20, 32 20" fill="none" stroke="#3182ce" strokeWidth="3" strokeLinecap="round" />
            {/* Plate */}
            <ellipse cx="17" cy="31" rx="22" ry="4" fill="#a0aec0" />
          </g>

          {/* Glasses resting on stack */}
          <g transform="translate(110, 57)">
            <circle cx="15" cy="10" r="10" fill="none" stroke="#2d3748" strokeWidth="2.5" />
            <circle cx="38" cy="10" r="10" fill="none" stroke="#2d3748" strokeWidth="2.5" />
            <line x1="25" y1="10" x2="28" y2="10" stroke="#2d3748" strokeWidth="2.5" />
            <path d="M 5 10 Q -5 2 3 5" fill="none" stroke="#2d3748" strokeWidth="2" />
          </g>
        </svg>
      );
    case 'cycling':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-cycling" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
            <linearGradient id="road-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#2d3748" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-cycling)" />
          {/* Mountains */}
          <polygon points="-50,140 100,50 250,140" fill="#00c6ff" opacity="0.4" />
          <polygon points="120,140 240,65 360,140" fill="#0072ff" opacity="0.3" />

          {/* Curved Road */}
          <path d="M -20 180 Q 180 110 420 180" fill="url(#road-grad)" />
          <path d="M -20 180 Q 180 110 420 180" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 12" opacity="0.6" />

          {/* Bicycle Illustration */}
          <g transform="translate(150, 95)" scale="0.75">
            {/* Wheels */}
            <circle cx="30" cy="50" r="22" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="30" cy="50" r="19" fill="none" stroke="#1a202c" strokeWidth="2" />
            <circle cx="110" cy="50" r="22" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="110" cy="50" r="19" fill="none" stroke="#1a202c" strokeWidth="2" />
            
            {/* Wheel Spokes */}
            <line x1="30" y1="28" x2="30" y2="72" stroke="#4a5568" strokeWidth="0.75" />
            <line x1="8" y1="50" x2="52" y2="50" stroke="#4a5568" strokeWidth="0.75" />
            <line x1="110" y1="28" x2="110" y2="72" stroke="#4a5568" strokeWidth="0.75" />
            <line x1="88" y1="50" x2="132" y2="50" stroke="#4a5568" strokeWidth="0.75" />

            {/* Frame */}
            <polygon points="30,50 70,50 95,20 55,20" fill="none" stroke="#e53e3e" strokeWidth="4.5" strokeLinejoin="round" />
            <line x1="70" y1="50" x2="55" y2="20" stroke="#e53e3e" strokeWidth="4.5" />
            <line x1="30" y1="50" x2="55" y2="20" stroke="#e53e3e" strokeWidth="4.5" />
            <line x1="110" y1="50" x2="95" y2="15" stroke="#4a5568" strokeWidth="4" />

            {/* Handlebar */}
            <path d="M 95 15 L 85 17 M 95 15 L 105 13" stroke="#1a202c" strokeWidth="4.5" strokeLinecap="round" />
            {/* Seat */}
            <path d="M 50 15 L 65 15" stroke="#1a202c" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        </svg>
      );
    case 'yoga':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-yoga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5f7fa" />
              <stop offset="100%" stopColor="#c3cfe2" />
            </linearGradient>
            <linearGradient id="sun-yoga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f6d365" />
              <stop offset="100%" stopColor="#fda085" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-yoga)" />
          {/* Big Sun */}
          <circle cx="200" cy="110" r="50" fill="url(#sun-yoga)" opacity="0.8" />

          {/* Lotus Water Base */}
          <ellipse cx="200" cy="170" rx="140" ry="12" fill="#cbd5e1" opacity="0.5" />
          <ellipse cx="200" cy="170" rx="90" ry="8" fill="#94a3b8" opacity="0.3" />

          {/* Meditating Silhouette */}
          <g transform="translate(180, 75)" fill="#475569">
            {/* Head */}
            <circle cx="20" cy="10" r="7" />
            {/* Torso */}
            <path d="M 12 25 C 12 20, 28 20, 28 25 L 25 50 L 15 50 Z" />
            {/* Left Arm/Hand in mudra */}
            <path d="M 13 25 Q -2 35 10 48" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            {/* Right Arm/Hand in mudra */}
            <path d="M 27 25 Q 42 35 30 48" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            {/* Crossed Legs */}
            <path d="M 5 50 C 5 40, 35 40, 35 50 Z" />
            <circle cx="7" cy="49" r="2.5" fill="#fda085" />
            <circle cx="33" cy="49" r="2.5" fill="#fda085" />
          </g>

          {/* Lotus Flowers Overlay floating ambient */}
          <path d="M 155 160 Q 165 145 175 160 Z" fill="#fda085" opacity="0.7" />
          <path d="M 225 160 Q 235 145 245 160 Z" fill="#fda085" opacity="0.7" />
        </svg>
      );
    case 'art':
      return (
        <svg viewBox="0 0 400 180" className="card-illustration-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sky-art" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#eedec9" />
              <stop offset="50%" stopColor="#f3eae1" />
              <stop offset="100%" stopColor="#e4d4c1" />
            </linearGradient>
          </defs>
          <rect width="400" height="180" fill="url(#sky-art)" />
          {/* Artist easel stand */}
          <polygon points="120,165 130,55 140,165" fill="#a0522d" opacity="0.8" />
          <rect x="80" y="65" width="90" height="70" rx="3" fill="#ffffff" stroke="#a0522d" strokeWidth="3" filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.1))" />
          
          {/* Artwork on canvas */}
          <circle cx="125" cy="100" r="18" fill="#ff7f50" opacity="0.7" />
          <circle cx="140" cy="90" r="12" fill="#20b2aa" opacity="0.6" />
          <polygon points="90,130 115,95 135,130" fill="#e9d8a6" />

          {/* Palette */}
          <g transform="translate(220, 75)">
            {/* Wooden Board */}
            <path d="M 10 30 C 5 -10, 85 -5, 80 40 C 78 60, 45 75, 25 65 C 10 58, 15 45, 10 30 Z" fill="#e6c280" stroke="#b08d57" strokeWidth="2" />
            {/* Thumb Hole */}
            <ellipse cx="30" cy="50" rx="6" ry="9" fill="#eedec9" stroke="#b08d57" strokeWidth="1" />
            {/* Color paint dots */}
            <circle cx="35" cy="15" r="7" fill="#ff4757" />
            <circle cx="58" cy="18" r="7" fill="#2ed573" />
            <circle cx="70" cy="35" r="7" fill="#1e90ff" />
            <circle cx="55" cy="53" r="7" fill="#ffa502" />
          </g>

          {/* Paintbrush */}
          <g transform="translate(195, 120) rotate(-35)">
            {/* Handle */}
            <line x1="0" y1="80" x2="0" y2="10" stroke="#8b5a2b" strokeWidth="3.5" strokeLinecap="round" />
            {/* Metal sleeve */}
            <rect x="-3" y="5" width="6" height="7" fill="#cbd5e0" />
            {/* Bristles */}
            <path d="M -3 5 C -3 0, 3 0, 3 5 Z" fill="#2d3748" />
            {/* Blue tip */}
            <path d="M -2 1 C -2 -3, 2 -3, 2 1 Z" fill="#1e90ff" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export const ExploreCommunitiesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Today' | 'This week' | 'Past'>('All');
  const [layoutMode] = useState<'web' | 'mobile'>('web');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Filtering Logic
  const filteredCommunities = communitiesData.filter((item) => {
    // 1. Text Search matching
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.host.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Tab Category matching
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Today') {
      return item.status === 'Today';
    }
    if (activeFilter === 'This week') {
      // This week covers active future events and today, but excludes "Ended"
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
      <div key={item.id} className="community-card">
        {/* Cover Image Container */}
        <div className="card-cover-container">
          <img src={item.image} alt={item.name} className="card-cover-image" />
          
          {/* Status Badge - Top Left */}
          {/* <div className={`card-status-badge ${badgeClass}`}>
            <span className="badge-pulse-dot" />
            {item.status}
          </div> */}

          {/* Hosted By Overlay - Top Right */}
          <div className="card-host-overlay">
            <img src={item.host.avatar} alt={item.host.name} className="host-avatar" />
            <span className="host-name">by {item.host.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-details">
          <h3 className="community-title">{item.name}</h3>
          
          <div className="community-meta">
            {/* <Calendar size={13} className="meta-icon" /> */}
            <span>{item.dateStr} at {item.timeStr}</span>
            <span className="meta-dot">•</span>
            {/* <MapPin size={13} className="meta-icon" /> */}
            <span>{item.distance}</span>
          </div>
        </div>

        {/* Card Footer Row */}
        <div className="card-footer">
          <div className="attendee-stack">
            {item.attendees.slice(0, 3).map((attendee, idx) => (
              <img 
                key={idx} 
                src={attendee.avatar} 
                alt={attendee.name} 
                className="attendee-avatar" 
                style={{ zIndex: 3 - idx }}
              />
            ))}
            {item.attendees.length > 3 && (
              <div className="attendee-excess" style={{ zIndex: 0 }}>
                +{item.attendees.length - 3}
              </div>
            )}
          </div>
          {/* <span className="going-count-label">
            {item.attendees.length + 1} going
          </span> */}
        </div>
      </div>
    );
  };

  return (
    <div className="explore-communities-container">
      {/* Header Controls */}
      <div className="explore-header-row">
        <div className="explore-title-block">
          {/* <Compass className="explore-compass-icon" size={28} /> */}
          <div>
            <h1>Communities</h1>
            <p className="explore-subtitle">Discover people and plans near you</p>
          </div>
        </div>

        {/* Layout Switch Toggle */}
        {/* <div className="layout-toggle-container">
          <button 
            className={`toggle-mode-btn ${layoutMode === 'web' ? 'active' : ''}`}
            onClick={() => setLayoutMode('web')}
            title="Desktop Grid Layout"
          >
            <Grid size={16} />
            <span>Web Grid</span>
          </button>
          <button 
            className={`toggle-mode-btn ${layoutMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setLayoutMode('mobile')}
            title="Mobile Phone Simulator Layout"
          >
            <Smartphone size={16} />
            <span>Mobile Device</span>
          </button>
        </div> */}
      </div>

      {/* Main Content Area */}
      <div className="explore-main-workspace">
        {layoutMode === 'web' ? (
          /* ======================================================== */
          /* WEB GRID VIEW                                            */
          /* ======================================================== */
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
                <p>Try searching for a different keyword or resetting your filter tabs.</p>
                <button 
                  className="clear-search-btn" 
                  onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* MOBILE PHONE SIMULATOR FRAME VIEW                        */
          /* ======================================================== */
          <div className="mobile-simulator-wrapper">
            <div className="simulator-instructions">
              <h4>Mobile Device Emulator</h4>
              <p>Experience the exact mobile rendering flow of the page, configured inside a pixel-perfect viewport frame simulating an iPhone / Android layout.</p>
              <div className="instructions-legend">
                <div className="legend-item"><span className="legend-dot status-today" /> Today Events</div>
                <div className="legend-item"><span className="legend-dot status-upcoming" /> Weekday Schedules</div>
                <div className="legend-item"><span className="legend-dot status-ended" /> Completed Meetups</div>
              </div>
            </div>

            {/* Mobile Bezels */}
            <div className="smartphone-device">
              <div className="smartphone-speaker" />
              <div className="smartphone-notch" />
              <div className="smartphone-screen-content">
                {/* Simulated Phone Status Bar */}
                <div className="mobile-status-bar">
                  <span className="status-bar-time">9:41</span>
                  <div className="status-bar-symbols">
                    <span className="network-signal">📶</span>
                    <span className="battery-percentage">98% 🔋</span>
                  </div>
                </div>

                {/* Simulated Phone App Header */}
                <div className="mobile-app-header">
                  <button className="mobile-header-back-btn">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="mobile-header-title">Discover</span>
                  <button className="mobile-header-action-btn">
                    <SlidersHorizontal size={18} />
                  </button>
                </div>

                {/* Scrollable Mobile Viewport */}
                <div className="mobile-scrollable-area">
                  <div className="mobile-intro-section">
                    <h2>Explore Communities</h2>
                    <p>Find local meetups happening around you</p>
                  </div>

                  {/* Mobile Search Input */}
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

                  {/* Mobile Horizontal Filter List */}
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

                  {/* Cards List */}
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

                {/* Simulated Home Indicator Bar */}
                <div className="mobile-home-indicator" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
