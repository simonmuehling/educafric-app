import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { firebaseAuth2FA, type Firebase2FAConfig } from '@/lib/firebaseAuth2FA';
import { 
  Shield, 
  Smartphone, 
  MessageSquare, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Settings
} from 'lucide-react';

const FirebaseTwoFactorSetup = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorStatus, setTwoFactorStatus] = useState<Firebase2FAConfig | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const text = {
    fr: {
      title: 'Authentification à Deux Facteurs Firebase',
      subtitle: 'Sécurisez votre compte avec la 2FA Firebase',
      currentStatus: 'Statut Actuel',
      enabled: 'Activé',
      disabled: 'Désactivé',
      phoneNumber: 'Numéro de Téléphone',
      phoneHint: 'Format: +237xxxxxxxxx (avec indicatif pays)',
      sendCode: 'Envoyer Code SMS',
      verifyCode: 'Vérifier le Code',
      verificationCode: 'Code de Vérification',
      codeHint: 'Entrez le code reçu par SMS',
      backupCodes: 'Codes de Sauvegarde',
      backupCodesDesc: 'Conservez ces codes en lieu sûr. Ils permettent l\'accès si vous perdez votre téléphone.',
      saveBackupCodes: 'Sauvegarder les Codes',
      showCodes: 'Afficher les Codes',
      hideCodes: 'Masquer les Codes',
      copyCodes: 'Copier Tous les Codes',
      enable2FA: 'Activer 2FA',
      disable2FA: 'Désactiver 2FA',
      setup2FA: 'Configurer 2FA',
      reconfigure: 'Reconfigurer',
      step1: 'Étape 1: Numéro de Téléphone',
      step2: 'Étape 2: Vérification SMS',
      step3: 'Étape 3: Codes de Sauvegarde',
      step4: 'Configuration Terminée',
      sendingSMS: 'Envoi SMS...',
      verifying: 'Vérification...',
      enabling: 'Activation...',
      disabling: 'Désactivation...',
      smsSuccess: 'SMS envoyé avec succès',
      smsSuccessDesc: 'Vérifiez votre téléphone pour le code',
      verifySuccess: '2FA activé avec succès',
      verifySuccessDesc: 'Votre compte est maintenant sécurisé',
      smsError: 'Erreur d\'envoi SMS',
      verifyError: 'Code invalide',
      phoneRequired: 'Numéro de téléphone requis',
      codeRequired: 'Code de vérification requis',
      invalidPhone: 'Format de numéro invalide',
      tooManyAttempts: 'Trop de tentatives, réessayez plus tard',
      quotaExceeded: 'Quota SMS dépassé, réessayez demain',
      codesCopied: 'Codes copiés dans le presse-papiers',
      securityWarning: 'Important: Gardez ces codes en sécurité',
      securityWarningDesc: 'Ne partagez jamais vos codes de sauvegarde',
      lastVerified: 'Dernière vérification',
      phoneRegistered: 'Téléphone enregistré',
      backupCodesRemaining: 'codes de sauvegarde restants'
    },
    en: {
      title: 'Firebase Two-Factor Authentication',
      subtitle: 'Secure your account with Firebase 2FA',
      currentStatus: 'Current Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      phoneNumber: 'Phone Number',
      phoneHint: 'Format: +237xxxxxxxxx (with country code)',
      sendCode: 'Send SMS Code',
      verifyCode: 'Verify Code',
      verificationCode: 'Verification Code',
      codeHint: 'Enter the code received via SMS',
      backupCodes: 'Backup Codes',
      backupCodesDesc: 'Keep these codes safe. They allow access if you lose your phone.',
      saveBackupCodes: 'Save Backup Codes',
      showCodes: 'Show Codes',
      hideCodes: 'Hide Codes',
      copyCodes: 'Copy All Codes',
      enable2FA: 'Enable 2FA',
      disable2FA: 'Disable 2FA',
      setup2FA: 'Setup 2FA',
      reconfigure: 'Reconfigure',
      step1: 'Step 1: Phone Number',
      step2: 'Step 2: SMS Verification',
      step3: 'Step 3: Backup Codes',
      step4: 'Setup Complete',
      sendingSMS: 'Sending SMS...',
      verifying: 'Verifying...',
      enabling: 'Enabling...',
      disabling: 'Disabling...',
      smsSuccess: 'SMS sent successfully',
      smsSuccessDesc: 'Check your phone for the verification code',
      verifySuccess: '2FA enabled successfully',
      verifySuccessDesc: 'Your account is now secure',
      smsError: 'SMS sending error',
      verifyError: 'Invalid code',
      phoneRequired: 'Phone number required',
      codeRequired: 'Verification code required',
      invalidPhone: 'Invalid phone format',
      tooManyAttempts: 'Too many attempts, try again later',
      quotaExceeded: 'SMS quota exceeded, try again tomorrow',
      codesCopied: 'Codes copied to clipboard',
      securityWarning: 'Important: Keep these codes secure',
      securityWarningDesc: 'Never share your backup codes',
      lastVerified: 'Last verified',
      phoneRegistered: 'Phone registered',
      backupCodesRemaining: 'backup codes remaining'
    }
  };

  const t = text[language];

  // Load 2FA status on component mount
  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    try {
      const status = await firebaseAuth2FA.get2FAStatus();
      setTwoFactorStatus(status);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (digits.startsWith('6') && (Array.isArray(digits) ? digits.length : 0) === 9) {
      return '+237' + digits; // Cameroon
    } else if (digits.startsWith('237') && (Array.isArray(digits) ? digits.length : 0) === 12) {
      return '+' + digits;
    } else if (digits.startsWith('41') && (Array.isArray(digits) ? digits.length : 0) === 11) {
      return '+' + digits; // Switzerland
    }
    
    return phone.startsWith('+') ? phone : '+' + digits;
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: t.smsError,
        description: t.phoneRequired,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Initialize reCAPTCHA container
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        container?.style?.display = 'none';
        document?.body?.appendChild(container);
      }

      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await firebaseAuth2FA.sendSMSVerification(formattedPhone);
      
      if (result.success) {
        setStep('verify');
        toast({
          title: t.smsSuccess,
          description: t.smsSuccessDesc
        });
      } else {
        let errorMessage = result.error || t.smsError;
        
        // Handle specific error cases
        if (result.error?.includes('invalid-phone-number')) {
          errorMessage = t.invalidPhone;
        } else if (result.error?.includes('too-many-requests')) {
          errorMessage = t.tooManyAttempts;
        } else if (result.error?.includes('quota-exceeded')) {
          errorMessage = t.quotaExceeded;
        }

        toast({
          title: t.smsError,
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('SMS send error:', error);
      toast({
        title: t.smsError,
        description: t.smsError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: t.verifyError,
        description: t.codeRequired,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const verifyResult = await firebaseAuth2FA.verifySMSCode(verificationCode);
      
      if (verifyResult.success) {
        // Enable MFA and get backup codes
        const enableResult = await firebaseAuth2FA.enableMFA(formatPhoneNumber(phoneNumber));
        
        if (enableResult.success && enableResult.backupCodes) {
          setBackupCodes(enableResult.backupCodes);
          setStep('backup');
          toast({
            title: t.verifySuccess,
            description: t.verifySuccessDesc
          });
        } else {
          throw new Error(enableResult.error || 'Failed to enable 2FA');
        }
      } else {
        toast({
          title: t.verifyError,
          description: verifyResult.error || t.verifyError,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: t.verifyError,
        description: t.verifyError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    
    try {
      const result = await firebaseAuth2FA.disableMFA();
      
      if (result.success) {
        setTwoFactorStatus(null);
        setStep('setup');
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to disable 2FA",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator?.clipboard?.writeText(codesText).then(() => {
      toast({
        title: t.codesCopied,
        description: `${(Array.isArray(backupCodes) ? backupCodes.length : 0)} codes copied`
      });
    });
  };

  const renderCurrentStatus = () => (
    <ModernCard className="p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${twoFactorStatus?.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Shield className={`w-6 h-6 ${twoFactorStatus?.isEnabled ? 'text-green-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t.currentStatus}</h3>
          <Badge variant={twoFactorStatus?.isEnabled ? "default" : "secondary"}>
            {twoFactorStatus?.isEnabled ? t.enabled : t.disabled}
          </Badge>
        </div>
      </div>

      {twoFactorStatus?.isEnabled && (
        <div className="space-y-3 p-4 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{t.phoneRegistered}:</span>
            <span className="text-sm">{twoFactorStatus.phoneNumber}</span>
          </div>
          {twoFactorStatus.lastVerified && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t.lastVerified}:</span>
              <span className="text-sm">
                {twoFactorStatus?.lastVerified?.toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Backup codes:</span>
            <span className="text-sm">
              {twoFactorStatus.(Array.isArray(backupCodes) ? backupCodes.length : 0)} {t.backupCodesRemaining}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {twoFactorStatus?.isEnabled ? (
          <>
            <Button 
              onClick={handleDisable2FA}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.disabling}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {t.disable2FA}
                </>
              )}
            </Button>
            <Button 
              onClick={() => setStep('setup')}
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t.reconfigure}
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => setStep('setup')}
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            {t.setup2FA}
          </Button>
        )}
      </div>
    </ModernCard>
  );

  const renderSetupStep = () => (
    <ModernCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{t.step1}</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t.phoneNumber}</label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e?.target?.value)}
            placeholder="+237xxxxxxxxx"
            className="w-full"
          />
          <p className="text-sm text-gray-600 mt-1">{t.phoneHint}</p>
        </div>
        
        <Button 
          onClick={handleSendSMS}
          disabled={isLoading || !phoneNumber.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {t.sendingSMS}
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              {t.sendCode}
            </>
          )}
        </Button>
      </div>
    </ModernCard>
  );

  const renderVerifyStep = () => (
    <ModernCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">{t.step2}</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t.verificationCode}</label>
          <Input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e?.target?.value)}
            placeholder="123456"
            className="w-full text-center text-2xl tracking-widest"
            maxLength={6}
          />
          <p className="text-sm text-gray-600 mt-1">{t.codeHint}</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleVerifyCode}
            disabled={isLoading || !verificationCode.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t.verifying}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t.verifyCode}
              </>
            )}
          </Button>
          <Button 
            onClick={() => setStep('setup')}
            variant="outline"
          >
            Back
          </Button>
        </div>
      </div>
    </ModernCard>
  );

  const renderBackupCodesStep = () => (
    <ModernCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold">{t.step3}</h3>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-orange-800">{t.securityWarning}</span>
        </div>
        <p className="text-sm text-orange-700">{t.securityWarningDesc}</p>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">{t.backupCodesDesc}</p>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium">{t.backupCodes}</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                variant="outline"
                size="sm"
              >
                {showBackupCodes ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    {t.hideCodes}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    {t.showCodes}
                  </>
                )}
              </Button>
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                {t.copyCodes}
              </Button>
            </div>
          </div>
          
          {showBackupCodes && (
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {(Array.isArray(backupCodes) ? backupCodes : []).map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => {
            setStep('complete');
            loadTwoFactorStatus();
          }}
          className="w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {t.saveBackupCodes}
        </Button>
      </div>
    </ModernCard>
  );

  const renderCompleteStep = () => (
    <ModernCard className="p-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t.step4}</h3>
        <p className="text-gray-600 mb-4">{t.verifySuccessDesc}</p>
        <Button 
          onClick={() => setStep('setup')}
          variant="outline"
        >
          <Settings className="w-4 h-4 mr-2" />
          {t.reconfigure}
        </Button>
      </div>
    </ModernCard>
  );

  if (!user) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to configure 2FA.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>

      {/* Current Status */}
      {renderCurrentStatus()}

      {/* Setup Steps */}
      {step === 'setup' && renderSetupStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'backup' && renderBackupCodesStep()}
      {step === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default FirebaseTwoFactorSetup;