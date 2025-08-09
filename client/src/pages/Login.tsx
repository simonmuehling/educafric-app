import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { useErrorMessages } from '@/lib/errorMessages';
import { MobileErrorDisplay } from '@/components/ui/MobileErrorDisplay';
import { MobileLanguageToggle } from '@/components/ui/LanguageToggle';
import { celebrateLogin, celebrateSignup } from '@/lib/confetti';
import { CelebrationToast } from '@/components/ui/CelebrationToast';
import { MultiRoleDetectionPopup } from '@/components/auth/MultiRoleDetectionPopup';
import { apiRequest } from "@/lib/queryClient";

// Authentication system - reCAPTCHA completely removed

export default function Login() {
  const { login, register, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { getErrorMessage } = useErrorMessages();
  // reCAPTCHA removed
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'Student',
  });
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState<{
    show: boolean;
    type: 'login' | 'signup';
    title: string;
    message: string;
    userRole?: string;
  }>({ show: false, type: 'login', title: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showMultiRolePopup, setShowMultiRolePopup] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<any>(null);

  // Multi-role detection and selection
  const [detectedRoles, setDetectedRoles] = useState<any[]>([]);
  
  const handleMultiRoleDetection = async (phoneNumber: string) => {
    try {
      const response = await apiRequest('POST', '/api/multirole/detect-roles', { 
        phone: phoneNumber,
        email: formData.email 
      });
      const data = await response.json();

      if (data.detectedRoles && Array.isArray(data.detectedRoles) && data.detectedRoles.length > 1) {
        setDetectedRoles(data.detectedRoles);
        setShowMultiRolePopup(true);
        return true;
      }
    } catch (error) {
      console.log('No multi-role detection needed:', error);
    }
    return false;
  };

  const handleRoleSelection = async (selectedRoles: string[]) => {
    try {
      if ((Array.isArray(selectedRoles) ? selectedRoles.length : 0) > 0) {
        // Register multi-role user
        await apiRequest('POST', '/api/multirole/register-multi-role', {
          phone: formData.phoneNumber,
          roles: selectedRoles
        });
        
        toast({
          title: language === 'fr' ? 'Rôles configurés' : 'Roles configured',
          description: language === 'fr' 
            ? `${(Array.isArray(selectedRoles) ? selectedRoles.length : 0)} rôles sélectionnés avec succès`
            : `${(Array.isArray(selectedRoles) ? selectedRoles.length : 0)} roles selected successfully`
        });
      }
      
      setShowMultiRolePopup(false);
      
      // Continue with registration or login
      if (pendingRegistration) {
        await proceedWithRegistration();
      }
    } catch (error: any) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de la configuration des rôles' : 'Error configuring roles'),
        variant: 'destructive'
      });
    }
  };

  const proceedWithRegistration = async () => {
    try {
      await register(formData);
      
      celebrateSignup();
      setShowCelebration({
        show: true,
        type: 'signup',
        title: language === 'fr' ? 'Compte créé avec succès!' : 'Account created successfully!',
        message: language === 'fr' 
          ? `Bienvenue ${formData.firstName || ''} ${formData.lastName || ''}! Votre compte ${t(`roles.${formData?.role?.toLowerCase()}`)} est maintenant actif.`
          : `Welcome ${formData.firstName || ''} ${formData.lastName || ''}! Your ${t(`roles.${formData?.role?.toLowerCase()}`)} account is now active.`,
        userRole: formData.role
      });
    } catch (error: any) {
      setError(getErrorMessage(error.message));
    } finally {
      setPendingRegistration(null);
    }
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e?.target?.name]: e?.target?.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError(getErrorMessage('emailRequired'));
      return;
    }

    try {
      if (isRegisterMode) {
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
          setError(getErrorMessage('namesRequired'));
          return;
        }
        // Check for multi-role detection first
        const needsRoleSelection = await handleMultiRoleDetection(formData.phoneNumber);
        
        if (needsRoleSelection) {
          setPendingRegistration(formData);
          return;
        }
        
        await register(formData);
        
        // Trigger confetti celebration for new user
        celebrateSignup();
        
        // Show custom celebration toast with user details
        const userDisplayName = `${formData.firstName || ''} ${formData.lastName || ''}`;
        setShowCelebration({
          show: true,
          type: 'signup',
          title: `🎉 Welcome ${userDisplayName}!`,
          message: `Your ${formData.role} account has been created successfully!`,
          userRole: formData.role
        });
        
        toast({
          title: String(t('success') || 'Success'),
          description: String(getErrorMessage('accountCreated') || 'Account created successfully'),
          duration: 5000,
        });
        
        // Switch to login mode after celebration
        setTimeout(() => {
          setIsRegisterMode(false);
        }, 2000);
      } else {
        await login(formData.email, formData.password);
        
        // Trigger confetti celebration for successful login
        celebrateLogin();
        
        // Show custom celebration toast
        setShowCelebration({
          show: true,
          type: 'login',
          title: '🎉 Login Successful!',
          message: `Welcome back! Redirecting to your dashboard...`
        });
        
        toast({
          title: String(t('success') || 'Success'),
          description: String(t('welcomeBack') || 'Welcome back!'),
          duration: 4000,
        });
      }
    } catch (err: any) {
      // Parse error message for known authentication errors
      const errorMessage = err.message || '';
      if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Invalid credentials')) {
        setError(getErrorMessage('invalidCredentials'));
      } else if (errorMessage.includes('already exists')) {
        setError(getErrorMessage('accountExists'));
      } else {
        setError(getErrorMessage('authFailed'));
      }
    }
  };



  const userRoles = [
    { value: 'Student', label: language === 'fr' ? 'Élève' : 'Student' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Teacher', label: language === 'fr' ? 'Enseignant' : 'Teacher' },
    { value: 'Director', label: language === 'fr' ? 'Directeur d\'École' : 'School Director' },
    { value: 'Commercial', label: 'Commercial' },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-50/30 to-pink-50/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-50/20 to-blue-50/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Subtle Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-blue-200/50 rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-purple-200/50 rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-32 left-32 w-5 h-5 bg-pink-200/50 rounded-full animate-bounce delay-1000"></div>

      {/* Celebration Toast */}
      {showCelebration.show && (
        <CelebrationToast
          type={showCelebration.type}
          title={showCelebration.title || ''}
          message={showCelebration.message}
          userRole={showCelebration.userRole}
          onClose={() => setShowCelebration({ show: false, type: 'login', title: '', message: '' })}
        />
      )}
      
      {/* Navigation Controls */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/')}
          className="bg-white/80 hover:bg-white border-gray-200 text-gray-700 hover:text-gray-900 shadow-lg rounded-full px-4 py-2 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'fr' ? 'Accueil' : 'Home'}
        </Button>
      </div>
      
      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <MobileLanguageToggle />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white rounded-3xl"></div>
        
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
                <span className="text-sm text-white font-bold">🚀</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            {isRegisterMode ? (language === 'fr' ? 'Créer votre compte' : 'Create Account') : (language === 'fr' ? 'Connexion' : 'Login')}
          </CardTitle>
          <div className="text-center mb-4">
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              EDUCAFRIC
            </p>
            <p className="text-gray-700 text-base font-medium">
              {language === 'fr' ? 'Plateforme Éducative Africaine' : 'African Educational Platform'}
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            {isRegisterMode 
              ? (language === 'fr' ? 'Créez votre compte pour commencer' : 'Create your account to get started')
              : (language === 'fr' ? 'Accédez à votre plateforme éducative' : 'Welcome back to your educational platform')
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
                className="bg-red-50 border border-red-200 rounded-2xl text-red-900 font-medium"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">{t('firstName')}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    placeholder={language === 'fr' ? 'Jean' : 'John'}
                    required={isRegisterMode}
                    className="bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">{t('lastName')}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    placeholder={language === 'fr' ? 'Dupond' : 'Doe'}
                    required={isRegisterMode}
                    className="bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                  {language === 'fr' ? 'Numéro de téléphone *' : 'Phone Number *'}
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder={language === 'fr' ? '+237 6XX XXX XXX' : '+237 6XX XXX XXX'}
                  required={isRegisterMode}
                  className="bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all"
                />
                <p className="text-gray-500 text-xs">
                  {language === 'fr' ? 'Identifiant unique pour la récupération de mot de passe' : 'Unique identifier for password recovery'}
                </p>
              </div>
            )}

            <div className="space-y-2 mobile-input-field">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm md:text-base">
                {language === 'fr' ? 'Adresse E-mail' : 'Email Address'}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder={language === 'fr' ? 'votre.email@exemple.com' : 'your.email@example.com'}
                  className="px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all mobile-touch-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mobile-input-field">
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm md:text-base">
                {language === 'fr' ? 'Mot de Passe' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={language === 'fr' ? 'Votre mot de passe' : 'Your password'}
                  className="px-4 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all mobile-touch-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors mobile-password-toggle"
                  aria-label={showPassword ? (language === 'fr' ? 'Masquer le mot de passe' : 'Hide password') : (language === 'fr' ? 'Afficher le mot de passe' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 font-medium">{t('role')}</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 mobile-select"
                >
                  {(Array.isArray(userRoles) ? userRoles : []).map(role => (
                    <option key={role.value} value={role.value} className="bg-white text-gray-900">
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loading.authenticating')}
                </>
              ) : (
                isRegisterMode ? t('auth.register.button') : t('auth.login.button')
              )}
            </Button>

            {!isRegisterMode && (
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all"
                  onClick={() => {
                    if (window?.location) {
                      window.location.href = '/forgot-password';
                    }
                  }}
                  type="button"
                >
                  {t('auth.forgot.title')}?
                </Button>
              </div>
            )}
          </form>



          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-all font-medium"
            >
              {isRegisterMode 
                ? (language === 'fr' ? 'Vous avez déjà un compte ? Connectez-vous' : 'Already have an account? Sign in')
                : (language === 'fr' ? "Vous n'avez pas de compte ? Inscrivez-vous" : "Don't have an account? Sign up")
              }
            </button>
            
            <div className="pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Role Detection Popup */}
      <MultiRoleDetectionPopup
        isOpen={showMultiRolePopup}
        onClose={() => {
          setShowMultiRolePopup(false);
          setPendingRegistration(null);
        }}
        phoneNumber={formData.phoneNumber}
        email={formData.email}
        onRoleSelection={(roles) => handleRoleSelection(roles.map(r => r.role))}
      />


    </div>
  );
}
