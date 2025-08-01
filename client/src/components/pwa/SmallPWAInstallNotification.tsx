import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SmallPWAInstallNotification: React.FC = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallEvent | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const text = {
    fr: {
      title: 'Installer Educafric',
      message: 'Accès rapide depuis votre écran d\'accueil',
      install: 'Installer',
      dismiss: 'Plus tard'
    },
    en: {
      title: 'Install Educafric',
      message: 'Quick access from your home screen',
      install: 'Install',
      dismiss: 'Later'
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallEvent);
      
      // Show notification after a short delay
      setTimeout(() => {
        setShowNotification(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowNotification(false);
    };

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
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installation accepted');
      }
      
      setDeferredPrompt(null);
      setShowNotification(false);
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Hide for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      if (dismissedTime > oneDayAgo) {
        setShowNotification(false);
        return;
      }
    }
  }, []);

  if (!showNotification || !deferredPrompt) {
    return null;
  }

  return (
    <div className="notification">
      <div className="notification-item info">
        <div className="notification-content">
          <Smartphone className="notification-icon text-blue-500" />
          <div className="notification-text">
            <div className="notification-title">
              {t.title || ''}
            </div>
            <div className="notification-message">
              {t.message}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            <Download className="w-3 h-3" />
            {t.install}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t.dismiss}
          </button>
        </div>
        
        <button 
          className="notification-close"
          onClick={handleDismiss}
          aria-label="Close notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SmallPWAInstallNotification;