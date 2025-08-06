import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send, CheckCircle, XCircle, Clock, Lock, Shield } from 'lucide-react';

const SMSTestSuite = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('+41768017000');
  const [language, setLanguage] = useState('en');
  const [delay, setDelay] = useState('2000');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Check if user is Site Admin
  const isSiteAdmin = user?.role === 'SiteAdmin';

  // If not Site Admin, show access denied message
  if (!isSiteAdmin) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-700">
            <Lock className="w-5 h-5" />
            SMS Testing Access Restricted
          </CardTitle>
          <CardDescription className="text-red-600">
            SMS testing is restricted to Site Administrators only for security and cost management.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">
              Current role: <strong>{user?.role || 'Not authenticated'}</strong>
            </span>
          </div>
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
            Site Admin Access Required
          </Badge>
        </CardContent>
      </Card>
    );
  }

  const handleTestAllSMS = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/sms/test-all-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          language,
          delay: parseInt(delay),
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('SMS test error:', error);
      setResults({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            EDUCAFRIC SMS Test Suite
          </CardTitle>
          <CardDescription>
            Test all available SMS templates with realistic African educational data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+41768017000"
                data-testid="input-phone-number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Delay (ms)</label>
              <Input
                type="number"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                placeholder="2000"
                min="1000"
                max="10000"
                data-testid="input-delay"
              />
            </div>
          </div>

          <Button 
            onClick={handleTestAllSMS} 
            disabled={isLoading || !phoneNumber}
            className="w-full"
            data-testid="button-test-sms-suite"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Sending SMS Templates...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Test All SMS Templates ({24} templates)
              </>
            )}
          </Button>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                📱 Sending 24 SMS templates to {phoneNumber}...
                <br />
                This will take approximately {Math.ceil((24 * parseInt(delay)) / 1000)} seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Test Results
            </CardTitle>
            <CardDescription>
              {results.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.totalTemplates && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{results.totalTemplates}</div>
                  <div className="text-xs text-gray-500">Total Templates</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
                  <div className="text-xs text-green-600">Sent Successfully</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.failureCount}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.vonageConfigured ? '✓' : '✗'}</div>
                  <div className="text-xs text-blue-600">Vonage Setup</div>
                </div>
              </div>
            )}

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Detailed Results:</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-mono">{result.template}</span>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        #{result.order}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-xs">
                <strong>SMS Templates Included:</strong> Attendance alerts, grade notifications, emergency alerts, 
                geolocation updates, device status, payment confirmations, and more - all with realistic African school data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available SMS Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {[
              'ABSENCE_ALERT', 'LATE_ARRIVAL', 'NEW_GRADE', 'LOW_GRADE_ALERT',
              'SCHOOL_FEES_DUE', 'PAYMENT_CONFIRMED', 'EMERGENCY_ALERT', 'MEDICAL_INCIDENT',
              'SCHOOL_ANNOUNCEMENT', 'PASSWORD_RESET', 'HOMEWORK_REMINDER', 'ZONE_ENTRY',
              'ZONE_EXIT', 'SCHOOL_ARRIVAL', 'SCHOOL_DEPARTURE', 'HOME_ARRIVAL',
              'HOME_DEPARTURE', 'LOCATION_ALERT', 'SPEED_ALERT', 'LOW_BATTERY',
              'DEVICE_OFFLINE', 'GPS_DISABLED', 'PANIC_BUTTON', 'SOS_LOCATION'
            ].map((template) => (
              <Badge key={template} variant="secondary" className="text-xs">
                {template}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSTestSuite;