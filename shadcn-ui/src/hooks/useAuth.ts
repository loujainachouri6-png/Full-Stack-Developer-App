import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken, User } from 'firebase/auth';
import { initializeFirebaseAuth, isFirebaseAvailable, getInitialAuthToken, getConfigurationStatus } from '@/lib/firebase';

// FIXED: Enhanced Firebase Authentication with environment variable support
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting Firebase Auth initialization...');
    
    // Log configuration status for debugging
    const configStatus = getConfigurationStatus();
    console.log('Firebase configuration status:', configStatus);
    
    // FIXED: Reduced timeout to 3 seconds for faster fallback
    const authTimeout = setTimeout(() => {
      console.warn('Auth check timed out after 3 seconds, switching to demo mode');
      setLoading(false);
      if (!user) {
        console.log('Auto-creating demo user after timeout');
        setUser({
          uid: 'demo-user-' + Date.now(),
          isAnonymous: true,
          email: null,
          displayName: 'Demo User'
        } as User);
      }
    }, 3000);

    const checkAndInitialize = () => {
      // FIXED: Check if Firebase is available (either MGX or environment variables)
      if (!isFirebaseAvailable()) {
        // FIXED: Reduced wait time from 2 seconds to 1 second
        setTimeout(() => {
          if (!isFirebaseAvailable()) {
            console.log('No Firebase config found (neither MGX nor environment variables), using demo mode immediately');
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
        }, 1000);
        
        setTimeout(checkAndInitialize, 100);
        return;
      }

      const firebaseAuth = initializeFirebaseAuth();
      
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
          const initialToken = getInitialAuthToken();
          if (initialToken) {
            console.log('Attempting sign-in with custom token...');
            await signInWithCustomToken(firebaseAuth, initialToken);
          } else {
            console.log('Attempting anonymous sign-in...');
            await signInAnonymously(firebaseAuth);
          }
        } catch (error: unknown) {
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
      
      const firebaseAuth = initializeFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error('Firebase Auth not initialized');
      }

      const result = await signInAnonymously(firebaseAuth);
      console.log('Manual anonymous sign-in successful:', result.user.uid);
      return result.user;
    } catch (error: unknown) {
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

  // FIXED: Immediate demo mode bypass
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