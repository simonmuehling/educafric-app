import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCircle, XCircle, AlertTriangle, Zap, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import FCM and real-time notifications
import { enableFCMNotifications, testFCMNotification } from '@/services/fcmNotifications';
import RealTimeNotifications from '@/services/realTimeNotifications';

interface FCMStatus {
  supported: boolean;
  permission: string;
  tokenRegistered: boolean;
  mode: 'fcm' | 'polling' | 'disabled';
  error?: string;
}

export default function FCMTestPage() {
  const [fcmStatus, setFCMStatus] = useState<FCMStatus>({
    supported: false,
    permission: 'default',
    tokenRegistered: false,
    mode: 'disabled'
  });
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { toast } = useToast();

  // Check initial FCM status
  useEffect(() => {
    checkFCMStatus();
  }, []);

  const checkFCMStatus = async () => {
    try {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      const permission = Notification.permission;
      const realTimeService = RealTimeNotifications.getInstance();
      const mode = realTimeService.getNotificationMode();

      setFCMStatus({
        supported,
        permission,
        tokenRegistered: mode === 'fcm',
        mode
      });

      addTestResult(`📊 Status check - FCM supported: ${supported}, Permission: ${permission}, Mode: ${mode}`);
    } catch (error: any) {
      console.error('FCM status check failed:', error);
      setFCMStatus(prev => ({ ...prev, error: error.message }));
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)]);
  };

  const handleEnableFCM = async () => {
    setLoading(true);
    addTestResult('🚀 Starting FCM enablement...');

    try {
      // Mock user ID for testing (in real app, get from auth context)
      const testUserId = 999999; // Carine's ID for testing
      
      const result = await enableFCMNotifications(testUserId);
      
      if (result.success) {
        addTestResult('✅ FCM enabled successfully!');
        addTestResult(`📱 Token registered: ${result.token?.substring(0, 20)}...`);
        
        // Initialize real-time notifications with FCM
        const realTimeService = RealTimeNotifications.getInstance();
        await realTimeService.connect(testUserId);
        
        toast({
          title: "FCM Activé",
          description: "Firebase Cloud Messaging a été activé avec succès.",
        });
        
        await checkFCMStatus();
      } else {
        addTestResult(`❌ FCM enablement failed: ${result.error}`);
        toast({
          title: "Échec FCM",
          description: result.error || "Impossible d'activer FCM",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      addTestResult(`💥 Error during FCM enablement: ${error.message}`);
      toast({
        title: "Erreur FCM",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setLoading(true);
    addTestResult('📤 Sending test notification via FCM...');

    try {
      const testUserId = 999999; // Carine's ID for testing
      await testFCMNotification(
        testUserId,
        '🧪 Test FCM - EDUCAFRIC',
        'Cette notification a été envoyée via Firebase Cloud Messaging!'
      );
      
      addTestResult('✅ Test notification sent successfully via FCM!');
      toast({
        title: "Notification Envoyée",
        description: "La notification de test FCM a été envoyée avec succès.",
      });
    } catch (error: any) {
      addTestResult(`❌ Failed to send test notification: ${error.message}`);
      toast({
        title: "Échec de l'envoi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestRealTimeService = async () => {
    setLoading(true);
    addTestResult('🔧 Testing real-time notification service...');

    try {
      const realTimeService = RealTimeNotifications.getInstance();
      const success = await realTimeService.testNotification('FCM test from real-time service');
      
      if (success) {
        addTestResult('✅ Real-time service FCM test successful!');
        toast({
          title: "Test Réussi",
          description: "Le service de notifications en temps réel fonctionne.",
        });
      } else {
        addTestResult('❌ Real-time service FCM test failed');
        toast({
          title: "Test Échoué",
          description: "Le service de notifications a échoué.",
          variant: "destructive",
        });
      }
      
      await checkFCMStatus();
    } catch (error: any) {
      addTestResult(`💥 Real-time service test error: ${error.message}`);
      toast({
        title: "Erreur de Test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
    }
    if (status === 'granted') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'denied') return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'fcm': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'polling': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" data-testid="page-fcm-test">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold" data-testid="text-title">
              Test FCM - Firebase Cloud Messaging
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-subtitle">
            Interface de test pour les notifications push FCM d'EDUCAFRIC
          </p>
        </div>

        {/* FCM Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Status FCM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Navigateur supporté</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(fcmStatus.supported)}
                  <span className="text-sm font-medium">
                    {fcmStatus.supported ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Permission notification</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(fcmStatus.permission)}
                  <span className="text-sm font-medium capitalize">
                    {fcmStatus.permission}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Token FCM enregistré</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(fcmStatus.tokenRegistered)}
                  <span className="text-sm font-medium">
                    {fcmStatus.tokenRegistered ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Mode notification</span>
                <Badge className={getModeColor(fcmStatus.mode)} data-testid={`badge-mode-${fcmStatus.mode}`}>
                  {fcmStatus.mode.toUpperCase()}
                </Badge>
              </div>
            </div>

            {fcmStatus.error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{fcmStatus.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Actions de Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleEnableFCM}
                disabled={loading}
                className="h-12"
                data-testid="button-enable-fcm"
              >
                <Bell className="w-4 h-4 mr-2" />
                {loading ? 'Activation...' : 'Activer FCM'}
              </Button>

              <Button
                onClick={handleSendTestNotification}
                disabled={loading || !fcmStatus.tokenRegistered}
                variant="secondary"
                className="h-12"
                data-testid="button-send-test"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {loading ? 'Envoi...' : 'Test Notification'}
              </Button>

              <Button
                onClick={handleTestRealTimeService}
                disabled={loading}
                variant="outline"
                className="h-12"
                data-testid="button-test-service"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? 'Test...' : 'Test Service'}
              </Button>
            </div>
            
            <Button
              onClick={checkFCMStatus}
              disabled={loading}
              variant="ghost"
              className="w-full"
              data-testid="button-refresh-status"
            >
              🔄 Actualiser le Status
            </Button>
          </CardContent>
        </Card>

        {/* Test Results Card */}
        <Card>
          <CardHeader>
            <CardTitle>Journal des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto" data-testid="log-results">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun test effectué. Cliquez sur les boutons ci-dessus pour commencer.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg text-sm font-mono"
                    data-testid={`log-entry-${index}`}
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>1. Activer FCM :</strong> Cliquez sur "Activer FCM" pour demander les permissions et enregistrer le token.</p>
              <p><strong>2. Test Notification :</strong> Envoyez une notification de test via FCM.</p>
              <p><strong>3. Test Service :</strong> Testez le service de notifications en temps réel.</p>
              <p><strong>4. Vérifier :</strong> Vérifiez que les notifications arrivent bien en temps réel.</p>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p><strong>Note :</strong> Cette page teste FCM avec l'utilisateur Carine (ID: 999999). 
                 En mode FCM, le polling toutes les 10 secondes est remplacé par des notifications push instantanées.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}