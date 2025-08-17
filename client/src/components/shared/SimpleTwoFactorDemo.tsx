import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, QrCode, KeyRound, Copy } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SimpleTwoFactorDemoProps {
  language: 'fr' | 'en';
}

export default function SimpleTwoFactorDemo({ language }: SimpleTwoFactorDemoProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'manage'>('status');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const translations = {
    fr: {
      title: 'Authentification à Deux Facteurs',
      description: 'Sécurisez votre compte avec une authentification renforcée',
      status: 'Statut',
      enabled: 'Activé',
      disabled: 'Désactivé',
      setup: 'Configurer 2FA',
      setupDesc: 'Scannez le QR code avec votre application d\'authentification',
      manualEntry: 'Saisie manuelle',
      enterCode: 'Entrez le code de vérification',
      verify: 'Vérifier',
      enable: 'Activer',
      disable: 'Désactiver',
      backupCodes: 'Codes de Sauvegarde',
      generateNew: 'Générer Nouveaux Codes',
      copyCode: 'Copier le Code',
      success: 'Configuration réussie !',
      error: 'Erreur de configuration',
      codeRequired: 'Code de 6 chiffres requis',
      demo: 'DÉMONSTRATION - Utilisez n\'importe quel code à 6 chiffres'
    },
    en: {
      title: 'Two-Factor Authentication',
      description: 'Secure your account with enhanced authentication',
      status: 'Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      setup: 'Setup 2FA',
      setupDesc: 'Scan QR code with your authenticator app',
      manualEntry: 'Manual Entry',
      enterCode: 'Enter verification code',
      verify: 'Verify',
      enable: 'Enable',
      disable: 'Disable',
      backupCodes: 'Backup Codes',
      generateNew: 'Generate New Codes',
      copyCode: 'Copy Code',
      success: 'Setup successful!',
      error: 'Setup error',
      codeRequired: '6-digit code required',
      demo: 'DEMO - Use any 6-digit code'
    }
  };

  const t = translations[language];

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/2fa/status');
      const data = await response.json();
      if (data.success) {
        setIsEnabled(data?.data?.enabled);
        setStep(data?.data?.enabled ? 'manage' : 'status');
      }
    } catch (err) {
      console.error('Failed to check 2FA status:', err);
    }
  };

  const startSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/setup');
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data?.data?.qrCode);
        setSecret(data?.data?.secret);
        setStep('setup');
      } else {
        setError(data.message || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if ((Array.isArray(verificationCode) ? verificationCode.length : 0) !== 6) {
      setError(t.codeRequired);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/enable', {
        verificationCode: verificationCode,
        secret: secret
      });
      const data = await response.json();
      
      if (data.success) {
        setIsEnabled(true);
        setBackupCodes(data?.data?.backupCodes || []);
        setStep('manage');
        setVerificationCode('');
        
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: t.success
        });
      } else {
        setError(data.message || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    setLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/2fa/backup-codes');
      const data = await response.json();
      
      if (data.success) {
        setBackupCodes(data?.data?.backupCodes);
        toast({
          title: language === 'fr' ? 'Codes Générés' : 'Codes Generated',
          description: language === 'fr' ? 'Nouveaux codes de sauvegarde créés' : 'New backup codes created'
        });
      }
    } catch (err) {
      console.error('Failed to generate backup codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator?.clipboard?.writeText(text);
    toast({
      title: language === 'fr' ? 'Copié' : 'Copied',
      description: language === 'fr' ? 'Code copié dans le presse-papiers' : 'Code copied to clipboard'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t.title || ''}
        </CardTitle>
        <CardDescription>{t.description || ''}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <span className="font-medium">{t.status}:</span>
          <Badge variant={isEnabled ? "default" : "secondary"} className="flex items-center gap-1">
            {isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isEnabled ? t.enabled : t.disabled}
          </Badge>
        </div>

        <Separator />

        {/* Demo Notice */}
        <Alert>
          <AlertDescription className="text-sm text-center font-medium text-blue-600">
            {t.demo}
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {step === 'status' && !isEnabled && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'fr' 
                ? 'Activez l\'authentification à deux facteurs pour sécuriser votre compte'
                : 'Enable two-factor authentication to secure your account'
              }
            </p>
            <Button onClick={startSetup} disabled={loading}>
              {loading ? (language === 'fr' ? 'Configuration...' : 'Setting up...') : t.setup}
            </Button>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">{t.setupDesc}</h3>
              {qrCode && (
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="QR Code" className="border rounded-lg" />
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center justify-center gap-1">
                  <KeyRound className="w-4 h-4" />
                  {t.manualEntry}
                </h4>
                <div className="flex items-center gap-2 justify-center">
                  <code className="px-2 py-1 bg-muted rounded text-xs break-all">
                    {secret}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(secret)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.enterCode}</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e?.target?.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <Button onClick={verifyAndEnable} disabled={loading || (Array.isArray(verificationCode) ? verificationCode.length : 0) !== 6}>
                  {loading ? (language === 'fr' ? 'Vérification...' : 'Verifying...') : t.verify}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'manage' && isEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">
                  {language === 'fr' ? '2FA Activé avec Succès' : '2FA Successfully Enabled'}
                </span>
              </div>
            </div>

            {(Array.isArray(backupCodes) ? backupCodes.length : 0) > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t.backupCodes}</h3>
                  <Button size="sm" variant="outline" onClick={generateBackupCodes} disabled={loading}>
                    {t.generateNew}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {(Array.isArray(backupCodes) ? backupCodes : []).map((code, index) => (
                    <div key={index} className="flex items-center gap-1 p-2 bg-muted rounded">
                      <code className="text-xs flex-1">{code}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}