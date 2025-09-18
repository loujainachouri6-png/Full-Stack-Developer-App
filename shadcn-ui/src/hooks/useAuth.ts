import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';

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

// Fallback Firebase config for development
const fallbackConfig = {
  apiKey: "AIzaSyAIXEsy0O_sIbiRtabItJh5DIL137WW0N0",
  authDomain: "wishlist-demo.firebaseapp.com",
  projectId: "wishlist-demo",
  storageBucket: "wishlist-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const getFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__firebase_config) {
    return window.__firebase_config;
  }
  return fallbackConfig;
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Initial authentication
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate');
        setLoading(false);
      }
    };

    initAuth();

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};