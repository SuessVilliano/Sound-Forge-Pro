
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
  audioUrl?: string; // For player (can be audio or video file)
  videoUrl?: string; // External video link (e.g. YouTube)
  licenseType?: 'exclusive' | 'non-exclusive' | 'sync-ready';
  hasVocals?: boolean;
  status?: string;
  createdAt?: string;
  genre?: string; 
  blockchainRegistration?: {
      cid: string; 
      transactionHash?: string;
      timestamp: string;
      network: 'Solana' | 'Polygon' | 'Filecoin';
      status: 'secured';
  };
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

export interface TourDate {
  id?: string;
  date: string;
  venue: string;
  city: string;
  status?: string;
  ticketLink?: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string; 
  photoURL: string;
  plan: 'free' | 'pro' | 'label';
  voiceShieldEnabled: boolean;
  walletBalance: number;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  role?: 'artist' | 'producer' | 'manager' | 'label_exec' | 'listener';
  experienceLevel?: 'beginner' | 'intermediate' | 'pro';
  primaryGoals?: string[];
  genrePreferences?: string[]; // Added: For sync matching
  notificationSettings?: {
      emailSyncMatches: boolean;
  }; // Added: For automated alerts
  isFeatured?: boolean;
  bio?: string;
  location?: string;
  chartmetricArtistId?: number; 
  hasSignedLegal?: boolean; // New: Tracks if service agreement is signed
  legalSignedDate?: string; // New: Date of signature
  rates?: {
      voiceLicense: number;
      featureVerse: number;
      beatLease?: number;
      mixMaster?: number;
  };
  socialLinks?: {
      instagram?: string;
      twitter?: string;
      youtube?: string;
      website?: string;
      spotify?: string;
      appleMusic?: string; // Added
      soundcloud?: string; // Added
  };
  tourDates?: TourDate[];
  webhooks?: {
      enabled: boolean;
      url: string;
      events: ('sale' | 'stream' | 'placement')[];
  };
}

export interface LegalRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  documentType: string;
  documentVersion: string;
  signature: string;
  timestamp: string;
  ipAddress?: string;
  status: 'signed' | 'revoked';
}

export interface WebhookLog {
    id: string;
    timestamp: string;
    event: string;
    status: 'success' | 'failed' | 'pending';
    payload: any;
    responseCode?: number;
    destination: string;
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
  type: 'digital' | 'physical' | 'nft_drop';
  stock: number;
  nftAttributes?: {
      royaltyShare: string; 
      includesVoiceModel: boolean;
      includesStems: boolean;
      editionSize: string; 
  };
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
  version?: string; 
  audioFile?: File | null;
  isInstrumental: boolean;
  isExplicit: boolean;
  isRadioEdit: boolean;
  writerType: 'original' | 'cover';
  songwriters: string[]; 
  featuring?: string;
  isrc?: string;
  producers?: string;
  performers?: string;
  originalArtist?: string; 
}

export interface DistributionRelease {
  id?: string;
  title: string; 
  artistName: string;
  releaseDate: string;
  recordLabel: string;
  albumCover?: File | null;
  coverUrl?: string; 
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
  services: string[];
  previouslyReleased: boolean;
  status?: string;
  submittedAt?: any;
  copyrightYear: string;
  copyrightOwner: string;
  pLineYear: string;
  pLineOwner: string;
  upc?: string;
  tracks: DistributionTrack[];
  optSocialPack: boolean; 
  optDiscoveryPack: boolean; 
  optStoreMaximizer: boolean; 
  optLeaveLegacy: boolean; 
  optLoudnessNorm: boolean; 
  optBlockchainStorage: boolean; 
}

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
  type: BattleRulesConfig['format']; 
  genre: string;
  status: 'Live' | 'Voting' | 'Ended' | 'Upcoming';
  endTime: string; 
  participants: BattleParticipant[]; 
  totalVotes: number;
  listeners: number;
  config: BattleRulesConfig; 
}

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  source: string;
  lastActive: string;
  status: 'Lead' | 'Fan' | 'Customer' | 'VIP';
}

export interface CRMAutomaton {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'Active' | 'Draft' | 'Paused';
  enrolledCount: number;
}

export interface CRMCampaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'DM';
  status: 'Sent' | 'Scheduled' | 'Draft';
  sentCount: number;
  openRate: number;
  clickRate: number;
  date: string;
}

declare global {
  // Fix: Extended Window interface correctly with capital W
  interface Window {
    affiliateId?: string;
  }
}
