import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Lock, Phone, Smartphone, CheckCircle, XCircle, Wifi, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';
import { useQuery } from '@tanstack/react-query';
import PWANotificationManager from '@/components/shared/PWANotificationManager';

const ParentSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [pwaConnectionStatus, setPwaConnectionStatus] = useState<any>(null);
  
  // Fetch PWA subscription info
  const { data: pwaSubscription, refetch: refetchPwaSubscription } = useQuery({
    queryKey: ['pwa-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch('/api/analytics/pwa/user-subscription');
      if (!response.ok) return null;
      const result = await response.json();
      return result.subscription;
    },
    enabled: !!user?.id
  });
  
  // Track PWA connection status
  useEffect(() => {
    const checkPWAStatus = () => {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      const isStandalone = (navigator as any)?.standalone === true;
      const isInstalled = isPWA || isStandalone;
      
      setPwaConnectionStatus({
        isInstalled,
        isPWA,
        isStandalone,
        supportsPush: 'Notification' in window,
        permission: 'Notification' in window ? Notification.permission : 'not-supported',
        connectionType: isInstalled ? 'PWA' : 'Web Browser'
      });
    };
    
    checkPWAStatus();
    
    // Listen for PWA installation events
    window.addEventListener('beforeinstallprompt', checkPWAStatus);
    window.addEventListener('appinstalled', checkPWAStatus);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkPWAStatus);
      window.removeEventListener('appinstalled', checkPWAStatus);
    };
  }, []);

  const text = {
    fr: {
      title: 'Paramètres Parent',
      subtitle: 'Gérez vos préférences et informations personnelles',
      profile: 'Profil',
      security: 'Sécurité',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      pwaTitle: 'Connexion PWA',
      pwaSubtitle: 'État de votre connexion Progressive Web App',
      connectionType: 'Type de connexion',
      pwaStatus: 'Statut PWA',
      installed: 'Installée',
      notInstalled: 'Non installée',
      webBrowser: 'Navigateur Web',
      pushNotifications: 'Notifications Push',
      subscriptionInfo: 'Informations d\'abonnement',
      subscribedSince: 'Abonné depuis',
      deviceInfo: 'Informations appareil',
      refreshStatus: 'Actualiser le statut',
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
      pwaTitle: 'PWA Connection',
      pwaSubtitle: 'Your Progressive Web App connection status',
      connectionType: 'Connection Type',
      pwaStatus: 'PWA Status',
      installed: 'Installed',
      notInstalled: 'Not Installed',
      webBrowser: 'Web Browser',
      pushNotifications: 'Push Notifications',
      subscriptionInfo: 'Subscription Info',
      subscribedSince: 'Subscribed since',
      deviceInfo: 'Device Information',
      refreshStatus: 'Refresh Status',
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
        {/* Unified Icon Navigation for All Devices */}
        <MobileIconTabNavigation
          tabs={tabConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

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
        <TabsContent value="notifications" className="space-y-6">
          {/* PWA Connection & Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                {t.pwaTitle}
              </CardTitle>
              <p className="text-sm text-gray-600">{t.pwaSubtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {pwaConnectionStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.connectionType}:</span>
                      <Badge variant={pwaConnectionStatus.isInstalled ? "default" : "secondary"}>
                        <Wifi className="w-3 h-3 mr-1" />
                        {pwaConnectionStatus.connectionType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.pwaStatus}:</span>
                      {pwaConnectionStatus.isInstalled ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.installed}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t.notInstalled}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.pushNotifications}:</span>
                      <Badge variant={pwaConnectionStatus.permission === 'granted' ? "default" : "secondary"}>
                        {pwaConnectionStatus.permission === 'granted' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {pwaConnectionStatus.permission === 'granted' ? 'Activées' : 
                         pwaConnectionStatus.permission === 'denied' ? 'Bloquées' : 'En attente'}
                      </Badge>
                    </div>
                  </div>
                  
                  {pwaSubscription && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">{t.subscriptionInfo}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.subscribedSince}:</span>
                          <span className="font-medium">
                            {new Date(pwaSubscription.subscribedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Endpoint:</span>
                          <span className="font-medium text-green-600">
                            {pwaSubscription.subscriptionEndpoint}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t pt-4">
                <PWANotificationManager 
                  userId={user?.id} 
                  userRole={user?.role}
                  onNotificationPermissionChange={() => {
                    refetchPwaSubscription();
                    // Refresh PWA status
                    setPwaConnectionStatus((prev: any) => ({ 
                      ...prev, 
                      permission: 'Notification' in window ? Notification.permission : 'not-supported'
                    }));
                  }}
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  refetchPwaSubscription();
                  toast({
                    title: "Statut actualisé",
                    description: "Les informations de connexion PWA ont été mises à jour."
                  });
                }}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.refreshStatus}
              </Button>
            </CardContent>
          </Card>
          
          {/* Traditional Notification Settings */}
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
        <TabsContent value="privacy" className="space-y-6">
          {/* Data Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Confidentialité des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Partage des données avec l'école</Label>
                  <p className="text-sm text-gray-600">Autoriser le partage des informations avec l'administration scolaire</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Géolocalisation de l'enfant</Label>
                  <p className="text-sm text-gray-600">Partager la position GPS avec les enseignants pour la sécurité</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Historique des connexions</Label>
                  <p className="text-sm text-gray-600">Conserver l'historique des connexions PWA et navigateur</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Communication Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                Confidentialité des Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Messages avec les enseignants</Label>
                  <p className="text-sm text-gray-600">Autoriser les enseignants à vous contacter directement</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Notifications push</Label>
                  <p className="text-sm text-gray-600">Recevoir des notifications push sur vos appareils</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Partage numéro WhatsApp</Label>
                  <p className="text-sm text-gray-600">Permettre à l'école d'utiliser WhatsApp pour les urgences</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Account Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Confidentialité du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visibilité du profil</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="visibility-full" name="visibility" value="full" defaultChecked />
                    <label htmlFor="visibility-full" className="text-sm">Visible par tous les membres de l'école</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="visibility-teachers" name="visibility" value="teachers" />
                    <label htmlFor="visibility-teachers" className="text-sm">Visible uniquement par les enseignants</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="visibility-admin" name="visibility" value="admin" />
                    <label htmlFor="visibility-admin" className="text-sm">Visible uniquement par l'administration</label>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium text-red-600">Suppression du compte</Label>
                    <p className="text-sm text-gray-600">Demander la suppression permanente de toutes vos données</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Demander la suppression
                  </Button>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                <Lock className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres de confidentialité
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentSettings;