
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { FIREBASE_CONFIG, isConfigured } from './config';

/**
 * PRODUCTION FIREBASE INITIALIZATION
 * Sound Forge Pro - Configuration loaded from environment
 */
const firebaseConfig = {
  apiKey: FIREBASE_CONFIG.apiKey || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: FIREBASE_CONFIG.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_CONFIG.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_CONFIG.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_CONFIG.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_CONFIG.appId || import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: FIREBASE_CONFIG.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
if (!isConfigured.firebase()) {
  console.warn('[Firebase] Configuration incomplete. Running in demo mode. Set VITE_FIREBASE_* env vars for production.');
}

const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("[Firebase] Analytics disabled (likely ad-blocker).");
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
