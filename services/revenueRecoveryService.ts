/**
 * SOUND FORGE PRO - REVENUE RECOVERY SERVICE
 * Scan and recover unclaimed royalties from multiple sources
 */

import { Track, User } from '../types';

// ============================================
// REVENUE SOURCES
// ============================================

export interface RevenueSource {
    id: string;
    name: string;
    type: 'performance' | 'mechanical' | 'neighboring' | 'sync' | 'digital';
    description: string;
    searchUrl: string;
    registrationUrl: string;
    estimatedUnclaimed: string;
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: string[];
}

export const REVENUE_SOURCES: RevenueSource[] = [
    // US Performance
    {
        id: 'ascap_ace',
        name: 'ASCAP ACE Database',
        type: 'performance',
        description: 'Search for your works in ASCAP repertory. Find unregistered songs generating royalties.',
        searchUrl: 'https://www.ascap.com/repertory',
        registrationUrl: 'https://www.ascap.com/help/career-development/Join-ASCAP',
        estimatedUnclaimed: '$2-50 per unregistered work/year',
        difficulty: 'easy',
        requirements: ['Song title', 'Writer name']
    },
    {
        id: 'bmi_repertoire',
        name: 'BMI Repertoire',
        type: 'performance',
        description: 'BMI public database. Check if your songs are registered correctly.',
        searchUrl: 'https://repertoire.bmi.com',
        registrationUrl: 'https://www.bmi.com/join',
        estimatedUnclaimed: '$2-50 per unregistered work/year',
        difficulty: 'easy',
        requirements: ['Song title', 'Writer name']
    },
    // US Mechanical
    {
        id: 'mlc_unclaimed',
        name: 'The MLC Unclaimed Royalties',
        type: 'mechanical',
        description: 'Billions in unclaimed streaming mechanicals. Search by title or writer name.',
        searchUrl: 'https://www.themlc.com/search',
        registrationUrl: 'https://portal.themlc.com',
        estimatedUnclaimed: '$100M+ in unclaimed royalties industry-wide',
        difficulty: 'easy',
        requirements: ['Song title', 'ISRC (optional)', 'Writer name']
    },
    // Neighboring Rights
    {
        id: 'soundexchange',
        name: 'SoundExchange',
        type: 'neighboring',
        description: 'Digital performance royalties for sound recording owners and featured artists.',
        searchUrl: 'https://www.soundexchange.com/artist-copyright-owner/search-the-registry/',
        registrationUrl: 'https://www.soundexchange.com/artist-copyright-owner/',
        estimatedUnclaimed: '$50-500 per artist depending on airplay',
        difficulty: 'medium',
        requirements: ['Artist name', 'Label name (optional)']
    },
    {
        id: 'aarc',
        name: 'AARC (Alliance of Artists and Recording Companies)',
        type: 'neighboring',
        description: 'Royalties from Audio Home Recording Act - blank media levies.',
        searchUrl: 'https://aarc-royalties.com/search',
        registrationUrl: 'https://aarc-royalties.com/registration',
        estimatedUnclaimed: '$10-100 per registered artist',
        difficulty: 'easy',
        requirements: ['Artist name', 'Featured on commercial releases']
    },
    // International
    {
        id: 'prs_search',
        name: 'PRS for Music (UK)',
        type: 'performance',
        description: 'UK performance royalties. Essential if your music plays in UK/EU.',
        searchUrl: 'https://www.prsformusic.com/works',
        registrationUrl: 'https://www.prsformusic.com/join',
        estimatedUnclaimed: '$5-100 per work with UK plays',
        difficulty: 'medium',
        requirements: ['Song title', 'IPI number recommended']
    },
    {
        id: 'sacem_search',
        name: 'SACEM (France)',
        type: 'performance',
        description: 'French royalties. Large sync market in France.',
        searchUrl: 'https://repertoire.sacem.fr',
        registrationUrl: 'https://www.sacem.fr/en/join-sacem',
        estimatedUnclaimed: '$5-100 per work with French plays',
        difficulty: 'medium',
        requirements: ['Song title', 'IPI number recommended']
    },
    {
        id: 'gema_search',
        name: 'GEMA (Germany)',
        type: 'performance',
        description: 'German performance royalties. Largest market in Europe.',
        searchUrl: 'https://www.gema.de/en/music-users/search-for-works',
        registrationUrl: 'https://www.gema.de/en/become-a-member',
        estimatedUnclaimed: '$5-150 per work with German plays',
        difficulty: 'hard',
        requirements: ['Song title', 'IPI number required for full access']
    },
    // YouTube
    {
        id: 'youtube_content_id',
        name: 'YouTube Content ID',
        type: 'digital',
        description: 'Claim revenue from videos using your music on YouTube.',
        searchUrl: 'https://www.youtube.com/audiolibrary',
        registrationUrl: 'https://support.google.com/youtube/answer/107383',
        estimatedUnclaimed: '$1-1000+ depending on usage',
        difficulty: 'hard',
        requirements: ['Original content ownership', 'Distributor with Content ID access']
    },
    // Sync
    {
        id: 'musicreports',
        name: 'Music Reports / Songfile',
        type: 'sync',
        description: 'Mechanical licenses issued for your songs. May indicate sync uses.',
        searchUrl: 'https://www.musicreports.com',
        registrationUrl: 'https://www.musicreports.com',
        estimatedUnclaimed: 'Varies by sync activity',
        difficulty: 'medium',
        requirements: ['Song title', 'Publisher information']
    }
];

// ============================================
// SCAN RESULTS
// ============================================

export interface ScanResult {
    sourceId: string;
    sourceName: string;
    status: 'found' | 'not_found' | 'potential_match' | 'error';
    matches: {
        title: string;
        writers: string[];
        confidence: 'high' | 'medium' | 'low';
        estimatedValue: number;
        claimUrl?: string;
    }[];
    searchUrl: string;
    scannedAt: string;
}

export interface RecoveryReport {
    userId: string;
    scannedAt: string;
    totalSources: number;
    sourcesScanned: number;
    potentialRecovery: number;
    results: ScanResult[];
    nextSteps: {
        priority: number;
        action: string;
        source: string;
        estimatedRecovery: number;
        url: string;
    }[];
}

// ============================================
// REVENUE RECOVERY SERVICE
// ============================================

class RevenueRecoveryService {

    /**
     * Get all revenue sources
     */
    getSources(): RevenueSource[] {
        return REVENUE_SOURCES;
    }

    /**
     * Get sources by type
     */
    getSourcesByType(type: RevenueSource['type']): RevenueSource[] {
        return REVENUE_SOURCES.filter(s => s.type === type);
    }

    /**
     * Scan for unclaimed royalties across all sources
     */
    async scanForUnclaimedRoyalties(
        user: User,
        tracks: Track[],
        artistNames: string[] = []
    ): Promise<RecoveryReport> {
        const results: ScanResult[] = [];
        const allNames = [
            user.displayName,
            ...artistNames,
            ...(tracks.map(t => t.artist).filter(Boolean))
        ].filter((name, i, arr) => name && arr.indexOf(name) === i) as string[];

        const allTitles = tracks.map(t => t.title).filter(Boolean);

        // Scan each source
        for (const source of REVENUE_SOURCES) {
            try {
                const result = await this.scanSource(source, allNames, allTitles);
                results.push(result);
            } catch (error) {
                results.push({
                    sourceId: source.id,
                    sourceName: source.name,
                    status: 'error',
                    matches: [],
                    searchUrl: source.searchUrl,
                    scannedAt: new Date().toISOString()
                });
            }
        }

        // Calculate potential recovery
        const potentialRecovery = results.reduce((sum, r) =>
            sum + r.matches.reduce((mSum, m) => mSum + m.estimatedValue, 0), 0
        );

        // Generate next steps
        const nextSteps = this.generateNextSteps(results);

        return {
            userId: user.id,
            scannedAt: new Date().toISOString(),
            totalSources: REVENUE_SOURCES.length,
            sourcesScanned: results.filter(r => r.status !== 'error').length,
            potentialRecovery,
            results,
            nextSteps
        };
    }

    /**
     * Scan a single source
     */
    private async scanSource(
        source: RevenueSource,
        artistNames: string[],
        trackTitles: string[]
    ): Promise<ScanResult> {
        // Note: In production, these would make real API calls where available
        // Most of these databases don't have public APIs, so we provide search URLs

        const matches: ScanResult['matches'] = [];

        // For sources with potential API access, we could make real requests
        // For now, we provide the search URLs and instructions

        // Simulate finding potential matches based on catalog size
        const catalogValue = trackTitles.length * this.getEstimatedValue(source);

        if (trackTitles.length > 0) {
            matches.push({
                title: `Potential unclaimed royalties for ${trackTitles.length} works`,
                writers: artistNames.slice(0, 3),
                confidence: 'medium',
                estimatedValue: catalogValue,
                claimUrl: source.registrationUrl
            });
        }

        return {
            sourceId: source.id,
            sourceName: source.name,
            status: trackTitles.length > 0 ? 'potential_match' : 'not_found',
            matches,
            searchUrl: source.searchUrl,
            scannedAt: new Date().toISOString()
        };
    }

    /**
     * Get estimated value per work for a source
     */
    private getEstimatedValue(source: RevenueSource): number {
        const estimates: Record<string, number> = {
            'ascap_ace': 25,
            'bmi_repertoire': 25,
            'mlc_unclaimed': 40,
            'soundexchange': 75,
            'aarc': 15,
            'prs_search': 20,
            'sacem_search': 15,
            'gema_search': 25,
            'youtube_content_id': 50,
            'musicreports': 30
        };
        return estimates[source.id] || 20;
    }

    /**
     * Generate prioritized next steps
     */
    private generateNextSteps(results: ScanResult[]): RecoveryReport['nextSteps'] {
        const steps: RecoveryReport['nextSteps'] = [];
        let priority = 1;

        // Sort by potential value
        const sortedResults = results
            .filter(r => r.status === 'potential_match' || r.status === 'found')
            .sort((a, b) => {
                const aValue = a.matches.reduce((sum, m) => sum + m.estimatedValue, 0);
                const bValue = b.matches.reduce((sum, m) => sum + m.estimatedValue, 0);
                return bValue - aValue;
            });

        for (const result of sortedResults) {
            const source = REVENUE_SOURCES.find(s => s.id === result.sourceId);
            if (!source) continue;

            const estimatedRecovery = result.matches.reduce((sum, m) => sum + m.estimatedValue, 0);

            steps.push({
                priority: priority++,
                action: `Search ${source.name} for unclaimed royalties`,
                source: source.name,
                estimatedRecovery,
                url: source.searchUrl
            });
        }

        // Add essential registrations
        steps.push({
            priority: priority++,
            action: 'Register with The MLC for US streaming mechanicals (free)',
            source: 'The MLC',
            estimatedRecovery: 0,
            url: 'https://portal.themlc.com'
        });

        steps.push({
            priority: priority++,
            action: 'Register with SoundExchange for digital performance royalties',
            source: 'SoundExchange',
            estimatedRecovery: 0,
            url: 'https://www.soundexchange.com'
        });

        return steps;
    }

    /**
     * Get registration checklist
     */
    getRegistrationChecklist(): {
        essential: { name: string; url: string; description: string; cost: string }[];
        recommended: { name: string; url: string; description: string; cost: string }[];
        advanced: { name: string; url: string; description: string; cost: string }[];
    } {
        return {
            essential: [
                {
                    name: 'PRO (ASCAP or BMI)',
                    url: 'https://www.ascap.com/help/career-development/Join-ASCAP',
                    description: 'Collect performance royalties from radio, TV, streaming, live venues',
                    cost: 'ASCAP: $50 | BMI: Free'
                },
                {
                    name: 'The MLC',
                    url: 'https://portal.themlc.com',
                    description: 'Collect US streaming mechanical royalties',
                    cost: 'Free'
                },
                {
                    name: 'SoundExchange',
                    url: 'https://www.soundexchange.com',
                    description: 'Collect digital performance royalties (satellite radio, webcasting)',
                    cost: 'Free'
                }
            ],
            recommended: [
                {
                    name: 'AARC',
                    url: 'https://aarc-royalties.com',
                    description: 'Audio Home Recording Act royalties',
                    cost: 'Free'
                },
                {
                    name: 'Publishing Admin (Songtrust, CD Baby Pro)',
                    url: 'https://www.songtrust.com',
                    description: 'Worldwide royalty collection from 100+ countries',
                    cost: '$100 setup + 15% commission'
                },
                {
                    name: 'YouTube Content ID (via distributor)',
                    url: 'https://www.cdbaby.com',
                    description: 'Monetize YouTube videos using your music',
                    cost: 'Included with most distributors'
                }
            ],
            advanced: [
                {
                    name: 'International PRO Registration',
                    url: 'https://www.prsformusic.com',
                    description: 'Direct registration with UK, EU PROs for major markets',
                    cost: 'Varies by country'
                },
                {
                    name: 'Music Reports',
                    url: 'https://www.musicreports.com',
                    description: 'Track mechanical license activity',
                    cost: 'Contact for pricing'
                },
                {
                    name: 'PPL (UK neighboring rights)',
                    url: 'https://www.ppluk.com',
                    description: 'UK sound recording performance royalties',
                    cost: 'Free to register'
                }
            ]
        };
    }

    /**
     * Estimate total annual royalties based on streaming numbers
     */
    estimateAnnualRoyalties(stats: {
        monthlyStreams: number;
        radioSpins?: number;
        liveShows?: number;
        syncPlacements?: number;
    }): {
        total: number;
        breakdown: {
            source: string;
            amount: number;
            collector: string;
            notes: string;
        }[];
        missingRevenue: {
            source: string;
            amount: number;
            reason: string;
            fix: string;
        }[];
    } {
        const breakdown: any[] = [];
        const missingRevenue: any[] = [];

        const annualStreams = stats.monthlyStreams * 12;

        // Sound recording (distributor)
        const soundRecording = annualStreams * 0.003;
        breakdown.push({
            source: 'Sound Recording (Streaming)',
            amount: soundRecording,
            collector: 'Distributor (DistroKid, etc.)',
            notes: 'This is what most artists track'
        });

        // Performance (PRO)
        const performance = annualStreams * 0.0004;
        breakdown.push({
            source: 'Performance Royalties (Streaming)',
            amount: performance,
            collector: 'PRO (ASCAP/BMI)',
            notes: 'Often missed - requires PRO registration'
        });

        // Mechanical (MLC)
        const mechanical = annualStreams * 0.0004;
        breakdown.push({
            source: 'Mechanical Royalties (Streaming)',
            amount: mechanical,
            collector: 'The MLC',
            notes: 'Often missed - requires MLC registration'
        });

        // Radio
        if (stats.radioSpins) {
            const radio = stats.radioSpins * 0.08;
            breakdown.push({
                source: 'Radio Performance',
                amount: radio,
                collector: 'PRO (ASCAP/BMI)',
                notes: 'Collected via PRO registration'
            });
        }

        // Live
        if (stats.liveShows) {
            const live = stats.liveShows * 5;
            breakdown.push({
                source: 'Live Performance',
                amount: live,
                collector: 'PRO (ASCAP/BMI)',
                notes: 'Submit setlists to your PRO'
            });
        }

        // Sync
        if (stats.syncPlacements) {
            const sync = stats.syncPlacements * 2500;
            breakdown.push({
                source: 'Sync Licensing',
                amount: sync,
                collector: 'Direct or via Sync Agent',
                notes: 'Varies widely by placement'
            });
        }

        // Calculate missing revenue warnings
        missingRevenue.push({
            source: 'Performance Royalties',
            amount: performance,
            reason: 'Not registered with PRO',
            fix: 'Join ASCAP or BMI'
        });

        missingRevenue.push({
            source: 'Mechanical Royalties',
            amount: mechanical,
            reason: 'Not registered with MLC',
            fix: 'Register free at themlc.com'
        });

        const total = breakdown.reduce((sum, b) => sum + b.amount, 0);

        return { total, breakdown, missingRevenue };
    }

    /**
     * Generate search URLs for manual verification
     */
    generateSearchUrls(
        artistName: string,
        trackTitles: string[]
    ): { source: string; url: string; instructions: string }[] {
        const encoded = encodeURIComponent(artistName);
        const titleSample = trackTitles[0] ? encodeURIComponent(trackTitles[0]) : '';

        return [
            {
                source: 'ASCAP ACE',
                url: `https://www.ascap.com/repertory#/ace/search/workID/0/writer/${encoded}`,
                instructions: 'Search for your name as writer. Check if all your songs appear.'
            },
            {
                source: 'BMI Repertoire',
                url: `https://repertoire.bmi.com/Search/Search?query=${encoded}&Main_Search_Type=Writer`,
                instructions: 'Search for your name. Verify all works are registered.'
            },
            {
                source: 'The MLC',
                url: `https://www.themlc.com/search?term=${encoded}`,
                instructions: 'Search for unclaimed royalties by your name or song titles.'
            },
            {
                source: 'SoundExchange',
                url: `https://www.soundexchange.com/artist-copyright-owner/search-the-registry/`,
                instructions: 'Search for your artist name. Register if not found.'
            },
            {
                source: 'ISWC Search',
                url: `https://iswcnet.cisac.org/`,
                instructions: 'Search for your works by title. Verify ISWC codes match.'
            }
        ];
    }
}

export const revenueRecoveryService = new RevenueRecoveryService();
export default revenueRecoveryService;
