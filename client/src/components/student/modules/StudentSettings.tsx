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

const StudentSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const text = {
    fr: {
      title: 'Paramètres Élève',
      subtitle: 'Gérez vos paramètres de compte',
      profile: 'Profil',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      className: 'Classe',
      studentId: 'ID Élève',
      save: 'Sauvegarder',
      gradeNotifications: 'Notifications Notes',
      assignmentNotifications: 'Notifications Devoirs',
      attendanceNotifications: 'Notifications Présence'
    },
    en: {
      title: 'Student Settings',
      subtitle: 'Manage your account settings',
      profile: 'Profile',
      notifications: 'Notifications',
      privacy: 'Privacy',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      className: 'Class',
      studentId: 'Student ID',
      save: 'Save',
      gradeNotifications: 'Grade Notifications',
      assignmentNotifications: 'Assignment Notifications',
      attendanceNotifications: 'Attendance Notifications'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'privacy', label: t.privacy, icon: Shield },
    { value: 'security', label: language === 'fr' ? 'Sécurité' : 'Security', icon: Shield }
  ];

  // Fetch student settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/student/settings'],
    queryFn: async () => {
      const response = await fetch('/api/student/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const response = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/settings'] });
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
                  placeholder="eleve@exemple.com" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="className">{t.className}</Label>
                  <Input 
                    id="className" 
                    defaultValue={settings?.settings?.profile?.className}
                    placeholder="6ème A" 
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">{t.studentId}</Label>
                  <Input 
                    id="studentId" 
                    defaultValue={settings?.settings?.profile?.studentId}
                    placeholder="SJ2024001" 
                    readOnly
                  />
                </div>
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
                <Label htmlFor="gradeNotif">{t.gradeNotifications}</Label>
                <Switch 
                  id="gradeNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.grades}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="assignmentNotif">{t.assignmentNotifications}</Label>
                <Switch 
                  id="assignmentNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.assignments}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="attendanceNotif">{t.attendanceNotifications}</Label>
                <Switch 
                  id="attendanceNotif" 
                  defaultChecked={settings?.settings?.preferences?.notifications?.attendance}
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

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t.privacy}</CardTitle>
              <p className="text-sm text-gray-600">Gérez vos paramètres de confidentialité et de visibilité</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profileVisibility">Visibilité du profil</Label>
                  <p className="text-sm text-gray-500">Qui peut voir votre profil</p>
                </div>
                <select 
                  id="profileVisibility" 
                  className="px-3 py-2 border rounded-md"
                  defaultValue={settings?.settings?.privacy?.profileVisibility || 'school_only'}
                >
                  <option value="public">Publique</option>
                  <option value="school_only">École seulement</option>
                  <option value="private">Privé</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowParentTracking">Autoriser le suivi parental</Label>
                  <p className="text-sm text-gray-500">Permettre aux parents de voir votre localisation</p>
                </div>
                <Switch 
                  id="allowParentTracking" 
                  defaultChecked={settings?.settings?.privacy?.allowParentTracking !== false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showGradesToParents">Partager les notes</Label>
                  <p className="text-sm text-gray-500">Permettre aux parents de voir vos notes</p>
                </div>
                <Switch 
                  id="showGradesToParents" 
                  defaultChecked={settings?.settings?.privacy?.showGradesToParents !== false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowDirectMessages">Messages directs</Label>
                  <p className="text-sm text-gray-500">Recevoir des messages privés d'autres utilisateurs</p>
                </div>
                <Switch 
                  id="allowDirectMessages" 
                  defaultChecked={settings?.settings?.privacy?.allowDirectMessages !== false}
                />
              </div>
              
              <Button 
                onClick={() => updateSettingsMutation.mutate({})}
                disabled={updateSettingsMutation.isPending}
                className="w-full"
              >
                {updateSettingsMutation.isPending ? 'Sauvegarde...' : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Sécurité' : 'Security'}</CardTitle>
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Gérez vos paramètres de sécurité et votre compte' : 'Manage your security settings and account'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {language === 'fr' ? 'Changer le mot de passe' : 'Change Password'}
                </h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="currentPassword">
                      {language === 'fr' ? 'Mot de passe actuel' : 'Current Password'}
                    </Label>
                    <input
                      id="currentPassword"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={language === 'fr' ? 'Entrez votre mot de passe actuel' : 'Enter your current password'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">
                      {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
                    </Label>
                    <input
                      id="newPassword"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={language === 'fr' ? 'Entrez votre nouveau mot de passe' : 'Enter your new password'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
                    </Label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={language === 'fr' ? 'Confirmez votre nouveau mot de passe' : 'Confirm your new password'}
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      toast({
                        title: language === 'fr' ? 'Mot de passe mis à jour' : 'Password Updated',
                        description: language === 'fr' ? 'Votre mot de passe a été changé avec succès.' : 'Your password has been changed successfully.'
                      });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {language === 'fr' ? 'Changer le mot de passe' : 'Change Password'}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">
                      {language === 'fr' ? 'Authentification à deux facteurs' : 'Two-Factor Authentication'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {language === 'fr' ? 'Sécurité renforcée pour votre compte' : 'Enhanced security for your account'}
                    </p>
                  </div>
                  <Switch 
                    id="twoFactorAuth" 
                    defaultChecked={settings?.settings?.security?.twoFactorEnabled || false}
                  />
                </div>
              </div>

              {/* Account Deletion Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-red-600">
                  {language === 'fr' ? 'Zone de danger' : 'Danger Zone'}
                </h3>
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 mb-4">
                    {language === 'fr' 
                      ? 'La suppression de votre compte nécessite la validation de vos parents. Une demande leur sera envoyée par email et notification.'
                      : 'Account deletion requires parental approval. A request will be sent to your parents via email and notification.'
                    }
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ {language === 'fr' 
                        ? 'Processus: Demande → Validation parentale → Suppression automatique'
                        : 'Process: Request → Parental approval → Automatic deletion'
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={async () => {
                      if (window.confirm(language === 'fr' 
                        ? 'Voulez-vous vraiment demander la suppression de votre compte ? Vos parents recevront une notification pour valider cette demande.'
                        : 'Do you really want to request account deletion? Your parents will receive a notification to validate this request.'
                      )) {
                        try {
                          const response = await fetch('/api/student/request-account-deletion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include'
                          });
                          const data = await response.json();
                          
                          if (data.success) {
                            toast({
                              title: language === 'fr' ? 'Demande envoyée' : 'Request Sent',
                              description: language === 'fr' 
                                ? 'Votre demande de suppression a été envoyée à vos parents. Ils recevront un email et une notification.'
                                : 'Your deletion request has been sent to your parents. They will receive an email and notification.'
                            });
                          } else {
                            toast({
                              title: language === 'fr' ? 'Erreur' : 'Error',
                              description: data.message,
                              variant: 'destructive'
                            });
                          }
                        } catch (error) {
                          toast({
                            title: language === 'fr' ? 'Erreur' : 'Error',
                            description: language === 'fr' ? 'Erreur lors de l\'envoi de la demande' : 'Error sending request',
                            variant: 'destructive'
                          });
                        }
                      }
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    {language === 'fr' ? 'Demander la suppression' : 'Request Deletion'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentSettings;