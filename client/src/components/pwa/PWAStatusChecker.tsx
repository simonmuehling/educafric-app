import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle, Smartphone, Bell, Monitor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PWAStatusChecker: React.FC = () => {
  const { language } = useLanguage();
  const [pwaStatus, setPwaStatus] = useState({
    manifestLoaded: false,
    manifestValid: false,
    iconsAccessible: false,
    serviceWorkerRegistered: false,
    notificationPermission: 'default' as NotificationPermission,
    isStandalone: false,
    installable: false,
    manifestData: null as any
  });
  
  const [testResults, setTestResults] = useState<string[]>([]);

  const text = {
    fr: {
      title: 'Status PWA Educafric',
      subtitle: 'Vérification de la configuration PWA',
      runTests: 'Lancer les tests',
      manifest: 'Manifeste PWA',
      icons: 'Icônes accessibles',
      serviceWorker: 'Service Worker',
      notifications: 'Notifications',
      standalone: 'Mode standalone',
      installable: 'Installable',
      testIcon: 'Tester notification icône',
      results: 'Résultats des tests',
      working: 'Fonctionne',
      failed: 'Échoué',
      pending: 'En attente'
    },
    en: {
      title: 'Educafric PWA Status',
      subtitle: 'PWA configuration verification',
      runTests: 'Run tests',
      manifest: 'PWA Manifest',
      icons: 'Icons accessible',
      serviceWorker: 'Service Worker',
      notifications: 'Notifications',
      standalone: 'Standalone mode',
      installable: 'Installable',
      testIcon: 'Test notification icon',
      results: 'Test results',
      working: 'Working',
      failed: 'Failed',
      pending: 'Pending'
    }
  };

  const t = text[language as keyof typeof text];

  const runPWATests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Manifest loading
      results.push('🔍 Testing PWA manifest...');
      const manifestResponse = await fetch('/manifest.json');
      const manifestValid = manifestResponse.ok;
      let manifestData = null;
      
      if (manifestValid) {
        manifestData = await manifestResponse.json();
        results.push(`✅ Manifest loaded: ${manifestData.name}`);
      } else {
        results.push('❌ Manifest loading failed');
      }

      // Test 2: Icons accessibility
      results.push('🔍 Testing icon accessibility...');
      const iconTests = await Promise.all([
        fetch('/educafric-logo-128.png').then(r => ({ url: '/educafric-logo-128.png', ok: r.ok })),
        fetch('/educafric-logo-512.png').then(r => ({ url: '/educafric-logo-512.png', ok: r.ok })),
        fetch('/android-icon-192x192.png').then(r => ({ url: '/android-icon-192x192.png', ok: r.ok }))
      ]);
      
      const iconsAccessible = iconTests.every(test => test.ok);
      iconTests.forEach(test => {
        if (test.ok) {
          results.push(`✅ Icon accessible: ${test.url}`);
        } else {
          results.push(`❌ Icon failed: ${test.url}`);
        }
      });

      // Test 3: Service Worker
      results.push('🔍 Testing Service Worker...');
      const swRegistered = 'serviceWorker' in navigator;
      if (swRegistered) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            results.push('✅ Service Worker registered');
          } else {
            results.push('⚠️ Service Worker available but not registered (normal in dev)');
          }
        } catch (error) {
          results.push(`⚠️ Service Worker check failed: ${error}`);
        }
      } else {
        results.push('❌ Service Worker not supported');
      }

      // Test 4: Notifications
      results.push('🔍 Testing notification support...');
      const notificationSupport = 'Notification' in window;
      if (notificationSupport) {
        results.push(`✅ Notifications supported, permission: ${Notification.permission}`);
      } else {
        results.push('❌ Notifications not supported');
      }

      // Test 5: Standalone mode detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      results.push(`${isStandalone ? '✅' : 'ℹ️'} Standalone mode: ${isStandalone ? 'Active' : 'Not active'}`);

      // Test 6: PWA Install prompt
      results.push('🔍 Testing PWA installability...');
      const installable = localStorage.getItem('pwa-install-prompt-available') === 'true';
      results.push(`${installable ? '✅' : 'ℹ️'} Install prompt: ${installable ? 'Available' : 'Not triggered yet'}`);

      setPwaStatus({
        manifestLoaded: manifestValid,
        manifestValid,
        iconsAccessible,
        serviceWorkerRegistered: swRegistered,
        notificationPermission: Notification.permission,
        isStandalone,
        installable,
        manifestData
      });

      setTestResults(results);

    } catch (error) {
      results.push(`❌ Test error: ${error}`);
      setTestResults(results);
    }
  };

  const testNotificationIcon = async () => {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification('Test icône PWA Educafric', {
        body: 'Cette notification teste l\'affichage du logo Educafric',
        icon: '/educafric-logo-128.png',
        badge: '/android-icon-192x192.png',
        tag: 'icon-test'
      });

      setTimeout(() => notification.close(), 4000);
      
      setTestResults(prev => [...prev, '🔔 Test notification envoyée avec logo Educafric']);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge className={status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {status ? t.working : t.failed}
      </Badge>
    );
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runPWATests();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>{t.title}</CardTitle>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* PWA Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(pwaStatus.manifestLoaded)}
                <span className="text-sm font-medium">{t.manifest}</span>
              </div>
              {getStatusBadge(pwaStatus.manifestLoaded, t.manifest)}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(pwaStatus.iconsAccessible)}
                <span className="text-sm font-medium">{t.icons}</span>
              </div>
              {getStatusBadge(pwaStatus.iconsAccessible, t.icons)}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(pwaStatus.serviceWorkerRegistered)}
                <span className="text-sm font-medium">{t.serviceWorker}</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {pwaStatus.serviceWorkerRegistered ? 'Disponible' : 'Dev mode'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(pwaStatus.notificationPermission === 'granted')}
                <span className="text-sm font-medium">{t.notifications}</span>
              </div>
              <Badge className={
                pwaStatus.notificationPermission === 'granted' ? 'bg-green-100 text-green-800' :
                pwaStatus.notificationPermission === 'denied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {pwaStatus.notificationPermission}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(pwaStatus.isStandalone)}
                <span className="text-sm font-medium">{t.standalone}</span>
              </div>
              {getStatusBadge(pwaStatus.isStandalone, t.standalone)}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(pwaStatus.installable)}
                <span className="text-sm font-medium">{t.installable}</span>
              </div>
              {getStatusBadge(pwaStatus.installable, t.installable)}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={runPWATests} data-testid="button-run-pwa-tests">
              <Monitor className="w-4 h-4 mr-2" />
              {t.runTests}
            </Button>
            
            <Button onClick={testNotificationIcon} variant="outline" data-testid="button-test-notification-icon">
              <Bell className="w-4 h-4 mr-2" />
              {t.testIcon}
            </Button>
          </div>

          {/* Manifest data preview */}
          {pwaStatus.manifestData && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Manifeste PWA chargé:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Nom:</strong> {pwaStatus.manifestData.name}</p>
                <p><strong>Description:</strong> {pwaStatus.manifestData.description}</p>
                <p><strong>Icônes:</strong> {pwaStatus.manifestData.icons?.length || 0} configurées</p>
                <p><strong>Thème:</strong> {pwaStatus.manifestData.theme_color}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.results}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PWAStatusChecker;