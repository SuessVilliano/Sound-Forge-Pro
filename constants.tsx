
import { Opportunity, Track, Course, Stats, Battle, User } from './types';
import { 
  Music, LayoutDashboard, Zap, DollarSign, Briefcase, 
  BookOpen, Sliders, BarChart2, User as UserIcon, Mail, Mic, 
  Radio, Activity, Wand2, Video, MapPin, Disc, Star, Vote, ShoppingBag, Link, Swords, Send, UserPlus, TrendingUp, Users, Shield, Wallet
} from 'lucide-react';

export const APP_NAME = "SoundForge Pro";

export const VIEWS = {
  DASHBOARD: 'dashboard',
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
  SMART_WALLET: 'smart-wallet', // New Smart Wallet View
  ADMIN: 'admin'
};

export const NAVIGATION_ITEMS = [
  { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: VIEWS.SMART_WALLET, label: 'Smart Wallet', icon: Wallet, new: true }, // Added here
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
  { id: VIEWS.PROFILE, label: 'Artist Profile', icon: UserIcon },
  { id: VIEWS.CRM, label: 'Marketing CRM', icon: Mail },
  { id: VIEWS.VOICE, label: 'Voice Marketplace', icon: Mic, ai: true },
  { id: VIEWS.DISTRIBUTION, label: 'Music Distribution', icon: Radio },
  { id: VIEWS.DAO, label: 'DAO Governance', icon: Vote, new: true },
  { id: VIEWS.AFFILIATES, label: 'Affiliates', icon: Link, new: true },
  { id: VIEWS.MONITORING, label: 'AI Monitoring', icon: Activity, ai: true, adminOnly: true }, // Restricted to Admin
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
    description: 'Upbeat, energetic pop track for travel content. Must have positive vibes and catchy melody.',
    usage_type: 'Ad',
    duration_required: 120,
    payout_min: 500,
    payout_max: 2000,
    deadline_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
    submission_status: 'matched',
    match_score: 92,
    risk_score: 5,
    recommended_action: 'auto_submit',
    mood_tags: ['Upbeat', 'Summer', 'Pop']
  },
  {
    id: 'op2',
    source_platform: 'artlist',
    brief_title: 'Tech Review Background',
    description: 'Clean, minimal electronic beat for gadget reviews. No distracting vocals.',
    usage_type: 'Ad',
    duration_required: 180,
    payout_min: 300,
    payout_max: 1000,
    deadline_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
    submission_status: 'open',
    match_score: 85,
    risk_score: 10,
    recommended_action: 'create',
    mood_tags: ['Electronic', 'Minimal', 'Tech']
  },
  {
    id: 'op3',
    source_platform: 'internal',
    brief_title: 'Cinematic Movie Trailer',
    description: 'Epic orchestral build-up for an action movie trailer. High intensity.',
    usage_type: 'Film',
    duration_required: 90,
    payout_min: 2500,
    payout_max: 8000,
    deadline_datetime: new Date(Date.now() + 86400000 * 14).toISOString(),
    submission_status: 'matched',
    match_score: 78,
    risk_score: 20,
    recommended_action: 'manual_review',
    mood_tags: ['Cinematic', 'Epic', 'Orchestral']
  }
];

export const MOCK_BATTLES: Battle[] = [
    {
        id: 'bat_1',
        title: "Future Trap Vol. 3",
        description: "Heavy 808s and futuristic synths. Who ruled the future?",
        type: "Hybrid",
        genre: "Trap",
        status: "Live",
        endTime: new Date(Date.now() + 3600000).toISOString(),
        totalVotes: 1245,
        listeners: 342,
        config: {
            maxDurationSeconds: 90,
            format: "Hybrid",
            votingWindow: "Live",
            maxEntries: 2,
            rewards: { xp: 500, cash: 100 },
            customRules: ["Must use AI vocals", "Original production only"]
        },
        participants: [
            {
                id: 'p1',
                artistName: "Neon Pulse",
                isAi: true,
                trackTitle: "Cyber Drip",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                image: "https://picsum.photos/400/400?random=88",
                votes: 620,
                creativityScore: 92,
                soundScore: 88
            },
            {
                id: 'p2',
                artistName: "DJ Hype",
                isAi: false,
                trackTitle: "Atlanta Nights",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                image: "https://picsum.photos/400/400?random=99",
                votes: 625,
                creativityScore: 85,
                soundScore: 95
            }
        ]
    },
    {
        id: 'bat_2',
        title: "Lo-Fi Sunday Chill",
        description: "The smoothest beats to study to. Relaxed vibes only.",
        type: "AI Only",
        genre: "Lo-Fi",
        status: "Voting",
        endTime: new Date(Date.now() + 86400000).toISOString(),
        totalVotes: 856,
        listeners: 120,
        config: {
            maxDurationSeconds: 120,
            format: "AI Only",
            votingWindow: "24h",
            maxEntries: 2,
            rewards: { xp: 300, badge: "Chill Master" },
            customRules: ["No lyrics", "Under 80 BPM", "AI Generation required"]
        },
        participants: [
            {
                id: 'p3',
                artistName: "ChillBot",
                isAi: true,
                trackTitle: "Rainy Window",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                image: "https://picsum.photos/400/400?random=77",
                votes: 400,
                creativityScore: 89,
                soundScore: 90
            },
            {
                id: 'p4',
                artistName: "ZenMaster",
                isAi: true,
                trackTitle: "Tea Ceremony",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                image: "https://picsum.photos/400/400?random=66",
                votes: 456,
                creativityScore: 94,
                soundScore: 91
            }
        ]
    },
    {
        id: 'bat_3',
        title: "Hyperpop Speed Run",
        description: "Fast, distorted, and glitchy. The wildest sound wins.",
        type: "Human Only",
        genre: "Hyperpop",
        status: "Ended",
        endTime: new Date(Date.now() - 100000).toISOString(),
        totalVotes: 5200,
        listeners: 0,
        config: {
            maxDurationSeconds: 180,
            format: "Human Only",
            votingWindow: "Live",
            maxEntries: 2,
            rewards: { xp: 1000, placement: true },
            customRules: ["Over 160 BPM", "Glitch effects mandatory"]
        },
        participants: [
            {
                id: 'p5',
                artistName: "GlitchWitch",
                isAi: false,
                trackTitle: "Sugar Crash",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
                image: "https://picsum.photos/400/400?random=55",
                votes: 3200,
                creativityScore: 98,
                soundScore: 85
            },
            {
                id: 'p6',
                artistName: "SpeedDemon",
                isAi: false,
                trackTitle: "Turbo",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
                image: "https://picsum.photos/400/400?random=44",
                votes: 2000,
                creativityScore: 88,
                soundScore: 92
            }
        ]
    },
    {
        id: 'bat_4',
        title: "Global Bass Championship",
        description: "Represent your region. Moombah, Baile Funk, and Dancehall styles.",
        type: "Hybrid",
        genre: "Global Bass",
        status: "Upcoming",
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        totalVotes: 0,
        listeners: 0,
        config: {
            maxDurationSeconds: 240,
            format: "Hybrid",
            votingWindow: "24h",
            maxEntries: 2,
            rewards: { xp: 800, badge: "Global Icon" },
            customRules: ["Regional Instruments required", "Open format"]
        },
        participants: [
            {
                id: 'p7',
                artistName: "RhythmKing",
                isAi: false,
                trackTitle: "Pending",
                audioUrl: "",
                image: "https://picsum.photos/400/400?random=22",
                votes: 0
            },
            {
                id: 'p8',
                artistName: "BassDroid",
                isAi: true,
                trackTitle: "Pending",
                audioUrl: "",
                image: "https://picsum.photos/400/400?random=33",
                votes: 0
            }
        ]
    }
];

export const MOCK_COURSES: Course[] = [
    { id: 'c1', title: 'Music Business 101', category: 'Business', difficulty: 'Beginner', duration: '2h 30m', lessons: 12, progress: 0, price: 0, image: 'https://picsum.photos/400/225?random=1' },
    { id: 'c2', title: 'Advanced Mixing', category: 'Production', difficulty: 'Advanced', duration: '4h 15m', lessons: 18, progress: 35, price: 49, image: 'https://picsum.photos/400/225?random=2' },
    { id: 'c3', title: 'TikTok Marketing', category: 'Marketing', difficulty: 'Intermediate', duration: '1h 45m', lessons: 8, progress: 0, price: 29, image: 'https://picsum.photos/400/225?random=3' },
    { id: 'c4', title: 'Sync Licensing Masterclass', category: 'Business', difficulty: 'Advanced', duration: '3h 20m', lessons: 15, progress: 10, price: 99, image: 'https://picsum.photos/400/225?random=4' },
    { id: 'c5', title: 'Synth Sound Design', category: 'Production', difficulty: 'Intermediate', duration: '2h 10m', lessons: 10, progress: 0, price: 39, image: 'https://picsum.photos/400/225?random=5' },
    { id: 'c6', title: 'Touring Logistics', category: 'Business', difficulty: 'Intermediate', duration: '1h 30m', lessons: 6, progress: 0, price: 0, image: 'https://picsum.photos/400/225?random=6' },
];

export const FEATURED_ARTISTS: User[] = [
    {
        uid: 'feat_1',
        displayName: 'Luna Ray',
        email: 'luna@example.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        plan: 'pro',
        voiceShieldEnabled: true,
        walletBalance: 0,
        isFeatured: true,
        bio: 'Ethereal pop vocals and futuristic sound design. Featured in Cyberpunk 2077 radio.',
        location: 'Tokyo, JP',
        role: 'artist',
        rates: {
            voiceLicense: 800,
            featureVerse: 1500,
            mixMaster: 300
        }
    },
    {
        uid: 'feat_2',
        displayName: 'K-Os Theory',
        email: 'kos@example.com',
        photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        plan: 'label',
        voiceShieldEnabled: true,
        walletBalance: 0,
        isFeatured: true,
        bio: 'Heavy bass producer and sound engineer. Credits include top EDM labels.',
        location: 'Berlin, DE',
        role: 'producer',
        rates: {
            voiceLicense: 0,
            featureVerse: 0,
            beatLease: 250,
            mixMaster: 500
        }
    },
    {
        uid: 'feat_3',
        displayName: 'Aria V',
        email: 'aria@example.com',
        photoURL: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
        plan: 'pro',
        voiceShieldEnabled: true,
        walletBalance: 0,
        isFeatured: true,
        bio: 'Soulful R&B songwriter. I write hooks that stick in your head for days.',
        location: 'London, UK',
        role: 'artist',
        rates: {
            voiceLicense: 600,
            featureVerse: 900
        }
    }
];

export const PLACEMENT_PLATFORMS = [
  { name: "Songtradr", url: "https://soundforge.biz/go/songtradr" },
  { name: "Artlist", url: "https://soundforge.biz/go/artlist" },
  { name: "Epidemic", url: "https://soundforge.biz/go/epidemic" },
  { name: "MusicBed", url: "https://soundforge.biz/go/musicbed" },
  { name: "Taxi", url: "https://soundforge.biz/go/taxi" }
];

export const PRO_PLATFORMS = [
    { name: "ASCAP", type: "Performance Rights", url: "https://ascap.com" },
    { name: "BMI", type: "Performance Rights", url: "https://bmi.com" },
    { name: "SoundExchange", type: "Digital Rights", url: "https://soundexchange.com" },
    { name: "Songtrust", type: "Publishing Admin", url: "https://songtrust.com" },
    { name: "The MLC", type: "Mechanical Rights", url: "https://themlc.com" }
];

export const DISTRIBUTION_PARTNERS = [
    { name: "DistroKid", url: "https://distrokid.com" },
    { name: "TuneCore", url: "https://tunecore.com" },
    { name: "CD Baby", url: "https://cdbaby.com" },
    { name: "Symphonic", url: "https://symphonic.com" }
];

export const CAMPAIGN_TEMPLATES = [
    { id: 't1', title: 'Release Radar', description: 'Promote your new single to Spotify playlist curators.', steps: ['Email Pitch', 'Social Teaser', 'Ads'], icon: Music, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 't2', title: 'Tour Announcement', description: 'Notify fans in specific cities about upcoming shows.', steps: ['SMS Blast', 'Geo-Targeted Email'], icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 't3', title: 'Merch Drop', description: 'Drive sales for your new clothing line or vinyl.', steps: ['IG Story', 'Email Newsletter'], icon: ShoppingBag, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

export const MASTERING_STYLES = [
    { id: 'modern_pop', name: 'Modern Pop', description: 'Bright, punchy, and loud. Perfect for Spotify.' },
    { id: 'warm_vintage', name: 'Warm Vintage', description: 'Analog warmth with soft highs and rich mids.' },
    { id: 'club_banger', name: 'Club Banger', description: 'Maximum loudness and bass emphasis.' },
    { id: 'cinematic', name: 'Cinematic', description: 'Wide dynamic range and spatial clarity.' },
    { id: 'vocal_crisp', name: 'Vocal Clarity', description: 'Enhances presence and removes mud from isolated vocals.' },
    { id: 'instrumental_open', name: 'Open Instrumental', description: 'Widens stereo image and preserves dynamic range.' },
    { id: 'live_concert', name: 'Live Concert', description: 'Balances crowd noise and adds stadium reverb ambiance.' },
    { id: 'custom', name: 'Custom AI Agent', description: 'Describe exactly what you want using natural language.' }
];
