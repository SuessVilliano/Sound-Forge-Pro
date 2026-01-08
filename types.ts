
export type BriefSource = "Songtradr" | "DittoSync" | "Horus" | "EmailFeed" | "UserSubmitted" | "PartnerAPI";
export type MediaType = "TV" | "Film" | "Ad" | "Game" | "Trailer" | "Brand" | "Other";

// --- GHL HEADLESS TYPES ---
export interface GHLIntegration {
    userId: string;
    ghlLocationId: string;
    ghlContactId?: string;
    status: 'provisioning' | 'active' | 'error' | 'disconnected';
    lastError?: string;
    connectedChannels: ('sms' | 'whatsapp' | 'email' | 'voice')[];
    createdAt: string;
    updatedAt: string;
}

export interface MessageThread {
    id: string;
    userId: string;
    channel: 'sms' | 'whatsapp' | 'email' | 'voice';
    contactId: string;
    contactName: string;
    contactPhoto?: string;
    externalThreadId: string; // GHL Conversation ID
    lastMessageText: string;
    lastMessageAt: string;
    unreadCount: number;
    status: 'open' | 'closed';
}

export interface ChatMessage {
    id: string;
    threadId: string;
    direction: 'inbound' | 'outbound';
    body: string;
    attachments?: string[];
    provider: 'ghl';
    externalMessageId: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface SocialAccount {
    id: string;
    network: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
    name: string;
    handle: string;
    avatar?: string;
    isConnected: boolean;
}

export interface SocialPost {
    id: string;
    userId: string;
    ghlPostId?: string;
    networks: string[];
    caption: string;
    mediaUrls: string[];
    scheduledAt: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    errorMessage?: string;
    createdAt: string;
}

// ... existing types remain
export interface SyncBrief {
  id: string;
  source: BriefSource;
  sourceUrl?: string;
  title: string;
  description: string;
  mediaType: MediaType;
  deadline?: string;
  budget?: { min?: number, max?: number, currency?: string };
  requiredGenres?: string[];
  moods?: string[];
  tempo?: string;
  vocal?: "Instrumental" | "Vocal" | "Either";
  references?: string[];
  deliverables?: string[];
  territory?: string[];
  usage?: string[];
  rightsRequired?: { master: boolean, publishing: boolean };
  createdAt: string;
  readinessScore?: number; // Calculated field
}

export interface OpportunityRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  briefId: string;
  briefTitle: string;
  type: "I have a track to pitch" | "I want to generate a track from this brief" | "I need help clearing rights";
  notes: string;
  trackLinks?: string[];
  status: 'pending' | 'reviewed' | 'forwarded' | 'contacted';
  createdAt: string;
}

export interface BriefArtifacts {
  id: string;
  briefId: string;
  productionPromptPack?: {
    mood: string;
    genre: string;
    tempo: string;
    instruments: string[];
    arrangement: string;
    keywordsInclude: string[];
    keywordsAvoid: string[];
    deliverables: string[];
  };
  pitchChecklist?: {
    technical: string[];
    legal: string[];
    submission: string[];
  };
}

export interface Opportunity {
  id: string;
  source_platform: 'songtradr' | 'google_search' | 'artlist' | 'internal';
  brief_title: string;
  description: string;
  usage_type: 'Ad' | 'TV' | 'Film' | 'Game';
  duration_required: number;
  payout_min: number;
  payout_max: number;
  deadline_datetime: string;
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
  resemble_voice_uuid?: string; 
  blockchainRegistration?: {
      cid: string; 
      transactionHash?: string;
      timestamp: string;
      network: 'Solana' | 'Polygon' | 'Filecoin';
      status: 'secured';
  };
}

export interface StaffProposal {
    id: string;
    agentId: string;
    type: 'opportunity' | 'warning' | 'strategy';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionLabel: string;
    timestamp: string;
}

export interface FundingRequest {
    id: string;
    createdAt: string;
    userId: string;
    userEmail: string;
    userName: string;
    artistName: string;
    stageName?: string;
    contactPhone: string;
    country: string;
    primaryDistributor: string;
    totalNetRoyaltiesLast6Months: number;
    ownsMastersPercent: number;
    revenueStability: 'Stable' | 'Mixed' | 'Volatile';
    hasPublishingSplits: boolean;
    catalogNotes: string;
    requestedAmount?: number;
    consentToShareData: boolean;
    avgMonthlyRoyalties: number;
    calculatedOfferLow: number;
    calculatedOfferHigh: number;
    status: 'new' | 'reviewing' | 'forwarded' | 'needs-info' | 'approved-partner' | 'declined';
    adminNotes?: string;
    forwardedAt?: string;
    forwardedToPartner?: string;
    webhookDelivery: {
        attemptedAt?: string;
        success: boolean;
        responseCode?: number;
        responseBody?: string;
        errorMessage?: string;
    };
}

export interface TourDate {
  id?: string;
  date: string;
  venue: string;
  city: string;
  status: string;
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
  resemble_voice_uuid?: string;
  walletBalance: number;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  role?: 'artist' | 'producer' | 'manager' | 'label_exec' | 'listener';
  primaryGoal?: 'sync_deal' | 'growth' | 'distribution' | 'legal_protection';
  experienceLevel?: 'beginner' | 'intermediate' | 'pro';
  primaryGoals?: string[];
  genrePreferences?: string[];
  isFeatured?: boolean;
  bio?: string;
  location?: string;
  notificationSettings?: {
    emailSyncMatches: boolean;
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
  profileConfig?: any;
  rates?: {
    featureVerse?: number;
  };
  chartmetricArtistId?: number;
  webhooks?: {
    url: string;
    enabled: boolean;
    events: string[];
  };
  hasSignedLegal?: boolean;
  legalSignedDate?: string;
  ghlIntegration?: GHLIntegration;
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
    resemble_detection_score?: number; 
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
  resemble_voice_uuid?: string;
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

export interface BattleParticipant {
  id: string;
  artistName: string;
  isAi: boolean;
  trackTitle: string;
  audioUrl: string;
  image: string;
  votes: number;
  is_verified_clone?: boolean; 
}

export interface Battle {
  id: string;
  title: string;
  description: string;
  type: 'AI Only' | 'Human Only' | 'Hybrid'; 
  genre: string;
  status: 'Live' | 'Voting' | 'Ended' | 'Upcoming';
  endTime: string; 
  participants: BattleParticipant[]; 
  totalVotes: number;
  listeners: number;
  config: any; 
}

export interface AiStaffMember {
  id: string;
  name: string;
  role: 'manager' | 'marketing' | 'booking' | 'distribution' | 'legal';
  avatar: string;
  online: boolean;
  description: string;
  lastMessage: string;
}

export interface StaffMessage {
  id: string;
  agentId: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  proposal?: StaffProposal;
}

export interface DistributionTrack {
  id: string;
  title: string;
  isInstrumental: boolean;
  isExplicit: boolean;
  isRadioEdit: boolean;
  writerType: string;
  songwriters: string[];
  producers: string;
  performers: string;
  originalArtist: string;
  audioFile?: File;
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
  status?: string;
  upc?: string;
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
  status: 'signed' | 'pending';
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  payload: any;
  destination: string;
  responseCode?: number;
}

export interface CRMContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    tags: string[];
    source: string;
    lastActive: string;
    status: string;
}

export interface CRMAutomaton {
    id: string;
    name: string;
    trigger: string;
    actions: string[];
    status: string;
    enrolledCount: number;
}

export interface CRMCampaign {
    id: string;
    name: string;
    type: string;
    status: string;
    sentCount: number;
    openRate: number;
    clickRate: number;
    date: string;
}

export interface KitsVoiceModel {
  id: string;
  label: string;
  tags: string[];
  image?: string;
  isCustom: boolean;
}

export interface StemResult {
  vocalsUrl: string;
  instrumentalUrl: string;
  bassUrl: string;
}

export interface VoiceLicense {
  id: string;
  licensee: string;
  project_name: string;
  usage_type: string;
  price: number;
  expiry: string;
  status: string;
  terms_hash: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  type: string;
  stock: number;
  assetAttributes?: {
    royaltyShare?: string;
    includesVoiceModel?: boolean;
    includesStems?: boolean;
    editionSize?: string;
  };
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'passed' | 'failed';
  votesFor: number;
  votesAgainst: number;
  deadline: string;
  author: string;
  userVoted?: 'for' | 'against';
}

export interface BattleRulesConfig {
  maxDurationSeconds: number;
  format: string;
  votingWindow: string;
  maxEntries: number;
  rewards: {
    xp: number;
    cash: number;
    badge: string;
  };
  customRules: string[];
}
