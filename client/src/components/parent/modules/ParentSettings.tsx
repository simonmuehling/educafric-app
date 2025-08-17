import React, { useState } from 'react';
import { User, Shield, Bell, Lock, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';

const ParentSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Paramètres Parent',
      subtitle: 'Gérez vos préférences et informations personnelles',
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      save: 'Sauvegarder',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      whatsappNotifications: 'Notifications WhatsApp',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe'
    },
    en: {
      title: 'Parent Settings',
      subtitle: 'Manage your preferences and personal information',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      privacy: 'Privacy',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      save: 'Save',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      whatsappNotifications: 'WhatsApp Notifications',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'security', label: t.security, icon: Shield },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'privacy', label: t.privacy, icon: Lock }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Icon Navigation */}
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Desktop Tab List */}
        <TabsList className="hidden md:grid grid-cols-4 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t.profile}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t.security}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t.notifications}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t.privacy}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input id="firstName" placeholder="Entrez votre prénom" />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input id="lastName" placeholder="Entrez votre nom" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" placeholder="parent@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                    +237
                  </span>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="newPassword">{t.newPassword}</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Lock className="w-4 h-4 mr-2" />
                {t.changePassword}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifs">{t.emailNotifications}</Label>
                <Switch id="emailNotifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifs">{t.smsNotifications}</Label>
                <Switch id="smsNotifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsappNotifs">{t.whatsappNotifications}</Label>
                <Switch id="whatsappNotifs" defaultChecked />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Bell className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t.privacy}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Paramètres de confidentialité disponibles prochainement.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentSettings;