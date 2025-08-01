import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Shield, Database, Server, Globe,
  Bell, Mail, Phone, Users, DollarSign,
  Save, Edit, AlertTriangle, CheckCircle,
  Key, Lock, Eye, EyeOff, Refresh
} from 'lucide-react';

const FunctionalSiteAdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);

  // Platform settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'EDUCAFRIC',
    supportEmail: 'admin@educafric.com',
    supportPhone: '+237 600 000 000',
    maxSchoolsPerCommercial: 50,
    defaultTrialDays: 30,
    maintenanceMode: false,
    registrationOpen: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 8, // hours
    passwordMinLength: 8,
    requireTwoFactor: false,
    maxLoginAttempts: 5,
    blockDuration: 30, // minutes
    encryptionLevel: 'AES-256'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    systemAlerts: true,
    securityAlerts: true,
    performanceAlerts: true,
    billingAlerts: true,
    userRegistrationAlerts: true,
    errorThreshold: 100
  });

  const [billingSettings, setBillingSettings] = useState({
    currency: 'XAF',
    taxRate: 19.25, // TVA Cameroun
    invoicePrefix: 'EDU',
    paymentTerms: 30,
    lateFeePenalty: 5,
    automaticSuspension: true
  });

  // Fetch system settings
  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['/api/site-admin/settings'],
    enabled: !!user
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await fetch('/api/site-admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-admin/settings'] });
      setIsEditing(false);
      toast({
        title: 'Paramètres mis à jour',
        description: 'Les paramètres ont été sauvegardés avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les paramètres.',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Paramètres Système',
      subtitle: 'Configuration globale de la plateforme Educafric',
      loading: 'Chargement des paramètres...',
      tabs: {
        general: 'Général',
        security: 'Sécurité',
        notifications: 'Notifications',
        billing: 'Facturation',
        system: 'Système',
        backup: 'Sauvegarde'
      },
      general: {
        title: 'Paramètres Généraux',
        platformName: 'Nom de la plateforme',
        supportEmail: 'Email de support',
        supportPhone: 'Téléphone de support',
        maxSchools: 'Max écoles par commercial',
        trialDays: 'Jours d\'essai gratuit',
        maintenanceMode: 'Mode maintenance',
        registrationOpen: 'Inscriptions ouvertes'
      },
      security: {
        title: 'Paramètres de Sécurité',
        sessionTimeout: 'Délai de session (heures)',
        passwordLength: 'Longueur minimale mot de passe',
        twoFactor: 'Authentification 2FA obligatoire',
        maxAttempts: 'Tentatives de connexion max',
        blockDuration: 'Durée de blocage (minutes)',
        encryption: 'Niveau de chiffrement'
      },
      notifications: {
        title: 'Paramètres de Notification',
        systemAlerts: 'Alertes système',
        securityAlerts: 'Alertes de sécurité',
        performanceAlerts: 'Alertes de performance',
        billingAlerts: 'Alertes de facturation',
        registrationAlerts: 'Alertes d\'inscription',
        errorThreshold: 'Seuil d\'erreurs'
      },
      billing: {
        title: 'Paramètres de Facturation',
        currency: 'Devise',
        taxRate: 'Taux de taxe (%)',
        invoicePrefix: 'Préfixe facture',
        paymentTerms: 'Délai de paiement (jours)',
        lateFee: 'Pénalité de retard (%)',
        autoSuspension: 'Suspension automatique'
      },
      actions: {
        save: 'Sauvegarder',
        edit: 'Modifier',
        cancel: 'Annuler',
        reset: 'Réinitialiser',
        test: 'Tester',
        backup: 'Sauvegarder'
      }
    },
    en: {
      title: 'System Settings',
      subtitle: 'Global Educafric platform configuration',
      loading: 'Loading settings...',
      tabs: {
        general: 'General',
        security: 'Security',
        notifications: 'Notifications',
        billing: 'Billing',
        system: 'System',
        backup: 'Backup'
      },
      general: {
        title: 'General Settings',
        platformName: 'Platform name',
        supportEmail: 'Support email',
        supportPhone: 'Support phone',
        maxSchools: 'Max schools per commercial',
        trialDays: 'Free trial days',
        maintenanceMode: 'Maintenance mode',
        registrationOpen: 'Registration open'
      },
      security: {
        title: 'Security Settings',
        sessionTimeout: 'Session timeout (hours)',
        passwordLength: 'Minimum password length',
        twoFactor: 'Require 2FA authentication',
        maxAttempts: 'Max login attempts',
        blockDuration: 'Block duration (minutes)',
        encryption: 'Encryption level'
      },
      notifications: {
        title: 'Notification Settings',
        systemAlerts: 'System alerts',
        securityAlerts: 'Security alerts',
        performanceAlerts: 'Performance alerts',
        billingAlerts: 'Billing alerts',
        registrationAlerts: 'Registration alerts',
        errorThreshold: 'Error threshold'
      },
      billing: {
        title: 'Billing Settings',
        currency: 'Currency',
        taxRate: 'Tax rate (%)',
        invoicePrefix: 'Invoice prefix',
        paymentTerms: 'Payment terms (days)',
        lateFee: 'Late fee penalty (%)',
        autoSuspension: 'Automatic suspension'
      },
      actions: {
        save: 'Save',
        edit: 'Edit',
        cancel: 'Cancel',
        reset: 'Reset',
        test: 'Test',
        backup: 'Backup'
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

  const handleSaveSettings = () => {
    const allSettings = {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings,
      billing: billingSettings
    };
    updateSettingsMutation.mutate(allSettings);
  };

  const renderGeneralTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t?.general?.title}</h3>
            <p className="text-gray-600">Configuration de base de la plateforme</p>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t?.general?.platformName}</label>
              <input
                type="text"
                value={generalSettings.platformName}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, platformName: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.general?.supportEmail}</label>
              <input
                type="email"
                value={generalSettings.supportEmail}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.general?.supportPhone}</label>
              <input
                type="tel"
                value={generalSettings.supportPhone}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.general?.maxSchools}</label>
              <input
                type="number"
                value={generalSettings.maxSchoolsPerCommercial}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxSchoolsPerCommercial: parseInt(e.target.value) }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.general?.trialDays}</label>
              <input
                type="number"
                value={generalSettings.defaultTrialDays}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultTrialDays: parseInt(e.target.value) }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">{t?.general?.maintenanceMode}</div>
                  <div className="text-sm text-gray-500">
                    Désactive l'accès utilisateur temporairement
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={generalSettings.maintenanceMode}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">{t?.general?.registrationOpen}</div>
                  <div className="text-sm text-gray-500">
                    Permet aux nouvelles écoles de s'inscrire
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={generalSettings.registrationOpen}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, registrationOpen: e.target.checked }))}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{t?.security?.title}</h3>
        <p className="text-gray-600">Configuration de la sécurité système</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t?.security?.sessionTimeout}</label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                disabled={!isEditing}
                min="1"
                max="24"
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.security?.passwordLength}</label>
              <input
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                disabled={!isEditing}
                min="6"
                max="20"
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.security?.maxAttempts}</label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                disabled={!isEditing}
                min="3"
                max="10"
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.security?.blockDuration}</label>
              <input
                type="number"
                value={securitySettings.blockDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, blockDuration: parseInt(e.target.value) }))}
                disabled={!isEditing}
                min="5"
                max="1440"
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t?.security?.encryption}</label>
              <select
                value={securitySettings.encryptionLevel}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, encryptionLevel: e.target.value }))}
                disabled={!isEditing}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="AES-128">AES-128</option>
                <option value="AES-256">AES-256</option>
                <option value="AES-512">AES-512</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">{t?.security?.twoFactor}</div>
                <div className="text-sm text-gray-500">
                  Exige l'authentification à deux facteurs pour tous les utilisateurs
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.requireTwoFactor}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: e.target.checked }))}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Sauvegarde...' : t?.actions?.save}
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

      {/* System Status */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">État du Système</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Base de données', status: 'healthy', icon: Database },
              { name: 'Serveur API', status: 'healthy', icon: Server },
              { name: 'Services externes', status: 'warning', icon: Globe },
              { name: 'Sécurité', status: 'healthy', icon: Shield }
            ].map((service, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <service.icon className={`w-5 h-5 ${
                  service.status === 'healthy' ? 'text-green-500' : 
                  service.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <div>
                  <div className="font-medium">{service.name || ''}</div>
                  <Badge className={
                    service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    service.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {service.status === 'healthy' ? 'Opérationnel' :
                     service.status === 'warning' ? 'Attention' : 'Erreur'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: t?.tabs?.general, icon: Settings },
            { id: 'security', label: t?.tabs?.security, icon: Shield },
            { id: 'notifications', label: t?.tabs?.notifications, icon: Bell },
            { id: 'billing', label: t?.tabs?.billing, icon: DollarSign }
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
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t?.notifications?.title}</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Configuration des notifications système
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'billing' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t?.billing?.title}</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Configuration de la facturation
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FunctionalSiteAdminSettings;