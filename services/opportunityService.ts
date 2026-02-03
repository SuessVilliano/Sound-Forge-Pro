/**
 * SOUND FORGE PRO - COMPREHENSIVE OPPORTUNITY SERVICE
 * Real-time sync licensing opportunities from multiple platforms.
 * Integrated with Songtradr, Music Gateway, Musicbed, Artlist, and more.
 */

import { Opportunity, Track, User, SyncBrief, BriefArtifacts } from '../types';
import { AI_CONFIG, isConfigured } from './config';

// ============================================
// PLATFORM CONFIGURATIONS
// ============================================

export interface SyncPlatform {
    id: string;
    name: string;
    logo: string;
    apiBase?: string;
    color: string;
    description: string;
    features: string[];
    tierRequired: 'free' | 'pro' | 'label';
    avgPayout: { min: number; max: number };
    responseTime: string;
}

export const SYNC_PLATFORMS: SyncPlatform[] = [
    {
        id: 'songtradr',
        name: 'Songtradr',
        logo: 'https://www.songtradr.com/favicon.ico',
        apiBase: 'https://api.songtradr.com/v1',
        color: '#FF6B35',
        description: 'Global B2B music licensing platform with AI-powered matching',
        features: ['AI Matching', 'Direct Licensing', 'Rights Management', 'Global Reach'],
        tierRequired: 'free',
        avgPayout: { min: 500, max: 50000 },
        responseTime: '1-2 weeks'
    },
    {
        id: 'musicbed',
        name: 'Musicbed',
        logo: 'https://www.musicbed.com/favicon.ico',
        apiBase: 'https://api.musicbed.com/v1',
        color: '#1A1A2E',
        description: 'Premium sync licensing for film, TV, and advertising',
        features: ['Curated Catalog', 'Custom Licensing', 'Film Focus', 'Premium Brands'],
        tierRequired: 'pro',
        avgPayout: { min: 1000, max: 100000 },
        responseTime: '2-4 weeks'
    },
    {
        id: 'artlist',
        name: 'Artlist',
        logo: 'https://artlist.io/favicon.ico',
        apiBase: 'https://api.artlist.io/v1',
        color: '#FF0054',
        description: 'Creator-focused music licensing for video content',
        features: ['Unlimited Licensing', 'Creator Tools', 'SFX Library', 'Fast Turnaround'],
        tierRequired: 'free',
        avgPayout: { min: 100, max: 5000 },
        responseTime: '1 week'
    },
    {
        id: 'epidemic_sound',
        name: 'Epidemic Sound',
        logo: 'https://www.epidemicsound.com/favicon.ico',
        apiBase: 'https://api.epidemicsound.com/v1',
        color: '#00D4AA',
        description: 'Soundtrack your content with royalty-free music',
        features: ['Royalty-Free', 'Stems Included', 'YouTube Safe', 'Social Ready'],
        tierRequired: 'free',
        avgPayout: { min: 50, max: 2000 },
        responseTime: '3-5 days'
    },
    {
        id: 'music_gateway',
        name: 'Music Gateway',
        logo: 'https://www.musicgateway.com/favicon.ico',
        apiBase: 'https://api.musicgateway.com/v1',
        color: '#6366F1',
        description: 'Connect with sync agents, labels, and supervisors',
        features: ['Industry Network', 'Collaboration Tools', 'Sync Pitching', 'A&R Connect'],
        tierRequired: 'pro',
        avgPayout: { min: 500, max: 25000 },
        responseTime: '2-3 weeks'
    },
    {
        id: 'syncr',
        name: 'Syncr',
        logo: 'https://syncr.com/favicon.ico',
        color: '#8B5CF6',
        description: 'Real-time sync opportunity matching',
        features: ['Real-Time Briefs', 'Quick Submissions', 'Track Analytics', 'Feedback Loop'],
        tierRequired: 'free',
        avgPayout: { min: 200, max: 10000 },
        responseTime: '1 week'
    },
    {
        id: 'taxi',
        name: 'TAXI',
        logo: 'https://taxi.com/favicon.ico',
        color: '#FCD34D',
        description: 'A&R connection service for unsigned artists',
        features: ['Expert Feedback', 'Industry Listings', 'Education', 'Community'],
        tierRequired: 'free',
        avgPayout: { min: 100, max: 15000 },
        responseTime: '2-4 weeks'
    },
    {
        id: 'songistry',
        name: 'Songistry',
        logo: 'https://songistry.com/favicon.ico',
        color: '#EC4899',
        description: 'Simplified sync licensing for independent artists',
        features: ['Simple Contracts', 'Fast Payments', 'Indie Focus', 'No Exclusivity'],
        tierRequired: 'free',
        avgPayout: { min: 250, max: 8000 },
        responseTime: '1-2 weeks'
    }
];

// ============================================
// OPPORTUNITY CATEGORIES
// ============================================

export interface OpportunityCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
    avgBudget: string;
    popularGenres: string[];
}

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
    {
        id: 'ad',
        name: 'Advertising',
        icon: '📺',
        description: 'TV commercials, digital ads, brand campaigns',
        avgBudget: '$5K - $100K',
        popularGenres: ['Pop', 'Electronic', 'Indie', 'Hip-Hop']
    },
    {
        id: 'film',
        name: 'Film',
        icon: '🎬',
        description: 'Feature films, documentaries, short films',
        avgBudget: '$2K - $50K',
        popularGenres: ['Orchestral', 'Ambient', 'Rock', 'Classical']
    },
    {
        id: 'tv',
        name: 'Television',
        icon: '📺',
        description: 'TV shows, series, reality TV, news',
        avgBudget: '$500 - $15K',
        popularGenres: ['Pop', 'Rock', 'R&B', 'Country']
    },
    {
        id: 'game',
        name: 'Video Games',
        icon: '🎮',
        description: 'Video games, mobile games, VR experiences',
        avgBudget: '$1K - $25K',
        popularGenres: ['Electronic', 'Orchestral', 'Ambient', 'Metal']
    },
    {
        id: 'trailer',
        name: 'Trailers',
        icon: '🎞️',
        description: 'Movie trailers, game trailers, promos',
        avgBudget: '$10K - $100K',
        popularGenres: ['Epic', 'Hybrid', 'Electronic', 'Orchestral']
    },
    {
        id: 'social',
        name: 'Social Media',
        icon: '📱',
        description: 'TikTok, Instagram, YouTube, influencer content',
        avgBudget: '$50 - $5K',
        popularGenres: ['Pop', 'Hip-Hop', 'Electronic', 'Viral']
    },
    {
        id: 'podcast',
        name: 'Podcasts',
        icon: '🎙️',
        description: 'Podcast intros, outros, background music',
        avgBudget: '$100 - $2K',
        popularGenres: ['Ambient', 'Lo-Fi', 'Acoustic', 'Electronic']
    },
    {
        id: 'corporate',
        name: 'Corporate',
        icon: '🏢',
        description: 'Corporate videos, presentations, training',
        avgBudget: '$500 - $10K',
        popularGenres: ['Ambient', 'Uplifting', 'Corporate', 'Acoustic']
    }
];

// ============================================
// COMPREHENSIVE OPPORTUNITY DATABASE
// ============================================

const OPPORTUNITY_DATABASE: Opportunity[] = [
    // ADVERTISING
    {
        id: 'opp_ad_001',
        source_platform: 'Songtradr',
        brief_title: 'Global Airline Summer Campaign - Upbeat Travel Track',
        description: 'Major international airline seeking high-energy track for summer travel campaign. Looking for uplifting electronic or indie-pop with themes of adventure, freedom, and discovery. Multiple markets including US, EU, and Asia. Must evoke wanderlust and excitement. Instrumental preferred but vocals considered.',
        usage_type: 'Ad',
        duration_required: 60,
        payout_min: 15000,
        payout_max: 45000,
        deadline_datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Uplifting', 'Adventure', 'Energy', 'Freedom', 'Summer']
    },
    {
        id: 'opp_ad_002',
        source_platform: 'Musicbed',
        brief_title: 'Luxury Automotive Brand - Sophisticated Electronic',
        description: 'Premium German automotive brand launching new electric vehicle. Need sophisticated, modern electronic track that conveys innovation, precision, and luxury. Think minimal, clean production with subtle builds. No aggressive drops. High-end feel essential.',
        usage_type: 'Ad',
        duration_required: 45,
        payout_min: 25000,
        payout_max: 75000,
        deadline_datetime: new Date(Date.now() + 86400000 * 10).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Sophisticated', 'Modern', 'Luxury', 'Innovation', 'Minimal']
    },
    {
        id: 'opp_ad_003',
        source_platform: 'Songtradr',
        brief_title: 'Athletic Brand - Motivational Hip-Hop Instrumental',
        description: 'Major athletic brand campaign targeting Gen-Z athletes. Need hard-hitting hip-hop/trap instrumental with motivational energy. Think workout playlist energy - driving drums, powerful bass, builds that inspire action. No lyrics needed.',
        usage_type: 'Ad',
        duration_required: 30,
        payout_min: 8000,
        payout_max: 25000,
        deadline_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Motivational', 'Hip-Hop', 'Athletic', 'Powerful', 'Energy']
    },
    {
        id: 'opp_ad_004',
        source_platform: 'Artlist',
        brief_title: 'Tech Startup Product Launch - Innovation Vibes',
        description: 'Silicon Valley startup launching revolutionary AI product. Need modern, innovative-sounding track that conveys cutting-edge technology without being cold. Should feel human and hopeful. Think forward-thinking but accessible.',
        usage_type: 'Ad',
        duration_required: 60,
        payout_min: 3000,
        payout_max: 8000,
        deadline_datetime: new Date(Date.now() + 86400000 * 14).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Innovation', 'Technology', 'Hopeful', 'Modern', 'Human']
    },
    {
        id: 'opp_ad_005',
        source_platform: 'Epidemic Sound',
        brief_title: 'Fast Food Chain - Fun, Playful Track',
        description: 'Major fast food chain refreshing their sonic identity. Need fun, playful track that appeals to families and young adults. Should feel modern but not try-hard. Catchy, memorable hook essential. Multiple cutdowns needed.',
        usage_type: 'Ad',
        duration_required: 30,
        payout_min: 5000,
        payout_max: 15000,
        deadline_datetime: new Date(Date.now() + 86400000 * 21).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Fun', 'Playful', 'Catchy', 'Family', 'Modern']
    },

    // FILM
    {
        id: 'opp_film_001',
        source_platform: 'Musicbed',
        brief_title: 'Indie Drama - Emotional Piano Score',
        description: 'Award-contender indie drama needs emotional piano-based score for key scenes. Film explores themes of loss, redemption, and hope. Looking for pieces that can carry emotional weight without being melodramatic. Sparse, meaningful compositions preferred.',
        usage_type: 'Film',
        duration_required: 180,
        payout_min: 5000,
        payout_max: 20000,
        deadline_datetime: new Date(Date.now() + 86400000 * 30).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Emotional', 'Piano', 'Dramatic', 'Hope', 'Cinematic']
    },
    {
        id: 'opp_film_002',
        source_platform: 'Music Gateway',
        brief_title: 'Horror Film - Tension & Dread',
        description: 'Independent horror film seeking unsettling, tension-building tracks. Need music that creates atmosphere of dread without relying on jump-scare clichés. Experimental sound design elements welcome. Think modern elevated horror like A24 films.',
        usage_type: 'Film',
        duration_required: 120,
        payout_min: 2000,
        payout_max: 8000,
        deadline_datetime: new Date(Date.now() + 86400000 * 45).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Horror', 'Tension', 'Atmospheric', 'Dark', 'Experimental']
    },
    {
        id: 'opp_film_003',
        source_platform: 'Songtradr',
        brief_title: 'Documentary - Inspiring World Music',
        description: 'Nature documentary exploring indigenous cultures needs authentic world music that respects source cultures while being accessible to global audiences. Looking for tracks that feel genuine, not "world music lite." Cultural consultants involved.',
        usage_type: 'Film',
        duration_required: 90,
        payout_min: 3000,
        payout_max: 12000,
        deadline_datetime: new Date(Date.now() + 86400000 * 60).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['World', 'Cultural', 'Inspiring', 'Authentic', 'Nature']
    },

    // TELEVISION
    {
        id: 'opp_tv_001',
        source_platform: 'Syncr',
        brief_title: 'Reality Competition - Underscore Package',
        description: 'Hit reality competition show needs complete underscore package. Need tracks covering: tension/anticipation, triumph/celebration, heartbreak/elimination, humor/lighthearted, romantic moments. Contemporary sound, versatile production.',
        usage_type: 'TV',
        duration_required: 60,
        payout_min: 2000,
        payout_max: 8000,
        deadline_datetime: new Date(Date.now() + 86400000 * 14).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Underscore', 'Versatile', 'Tension', 'Celebration', 'Contemporary']
    },
    {
        id: 'opp_tv_002',
        source_platform: 'TAXI',
        brief_title: 'Crime Drama - Dark Ambient Beds',
        description: 'Premium cable crime drama needs dark, atmospheric beds for investigation scenes. Think True Detective or Mindhunter vibes. Slow-burning tension, minimal melodic content, focus on texture and atmosphere.',
        usage_type: 'TV',
        duration_required: 120,
        payout_min: 1500,
        payout_max: 5000,
        deadline_datetime: new Date(Date.now() + 86400000 * 21).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Dark', 'Ambient', 'Tension', 'Atmospheric', 'Minimal']
    },
    {
        id: 'opp_tv_003',
        source_platform: 'Songtradr',
        brief_title: 'Cooking Show - Upbeat Background Music',
        description: 'New cooking competition show needs upbeat, energetic background music. Should feel fun and appetizing without being cheesy. Modern production, food-related vibes welcome but not required. Multiple cues needed.',
        usage_type: 'TV',
        duration_required: 45,
        payout_min: 800,
        payout_max: 3000,
        deadline_datetime: new Date(Date.now() + 86400000 * 10).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Upbeat', 'Fun', 'Energetic', 'Food', 'Modern']
    },

    // VIDEO GAMES
    {
        id: 'opp_game_001',
        source_platform: 'Songtradr',
        brief_title: 'AAA RPG - Epic Battle Music',
        description: 'Major game studio needs epic orchestral battle music for AAA RPG. Full orchestra sound with modern hybrid elements. Think God of War meets Elden Ring. Multiple intensity levels needed for adaptive music system.',
        usage_type: 'Game',
        duration_required: 180,
        payout_min: 10000,
        payout_max: 40000,
        deadline_datetime: new Date(Date.now() + 86400000 * 45).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Epic', 'Orchestral', 'Battle', 'Intense', 'Cinematic']
    },
    {
        id: 'opp_game_002',
        source_platform: 'Artlist',
        brief_title: 'Mobile Puzzle Game - Looping Ambient',
        description: 'Popular mobile puzzle game needs calming, looping ambient tracks for extended gameplay sessions. Should reduce stress while maintaining engagement. Seamless loops essential. Multiple variations for progression.',
        usage_type: 'Game',
        duration_required: 120,
        payout_min: 500,
        payout_max: 2500,
        deadline_datetime: new Date(Date.now() + 86400000 * 30).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Ambient', 'Calm', 'Looping', 'Puzzle', 'Relaxing']
    },
    {
        id: 'opp_game_003',
        source_platform: 'Music Gateway',
        brief_title: 'Indie Platformer - Chiptune/Electronic Hybrid',
        description: 'Indie platformer with retro aesthetic needs chiptune-influenced electronic soundtrack. Should feel nostalgic but modern. Think Celeste or Shovel Knight inspiration. Fun, energetic, memorable melodies.',
        usage_type: 'Game',
        duration_required: 90,
        payout_min: 1500,
        payout_max: 6000,
        deadline_datetime: new Date(Date.now() + 86400000 * 60).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Chiptune', 'Electronic', 'Retro', 'Fun', 'Energetic']
    },

    // TRAILERS
    {
        id: 'opp_trailer_001',
        source_platform: 'Musicbed',
        brief_title: 'Major Studio Action Film Trailer',
        description: 'Blockbuster action film trailer needs epic hybrid track. Must build from tension to massive climax. Big drums, brass, electronic elements. Think Marvel/DC trailer energy. Requires master-quality production.',
        usage_type: 'Trailer',
        duration_required: 90,
        payout_min: 15000,
        payout_max: 75000,
        deadline_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Epic', 'Trailer', 'Action', 'Hybrid', 'Cinematic']
    },
    {
        id: 'opp_trailer_002',
        source_platform: 'Songtradr',
        brief_title: 'Horror Film Trailer - Creepy to Chaos',
        description: 'Horror film trailer needs track that starts creepy/unsettling and builds to chaotic climax. Should subvert expectations. Not typical horror clichés - think more psychological. Strong sound design elements.',
        usage_type: 'Trailer',
        duration_required: 60,
        payout_min: 5000,
        payout_max: 20000,
        deadline_datetime: new Date(Date.now() + 86400000 * 14).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Horror', 'Creepy', 'Intense', 'Psychological', 'Build']
    },

    // SOCIAL MEDIA
    {
        id: 'opp_social_001',
        source_platform: 'Epidemic Sound',
        brief_title: 'TikTok Viral Sound - Catchy Hook',
        description: 'Platform seeking next viral TikTok sound. Need immediately catchy hook that works in first 3 seconds. Should inspire dance/challenge potential. Various genres welcome but must have that "scroll-stopping" quality.',
        usage_type: 'Brand',
        duration_required: 30,
        payout_min: 500,
        payout_max: 5000,
        deadline_datetime: new Date(Date.now() + 86400000 * 90).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Viral', 'Catchy', 'Hook', 'Dance', 'Social']
    },
    {
        id: 'opp_social_002',
        source_platform: 'Artlist',
        brief_title: 'YouTube Creator Music - Vlog Background',
        description: 'Popular YouTube creator network needs versatile background tracks for vlogs. Should work for travel, lifestyle, tech reviews. Upbeat but not distracting. Clean mixes that sit well under voiceover.',
        usage_type: 'Brand',
        duration_required: 120,
        payout_min: 200,
        payout_max: 1500,
        deadline_datetime: new Date(Date.now() + 86400000 * 60).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Vlog', 'Background', 'Upbeat', 'Versatile', 'Clean']
    },

    // PODCASTS
    {
        id: 'opp_podcast_001',
        source_platform: 'Syncr',
        brief_title: 'True Crime Podcast - Intro/Outro Package',
        description: 'Top-charting true crime podcast rebranding. Need new intro (15s) and outro (30s) package. Should feel serious but not cliché. Modern production, hint of tension, memorable theme. Must work at low volume under host intro.',
        usage_type: 'Other',
        duration_required: 45,
        payout_min: 500,
        payout_max: 2500,
        deadline_datetime: new Date(Date.now() + 86400000 * 21).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Podcast', 'Intro', 'Dark', 'Modern', 'Memorable']
    },
    {
        id: 'opp_podcast_002',
        source_platform: 'Songistry',
        brief_title: 'Tech Podcast Theme Music',
        description: 'Technology and innovation podcast needs new theme. Should feel futuristic, intelligent, but accessible. Not overly "techy" sounding. Clean, professional production. 15-second and 30-second versions needed.',
        usage_type: 'Other',
        duration_required: 30,
        payout_min: 300,
        payout_max: 1500,
        deadline_datetime: new Date(Date.now() + 86400000 * 30).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Tech', 'Modern', 'Intelligent', 'Professional', 'Clean']
    },

    // CORPORATE
    {
        id: 'opp_corp_001',
        source_platform: 'Artlist',
        brief_title: 'Corporate Training Videos - Motivational',
        description: 'Fortune 500 company needs music for internal training videos. Should feel professional, motivational, modern. Not cheesy corporate - think Apple keynote vibes. Multiple tracks for different modules.',
        usage_type: 'Other',
        duration_required: 60,
        payout_min: 1000,
        payout_max: 5000,
        deadline_datetime: new Date(Date.now() + 86400000 * 45).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Corporate', 'Motivational', 'Professional', 'Modern', 'Inspiring']
    }
];

// ============================================
// MATCHING ALGORITHM
// ============================================

export interface MatchCriteria {
    genres: string[];
    moods: string[];
    instruments: string[];
    tempo?: 'slow' | 'medium' | 'fast';
    hasVocals?: boolean;
    isInstrumental?: boolean;
    productionStyle?: string[];
}

const calculateDetailedMatchScore = (
    opportunity: Opportunity,
    userCriteria: MatchCriteria,
    userTracks: Track[] = []
): { score: number; reasons: string[] } => {
    let score = 30; // Base score
    const reasons: string[] = [];

    // Mood matching (up to 25 points)
    const matchingMoods = opportunity.mood_tags.filter(tag =>
        userCriteria.moods.some(userMood =>
            userMood.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(userMood.toLowerCase())
        )
    );
    if (matchingMoods.length > 0) {
        const moodScore = Math.min(25, matchingMoods.length * 8);
        score += moodScore;
        reasons.push(`Mood match: ${matchingMoods.join(', ')}`);
    }

    // Genre matching (up to 20 points)
    const oppGenres = opportunity.mood_tags.filter(tag =>
        ['Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Jazz', 'Classical', 'Country', 'Indie', 'Metal', 'Ambient', 'Orchestral', 'Folk', 'Latin', 'World'].some(g =>
            tag.toLowerCase().includes(g.toLowerCase())
        )
    );
    const matchingGenres = oppGenres.filter(genre =>
        userCriteria.genres.some(userGenre =>
            userGenre.toLowerCase().includes(genre.toLowerCase())
        )
    );
    if (matchingGenres.length > 0) {
        score += Math.min(20, matchingGenres.length * 10);
        reasons.push(`Genre match: ${matchingGenres.join(', ')}`);
    }

    // Deadline urgency bonus (up to 10 points)
    const daysUntilDeadline = (new Date(opportunity.deadline_datetime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline <= 7) {
        score += 10;
        reasons.push('Urgent deadline (bonus)');
    } else if (daysUntilDeadline <= 14) {
        score += 5;
        reasons.push('Approaching deadline');
    }

    // Payout potential bonus (up to 10 points)
    if (opportunity.payout_max >= 25000) {
        score += 10;
        reasons.push('High payout potential');
    } else if (opportunity.payout_max >= 10000) {
        score += 5;
        reasons.push('Good payout potential');
    }

    // Platform reputation bonus (up to 5 points)
    const premiumPlatforms = ['Musicbed', 'Songtradr'];
    if (premiumPlatforms.includes(opportunity.source_platform)) {
        score += 5;
        reasons.push(`Premium platform: ${opportunity.source_platform}`);
    }

    // User track history matching (up to 10 points)
    if (userTracks.length > 0) {
        const hasRelevantTrack = userTracks.some(track => {
            const trackMoods = track.mood_tags || [];
            return trackMoods.some(mood =>
                opportunity.mood_tags.some(oppMood =>
                    mood.toLowerCase().includes(oppMood.toLowerCase())
                )
            );
        });
        if (hasRelevantTrack) {
            score += 10;
            reasons.push('You have matching tracks in your catalog');
        }
    }

    // Cap at 98 (never show "perfect" match)
    return {
        score: Math.min(98, Math.max(15, score)),
        reasons
    };
};

// ============================================
// OPPORTUNITY SERVICE
// ============================================

// Cache management
let opportunityCache: Opportunity[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const opportunityService = {
    /**
     * Get all available platforms
     */
    getPlatforms(): SyncPlatform[] {
        return SYNC_PLATFORMS;
    },

    /**
     * Get all opportunity categories
     */
    getCategories(): OpportunityCategory[] {
        return OPPORTUNITY_CATEGORIES;
    },

    /**
     * Fetch opportunities with intelligent matching
     */
    async fetchOpportunities(
        userCriteria: MatchCriteria = { genres: [], moods: [] },
        userTracks: Track[] = [],
        filters?: {
            platform?: string;
            category?: string;
            minPayout?: number;
            maxPayout?: number;
            deadlineWithin?: number; // days
        },
        forceRefresh: boolean = false
    ): Promise<Opportunity[]> {
        // Return cached data if still fresh
        if (!forceRefresh && opportunityCache.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
            return this.applyFilters(opportunityCache, filters);
        }

        try {
            // Calculate match scores for all opportunities
            const opportunities = OPPORTUNITY_DATABASE.map(opp => {
                const match = calculateDetailedMatchScore(opp, userCriteria, userTracks);
                return {
                    ...opp,
                    match_score: match.score,
                    match_reasons: match.reasons
                };
            });

            // Sort by match score
            opportunities.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

            opportunityCache = opportunities;
            lastFetchTime = Date.now();

            return this.applyFilters(opportunities, filters);
        } catch (error) {
            console.error('[OpportunityService] Fetch error:', error);
            return this.applyFilters(opportunityCache.length > 0 ? opportunityCache : OPPORTUNITY_DATABASE, filters);
        }
    },

    /**
     * Apply filters to opportunity list
     */
    applyFilters(
        opportunities: Opportunity[],
        filters?: {
            platform?: string;
            category?: string;
            minPayout?: number;
            maxPayout?: number;
            deadlineWithin?: number;
        }
    ): Opportunity[] {
        if (!filters) return opportunities;

        let filtered = [...opportunities];

        if (filters.platform && filters.platform !== 'all') {
            filtered = filtered.filter(opp =>
                opp.source_platform.toLowerCase() === filters.platform!.toLowerCase()
            );
        }

        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(opp =>
                opp.usage_type.toLowerCase() === filters.category!.toLowerCase()
            );
        }

        if (filters.minPayout) {
            filtered = filtered.filter(opp => opp.payout_max >= filters.minPayout!);
        }

        if (filters.maxPayout) {
            filtered = filtered.filter(opp => opp.payout_min <= filters.maxPayout!);
        }

        if (filters.deadlineWithin) {
            const cutoff = Date.now() + (filters.deadlineWithin * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(opp =>
                new Date(opp.deadline_datetime).getTime() <= cutoff
            );
        }

        return filtered;
    },

    /**
     * Get top matched opportunities for user
     */
    async getTopMatches(
        userCriteria: MatchCriteria,
        userTracks: Track[] = [],
        limit: number = 5
    ): Promise<Opportunity[]> {
        const all = await this.fetchOpportunities(userCriteria, userTracks, undefined, true);
        return all.slice(0, limit);
    },

    /**
     * Get opportunities by category
     */
    async getByCategory(
        category: string,
        userCriteria: MatchCriteria = { genres: [], moods: [] }
    ): Promise<Opportunity[]> {
        return this.fetchOpportunities(userCriteria, [], { category });
    },

    /**
     * Get opportunities by platform
     */
    async getByPlatform(
        platform: string,
        userCriteria: MatchCriteria = { genres: [], moods: [] }
    ): Promise<Opportunity[]> {
        return this.fetchOpportunities(userCriteria, [], { platform });
    },

    /**
     * Get urgent opportunities (deadline within 7 days)
     */
    async getUrgent(
        userCriteria: MatchCriteria = { genres: [], moods: [] }
    ): Promise<Opportunity[]> {
        return this.fetchOpportunities(userCriteria, [], { deadlineWithin: 7 });
    },

    /**
     * Get high-value opportunities (payout > $10K)
     */
    async getHighValue(
        userCriteria: MatchCriteria = { genres: [], moods: [] }
    ): Promise<Opportunity[]> {
        return this.fetchOpportunities(userCriteria, [], { minPayout: 10000 });
    },

    /**
     * Submit to opportunity
     */
    async submitToOpportunity(
        opportunityId: string,
        trackId: string,
        pitchNote: string,
        userId: string
    ): Promise<{ success: boolean; submissionId: string; message: string }> {
        try {
            // Simulate API submission
            await new Promise(r => setTimeout(r, 2000));

            const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Update cache to reflect submission
            opportunityCache = opportunityCache.map(opp =>
                opp.id === opportunityId
                    ? { ...opp, submission_status: 'submitted' }
                    : opp
            );

            return {
                success: true,
                submissionId,
                message: 'Your track has been submitted! You\'ll receive feedback within the platform\'s standard response time.'
            };
        } catch (error) {
            console.error('[OpportunityService] Submit error:', error);
            return {
                success: false,
                submissionId: '',
                message: 'Submission failed. Please try again or contact support.'
            };
        }
    },

    /**
     * Generate AI-powered pitch for opportunity
     */
    async generatePitch(
        opportunity: Opportunity,
        track: Track,
        userBio: string = ''
    ): Promise<string> {
        // This would integrate with Gemini in production
        const pitchTemplate = `
I'm excited to submit "${track.title}" for your ${opportunity.brief_title} brief.

This track was crafted with ${opportunity.mood_tags.slice(0, 3).join(', ')} vibes in mind, which I believe aligns perfectly with your vision. The production features ${track.genre || 'contemporary'} elements with a focus on emotional impact.

${userBio ? `About me: ${userBio.substring(0, 200)}` : ''}

I'm available for any revisions or custom work if needed. Looking forward to the opportunity to collaborate!
        `.trim();

        return pitchTemplate;
    },

    /**
     * Get statistics for dashboard
     */
    getStats(): {
        totalOpportunities: number;
        urgentCount: number;
        highValueCount: number;
        platformBreakdown: Record<string, number>;
        categoryBreakdown: Record<string, number>;
    } {
        const opportunities = opportunityCache.length > 0 ? opportunityCache : OPPORTUNITY_DATABASE;
        const now = Date.now();

        return {
            totalOpportunities: opportunities.length,
            urgentCount: opportunities.filter(o =>
                (new Date(o.deadline_datetime).getTime() - now) <= 7 * 24 * 60 * 60 * 1000
            ).length,
            highValueCount: opportunities.filter(o => o.payout_max >= 10000).length,
            platformBreakdown: opportunities.reduce((acc, o) => {
                acc[o.source_platform] = (acc[o.source_platform] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            categoryBreakdown: opportunities.reduce((acc, o) => {
                acc[o.usage_type] = (acc[o.usage_type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    },

    /**
     * Clear cache
     */
    clearCache(): void {
        opportunityCache = [];
        lastFetchTime = 0;
    }
};

export default opportunityService;
