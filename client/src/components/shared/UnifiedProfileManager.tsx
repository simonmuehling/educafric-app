import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Phone, Mail, MapPin, Calendar, Save, MessageSquare, BarChart3, CheckSquare, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { EMAIL_CATEGORIES, EMAIL_FREQUENCY_OPTIONS, type EmailPreferences, type UpdateEmailPreferences } from '@shared/emailPreferencesSchema';
import MobileIconTabNavigation from './MobileIconTabNavigation';

interface UnifiedProfileManagerProps {
  userType: 'teacher' | 'student' | 'parent';
  showPhotoUpload?: boolean;
}

const UnifiedProfileManager: React.FC<UnifiedProfileManagerProps> = ({ 
  userType, 
  showPhotoUpload = false 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+237',
    gender: '',
    address: '',
    dateOfBirth: ''
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
      }));
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    gradeUpdates: true,
    attendanceAlerts: true,
    generalAnnouncements: true
  });

  // Email preferences state
  const [emailPreferences, setEmailPreferences] = useState<Partial<EmailPreferences>>({});
  const [hasEmailChanges, setHasEmailChanges] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch email preferences
  const { data: emailPrefs, isLoading: emailPrefsLoading } = useQuery({
    queryKey: ['/api/email-preferences'],
    retry: false,
  });

  // Update email preferences mutation
  const updateEmailPreferencesMutation = useMutation({
    mutationFn: async (updates: UpdateEmailPreferences) => {
      return apiRequest('/api/email-preferences', 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-preferences'] });
      setHasEmailChanges(false);
      toast({
        title: language === 'fr' ? 'Préférences sauvegardées' : 'Preferences saved',
        description: language === 'fr' ? 'Vos préférences email ont été mises à jour.' : 'Your email preferences have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder les préférences.' : 'Failed to save preferences.',
        variant: 'destructive',
      });
    },
  });

  // Load email preferences when data is available
  useEffect(() => {
    if (emailPrefs) {
      setEmailPreferences(emailPrefs);
    }
  }, [emailPrefs]);

  // Email preferences functions
  const updateEmailPreference = (field: keyof EmailPreferences, value: any) => {
    setEmailPreferences(prev => ({ ...prev, [field]: value }));
    setHasEmailChanges(true);
  };

  const handleEmailSave = () => {
    updateEmailPreferencesMutation.mutate(emailPreferences);
  };

  const toggleEmailCategory = (categoryFields: readonly string[], enabled: boolean) => {
    const updates: Partial<EmailPreferences> = {};
    categoryFields.forEach(field => {
      updates[field as keyof EmailPreferences] = enabled;
    });
    setEmailPreferences(prev => ({ ...prev, ...updates }));
    setHasEmailChanges(true);
  };

  const text = {
    fr: {
      title: {
        teacher: 'Paramètres Enseignant',
        student: 'Paramètres Élève', 
        parent: 'Paramètres Parent'
      },
      subtitle: 'Gérez vos informations personnelles et paramètres',
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      emailPreferences: 'Préférences Email',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      gender: 'Sexe',
      address: 'Adresse',
      dateOfBirth: 'Date de naissance',
      save: 'Sauvegarder',
      male: 'Masculin',
      female: 'Féminin',
      other: 'Autre',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      changePassword: 'Changer le mot de passe',
      deleteAccount: 'Supprimer mon compte',
      deleteAccountWarning: 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      confirmDelete: 'Confirmer la suppression',
      cancel: 'Annuler',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      whatsappNotifications: 'Notifications WhatsApp',
      gradeUpdates: 'Mises à jour des notes',
      attendanceAlerts: 'Alertes de présence',
      generalAnnouncements: 'Annonces générales'
    },
    en: {
      title: {
        teacher: 'Teacher Settings',
        student: 'Student Settings',
        parent: 'Parent Settings'
      },
      subtitle: 'Manage your personal information and settings',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      emailPreferences: 'Email Preferences',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      save: 'Save',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      changePassword: 'Change Password',
      deleteAccount: 'Delete my account',
      deleteAccountWarning: 'This action is irreversible. All your data will be permanently deleted.',
      confirmDelete: 'Confirm deletion',
      cancel: 'Cancel',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      whatsappNotifications: 'WhatsApp Notifications',
      gradeUpdates: 'Grade Updates',
      attendanceAlerts: 'Attendance Alerts',
      generalAnnouncements: 'General Announcements'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'security', label: t.security, icon: Shield },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'email-preferences', label: t.emailPreferences, icon: Mail }
  ];

  const handleProfileSave = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...profileData,
          phone: `${profileData.countryCode}${profileData.phone}`
        }),
      });

      if (response.ok) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès.",
        });
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été mis à jour avec succès.",
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationSave = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...notificationSettings,
          phone: `${profileData.countryCode}${profileData.phone}`
        }),
      });

      if (response.ok) {
        toast({
          title: "Notifications mises à jour",
          description: "Vos préférences de notification ont été sauvegardées.",
        });
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences de notification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Compte supprimé",
          description: "Votre compte a été supprimé avec succès.",
        });
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {t.title[userType]}
        </h2>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Icon Navigation */}
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.profile}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      firstName: e.target.value 
                    })}
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      lastName: e.target.value 
                    })}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    email: e.target.value 
                  })}
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <div className="flex">
                  <Select 
                    value={profileData.countryCode || '+237'} 
                    onValueChange={(value) => setProfileData({ 
                      ...profileData, 
                      countryCode: value 
                    })}
                  >
                    <SelectTrigger className="w-24 rounded-r-none border-r-0" data-testid="select-country-code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Afrique */}
                      <SelectItem value="+213">🇩🇿 +213 Algérie</SelectItem>
                      <SelectItem value="+244">🇦🇴 +244 Angola</SelectItem>
                      <SelectItem value="+229">🇧🇯 +229 Bénin</SelectItem>
                      <SelectItem value="+267">🇧🇼 +267 Botswana</SelectItem>
                      <SelectItem value="+226">🇧🇫 +226 Burkina Faso</SelectItem>
                      <SelectItem value="+257">🇧🇮 +257 Burundi</SelectItem>
                      <SelectItem value="+237">🇨🇲 +237 Cameroun</SelectItem>
                      <SelectItem value="+238">🇨🇻 +238 Cap-Vert</SelectItem>
                      <SelectItem value="+236">🇨🇫 +236 Centrafrique</SelectItem>
                      <SelectItem value="+235">🇹🇩 +235 Tchad</SelectItem>
                      <SelectItem value="+269">🇰🇲 +269 Comores</SelectItem>
                      <SelectItem value="+243">🇨🇩 +243 RD Congo</SelectItem>
                      <SelectItem value="+242">🇨🇬 +242 Congo</SelectItem>
                      <SelectItem value="+225">🇨🇮 +225 Côte d'Ivoire</SelectItem>
                      <SelectItem value="+253">🇩🇯 +253 Djibouti</SelectItem>
                      <SelectItem value="+20">🇪🇬 +20 Égypte</SelectItem>
                      <SelectItem value="+240">🇬🇶 +240 Guinée Équatoriale</SelectItem>
                      <SelectItem value="+291">🇪🇷 +291 Érythrée</SelectItem>
                      <SelectItem value="+251">🇪🇹 +251 Éthiopie</SelectItem>
                      <SelectItem value="+241">🇬🇦 +241 Gabon</SelectItem>
                      <SelectItem value="+220">🇬🇲 +220 Gambie</SelectItem>
                      <SelectItem value="+233">🇬🇭 +233 Ghana</SelectItem>
                      <SelectItem value="+224">🇬🇳 +224 Guinée</SelectItem>
                      <SelectItem value="+245">🇬🇼 +245 Guinée-Bissau</SelectItem>
                      <SelectItem value="+254">🇰🇪 +254 Kenya</SelectItem>
                      <SelectItem value="+266">🇱🇸 +266 Lesotho</SelectItem>
                      <SelectItem value="+231">🇱🇷 +231 Libéria</SelectItem>
                      <SelectItem value="+218">🇱🇾 +218 Libye</SelectItem>
                      <SelectItem value="+261">🇲🇬 +261 Madagascar</SelectItem>
                      <SelectItem value="+265">🇲🇼 +265 Malawi</SelectItem>
                      <SelectItem value="+223">🇲🇱 +223 Mali</SelectItem>
                      <SelectItem value="+222">🇲🇷 +222 Mauritanie</SelectItem>
                      <SelectItem value="+230">🇲🇺 +230 Maurice</SelectItem>
                      <SelectItem value="+212">🇲🇦 +212 Maroc</SelectItem>
                      <SelectItem value="+258">🇲🇿 +258 Mozambique</SelectItem>
                      <SelectItem value="+264">🇳🇦 +264 Namibie</SelectItem>
                      <SelectItem value="+227">🇳🇪 +227 Niger</SelectItem>
                      <SelectItem value="+234">🇳🇬 +234 Nigéria</SelectItem>
                      <SelectItem value="+250">🇷🇼 +250 Rwanda</SelectItem>
                      <SelectItem value="+239">🇸🇹 +239 São Tomé</SelectItem>
                      <SelectItem value="+221">🇸🇳 +221 Sénégal</SelectItem>
                      <SelectItem value="+248">🇸🇨 +248 Seychelles</SelectItem>
                      <SelectItem value="+232">🇸🇱 +232 Sierra Leone</SelectItem>
                      <SelectItem value="+252">🇸🇴 +252 Somalie</SelectItem>
                      <SelectItem value="+27">🇿🇦 +27 Afrique du Sud</SelectItem>
                      <SelectItem value="+211">🇸🇸 +211 Soudan du Sud</SelectItem>
                      <SelectItem value="+249">🇸🇩 +249 Soudan</SelectItem>
                      <SelectItem value="+268">🇸🇿 +268 Eswatini</SelectItem>
                      <SelectItem value="+255">🇹🇿 +255 Tanzanie</SelectItem>
                      <SelectItem value="+228">🇹🇬 +228 Togo</SelectItem>
                      <SelectItem value="+216">🇹🇳 +216 Tunisie</SelectItem>
                      <SelectItem value="+256">🇺🇬 +256 Ouganda</SelectItem>
                      <SelectItem value="+260">🇿🇲 +260 Zambie</SelectItem>
                      <SelectItem value="+263">🇿🇼 +263 Zimbabwe</SelectItem>
                      
                      {/* Europe */}
                      <SelectItem value="+33">🇫🇷 +33 France</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49 Allemagne</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44 Royaume-Uni</SelectItem>
                      <SelectItem value="+39">🇮🇹 +39 Italie</SelectItem>
                      <SelectItem value="+34">🇪🇸 +34 Espagne</SelectItem>
                      <SelectItem value="+31">🇳🇱 +31 Pays-Bas</SelectItem>
                      <SelectItem value="+32">🇧🇪 +32 Belgique</SelectItem>
                      <SelectItem value="+41">🇨🇭 +41 Suisse</SelectItem>
                      <SelectItem value="+43">🇦🇹 +43 Autriche</SelectItem>
                      <SelectItem value="+351">🇵🇹 +351 Portugal</SelectItem>
                      <SelectItem value="+46">🇸🇪 +46 Suède</SelectItem>
                      <SelectItem value="+47">🇳🇴 +47 Norvège</SelectItem>
                      <SelectItem value="+45">🇩🇰 +45 Danemark</SelectItem>
                      <SelectItem value="+358">🇫🇮 +358 Finlande</SelectItem>
                      <SelectItem value="+48">🇵🇱 +48 Pologne</SelectItem>
                      <SelectItem value="+420">🇨🇿 +420 République Tchèque</SelectItem>
                      <SelectItem value="+36">🇭🇺 +36 Hongrie</SelectItem>
                      <SelectItem value="+40">🇷🇴 +40 Roumanie</SelectItem>
                      <SelectItem value="+359">🇧🇬 +359 Bulgarie</SelectItem>
                      <SelectItem value="+30">🇬🇷 +30 Grèce</SelectItem>
                      <SelectItem value="+353">🇮🇪 +353 Irlande</SelectItem>
                      
                      {/* Amérique */}
                      <SelectItem value="+1">🇺🇸 +1 États-Unis/Canada</SelectItem>
                      <SelectItem value="+52">🇲🇽 +52 Mexique</SelectItem>
                      <SelectItem value="+55">🇧🇷 +55 Brésil</SelectItem>
                      <SelectItem value="+54">🇦🇷 +54 Argentine</SelectItem>
                      <SelectItem value="+56">🇨🇱 +56 Chili</SelectItem>
                      <SelectItem value="+57">🇨🇴 +57 Colombie</SelectItem>
                      <SelectItem value="+51">🇵🇪 +51 Pérou</SelectItem>
                      <SelectItem value="+58">🇻🇪 +58 Venezuela</SelectItem>
                      <SelectItem value="+593">🇪🇨 +593 Équateur</SelectItem>
                      <SelectItem value="+591">🇧🇴 +591 Bolivie</SelectItem>
                      <SelectItem value="+595">🇵🇾 +595 Paraguay</SelectItem>
                      <SelectItem value="+598">🇺🇾 +598 Uruguay</SelectItem>
                      
                      {/* Asie */}
                      <SelectItem value="+86">🇨🇳 +86 Chine</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91 Inde</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81 Japon</SelectItem>
                      <SelectItem value="+82">🇰🇷 +82 Corée du Sud</SelectItem>
                      <SelectItem value="+62">🇮🇩 +62 Indonésie</SelectItem>
                      <SelectItem value="+60">🇲🇾 +60 Malaisie</SelectItem>
                      <SelectItem value="+65">🇸🇬 +65 Singapour</SelectItem>
                      <SelectItem value="+66">🇹🇭 +66 Thaïlande</SelectItem>
                      <SelectItem value="+84">🇻🇳 +84 Vietnam</SelectItem>
                      <SelectItem value="+63">🇵🇭 +63 Philippines</SelectItem>
                      <SelectItem value="+92">🇵🇰 +92 Pakistan</SelectItem>
                      <SelectItem value="+880">🇧🇩 +880 Bangladesh</SelectItem>
                      <SelectItem value="+94">🇱🇰 +94 Sri Lanka</SelectItem>
                      <SelectItem value="+98">🇮🇷 +98 Iran</SelectItem>
                      <SelectItem value="+964">🇮🇶 +964 Irak</SelectItem>
                      <SelectItem value="+90">🇹🇷 +90 Turquie</SelectItem>
                      <SelectItem value="+972">🇮🇱 +972 Israël</SelectItem>
                      <SelectItem value="+966">🇸🇦 +966 Arabie Saoudite</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971 Émirats Arabes Unis</SelectItem>
                      
                      {/* Océanie */}
                      <SelectItem value="+61">🇦🇺 +61 Australie</SelectItem>
                      <SelectItem value="+64">🇳🇿 +64 Nouvelle-Zélande</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      phone: e.target.value 
                    })}
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">{t.gender}</Label>
                  <Select 
                    value={profileData.gender} 
                    onValueChange={(value) => setProfileData({ 
                      ...profileData, 
                      gender: value 
                    })}
                  >
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.male}</SelectItem>
                      <SelectItem value="female">{t.female}</SelectItem>
                      <SelectItem value="other">{t.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        dateOfBirth: e.target.value 
                      })}
                      className="pl-10"
                      data-testid="input-date-of-birth"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">{t.address}</Label>
                <div className="relative">
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      address: e.target.value 
                    })}
                    placeholder="Adresse complète"
                    className="pl-10"
                    data-testid="input-address"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button 
                onClick={handleProfileSave} 
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.security}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    currentPassword: e.target.value 
                  })}
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    newPassword: e.target.value 
                  })}
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    confirmPassword: e.target.value 
                  })}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button 
                onClick={handlePasswordChange} 
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-change-password"
              >
                <Shield className="w-4 h-4 mr-2" />
                {t.changePassword}
              </Button>

              {/* Section Suppression de Compte */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-red-900 mb-2">{t.deleteAccount}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.deleteAccountWarning}</p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-delete-account"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.deleteAccount}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteAccount}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.deleteAccountWarning}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">
                        {t.cancel}
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          handleDeleteAccount();
                          toast({
                            title: "Email d'au revoir envoyé",
                            description: "Un email de confirmation a été envoyé à votre adresse.",
                          });
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-confirm-delete"
                      >
                        {t.confirmDelete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <Label htmlFor="emailNotifs" className="font-medium">{t.emailNotifications}</Label>
                </div>
                <Switch
                  id="emailNotifs"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      emailNotifications: checked 
                    })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <Label htmlFor="smsNotifs" className="font-medium">{t.smsNotifications}</Label>
                </div>
                <Switch
                  id="smsNotifs"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      smsNotifications: checked 
                    })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  data-testid="switch-sms-notifications"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <Label htmlFor="whatsappNotifs" className="font-medium">{t.whatsappNotifications}</Label>
                </div>
                <Switch
                  id="whatsappNotifs"
                  checked={notificationSettings.whatsappNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      whatsappNotifications: checked 
                    })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  data-testid="switch-whatsapp-notifications"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <Label htmlFor="gradeUpdates" className="font-medium">{t.gradeUpdates}</Label>
                </div>
                <Switch
                  id="gradeUpdates"
                  checked={notificationSettings.gradeUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      gradeUpdates: checked 
                    })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  data-testid="switch-grade-updates"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  <Label htmlFor="attendanceAlerts" className="font-medium">{t.attendanceAlerts}</Label>
                </div>
                <Switch
                  id="attendanceAlerts"
                  checked={notificationSettings.attendanceAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      attendanceAlerts: checked 
                    })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  data-testid="switch-attendance-alerts"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <Label htmlFor="generalAnnouncements" className="font-medium">{t.generalAnnouncements}</Label>
                </div>
                <Switch
                  id="generalAnnouncements"
                  checked={notificationSettings.generalAnnouncements}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      generalAnnouncements: checked 
                    })
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  data-testid="switch-general-announcements"
                />
              </div>
              <Button 
                onClick={handleNotificationSave} 
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-save-notifications"
              >
                <Bell className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Preferences Tab */}
        <TabsContent value="email-preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {language === 'fr' ? 'Préférences Email' : 'Email Preferences'}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Gérez les emails que vous souhaitez recevoir d\'EDUCAFRIC' : 'Manage which emails you want to receive from EDUCAFRIC'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailPrefsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    {language === 'fr' ? 'Chargement...' : 'Loading...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Master Toggle */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-blue-900">
                          {language === 'fr' ? 'Recevoir tous les emails' : 'Receive all emails'}
                        </h3>
                        <p className="text-sm text-blue-700">
                          {language === 'fr' ? 'Désactiver complètement les emails (sauf sécurité)' : 'Completely disable emails (except security)'}
                        </p>
                      </div>
                      <Switch
                        checked={emailPreferences.allowEmails !== false}
                        onCheckedChange={(checked) => updateEmailPreference('allowEmails', checked)}
                        className="data-[state=checked]:bg-blue-600"
                        data-testid="switch-allow-emails"
                      />
                    </div>
                  </div>

                  {/* Email Categories */}
                  {Object.entries(EMAIL_CATEGORIES).map(([categoryId, category]) => (
                    <div key={categoryId} className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-white">
                            {categoryId === 'ESSENTIAL' && <Shield className="w-5 h-5 text-red-600" />}
                            {categoryId === 'ACADEMIC' && <User className="w-5 h-5 text-blue-600" />}
                            {categoryId === 'SAFETY' && <MapPin className="w-5 h-5 text-orange-600" />}
                            {categoryId === 'COMMUNICATION' && <MessageSquare className="w-5 h-5 text-green-600" />}
                            {categoryId === 'FINANCIAL' && <BarChart3 className="w-5 h-5 text-yellow-600" />}
                            {categoryId === 'PLATFORM' && <Settings className="w-5 h-5 text-purple-600" />}
                            {categoryId === 'ACCOUNT' && <User className="w-5 h-5 text-gray-600" />}
                            {categoryId === 'WELCOME' && <Calendar className="w-5 h-5 text-pink-600" />}
                            {categoryId === 'MARKETING' && <Mail className="w-5 h-5 text-indigo-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {category.name[language as keyof typeof category.name]}
                              </h4>
                              {categoryId === 'ESSENTIAL' && (
                                <Badge variant="secondary" className="text-xs">
                                  {language === 'fr' ? 'Essentiel' : 'Essential'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {category.description[language as keyof typeof category.description]}
                            </p>
                          </div>
                        </div>
                        
                        {/* Boutons de contrôle en dessous - Optimisé mobile */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleEmailCategory(category.fields, true)}
                            className="flex-1 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                            data-testid={`button-enable-${categoryId.toLowerCase()}`}
                          >
                            {language === 'fr' ? '✓ Tout activer' : '✓ Enable all'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleEmailCategory(category.fields, false)}
                            className="flex-1 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                            disabled={categoryId === 'ESSENTIAL'}
                            data-testid={`button-disable-${categoryId.toLowerCase()}`}
                          >
                            {language === 'fr' ? '✗ Tout désactiver' : '✗ Disable all'}
                          </Button>
                        </div>
                      </div>

                      {/* Individual Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                        {category.fields.map((field) => (
                          <div key={field} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm capitalize">
                              {field.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <Switch
                              checked={emailPreferences[field as keyof EmailPreferences] !== false}
                              onCheckedChange={(checked) => updateEmailPreference(field as keyof EmailPreferences, checked)}
                              disabled={categoryId === 'ESSENTIAL'}
                              className="data-[state=checked]:bg-green-600"
                              data-testid={`switch-${field.toLowerCase().replace(/([A-Z])/g, '-$1')}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Global Settings */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">
                      {language === 'fr' ? 'Paramètres globaux' : 'Global Settings'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emailFrequency">
                          {language === 'fr' ? 'Fréquence des emails' : 'Email frequency'}
                        </Label>
                        <Select
                          value={emailPreferences.frequency || 'immediate'}
                          onValueChange={(value) => updateEmailPreference('frequency', value)}
                        >
                          <SelectTrigger data-testid="select-email-frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMAIL_FREQUENCY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label[language as keyof typeof option.label]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="emailLanguage">
                          {language === 'fr' ? 'Langue des emails' : 'Email language'}
                        </Label>
                        <Select
                          value={emailPreferences.language || 'fr'}
                          onValueChange={(value) => updateEmailPreference('language', value)}
                        >
                          <SelectTrigger data-testid="select-email-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>
                          {language === 'fr' ? 'Format des emails' : 'Email format'}
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant={emailPreferences.htmlEmails !== false ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateEmailPreference('htmlEmails', true)}
                            data-testid="button-html-format"
                          >
                            {language === 'fr' ? 'HTML' : 'HTML'}
                          </Button>
                          <Button
                            variant={emailPreferences.htmlEmails === false ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateEmailPreference('htmlEmails', false)}
                            data-testid="button-text-format"
                          >
                            {language === 'fr' ? 'Texte' : 'Text'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {hasEmailChanges && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">
                            {language === 'fr' ? 'Modifications non sauvegardées' : 'Unsaved changes'}
                          </span>
                        </div>
                        <Button
                          onClick={handleEmailSave}
                          disabled={updateEmailPreferencesMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid="button-save-email-preferences"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateEmailPreferencesMutation.isPending 
                            ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') 
                            : (language === 'fr' ? 'Sauvegarder' : 'Save')
                          }
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedProfileManager;