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

const TeacherSettings = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const text = {
    fr: {
      title: 'Paramètres Enseignant',
      subtitle: 'Gérez vos paramètres de compte enseignant',
      profile: 'Profil',
      notifications: 'Notifications',
      security: 'Sécurité',
      account: 'Compte',
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
      pushNotifications: 'Notifications Push',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      updatePassword: 'Mettre à jour',
      accountManagement: 'Gestion du compte',
      deactivateAccount: 'Désactiver le compte',
      deleteAccount: 'Supprimer le compte',
      deactivateWarning: 'Votre compte sera temporairement désactivé',
      deleteWarning: 'Cette action est irréversible',
      deactivate: 'Désactiver',
      requestDeletion: 'Demander suppression'
    },
    en: {
      title: 'Teacher Settings',
      subtitle: 'Manage your teacher account settings',
      profile: 'Profile',
      notifications: 'Notifications',
      security: 'Security',
      account: 'Account',
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
      pushNotifications: 'Push Notifications',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      updatePassword: 'Update',
      accountManagement: 'Account Management',
      deactivateAccount: 'Deactivate Account',
      deleteAccount: 'Delete Account',
      deactivateWarning: 'Your account will be temporarily deactivated',
      deleteWarning: 'This action is irreversible',
      deactivate: 'Deactivate',
      requestDeletion: 'Request Deletion'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'notifications', label: t.notifications, icon: Bell },
    { value: 'security', label: t.security, icon: Shield },
    { value: 'account', label: t.account, icon: UserCheck }
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

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }) => {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to change password');
      return response.json();
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été mis à jour avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.',
        variant: 'destructive'
      });
    }
  });

  // Account management mutations
  const deactivateAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/deactivate-account', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to deactivate account');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Compte désactivé',
        description: 'Votre compte a été désactivé temporairement.'
      });
      // Redirect to logout
      window.location.href = '/api/logout';
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de désactiver le compte.',
        variant: 'destructive'
      });
    }
  });

  const requestDeletionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/request-account-deletion', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to request account deletion');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de suppression de compte a été envoyée à l\'administration.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande de suppression.',
        variant: 'destructive'
      });
    }
  });

  // Helper functions
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive'
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive'
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

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
              <p className="text-sm text-gray-600">Gérez vos paramètres de sécurité et d'accès</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Authentification à deux facteurs</Label>
                  <p className="text-sm text-gray-500">Sécurité renforcée pour votre compte</p>
                </div>
                <Switch 
                  id="twoFactorAuth" 
                  defaultChecked={settings?.settings?.security?.twoFactorEnabled || false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sessionTimeout">Déconnexion automatique</Label>
                  <p className="text-sm text-gray-500">Se déconnecter après inactivité</p>
                </div>
                <select 
                  id="sessionTimeout" 
                  className="px-3 py-2 border rounded-md"
                  defaultValue={settings?.settings?.security?.sessionTimeout || '30'}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="0">Jamais</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="passwordExpiry">Expiration du mot de passe</Label>
                  <p className="text-sm text-gray-500">Renouveler le mot de passe régulièrement</p>
                </div>
                <select 
                  id="passwordExpiry" 
                  className="px-3 py-2 border rounded-md"
                  defaultValue={settings?.settings?.security?.passwordExpiry || '90'}
                >
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="180">6 mois</option>
                  <option value="0">Jamais</option>
                </select>
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

        <TabsContent value="account">
          <div className="space-y-6">
            {/* Change Password Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t.changePassword}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {changePasswordMutation.isPending ? 'Mise à jour...' : t.updatePassword}
                </Button>
              </CardContent>
            </Card>

            {/* Account Management Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  {t.accountManagement}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Deactivate Account */}
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{t.deactivateAccount}</h4>
                      <p className="text-sm text-gray-600 mt-1">{t.deactivateWarning}</p>
                      <Button 
                        variant="outline"
                        className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        onClick={() => deactivateAccountMutation.mutate()}
                        disabled={deactivateAccountMutation.isPending}
                      >
                        {deactivateAccountMutation.isPending ? 'Désactivation...' : t.deactivate}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{t.deleteAccount}</h4>
                      <p className="text-sm text-gray-600 mt-1">{t.deleteWarning}</p>
                      <Button 
                        variant="destructive"
                        className="mt-3"
                        onClick={() => requestDeletionMutation.mutate()}
                        disabled={requestDeletionMutation.isPending}
                      >
                        {requestDeletionMutation.isPending ? 'Envoi...' : t.requestDeletion}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherSettings;