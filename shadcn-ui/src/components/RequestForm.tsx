import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Lightbulb, Smartphone, Monitor, Database, Globe } from 'lucide-react';

interface RequestFormProps {
  onSubmit: (requestData: {
    title: string;
    description: string;
    userPriority: 'low' | 'medium' | 'high' | 'critical';
    appId: string;
    appName: string;
    tags: string[];
    testerInfo: {
      name: string;
      email: string;
      role: string;
      company?: string;
    };
  }) => Promise<void>;
}

const APP_OPTIONS = [
  { id: 'mobile-ios', name: 'iOS Mobile App', icon: '📱', description: 'iPhone and iPad application' },
  { id: 'mobile-android', name: 'Android Mobile App', icon: '🤖', description: 'Android smartphone and tablet app' },
  { id: 'web-dashboard', name: 'Web Dashboard', icon: '💻', description: 'Admin and analytics web interface' },
  { id: 'web-customer', name: 'Customer Portal', icon: '🌐', description: 'Customer-facing web application' },
  { id: 'api-backend', name: 'Backend API', icon: '⚙️', description: 'Server-side API and services' },
  { id: 'desktop-app', name: 'Desktop Application', icon: '🖥️', description: 'Windows/Mac desktop software' },
];

export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userPriority, setUserPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tester Information
  const [testerName, setTesterName] = useState('');
  const [testerEmail, setTesterEmail] = useState('');
  const [testerRole, setTesterRole] = useState('');
  const [testerCompany, setTesterCompany] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !selectedApp || !testerName.trim() || !testerEmail.trim()) {
      return;
    }

    const selectedAppData = APP_OPTIONS.find(app => app.id === selectedApp);
    if (!selectedAppData) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        userPriority,
        appId: selectedApp,
        appName: selectedAppData.name,
        tags,
        testerInfo: {
          name: testerName.trim(),
          email: testerEmail.trim(),
          role: testerRole.trim() || 'Beta Tester',
          company: testerCompany.trim() || undefined
        }
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setUserPriority('medium');
      setSelectedApp('');
      setTags([]);
      setTesterName('');
      setTesterEmail('');
      setTesterRole('');
      setTesterCompany('');
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      addTag();
    }
  };

  const selectedAppData = APP_OPTIONS.find(app => app.id === selectedApp);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5" />
          Submit Feature Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tester Information Section */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-blue-900">Tester Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tester-name">Full Name *</Label>
                <Input
                  id="tester-name"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tester-email">Email Address *</Label>
                <Input
                  id="tester-email"
                  type="email"
                  value={testerEmail}
                  onChange={(e) => setTesterEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tester-role">Role/Title</Label>
                <Input
                  id="tester-role"
                  value={testerRole}
                  onChange={(e) => setTesterRole(e.target.value)}
                  placeholder="e.g., Product Manager, QA Engineer, Beta Tester"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tester-company">Company (Optional)</Label>
                <Input
                  id="tester-company"
                  value={testerCompany}
                  onChange={(e) => setTesterCompany(e.target.value)}
                  placeholder="Your company name"
                />
              </div>
            </div>
          </div>

          {/* App Selection */}
          <div className="space-y-2">
            <Label htmlFor="app">Which Application? *</Label>
            <Select value={selectedApp} onValueChange={setSelectedApp} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the app you're providing feedback on" />
              </SelectTrigger>
              <SelectContent>
                {APP_OPTIONS.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    <div className="flex items-center space-x-2">
                      <span>{app.icon}</span>
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-gray-500">{app.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAppData && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">
                  {selectedAppData.icon} {selectedAppData.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Feature Request Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief, descriptive title for your feature request"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide a detailed description including:

• What problem does this solve?
• How should it work?
• Who would benefit from this feature?
• Any specific requirements or constraints?
• Steps to reproduce (if it's a bug fix)
• Expected vs actual behavior

The more detail you provide, the better our AI can analyze and prioritize your request!"
              rows={8}
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={userPriority} onValueChange={(value: any) => setUserPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low - Nice to have enhancement</SelectItem>
                <SelectItem value="medium">🟡 Medium - Would improve my workflow</SelectItem>
                <SelectItem value="high">🟠 High - Important for productivity</SelectItem>
                <SelectItem value="critical">🔴 Critical - Blocking my work completely</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags (e.g., mobile, performance, ui, login, dashboard)"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim() || !description.trim() || !selectedApp || !testerName.trim() || !testerEmail.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting & Running AI Analysis...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Submit Feature Request
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <strong>🤖 AI-Powered Analysis:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Our AI will automatically categorize your request (Enhancement, Bug Fix, New Feature, etc.)</li>
              <li>Complexity and clarity scores will be calculated</li>
              <li>Priority scoring based on business impact and user demand</li>
              <li>Effort estimation for development planning</li>
              <li>Duplicate detection to avoid redundant requests</li>
              <li>Enhancement suggestions to improve your request</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};