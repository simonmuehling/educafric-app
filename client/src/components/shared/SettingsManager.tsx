import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Bell, Shield, Smartphone, Globe, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsManager = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState({
    // Profile settings
    firstName: 'Marie',
    lastName: 'Kouam',
    email: 'marie.kouam@email.com',
    phone: '+237 690 123 456',
    bio: '',
    
    // Notification settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    gradeAlerts: true,
    attendanceAlerts: true,
    assignmentReminders: true,
    
    // Privacy settings
    profileVisibility: 'school',
    shareProgress: true,
    allowMessaging: true,
    
    // App settings
    language: 'fr',
    timezone: 'Africa/Douala',
    theme: 'light'
  });

  const text = {
    fr: {
      title: 'Paramètres du Profil',
      profile: 'Profil',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      app: 'Application',
      save: 'Enregistrer',
      cancel: 'Annuler',
      
      // Profile
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      bio: 'Biographie',
      
      // Notifications
      emailNotifications: 'Notifications par email',
      smsNotifications: 'Notifications SMS',
      pushNotifications: 'Notifications push',
      gradeAlerts: 'Alertes de notes',
      attendanceAlerts: 'Alertes de présence',
      assignmentReminders: 'Rappels de devoirs',
      
      // Privacy
      profileVisibility: 'Visibilité du profil',
      shareProgress: 'Partager les progrès',
      allowMessaging: 'Autoriser la messagerie',
      
      // App
      language: 'Langue',
      timezone: 'Fuseau horaire',
      theme: 'Thème',
      
      // Options
      public: 'Public',
      school: 'École seulement',
      private: 'Privé',
      french: 'Français',
      english: 'Anglais',
      light: 'Clair',
      dark: 'Sombre'
    },
    en: {
      title: 'Profile Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      privacy: 'Privacy',
      app: 'Application',
      save: 'Save',
      cancel: 'Cancel',
      
      // Profile
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      bio: 'Biography',
      
      // Notifications
      emailNotifications: 'Email notifications',
      smsNotifications: 'SMS notifications',
      pushNotifications: 'Push notifications',
      gradeAlerts: 'Grade alerts',
      attendanceAlerts: 'Attendance alerts',
      assignmentReminders: 'Assignment reminders',
      
      // Privacy
      profileVisibility: 'Profile visibility',
      shareProgress: 'Share progress',
      allowMessaging: 'Allow messaging',
      
      // App
      language: 'Language',
      timezone: 'Timezone',
      theme: 'Theme',
      
      // Options
      public: 'Public',
      school: 'School only',
      private: 'Private',
      french: 'French',
      english: 'English',
      light: 'Light',
      dark: 'Dark'
    }
  };

  const t = text[language as keyof typeof text];

  const handleSave = async () => {
    try {
      // Save notification settings
      const notificationSettings = [
        { notificationType: 'email', enabled: settings.emailNotifications, emailEnabled: settings.emailNotifications, smsEnabled: false, pushEnabled: false, whatsappEnabled: false, priority: 'medium' },
        { notificationType: 'sms', enabled: settings.smsNotifications, emailEnabled: false, smsEnabled: settings.smsNotifications, pushEnabled: false, whatsappEnabled: false, priority: 'medium' },
        { notificationType: 'push', enabled: settings.pushNotifications, emailEnabled: false, smsEnabled: false, pushEnabled: settings.pushNotifications, whatsappEnabled: false, priority: 'medium' },
        { notificationType: 'grade', enabled: settings.gradeAlerts, emailEnabled: settings.emailNotifications, smsEnabled: settings.smsNotifications, pushEnabled: settings.pushNotifications, whatsappEnabled: false, priority: 'high' },
        { notificationType: 'attendance', enabled: settings.attendanceAlerts, emailEnabled: settings.emailNotifications, smsEnabled: settings.smsNotifications, pushEnabled: settings.pushNotifications, whatsappEnabled: false, priority: 'high' },
        { notificationType: 'assignment', enabled: settings.assignmentReminders, emailEnabled: settings.emailNotifications, smsEnabled: false, pushEnabled: settings.pushNotifications, whatsappEnabled: false, priority: 'medium' }
      ];

      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: notificationSettings })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(language === 'fr' ? 'Paramètres sauvegardés avec succès!' : 'Settings saved successfully!');
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving settings');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            {t.title || ''}
          </h2>
        </CardHeader>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-green-500" />
            {t.profile}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t.firstName || ''}</Label>
              <Input
                id="firstName"
                value={settings.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t.lastName || ''}</Label>
              <Input
                id="lastName"
                value={settings.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email || ''}</Label>
              <Input
                id="email"
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">{t.bio}</Label>
              <Textarea
                id="bio"
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e?.target?.value)}
                placeholder={language === 'fr' 
                  ? 'Parlez-nous un peu de vous...'
                  : 'Tell us a bit about yourself...'}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            {t.notifications}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">{t.emailNotifications}</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">{t.smsNotifications}</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">{t.pushNotifications}</Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
              />
            </div>
            <hr className="my-4" />
            <div className="flex items-center justify-between">
              <Label htmlFor="gradeAlerts">{t.gradeAlerts}</Label>
              <Switch
                id="gradeAlerts"
                checked={settings.gradeAlerts}
                onCheckedChange={(checked) => handleInputChange('gradeAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="attendanceAlerts">{t.attendanceAlerts}</Label>
              <Switch
                id="attendanceAlerts"
                checked={settings.attendanceAlerts}
                onCheckedChange={(checked) => handleInputChange('attendanceAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="assignmentReminders">{t.assignmentReminders}</Label>
              <Switch
                id="assignmentReminders"
                checked={settings.assignmentReminders}
                onCheckedChange={(checked) => handleInputChange('assignmentReminders', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            {t.privacy}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">{t.profileVisibility}</Label>
              <Select onValueChange={(value) => handleInputChange('profileVisibility', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.school} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t.public}</SelectItem>
                  <SelectItem value="school">{t.school}</SelectItem>
                  <SelectItem value="private">{t.private}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shareProgress">{t.shareProgress}</Label>
              <Switch
                id="shareProgress"
                checked={settings.shareProgress}
                onCheckedChange={(checked) => handleInputChange('shareProgress', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowMessaging">{t.allowMessaging}</Label>
              <Switch
                id="allowMessaging"
                checked={settings.allowMessaging}
                onCheckedChange={(checked) => handleInputChange('allowMessaging', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            {t.app}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">{t.language}</Label>
              <Select onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? t.french : t.english} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t.french}</SelectItem>
                  <SelectItem value="en">{t.english}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t.timezone}</Label>
              <Select onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Africa/Douala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Douala">Africa/Douala</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                  <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 justify-end">
            <Button variant="outline">
              {t.cancel}
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {t.save}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;