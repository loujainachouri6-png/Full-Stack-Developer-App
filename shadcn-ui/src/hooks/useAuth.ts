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

// Enhanced Firebase Authentication with faster initialization
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting Firebase Auth initialization...');
    
    // Reduced timeout to 5 seconds for faster fallback
    const authTimeout = setTimeout(() => {
      console.warn('Auth check timed out after 5 seconds');
      setLoading(false);
      if (!user) {
        console.log('Auto-signing in anonymously after timeout');
        handleAnonymousSignIn();
      }
    }, 5000);

    const checkAndInitialize = () => {
      // Check if Firebase config is available
      if (!window.__firebase_config) {
        // If no config after 2 seconds, create demo user
        setTimeout(() => {
          if (!window.__firebase_config) {
            console.log('No Firebase config found, using demo mode');
            clearTimeout(authTimeout);
            setUser({
              uid: 'demo-user-' + Date.now(),
              isAnonymous: true,
              email: null,
              displayName: 'Demo User'
            } as User);
            setLoading(false);
            return;
          }
        }, 2000);
        
        setTimeout(checkAndInitialize, 100);
        return;
      }

      const firebaseAuth = initializeFirebase();
      
      if (!firebaseAuth) {
        console.error('Firebase Auth initialization failed, using demo mode');
        clearTimeout(authTimeout);
        setUser({
          uid: 'demo-user-' + Date.now(),
          isAnonymous: true,
          email: null,
          displayName: 'Demo User'
        } as User);
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
          // Don't show error, just use demo mode
          setUser({
            uid: 'demo-user-' + Date.now(),
            isAnonymous: true,
            email: null,
            displayName: 'Demo User'
          } as User);
          setLoading(false);
        }
      );

      // Auto sign-in with faster fallback
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
          // Fallback to demo user immediately
          clearTimeout(authTimeout);
          setUser({
            uid: 'demo-user-' + Date.now(),
            isAnonymous: true,
            email: null,
            displayName: 'Demo User'
          } as User);
          setLoading(false);
        }
      };

      // Start auto sign-in immediately
      autoSignIn();

      return () => {
        console.log('Cleaning up auth listener');
        clearTimeout(authTimeout);
        unsubscribe();
      };
    };

    checkAndInitialize();
  }, []);

  const handleAnonymousSignIn = async () => {
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
      // Fallback to demo user
      setUser({
        uid: 'demo-user-' + Date.now(),
        isAnonymous: true,
        email: null,
        displayName: 'Demo User'
      } as User);
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

  return { user, loading, error, signInAnonymous: handleAnonymousSignIn, forceSkipAuth };
};