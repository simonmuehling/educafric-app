import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Settings, School, Shield, Bell, MapPin, Clock, Users, 
  BookOpen, GraduationCap, Palette, Globe, Database,
  Eye, EyeOff, Save, Smartphone, Mail, Phone, Upload, Image, FileSignature
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';

interface SchoolProfile {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  description: string;
  establishedYear: number;
  principalName: string;
  studentCapacity: number;
}

interface SchoolConfiguration {
  academicYear: string;
  gradeSystem: 'numeric' | 'letter' | 'african';
  language: 'fr' | 'en' | 'bilingual';
  timezone: string;
  currency: string;
  attendanceRequired: boolean;
  bulletinAutoApproval: boolean;
  parentNotifications: boolean;
  geolocationEnabled: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  parentUpdates: boolean;
  teacherAlerts: boolean;
  systemMaintenance: boolean;
  emergencyAlerts: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  ipWhitelist: string[];
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

const UnifiedSchoolSettings: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Logo and signature upload refs and state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [schoolBranding, setSchoolBranding] = useState({
    logoUrl: '',
    directorSignatureUrl: ''
  });

  const text = {
    fr: {
      title: 'Paramètres École',
      subtitle: 'Configuration complète de votre établissement scolaire',
      profileTab: 'Profil École',
      configTab: 'Configuration',
      notificationsTab: 'Notifications',
      securityTab: 'Sécurité',
      brandingTab: 'Image École',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      loading: 'Chargement...',
      logoSchool: 'Logo de l\'École',
      directorSignature: 'Signature du Directeur',
      schoolName: 'Nom de l\'École',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      website: 'Site Web',
      description: 'Description',
      establishedYear: 'Année de Création',
      principalName: 'Nom du Directeur',
      studentCapacity: 'Capacité d\'Élèves',
      academicYear: 'Année Académique',
      gradeSystem: 'Système de Notes',
      schoolLanguage: 'Langue de l\'École',
      timezone: 'Fuseau Horaire',
      currency: 'Devise',
      attendanceRequired: 'Présence Obligatoire',
      bulletinAutoApproval: 'Approbation Auto Bulletins',
      parentNotifications: 'Notifications Parents',
      geolocationEnabled: 'Géolocalisation Activée',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      pushNotifications: 'Notifications Push',
      parentUpdates: 'Mises à jour Parents',
      teacherAlerts: 'Alertes Enseignants',
      systemMaintenance: 'Maintenance Système',
      emergencyAlerts: 'Alertes d\'Urgence',
      twoFactorAuth: 'Authentification 2FA',
      sessionTimeout: 'Expiration Session (min)',
      passwordExpiry: 'Expiration Mot de Passe (jours)',
      loginAttempts: 'Tentatives de Connexion Max',
      ipWhitelist: 'Liste Blanche IP',
      backupFrequency: 'Fréquence de Sauvegarde',
      numeric: 'Numérique (0-20)',
      letter: 'Lettres (A-F)',
      african: 'Système Africain',
      bilingual: 'Bilingue (FR/EN)',
      french: 'Français',
      english: 'Anglais',
      daily: 'Quotidienne',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuelle',
      successUpdate: 'Paramètres mis à jour avec succès',
      errorUpdate: 'Erreur lors de la mise à jour'
    },
    en: {
      title: 'School Settings',
      subtitle: 'Complete configuration of your educational institution',
      profileTab: 'School Profile',
      configTab: 'Configuration',
      notificationsTab: 'Notifications',
      securityTab: 'Security',
      brandingTab: 'School Branding',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      loading: 'Loading...',
      logoSchool: 'School Logo',
      directorSignature: 'Director Signature',
      schoolName: 'School Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      description: 'Description',
      establishedYear: 'Established Year',
      principalName: 'Principal Name',
      studentCapacity: 'Student Capacity',
      academicYear: 'Academic Year',
      gradeSystem: 'Grade System',
      schoolLanguage: 'School Language',
      timezone: 'Timezone',
      currency: 'Currency',
      attendanceRequired: 'Attendance Required',
      bulletinAutoApproval: 'Auto Approve Bulletins',
      parentNotifications: 'Parent Notifications',
      geolocationEnabled: 'Geolocation Enabled',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications',
      parentUpdates: 'Parent Updates',
      teacherAlerts: 'Teacher Alerts',
      systemMaintenance: 'System Maintenance',
      emergencyAlerts: 'Emergency Alerts',
      twoFactorAuth: '2FA Authentication',
      sessionTimeout: 'Session Timeout (min)',
      passwordExpiry: 'Password Expiry (days)',
      loginAttempts: 'Max Login Attempts',
      ipWhitelist: 'IP Whitelist',
      backupFrequency: 'Backup Frequency',
      numeric: 'Numeric (0-20)',
      letter: 'Letters (A-F)',
      african: 'African System',
      bilingual: 'Bilingual (FR/EN)',
      french: 'French',
      english: 'English',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      successUpdate: 'Settings updated successfully',
      errorUpdate: 'Error updating settings'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch school profile
  const { data: schoolProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/school/profile'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/school/profile', { credentials: 'include' });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Error fetching school profile:', error);
        return null;
      }
    }
  });

  // Fetch school configuration
  const { data: schoolConfig, isLoading: configLoading } = useQuery({
    queryKey: ['/api/school/configuration'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/school/configuration', { credentials: 'include' });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Error fetching school configuration:', error);
        return null;
      }
    }
  });

  // Fetch notification settings
  const { data: notificationSettings, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/school/notifications'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/school/notifications', { credentials: 'include' });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        return null;
      }
    }
  });

  // Fetch security settings
  const { data: securitySettings, isLoading: securityLoading } = useQuery({
    queryKey: ['/api/school/security'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/school/security', { credentials: 'include' });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Error fetching security settings:', error);
        return null;
      }
    }
  });

  // Update mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<SchoolProfile>) => {
      const response = await apiRequest('/api/school/profile', 'PUT', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/profile'] });
      setIsEditing(false);
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: t.successUpdate
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || t.errorUpdate,
        variant: 'destructive'
      });
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: Partial<SchoolConfiguration>) => {
      const response = await apiRequest('/api/school/configuration', 'PUT', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/configuration'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: t.successUpdate
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || t.errorUpdate,
        variant: 'destructive'
      });
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      const response = await apiRequest('/api/school/notifications', 'PUT', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/notifications'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: t.successUpdate
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || t.errorUpdate,
        variant: 'destructive'
      });
    }
  });

  const updateSecurityMutation = useMutation({
    mutationFn: async (data: Partial<SecuritySettings>) => {
      const response = await apiRequest('/api/school/security', 'PUT', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school/security'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: t.successUpdate
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || t.errorUpdate,
        variant: 'destructive'
      });
    }
  });

  // Load school branding data
  useEffect(() => {
    const loadBrandingData = async () => {
      try {
        console.log('[SCHOOL_SETTINGS] 📡 Loading branding data...');
        const brandingResponse = await fetch('/api/school/1/branding', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (brandingResponse.ok) {
          const brandingData = await brandingResponse.json();
          console.log('[SCHOOL_SETTINGS] ✅ Branding data loaded:', brandingData);
          setSchoolBranding(brandingData);
        } else {
          console.log('[SCHOOL_SETTINGS] ⚠️ Branding data not found, using defaults');
        }
      } catch (error) {
        console.error('[SCHOOL_SETTINGS] ❌ Error loading branding data:', error);
      }
    };

    loadBrandingData();
  }, []);

  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner une image' : 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    setLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/school/1/branding/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSchoolBranding(prev => ({ ...prev, logoUrl: result.logoUrl }));
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: language === 'fr' ? 'Logo téléchargé avec succès' : 'Logo uploaded successfully'
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du téléchargement du logo' : 'Failed to upload logo',
        variant: 'destructive'
      });
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle signature upload
  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner une image' : 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    setSignatureUploading(true);
    const formData = new FormData();
    formData.append('signature', file);

    try {
      const response = await fetch('/api/school/1/signatures/director', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSchoolBranding(prev => ({ ...prev, directorSignatureUrl: result.signatureUrl }));
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: language === 'fr' ? 'Signature téléchargée avec succès' : 'Signature uploaded successfully'
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Signature upload error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du téléchargement de la signature' : 'Failed to upload signature',
        variant: 'destructive'
      });
    } finally {
      setSignatureUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t.profileTab, icon: School },
    { id: 'branding', label: t.brandingTab, icon: Image },
    { id: 'configuration', label: t.configTab, icon: Settings },
    { id: 'notifications', label: t.notificationsTab, icon: Bell },
    { id: 'security', label: t.securityTab, icon: Shield }
  ];

  if (profileLoading || configLoading || notificationsLoading || securityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileIconTabNavigation
            tabs={tabs.map(tab => ({ ...tab, value: tab.id }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* School Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  {t.profileTab}
                </CardTitle>
                <CardDescription>
                  Informations générales de votre établissement
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                size="sm"
              >
                {isEditing ? t.cancel : t.edit}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">{t.schoolName}</Label>
                  <Input
                    id="schoolName"
                    defaultValue={schoolProfile?.name || ''}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">{t.principalName}</Label>
                  <Input
                    id="principalName"
                    defaultValue={schoolProfile?.principalName || ''}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={schoolProfile?.phone || ''}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={schoolProfile?.email || ''}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t.website}</Label>
                  <Input
                    id="website"
                    type="url"
                    defaultValue={schoolProfile?.website || ''}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">{t.establishedYear}</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    defaultValue={schoolProfile?.establishedYear || ''}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Textarea
                  id="address"
                  defaultValue={schoolProfile?.address || ''}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  defaultValue={schoolProfile?.description || ''}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Implement save logic
                      updateProfileMutation.mutate({});
                    }}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? t.loading : t.save}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                {t.brandingTab}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Logo et signature pour vos documents officiels' : 'Logo and signature for your official documents'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  {t.logoSchool}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading}
                      className="w-full"
                      variant="outline"
                    >
                      {logoUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                          {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {language === 'fr' ? 'Télécharger Logo' : 'Upload Logo'}
                        </div>
                      )}
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {language === 'fr' 
                        ? 'Format: PNG, JPG. Taille recommandée: 200x200px'
                        : 'Format: PNG, JPG. Recommended size: 200x200px'
                      }
                    </p>
                  </div>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32">
                    {schoolBranding.logoUrl ? (
                      <img 
                        src={schoolBranding.logoUrl} 
                        alt="School Logo" 
                        className="max-h-28 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Image className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">
                          {language === 'fr' ? 'Aucun logo' : 'No logo'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Signature Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  {t.directorSignature}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Button
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={signatureUploading}
                      className="w-full"
                      variant="outline"
                    >
                      {signatureUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                          {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {language === 'fr' ? 'Télécharger Signature' : 'Upload Signature'}
                        </div>
                      )}
                    </Button>
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {language === 'fr' 
                        ? 'Format: PNG, JPG. Fond transparent recommandé'
                        : 'Format: PNG, JPG. Transparent background recommended'
                      }
                    </p>
                  </div>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32">
                    {schoolBranding.directorSignatureUrl ? (
                      <img 
                        src={schoolBranding.directorSignatureUrl} 
                        alt="Director Signature" 
                        className="max-h-28 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <FileSignature className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">
                          {language === 'fr' ? 'Aucune signature' : 'No signature'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t.configTab}
              </CardTitle>
              <CardDescription>
                Configuration académique et opérationnelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">{t.academicYear}</Label>
                  <Input
                    id="academicYear"
                    defaultValue={schoolConfig?.academicYear || '2024-2025'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeSystem">{t.gradeSystem}</Label>
                  <Select defaultValue={schoolConfig?.gradeSystem || 'numeric'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numeric">{t.numeric}</SelectItem>
                      <SelectItem value="letter">{t.letter}</SelectItem>
                      <SelectItem value="african">{t.african}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolLanguage">{t.schoolLanguage}</Label>
                  <Select defaultValue={schoolConfig?.language || 'bilingual'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">{t.french}</SelectItem>
                      <SelectItem value="en">{t.english}</SelectItem>
                      <SelectItem value="bilingual">{t.bilingual}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t.currency}</Label>
                  <Select defaultValue={schoolConfig?.currency || 'XAF'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">XAF (Franc CFA)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Options Avancées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{t.attendanceRequired}</p>
                      <p className="text-sm text-gray-600">Présence obligatoire quotidienne</p>
                    </div>
                    <Switch defaultChecked={schoolConfig?.attendanceRequired} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{t.bulletinAutoApproval}</p>
                      <p className="text-sm text-gray-600">Approbation automatique des bulletins</p>
                    </div>
                    <Switch defaultChecked={schoolConfig?.bulletinAutoApproval} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{t.parentNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications aux parents activées</p>
                    </div>
                    <Switch defaultChecked={schoolConfig?.parentNotifications} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{t.geolocationEnabled}</p>
                      <p className="text-sm text-gray-600">Suivi de géolocalisation</p>
                    </div>
                    <Switch defaultChecked={schoolConfig?.geolocationEnabled} />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => updateConfigMutation.mutate({})}
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? t.loading : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t.notificationsTab}
              </CardTitle>
              <CardDescription>
                Préférences de notifications de l'école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{t.emailNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications par email</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notificationSettings?.emailNotifications} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t.smsNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications SMS</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notificationSettings?.smsNotifications} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">{t.pushNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications push</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notificationSettings?.pushNotifications} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{t.parentUpdates}</p>
                      <p className="text-sm text-gray-600">Mises à jour pour parents</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notificationSettings?.parentUpdates} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium">{t.teacherAlerts}</p>
                      <p className="text-sm text-gray-600">Alertes pour enseignants</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notificationSettings?.teacherAlerts} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{t.systemMaintenance}</p>
                      <p className="text-sm text-gray-600">Maintenance système</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notificationSettings?.systemMaintenance} />
                </div>
              </div>
              
              <Button
                onClick={() => updateNotificationsMutation.mutate({})}
                disabled={updateNotificationsMutation.isPending}
              >
                {updateNotificationsMutation.isPending ? t.loading : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.securityTab}
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité et confidentialité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{t.twoFactorAuth}</p>
                    <p className="text-sm text-gray-600">Authentification à deux facteurs</p>
                  </div>
                  <Switch defaultChecked={securitySettings?.twoFactorAuth} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t.sessionTimeout}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    defaultValue={securitySettings?.sessionTimeout || 30}
                    min="5"
                    max="480"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">{t.passwordExpiry}</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    defaultValue={securitySettings?.passwordExpiry || 90}
                    min="30"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">{t.loginAttempts}</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    defaultValue={securitySettings?.loginAttempts || 5}
                    min="3"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">{t.backupFrequency}</Label>
                  <Select defaultValue={securitySettings?.backupFrequency || 'daily'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t.daily}</SelectItem>
                      <SelectItem value="weekly">{t.weekly}</SelectItem>
                      <SelectItem value="monthly">{t.monthly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={() => updateSecurityMutation.mutate({})}
                disabled={updateSecurityMutation.isPending}
              >
                {updateSecurityMutation.isPending ? t.loading : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedSchoolSettings;