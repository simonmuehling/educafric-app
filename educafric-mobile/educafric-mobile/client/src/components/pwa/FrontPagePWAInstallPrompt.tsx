import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const FrontPagePWAInstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const [popupLanguage, setPopupLanguage] = useState<'fr' | 'en'>(language as 'fr' | 'en');
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const text = {
    fr: {
      title: '📱 Installez EDUCAFRIC',
      subtitle: 'Accès rapide depuis votre écran d\'accueil',
      installButton: 'Installer automatiquement',
      installing: 'Installation en cours...',
      close: 'Fermer',
      later: 'Plus tard'
    },
    en: {
      title: '📱 Install EDUCAFRIC',
      subtitle: 'Quick access from your home screen',
      installButton: 'Install automatically',
      installing: 'Installing...',
      close: 'Close',
      later: 'Later'
    }
  };

  const t = text[popupLanguage as keyof typeof text];

  const toggleLanguage = () => {
    setPopupLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  // Check if PWA is already installed
  useEffect(() => {
    const checkInstallation = () => {
      try {
        const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
        const isWebkit = (navigator as any).standalone;
        const isAndroid = document.referrer && document.referrer.includes('android-app://');
        
        if (isStandalone || isWebkit || isAndroid) {
          setIsInstalled(true);
          return;
        }
      } catch (e) {
        console.log('[PWA] Installation check failed on older browser');
      }

      try {
        const dismissed = localStorage.getItem('pwa-frontpage-dismissed');
        if (dismissed) {
          const dismissedTime = parseInt(dismissed);
          const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
          if (dismissedTime > twoHoursAgo) {
            return;
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }

      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    checkInstallation();
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
        setDeferredPrompt(e as PWAInstallEvent);
        console.log('[PWA] Installation prompt captured');
      } catch (error) {
        setDeferredPrompt(e as PWAInstallEvent);
      }
    };

    const handleAppInstalled = () => {
      try {
        setIsInstalled(true);
        setIsVisible(false);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-installed', 'true');
      } catch (error) {
        setIsInstalled(true);
        setIsVisible(false);
      }
    };

    try {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    } catch (error) {
      console.log('[PWA] Event listeners not supported on this device');
    }

    return () => {
      try {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    
    // L'installation automatique DEVRAIT fonctionner dans 95% des cas
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] ✅ Installation automatique réussie');
          localStorage.setItem('pwa-installation-accepted', 'true');
          
          const successMessage = popupLanguage === 'fr' ? 
            '🎉 EDUCAFRIC installé automatiquement!\n\nL\'icône est maintenant sur votre écran d\'accueil.' :
            '🎉 EDUCAFRIC installed automatically!\n\nThe icon is now on your home screen.';
          
          setTimeout(() => {
            alert(successMessage);
          }, 300);
          
          setIsVisible(false);
          setDeferredPrompt(null);
          setIsInstalling(false);
          return;
        } else {
          // L'utilisateur a consciemment refusé
          console.log('[PWA] Utilisateur a refusé l\'installation');
          const refusedMessage = popupLanguage === 'fr' ? 
            'Installation annulée. Vous pouvez toujours installer EDUCAFRIC plus tard via le menu de votre navigateur.' :
            'Installation cancelled. You can still install EDUCAFRIC later via your browser menu.';
          
          alert(refusedMessage);
          setIsVisible(false);
          setIsInstalling(false);
          return;
        }
        
      } catch (error) {
        console.error('[PWA] Erreur inattendue lors de l\'installation automatique:', error);
        // Fallback uniquement en cas d'erreur vraiment inattendue
        showRareFallbackInstructions();
      }
    } else {
      // Pas de deferredPrompt - cas très rare sur les navigateurs modernes
      console.log('[PWA] Pas de deferredPrompt disponible - navigateur ancien ou contexte inhabituel');
      showRareFallbackInstructions();
    }
  };
  
  const showRareFallbackInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsVisible(false);
    setIsInstalling(false);
    
    // Messages optimistes - l'installation automatique devrait normalement fonctionner
    if (userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('android')) {
      const message = popupLanguage === 'fr' ? 
        '🔧 Installation manuelle EDUCAFRIC\n\nVotre navigateur devrait avoir un bouton "Installer" dans la barre d\'adresse.\n\nCliquez dessus et l\'installation se fera automatiquement!' :
        '🔧 Manual EDUCAFRIC Installation\n\nYour browser should have an "Install" button in the address bar.\n\nClick it and installation will happen automatically!';
      
      alert(message);
      
    } else if (userAgent.includes('safari') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
      const message = popupLanguage === 'fr' ? 
        '📱 Installation manuelle Safari\n\n1. Bouton Partager (⬆️) en bas\n2. "Sur l\'écran d\'accueil"\n3. "Ajouter"\n\nC\'est tout - l\'installation sera automatique!' :
        '📱 Manual Safari Installation\n\n1. Share button (⬆️) at bottom\n2. "Add to Home Screen"\n3. "Add"\n\nThat\'s it - installation will be automatic!';
      
      alert(message);
      
    } else {
      const genericMessage = popupLanguage === 'fr' ? 
        '🛠️ Installation manuelle\n\nCherchez "Installer" ou "+" dans votre navigateur.\n\nL\'installation sera automatique une fois le bouton trouvé!' :
        '🛠️ Manual Installation\n\nLook for "Install" or "+" in your browser.\n\nInstallation will be automatic once you find the button!';
      
      alert(genericMessage);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-frontpage-dismissed', Date.now().toString());
  };

  const handleLater = () => {
    setIsVisible(false);
    try {
      const oneHourLater = Date.now() - (23 * 60 * 60 * 1000);
      localStorage.setItem('pwa-frontpage-dismissed', oneHourLater.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  // Don't show if already installed
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleClose}
        data-testid="pwa-install-backdrop"
      >
        <div 
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm mx-auto shadow-lg transform transition-transform duration-200 animate-in slide-in-from-bottom-4"
          onClick={(e) => e.stopPropagation()}
          data-testid="pwa-install-popup"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl sm:rounded-t-2xl">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              data-testid="button-close-pwa"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center pr-8">
              <h3 className="text-lg font-bold mb-1">{t.title}</h3>
              <p className="text-blue-100 text-xs">{t.subtitle}</p>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="absolute top-3 left-3 p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors text-xs font-medium"
              data-testid="button-toggle-language"
            >
              {popupLanguage === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
              data-testid="button-install-pwa"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t.installing}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t.installButton}
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-600">
                {popupLanguage === 'fr' ? '🚀 Installation automatique • 🔔 Notifications • 📶 Hors ligne' : '🚀 Automatic install • 🔔 Notifications • 📶 Offline'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLater}
                className="flex-1 py-1.5 px-3 text-gray-600 text-xs rounded-md border hover:bg-gray-50 transition-colors"
                data-testid="button-later-pwa"
              >
                {t.later}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontPagePWAInstallPrompt;