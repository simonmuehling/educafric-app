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
import { GraduationCap, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, Home, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { useErrorMessages } from '@/lib/errorMessages';
import { MobileErrorDisplay } from '@/components/ui/MobileErrorDisplay';
import { MobileLanguageToggle } from '@/components/ui/LanguageToggle';
import { celebrateLogin, celebrateSignup } from '@/lib/confetti';
import { CelebrationToast } from '@/components/ui/CelebrationToast';
import { MultiRoleDetectionPopup } from '@/components/auth/MultiRoleDetectionPopup';
import { DuplicateDetectionDialog } from '@/components/auth/DuplicateDetectionDialog';
import { apiRequest } from "@/lib/queryClient";
import { useFacebookAuth } from '@/hooks/useFacebookAuth';

// Authentication system - reCAPTCHA completely removed

export default function Login() {
  const { login, register, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { getErrorMessage } = useErrorMessages();
  const { loginWithFacebook, isLoading: isFacebookLoading } = useFacebookAuth();
  // reCAPTCHA removed
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'Student',
    countryCode: '+237', // Cameroun par défaut
    educafricNumber: '', // EDUCAFRIC number for Directors
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

  // Duplicate detection state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateData, setDuplicateData] = useState<{
    existingUser: any;
    emailMatch: boolean;
    phoneMatch: boolean;
  } | null>(null);

  // Check URL params for mode=register on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'register') {
      setIsRegisterMode(true);
    }
  }, []);
  
  // Check for duplicate email/phone
  const checkForDuplicates = async (email: string, phoneNumber: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/check-duplicate', {
        email,
        phoneNumber
      });
      const data = await response.json();
      
      if (data.hasDuplicate && data.existingUser) {
        setDuplicateData({
          existingUser: data.existingUser,
          emailMatch: data.emailMatch || false,
          phoneMatch: data.phoneMatch || false
        });
        setShowDuplicateDialog(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      return false;
    }
  };

  // Handle import of existing profile
  const handleImportProfile = async () => {
    if (!duplicateData?.existingUser) return;
    
    try {
      const response = await apiRequest('POST', '/api/auth/import-profile', {
        existingUserId: duplicateData.existingUser.id,
        newRole: formData.role,
        password: formData.password
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = language === 'fr' 
          ? (errorData.messageFr || errorData.message || 'Échec de l\'importation du profil')
          : (errorData.message || errorData.messageFr || 'Profile import failed');
        setError(errorMessage);
        return; // Keep dialog open to show error
      }
      
      const data = await response.json();
      
      if (data.success) {
        setShowDuplicateDialog(false);
        celebrateSignup();
        setShowCelebration({
          show: true,
          type: 'signup',
          title: language === 'fr' ? 'Profil importé avec succès!' : 'Profile imported successfully!',
          message: language === 'fr' 
            ? `Bienvenue! Votre profil ${t(`roles.${formData.role.toLowerCase()}`)} a été créé avec vos informations existantes.`
            : `Welcome! Your ${t(`roles.${formData.role.toLowerCase()}`)} profile has been created with your existing information.`,
          userRole: formData.role
        });
      } else {
        const errorMessage = language === 'fr' 
          ? (data.messageFr || data.message || 'Échec de l\'importation du profil')
          : (data.message || data.messageFr || 'Profile import failed');
        setError(errorMessage);
      }
    } catch (error: any) {
      setError(getErrorMessage(error.message || (language === 'fr' 
        ? 'Échec de l\'importation du profil' 
        : 'Profile import failed')));
    }
  };

  // Handle cancel of duplicate import
  const handleCancelImport = () => {
    setShowDuplicateDialog(false);
    setDuplicateData(null);
    setError(language === 'fr' 
      ? 'Veuillez utiliser un autre email ou numéro de téléphone pour vous inscrire.'
      : 'Please use a different email or phone number to register.'
    );
  };
  
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

  // Gestion de la connexion Facebook
  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
      // La redirection est gérée automatiquement par useFacebookAuth
    } catch (error: any) {
      setError(getErrorMessage(error.message || 'Facebook login failed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // LOGIN mode: require email OR phone + password
    if (!isRegisterMode) {
      // Trim values to catch empty strings
      const emailValue = formData.email?.trim();
      const phoneValue = formData.phoneNumber?.trim();
      const passwordValue = formData.password?.trim();
      
      if ((!emailValue && !phoneValue) || !passwordValue) {
        setError(language === 'fr' 
          ? 'Email ou numéro de téléphone et mot de passe requis' 
          : 'Email or phone number and password required'
        );
        return;
      }
    }

    // REGISTER mode: require phone + password (email optional)
    if (isRegisterMode) {
      // Trim values to catch empty strings
      const firstNameValue = formData.firstName?.trim();
      const lastNameValue = formData.lastName?.trim();
      const phoneValue = formData.phoneNumber?.trim();
      const passwordValue = formData.password?.trim();
      
      if (!firstNameValue || !lastNameValue || !phoneValue || !passwordValue) {
        setError(language === 'fr' 
          ? 'Nom, prénom, téléphone et mot de passe requis' 
          : 'First name, last name, phone and password required'
        );
        return;
      }
      
      // Validate EDUCAFRIC number for Directors BEFORE submission
      if (formData.role === 'Director') {
        const educafricNumber = formData.educafricNumber?.trim();
        
        if (!educafricNumber) {
          setError(language === 'fr' 
            ? '⚠️ Le numéro EDUCAFRIC est obligatoire pour les directeurs d\'école. Veuillez saisir votre numéro EDUCAFRIC (format: EDU-CM-SC-XXX).' 
            : '⚠️ EDUCAFRIC number is required for school directors. Please enter your EDUCAFRIC number (format: EDU-CM-SC-XXX).'
          );
          return;
        }
        
        // Validate format locally before API call
        const educafricRegex = /^EDU-CM-SC-\d{3}$/;
        if (!educafricRegex.test(educafricNumber)) {
          setError(language === 'fr' 
            ? `⚠️ Format du numéro EDUCAFRIC invalide: "${educafricNumber}". Le format correct est EDU-CM-SC-XXX (ex: EDU-CM-SC-001, EDU-CM-SC-025).` 
            : `⚠️ Invalid EDUCAFRIC number format: "${educafricNumber}". Correct format is EDU-CM-SC-XXX (e.g., EDU-CM-SC-001, EDU-CM-SC-025).`
          );
          return;
        }
      }
    }

    try {
      if (isRegisterMode) {
        // Clean up email - remove if empty or placeholder
        const cleanedData = {
          ...formData,
          email: (formData.email && !formData.email.includes('example.com')) ? formData.email : undefined
        };
        
        // Check for duplicate email/phone FIRST (only if email is provided)
        const hasDuplicate = await checkForDuplicates(cleanedData.email || '', formData.phoneNumber);
        if (hasDuplicate) {
          return; // Stop here and show duplicate dialog
        }
        
        // Then check for multi-role detection
        const needsRoleSelection = await handleMultiRoleDetection(formData.phoneNumber);
        
        if (needsRoleSelection) {
          setPendingRegistration(cleanedData);
          return;
        }
        
        await register(cleanedData);
        
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
        const emailOrPhone = formData.email || formData.phoneNumber;
        await login(emailOrPhone, formData.password);
        
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
      
      // Check for EDUCAFRIC-specific errors (show backend message directly)
      if (errorMessage.includes('EDUCAFRIC') || errorMessage.includes('numéro')) {
        // Show backend error message directly for EDUCAFRIC validation
        setError(language === 'fr' 
          ? (err.messageFr || errorMessage) 
          : (err.messageEn || errorMessage)
        );
      } else if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Invalid credentials')) {
        setError(getErrorMessage('invalidCredentials'));
      } else if (errorMessage.includes('already exists')) {
        setError(getErrorMessage('accountExists'));
      } else if (errorMessage.includes('Failed to create school')) {
        // Show backend error message directly for school creation failures
        setError(language === 'fr' 
          ? (err.messageFr || errorMessage) 
          : (err.messageEn || errorMessage)
        );
      } else {
        // For other errors, try to show backend message first, fallback to generic
        setError(err.message || getErrorMessage('authFailed'));
      }
    }
  };



  const userRoles = [
    { value: 'Student', label: language === 'fr' ? 'Élève' : 'Student', disabled: false },
    { value: 'Parent', label: 'Parent', disabled: false },
    { value: 'Teacher', label: language === 'fr' ? 'Enseignant' : 'Teacher', disabled: false },
    { value: 'Director', label: language === 'fr' ? 'Directeur d\'École' : 'School Director', disabled: false },
    { value: 'Commercial', label: 'Commercial', disabled: false },
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
      <BookOpen className="absolute top-20 left-20 w-4 h-4 text-blue-400/60 animate-pulse delay-300" />
      <GraduationCap className="absolute top-40 right-32 w-6 h-6 text-purple-400/60 animate-pulse delay-700" />
      <Users className="absolute bottom-32 left-32 w-5 h-5 text-pink-400/60 animate-pulse delay-1000" />

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
                <div className="flex space-x-2">
                  {/* Sélecteur de pays */}
                  <select
                    value={formData.countryCode}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        countryCode: e.target.value,
                        phoneNumber: '' // Reset phone number when country changes
                      }));
                    }}
                    className="w-24 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 transition-all text-sm"
                  >
                    {/* ===== AFRICAN COUNTRIES ===== */}
                    <option value="+237">🇨🇲 +237 Cameroon</option>
                    <option value="+213">🇩🇿 +213 Algeria</option>
                    <option value="+244">🇦🇴 +244 Angola</option>
                    <option value="+229">🇧🇯 +229 Benin</option>
                    <option value="+267">🇧🇼 +267 Botswana</option>
                    <option value="+226">🇧🇫 +226 Burkina Faso</option>
                    <option value="+257">🇧🇮 +257 Burundi</option>
                    <option value="+238">🇨🇻 +238 Cape Verde</option>
                    <option value="+236">🇨🇫 +236 Central African Republic</option>
                    <option value="+235">🇹🇩 +235 Chad</option>
                    <option value="+269">🇰🇲 +269 Comoros</option>
                    <option value="+242">🇨🇬 +242 Congo</option>
                    <option value="+243">🇨🇩 +243 DR Congo</option>
                    <option value="+253">🇩🇯 +253 Djibouti</option>
                    <option value="+20">🇪🇬 +20 Egypt</option>
                    <option value="+240">🇬🇶 +240 Equatorial Guinea</option>
                    <option value="+291">🇪🇷 +291 Eritrea</option>
                    <option value="+268">🇸🇿 +268 Eswatini</option>
                    <option value="+251">🇪🇹 +251 Ethiopia</option>
                    <option value="+241">🇬🇦 +241 Gabon</option>
                    <option value="+220">🇬🇲 +220 Gambia</option>
                    <option value="+233">🇬🇭 +233 Ghana</option>
                    <option value="+224">🇬🇳 +224 Guinea</option>
                    <option value="+245">🇬🇼 +245 Guinea-Bissau</option>
                    <option value="+225">🇨🇮 +225 Ivory Coast</option>
                    <option value="+254">🇰🇪 +254 Kenya</option>
                    <option value="+266">🇱🇸 +266 Lesotho</option>
                    <option value="+231">🇱🇷 +231 Liberia</option>
                    <option value="+218">🇱🇾 +218 Libya</option>
                    <option value="+261">🇲🇬 +261 Madagascar</option>
                    <option value="+265">🇲🇼 +265 Malawi</option>
                    <option value="+223">🇲🇱 +223 Mali</option>
                    <option value="+222">🇲🇷 +222 Mauritania</option>
                    <option value="+230">🇲🇺 +230 Mauritius</option>
                    <option value="+262">🇾🇹 +262 Mayotte</option>
                    <option value="+212">🇲🇦 +212 Morocco</option>
                    <option value="+258">🇲🇿 +258 Mozambique</option>
                    <option value="+264">🇳🇦 +264 Namibia</option>
                    <option value="+227">🇳🇪 +227 Niger</option>
                    <option value="+234">🇳🇬 +234 Nigeria</option>
                    <option value="+262">🇷🇪 +262 Reunion</option>
                    <option value="+250">🇷🇼 +250 Rwanda</option>
                    <option value="+290">🇸🇭 +290 Saint Helena</option>
                    <option value="+239">🇸🇹 +239 Sao Tome</option>
                    <option value="+221">🇸🇳 +221 Senegal</option>
                    <option value="+248">🇸🇨 +248 Seychelles</option>
                    <option value="+232">🇸🇱 +232 Sierra Leone</option>
                    <option value="+252">🇸🇴 +252 Somalia</option>
                    <option value="+27">🇿🇦 +27 South Africa</option>
                    <option value="+211">🇸🇸 +211 South Sudan</option>
                    <option value="+249">🇸🇩 +249 Sudan</option>
                    <option value="+255">🇹🇿 +255 Tanzania</option>
                    <option value="+228">🇹🇬 +228 Togo</option>
                    <option value="+216">🇹🇳 +216 Tunisia</option>
                    <option value="+256">🇺🇬 +256 Uganda</option>
                    <option value="+212">🇪🇭 +212 Western Sahara</option>
                    <option value="+260">🇿🇲 +260 Zambia</option>
                    <option value="+263">🇿🇼 +263 Zimbabwe</option>
                    
                    {/* ===== EUROPEAN COUNTRIES ===== */}
                    <option value="+355">🇦🇱 +355 Albania</option>
                    <option value="+376">🇦🇩 +376 Andorra</option>
                    <option value="+43">🇦🇹 +43 Austria</option>
                    <option value="+375">🇧🇾 +375 Belarus</option>
                    <option value="+32">🇧🇪 +32 Belgium</option>
                    <option value="+387">🇧🇦 +387 Bosnia Herzegovina</option>
                    <option value="+359">🇧🇬 +359 Bulgaria</option>
                    <option value="+385">🇭🇷 +385 Croatia</option>
                    <option value="+357">🇨🇾 +357 Cyprus</option>
                    <option value="+420">🇨🇿 +420 Czech Republic</option>
                    <option value="+45">🇩🇰 +45 Denmark</option>
                    <option value="+372">🇪🇪 +372 Estonia</option>
                    <option value="+298">🇫🇴 +298 Faroe Islands</option>
                    <option value="+358">🇫🇮 +358 Finland</option>
                    <option value="+33">🇫🇷 +33 France</option>
                    <option value="+995">🇬🇪 +995 Georgia</option>
                    <option value="+49">🇩🇪 +49 Germany</option>
                    <option value="+350">🇬🇮 +350 Gibraltar</option>
                    <option value="+30">🇬🇷 +30 Greece</option>
                    <option value="+299">🇬🇱 +299 Greenland</option>
                    <option value="+379">🇻🇦 +379 Holy See</option>
                    <option value="+36">🇭🇺 +36 Hungary</option>
                    <option value="+354">🇮🇸 +354 Iceland</option>
                    <option value="+353">🇮🇪 +353 Ireland</option>
                    <option value="+44">🇮🇲 +44 Isle of Man</option>
                    <option value="+39">🇮🇹 +39 Italy</option>
                    <option value="+44">🇯🇪 +44 Jersey</option>
                    <option value="+7">🇰🇿 +7 Kazakhstan</option>
                    <option value="+383">🇽🇰 +383 Kosovo</option>
                    <option value="+371">🇱🇻 +371 Latvia</option>
                    <option value="+423">🇱🇮 +423 Liechtenstein</option>
                    <option value="+370">🇱🇹 +370 Lithuania</option>
                    <option value="+352">🇱🇺 +352 Luxembourg</option>
                    <option value="+389">🇲🇰 +389 Macedonia</option>
                    <option value="+356">🇲🇹 +356 Malta</option>
                    <option value="+373">🇲🇩 +373 Moldova</option>
                    <option value="+377">🇲🇨 +377 Monaco</option>
                    <option value="+382">🇲🇪 +382 Montenegro</option>
                    <option value="+31">🇳🇱 +31 Netherlands</option>
                    <option value="+47">🇳🇴 +47 Norway</option>
                    <option value="+48">🇵🇱 +48 Poland</option>
                    <option value="+351">🇵🇹 +351 Portugal</option>
                    <option value="+40">🇷🇴 +40 Romania</option>
                    <option value="+7">🇷🇺 +7 Russia</option>
                    <option value="+378">🇸🇲 +378 San Marino</option>
                    <option value="+381">🇷🇸 +381 Serbia</option>
                    <option value="+421">🇸🇰 +421 Slovakia</option>
                    <option value="+386">🇸🇮 +386 Slovenia</option>
                    <option value="+34">🇪🇸 +34 Spain</option>
                    <option value="+46">🇸🇪 +46 Sweden</option>
                    <option value="+41">🇨🇭 +41 Switzerland</option>
                    <option value="+90">🇹🇷 +90 Turkey</option>
                    <option value="+380">🇺🇦 +380 Ukraine</option>
                    <option value="+44">🇬🇧 +44 United Kingdom</option>
                    
                    {/* ===== AMERICAN COUNTRIES ===== */}
                    <option value="+54">🇦🇷 +54 Argentina</option>
                    <option value="+297">🇦🇼 +297 Aruba</option>
                    <option value="+1">🇧🇸 +1 Bahamas</option>
                    <option value="+1">🇧🇧 +1 Barbados</option>
                    <option value="+501">🇧🇿 +501 Belize</option>
                    <option value="+1">🇧🇲 +1 Bermuda</option>
                    <option value="+591">🇧🇴 +591 Bolivia</option>
                    <option value="+599">🇧🇶 +599 Bonaire</option>
                    <option value="+55">🇧🇷 +55 Brazil</option>
                    <option value="+1">🇻🇬 +1 British Virgin Islands</option>
                    <option value="+1">🇨🇦 +1 Canada</option>
                    <option value="+1">🇰🇾 +1 Cayman Islands</option>
                    <option value="+56">🇨🇱 +56 Chile</option>
                    <option value="+57">🇨🇴 +57 Colombia</option>
                    <option value="+506">🇨🇷 +506 Costa Rica</option>
                    <option value="+53">🇨🇺 +53 Cuba</option>
                    <option value="+599">🇨🇼 +599 Curacao</option>
                    <option value="+1">🇩🇲 +1 Dominica</option>
                    <option value="+1">🇩🇴 +1 Dominican Republic</option>
                    <option value="+593">🇪🇨 +593 Ecuador</option>
                    <option value="+503">🇸🇻 +503 El Salvador</option>
                    <option value="+500">🇫🇰 +500 Falkland Islands</option>
                    <option value="+594">🇬🇫 +594 French Guiana</option>
                    <option value="+1">🇬🇩 +1 Grenada</option>
                    <option value="+590">🇬🇵 +590 Guadeloupe</option>
                    <option value="+502">🇬🇹 +502 Guatemala</option>
                    <option value="+592">🇬🇾 +592 Guyana</option>
                    <option value="+509">🇭🇹 +509 Haiti</option>
                    <option value="+504">🇭🇳 +504 Honduras</option>
                    <option value="+1">🇯🇲 +1 Jamaica</option>
                    <option value="+596">🇲🇶 +596 Martinique</option>
                    <option value="+52">🇲🇽 +52 Mexico</option>
                    <option value="+1">🇲🇸 +1 Montserrat</option>
                    <option value="+505">🇳🇮 +505 Nicaragua</option>
                    <option value="+507">🇵🇦 +507 Panama</option>
                    <option value="+595">🇵🇾 +595 Paraguay</option>
                    <option value="+51">🇵🇪 +51 Peru</option>
                    <option value="+1">🇵🇷 +1 Puerto Rico</option>
                    <option value="+508">🇵🇲 +508 Saint Pierre</option>
                    <option value="+1">🇰🇳 +1 Saint Kitts</option>
                    <option value="+1">🇱🇨 +1 Saint Lucia</option>
                    <option value="+1">🇻🇨 +1 Saint Vincent</option>
                    <option value="+590">🇧🇱 +590 Saint Barthelemy</option>
                    <option value="+590">🇲🇫 +590 Saint Martin</option>
                    <option value="+597">🇸🇷 +597 Suriname</option>
                    <option value="+1">🇹🇹 +1 Trinidad Tobago</option>
                    <option value="+1">🇹🇨 +1 Turks Caicos</option>
                    <option value="+1">🇺🇸 +1 United States</option>
                    <option value="+598">🇺🇾 +598 Uruguay</option>
                    <option value="+58">🇻🇪 +58 Venezuela</option>
                    <option value="+1">🇻🇮 +1 Virgin Islands</option>
                  </select>
                  
                  {/* Champ de numéro */}
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber.replace(formData.countryCode, '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only keep numeric characters
                      const numericValue = value.replace(/\D/g, '');
                      // Combine country code with phone number for storage
                      const fullNumber = formData.countryCode + numericValue;
                      setFormData(prev => ({ 
                        ...prev, 
                        phoneNumber: fullNumber 
                      }));
                    }}
                    placeholder={
                      formData.countryCode === '+237' ? '6XX XXX XXX' :
                      formData.countryCode === '+33' ? '6 XX XX XX XX' :
                      formData.countryCode === '+1' ? '(XXX) XXX-XXXX' :
                      'XXX XXX XXX'
                    }
                    required={isRegisterMode}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <p className="text-gray-500">
                    {language === 'fr' ? 'Identifiant unique pour la récupération de mot de passe' : 'Unique identifier for password recovery'}
                  </p>
                  {formData.phoneNumber && (
                    <p className="text-blue-600 font-mono">
                      {formData.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 mobile-input-field">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm md:text-base">
                {isRegisterMode 
                  ? (language === 'fr' ? 'Adresse E-mail (Optionnel)' : 'Email Address (Optional)')
                  : (language === 'fr' ? '📧 E-mail OU 📱 Téléphone' : '📧 Email OR 📱 Phone Number')
                }
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type={isRegisterMode ? "email" : "text"}
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder={isRegisterMode 
                    ? (language === 'fr' ? 'votre.email@exemple.com' : 'your.email@example.com')
                    : (language === 'fr' ? '+237612345 ou email@exemple.com' : '+237612345 or email@example.com')
                  }
                  className="px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 transition-all mobile-touch-input"
                  data-testid="input-email-or-phone"
                />
              </div>
              {isRegisterMode ? (
                <p className="text-xs text-gray-500">
                  {language === 'fr' 
                    ? '💡 Votre numéro de téléphone sera utilisé comme identifiant de connexion principal'
                    : '💡 Your phone number will be used as your primary login identifier'
                  }
                </p>
              ) : (
                <p className="text-xs text-blue-600 font-medium">
                  {language === 'fr' 
                    ? '✅ Vous pouvez utiliser votre numéro de téléphone ou votre e-mail pour vous connecter'
                    : '✅ You can use your phone number or email to log in'
                  }
                </p>
              )}
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
                  data-testid="select-role"
                >
                  {(Array.isArray(userRoles) ? userRoles : []).map(role => (
                    <option 
                      key={role.value} 
                      value={role.value} 
                      disabled={role.disabled}
                      className={role.disabled ? "bg-gray-100 text-gray-400" : "bg-white text-gray-900"}
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* EDUCAFRIC Number field - Only for Directors */}
            {isRegisterMode && formData.role === 'Director' && (
              <div className="space-y-2 bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
                <Label htmlFor="educafricNumber" className="text-orange-700 font-semibold flex items-center gap-2">
                  <span className="text-lg">🎓</span>
                  {language === 'fr' ? 'Numéro EDUCAFRIC (Obligatoire)' : 'EDUCAFRIC Number (Required)'}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="educafricNumber"
                  name="educafricNumber"
                  type="text"
                  value={formData.educafricNumber || ''}
                  onChange={handleInputChange}
                  placeholder="EDU-CM-SC-XXX"
                  required={formData.role === 'Director'}
                  className="bg-white border-2 border-orange-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-orange-500 transition-all font-mono"
                  data-testid="input-educafric-number"
                />
                <p className="text-xs text-orange-700 flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>
                    {language === 'fr' 
                      ? 'Entrez le numéro EDUCAFRIC qui vous a été attribué par l\'administration. Format: EDU-CM-SC-XXX (ex: EDU-CM-SC-001)'
                      : 'Enter the EDUCAFRIC number assigned to you by the administration. Format: EDU-CM-SC-XXX (e.g., EDU-CM-SC-001)'
                    }
                  </span>
                </p>
                <p className="text-xs text-blue-700 flex items-start gap-2 mt-2 bg-blue-50 p-2 rounded">
                  <span>📱</span>
                  <span>
                    {language === 'fr' 
                      ? 'Important: Chaque école doit avoir un numéro de téléphone unique. Si vous essayez de vous inscrire et qu\'une erreur apparaît, cela signifie peut-être qu\'un compte existe déjà avec ce numéro.'
                      : 'Important: Each school must have a unique phone number. If you try to register and see an error, it may mean an account already exists with this number.'
                    }
                  </span>
                </p>
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

{/* Facebook Login Button - Temporarily Hidden to prevent network errors */}
            {false && !isRegisterMode && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      {language === 'fr' ? 'Ou connectez-vous avec' : 'Or sign in with'}
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={isFacebookLoading}
                  className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  {isFacebookLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'fr' ? 'Connexion...' : 'Connecting...'}
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      {language === 'fr' ? 'Continuer avec Facebook' : 'Continue with Facebook'}
                    </>
                  )}
                </Button>
              </div>
            )}

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

      {/* Duplicate Detection Dialog */}
      <DuplicateDetectionDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        existingUser={duplicateData?.existingUser || null}
        emailMatch={duplicateData?.emailMatch || false}
        phoneMatch={duplicateData?.phoneMatch || false}
        onImport={handleImportProfile}
        onCancel={handleCancelImport}
      />

    </div>
  );
}
