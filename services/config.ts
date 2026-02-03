/**
 * SOUND FORGE PRO - CENTRALIZED CONFIGURATION
 * All environment variables and API keys are managed here.
 * Never hardcode credentials in other files.
 */

// Helper to get env vars (works with Vite's import.meta.env)
const getEnv = (key: string, fallback: string = ''): string => {
  // Check Vite env first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    if (import.meta.env[viteKey]) return import.meta.env[viteKey];
  }
  // Check process.env (Node.js/SSR)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key]!;
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`]!;
  }
  return fallback;
};

// ============================================
// AI SERVICES
// ============================================
export const AI_CONFIG = {
  GEMINI_API_KEY: getEnv('GEMINI_API_KEY'),

  // Music Generation Engines
  UDIO_API_KEY: getEnv('UDIO_API_KEY'),
  SUNO_API_KEY: getEnv('SUNO_API_KEY'),
  MUSICGPT_API_KEY: getEnv('MUSICGPT_API_KEY'),
  MUREKA_API_KEY: getEnv('MUREKA_API_KEY'),
  AIMUSIC_API_KEY: getEnv('AIMUSIC_API_KEY'),

  // Video & Audio
  KLING_ACCESS_KEY: getEnv('KLING_ACCESS_KEY'),
  KLING_SECRET_KEY: getEnv('KLING_SECRET_KEY'),
  KITS_API_KEY: getEnv('KITS_API_KEY'),
  RESEMBLE_API_KEY: getEnv('RESEMBLE_API_KEY'),
};

// ============================================
// FIREBASE
// ============================================
export const FIREBASE_CONFIG = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID'),
};

// ============================================
// BLOCKCHAIN
// ============================================
export const BLOCKCHAIN_CONFIG = {
  ALCHEMY_API_KEY: getEnv('ALCHEMY_API_KEY'),
  ALCHEMY_GAS_POLICY_ID: getEnv('ALCHEMY_GAS_POLICY_ID'),

  // Computed URLs
  get SOLANA_RPC_URL() {
    return this.ALCHEMY_API_KEY
      ? `https://solana-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`
      : 'https://api.mainnet-beta.solana.com';
  },
  get POLYGON_RPC_URL() {
    return this.ALCHEMY_API_KEY
      ? `https://polygon-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`
      : 'https://polygon-rpc.com';
  }
};

// ============================================
// PAYMENTS
// ============================================
export const PAYMENT_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: getEnv('STRIPE_PUBLISHABLE_KEY'),
  // Note: STRIPE_SECRET_KEY should only be used on backend
};

// ============================================
// ANALYTICS & INTEGRATIONS
// ============================================
export const INTEGRATION_CONFIG = {
  CHARTMETRIC_API_KEY: getEnv('CHARTMETRIC_API_KEY'),
  CHARTMETRIC_REFRESH_TOKEN: getEnv('CHARTMETRIC_REFRESH_TOKEN'),
  LIGHTHOUSE_API_KEY: getEnv('LIGHTHOUSE_API_KEY'),
  PUSHLAP_API_KEY: getEnv('PUSHLAP_API_KEY'),
  WEBHOOK_URL: getEnv('WEBHOOK_URL'),
};

// ============================================
// VALIDATION HELPERS
// ============================================
export const isConfigured = {
  gemini: () => !!AI_CONFIG.GEMINI_API_KEY,
  firebase: () => !!FIREBASE_CONFIG.apiKey && !!FIREBASE_CONFIG.projectId,
  alchemy: () => !!BLOCKCHAIN_CONFIG.ALCHEMY_API_KEY,
  stripe: () => !!PAYMENT_CONFIG.STRIPE_PUBLISHABLE_KEY,
  kling: () => !!AI_CONFIG.KLING_ACCESS_KEY && !!AI_CONFIG.KLING_SECRET_KEY,
  kits: () => !!AI_CONFIG.KITS_API_KEY,

  // Music engines
  udio: () => !!AI_CONFIG.UDIO_API_KEY,
  suno: () => !!AI_CONFIG.SUNO_API_KEY,
  musicgpt: () => !!AI_CONFIG.MUSICGPT_API_KEY,
  mureka: () => !!AI_CONFIG.MUREKA_API_KEY,
  aimusic: () => !!AI_CONFIG.AIMUSIC_API_KEY,
  anyMusicEngine: () => isConfigured.udio() || isConfigured.suno() || isConfigured.musicgpt() || isConfigured.mureka() || isConfigured.aimusic(),
};

// ============================================
// CREDIT COSTS (for AI features)
// ============================================
export const CREDIT_COSTS = {
  MUSIC_GENERATION: 5,
  VIDEO_GENERATION: 10,
  STEM_SEPARATION: 3,
  VOICE_CONVERSION: 5,
  AI_MASTERING: 2,
  BRAND_IMAGE: 3,
  BRAND_VIDEO: 15,
};

// ============================================
// PRICING TIERS
// ============================================
export interface PricingTier {
  id: 'free' | 'pro' | 'label';
  name: string;
  price: number;
  credits: number;
  features: string[];
  royaltyShare: number; // percentage artist keeps
  stripePriceId?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Artist',
    price: 0,
    credits: 50, // Monthly credits
    royaltyShare: 80,
    features: [
      '50 AI credits/month',
      '80% royalty share',
      'Global distribution',
      'Basic analytics',
      'AI Staff access',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Artist Pro',
    price: 19,
    credits: 500, // Monthly credits
    royaltyShare: 100,
    stripePriceId: getEnv('STRIPE_PRO_PRICE_ID'),
    features: [
      '500 AI credits/month',
      '100% royalty share',
      'Priority distribution',
      'Advanced analytics',
      'VoiceShield protection',
      'Sync licensing access',
      'Priority support',
      'Custom branding',
    ],
  },
  {
    id: 'label',
    name: 'Label',
    price: 99,
    credits: 2500, // Monthly credits
    royaltyShare: 100,
    stripePriceId: getEnv('STRIPE_LABEL_PRICE_ID'),
    features: [
      '2,500 AI credits/month',
      '100% royalty share',
      'Manage up to 10 artists',
      'White-label distribution',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced A&R tools',
    ],
  },
];

// ============================================
// CREDIT PACKAGES (one-time purchases)
// ============================================
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number; // bonus percentage
  stripePriceId?: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9,
    bonus: 0,
  },
  {
    id: 'creator',
    name: 'Creator Pack',
    credits: 300,
    price: 24,
    bonus: 10,
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 750,
    price: 49,
    bonus: 25,
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    credits: 2000,
    price: 99,
    bonus: 50,
  },
];

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Music Generation
  UDIO: {
    GENERATE: 'https://api.udio.com/v1/generate',
    STATUS: 'https://api.udio.com/v1/status/',
  },
  SUNO: {
    GENERATE: 'https://api.suno.ai/v1/generate',
    STATUS: 'https://api.suno.ai/v1/status/',
  },
  MUSICGPT: {
    GENERATE: 'https://api.musicgpt.ai/v1/create',
  },
  MUREKA: {
    GENERATE: 'https://api.mureka.ai/v1/compose',
    POLL: 'https://api.mureka.ai/v1/jobs/',
  },
  AIMUSIC: {
    GENERATE: 'https://api.aimusic.io/v1/create',
  },

  // Audio Processing
  KITS: {
    BASE: 'https://arpeggi.io/api/kits/v1',
    VOICE_MODELS: '/voice-models',
    VOICE_CONVERSIONS: '/voice-conversions',
    VOCAL_SEPARATIONS: '/vocal-separations',
  },

  // Kling Video
  KLING: {
    BASE: 'https://api.kling.ai/v1',
    TEXT_TO_VIDEO: '/text-to-video',
    IMAGE_TO_VIDEO: '/image-to-video',
    LIP_SYNC: '/lip-sync',
  },
};

export default {
  AI_CONFIG,
  FIREBASE_CONFIG,
  BLOCKCHAIN_CONFIG,
  PAYMENT_CONFIG,
  INTEGRATION_CONFIG,
  isConfigured,
  CREDIT_COSTS,
  PRICING_TIERS,
  CREDIT_PACKAGES,
  API_ENDPOINTS,
};
