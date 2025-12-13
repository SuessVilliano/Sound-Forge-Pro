
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
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { GeneratedTrack } from './audioService';
import { VoiceNFT, User } from '../types';

// --- LOCAL STORAGE FALLBACK UTILITIES ---
const KEYS = {
  TRACKS: 'sf_local_tracks',
  VOICE: 'sf_local_voice',
  CONTACTS: 'sf_local_contacts',
  RELEASES: 'sf_local_releases',
  CATALOG_PLAYS: 'sf_catalog_plays'
};

// CIRCUIT BREAKER
let isOfflineMode = false;

const getLocal = (key: string, userId: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all.filter((item: any) => item.userId === userId);
  } catch {
    return [];
  }
};

const saveLocal = (key: string, data: any) => {
  try {
    const raw = localStorage.getItem(key);
    const all = raw ? JSON.parse(raw) : [];
    const newItem = { 
        ...data, 
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        createdAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(), 
        addedAt: new Date().toISOString() 
    };
    all.push(newItem);
    localStorage.setItem(key, JSON.stringify(all));
    return newItem;
  } catch (e) {
    console.warn("Local storage saving failed", e);
    return data;
  }
};

const deleteLocal = (key: string, id: string) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const all = JSON.parse(raw);
        const filtered = all.filter((item: any) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
        console.warn("Local storage deletion failed", e);
    }
};

const handleFirestoreError = (error: any, fallback: () => void) => {
    if (!isOfflineMode) {
        // Only log once to avoid spam
        // console.warn(`Backend Connection Issue (${error.code || 'unknown'}). Switching Data Service to Offline Mode.`);
        isOfflineMode = true;
    }
    fallback();
};

export const dataService = {
  // --- USER PROFILE (Real-time) ---
  subscribeToUserProfile(userId: string, callback: (user: User) => void): Unsubscribe {
      if (isOfflineMode || userId.startsWith('demo-') || userId.startsWith('guest')) {
          const stored = localStorage.getItem('soundforge_user_session');
          if (stored) callback(JSON.parse(stored));
          return () => {};
      }

      try {
          const userDocRef = doc(db, "users", userId);
          return onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                  callback(docSnap.data() as User);
              }
          }, (error) => {
              handleFirestoreError(error, () => {
                  const stored = localStorage.getItem('soundforge_user_session');
                  if (stored) callback(JSON.parse(stored));
              });
          });
      } catch (e) {
          handleFirestoreError(e, () => {
              const stored = localStorage.getItem('soundforge_user_session');
              if (stored) callback(JSON.parse(stored));
          });
          return () => {};
      }
  },

  // --- TRACKS / MUSIC STUDIO ---
  async saveTrack(userId: string, track: GeneratedTrack) {
    if (isOfflineMode || userId.startsWith('demo-')) {
        saveLocal(KEYS.TRACKS, { userId, ...track });
        return;
    }

    try {
      await addDoc(collection(db, 'tracks'), {
        userId,
        ...track,
        createdAt: serverTimestamp()
      });
    } catch (e: any) {
      handleFirestoreError(e, () => saveLocal(KEYS.TRACKS, { userId, ...track }));
    }
  },

  getCatalogPlays() {
      try {
          const raw = localStorage.getItem(KEYS.CATALOG_PLAYS);
          return raw ? JSON.parse(raw) : {};
      } catch {
          return {};
      }
  },

  async incrementPlayCount(trackId: string) {
    // 1. Catalog Tracks (Mock IDs starting with 'c')
    if (trackId.startsWith('c')) {
        try {
            const raw = localStorage.getItem(KEYS.CATALOG_PLAYS);
            const plays = raw ? JSON.parse(raw) : {};
            plays[trackId] = (plays[trackId] || 0) + 1;
            localStorage.setItem(KEYS.CATALOG_PLAYS, JSON.stringify(plays));
            console.log(`[Local] Incremented play count for ${trackId} to ${plays[trackId]}`);
        } catch (e) {
            console.warn("Failed to update local catalog plays", e);
        }
        return;
    }

    // 2. Local User Tracks
    if (trackId.startsWith('local_')) {
         try {
             const raw = localStorage.getItem(KEYS.TRACKS);
             if (raw) {
                 const all = JSON.parse(raw);
                 const updated = all.map((t: any) => t.id === trackId ? { ...t, plays: (t.plays || 0) + 1 } : t);
                 localStorage.setItem(KEYS.TRACKS, JSON.stringify(updated));
             }
         } catch(e) {
             console.warn("Failed to update local track plays", e);
         }
         return;
    }
    
    // 3. Cloud/Firestore Tracks
    if (isOfflineMode) return;

    try {
        const trackRef = doc(db, 'tracks', trackId);
        await updateDoc(trackRef, {
            plays: increment(1)
        });
    } catch (e) {
        console.warn("Failed to increment play count in Firestore", e);
    }
  },

  subscribeToTracks(userId: string, callback: (tracks: GeneratedTrack[]) => void): Unsubscribe {
    if (isOfflineMode || userId.startsWith('demo-')) {
        callback(getLocal(KEYS.TRACKS, userId));
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
            handleFirestoreError(error, () => callback(getLocal(KEYS.TRACKS, userId)));
        });
    } catch (e) {
        handleFirestoreError(e, () => callback(getLocal(KEYS.TRACKS, userId)));
        return () => {};
    }
  },

  async deleteTrack(trackId: string) {
    if (trackId.startsWith('local_')) {
         deleteLocal(KEYS.TRACKS, trackId);
         return;
    }
    if (isOfflineMode) return;
    try {
        await deleteDoc(doc(db, 'tracks', trackId));
    } catch (e) {
        deleteLocal(KEYS.TRACKS, trackId);
    }
  },

  // --- RELEASES (DISTRIBUTION) ---
  async submitRelease(userId: string, releaseData: any) {
      if (isOfflineMode || userId.startsWith('demo-')) {
          saveLocal(KEYS.RELEASES, { userId, ...releaseData, status: 'submitted' });
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
          handleFirestoreError(e, () => saveLocal(KEYS.RELEASES, { userId, ...releaseData }));
      }
  },

  // --- VOICE SHIELD ---
  async saveVoiceRegistration(userId: string, nftData: VoiceNFT) {
    if (isOfflineMode || userId.startsWith('demo-')) {
        saveLocal(KEYS.VOICE, { userId, ...nftData });
        return;
    }
    try {
      await addDoc(collection(db, 'voice_registrations'), {
        userId,
        ...nftData,
        registeredAt: serverTimestamp()
      });
    } catch (e: any) {
      handleFirestoreError(e, () => saveLocal(KEYS.VOICE, { userId, ...nftData }));
    }
  },

  subscribeToVoiceRegistrations(userId: string, callback: (nfts: VoiceNFT[]) => void): Unsubscribe {
    if (isOfflineMode || userId.startsWith('demo-')) {
        callback(getLocal(KEYS.VOICE, userId));
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
        })) as VoiceNFT[];
        callback(nfts);
        }, (error) => {
            handleFirestoreError(error, () => callback(getLocal(KEYS.VOICE, userId)));
        });
    } catch(e) {
        handleFirestoreError(e, () => callback(getLocal(KEYS.VOICE, userId)));
        return () => {};
    }
  },

  // --- MARKETING CRM ---
  async addContact(userId: string, contact: { name: string, email: string, source: string }) {
    if (isOfflineMode || userId.startsWith('demo-')) {
        saveLocal(KEYS.CONTACTS, { userId, ...contact });
        return;
    }
    try {
      await addDoc(collection(db, 'contacts'), {
        userId,
        ...contact,
        addedAt: serverTimestamp()
      });
    } catch (e: any) {
      handleFirestoreError(e, () => saveLocal(KEYS.CONTACTS, { userId, ...contact }));
    }
  },

  subscribeToContacts(userId: string, callback: (contacts: any[]) => void): Unsubscribe {
    if (isOfflineMode || userId.startsWith('demo-')) {
        callback(getLocal(KEYS.CONTACTS, userId));
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
            handleFirestoreError(error, () => callback(getLocal(KEYS.CONTACTS, userId)));
        });
    } catch(e) {
        handleFirestoreError(e, () => callback(getLocal(KEYS.CONTACTS, userId)));
        return () => {};
    }
  }
};
