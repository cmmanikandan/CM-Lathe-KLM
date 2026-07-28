import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_HZpOmS-E0V7B5bqE0e_UKYFo02kKW6U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "manikandan-lathe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "manikandan-lathe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "manikandan-lathe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "712260934204",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:712260934204:web:7444e496eed5eebbaf0139",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MHRFLQ0JS5"
};

// Initialize Firebase App
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
