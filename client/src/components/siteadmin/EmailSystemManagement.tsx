import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Settings, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailSystemManagement: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // Test email sending
  const handleTestEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/emails/hostinger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: 'simonmhling@gmail.com',
          subject: '✅ EDUCAFRIC Email System Test',
          html: `
            <h2>🚀 Email System Test Successful</h2>
            <p>This is a test email from the EDUCAFRIC platform to confirm the Hostinger SMTP configuration is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}</p>
            <p><strong>Configuration:</strong> smtp?.hostinger?.com:465 (SSL)</p>
            <p><strong>From:</strong> no-reply@educafric.com</p>
            <hr>
            <p><small>EDUCAFRIC Platform Email System</small></p>
          `,
          text: `EDUCAFRIC Email System Test - ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}`
        })
      });

      if (response.ok) {
        toast({
          title: "✅ Test Email Sent",
          description: "Email test sent successfully to simonmhling@gmail.com"
        });
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: "Failed to send test email",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  // Test system report
  const handleTestSystemReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system-reports/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "📊 System Report Sent",
          description: "Test system report sent to simonmhling@gmail.com"
        });
      } else {
        throw new Error('Failed to send system report');
      }
    } catch (error) {
      toast({
        title: "❌ Report Failed",
        description: "Failed to send system report",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  // Get system report status
  const handleGetStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system-reports/status', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
        toast({
          title: "📋 Status Retrieved",
          description: "System report service status updated"
        });
      } else {
        throw new Error('Failed to get status');
      }
    } catch (error) {
      toast({
        title: "❌ Status Failed",
        description: "Failed to retrieve system status",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Email System Management</h2>
        <Badge variant="default" className="bg-green-500">
          Hostinger SMTP Active
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMTP Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">smtp?.hostinger?.com:465</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Reports</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3am & 10pm</div>
                <p className="text-xs text-muted-foreground">Africa/Douala timezone</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Email</CardTitle>
                <Mail className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">simonmhling@gmail.com</div>
                <p className="text-xs text-muted-foreground">System reports recipient</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Types</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Different email templates</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Available Email Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">📊 System Reports</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automated daily reports (3am & 10pm)</li>
                    <li>• System health & performance metrics</li>
                    <li>• User statistics & school activity</li>
                    <li>• Memory usage & uptime tracking</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">📚 Educational Emails</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Grade reports to parents</li>
                    <li>• Attendance alerts & notifications</li>
                    <li>• School announcements</li>
                    <li>• General educational communications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Email System Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleTestEmail} 
                  disabled={isLoading}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Send className="h-6 w-6 mb-2" />
                  Test Email Send
                </Button>
                
                <Button 
                  onClick={handleTestSystemReport} 
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Test System Report
                </Button>
                
                <Button 
                  onClick={handleGetStatus} 
                  disabled={isLoading}
                  variant="secondary"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Get Service Status
                </Button>
              </div>

              {testResults && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>📋 Service Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-auto">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ SMTP Configuration</CardTitle>
              <div className="text-sm text-red-600 font-medium">
                🔒 PERMANENT CONFIGURATION - DO NOT MODIFY
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input value="smtp?.hostinger?.com" disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input value="465" disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Security</Label>
                  <Input value="SSL/TLS" disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>From Email</Label>
                  <Input value="no-reply@educafric.com" disabled className="bg-gray-100" />
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Configuration Notice</h4>
                <p className="text-sm text-yellow-700">
                  This SMTP configuration is permanently set and should never be changed until explicitly requested by the user. 
                  The credentials are securely hardcoded as per user requirements: "enregistre ça et ne change plus jamais. Jusqu'a ce que je le décide."
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Automated Reporting Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Morning Report</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Daily at 3:00 AM (Africa/Douala)</p>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">Evening Report</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Daily at 10:00 PM (Africa/Douala)</p>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📧 Report Contents</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• System health status and uptime</li>
                  <li>• Total users and active schools metrics</li>
                  <li>• Daily login statistics</li>
                  <li>• Memory usage and performance data</li>
                  <li>• Automatic delivery to: simonmhling@gmail.com</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailSystemManagement;