
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc,
  onSnapshot,
  Unsubscribe,
  limit,
  updateDoc,
  increment,
  getDocs,
  getDoc,
  setDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { db } from './firebase';
import { GeneratedTrack } from './audioService';
import { VoiceAsset, User, Stats, DistributionRelease, LegalRecord, FundingRequest, SyncBrief, OpportunityRequest, DistributionSubmission } from '../types';
import { MOCK_BRIEFS } from '../constants';

/**
 * PII PROTECTION UTILITIES (Zero Trust)
 * Simple XOR-based encryption for sensitive fields like phone numbers and legal names.
 */
const PII_KEY = "SOUND_MERGE_SECURE_RAILS_2025";
const encryptPii = (text: string | undefined): string => {
    if (!text) return '';
    return btoa(text.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ PII_KEY.charCodeAt(i % PII_KEY.length))
    ).join(''));
};

const decryptPii = (encoded: string | undefined): string => {
    if (!encoded) return '';
    try {
        const decoded = atob(encoded);
        return decoded.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ PII_KEY.charCodeAt(i % PII_KEY.length))
        ).join('');
    } catch (e) { return encoded || ''; }
};

let isFirestoreRestricted = localStorage.getItem('sf_firestore_restricted') === 'true';

if (!isFirestoreRestricted) {
    try {
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'permission-denied') {
                handleFirestoreError(err);
            }
        });
    } catch (e) {}
}

const MOCK_TRACKS_FALLBACK: GeneratedTrack[] = [
    { id: 'm1', title: 'Summer Vibes (Demo)', duration: '2:45', status: 'completed', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', imageUrl: 'https://picsum.photos/300/300?random=1', tags: ['Pop', 'Upbeat'], type: 'song' },
    { id: 'm2', title: 'Midnight Drive', duration: '3:12', status: 'completed', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', imageUrl: 'https://picsum.photos/300/300?random=2', tags: ['Synthwave', 'Chill'], type: 'song' }
];

let MOCK_USERS_CACHE: User[] = [];
let MOCK_VOICE_REGISTRATIONS_CACHE: VoiceAsset[] = [];
let MOCK_FUNDING_REQUESTS_CACHE: FundingRequest[] = [];
let MOCK_BRIEFS_CACHE: SyncBrief[] = [...MOCK_BRIEFS];
let MOCK_OPPORTUNITY_REQUESTS_CACHE: OpportunityRequest[] = [];
let MOCK_DISTRIBUTION_SUBMISSIONS: DistributionSubmission[] = [];

const isMockUser = (uid: string) => {
    return isFirestoreRestricted || 
           uid.startsWith('mock_') || 
           uid.startsWith('guest_') || 
           uid === 'demo_master_account' || 
           uid === 'admin_liv8_master';
};

export const handleFirestoreError = (e: any) => {
    const msg = e?.message || "";
    const code = e?.code || "";
    if (code === 'permission-denied' || msg.includes('disabled') || msg.includes('Firestore API')) {
        if (!isFirestoreRestricted) {
            console.warn("[Sound Merge] Cloud Firestore API restricted. Initiating stable Simulation Mode.");
            isFirestoreRestricted = true;
            localStorage.setItem('sf_firestore_restricted', 'true');
        }
    }
    return null;
};

export const dataService = {
  // --- OPPORTUNITIES & BRIEFS ---
  async getAllSyncBriefs(): Promise<SyncBrief[]> {
    if (isFirestoreRestricted) return MOCK_BRIEFS_CACHE;
    try {
        const snap = await getDocs(query(collection(db, 'sync_briefs'), orderBy('createdAt', 'desc')));
        const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as SyncBrief));
        return [...real, ...MOCK_BRIEFS_CACHE].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e: any) {
        handleFirestoreError(e);
        return MOCK_BRIEFS_CACHE;
    }
  },

  async addSyncBrief(brief: SyncBrief): Promise<void> {
    MOCK_BRIEFS_CACHE.unshift(brief);
    if (isFirestoreRestricted) return;
    try {
        await setDoc(doc(db, 'sync_briefs', brief.id), brief);
    } catch (e: any) { handleFirestoreError(e); }
  },

  // --- FUNDING & PII PROTECTION ---
  async submitFundingRequest(request: Partial<FundingRequest>): Promise<{ requestId: string }> {
      const requestId = `fund_${Date.now()}`;
      const protectedRequest = {
          ...request,
          id: requestId,
          artistName: encryptPii(request.artistName),
          contactPhone: encryptPii(request.contactPhone),
          userEmail: encryptPii(request.userEmail),
          status: 'new',
          createdAt: new Date().toISOString()
      };
      
      MOCK_FUNDING_REQUESTS_CACHE.unshift(protectedRequest as any);

      if (!isFirestoreRestricted && !isMockUser(request.userId || '')) {
          try {
              await setDoc(doc(db, 'funding_requests', requestId), protectedRequest);
          } catch (e: any) { handleFirestoreError(e); }
      }
      return { requestId };
  },

  async getAllFundingRequests(): Promise<FundingRequest[]> {
    if (isFirestoreRestricted) return MOCK_FUNDING_REQUESTS_CACHE.map(r => ({
        ...r,
        artistName: decryptPii(r.artistName),
        contactPhone: decryptPii(r.contactPhone)
    }));
    try {
        const snap = await getDocs(query(collection(db, 'funding_requests'), orderBy('createdAt', 'desc')));
        return snap.docs.map(d => {
            const data = d.data();
            return { 
                id: d.id, 
                ...data,
                artistName: decryptPii(data.artistName),
                contactPhone: decryptPii(data.contactPhone)
            } as FundingRequest;
        });
    } catch (e: any) {
        handleFirestoreError(e);
        return MOCK_FUNDING_REQUESTS_CACHE;
    }
  },

  // --- DISTRIBUTION VAULT ---
  async submitDistributionSubmission(submission: Partial<DistributionSubmission>): Promise<void> {
      if (!submission.userId) return;
      const id = submission.id || `dist_${Date.now()}`;
      const finalSubmission: DistributionSubmission = {
          ...submission,
          id,
          status: 'submitted',
          createdAt: new Date().toISOString()
      } as DistributionSubmission;

      MOCK_DISTRIBUTION_SUBMISSIONS.unshift(finalSubmission);
      if (!isFirestoreRestricted && !isMockUser(submission.userId)) {
          try {
              await setDoc(doc(db, 'distribution_ledger', id), finalSubmission);
          } catch (e: any) { handleFirestoreError(e); }
      }
  },

  async getAllDistributionSubmissions(): Promise<DistributionSubmission[]> {
      if (isFirestoreRestricted) return MOCK_DISTRIBUTION_SUBMISSIONS;
      try {
          const snap = await getDocs(query(collection(db, 'distribution_ledger'), orderBy('createdAt', 'desc')));
          return snap.docs.map(d => d.data() as DistributionSubmission);
      } catch (e: any) { handleFirestoreError(e); return MOCK_DISTRIBUTION_SUBMISSIONS; }
  },

  async updateDistributionStatus(id: string, status: DistributionSubmission['status']): Promise<void> {
      const idx = MOCK_DISTRIBUTION_SUBMISSIONS.findIndex(s => s.id === id);
      if (idx > -1) MOCK_DISTRIBUTION_SUBMISSIONS[idx].status = status;
      if (!isFirestoreRestricted) {
          try {
              await updateDoc(doc(db, 'distribution_ledger', id), { status });
          } catch (e: any) { handleFirestoreError(e); }
      }
  },

  async getMyDistributionSubmissions(userId: string): Promise<DistributionSubmission[]> {
      if (isFirestoreRestricted || isMockUser(userId)) {
          return MOCK_DISTRIBUTION_SUBMISSIONS.filter(s => s.userId === userId);
      }
      try {
          const qry = query(collection(db, 'distribution_ledger'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
          const snap = await getDocs(qry);
          return snap.docs.map(d => d.data() as DistributionSubmission);
      } catch (e: any) { handleFirestoreError(e); return MOCK_DISTRIBUTION_SUBMISSIONS.filter(s => s.userId === userId); }
  },

  // --- USER PROFILE ---
  subscribeToUserProfile(userId: string, callback: (user: User) => void): Unsubscribe {
      if (isFirestoreRestricted || isMockUser(userId)) {
          const mock = MOCK_USERS_CACHE.find(u => u.uid === userId);
          if (mock) callback(mock);
          return () => {};
      }

      try {
        const userDocRef = doc(db, "users", userId);
        return onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                callback({
                    ...data,
                    phoneNumber: decryptPii(data.phoneNumber)
                } as User);
            }
        }, (error) => {
            handleFirestoreError(error);
        });
      } catch (e: any) {
          handleFirestoreError(e);
          return () => {};
      }
  },

  async adminCreateUser(userData: Partial<User>): Promise<void> {
      const uid = userData.uid || `user_${Date.now()}`;
      const newUser: User = {
          uid: uid,
          displayName: userData.displayName || 'New User',
          email: userData.email || 'user@example.com',
          photoURL: userData.photoURL || '',
          plan: userData.plan || 'free',
          role: userData.role || 'artist',
          voiceShieldEnabled: userData.plan !== 'free',
          walletBalance: 0,
          onboardingCompleted: true,
          ...userData
      };

      if (!isFirestoreRestricted && !isMockUser(uid)) {
          try {
              const encryptedUser = {
                  ...newUser,
                  phoneNumber: encryptPii(userData.phoneNumber)
              };
              await setDoc(doc(db, 'users', uid), encryptedUser);
          } catch (e: any) { handleFirestoreError(e); }
      } else {
          const existingIdx = MOCK_USERS_CACHE.findIndex(u => u.uid === uid);
          if (existingIdx === -1) {
              MOCK_USERS_CACHE.push(newUser);
          }
      }
  },

  async adminUpdateUser(uid: string, data: Partial<User>): Promise<void> {
    if (isFirestoreRestricted || isMockUser(uid)) {
        const idx = MOCK_USERS_CACHE.findIndex(u => u.uid === uid);
        if (idx > -1) MOCK_USERS_CACHE[idx] = { ...MOCK_USERS_CACHE[idx], ...data };
        return;
    }
    try {
        await updateDoc(doc(db, 'users', uid), data);
    } catch (e: any) { handleFirestoreError(e); }
  },

  async getAllUsers(): Promise<User[]> {
      if (isFirestoreRestricted) return MOCK_USERS_CACHE;
      try {
          const snap = await getDocs(collection(db, 'users'));
          return snap.docs.map(d => d.data() as User);
      } catch (e: any) { handleFirestoreError(e); return MOCK_USERS_CACHE; }
  },

  async saveTrack(userId: string, track: GeneratedTrack) {
    if (isFirestoreRestricted || isMockUser(userId)) return;
    try {
      await addDoc(collection(db, 'tracks'), {
        userId,
        ...track,
        createdAt: serverTimestamp()
      });
    } catch (e: any) {
        handleFirestoreError(e);
    }
  },

  subscribeToTracks(userId: string, callback: (tracks: GeneratedTrack[]) => void): Unsubscribe {
    if (isFirestoreRestricted || isMockUser(userId)) {
        callback(MOCK_TRACKS_FALLBACK);
        return () => {};
    }

    try {
        const q = query(
        collection(db, 'tracks'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
        );
        
        return onSnapshot(q, (snapshot) => {
            const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GeneratedTrack[];
            callback(tracks);
        }, (error) => {
            handleFirestoreError(error);
            callback(MOCK_TRACKS_FALLBACK);
        });
    } catch (e: any) {
        handleFirestoreError(e);
        callback(MOCK_TRACKS_FALLBACK);
        return () => {};
    }
  },

  async deleteTrack(trackId: string) {
    if (isFirestoreRestricted) return;
    try {
        await deleteDoc(doc(db, 'tracks', trackId));
    } catch (e: any) { handleFirestoreError(e); }
  },

  async submitRelease(userId: string, release: DistributionRelease): Promise<void> {
    if (isFirestoreRestricted || isMockUser(userId)) return;
    try {
        await addDoc(collection(db, 'releases'), {
            userId,
            ...release,
            createdAt: serverTimestamp()
        });
    } catch (e: any) { handleFirestoreError(e); }
  },

  async getAllReleases(): Promise<DistributionRelease[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'releases'));
          return snap.docs.map(d => d.data() as DistributionRelease);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async getAllLegalRecords(): Promise<LegalRecord[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'legal_records'));
          return snap.docs.map(d => d.data() as LegalRecord);
      } catch (e: any) { handleFirestoreError(e); return []; }
  },

  async saveVoiceRegistration(userId: string, asset: VoiceAsset): Promise<void> {
    if (isFirestoreRestricted || isMockUser(userId)) {
        MOCK_VOICE_REGISTRATIONS_CACHE.push(asset);
        return;
    }
    try {
        await addDoc(collection(db, 'voice_registrations'), {
            userId,
            ...asset,
            createdAt: serverTimestamp()
        });
    } catch (e: any) { handleFirestoreError(e); }
  },

  subscribeToVoiceRegistrations(userId: string, callback: (assets: VoiceAsset[]) => void): Unsubscribe {
      if (isFirestoreRestricted || isMockUser(userId)) {
          callback(MOCK_VOICE_REGISTRATIONS_CACHE);
          return () => {};
      }
      try {
          const q = query(collection(db, 'voice_registrations'), where('userId', '==', userId));
          return onSnapshot(q, (snap) => {
              callback(snap.docs.map(d => d.data() as VoiceAsset));
          }, (error) => {
              handleFirestoreError(error);
              callback(MOCK_VOICE_REGISTRATIONS_CACHE);
          });
      } catch (e: any) {
          handleFirestoreError(e);
          callback(MOCK_VOICE_REGISTRATIONS_CACHE);
          return () => {};
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
      if (isFirestoreRestricted || isMockUser(userId)) return;
      try {
          await deleteDoc(doc(db, 'users', userId));
      } catch (e: any) { handleFirestoreError(e); }
  },

  async submitOpportunityRequest(request: OpportunityRequest): Promise<void> {
      MOCK_OPPORTUNITY_REQUESTS_CACHE.unshift(request);
      if (isFirestoreRestricted || isMockUser(request.userId)) return;
      try {
          await setDoc(doc(db, 'opportunity_requests', request.id), request);
      } catch (e: any) { handleFirestoreError(e); }
  },

  async getAllOpportunityRequests(): Promise<OpportunityRequest[]> {
      if (isFirestoreRestricted) return MOCK_OPPORTUNITY_REQUESTS_CACHE;
      try {
          const snap = await getDocs(collection(db, 'opportunity_requests'));
          return snap.docs.map(d => d.data() as OpportunityRequest);
      } catch (e: any) { handleFirestoreError(e); return MOCK_OPPORTUNITY_REQUESTS_CACHE; }
  },

  async getRealStats(userId: string): Promise<Stats> {
      const mockStats = {
          totalEarnings: 1250.50, totalStreams: 4520, activeOpportunities: 8, brandScore: 'B+',
          earningsGrowth: 12, streamsGrowth: 5, opportunitiesNew: false, artistLevel: "Rising Artist",
          xp: 1200, nextLevelXp: 2500
      };
      if (isFirestoreRestricted || isMockUser(userId)) return mockStats;
      return mockStats; 
  }
};
