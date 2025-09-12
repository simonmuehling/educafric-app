import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  Zap, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Activity,
  Timer,
  MemoryStick
} from 'lucide-react';
import { deviceDetector } from '../../utils/deviceDetector';
import { healthMonitorMigration } from '../../services/HealthMonitorMigration';

const LowEndDeviceOptimizer: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState(deviceDetector.getCapabilities());
  const [optimizationProfile, setOptimizationProfile] = useState(deviceDetector.getOptimizationProfile());
  const [connectionState, setConnectionState] = useState(healthMonitorMigration.getConnectionState());
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [telemetry, setTelemetry] = useState(healthMonitorMigration.getTelemetry());
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const updateStats = async () => {
      const battery = await deviceDetector.getBatteryInfo();
      setBatteryInfo(battery);
      setFallbackStats(connectionFallback.getOfflineStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    // Écouter les changements de connexion
    const handleStateChange = (state: any) => {
      setConnectionState(state);
    };

    pwaConnectionManager.addStateListener(handleStateChange);

    return () => {
      clearInterval(interval);
      pwaConnectionManager.removeStateListener(handleStateChange);
    };
  }, []);

  const runOptimizationTest = async () => {
    setIsOptimizing(true);
    
    try {
      console.log('[OPTIMIZATION_TEST] 🧪 Début des tests d\'optimisation');
      
      // Tester la détection d'appareil
      const capabilities = deviceDetector.getCapabilities();
      console.log('[OPTIMIZATION_TEST] 📱 Capacités détectées:', capabilities);
      
      // Tester la connexion
      const connected = await pwaConnectionManager.checkConnection();
      console.log('[OPTIMIZATION_TEST] 🌐 Test de connexion:', connected);
      
      // Tester le fallback
      connectionFallback.forceReconnect();
      
      // Simuler une action hors ligne
      if (connectionFallback.isOfflineMode()) {
        connectionFallback.queueOfflineAction({
          type: 'test_action',
          data: { message: 'Test d\'action hors ligne' }
        });
      }
      
      setTimeout(() => {
        setIsOptimizing(false);
      }, 3000);
      
    } catch (error) {
      console.error('[OPTIMIZATION_TEST] Erreur:', error);
      setIsOptimizing(false);
    }
  };

  const getDeviceTypeIcon = () => {
    if (!deviceInfo) return <Smartphone className="w-5 h-5" />;
    
    switch (deviceInfo.supportLevel) {
      case 'basic':
        return <Smartphone className="w-5 h-5 text-orange-500" />;
      case 'advanced':
        return <Smartphone className="w-5 h-5 text-green-500" />;
      default:
        return <Smartphone className="w-5 h-5 text-blue-500" />;
    }
  };

  const getConnectionQualityColor = () => {
    switch (connectionState.quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'poor': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!deviceInfo || !optimizationProfile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-5 h-5 animate-spin" />
            <span>Analyse de l'appareil en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-500" />
            <span>Optimiseur PWA pour Smartphones Africains</span>
          </CardTitle>
          <CardDescription>
            Système d'optimisation automatique pour améliorer la stabilité des connexions PWA sur les appareils de basse gamme
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Device Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getDeviceTypeIcon()}
              <span>Information Appareil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">RAM Estimée</label>
                <div className="flex items-center space-x-2">
                  <MemoryStick className="w-4 h-4" />
                  <span className="text-lg font-bold">{deviceInfo.ram}GB</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Type d'appareil</label>
                <Badge variant={deviceInfo.isLowEnd ? 'destructive' : 'default'}>
                  {deviceInfo.isLowEnd ? 'Basse gamme' : 'Standard+'}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Vitesse réseau</label>
                <Badge variant={deviceInfo.networkSpeed === 'slow' ? 'secondary' : 'default'}>
                  {deviceInfo.networkSpeed === 'slow' ? 'Lente' : 
                   deviceInfo.networkSpeed === 'medium' ? 'Moyenne' : 'Rapide'}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Support</label>
                <Badge variant="outline">
                  {deviceInfo.supportLevel === 'basic' ? 'Basique' : 
                   deviceInfo.supportLevel === 'advanced' ? 'Avancé' : 'Standard'}
                </Badge>
              </div>
            </div>

            {batteryInfo && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Batterie {batteryInfo.charging ? '(En charge)' : ''}
                </label>
                <div className="flex items-center space-x-3">
                  <Battery className={`w-5 h-5 ${batteryInfo.level > 20 ? 'text-green-500' : 'text-red-500'}`} />
                  <Progress value={batteryInfo.level} className="flex-1" />
                  <span className="text-sm font-medium">{batteryInfo.level}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5" />
              <span>État de la Connexion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Qualité de connexion</label>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getConnectionQualityColor()}`}></div>
                <span className="font-medium capitalize">{connectionState.quality}</span>
                <Badge variant={connectionState.isConnected ? 'default' : 'destructive'}>
                  {connectionState.isConnected ? 'Connecté' : 'Déconnecté'}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Mode appareil</label>
              <Badge variant="outline">{connectionState.deviceMode}</Badge>
            </div>

            {connectionState.retryCount > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Tentatives de reconnexion</label>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>{connectionState.retryCount}/5</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Profil d'Optimisation Actif</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Intervalle Ping</label>
              <div className="flex items-center space-x-1">
                <Timer className="w-4 h-4" />
                <span className="font-bold">{Math.round(optimizationProfile.pingInterval / 1000)}s</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Tentatives Max</label>
              <span className="font-bold">{optimizationProfile.maxRetries}</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Cache Max</label>
              <span className="font-bold">{optimizationProfile.maxCacheSize}MB</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Background Sync</label>
              {optimizationProfile.enableBackgroundSync ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fallback Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Statistiques de Récupération</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Actions en attente</label>
              <span className="text-2xl font-bold text-blue-600">{fallbackStats.actionsCount}</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Temps hors ligne</label>
              <span className="text-2xl font-bold text-orange-600">
                {fallbackStats.offlineTime > 0 ? `${Math.round(fallbackStats.offlineTime / 1000)}s` : '0s'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Button */}
      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={runOptimizationTest} 
            disabled={isOptimizing}
            className="w-full"
            size="lg"
          >
            {isOptimizing ? (
              <Activity className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            {isOptimizing ? 'Test en cours...' : 'Tester les Optimisations'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LowEndDeviceOptimizer;