import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, MessageSquare, Send, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VonageHealth {
  configured: boolean;
  connected?: boolean;
  balance?: number;
  message: string;
  error?: string;
  missingVars?: string[];
}

export default function VonageTest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState('+237657004011');
  const [message, setMessage] = useState('Hello from Educafric via Vonage Messages API!');
  const [fromNumber, setFromNumber] = useState('14157386102');
  
  // Template form states
  const [templateType, setTemplateType] = useState('welcome');
  const [templateLanguage, setTemplateLanguage] = useState('fr');
  const [templateData, setTemplateData] = useState({
    contactName: 'Simon',
    companyName: 'Test School',
    demoLink: 'https://www.educafric.com/demo'
  });

  // Get Vonage service health
  const { data: health, isLoading: healthLoading } = useQuery<VonageHealth>({
    queryKey: ['/api/vonage-messages/health'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Send simple message mutation
  const sendSimpleMutation = useMutation({
    mutationFn: async (data: { to: string; text: string; from?: string }) => {
      const response = await fetch('/api/vonage-messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Message Sent!',
        description: `WhatsApp message delivered via Vonage. Message ID: ${data.messageId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vonage-messages/health'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Message Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Send template message mutation
  const sendTemplateMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; type: string; data: any; language: string }) => {
      const response = await fetch('/api/vonage-messages/send-commercial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send template');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Template Sent!',
        description: `Commercial template delivered via Vonage. Message ID: ${data.messageId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Template Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Test your cURL example mutation
  const testCurlMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/vonage-messages/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Test failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'cURL Test Success!',
        description: `Your original cURL example works! Message ID: ${data.messageId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'cURL Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSendSimple = () => {
    sendSimpleMutation.mutate({
      to: phoneNumber,
      text: message,
      from: fromNumber
    });
  };

  const handleSendTemplate = () => {
    sendTemplateMutation.mutate({
      phoneNumber,
      type: templateType,
      data: templateData,
      language: templateLanguage
    });
  };

  const handleTestCurl = () => {
    testCurlMutation.mutate();
  };

  const getStatusBadge = () => {
    if (healthLoading) return <Badge variant="outline">Checking...</Badge>;
    if (!health) return <Badge variant="destructive">Error</Badge>;
    if (!health.configured) return <Badge variant="destructive">Not Configured</Badge>;
    if (health.connected) return <Badge variant="default">Connected</Badge>;
    return <Badge variant="secondary">Configured</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="vonage-test-page">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Vonage Messages API Test</h1>
        {getStatusBadge()}
      </div>

      {/* Service Health Card */}
      <Card data-testid="service-health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Health
          </CardTitle>
          <CardDescription>
            Vonage Messages API connection status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <p className="text-muted-foreground">Checking service health...</p>
          ) : health ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {health.configured && health.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">{health.message}</span>
              </div>
              
              {health.balance !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Account Balance: €{health.balance}
                </p>
              )}
              
              {health.error && (
                <p className="text-sm text-red-600">Error: {health.error}</p>
              )}
              
              {health.missingVars && health.missingVars.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Missing Environment Variables:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {health.missingVars.map((varName, index) => (
                      <li key={index}>{varName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">Failed to check service health</p>
          )}
        </CardContent>
      </Card>

      {/* Test Interface */}
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple">Simple Message</TabsTrigger>
          <TabsTrigger value="template">Template Message</TabsTrigger>
          <TabsTrigger value="curl">cURL Test</TabsTrigger>
        </TabsList>

        {/* Simple Message Tab */}
        <TabsContent value="simple" className="space-y-4">
          <Card data-testid="simple-message-card">
            <CardHeader>
              <CardTitle>Send Simple WhatsApp Message</CardTitle>
              <CardDescription>
                Send a basic text message using the Vonage Messages API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+237657004011"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="from">From Number</Label>
                  <Input
                    id="from"
                    value={fromNumber}
                    onChange={(e) => setFromNumber(e.target.value)}
                    placeholder="14157386102"
                    data-testid="input-from"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={3}
                  data-testid="textarea-message"
                />
              </div>
              
              <Button 
                onClick={handleSendSimple}
                disabled={sendSimpleMutation.isPending || !phoneNumber || !message}
                className="w-full"
                data-testid="button-send-simple"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendSimpleMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Message Tab */}
        <TabsContent value="template" className="space-y-4">
          <Card data-testid="template-message-card">
            <CardHeader>
              <CardTitle>Send Template Message</CardTitle>
              <CardDescription>
                Send a pre-formatted message using Educafric templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <select
                    id="template-type"
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-template-type"
                  >
                    <option value="welcome">Welcome</option>
                    <option value="demo">Demo Access</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="template-language">Language</Label>
                  <select
                    id="template-language"
                    value={templateLanguage}
                    onChange={(e) => setTemplateLanguage(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-template-language"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="template-phone">Phone Number</Label>
                  <Input
                    id="template-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+237657004011"
                    data-testid="input-template-phone"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-name">Contact Name</Label>
                  <Input
                    id="contact-name"
                    value={templateData.contactName}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Simon"
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={templateData.companyName}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Test School"
                    data-testid="input-company-name"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSendTemplate}
                disabled={sendTemplateMutation.isPending || !phoneNumber}
                className="w-full"
                data-testid="button-send-template"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendTemplateMutation.isPending ? 'Sending...' : 'Send Template'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* cURL Test Tab */}
        <TabsContent value="curl" className="space-y-4">
          <Card data-testid="curl-test-card">
            <CardHeader>
              <CardTitle>Test Your cURL Example</CardTitle>
              <CardDescription>
                Replicate the exact cURL command you provided using our API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Original cURL Command:</h4>
                <code className="text-sm block whitespace-pre-wrap">
                  {`curl -X POST https://messages-sandbox.nexmo.com/v1/messages \\
-u '81c4973f:$YOUR_API_SECRET' \\
-H 'Content-Type: application/json' \\
-d '{"from": "14157386102", "to": "41768017000", "message_type": "text", "text": "This is a WhatsApp Message sent from the Messages API", "channel": "whatsapp"}'`}
                </code>
              </div>
              
              <div>
                <Label htmlFor="curl-phone">Target Phone Number</Label>
                <Input
                  id="curl-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+41768017000"
                  data-testid="input-curl-phone"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will send the exact message from your cURL example: "This is a WhatsApp Message sent from the Messages API"
              </p>
              
              <Button 
                onClick={handleTestCurl}
                disabled={testCurlMutation.isPending || !phoneNumber}
                className="w-full"
                data-testid="button-test-curl"
              >
                <Send className="h-4 w-4 mr-2" />
                {testCurlMutation.isPending ? 'Testing...' : 'Test cURL Example'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}