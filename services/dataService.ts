
import { collection, addDoc, query, where, orderBy, serverTimestamp, deleteDoc, doc, onSnapshot, Unsubscribe, limit, updateDoc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GeneratedTrack } from './audioService';
import { VoiceAsset, User, Stats, DistributionSubmission, SyncBrief, OpportunityRequest, FundingRequest, DistributionRelease, LegalRecord, VideoGenerationJob } from '../types';
import { isConfigured } from './config';

// Track Firestore availability
let isFirestoreRestricted = localStorage.getItem('sf_firestore_restricted') === 'true';
let connectionRetryCount = 0;
const MAX_RETRIES = 3;

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
    return isConfigured.firebase();
};

export const handleFirestoreError = (e: any) => {
    const msg = e?.message || "";
    const code = e?.code || "";

    // If we get a permission-denied or unprovisioned error, we flag it
    if (code === 'permission-denied' || msg.includes('disabled') || msg.includes('not been used')) {
        if (!isFirestoreRestricted) {
            console.warn("[DataService] Firestore unavailable. Operating in local storage mode.");
            isFirestoreRestricted = true;
            localStorage.setItem('sf_firestore_restricted', 'true');
            window.dispatchEvent(new CustomEvent('sf-backend-restricted'));
        }
    }
    return null;
};

// Helper to retry operations with exponential backoff
const withRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRIES
): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (e) {
            lastError = e;
            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
            }
        }
    }
    throw lastError;
};

// Local storage fallback helpers
const localStorageDB = {
    get: <T>(key: string): T[] => {
        try {
            const data = localStorage.getItem(`sf_local_${key}`);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },
    set: <T>(key: string, data: T[]): void => {
        try {
            localStorage.setItem(`sf_local_${key}`, JSON.stringify(data));
        } catch (e) {
            console.warn('[LocalDB] Storage full or unavailable');
        }
    },
    add: <T extends { id?: string }>(key: string, item: T): void => {
        const data = localStorageDB.get<T>(key);
        const newItem = { ...item, id: item.id || `local_${Date.now()}` };
        data.unshift(newItem);
        localStorageDB.set(key, data.slice(0, 100)); // Keep last 100 items
    },
    remove: (key: string, id: string): void => {
        const data = localStorageDB.get<any>(key);
        localStorageDB.set(key, data.filter((item: any) => item.id !== id));
    }
};

/**
 * SOUND FORGE PRO DATA SERVICE
 * Handles all data persistence with Firestore + local storage fallback.
 */
export const dataService = {

  // Check if running in local mode
  isLocalMode(): boolean {
      return isFirestoreRestricted || !isFirebaseConfigured();
  },

  // Method to check if we can reach Firestore
  async pingNode(): Promise<boolean> {
      if (!isFirebaseConfigured()) {
          console.warn('[DataService] Firebase not configured. Using local storage.');
          return false;
      }
      try {
          await withRetry(async () => {
              await getDocs(query(collection(db, 'system_ping'), limit(1)));
          });
          isFirestoreRestricted = false;
          localStorage.removeItem('sf_firestore_restricted');
          connectionRetryCount = 0;
          return true;
      } catch (e) {
          connectionRetryCount++;
          if (connectionRetryCount >= MAX_RETRIES) {
              isFirestoreRestricted = true;
              localStorage.setItem('sf_firestore_restricted', 'true');
          }
          return false;
      }
  },

  // Reset connection status to retry Firestore
  resetConnection(): void {
      isFirestoreRestricted = false;
      connectionRetryCount = 0;
      localStorage.removeItem('sf_firestore_restricted');
  },

  // --- USER MANAGEMENT ---
  async adminUpdateUser(uid: string, data: Partial<User>): Promise<void> {
      if (isFirestoreRestricted) return;
      try { await updateDoc(doc(db, 'users', uid), data); }
      catch (e: any) { handleFirestoreError(e); }
  },

  async getAllUsers(): Promise<User[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'users'));
          return snap.docs.map(d => d.data() as User);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  // --- CREDIT SYSTEM ---
  async deductCredits(userId: string, amount: number): Promise<boolean> {
      const userRef = doc(db, 'users', userId);
      try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) return false;
          const current = snap.data().credits || 0;
          if (current < amount) return false;
          
          await updateDoc(userRef, { credits: current - amount });
          return true;
      } catch (e) {
          console.error("Credit deduction failed", e);
          return false;
      }
  },

  // --- VIDEO LEDGER ---
  async saveVideoJob(userId: string, job: VideoGenerationJob): Promise<void> {
      if (isFirestoreRestricted) return;
      try {
          await setDoc(doc(db, 'video_jobs', job.id), { ...job, userId, updatedAt: serverTimestamp() });
      } catch (e: any) { handleFirestoreError(e); }
  },

  // --- DISTRIBUTION LEDGER ---
  async submitDistributionSubmission(submission: Partial<DistributionSubmission>): Promise<void> {
      if (!submission.userId) return;
      const id = submission.id || `dist_${Date.now()}`;
      const finalSubmission = {
          ...submission,
          id,
          status: 'submitted',
          createdAt: new Date().toISOString()
      };
      if (!isFirestoreRestricted) {
          try { await setDoc(doc(db, 'distribution_ledger', id), finalSubmission); }
          catch (e: any) { handleFirestoreError(e); }
      }
  },

  async getMyDistributionSubmissions(userId: string): Promise<DistributionSubmission[]> {
      if (isFirestoreRestricted) return [];
      try {
          const qry = query(collection(db, 'distribution_ledger'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
          const snap = await getDocs(qry);
          return snap.docs.map(d => d.data() as DistributionSubmission);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async getAllDistributionSubmissions(): Promise<DistributionSubmission[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'distribution_ledger'));
          return snap.docs.map(d => d.data() as DistributionSubmission);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async updateDistributionStatus(id: string, status: DistributionSubmission['status']): Promise<void> {
      if (!isFirestoreRestricted) {
          try { await updateDoc(doc(db, 'distribution_ledger', id), { status }); }
          catch (e: any) { handleFirestoreError(e); }
      }
  },

  async getAllReleases(): Promise<DistributionRelease[]> { return []; },

  async getAllSyncBriefs(): Promise<SyncBrief[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'sync_briefs'));
          return snap.docs.map(d => d.data() as SyncBrief);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async addSyncBrief(brief: SyncBrief): Promise<void> {
      if (isFirestoreRestricted) return;
      try { await setDoc(doc(db, 'sync_briefs', brief.id), brief); }
      catch (e: any) { handleFirestoreError(e); }
  },

  async getAllOpportunityRequests(): Promise<OpportunityRequest[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'opportunity_requests'));
          return snap.docs.map(d => d.data() as OpportunityRequest);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async submitOpportunityRequest(request: OpportunityRequest): Promise<void> {
      if (isFirestoreRestricted) return;
      try { await setDoc(doc(db, 'opportunity_requests', request.id), request); }
      catch (e: any) { handleFirestoreError(e); }
  },

  async getAllFundingRequests(): Promise<FundingRequest[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'funding_requests'));
          return snap.docs.map(d => d.data() as FundingRequest);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async submitFundingRequest(request: Partial<FundingRequest>): Promise<void> {
      if (isFirestoreRestricted) return;
      try { await addDoc(collection(db, 'funding_requests'), request); }
      catch (e: any) { handleFirestoreError(e); }
  },

  async getAllLegalRecords(): Promise<LegalRecord[]> { return []; },

  async saveVoiceRegistration(userId: string, asset: VoiceAsset): Promise<void> {
    if (isFirestoreRestricted) return;
    try {
        await addDoc(collection(db, 'voice_registrations'), {
            userId,
            ...asset,
            createdAt: serverTimestamp()
        });
    } catch (e: any) { handleFirestoreError(e); }
  },

  subscribeToVoiceRegistrations(userId: string, callback: (assets: VoiceAsset[]) => void): Unsubscribe {
      if (isFirestoreRestricted) { callback([]); return () => {}; }
      try {
          const q = query(collection(db, 'voice_registrations'), where('userId', '==', userId));
          return onSnapshot(q, (snap) => {
              callback(snap.docs.map(d => d.data() as VoiceAsset));
          }, (err: any) => { handleFirestoreError(err); callback([]); });
      } catch (e: any) { handleFirestoreError(e); callback([]); return () => {}; }
  },

  async updateVoiceAssetStatus(tokenId: string, status: VoiceAsset['status']): Promise<void> {
    console.log(`[Registry] Marking voice asset ${tokenId} as ${status}`);
  },

  subscribeToUserProfile(userId: string, callback: (user: User) => void): Unsubscribe {
      if (isFirestoreRestricted) return () => {};
      try {
        const userDocRef = doc(db, "users", userId);
        return onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) callback(docSnap.data() as User);
        }, (err: any) => handleFirestoreError(err));
      } catch (e: any) { handleFirestoreError(e); return () => {}; }
  },

  async adminCreateUser(userData: Partial<User>): Promise<void> {
      if (isFirestoreRestricted) return;
      try { 
          const finalData = { ...userData, credits: userData.credits || 15 }; 
          await setDoc(doc(db, 'users', userData.uid!), finalData); 
      }
      catch (e: any) { handleFirestoreError(e); }
  },

  async saveTrack(userId: string, track: GeneratedTrack) {
    const trackData = { userId, ...track, createdAt: new Date().toISOString() };

    // Always save to local storage as backup
    localStorageDB.add('tracks', trackData);

    if (isFirestoreRestricted || !isFirebaseConfigured()) return;

    try {
        await withRetry(async () => {
            await addDoc(collection(db, 'tracks'), { ...trackData, createdAt: serverTimestamp() });
        });
    } catch (e: any) {
        handleFirestoreError(e);
    }
  },

  subscribeToTracks(userId: string, callback: (tracks: GeneratedTrack[]) => void): Unsubscribe {
    // If in local mode, return local storage data
    if (isFirestoreRestricted || !isFirebaseConfigured()) {
        const localTracks = localStorageDB.get<GeneratedTrack>('tracks')
            .filter(t => (t as any).userId === userId);
        callback(localTracks);
        return () => {};
    }

    try {
        const q = query(collection(db, 'tracks'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50));
        return onSnapshot(q, (snapshot) => {
            const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GeneratedTrack[];
            // Sync to local storage
            localStorageDB.set('tracks', tracks);
            callback(tracks);
        }, (err: any) => {
            handleFirestoreError(err);
            // Fallback to local storage on error
            const localTracks = localStorageDB.get<GeneratedTrack>('tracks')
                .filter(t => (t as any).userId === userId);
            callback(localTracks);
        });
    } catch (e: any) {
        handleFirestoreError(e);
        const localTracks = localStorageDB.get<GeneratedTrack>('tracks')
            .filter(t => (t as any).userId === userId);
        callback(localTracks);
        return () => {};
    }
  },

  async deleteTrack(trackId: string) {
    // Remove from local storage
    localStorageDB.remove('tracks', trackId);

    if (isFirestoreRestricted || !isFirebaseConfigured()) return;

    try {
        await deleteDoc(doc(db, 'tracks', trackId));
    } catch (e: any) {
        handleFirestoreError(e);
    }
  },

  getCatalogPlays(): Record<string, number> {
      try {
          const saved = localStorage.getItem('sf_catalog_plays');
          return saved ? JSON.parse(saved) : {};
      } catch (e) { return {}; }
  },

  incrementPlayCount(trackId: string): void {
      const plays = this.getCatalogPlays();
      plays[trackId] = (plays[trackId] || 0) + 1;
      localStorage.setItem('sf_catalog_plays', JSON.stringify(plays));
  },

  async deleteUserAccount(userId: string): Promise<void> {
      if (isFirestoreRestricted) return;
      try { await deleteDoc(doc(db, 'users', userId)); } catch (e: any) { handleFirestoreError(e); }
  },

  async getRealStats(userId: string): Promise<Stats> {
      // Try to get real stats from Firestore
      if (!isFirestoreRestricted && isFirebaseConfigured()) {
          try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const xp = userData.xp || 0;

                  // Calculate artist level based on XP
                  let artistLevel = "New Artist";
                  let nextLevelXp = 500;
                  if (xp >= 5000) { artistLevel = "Legendary"; nextLevelXp = 10000; }
                  else if (xp >= 2500) { artistLevel = "Established"; nextLevelXp = 5000; }
                  else if (xp >= 1000) { artistLevel = "Rising Star"; nextLevelXp = 2500; }
                  else if (xp >= 500) { artistLevel = "Emerging Artist"; nextLevelXp = 1000; }

                  return {
                      totalEarnings: userData.totalEarnings || 0,
                      totalStreams: userData.totalStreams || 0,
                      activeOpportunities: userData.activeOpportunities || 0,
                      brandScore: userData.brandScore || 'C',
                      earningsGrowth: userData.earningsGrowth || 0,
                      streamsGrowth: userData.streamsGrowth || 0,
                      opportunitiesNew: userData.opportunitiesNew || false,
                      artistLevel,
                      xp,
                      nextLevelXp
                  };
              }
          } catch (e) {
              // Fall through to default stats
          }
      }

      // Default stats for new users or when offline
      const localTracks = localStorageDB.get<any>('tracks').filter(t => t.userId === userId);
      const xp = localTracks.length * 50; // 50 XP per track created

      return {
          totalEarnings: 0,
          totalStreams: localTracks.reduce((sum, t) => sum + (t.plays || 0), 0),
          activeOpportunities: 0,
          brandScore: 'C',
          earningsGrowth: 0,
          streamsGrowth: 0,
          opportunitiesNew: false,
          artistLevel: xp >= 500 ? "Emerging Artist" : "New Artist",
          xp,
          nextLevelXp: xp >= 500 ? 1000 : 500
      };
  }
};
};
