import { useEffect, useState } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface OfflineStatusIndicatorProps {
  position?: 'top' | 'bottom';
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({ 
  position = 'bottom' 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [dataAge, setDataAge] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleSyncStart = () => {
      setIsSyncing(true);
      setSyncProgress(0);
    };
    
    const handleSyncProgress = (event: CustomEvent) => {
      setSyncProgress(event.detail.progress);
    };
    
    const handleSyncComplete = (event: CustomEvent) => {
      setIsSyncing(false);
      setSyncProgress(100);
      setLastSyncTime(new Date(event.detail.timestamp));
      
      // Hide progress after 2 seconds
      setTimeout(() => setSyncProgress(0), 2000);
    };
    
    const handleSyncError = () => {
      setIsSyncing(false);
      setSyncProgress(0);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-start', handleSyncStart as EventListener);
    window.addEventListener('offline-sync-progress', handleSyncProgress as EventListener);
    window.addEventListener('offline-sync-complete', handleSyncComplete as EventListener);
    window.addEventListener('offline-sync-error', handleSyncError);

    // Check data age on mount
    checkDataAge();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-start', handleSyncStart as EventListener);
      window.removeEventListener('offline-sync-progress', handleSyncProgress as EventListener);
      window.removeEventListener('offline-sync-complete', handleSyncComplete as EventListener);
      window.removeEventListener('offline-sync-error', handleSyncError);
    };
  }, []);

  const checkDataAge = async () => {
    try {
      if (window.offlineSync) {
        const age = await window.offlineSync.getDataAge();
        if (age) {
          const days = age.ageInDays;
          if (days === 0) {
            setDataAge('Aujourd\'hui');
          } else if (days === 1) {
            setDataAge('Hier');
          } else {
            setDataAge(`Il y a ${days} jours`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check data age:', error);
    }
  };

  const handleManualSync = async () => {
    if (window.offlineSync && !isSyncing) {
      await window.offlineSync.syncAllData(true);
    }
  };

  // Don't show indicator if always online
  if (isOnline && !isSyncing && !syncProgress && !dataAge) {
    return null;
  }

  const positionClass = position === 'top' 
    ? 'top-4 right-4' 
    : 'bottom-4 right-4';

  return (
    <div className={`fixed ${positionClass} z-50`}>
      <Card className="p-3 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Connection Status Icon */}
          <div className="flex-shrink-0">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600" />
            )}
          </div>

          {/* Status Text */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isOnline ? (
                isSyncing ? 'Synchronisation...' : 'En ligne'
              ) : (
                'Hors ligne'
              )}
            </div>
            
            {dataAge && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Dernière synchro: {dataAge}
              </div>
            )}
            
            {/* Sync Progress */}
            {isSyncing && (
              <div className="mt-2">
                <Progress value={syncProgress} className="h-1" />
                <div className="text-xs text-gray-500 mt-1">
                  {syncProgress}%
                </div>
              </div>
            )}
          </div>

          {/* Sync Button */}
          {isOnline && !isSyncing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleManualSync}
              className="h-8 w-8 p-0"
              data-testid="button-manual-sync"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Offline Mode Enabled Badge */}
        {!isOnline && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <CloudOff className="h-3 w-3" />
              <span>Mode hors ligne actif</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Global type declarations for TypeScript
declare global {
  interface Window {
    offlineDB: any;
    offlineSync: any;
  }
}

export default OfflineStatusIndicator;
