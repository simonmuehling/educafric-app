import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Check, X, Key, Download, RefreshCw, AlertTriangle, QrCode } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface BilingualTwoFactorSetupProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BilingualTwoFactorSetup: React.FC<BilingualTwoFactorSetupProps> = ({ 
  isEnabled, 
  onToggle 
}) => {
  const { language } = useLanguage();
  const [step, setStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Traductions complètes bilingues
  const translations = {
    fr: {
      twoFactorAuth: 'Authentification à Deux Facteurs',
      status: 'Statut',
      enabled: 'Activé',
      disabled: 'Désactivé',
      enable2FA: 'Activer la 2FA',
      disable2FA: 'Désactiver la 2FA',
      step1Title: 'Configuration de l\'Application',
      step1Desc: 'Scannez ce code QR avec votre application d\'authentification',
      step2Title: 'Vérification du Code',
      step2Desc: 'Entrez le code à 6 chiffres depuis votre application',
      manualEntry: 'Saisie Manuelle',
      manualEntryDesc: 'Si vous ne pouvez pas scanner, entrez cette clé manuellement',
      backupCodes: 'Codes de Sauvegarde',
      backupCodesDesc: 'Conservez ces codes en lieu sûr. Chacun ne peut être utilisé qu\'une fois.',
      downloadCodes: 'Télécharger les Codes',
      copyCodes: 'Copier les Codes',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      continue: 'Continuer',
      setupGuide: 'Guide de Configuration',
      downloadApp: '1. Téléchargez une application d\'authentification (Authy recommandé)',
      scanQR: '2. Scannez le code QR ou entrez la clé manuellement',
      enterCode: '3. Entrez le code généré pour confirmer',
      disableConfirm: 'Êtes-vous sûr de vouloir désactiver la 2FA ?',
      disableWarning: 'Cela réduira la sécurité de votre compte',
      regenerateCodes: 'Régénérer les Codes',
      recoveryMethods: 'Méthodes de Récupération',
      lostDevice: 'Appareil Perdu ?',
      recoveryGuide: 'Guide de Récupération',
      smsRecovery: 'Récupération par SMS disponible',
      supportContact: 'Contact Support: +237 656 200 472',
      setupSuccess: '2FA configuré avec succès !',
      disableSuccess: '2FA désactivé avec succès',
      verificationFailed: 'Code de vérification incorrect',
      setupFailed: 'Échec de la configuration 2FA'
    },
    en: {
      twoFactorAuth: 'Two-Factor Authentication',
      status: 'Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      enable2FA: 'Enable 2FA',
      disable2FA: 'Disable 2FA',
      step1Title: 'App Configuration',
      step1Desc: 'Scan this QR code with your authenticator app',
      step2Title: 'Code Verification',
      step2Desc: 'Enter the 6-digit code from your app',
      manualEntry: 'Manual Entry',
      manualEntryDesc: 'If you can\'t scan, enter this key manually',
      backupCodes: 'Backup Codes',
      backupCodesDesc: 'Keep these codes safe. Each can only be used once.',
      downloadCodes: 'Download Codes',
      copyCodes: 'Copy Codes',
      confirm: 'Confirm',
      cancel: 'Cancel',
      continue: 'Continue',
      setupGuide: 'Setup Guide',
      downloadApp: '1. Download an authenticator app (Authy recommended)',
      scanQR: '2. Scan the QR code or enter the key manually',
      enterCode: '3. Enter the generated code to confirm',
      disableConfirm: 'Are you sure you want to disable 2FA?',
      disableWarning: 'This will reduce your account security',
      regenerateCodes: 'Regenerate Codes',
      recoveryMethods: 'Recovery Methods',
      lostDevice: 'Lost Device?',
      recoveryGuide: 'Recovery Guide',
      smsRecovery: 'SMS recovery available',
      supportContact: 'Support Contact: +237 656 200 472',
      setupSuccess: '2FA successfully configured!',
      disableSuccess: '2FA successfully disabled',
      verificationFailed: 'Incorrect verification code',
      setupFailed: 'Failed to setup 2FA'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.fr;

  const setupTwoFactor = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/setup');
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data?.data?.qrCode);
        setSecret(data?.data?.secret);
        setBackupCodes(data?.data?.backupCodes || []);
        setStep('verify');
      } else {
        setError(data.message || t.setupFailed);
      }
    } catch (err) {
      setError(t.setupFailed);
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactor = async () => {
    if ((Array.isArray(verificationCode) ? verificationCode.length : 0) !== 6) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/enable', {
        verificationCode: verificationCode,
        secret: secret
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(t.setupSuccess);
        onToggle(true);
        setStep('setup');
        setVerificationCode('');
        
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: t.setupSuccess
        });
      } else {
        setError(data.message || t.verificationFailed);
      }
    } catch (err) {
      setError(t.verificationFailed);
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm(t.disableConfirm)) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/2fa/disable');
      const data = await response.json();
      
      if (data.success) {
        setSuccess(t.disableSuccess);
        onToggle(false);
        setStep('setup');
        
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: t.disableSuccess
        });
      } else {
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator?.clipboard?.writeText(text);
    toast({
      title: language === 'fr' ? 'Copié' : 'Copied',
      description: language === 'fr' ? 'Codes copiés dans le presse-papiers' : 'Codes copied to clipboard'
    });
  };

  const downloadBackupCodes = () => {
    const codesText = (Array.isArray(backupCodes) ? backupCodes : []).map((code, index) => `${index + 1}. ${code}`).join('\n');
    const content = `EDUCAFRIC - ${t.backupCodes}\n\n${codesText}\n\n${t.backupCodesDesc}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educafric-backup-codes-${language}.txt`;
    document?.body?.appendChild(a);
    a.click();
    document?.body?.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'fr' ? 'Téléchargement' : 'Download',
      description: language === 'fr' ? 'Codes téléchargés avec succès' : 'Codes downloaded successfully'
    });
  };

  // Configuration QR Code
  if (step === 'verify' && qrCode) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-500" />
            {t.step1Title}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">{t.step1Desc}</p>
          
          {/* QR Code */}
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="border rounded-lg" />
          </div>
          
          {/* Manual Entry */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t.manualEntry}</h4>
            <p className="text-sm text-gray-600 mb-2">{t.manualEntryDesc}</p>
            <code className="block bg-white p-2 rounded border font-mono text-sm break-all">
              {secret}
            </code>
          </div>
          
          {/* Setup Guide */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{t.setupGuide}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t.downloadApp}</li>
              <li>{t.scanQR}</li>
              <li>{t.enterCode}</li>
            </ul>
          </div>
          
          {/* Verification */}
          <div className="space-y-4">
            <h4 className="font-medium">{t.step2Title}</h4>
            <p className="text-sm text-gray-600">{t.step2Desc}</p>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-center">
              <InputOTP value={verificationCode} onChange={setVerificationCode} maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={verifyTwoFactor}
                disabled={loading || (Array.isArray(verificationCode) ? verificationCode.length : 0) !== 6}
                className="flex-1"
              >
                {loading ? (language === 'fr' ? 'Vérification...' : 'Verifying...') : t.confirm}
              </Button>
              <Button 
                onClick={() => setStep('setup')}
                variant="outline"
                className="flex-1"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
          
          {/* Backup Codes */}
          {(Array.isArray(backupCodes) ? backupCodes.length : 0) > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">{t.backupCodes}</h4>
              <p className="text-sm text-yellow-700 mb-3">{t.backupCodesDesc}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(Array.isArray(backupCodes) ? backupCodes : []).map((code, index) => (
                  <code key={index} className="block bg-white p-2 rounded text-sm font-mono">
                    {index + 1}. {code}
                  </code>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {t.copyCodes}
                </Button>
                <Button 
                  onClick={downloadBackupCodes}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadCodes}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Interface principale
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
          {t.twoFactorAuth}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span>{t.status}:</span>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? (
              <><Check className="w-3 h-3 mr-1" />{t.enabled}</>
            ) : (
              <><X className="w-3 h-3 mr-1" />{t.disabled}</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {!isEnabled ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">{t.setupGuide}</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>{t.downloadApp}</li>
                <li>{t.scanQR}</li>
                <li>{t.enterCode}</li>
              </ul>
            </div>
            
            <Button 
              onClick={setupTwoFactor} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? (language === 'fr' ? 'Configuration...' : 'Setting up...') : t.enable2FA}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">{t.recoveryMethods}</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• {t.backupCodes}</li>
                <li>• {t.smsRecovery}</li>
                <li>• {t.supportContact}</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={disableTwoFactor} 
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {loading ? (language === 'fr' ? 'Désactivation...' : 'Disabling...') : t.disable2FA}
              </Button>
              <Button 
                onClick={() => {/* Regenerate codes */}}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.regenerateCodes}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BilingualTwoFactorSetup;