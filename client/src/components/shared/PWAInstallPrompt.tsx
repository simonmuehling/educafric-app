import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si PWA est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA_INSTALL] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Attendre un peu avant d'afficher la bannière pour une meilleure UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // Écouter l'installation de l'app
    const handleAppInstalled = () => {
      console.log('[PWA_INSTALL] App was installed');
      setShowPrompt(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      console.log('[PWA_INSTALL] Showing install prompt');
      await deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA_INSTALL] User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA_INSTALL] User accepted the install prompt');
      } else {
        console.log('[PWA_INSTALL] User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA_INSTALL] Install prompt error:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[PWA_INSTALL] User dismissed install banner');
    setShowPrompt(false);
    
    // Réafficher la bannière dans 24h
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Ne pas afficher si déjà installé ou pas de prompt disponible
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  // Vérifier si l'utilisateur a récemment fermé la bannière
  const lastDismissed = localStorage.getItem('pwa-install-dismissed');
  if (lastDismissed) {
    const dismissedTime = parseInt(lastDismissed);
    const oneDayInMs = 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime < oneDayInMs) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl border-none">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src="/educafric-logo-128.png" 
                  alt="EducAfric" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Installer EducAfric
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Accédez rapidement à votre plateforme éducative depuis votre écran d'accueil
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 p-2 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Installer
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20"
            >
              Plus tard
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-3 text-blue-100 text-xs">
            <Smartphone className="w-3 h-3" />
            <span>Fonctionne comme une vraie application</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;