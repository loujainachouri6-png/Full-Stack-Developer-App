import { Timestamp } from 'firebase/firestore';

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  submitterName?: string;
  submitterRole: 'internal' | 'external' | 'enterprise' | 'community';
  appId: string;
  appName: string;
  status: 'submitted' | 'analyzing' | 'reviewed' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  userPriority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Timestamp;
  testerEmail?: string;

  
  // AI Analysis Results
  aiAnalysis?: {
    category: 'enhancement' | 'bug-fix' | 'new-feature' | 'ui-ux' | 'performance' | 'integration';
    complexity: number; // 1-5 scale
    clarityScore: number; // 1-10 scale
    sentiment: 'frustrated' | 'neutral' | 'excited';
    keywords: string[];
    confidence: number; // 0-1 scale
    duplicates: string[]; // IDs of similar requests
    enhancementSuggestions: string[];
    analysisTimestamp: Timestamp;
  };
  
  // Priority Scoring
  priorityScore?: {
    overall: number; // 1-10 scale
    businessImpact: number;
    userDemand: number;
    strategicAlignment: number;
    implementationFeasibility: number;
    calculatedAt: Timestamp;
  };
  
  // Effort Estimation
  effortEstimate?: {
    totalHours: number;
    frontendHours: number;
    backendHours: number;
    designHours: number;
    qaHours: number;
    riskFactors: string[];
    dependencies: string[];
    teamMembers: string[];
    estimatedAt: Timestamp;
  };
  
  // Business Impact
  businessImpact?: {
    retentionImpact: number; // 1-10 scale
    revenueImpact: number; // 1-10 scale
    competitiveAdvantage: number; // 1-10 scale
    uxImprovement: number; // 1-10 scale
    operationalEfficiency: number; // 1-10 scale
    assessedAt: Timestamp;
  };
  
  // Community Features
  votes: number;
  comments: Comment[];
  watchers: string[]; // User IDs watching this request
  
  // Metadata
  tags: string[];
  assignedTo?: string;
  targetRelease?: string;
  estimatedCompletion?: Timestamp;
  actualCompletion?: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  timestamp: Timestamp;
  isInternal: boolean;
}

export interface App {
  id: string;
  name: string;
  description: string;
  teamIds: string[];
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  accessLevel: 'admin' | 'manager' | 'developer' | 'tester';
  appIds: string[];
  createdAt: Timestamp;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'tester' | 'external';
  permissions: string[];
}

export interface AnalyticsData {
  totalRequests: number;
  requestsByCategory: Record<string, number>;
  requestsByStatus: Record<string, number>;
  averagePriorityScore: number;
  topRequestedFeatures: FeatureRequest[];
  trendData: {
    date: string;
    requests: number;
    completed: number;
  }[];
}