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
                    <option value="+237">🇨🇲 +237 Cameroon</option>
                    <option value="+33">🇫🇷 +33 France</option>
                    <option value="+1">🇺🇸 +1 USA/Canada</option>
                    <option value="+44">🇬🇧 +44 UK</option>
                    <option value="+49">🇩🇪 +49 Germany</option>
                    <option value="+39">🇮🇹 +39 Italy</option>
                    <option value="+34">🇪🇸 +34 Spain</option>
                    <option value="+351">🇵🇹 +351 Portugal</option>
                    <option value="+32">🇧🇪 +32 Belgium</option>
                    <option value="+31">🇳🇱 +31 Netherlands</option>
                    <option value="+41">🇨🇭 +41 Switzerland</option>
                    <option value="+43">🇦🇹 +43 Austria</option>
                    <option value="+46">🇸🇪 +46 Sweden</option>
                    <option value="+47">🇳🇴 +47 Norway</option>
                    <option value="+45">🇩🇰 +45 Denmark</option>
                    <option value="+358">🇫🇮 +358 Finland</option>
                    <option value="+48">🇵🇱 +48 Poland</option>
                    <option value="+420">🇨🇿 +420 Czech Republic</option>
                    <option value="+36">🇭🇺 +36 Hungary</option>
                    <option value="+40">🇷🇴 +40 Romania</option>
                    <option value="+359">🇧🇬 +359 Bulgaria</option>
                    <option value="+385">🇭🇷 +385 Croatia</option>
                    <option value="+386">🇸🇮 +386 Slovenia</option>
                    <option value="+421">🇸🇰 +421 Slovakia</option>
                    <option value="+372">🇪🇪 +372 Estonia</option>
                    <option value="+371">🇱🇻 +371 Latvia</option>
                    <option value="+370">🇱🇹 +370 Lithuania</option>
                    <option value="+7">🇷🇺 +7 Russia</option>
                    <option value="+380">🇺🇦 +380 Ukraine</option>
                    <option value="+375">🇧🇾 +375 Belarus</option>
                    <option value="+91">🇮🇳 +91 India</option>
                    <option value="+86">🇨🇳 +86 China</option>
                    <option value="+81">🇯🇵 +81 Japan</option>
                    <option value="+82">🇰🇷 +82 South Korea</option>
                    <option value="+65">🇸🇬 +65 Singapore</option>
                    <option value="+60">🇲🇾 +60 Malaysia</option>
                    <option value="+66">🇹🇭 +66 Thailand</option>
                    <option value="+84">🇻🇳 +84 Vietnam</option>
                    <option value="+62">🇮🇩 +62 Indonesia</option>
                    <option value="+63">🇵🇭 +63 Philippines</option>
                    <option value="+61">🇦🇺 +61 Australia</option>
                    <option value="+64">🇳🇿 +64 New Zealand</option>
                    <option value="+52">🇲🇽 +52 Mexico</option>
                    <option value="+55">🇧🇷 +55 Brazil</option>
                    <option value="+54">🇦🇷 +54 Argentina</option>
                    <option value="+56">🇨🇱 +56 Chile</option>
                    <option value="+57">🇨🇴 +57 Colombia</option>
                    <option value="+51">🇵🇪 +51 Peru</option>
                    <option value="+58">🇻🇪 +58 Venezuela</option>
                    <option value="+593">🇪🇨 +593 Ecuador</option>
                    <option value="+595">🇵🇾 +595 Paraguay</option>
                    <option value="+598">🇺🇾 +598 Uruguay</option>
                    <option value="+591">🇧🇴 +591 Bolivia</option>
                    <option value="+592">🇬🇾 +592 Guyana</option>
                    <option value="+597">🇸🇷 +597 Suriname</option>
                    <option value="+20">🇪🇬 +20 Egypt</option>
                    <option value="+27">🇿🇦 +27 South Africa</option>
                    <option value="+254">🇰🇪 +254 Kenya</option>
                    <option value="+256">🇺🇬 +256 Uganda</option>
                    <option value="+255">🇹🇿 +255 Tanzania</option>
                    <option value="+251">🇪🇹 +251 Ethiopia</option>
                    <option value="+250">🇷🇼 +250 Rwanda</option>
                    <option value="+257">🇧🇮 +257 Burundi</option>
                    <option value="+211">🇸🇸 +211 South Sudan</option>
                    <option value="+249">🇸🇩 +249 Sudan</option>
                    <option value="+216">🇹🇳 +216 Tunisia</option>
                    <option value="+218">🇱🇾 +218 Libya</option>
                    <option value="+212">🇲🇦 +212 Morocco</option>
                    <option value="+213">🇩🇿 +213 Algeria</option>
                    <option value="+221">🇸🇳 +221 Senegal</option>
                    <option value="+225">🇨🇮 +225 Ivory Coast</option>
                    <option value="+229">🇧🇯 +229 Benin</option>
                    <option value="+226">🇧🇫 +226 Burkina Faso</option>
                    <option value="+235">🇹🇩 +235 Chad</option>
                    <option value="+240">🇬🇶 +240 Equatorial Guinea</option>
                    <option value="+241">🇬🇦 +241 Gabon</option>
                    <option value="+242">🇨🇬 +242 Congo</option>
                    <option value="+243">🇨🇩 +243 DR Congo</option>
                    <option value="+236">🇨🇫 +236 CAR</option>
                    <option value="+220">🇬🇲 +220 Gambia</option>
                    <option value="+224">🇬🇳 +224 Guinea</option>
                    <option value="+245">🇬🇼 +245 Guinea-Bissau</option>
                    <option value="+231">🇱🇷 +231 Liberia</option>
                    <option value="+223">🇲🇱 +223 Mali</option>
                    <option value="+222">🇲🇷 +222 Mauritania</option>
                    <option value="+227">🇳🇪 +227 Niger</option>
                    <option value="+234">🇳🇬 +234 Nigeria</option>
                    <option value="+232">🇸🇱 +232 Sierra Leone</option>
                    <option value="+228">🇹🇬 +228 Togo</option>
                    <option value="+230">🇲🇺 +230 Mauritius</option>
                    <option value="+248">🇸🇨 +248 Seychelles</option>
                    <option value="+261">🇲🇬 +261 Madagascar</option>
                    <option value="+269">🇰🇲 +269 Comoros</option>
                    <option value="+290">🇸🇭 +290 St Helena</option>
                    <option value="+971">🇦🇪 +971 UAE</option>
                    <option value="+966">🇸🇦 +966 Saudi Arabia</option>
                    <option value="+974">🇶🇦 +974 Qatar</option>
                    <option value="+965">🇰🇼 +965 Kuwait</option>
                    <option value="+968">🇴🇲 +968 Oman</option>
                    <option value="+973">🇧🇭 +973 Bahrain</option>
                    <option value="+964">🇮🇶 +964 Iraq</option>
                    <option value="+963">🇸🇾 +963 Syria</option>
                    <option value="+961">🇱🇧 +961 Lebanon</option>
                    <option value="+962">🇯🇴 +962 Jordan</option>
                    <option value="+970">🇵🇸 +970 Palestine</option>
                    <option value="+972">🇮🇱 +972 Israel</option>
                    <option value="+90">🇹🇷 +90 Turkey</option>
                    <option value="+98">🇮🇷 +98 Iran</option>
                    <option value="+93">🇦🇫 +93 Afghanistan</option>
                    <option value="+92">🇵🇰 +92 Pakistan</option>
                    <option value="+880">🇧🇩 +880 Bangladesh</option>
                    <option value="+94">🇱🇰 +94 Sri Lanka</option>
                    <option value="+977">🇳🇵 +977 Nepal</option>
                    <option value="+975">🇧🇹 +975 Bhutan</option>
                    <option value="+960">🇲🇻 +960 Maldives</option>
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


    </div>
  );
}
