import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let auth = null;
let db = null;

try {
  // Initialize Firebase only if all required config values are present
  const hasValidConfig = Object.values(firebaseConfig).every(value => value !== undefined && value !== null && value !== '');

  if (!hasValidConfig) {
    console.warn('Firebase configuration is incomplete. Some features may not work.');
  }

  app = hasValidConfig ? initializeApp(firebaseConfig) : null;
  auth = app ? getAuth(app) : null;
  db = app ? getFirestore(app) : null;
} catch (error) {
  console.error('Error initializing Firebase:', error);
  app = null;
  auth = null;
  db = null;
}

export { app, auth, db };