import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { pwaConnectionManager } from '@/services/PWAConnectionManager';

interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastPingTime: number;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

const ConnectionStatusIndicator: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    pwaConnectionManager.getConnectionState()
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleStateChange = (state: ConnectionState) => {
      setConnectionState(state);
    };

    pwaConnectionManager.addStateListener(handleStateChange);

    return () => {
      pwaConnectionManager.removeStateListener(handleStateChange);
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
    if (!connectionState.isOnline) {
      return 'Hors ligne';
    }

    if (!connectionState.isConnected) {
      return 'Reconnexion...';
    }

    switch (connectionState.quality) {
      case 'excellent':
        return 'Excellente';
      case 'good':
        return 'Bonne';
      case 'poor':
        return 'Faible';
      default:
        return 'Déconnecté';
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
    if (!connectionState.lastPingTime) return 'Jamais';
    
    const now = Date.now();
    const diff = now - connectionState.lastPingTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `il y a ${minutes}m ${seconds}s`;
    }
    return `il y a ${seconds}s`;
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

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-semibold">Connexion EducAfric</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* État principal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut:</span>
              <Badge variant={getStatusColor() as any}>
                {getStatusText()}
              </Badge>
            </div>

            {/* Connexion internet */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Internet:</span>
              <div className="flex items-center gap-1">
                {connectionState.isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Connecté</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Déconnecté</span>
                  </>
                )}
              </div>
            </div>

            {/* Serveur EducAfric */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Serveur:</span>
              <div className="flex items-center gap-1">
                {connectionState.isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Actif</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">En reconnexion</span>
                  </>
                )}
              </div>
            </div>

            {/* Dernière vérification */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dernière vérif:</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatLastPing()}</span>
              </div>
            </div>

            {/* Tentatives de reconnexion */}
            {connectionState.retryCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tentatives:</span>
                <Badge variant="secondary">
                  {connectionState.retryCount}/5
                </Badge>
              </div>
            )}

            {/* Qualité de notification */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Signal className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Qualité des notifications
                </span>
              </div>
              <p className="text-xs text-blue-600">
                {connectionState.isConnected ? (
                  connectionState.quality === 'excellent' ? 
                    'Les notifications arrivent instantanément' :
                  connectionState.quality === 'good' ?
                    'Les notifications arrivent avec un léger délai' :
                    'Les notifications peuvent être retardées'
                ) : (
                  'Les notifications seront délivrées à la reconnexion'
                )}
              </p>
            </div>

            {/* Bouton de test */}
            <button
              onClick={() => pwaConnectionManager.checkConnection()}
              className="w-full mt-3 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tester la connexion
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionStatusIndicator;