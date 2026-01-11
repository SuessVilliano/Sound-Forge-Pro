
export type BriefSource = "Songtradr" | "DittoSync" | "Horus" | "EmailFeed" | "UserSubmitted" | "PartnerAPI";
export type MediaType = "TV" | "Film" | "Ad" | "Game" | "Trailer" | "Brand" | "Other";
export type CommunicationChannel = 'sms' | 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'gmb';

export interface Contributor {
    id: string;
    name: string;
    role: 'Songwriter' | 'Producer' | 'Featured Artist' | 'Remixer' | 'Mixer' | 'Mastering Engineer' | 'Composer';
    share?: number; 
}

export interface GHLIntegration {
    userId: string;
    ghlLocationId: string;
    ghlContactId?: string;
    status: 'provisioning' | 'active' | 'error' | 'disconnected';
    lastError?: string;
    connectedChannels: CommunicationChannel[];
    createdAt: string;
    updatedAt: string;
}

export interface MessageThread {
    id: string;
    userId: string;
    channel: CommunicationChannel;
    contactId: string;
    contactName: string;
    contactPhoto?: string;
    externalThreadId: string; 
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

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string; 
  photoURL: string;
  identityAssets?: string[]; 
  plan: 'free' | 'pro' | 'label';
  voiceShieldEnabled: boolean;
  resemble_voice_uuid?: string;
  walletBalance: number;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  tourCompleted?: boolean; 
  role?: 'artist' | 'producer' | 'manager' | 'label_exec' | 'listener';
  primaryGoal?: 'sync_deal' | 'growth' | 'distribution' | 'legal_protection';
  experienceLevel?: 'beginner' | 'intermediate' | 'pro';
  genrePreferences?: string[];
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
    tiktok?: string;
    linkedin?: string;
  };
  ghlIntegration?: GHLIntegration;
  xp?: number;
  artistLevel?: string;
  isFeatured?: boolean;
  bio?: string;
  chartmetricArtistId?: number;
  webhooks?: {
    url: string;
    enabled: boolean;
    events: string[];
  };
  rates?: {
    featureVerse?: number;
  };
  hasSignedLegal?: boolean;
  legalSignedDate?: string;
  profileConfig?: any;
  tourDates?: TourDate[];
  referenceVideoLinks?: string[];
  referenceWebsites?: string[];
}

export interface SyncBrief {
  id: string;
  source: BriefSource;
  title: string;
  description: string;
  mediaType: MediaType;
  deadline?: string;
  budget?: { min?: number, max?: number, currency?: string };
  requiredGenres?: string[];
  moods?: string[];
  tempo?: string;
  vocal?: "Instrumental" | "Vocal" | "Either";
  createdAt: string;
  readinessScore?: number; 
  references?: string[];
  deliverables?: string[];
  usage?: string[];
  territory?: string[];
  rightsRequired?: { master: boolean; publishing: boolean };
}

export interface OpportunityRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  briefId: string;
  briefTitle: string;
  type: string;
  notes: string;
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
  };
  pitchChecklist?: {
    technical: string[];
    legal: string[];
  };
}

export interface Opportunity {
  id: string;
  source_platform: string;
  brief_title: string;
  description: string;
  usage_type: string;
  payout_max: number;
  deadline_datetime: string;
  match_score?: number;
  mood_tags: string[];
  duration_required?: number;
  payout_min: number;
  submission_status?: string;
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
  licenseType?: string;
  status?: string;
  type?: string;
  createdAt?: string;
  genre?: string;
  recordLabel?: string;
  isrc?: string;
  upc?: string;
  isExplicit?: boolean;
  isInstrumental?: boolean;
  contributors?: Contributor[];
  blockchainRegistration?: {
      cid: string; 
      timestamp: string;
      network: 'Solana' | 'Filecoin';
      status: 'secured';
  };
}

export interface DistributionSubmission {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    title: string;
    artistName: string;
    releaseDate: string;
    recordLabel: string;
    primaryGenre: string;
    status: 'draft' | 'submitted' | 'processing' | 'delivered' | 'live' | 'rejected';
    tracks: DistributionTrack[];
    coverUrl?: string;
    createdAt: string;
    isrcCodes?: string[];
    upcCode?: string;
    metadata: any;
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

export interface StudioSuggestion {
  id: string;
  agentId: 'beat' | 'melody' | 'engineer';
  type: 'beat' | 'vocal' | 'fx';
  title: string;
  description: string;
  promptAddon: string;
  timestamp: string;
}

export interface StudioAgent {
  id: string;
  name: string;
  role: 'beat' | 'melody' | 'engineer';
  avatar: string;
  status: 'analyzing' | 'idle' | 'suggesting';
}

export interface FundingRequest {
    id: string;
    userId: string;
    artistName: string;
    totalNetRoyaltiesLast6Months: number;
    ownsMastersPercent: number;
    revenueStability: string;
    calculatedOfferLow: number;
    calculatedOfferHigh: number;
    status: string;
    createdAt: string;
    userEmail?: string;
    userName?: string;
    contactPhone?: string;
    country?: string;
    primaryDistributor?: string;
    hasPublishingSplits?: boolean;
    catalogNotes?: string;
    requestedAmount?: number;
    consentToShareData?: boolean;
    stageName?: string;
}

export interface TourDate {
  id?: string;
  date: string;
  venue: string;
  city: string;
  status: string;
  ticketLink?: string;
}

export interface VoiceDetection {
    id: string;
    similarity_score: number;
    status: string;
    platform: string;
    source_url?: string;
    timestamp?: string;
    is_authorized?: boolean;
    snippet_url?: string;
}

export interface VoiceAsset {
  token_id: string;
  contract_address: string;
  fingerprint_hash: string;
  mint_date: string;
  transaction_hash: string;
  status: 'active' | 'revoked';
  network: 'Solana';
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
  audioFile?: File;
  contributors?: Contributor[];
  isRadioEdit?: boolean;
  writerType?: string;
  songwriters?: string[];
  producers?: string;
  performers?: string;
  originalArtist?: string;
  isrc?: string;
}

export interface DistributionRelease {
  id: string;
  title: string;
  artistName: string;
  releaseDate: string;
  tracks: DistributionTrack[]; 
  coverUrl?: string;
  albumCover?: File;
  recordLabel?: string;
  copyrightYear?: string;
  copyrightOwner?: string;
  pLineYear?: string;
  pLineOwner?: string;
  language?: string;
  primaryGenre?: string;
  services?: string[];
  previouslyReleased?: boolean;
  optSocialPack?: boolean;
  optDiscoveryPack?: boolean;
  optStoreMaximizer?: boolean;
  optLeaveLegacy?: boolean;
  optLoudnessNorm?: boolean;
  optBlockchainStorage?: boolean;
}

export interface LegalRecord {
  id: string;
  userId: string;
  signature: string;
  timestamp: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  payload: any;
  destination?: string;
  responseCode?: number;
}

export interface CRMContact {
    id: string;
    name: string;
    email: string;
    tags: string[];
    source: string;
    lastActive: string;
    status: string;
}

export interface CRMAutomaton {
    id: string;
    name: string;
    status: string;
}

export interface CRMCampaign {
    id: string;
    name: string;
    status: string;
}

export interface KitsVoiceModel {
  id: string;
  label: string;
  tags: string[];
  image?: string;
}

export interface StemResult {
  vocalsUrl?: string;
  instrumentalUrl?: string;
  bassUrl?: string;
  drumsUrl?: string;
  otherUrl?: string;
}

export interface VoiceLicense {
  id: string;
  licensee: string;
  project_name: string;
  usage_type: string;
  price: number;
  expiry: string;
  status: string;
  terms_hash?: string;
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

export interface SocialPost {
    id: string;
    userId: string;
    caption: string;
    mediaUrls?: string[];
    scheduledAt: string;
    networks: string[];
    status: 'pending' | 'posted' | 'failed';
}
