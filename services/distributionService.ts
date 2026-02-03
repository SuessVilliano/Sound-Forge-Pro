/**
 * SOUND FORGE PRO - DISTRIBUTION SERVICE
 * Handles music distribution with DistroKid-compatible export format.
 * Seamlessly prepares releases for submission to DSPs.
 */

import { DistributionSubmission, DistributionTrack, Track, User } from '../types';
import { dataService } from './dataService';

// DistroKid field mapping
const DISTROKID_FIELDS = {
    releaseType: ['Single', 'EP', 'Album'],
    primaryGenres: [
        'Alternative', 'Ambient', 'Blues', 'Children\'s Music', 'Classical',
        'Country', 'Dance', 'Electronic', 'Folk', 'Hip-Hop/Rap', 'Holiday',
        'Indie', 'Jazz', 'Latin', 'Metal', 'New Age', 'Pop', 'R&B/Soul',
        'Reggae', 'Rock', 'Soundtrack', 'World'
    ],
    languages: [
        'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
        'Japanese', 'Korean', 'Chinese', 'Hindi', 'Arabic', 'Instrumental'
    ],
    platforms: [
        'Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'TikTok',
        'Instagram/Facebook', 'Deezer', 'Tidal', 'Pandora', 'SoundCloud',
        'iHeartRadio', 'Napster', 'Audiomack'
    ]
};

// ISRC Generator (for demo - real ones come from registrar)
const generateDemoISRC = (): string => {
    const countryCode = 'US';
    const registrantCode = 'SFP'; // Sound Forge Pro
    const year = new Date().getFullYear().toString().slice(-2);
    const designation = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${countryCode}-${registrantCode}-${year}-${designation}`;
};

// UPC Generator (for demo)
const generateDemoUPC = (): string => {
    const prefix = '195'; // Demo prefix
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return prefix + random.slice(0, 9);
};

export interface DistroKidExport {
    // Release metadata
    releaseTitle: string;
    releaseType: 'Single' | 'EP' | 'Album';
    artistName: string;
    primaryGenre: string;
    secondaryGenre?: string;
    releaseDate: string;
    recordLabel: string;
    upcCode: string;
    copyrightYear: number;
    copyrightHolder: string;
    productionYear: number;

    // Track data (for each track)
    tracks: {
        trackNumber: number;
        trackTitle: string;
        isrcCode: string;
        duration: string;
        isExplicit: boolean;
        isInstrumental: boolean;
        language: string;
        primaryArtist: string;
        featuredArtists: string[];
        writers: string[];
        producers: string[];
        audioFileName: string;
    }[];

    // Cover art
    coverArtFileName: string;
    coverArtDimensions: string;

    // Distribution settings
    platforms: string[];
    preSaveEnabled: boolean;
    contentIdEnabled: boolean;
    instantGratificationTrack?: number;
}

export const distributionService = {
    /**
     * Generate DistroKid-compatible export data
     */
    generateDistroKidExport(
        submission: DistributionSubmission,
        user: User
    ): DistroKidExport {
        const currentYear = new Date().getFullYear();

        return {
            // Release metadata
            releaseTitle: submission.title,
            releaseType: submission.tracks.length === 1 ? 'Single' : submission.tracks.length <= 6 ? 'EP' : 'Album',
            artistName: submission.artistName,
            primaryGenre: submission.primaryGenre,
            releaseDate: submission.releaseDate,
            recordLabel: submission.recordLabel || 'Independent',
            upcCode: submission.upcCode || generateDemoUPC(),
            copyrightYear: currentYear,
            copyrightHolder: submission.artistName,
            productionYear: currentYear,

            // Track data
            tracks: submission.tracks.map((track, index) => ({
                trackNumber: index + 1,
                trackTitle: track.title,
                isrcCode: track.isrc || generateDemoISRC(),
                duration: '3:30', // Would come from actual audio file
                isExplicit: track.isExplicit || false,
                isInstrumental: track.isInstrumental || false,
                language: 'English',
                primaryArtist: submission.artistName,
                featuredArtists: track.contributors?.filter(c => c.role === 'Featured Artist').map(c => c.name) || [],
                writers: track.contributors?.filter(c => c.role === 'Songwriter').map(c => c.name) || [submission.artistName],
                producers: track.contributors?.filter(c => c.role === 'Producer').map(c => c.name) || [],
                audioFileName: `${track.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`
            })),

            // Cover art
            coverArtFileName: 'cover_art.jpg',
            coverArtDimensions: '3000x3000',

            // Distribution settings
            platforms: DISTROKID_FIELDS.platforms,
            preSaveEnabled: true,
            contentIdEnabled: true,
            instantGratificationTrack: submission.tracks.length > 1 ? 1 : undefined
        };
    },

    /**
     * Generate CSV for DistroKid bulk upload
     */
    generateDistroKidCSV(export_data: DistroKidExport): string {
        const headers = [
            'Release Title',
            'Artist Name',
            'Release Type',
            'Primary Genre',
            'Release Date',
            'Record Label',
            'UPC',
            'Copyright Year',
            'Track Number',
            'Track Title',
            'ISRC',
            'Explicit',
            'Instrumental',
            'Writers',
            'Producers'
        ];

        const rows = export_data.tracks.map(track => [
            export_data.releaseTitle,
            export_data.artistName,
            export_data.releaseType,
            export_data.primaryGenre,
            export_data.releaseDate,
            export_data.recordLabel,
            export_data.upcCode,
            export_data.copyrightYear,
            track.trackNumber,
            track.trackTitle,
            track.isrcCode,
            track.isExplicit ? 'Yes' : 'No',
            track.isInstrumental ? 'Yes' : 'No',
            track.writers.join('; '),
            track.producers.join('; ')
        ].map(val => `"${val}"`).join(','));

        return [headers.join(','), ...rows].join('\n');
    },

    /**
     * Generate JSON export for API integrations
     */
    generateJSONExport(export_data: DistroKidExport): string {
        return JSON.stringify(export_data, null, 2);
    },

    /**
     * Copy-paste friendly text format
     */
    generateTextFormat(export_data: DistroKidExport): string {
        const lines: string[] = [
            '═══════════════════════════════════════════════════════════',
            '  SOUND FORGE PRO - DISTROKID SUBMISSION DATA',
            '═══════════════════════════════════════════════════════════',
            '',
            '▸ RELEASE INFORMATION',
            `  Title: ${export_data.releaseTitle}`,
            `  Artist: ${export_data.artistName}`,
            `  Type: ${export_data.releaseType}`,
            `  Genre: ${export_data.primaryGenre}`,
            `  Release Date: ${export_data.releaseDate}`,
            `  Label: ${export_data.recordLabel}`,
            `  UPC: ${export_data.upcCode}`,
            '',
            '▸ TRACK LISTING',
        ];

        export_data.tracks.forEach(track => {
            lines.push(`  ${track.trackNumber}. ${track.trackTitle}`);
            lines.push(`     ISRC: ${track.isrcCode}`);
            lines.push(`     Duration: ${track.duration}`);
            lines.push(`     Explicit: ${track.isExplicit ? 'Yes' : 'No'}`);
            lines.push(`     Instrumental: ${track.isInstrumental ? 'Yes' : 'No'}`);
            if (track.writers.length > 0) {
                lines.push(`     Writers: ${track.writers.join(', ')}`);
            }
            if (track.producers.length > 0) {
                lines.push(`     Producers: ${track.producers.join(', ')}`);
            }
            lines.push('');
        });

        lines.push('▸ COVER ART REQUIREMENTS');
        lines.push('  Dimensions: 3000x3000 pixels');
        lines.push('  Format: JPG or PNG');
        lines.push('  File size: Under 36MB');
        lines.push('');
        lines.push('▸ PLATFORMS');
        lines.push(`  ${export_data.platforms.join(', ')}`);
        lines.push('');
        lines.push('═══════════════════════════════════════════════════════════');
        lines.push('  Copy this data to DistroKid submission form');
        lines.push('═══════════════════════════════════════════════════════════');

        return lines.join('\n');
    },

    /**
     * Download distribution data as file
     */
    downloadExport(export_data: DistroKidExport, format: 'csv' | 'json' | 'txt'): void {
        let content: string;
        let mimeType: string;
        let filename: string;

        switch (format) {
            case 'csv':
                content = this.generateDistroKidCSV(export_data);
                mimeType = 'text/csv';
                filename = `${export_data.releaseTitle.replace(/[^a-z0-9]/gi, '_')}_distrokid.csv`;
                break;
            case 'json':
                content = this.generateJSONExport(export_data);
                mimeType = 'application/json';
                filename = `${export_data.releaseTitle.replace(/[^a-z0-9]/gi, '_')}_distrokid.json`;
                break;
            case 'txt':
            default:
                content = this.generateTextFormat(export_data);
                mimeType = 'text/plain';
                filename = `${export_data.releaseTitle.replace(/[^a-z0-9]/gi, '_')}_distrokid.txt`;
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(export_data: DistroKidExport): Promise<boolean> {
        try {
            const text = this.generateTextFormat(export_data);
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('[DistributionService] Copy failed:', error);
            return false;
        }
    },

    /**
     * Save distribution submission to Firestore
     */
    async saveSubmission(userId: string, submission: DistributionSubmission): Promise<string> {
        try {
            return await dataService.saveDistribution(userId, submission);
        } catch (error) {
            console.error('[DistributionService] Save failed:', error);
            throw error;
        }
    },

    /**
     * Get user's distribution history
     */
    async getHistory(userId: string): Promise<DistributionSubmission[]> {
        try {
            return await dataService.getDistributions(userId);
        } catch (error) {
            console.error('[DistributionService] Get history failed:', error);
            return [];
        }
    },

    /**
     * Get available genres
     */
    getGenres(): string[] {
        return DISTROKID_FIELDS.primaryGenres;
    },

    /**
     * Get available platforms
     */
    getPlatforms(): string[] {
        return DISTROKID_FIELDS.platforms;
    },

    /**
     * Get available languages
     */
    getLanguages(): string[] {
        return DISTROKID_FIELDS.languages;
    }
};

export default distributionService;
