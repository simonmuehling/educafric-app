import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  EyeOff,
  Save,
  Upload,
  Trash2,
  Edit
} from 'lucide-react';

export default function ProfileFeatures() {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    gender: (user as any)?.gender || '',
    bio: (user as any)?.bio || '',
    location: (user as any)?.location || '',
    dateOfBirth: (user as any)?.dateOfBirth || '',
    preferredLanguage: (user as any)?.preferredLanguage || language,
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: (user as any)?.emailNotifications ?? true,
    smsNotifications: (user as any)?.smsNotifications ?? true,
    pushNotifications: (user as any)?.pushNotifications ?? true,
    gradeUpdates: (user as any)?.gradeUpdates ?? true,
    attendanceAlerts: (user as any)?.attendanceAlerts ?? true,
    homeworkReminders: (user as any)?.homeworkReminders ?? true,
  });
  
  const [notificationSettings, setNotificationSettings] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/auth/profile', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: String(t('success') || 'Success'),
        description: String(t('profileUpdated') || 'Profile updated successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: String(t('error') || 'Error'),
        description: String(error.message || 'Profile update failed'),
        variant: 'destructive',
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/auth/change-password', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: String(t('success') || 'Success'),
        description: String(t('passwordChanged') || 'Password changed successfully'),
      });
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: String(t('error') || 'Error'),
        description: String(error.message || 'Password change failed'),
        variant: 'destructive',
      });
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const settingsData = Object.keys(data).map(key => ({
        notificationType: key,
        enabled: data[key],
        emailEnabled: key.includes('email') ? data[key] : false,
        smsEnabled: key.includes('sms') ? data[key] : false,
        pushEnabled: key.includes('push') ? data[key] : false,
        whatsappEnabled: false, // WhatsApp is handled separately
        priority: key.includes('attendance') || key.includes('grade') ? 'high' : 'medium'
      }));

      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: settingsData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Notification update failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: String(t('success') || 'Success'),
        description: String(t('notificationsUpdated') || 'Notification preferences updated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: String(t('error') || 'Error'),
        description: String(error.message || 'Notification update failed'),
        variant: 'destructive',
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: String(t('error') || 'Error'),
        description: String(t('passwordsDontMatch') || "Passwords don't match"),
        variant: 'destructive',
      });
      return;
    }
    
    if ((securityData.newPassword?.length || 0) < 8) {
      toast({
        title: String(t('error') || 'Error'),
        description: String(t('passwordTooShort') || 'Password must be at least 8 characters'),
        variant: 'destructive',
      });
      return;
    }
    
    changePasswordMutation.mutate(securityData);
  };

  const handleNotificationUpdate = () => {
    updateNotificationsMutation.mutate(notifications);
  };

  const tabs = [
    {
      id: 'profile',
      label: language === 'fr' ? 'Profil' : 'Profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'security',
      label: language === 'fr' ? 'Sécurité' : 'Security',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: language === 'fr' ? 'Notifications' : 'Notifications',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'preferences',
      label: language === 'fr' ? 'Préférences' : 'Preferences',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header with Language Toggle */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'fr' ? 'Gestion du Profil' : 'Profile Management'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {user?.firstName} {user?.lastName} • {user?.role}
                </p>
              </div>
            </div>
            <LanguageToggle variant="buttons" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Navigation with Horizontal Alignment */}
        <div className="mb-8">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
            orientation="horizontal"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1"
          />
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="educafric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{language === 'fr' ? 'Informations du Profil' : 'Profile Information'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {language === 'fr' ? 'Prénom' : 'First Name'}
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName || ''}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e?.target?.value })}
                      placeholder={language === 'fr' ? 'Votre prénom' : 'Your first name'}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {language === 'fr' ? 'Nom' : 'Last Name'}
                    </Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName || ''}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e?.target?.value })}
                      placeholder={language === 'fr' ? 'Votre nom' : 'Your last name'}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === 'fr' ? 'Email' : 'Email Address'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email || ''}
                        onChange={(e) => setProfileData({ ...profileData, email: e?.target?.value })}
                        placeholder="example@educafric.com"
                        className="pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {language === 'fr' ? 'Téléphone' : 'Phone Number'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e?.target?.value })}
                        placeholder="+237 6XX XXX XXX"
                        className="pl-10"
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      {language === 'fr' ? 'Genre' : 'Gender'}
                    </Label>
                    <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'fr' ? 'Sélectionnez le genre' : 'Select gender'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{language === 'fr' ? 'Masculin' : 'Male'}</SelectItem>
                        <SelectItem value="Female">{language === 'fr' ? 'Féminin' : 'Female'}</SelectItem>
                        <SelectItem value="Other">{language === 'fr' ? 'Autre' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {language === 'fr' ? 'Localisation' : 'Location'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e?.target?.value })}
                        placeholder={language === 'fr' ? 'Yaoundé, Cameroun' : 'Yaoundé, Cameroon'}
                        className="pl-10"
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    {language === 'fr' ? 'Biographie' : 'Biography'}
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e?.target?.value })}
                    placeholder={language === 'fr' ? 'Parlez-nous un peu de vous...' : 'Tell us a bit about yourself...'}
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending 
                    ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') 
                    : (language === 'fr' ? 'Sauvegarder le Profil' : 'Save Profile')
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card className="educafric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{language === 'fr' ? 'Sécurité du Compte' : 'Account Security'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {language === 'fr' ? 'Mot de passe actuel' : 'Current Password'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e?.target?.value })}
                      placeholder={language === 'fr' ? 'Entrez votre mot de passe actuel' : 'Enter your current password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {language === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
                    </Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e?.target?.value })}
                      placeholder={language === 'fr' ? 'Entrez un nouveau mot de passe' : 'Enter new password'}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e?.target?.value })}
                      placeholder={language === 'fr' ? 'Confirmez le nouveau mot de passe' : 'Confirm new password'}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={changePasswordMutation.isPending}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending 
                    ? (language === 'fr' ? 'Modification...' : 'Updating...') 
                    : (language === 'fr' ? 'Changer le mot de passe' : 'Change Password')
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="educafric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>{language === 'fr' ? 'Préférences de Notification' : 'Notification Preferences'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* General Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'fr' ? 'Notifications Générales' : 'General Notifications'}
                  </h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {language === 'fr' ? 'Notifications Email' : 'Email Notifications'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Recevoir des notifications par email' : 'Receive notifications via email'}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {language === 'fr' ? 'Notifications SMS' : 'SMS Notifications'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Recevoir des notifications par SMS' : 'Receive notifications via SMS'}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {language === 'fr' ? 'Notifications Push' : 'Push Notifications'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Recevoir des notifications dans l\'application' : 'Receive in-app notifications'}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>
                </div>

                {/* Academic Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'fr' ? 'Notifications Académiques' : 'Academic Notifications'}
                  </h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {language === 'fr' ? 'Mises à jour des notes' : 'Grade Updates'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Notifications lors de nouvelles notes' : 'Notifications for new grades'}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.gradeUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, gradeUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {language === 'fr' ? 'Alertes de présence' : 'Attendance Alerts'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Notifications pour les absences' : 'Notifications for absences'}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.attendanceAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, attendanceAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {language === 'fr' ? 'Rappels de devoirs' : 'Homework Reminders'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Rappels pour les devoirs à rendre' : 'Reminders for homework due dates'}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.homeworkReminders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, homeworkReminders: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleNotificationUpdate}
                className="bg-green-500 hover:bg-green-600"
                disabled={updateNotificationsMutation.isPending}
              >
                <Bell className="w-4 h-4 mr-2" />
                {updateNotificationsMutation.isPending 
                  ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') 
                  : (language === 'fr' ? 'Sauvegarder les Préférences' : 'Save Preferences')
                }
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card className="educafric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>{language === 'fr' ? 'Préférences de l\'Application' : 'Application Preferences'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">
                    {language === 'fr' ? 'Langue Préférée' : 'Preferred Language'}
                  </Label>
                  <Select 
                    value={profileData.preferredLanguage} 
                    onValueChange={(value) => setProfileData({ ...profileData, preferredLanguage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">
                    {language === 'fr' ? 'Format de Date' : 'Date Format'}
                  </Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">
                    {language === 'fr' ? 'Fuseau Horaire' : 'Timezone'}
                  </Label>
                  <Select defaultValue="africa/douala">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="africa/douala">Africa/Douala (GMT+1)</SelectItem>
                      <SelectItem value="africa/kinshasa">Africa/Kinshasa (GMT+1)</SelectItem>
                      <SelectItem value="africa/lagos">Africa/Lagos (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => updateProfileMutation.mutate(profileData)}
                className="bg-purple-500 hover:bg-purple-600"
                disabled={updateProfileMutation.isPending}
              >
                <Settings className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending 
                  ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') 
                  : (language === 'fr' ? 'Sauvegarder les Préférences' : 'Save Preferences')
                }
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}