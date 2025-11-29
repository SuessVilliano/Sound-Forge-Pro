
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
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { GeneratedTrack } from './audioService';
import { VoiceNFT, User } from '../types';

// --- LOCAL STORAGE FALLBACK UTILITIES ---
const KEYS = {
  TRACKS: 'sf_local_tracks',
  VOICE: 'sf_local_voice',
  CONTACTS: 'sf_local_contacts'
};

// CIRCUIT BREAKER: If backend fails once, switch to offline mode permanently for session
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
    // If permission denied or config missing, switch to offline mode to stop noise
    if (error.code === 'permission-denied' || error.code === 'unavailable' || error.code === 'failed-precondition') {
        if (!isOfflineMode) {
            console.warn(`Backend unreachable (${error.code}). Switching to Offline Mode.`);
            isOfflineMode = true;
        }
    }
    fallback();
};

export const dataService = {
  // --- USER PROFILE (Real-time) ---
  
  subscribeToUserProfile(userId: string, callback: (user: User) => void): Unsubscribe {
      // If we already failed once, don't try again.
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
        // Silent fail or local delete attempt
        deleteLocal(KEYS.TRACKS, trackId);
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
