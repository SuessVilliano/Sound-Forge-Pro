
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
  status?: string;
  createdAt?: string;
  genre?: string; // Added for catalog filtering
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
  phoneNumber?: string; // Added for CRM
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

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'SOL';
  image: string;
  type: 'digital' | 'physical';
  stock: number;
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

export interface DistributionTrack {
  id: string;
  title: string;
  version?: string; // e.g. Remix, Radio Edit
  audioFile?: File | null;
  isInstrumental: boolean;
  isExplicit: boolean;
  isRadioEdit: boolean;
  writerType: 'original' | 'cover';
  songwriters: string[]; // Comma separated for UI
  featuring?: string;
  isrc?: string;
}

export interface DistributionRelease {
  title: string; // Release Title
  artistName: string;
  releaseDate: string;
  recordLabel: string;
  albumCover?: File | null;
  coverUrl?: string; // Preview URL
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
  services: string[];
  previouslyReleased: boolean;
  
  // Copyright Info
  copyrightYear: string;
  copyrightOwner: string;
  pLineYear: string;
  pLineOwner: string;
  upc?: string;

  // Tracks (Array for Single or Album)
  tracks: DistributionTrack[];
  
  // Extras
  optSocialPack: boolean; // $4.95/yr
  optDiscoveryPack: boolean; // $0.99/yr per song
  optStoreMaximizer: boolean; // $7.95/yr
  optLeaveLegacy: boolean; // $29 (single) or $49 (album)
  optLoudnessNorm: boolean; // $2.99 per song
}

// --- KITS.AI Types ---
export interface KitsVoiceModel {
  id: string;
  label: string;
  tags: string[];
  image?: string;
  isCustom?: boolean;
}

export interface KitsJobStatus {
  jobId: string;
  status: 'running' | 'success' | 'failed';
  outputUrl?: string;
}

export interface StemResult {
  vocalsUrl?: string;
  instrumentalUrl?: string;
  drumsUrl?: string;
  bassUrl?: string;
  otherUrl?: string;
}

// --- DAO Types ---
export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'Feature' | 'Monetization' | 'Royalty Split' | 'Platform';
  status: 'active' | 'passed' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  deadline: string;
  author: string;
  userVoted?: 'for' | 'against';
}

// --- BATTLE Types ---
export interface BattleParticipant {
  id: string;
  artistName: string;
  isAi: boolean;
  trackTitle: string;
  audioUrl: string;
  image: string;
  votes: number;
  creativityScore?: number;
  soundScore?: number;
}

export interface BattleRulesConfig {
  maxDurationSeconds: number;
  format: 'AI Only' | 'Human Only' | 'Hybrid' | 'Cover' | 'Beat' | 'DJ';
  votingWindow: 'Live' | '24h';
  maxEntries: number;
  entryFee?: number;
  rewards: {
    xp: number;
    cash?: number;
    badge?: string;
    placement?: boolean;
  };
  customRules: string[];
}

export interface Battle {
  id: string;
  title: string;
  description: string;
  type: BattleRulesConfig['format']; // Derived from config
  genre: string;
  status: 'Live' | 'Voting' | 'Ended' | 'Upcoming';
  endTime: string; // ISO
  participants: BattleParticipant[]; 
  totalVotes: number;
  listeners: number;
  config: BattleRulesConfig; // The Rules Engine Data
}

// --- Global Window Extension ---
declare global {
  interface Window {
    affiliateId?: string;
  }
}
