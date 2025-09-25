import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureRequests, useAnalytics } from '@/hooks/useFeatureRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  User, 
  Plus, 
  AlertCircle, 
  RefreshCw, 
  BarChart3,
  Filter,
  Search,
  Settings
} from 'lucide-react';
import { RequestForm } from '@/components/RequestForm';
import { RequestCard } from '@/components/RequestCard';
import { Dashboard } from '@/components/Dashboard';

export default function Index() {
  const { user, loading, error, signInAnonymous, forceSkipAuth } = useAuth();
  const userRole = user?.uid.includes('demo') ? 'external' : 'admin'; // Simple role detection
  
  const { 
    requests, 
    loading: requestsLoading, 
    error: requestsError,
    submitRequest,
    updateRequestStatus,
    voteOnRequest,
    deleteRequest
  } = useFeatureRequests(user?.uid || null, userRole);
  
  const { analytics, loading: analyticsLoading } = useAnalytics(user?.uid || null);
  
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced error state with multiple options
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">{error}</p>
            <div className="space-y-2">
              <Button onClick={signInAnonymous} className="w-full">
                <User className="mr-2 h-4 w-4" />
                Try Anonymous Sign-In
              </Button>
              <Button onClick={forceSkipAuth} variant="outline" className="w-full">
                Continue as Demo User
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced loading state with timeout options
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Initializing AI-Enhanced Feature Request System...
            </p>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center mb-3">
                Taking too long?
              </p>
              <div className="space-y-2">
                <Button onClick={signInAnonymous} variant="outline" size="sm" className="w-full">
                  <User className="mr-2 h-3 w-3" />
                  Sign In Anonymously
                </Button>
                <Button onClick={forceSkipAuth} variant="ghost" size="sm" className="w-full">
                  Continue as Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>AI-Enhanced Feature Request System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Advanced feature request management with AI-powered analysis, priority scoring, and business impact assessment
            </p>
            <div className="space-y-2">
              <Button onClick={signInAnonymous} className="w-full">
                <User className="mr-2 h-4 w-4" />
                Sign In as Beta Tester
              </Button>
              <Button onClick={forceSkipAuth} variant="outline" className="w-full">
                Try Demo Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter requests based on current filters
  const filteredRequests = requests.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterCategory !== 'all' && request.aiAnalysis?.category !== filterCategory) return false;
    if (filterPriority !== 'all' && request.userPriority !== filterPriority) return false;
    if (searchTerm && !request.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !request.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get unique categories for filter
  const categories = [...new Set(requests.map(r => r.aiAnalysis?.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI-Enhanced Feature Request System
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <User className="mr-1 h-3 w-3" />
              {userRole === 'admin' ? 'Admin' : 'Beta Tester'}: {user.uid}
            </Badge>
            {user.uid.includes('demo') && (
              <Badge variant="outline" className="px-3 py-1">
                Demo Mode
              </Badge>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Feature Requests
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Feature Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Submit New Request */}
            <RequestForm onSubmit={submitRequest} />

            <Separator />

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filter & Search Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="analyzing">Analyzing</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Feature Requests ({filteredRequests.length} of {requests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading requests...</span>
                  </div>
                ) : requestsError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Error: {requestsError}</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No feature requests found</p>
                    <p className="text-sm">Submit your first request above or adjust filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onVote={voteOnRequest}
                        onStatusChange={updateRequestStatus}
                        onDelete={userRole === 'admin' ? deleteRequest : undefined}
                        isAdmin={userRole === 'admin'}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Dashboard Tab */}
          <TabsContent value="dashboard">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading analytics...</span>
              </div>
            ) : analytics ? (
              <Dashboard analytics={analytics} requests={requests} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No analytics data available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">User Role</h3>
                  <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                    {userRole === 'admin' ? 'Administrator' : 'Beta Tester'}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {userRole === 'admin' 
                      ? 'You have full access to manage all feature requests and view analytics.'
                      : 'You can submit feature requests and view public analytics.'
                    }
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">AI Analysis Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ Automated request categorization</li>
                    <li>✅ Complexity and clarity scoring</li>
                    <li>✅ Priority calculation algorithm</li>
                    <li>✅ Effort estimation</li>
                    <li>✅ Business impact assessment</li>
                    <li>✅ Duplicate detection</li>
                    <li>✅ Enhancement suggestions</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">System Status</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">
                      ✅ AI Analysis Engine
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      ✅ Real-time Database
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      ✅ Analytics Dashboard
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}