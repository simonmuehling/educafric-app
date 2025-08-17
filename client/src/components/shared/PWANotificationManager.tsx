import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Check, X, Settings, Smartphone } from 'lucide-react';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import notificationService from '@/services/notificationService';

interface PWANotificationManagerProps {
  userId?: number;
  userRole?: string;
  onNotificationPermissionChange?: (granted: boolean) => void;
}

const PWANotificationManager: React.FC<PWANotificationManagerProps> = ({
  userId,
  userRole,
  onNotificationPermissionChange
}) => {
  const { language } = useLanguage();
  const { permission, supported, requestPermission, showNotification } = useNotificationPermissions();
  const [isInitialized, setIsInitialized] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const text = {
    fr: {
      title: 'Notifications PWA',
      subtitle: 'Gérez vos notifications push',
      permissionGranted: 'Autorisées',
      permissionDenied: 'Bloquées',
      permissionDefault: 'En attente',
      enableNotifications: 'Activer les notifications',
      testNotification: 'Tester une notification',
      notSupported: 'Non supporté par ce navigateur',
      initialized: 'Service initialisé',
      notInitialized: 'Service non initialisé',
      testSent: 'Test envoyé avec succès',
      requestPermission: 'Demander l\'autorisation',
      settings: 'Paramètres',
      description: 'Recevez des notifications importantes même quand l\'application est fermée',
      benefits: [
        'Alertes de sécurité en temps réel',
        'Notifications de notes et présences',
        'Messages des enseignants et école',
        'Rappels de devoirs et événements'
      ]
    },
    en: {
      title: 'PWA Notifications',
      subtitle: 'Manage your push notifications',
      permissionGranted: 'Granted',
      permissionDenied: 'Denied',
      permissionDefault: 'Pending',
      enableNotifications: 'Enable notifications',
      testNotification: 'Test notification',
      notSupported: 'Not supported by this browser',
      initialized: 'Service initialized',
      notInitialized: 'Service not initialized',
      testSent: 'Test sent successfully',
      requestPermission: 'Request permission',
      settings: 'Settings',
      description: 'Receive important notifications even when the app is closed',
      benefits: [
        'Real-time security alerts',
        'Grade and attendance notifications',
        'Messages from teachers and school',
        'Homework and event reminders'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    const initializeService = async () => {
      const initialized = await notificationService.initialize();
      setIsInitialized(initialized);
    };
    
    initializeService();
  }, []);

  useEffect(() => {
    if (onNotificationPermissionChange) {
      onNotificationPermissionChange(permission === 'granted');
    }
  }, [permission, onNotificationPermissionChange]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    console.log('Permission result:', result);
  };

  const handleTestNotification = async () => {
    if (permission === 'granted') {
      const success = await showNotification('Test Educafric', {
        body: 'Cette notification teste le système PWA d\'Educafric',
        tag: 'test-notification',
        requireInteraction: false,
        data: { type: 'test', userId, timestamp: Date.now() }
      });
      
      if (success) {
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 3000);
      }
    }
  };

  const getPermissionColor = (perm: NotificationPermission) => {
    switch (perm) {
      case 'granted': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPermissionText = (perm: NotificationPermission) => {
    switch (perm) {
      case 'granted': return t.permissionGranted;
      case 'denied': return t.permissionDenied;
      default: return t.permissionDefault;
    }
  };

  if (!supported) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{t.notSupported}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{t.title}</CardTitle>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Statut:</span>
          </div>
          <Badge className={getPermissionColor(permission)}>
            {getPermissionText(permission)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Service:</span>
          </div>
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? t.initialized : t.notInitialized}
          </Badge>
        </div>

        {/* Description */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">{t.description}</p>
          <ul className="space-y-1">
            {t.benefits.map((benefit, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-center">
                <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {permission !== 'granted' && (
            <Button
              onClick={handleRequestPermission}
              className="w-full"
              data-testid="button-request-permission"
            >
              <Bell className="w-4 h-4 mr-2" />
              {t.requestPermission}
            </Button>
          )}

          {permission === 'granted' && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="w-full"
              disabled={testNotificationSent}
              data-testid="button-test-notification"
            >
              {testNotificationSent ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t.testSent}
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  {t.testNotification}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Permission denied help */}
        {permission === 'denied' && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              Les notifications sont bloquées. Cliquez sur l'icône de cadenas dans la barre d'adresse pour les autoriser.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PWANotificationManager;