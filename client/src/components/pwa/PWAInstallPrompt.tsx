import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Monitor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const text = {
    fr: {
      title: 'Installer Educafric',
      subtitle: 'Accès rapide depuis votre écran d\'accueil',
      install: 'Installer l\'app',
      benefits: 'Avantages de l\'installation :',
      benefit1: '• Accès rapide depuis l\'écran d\'accueil',
      benefit2: '• Notifications push en temps réel',
      benefit3: '• Fonctionne hors ligne',
      benefit4: '• Expérience app native',
      installed: 'Application installée',
      installedDesc: 'Educafric est installé sur cet appareil'
    },
    en: {
      title: 'Install Educafric',
      subtitle: 'Quick access from your home screen',
      install: 'Install app',
      benefits: 'Installation benefits:',
      benefit1: '• Quick access from home screen',
      benefit2: '• Real-time push notifications',
      benefit3: '• Works offline',
      benefit4: '• Native app experience',
      installed: 'App installed',
      installedDesc: 'Educafric is installed on this device'
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA_INSTALL] 🎯 Bannière d\'installation automatique détectée');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Délai pour une meilleure UX
      setTimeout(() => {
        setShowInstallPrompt(true);
        console.log('[PWA_INSTALL] 📱 Affichage de la bannière d\'installation');
      }, 2000);
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      console.log('[PWA_INSTALL] 🚀 Démarrage installation automatique EducAfric...');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`[PWA_INSTALL] Choix utilisateur: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('[PWA_INSTALL] ✅ Installation acceptée - EducAfric sera ajouté à l\'écran d\'accueil !');
      } else {
        console.log('[PWA_INSTALL] ❌ Installation refusée par l\'utilisateur');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('[PWA_INSTALL] Erreur installation:', error);
    }
  };

  // Don't show if already installed or no prompt available
  if (isInstalled) {
    return (
      <Card className="max-w-md mx-auto bg-green-50 border-green-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-800">{t.installed}</CardTitle>
              <p className="text-sm text-green-600">{t.installedDesc}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <img 
              src="/educafric-logo-128.png" 
              alt="Educafric" 
              className="w-8 h-8 rounded"
              onError={(e) => {
                // Fallback if logo doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-8 h-8 bg-white rounded text-blue-600 flex items-center justify-center font-bold text-sm">E</div>';
                }
              }}
            />
          </div>
          <div>
            <CardTitle>{t.title}</CardTitle>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-2">{t.benefits}</p>
          <div className="space-y-1">
            <p>{t.benefit1}</p>
            <p>{t.benefit2}</p>
            <p>{t.benefit3}</p>
            <p>{t.benefit4}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleInstallClick}
          className="w-full"
          data-testid="button-install-pwa"
        >
          <Download className="w-4 h-4 mr-2" />
          {t.install}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;