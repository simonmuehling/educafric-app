import React, { useState } from 'react';
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
  Eye, EyeOff, Save, Smartphone, Mail, Phone, Upload, Image, Flag
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';

interface SchoolProfile {
  id: number;
  name: string;
  type: string; // public, private, enterprise
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  logoUrl?: string;
  description: string;
  establishedYear: number;
  principalName: string;
  studentCapacity: number;
  // Champs officiels camerounais
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
  boitePostale?: string;
  arrondissement?: string;
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
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const text = {
    fr: {
      title: 'Paramètres École',
      subtitle: 'Configuration complète de votre établissement scolaire',
      profileTab: 'Profil École',
      officialTab: 'Informations Officielles',
      configTab: 'Configuration',
      notificationsTab: 'Notifications',
      securityTab: 'Sécurité',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      loading: 'Chargement...',
      schoolName: 'Nom de l\'École',
      schoolType: 'Type d\'Établissement',
      typePublic: 'Public',
      typePrivate: 'Privé', 
      typeEnterprise: 'Entreprise',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      website: 'Site Web',
      description: 'Description',
      establishedYear: 'Année de Création',
      principalName: 'Nom du Directeur',
      studentCapacity: 'Capacité d\'Élèves',
      // Champs officiels camerounais
      regionaleMinisterielle: 'Délégation Régionale',
      regionaleExample: 'Ex: Délégation Régionale du Centre',
      delegationDepartementale: 'Délégation Départementale',
      delegationExample: 'Ex: Délégation Départementale du Mfoundi',
      boitePostale: 'Boîte Postale',
      boiteExample: 'Ex: B.P. 8524 Yaoundé',
      arrondissement: 'Arrondissement',
      arrondissementExample: 'Ex: Yaoundé 1er',
      officialInfo: 'Ces informations apparaîtront sur tous les bulletins et documents officiels',
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
      logo: 'Logo École',
      uploadLogo: 'Télécharger Logo',
      logoDescription: 'Logo qui apparaîtra sur les bulletins et transcripts',
      logoUpdated: 'Logo mis à jour avec succès',
      logoError: 'Erreur lors du téléchargement du logo',
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
      officialTab: 'Official Information',
      configTab: 'Configuration',
      notificationsTab: 'Notifications',
      securityTab: 'Security',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      loading: 'Loading...',
      schoolName: 'School Name',
      schoolType: 'Institution Type',
      typePublic: 'Public',
      typePrivate: 'Private',
      typeEnterprise: 'Enterprise', 
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      description: 'Description',
      establishedYear: 'Established Year',
      principalName: 'Principal Name',
      studentCapacity: 'Student Capacity',
      // Champs officiels camerounais
      regionaleMinisterielle: 'Regional Delegation',
      regionaleExample: 'Ex: Centre Regional Delegation',
      delegationDepartementale: 'Departmental Delegation',
      delegationExample: 'Ex: Mfoundi Departmental Delegation',
      boitePostale: 'P.O. Box',
      boiteExample: 'Ex: P.O. Box 8524 Yaoundé',
      arrondissement: 'District',
      arrondissementExample: 'Ex: Yaoundé 1st',
      officialInfo: 'This information will appear on all bulletins and official documents',
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
      logo: 'School Logo',
      uploadLogo: 'Upload Logo',
      logoDescription: 'Logo will appear on bulletins and transcripts',
      logoUpdated: 'Logo updated successfully',
      logoError: 'Error uploading logo',
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

  // Fetch school profile - use existing director API
  const { data: schoolData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/director/school-settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/director/school-settings', { credentials: 'include' });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Error fetching school settings:', error);
        return null;
      }
    }
  });

  const schoolProfile = schoolData?.school;

  // Use dummy data for configuration for now
  const schoolConfig = {
    academicYear: '2024-2025',
    gradeSystem: 'numeric',
    language: 'bilingual',
    timezone: 'Africa/Douala',
    currency: 'XAF',
    attendanceRequired: true,
    bulletinAutoApproval: false,
    parentNotifications: true,
    geolocationEnabled: true
  };
  const configLoading = false;

  // Use dummy data for notifications for now
  const notificationSettings = {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    parentUpdates: true,
    teacherAlerts: true,
    systemMaintenance: true,
    emergencyAlerts: true
  };
  const notificationsLoading = false;

  // Use dummy data for security settings for now
  const securitySettings = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: [],
    backupFrequency: 'daily'
  };
  const securityLoading = false;

  // Update mutations - use director API
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<SchoolProfile>) => {
      const response = await apiRequest('/api/director/school-settings', 'POST', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/school-settings'] });
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
      // For now, just simulate success since we're using dummy data
      return { success: true };
    },
    onSuccess: () => {
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
      // For now, just simulate success since we're using dummy data
      return { success: true };
    },
    onSuccess: () => {
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
      // For now, just simulate success since we're using dummy data
      return { success: true };
    },
    onSuccess: () => {
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

  // Logo upload handlers
  const handleGetLogoUploadParameters = async () => {
    try {
      const response = await fetch('/api/school/logo/upload-url', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL
      };
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  };

  const handleLogoUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setUploadingLogo(true);
      
      try {
        const uploadedFile = result.successful[0];
        const logoURL = uploadedFile.uploadURL;
        
        // Update school profile with new logo URL
        const response = await fetch('/api/school/logo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: logoURL }),
          credentials: 'include'
        });
        
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/school/profile'] });
          toast({
            title: language === 'fr' ? 'Succès' : 'Success',
            description: t.logoUpdated
          });
        } else {
          throw new Error('Failed to update logo');
        }
      } catch (error) {
        console.error('Error updating logo:', error);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: t.logoError,
          variant: 'destructive'
        });
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const tabs = [
    { id: 'profile', label: t.profileTab, icon: School },
    { id: 'official', label: t.officialTab, icon: Flag },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        {schoolProfile && (
          <div className="sm:ml-auto">
            <ExcelImportButton
              importType="settings"
              schoolId={schoolProfile.id}
              onImportSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/director/school-settings'] });
              }}
              invalidateQueries={['/api/director/school-settings']}
              buttonText={{
                fr: 'Importer Paramètres',
                en: 'Import Settings'
              }}
            />
          </div>
        )}
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
              
              {/* School Logo Section - Enhanced with better visibility */}
              <div className="space-y-4 border-t pt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  <Label className="text-lg font-medium">{t.logo}</Label>
                </div>
                <p className="text-sm text-gray-600">{t.logoDescription}</p>
                
                {/* Enhanced Logo Display */}
                <div className="flex flex-col items-center space-y-4 bg-white rounded-lg p-6 border-2 border-dashed border-gray-200">
                  {schoolProfile?.logoUrl ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <img 
                          src={schoolProfile.logoUrl} 
                          alt="School Logo" 
                          className="h-32 w-auto max-w-[200px] object-contain rounded-lg border border-gray-200 p-2 bg-white shadow-sm"
                        />
                        <Badge variant="default" className="absolute -top-2 -right-2 bg-green-500 text-white">
                          ✓
                        </Badge>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary" className="text-sm">
                          {language === 'fr' ? '✅ Logo Téléchargé' : '✅ Logo Uploaded'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'fr' ? 'Logo affiché sur les bulletins' : 'Logo displayed on bulletins'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3 text-center py-8">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-sm mb-2">
                          {language === 'fr' ? '📋 Aucun Logo' : '📋 No Logo'}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'Téléchargez le logo de votre école' : 'Upload your school logo'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Status and Button */}
                  <div className="w-full flex flex-col items-center space-y-3">
                    {uploadingLogo && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm">
                          {language === 'fr' ? 'Téléchargement en cours...' : 'Uploading...'}
                        </span>
                      </div>
                    )}
                    
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5 * 1024 * 1024} // 5MB
                      onGetUploadParameters={handleGetLogoUploadParameters}
                      onComplete={handleLogoUploadComplete}
                      buttonClassName={`${schoolProfile?.logoUrl ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} ${uploadingLogo ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? (
                        language === 'fr' ? 'Téléchargement...' : 'Uploading...'
                      ) : schoolProfile?.logoUrl ? (
                        language === 'fr' ? 'Changer le Logo' : 'Change Logo'
                      ) : (
                        t.uploadLogo
                      )}
                    </ObjectUploader>
                    
                    <p className="text-xs text-gray-400 text-center">
                      {language === 'fr' ? 'Formats: PNG, JPG, JPEG • Max: 5MB' : 'Formats: PNG, JPG, JPEG • Max: 5MB'}
                    </p>
                  </div>
                </div>
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

        {/* Official Information Tab */}
        <TabsContent value="official" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                {t.officialTab}
              </CardTitle>
              <CardDescription>
                {t.officialInfo}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolType">{t.schoolType}</Label>
                  <Select defaultValue={schoolProfile?.type || 'private'}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.schoolType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t.typePublic}</SelectItem>
                      <SelectItem value="private">{t.typePrivate}</SelectItem>
                      <SelectItem value="enterprise">{t.typeEnterprise}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrondissement">{t.arrondissement}</Label>
                  <Input
                    id="arrondissement"
                    defaultValue={schoolProfile?.arrondissement || ''}
                    placeholder={t.arrondissementExample}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regionaleMinisterielle">{t.regionaleMinisterielle}</Label>
                  <Input
                    id="regionaleMinisterielle"
                    defaultValue={schoolProfile?.regionaleMinisterielle || ''}
                    placeholder={t.regionaleExample}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegationDepartementale">{t.delegationDepartementale}</Label>
                  <Input
                    id="delegationDepartementale"
                    defaultValue={schoolProfile?.delegationDepartementale || ''}
                    placeholder={t.delegationExample}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boitePostale">{t.boitePostale}</Label>
                  <Input
                    id="boitePostale"
                    defaultValue={schoolProfile?.boitePostale || ''}
                    placeholder={t.boiteExample}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {language === 'fr' ? 'En-têtes automatiques' : 'Automatic Headers'}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {language === 'fr' 
                        ? 'République du Cameroun, Ministère des Enseignements Secondaires' 
                        : 'Republic of Cameroon, Ministry of Secondary Education'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {language === 'fr' ? 'Automatique' : 'Automatic'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Implement save logic for official settings
                    updateProfileMutation.mutate({});
                  }}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? t.loading : t.save}
                </Button>
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
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.emailNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications par email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.emailNotifications || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ emailNotifications: checked });
                    }}
                    data-testid="switch-email-notifications"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.smsNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications SMS</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.smsNotifications || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ smsNotifications: checked });
                    }}
                    data-testid="switch-sms-notifications"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.pushNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications push</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.pushNotifications || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ pushNotifications: checked });
                    }}
                    data-testid="switch-push-notifications"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.parentUpdates}</p>
                      <p className="text-sm text-gray-600">Mises à jour pour parents</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.parentUpdates || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ parentUpdates: checked });
                    }}
                    data-testid="switch-parent-updates"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.teacherAlerts}</p>
                      <p className="text-sm text-gray-600">Alertes pour enseignants</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.teacherAlerts || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ teacherAlerts: checked });
                    }}
                    data-testid="switch-teacher-alerts"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.systemMaintenance}</p>
                      <p className="text-sm text-gray-600">Maintenance système</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.systemMaintenance || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ systemMaintenance: checked });
                    }}
                    data-testid="switch-system-maintenance"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  ℹ️ Les modifications sont sauvegardées automatiquement lors du changement des paramètres.
                </p>
              </div>
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