import { useState } from 'react';
import { FeatureRequest } from '@/types/FeatureRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ThumbsUp, 
  Clock, 
  User, 
  Tag, 
  TrendingUp, 
  Zap, 
  Eye,
  MessageSquare,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RequestCardProps {
  request: FeatureRequest;
  onVote: (requestId: string, increment: boolean) => void;
  onStatusChange: (requestId: string, status: FeatureRequest['status']) => void;
  onDelete?: (requestId: string) => void;
  isAdmin?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  onVote, 
  onStatusChange, 
  onDelete,
  isAdmin = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'submitted': return 'bg-gray-500';
      case 'analyzing': return 'bg-blue-500';
      case 'reviewed': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'in-progress': return 'bg-purple-500';
      case 'completed': return 'bg-emerald-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'new-feature': return '🆕';
      case 'enhancement': return '⚡';
      case 'bug-fix': return '🐛';
      case 'ui-ux': return '🎨';
      case 'performance': return '🚀';
      case 'integration': return '🔗';
      default: return '💡';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {request.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className={`${getStatusColor(request.status)} text-white`}>
                {request.status.replace('-', ' ')}
              </Badge>
              <Badge variant="secondary" className={getPriorityColor(request.userPriority)}>
                {request.userPriority}
              </Badge>
              {request.aiAnalysis && (
                <Badge variant="outline">
                  {getCategoryIcon(request.aiAnalysis.category)} {request.aiAnalysis.category}
                </Badge>
              )}
            </div>
          </div>
          
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onStatusChange(request.id, 'approved')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(request.id, 'in-progress')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Start Development
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(request.id, 'completed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(request.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {request.description}
        </p>

        {/* AI Analysis Summary */}
        {request.aiAnalysis && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Brain className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Complexity:</span>
                <div className="flex items-center mt-1">
                  <Progress value={request.aiAnalysis.complexity * 20} className="h-2 flex-1" />
                  <span className="ml-2 text-xs">{request.aiAnalysis.complexity}/5</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Clarity:</span>
                <div className="flex items-center mt-1">
                  <Progress value={request.aiAnalysis.clarityScore * 10} className="h-2 flex-1" />
                  <span className="ml-2 text-xs">{request.aiAnalysis.clarityScore}/10</span>
                </div>
              </div>
            </div>
            {request.aiAnalysis.sentiment && (
              <div className="mt-2">
                <Badge 
                  variant="outline" 
                  className={
                    request.aiAnalysis.sentiment === 'excited' ? 'text-green-600' :
                    request.aiAnalysis.sentiment === 'frustrated' ? 'text-red-600' :
                    'text-gray-600'
                  }
                >
                  {request.aiAnalysis.sentiment}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Priority Score */}
        {request.priorityScore && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-800">Priority Score</span>
              </div>
              <Badge variant="outline" className="text-green-700">
                {request.priorityScore.overall.toFixed(1)}/10
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Business Impact: {request.priorityScore.businessImpact.toFixed(1)}</div>
              <div>User Demand: {request.priorityScore.userDemand.toFixed(1)}</div>
              <div>Strategic Fit: {request.priorityScore.strategicAlignment.toFixed(1)}</div>
              <div>Feasibility: {request.priorityScore.implementationFeasibility.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Effort Estimate */}
        {request.effortEstimate && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Effort Estimate</span>
              </div>
              <Badge variant="outline" className="text-orange-700">
                {request.effortEstimate.totalHours}h
              </Badge>
            </div>
            <div className="text-xs text-gray-600">
              Frontend: {request.effortEstimate.frontendHours}h • 
              Backend: {request.effortEstimate.backendHours}h • 
              Design: {request.effortEstimate.designHours}h • 
              QA: {request.effortEstimate.qaHours}h
            </div>
          </div>
        )}

        <Separator />

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {request.submitterName || request.submittedBy}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              {request.appName}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(request.id, true)}
              className="flex items-center space-x-1"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{request.votes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        {request.tags && request.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {request.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
            <h4 className="font-medium">Full Description</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {request.description}
            </p>
            
            {request.aiAnalysis?.enhancementSuggestions && (
              <div>
                <h5 className="font-medium text-sm mb-2">AI Suggestions</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {request.aiAnalysis.enhancementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {request.effortEstimate?.riskFactors && request.effortEstimate.riskFactors.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
                  Risk Factors
                </h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {request.effortEstimate.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">⚠️</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};