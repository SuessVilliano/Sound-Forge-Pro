

import { VoiceDetection, VoiceAsset } from "../types";

// --- MOCK DATA ---
const MOCK_DETECTIONS: VoiceDetection[] = [
    {
        id: 'det_1',
        source_url: 'https://youtube.com/watch?v=xyz123',
        timestamp: '2025-04-10T14:30:00Z',
        similarity_score: 98.5,
        is_authorized: false,
        status: 'takedown_sent',
        snippet_url: 'https://example.com/audio_snippet_1.mp3',
        platform: 'YouTube'
    },
    {
        id: 'det_2',
        source_url: 'https://tiktok.com/@user/video/99999',
        timestamp: '2025-04-12T09:15:00Z',
        similarity_score: 89.2,
        is_authorized: true,
        status: 'resolved',
        snippet_url: 'https://example.com/audio_snippet_2.mp3',
        platform: 'TikTok'
    }
];

/* Updated return type to use VoiceAsset instead of deprecated VoiceNFT */
export const registerVoice = async (file: File): Promise<{ success: boolean, nft?: VoiceAsset }> => {
    // 1. Analyze Audio (Biometric Fingerprinting)
    console.log("Analyzing audio biometrics...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Generate Hashes
    const fingerprintHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // 3. Mint NFT (Simulation of calling the Node.js scripts)
    // In a real app, this would POST to /api/mint-voice
    console.log(`Minting NFT on Solana with fingerprint: ${fingerprintHash}`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        success: true,
        nft: {
            token_id: "SOL-" + Math.floor(Math.random() * 10000).toString(),
            voice_id: "v-" + Math.floor(Math.random() * 10000).toString(),
            contract_address: "7Xw...9zB", // Solana address format
            fingerprint_hash: fingerprintHash,
            mint_date: new Date().toLocaleDateString(),
            transaction_hash: "5Kj...9xP" + Math.floor(Math.random() * 1000),
            status: 'active',
            network: 'Solana', // Defaulting to Solana as requested
            is_marketplace_enabled: false
        }
    };
};

export const scanForClones = async (): Promise<VoiceDetection[]> => {
    // Simulate web crawling and matching
    await new Promise(resolve => setTimeout(resolve, 3000));
    return MOCK_DETECTIONS;
};

export const issueTakedown = async (detectionId: string): Promise<boolean> => {
    // Simulate DMCA API call
    console.log(`Issuing takedown for detection ${detectionId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
};
