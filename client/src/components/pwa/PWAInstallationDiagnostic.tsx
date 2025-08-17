import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Smartphone, 
  Download, 
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import PWALogoPreview from './PWALogoPreview';

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallationDiagnostic: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState({
    serviceWorkerSupported: false,
    serviceWorkerRegistered: false,
    manifestAccessible: false,
    manifestValid: false,
    iconsAccessible: false,
    isHTTPS: false,
    isPWAInstalled: false,
    beforeInstallPromptFired: false,
    notificationsPermission: 'default' as NotificationPermission,
    userAgent: '',
    installPromptAvailable: false
  });
  const [isRunning, setIsRunning] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallEvent | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const text = {
    fr: {
      title: 'Diagnostic PWA EDUCAFRIC',
      subtitle: 'Résolution des problèmes d\'installation',
      runDiagnostic: 'Lancer le diagnostic',
      installNow: 'Installer maintenant',
      forceInstall: 'Forcer l\'installation',
      clearCache: 'Vider le cache PWA',
      requirements: 'Exigences PWA',
      status: 'État',
      solution: 'Solution',
      working: 'Fonctionne',
      failed: 'Échec',
      na: 'N/A',
      results: 'Résultats du diagnostic',
      installationSteps: 'Étapes d\'installation manuelle',
      browserSpecific: 'Instructions spécifiques au navigateur'
    },
    en: {
      title: 'EDUCAFRIC PWA Diagnostic',
      subtitle: 'Installation troubleshooting',
      runDiagnostic: 'Run diagnostic',
      installNow: 'Install now',
      forceInstall: 'Force install',
      clearCache: 'Clear PWA cache',
      requirements: 'PWA Requirements',
      status: 'Status',
      solution: 'Solution',
      working: 'Working',
      failed: 'Failed',
      na: 'N/A',
      results: 'Diagnostic Results',
      installationSteps: 'Manual installation steps',
      browserSpecific: 'Browser-specific instructions'
    }
  };

  const t = text[language as keyof typeof text];

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallEvent);
      setDiagnostics(prev => ({ ...prev, beforeInstallPromptFired: true, installPromptAvailable: true }));
      addResult('✅ Install prompt event captured');
    };

    const handleAppInstalled = () => {
      setDiagnostics(prev => ({ ...prev, isPWAInstalled: true }));
      addResult('🎉 PWA installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setTestResults([]);
    addResult('🔍 Démarrage du diagnostic PWA...');

    const results = { ...diagnostics };

    // Test 1: Service Worker Support
    addResult('Test 1: Support Service Worker');
    results.serviceWorkerSupported = 'serviceWorker' in navigator;
    addResult(results.serviceWorkerSupported ? '✅ Service Worker supporté' : '❌ Service Worker non supporté');

    // Test 2: Service Worker Registration
    if (results.serviceWorkerSupported) {
      addResult('Test 2: Enregistrement Service Worker');
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        results.serviceWorkerRegistered = !!registration;
        addResult(results.serviceWorkerRegistered ? '✅ Service Worker enregistré' : '⚠️ Service Worker non enregistré');
        
        if (!results.serviceWorkerRegistered) {
          // Try to register it
          try {
            await navigator.serviceWorker.register('/sw.js');
            results.serviceWorkerRegistered = true;
            addResult('✅ Service Worker enregistré avec succès');
          } catch (error) {
            addResult(`❌ Échec enregistrement SW: ${error}`);
          }
        }
      } catch (error) {
        addResult(`❌ Erreur lors du test SW: ${error}`);
      }
    }

    // Test 3: HTTPS
    addResult('Test 3: Connexion sécurisée HTTPS');
    results.isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    addResult(results.isHTTPS ? '✅ HTTPS ou localhost' : '❌ HTTPS requis pour PWA');

    // Test 4: Manifest
    addResult('Test 4: Manifeste PWA');
    try {
      const manifestResponse = await fetch('/manifest.json');
      results.manifestAccessible = manifestResponse.ok;
      
      if (results.manifestAccessible) {
        const manifest = await manifestResponse.json();
        results.manifestValid = !!(manifest.name && manifest.icons && manifest.start_url);
        addResult(results.manifestValid ? '✅ Manifeste valide' : '❌ Manifeste invalide');
        addResult(`📄 Nom app: ${manifest.name}, Icônes: ${manifest.icons?.length || 0}`);
      } else {
        addResult('❌ Manifeste inaccessible');
      }
    } catch (error) {
      addResult(`❌ Erreur manifeste: ${error}`);
    }

    // Test 5: Icons
    addResult('Test 5: Icônes PWA');
    try {
      const iconTests = await Promise.allSettled([
        fetch('/educafric-logo-128.png'),
        fetch('/android-chrome-192x192.png'),
        fetch('/android-chrome-512x512.png')
      ]);
      
      const accessibleIcons = iconTests.filter(result => 
        result.status === 'fulfilled' && result.value.ok
      ).length;
      
      results.iconsAccessible = accessibleIcons >= 2;
      addResult(`${results.iconsAccessible ? '✅' : '❌'} Icônes accessibles: ${accessibleIcons}/3`);
    } catch (error) {
      addResult(`❌ Erreur test icônes: ${error}`);
    }

    // Test 6: PWA Already Installed
    addResult('Test 6: Installation PWA existante');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isWebkit = (navigator as any).standalone;
    results.isPWAInstalled = isStandalone || isWebkit;
    addResult(results.isPWAInstalled ? '✅ PWA déjà installée' : 'ℹ️ PWA non installée');

    // Test 7: Notifications
    addResult('Test 7: Support notifications');
    if ('Notification' in window) {
      results.notificationsPermission = Notification.permission;
      addResult(`✅ Notifications supportées, permission: ${results.notificationsPermission}`);
    } else {
      addResult('❌ Notifications non supportées');
    }

    // Test 8: User Agent
    results.userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(results.userAgent);
    addResult(`📱 Navigateur: ${isMobile ? 'Mobile' : 'Desktop'}`);

    // Test 9: Install prompt availability
    addResult('Test 9: Prompt d\'installation');
    addResult(results.installPromptAvailable ? '✅ Prompt disponible' : 'ℹ️ Prompt pas encore déclenché');

    setDiagnostics(results);
    setIsRunning(false);
    addResult('✅ Diagnostic terminé');

    // Show recommendation
    setTimeout(() => {
      const canInstall = results.serviceWorkerSupported && results.manifestAccessible && results.isHTTPS;
      
      toast({
        title: 'Diagnostic terminé',
        description: canInstall ? 
          'PWA peut être installée' : 
          'Problèmes détectés - voir les résultats',
        variant: canInstall ? 'default' : 'destructive'
      });
    }, 1000);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          addResult('🎉 Installation acceptée par l\'utilisateur');
          setTimeout(() => {
            const successMsg = language === 'fr' ?
              'Installation réussie ! Cherchez l\'icône EDUCAFRIC sur votre écran d\'accueil.' :
              'Installation successful! Look for the EDUCAFRIC icon on your home screen.';
            alert(successMsg);
          }, 2000);
        } else {
          addResult('❌ Installation refusée par l\'utilisateur');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        addResult(`❌ Erreur installation: ${error}`);
      }
    } else {
      // Manual installation instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('chrome')) {
        instructions = language === 'fr' ?
          'Chrome: Menu (⋮) → "Installer EDUCAFRIC"' :
          'Chrome: Menu (⋮) → "Install EDUCAFRIC"';
      } else if (userAgent.includes('safari')) {
        instructions = language === 'fr' ?
          'Safari: Partage (⬆️) → "Sur l\'écran d\'accueil"' :
          'Safari: Share (⬆️) → "Add to Home Screen"';
      } else {
        instructions = language === 'fr' ?
          'Cherchez "Installer" ou "Ajouter" dans le menu de votre navigateur' :
          'Look for "Install" or "Add" in your browser menu';
      }
      
      alert(instructions);
      addResult(`📱 Instructions manuelles: ${instructions}`);
    }
  };

  const clearPWACache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        addResult('✅ Cache PWA vidé');
      }
      
      localStorage.removeItem('pwa-frontpage-dismissed');
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-installed');
      
      addResult('✅ Données PWA locales supprimées');
      
      toast({
        title: 'Cache vidé',
        description: 'Rechargez la page pour tester à nouveau',
      });
    } catch (error) {
      addResult(`❌ Erreur vidage cache: ${error}`);
    }
  };

  const diagnosticItems = [
    {
      label: 'Service Worker Support',
      status: diagnostics.serviceWorkerSupported,
      solution: 'Utilisez un navigateur moderne (Chrome, Firefox, Safari, Edge)'
    },
    {
      label: 'Service Worker Registered',
      status: diagnostics.serviceWorkerRegistered,
      solution: 'Le service worker sera enregistré automatiquement'
    },
    {
      label: 'HTTPS/Localhost',
      status: diagnostics.isHTTPS,
      solution: 'PWA nécessite HTTPS en production'
    },
    {
      label: 'Manifest Accessible',
      status: diagnostics.manifestAccessible,
      solution: 'Vérifiez que /manifest.json existe'
    },
    {
      label: 'Manifest Valid',
      status: diagnostics.manifestValid,
      solution: 'Le manifeste doit contenir name, icons, start_url'
    },
    {
      label: 'Icons Accessible',
      status: diagnostics.iconsAccessible,
      solution: 'Vérifiez que les icônes PWA sont accessibles'
    }
  ];

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <RefreshCw className="w-4 h-4 text-gray-400" />;
    return status ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="outline">{t.na}</Badge>;
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? t.working : t.failed}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Logo Preview Section */}
      <PWALogoPreview />
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>{t.title}</CardTitle>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-run-diagnostic"
            >
              <Settings className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {t.runDiagnostic}
            </Button>
            
            {(deferredPrompt || !diagnostics.isPWAInstalled) && (
              <Button 
                onClick={handleInstallPWA} 
                variant="outline"
                className="border-green-500 text-green-700 hover:bg-green-50"
                data-testid="button-install-pwa-now"
              >
                <Download className="w-4 h-4 mr-2" />
                {deferredPrompt ? t.installNow : t.forceInstall}
              </Button>
            )}
            
            <Button 
              onClick={clearPWACache} 
              variant="outline"
              data-testid="button-clear-cache"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.clearCache}
            </Button>
          </div>

          {/* Diagnostic Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">{t.requirements}</h4>
              <div className="space-y-3">
                {diagnosticItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-4">État de l'installation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">PWA Installée</span>
                  {diagnostics.isPWAInstalled ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Installée
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <XCircle className="w-3 h-3 mr-1" />
                      Non installée
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prompt disponible</span>
                  {diagnostics.installPromptAvailable ? (
                    <Badge className="bg-blue-100 text-blue-800">Disponible</Badge>
                  ) : (
                    <Badge variant="outline">En attente</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications</span>
                  <Badge variant={
                    diagnostics.notificationsPermission === 'granted' ? 'default' :
                    diagnostics.notificationsPermission === 'denied' ? 'destructive' : 'outline'
                  }>
                    {diagnostics.notificationsPermission}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Test Results Console */}
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

          {/* Browser-specific Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">{t.browserSpecific}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Chrome/Edge Android:</strong>
                  <p>Menu (⋮) → "Installer EDUCAFRIC"</p>
                </div>
                <div>
                  <strong>Safari iOS:</strong>
                  <p>Partage (⬆️) → "Sur l'écran d'accueil"</p>
                </div>
                <div>
                  <strong>Firefox Android:</strong>
                  <p>Menu → "Installer" (icône +)</p>
                </div>
                <div>
                  <strong>Samsung Internet:</strong>
                  <p>Menu → "Ajouter page à" → "Écran d'accueil"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallationDiagnostic;