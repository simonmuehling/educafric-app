import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Send, 
  Settings, 
  TestTube, 
  Check, 
  X, 
  Mail, 
  MessageSquare, 
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

interface NotificationTest {
  id: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
  priority: string;
  result?: {
    success: boolean;
    details: any;
  };
}

const NotificationTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testForm, setTestForm] = useState({
    type: 'info',
    title: 'Site Admin Test Notification',
    message: 'This is a test notification from the site admin panel.',
    channels: ['app'],
    priority: 'medium'
  });
  const [testResults, setTestResults] = useState<NotificationTest[]>([]);

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: <Info className="w-4 h-4" /> },
    { value: 'success', label: 'Success', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'warning', label: 'Warning', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'error', label: 'Error', icon: <X className="w-4 h-4" /> },
    { value: 'system', label: 'System Alert', icon: <Settings className="w-4 h-4" /> }
  ];

  const channels = [
    { id: 'app', label: 'In-App', icon: <Bell className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'bg-gray-500' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-blue-500' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
  ];

  const handleChannelToggle = (channelId: string) => {
    setTestForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const handleSingleTest = async () => {
    if (!testForm.title || !testForm.message || testForm.channels.length === 0) {
      toast({
        title: "Test Error",
        description: "Please fill in all required fields and select at least one channel.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testForm)
      });

      const result = await response.json();
      
      const newTest: NotificationTest = {
        id: `test_${Date.now()}`,
        ...testForm,
        result: {
          success: result.success,
          details: result
        }
      };

      setTestResults(prev => [newTest, ...prev]);

      if (result.success) {
        toast({
          title: "✅ Test Notification Sent",
          description: `Successfully sent ${testForm.type} notification via ${testForm.channels.join(', ')}`
        });
      } else {
        toast({
          title: "❌ Test Failed",
          description: result.message || "Failed to send test notification",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Test Error",
        description: error.message || "Network error occurred",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSequenceTest = async () => {
    const testSequence = [
      { type: 'info', title: 'System Information', message: 'System notification test', channels: ['app'], priority: 'low' },
      { type: 'success', title: 'Operation Success', message: 'Test successful notification', channels: ['app', 'email'], priority: 'medium' },
      { type: 'warning', title: 'Warning Alert', message: 'Test warning notification', channels: ['app', 'sms'], priority: 'high' },
      { type: 'error', title: 'Critical Error', message: 'Test error notification', channels: ['app', 'email', 'sms'], priority: 'urgent' }
    ];

    setIsLoading(true);
    const results: NotificationTest[] = [];

    for (let i = 0; i < testSequence.length; i++) {
      const test = testSequence[i];
      try {
        const response = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(test)
        });

        const result = await response.json();
        
        results.push({
          id: `sequence_${Date.now()}_${i}`,
          ...test,
          result: {
            success: result.success,
            details: result
          }
        });

        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          id: `sequence_${Date.now()}_${i}`,
          ...test,
          result: {
            success: false,
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          }
        });
      }
    }

    setTestResults(prev => [...results, ...prev]);
    setIsLoading(false);

    const successCount = (Array.isArray(results) ? results : []).filter(r => r.result?.success).length;
    toast({
      title: `Sequence Test Complete`,
      description: `${successCount}/${results.length} tests passed`,
      variant: successCount === results.length ? "default" : "destructive"
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6" data-testid="notification-tester">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-500" />
            Site Admin Notification Tester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Test</TabsTrigger>
              <TabsTrigger value="sequence">Sequence Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={testForm.type} onValueChange={(value) => setTestForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger data-testid="notification-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(notificationTypes) ? notificationTypes : []).map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={testForm.title || ''}
                      onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title"
                      data-testid="notification-title-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={testForm.message}
                      onChange={(e) => setTestForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter notification message"
                      rows={3}
                      data-testid="notification-message-input"
                    />
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select value={testForm.priority} onValueChange={(value) => setTestForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger data-testid="notification-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(priorities) ? priorities : []).map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column - Channels */}
                <div className="space-y-4">
                  <Label>Delivery Channels</Label>
                  <div className="space-y-3">
                    {(Array.isArray(channels) ? channels : []).map(channel => (
                      <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {channel.icon}
                          <span>{channel.label}</span>
                        </div>
                        <Switch
                          checked={testForm.channels.includes(channel.id)}
                          onCheckedChange={() => handleChannelToggle(channel.id)}
                          data-testid={`channel-${channel.id}-toggle`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSingleTest}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      data-testid="send-test-button"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? 'Sending Test...' : 'Send Test Notification'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sequence" className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Test all notification types with different channels and priorities automatically.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleSequenceTest}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    data-testid="sequence-test-button"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {isLoading ? 'Running Tests...' : 'Run Sequence Test'}
                  </Button>
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    data-testid="clear-results-button"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Results
              <Badge variant="outline">{testResults.length} tests</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(Array.isArray(testResults) ? testResults : []).map((test) => (
                <div
                  key={test.id}
                  className={`p-4 border rounded-lg ${
                    test.result?.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {test.result?.success ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{test.title || ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={test.result?.success ? "default" : "destructive"}>
                        {test.type}
                      </Badge>
                      <Badge variant="outline">
                        {test.channels.join(', ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                  {test.result?.details && (
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(test.result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationTester;