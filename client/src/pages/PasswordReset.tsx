import { useState } from 'react';
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
  const [match, params] = useRoute('/reset-password/:token');
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { getErrorMessage } = useErrorMessages();
  const { requestPasswordReset, resetPassword } = useAuth();
  // reCAPTCHA removed
  
  // Request reset state
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'sms'>('email');
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
      const response = await apiRequest('POST', '/api/auth/forgot-password', { 
        [recoveryMethod === 'email' ? 'email' : 'phoneNumber']: identifier,
        method: recoveryMethod 
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: language === 'fr' ? 'Code envoyé' : 'Code sent',
            description: recoveryMethod === 'email' 
              ? (language === 'fr' ? 'Vérifiez votre email' : 'Check your email')
              : (language === 'fr' ? 'SMS envoyé avec le code' : 'SMS sent with code'),
          });
          setEmail('');
          setPhoneNumber('');
        } else {
          setError(language === 'fr' ? 'Profil non trouvé. Créez un compte d\'abord.' : 'Profile not found. Please create an account first.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || getErrorMessage('failedToSendReset'));
      }
    } catch (error) {
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

    if ((Array.isArray(password) ? password.length : 0) < 8) {
      setError(getErrorMessage('passwordTooShort'));
      return;
    }

    setIsResetLoading(true);
    try {
      await resetPassword(params?.token || '', password, confirmPassword);
      
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
              : (language === 'fr' ? 'Entrez votre email ou numéro pour récupérer votre compte' : 'Enter your email or phone number to recover your account')
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {error && (
            <div className="mb-4">
              <MobileErrorDisplay
                message={error}
                type="error"
                onClose={() => setError('')}
                mobile={true}
                className="bg-red-500/20 border border-red-300/30 rounded-2xl backdrop-blur-sm text-white"
              />
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
                    onClick={() => setRecoveryMethod('sms')}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all",
                      recoveryMethod === 'sms'
                        ? "bg-white/30 border-white/50 text-white"
                        : "bg-white/10 border-white/30 text-white/70 hover:bg-white/20"
                    )}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01?.986?.836l.74 4.435a1 1 0 01-.54 1.06l-1?.548?.773a11.037 11.037 0 006.105 6?.105l?.774-1.548a1 1 0 011.059-.54l4?.435?.74a1 1 0 01?.836?.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-sm font-medium">SMS</span>
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
                      className="px-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all mobile-touch-input"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mobile-input-field">
                  <Label htmlFor="phoneNumber" className="text-white/90 font-medium text-sm md:text-base">
                    {language === 'fr' ? 'Numéro de Téléphone' : 'Phone Number'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e?.target?.value)}
                      placeholder={language === 'fr' ? '+237 6XX XXX XXX' : '+237 6XX XXX XXX'}
                      className="px-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all mobile-touch-input"
                      required
                    />
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                disabled={isRequestLoading}
              >
                {isRequestLoading 
                  ? (language === 'fr' ? 'Envoi en cours...' : 'Sending...') 
                  : (recoveryMethod === 'email' 
                    ? (language === 'fr' ? 'Envoyer par Email' : 'Send by Email')
                    : (language === 'fr' ? 'Envoyer par SMS' : 'Send by SMS')
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
                    className="px-4 pr-10 bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all mobile-touch-input"
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
                    className="pl-10 bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all"
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