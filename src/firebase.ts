import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug: Log Firebase config (without sensitive data)
console.log("Firebase initializing with projectId:", firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Storage (still needed for file uploads)
const storage = getStorage(app);

// Analytics will be lazily initialized only when needed and supported
let analyticsInstance: any = null;
let analyticsInitialized = false;

export const getAnalyticsInstance = async () => {
  if (analyticsInitialized) return analyticsInstance;
  
  analyticsInitialized = true;
  
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  } catch (e) {
    console.warn("Analytics not available:", e);
  }
  
  return analyticsInstance;
};

export { app, storage };
