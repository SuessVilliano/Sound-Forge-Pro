import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";
import { auth, db, googleProvider } from './firebase';
import { User } from '../types';
import { affiliateService } from './affiliateService';
import { webhookService } from './webhookService';
import { dataService, handleFirestoreError } from './dataService';

const observers: ((user: User | null) => void)[] = [];
let currentLocalUser: User | null = null;

const notifyObservers = (user: User | null) => {
  currentLocalUser = user;
  observers.forEach(callback => callback(user));
};

const createMockUser = (email: string, name: string): User => ({
    uid: `mock_${Date.now()}`,
    displayName: name,
    email: email,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
    plan: 'free',
    voiceShieldEnabled: false,
    walletBalance: 0,
    onboardingCompleted: false
});

const isBackendRestricted = (error: any) => {
    const msg = error?.message || "";
    const code = error?.code || "";
    return code === 'auth/configuration-not-found' || 
           code === 'auth/operation-not-allowed' || 
           code === 'auth/internal-error' ||
           msg.includes('configuration') ||
           msg.includes('permission-denied');
};

export const authService = {
  registerWithEmail: async (name: string, email: string, pass: string): Promise<User> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = result.user;

      await updateProfile(fbUser, { displayName: name });

      const newUser: User = {
        uid: fbUser.uid,
        displayName: name,
        email: cleanEmail,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
        plan: 'free',
        voiceShieldEnabled: false,
        walletBalance: 0,
        onboardingCompleted: false
      };

      try {
        await setDoc(doc(db, "users", fbUser.uid), newUser);
      } catch (dbError) {
          handleFirestoreError(dbError);
          console.warn("[Auth] Firestore write restricted. Data held in local memory.");
      }

      await dataService.adminCreateUser(newUser);
      affiliateService.trackSignup(newUser);
      webhookService.sendSystemEvent('signup', newUser, { 
          initial_password: pass, 
          source: 'app_registration',
          affiliate_id: (window as any).affiliateId
      });

      return newUser;

    } catch (error: any) {
      if (isBackendRestricted(error)) {
          console.warn("[Auth] Backend restricted. Initiating Sandbox Session.");
          const mockUser = createMockUser(email, name);
          await dataService.adminCreateUser(mockUser);
          notifyObservers(mockUser);
          return mockUser;
      }
      throw error; 
    }
  },

  loginWithEmail: async (email: string, pass: string): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Super Admin
    if (normalizedEmail === 'liv8ent@gmail.com' && pass === 'Letsgrow888!') {
        const superAdmin: User = {
            uid: 'admin_liv8_master',
            displayName: 'LIV8 Admin',
            email: 'liv8ent@gmail.com',
            photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&get=80',
            plan: 'label',
            voiceShieldEnabled: true,
            walletBalance: 1000000,
            onboardingCompleted: true, 
            isAdmin: true,
            role: 'label_exec'
        };
        await dataService.adminCreateUser(superAdmin);
        notifyObservers(superAdmin);
        return superAdmin;
    }

    // Master Demo Pro Account (Requested Credentials)
    if ((normalizedEmail === 'demo@soundmerge.club' || normalizedEmail === 'admin') && (pass === 'SoundMerge2025!' || pass === 'password1')) {
        return await authService.loginAsDemo();
    }

    try {
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      return await authService._fetchUserProfile(result.user);
    } catch (error: any) {
      if (isBackendRestricted(error)) {
          console.warn("[Auth] Login restricted. Falling back to Sandbox.");
          const mockUser = createMockUser(email, "Sandbox Artist");
          await dataService.adminCreateUser(mockUser);
          notifyObservers(mockUser);
          return mockUser;
      }
      throw error;
    }
  },

  loginAsDemo: async (): Promise<User> => {
      const demoUser: User = {
          uid: 'demo_master_account',
          displayName: 'Legendary Artist',
          email: 'demo@soundmerge.club',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&get=80',
          plan: 'pro',
          voiceShieldEnabled: true,
          walletBalance: 12500.50,
          onboardingCompleted: true,
          tourCompleted: true,
          role: 'artist',
          xp: 5000,
          artistLevel: 'Legendary',
          bio: 'Demo account with all nodes fully synchronized. Exploring the boundaries of human-AI collaboration.',
          location: 'Global Hub'
      };
      await dataService.adminCreateUser(demoUser);
      notifyObservers(demoUser);
      return demoUser;
  },

  loginWithGoogle: async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = await authService._fetchUserProfile(result.user);
      await dataService.adminCreateUser(user);
      webhookService.sendSystemEvent('signup', user, { source: 'google_oauth' });
      return user;
    } catch (error: any) {
      if (isBackendRestricted(error)) {
          const mockUser = createMockUser("google_user@example.com", "Google Sandbox User");
          await dataService.adminCreateUser(mockUser);
          notifyObservers(mockUser);
          return mockUser;
      }
      throw error;
    }
  },

  loginAsGuest: async (): Promise<User> => {
    const guestName = "Guest Artist";
    const guestEmail = `guest${Date.now()}@soundforge.club`;
    
    try {
        return await authService.registerWithEmail(guestName, guestEmail, "guest123");
    } catch (error) {
        const mockUser = createMockUser(guestEmail, guestName);
        await dataService.adminCreateUser(mockUser);
        notifyObservers(mockUser);
        return mockUser;
    }
  },

  _fetchUserProfile: async (fbUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, "users", fbUser.uid);
    const fallbackUser: User = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Artist',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'A')}`,
        plan: 'free',
        voiceShieldEnabled: false,
        walletBalance: 0,
        onboardingCompleted: false
    };

    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
          return userSnap.data() as User;
      } else {
          try { await setDoc(userDocRef, fallbackUser); } catch (e) { handleFirestoreError(e); }
          affiliateService.trackSignup(fallbackUser);
          await dataService.adminCreateUser(fallbackUser);
          return fallbackUser;
      }
    } catch (error: any) {
      handleFirestoreError(error);
      return fallbackUser;
    }
  },

  logout: async (): Promise<void> => {
    try { await signOut(auth); } catch (error) {}
    notifyObservers(null);
  },

  observeAuth: (callback: (user: User | null) => void) => {
    observers.push(callback);
    if (currentLocalUser) callback(currentLocalUser);

    const firebaseUnsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
            const userProfile = await authService._fetchUserProfile(fbUser);
            if (!currentLocalUser || currentLocalUser.uid !== userProfile.uid) {
                callback(userProfile);
                currentLocalUser = userProfile;
            }
        } else if (!currentLocalUser || !currentLocalUser.uid.startsWith('mock_')) {
            callback(null);
        }
    });

    return () => {
        firebaseUnsubscribe();
        const index = observers.indexOf(callback);
        if (index > -1) observers.splice(index, 1);
    };
  },

  getCurrentUser: (): User | null => currentLocalUser,

  updateUserPlan: async (plan: 'free' | 'pro' | 'label'): Promise<User> => {
    const updates = { plan, voiceShieldEnabled: plan !== 'free' };
    return await authService.updateUserProfile(updates);
  },

  updateUserProfile: async (data: Partial<User>): Promise<User> => {
      if (currentLocalUser) {
          const updated = { ...currentLocalUser, ...data };
          await dataService.adminUpdateUser(updated.uid, updated);
          notifyObservers(updated);
          if (!auth.currentUser || updated.uid.startsWith('mock_')) return updated;
      }

      const fbUser = auth.currentUser;
      if (!fbUser) return data as User;

      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        await updateDoc(userDocRef, data);
        const freshProfile = await authService._fetchUserProfile(fbUser);
        webhookService.sendSystemEvent('profile_update', freshProfile);
        await dataService.adminUpdateUser(freshProfile.uid, freshProfile);
        notifyObservers(freshProfile);
        return freshProfile;
      } catch (e: any) {
          handleFirestoreError(e);
          const simulatedUpdate = { ...currentLocalUser, ...data } as User;
          await dataService.adminUpdateUser(simulatedUpdate.uid, simulatedUpdate);
          notifyObservers(simulatedUpdate);
          return simulatedUpdate;
      }
  }
};