
import { Opportunity, Track, Stats, Battle, User } from './types';
import { 
  Music, LayoutDashboard, Zap, DollarSign, Briefcase, 
  BookOpen, Sliders, BarChart2, User as UserIcon, Mail, Mic, 
  Radio, Activity, Wand2, MapPin, Disc, Star, Vote, Link, Swords, Wallet, MessageSquare,
  Users, Globe, Send, Phone, Video
} from 'lucide-react';

export const APP_NAME = "Sound Merge";

export const VIEWS = {
  DASHBOARD: 'dashboard',
  STAFF: 'staff',
  BATTLES: 'battles',
  CATALOG: 'catalog',
  STUDIO: 'studio',
  AR_DASHBOARD: 'ar-dashboard',
  MY_MUSIC: 'my-music',
  OPPORTUNITIES: 'opportunities',
  TOURING: 'touring',
  REVENUE: 'revenue',
  BRAND: 'brand',
  ACADEMY: 'academy',
  COMMUNITY: 'community',
  MASTERING: 'mastering',
  ANALYTICS: 'analytics',
  PROFILE: 'profile',
  CRM: 'crm',
  VOICE: 'voice',
  DISTRIBUTION: 'distribution',
  DAO: 'dao',
  MONITORING: 'monitoring',
  SETTINGS: 'settings',
  LIVE_AGENT: 'live-agent',
  AFFILIATES: 'affiliates',
  SMART_WALLET: 'smart-wallet',
  ADMIN: 'admin'
};

export const NAVIGATION_ITEMS = [
  { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: VIEWS.STAFF, label: 'Staff', icon: MessageSquare, ai: true, badge: 3 },
  { id: VIEWS.SMART_WALLET, label: 'Smart Wallet', icon: Wallet, new: true },
  { id: VIEWS.BATTLES, label: 'Battles Arena', icon: Swords, new: true, ai: true },
  { id: VIEWS.CATALOG, label: 'Music Catalog', icon: Disc },
  { id: VIEWS.STUDIO, label: 'AI Studio', icon: Wand2, ai: true },
  { id: VIEWS.AR_DASHBOARD, label: 'A&R Suite', icon: Star, badge: 3 },
  { id: VIEWS.MY_MUSIC, label: 'My Music', icon: Music },
  { id: VIEWS.OPPORTUNITIES, label: 'Opportunities', icon: Zap, badge: 8 },
  { id: VIEWS.TOURING, label: 'Touring', icon: MapPin, ai: true },
  { id: VIEWS.REVENUE, label: 'Revenue Recovery', icon: DollarSign },
  { id: VIEWS.BRAND, label: 'Brand Builder', icon: Briefcase },
  { id: VIEWS.ACADEMY, label: 'Music Academy', icon: BookOpen },
  { id: VIEWS.COMMUNITY, label: 'Community', icon: Users },
  { id: VIEWS.MASTERING, label: 'Mastering', icon: Sliders },
  { id: VIEWS.ANALYTICS, label: 'Analytics', icon: BarChart2 },
  { id: VIEWS.PROFILE, label: 'Site Builder', icon: UserIcon },
  { id: VIEWS.CRM, label: 'Marketing CRM', icon: Mail },
  { id: VIEWS.VOICE, label: 'Voice Marketplace', icon: Mic, ai: true },
  { id: VIEWS.DISTRIBUTION, label: 'Music Distribution', icon: Radio },
  { id: VIEWS.DAO, label: 'DAO Governance', icon: Vote, new: true },
  { id: VIEWS.AFFILIATES, label: 'Affiliates', icon: Link, new: true },
  { id: VIEWS.MONITORING, label: 'AI Monitoring', icon: Activity, ai: true, adminOnly: true },
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

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'op1',
    source_platform: 'songtradr',
    brief_title: 'Summer Travel Vlog',
    description: 'Upbeat, energetic pop track for travel content.',
    usage_type: 'Ad',
    duration_required: 120,
    payout_min: 500,
    payout_max: 2000,
    deadline_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
    submission_status: 'matched',
    match_score: 92,
    mood_tags: ['Upbeat', 'Summer', 'Pop']
  },
  {
    id: 'op2',
    source_platform: 'artlist',
    brief_title: 'Tech Review Background',
    description: 'Clean, minimal electronic beat for gadget reviews.',
    usage_type: 'Ad',
    duration_required: 180,
    payout_min: 300,
    payout_max: 1000,
    deadline_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
    submission_status: 'open',
    match_score: 85,
    mood_tags: ['Electronic', 'Minimal', 'Tech']
  }
];

export const FEATURED_ARTISTS: Partial<User>[] = [
    {
        uid: 'f1',
        displayName: 'Alex Rivera',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Alternative pop artist known for ethereal vocals and experimental production.',
        role: 'artist',
        isFeatured: true
    },
    {
        uid: 'f2',
        displayName: 'Luna Shadow',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        bio: 'Electronic producer bridging the gap between underground techno and melodic ambient.',
        role: 'producer',
        isFeatured: true
    },
    {
        uid: 'f3',
        displayName: 'Marcus Vane',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        bio: 'Award-winning songwriter focusing on cinematic scores and urban storytelling.',
        role: 'producer',
        isFeatured: true
    }
];

export const PRO_PLATFORMS = [
    { name: 'ASCAP', url: 'https://www.ascap.com', type: 'PRO' },
    { name: 'BMI', url: 'https://www.bmi.com', type: 'PRO' },
    { name: 'SESAC', url: 'https://www.sesac.com', type: 'PRO' },
    { name: 'SoundExchange', url: 'https://www.soundexchange.com', type: 'CMO' },
    { name: 'The MLC', url: 'https://www.themlc.com', type: 'Mechanical' }
];

export const DISTRIBUTION_PARTNERS = [
    { name: 'Spotify', icon: Music },
    { name: 'Apple Music', icon: Music },
    { name: 'TikTok', icon: Music },
    { name: 'YouTube Music', icon: Music },
    { name: 'Amazon Music', icon: Music },
    { name: 'Tidal', icon: Music }
];

export const CAMPAIGN_TEMPLATES = [
    {
        id: 'c1',
        title: 'Album Launch Blast',
        description: 'Multi-channel announcement for your latest project.',
        icon: Zap,
        bg: 'bg-cyan-500/10',
        color: 'text-cyan-400',
        steps: ['Announcement Email', 'Release Day SMS', 'Follow-up Visualizer']
    },
    {
        id: 'c2',
        title: 'New Fan Welcome',
        description: 'Automated journey for new mailing list subscribers.',
        icon: Users,
        bg: 'bg-purple-500/10',
        color: 'text-purple-400',
        steps: ['Welcome Note', 'Free Download', 'Store Discount']
    },
    {
        id: 'c3',
        title: 'Merch Drop Hype',
        description: 'Visual-heavy campaign for limited physical releases.',
        icon: DollarSign,
        bg: 'bg-green-500/10',
        color: 'text-green-400',
        steps: ['Teaser Post', 'Drop Alert', 'Low Stock Reminder']
    }
];

export const MASTERING_STYLES = [
    { id: 'modern_pop', name: 'Modern Pop', description: 'Crisp highs, controlled lows, and industry standard loudness.' },
    { id: 'club_banger', name: 'Club Banger', description: 'Aggressive compression and bass enhancement for big systems.' },
    { id: 'warm_vintage', name: 'Warm Vintage', description: 'Analog saturation and subtle dynamic range preservation.' },
    { id: 'custom', name: 'Custom AI', description: 'Provide specific instructions for your unique sound.' }
];

export const PLACEMENT_PLATFORMS = [
    { name: 'Songtradr', url: 'https://www.songtradr.com' },
    { name: 'Artlist', url: 'https://artlist.io' },
    { name: 'Musicbed', url: 'https://www.musicbed.com' },
    { name: 'Epidemic Sound', url: 'https://www.epidemicsound.com' },
    { name: 'Taxi', url: 'https://www.taxi.com' }
];

export const MOCK_COURSES = [
    { id: 1, title: 'Sync Licensing Masterclass', category: 'Business', duration: '4h 30m', lessons: 12, image: 'https://picsum.photos/400/250?random=101' },
    { id: 2, title: 'Advanced AI Production', category: 'Studio', duration: '6h 15m', lessons: 24, image: 'https://picsum.photos/400/250?random=102' },
    { id: 3, title: 'TikTok Growth Strategy', category: 'Marketing', duration: '3h 00m', lessons: 8, image: 'https://picsum.photos/400/250?random=103' }
];

export const MOCK_BATTLES: Battle[] = [
    {
        id: 'b1',
        title: 'The AI Summer Showdown',
        description: 'Show off your best AI-assisted summer hits.',
        type: 'AI Only',
        genre: 'Pop',
        status: 'Live',
        endTime: new Date(Date.now() + 3600000).toISOString(),
        totalVotes: 1240,
        listeners: 45,
        config: { rewards: { cash: 500, xp: 1000 }, customRules: ['AI Vocals Only'] },
        participants: [
            { id: 'p1', artistName: 'SynthWave Queen', isAi: true, trackTitle: 'Neon Sunset', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', image: 'https://picsum.photos/400/400?random=1', votes: 640 },
            { id: 'p2', artistName: 'Digital Dave', isAi: true, trackTitle: 'Pixel Beach', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', image: 'https://picsum.photos/400/400?random=2', votes: 600 }
        ]
    }
];
