import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  MessageSquare, 
  Settings,
  Bell,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface PWAIssue {
  type: 'permission_denied' | 'service_worker_failed' | 'network_unstable' | 'browser_unsupported';
  severity: 'low' | 'medium' | 'high';
  message: string;
  solution: string;
  autoFixable: boolean;
}

interface AutoPWARecoveryProps {
  userId?: number;
  onRecoveryComplete?: () => void;
}

const AutoPWARecovery: React.FC<AutoPWARecoveryProps> = ({ userId, onRecoveryComplete }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [issues, setIssues] = useState<PWAIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const text = {
    fr: {
      title: 'Diagnostic PWA Intelligent',
      subtitle: 'Détection et réparation automatique',
      scanSystem: 'Analyser le système',
      scanning: 'Analyse en cours...',
      noIssues: 'Aucun problème détecté',
      issuesFound: 'problèmes détectés',
      autoFix: 'Réparation automatique',
      manualFix: 'Action manuelle requise',
      lastScan: 'Dernière analyse',
      fixAll: 'Tout réparer',
      configureSMS: 'Configurer SMS',
      
      issues: {
        permission_denied: {
          message: 'Notifications bloquées par le navigateur',
          solution: 'Réactiver dans les paramètres du navigateur'
        },
        service_worker_failed: {
          message: 'Service Worker PWA défaillant',
          solution: 'Réinitialisation automatique du service'
        },
        network_unstable: {
          message: 'Connexion réseau instable détectée',
          solution: 'Configuration adaptée pour réseau faible'
        },
        browser_unsupported: {
          message: 'Navigateur ne supporte pas PWA complètement',
          solution: 'Fallback vers notifications SMS recommandé'
        }
      },
      
      severity: {
        low: 'Mineur',
        medium: 'Modéré', 
        high: 'Critique'
      }
    },
    en: {
      title: 'Smart PWA Diagnostics',
      subtitle: 'Automatic detection and repair',
      scanSystem: 'Scan system',
      scanning: 'Scanning...',
      noIssues: 'No issues detected',
      issuesFound: 'issues found',
      autoFix: 'Auto-repair',
      manualFix: 'Manual action required',
      lastScan: 'Last scan',
      fixAll: 'Fix all',
      configureSMS: 'Configure SMS',
      
      issues: {
        permission_denied: {
          message: 'Notifications blocked by browser',
          solution: 'Re-enable in browser settings'
        },
        service_worker_failed: {
          message: 'PWA Service Worker failed',
          solution: 'Automatic service reset'
        },
        network_unstable: {
          message: 'Unstable network connection detected',
          solution: 'Configure for weak network adaptation'
        },
        browser_unsupported: {
          message: 'Browser doesn\'t fully support PWA',
          solution: 'SMS notification fallback recommended'
        }
      },
      
      severity: {
        low: 'Minor',
        medium: 'Moderate',
        high: 'Critical'
      }
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    // Écouter les événements de problèmes PWA
    const handlePWAFailed = (event: CustomEvent) => {
      console.log('[AUTO_RECOVERY] PWA setup failed:', event.detail);
      scanForIssues();
    };

    const handlePermissionDenied = (event: CustomEvent) => {
      console.log('[AUTO_RECOVERY] Permission denied:', event.detail);
      scanForIssues();
    };

    window.addEventListener('pwa-setup-failed', handlePWAFailed as EventListener);
    window.addEventListener('pwa-permission-denied', handlePermissionDenied as EventListener);

    // Scan initial au montage
    scanForIssues();

    return () => {
      window.removeEventListener('pwa-setup-failed', handlePWAFailed as EventListener);
      window.removeEventListener('pwa-permission-denied', handlePermissionDenied as EventListener);
    };
  }, []);

  const scanForIssues = async () => {
    setIsScanning(true);
    const detectedIssues: PWAIssue[] = [];

    try {
      // 1. Vérifier support PWA
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        detectedIssues.push({
          type: 'browser_unsupported',
          severity: 'high',
          message: t.issues.browser_unsupported.message,
          solution: t.issues.browser_unsupported.solution,
          autoFixable: false
        });
      }

      // 2. Vérifier permissions notifications
      if ('Notification' in window && Notification.permission === 'denied') {
        detectedIssues.push({
          type: 'permission_denied',
          severity: 'high',
          message: t.issues.permission_denied.message,
          solution: t.issues.permission_denied.solution,
          autoFixable: false
        });
      }

      // 3. Vérifier Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (!registration || !registration.active) {
            detectedIssues.push({
              type: 'service_worker_failed',
              severity: 'medium',
              message: t.issues.service_worker_failed.message,
              solution: t.issues.service_worker_failed.solution,
              autoFixable: true
            });
          }
        } catch (error) {
          detectedIssues.push({
            type: 'service_worker_failed',
            severity: 'medium',
            message: t.issues.service_worker_failed.message,
            solution: t.issues.service_worker_failed.solution,
            autoFixable: true
          });
        }
      }

      // 4. Vérifier qualité réseau
      const connectionQuality = await checkNetworkQuality();
      if (connectionQuality === 'poor') {
        detectedIssues.push({
          type: 'network_unstable',
          severity: 'low',
          message: t.issues.network_unstable.message,
          solution: t.issues.network_unstable.solution,
          autoFixable: true
        });
      }

      setIssues(detectedIssues);
      setLastScan(new Date());
      
      console.log('[AUTO_RECOVERY] ✅ Scan completed:', detectedIssues.length, 'issues found');
      
    } catch (error) {
      console.error('[AUTO_RECOVERY] ❌ Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // OPTIMIZED: Cache network quality checks and debounce to prevent excessive requests
  const networkQualityCache = React.useRef<{ quality: 'good' | 'fair' | 'poor'; timestamp: number } | null>(null);
  const isCheckingQuality = React.useRef(false);
  
  const checkNetworkQuality = async (): Promise<'good' | 'fair' | 'poor'> => {
    // OPTIMIZATION: Prevent concurrent quality checks
    if (isCheckingQuality.current) {
      return networkQualityCache.current?.quality || 'poor';
    }
    
    // OPTIMIZATION: Use cached result if less than 10 minutes old
    const now = Date.now();
    if (networkQualityCache.current && (now - networkQualityCache.current.timestamp) < 600000) {
      return networkQualityCache.current.quality;
    }
    
    isCheckingQuality.current = true;
    
    try {
      const start = Date.now();
      await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      const latency = Date.now() - start;
      
      let quality: 'good' | 'fair' | 'poor';
      if (latency < 300) quality = 'good';
      else if (latency < 800) quality = 'fair';
      else quality = 'poor';
      
      // Cache the result
      networkQualityCache.current = { quality, timestamp: now };
      return quality;
    } catch {
      const quality = 'poor';
      networkQualityCache.current = { quality, timestamp: now };
      return quality;
    } finally {
      isCheckingQuality.current = false;
    }
  };

  const autoFixIssues = async () => {
    setIsFixing(true);
    let fixedCount = 0;

    try {
      for (const issue of issues) {
        if (issue.autoFixable) {
          switch (issue.type) {
            case 'service_worker_failed':
              await fixServiceWorker();
              fixedCount++;
              break;
              
            case 'network_unstable':
              await optimizeForSlowNetwork();
              fixedCount++;
              break;
          }
        }
      }

      if (fixedCount > 0) {
        toast({
          title: "Réparations automatiques",
          description: `${fixedCount} problème(s) réparé(s) automatiquement`
        });
        
        // Re-scanner après réparations
        setTimeout(() => {
          scanForIssues();
        }, 2000);
      }

    } catch (error) {
      console.error('[AUTO_RECOVERY] ❌ Auto-fix failed:', error);
      toast({
        title: "Erreur de réparation",
        description: "Certaines réparations automatiques ont échoué",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  const fixServiceWorker = async (): Promise<void> => {
    try {
      // Désinscrire et réinscrire le service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Réenregistrer
      await navigator.serviceWorker.register('/sw.js');
      console.log('[AUTO_RECOVERY] ✅ Service Worker reset successfully');
    } catch (error) {
      console.error('[AUTO_RECOVERY] ❌ Service Worker reset failed:', error);
      throw error;
    }
  };

  const optimizeForSlowNetwork = async (): Promise<void> => {
    try {
      // Activer mode réseau lent
      localStorage.setItem('pwa_network_mode', 'slow');
      
      // Réduire fréquence des pings
      window.dispatchEvent(new CustomEvent('network-optimize', {
        detail: { mode: 'conservative', reason: 'auto_recovery' }
      }));
      
      console.log('[AUTO_RECOVERY] ✅ Network optimization applied');
    } catch (error) {
      console.error('[AUTO_RECOVERY] ❌ Network optimization failed:', error);
      throw error;
    }
  };

  const configureSMSFallback = async () => {
    try {
      await fetch('/api/notifications/configure-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferredMethod: 'sms',
          reason: 'pwa_issues_detected',
          issues: issues.map(i => i.type)
        })
      });

      toast({
        title: "SMS configuré",
        description: "Notifications par SMS activées comme alternative"
      });

      if (onRecoveryComplete) onRecoveryComplete();
    } catch (error) {
      console.error('[AUTO_RECOVERY] ❌ SMS fallback configuration failed:', error);
      toast({
        title: "Erreur SMS",
        description: "Impossible de configurer les SMS",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: PWAIssue['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: PWAIssue['severity']) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <RefreshCw className="w-4 h-4" />;
      case 'low': return <Settings className="w-4 h-4" />;
    }
  };

  const autoFixableIssues = issues.filter(issue => issue.autoFixable);
  const manualIssues = issues.filter(issue => !issue.autoFixable);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header de diagnostic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </CardTitle>
          
          <div className="flex items-center justify-between">
            <Button
              onClick={scanForIssues}
              disabled={isScanning}
              variant="outline"
              size="sm"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              {isScanning ? t.scanning : t.scanSystem}
            </Button>
            
            {lastScan && (
              <span className="text-xs text-gray-500">
                {t.lastScan}: {lastScan.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {issues.length === 0 && !isScanning && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {t.noIssues}
              </AlertDescription>
            </Alert>
          )}
          
          {issues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="destructive">
                  {issues.length} {t.issuesFound}
                </Badge>
                
                {autoFixableIssues.length > 0 && (
                  <Button
                    onClick={autoFixIssues}
                    disabled={isFixing}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isFixing ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {t.fixAll} ({autoFixableIssues.length})
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des problèmes */}
      {issues.length > 0 && (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <Card key={index} className="border-l-4 border-l-orange-400">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                    {getSeverityIcon(issue.severity)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">{issue.message}</h4>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {t.severity[issue.severity]}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600">{issue.solution}</p>
                    
                    <div className="flex items-center space-x-2">
                      {issue.autoFixable ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.autoFix}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {t.manualFix}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions de récupération */}
      {manualIssues.length > 0 && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Solution de secours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Des problèmes PWA ne peuvent pas être résolus automatiquement. 
              Configurez les notifications SMS comme alternative fiable.
            </p>
            
            <Button
              onClick={configureSMSFallback}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t.configureSMS}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoPWARecovery;