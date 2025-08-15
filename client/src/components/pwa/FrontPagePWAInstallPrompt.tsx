import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share } from 'lucide-react';
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

  const t = text[popupLanguage as keyof typeof text];

  const toggleLanguage = () => {
    setPopupLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  // Check if PWA is already installed - Optimized for low-end devices
  useEffect(() => {
    const checkInstallation = () => {
      // Simplified installation check for low-end devices
      try {
        const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
        const isWebkit = (navigator as any).standalone;
        const isAndroid = document.referrer && document.referrer.includes('android-app://');
        
        if (isStandalone || isWebkit || isAndroid) {
          setIsInstalled(true);
          return;
        }
      } catch (e) {
        // Ignore errors on older browsers
        console.log('[PWA] Installation check failed on older browser');
      }

      // Relaxed dismissal check - only 2 hours for low-end users
      try {
        const dismissed = localStorage.getItem('pwa-frontpage-dismissed');
        if (dismissed) {
          const dismissedTime = parseInt(dismissed);
          const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
          if (dismissedTime > twoHoursAgo) {
            return; // Still dismissed
          }
        }
      } catch (e) {
        // Ignore localStorage errors on restricted devices
      }

      // 3 seconds delay as preferred by user
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    checkInstallation();
  }, []);

  // Listen for beforeinstallprompt event - Enhanced for low-end devices
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
        setDeferredPrompt(e as PWAInstallEvent);
        console.log('[PWA] Install prompt captured for low-end device');
      } catch (error) {
        // Ignore errors on older browsers but still try to capture
        setDeferredPrompt(e as PWAInstallEvent);
      }
    };

    const handleAppInstalled = () => {
      try {
        setIsInstalled(true);
        setIsVisible(false);
        setDeferredPrompt(null);
        // Store success for future reference
        localStorage.setItem('pwa-installed', 'true');
      } catch (error) {
        // Ignore localStorage errors
        setIsInstalled(true);
        setIsVisible(false);
      }
    };

    // Enhanced event listening for older browsers
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
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Installation accepted');
          localStorage.setItem('pwa-installation-accepted', 'true');
          
          // Show success message
          const successMessage = popupLanguage === 'fr' ? 
            'EDUCAFRIC installé avec succès!\n\nVous devriez voir l\'icône sur votre écran d\'accueil dans quelques secondes.\n\nSi ce n\'est pas le cas, cherchez "EDUCAFRIC" dans votre liste d\'applications.' :
            'EDUCAFRIC installed successfully!\n\nYou should see the icon on your home screen in a few seconds.\n\nIf not, look for "EDUCAFRIC" in your apps list.';
          
          setTimeout(() => {
            alert(successMessage);
          }, 1000);
          
          setIsVisible(false);
        } else {
          console.log('[PWA] Installation declined');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('[PWA] Installation error:', error);
        
        // Show error with manual instructions
        const errorMessage = popupLanguage === 'fr' ?
          'Erreur d\'installation automatique.\n\nPour installer manuellement :\n1. Menu navigateur (⋮)\n2. "Installer EDUCAFRIC" ou "Ajouter à l\'écran"' :
          'Automatic installation error.\n\nTo install manually:\n1. Browser menu (⋮)\n2. "Install EDUCAFRIC" or "Add to screen"';
        
        alert(errorMessage);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Enhanced installation for low-end devices with relaxed security
      setIsInstalling(true);
      
      try {
        // Multiple installation attempts for better compatibility
        
        // Method 1: Try artificial event trigger (works on some older browsers)
        try {
          const installEvent = new Event('beforeinstallprompt');
          window.dispatchEvent(installEvent);
        } catch (e) {
          console.log('[PWA] Event trigger not supported');
        }
        
        // Method 2: Try service worker registration as installation hint
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').catch(() => {
            // Ignore SW registration failures
          });
        }
        
        // Method 3: Direct browser-specific guidance
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Enhanced Chrome/Edge support (most Android low-end devices)
        if (userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('android')) {
          setIsVisible(false);
          
          const message = popupLanguage === 'fr' ? 
            'EDUCAFRIC peut être installé!\n\n📱 Cherchez "Installer" ou "Ajouter à l\'écran" dans votre navigateur.\n\n✅ Accès plus rapide\n🔔 Notifications\n📶 Fonctionne sans internet' :
            'EDUCAFRIC can be installed!\n\n📱 Look for "Install" or "Add to Home Screen" in your browser.\n\n✅ Faster access\n🔔 Notifications\n📶 Works offline';
          
          setTimeout(() => {
            if (confirm(message)) {
              // Try to highlight install option in address bar
              try {
                document.body.style.border = '3px solid #007bff';
                setTimeout(() => {
                  document.body.style.border = '';
                }, 3000);
              } catch (e) {}
            }
          }, 100);
          
          setIsInstalling(false);
          return;
        }
        
        // Enhanced Safari support (iOS low-end devices)
        if (userAgent.includes('safari') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
          setIsVisible(false);
          
          const message = popupLanguage === 'fr' ? 
            'Installation EDUCAFRIC:\n\n1. Bouton Partager (⬆️ en bas)\n2. "Sur l\'écran d\'accueil"\n3. "Ajouter"\n\n📱 L\'app sera sur votre écran!' :
            'Install EDUCAFRIC:\n\n1. Share button (⬆️ at bottom)\n2. "Add to Home Screen"\n3. "Add"\n\n📱 App will be on your screen!';
          
          setTimeout(() => {
            alert(message);
          }, 100);
          
          setIsInstalling(false);
          return;
        }
        
        // Generic fallback for any browser
        setIsVisible(false);
        const genericMessage = popupLanguage === 'fr' ? 
          'EDUCAFRIC peut être installé comme application!\n\nCherchez "Installer", "Ajouter" ou "App" dans le menu de votre navigateur.' :
          'EDUCAFRIC can be installed as an app!\n\nLook for "Install", "Add" or "App" in your browser menu.';
        
        alert(genericMessage);
        setIsInstalling(false);
        
      } catch (error) {
        console.log('[PWA] All installation methods failed:', error);
        
        // Ultimate fallback - just show basic instruction
        setIsVisible(false);
        const fallbackMessage = popupLanguage === 'fr' ? 
          'Pour installer EDUCAFRIC, cherchez "Installer" dans votre navigateur.' :
          'To install EDUCAFRIC, look for "Install" in your browser.';
        alert(fallbackMessage);
        setIsInstalling(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-frontpage-dismissed', Date.now().toString());
  };

  const handleLater = () => {
    setIsVisible(false);
    // Very short dismissal for low-end users (1 hour only)
    try {
      const oneHourLater = Date.now() - (23 * 60 * 60 * 1000); // Very aggressive for low-end
      localStorage.setItem('pwa-frontpage-dismissed', oneHourLater.toString());
    } catch (e) {
      // Ignore localStorage errors on restricted devices
    }
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
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm mx-auto shadow-lg transform transition-transform duration-200 animate-in slide-in-from-bottom-4"
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
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="absolute top-3 left-3 p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors text-xs font-medium"
              data-testid="button-toggle-language"
            >
              {popupLanguage === 'fr' ? 'EN' : 'FR'}
            </button>
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
                {popupLanguage === 'fr' ? '🚀 Accès rapide • 🔔 Notifications • 📶 Hors ligne' : '🚀 Quick access • 🔔 Notifications • 📶 Offline'}
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