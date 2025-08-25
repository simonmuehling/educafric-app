import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Bell, Shield } from 'lucide-react';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';

const TeacherSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const text = {
    fr: {
      title: 'Paramètres Enseignant',
      subtitle: 'Gérez vos paramètres de compte enseignant',
      profile: 'Profil',
      notifications: 'Notifications',
      security: 'Sécurité',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      subjects: 'Matières',
      experience: 'Expérience',
      qualification: 'Qualification',
      save: 'Sauvegarder',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      pushNotifications: 'Notifications Push'
    },
    en: {
      title: 'Teacher Settings',
      subtitle: 'Manage your teacher account settings',
      profile: 'Profile',
      notifications: 'Notifications',
      security: 'Security',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      subjects: 'Subjects',
      experience: 'Experience',
      qualification: 'Qualification',
      save: 'Save',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'security', label: t.security, icon: Shield }
  ];

  // Fetch teacher settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/teacher/settings'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const response = await fetch('/api/teacher/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/settings'] });
      toast({
        title: 'Paramètres mis à jour',
        description: 'Vos paramètres ont été sauvegardés avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return <div className="p-6 text-center">Chargement des paramètres...</div>;
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
        {/* Unified Icon Navigation for All Devices */}
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input 
                    id="firstName" 
                    defaultValue={settings?.settings?.profile?.firstName} 
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input 
                    id="lastName" 
                    defaultValue={settings?.settings?.profile?.lastName}
                    placeholder="Nom" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={settings?.settings?.profile?.email}
                  placeholder="enseignant@exemple.com" 
                />
              </div>
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input 
                  id="phone" 
                  defaultValue={settings?.settings?.profile?.phone}
                  placeholder="+237657001234" 
                />
              </div>
              <div>
                <Label htmlFor="subjects">{t.subjects}</Label>
                <Input 
                  id="subjects" 
                  defaultValue={settings?.settings?.profile?.subjects?.join(', ')}
                  placeholder="Mathématiques, Physique" 
                />
              </div>
              <Button 
                onClick={() => updateSettingsMutation.mutate({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'Sauvegarde...' : t.save}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotif">{t.emailNotifications}</Label>
                <Switch 
                  id="emailNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.email}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotif">{t.smsNotifications}</Label>
                <Switch 
                  id="smsNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.sms}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotif">{t.pushNotifications}</Label>
                <Switch 
                  id="pushNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.push}
                />
              </div>
              <Button 
                onClick={() => updateSettingsMutation.mutate({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? 'Sauvegarde...' : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Paramètres de sécurité disponibles bientôt.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherSettings;