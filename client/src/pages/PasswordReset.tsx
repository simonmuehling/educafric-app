import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Logo from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
// Password reset system - reCAPTCHA completely removed
import { cn } from '@/lib/utils';
import { useErrorMessages } from '@/lib/errorMessages';
import { MobileErrorDisplay } from '@/components/ui/MobileErrorDisplay';
import { MobileLanguageToggle } from '@/components/ui/LanguageToggle';

export default function PasswordReset() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ token: string }>('/reset-password/:token');
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { getErrorMessage } = useErrorMessages();
  const { requestPasswordReset, resetPassword } = useAuth();
  // reCAPTCHA removed
  
  // Request reset state
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'whatsapp'>('email');
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  
  // Reset password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState('');

  const isResetMode = match && params?.token;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    const identifier = recoveryMethod === 'email' ? email : phoneNumber;
    if (!identifier) {
      setError(getErrorMessage('fillAllFields'));
      return;
    }

    setIsRequestLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          [recoveryMethod === 'email' ? 'email' : 'phoneNumber']: identifier,
          method: recoveryMethod,
          language
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // WhatsApp method returns a URL to open
        if (recoveryMethod === 'whatsapp' && data.whatsappUrl) {
          toast({
            title: language === 'fr' ? 'WhatsApp ouvert' : 'WhatsApp opened',
            description: language === 'fr' 
              ? 'Cliquez sur le lien dans WhatsApp pour réinitialiser' 
              : 'Click the link in WhatsApp to reset',
          });
          // Open WhatsApp with pre-filled message
          window.open(data.whatsappUrl, '_blank');
        } else {
          toast({
            title: language === 'fr' ? 'Email envoyé' : 'Email sent',
            description: language === 'fr' ? 'Vérifiez votre email' : 'Check your email',
          });
        }
        setEmail('');
        setPhoneNumber('');
      } else {
        // Show specific error message from backend
        const errorMessage = data.message || getErrorMessage('failedToSendReset');
        
        // If user not found, suggest signup
        if (data.errorCode === 'USER_NOT_FOUND' || data.suggestion === 'signup') {
          setError(
            language === 'fr' 
              ? 'Aucun compte trouvé avec cet identifiant. Veuillez créer un compte d\'abord.' 
              : 'No account found with this identifier. Please create an account first.'
          );
          
          // Show toast with signup suggestion
          toast({
            title: language === 'fr' ? 'Compte introuvable' : 'Account not found',
            description: language === 'fr' 
              ? 'Cliquez sur "S\'inscrire" ci-dessous pour créer un compte.' 
              : 'Click "Sign up" below to create an account.',
          });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(getErrorMessage('failedToSendReset'));
    } finally {
      setIsRequestLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    if (!password || !confirmPassword) {
      setError(getErrorMessage('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(getErrorMessage('passwordsDontMatch'));
      return;
    }

    if (password.length < 8) {
      setError(getErrorMessage('passwordTooShort'));
      return;
    }

    setIsResetLoading(true);
    try {
      if (!params?.token) {
        throw new Error('Token manquant');
      }
      await resetPassword(params.token, password, confirmPassword, language);
      
      toast({
        title: language === 'fr' ? 'Mot de passe réinitialisé' : 'Password reset successful',
        description: language === 'fr' ? 'Votre mot de passe a été réinitialisé avec succès' : 'Your password has been reset successfully',
      });
      setLocation('/login');
    } catch (error) {
      setError(getErrorMessage('failedToResetPassword'));
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-yellow-400/40 rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-32 left-32 w-5 h-5 bg-pink-400/40 rounded-full animate-bounce delay-1000"></div>

      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <MobileLanguageToggle />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
        
        <CardHeader className="text-center relative z-10 space-y-6 pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                <img 
                  src="/educafric-logo-128.png" 
                  alt={language === 'fr' ? 'Logo Educafric' : 'Educafric Logo'} 
                  className="w-20 h-20 object-contain rounded-2xl"
                  onError={(e) => { e.currentTarget.src = '/favicon.ico'; }}
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-sm text-white font-bold">{isResetMode ? '🔑' : '📧'}</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
            {isResetMode 
              ? (language === 'fr' ? 'Nouveau mot de passe' : 'New Password') 
              : (language === 'fr' ? 'Mot de passe oublié' : 'Forgot Password')
            }
          </CardTitle>
          <div className="text-center mb-4">
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-300 via-yellow-300 to-pink-300 bg-clip-text text-transparent">
              EDUCAFRIC
            </p>
            <p className="text-white/90 text-base font-medium">
              {language === 'fr' ? 'Plateforme Éducative Africaine' : 'African Educational Platform'}
            </p>
          </div>
          <p className="text-white/80 text-sm">
            {isResetMode 
              ? (language === 'fr' ? 'Créez un nouveau mot de passe sécurisé' : 'Create a new secure password')
              : (language === 'fr' ? 'Choisissez Email ou WhatsApp pour récupérer votre compte' : 'Choose Email or WhatsApp to recover your account')
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {error && (
            <div className="mb-4 space-y-3">
              <MobileErrorDisplay
                message={error}
                type="error"
                onClose={() => setError('')}
                mobile={true}
                className="bg-red-500/20 border border-red-300/30 rounded-2xl backdrop-blur-sm text-white"
              />
              {error.includes('compte') || error.includes('account') ? (
                <Button
                  type="button"
                  onClick={() => setLocation('/register')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                  data-testid="button-signup-suggestion"
                >
                  {language === 'fr' ? '📝 Créer un compte maintenant' : '📝 Create an account now'}
                </Button>
              ) : null}
            </div>
          )}
          
          {!isResetMode ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              {/* Recovery Method Selection */}
              <div className="space-y-3">
                <Label className="text-white/90 font-medium">
                  {language === 'fr' ? 'Méthode de récupération' : 'Recovery Method'}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('email')}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all",
                      recoveryMethod === 'email'
                        ? "bg-white/30 border-white/50 text-white"
                        : "bg-white/10 border-white/30 text-white/70 hover:bg-white/20"
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('whatsapp')}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all",
                      recoveryMethod === 'whatsapp'
                        ? "bg-white/30 border-white/50 text-white"
                        : "bg-white/10 border-white/30 text-white/70 hover:bg-white/20"
                    )}
                    data-testid="button-recovery-whatsapp"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Input Field Based on Recovery Method */}
              {recoveryMethod === 'email' ? (
                <div className="space-y-2 mobile-input-field">
                  <Label htmlFor="email" className="text-white/90 font-medium text-sm md:text-base">
                    {language === 'fr' ? 'Adresse E-mail' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder={language === 'fr' ? 'votre.email@exemple.com' : 'your.email@example.com'}
                      value={email}
                      onChange={(e) => setEmail(e?.target?.value)}
                      className="px-4 bg-white/80 border border-white/30 rounded-xl text-gray-900 placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/90 focus:border-white/50 transition-all mobile-touch-input"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mobile-input-field">
                  <Label htmlFor="phoneNumber" className="text-white/90 font-medium text-sm md:text-base">
                    {language === 'fr' ? 'Numéro WhatsApp' : 'WhatsApp Number'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e?.target?.value)}
                      placeholder={language === 'fr' ? '+237 6XX XXX XXX' : '+237 6XX XXX XXX'}
                      className="px-4 bg-white/80 border border-white/30 rounded-xl text-gray-900 placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/90 focus:border-white/50 transition-all mobile-touch-input"
                      required
                      data-testid="input-whatsapp"
                    />
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                disabled={isRequestLoading}
                data-testid="button-submit-reset"
              >
                {isRequestLoading 
                  ? (language === 'fr' ? 'Envoi en cours...' : 'Sending...') 
                  : (recoveryMethod === 'email' 
                    ? (language === 'fr' ? 'Envoyer par Email' : 'Send by Email')
                    : (language === 'fr' ? 'Envoyer par WhatsApp' : 'Send by WhatsApp')
                  )
                }
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setLocation('/login')}
                  className="text-white/90 hover:text-white underline hover:no-underline transition-all font-medium"
                >
                  {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2 mobile-input-field">
                <Label htmlFor="password" className="text-white/90 font-medium text-sm md:text-base">
                  {language === 'fr' ? 'Nouveau Mot de Passe' : 'New Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === 'fr' ? 'Saisissez votre nouveau mot de passe' : 'Enter your new password'}
                    value={password}
                    onChange={(e) => setPassword(e?.target?.value)}
                    className="px-4 pr-10 bg-white/80 border border-white/30 rounded-xl text-gray-900 placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/90 focus:border-white/50 transition-all mobile-touch-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 mobile-password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-white/70" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/70" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90 font-medium">
                  {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === 'fr' ? 'Confirmez votre nouveau mot de passe' : 'Confirm your new password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e?.target?.value)}
                    className="pl-10 bg-white/80 border border-white/30 rounded-xl text-gray-900 placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/90 focus:border-white/50 transition-all"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                disabled={isResetLoading}
              >
                {isResetLoading 
                  ? (language === 'fr' ? 'Réinitialisation...' : 'Resetting...') 
                  : (language === 'fr' ? 'Réinitialiser le mot de passe' : 'Reset password')
                }
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setLocation('/login')}
                  className="text-white/90 hover:text-white underline hover:no-underline transition-all font-medium"
                >
                  {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}