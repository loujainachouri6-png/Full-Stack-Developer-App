import { useState, useEffect } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken, User, Auth } from 'firebase/auth';

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

// Enhanced Firebase Authentication with timeout and debugging
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting Firebase Auth initialization...');
    
    // Set a timeout to prevent infinite loading (10 seconds)
    const authTimeout = setTimeout(() => {
      console.warn('Auth check timed out after 10 seconds');
      setLoading(false);
      if (!user) {
        console.log('No user found after timeout, showing sign-in options');
      }
    }, 10000);

    const checkAndInitialize = () => {
      if (!window.__firebase_config) {
        console.log('Waiting for Firebase config...');
        setTimeout(checkAndInitialize, 100);
        return;
      }

      const firebaseAuth = initializeFirebase();
      
      if (!firebaseAuth) {
        console.error('Firebase Auth initialization failed');
        clearTimeout(authTimeout);
        setError('Firebase Auth not initialized');
        setLoading(false);
        return;
      }

      console.log('Firebase Auth initialized, setting up listener...');

      const unsubscribe = onAuthStateChanged(
        firebaseAuth,
        (user) => {
          clearTimeout(authTimeout);
          console.log('Auth state changed:', user ? `User signed in: ${user.uid}` : 'No user');
          setUser(user);
          setLoading(false);
          setError(null);
        },
        (error) => {
          clearTimeout(authTimeout);
          console.error('Auth state change error:', error);
          setError(error.message);
          setLoading(false);
        }
      );

      // Auto sign-in logic with better error handling
      const autoSignIn = async () => {
        try {
          if (window.__initial_auth_token) {
            console.log('Attempting sign-in with custom token...');
            await signInWithCustomToken(firebaseAuth, window.__initial_auth_token);
          } else {
            console.log('Attempting anonymous sign-in...');
            await signInAnonymously(firebaseAuth);
          }
        } catch (error: any) {
          console.error('Auto sign-in error:', error);
          // Don't set error here, let user manually retry
          console.log('Auto sign-in failed, user will need to manually sign in');
        }
      };

      autoSignIn();

      return () => {
        console.log('Cleaning up auth listener');
        clearTimeout(authTimeout);
        unsubscribe();
      };
    };

    checkAndInitialize();
  }, []);

  // Manual sign-in function with better error handling
  const signInAnonymous = async () => {
    try {
      console.log('Manual anonymous sign-in attempt...');
      setLoading(true);
      setError(null);
      
      const firebaseAuth = initializeFirebase();
      if (!firebaseAuth) {
        throw new Error('Firebase Auth not initialized');
      }

      const result = await signInAnonymously(firebaseAuth);
      console.log('Manual anonymous sign-in successful:', result.user.uid);
      return result.user;
    } catch (error: any) {
      console.error('Manual anonymous sign-in error:', error);
      setError(`Sign-in failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Demo mode bypass for testing
  const forceSkipAuth = () => {
    console.log('Forcing skip of authentication - demo mode');
    setLoading(false);
    setError(null);
    setUser({
      uid: 'demo-user-' + Date.now(),
      isAnonymous: true,
      email: null,
      displayName: 'Demo User'
    } as User);
  };

  return { user, loading, error, signInAnonymous, forceSkipAuth };
};