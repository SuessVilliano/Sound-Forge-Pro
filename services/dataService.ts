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
import { VoiceAsset, User, Stats, DistributionRelease, LegalRecord, FundingRequest, SyncBrief, OpportunityRequest } from '../types';
import { MOCK_BRIEFS } from '../constants';

/**
 * GLOBAL RESTRICTION FLAG
 * If this is true, we skip all Firestore SDK calls to prevent log bloat and hang.
 */
let isFirestoreRestricted = localStorage.getItem('sf_firestore_restricted') === 'true';

// Enable persistence for better offline behavior, only if not restricted
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

let MOCK_USERS_CACHE: User[] = [
    { 
        uid: 'admin_liv8_master', 
        displayName: 'LIV8 Admin', 
        email: 'liv8ent@gmail.com', 
        plan: 'label', 
        walletBalance: 1000000, 
        isAdmin: true, 
        photoURL: '', 
        voiceShieldEnabled: true,
        notificationSettings: { emailSyncMatches: true },
        genrePreferences: ['Electronic', 'Pop', 'Cinematic']
    }
];

let MOCK_VOICE_REGISTRATIONS_CACHE: VoiceAsset[] = [];
let MOCK_FUNDING_REQUESTS_CACHE: FundingRequest[] = [];
let MOCK_BRIEFS_CACHE: SyncBrief[] = [...MOCK_BRIEFS];
let MOCK_OPPORTUNITY_REQUESTS_CACHE: OpportunityRequest[] = [];

const isMockUser = (uid: string) => {
    return isFirestoreRestricted || 
           uid.startsWith('mock_') || 
           uid.startsWith('guest_') || 
           uid === 'demo_master_account' || 
           uid === 'admin_liv8_master' || 
           uid.startsWith('lead_');
};

/**
 * ROBUST ERROR DETECTOR
 * Flips the switch to simulation mode if the Firebase API is disabled or permissions are missing.
 */
export const handleFirestoreError = (e: any) => {
    const msg = e?.message || "";
    const code = e?.code || "";
    
    if (code === 'permission-denied' || msg.includes('disabled') || msg.includes('Firestore API')) {
        if (!isFirestoreRestricted) {
            console.warn("[Sound Merge] Cloud Firestore API restricted or disabled. Initiating stable Simulation Mode.");
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

  async submitOpportunityRequest(request: OpportunityRequest): Promise<void> {
    MOCK_OPPORTUNITY_REQUESTS_CACHE.unshift(request);
    if (isFirestoreRestricted) return;
    try {
        if (!isMockUser(request.userId)) {
            await setDoc(doc(db, 'opportunity_requests', request.id), request);
        }
    } catch (e: any) {
        handleFirestoreError(e);
    }
  },

  async getAllOpportunityRequests(): Promise<OpportunityRequest[]> {
    if (isFirestoreRestricted) return MOCK_OPPORTUNITY_REQUESTS_CACHE;
    try {
        const snap = await getDocs(query(collection(db, 'opportunity_requests'), orderBy('createdAt', 'desc')));
        const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as OpportunityRequest));
        return [...real, ...MOCK_OPPORTUNITY_REQUESTS_CACHE];
    } catch (e: any) {
        handleFirestoreError(e);
        return MOCK_OPPORTUNITY_REQUESTS_CACHE;
    }
  },

  // --- FUNDING ---
  async submitFundingRequest(request: Partial<FundingRequest>): Promise<{ requestId: string }> {
      const requestId = `fund_${Date.now()}`;
      const newRequest = { id: requestId, ...request, status: 'new', createdAt: new Date().toISOString() } as FundingRequest;
      
      MOCK_FUNDING_REQUESTS_CACHE.unshift(newRequest);

      if (!isFirestoreRestricted && !isMockUser(request.userId || '')) {
          try {
              await setDoc(doc(db, 'funding_requests', requestId), newRequest);
          } catch (e: any) { handleFirestoreError(e); }
      }
      return { requestId };
  },

  async getAllFundingRequests(): Promise<FundingRequest[]> {
    if (isFirestoreRestricted) return MOCK_FUNDING_REQUESTS_CACHE;
      try {
          const snap = await getDocs(query(collection(db, 'funding_requests'), orderBy('createdAt', 'desc')));
          const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as FundingRequest));
          return [...real, ...MOCK_FUNDING_REQUESTS_CACHE];
      } catch (e: any) {
          handleFirestoreError(e);
          return MOCK_FUNDING_REQUESTS_CACHE;
      }
  },

  async updateFundingRequest(requestId: string, updates: Partial<FundingRequest>): Promise<void> {
      MOCK_FUNDING_REQUESTS_CACHE = MOCK_FUNDING_REQUESTS_CACHE.map(r => r.id === requestId ? { ...r, ...updates } : r);
      if (isFirestoreRestricted) return;
      try {
          await updateDoc(doc(db, 'funding_requests', requestId), updates);
      } catch (e: any) {
          handleFirestoreError(e);
      }
  },

  // --- USER PROFILE (Real-time) ---
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
                callback(docSnap.data() as User);
            }
        }, (error) => {
            handleFirestoreError(error);
            const mock = MOCK_USERS_CACHE.find(u => u.uid === userId);
            if (mock) callback(mock);
        });
      } catch (e: any) {
          handleFirestoreError(e);
          return () => {};
      }
  },

  async getAllUsers(): Promise<User[]> {
      if (isFirestoreRestricted) return MOCK_USERS_CACHE;
      try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const realUsers = usersSnap.docs.map(d => d.data() as User);
          const realIds = new Set(realUsers.map(u => u.uid));
          const localOnly = MOCK_USERS_CACHE.filter(u => !realIds.has(u.uid));
          return [...realUsers, ...localOnly];
      } catch (e: any) {
          handleFirestoreError(e);
          return MOCK_USERS_CACHE;
      }
  },

  async adminCreateUser(userData: Partial<User>): Promise<void> {
      const uid = userData.uid || `user_${Date.now()}`;
      const newUser: User = {
          uid: uid,
          displayName: userData.displayName || 'New User',
          email: userData.email || 'user@example.com',
          photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName || 'U')}&background=random`,
          plan: userData.plan || 'free',
          role: userData.role || 'artist',
          voiceShieldEnabled: userData.plan !== 'free',
          walletBalance: 0,
          onboardingCompleted: true,
          notificationSettings: { emailSyncMatches: true }, 
          ...userData
      };

      const exists = MOCK_USERS_CACHE.find(u => u.uid === uid);
      if (!exists) MOCK_USERS_CACHE.push(newUser);
      else MOCK_USERS_CACHE = MOCK_USERS_CACHE.map(u => u.uid === uid ? newUser : u);

      if (!isFirestoreRestricted && !isMockUser(uid)) {
          try {
              await setDoc(doc(db, 'users', uid), newUser);
          } catch (e: any) { handleFirestoreError(e); }
      }
  },

  async adminUpdateUser(uid: string, updates: Partial<User>): Promise<void> {
      MOCK_USERS_CACHE = MOCK_USERS_CACHE.map(u => u.uid === uid ? { ...u, ...updates } : u);
      if (isFirestoreRestricted) return;
      try {
          if (!isMockUser(uid)) {
              await updateDoc(doc(db, 'users', uid), updates);
          }
      } catch (e: any) {
          handleFirestoreError(e);
      }
  },

  async deleteUserAccount(userId: string) {
      MOCK_USERS_CACHE = MOCK_USERS_CACHE.filter(u => u.uid !== userId);
      if (isFirestoreRestricted) return;
      if (isMockUser(userId)) return;

      try {
          await deleteDoc(doc(db, 'users', userId));
      } catch (e: any) {
          handleFirestoreError(e);
      }
  },

  async getAllReleases(): Promise<DistributionRelease[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'releases'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DistributionRelease));
      } catch (e: any) {
          handleFirestoreError(e);
          return [];
      }
  },

  async saveLegalRecord(record: LegalRecord) {
      if (isFirestoreRestricted) return;
      try {
          await addDoc(collection(db, 'legal_records'), record);
      } catch(e: any) {
          handleFirestoreError(e);
      }
  },

  async getAllLegalRecords(): Promise<LegalRecord[]> {
      if (isFirestoreRestricted) return [];
      try {
          const snap = await getDocs(collection(db, 'legal_records'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as LegalRecord));
      } catch (e: any) {
          handleFirestoreError(e);
          return [];
      }
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

  getCatalogPlays() {
      try {
          const raw = localStorage.getItem('sf_catalog_plays');
          return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
  },

  async incrementPlayCount(trackId: string) {
    if (isFirestoreRestricted || trackId.startsWith('c') || trackId.startsWith('m')) {
        try {
            const raw = localStorage.getItem('sf_catalog_plays');
            const plays = raw ? JSON.parse(raw) : {};
            plays[trackId] = (plays[trackId] || 0) + 1;
            localStorage.setItem('sf_catalog_plays', JSON.stringify(plays));
        } catch (e) { }
        return;
    }

    try {
        const trackRef = doc(db, 'tracks', trackId);
        await updateDoc(trackRef, { plays: increment(1) });
    } catch (e: any) { handleFirestoreError(e); }
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

  async getRealStats(userId: string): Promise<Stats> {
      const mockStats = {
          totalEarnings: 1250.50, totalStreams: 4520, activeOpportunities: 8, brandScore: 'B+',
          earningsGrowth: 12, streamsGrowth: 5, opportunitiesNew: false, artistLevel: "Rising Artist",
          xp: 1200, nextLevelXp: 2500
      };

      if (isFirestoreRestricted || isMockUser(userId)) return mockStats;

      try {
          const tracksQ = query(collection(db, 'tracks'), where('userId', '==', userId));
          const tracksSnap = await getDocs(tracksQ);
          let totalStreams = 0;
          let totalEarnings = 0;
          tracksSnap.forEach(doc => {
              const data = doc.data();
              totalStreams += (data.plays || 0);
              totalEarnings += (data.earnings || 0);
          });
          return {
              totalEarnings, totalStreams, activeOpportunities: 12, 
              brandScore: totalStreams > 1000 ? 'B+' : 'C',
              earningsGrowth: 0, streamsGrowth: 0, opportunitiesNew: true,
              artistLevel: totalStreams > 10000 ? "Pro Artist" : "Rising Artist",
              xp: Math.floor(totalStreams / 10), nextLevelXp: 5000
          };
      } catch (e: any) {
          handleFirestoreError(e);
          return mockStats;
      }
  },

  async submitRelease(userId: string, releaseData: any) {
      if (isFirestoreRestricted || isMockUser(userId)) return;
      try {
          await addDoc(collection(db, 'releases'), {
              userId, ...releaseData, status: 'processing_agent', submittedAt: serverTimestamp()
          });
      } catch(e: any) { handleFirestoreError(e); }
  },

  async saveVoiceRegistration(userId: string, nftData: VoiceAsset) {
    MOCK_VOICE_REGISTRATIONS_CACHE.unshift(nftData);
    if (isFirestoreRestricted || isMockUser(userId)) return;
    try {
      await addDoc(collection(db, 'voice_registrations'), {
        userId, ...nftData, registeredAt: serverTimestamp()
      });
    } catch (e: any) { handleFirestoreError(e); }
  },

  subscribeToVoiceRegistrations(userId: string, callback: (nfts: VoiceAsset[]) => void): Unsubscribe {
    if (isFirestoreRestricted || isMockUser(userId)) {
        callback(MOCK_VOICE_REGISTRATIONS_CACHE);
        return () => {};
    }

    try {
        const q = query(
            collection(db, 'voice_registrations'),
            where('userId', '==', userId),
            orderBy('registeredAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const nfts = snapshot.docs.map(doc => ({ ...doc.data() })) as VoiceAsset[];
            callback(nfts);
        }, (error) => {
            handleFirestoreError(error);
            callback(MOCK_VOICE_REGISTRATIONS_CACHE); 
        });
    } catch (e: any) {
        handleFirestoreError(e);
        callback(MOCK_VOICE_REGISTRATIONS_CACHE);
        return () => {};
    }
  }
};