import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { healthMonitorMigration } from '@/services/HealthMonitorMigration';

interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastPingTime: number;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

const ConnectionStatusIndicator: React.FC = () => {
  const { language } = useLanguage();
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    healthMonitorMigration.getConnectionState()
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleStateChange = (state: ConnectionState) => {
      setConnectionState(state);
    };

    healthMonitorMigration.addConnectionListener(handleStateChange);

    return () => {
      healthMonitorMigration.removeConnectionListener(handleStateChange);
    };
  }, []);

  const getStatusIcon = () => {
    if (!connectionState.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }

    if (!connectionState.isConnected) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }

    switch (connectionState.quality) {
      case 'excellent':
        return <Signal className="w-4 h-4 text-green-500" />;
      case 'good':
        return <SignalHigh className="w-4 h-4 text-green-400" />;
      case 'poor':
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      default:
        return <SignalLow className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    const texts = {
      fr: {
        offline: 'Hors ligne',
        reconnecting: 'Reconnexion...',
        excellent: 'Excellente',
        good: 'Bonne',
        poor: 'Faible',
        disconnected: 'Déconnecté'
      },
      en: {
        offline: 'Offline',
        reconnecting: 'Reconnecting...',
        excellent: 'Excellent',
        good: 'Good',
        poor: 'Poor',
        disconnected: 'Disconnected'
      }
    };
    
    const t = texts[language];
    
    if (!connectionState.isOnline) {
      return t.offline;
    }

    if (!connectionState.isConnected) {
      return t.reconnecting;
    }

    switch (connectionState.quality) {
      case 'excellent':
        return t.excellent;
      case 'good':
        return t.good;
      case 'poor':
        return t.poor;
      default:
        return t.disconnected;
    }
  };

  const getStatusColor = () => {
    if (!connectionState.isOnline || !connectionState.isConnected) {
      return 'destructive';
    }

    switch (connectionState.quality) {
      case 'excellent':
      case 'good':
        return 'default';
      case 'poor':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const formatLastPing = () => {
    const never = language === 'fr' ? 'Jamais' : 'Never';
    const ago = language === 'fr' ? 'il y a' : 'ago';
    
    if (!connectionState.lastPingTime) return never;
    
    const now = Date.now();
    const diff = now - connectionState.lastPingTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${ago} ${minutes}m ${seconds}s`;
    }
    return `${ago} ${seconds}s`;
  };
  
  const getText = () => {
    return {
      fr: {
        title: 'Connexion EducAfric',
        status: 'Statut:',
        internet: 'Internet:',
        server: 'Serveur:',
        lastCheck: 'Dernière vérif:',
        attempts: 'Tentatives:',
        connected: 'Connecté',
        disconnected: 'Déconnecté',
        active: 'Actif',
        reconnecting: 'En reconnexion',
        notificationQuality: 'Qualité des notifications',
        instant: 'Les notifications arrivent instantanément',
        slight: 'Les notifications arrivent avec un léger délai',
        delayed: 'Les notifications peuvent être retardées',
        pending: 'Les notifications seront délivrées à la reconnexion',
        testConnection: 'Tester la connexion'
      },
      en: {
        title: 'EducAfric Connection',
        status: 'Status:',
        internet: 'Internet:',
        server: 'Server:',
        lastCheck: 'Last check:',
        attempts: 'Attempts:',
        connected: 'Connected',
        disconnected: 'Disconnected',
        active: 'Active',
        reconnecting: 'Reconnecting',
        notificationQuality: 'Notification Quality',
        instant: 'Notifications arrive instantly',
        slight: 'Notifications arrive with slight delay',
        delayed: 'Notifications may be delayed',
        pending: 'Notifications will be delivered upon reconnection',
        testConnection: 'Test Connection'
      }
    }[language];
  };

  if (!isExpanded) {
    return (
      <div 
        className="fixed top-4 right-4 z-50 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <Badge 
          variant={getStatusColor() as any}
          className="flex items-center gap-2 px-3 py-2 shadow-lg"
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </Badge>
      </div>
    );
  }

  const t = getText();
  
  return (
    <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
      <DialogContent className="w-80 max-w-80 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            {getStatusIcon()}
            <span className="font-semibold">{t.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">

          <div className="space-y-3">
          {/* État principal */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t.status}</span>
            <Badge variant={getStatusColor() as any}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Connexion internet */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t.internet}</span>
            <div className="flex items-center gap-1">
              {connectionState.isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">{t.connected}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">{t.disconnected}</span>
                </>
              )}
            </div>
          </div>

          {/* Serveur EducAfric */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t.server}</span>
            <div className="flex items-center gap-1">
              {connectionState.isConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">{t.active}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">{t.reconnecting}</span>
                </>
              )}
            </div>
          </div>

          {/* Dernière vérification */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t.lastCheck}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{formatLastPing()}</span>
            </div>
          </div>

          {/* Tentatives de reconnexion */}
          {connectionState.retryCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t.attempts}</span>
              <Badge variant="secondary">
                {connectionState.retryCount}/5
              </Badge>
            </div>
          )}

          {/* Qualité de notification */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Signal className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {t.notificationQuality}
              </span>
            </div>
            <p className="text-xs text-blue-600">
              {connectionState.isConnected ? (
                connectionState.quality === 'excellent' ? 
                  t.instant :
                connectionState.quality === 'good' ?
                  t.slight :
                  t.delayed
              ) : (
                t.pending
              )}
            </p>
          </div>

          {/* Bouton de test */}
          <button
            onClick={() => healthMonitorMigration.manualCheck()}
            className="w-full mt-3 px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
          >
            {t.testConnection}
          </button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionStatusIndicator;