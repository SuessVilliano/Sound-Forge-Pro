
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
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { GeneratedTrack } from './audioService';
import { VoiceAsset, User, Stats, DistributionRelease, LegalRecord, FundingRequest, SyncBrief, OpportunityRequest } from '../types';
import { MOCK_BRIEFS } from '../constants';

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
    return uid.startsWith('mock_') || 
           uid.startsWith('guest_') || 
           uid === 'demo_master_account' || 
           uid === 'admin_liv8_master' || 
           uid.startsWith('lead_');
};

export const dataService = {
  // --- OPPORTUNITIES & BRIEFS ---
  async getAllSyncBriefs(): Promise<SyncBrief[]> {
    try {
        const snap = await getDocs(query(collection(db, 'sync_briefs'), orderBy('createdAt', 'desc')));
        const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as SyncBrief));
        return [...real, ...MOCK_BRIEFS_CACHE].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
        return MOCK_BRIEFS_CACHE;
    }
  },

  async addSyncBrief(brief: SyncBrief): Promise<void> {
    MOCK_BRIEFS_CACHE.unshift(brief);
    try {
        await setDoc(doc(db, 'sync_briefs', brief.id), brief);
    } catch (e) {}
  },

  async submitOpportunityRequest(request: OpportunityRequest): Promise<void> {
    MOCK_OPPORTUNITY_REQUESTS_CACHE.unshift(request);
    
    // SERVER FORWARDING (Institutional Webhook)
    try {
        await fetch('/api/opportunity-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        
        if (!isMockUser(request.userId)) {
            await setDoc(doc(db, 'opportunity_requests', request.id), request);
        }
    } catch (e) {
        console.error("Submission failed, stored locally", e);
    }
  },

  async getAllOpportunityRequests(): Promise<OpportunityRequest[]> {
    try {
        const snap = await getDocs(query(collection(db, 'opportunity_requests'), orderBy('createdAt', 'desc')));
        const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as OpportunityRequest));
        return [...real, ...MOCK_OPPORTUNITY_REQUESTS_CACHE];
    } catch (e) {
        return MOCK_OPPORTUNITY_REQUESTS_CACHE;
    }
  },

  // --- FUNDING ---
  async submitFundingRequest(request: Partial<FundingRequest>): Promise<{ requestId: string }> {
      const response = await fetch('/api/funding-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
      });
      
      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Funding request failed');
      }

      const result = await response.json();
      
      if (isMockUser(request.userId || '')) {
          MOCK_FUNDING_REQUESTS_CACHE.unshift(result.request);
      }

      return { requestId: result.requestId };
  },

  async getAllFundingRequests(): Promise<FundingRequest[]> {
      try {
          const snap = await getDocs(query(collection(db, 'funding_requests'), orderBy('createdAt', 'desc')));
          const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as FundingRequest));
          return [...real, ...MOCK_FUNDING_REQUESTS_CACHE];
      } catch (e) {
          return MOCK_FUNDING_REQUESTS_CACHE;
      }
  },

  async updateFundingRequest(requestId: string, updates: Partial<FundingRequest>): Promise<void> {
      try {
          await updateDoc(doc(db, 'funding_requests', requestId), updates);
      } catch (e) {
          MOCK_FUNDING_REQUESTS_CACHE = MOCK_FUNDING_REQUESTS_CACHE.map(r => r.id === requestId ? { ...r, ...updates } : r);
      }
  },

  async retryFundingWebhook(requestId: string): Promise<void> {
      const response = await fetch(`/api/funding-request/${requestId}/retry`, { method: 'POST' });
      if (!response.ok) throw new Error("Retry failed");
  },

  // --- USER PROFILE (Real-time) ---
  subscribeToUserProfile(userId: string, callback: (user: User) => void): Unsubscribe {
      if (isMockUser(userId)) {
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
            if (error.code !== 'permission-denied') {
                console.warn("Profile Sync Warning:", error.message);
            }
        });
      } catch (e) {
          console.error("Failed to subscribe to profile:", e);
          return () => {};
      }
  },

  async getAllUsers(): Promise<User[]> {
      try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const realUsers = usersSnap.docs.map(d => d.data() as User);
          
          if (realUsers.length > 0) {
              const realIds = new Set(realUsers.map(u => u.uid));
              const localOnly = MOCK_USERS_CACHE.filter(u => !realIds.has(u.uid));
              return [...realUsers, ...localOnly];
          }
          return MOCK_USERS_CACHE;
      } catch (e) {
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
      if (!exists) {
          MOCK_USERS_CACHE.push(newUser);
      } else {
          MOCK_USERS_CACHE = MOCK_USERS_CACHE.map(u => u.uid === uid ? newUser : u);
      }

      try {
          if (!isMockUser(uid)) {
              await setDoc(doc(db, 'users', uid), newUser);
          }
      } catch (e) {
          console.warn("Failed to create user in DB.", e);
      }
  },

  async adminUpdateUser(uid: string, updates: Partial<User>): Promise<void> {
      MOCK_USERS_CACHE = MOCK_USERS_CACHE.map(u => u.uid === uid ? { ...u, ...updates } : u);
      try {
          if (!isMockUser(uid)) {
              await updateDoc(doc(db, 'users', uid), updates);
          }
      } catch (e) {
          console.warn("Failed to update user:", e);
      }
  },

  async deleteUserAccount(userId: string) {
      MOCK_USERS_CACHE = MOCK_USERS_CACHE.filter(u => u.uid !== userId);
      if (isMockUser(userId)) return;

      try {
          const tracksQ = query(collection(db, 'tracks'), where('userId', '==', userId));
          const tracksSnap = await getDocs(tracksQ);
          const trackDeletes = tracksSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(trackDeletes);

          const releasesQ = query(collection(db, 'releases'), where('userId', '==', userId));
          const releasesSnap = await getDocs(releasesQ);
          const releaseDeletes = releasesSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(releaseDeletes);

          const voiceQ = query(collection(db, 'voice_registrations'), where('userId', '==', userId));
          const voiceSnap = await getDocs(voiceQ);
          const voiceDeletes = voiceSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(voiceDeletes);

          await deleteDoc(doc(db, 'users', userId));
      } catch (e) {
          console.warn("Error deleting user account:", e);
      }
  },

  async getAllReleases(): Promise<DistributionRelease[]> {
      try {
          const snap = await getDocs(collection(db, 'releases'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DistributionRelease));
      } catch (e) {
          return [];
      }
  },

  async saveLegalRecord(record: LegalRecord) {
      try {
          await addDoc(collection(db, 'legal_records'), record);
      } catch(e) {
          console.warn("Saving legal record failed");
      }
  },

  async getAllLegalRecords(): Promise<LegalRecord[]> {
      try {
          const snap = await getDocs(collection(db, 'legal_records'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as LegalRecord));
      } catch (e) {
          return [];
      }
  },

  async saveTrack(userId: string, track: GeneratedTrack) {
    if (isMockUser(userId)) return;
    try {
      await addDoc(collection(db, 'tracks'), {
        userId,
        ...track,
        createdAt: serverTimestamp()
      });
    } catch (e: any) {}
  },

  getCatalogPlays() {
      try {
          const raw = localStorage.getItem('sf_catalog_plays');
          return raw ? JSON.parse(raw) : {};
      } catch {
          return {};
      }
  },

  async incrementPlayCount(trackId: string) {
    if (trackId.startsWith('c') || trackId.startsWith('m')) {
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
        await updateDoc(trackRef, {
            plays: increment(1)
        });
    } catch (e) { }
  },

  subscribeToTracks(userId: string, callback: (tracks: GeneratedTrack[]) => void): Unsubscribe {
    if (isMockUser(userId)) {
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
        const tracks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as GeneratedTrack[];
        callback(tracks);
        }, (error) => {
            callback(MOCK_TRACKS_FALLBACK);
        });
    } catch (e) {
        callback(MOCK_TRACKS_FALLBACK);
        return () => {};
    }
  },

  async deleteTrack(trackId: string) {
    try {
        await deleteDoc(doc(db, 'tracks', trackId));
    } catch (e) { }
  },

  async getRealStats(userId: string): Promise<Stats> {
      const mockStats = {
          totalEarnings: 1250.50,
          totalStreams: 4520,
          activeOpportunities: 8,
          brandScore: 'B+',
          earningsGrowth: 12,
          streamsGrowth: 5,
          opportunitiesNew: false,
          artistLevel: "Rising Artist",
          xp: 1200,
          nextLevelXp: 2500
      };

      if (isMockUser(userId)) return mockStats;

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
              totalEarnings,
              totalStreams,
              activeOpportunities: 12, 
              brandScore: totalStreams > 1000 ? 'B+' : 'C',
              earningsGrowth: 0,
              streamsGrowth: 0,
              opportunitiesNew: true,
              artistLevel: totalStreams > 10000 ? "Pro Artist" : "Rising Artist",
              xp: Math.floor(totalStreams / 10),
              nextLevelXp: 5000
          };
      } catch (e: any) {
          return mockStats;
      }
  },

  async submitRelease(userId: string, releaseData: any) {
      if (isMockUser(userId)) return;
      try {
          await addDoc(collection(db, 'releases'), {
              userId,
              ...releaseData,
              status: 'processing_agent',
              submittedAt: serverTimestamp()
          });
      } catch(e) {}
  },

  async saveVoiceRegistration(userId: string, nftData: VoiceAsset) {
    MOCK_VOICE_REGISTRATIONS_CACHE.unshift(nftData);
    if (isMockUser(userId)) return;
    try {
      await addDoc(collection(db, 'voice_registrations'), {
        userId,
        ...nftData,
        registeredAt: serverTimestamp()
      });
    } catch (e: any) {}
  },

  subscribeToVoiceRegistrations(userId: string, callback: (nfts: VoiceAsset[]) => void): Unsubscribe {
    if (isMockUser(userId)) {
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
            const nfts = snapshot.docs.map(doc => ({
                ...doc.data()
            })) as VoiceAsset[];
            callback(nfts);
        }, (error) => {
            callback(MOCK_VOICE_REGISTRATIONS_CACHE); 
        });
    } catch (e) {
        callback(MOCK_VOICE_REGISTRATIONS_CACHE);
        return () => {};
    }
  },

  async addContact(userId: string, contact: { name: string, email: string, source: string }) {
    if (isMockUser(userId)) return;
    try {
      await addDoc(collection(db, 'contacts'), {
        userId,
        ...contact,
        addedAt: serverTimestamp()
      });
    } catch (e: any) {}
  },

  subscribeToContacts(userId: string, callback: (contacts: any[]) => void): Unsubscribe {
    if (isMockUser(userId)) {
        callback([]);
        return () => {};
    }
    try {
        const q = query(
        collection(db, 'contacts'),
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
        const contacts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(contacts);
        }, (error) => {
            callback([]);
        });
    } catch (e) {
        callback([]);
        return () => {};
    }
  }
};
