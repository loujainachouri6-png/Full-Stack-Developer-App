import { AnalyticsData, FeatureRequest } from '@/types/FeatureRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Zap,
  Target
} from 'lucide-react';

interface DashboardProps {
  analytics: AnalyticsData;
  requests: FeatureRequest[];
}

export const Dashboard: React.FC<DashboardProps> = ({ analytics, requests }) => {
  const getStatusStats = () => {
    const stats = {
      submitted: 0,
      analyzing: 0,
      reviewed: 0,
      approved: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0
    };

    requests.forEach(req => {
      switch (req.status) {
        case 'submitted': stats.submitted++; break;
        case 'analyzing': stats.analyzing++; break;
        case 'reviewed': stats.reviewed++; break;
        case 'approved': stats.approved++; break;
        case 'in-progress': stats.inProgress++; break;
        case 'completed': stats.completed++; break;
        case 'rejected': stats.rejected++; break;
      }
    });

    return stats;
  };

  const getPriorityDistribution = () => {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    requests.forEach(req => {
      distribution[req.userPriority]++;
    });
    return distribution;
  };

  const getTopCategories = () => {
    const categories: Record<string, number> = {};
    requests.forEach(req => {
      if (req.aiAnalysis?.category) {
        categories[req.aiAnalysis.category] = (categories[req.aiAnalysis.category] || 0) + 1;
      }
    });
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getAverageScores = () => {
    const requestsWithScores = requests.filter(req => req.priorityScore);
    if (requestsWithScores.length === 0) return null;

    const totals = requestsWithScores.reduce((acc, req) => ({
      priority: acc.priority + (req.priorityScore?.overall || 0),
      complexity: acc.complexity + (req.aiAnalysis?.complexity || 0),
      clarity: acc.clarity + (req.aiAnalysis?.clarityScore || 0)
    }), { priority: 0, complexity: 0, clarity: 0 });

    return {
      priority: totals.priority / requestsWithScores.length,
      complexity: totals.complexity / requestsWithScores.length,
      clarity: totals.clarity / requestsWithScores.length
    };
  };

  const statusStats = getStatusStats();
  const priorityDist = getPriorityDistribution();
  const topCategories = getTopCategories();
  const averageScores = getAverageScores();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Active feature requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalRequests > 0 ? 
                `${((statusStats.completed / analytics.totalRequests) * 100).toFixed(1)}% completion rate` :
                'No requests yet'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently being developed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {averageScores ? averageScores.priority.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 10.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Request Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => {
              const percentage = analytics.totalRequests > 0 ? (count / analytics.totalRequests) * 100 : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{status.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span>{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(priorityDist).map(([priority, count]) => {
              const percentage = analytics.totalRequests > 0 ? (count / analytics.totalRequests) * 100 : 0;
              const colorClass = 
                priority === 'critical' ? 'bg-red-500' :
                priority === 'high' ? 'bg-orange-500' :
                priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500';
              
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{priority}</span>
                    <span>{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colorClass} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Categories and Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {category}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count} requests</span>
                </div>
              ))}
              {topCategories.length === 0 && (
                <p className="text-sm text-gray-500">No categorized requests yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {averageScores && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Average Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Priority Score</span>
                  <span>{averageScores.priority.toFixed(1)}/10</span>
                </div>
                <Progress value={averageScores.priority * 10} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Complexity</span>
                  <span>{averageScores.complexity.toFixed(1)}/5</span>
                </div>
                <Progress value={averageScores.complexity * 20} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Clarity Score</span>
                  <span>{averageScores.clarity.toFixed(1)}/10</span>
                </div>
                <Progress value={averageScores.clarity * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Top Priority Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topRequestedFeatures.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{request.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" size="sm">
                      {request.aiAnalysis?.category || 'uncategorized'}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {request.userPriority}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {request.priorityScore?.overall.toFixed(1) || 'N/A'}/10
                  </div>
                  <div className="text-xs text-gray-500">
                    {request.votes} votes
                  </div>
                </div>
              </div>
            ))}
            {analytics.topRequestedFeatures.length === 0 && (
              <p className="text-sm text-gray-500">No requests with priority scores yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};