import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Lightbulb } from 'lucide-react';

interface RequestFormProps {
  onSubmit: (requestData: {
    title: string;
    description: string;
    userPriority: 'low' | 'medium' | 'high' | 'critical';
    appId: string;
    appName: string;
    tags: string[];
  }) => Promise<void>;
}

export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userPriority, setUserPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [appId, setAppId] = useState('main-app');
  const [appName, setAppName] = useState('Main Application');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        userPriority,
        appId,
        appName,
        tags
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setUserPriority('medium');
      setTags([]);
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
          {/* App Selection */}
          <div className="space-y-2">
            <Label htmlFor="app">Application</Label>
            <Select value={appId} onValueChange={(value) => {
              setAppId(value);
              setAppName(value === 'main-app' ? 'Main Application' : value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-app">Main Application</SelectItem>
                <SelectItem value="mobile-app">Mobile App</SelectItem>
                <SelectItem value="web-dashboard">Web Dashboard</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Request Title *</Label>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the feature you'd like to see. Include:
• What problem does this solve?
• How should it work?
• Who would benefit from this?
• Any specific requirements or constraints?"
              rows={6}
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
                <SelectItem value="low">Low - Nice to have</SelectItem>
                <SelectItem value="medium">Medium - Would improve workflow</SelectItem>
                <SelectItem value="high">High - Important for productivity</SelectItem>
                <SelectItem value="critical">Critical - Blocking current work</SelectItem>
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
                placeholder="Add tags (e.g., mobile, performance, ui)"
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
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting & Analyzing...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Submit Feature Request
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>💡 Tips for better requests:</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Be specific about the problem you're trying to solve</li>
              <li>Include examples or use cases when possible</li>
              <li>Mention if this affects multiple users or just you</li>
              <li>Our AI will automatically analyze and categorize your request</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};