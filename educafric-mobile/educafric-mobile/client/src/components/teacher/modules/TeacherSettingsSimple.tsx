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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    {language === 'fr' ? 'Prénom' : 'First Name'}
                  </Label>
                  <Input id="firstName" placeholder={language === 'fr' ? 'Votre prénom' : 'Your first name'} />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    {language === 'fr' ? 'Nom' : 'Last Name'}
                  </Label>
                  <Input id="lastName" placeholder={language === 'fr' ? 'Votre nom' : 'Your last name'} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="teacher@educafric.com" />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </Label>
                  <Input id="phone" placeholder="+237 XXX XXX XXX" />
                </div>
              </div>
              <Button className="mt-4">
                {t.save}
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
                <div>
                  <h4 className="font-medium">
                    {language === 'fr' ? 'Notifications par email' : 'Email notifications'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' ? 'Recevoir des notifications par email' : 'Receive email notifications'}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {language === 'fr' ? 'Notifications SMS' : 'SMS notifications'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' ? 'Recevoir des notifications par SMS' : 'Receive SMS notifications'}
                  </p>
                </div>
                <Switch />
              </div>
              <Button className="mt-4">
                {t.save}
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