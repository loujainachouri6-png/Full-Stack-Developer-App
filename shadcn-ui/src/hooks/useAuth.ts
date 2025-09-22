import { useState, useEffect } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, User, Auth } from 'firebase/auth';

// Global variables from the platform
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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const initializeFirebase = () => {
  if (!app && window.__firebase_config) {
    app = initializeApp(window.__firebase_config);
    auth = getAuth(app);
  }
  return auth;
};

// Robust Firebase Authentication setup
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Firebase config to be available and initialize
    const checkAndInitialize = () => {
      if (window.__firebase_config) {
        const firebaseAuth = initializeFirebase();
        
        if (!firebaseAuth) {
          setError('Firebase Auth not initialized');
          setLoading(false);
          return;
        }

        console.log('Setting up auth state listener...');

        const unsubscribe = onAuthStateChanged(
          firebaseAuth,
          (user) => {
            console.log('Auth state changed:', user ? 'User signed in' : 'No user');
            setUser(user);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error('Auth state change error:', error);
            setError(error.message);
            setLoading(false);
          }
        );

        return () => {
          console.log('Cleaning up auth listener');
          unsubscribe();
        };
      } else {
        // Retry after a short delay
        setTimeout(checkAndInitialize, 100);
      }
    };

    checkAndInitialize();
  }, []);

  // Function to sign in anonymously (good for testing)
  const signInAnonymous = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseAuth = initializeFirebase();
      if (!firebaseAuth) {
        throw new Error('Firebase Auth not initialized');
      }

      const result = await signInAnonymously(firebaseAuth);
      console.log('Anonymous sign-in successful:', result.user.uid);
      return result.user;
    } catch (error: any) {
      console.error('Anonymous sign-in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signInAnonymous };
};