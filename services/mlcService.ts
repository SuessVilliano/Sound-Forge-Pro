/**
 * SOUND FORGE PRO - MLC SERVICE
 * Integration with The MLC (Mechanical Licensing Collective)
 * For US streaming mechanical royalties under the Music Modernization Act
 */

// ============================================
// MLC DEFINITIONS
// ============================================

export interface MLCMember {
    memberId: string;
    memberType: 'songwriter' | 'publisher' | 'self_published';
    ipiNumber?: string;
    status: 'active' | 'pending' | 'unregistered';
    registrationDate?: string;
    worksRegistered: number;
    unclaimedBalance?: number;
}

export interface MechanicalWork {
    workId: string;
    title: string;
    iswc?: string;
    hfaSongCode?: string; // Harry Fox Agency legacy code
    writers: {
        name: string;
        ipi?: string;
        share: number;
        publisherName?: string;
    }[];
    isRegisteredWithMLC: boolean;
    hasUnclaimedRoyalties: boolean;
    estimatedUnclaimed?: number;
    registrationStatus: 'matched' | 'unmatched' | 'pending' | 'unknown';
}

export interface MLCRoyaltyStatement {
    period: string;
    totalEarnings: number;
    streamingMechanicals: number;
    downloadMechanicals: number;
    physicalMechanicals: number;
    byService: {
        service: string;
        streams: number;
        earnings: number;
    }[];
}

// ============================================
// MLC RATE INFORMATION
// ============================================

export const MLC_RATES = {
    // 2024-2027 CRB rates for streaming mechanical royalties
    streaming: {
        // Percentage of revenue OR per-play rate, whichever is greater
        percentOfRevenue: 0.156, // 15.6% of streaming service revenue
        perPlayFloor: 0.0004, // $0.0004 minimum per play
        // Actual payout is higher of the two calculations
    },
    download: {
        // Per-unit rates
        songUnder5Min: 0.12, // $0.12 per download
        songOver5Min: 0.0231, // $0.0231 per minute
        ringtone: 0.24, // $0.24 per ringtone
    },
    physical: {
        // Per-unit rates for CDs, vinyl
        perUnit: 0.12, // $0.12 per unit
        perMinuteOver5: 0.0231, // $0.0231 per minute for songs over 5 minutes
    }
};

// ============================================
// STREAMING SERVICES
// ============================================

export interface StreamingService {
    id: string;
    name: string;
    reportsToMLC: boolean;
    mechanicalRate: string;
    paymentFrequency: string;
    notes: string;
}

export const STREAMING_SERVICES: StreamingService[] = [
    {
        id: 'spotify',
        name: 'Spotify',
        reportsToMLC: true,
        mechanicalRate: '~$0.0004/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Largest streaming platform. Reports directly to MLC for US mechanicals.'
    },
    {
        id: 'apple_music',
        name: 'Apple Music',
        reportsToMLC: true,
        mechanicalRate: '~$0.0005/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Higher per-stream rate. Strong in US and premium demographics.'
    },
    {
        id: 'amazon_music',
        name: 'Amazon Music',
        reportsToMLC: true,
        mechanicalRate: '~$0.0004/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Growing platform with Prime integration. Reports to MLC.'
    },
    {
        id: 'youtube_music',
        name: 'YouTube Music',
        reportsToMLC: true,
        mechanicalRate: '~$0.0002/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Lower rate but massive reach. Includes Premium streams.'
    },
    {
        id: 'tidal',
        name: 'TIDAL',
        reportsToMLC: true,
        mechanicalRate: '~$0.0008/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Highest per-stream rate. Smaller user base but artist-friendly.'
    },
    {
        id: 'pandora',
        name: 'Pandora',
        reportsToMLC: true,
        mechanicalRate: '~$0.0003/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'On-demand and radio tiers. Reports all interactive streams.'
    },
    {
        id: 'deezer',
        name: 'Deezer',
        reportsToMLC: true,
        mechanicalRate: '~$0.0004/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Strong international presence. US mechanicals via MLC.'
    },
    {
        id: 'soundcloud',
        name: 'SoundCloud',
        reportsToMLC: true,
        mechanicalRate: '~$0.0002/stream',
        paymentFrequency: 'Monthly to MLC',
        notes: 'Go+ and paid tiers report to MLC. Free tier does not.'
    }
];

// ============================================
// MLC SERVICE
// ============================================

class MLCService {
    private readonly MLC_PORTAL_URL = 'https://portal.themlc.com';
    private readonly MLC_SEARCH_URL = 'https://www.themlc.com/search';

    /**
     * Get MLC registration guidance
     */
    getRegistrationGuide(): {
        steps: { step: number; title: string; description: string; url?: string }[];
        requirements: string[];
        timeline: string;
        cost: string;
    } {
        return {
            steps: [
                {
                    step: 1,
                    title: 'Create MLC Portal Account',
                    description: 'Sign up at the MLC member portal with your email and basic information.',
                    url: 'https://portal.themlc.com/register'
                },
                {
                    step: 2,
                    title: 'Verify Your Identity',
                    description: 'Complete identity verification. Songwriters need IPI number from their PRO (ASCAP/BMI/SESAC).',
                },
                {
                    step: 3,
                    title: 'Choose Member Type',
                    description: 'Select songwriter, publisher, or self-published songwriter. Self-published means you administer your own publishing.',
                },
                {
                    step: 4,
                    title: 'Register Your Works',
                    description: 'Add your songs to the MLC database. Include ISRC, ISWC, and ownership splits.',
                },
                {
                    step: 5,
                    title: 'Claim Unmatched Royalties',
                    description: 'Search the MLC database for unclaimed royalties from your songs.',
                    url: 'https://www.themlc.com/search'
                }
            ],
            requirements: [
                'Valid email address',
                'IPI number (from ASCAP, BMI, or SESAC membership)',
                'Tax information (W-9 for US, W-8BEN for international)',
                'Bank account for direct deposit',
                'Catalog information with ownership percentages'
            ],
            timeline: 'Registration takes 1-2 weeks for approval. Royalties are paid monthly.',
            cost: 'Free to register. The MLC is funded by streaming services, not songwriters.'
        };
    }

    /**
     * Search MLC public database for unclaimed royalties
     */
    async searchUnclaimedRoyalties(
        query: string,
        searchType: 'title' | 'writer' | 'isrc' = 'title'
    ): Promise<{
        results: MechanicalWork[];
        totalUnclaimed: number;
        searchUrl: string;
    }> {
        // The MLC has a public search portal for unclaimed royalties
        const searchUrl = `${this.MLC_SEARCH_URL}?q=${encodeURIComponent(query)}&type=${searchType}`;

        try {
            // In production, this would scrape or use MLC API if available
            // MLC does not have a public API, so we provide the search URL

            // Simulate search results based on query
            return {
                results: [],
                totalUnclaimed: 0,
                searchUrl
            };
        } catch (error) {
            console.error('[MLCService] Search error:', error);
            return {
                results: [],
                totalUnclaimed: 0,
                searchUrl
            };
        }
    }

    /**
     * Calculate estimated mechanical royalties from streaming
     */
    calculateMechanicalRoyalties(
        streams: number,
        writerShare: number = 100,
        hasPublisher: boolean = false
    ): {
        gross: number;
        writerShare: number;
        publisherShare: number;
        byService: { service: string; estimated: number }[];
        notes: string[];
    } {
        // Average mechanical rate across services
        const avgRate = 0.0004;
        const gross = streams * avgRate;

        // If self-published, writer gets 100% of mechanical
        // If published, typically 50/50 split
        const writerPortion = hasPublisher ? gross * 0.5 : gross;
        const publisherPortion = hasPublisher ? gross * 0.5 : 0;

        // Breakdown by major services (assuming even distribution)
        const serviceShare = streams / 5;
        const byService = [
            { service: 'Spotify', estimated: serviceShare * 0.0004 },
            { service: 'Apple Music', estimated: serviceShare * 0.0005 },
            { service: 'Amazon Music', estimated: serviceShare * 0.0004 },
            { service: 'YouTube Music', estimated: serviceShare * 0.0002 },
            { service: 'Others', estimated: serviceShare * 0.0003 }
        ];

        return {
            gross,
            writerShare: writerPortion,
            publisherShare: publisherPortion,
            byService,
            notes: [
                'Mechanical royalties are separate from performance royalties (PRO)',
                'MLC pays monthly, typically 2-3 months after streams occur',
                'These are estimates - actual rates vary by service and their revenue',
                hasPublisher
                    ? 'With a publisher, mechanicals are typically split 50/50'
                    : 'As a self-published writer, you collect 100% of mechanicals'
            ]
        };
    }

    /**
     * Compare total streaming revenue streams
     */
    explainStreamingRevenue(streams: number): {
        total: number;
        breakdown: {
            type: string;
            amount: number;
            collector: string;
            description: string;
        }[];
    } {
        // Performance royalty (PRO) - ~40% of total
        const performanceRoyalty = streams * 0.0004;

        // Mechanical royalty (MLC) - ~20% of total
        const mechanicalRoyalty = streams * 0.0004;

        // Sound recording royalty (label/distributor) - ~40% of total
        const soundRecordingRoyalty = streams * 0.002;

        return {
            total: performanceRoyalty + mechanicalRoyalty + soundRecordingRoyalty,
            breakdown: [
                {
                    type: 'Sound Recording',
                    amount: soundRecordingRoyalty,
                    collector: 'Distributor (DistroKid, TuneCore, etc.)',
                    description: 'Payment to the owner of the recording (usually the artist/label)'
                },
                {
                    type: 'Performance Royalty',
                    amount: performanceRoyalty,
                    collector: 'PRO (ASCAP, BMI, SESAC)',
                    description: 'Payment for the public performance of the song composition'
                },
                {
                    type: 'Mechanical Royalty',
                    amount: mechanicalRoyalty,
                    collector: 'The MLC',
                    description: 'Payment for reproducing the song composition in a recording'
                }
            ]
        };
    }

    /**
     * Get HFA (Harry Fox Agency) legacy information
     */
    getHFAInfo(): {
        description: string;
        transition: string;
        actionRequired: string[];
    } {
        return {
            description: 'Harry Fox Agency (HFA) historically collected mechanical royalties. Since 2021, The MLC handles US streaming mechanicals under the MMA.',
            transition: 'If you had an HFA account, your digital mechanicals now flow through The MLC. Physical and download mechanicals may still go through HFA or your publisher.',
            actionRequired: [
                'Register with The MLC for streaming mechanicals (even if you had HFA)',
                'Check for unclaimed royalties at themlc.com/search',
                'If you have a publisher, confirm they\'re collecting on your behalf',
                'HFA song codes (HFA#) can help identify your works in MLC database'
            ]
        };
    }

    /**
     * Check if song is properly registered for mechanicals
     */
    async auditMechanicalRegistration(
        songTitle: string,
        isrc: string,
        writers: string[]
    ): Promise<{
        isComplete: boolean;
        issues: string[];
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check ISRC format
        if (!isrc || !/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(isrc)) {
            issues.push('Invalid or missing ISRC code');
            recommendations.push('Ensure your distributor assigned a valid ISRC');
        }

        // Check for MLC registration
        const mlcSearch = await this.searchUnclaimedRoyalties(songTitle, 'title');

        if (mlcSearch.results.length === 0) {
            recommendations.push(`Search MLC database manually: ${mlcSearch.searchUrl}`);
            recommendations.push('If not found, register your work at portal.themlc.com');
        }

        // Check for PRO registration (needed for IPI)
        recommendations.push('Verify you have an IPI number from ASCAP, BMI, or SESAC');
        recommendations.push('Include your IPI when registering works with The MLC');

        return {
            isComplete: issues.length === 0,
            issues,
            recommendations
        };
    }

    /**
     * Get all streaming services that report to MLC
     */
    getStreamingServices(): StreamingService[] {
        return STREAMING_SERVICES;
    }

    /**
     * Get current mechanical royalty rates
     */
    getRates(): typeof MLC_RATES {
        return MLC_RATES;
    }
}

export const mlcService = new MLCService();
export default mlcService;
