
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
  audioUrl?: string; 
  videoUrl?: string; 
  licenseType?: 'exclusive' | 'non-exclusive' | 'sync-ready';
  hasVocals?: boolean;
  status?: 'generating' | 'completed' | 'failed' | 'processing';
  createdAt?: string;
  genre?: string; 
  type?: 'song' | 'vocal' | 'beat';
  stems?: { [key: string]: string };
  blockchainRegistration?: {
      cid: string; 
      transactionHash?: string;
      timestamp: string;
      network: 'Solana' | 'Polygon' | 'Filecoin';
      status: 'secured';
  };
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
  genrePreferences?: string[];
  notificationSettings?: {
      emailSyncMatches: boolean;
  };
  isFeatured?: boolean;
  bio?: string;
  location?: string;
  chartmetricArtistId?: number; 
  hasSignedLegal?: boolean;
  legalSignedDate?: string;
  webhooks?: {
      enabled: boolean;
      url: string;
      events: ('sale' | 'stream' | 'placement')[];
  };
  socialLinks?: {
      instagram?: string;
      twitter?: string;
      youtube?: string;
      website?: string;
      spotify?: string;
      appleMusic?: string;
      soundcloud?: string;
  };
  tourDates?: TourDate[];
  rates?: {
      voiceLicense?: number | string;
      featureVerse?: number | string;
  };
  profileConfig?: {
      theme: 'dark' | 'light' | 'cyber' | 'minimal';
      accentColor: string;
      fontStyle: 'sans' | 'serif' | 'mono';
      sections: {
          id: string;
          visible: boolean;
          order: number;
      }[];
  };
  mergeReputation?: {
      score: number;
      level: string;
      pendingTokens: number;
      multiplier: number;
  };
}

export interface AiStaffMember {
    id: string;
    name: string;
    role: 'manager' | 'marketing' | 'booking' | 'distribution' | 'legal';
    avatar: string;
    online: boolean;
    description: string;
    lastMessage?: string;
    lastActive?: string;
}

export interface StaffMessage {
    id: string;
    agentId: string;
    role: 'agent' | 'user';
    text: string;
    timestamp: string;
    isSystemAction?: boolean;
}

export interface Stats {
  totalEarnings: number;
  totalStreams: number;
  activeOpportunities: number;
  brandScore: string;
  earningsGrowth: number;
  streamsGrowth: number;
  opportunitiesNew: boolean;
  artistLevel: string; 
  xp: number; 
  nextLevelXp: number; 
}

export interface TourDate {
  id?: string;
  date: string;
  venue: string;
  city: string;
  status?: string;
  ticketLink?: string;
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

export interface VoiceAsset {
  token_id: string;
  contract_address: string;
  fingerprint_hash: string;
  mint_date: string;
  transaction_hash: string;
  status: 'active' | 'revoked';
  network: 'Polygon' | 'Ethereum' | 'Solana';
  image_url?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'SOL';
  image: string;
  type: 'digital' | 'physical' | 'asset_release'; 
  stock: number;
  assetAttributes?: { 
      royaltyShare: string; 
      includesVoiceModel: boolean;
      includesStems: boolean;
      editionSize: string; 
  };
}

export interface KitsVoiceModel {
  id: string;
  label: string;
  tags: string[];
  image?: string;
  isCustom?: boolean;
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

export interface Battle {
  id: string;
  title: string;
  description: string;
  type: 'AI Only' | 'Human Only' | 'Hybrid' | 'Cover' | 'Beat' | 'DJ'; 
  genre: string;
  status: 'Live' | 'Voting' | 'Ended' | 'Upcoming';
  endTime: string; 
  participants: BattleParticipant[]; 
  totalVotes: number;
  listeners: number;
  config: any; 
}

export interface DistributionTrack {
    id: string;
    title: string;
    isInstrumental: boolean;
    isExplicit: boolean;
    isRadioEdit: boolean;
    writerType: 'original' | 'cover';
    songwriters: string[];
    producers: string;
    performers: string;
    originalArtist?: string;
    audioFile?: File;
    version?: string;
    isrc?: string;
}

export interface DistributionRelease {
    id: string;
    title: string;
    artistName: string;
    releaseDate: string;
    recordLabel: string;
    copyrightYear: string;
    copyrightOwner: string;
    pLineYear: string;
    pLineOwner: string;
    language: string;
    primaryGenre: string;
    services: string[];
    previouslyReleased: boolean;
    tracks: DistributionTrack[];
    optSocialPack: boolean;
    optDiscoveryPack: boolean;
    optStoreMaximizer: boolean;
    optLeaveLegacy: boolean;
    optLoudnessNorm: boolean;
    optBlockchainStorage: boolean;
    albumCover?: File;
    coverUrl?: string;
    upc?: string;
    status?: string;
}

export interface CRMContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    tags: string[];
    source: string;
    lastActive: string;
    status: 'VIP' | 'Fan' | 'Lead' | 'Customer';
}

export interface CRMAutomaton {
    id: string;
    name: string;
    trigger: string;
    actions: string[];
    status: 'Active' | 'Draft';
    enrolledCount: number;
}

export interface CRMCampaign {
    id: string;
    name: string;
    type: 'Email' | 'SMS';
    status: 'Sent' | 'Scheduled' | 'Draft';
    sentCount: number;
    openRate: number;
    clickRate: number;
    date: string;
}

export interface VoiceLicense {
    id: string;
    licensee: string;
    project_name: string;
    usage_type: string;
    price: number;
    expiry: string;
    status: 'active' | 'expired';
    terms_hash: string;
}

export interface VoiceDetection {
    id: string;
    source_url: string;
    timestamp: string;
    similarity_score: number;
    is_authorized: boolean;
    status: 'takedown_sent' | 'pending_review' | 'resolved';
    snippet_url: string;
    platform: 'YouTube' | 'TikTok' | 'SoundCloud' | 'Spotify';
}

export interface BattleRulesConfig {
    maxDurationSeconds: number;
    format: 'AI Only' | 'Human Only' | 'Hybrid' | 'Cover' | 'Beat' | 'DJ';
    votingWindow: 'Live' | '24h' | 'Week';
    maxEntries: number;
    rewards: {
        xp: number;
        cash: number;
        badge: string;
    };
    customRules: string[];
}

declare global {
  interface Window {
    affiliateId?: string;
  }
}
