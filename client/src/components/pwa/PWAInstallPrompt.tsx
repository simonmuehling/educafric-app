import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Download, Smartphone, Wifi, Bell } from 'lucide-react';
import { unifiedNotificationService } from '@/services/unifiedNotificationService';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const PWAInstallPrompt = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Translations
  const translations = {
    en: {
      title: 'Install Educafric App',
      subtitle: 'Get the full experience with our mobile app',
      features: [
        'Works offline without internet',
        'Faster loading and performance', 
        'Push notifications for grades & attendance',
        'Easy access from your home screen'
      ],
      installButton: 'Install App',
      laterButton: 'Maybe Later',
      installingText: 'Installing...',
      successTitle: 'App Installed Successfully!',
      successMessage: 'Educafric is now installed on your device. You can find it on your home screen.',
      optimizedText: 'Optimized for African connectivity'
    },
    fr: {
      title: 'Installer l\'App Educafric',
      subtitle: 'Profitez de l\'expérience complète avec notre app mobile',
      features: [
        'Fonctionne hors ligne sans internet',
        'Chargement plus rapide et performance',
        'Notifications push pour notes et présence',
        'Accès facile depuis votre écran d\'accueil'
      ],
      installButton: 'Installer l\'App',
      laterButton: 'Plus Tard',
      installingText: 'Installation...',
      successTitle: 'App Installée avec Succès!',
      successMessage: 'Educafric est maintenant installée sur votre appareil. Vous la trouverez sur votre écran d\'accueil.',
      optimizedText: 'Optimisée pour la connectivité africaine'
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                             (window.navigator as any).standalone === true ||
                             document?.referrer?.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(beforeInstallEvent);
      
      // Show our custom install prompt after a delay
      setTimeout(() => {
        if (!isStandalone) {
          setShowPrompt(true);
        }
      }, 3000); // Show after 3 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('📱 PWA was installed successfully');
      setShowPrompt(false);
      setDeferredPrompt(null);
      
      // Show success notification using unified service
      setTimeout(async () => {
        await unifiedNotificationService.success(t.successTitle, t.successMessage);
      }, 1000);
    };

    // Alternative detection for older browsers and African devices
    const showInstallPromptFallback = () => {
      // Check if it's a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check if user has visited multiple times (suggests engagement)
      const visitCount = parseInt(localStorage.getItem('educafric_visits') || '0') + 1;
      localStorage.setItem('educafric_visits', visitCount.toString());
      
      // Show prompt on mobile after 2+ visits, if not already installed
      if (isMobile && visitCount >= 2 && !isStandalone) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback for browsers that don't support beforeinstallprompt
    if (!deferredPrompt) {
      showInstallPromptFallback();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, deferredPrompt, t]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback installation guide for browsers without native support
      showInstallationGuide();
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`📱 User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
    } catch (error) {
      console.error('❌ Error during installation:', error);
      // Show fallback guide
      showInstallationGuide();
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const showInstallationGuide = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    let guideText = '';
    
    if (isAndroid) {
      if (language === 'fr') {
        guideText = `Pour installer Educafric:\n\n1. Tapez sur le menu (⋮) de votre navigateur\n2. Sélectionnez "Ajouter à l'écran d'accueil"\n3. Confirmez l'installation\n\nL'app sera disponible sur votre écran d'accueil!`;
      } else {
        guideText = `To install Educafric:\n\n1. Tap your browser menu (⋮)\n2. Select "Add to Home screen"\n3. Confirm installation\n\nThe app will be available on your home screen!`;
      }
    } else if (isIOS) {
      if (language === 'fr') {
        guideText = `Pour installer Educafric:\n\n1. Tapez sur le bouton Partager (□↗)\n2. Sélectionnez "Sur l'écran d'accueil"\n3. Tapez "Ajouter"\n\nL'app sera disponible sur votre écran d'accueil!`;
      } else {
        guideText = `To install Educafric:\n\n1. Tap the Share button (□↗)\n2. Select "Add to Home Screen"\n3. Tap "Add"\n\nThe app will be available on your home screen!`;
      }
    } else {
      if (language === 'fr') {
        guideText = `Votre navigateur prend en charge l'installation d'apps web.\n\nRecherchez une icône "Installer" ou "Ajouter à l'écran d'accueil" dans le menu de votre navigateur.`;
      } else {
        guideText = `Your browser supports web app installation.\n\nLook for an "Install" or "Add to Home Screen" icon in your browser menu.`;
      }
    }

    alert(guideText);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed for this session
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // Don't show if already dismissed this session or if already installed
  if (!showPrompt || isStandalone || sessionStorage.getItem('pwa_prompt_dismissed')) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.title || ''}</h3>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Optimization notice */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">{t.optimizedText}</span>
            </div>
          </div>
        </div>

        {/* Notification Setup */}
        <div className="px-6 pb-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {language === 'fr' ? 'Notifications Instantanées' : 'Instant Notifications'}
              </span>
            </div>
            <p className="text-xs text-blue-700 mb-3">
              {language === 'fr' ? 
                'Recevez des alertes instantanées pour les notes, présences et urgences' :
                'Get instant alerts for grades, attendance, and emergencies'
              }
            </p>
            <button
              onClick={async () => {
                const granted = await unifiedNotificationService.requestPermission();
                if (granted) {
                  await unifiedNotificationService.test(language);
                }
              }}
              className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'fr' ? 'Activer Notifications' : 'Enable Notifications'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t.laterButton}
          </button>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t.installingText}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t.installButton}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;