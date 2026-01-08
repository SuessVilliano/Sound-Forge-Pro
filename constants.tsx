
import { Opportunity, Track, Stats, Battle, User, SyncBrief } from './types';
import { 
  Music, LayoutDashboard, Zap, DollarSign, Briefcase, 
  BookOpen, Sliders, BarChart2, User as UserIcon, Mail, Mic, 
  Radio, Activity, Wand2, MapPin, Disc, Star, Vote, Link, Swords, Wallet, MessageSquare,
  Users, Globe, Send, Phone, Video, Landmark
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
  FUNDING: 'funding',
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
  { id: VIEWS.STAFF, label: 'AI Staff', icon: MessageSquare, ai: true, badge: 3 },
  { id: VIEWS.OPPORTUNITIES, label: 'Opportunities', icon: Zap, badge: 12, new: true },
  { id: VIEWS.SMART_WALLET, label: 'Smart Wallet', icon: Wallet, new: true },
  { id: VIEWS.FUNDING, label: 'Funding', icon: Landmark, new: true },
  { id: VIEWS.BATTLES, label: 'Music Battles', icon: Swords, new: true, ai: true },
  { id: VIEWS.CATALOG, label: 'Music Catalog', icon: Disc },
  { id: VIEWS.STUDIO, label: 'AI Studio', icon: Wand2, ai: true },
  { id: VIEWS.AR_DASHBOARD, label: 'A&R Dashboard', icon: Star, badge: 3 },
  { id: VIEWS.MY_MUSIC, label: 'My Library', icon: Music },
  { id: VIEWS.TOURING, label: 'Gig Finder', icon: MapPin, ai: true },
  { id: VIEWS.REVENUE, label: 'Revenue Recovery', icon: DollarSign },
  { id: VIEWS.BRAND, label: 'Brand Builder', icon: Briefcase },
  { id: VIEWS.ACADEMY, label: 'Academy', icon: BookOpen },
  { id: VIEWS.COMMUNITY, label: 'Community', icon: Users },
  { id: VIEWS.MASTERING, label: 'AI Mastering', icon: Sliders },
  { id: VIEWS.ANALYTICS, label: 'Insights', icon: BarChart2 },
  { id: VIEWS.PROFILE, label: 'My Artist Page', icon: UserIcon },
  { id: VIEWS.CRM, label: 'Fan CRM', icon: Mail },
  { id: VIEWS.VOICE, label: 'Voice Market', icon: Mic, ai: true },
  { id: VIEWS.DISTRIBUTION, label: 'Distribution', icon: Radio },
  { id: VIEWS.DAO, label: 'DAO', icon: Vote, new: true },
  { id: VIEWS.AFFILIATES, label: 'Affiliates', icon: Link, new: true },
  { id: VIEWS.MONITORING, label: 'System Monitor', icon: Activity, ai: true, adminOnly: true },
];

export const MOCK_STATS: Stats = {
  totalEarnings: 12450,
  totalStreams: 452000,
  activeOpportunities: 12,
  brandScore: 'A-',
  earningsGrowth: 12.5,
  streamsGrowth: 8.2,
  opportunitiesNew: true,
  artistLevel: "Rising Star",
  xp: 1250,
  nextLevelXp: 2000
};

export const MOCK_BRIEFS: SyncBrief[] = [
  {
    id: 'sb_1',
    source: 'PartnerAPI',
    title: 'High-Energy Electronic for Major Airline Campaign',
    description: 'A global airline is looking for an uplifting, high-energy electronic or pop track for their 2025 global rebrand launch. The track needs a building intro and a powerful drop at 0:30.',
    mediaType: 'Ad',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    budget: { min: 5000, max: 15000, currency: 'USD' },
    requiredGenres: ['Electronic', 'Modern Pop'],
    moods: ['Uplifting', 'Expansive', 'Energetic'],
    tempo: '124-128 BPM',
    vocal: 'Either',
    references: ['Flume', 'Odesza'],
    deliverables: ['Full Mix', 'Instrumental', '30s Cut', 'Stems'],
    territory: ['Worldwide'],
    usage: ['1 Year', 'All Media'],
    rightsRequired: { master: true, publishing: true },
    createdAt: new Date().toISOString(),
    readinessScore: 85
  },
  {
    id: 'sb_2',
    source: 'EmailFeed',
    title: 'Subtle Lo-Fi Hip Hop for Tech Review Channel',
    description: 'Premium tech reviewer needs unobtrusive but stylish lo-fi hip hop backgrounds. Needs to be clean with minimal vocal chops.',
    mediaType: 'Other',
    deadline: new Date(Date.now() + 86400000 * 12).toISOString(),
    budget: { min: 200, max: 500, currency: 'USD' },
    requiredGenres: ['Hip Hop', 'Lo-Fi'],
    moods: ['Chill', 'Minimal', 'Focused'],
    tempo: '80-90 BPM',
    vocal: 'Instrumental',
    deliverables: ['Loopable Full Mix'],
    createdAt: new Date().toISOString(),
    readinessScore: 92
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'op1',
    source_platform: 'songtradr',
    brief_title: 'Upbeat Track for Travel Commercial',
    description: 'High-energy electronic or pop track needed for a global airline campaign.',
    usage_type: 'Ad',
    duration_required: 120,
    payout_min: 500,
    payout_max: 2000,
    deadline_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
    submission_status: 'matched',
    match_score: 92,
    mood_tags: ['Uplifting', 'Travel', 'Energy']
  },
  {
    id: 'op2',
    source_platform: 'artlist',
    brief_title: 'Minimal Tech Background',
    description: 'Looking for subtle, clean electronic loops for tech review videos.',
    usage_type: 'Ad',
    duration_required: 180,
    payout_min: 300,
    payout_max: 1000,
    deadline_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
    submission_status: 'open',
    match_score: 85,
    mood_tags: ['Clean', 'Tech', 'Minimal']
  }
];

export const MOCK_BATTLES: Battle[] = [
    {
        id: 'b1',
        title: 'The Turing Test Challenge',
        description: 'Can you spot the AI? A human-produced track vs a pure generative model.',
        type: 'Hybrid',
        genre: 'Pop',
        status: 'Live',
        endTime: new Date(Date.now() + 3600000).toISOString(),
        totalVotes: 4210,
        listeners: 156,
        config: { rewards: { cash: 1000, xp: 2500 }, customRules: ['Blind Listen Only'] },
        participants: [
            { id: 'p1', artistName: 'Artist Anonymous', isAi: false, trackTitle: 'Heart in a Box', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=400&q=80', votes: 2150 },
            { id: 'p2', artistName: 'Model-X Gen3', isAi: true, trackTitle: 'Neural Pulse', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80', votes: 2060 }
        ]
    },
    {
        id: 'b2',
        title: 'Cyber-Beat Showdown',
        description: 'AI agents competing for the most innovative rhythm profile.',
        type: 'AI Only',
        genre: 'Trap',
        status: 'Voting',
        endTime: new Date(Date.now() + 7200000).toISOString(),
        totalVotes: 1240,
        listeners: 45,
        config: { rewards: { cash: 500, xp: 1000 }, customRules: ['Neural Assets Only'] },
        participants: [
            { id: 'p3', artistName: 'Synthetic Operator', isAi: true, trackTitle: 'Logic Gate', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=400&q=80', votes: 640 },
            { id: 'p4', artistName: 'Neural Node 04', isAi: true, trackTitle: 'Data Stream', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', votes: 600 }
        ]
    }
];

export const FEATURED_ARTISTS: Partial<User>[] = [
    {
        uid: 'f1',
        displayName: 'Alex Rivera',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        role: 'artist',
        isFeatured: true
    },
    {
        uid: 'f2',
        displayName: 'Luna Shade',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        role: 'producer',
        isFeatured: true
    }
];

export const PRO_PLATFORMS = [
    { name: 'ASCAP', url: 'https://www.ascap.com', type: 'PRO' },
    { name: 'BMI', url: 'https://www.bmi.com', type: 'PRO' },
    { name: 'SoundExchange', url: 'https://www.soundexchange.com', type: 'CMO' },
    { name: 'The MLC', url: 'https://www.themlc.com', type: 'Royalties' }
];

export const DISTRIBUTION_PARTNERS = [
    { name: 'Spotify', icon: Music },
    { name: 'Apple Music', icon: Music },
    { name: 'TikTok', icon: Music }
];

export const CAMPAIGN_TEMPLATES = [
    {
        id: 'c1',
        title: 'New Single Blast',
        description: 'Announce your new release to all your fans across email and SMS.',
        icon: Zap,
        bg: 'bg-cyan-500/10',
        color: 'text-cyan-400',
        steps: ['Fan Email', 'SMS Alert', 'Social Teaser']
    }
];

export const MASTERING_STYLES = [
    { id: 'modern_pop', name: 'Modern Pop', description: 'Bright, loud, and punchy. Perfect for radio and streaming.' },
    { id: 'club_banger', name: 'Club Banger', description: 'Aggressive bass and compression for the heavy systems.' },
    { id: 'warm_vintage', name: 'Warm Vintage', description: 'Analog-style saturation and softer peaks for an organic feel.' }
];

export const PLACEMENT_PLATFORMS = [
    { name: 'Songtradr', url: 'https://www.songtradr.com' },
    { name: 'Music Gateway', url: 'https://www.musicgateway.com' }
];

export const MOCK_COURSES = [
    { id: 1, title: 'Mastering Sync Licensing', category: 'Business', duration: '4h 30m', lessons: 12, image: 'https://picsum.photos/400/250?random=101' },
    { id: 2, title: 'AI Production Secrets', category: 'Production', duration: '6h 15m', lessons: 24, image: 'https://picsum.photos/400/250?random=102' }
];
