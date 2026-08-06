import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
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
  MessageCircleMore,
  ArrowLeft,
  Plus,
  X,
  Check,
  UserPlus,
  Sparkles
} from 'lucide-react';
import type { CommunityItem } from '../types';
import './CommunityDetailsPage.css';
import { supabase } from '../supabaseClient';
import { getUserCurrentLocation, calculateHaversineDistance, resolveCommunityCoordinates, type LatLng } from '../services/locationUtils';

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

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  image?: string;
  dateStr: string;
  timeStr: string;
  location: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  participantsCount: number;
  maxParticipants: number;
  isJoined?: boolean;
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

// const INITIAL_ACTIVITIES: ActivityItem[] = [
//   {
//     id: 'act_1',
//     title: '3v3 Mini Tournament & Warmup',
//     category: 'Match',
//     image: 'https://6a67310e2a4b54c07b29831b.imgix.net/snowboard.jpg',
//     dateStr: 'Tomorrow',
//     timeStr: '6:00 PM',
//     location: 'Koramangala Turf, Pitch 2',
//     description: 'Quick 3v3 mini tournament with round-robin matches. Winner stays on court!',
//     hostName: 'Aisha Rahman',
//     hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
//     participantsCount: 6,
//     maxParticipants: 12,
//     isJoined: true
//   },
//   {
//     id: 'act_2',
//     title: 'Skill Drills & Penalty Shootout',
//     category: 'Practice',
//     image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=60',
//     dateStr: 'Saturday',
//     timeStr: '5:00 PM',
//     location: 'Koramangala Turf, Main Pitch',
//     description: 'Passing drills, footwork conditioning, and penalty shootout challenge with rewards for top scorers.',
//     hostName: 'Vikram Malhotra',
//     hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
//     participantsCount: 8,
//     maxParticipants: 15,
//     isJoined: false
//   },
//   {
//     id: 'act_3',
//     title: 'Post-Match Refreshments & Strategy',
//     category: 'Social',
//     image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60',
//     dateStr: 'Sunday',
//     timeStr: '7:30 PM',
//     location: 'Social Cafe, Koramangala',
//     description: 'Relax after Sunday matches, discuss team tactics, watch weekend highlights, and grab craft drinks.',
//     hostName: 'Aisha Rahman',
//     hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
//     participantsCount: 12,
//     maxParticipants: 20,
//     isJoined: false
//   }
// ];

export interface CategoryOption {
  id: string;
  label: string;
  emoji: string;
  categoryKey: string;
  image: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
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
  { id: 'party', label: 'party', emoji: '🎉', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60' },
  { id: 'water_activity', label: 'water activity', emoji: '🏄', categoryKey: 'Practice', image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=60' },
  { id: 'cycling', label: 'cycling', emoji: '🚴', categoryKey: 'Match', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=60' },
  { id: 'soccer', label: 'playing soccer', emoji: '⚽', categoryKey: 'Match', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60' },
  { id: 'yoga', label: 'yoga', emoji: '🧘', categoryKey: 'Practice', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=60' },
  { id: 'golf', label: 'golf', emoji: '⛳', categoryKey: 'Match', image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&auto=format&fit=crop&q=60' },
  { id: 'beach', label: 'beach', emoji: '🏖️', categoryKey: 'Meetup', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60' },
  { id: 'clothes_swap', label: 'clothes swap', emoji: '👕', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=60' },
  { id: 'shopping', label: 'shopping', emoji: '🛍️', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60' },
  { id: 'culture', label: 'culture', emoji: '🏛️', categoryKey: 'Workshop', image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop&q=60' },
  { id: 'movie', label: 'movie', emoji: '🍿', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60' },
  { id: 'barbecue', label: 'barbecue', emoji: '🍖', categoryKey: 'Social', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60' }
];

export const CommunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'present' | 'interested'>('info');
  const [isJoined, setIsJoined] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);

  // Form state for creating an activity
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<CategoryOption | null>(CATEGORY_OPTIONS[0]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('sport');
  const [newImage, setNewImage] = useState('');
  const [newDateStr, setNewDateStr] = useState('');
  const [newTimeStr, setNewTimeStr] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMaxParticipants, setNewMaxParticipants] = useState('10');
  const [newDescription, setNewDescription] = useState('');

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    getUserCurrentLocation().then(loc => setUserLocation(loc));
    fetchCommunities();
    fetchActivities();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isCreateActivityOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateActivityOpen]);

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
        image: c.image || c.image_url,
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

  const fetchActivities = async () => {
    const { data, error } = await supabase.from('activity').select('*');

    if (error) {
      console.error('Error fetching activities from Supabase:', error);
      return;
    }

    if (data) {
      const mapped: ActivityItem[] = data.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        image: a.image,
        dateStr: a.date_str || a.dateStr || '',
        timeStr: a.time_str || a.timeStr || '',
        location: a.location,
        description: a.description,
        hostName: a.host_name || a.hostName || 'Sophia Chen',
        hostAvatar: a.host_avatar || a.hostAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        participantsCount: a.participants_count || a.participantsCount || 1,
        maxParticipants: a.max_participants || a.maxParticipants || 10,
        isJoined: a.is_joined !== undefined ? a.is_joined : true,
      }));

      setActivitiesList(mapped);
    }
  };

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

  const config = THEME_MAPS[community.theme] || THEME_MAPS.drinks;

  const getCoordinates = (mapImageUrl: string) => {
    const match = mapImageUrl.match(/static\/([\d.-]+),([\d.-]+)/);
    if (match) {
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

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const categoryDefaultImages: Record<string, string> = {
      Match: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
      Practice: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=60',
      Social: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60',
      Workshop: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
      Meetup: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=60'
    };

    // Calculate auto-incremented ID in act_X format (e.g. act_1, act_2, act_3...)
    let maxIdNum = 0;
    (activitiesList || []).forEach((a) => {
      if (a.id) {
        const match = String(a.id).match(/^act_(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxIdNum) {
            maxIdNum = num;
          }
        }
      }
    });
    const generatedId = `act_${maxIdNum + 1}`;

    const activityPayload = {
      id: generatedId,
      title: newTitle.trim(),
      category: newCategory,
      image: newImage.trim() || categoryDefaultImages[newCategory] || categoryDefaultImages.Match,
      date_str: newDateStr.trim() || 'Tomorrow',
      time_str: newTimeStr.trim() || '6:00 PM',
      location: newLocation.trim() || (community ? community.name : 'Location TBD'),
      description: newDescription.trim() || 'Activity organized by community members.',
      host_name: 'Sophia Chen',
      host_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      participants_count: 1,
      max_participants: parseInt(newMaxParticipants) || 10,
      is_joined: true
    };

    try {
      const { data, error } = await supabase
        .from('activity')
        .insert(activityPayload)
      // .select();

      if (error) {
        console.error('Error inserting activity into Supabase:', error);
        // Fallback local update if Supabase fails
        const fallbackActivity: ActivityItem = {
          id: `act_${Date.now()}`,
          title: activityPayload.title,
          category: activityPayload.category,
          image: activityPayload.image,
          dateStr: activityPayload.date_str,
          timeStr: activityPayload.time_str,
          location: activityPayload.location,
          description: activityPayload.description,
          hostName: activityPayload.host_name,
          hostAvatar: activityPayload.host_avatar,
          participantsCount: activityPayload.participants_count,
          maxParticipants: activityPayload.max_participants,
          isJoined: activityPayload.is_joined
        };
        setActivitiesList(prev => [fallbackActivity, ...(prev || [])]);
      } else {
        console.log('Successfully created activity in Supabase:', data);
        await fetchActivities();
      }
    } catch (err) {
      console.error('Unexpected error creating activity:', err);
    }

    setIsCreateActivityOpen(false);
    setNewTitle('');
    setNewImage('');
    setNewDateStr('');
    setNewTimeStr('');
    setNewLocation('');
    setNewDescription('');
    setActiveTab('activity');
  };

  const handleToggleJoinActivity = (actId: string) => {
    setActivitiesList(prev =>
      prev.map(act => {
        if (act.id === actId) {
          const nextJoined = !act.isJoined;
          return {
            ...act,
            isJoined: nextJoined,
            participantsCount: nextJoined ? act.participantsCount + 1 : Math.max(1, act.participantsCount - 1)
          };
        }
        return act;
      })
    );
  };

  return (
    <div className="user-profile-page community-profile-page">
      <div className="explore-header-row">
        <div className="explore-title-block">
          <div>
            <h1>Community Details</h1>
          </div>
        </div>

        <div className="createActivity">
          <button
            className="btn-create-activity"
            onClick={() => setIsCreateActivityOpen(true)}
          >
            <Plus size={16} />
            <span>Activity</span>
          </button>
          {/* <button
            className="btn-back-arrow"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button> */}
        </div>
      </div>

      {/* Cover Banner */}
      <div
        className="profile-cover"
        style={{ backgroundImage: `url(${community.image})` }}
      >
        <div className="cover-overlay" />
        <button className="cover-back-btn" onClick={() => navigate(-1)} title="Go Back" aria-label="Go Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-left" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
        </button>
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
              {/* <button
                className="btn-icon btn-icon-cyan"
                onClick={() => navigate(`/community-chat?id=${community.id}`)}
                title="Community Chat"
              >
                <MessageCircleMore size={18} />
              </button> */}
              <button className="btn-icon btn-icon-cyan" onClick={handleShare} title="Share">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Counts indicators */}
        {/* <div className="profile-counts-strip">
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
        </div> */}
      </section>

      {/* Main Profile Tabs */}
      <section className="profile-tabs-section">
        <div className="tabs-header-bar">
          <button
            className={`tab-anchor ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`tab-anchor ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity ({activitiesList.length})
          </button>
          <button
            className={`tab-anchor ${activeTab === 'present' ? 'active' : ''}`}
            onClick={() => setActiveTab('present')}
          >
            Joined ({community.attendees.length + 1})
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
                    <span className="item-label-sub">
                      {(() => {
                        if (!userLocation) return community.distance;
                        const coords = resolveCommunityCoordinates(community);
                        return calculateHaversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
                      })()}
                    </span>
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
          ) : activeTab === 'activity' ? (
            <div className="about-tab-content community-info-tab">
              {/* <div className="activity-tab-header">
                <div>
                  <h4 className="activity-section-title">Community Activities ({activitiesList.length})</h4>
                  <p className="activity-section-subtitle">
                    Upcoming games, practice sessions, and group hangouts
                  </p>
                </div>
              </div> */}

              {/* Activities Grid - Styled like Community Cards */}
              <div className="community-card-style-grid">
                {activitiesList.map((act) => {
                  const bgImg = act.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60';
                  return (
                    <div key={act.id} className="activity-community-card">
                      {/* Card Cover Image */}
                      <div className="card-cover-container">
                        <img src={bgImg} alt={act.title} className="card-cover-image" />

                        {/* Host Overlay Badge */}
                        <div className="card-host">
                          <img src={act.hostAvatar} alt={act.hostName} className="host-avatar" />
                          <span className="host-name">{act.hostName}</span>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="card-details">
                        <h3 className="community-title">{act.title}</h3>

                        <div className="community-meta">
                          <span>{act.dateStr} at {act.timeStr}</span>
                          {/* <span className="meta-dot">•</span> */}
                          <span>{act.location}</span>
                        </div>

                        <p className="activity-card-desc">{act.description}</p>
                      </div>

                      {/* Card Footer Row */}
                      <div className="activity-card-footer-row">
                        {/* Status/Category Badge */}
                        <div className={`card-status category-pill-${act.category.toLowerCase()}`}>
                          <span className="badge-pulse-dot" />
                          <span>
                            {act.category === 'Match' && '⚽ '}
                            {act.category === 'Practice' && '🎯 '}
                            {act.category === 'Workshop' && '💡 '}
                            {act.category === 'Social' && '🍹 '}
                            {act.category.toUpperCase()}
                          </span>
                        </div>

                        <button
                          className={`btn-rsvp-activity ${act.isJoined ? 'joined' : ''}`}
                          onClick={() => handleToggleJoinActivity(act.id)}
                        >
                          {act.isJoined ? (
                            <>
                              <Check size={14} />
                              <span>RSVP'd</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={14} />
                              <span>Join</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* CREATE ACTIVITY POPUP MODAL (Mounted via ReactDOM.createPortal to document.body, matching Create Community Modal 100%) */}
      {isCreateActivityOpen && ReactDOM.createPortal(
        <div className="modal-backdrop-overlay" onClick={() => setIsCreateActivityOpen(false)}>
          <div className="create-community-modal glass-panel" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header Bar */}
            <div className="modal-header-bar">
              <div className="modal-header-title">
                <Sparkles size={20} className="modal-header-icon" />
                <div>
                  <h3>Create New Activity</h3>
                  <p>Enter details to start a game, practice, or group hangout</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsCreateActivityOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateActivity} className="modal-form-body">
              {/* Category Picker Selector (Icon + Label Grid) */}
              <div className="form-group category-picker-group">
                <label className="form-label">Category *</label>
                <div className="category-scroll-container">
                  <div className="category-items-grid">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSelected = selectedCategoryItem?.id === cat.id || newCategory.toLowerCase() === cat.label.toLowerCase() || newCategory.toLowerCase() === cat.id.toLowerCase();
                      return (
                        <div
                          key={cat.id}
                          className={`category-item-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedCategoryItem(cat);
                            setNewCategory(cat.label);
                            if (!newImage) {
                              setNewImage(cat.image);
                            }
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

              <div className="form-group">
                <label className="form-label">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3v3 Friendly Football Match"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="Match">⚽ Match</option>
                    <option value="Practice">🎯 Practice</option>
                    <option value="Workshop">💡 Workshop</option>
                    <option value="Social">🍹 Social</option>
                    <option value="Meetup">✈️ Meetup</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Participants</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    placeholder="e.g. 10"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div> */}

              <div className="form-group">
                <label className="form-label">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow or July 28"
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 6:00 PM"
                    value={newTimeStr}
                    onChange={(e) => setNewTimeStr(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala Turf Ground Pitch 1"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief details about rules, equipment required, or plan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-create-cancel"
                  onClick={() => setIsCreateActivityOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="btn-create-submit"
                >
                  Create Activity
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
