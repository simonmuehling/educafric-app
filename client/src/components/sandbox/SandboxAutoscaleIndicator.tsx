import React from 'react';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useSandboxAutoscale } from '@/hooks/useSandboxAutoscale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SandboxAutoscaleIndicatorProps {
  compact?: boolean;
  showNextRefresh?: boolean;
}

export const SandboxAutoscaleIndicator: React.FC<SandboxAutoscaleIndicatorProps> = ({
  compact = false,
  showNextRefresh = true,
}) => {
  const { lastRefresh, timeSinceRefresh, refreshSandbox, isRefreshing, nextRefreshIn } = useSandboxAutoscale();

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimeUntilRefresh = (seconds: number): string => {
    if (seconds <= 0) return 'Rafraîchissement imminent...';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Button
          size="sm"
          variant="ghost"
          onClick={refreshSandbox}
          disabled={isRefreshing}
          className="h-6 px-2"
          data-testid="button-refresh-sandbox-compact"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
        {showNextRefresh && nextRefreshIn > 0 && (
          <span className="text-xs text-gray-500">
            Auto: {formatTimeUntilRefresh(nextRefreshIn)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">
                Sandbox Autoscale Actif
              </span>
            </div>
            <div className="text-xs text-blue-700">
              Dernière actualisation: {formatTime(timeSinceRefresh)} ago
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {showNextRefresh && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Clock className="w-3 h-3" />
                <span>
                  Prochaine auto-actualisation: {formatTimeUntilRefresh(nextRefreshIn)}
                </span>
              </div>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={refreshSandbox}
              disabled={isRefreshing}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              data-testid="button-refresh-sandbox"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Actualisation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Actualiser maintenant
                </>
              )}
            </Button>
          </div>
        </div>
        
        {isRefreshing && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-700">
            <CheckCircle className="w-3 h-3" />
            <span>Suppression des doublons et actualisation des données...</span>
          </div>
        )}
        
        <div className="mt-3 text-xs text-blue-600">
          <strong>Fonctionnalités Autoscale:</strong>
          <ul className="ml-4 mt-1 space-y-0.5">
            <li>✓ Actualisation automatique toutes les 5 minutes</li>
            <li>✓ Prévention des duplications de logs</li>
            <li>✓ Nettoyage automatique du cache sandbox</li>
            <li>✓ Synchronisation des données en temps réel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SandboxAutoscaleIndicator;