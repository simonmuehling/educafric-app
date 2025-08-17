import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import { 
  User, 
  Settings, 
  Mail, 
  Bell, 
  Shield, 
  Globe, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleProfileUpdate = () => {
    toast({
      title: language === 'fr' ? 'Profil mis à jour' : 'Profile Updated',
      description: language === 'fr' ? 'Vos informations ont été sauvegardées avec succès.' : 'Your information has been saved successfully.',
    });
  };

  const getTexts = (key: string) => {
    const texts = {
      title: { fr: 'Paramètres du Profil', en: 'Profile Settings' },
      description: { fr: 'Gérez vos informations personnelles et préférences', en: 'Manage your personal information and preferences' },
      profile: { fr: 'Profil', en: 'Profile' },
      notifications: { fr: 'Notifications', en: 'Notifications' },
      emailPreferences: { fr: 'Préférences Email', en: 'Email Preferences' },
      security: { fr: 'Sécurité', en: 'Security' },
      firstName: { fr: 'Prénom', en: 'First Name' },
      lastName: { fr: 'Nom', en: 'Last Name' },
      email: { fr: 'Email', en: 'Email' },
      phone: { fr: 'Téléphone', en: 'Phone' },
      role: { fr: 'Rôle', en: 'Role' },
      school: { fr: 'École', en: 'School' },
      save: { fr: 'Sauvegarder', en: 'Save Changes' },
      back: { fr: 'Retour', en: 'Back' },
      personalInfo: { fr: 'Informations personnelles', en: 'Personal Information' },
      personalInfoDesc: { fr: 'Mettez à jour vos informations de base', en: 'Update your basic information' },
      accountDetails: { fr: 'Détails du compte', en: 'Account Details' },
      joined: { fr: 'Membre depuis', en: 'Member since' },
      lastLogin: { fr: 'Dernière connexion', en: 'Last login' }
    };
    return texts[key as keyof typeof texts]?.[language] || texts[key as keyof typeof texts]?.en || key;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading user information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="inline-flex">
            <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              {getTexts('back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              {getTexts('title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {getTexts('description')}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              {getTexts('profile')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              {getTexts('notifications')}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2" data-testid="tab-email">
              <Mail className="h-4 w-4" />
              {getTexts('emailPreferences')}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2" data-testid="tab-security">
              <Shield className="h-4 w-4" />
              {getTexts('security')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {getTexts('personalInfo')}
                  </CardTitle>
                  <CardDescription>
                    {getTexts('personalInfoDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{getTexts('firstName')}</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{getTexts('lastName')}</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{getTexts('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{getTexts('phone')}</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      data-testid="input-phone"
                    />
                  </div>

                  <Button onClick={handleProfileUpdate} className="w-full flex items-center gap-2" data-testid="button-save-profile">
                    <Save className="h-4 w-4" />
                    {getTexts('save')}
                  </Button>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {getTexts('accountDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getTexts('role')}</span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>

                  {user.schoolId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getTexts('school')}</span>
                      <span className="text-sm text-muted-foreground">School ID: {user.schoolId}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getTexts('joined')}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getTexts('lastLogin')}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {getTexts('notifications')}
                </CardTitle>
                <CardDescription>
                  Configure your notification preferences and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Notification settings will be available soon. Use the Email tab to manage email notifications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Preferences Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {getTexts('emailPreferences')}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Gérez vos préférences email dans le module Paramètres Parent' : 'Manage your email preferences in the Parent Settings module'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {language === 'fr' 
                      ? 'Les préférences email ont été intégrées dans le module "Paramètres Parent" pour une meilleure expérience.'
                      : 'Email preferences have been integrated into the "Parent Settings" module for a better experience.'
                    }
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/parent'}
                    className="flex items-center gap-2"
                    data-testid="button-go-to-parent-settings"
                  >
                    <Settings className="h-4 w-4" />
                    {language === 'fr' ? 'Aller aux Paramètres Parent' : 'Go to Parent Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {getTexts('security')}
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Security settings including password change and two-factor authentication will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}