
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8KJDHVl3nktnBBwgnWI8jGyaQMak6So4",
  authDomain: "sound-forge-9240f.firebaseapp.com",
  projectId: "sound-forge-9240f",
  storageBucket: "sound-forge-9240f.firebasestorage.app",
  messagingSenderId: "169083712708",
  appId: "1:169083712708:web:5ada17fa74210effb64591",
  measurementId: "G-6LCDLK71ZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (safely, only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    // Only attempt to initialize if the module loaded correctly
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics initialization failed (likely ad-blocker or version mismatch):", e);
  }
}

// Export instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
