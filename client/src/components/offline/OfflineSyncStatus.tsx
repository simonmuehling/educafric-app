import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OfflineSyncStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function OfflineSyncStatus({ showDetails = true, className = '' }: OfflineSyncStatusProps) {
  const { language } = useLanguage();
  const { 
    isOnline, 
    isSyncing, 
    pendingSyncCount, 
    triggerSync,
    daysOffline,
    warningLevel 
  } = useOfflinePremium();

  const t = {
    online: language === 'fr' ? 'En ligne' : 'Online',
    offline: language === 'fr' ? 'Hors ligne' : 'Offline',
    syncing: language === 'fr' ? 'Synchronisation...' : 'Syncing...',
    pendingSync: language === 'fr' ? 'En attente de sync' : 'Pending sync',
    syncNow: language === 'fr' ? 'Synchroniser' : 'Sync now',
    allSynced: language === 'fr' ? 'Tout synchronisé' : 'All synced',
    daysOffline: language === 'fr' ? 'jours hors ligne' : 'days offline',
    workingOffline: language === 'fr' ? 'Mode hors ligne actif - Vos modifications seront synchronisées à la reconnexion' : 'Offline mode active - Your changes will sync when reconnected',
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isOnline ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Wifi className="w-3 h-3 mr-1" />
            {t.online}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <WifiOff className="w-3 h-3 mr-1" />
            {t.offline}
          </Badge>
        )}
        {pendingSyncCount > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Cloud className="w-3 h-3 mr-1" />
            {pendingSyncCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-3 ${className} ${
      isOnline 
        ? 'bg-green-50 border-green-200' 
        : warningLevel === 'urgent' 
          ? 'bg-red-50 border-red-200'
          : warningLevel === 'light'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-700">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">{t.online}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-700">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">{t.offline}</span>
              {daysOffline > 0 && (
                <span className="text-sm">({daysOffline} {t.daysOffline})</span>
              )}
            </div>
          )}

          {isSyncing && (
            <div className="flex items-center gap-1 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t.syncing}</span>
            </div>
          )}

          {!isSyncing && pendingSyncCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <CloudOff className="w-3 h-3 mr-1" />
              {pendingSyncCount} {t.pendingSync}
            </Badge>
          )}

          {!isSyncing && pendingSyncCount === 0 && isOnline && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">{t.allSynced}</span>
            </div>
          )}
        </div>

        {isOnline && pendingSyncCount > 0 && !isSyncing && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => triggerSync()}
            className="bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {t.syncNow}
          </Button>
        )}
      </div>

      {!isOnline && (
        <p className="text-sm text-orange-600 mt-2">
          {t.workingOffline}
        </p>
      )}
    </div>
  );
}

export function OfflineIndicatorBadge() {
  const { isOnline, pendingSyncCount } = useOfflinePremium();

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline ? (
        <Badge className="bg-orange-500 text-white shadow-lg px-3 py-2">
          <WifiOff className="w-4 h-4 mr-2" />
          Mode hors ligne
          {pendingSyncCount > 0 && ` (${pendingSyncCount} en attente)`}
        </Badge>
      ) : pendingSyncCount > 0 ? (
        <Badge className="bg-blue-500 text-white shadow-lg px-3 py-2">
          <Cloud className="w-4 h-4 mr-2" />
          {pendingSyncCount} modification(s) en attente
        </Badge>
      ) : null}
    </div>
  );
}
