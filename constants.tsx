
import { Opportunity, Track, Course, Stats } from './types';
import { 
  Music, LayoutDashboard, Zap, DollarSign, Briefcase, 
  BookOpen, Sliders, BarChart2, User, Mail, Mic, 
  Radio, Activity, Wand2, Video, MapPin, Disc, Star
} from 'lucide-react';

export const APP_NAME = "SoundForge Pro";

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Music Catalog', icon: Disc, new: true },
  { id: 'studio', label: 'AI Studio', icon: Wand2, ai: true },
  { id: 'ar-dashboard', label: 'A&R Suite', icon: Star, badge: 3 },
  { id: 'my-music', label: 'My Music', icon: Music },
  { id: 'opportunities', label: 'Opportunities', icon: Zap, badge: 8 },
  { id: 'touring', label: 'Touring', icon: MapPin, ai: true },
  { id: 'revenue', label: 'Revenue Recovery', icon: DollarSign },
  { id: 'brand', label: 'Brand Builder', icon: Briefcase },
  { id: 'academy', label: 'Music Academy', icon: BookOpen },
  { id: 'mastering', label: 'Mastering', icon: Sliders },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'profile', label: 'Artist Profile', icon: User },
  { id: 'crm', label: 'Marketing CRM', icon: Mail },
  { id: 'voice', label: 'Voice Marketplace', icon: Mic, ai: true },
  { id: 'distribution', label: 'Music Distribution', icon: Radio },
  { id: 'monitoring', label: 'AI Monitoring', icon: Activity, ai: true },
];

export const MOCK_STATS: Stats = {
  totalEarnings: 12450,
  totalStreams: 452000,
  activeOpportunities: 12,
  brandScore: 'A-',
  earningsGrowth: 12.5,
  streamsGrowth: 8.2,
  opportunitiesNew: true,
  artistLevel: "Rising Artist",
  xp: 1250,
  nextLevelXp: 2000
};

export const PLACEMENT_PLATFORMS = [
  { name: "Songtradr", url: "https://www.songtradr.com" },
  { name: "Musicbed", url: "https://www.musicbed.com" },
  { name: "Artlist", url: "https://artlist.io" },
  { name: "Epidemic Sound", url: "https://www.epidemicsound.com" },
  { name: "AudioJungle", url: "https://audiojungle.net" },
  { name: "Pond5", url: "https://www.pond5.com" },
  { name: "TAXI", url: "https://www.taxi.com" },
  { name: "Music Gateway", url: "https://www.musicgateway.com" },
  { name: "BMG Production Music", url: "https://www.bmgproductionmusic.com" },
  { name: "APM Music", url: "https://www.apmmusic.com" }
];

export const PRO_PLATFORMS = [
  { name: "ASCAP", url: "https://www.ascap.com/member-access", type: "Performance Rights" },
  { name: "BMI", url: "https://www.bmi.com/login", type: "Performance Rights" },
  { name: "SESAC", url: "https://www.sesac.com/", type: "Performance Rights" },
  { name: "SoundExchange", url: "https://www.soundexchange.com/", type: "Digital Performance" },
  { name: "The MLC", url: "https://www.themlc.com/", type: "Mechanical" },
];

export const DISTRIBUTION_PARTNERS = [
  { 
    name: "DistroKid", 
    cost: "$22.99/year", 
    features: ["Unlimited uploads", "100% royalties", "HyperFollow pages", "Split payments"], 
    payout: "Monthly", 
    speed: "1-3 days", 
    connected: false 
  },
  { 
    name: "TuneCore", 
    cost: "$29.99/year", 
    features: ["Social platforms", "Daily trends", "Cover art creator", "Publishing admin"], 
    payout: "Daily/Weekly", 
    speed: "1-3 days", 
    connected: false 
  },
  { 
    name: "UnitedMasters", 
    cost: "Free or $59.99/yr", 
    features: ["Brand partnerships", "Keep 100% (Select)", "MasterLinks", "Artist Advances"], 
    payout: "Monthly", 
    speed: "2-5 days", 
    connected: false 
  },
  { 
    name: "LANDR", 
    cost: "$49.99/year", 
    features: ["AI Mastering included", "Collaboration tools", "Distribution to 150+", "Sample packs"], 
    payout: "Monthly", 
    speed: "2-5 days", 
    connected: false 
  }
];

export const MASTERING_STYLES = [
  { id: 'balanced', name: 'Balanced', description: 'Natural and transparent. Good for Acoustic, Jazz, Folk.' },
  { id: 'warm', name: 'Warm', description: 'Vintage warmth with soft highs. Good for Soul, R&B, Lo-fi.' },
  { id: 'punchy', name: 'Punchy', description: 'Tight low end and crisp transients. Good for Hip Hop, Pop, EDM.' },
  { id: 'open', name: 'Open', description: 'Wide stereo image and airy highs. Good for Orchestral, Cinematic.' },
  { id: 'loud', name: 'Loud', description: 'Maximized volume for streaming. Good for Trap, Dubstep, Club.' },
];

export const CAMPAIGN_TEMPLATES = [
  {
    id: 'music-promo',
    title: 'New Single Release',
    description: 'Promote your latest track with a pre-save campaign and social blast.',
    icon: Music,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    steps: ['Pre-Save Page', 'Email Blast', 'Social Posts', 'Ad Setup']
  },
  {
    id: 'event-announce',
    title: 'Tour Announcement',
    description: 'Announce your upcoming tour dates and sell tickets directly to fans.',
    icon: MapPin,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    steps: ['Tour Dates', 'Ticket Links', 'Fan Presale', 'Venue Info']
  },
  {
    id: 'merch-launch',
    title: 'Merch Drop',
    description: 'Launch a limited edition merchandise collection to your top fans.',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    steps: ['Product Catalog', 'Lookbook', 'Early Access', 'Discount Codes']
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'op_1',
    source_platform: 'songtradr',
    brief_title: '30s Upbeat Fitness Ad',
    description: 'Looking for a high energy electronic pop track for a global sportswear campaign. Must be driving, no vocals preferred.',
    usage_type: 'Ad',
    duration_required: 30,
    payout_min: 2500,
    payout_max: 5000,
    deadline_datetime: '2025-06-01T17:00:00Z',
    submission_status: 'open',
    match_score: 92,
    risk_score: 10,
    recommended_action: 'auto_submit',
    mood_tags: ['energetic', 'workout', 'electronic'],
  },
  {
    id: 'op_2',
    source_platform: 'artlist',
    brief_title: 'Indie Film Opening Scene',
    description: 'Melancholic acoustic guitar track needed for a short film intro. Rainy vibes, emotional build up.',
    usage_type: 'Film',
    duration_required: 120,
    payout_min: 500,
    payout_max: 1200,
    deadline_datetime: '2025-06-05T12:00:00Z',
    submission_status: 'matched',
    match_score: 85,
    risk_score: 25,
    recommended_action: 'manual_review',
    mood_tags: ['sad', 'acoustic', 'emotional'],
  },
  {
    id: 'op_3',
    source_platform: 'google_search',
    brief_title: 'Cyberpunk Game Menu Loop',
    description: 'Dark synthwave loop for a futuristic RPG menu screen. Needs to loop perfectly.',
    usage_type: 'Game',
    duration_required: 60,
    payout_min: 1000,
    payout_max: 3000,
    deadline_datetime: '2025-06-10T09:00:00Z',
    submission_status: 'open',
    match_score: 45,
    risk_score: 5,
    recommended_action: 'create',
    mood_tags: ['dark', 'synthwave', 'sci-fi'],
  },
];

export const MOCK_TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Neon Horizon',
    artist: 'Midnight Echo',
    bpm: 124,
    key: 'Cm',
    mood_tags: ['Synthwave', 'Driving', 'Night'],
    duration: '3:45',
    plays: 12500,
    earnings: 450.25,
    image: 'https://picsum.photos/100/100?random=1',
  },
  {
    id: 't2',
    title: 'Summer Breeze',
    artist: 'Midnight Echo',
    bpm: 98,
    key: 'G',
    mood_tags: ['Chill', 'Acoustic', 'Happy'],
    duration: '2:50',
    plays: 8900,
    earnings: 320.10,
    image: 'https://picsum.photos/100/100?random=2',
  },
  {
    id: 't3',
    title: 'Code Red',
    artist: 'Midnight Echo',
    bpm: 140,
    key: 'Fm',
    mood_tags: ['Aggressive', 'Industrial', 'Action'],
    duration: '3:10',
    plays: 24000,
    earnings: 890.50,
    image: 'https://picsum.photos/100/100?random=3',
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Music Production 101',
    category: 'Production',
    difficulty: 'Beginner',
    duration: '8h',
    lessons: 12,
    progress: 45,
    price: 49.99,
    image: 'https://picsum.photos/400/225?random=4',
  },
  {
    id: 'c2',
    title: 'Music Business & Royalties',
    category: 'Business',
    difficulty: 'Intermediate',
    duration: '6h',
    lessons: 10,
    progress: 100,
    price: 79.99,
    image: 'https://picsum.photos/400/225?random=5',
  },
  {
    id: 'c3',
    title: 'Artist Branding Mastery',
    category: 'Marketing',
    difficulty: 'Intermediate',
    duration: '5h',
    lessons: 8,
    progress: 0,
    price: 59.99,
    image: 'https://picsum.photos/400/225?random=6',
  },
];