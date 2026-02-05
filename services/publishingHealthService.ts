/**
 * SOUND FORGE PRO - PUBLISHING HEALTH SERVICE
 * Comprehensive audit of publishing setup, registration status, and revenue optimization
 */

import { Track, User } from '../types';
import { proIntegrationService, WorkRegistration } from './proIntegrationService';
import { mlcService } from './mlcService';

// ============================================
// HEALTH CHECK TYPES
// ============================================

export interface PublishingHealthReport {
    overallScore: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    timestamp: string;
    sections: {
        proRegistration: HealthSection;
        mlcRegistration: HealthSection;
        metadataQuality: HealthSection;
        splitDocumentation: HealthSection;
        revenueOptimization: HealthSection;
    };
    criticalIssues: HealthIssue[];
    warnings: HealthIssue[];
    opportunities: HealthOpportunity[];
    estimatedLostRevenue: number;
    actionPlan: ActionItem[];
}

export interface HealthSection {
    name: string;
    score: number;
    maxScore: number;
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    items: HealthCheckItem[];
}

export interface HealthCheckItem {
    id: string;
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'unknown';
    details: string;
    impact: 'high' | 'medium' | 'low';
    fixUrl?: string;
}

export interface HealthIssue {
    severity: 'critical' | 'warning';
    title: string;
    description: string;
    affectedWorks: string[];
    estimatedLoss: number;
    fixAction: string;
    fixUrl?: string;
}

export interface HealthOpportunity {
    title: string;
    description: string;
    potentialGain: number;
    effort: 'low' | 'medium' | 'high';
    action: string;
}

export interface ActionItem {
    priority: number;
    action: string;
    category: 'registration' | 'metadata' | 'revenue' | 'legal';
    deadline?: string;
    estimatedTime: string;
    url?: string;
}

// ============================================
// PUBLISHING HEALTH SERVICE
// ============================================

class PublishingHealthService {

    /**
     * Run comprehensive publishing health audit
     */
    async runHealthCheck(
        user: User,
        tracks: Track[],
        publishingInfo?: {
            proMembership?: { pro: string; memberId: string };
            mlcRegistered?: boolean;
            hasPublisher?: boolean;
            publisherName?: string;
        }
    ): Promise<PublishingHealthReport> {
        const sections = {
            proRegistration: await this.checkPRORegistration(user, tracks, publishingInfo?.proMembership),
            mlcRegistration: await this.checkMLCRegistration(user, tracks, publishingInfo?.mlcRegistered),
            metadataQuality: this.checkMetadataQuality(tracks),
            splitDocumentation: this.checkSplitDocumentation(tracks),
            revenueOptimization: this.checkRevenueOptimization(user, tracks, publishingInfo)
        };

        const criticalIssues: HealthIssue[] = [];
        const warnings: HealthIssue[] = [];
        const opportunities: HealthOpportunity[] = [];

        // Aggregate issues from all sections
        for (const section of Object.values(sections)) {
            for (const item of section.items) {
                if (item.status === 'fail' && item.impact === 'high') {
                    criticalIssues.push({
                        severity: 'critical',
                        title: item.name,
                        description: item.details,
                        affectedWorks: [],
                        estimatedLoss: this.estimateLoss(item.id, tracks),
                        fixAction: this.getFixAction(item.id),
                        fixUrl: item.fixUrl
                    });
                } else if (item.status === 'fail' || item.status === 'warning') {
                    warnings.push({
                        severity: 'warning',
                        title: item.name,
                        description: item.details,
                        affectedWorks: [],
                        estimatedLoss: this.estimateLoss(item.id, tracks) * 0.5,
                        fixAction: this.getFixAction(item.id),
                        fixUrl: item.fixUrl
                    });
                }
            }
        }

        // Calculate opportunities
        opportunities.push(...this.identifyOpportunities(user, tracks, sections));

        // Calculate overall score
        const totalScore = Object.values(sections).reduce((sum, s) => sum + s.score, 0);
        const maxScore = Object.values(sections).reduce((sum, s) => sum + s.maxScore, 0);
        const overallScore = Math.round((totalScore / maxScore) * 100);

        // Generate action plan
        const actionPlan = this.generateActionPlan(criticalIssues, warnings, opportunities);

        return {
            overallScore,
            grade: this.scoreToGrade(overallScore),
            timestamp: new Date().toISOString(),
            sections,
            criticalIssues,
            warnings,
            opportunities,
            estimatedLostRevenue: criticalIssues.reduce((sum, i) => sum + i.estimatedLoss, 0) +
                warnings.reduce((sum, w) => sum + w.estimatedLoss, 0),
            actionPlan
        };
    }

    /**
     * Check PRO registration status
     */
    private async checkPRORegistration(
        user: User,
        tracks: Track[],
        membership?: { pro: string; memberId: string }
    ): Promise<HealthSection> {
        const items: HealthCheckItem[] = [];
        let score = 0;
        const maxScore = 25;

        // Check if user has PRO membership
        if (membership?.pro && membership?.memberId) {
            items.push({
                id: 'pro_membership',
                name: 'PRO Membership',
                status: 'pass',
                details: `Registered with ${membership.pro.toUpperCase()} (ID: ${membership.memberId})`,
                impact: 'high'
            });
            score += 10;
        } else {
            items.push({
                id: 'pro_membership',
                name: 'PRO Membership',
                status: 'fail',
                details: 'No PRO membership detected. You are missing performance royalties from radio, TV, streaming, and live performances.',
                impact: 'high',
                fixUrl: 'https://www.ascap.com/help/career-development/Join-ASCAP'
            });
        }

        // Check if works are registered
        if (tracks.length > 0 && membership?.pro) {
            // Sample check a few tracks
            const sampleTracks = tracks.slice(0, 3);
            let registeredCount = 0;

            for (const track of sampleTracks) {
                try {
                    const verification = await proIntegrationService.verifyWorkRegistration(
                        track.title,
                        [user.displayName || 'Unknown'],
                        membership.pro
                    );
                    if (verification.isRegistered) {
                        registeredCount++;
                    }
                } catch (e) {
                    // Continue with other tracks
                }
            }

            const registrationRate = registeredCount / sampleTracks.length;
            if (registrationRate >= 0.8) {
                items.push({
                    id: 'works_registered',
                    name: 'Works Registration',
                    status: 'pass',
                    details: `${Math.round(registrationRate * 100)}% of sampled works are registered with your PRO`,
                    impact: 'high'
                });
                score += 10;
            } else if (registrationRate >= 0.5) {
                items.push({
                    id: 'works_registered',
                    name: 'Works Registration',
                    status: 'warning',
                    details: `Only ${Math.round(registrationRate * 100)}% of sampled works found in PRO database. Register all works.`,
                    impact: 'high'
                });
                score += 5;
            } else {
                items.push({
                    id: 'works_registered',
                    name: 'Works Registration',
                    status: 'fail',
                    details: 'Most works not found in PRO database. You may be missing performance royalties.',
                    impact: 'high'
                });
            }
        } else if (tracks.length > 0) {
            items.push({
                id: 'works_registered',
                name: 'Works Registration',
                status: 'unknown',
                details: 'Cannot verify work registration without PRO membership',
                impact: 'high'
            });
        }

        // Check for IPI number
        items.push({
            id: 'ipi_number',
            name: 'IPI Number',
            status: membership?.memberId ? 'pass' : 'warning',
            details: membership?.memberId
                ? 'IPI number available for consistent identification across databases'
                : 'Get your IPI number from your PRO for global identification',
            impact: 'medium'
        });
        if (membership?.memberId) score += 5;

        return {
            name: 'PRO Registration',
            score,
            maxScore,
            status: score >= 20 ? 'healthy' : score >= 10 ? 'warning' : 'critical',
            items
        };
    }

    /**
     * Check MLC registration for mechanical royalties
     */
    private async checkMLCRegistration(
        user: User,
        tracks: Track[],
        isRegistered?: boolean
    ): Promise<HealthSection> {
        const items: HealthCheckItem[] = [];
        let score = 0;
        const maxScore = 25;

        // Check MLC membership
        if (isRegistered) {
            items.push({
                id: 'mlc_membership',
                name: 'MLC Registration',
                status: 'pass',
                details: 'Registered with The MLC for US streaming mechanical royalties',
                impact: 'high'
            });
            score += 15;
        } else {
            items.push({
                id: 'mlc_membership',
                name: 'MLC Registration',
                status: 'fail',
                details: 'Not registered with The MLC. You are missing mechanical royalties from Spotify, Apple Music, etc.',
                impact: 'high',
                fixUrl: 'https://portal.themlc.com/register'
            });
        }

        // Check for unclaimed royalties
        if (tracks.length > 0 && user.displayName) {
            const searchResult = await mlcService.searchUnclaimedRoyalties(user.displayName, 'writer');
            items.push({
                id: 'unclaimed_check',
                name: 'Unclaimed Royalties Check',
                status: 'pass',
                details: `Search The MLC database for unclaimed royalties: ${searchResult.searchUrl}`,
                impact: 'medium',
                fixUrl: searchResult.searchUrl
            });
            score += 5;
        }

        // Check ISRC codes
        const tracksWithISRC = tracks.filter(t => t.isrc && /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(t.isrc));
        const isrcRate = tracks.length > 0 ? tracksWithISRC.length / tracks.length : 0;

        if (isrcRate >= 0.9) {
            items.push({
                id: 'isrc_codes',
                name: 'ISRC Codes',
                status: 'pass',
                details: `${Math.round(isrcRate * 100)}% of tracks have valid ISRC codes`,
                impact: 'medium'
            });
            score += 5;
        } else {
            items.push({
                id: 'isrc_codes',
                name: 'ISRC Codes',
                status: isrcRate >= 0.5 ? 'warning' : 'fail',
                details: `Only ${Math.round(isrcRate * 100)}% of tracks have valid ISRC codes. ISRCs are required for proper royalty matching.`,
                impact: 'medium'
            });
            if (isrcRate >= 0.5) score += 2;
        }

        return {
            name: 'MLC Registration',
            score,
            maxScore,
            status: score >= 20 ? 'healthy' : score >= 10 ? 'warning' : 'critical',
            items
        };
    }

    /**
     * Check metadata quality
     */
    private checkMetadataQuality(tracks: Track[]): HealthSection {
        const items: HealthCheckItem[] = [];
        let score = 0;
        const maxScore = 20;

        if (tracks.length === 0) {
            return {
                name: 'Metadata Quality',
                score: 0,
                maxScore,
                status: 'unknown',
                items: [{
                    id: 'no_tracks',
                    name: 'No Tracks',
                    status: 'unknown',
                    details: 'Upload tracks to analyze metadata quality',
                    impact: 'low'
                }]
            };
        }

        // Check for complete titles
        const completeTitles = tracks.filter(t => t.title && t.title.length > 2);
        const titleRate = completeTitles.length / tracks.length;
        items.push({
            id: 'titles',
            name: 'Track Titles',
            status: titleRate >= 0.95 ? 'pass' : 'warning',
            details: `${completeTitles.length}/${tracks.length} tracks have proper titles`,
            impact: 'medium'
        });
        score += titleRate * 5;

        // Check for genre tags
        const withGenre = tracks.filter(t => t.genre);
        const genreRate = withGenre.length / tracks.length;
        items.push({
            id: 'genres',
            name: 'Genre Tags',
            status: genreRate >= 0.8 ? 'pass' : genreRate >= 0.5 ? 'warning' : 'fail',
            details: `${withGenre.length}/${tracks.length} tracks have genre tags`,
            impact: 'medium'
        });
        score += genreRate * 5;

        // Check for mood tags
        const withMoods = tracks.filter(t => t.mood_tags && t.mood_tags.length > 0);
        const moodRate = withMoods.length / tracks.length;
        items.push({
            id: 'moods',
            name: 'Mood Tags',
            status: moodRate >= 0.8 ? 'pass' : moodRate >= 0.5 ? 'warning' : 'fail',
            details: `${withMoods.length}/${tracks.length} tracks have mood tags for sync matching`,
            impact: 'medium'
        });
        score += moodRate * 5;

        // Check for BPM data
        const withBPM = tracks.filter(t => t.bpm && t.bpm > 0);
        const bpmRate = withBPM.length / tracks.length;
        items.push({
            id: 'bpm',
            name: 'BPM Data',
            status: bpmRate >= 0.8 ? 'pass' : bpmRate >= 0.5 ? 'warning' : 'fail',
            details: `${withBPM.length}/${tracks.length} tracks have BPM data`,
            impact: 'low'
        });
        score += bpmRate * 5;

        return {
            name: 'Metadata Quality',
            score: Math.round(score),
            maxScore,
            status: score >= 16 ? 'healthy' : score >= 10 ? 'warning' : 'critical',
            items
        };
    }

    /**
     * Check split documentation
     */
    private checkSplitDocumentation(tracks: Track[]): HealthSection {
        const items: HealthCheckItem[] = [];
        let score = 0;
        const maxScore = 15;

        if (tracks.length === 0) {
            return {
                name: 'Split Documentation',
                score: 0,
                maxScore,
                status: 'unknown',
                items: [{
                    id: 'no_tracks',
                    name: 'No Tracks',
                    status: 'unknown',
                    details: 'Upload tracks to analyze split documentation',
                    impact: 'low'
                }]
            };
        }

        // Check if tracks have collaborators documented
        const withCollaborators = tracks.filter(t => t.collaborators && t.collaborators.length > 0);
        const collaboratorRate = withCollaborators.length / tracks.length;

        // For solo artists, this might be 0 which is fine
        items.push({
            id: 'collaborators',
            name: 'Collaborator Documentation',
            status: 'pass', // Can't fail this without knowing if they have collaborators
            details: `${withCollaborators.length}/${tracks.length} tracks have documented collaborators`,
            impact: 'high'
        });
        score += 5;

        // Check for split percentages
        const withSplits = tracks.filter(t =>
            t.collaborators &&
            t.collaborators.every(c => typeof c.share === 'number')
        );
        if (withCollaborators.length > 0) {
            const splitRate = withSplits.length / withCollaborators.length;
            items.push({
                id: 'splits',
                name: 'Split Percentages',
                status: splitRate >= 0.8 ? 'pass' : 'warning',
                details: splitRate >= 0.8
                    ? 'Split percentages documented for collaborative works'
                    : 'Some collaborative works missing split percentages',
                impact: 'high'
            });
            score += splitRate * 5;
        } else {
            items.push({
                id: 'splits',
                name: 'Split Percentages',
                status: 'pass',
                details: 'No collaborative works detected',
                impact: 'high'
            });
            score += 5;
        }

        // Recommendation for split agreements
        items.push({
            id: 'split_agreements',
            name: 'Split Agreements',
            status: 'warning',
            details: 'Always get split agreements in writing before release. Use services like Splitify or your distributor\'s split tools.',
            impact: 'high'
        });
        score += 5;

        return {
            name: 'Split Documentation',
            score,
            maxScore,
            status: score >= 12 ? 'healthy' : score >= 8 ? 'warning' : 'critical',
            items
        };
    }

    /**
     * Check revenue optimization opportunities
     */
    private checkRevenueOptimization(
        user: User,
        tracks: Track[],
        publishingInfo?: {
            hasPublisher?: boolean;
            publisherName?: string;
        }
    ): HealthSection {
        const items: HealthCheckItem[] = [];
        let score = 0;
        const maxScore = 15;

        // Check publishing situation
        if (publishingInfo?.hasPublisher) {
            items.push({
                id: 'publishing',
                name: 'Publishing Administration',
                status: 'pass',
                details: `Working with ${publishingInfo.publisherName || 'a publisher'} for administration`,
                impact: 'medium'
            });
            score += 5;
        } else {
            items.push({
                id: 'publishing',
                name: 'Publishing Administration',
                status: 'warning',
                details: 'Self-administering publishing. Consider a publishing admin deal to maximize international collection.',
                impact: 'medium'
            });
            score += 2;
        }

        // Check for sync potential
        const syncReadyTracks = tracks.filter(t =>
            t.mood_tags && t.mood_tags.length >= 2 &&
            t.genre &&
            t.bpm
        );
        const syncRate = tracks.length > 0 ? syncReadyTracks.length / tracks.length : 0;

        items.push({
            id: 'sync_ready',
            name: 'Sync Licensing Readiness',
            status: syncRate >= 0.7 ? 'pass' : syncRate >= 0.3 ? 'warning' : 'fail',
            details: `${syncReadyTracks.length}/${tracks.length} tracks have metadata needed for sync matching`,
            impact: 'medium'
        });
        score += syncRate * 5;

        // Check tier/plan
        const isPro = user.plan === 'pro' || user.plan === 'label';
        items.push({
            id: 'plan_tier',
            name: 'Account Tier',
            status: isPro ? 'pass' : 'warning',
            details: isPro
                ? 'Pro tier unlocks premium sync platforms like Musicbed ($100K+ payouts)'
                : 'Upgrade to Pro for access to premium sync opportunities',
            impact: 'low'
        });
        score += isPro ? 5 : 2;

        return {
            name: 'Revenue Optimization',
            score,
            maxScore,
            status: score >= 12 ? 'healthy' : score >= 8 ? 'warning' : 'critical',
            items
        };
    }

    /**
     * Identify revenue opportunities
     */
    private identifyOpportunities(
        user: User,
        tracks: Track[],
        sections: PublishingHealthReport['sections']
    ): HealthOpportunity[] {
        const opportunities: HealthOpportunity[] = [];

        // PRO opportunity
        if (sections.proRegistration.score < sections.proRegistration.maxScore * 0.8) {
            opportunities.push({
                title: 'Complete PRO Registration',
                description: 'Register all your works with your PRO to collect performance royalties from radio, TV, streaming, and live performances.',
                potentialGain: tracks.length * 50, // Rough estimate $50/track/year
                effort: 'medium',
                action: 'Register each song at your PRO\'s website'
            });
        }

        // MLC opportunity
        if (sections.mlcRegistration.score < sections.mlcRegistration.maxScore * 0.8) {
            opportunities.push({
                title: 'Register with The MLC',
                description: 'The MLC collects mechanical royalties from US streaming services. Free to join.',
                potentialGain: tracks.length * 25, // Rough estimate $25/track/year
                effort: 'low',
                action: 'Sign up at portal.themlc.com and register your works'
            });
        }

        // Sync opportunity
        const syncReadyCount = tracks.filter(t => t.mood_tags && t.mood_tags.length >= 2).length;
        if (syncReadyCount < tracks.length * 0.7) {
            opportunities.push({
                title: 'Improve Sync Metadata',
                description: 'Add mood tags and genre info to your tracks to get matched with sync opportunities.',
                potentialGain: 500, // Average sync placement
                effort: 'low',
                action: 'Add mood tags, genre, and BPM to each track'
            });
        }

        // International collection
        opportunities.push({
            title: 'International Royalty Collection',
            description: 'Register with international PROs or a publishing administrator to collect royalties from 100+ countries.',
            potentialGain: tracks.length * 30,
            effort: 'high',
            action: 'Consider services like Songtrust, CD Baby Pro, or a traditional publisher'
        });

        return opportunities;
    }

    /**
     * Estimate revenue loss from an issue
     */
    private estimateLoss(issueId: string, tracks: Track[]): number {
        const trackCount = tracks.length || 1;

        const lossEstimates: Record<string, number> = {
            'pro_membership': trackCount * 100, // $100/track/year in performance royalties
            'works_registered': trackCount * 50, // Partial loss
            'mlc_membership': trackCount * 40, // $40/track/year in mechanicals
            'isrc_codes': trackCount * 20, // Matching issues
            'titles': trackCount * 10,
            'genres': trackCount * 5,
            'moods': trackCount * 15, // Sync matching impact
            'splits': trackCount * 25, // Potential disputes
        };

        return lossEstimates[issueId] || 0;
    }

    /**
     * Get fix action for an issue
     */
    private getFixAction(issueId: string): string {
        const actions: Record<string, string> = {
            'pro_membership': 'Join ASCAP, BMI, or SESAC',
            'works_registered': 'Register each song in your PRO\'s repertory database',
            'mlc_membership': 'Sign up free at portal.themlc.com',
            'isrc_codes': 'Request ISRCs from your distributor or register at usisrc.org',
            'titles': 'Add proper titles to all tracks',
            'genres': 'Tag each track with its primary genre',
            'moods': 'Add mood tags for sync matching',
            'bpm': 'Detect and add BPM data',
            'splits': 'Document split percentages for all collaborators'
        };

        return actions[issueId] || 'Review and fix this issue';
    }

    /**
     * Generate prioritized action plan
     */
    private generateActionPlan(
        criticalIssues: HealthIssue[],
        warnings: HealthIssue[],
        opportunities: HealthOpportunity[]
    ): ActionItem[] {
        const actions: ActionItem[] = [];
        let priority = 1;

        // Critical issues first
        for (const issue of criticalIssues) {
            actions.push({
                priority: priority++,
                action: issue.fixAction,
                category: this.categorizeAction(issue.title),
                estimatedTime: '15-30 minutes',
                url: issue.fixUrl
            });
        }

        // Warnings next
        for (const warning of warnings) {
            actions.push({
                priority: priority++,
                action: warning.fixAction,
                category: this.categorizeAction(warning.title),
                estimatedTime: '10-20 minutes',
                url: warning.fixUrl
            });
        }

        // Low-effort opportunities
        for (const opp of opportunities.filter(o => o.effort === 'low')) {
            actions.push({
                priority: priority++,
                action: opp.action,
                category: 'revenue',
                estimatedTime: '10-15 minutes'
            });
        }

        return actions;
    }

    /**
     * Categorize action by type
     */
    private categorizeAction(title: string): 'registration' | 'metadata' | 'revenue' | 'legal' {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('registration') || titleLower.includes('mlc') || titleLower.includes('pro')) {
            return 'registration';
        }
        if (titleLower.includes('metadata') || titleLower.includes('tag') || titleLower.includes('isrc')) {
            return 'metadata';
        }
        if (titleLower.includes('split') || titleLower.includes('agreement')) {
            return 'legal';
        }
        return 'revenue';
    }

    /**
     * Convert score to letter grade
     */
    private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
}

export const publishingHealthService = new PublishingHealthService();
export default publishingHealthService;
