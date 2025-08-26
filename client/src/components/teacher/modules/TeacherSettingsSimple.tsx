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
import { Settings, User, Bell, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';

const TeacherSettingsSimple = () => {
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
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Module des paramètres de profil fonctionnel !</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Module des notifications fonctionnel !</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Module de sécurité fonctionnel !</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t.account}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Module de gestion de compte fonctionnel !</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherSettingsSimple;