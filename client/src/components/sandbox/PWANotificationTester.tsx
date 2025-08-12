import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Check, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import notificationService, { type InAppNotification } from '@/services/notificationService';

const PWANotificationTester: React.FC = () => {
  const { language } = useLanguage();
  const [testResults, setTestResults] = useState<{
    permission: NotificationPermission;
    browserSupport: boolean;
    serviceWorkerSupport: boolean;
    testSent: boolean;
    testError: string | null;
  }>({
    permission: Notification.permission,
    browserSupport: 'Notification' in window,
    serviceWorkerSupport: 'serviceWorker' in navigator,
    testSent: false,
    testError: null
  });

  const text = {
    fr: {
      title: 'Test des Notifications PWA',
      subtitle: 'Vérification et test du système de notifications',
      browserSupport: 'Support navigateur',
      serviceWorkerSupport: 'Support Service Worker',
      permission: 'Permission notifications',
      testNotification: 'Tester notification',
      requestPermission: 'Demander permission',
      testSent: 'Test envoyé',
      error: 'Erreur',
      supported: 'Supporté',
      notSupported: 'Non supporté',
      granted: 'Accordée',
      denied: 'Refusée',
      default: 'En attente'
    },
    en: {
      title: 'PWA Notifications Test',
      subtitle: 'Verification and testing of notification system',
      browserSupport: 'Browser support',
      serviceWorkerSupport: 'Service Worker support',
      permission: 'Notification permission',
      testNotification: 'Test notification',
      requestPermission: 'Request permission',
      testSent: 'Test sent',
      error: 'Error',
      supported: 'Supported',
      notSupported: 'Not supported',
      granted: 'Granted',
      denied: 'Denied',
      default: 'Pending'
    }
  };

  const t = text[language as keyof typeof text];

  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setTestResults(prev => ({ ...prev, permission, testError: null }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        testError: `Permission request failed: ${error}` 
      }));
    }
  };

  const handleTestNotification = async () => {
    try {
      setTestResults(prev => ({ ...prev, testError: null, testSent: false }));
      
      // Method 1: Direct browser notification
      if (testResults.permission === 'granted') {
        const notification = new Notification('Test Educafric PWA', {
          body: 'Cette notification teste le système PWA en mode développement',
          icon: '/educafric-logo-128.png',
          badge: '/educafric-logo-128.png',
          tag: 'test-pwa-dev',
          requireInteraction: false,
          timestamp: Date.now(),
          data: { type: 'test', environment: 'development' }
        });

        notification.onclick = () => {
          console.log('[PWA TEST] Notification clicked');
          notification.close();
        };

        notification.onclose = () => {
          console.log('[PWA TEST] Notification closed');
        };

        setTimeout(() => notification.close(), 5000);
      }

      // Method 2: Using notification service
      await notificationService.createInAppNotification({
        title: 'Test PWA Notification Service',
        message: 'Ce test vérifie le service de notifications intégré',
        type: 'system',
        priority: 'medium',
        category: 'administrative',
        actionRequired: false,
        senderRole: 'System'
      });

      setTestResults(prev => ({ ...prev, testSent: true }));
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, testSent: false }));
      }, 3000);

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        testError: `Test failed: ${error}` 
      }));
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />;
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
      case 'granted': return t.granted;
      case 'denied': return t.denied;
      default: return t.default;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
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
        {/* Status checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">{t.browserSupport}</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.browserSupport)}
              <span className="text-xs">
                {testResults.browserSupport ? t.supported : t.notSupported}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">{t.serviceWorkerSupport}</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.serviceWorkerSupport)}
              <span className="text-xs">
                {testResults.serviceWorkerSupport ? t.supported : t.notSupported}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">{t.permission}</span>
            <Badge className={getPermissionColor(testResults.permission)}>
              {getPermissionText(testResults.permission)}
            </Badge>
          </div>
        </div>

        {/* Error display */}
        {testResults.testError && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{testResults.testError}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {testResults.permission !== 'granted' && (
            <Button
              onClick={handleRequestPermission}
              className="flex-1"
              data-testid="button-request-permission"
            >
              <Bell className="w-4 h-4 mr-2" />
              {t.requestPermission}
            </Button>
          )}

          <Button
            onClick={handleTestNotification}
            variant={testResults.permission === 'granted' ? 'default' : 'outline'}
            className="flex-1"
            disabled={testResults.testSent}
            data-testid="button-test-pwa-notification"
          >
            {testResults.testSent ? (
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
        </div>

        {/* Development mode info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Mode Développement</h4>
          <p className="text-sm text-blue-700">
            En mode développement, les notifications PWA utilisent l'API native du navigateur. 
            En production, elles utiliseraient le Service Worker pour une meilleure persistance.
          </p>
        </div>

        {/* Real-time notifications info */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Notifications Temps Réel</h4>
          <p className="text-sm text-green-700">
            Le système génère automatiquement des notifications de géolocalisation. 
            Consultez les logs du serveur pour voir les notifications PWA préparées.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWANotificationTester;