import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, User, Bell, Shield, Globe,
  Save, Eye, EyeOff, Edit, Check,
  Phone, Mail, MapPin, Briefcase
} from 'lucide-react';

const FunctionalCommercialSettings: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    position: 'Commercial Representative',
    territory: 'Cameroun',
    bio: '',
    avatar: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    leadNotifications: true,
    dealNotifications: true,
    reportNotifications: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/commercial/profile'],
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/commercial/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/profile'] });
      setIsEditing(false);
      toast({
        title: 'Profil mis à jour',
        description: 'Votre profil a été mis à jour avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive'
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const text = {
    fr: {
      title: 'Paramètres',
      subtitle: 'Gérez vos préférences et paramètres de compte',
      loading: 'Chargement des paramètres...',
      tabs: {
        profile: 'Profil',
        notifications: 'Notifications',
        security: 'Sécurité',
        preferences: 'Préférences'
      },
      profile: {
        title: 'Informations Personnelles',
        subtitle: 'Gérez vos informations de profil commercial',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        position: 'Poste',
        territory: 'Territoire',
        bio: 'Biographie',
        avatar: 'Photo de profil'
      },
      notifications: {
        title: 'Notifications',
        subtitle: 'Configurez vos préférences de notification',
        email: 'Notifications par email',
        sms: 'Notifications SMS',
        push: 'Notifications push',
        leads: 'Nouveaux prospects',
        deals: 'Mises à jour des contrats',
        reports: 'Rapports hebdomadaires'
      },
      security: {
        title: 'Sécurité',
        subtitle: 'Gérez la sécurité de votre compte',
        twoFactor: 'Authentification à deux facteurs',
        loginAlerts: 'Alertes de connexion',
        sessionTimeout: 'Délai d\'expiration de session',
        changePassword: 'Changer le mot de passe'
      },
      actions: {
        save: 'Sauvegarder',
        edit: 'Modifier',
        cancel: 'Annuler',
        enable: 'Activer',
        disable: 'Désactiver'
      }
    },
    en: {
      title: 'Settings',
      subtitle: 'Manage your account preferences and settings',
      loading: 'Loading settings...',
      tabs: {
        profile: 'Profile',
        notifications: 'Notifications',
        security: 'Security',
        preferences: 'Preferences'
      },
      profile: {
        title: 'Personal Information',
        subtitle: 'Manage your commercial profile information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        position: 'Position',
        territory: 'Territory',
        bio: 'Biography',
        avatar: 'Profile Picture'
      },
      notifications: {
        title: 'Notifications',
        subtitle: 'Configure your notification preferences',
        email: 'Email notifications',
        sms: 'SMS notifications',
        push: 'Push notifications',
        leads: 'New leads',
        deals: 'Deal updates',
        reports: 'Weekly reports'
      },
      security: {
        title: 'Security',
        subtitle: 'Manage your account security',
        twoFactor: 'Two-factor authentication',
        loginAlerts: 'Login alerts',
        sessionTimeout: 'Session timeout',
        changePassword: 'Change password'
      },
      actions: {
        save: 'Save',
        edit: 'Edit',
        cancel: 'Cancel',
        enable: 'Enable',
        disable: 'Disable'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t?.profile?.title}</h3>
            <p className="text-gray-600">{t?.profile?.subtitle}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {t?.actions?.edit}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <Button variant="outline" size="sm">
                Changer la photo
              </Button>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG ou GIF. Max 5MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t?.profile?.firstName}</label>
              <input
                type="text"
                value={profileForm.firstName || ''}
                onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.profile?.lastName}</label>
              <input
                type="text"
                value={profileForm.lastName || ''}
                onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.profile?.email}</label>
              <input
                type="email"
                value={profileForm.email || ''}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.profile?.phone}</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                placeholder="+237 XXX XXX XXX"
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.profile?.position}</label>
              <input
                type="text"
                value={profileForm.position}
                onChange={(e) => setProfileForm(prev => ({ ...prev, position: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.profile?.territory}</label>
              <select
                value={profileForm.territory}
                onChange={(e) => setProfileForm(prev => ({ ...prev, territory: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="Cameroun">Cameroun</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Mali">Mali</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">{t?.profile?.bio}</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              rows={3}
              placeholder="Parlez-nous de votre expérience..."
              className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
            />
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending ? 'Sauvegarde...' : t?.actions?.save}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                {t?.actions?.cancel}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderNotificationsTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{t?.notifications?.title}</h3>
        <p className="text-gray-600">{t?.notifications?.subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: t?.notifications?.email, icon: Mail },
            { key: 'smsNotifications', label: t?.notifications?.sms, icon: Phone },
            { key: 'pushNotifications', label: t?.notifications?.push, icon: Bell },
            { key: 'leadNotifications', label: t?.notifications?.leads, icon: User },
            { key: 'dealNotifications', label: t?.notifications?.deals, icon: Briefcase },
            { key: 'reportNotifications', label: t?.notifications?.reports, icon: Settings }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <span>{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[key as keyof typeof notificationSettings]}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{t?.security?.title}</h3>
        <p className="text-gray-600">{t?.security?.subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">{t?.security?.twoFactor}</div>
                <div className="text-sm text-gray-500">
                  Ajoutez une couche de sécurité supplémentaire
                </div>
              </div>
            </div>
            <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
              {securitySettings.twoFactorEnabled ? 'Activé' : 'Désactivé'}
            </Badge>
          </div>

          {/* Login Alerts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">{t?.security?.loginAlerts}</div>
                <div className="text-sm text-gray-500">
                  Recevez des alertes pour les nouvelles connexions
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.loginAlerts}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  loginAlerts: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Session Timeout */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">{t?.security?.sessionTimeout}</div>
                <div className="text-sm text-gray-500">
                  Délai avant déconnexion automatique
                </div>
              </div>
            </div>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                sessionTimeout: parseInt(e.target.value)
              }))}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={120}>2 heures</option>
              <option value={480}>8 heures</option>
            </select>
          </div>

          {/* Change Password */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">{t?.security?.changePassword}</div>
                <div className="text-sm text-gray-500">
                  Modifiez votre mot de passe de connexion
                </div>
              </div>
            </div>
            <Button variant="outline">
              Changer le mot de passe
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: t?.tabs?.profile, icon: User },
            { id: 'notifications', label: t?.tabs?.notifications, icon: Bell },
            { id: 'security', label: t?.tabs?.security, icon: Shield },
            { id: 'preferences', label: t?.tabs?.preferences, icon: Globe }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Préférences</h3>
              <p className="text-gray-600">Configurez vos préférences générales</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Fonctionnalité en cours de développement
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FunctionalCommercialSettings;