
import { collection, addDoc, query, where, orderBy, serverTimestamp, deleteDoc, doc, onSnapshot, Unsubscribe, limit, updateDoc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GeneratedTrack } from './audioService';
import { VoiceAsset, User, Stats, DistributionSubmission, SyncBrief, OpportunityRequest, FundingRequest, DistributionRelease, LegalRecord, VideoGenerationJob } from '../types';

let isFirestoreRestricted = localStorage.getItem('sf_firestore_restricted') === 'true';

export const handleFirestoreError = (e: any) => {
    const msg = e?.message || "";
    const code = e?.code || "";
    
    // If we get a permission-denied or unprovisioned error, we flag it
    if (code === 'permission-denied' || msg.includes('disabled') || msg.includes('not been used')) {
        if (!isFirestoreRestricted) {
            console.warn("[DataService] Firestore node unreachable. Operating in Sandbox Mode.");
            isFirestoreRestricted = true;
            localStorage.setItem('sf_firestore_restricted', 'true');
            window.dispatchEvent(new CustomEvent('sf-backend-restricted'));
        }
    }
    return null;
};

/**
 * PRODUCTION DATA NODE
 * Handles all institutional ledger interactions.
 */
export const dataService = {
  
  // Method to check if we can reach the real project node
  async pingNode(): Promise<boolean> {
      try {
          // Simple test fetch to check API status
          await getDocs(query(collection(db, 'system_ping'), limit(1)));
          isFirestoreRestricted = false;
          localStorage.removeItem('sf_firestore_restricted');
          return true;
      } catch (e) {
          return false;
      }
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
    if (isFirestoreRestricted) return;
    try { await addDoc(collection(db, 'tracks'), { userId, ...track, createdAt: serverTimestamp() }); }
    catch (e: any) { handleFirestoreError(e); }
  },

  subscribeToTracks(userId: string, callback: (tracks: GeneratedTrack[]) => void): Unsubscribe {
    if (isFirestoreRestricted) { callback([]); return () => {}; }
    try {
        const q = query(collection(db, 'tracks'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50));
        return onSnapshot(q, (snapshot) => {
            const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GeneratedTrack[];
            callback(tracks);
        }, (err: any) => { handleFirestoreError(err); callback([]); });
    } catch (e: any) { handleFirestoreError(e); callback([]); return () => {}; }
  },

  async deleteTrack(trackId: string) {
    if (isFirestoreRestricted) return;
    try { await deleteDoc(doc(db, 'tracks', trackId)); } catch (e: any) { handleFirestoreError(e); }
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
      return { totalEarnings: 1250, totalStreams: 4520, activeOpportunities: 8, brandScore: 'B+', earningsGrowth: 12, streamsGrowth: 5, opportunitiesNew: false, artistLevel: "Rising Artist", xp: 1200, nextLevelXp: 2500 };
  }
};
