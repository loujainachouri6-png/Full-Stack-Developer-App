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
  where
} from 'firebase/firestore';

// Global variables
declare global {
  var __firebase_config: any;
  var __app_id: string;
}

const app = initializeApp(window.__firebase_config);
const db = getFirestore(app);

export interface Product {
  id: string;
  productName: string;
  description: string;
  imageUrl: string;
  originalUrl: string;
  isPublic: boolean;
  timestamp: any;
}

export const useFirestore = (userId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const collectionPath = `artifacts/${window.__app_id}/users/${userId}/wishlist`;
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
      const collectionPath = `artifacts/${window.__app_id}/users/${userId}/wishlist`;
      await addDoc(collection(db, collectionPath), {
        ...productData,
        timestamp: serverTimestamp()
      });

      // Also add to public collection if isPublic is true
      if (productData.isPublic) {
        const publicPath = `artifacts/${window.__app_id}/public/data/wishlists`;
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
      const collectionPath = `artifacts/${window.__app_id}/users/${userId}/wishlist`;
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
    const publicPath = `artifacts/${window.__app_id}/public/data/wishlists`;
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