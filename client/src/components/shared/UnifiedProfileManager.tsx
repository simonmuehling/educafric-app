import React, { useState } from 'react';
import { User, Shield, Bell, Phone, Mail, MapPin, Calendar, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MobileIconTabNavigation from './MobileIconTabNavigation';

interface UnifiedProfileManagerProps {
  userType: 'teacher' | 'student' | 'parent';
  showPhotoUpload?: boolean;
}

const UnifiedProfileManager: React.FC<UnifiedProfileManagerProps> = ({ 
  userType, 
  showPhotoUpload = false 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: '',
    dateOfBirth: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    gradeUpdates: true,
    attendanceAlerts: true,
    generalAnnouncements: true
  });

  const text = {
    fr: {
      title: {
        teacher: 'Profil Enseignant',
        student: 'Profil Élève', 
        parent: 'Profil Parent'
      },
      subtitle: 'Gérez vos informations personnelles et paramètres',
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      gender: 'Sexe',
      address: 'Adresse',
      dateOfBirth: 'Date de naissance',
      save: 'Sauvegarder',
      male: 'Masculin',
      female: 'Féminin',
      other: 'Autre',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      changePassword: 'Changer le mot de passe',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      whatsappNotifications: 'Notifications WhatsApp',
      gradeUpdates: 'Mises à jour des notes',
      attendanceAlerts: 'Alertes de présence',
      generalAnnouncements: 'Annonces générales'
    },
    en: {
      title: {
        teacher: 'Teacher Profile',
        student: 'Student Profile',
        parent: 'Parent Profile'
      },
      subtitle: 'Manage your personal information and settings',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      save: 'Save',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      changePassword: 'Change Password',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      whatsappNotifications: 'WhatsApp Notifications',
      gradeUpdates: 'Grade Updates',
      attendanceAlerts: 'Attendance Alerts',
      generalAnnouncements: 'General Announcements'
    }
  };

  const t = text[language as keyof typeof text];

  const tabConfig = [
    { value: 'profile', label: t.profile, icon: User },
    { value: 'security', label: t.security, icon: Shield },
    { value: 'notifications', label: t.notifications, icon: Bell }
  ];

  const handleProfileSave = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été mis à jour avec succès.",
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationSave = () => {
    toast({
      title: "Notifications mises à jour",
      description: "Vos préférences de notification ont été sauvegardées.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {t.title[userType]}
        </h2>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Icon Navigation */}
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.profile}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      firstName: e.target.value 
                    })}
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      lastName: e.target.value 
                    })}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t.email}</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      email: e.target.value 
                    })}
                    className="pl-10"
                    data-testid="input-email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
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
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      phone: e.target.value 
                    })}
                    placeholder="XXX XXX XXX"
                    className="rounded-l-none"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">{t.gender}</Label>
                  <Select 
                    value={profileData.gender} 
                    onValueChange={(value) => setProfileData({ 
                      ...profileData, 
                      gender: value 
                    })}
                  >
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.male}</SelectItem>
                      <SelectItem value="female">{t.female}</SelectItem>
                      <SelectItem value="other">{t.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        dateOfBirth: e.target.value 
                      })}
                      className="pl-10"
                      data-testid="input-date-of-birth"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">{t.address}</Label>
                <div className="relative">
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      address: e.target.value 
                    })}
                    placeholder="Adresse complète"
                    className="pl-10"
                    data-testid="input-address"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button 
                onClick={handleProfileSave} 
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.security}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    currentPassword: e.target.value 
                  })}
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    newPassword: e.target.value 
                  })}
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    confirmPassword: e.target.value 
                  })}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button 
                onClick={handlePasswordChange} 
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-change-password"
              >
                <Shield className="w-4 h-4 mr-2" />
                {t.changePassword}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifs">{t.emailNotifications}</Label>
                <Switch
                  id="emailNotifs"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      emailNotifications: checked 
                    })
                  }
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifs">{t.smsNotifications}</Label>
                <Switch
                  id="smsNotifs"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      smsNotifications: checked 
                    })
                  }
                  data-testid="switch-sms-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsappNotifs">{t.whatsappNotifications}</Label>
                <Switch
                  id="whatsappNotifs"
                  checked={notificationSettings.whatsappNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      whatsappNotifications: checked 
                    })
                  }
                  data-testid="switch-whatsapp-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="gradeUpdates">{t.gradeUpdates}</Label>
                <Switch
                  id="gradeUpdates"
                  checked={notificationSettings.gradeUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      gradeUpdates: checked 
                    })
                  }
                  data-testid="switch-grade-updates"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="attendanceAlerts">{t.attendanceAlerts}</Label>
                <Switch
                  id="attendanceAlerts"
                  checked={notificationSettings.attendanceAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      attendanceAlerts: checked 
                    })
                  }
                  data-testid="switch-attendance-alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="generalAnnouncements">{t.generalAnnouncements}</Label>
                <Switch
                  id="generalAnnouncements"
                  checked={notificationSettings.generalAnnouncements}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      generalAnnouncements: checked 
                    })
                  }
                  data-testid="switch-general-announcements"
                />
              </div>
              <Button 
                onClick={handleNotificationSave} 
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-save-notifications"
              >
                <Bell className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedProfileManager;