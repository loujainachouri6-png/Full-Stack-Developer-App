import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';

// Global variables
declare global {
  var __firebase_config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  var __app_id: string;
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

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) {
    return window.__app_id;
  }
  return 'demo-app';
};

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);

export interface Product {
  id: string;
  productName: string;
  description: string;
  imageUrl: string;
  originalUrl: string;
  isPublic: boolean;
  timestamp: Timestamp | null;
}

export const useFirestore = (userId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const appId = getAppId();
    const collectionPath = `artifacts/${appId}/users/${userId}/wishlist`;
    const q = query(
      collection(db, collectionPath),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const productList: Product[] = [];
        snapshot.forEach((doc) => {
          productList.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productList);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Failed to load wishlist');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addProduct = async (productData: Omit<Product, 'id' | 'timestamp'>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const appId = getAppId();
      const collectionPath = `artifacts/${appId}/users/${userId}/wishlist`;
      await addDoc(collection(db, collectionPath), {
        ...productData,
        timestamp: serverTimestamp()
      });

      // Also add to public collection if isPublic is true
      if (productData.isPublic) {
        const publicPath = `artifacts/${appId}/public/data/wishlists`;
        await addDoc(collection(db, publicPath), {
          ...productData,
          userId,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error adding product:', err);
      throw new Error('Failed to add product');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const appId = getAppId();
      const collectionPath = `artifacts/${appId}/users/${userId}/wishlist`;
      await deleteDoc(doc(db, collectionPath, productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw new Error('Failed to delete product');
    }
  };

  return { products, loading, error, addProduct, deleteProduct };
};

export const usePublicWishlist = (targetUserId: string | null) => {
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setPublicProducts([]);
      return;
    }

    setLoading(true);
    const appId = getAppId();
    const publicPath = `artifacts/${appId}/public/data/wishlists`;
    const q = query(
      collection(db, publicPath),
      where('userId', '==', targetUserId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const productList: Product[] = [];
        snapshot.forEach((doc) => {
          productList.push({ id: doc.id, ...doc.data() } as Product);
        });
        setPublicProducts(productList);
        setLoading(false);
      },
      (err) => {
        console.error('Public wishlist error:', err);
        setError('Failed to load public wishlist');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetUserId]);

  return { publicProducts, loading, error };
};