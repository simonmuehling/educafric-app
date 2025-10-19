// Offline Mode Banner
// Shows when user is offline or has pending sync actions

import { useOffline } from '@/hooks/useOffline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function OfflineBanner() {
  const { isOnline, queueSize, isSyncing, triggerSync, lastSyncTime } = useOffline();
  const { language } = useLanguage();

  const t = {
    fr: {
      offline: 'Mode hors ligne',
      offlineMessage: 'Vous travaillez hors ligne. Vos modifications seront synchronisées automatiquement à la reconnexion.',
      pendingActions: 'actions en attente',
      syncing: 'Synchronisation en cours...',
      syncNow: 'Synchroniser maintenant',
      lastSync: 'Dernière synchro:',
      never: 'Jamais',
      justNow: 'À l\'instant',
      minutesAgo: 'il y a {0} min'
    },
    en: {
      offline: 'Offline Mode',
      offlineMessage: 'You are working offline. Your changes will be automatically synced when reconnected.',
      pendingActions: 'pending actions',
      syncing: 'Syncing...',
      syncNow: 'Sync now',
      lastSync: 'Last sync:',
      never: 'Never',
      justNow: 'Just now',
      minutesAgo: '{0} min ago'
    }
  }[language];

  const formatLastSync = () => {
    if (!lastSyncTime) return t.never;
    const diff = Date.now() - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    if (minutes === 0) return t.justNow;
    return t.minutesAgo.replace('{0}', minutes.toString());
  };

  // Don't show banner if online and no pending actions
  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300"
      data-testid="offline-banner"
    >
      <Alert
        variant={isOnline ? 'default' : 'destructive'}
        className={`rounded-none border-x-0 ${
          isOnline
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {isOnline ? (
              queueSize > 0 ? (
                <CloudOff className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
            <AlertDescription className="m-0">
              {isOnline ? (
                <div className="flex items-center gap-2">
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="font-medium">{t.syncing}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">
                        {queueSize} {t.pendingActions}
                      </span>
                      <span className="text-xs opacity-75">
                        • {t.lastSync} {formatLastSync()}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <span className="font-medium">{t.offline}</span>
                  <span className="text-sm block mt-1">{t.offlineMessage}</span>
                  {queueSize > 0 && (
                    <span className="text-xs block mt-1 opacity-75">
                      {queueSize} {t.pendingActions}
                    </span>
                  )}
                </>
              )}
            </AlertDescription>
          </div>

          {isOnline && queueSize > 0 && !isSyncing && (
            <Button
              size="sm"
              variant="outline"
              onClick={triggerSync}
              className="ml-4"
              data-testid="button-sync-now"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.syncNow}
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}
