/**
 * SOUND FORGE PRO - OPPORTUNITY SERVICE
 * Handles sync licensing opportunities from various sources.
 * Integrates with Songtradr, Music Gateway, and other sync platforms.
 */

import { Opportunity } from '../types';

// API Configuration - these would be set in environment
const SONGTRADR_API_BASE = 'https://api.songtradr.com/v1';
const MUSIC_GATEWAY_API = 'https://api.musicgateway.com/v1';

// Cache for opportunities
let opportunityCache: Opportunity[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Expanded mock data that matches real sync brief patterns
const ENHANCED_OPPORTUNITIES: Opportunity[] = [
    {
        id: 'op_travel_001',
        source_platform: 'Songtradr',
        brief_title: 'Upbeat Track for Global Airline Campaign',
        description: 'Looking for high-energy electronic or indie-pop track for a major airline\'s summer travel campaign. Should evoke feelings of adventure, freedom, and excitement. Positive, uplifting energy throughout.',
        usage_type: 'Ad',
        duration_required: 60,
        payout_min: 5000,
        payout_max: 15000,
        deadline_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Uplifting', 'Adventure', 'Energy', 'Summer']
    },
    {
        id: 'op_film_002',
        source_platform: 'Music Gateway',
        brief_title: 'Dramatic Orchestral Score - Indie Film',
        description: 'Independent drama film seeking emotional orchestral pieces for key scenes. Looking for tension-building tracks and emotional resolution moments. Must be able to clear full rights.',
        usage_type: 'Film',
        duration_required: 180,
        payout_min: 2000,
        payout_max: 8000,
        deadline_datetime: new Date(Date.now() + 86400000 * 14).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Dramatic', 'Emotional', 'Orchestral', 'Cinematic']
    },
    {
        id: 'op_game_003',
        source_platform: 'Songtradr',
        brief_title: 'Electronic Ambient for Mobile Game',
        description: 'Mobile puzzle game needs looping ambient electronic tracks. Calming but engaging, should work well as background music for extended play sessions. Multiple tracks needed.',
        usage_type: 'Game',
        duration_required: 120,
        payout_min: 500,
        payout_max: 2000,
        deadline_datetime: new Date(Date.now() + 86400000 * 21).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Ambient', 'Electronic', 'Calm', 'Loopable']
    },
    {
        id: 'op_tv_004',
        source_platform: 'Musicbed',
        brief_title: 'Reality TV Underscore Package',
        description: 'Reality competition show needs a package of underscore tracks covering various emotions: tension, triumph, heartbreak, humor. Contemporary sound preferred.',
        usage_type: 'TV',
        duration_required: 60,
        payout_min: 1000,
        payout_max: 5000,
        deadline_datetime: new Date(Date.now() + 86400000 * 10).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Underscore', 'Various', 'Contemporary', 'TV']
    },
    {
        id: 'op_brand_005',
        source_platform: 'Songtradr',
        brief_title: 'Hip-Hop Track for Athletic Brand',
        description: 'Major athletic brand campaign needs modern hip-hop/trap instrumental with motivational energy. Think workout playlist energy. No lyrics needed - instrumental only.',
        usage_type: 'Ad',
        duration_required: 45,
        payout_min: 8000,
        payout_max: 25000,
        deadline_datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Hip-Hop', 'Motivational', 'Athletic', 'Energy']
    },
    {
        id: 'op_podcast_006',
        source_platform: 'Music Gateway',
        brief_title: 'Intro/Outro Music for Tech Podcast',
        description: 'Popular technology podcast needs new theme music. Should feel modern, innovative, and professional. 15-30 second versions needed for intro and outro.',
        usage_type: 'Other',
        duration_required: 30,
        payout_min: 300,
        payout_max: 1000,
        deadline_datetime: new Date(Date.now() + 86400000 * 30).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Tech', 'Modern', 'Professional', 'Short']
    },
    {
        id: 'op_trailer_007',
        source_platform: 'Songtradr',
        brief_title: 'Epic Trailer Music - Action Film',
        description: 'Major studio action film trailer needs epic orchestral/hybrid track. Big drums, brass, and electronic elements. Must build to massive climax.',
        usage_type: 'Trailer',
        duration_required: 90,
        payout_min: 10000,
        payout_max: 50000,
        deadline_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Epic', 'Action', 'Trailer', 'Hybrid']
    },
    {
        id: 'op_social_008',
        source_platform: 'Epidemic Sound',
        brief_title: 'TikTok-Ready Viral Sounds',
        description: 'Platform seeking catchy, hook-driven tracks optimized for short-form video. Need immediate impact in first 3 seconds. Various genres welcome.',
        usage_type: 'Brand',
        duration_required: 30,
        payout_min: 200,
        payout_max: 1500,
        deadline_datetime: new Date(Date.now() + 86400000 * 60).toISOString(),
        submission_status: 'open',
        match_score: 0,
        mood_tags: ['Viral', 'Hook', 'Social', 'Catchy']
    }
];

/**
 * Calculate match score based on user's catalog and preferences
 */
const calculateMatchScore = (opportunity: Opportunity, userGenres: string[] = [], userMoods: string[] = []): number => {
    let score = 50; // Base score

    // Match based on mood tags
    const matchingMoods = opportunity.mood_tags.filter(tag =>
        userMoods.some(userMood =>
            userMood.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(userMood.toLowerCase())
        )
    );
    score += matchingMoods.length * 10;

    // Boost for higher payouts
    if (opportunity.payout_max >= 10000) score += 10;
    if (opportunity.payout_max >= 25000) score += 10;

    // Deadline urgency (sooner deadlines get slight boost)
    const daysUntilDeadline = (new Date(opportunity.deadline_datetime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDeadline <= 7) score += 5;
    if (daysUntilDeadline <= 3) score += 5;

    // Cap at 98 (never show perfect score)
    return Math.min(98, Math.max(20, score));
};

export const opportunityService = {
    /**
     * Fetch opportunities from all connected sources
     */
    async fetchOpportunities(
        userGenres: string[] = [],
        userMoods: string[] = [],
        forceRefresh: boolean = false
    ): Promise<Opportunity[]> {
        // Return cached data if still fresh
        if (!forceRefresh && opportunityCache.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
            return opportunityCache;
        }

        try {
            // In production, this would fetch from real APIs
            // For now, use enhanced mock data with calculated match scores
            const opportunities = ENHANCED_OPPORTUNITIES.map(opp => ({
                ...opp,
                match_score: calculateMatchScore(opp, userGenres, userMoods)
            }));

            // Sort by match score descending
            opportunities.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

            opportunityCache = opportunities;
            lastFetchTime = Date.now();

            return opportunities;
        } catch (error) {
            console.error('[OpportunityService] Fetch error:', error);
            return opportunityCache.length > 0 ? opportunityCache : ENHANCED_OPPORTUNITIES;
        }
    },

    /**
     * Submit a track to an opportunity
     */
    async submitToOpportunity(
        opportunityId: string,
        trackId: string,
        pitchNote: string,
        userId: string
    ): Promise<{ success: boolean; submissionId: string; message: string }> {
        try {
            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));

            const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Update local cache to show submission status
            opportunityCache = opportunityCache.map(opp =>
                opp.id === opportunityId
                    ? { ...opp, submission_status: 'submitted' }
                    : opp
            );

            return {
                success: true,
                submissionId,
                message: 'Your track has been submitted for review. You will be notified of any updates.'
            };
        } catch (error) {
            console.error('[OpportunityService] Submit error:', error);
            return {
                success: false,
                submissionId: '',
                message: 'Failed to submit. Please try again.'
            };
        }
    },

    /**
     * Get opportunities filtered by type
     */
    async getByType(usageType: string): Promise<Opportunity[]> {
        const all = await this.fetchOpportunities();
        if (usageType === 'all') return all;
        return all.filter(opp => opp.usage_type.toLowerCase() === usageType.toLowerCase());
    },

    /**
     * Get top matching opportunities for user
     */
    async getTopMatches(userGenres: string[], userMoods: string[], limit: number = 5): Promise<Opportunity[]> {
        const all = await this.fetchOpportunities(userGenres, userMoods, true);
        return all.slice(0, limit);
    },

    /**
     * Clear cache (useful for testing)
     */
    clearCache() {
        opportunityCache = [];
        lastFetchTime = 0;
    }
};

export default opportunityService;
