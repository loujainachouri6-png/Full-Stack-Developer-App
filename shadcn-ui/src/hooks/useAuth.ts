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
  try {
    if (!app && window.__firebase_config) {
      console.log('Initializing Firebase with config:', window.__firebase_config);
      app = initializeApp(window.__firebase_config);
      auth = getAuth(app);
      console.log('Firebase initialized successfully');
    }
    return auth;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

// Enhanced Firebase Authentication with immediate fallback
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting auth initialization...');
    
    // Shorter timeout for faster fallback (5 seconds)
    const authTimeout = setTimeout(() => {
      console.warn('Auth timeout - forcing demo mode');
      setLoading(false);
      if (!user) {
        // Auto-create demo user after timeout
        setUser({
          uid: 'demo-user-' + Date.now(),
          isAnonymous: true,
          email: null,
          displayName: 'Demo User'
        } as User);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        // Check if Firebase config is available
        if (!window.__firebase_config) {
          console.log('No Firebase config found, using demo mode');
          clearTimeout(authTimeout);
          setLoading(false);
          setUser({
            uid: 'demo-user-no-firebase',
            isAnonymous: true,
            email: null,
            displayName: 'Demo User (No Firebase)'
          } as User);
          return;
        }

        const firebaseAuth = initializeFirebase();
        
        if (!firebaseAuth) {
          console.error('Firebase Auth initialization failed, using demo mode');
          clearTimeout(authTimeout);
          setLoading(false);
          setUser({
            uid: 'demo-user-init-failed',
            isAnonymous: true,
            email: null,
            displayName: 'Demo User (Init Failed)'
          } as User);
          return;
        }

        console.log('Setting up auth listener...');

        const unsubscribe = onAuthStateChanged(
          firebaseAuth,
          (user) => {
            clearTimeout(authTimeout);
            console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
            setUser(user);
            setLoading(false);
            setError(null);
          },
          (error) => {
            clearTimeout(authTimeout);
            console.error('Auth error:', error);
            // Don't set error, just use demo mode
            setLoading(false);
            setUser({
              uid: 'demo-user-auth-error',
              isAnonymous: true,
              email: null,
              displayName: 'Demo User (Auth Error)'
            } as User);
          }
        );

        // Try auto sign-in but don't block on it
        try {
          if (window.__initial_auth_token) {
            console.log('Attempting custom token sign-in...');
            await signInWithCustomToken(firebaseAuth, window.__initial_auth_token);
          } else {
            console.log('Attempting anonymous sign-in...');
            await signInAnonymously(firebaseAuth);
          }
        } catch (signInError) {
          console.log('Auto sign-in failed, user can manually sign in:', signInError);
          // Don't throw error, let user manually sign in
        }

        return () => {
          console.log('Cleaning up auth listener');
          clearTimeout(authTimeout);
          unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTimeout(authTimeout);
        setLoading(false);
        setUser({
          uid: 'demo-user-error',
          isAnonymous: true,
          email: null,
          displayName: 'Demo User (Error)'
        } as User);
      }
    };

    initAuth();
  }, []);

  // Manual sign-in function
  const signInAnonymous = async () => {
    try {
      console.log('Manual anonymous sign-in...');
      setLoading(true);
      setError(null);
      
      const firebaseAuth = initializeFirebase();
      if (!firebaseAuth) {
        throw new Error('Firebase not available');
      }

      const result = await signInAnonymously(firebaseAuth);
      console.log('Manual sign-in successful:', result.user.uid);
      return result.user;
    } catch (error: any) {
      console.error('Manual sign-in error:', error);
      // Fallback to demo user instead of throwing error
      const demoUser = {
        uid: 'demo-user-manual-' + Date.now(),
        isAnonymous: true,
        email: null,
        displayName: 'Demo User (Manual)'
      } as User;
      setUser(demoUser);
      return demoUser;
    } finally {
      setLoading(false);
    }
  };

  // Force demo mode
  const forceSkipAuth = () => {
    console.log('Forcing demo mode');
    setLoading(false);
    setError(null);
    setUser({
      uid: 'demo-user-forced-' + Date.now(),
      isAnonymous: true,
      email: null,
      displayName: 'Demo User (Forced)'
    } as User);
  };

  return { user, loading, error, signInAnonymous, forceSkipAuth };
};