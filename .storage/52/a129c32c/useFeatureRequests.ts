import { useState, useEffect } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { FeatureRequest, App, AnalyticsData } from '@/types/FeatureRequest';
import { 
  analyzeFeatureRequest, 
  calculatePriorityScore, 
  estimateEffort, 
  assessBusinessImpact,
  detectDuplicates
} from '@/lib/aiAnalysis';

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

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

const initializeFirestore = () => {
  if (!app && window.__firebase_config) {
    app = initializeApp(window.__firebase_config);
    db = getFirestore(app);
  }
  return db;
};

export const useFeatureRequests = (userId: string | null, userRole: string = 'external') => {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const checkFirestore = () => {
      const firestore = initializeFirestore();
      
      if (!firestore) {
        // Use demo data if Firestore not available
        console.log('Using demo data - Firestore not available');
        setRequests([]);
        setLoading(false);
        return;
      }

      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      // Create query based on user role
      let q;
      if (userRole === 'admin' || userRole === 'manager') {
        // Admins see all requests
        q = query(
          collection(firestore, collectionPath),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Regular users see their own requests + public ones
        q = query(
          collection(firestore, collectionPath),
          orderBy('timestamp', 'desc')
        );
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const requestList: FeatureRequest[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            requestList.push({ 
              id: doc.id, 
              ...data,
              timestamp: data.timestamp || null,
              aiAnalysis: data.aiAnalysis ? {
                ...data.aiAnalysis,
                analysisTimestamp: data.aiAnalysis.analysisTimestamp || null
              } : undefined,
              priorityScore: data.priorityScore ? {
                ...data.priorityScore,
                calculatedAt: data.priorityScore.calculatedAt || null
              } : undefined,
              effortEstimate: data.effortEstimate ? {
                ...data.effortEstimate,
                estimatedAt: data.effortEstimate.estimatedAt || null
              } : undefined,
              businessImpact: data.businessImpact ? {
                ...data.businessImpact,
                assessedAt: data.businessImpact.assessedAt || null
              } : undefined
            } as FeatureRequest);
          });
          setRequests(requestList);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore error:', err);
          setError('Failed to load feature requests');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    };

    checkFirestore();
  }, [userId, userRole]);

  const submitRequest = async (requestData: {
    title: string;
    description: string;
    userPriority: 'low' | 'medium' | 'high' | 'critical';
    appId: string;
    appName: string;
    tags?: string[];
    testerInfo: {
      name: string;
      email: string;
      role: string;
    };
  }) => {
    if (!userId) throw new Error('User not authenticated');

    const firestore = initializeFirestore();
    
    // FIXED: Always use demo mode when Firestore not available
    if (!firestore) {
      console.log('Creating demo request - Firestore not available');
      const demoRequest: FeatureRequest = {
        id: 'demo-' + Date.now(),
        title: requestData.title,
        description: requestData.description,
        submittedBy: userId,
        submitterName: requestData.testerInfo.name,
        submitterRole: requestData.testerInfo.role as any,
        appId: requestData.appId,
        appName: requestData.appName,
        status: 'submitted',
        userPriority: requestData.userPriority,
        timestamp: { toDate: () => new Date() } as Timestamp,
        votes: 0,
        comments: [],
        watchers: [userId],
        tags: requestData.tags || [],
        // Add AI analysis for demo
        aiAnalysis: {
          category: 'enhancement',
          complexity: Math.floor(Math.random() * 5) + 1,
          clarityScore: Math.floor(Math.random() * 10) + 1,
          sentiment: 'positive',
          keywords: requestData.tags || [],
          confidence: 0.8,
          duplicates: [],
          enhancementSuggestions: ['Consider adding more specific requirements', 'Include user impact metrics'],
          analysisTimestamp: { toDate: () => new Date() } as Timestamp
        },
        priorityScore: {
          overall: Math.random() * 10,
          businessImpact: Math.random() * 10,
          userDemand: Math.random() * 10,
          technicalFeasibility: Math.random() * 10,
          strategicAlignment: Math.random() * 10,
          calculatedAt: { toDate: () => new Date() } as Timestamp
        }
      };
      
      setRequests(prev => [demoRequest, ...prev]);
      return demoRequest.id;
    }

    try {
      // Create initial request with tester information
      const newRequest: Omit<FeatureRequest, 'id'> = {
        title: requestData.title,
        description: requestData.description,
        submittedBy: userId,
        submitterName: requestData.testerInfo.name,
        submitterRole: requestData.testerInfo.role as any,
        appId: requestData.appId,
        appName: requestData.appName,
        status: 'analyzing',
        userPriority: requestData.userPriority,
        timestamp: serverTimestamp() as Timestamp,
        votes: 0,
        comments: [],
        watchers: [userId],
        tags: requestData.tags || [],
        // Store tester contact info
        testerEmail: requestData.testerInfo.email
      };

      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      const docRef = await addDoc(collection(firestore, collectionPath), newRequest);

      // Perform AI analysis in background
      performAIAnalysis(docRef.id, requestData.title, requestData.description, requestData.appName);

      return docRef.id;
    } catch (err) {
      console.error('Error submitting request:', err);
      throw new Error('Failed to submit feature request');
    }
  };

  const performAIAnalysis = async (
    requestId: string, 
    title: string, 
    description: string, 
    appContext: string
  ) => {
    try {
      const firestore = initializeFirestore();
      if (!firestore) return;

      // Step 1: AI Analysis
      const analysis = await analyzeFeatureRequest(title, description, appContext);
      
      // Step 2: Detect duplicates
      const duplicates = await detectDuplicates({ title, description }, requests);
      
      // Update with AI analysis
      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      const docPath = `${collectionPath}/${requestId}`;
      await updateDoc(doc(firestore, docPath), {
        aiAnalysis: {
          ...analysis,
          duplicates,
          analysisTimestamp: serverTimestamp()
        },
        status: 'reviewed'
      });

      // Get the updated request for further analysis
      const updatedRequest = requests.find(r => r.id === requestId);
      if (!updatedRequest) return;

      // Step 3: Calculate priority score
      const priorityScore = await calculatePriorityScore(
        { ...updatedRequest, aiAnalysis: { ...analysis, duplicates, analysisTimestamp: serverTimestamp() as Timestamp } },
        analysis,
        1 // Base user demand factor
      );

      // Step 4: Estimate effort
      const effortEstimate = await estimateEffort(updatedRequest, analysis);

      // Step 5: Assess business impact
      const businessImpact = await assessBusinessImpact(updatedRequest, analysis);

      // Final update with all analysis
      await updateDoc(doc(firestore, docPath), {
        priorityScore: {
          ...priorityScore,
          calculatedAt: serverTimestamp()
        },
        effortEstimate: {
          ...effortEstimate,
          estimatedAt: serverTimestamp()
        },
        businessImpact: {
          ...businessImpact,
          assessedAt: serverTimestamp()
        }
      });

    } catch (error) {
      console.error('AI Analysis failed:', error);
      
      // Update status to indicate analysis failed
      const firestore = initializeFirestore();
      if (firestore) {
        const collectionPath = window.__app_id ? 
          `artifacts/${window.__app_id}/feature-requests` : 
          'feature-requests';
        
        const docPath = `${collectionPath}/${requestId}`;
        await updateDoc(doc(firestore, docPath), {
          status: 'submitted',
          aiAnalysis: {
            category: 'enhancement',
            complexity: 3,
            clarityScore: 5,
            sentiment: 'neutral',
            keywords: [],
            confidence: 0.3,
            duplicates: [],
            enhancementSuggestions: ['AI analysis failed - manual review needed'],
            analysisTimestamp: serverTimestamp()
          }
        });
      }
    }
  };

  const updateRequestStatus = async (requestId: string, status: FeatureRequest['status']) => {
    if (!userId) throw new Error('User not authenticated');

    const firestore = initializeFirestore();
    
    // If no Firestore, update demo data
    if (!firestore) {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status, ...(status === 'completed' && { actualCompletion: { toDate: () => new Date() } as Timestamp }) }
          : req
      ));
      return;
    }

    try {
      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      const docPath = `${collectionPath}/${requestId}`;
      await updateDoc(doc(firestore, docPath), {
        status,
        ...(status === 'completed' && { actualCompletion: serverTimestamp() })
      });
    } catch (err) {
      console.error('Error updating status:', err);
      throw new Error('Failed to update request status');
    }
  };

  const voteOnRequest = async (requestId: string, increment: boolean = true) => {
    if (!userId) throw new Error('User not authenticated');

    const firestore = initializeFirestore();
    
    // If no Firestore, update demo data
    if (!firestore) {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, votes: Math.max(0, req.votes + (increment ? 1 : -1)) }
          : req
      ));
      return;
    }

    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      const docPath = `${collectionPath}/${requestId}`;
      await updateDoc(doc(firestore, docPath), {
        votes: Math.max(0, request.votes + (increment ? 1 : -1))
      });
    } catch (err) {
      console.error('Error voting on request:', err);
      throw new Error('Failed to vote on request');
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!userId) throw new Error('User not authenticated');

    const firestore = initializeFirestore();
    
    // If no Firestore, update demo data
    if (!firestore) {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      return;
    }

    try {
      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      const docPath = `${collectionPath}/${requestId}`;
      await deleteDoc(doc(firestore, docPath));
    } catch (err) {
      console.error('Error deleting request:', err);
      throw new Error('Failed to delete request');
    }
  };

  return { 
    requests, 
    loading, 
    error, 
    submitRequest, 
    updateRequestStatus,
    voteOnRequest,
    deleteRequest
  };
};

export const useAnalytics = (userId: string | null) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkFirestore = () => {
      const firestore = initializeFirestore();
      
      if (!firestore) {
        // Demo analytics
        setAnalytics({
          totalRequests: 0,
          requestsByCategory: {},
          requestsByStatus: {},
          averagePriorityScore: 0,
          topRequestedFeatures: [],
          trendData: []
        });
        setLoading(false);
        return;
      }

      const collectionPath = window.__app_id ? 
        `artifacts/${window.__app_id}/feature-requests` : 
        'feature-requests';
      
      const q = query(collection(firestore, collectionPath));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allRequests: FeatureRequest[] = [];
        snapshot.forEach((doc) => {
          allRequests.push({ id: doc.id, ...doc.data() } as FeatureRequest);
        });

        // Calculate analytics
        const totalRequests = allRequests.length;
        
        const requestsByCategory = allRequests.reduce((acc, req) => {
          const category = req.aiAnalysis?.category || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const requestsByStatus = allRequests.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const averagePriorityScore = allRequests
          .filter(req => req.priorityScore)
          .reduce((sum, req) => sum + (req.priorityScore?.overall || 0), 0) / 
          Math.max(allRequests.filter(req => req.priorityScore).length, 1);

        const topRequestedFeatures = allRequests
          .sort((a, b) => (b.priorityScore?.overall || 0) - (a.priorityScore?.overall || 0))
          .slice(0, 5);

        setAnalytics({
          totalRequests,
          requestsByCategory,
          requestsByStatus,
          averagePriorityScore,
          topRequestedFeatures,
          trendData: [] // Would need historical data for trends
        });
        
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkFirestore();
  }, [userId]);

  return { analytics, loading };
};