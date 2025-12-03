import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Bell, Shield, UserCheck, AlertTriangle, School, Loader2, Save, MessageCircle, Mail } from 'lucide-react';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';
import { apiRequest } from '@/lib/queryClient';

interface TeacherSettings {
  profile: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    profilePictureUrl: string;
    educafricNumber: string;
    subjects: string[];
    experience: number;
    qualification: string;
  };
  school: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl: string;
    academicYear: string;
  } | null;
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      whatsapp: boolean;
    };
    gradeDisplayMode: string;
    theme: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string | null;
    sessionTimeout: number;
  };
}

const TeacherSettingsSimple = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    whatsapp: true
  });

  // Fetch real teacher settings
  const { data: settingsResponse, isLoading, error } = useQuery<{ success: boolean; settings: TeacherSettings }>({
    queryKey: ['/api/teacher/settings']
  });
  
  const settings = settingsResponse?.settings;
  
  // Pre-fill form when data is loaded
  useEffect(() => {
    if (settings?.profile) {
      setFormData({
        firstName: settings.profile.firstName || '',
        lastName: settings.profile.lastName || '',
        email: settings.profile.email || '',
        phone: settings.profile.phone || ''
      });
    }
    if (settings?.preferences?.notifications) {
      setNotifications(settings.preferences.notifications);
    }
  }, [settings]);
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/teacher/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/settings'] });
      toast({
        title: language === 'fr' ? 'Paramètres sauvegardés' : 'Settings saved',
        description: language === 'fr' ? 'Vos paramètres ont été mis à jour' : 'Your settings have been updated'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la sauvegarde' : 'Failed to save settings',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Paramètres Enseignant',
      subtitle: 'Gérez vos paramètres de compte enseignant',
      profile: 'Profil',
      notifications: 'Notifications',
      security: 'Sécurité',
      account: 'Compte',
      save: 'Sauvegarder'
    },
    en: {
      title: 'Teacher Settings',
      subtitle: 'Manage your teacher account settings',
      profile: 'Profile',
      notifications: 'Notifications',
      security: 'Security',
      account: 'Account',
      save: 'Save'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'security', label: t.security, icon: Shield },
    { value: 'account', label: t.account, icon: UserCheck }
  ];
  
  const handleSaveProfile = () => {
    saveMutation.mutate({ profile: formData });
  };
  
  const handleSaveNotifications = () => {
    saveMutation.mutate({ preferences: { notifications } });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{language === 'fr' ? 'Chargement...' : 'Loading...'}</span>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <TabsContent value="profile">
          {/* School Info Card */}
          {settings?.school && (
            <Card className="mb-4 border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <School className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{settings.school.name}</h3>
                    <p className="text-sm text-gray-600">{settings.school.address}</p>
                    {settings.school.academicYear && (
                      <Badge variant="outline" className="mt-1">
                        {language === 'fr' ? 'Année' : 'Year'}: {settings.school.academicYear}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* EDUCAFRIC Number */}
              {settings?.profile?.educafricNumber && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm text-green-800">
                    <strong>EDUCAFRIC ID:</strong> {settings.profile.educafricNumber}
                  </p>
                </div>
              )}
              
              {/* Assigned Subjects */}
              {settings?.profile?.subjects && settings.profile.subjects.length > 0 && (
                <div className="mb-4">
                  <Label>{language === 'fr' ? 'Matières assignées' : 'Assigned subjects'}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.profile.subjects.map((subject, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800">{subject}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    {language === 'fr' ? 'Prénom' : 'First Name'}
                  </Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder={language === 'fr' ? 'Votre prénom' : 'Your first name'} 
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    {language === 'fr' ? 'Nom' : 'Last Name'}
                  </Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder={language === 'fr' ? 'Votre nom' : 'Your last name'} 
                    data-testid="input-lastName"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="teacher@educafric.com" 
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+237 XXX XXX XXX" 
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <Button 
                className="mt-4" 
                onClick={handleSaveProfile}
                disabled={saveMutation.isPending}
                data-testid="button-save-profile"
              >
                {saveMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> {t.save}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">
                      {language === 'fr' ? 'Notifications par email' : 'Email notifications'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Recevoir des notifications par email' : 'Receive email notifications'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  data-testid="switch-email-notifications"
                />
              </div>
              
              {/* WhatsApp Notifications */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">
                      {language === 'fr' ? 'Notifications WhatsApp' : 'WhatsApp notifications'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Recevoir des notifications via WhatsApp' : 'Receive WhatsApp notifications'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.whatsapp}
                  onCheckedChange={(checked) => setNotifications({...notifications, whatsapp: checked})}
                  data-testid="switch-whatsapp-notifications"
                />
              </div>
              
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">
                      {language === 'fr' ? 'Notifications Push (App)' : 'Push notifications (App)'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Recevoir des notifications dans l\'application' : 'Receive in-app notifications'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  data-testid="switch-push-notifications"
                />
              </div>
              
              <Button 
                className="mt-4" 
                onClick={handleSaveNotifications}
                disabled={saveMutation.isPending}
                data-testid="button-save-notifications"
              >
                {saveMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> {t.save}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">
                  {language === 'fr' ? 'Mot de passe actuel' : 'Current password'}
                </Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="newPassword">
                  {language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                </Label>
                <Input id="newPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">
                  {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                </Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button className="mt-4">
                {language === 'fr' ? 'Changer le mot de passe' : 'Change password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t.account}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800">
                  {language === 'fr' ? 'Zone de danger' : 'Danger zone'}
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  {language === 'fr' ? 'Actions irréversibles sur votre compte' : 'Irreversible actions on your account'}
                </p>
              </div>
              <Button variant="destructive" className="w-full">
                {language === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherSettingsSimple;