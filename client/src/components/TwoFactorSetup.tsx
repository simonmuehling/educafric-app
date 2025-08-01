import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Copy, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface TwoFactorSetupData {
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
  instructions: {
    title: string;
    steps: string[];
    backupCodeWarning: string;
  };
}

interface TwoFactorStatus {
  enabled: boolean;
  setupComplete: boolean;
  backupCodesRemaining: number;
  lastUsed?: string;
  methods: string[];
}

export default function TwoFactorSetup() {
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'complete'>('status');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current 2FA status
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/auth/2fa/status');
      setStatus(response.data);
    } catch (error) {
      setError('Failed to fetch 2FA status');
      console.error('2FA status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize 2FA setup
  const initializeSetup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRequest('/api/auth/2fa/setup', {
        method: 'POST'
      });
      setSetupData(response.data);
      setStep('setup');
      toast({
        title: "2FA Setup Initialized",
        description: "Scan the QR code with your authenticator app"
      });
    } catch (error) {
      setError('Failed to initialize 2FA setup');
      console.error('2FA setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify and enable 2FA
  const enableTwoFactor = async () => {
    if (!verificationCode || (Array.isArray(verificationCode) ? verificationCode.length : 0) !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await apiRequest('/api/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ verificationCode }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      setStep('complete');
      toast({
        title: "2FA Enabled Successfully",
        description: "Your account is now protected with two-factor authentication"
      });
      await fetchStatus();
    } catch (error) {
      setError('Invalid verification code. Please try again.');
      console.error('2FA enable error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const disableTwoFactor = async (password: string, code: string) => {
    try {
      setIsLoading(true);
      await apiRequest('/api/auth/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ password, verificationCode: code }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled"
      });
      await fetchStatus();
    } catch (error) {
      setError('Failed to disable 2FA. Check your password and verification code.');
      console.error('2FA disable error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator?.clipboard?.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard"
    });
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    if (!setupData) return;
    
    const codesText = setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n');
    const blob = new Blob([`Educafric 2FA Backup Codes\n\n${codesText}\n\nStore these codes securely. Each can only be used once.`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'educafric-backup-codes.txt';
    document?.body?.appendChild(a);
    a.click();
    document?.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load status on component mount
  useState(() => {
    fetchStatus();
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
        <p className="text-gray-600 mt-2">Add an extra layer of security to your Educafric account</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 2FA Status */}
      {step === 'status' && status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Two-Factor Authentication</span>
              <Badge variant={status.enabled ? "default" : "secondary"}>
                {status.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {status.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <span>Backup Codes Remaining</span>
                  <Badge variant={status.backupCodesRemaining > 3 ? "default" : "destructive"}>
                    {status.backupCodesRemaining}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Available Methods</span>
                  <div className="flex gap-1">
                    {status.methods.map(method => (
                      <Badge key={method} variant="outline">{method}</Badge>
                    ))}
                  </div>
                </div>

                {status.lastUsed && (
                  <div className="flex items-center justify-between">
                    <span>Last Used</span>
                    <span className="text-sm text-gray-600">
                      {new Date(status.lastUsed).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </>
            )}

            <Separator />

            <div className="flex gap-3">
              {!status.enabled ? (
                <Button 
                  onClick={initializeSetup}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {/* Open disable dialog */}}
                    disabled={isLoading}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Disable 2FA
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {/* Regenerate backup codes */}}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Backup Codes
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Process */}
      {step === 'setup' && setupData && (
        <Card>
          <CardHeader>
            <CardTitle>{setupData?.instructions?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                <div className="text-center">
                  <img 
                    src={setupData.qrCodeUrl} 
                    alt="2FA QR Code"
                    className="mx-auto border border-gray-200 rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this QR code with your authenticator app
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label>Manual Entry Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={setupData.manualEntryKey} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(setupData.manualEntryKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                {setupData.instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <Separator />

            <div>
              <Label htmlFor="verification">Verification Code</Label>
              <Input
                id="verification"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e?.target?.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('status')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={enableTwoFactor}
                disabled={isLoading || (Array.isArray(verificationCode) ? verificationCode.length : 0) !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Enable 2FA'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {step === 'setup' && setupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Backup Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {setupData?.instructions?.backupCodeWarning}
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{index + 1}. {code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(setupData?.backupCodes?.join('\n'))}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Codes
              </Button>
              <Button 
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion */}
      {step === 'complete' && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              2FA Successfully Enabled!
            </h3>
            <p className="text-gray-600 mb-6">
              Your Educafric account is now protected with two-factor authentication.
            </p>
            <Button onClick={() => setStep('status')}>
              Back to Security Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}