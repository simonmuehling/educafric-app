// Educafric Offline Mode Indicator
// Shows when user is in offline demo mode with bilingual support

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { WifiOff, Wifi, Database, Download } from 'lucide-react';

interface OfflineModeIndicatorProps {
  variant?: 'banner' | 'badge' | 'compact';
}

export const OfflineModeIndicator: React.FC<OfflineModeIndicatorProps> = ({ variant = 'banner' }) => {
  const { language } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const text = {
    fr: {
      offlineMode: 'Mode Hors Ligne',
      onlineMode: 'En Ligne',
      demoMode: 'Mode Démo',
      offlineDemoMode: 'Mode Démo Hors Ligne',
      dataAvailable: 'Données disponibles',
      syncPending: 'Synchronisation en attente',
      actions: 'actions',
      reconnecting: 'Reconnexion...',
      fullFunctionality: 'Toutes les fonctionnalités disponibles hors ligne',
      limitedFunctionality: 'Fonctionnalités limitées en mode hors ligne'
    },
    en: {
      offlineMode: 'Offline Mode',
      onlineMode: 'Online',
      demoMode: 'Demo Mode',
      offlineDemoMode: 'Offline Demo Mode',
      dataAvailable: 'Data available',
      syncPending: 'Sync pending',
      actions: 'actions',
      reconnecting: 'Reconnecting...',
      fullFunctionality: 'All features available offline',
      limitedFunctionality: 'Limited functionality in offline mode'
    }
  };

  const t = text[language];

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      setTimeout(() => setIsVisible(false), 3000); // Hide after 3s when back online
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending actions periodically
    const checkPendingActions = async () => {
      try {
        const { offlineStorage } = await import('@/services/offlineStorage');
        const queueSize = await offlineStorage.getQueueSize();
        setPendingActions(queueSize);
      } catch (error) {
        // Silently fail
      }
    };

    // Initial check
    if (isOffline) {
      setIsVisible(true);
      checkPendingActions();
    }

    // Check every 30 seconds
    const interval = setInterval(checkPendingActions, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOffline]);

  // Check if this is sandbox mode
  const isSandboxMode = 
    typeof window !== 'undefined' && 
    (window.location.pathname.includes('/sandbox') ||
     localStorage.getItem('educafric_offline_mode') === 'true');

  // Don't show if online and not sandbox
  if (!isOffline && !isSandboxMode) {
    return null;
  }

  // Badge variant - compact indicator
  if (variant === 'badge') {
    return (
      <Badge 
        variant={isOffline ? "destructive" : "default"}
        className={`
          flex items-center gap-1.5 px-2 py-1 text-xs font-medium
          ${isOffline 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'}
          transition-all duration-300
        `}
        data-testid="offline-mode-badge"
      >
        {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
        <span>{isOffline ? t.offlineMode : t.onlineMode}</span>
        {isSandboxMode && (
          <Database className="w-3 h-3 ml-1" />
        )}
      </Badge>
    );
  }

  // Compact variant - minimal indicator
  if (variant === 'compact') {
    return (
      <div 
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          ${isOffline 
            ? 'bg-orange-100 text-orange-800 border border-orange-300' 
            : 'bg-green-100 text-green-800 border border-green-300'}
          transition-all duration-300
        `}
        data-testid="offline-mode-compact"
      >
        {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
        <span>{isSandboxMode ? t.offlineDemoMode : (isOffline ? t.offlineMode : t.onlineMode)}</span>
      </div>
    );
  }

  // Banner variant - full width notification
  if (!isVisible && !isSandboxMode) return null;

  return (
    <div 
      className={`
        w-full px-4 py-3 
        ${isOffline 
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'}
        shadow-lg
        transition-all duration-500 ease-in-out
        ${isVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'}
      `}
      data-testid="offline-mode-banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isOffline ? 'bg-orange-600' : 'bg-green-600'}
          `}>
            {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {isSandboxMode ? t.offlineDemoMode : (isOffline ? t.offlineMode : t.onlineMode)}
              {isSandboxMode && <Database className="w-4 h-4" />}
            </h3>
            <p className="text-xs opacity-90">
              {isOffline 
                ? (isSandboxMode ? t.fullFunctionality : t.limitedFunctionality)
                : t.dataAvailable}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {pendingActions > 0 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Download className="w-4 h-4" />
              <span className="text-xs font-medium">
                {pendingActions} {t.actions} {t.syncPending}
              </span>
            </div>
          )}

          {isSandboxMode && (
            <Badge variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white text-xs">
              {t.demoMode}
            </Badge>
          )}

          {isVisible && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineModeIndicator;
