
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
/* Updated VoiceNFT to VoiceAsset from types */
import { VoiceAsset, User, Stats, DistributionRelease, LegalRecord } from '../types';

// Fallback Mock Data for Simulation Mode
const MOCK_TRACKS_FALLBACK: GeneratedTrack[] = [
    { id: 'm1', title: 'Summer Vibes (Demo)', duration: '2:45', status: 'completed', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', imageUrl: 'https://picsum.photos/300/300?random=1', tags: ['Pop', 'Upbeat'], type: 'song' },
    { id: 'm2', title: 'Midnight Drive', duration: '3:12', status: 'completed', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', imageUrl: 'https://picsum.photos/300/300?random=2', tags: ['Synthwave', 'Chill'], type: 'song' }
];

// Persistent local cache for users
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
    },
    { 
        uid: 'u1', 
        displayName: 'Sarah Jenkins', 
        email: 'sarah@example.com', 
        plan: 'free', 
        walletBalance: 0, 
        photoURL: '', 
        voiceShieldEnabled: false,
        notificationSettings: { emailSyncMatches: false }
    },
    { 
        uid: 'u2', 
        displayName: 'Mike Ross', 
        email: 'mike@example.com', 
        plan: 'label', 
        walletBalance: 1250, 
        photoURL: '', 
        voiceShieldEnabled: true,
        notificationSettings: { emailSyncMatches: true },
        genrePreferences: ['Hip Hop', 'Rock']
    }
];

// Persistent local cache for Voice Assets (Rebranded from NFTs)
/* Updated type to VoiceAsset[] */
let MOCK_VOICE_REGISTRATIONS_CACHE: VoiceAsset[] = [];

// Persistent local cache for Legal Records
let MOCK_LEGAL_RECORDS_CACHE: LegalRecord[] = [
    {
        id: 'leg_mock_1',
        userId: 'u1',
        userEmail: 'sarah@example.com',
        userName: 'Sarah Jenkins',
        documentType: 'Voice IP & NDA',
        documentVersion: 'v1.0',
        signature: 'Sarah Jenkins',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        ipAddress: '192.168.1.1',
        status: 'signed'
    },
    {
        id: 'leg_mock_2',
        userId: 'u2',
        userEmail: 'mike@example.com',
        userName: 'Mike Ross',
        documentType: 'Voice IP & NDA',
        documentVersion: 'v1.0',
        signature: 'Michael Ross',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        ipAddress: '10.0.0.42',
        status: 'signed'
    }
];

// Helper to check if a user is a mock/system user and should skip DB
const isMockUser = (uid: string) => {
    return uid.startsWith('mock_') || 
           uid.startsWith('guest_') || 
           uid === 'demo_master_account' || 
           uid === 'admin_liv8_master' || 
           uid.startsWith('lead_');
};

export const dataService = {
  // --- USER PROFILE (Real-time) ---
  subscribeToUserProfile(userId: string, callback: (user: User) => void): Unsubscribe {
      // If using mock user, don't attempt Firestore connection
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
            // Silently handle permission errors by not crashing
            if (error.code !== 'permission-denied') {
                console.warn("Profile Sync Warning:", error.message);
            }
        });
      } catch (e) {
          console.error("Failed to subscribe to profile:", e);
          return () => {};
      }
  },

  // --- ADMIN: MANAGE USERS ---
  async getAllUsers(): Promise<User[]> {
      try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const realUsers = usersSnap.docs.map(d => d.data() as User);
          
          if (realUsers.length > 0) {
              // Merge real data with any locally created mock users (that aren't in DB yet)
              const realIds = new Set(realUsers.map(u => u.uid));
              // Important: Keep MOCK_USERS_CACHE fresh with new real users to avoid dupes
              const localOnly = MOCK_USERS_CACHE.filter(u => !realIds.has(u.uid));
              return [...realUsers, ...localOnly];
          }
          return MOCK_USERS_CACHE;
      } catch (e) {
          // If firestore fails (rules/mock), return our local cache which might include newly created users
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
          notificationSettings: { emailSyncMatches: true }, // Default ON
          ...userData
      };

      // 1. Update Local Cache IMMEDIATELY so UI updates
      // Check if user already exists in cache
      const exists = MOCK_USERS_CACHE.find(u => u.uid === uid);
      if (!exists) {
          MOCK_USERS_CACHE.push(newUser);
      } else {
          // Update existing
          MOCK_USERS_CACHE = MOCK_USERS_CACHE.map(u => u.uid === uid ? newUser : u);
      }

      try {
          // 2. Try writing to DB (might fail in demo/offline)
          // If ID is mock/lead/admin, don't write to restricted DB path unless allowed
          if (!isMockUser(uid)) {
              await setDoc(doc(db, 'users', uid), newUser);
              console.log("Admin created user (DB Sync Success):", newUser);
          }
      } catch (e) {
          console.warn("Failed to create user in DB (Offline/Permission). Using local cache only.", e);
      }
  },

  async adminUpdateUser(uid: string, updates: Partial<User>): Promise<void> {
      // Update Local Cache
      MOCK_USERS_CACHE = MOCK_USERS_CACHE.map(u => u.uid === uid ? { ...u, ...updates } : u);

      try {
          if (!isMockUser(uid)) {
              await updateDoc(doc(db, 'users', uid), updates);
          }
      } catch (e) {
          console.warn("Failed to update user (Backend unavailable):", e);
      }
  },

  async deleteUserAccount(userId: string) {
      // Update Local Cache
      MOCK_USERS_CACHE = MOCK_USERS_CACHE.filter(u => u.uid !== userId);

      if (isMockUser(userId)) {
          console.log(`[Mock] Deleted user ${userId} and all assets.`);
          return;
      }

      // Real cleanup logic
      try {
          // 1. Delete Tracks
          const tracksQ = query(collection(db, 'tracks'), where('userId', '==', userId));
          const tracksSnap = await getDocs(tracksQ);
          const trackDeletes = tracksSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(trackDeletes);

          // 2. Delete Releases
          const releasesQ = query(collection(db, 'releases'), where('userId', '==', userId));
          const releasesSnap = await getDocs(releasesQ);
          const releaseDeletes = releasesSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(releaseDeletes);

          // 3. Delete Voice Data
          const voiceQ = query(collection(db, 'voice_registrations'), where('userId', '==', userId));
          const voiceSnap = await getDocs(voiceQ);
          const voiceDeletes = voiceSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(voiceDeletes);

          // 4. Finally Delete User Profile
          await deleteDoc(doc(db, 'users', userId));
          
          console.log(`Successfully deleted account ${userId} and all related data.`);
      } catch (e) {
          console.warn("Error deleting user account (Backend unavailable):", e);
      }
  },

  // --- ADMIN: VIEW DISTRIBUTIONS ---
  async getAllReleases(): Promise<DistributionRelease[]> {
      try {
          const snap = await getDocs(collection(db, 'releases'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DistributionRelease));
      } catch (e) {
          return [
              { 
                  id: 'rel_1', title: 'Summer Vibes', artistName: 'Sarah Jenkins', 
                  releaseDate: '2025-05-01', recordLabel: 'Indie', status: 'delivered',
                  tracks: [], copyrightOwner: 'Sarah', copyrightYear: '2025', 
                  pLineOwner: 'Sarah', pLineYear: '2025', language: 'en', 
                  primaryGenre: 'Pop', services: ['Spotify'], previouslyReleased: false,
                  optSocialPack: false, optDiscoveryPack: false, optStoreMaximizer: false, optLeaveLegacy: false, optLoudnessNorm: false, optBlockchainStorage: false
              },
              { 
                  id: 'rel_2', title: 'Deep Tech EP', artistName: 'Mike Ross', 
                  releaseDate: '2025-06-15', recordLabel: 'TechRecs', status: 'processing',
                  tracks: [], copyrightOwner: 'Mike', copyrightYear: '2025', 
                  pLineOwner: 'Mike', pLineYear: '2025', language: 'en', 
                  primaryGenre: 'Electronic', services: ['Beatport', 'Spotify'], previouslyReleased: false,
                  optSocialPack: true, optDiscoveryPack: true, optStoreMaximizer: true, optLeaveLegacy: false, optLoudnessNorm: false, optBlockchainStorage: true
              }
          ];
      }
  },

  // --- ADMIN: LEGAL RECORDS ---
  async saveLegalRecord(record: LegalRecord) {
      MOCK_LEGAL_RECORDS_CACHE.unshift(record);
      
      try {
          await addDoc(collection(db, 'legal_records'), record);
      } catch(e) {
          console.warn("Saving legal record to local cache only (DB unavailable)");
      }
  },

  async getAllLegalRecords(): Promise<LegalRecord[]> {
      try {
          const snap = await getDocs(collection(db, 'legal_records'));
          const dbRecords = snap.docs.map(d => ({ id: d.id, ...d.data() } as LegalRecord));
          
          // Merge with local cache to show immediate updates even if DB write failed
          const dbIds = new Set(dbRecords.map(r => r.id));
          const localOnly = MOCK_LEGAL_RECORDS_CACHE.filter(r => !dbIds.has(r.id));
          
          return [...localOnly, ...dbRecords];
      } catch (e) {
          return MOCK_LEGAL_RECORDS_CACHE;
      }
  },

  // --- TRACKS / MUSIC STUDIO ---
  async saveTrack(userId: string, track: GeneratedTrack) {
    if (isMockUser(userId)) {
        console.log("Simulating Track Save (Mock Mode):", track.title);
        return;
    }

    try {
      await addDoc(collection(db, 'tracks'), {
        userId,
        ...track,
        createdAt: serverTimestamp()
      });
    } catch (e: any) {
      console.warn("Save Track Error (Backend unavailable). Simulating success.", e.code);
    }
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
        // Public/Mock Catalog logic (Local cache)
        try {
            const raw = localStorage.getItem('sf_catalog_plays');
            const plays = raw ? JSON.parse(raw) : {};
            plays[trackId] = (plays[trackId] || 0) + 1;
            localStorage.setItem('sf_catalog_plays', JSON.stringify(plays));
        } catch (e) { /* ignore */ }
        return;
    }

    // Real Cloud Tracks
    try {
        const trackRef = doc(db, 'tracks', trackId);
        await updateDoc(trackRef, {
            plays: increment(1)
        });
    } catch (e) {
        // Silent fail for increment
    }
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
            // Fallback to mock data so UI isn't empty on permission error
            if (error.code === 'permission-denied') {
                callback(MOCK_TRACKS_FALLBACK);
            } else {
                console.warn("Track Sync Error:", error.message);
                callback(MOCK_TRACKS_FALLBACK);
            }
        });
    } catch (e) {
        callback(MOCK_TRACKS_FALLBACK);
        return () => {};
    }
  },

  async deleteTrack(trackId: string) {
    if (trackId.startsWith('m')) return; // Can't delete mock tracks
    try {
        await deleteDoc(doc(db, 'tracks', trackId));
    } catch (e) {
        console.warn("Delete Track Error:", e);
    }
  },

  // --- DASHBOARD STATS AGGREGATION ---
  async getRealStats(userId: string): Promise<Stats> {
      // Return mock stats by default if in mock mode OR if backend fails
      const mockStats = {
          totalEarnings: 1250.50,
          totalStreams: 4520,
          activeOpportunities: 8,
          brandScore: 'B+',
          earningsGrowth: 12,
          streamsGrowth: 5,
          opportunitiesNew: true,
          artistLevel: "Rising Artist",
          xp: 1200,
          nextLevelXp: 2500
      };

      if (isMockUser(userId)) {
          return mockStats;
      }

      try {
          // 1. Get Tracks for Streams/Earnings
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
          // Silent fallback for stats
          if (e.code !== 'permission-denied') console.warn("Stats Calculation Error:", e.message);
          return {
              ...mockStats,
              totalEarnings: 0,
              totalStreams: 0
          };
      }
  },

  // --- RELEASES (DISTRIBUTION) ---
  async submitRelease(userId: string, releaseData: any) {
      if (isMockUser(userId)) {
          console.log("Simulating Release Submission:", releaseData.title);
          return;
      }

      try {
          await addDoc(collection(db, 'releases'), {
              userId,
              ...releaseData,
              status: 'processing_agent',
              submittedAt: serverTimestamp()
          });
      } catch(e) {
          console.warn("Release Submission Error (Backend unavailable). Simulating success.");
      }
  },

  // --- VOICE SHIELD ---
  /* Updated to use VoiceAsset type instead of deprecated VoiceNFT */
  async saveVoiceRegistration(userId: string, nftData: VoiceAsset) {
    // 1. Always update local cache first to ensure immediate UI feedback
    MOCK_VOICE_REGISTRATIONS_CACHE.unshift(nftData);

    if (isMockUser(userId)) return;

    try {
      // 2. Try Database Write
      await addDoc(collection(db, 'voice_registrations'), {
        userId,
        ...nftData,
        registeredAt: serverTimestamp()
      });
    } catch (e: any) {
      console.warn("Voice Registration DB Write Failed (Using Local Cache).", e.code);
    }
  },

  /* Updated to use VoiceAsset in callback and type casting */
  subscribeToVoiceRegistrations(userId: string, callback: (nfts: VoiceAsset[]) => void): Unsubscribe {
    // Return Local Cache immediately if mock user
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
            
            // Merge with local cache if DB is empty but cache has items (e.g. recent failure or latency)
            if (nfts.length === 0 && MOCK_VOICE_REGISTRATIONS_CACHE.length > 0) {
                callback(MOCK_VOICE_REGISTRATIONS_CACHE);
            } else {
                callback(nfts);
            }
        }, (error) => {
            // Fallback to cache on permission denied
            console.warn("Voice Sync Error (Using Cache):", error.message);
            callback(MOCK_VOICE_REGISTRATIONS_CACHE); 
        });
    } catch (e) {
        callback(MOCK_VOICE_REGISTRATIONS_CACHE);
        return () => {};
    }
  },

  // --- MARKETING CRM ---
  async addContact(userId: string, contact: { name: string, email: string, source: string }) {
    if (isMockUser(userId)) return;

    try {
      await addDoc(collection(db, 'contacts'), {
        userId,
        ...contact,
        addedAt: serverTimestamp()
      });
    } catch (e: any) {
        console.warn("CRM Add Error (Backend unavailable).");
    }
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
