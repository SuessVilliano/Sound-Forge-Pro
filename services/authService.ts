
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

const STORAGE_KEY = 'soundforge_user_session';

// Manual observers to handle local state updates when Firebase is not available
const observers: ((user: User | null) => void)[] = [];

const notifyObservers = (user: User | null) => {
  observers.forEach(callback => callback(user));
};

export const authService = {
  /**
   * Register with Email and Password
   */
  registerWithEmail: async (name: string, email: string, pass: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = result.user;

      // Update Display Name
      try {
        await updateProfile(fbUser, { displayName: name });
      } catch (e) { console.warn("Profile update warning", e); }

      // Create User Profile in Firestore
      const newUser: User = {
        uid: fbUser.uid,
        displayName: name,
        email: email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
        plan: 'free',
        voiceShieldEnabled: false,
        walletBalance: 0
      };

      try {
        await setDoc(doc(db, "users", fbUser.uid), newUser);
      } catch (e) {
        // Silent fail, dataService will handle storage
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return newUser;

    } catch (error: any) {
      // Suppress logging for known infrastructure errors
      const isConfigError = error.code === 'auth/configuration-not-found' || 
                           error.code === 'auth/operation-not-allowed' || 
                           error.code === 'auth/network-request-failed';

      if (!isConfigError) {
          console.error("Registration Error", error);
      }
      
      // Handle actual user input errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered. Please login.");
      }
      if (error.code === 'auth/weak-password') {
        throw new Error("Password should be at least 6 characters.");
      }
      
      // FAIL-SAFE: For infrastructure errors, allow entry as demo user
      if (isConfigError) {
          console.warn(`Auth Config Issue (${error.code}). Falling back to Local Mode.`);
      }
      
      const demoUser = authService._createDemoUser(name, email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      notifyObservers(demoUser); 
      return demoUser;
    }
  },

  /**
   * Login with Email and Password
   */
  loginWithEmail: async (email: string, pass: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return await authService._fetchUserProfile(result.user);
    } catch (error: any) {
      const isConfigError = error.code === 'auth/configuration-not-found' || 
                           error.code === 'auth/operation-not-allowed';

      if (!isConfigError) {
          console.error("Login Error", error);
      }
      
      // Handle actual credential errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error("Invalid email or password.");
      }
      
      // FAIL-SAFE
      if (isConfigError) {
          console.warn(`Auth Config Issue (${error.code}). Falling back to Local Mode.`);
      }
      
      const demoUser = authService._createDemoUser("Artist", email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      notifyObservers(demoUser); 
      return demoUser;
    }
  },

  /**
   * Login with Google
   */
  loginWithGoogle: async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await authService._fetchUserProfile(result.user);
    } catch (error: any) {
      // 1. Check for User Cancellation (Throw so UI can handle "Cancelled")
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          throw new Error("Login cancelled.");
      }

      // 2. Check for Config/Infra Errors (Suppress error log, just warn)
      const isConfigError = error.code === 'auth/configuration-not-found' || 
                           error.code === 'auth/operation-not-allowed' || 
                           error.code === 'auth/unauthorized-domain';

      if (!isConfigError) {
          // Only log unexpected errors (like quota exceeded)
          console.error("Google Login Error", error);
      } else {
          console.warn(`Google Sign-In Config Issue (${error.code}). Falling back to Local Mode.`);
      }
      
      // 3. FAIL-SAFE: Always fallback to Demo User for config/network errors
      const demoUser = authService._createDemoUser("Demo Artist", "demo@soundforge.pro");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      notifyObservers(demoUser); 
      return demoUser;
    }
  },

  /**
   * Helper: Fetch or Create User Profile from Firestore
   */
  _fetchUserProfile: async (fbUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, "users", fbUser.uid);
    let appUser: User;
    
    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
          appUser = userSnap.data() as User;
      } else {
          appUser = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'Artist',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'A')}`,
              plan: 'free', 
              voiceShieldEnabled: false,
              walletBalance: 0
          };
          await setDoc(userDocRef, appUser);
      }
    } catch (firestoreError) {
      // Fallback profile if Firestore is down
      appUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Artist',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          plan: 'free',
          voiceShieldEnabled: false,
          walletBalance: 0
      };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
    return appUser;
  },

  /**
   * Helper: Create Demo User
   */
  _createDemoUser: (name: string, email: string): User => ({
      uid: 'demo-' + Math.floor(Math.random() * 10000),
      displayName: name,
      email: email,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
      plan: 'free',
      voiceShieldEnabled: false,
      walletBalance: 0
  }),

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        // Ignore errors
    }
    localStorage.removeItem(STORAGE_KEY);
    notifyObservers(null);
  },

  /**
   * Real-time Session Listener
   */
  observeAuth: (callback: (user: User | null) => void) => {
    // Add to manual observers for local state updates
    observers.push(callback);

    // Check local storage first for immediate render
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const localUser = JSON.parse(stored);
            callback(localUser);
        } catch(e) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    // Subscribe to Firebase Auth changes
    const firebaseUnsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
            authService._fetchUserProfile(fbUser).then(u => callback(u));
        } else {
            // If Firebase says logged out, check if we are maintaining a local session
            const currentStored = localStorage.getItem(STORAGE_KEY);
            if (currentStored) {
                const u = JSON.parse(currentStored);
                if (u.uid.startsWith('demo-')) {
                    callback(u); // Keep demo user session active
                    return;
                }
            }
            callback(null);
        }
    });

    // Return combined unsubscribe
    return () => {
        firebaseUnsubscribe();
        const index = observers.indexOf(callback);
        if (index > -1) {
            observers.splice(index, 1);
        }
    };
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  updateUserPlan: async (plan: 'free' | 'pro' | 'label'): Promise<User> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("No user logged in");

    const updatedUser = { 
        ...currentUser, 
        plan,
        voiceShieldEnabled: plan !== 'free' 
    };
    
    if (!currentUser.uid.startsWith('demo-')) {
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, { 
                plan: plan, 
                voiceShieldEnabled: plan !== 'free' 
            });
        } catch (e) { /* ignore */ }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    notifyObservers(updatedUser); 
    return updatedUser;
  }
};
