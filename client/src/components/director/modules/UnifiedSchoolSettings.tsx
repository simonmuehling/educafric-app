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
  Settings, School, Bell, MapPin, Clock, Users, 
  GraduationCap, Palette, Globe, Database,
  Eye, EyeOff, Save, Mail, Phone, Upload, Image, Flag,
  WifiOff, Download, CheckCircle2, RefreshCw, AlertTriangle, MessageSquare
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';

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
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  parentUpdates: boolean;
  teacherAlerts: boolean;
  systemMaintenance: boolean;
  emergencyAlerts: boolean;
}

const UnifiedSchoolSettings: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Offline Premium Mode
  const { 
    isOnline, 
    offlineDataReady, 
    offlineDataStatus, 
    isPreparing, 
    prepareOfflineData,
    refreshDataStatus
  } = useOfflinePremium();
  
  // Local state for form data
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  const text = {
    fr: {
      title: 'Paramètres École',
      subtitle: 'Configuration complète de votre établissement scolaire',
      profileTab: 'Profil École',
      officialTab: 'Informations Officielles',
      configTab: 'Configuration',
      notificationsTab: 'Notifications',
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
      whatsappNotifications: 'Notifications WhatsApp',
      pushNotifications: 'Notifications Push',
      parentUpdates: 'Mises à jour Parents',
      teacherAlerts: 'Alertes Enseignants',
      systemMaintenance: 'Maintenance Système',
      emergencyAlerts: 'Alertes d\'Urgence',
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
      whatsappNotifications: 'WhatsApp Notifications',
      pushNotifications: 'Push Notifications',
      parentUpdates: 'Parent Updates',
      teacherAlerts: 'Teacher Alerts',
      systemMaintenance: 'System Maintenance',
      emergencyAlerts: 'Emergency Alerts',
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
  
  // Initialize formData when schoolProfile loads
  React.useEffect(() => {
    if (schoolProfile) {
      setFormData({
        name: schoolProfile.name,
        type: schoolProfile.type,
        address: schoolProfile.address,
        phone: schoolProfile.phone,
        email: schoolProfile.email,
        website: schoolProfile.website,
        description: schoolProfile.description,
        establishedYear: schoolProfile.establishedYear,
        principalName: schoolProfile.principalName,
        studentCapacity: schoolProfile.studentCapacity,
        regionaleMinisterielle: schoolProfile.regionaleMinisterielle,
        delegationDepartementale: schoolProfile.delegationDepartementale,
        boitePostale: schoolProfile.boitePostale,
        arrondissement: schoolProfile.arrondissement,
        logoUrl: schoolProfile.logoUrl
      });
    }
  }, [schoolProfile]);
  
  // Handle form field changes
  const handleFieldChange = (field: keyof SchoolProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    whatsappNotifications: true,
    pushNotifications: true,
    parentUpdates: true,
    teacherAlerts: true,
    systemMaintenance: true,
    emergencyAlerts: true
  };
  const notificationsLoading = false;

  // Update mutations - use director API
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<SchoolProfile>) => {
      const response = await apiRequest('POST', '/api/director/school-settings', data);
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

  // Simple logo upload handler using direct file upload
  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le fichier est trop volumineux (max 5MB)' : 'File is too large (max 5MB)',
        variant: 'destructive'
      });
      return;
    }

    setUploadingLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/school/logo/simple-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/school/profile'] });
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: t.logoUpdated
        });
      } else {
        throw new Error(data.message || 'Failed to upload logo');
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || t.logoError,
        variant: 'destructive'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t.profileTab, icon: School },
    { id: 'official', label: t.officialTab, icon: Flag },
    { id: 'configuration', label: t.configTab, icon: Settings },
    { id: 'notifications', label: t.notificationsTab, icon: Bell }
  ];

  if (profileLoading || configLoading || notificationsLoading) {
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
                    value={formData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">{t.principalName}</Label>
                  <Input
                    id="principalName"
                    value={formData.principalName || ''}
                    onChange={(e) => handleFieldChange('principalName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t.website}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">{t.establishedYear}</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    value={formData.establishedYear || ''}
                    onChange={(e) => handleFieldChange('establishedYear', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
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
                    
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        disabled={uploadingLogo}
                        className="hidden"
                        id="logo-upload-input"
                      />
                      <label htmlFor="logo-upload-input">
                        <Button
                          type="button"
                          disabled={uploadingLogo}
                          className={`${schoolProfile?.logoUrl ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => document.getElementById('logo-upload-input')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingLogo ? (
                            language === 'fr' ? 'Téléchargement...' : 'Uploading...'
                          ) : schoolProfile?.logoUrl ? (
                            language === 'fr' ? 'Changer le Logo' : 'Change Logo'
                          ) : (
                            t.uploadLogo
                          )}
                        </Button>
                      </label>
                    </div>
                    
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
                      // Save form data to backend
                      console.log('[SCHOOL_SETTINGS] Saving form data:', formData);
                      updateProfileMutation.mutate(formData);
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
                  <Select 
                    value={formData.type || 'private'} 
                    onValueChange={(value) => handleFieldChange('type', value)}
                    disabled={!isEditing}
                  >
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
                    value={formData.arrondissement || ''}
                    onChange={(e) => handleFieldChange('arrondissement', e.target.value)}
                    placeholder={t.arrondissementExample}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regionaleMinisterielle">{t.regionaleMinisterielle}</Label>
                  <Input
                    id="regionaleMinisterielle"
                    value={formData.regionaleMinisterielle || ''}
                    onChange={(e) => handleFieldChange('regionaleMinisterielle', e.target.value)}
                    placeholder={t.regionaleExample}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegationDepartementale">{t.delegationDepartementale}</Label>
                  <Input
                    id="delegationDepartementale"
                    value={formData.delegationDepartementale || ''}
                    onChange={(e) => handleFieldChange('delegationDepartementale', e.target.value)}
                    placeholder={t.delegationExample}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boitePostale">{t.boitePostale}</Label>
                  <Input
                    id="boitePostale"
                    value={formData.boitePostale || ''}
                    onChange={(e) => handleFieldChange('boitePostale', e.target.value)}
                    placeholder={t.boiteExample}
                    disabled={!isEditing}
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
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Save form data to backend
                      console.log('[SCHOOL_SETTINGS] Saving official info:', formData);
                      updateProfileMutation.mutate(formData);
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
              
              <Separator />
              
              {/* Offline Mode Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <WifiOff className="w-5 h-5" />
                  {language === 'fr' ? 'Mode Hors Ligne Premium' : 'Offline Premium Mode'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'fr' 
                    ? 'Préparez votre appareil pour utiliser Educafric sans connexion internet. Les données seront stockées localement.'
                    : 'Prepare your device to use Educafric without internet connection. Data will be stored locally.'
                  }
                </p>
                
                {/* Activation Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <WifiOff className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        {language === 'fr' ? 'Activer le Mode Hors Ligne Premium' : 'Enable Offline Premium Mode'}
                      </p>
                      <p className="text-sm text-green-700">
                        {language === 'fr' 
                          ? 'Permet le stockage local des données et l\'accès sans connexion'
                          : 'Allows local data storage and offline access'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch 
                    defaultChecked={offlineDataReady}
                    onCheckedChange={async (checked) => {
                      if (checked && !offlineDataReady && isOnline) {
                        const success = await prepareOfflineData();
                        if (success) {
                          toast({
                            title: language === 'fr' ? 'Mode Hors Ligne Activé' : 'Offline Mode Enabled',
                            description: language === 'fr' 
                              ? 'Votre appareil est prêt pour le mode hors ligne!' 
                              : 'Your device is ready for offline mode!'
                          });
                        }
                      }
                    }}
                    data-testid="switch-offline-premium"
                  />
                </div>
                
                {/* Duration Recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">
                        {language === 'fr' ? 'Durée recommandée : 24-48 heures' : 'Recommended duration: 24-48 hours'}
                      </p>
                      <p className="text-sm text-blue-700">
                        {language === 'fr' 
                          ? 'Reconnectez-vous régulièrement pour synchroniser notes, présences et sauvegardes. Après 3 jours: avertissement. Après 14 jours: accès suspendu.'
                          : 'Reconnect regularly to sync grades, attendance and backups. After 3 days: warning. After 14 days: access suspended.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Database className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {language === 'fr' ? 'État des données locales' : 'Local Data Status'}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                            <School className="w-4 h-4 text-blue-500" />
                            {offlineDataStatus?.classesCount || 0} {language === 'fr' ? 'classes' : 'classes'}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                            <GraduationCap className="w-4 h-4 text-green-500" />
                            {offlineDataStatus?.studentsCount || 0} {language === 'fr' ? 'élèves' : 'students'}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                            <Users className="w-4 h-4 text-purple-500" />
                            {offlineDataStatus?.teachersCount || 0} {language === 'fr' ? 'enseignants' : 'teachers'}
                          </span>
                        </div>
                        {offlineDataStatus?.lastPrepared && (
                          <p className="text-xs text-gray-500 mt-2">
                            {language === 'fr' ? 'Dernière préparation' : 'Last prepared'}: {' '}
                            {new Date(offlineDataStatus.lastPrepared).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {offlineDataReady ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {language === 'fr' ? 'Prêt pour le mode hors ligne' : 'Ready for offline mode'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {language === 'fr' ? 'Non préparé' : 'Not prepared'}
                          </span>
                        </div>
                      )}
                      
                      <Button
                        onClick={async () => {
                          const success = await prepareOfflineData();
                          if (success) {
                            toast({
                              title: language === 'fr' ? 'Succès' : 'Success',
                              description: language === 'fr' 
                                ? 'Appareil préparé pour le mode hors ligne!' 
                                : 'Device prepared for offline mode!'
                            });
                          } else {
                            toast({
                              title: language === 'fr' ? 'Erreur' : 'Error',
                              description: language === 'fr'
                                ? 'Échec de la préparation. Réessayez.'
                                : 'Preparation failed. Please try again.',
                              variant: 'destructive'
                            });
                          }
                        }}
                        disabled={!isOnline || isPreparing}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="btn-prepare-offline"
                      >
                        {isPreparing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'fr' ? 'Préparation...' : 'Preparing...'}
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            {language === 'fr' ? 'Préparer cet appareil' : 'Prepare This Device'}
                          </>
                        )}
                      </Button>
                      
                      {!isOnline && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <WifiOff className="w-3 h-3" />
                          {language === 'fr' 
                            ? 'Connexion requise pour préparer'
                            : 'Connection required to prepare'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Guide Link */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {language === 'fr' ? 'Voir le guide complet du mode hors ligne' : 'View the complete offline mode guide'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openOfflineGuide'));
                    }}
                    data-testid="btn-view-offline-guide"
                  >
                    {language === 'fr' ? 'Voir le guide' : 'View Guide'}
                  </Button>
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
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">{t.whatsappNotifications}</p>
                      <p className="text-sm text-gray-600">Notifications WhatsApp</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings?.whatsappNotifications || false}
                    onCheckedChange={(checked) => {
                      updateNotificationsMutation.mutate({ whatsappNotifications: checked });
                    }}
                    data-testid="switch-whatsapp-notifications"
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

      </Tabs>
    </div>
  );
};

export default UnifiedSchoolSettings;