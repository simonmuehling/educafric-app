import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  Settings,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import PWANotificationManager from '@/components/shared/PWANotificationManager';
import SmartPWAGuide from './SmartPWAGuide';
import AutoPWARecovery from './AutoPWARecovery';
import { HealthCheckService } from '@/services/HealthCheckService';

interface EnhancedPWAManagerProps {
  userId?: number;
  userRole?: string;
  onConfigurationComplete?: (success: boolean, method: 'pwa' | 'sms') => void;
}

const EnhancedPWAManager: React.FC<EnhancedPWAManagerProps> = ({
  userId,
  userRole,
  onConfigurationComplete
}) => {
  const { language } = useLanguage();
  const { permission, supported } = useNotificationPermissions();
  const [activeTab, setActiveTab] = useState('auto');
  const [configurationStatus, setConfigurationStatus] = useState<'detecting' | 'configuring' | 'completed' | 'failed'>('detecting');
  const [preferredMethod, setPreferredMethod] = useState<'pwa' | 'sms' | null>(null);

  const text = {
    fr: {
      title: 'Configuration Notifications Avancée',
      subtitle: 'Système intelligent adapté aux smartphones africains',
      autoSetup: 'Configuration automatique',
      guided: 'Guide pas-à-pas',
      diagnostic: 'Diagnostic système',
      advanced: 'Paramètres avancés',
      
      status: {
        detecting: 'Détection des capacités...',
        configuring: 'Configuration en cours...',
        completed: 'Configuration terminée',
        failed: 'Configuration échouée'
      },
      
      recommendations: {
        pwa: 'PWA recommandé pour votre appareil',
        sms: 'SMS recommandé pour une fiabilité maximale',
        hybrid: 'Système hybride recommandé'
      }
    },
    en: {
      title: 'Advanced Notification Setup',
      subtitle: 'Smart system adapted for African smartphones',
      autoSetup: 'Automatic setup',
      guided: 'Step-by-step guide',
      diagnostic: 'System diagnostic',
      advanced: 'Advanced settings',
      
      status: {
        detecting: 'Detecting capabilities...',
        configuring: 'Configuring...',
        completed: 'Setup completed',
        failed: 'Setup failed'
      },
      
      recommendations: {
        pwa: 'PWA recommended for your device',
        sms: 'SMS recommended for maximum reliability',
        hybrid: 'Hybrid system recommended'
      }
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    analyzeDeviceCapabilities();
  }, []);

  const analyzeDeviceCapabilities = async () => {
    try {
      // Analyse complète des capacités de l'appareil
      const userAgent = navigator.userAgent.toLowerCase();
      const isLowEndDevice = detectLowEndDevice(userAgent);
      const networkQuality = getNetworkQuality();
      
      // Recommandation intelligente
      if (!supported || permission === 'denied') {
        setPreferredMethod('sms');
        setActiveTab('diagnostic');
      } else if (isLowEndDevice || networkQuality === 'poor') {
        setPreferredMethod('sms');
      } else {
        setPreferredMethod('pwa');
      }
      
      setConfigurationStatus('configuring');
      
    } catch (error) {
      console.error('[ENHANCED_PWA] ❌ Device analysis failed:', error);
      setConfigurationStatus('failed');
      setPreferredMethod('sms');
    }
  };

  const detectLowEndDevice = (userAgent: string): boolean => {
    const lowEndPatterns = [
      'tecno', 'infinix', 'itel', 'smart', 'condor',
      'samsung.*a0', 'samsung.*a1', 'samsung.*j',
      'huawei.*y', 'honor.*8', 'xiaomi.*redmi.*note.*7',
      'android.*4', 'android.*5', 'android.*6'
    ];
    
    return lowEndPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(userAgent)
    );
  };

  // Use centralized HealthCheckService instead of direct API calls
  const healthCheckService = HealthCheckService.getInstance();
  
  const getNetworkQuality = (): 'good' | 'fair' | 'poor' => {
    const result = healthCheckService.getLastResult();
    if (!result || !result.isHealthy) return 'poor';
    
    const latency = result.responseTime;
    if (latency < 300) return 'good';
    else if (latency < 800) return 'fair';
    else return 'poor';
  };

  const handleAutoSetup = async () => {
    setConfigurationStatus('configuring');
    
    try {
      if (preferredMethod === 'pwa' && supported) {
        // Tentative configuration PWA automatique
        const result = await navigator.permissions?.query({ name: 'notifications' as PermissionName });
        
        if (result?.state === 'granted' || permission === 'granted') {
          setConfigurationStatus('completed');
          if (onConfigurationComplete) onConfigurationComplete(true, 'pwa');
        } else {
          // Basculer vers guide interactif
          setActiveTab('guided');
        }
      } else {
        // Configuration SMS directe
        await configureSMSFallback();
        setConfigurationStatus('completed');
        if (onConfigurationComplete) onConfigurationComplete(true, 'sms');
      }
    } catch (error) {
      console.error('[ENHANCED_PWA] ❌ Auto setup failed:', error);
      setConfigurationStatus('failed');
      setActiveTab('diagnostic');
    }
  };

  const configureSMSFallback = async () => {
    await fetch('/api/notifications/configure-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        preferredMethod: 'sms',
        reason: 'auto_recommendation'
      })
    });
  };

  const getRecommendationBadge = () => {
    if (!preferredMethod) return null;
    
    const colors = {
      pwa: 'bg-blue-100 text-blue-800',
      sms: 'bg-green-100 text-green-800'
    };
    
    const icons = {
      pwa: <Smartphone className="w-3 h-3 mr-1" />,
      sms: <MessageSquare className="w-3 h-3 mr-1" />
    };
    
    return (
      <Badge className={colors[preferredMethod]}>
        {icons[preferredMethod]}
        {t.recommendations[preferredMethod]}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Status et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">{t.title}</h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            {getRecommendationBadge()}
          </CardTitle>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-medium">Sécurisé</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-xs font-medium">Rapide</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-xs font-medium">Mobile-first</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interface à onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auto">{t.autoSetup}</TabsTrigger>
          <TabsTrigger value="guided">{t.guided}</TabsTrigger>
          <TabsTrigger value="diagnostic">{t.diagnostic}</TabsTrigger>
          <TabsTrigger value="advanced">{t.advanced}</TabsTrigger>
        </TabsList>

        {/* Configuration automatique */}
        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Configuration intelligente basée sur votre appareil et réseau
                </p>
                
                <Button
                  onClick={handleAutoSetup}
                  disabled={configurationStatus === 'configuring'}
                  className="w-full max-w-md mx-auto"
                  size="lg"
                >
                  {configurationStatus === 'configuring' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      {t.status.configuring}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Démarrer la configuration
                    </>
                  )}
                </Button>
                
                {configurationStatus === 'completed' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      {t.status.completed}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide interactif */}
        <TabsContent value="guided">
          <SmartPWAGuide onComplete={() => {
            setConfigurationStatus('completed');
            if (onConfigurationComplete) onConfigurationComplete(true, 'pwa');
          }} />
        </TabsContent>

        {/* Diagnostic et récupération */}
        <TabsContent value="diagnostic">
          <AutoPWARecovery 
            userId={userId}
            onRecoveryComplete={() => {
              setConfigurationStatus('completed');
              if (onConfigurationComplete) onConfigurationComplete(true, 'sms');
            }}
          />
        </TabsContent>

        {/* Paramètres avancés */}
        <TabsContent value="advanced">
          <PWANotificationManager
            userId={userId}
            userRole={userRole}
            onNotificationPermissionChange={(granted) => {
              if (granted) {
                setConfigurationStatus('completed');
                if (onConfigurationComplete) onConfigurationComplete(true, 'pwa');
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPWAManager;