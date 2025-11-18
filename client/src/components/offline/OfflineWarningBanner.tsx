import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WifiOff, AlertTriangle, Ban, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ===========================
// ⚠️ OFFLINE WARNING BANNER
// ===========================
// 3-tier warning system: Light (yellow), Urgent (red), Blocked (red + locked)

export function OfflineWarningBanner() {
  const { language } = useLanguage();
  const { 
    warningLevel, 
    daysOffline, 
    isOnline, 
    isSyncing, 
    pendingSyncCount,
    triggerSync 
  } = useOfflinePremium();

  const text = {
    fr: {
      offline: 'Hors ligne',
      reconnect: 'Veuillez vous reconnecter à Internet',
      syncing: 'Synchronisation en cours...',
      pendingChanges: (count: number) => `${count} modification${count > 1 ? 's' : ''} en attente de synchronisation`,
      syncNow: 'Synchroniser maintenant',
      
      // Light warning (3-7 days)
      lightTitle: 'Connexion recommandée',
      lightMessage: (days: number) => `Vous êtes hors ligne depuis ${days} jours. Reconnectez-vous bientôt pour synchroniser vos données.`,
      
      // Urgent warning (7-14 days)
      urgentTitle: 'Reconnexion urgente requise',
      urgentMessage: (days: number, remaining: number) => `Hors ligne depuis ${days} jours. ${remaining} jours restants avant verrouillage. Reconnectez-vous dès que possible.`,
      
      // Blocked (14+ days)
      blockedTitle: 'Accès Premium suspendu',
      blockedMessage: 'Vous devez vous reconnecter à Internet pour restaurer votre accès Premium.'
    },
    en: {
      offline: 'Offline',
      reconnect: 'Please reconnect to the Internet',
      syncing: 'Syncing...',
      pendingChanges: (count: number) => `${count} change${count > 1 ? 's' : ''} pending sync`,
      syncNow: 'Sync Now',
      
      // Light warning (3-7 days)
      lightTitle: 'Connection Recommended',
      lightMessage: (days: number) => `You've been offline for ${days} days. Reconnect soon to sync your data.`,
      
      // Urgent warning (7-14 days)
      urgentTitle: 'Urgent Reconnection Required',
      urgentMessage: (days: number, remaining: number) => `Offline for ${days} days. ${remaining} days remaining before lockout. Reconnect as soon as possible.`,
      
      // Blocked (14+ days)
      blockedTitle: 'Premium Access Suspended',
      blockedMessage: 'You must reconnect to the Internet to restore your Premium access.'
    }
  };

  const t = text[language];

  // No warning needed
  if (warningLevel === 'none') {
    // Show sync status if offline or has pending changes
    if (!isOnline && pendingSyncCount > 0) {
      return (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <WifiOff className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-800">
              {t.offline} • {t.pendingChanges(pendingSyncCount)}
            </span>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isSyncing) {
      return (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <RefreshCw className="h-4 w-4 text-green-600 animate-spin" />
          <AlertDescription className="text-green-800">
            {t.syncing}
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  // Light warning (3-7 days) - Yellow banner
  if (warningLevel === 'light') {
    return (
      <Alert className="bg-yellow-50 border-yellow-300 mb-4" data-testid="warning-light">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-900">{t.lightTitle}</p>
            <p className="text-sm text-yellow-800">{t.lightMessage(daysOffline)}</p>
          </div>
          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={triggerSync}
              disabled={isSyncing}
              className="ml-4 border-yellow-400 text-yellow-700 hover:bg-yellow-100"
              data-testid="btn-sync-light"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {t.syncNow}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Urgent warning (7-14 days) - Red banner with countdown
  if (warningLevel === 'urgent') {
    const remainingDays = 14 - daysOffline;
    return (
      <Alert className="bg-red-50 border-red-400 mb-4" data-testid="warning-urgent">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-bold text-red-900">{t.urgentTitle}</p>
            <p className="text-sm text-red-800">{t.urgentMessage(daysOffline, remainingDays)}</p>
          </div>
          {isOnline && (
            <Button
              size="sm"
              onClick={triggerSync}
              disabled={isSyncing}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white"
              data-testid="btn-sync-urgent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {t.syncNow}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Blocked (14+ days) - Red banner + access locked
  if (warningLevel === 'blocked') {
    return (
      <Alert className="bg-red-100 border-red-500 mb-4" data-testid="warning-blocked">
        <Ban className="h-5 w-5 text-red-700" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-bold text-red-900">{t.blockedTitle}</p>
            <p className="text-sm text-red-800">{t.blockedMessage}</p>
          </div>
          {isOnline && (
            <Button
              size="sm"
              onClick={triggerSync}
              disabled={isSyncing}
              className="ml-4 bg-red-700 hover:bg-red-800 text-white"
              data-testid="btn-sync-blocked"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {t.syncNow}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
