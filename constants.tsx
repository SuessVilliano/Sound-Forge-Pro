
import { Opportunity, Track, Stats, Battle, User, SyncBrief } from './types';

export const APP_NAME = "Sound Merge";

export const VIEWS = {
  DASHBOARD: 'dashboard',
  ALL_TOOLS: 'all-tools',
  STAFF: 'staff',
  BATTLES: 'battles',
  CATALOG: 'catalog',
  STUDIO: 'studio',
  AR_DASHBOARD: 'ar-dashboard',
  MY_MUSIC: 'my-music',
  OPPORTUNITIES: 'opportunities',
  TOURING: 'touring',
  REVENUE: 'revenue',
  ADVANCES: 'advances', // Renamed from funding
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
  ADMIN: 'admin',
  BOOKING: 'booking'
};

/**
 * NAVIGATION WITH PROGRESSIVE DISCLOSURE
 * milestone: 'core' | 'first_asset' | 'reputation_500' | 'reputation_1000' | 'reputation_2000' | 'pro_only' | 'always'
 */
export const NAVIGATION_ITEMS = [
  { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard', milestone: 'core' },
  { id: VIEWS.ALL_TOOLS, label: 'All Tools', icon: 'Grid', milestone: 'always' },
  { id: VIEWS.STAFF, label: 'AI Staff', icon: 'MessageSquare', ai: true, milestone: 'core' },
  { id: VIEWS.STUDIO, label: 'AI Studio', icon: 'Wand2', ai: true, milestone: 'core' },
  { id: VIEWS.VOICE, label: 'Voice Market', icon: 'Mic', ai: true, milestone: 'core' },
  
  // UNLOCKS AFTER FIRST ASSET (XP > 0)
  { id: VIEWS.MY_MUSIC, label: 'My Library', icon: 'Music', milestone: 'first_asset' },
  { id: VIEWS.CATALOG, label: 'Music Catalog', icon: 'Disc', milestone: 'first_asset' },
  
  // UNLOCKS AT LEVEL 2 (XP > 500)
  { id: VIEWS.OPPORTUNITIES, label: 'Opportunities', icon: 'Zap', milestone: 'reputation_500' },
  { id: VIEWS.BRAND, label: 'Brand Builder', icon: 'Briefcase', milestone: 'reputation_500' },
  { id: VIEWS.BATTLES, label: 'Music Battles', icon: 'Swords', milestone: 'reputation_500' },
  { id: VIEWS.AFFILIATES, label: 'Partners', icon: 'DollarSign', milestone: 'reputation_500' },

  // UNLOCKS AT LEVEL 3 (XP > 1000)
  { id: VIEWS.DISTRIBUTION, label: 'Distribution', icon: 'Radio', milestone: 'reputation_1000' },
  { id: VIEWS.REVENUE, label: 'Revenue Recovery', icon: 'DollarSign', milestone: 'reputation_1000' },
  { id: VIEWS.TOURING, label: 'Gig Finder', icon: 'MapPin', milestone: 'reputation_1000' },

  // BUSINESS & INSTITUTIONAL (XP > 2000 or Pro)
  { id: VIEWS.CRM, label: 'CRM', icon: 'Mail', milestone: 'reputation_2000' },
  { id: VIEWS.ADVANCES, label: 'Advances', icon: 'Landmark', milestone: 'reputation_2000' }, // Renamed label to Advances
  { id: VIEWS.SMART_WALLET, label: 'Smart Wallet', icon: 'Wallet', milestone: 'reputation_2000' },
  
  // ENTERPRISE & SOCIAL
  { id: VIEWS.ANALYTICS, label: 'Insights', icon: 'BarChart2', milestone: 'pro_only' },
  { id: VIEWS.AR_DASHBOARD, label: 'A&R Dashboard', icon: 'Star', milestone: 'pro_only' },
  { id: VIEWS.DAO, label: 'DAO', icon: 'Vote', milestone: 'reputation_2000' },
  
  // ADMIN & SYSTEM
  { id: VIEWS.MONITORING, label: 'System Monitor', icon: 'Activity', ai: true, adminOnly: true, milestone: 'core' },
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
    description: 'A global airline is looking for an uplifting, high-energy electronic or pop track for their 2025 global rebrand launch.',
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
    }
];

export const FEATURED_ARTISTS: Partial<User>[] = [
    {
        uid: 'f1',
        displayName: 'Alex Rivera',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        role: 'artist',
        isFeatured: true
    }
];

export const PRO_PLATFORMS = [
  { name: 'ASCAP', type: 'PRO', url: 'https://www.ascap.com/' },
  { name: 'BMI', type: 'PRO', url: 'https://www.bmi.com/' },
  { name: 'SESAC', type: 'PRO', url: 'https://www.sesac.com/' },
  { name: 'SoundExchange', type: 'Digital Performance', url: 'https://www.soundexchange.com/' },
  { name: 'The MLC', type: 'Mechanical', url: 'https://www.themlc.com/' },
  { name: 'PRS for Music', type: 'PRO', url: 'https://www.prsformusic.com/' },
];

export const DISTRIBUTION_PARTNERS = [
  { name: 'Spotify', icon: 'Music' },
  { name: 'Apple Music', icon: 'Music' },
  { name: 'TikTok', icon: 'Music' },
  { name: 'YouTube Music', icon: 'Music' },
  { name: 'Instagram', icon: 'Music' },
  { name: 'Deezer', icon: 'Music' },
];

export const MASTERING_STYLES = [
  { id: 'balanced', name: 'Balanced', description: 'Clean and transparent with natural dynamics.' },
  { id: 'warm', name: 'Warm', description: 'Vintage analog character with soft saturation.' },
  { id: 'bright', name: 'Bright', description: 'Enhanced high-end clarity and presence.' },
  { id: 'aggressive', name: 'Aggressive', description: 'Maximum loudness and punch for club tracks.' },
  { id: 'custom', name: 'Custom AI', description: 'Provide specific instructions to the neural engine.' },
];

export const MOCK_COURSES = [
  { 
    id: 'c1', 
    title: 'Sync Licensing Masterclass', 
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 
    category: 'Business', 
    duration: '4h 20m', 
    lessons: 12 
  },
  { 
    id: 'c2', 
    title: 'AI-Powered Production', 
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', 
    category: 'Technical', 
    duration: '3h 45m', 
    lessons: 10 
  },
  { 
    id: 'c3', 
    title: 'On-Chain Rights & IP', 
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80', 
    category: 'Legal', 
    duration: '2h 15m', 
    lessons: 8 
  },
];
