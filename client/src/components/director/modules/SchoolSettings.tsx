import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { School, Mail, Phone, MapPin, Users, Settings, Save, Upload, Image, FileSignature, Shield, Bell, Globe, Database, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';

const SchoolSettings: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [schoolBranding, setSchoolBranding] = useState({
    logoUrl: '',
    directorSignatureUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    director: "",
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    establishmentType: "",
    academicYear: "",
    description: "",
    establishedYear: 2000,
    studentCapacity: 1000
  });

  // Configuration settings
  const [schoolConfig, setSchoolConfig] = useState({
    academicYear: '2024-2025',
    gradeSystem: 'numeric' as 'numeric' | 'letter' | 'african',
    language: 'bilingual' as 'fr' | 'en' | 'bilingual',
    timezone: 'Africa/Douala',
    currency: 'XAF',
    attendanceRequired: true,
    bulletinAutoApproval: false,
    parentNotifications: true,
    geolocationEnabled: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    parentUpdates: true,
    teacherAlerts: true,
    systemMaintenance: false,
    emergencyAlerts: true
  });

  // Text translations
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
      logoSchool: 'Logo de l\'École',
      directorSignature: 'Signature du Directeur'
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
      logoSchool: 'School Logo',
      directorSignature: 'Director Signature'
    }
  };

  const t = text[language as keyof typeof text];

  // Tab configuration for mobile navigation
  const tabConfig = [
    { value: 'profile', label: t.profileTab, icon: School },
    { value: 'branding', label: t.brandingTab, icon: Image },
    { value: 'config', label: t.configTab, icon: Settings },
    { value: 'notifications', label: t.notificationsTab, icon: Bell }
  ];

  // Load real school data and branding on component mount
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        setLoading(true);
        console.log('[SCHOOL_SETTINGS] 📡 Loading real school data...');
        
        // Load school data
        const response = await fetch('/api/school/1/settings', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const realSchoolData = await response.json();
          console.log('[SCHOOL_SETTINGS] ✅ Real school data loaded:', realSchoolData);
          setSchoolData(realSchoolData);
        } else {
          console.error('[SCHOOL_SETTINGS] ❌ Failed to load school data:', response.status);
          // Use fallback data only if API fails
          setSchoolData({
            name: "École Excellence Yaoundé",
            address: "Avenue Kennedy, Bastos, Yaoundé",
            phone: "+237 656 200 472",
            email: "contact@excellence-yaounde.edu.cm",
            website: "www.excellence-yaounde.edu.cm",
            director: "Demo Director",
            studentsCount: 1247,
            teachersCount: 85,
            classesCount: 24,
            establishmentType: "Privé",
            academicYear: "2024-2025",
            description: "École d'excellence située au cœur de Yaoundé",
            establishedYear: 2015,
            studentCapacity: 1500
          });
        }

        // Load school branding (logo and signatures)
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
        console.error('[SCHOOL_SETTINGS] ❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchoolData();
  }, []);

  // Save function
  const handleSave = async () => {
    try {
      const response = await fetch('/api/school/1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(schoolData),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSchoolData(updatedSettings);
        console.log('✅ School settings saved successfully');
        toast({
          title: language === 'fr' ? 'Succès' : 'Success',
          description: language === 'fr' ? 'Paramètres de l\'école sauvegardés' : 'School settings saved successfully'
        });
      } else {
        console.error('❌ Failed to save school settings');
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Failed to save settings',
          variant: 'destructive'
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error saving school settings:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Failed to save settings',
        variant: 'destructive'
      });
      setIsEditing(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
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
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  {t.profileTab}
                </CardTitle>
                <CardDescription>{language === 'fr' ? 'Informations générales de l\'école' : 'General school information'}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t.save}
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        {t.edit}
                      </>
                    )}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-700 font-medium">{t.schoolName}</Label>
                      <Input
                        value={schoolData.name}
                        onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                        className="mt-1"
                        data-testid="input-school-name"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">{t.email}</Label>
                      <Input
                        value={schoolData.email}
                        onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                        className="mt-1"
                        data-testid="input-school-email"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-700 font-medium">{t.address}</Label>
                      <Textarea
                        value={schoolData.address}
                        onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                        className="mt-1"
                        data-testid="textarea-school-address"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">{t.phone}</Label>
                      <Input
                        value={schoolData.phone}
                        onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                        className="mt-1"
                        data-testid="input-school-phone"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">{t.website}</Label>
                      <Input
                        value={schoolData.website}
                        onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                        className="mt-1"
                        data-testid="input-school-website"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-700 font-medium">{t.schoolName}</Label>
                      <p className="mt-1 text-gray-900 font-medium">{schoolData.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">{t.email}</Label>
                      <p className="mt-1 text-gray-900">{schoolData.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-700 font-medium">{t.address}</Label>
                      <p className="mt-1 text-gray-900">{schoolData.address}</p>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">{t.phone}</Label>
                      <p className="mt-1 text-gray-900">{schoolData.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">{t.website}</Label>
                      <p className="mt-1 text-gray-900">{schoolData.website}</p>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t.save}
                    </Button>
                  </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          {language === 'fr' ? 'Total Élèves' : 'Total Students'}
                        </p>
                        <p className="text-3xl font-bold">{schoolData?.studentsCount?.toLocaleString()}</p>
                      </div>
                      <Users className="w-10 h-10 text-blue-200" />
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          {language === 'fr' ? 'Enseignants' : 'Teachers'}
                        </p>
                        <p className="text-3xl font-bold">{schoolData.teachersCount}</p>
                      </div>
                      <Users className="w-10 h-10 text-green-200" />
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          {language === 'fr' ? 'Classes' : 'Classes'}
                        </p>
                        <p className="text-3xl font-bold">{schoolData.classesCount}</p>
                      </div>
                      <School className="w-10 h-10 text-purple-200" />
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  {t.brandingTab}
                </CardTitle>
                <CardDescription>{language === 'fr' ? 'Logo et signature de l\'école' : 'School logo and signature'}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-700 flex items-center">
                      <Image className="w-5 h-5 mr-2" />
                      {t.logoSchool}
                    </Label>
                    
                    {schoolBranding.logoUrl ? (
                      <div className="space-y-3">
                        <div className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center h-32">
                          <img 
                            src={schoolBranding.logoUrl} 
                            alt="Logo de l'école"
                            className="max-h-24 max-w-full object-contain"
                            data-testid="school-logo-preview"
                          />
                        </div>
                        <Button
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          data-testid="button-change-logo"
                        >
                          {logoUploading ? (
                            <>
                              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                              {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {language === 'fr' ? 'Changer le Logo' : 'Change Logo'}
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => logoInputRef.current?.click()}
                        data-testid="logo-upload-area"
                      >
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          {language === 'fr' ? 'Cliquez pour télécharger le logo' : 'Click to upload logo'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'PNG, JPG jusqu\'à 5MB' : 'PNG, JPG up to 5MB'}
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      data-testid="input-logo-upload"
                    />
                  </div>

                  {/* Signature Upload */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-700 flex items-center">
                      <FileSignature className="w-5 h-5 mr-2" />
                      {t.directorSignature}
                    </Label>
                    
                    {schoolBranding.directorSignatureUrl ? (
                      <div className="space-y-3">
                        <div className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center h-32">
                          <img 
                            src={schoolBranding.directorSignatureUrl} 
                            alt="Signature du directeur"
                            className="max-h-24 max-w-full object-contain"
                            data-testid="director-signature-preview"
                          />
                        </div>
                        <Button
                          onClick={() => signatureInputRef.current?.click()}
                          disabled={signatureUploading}
                          className="w-full bg-green-600 hover:bg-green-700"
                          data-testid="button-change-signature"
                        >
                          {signatureUploading ? (
                            <>
                              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                              {language === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {language === 'fr' ? 'Changer la Signature' : 'Change Signature'}
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
                        onClick={() => signatureInputRef.current?.click()}
                        data-testid="signature-upload-area"
                      >
                        <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          {language === 'fr' ? 'Cliquez pour télécharger la signature' : 'Click to upload signature'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'PNG, JPG jusqu\'à 5MB' : 'PNG, JPG up to 5MB'}
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                      data-testid="input-signature-upload"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{language === 'fr' ? 'Note :' : 'Note:'}</strong>{' '}
                    {language === 'fr' 
                      ? 'Le logo et la signature seront utilisés sur tous les documents officiels de l\'école (bulletins, certificats, etc.)' 
                      : 'The logo and signature will be used on all official school documents (report cards, certificates, etc.)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.configTab}
                </CardTitle>
                <CardDescription>{language === 'fr' ? 'Configuration système de l\'école' : 'School system configuration'}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>{t.academicYear}</Label>
                    <Input
                      value={schoolConfig.academicYear}
                      onChange={(e) => setSchoolConfig({...schoolConfig, academicYear: e.target.value})}
                      data-testid="input-academic-year"
                    />
                  </div>
                  <div>
                    <Label>{t.gradeSystem}</Label>
                    <Select 
                      value={schoolConfig.gradeSystem} 
                      onValueChange={(value: 'numeric' | 'letter' | 'african') => 
                        setSchoolConfig({...schoolConfig, gradeSystem: value})
                      }
                    >
                      <SelectTrigger data-testid="select-grade-system">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numeric">Numérique (0-20)</SelectItem>
                        <SelectItem value="letter">Lettres (A-F)</SelectItem>
                        <SelectItem value="african">Système Africain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label>{t.attendanceRequired}</Label>
                    <Switch
                      checked={schoolConfig.attendanceRequired}
                      onCheckedChange={(checked) => 
                        setSchoolConfig({...schoolConfig, attendanceRequired: checked})
                      }
                      data-testid="switch-attendance-required"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label>{t.parentNotifications}</Label>
                    <Switch
                      checked={schoolConfig.parentNotifications}
                      onCheckedChange={(checked) => 
                        setSchoolConfig({...schoolConfig, parentNotifications: checked})
                      }
                      data-testid="switch-parent-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label>{t.geolocationEnabled}</Label>
                    <Switch
                      checked={schoolConfig.geolocationEnabled}
                      onCheckedChange={(checked) => 
                        setSchoolConfig({...schoolConfig, geolocationEnabled: checked})
                      }
                      data-testid="switch-geolocation"
                    />
                  </div>
                </div>

                <Button className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t.notificationsTab}
                </CardTitle>
                <CardDescription>{language === 'fr' ? 'Paramètres de notification' : 'Notification settings'}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>{t.emailNotifications}</Label>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, emailNotifications: checked})
                    }
                    data-testid="switch-email-notifications"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>{t.smsNotifications}</Label>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, smsNotifications: checked})
                    }
                    data-testid="switch-sms-notifications"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>{t.parentUpdates}</Label>
                  <Switch
                    checked={notificationSettings.parentUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, parentUpdates: checked})
                    }
                    data-testid="switch-parent-updates"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>{t.emergencyAlerts}</Label>
                  <Switch
                    checked={notificationSettings.emergencyAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, emergencyAlerts: checked})
                    }
                    data-testid="switch-emergency-alerts"
                  />
                </div>

                <Button className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolSettings;