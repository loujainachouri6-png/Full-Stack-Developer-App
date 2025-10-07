import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Global variables from MGX platform
declare global {
  var __firebase_config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  var __initial_auth_token: string;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Get Firebase configuration from either MGX globals or environment variables
const getFirebaseConfig = (): FirebaseConfig | null => {
  // First, try MGX platform global variables
  if (typeof window !== 'undefined' && window.__firebase_config) {
    console.log('Using Firebase config from MGX platform');
    return window.__firebase_config;
  }

  // Fallback to environment variables for external deployments
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Check if all required environment variables are present
  const hasAllEnvVars = Object.values(envConfig).every(value => value && value.trim() !== '');
  
  if (hasAllEnvVars) {
    console.log('Using Firebase config from environment variables');
    return envConfig;
  }

  console.log('No Firebase config found - neither MGX globals nor environment variables');
  return null;
};

// Initialize Firebase app
export const initializeFirebaseApp = (): FirebaseApp | null => {
  if (app) return app;

  const config = getFirebaseConfig();
  if (!config) {
    console.log('Firebase initialization skipped - no configuration available');
    return null;
  }

  try {
    app = initializeApp(config);
    console.log('Firebase app initialized successfully');
    return app;
  } catch (error) {
    console.error('Firebase app initialization failed:', error);
    return null;
  }
};

// Initialize Firebase Auth
export const initializeFirebaseAuth = (): Auth | null => {
  if (auth) return auth;

  const firebaseApp = initializeFirebaseApp();
  if (!firebaseApp) return null;

  try {
    auth = getAuth(firebaseApp);
    console.log('Firebase Auth initialized successfully');
    return auth;
  } catch (error) {
    console.error('Firebase Auth initialization failed:', error);
    return null;
  }
};

// Initialize Firestore
export const initializeFirestore = (): Firestore | null => {
  if (db) return db;

  const firebaseApp = initializeFirebaseApp();
  if (!firebaseApp) return null;

  try {
    db = getFirestore(firebaseApp);
    console.log('Firestore initialized successfully');
    return db;
  } catch (error) {
    console.error('Firestore initialization failed:', error);
    return null;
  }
};

// Check if Firebase is available
export const isFirebaseAvailable = (): boolean => {
  return getFirebaseConfig() !== null;
};

// Get initial auth token (MGX platform specific)
export const getInitialAuthToken = (): string | null => {
  if (typeof window !== 'undefined' && window.__initial_auth_token) {
    return window.__initial_auth_token;
  }
  return null;
};

// Export configuration checker for debugging
export const getConfigurationStatus = () => {
  const mgxConfig = typeof window !== 'undefined' && window.__firebase_config;
  const envConfig = {
    apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
  };

  return {
    mgxConfigAvailable: !!mgxConfig,
    envConfigComplete: Object.values(envConfig).every(Boolean),
    envConfig,
    firebaseAvailable: isFirebaseAvailable()
  };
};