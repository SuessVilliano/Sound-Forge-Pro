
export interface Opportunity {
  id: string;
  source_platform: 'songtradr' | 'google_search' | 'artlist' | 'internal';
  brief_title: string;
  description: string;
  usage_type: 'Ad' | 'TV' | 'Film' | 'Game';
  duration_required: number;
  payout_min: number;
  payout_max: number;
  deadline_datetime: string; // ISO string
  submission_status: 'open' | 'matched' | 'submitted' | 'accepted';
  match_score?: number;
  risk_score?: number;
  recommended_action?: 'auto_submit' | 'manual_review' | 'create';
  mood_tags: string[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  mood_tags: string[];
  duration: string;
  plays: number;
  earnings: number;
  image: string;
  audioUrl?: string; // For player
  licenseType?: 'exclusive' | 'non-exclusive' | 'sync-ready';
  hasVocals?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  creator: string;
  coverImage: string;
  tracks: Track[];
  type: 'curated' | 'user' | 'album';
}

export interface Course {
  id: string;
  title: string;
  category: 'Production' | 'Business' | 'Marketing';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  progress: number; // 0-100
  price: number;
  image: string; // Icon name or image url
}

export interface Stats {
  totalEarnings: number;
  totalStreams: number;
  activeOpportunities: number;
  brandScore: string;
  earningsGrowth: number;
  streamsGrowth: number;
  opportunitiesNew: boolean;
  artistLevel: string; // e.g. "Rookie", "Rising Artist"
  xp: number; // e.g. 1250
  nextLevelXp: number; // e.g. 2000
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  plan: 'free' | 'pro' | 'label';
  voiceShieldEnabled: boolean;
  walletBalance: number;
}

export interface VoiceDetection {
  id: string;
  source_url: string;
  timestamp: string;
  similarity_score: number;
  is_authorized: boolean;
  status: 'pending' | 'takedown_sent' | 'resolved' | 'ignored';
  snippet_url?: string;
  platform: 'YouTube' | 'TikTok' | 'Spotify' | 'Instagram';
}

export interface VoiceNFT {
  token_id: string;
  contract_address: string;
  fingerprint_hash: string;
  mint_date: string;
  transaction_hash: string;
  status: 'active' | 'revoked';
  network: 'Polygon' | 'Ethereum' | 'Solana';
  image_url?: string;
}

export interface VoiceLicense {
  id: string;
  licensee: string;
  project_name: string;
  usage_type: 'Commercial' | 'Non-Commercial' | 'Exclusive';
  price: number;
  expiry: string;
  status: 'active' | 'expired' | 'revoked';
  terms_hash: string;
}

export interface ExportConfig {
  format: 'mp3' | 'wav' | 'stems';
  sampleRate: '44.1' | '48' | '96';
  publishToSoundForge: boolean;
  distributeIndependent: boolean;
  protection: {
    watermark: boolean;
    blockchainMint: boolean;
    network: 'Solana' | 'Polygon';
  };
}