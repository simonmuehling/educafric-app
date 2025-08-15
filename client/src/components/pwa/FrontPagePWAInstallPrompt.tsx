import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const FrontPagePWAInstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const text = {
    fr: {
      title: '📱 Installez EDUCAFRIC',
      subtitle: 'Accès rapide depuis votre écran d\'accueil',
      benefits: [
        '🚀 Démarrage instantané',
        '🔔 Notifications en temps réel',
        '📶 Fonctionne hors ligne',
        '💾 Économise la batterie'
      ],
      installButton: 'Installer maintenant',
      installing: 'Installation...',
      manualTitle: 'Installation manuelle',
      chromeInstructions: 'Chrome: Menu (⋮) → "Installer EDUCAFRIC"',
      safariInstructions: 'Safari: Partager (□↑) → "Sur l\'écran d\'accueil"',
      firefoxInstructions: 'Firefox: Icône (+) → "Installer cette application"',
      edgeInstructions: 'Edge: Menu (⋯) → Applications → "Installer EDUCAFRIC"',
      close: 'Fermer',
      later: 'Plus tard'
    },
    en: {
      title: '📱 Install EDUCAFRIC',
      subtitle: 'Quick access from your home screen',
      benefits: [
        '🚀 Instant startup',
        '🔔 Real-time notifications', 
        '📶 Works offline',
        '💾 Saves battery'
      ],
      installButton: 'Install now',
      installing: 'Installing...',
      manualTitle: 'Manual installation',
      chromeInstructions: 'Chrome: Menu (⋮) → "Install EDUCAFRIC"',
      safariInstructions: 'Safari: Share (□↑) → "Add to Home Screen"',
      firefoxInstructions: 'Firefox: Icon (+) → "Install this application"', 
      edgeInstructions: 'Edge: Menu (⋯) → Apps → "Install EDUCAFRIC"',
      close: 'Close',
      later: 'Later'
    }
  };

  const t = text[language as keyof typeof text];

  // Check if PWA is already installed
  useEffect(() => {
    const checkInstallation = () => {
      // Check various installation indicators
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isWebkit = (navigator as any).standalone;
      const isAndroid = document.referrer.includes('android-app://');
      
      if (isStandalone || isWebkit || isAndroid) {
        setIsInstalled(true);
        return;
      }

      // Check localStorage for dismissal (24 hours)
      const dismissed = localStorage.getItem('pwa-frontpage-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (dismissedTime > oneDayAgo) {
          return; // Still dismissed
        }
      }

      // Show after 3 seconds delay
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    checkInstallation();
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Installation accepted');
          setIsVisible(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('[PWA] Installation error:', error);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Direct installation attempt - trigger browser's install UI
      setIsInstalling(true);
      
      try {
        // Try to trigger installation event artificially
        const installEvent = new Event('beforeinstallprompt');
        window.dispatchEvent(installEvent);
        
        // For Chrome/Edge - try to trigger installation dialog
        if ((window as any).chrome || navigator.userAgent.includes('Edge')) {
          // Hide popup and show instructions to user
          setIsVisible(false);
          
          // Show a more direct message
          if (language === 'fr') {
            // Try opening chrome://flags or directing to menu
            setTimeout(() => {
              if (confirm('Voulez-vous installer EDUCAFRIC maintenant?\n\nCliquez OK puis cherchez "Installer EDUCAFRIC" dans le menu Chrome (⋮).')) {
                // Focus on the address bar to help user see install icon
                (document.querySelector('input[type="url"]') as HTMLInputElement)?.focus?.();
              }
            }, 100);
          } else {
            setTimeout(() => {
              if (confirm('Do you want to install EDUCAFRIC now?\n\nClick OK then look for "Install EDUCAFRIC" in the Chrome menu (⋮).')) {
                (document.querySelector('input[type="url"]') as HTMLInputElement)?.focus?.();
              }
            }, 100);
          }
          
          setIsInstalling(false);
          return;
        }
        
        // For Safari - direct instructions
        if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          setIsVisible(false);
          
          if (language === 'fr') {
            setTimeout(() => {
              alert('Pour installer EDUCAFRIC:\n\n1. Appuyez sur le bouton Partager (⬆️)\n2. Sélectionnez "Sur l\'écran d\'accueil"\n3. Appuyez sur "Ajouter"');
            }, 100);
          } else {
            setTimeout(() => {
              alert('To install EDUCAFRIC:\n\n1. Tap the Share button (⬆️)\n2. Select "Add to Home Screen"\n3. Tap "Add"');
            }, 100);
          }
          
          setIsInstalling(false);
          return;
        }
        
        // Close popup and direct user to browser menu
        setIsVisible(false);
        setIsInstalling(false);
        
      } catch (error) {
        console.log('[PWA] Installation trigger failed:', error);
        setIsInstalling(false);
        setIsVisible(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-frontpage-dismissed', Date.now().toString());
  };

  const handleLater = () => {
    setIsVisible(false);
    // Dismiss for 4 hours only
    const fourHoursLater = Date.now() - (20 * 60 * 60 * 1000); // Less aggressive
    localStorage.setItem('pwa-frontpage-dismissed', fourHoursLater.toString());
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return t.chromeInstructions;
    }
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return t.safariInstructions;
    }
    if (userAgent.includes('firefox')) {
      return t.firefoxInstructions;
    }
    if (userAgent.includes('edg')) {
      return t.edgeInstructions;
    }
    return t.chromeInstructions; // Default fallback
  };

  // Don't show if already installed
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleClose}
        data-testid="pwa-install-backdrop"
      >
        {/* Popup - Smaller Version */}
        <div 
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm mx-auto shadow-2xl transform transition-transform duration-300 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4"
          onClick={(e) => e.stopPropagation()}
          data-testid="pwa-install-popup"
        >
          {/* Header - Compact */}
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
          </div>

          {/* Content - Compact */}
          <div className="p-4 space-y-3">
            {/* Install Button - Primary Action */}
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

            {/* Compact Benefits */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                {language === 'fr' ? '🚀 Accès rapide • 🔔 Notifications • 📶 Hors ligne' : '🚀 Quick access • 🔔 Notifications • 📶 Offline'}
              </p>
            </div>

            {/* Action Buttons */}
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