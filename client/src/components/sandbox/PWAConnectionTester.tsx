import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Smartphone,
  Monitor,
  RefreshCw,
  Activity,
  Download
} from 'lucide-react';
import { pwaConnectionManager } from '@/services/PWAConnectionManager';
import ConnectionStatusIndicator from '@/components/pwa/ConnectionStatusIndicator';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';

interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastPingTime: number;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

const PWAConnectionTester: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    pwaConnectionManager.getConnectionState()
  );
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleStateChange = (state: ConnectionState) => {
      setConnectionState(state);
      logTestResult(`Connexion mise à jour: ${state.quality} (${state.isConnected ? 'Connecté' : 'Déconnecté'})`);
    };

    pwaConnectionManager.addStateListener(handleStateChange);

    return () => {
      pwaConnectionManager.removeStateListener(handleStateChange);
    };
  }, []);

  const logTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [
      { time: timestamp, message, type: 'info' },
      ...prev.slice(0, 19) // Garder seulement les 20 derniers
    ]);
  };

  const testConnection = async () => {
    setIsTesting(true);
    logTestResult('🧪 Test de connexion démarré...');
    
    try {
      const isConnected = await pwaConnectionManager.checkConnection();
      logTestResult(`✅ Test réussi - Connexion: ${isConnected ? 'Active' : 'Inactive'}`);
    } catch (error) {
      logTestResult(`❌ Test échoué: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const simulateNotification = () => {
    const testNotif = {
      id: `test_${Date.now()}`,
      title: 'Test EducAfric',
      message: 'Notification de test pour vérifier la connexion PWA',
      type: 'test',
      priority: 'normal',
      timestamp: Date.now()
    };

    pwaConnectionManager.queueNotification(testNotif);
    setNotificationQueue(prev => [testNotif, ...prev.slice(0, 9)]);
    logTestResult('📨 Notification de test ajoutée à la file');
  };

  const simulateOffline = () => {
    logTestResult('📱 Simulation mode hors ligne (réduction qualité)');
    // En mode réel, cela serait géré par l'événement navigator offline
  };

  const getStatusIcon = () => {
    if (!connectionState.isOnline) {
      return <WifiOff className="w-5 h-5 text-red-500" />;
    }

    if (!connectionState.isConnected) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }

    switch (connectionState.quality) {
      case 'excellent':
        return <Signal className="w-5 h-5 text-green-500" />;
      case 'good':
        return <SignalHigh className="w-5 h-5 text-green-400" />;
      case 'poor':
        return <SignalMedium className="w-5 h-5 text-yellow-500" />;
      default:
        return <SignalLow className="w-5 h-5 text-red-500" />;
    }
  };

  const getQualityColor = () => {
    switch (connectionState.quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'poor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Testeur de Connexion PWA EducAfric</h1>
          <p className="text-gray-600">
            Testez et surveillez la qualité de connexion pour les notifications push
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <Badge className={`px-3 py-1 ${getQualityColor()}`}>
            {connectionState.quality.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">État Connexion</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="install">Installation</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* État principal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Statut Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Internet:</span>
                  <div className="flex items-center gap-1">
                    {connectionState.isOnline ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm">Connecté</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-sm">Déconnecté</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Serveur:</span>
                  <div className="flex items-center gap-1">
                    {connectionState.isConnected ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm">Actif</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-600 text-sm">Reconnexion</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Qualité:</span>
                  <Badge className={getQualityColor()}>
                    {connectionState.quality}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Métriques */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Métriques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dernière vérif:</span>
                  <span className="text-sm text-gray-600">
                    {connectionState.lastPingTime ? 
                      `${Math.floor((Date.now() - connectionState.lastPingTime) / 1000)}s` : 
                      'Jamais'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Tentatives:</span>
                  <span className="text-sm text-gray-600">
                    {connectionState.retryCount}/5
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">File notif:</span>
                  <span className="text-sm text-gray-600">
                    {notificationQueue.length} en attente
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testConnection}
                  disabled={isTesting}
                  className="w-full"
                  size="sm"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Signal className="w-4 h-4 mr-2" />
                      Tester connexion
                    </>
                  )}
                </Button>

                <Button 
                  onClick={simulateNotification}
                  variant="secondary"
                  className="w-full"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Test notification
                </Button>

                <Button 
                  onClick={simulateOffline}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Simuler hors ligne
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal des Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun test effectué. Cliquez sur "Tester connexion" pour commencer.
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500 min-w-[60px]">
                        {result.time}
                      </span>
                      <span className="text-sm">{result.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File de Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notificationQueue.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucune notification en file. Cliquez sur "Test notification" pour en ajouter.
                  </p>
                ) : (
                  notificationQueue.map((notif, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{notif.title}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {notif.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notif.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="install" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Installation PWA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PWAInstallPrompt />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Indicateur de Connexion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  L'indicateur de connexion apparaît automatiquement en haut à droite 
                  pour surveiller l'état de la connexion en temps réel.
                </p>
                <Button 
                  onClick={() => {
                    // L'indicateur est déjà visible, juste un message
                    logTestResult('👀 Indicateur de connexion visible en haut à droite');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Signal className="w-4 h-4 mr-2" />
                  Voir indicateur
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Indicateur toujours visible */}
      <ConnectionStatusIndicator />
    </div>
  );
};

export default PWAConnectionTester;