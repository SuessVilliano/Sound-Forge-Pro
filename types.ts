
export type BriefSource = "Songtradr" | "DittoSync" | "Horus" | "EmailFeed" | "UserSubmitted" | "PartnerAPI";
export type MediaType = "TV" | "Film" | "Ad" | "Game" | "Trailer" | "Brand" | "Other";
export type CommunicationChannel = 'sms' | 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'gmb';

export interface Contributor {
    id: string;
    name: string;
    role: 'Songwriter' | 'Producer' | 'Featured Artist' | 'Remixer' | 'Mixer' | 'Mastering Engineer' | 'Composer';
    share?: number; 
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string; 
  photoURL: string;
  identityAssets?: string[]; 
  plan: 'free' | 'pro' | 'label';
  credits: number; // For Kling AI video generation
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
  xp?: number;
  artistLevel?: string;
  isFeatured?: boolean;
  bio?: string;
  rates?: {
    featureVerse?: number;
  };
  ghlIntegration?: {
    ghlLocationId?: string;
  };
  webhooks?: {
    url?: string;
    enabled?: boolean;
    events?: string[];
  };
  chartmetricArtistId?: number;
  profileConfig?: any;
  hasSignedLegal?: boolean;
  legalSignedDate?: string;
  tourDates?: TourDate[];
  referenceVideoLinks?: string[];
}

export interface VideoGenerationJob {
    id: string;
    trackId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    videoUrl?: string;
    prompt: string;
    createdAt: string;
}

export interface SyncBrief {
  id: string;
  source: BriefSource;
  title: string;
  description: string;
  mediaType: MediaType;
  deadline?: string;
  budget?: { min?: number, max?: number, currency?: string };
  createdAt: string;
  readinessScore?: number; 
  requiredGenres?: string[];
  moods?: string[];
  tempo?: string;
  vocal?: string;
  references?: string[];
  deliverables?: string[];
  usage?: string[];
  territory?: string[];
  rightsRequired?: { master: boolean, publishing: boolean };
}

// Added BriefArtifacts interface to fix import errors in geminiService and OpportunitiesView
export interface BriefArtifacts {
  id: string;
  briefId: string;
  productionPromptPack: {
    arrangement: string;
    mood: string;
    tempo: string;
    genre: string;
    instruments: string[];
    keywordsInclude: string[];
  };
  pitchChecklist: {
    technical: string[];
    legal: string[];
  };
}

export interface DistributionTrack {
  id: string;
  asset_id: string; 
  title: string;
  isInstrumental: boolean;
  isExplicit: boolean;
  audioFile?: File;
  contributors?: Contributor[];
  isRadioEdit?: boolean;
  isrc?: string;
  p_line?: string; 
  c_line?: string; 
}

export interface DistributionSubmission {
    id: string;
    release_id: string; 
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
    proprietary_id?: string; 
    metadata: any;
}

export interface VoiceAsset {
  token_id: string;
  voice_id: string; 
  contract_address: string;
  fingerprint_hash: string;
  watermark_job_id?: string;
  mint_date: string;
  transaction_hash: string;
  status: 'active' | 'revoked' | 'inactive';
  network: 'Solana';
  is_marketplace_enabled: boolean;
  license_terms?: string;
}

export interface VoiceLicense {
  id: string;
  license_id: string;
  licensee: string;
  voice_id: string;
  project_name: string;
  usage_type: 'Personal' | 'Commercial' | 'Broadcast' | 'Non-Commercial';
  price: number;
  expiry: string;
  status: 'active' | 'expired' | 'revoked';
  terms_hash?: string;
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

export interface StaffMessage {
  id: string;
  agentId: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  proposal?: StaffProposal;
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

export interface TourDate {
  id?: string;
  date: string;
  venue: string;
  city: string;
  status: string;
  ticketLink?: string;
}

export interface StemResult {
  vocalsUrl?: string;
  instrumentalUrl?: string;
  bassUrl?: string;
  drumsUrl?: string;
  otherUrl?: string;
}

export interface KitsVoiceModel {
  id: string;
  label: string;
  tags: string[];
  image?: string;
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

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  payload: any;
  destination?: string;
  responseCode?: number;
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

export interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  videoUrl?: string;
  duration: string;
  plays: number;
  earnings: number;
  bpm?: number;
  key?: string;
  mood_tags?: string[];
  licenseType?: 'exclusive' | 'non-exclusive' | 'sync-ready';
  genre?: string;
  recordLabel?: string;
  isrc?: string;
  upc?: string;
  isExplicit?: boolean;
  isInstrumental?: boolean;
  contributors?: Contributor[];
  createdAt?: string;
  status?: string;
  type?: 'song' | 'vocal' | 'beat';
  blockchainRegistration?: {
    cid: string;
    network: 'Solana' | 'Filecoin';
    status: 'secured' | 'revoked' | 'inactive';
    timestamp: string;
  };
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

export interface BattleRulesConfig {
    maxDurationSeconds?: number;
    format?: string;
    votingWindow?: string;
    maxEntries?: number;
    rewards: { cash: number; xp: number; badge?: string };
    customRules: string[];
}

export interface Battle {
    id: string;
    title: string;
    description: string;
    type: 'Hybrid' | 'AI Only' | 'Human Only';
    genre: string;
    status: 'Live' | 'Voting' | 'Upcoming' | 'Ended';
    endTime: string;
    totalVotes: number;
    listeners: number;
    config: BattleRulesConfig;
    participants: BattleParticipant[];
}

export interface AiStaffMember {
  id: string;
  name: string;
  role: 'manager' | 'marketing' | 'distribution' | 'legal' | 'booking';
  avatar: string;
  online: boolean;
  description: string;
  lastMessage: string;
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

export interface MessageThread {
  id: string;
  userId: string;
  channel: CommunicationChannel;
  contactId: string;
  contactName: string;
  externalThreadId: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  status: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  direction: 'inbound' | 'outbound';
  body: string;
  provider: string;
  externalMessageId: string;
  timestamp: string;
  status: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  content: string;
  scheduledAt: string;
}

export interface OpportunityRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  briefId: string;
  briefTitle: string;
  type: 'I have a track to pitch' | 'I want to generate a track from this brief' | 'I need help clearing rights';
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface LegalRecord {
  id: string;
  userId: string;
  type: string;
  signedAt: string;
}

export interface FundingRequest {
  id?: string;
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
}

export interface VoiceDetection {
  id: string;
  source_url: string;
  timestamp: string;
  similarity_score: number;
  is_authorized: boolean;
  status: string;
  snippet_url: string;
  platform: string;
}

export interface DistributionRelease {
  id: string;
  title: string;
  status: string;
}
