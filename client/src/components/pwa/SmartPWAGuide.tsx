import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Smartphone, 
  Check, 
  X, 
  AlertTriangle, 
  Info,
  ChevronRight,
  RefreshCw,
  Settings,
  Download,
  Lock,
  Unlock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';

interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  isMobile: boolean;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
  helpText?: string;
}

const SmartPWAGuide: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { language } = useLanguage();
  const { permission, supported, requestPermission } = useNotificationPermissions();
  const [currentStep, setCurrentStep] = useState(0);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<GuideStep[]>([]);

  const text = {
    fr: {
      title: 'Configuration Notifications Intelligente',
      subtitle: 'Guide adapté à votre appareil',
      detecting: 'Détection de votre appareil...',
      step: 'Étape',
      of: 'sur',
      continue: 'Continuer',
      retry: 'Réessayer',
      complete: 'Terminé !',
      skip: 'Ignorer',
      help: 'Aide',
      autoConfig: 'Configuration automatique',
      manualSteps: 'Étapes manuelles requises',
      troubleshoot: 'Résoudre les problèmes',
      
      steps: {
        detect: {
          title: 'Détection appareil',
          description: 'Analyse de votre navigateur et appareil',
        },
        permission: {
          title: 'Autorisation navigateur',
          description: 'Activez les notifications dans votre navigateur',
        },
        install: {
          title: 'Installation PWA',
          description: 'Ajoutez Educafric à votre écran d\'accueil',
        },
        test: {
          title: 'Test final',
          description: 'Vérification du bon fonctionnement',
        },
        fallback: {
          title: 'Alternative SMS',
          description: 'Configuration de secours par SMS',
        }
      },
      
      browser: {
        chrome: 'Chrome Android',
        firefox: 'Firefox Mobile',
        safari: 'Safari iPhone',
        edge: 'Edge Mobile',
        samsung: 'Samsung Internet',
        unknown: 'Navigateur mobile'
      },
      
      instructions: {
        chrome: {
          permission: 'Touchez "Autoriser" quand la popup apparaît',
          install: 'Touchez les 3 points → "Ajouter à l\'écran d\'accueil"',
          blocked: 'Icône cadenas → Notifications → Autoriser'
        },
        safari: {
          permission: 'Touchez "Autoriser" dans la popup Safari',
          install: 'Bouton Partage → "Sur l\'écran d\'accueil"',
          blocked: 'Réglages → Safari → Notifications → Autoriser'
        },
        firefox: {
          permission: 'Touchez "Autoriser" dans la notification',
          install: 'Menu → "Installer" ou "Ajouter à l\'écran d\'accueil"',
          blocked: 'Menu → Paramètres → Notifications → Autoriser'
        }
      }
    },
    en: {
      title: 'Smart Notification Setup',
      subtitle: 'Guide adapted to your device',
      detecting: 'Detecting your device...',
      step: 'Step',
      of: 'of',
      continue: 'Continue',
      retry: 'Retry',
      complete: 'Complete!',
      skip: 'Skip',
      help: 'Help',
      autoConfig: 'Automatic configuration',
      manualSteps: 'Manual steps required',
      troubleshoot: 'Troubleshoot',
      
      steps: {
        detect: {
          title: 'Device detection',
          description: 'Analyzing your browser and device',
        },
        permission: {
          title: 'Browser permission',
          description: 'Enable notifications in your browser',
        },
        install: {
          title: 'PWA installation',
          description: 'Add Educafric to your home screen',
        },
        test: {
          title: 'Final test',
          description: 'Verify everything works correctly',
        },
        fallback: {
          title: 'SMS alternative',
          description: 'Backup SMS configuration',
        }
      },
      
      browser: {
        chrome: 'Chrome Android',
        firefox: 'Firefox Mobile',
        safari: 'Safari iPhone',
        edge: 'Edge Mobile',
        samsung: 'Samsung Internet',
        unknown: 'Mobile Browser'
      },
      
      instructions: {
        chrome: {
          permission: 'Tap "Allow" when the popup appears',
          install: 'Tap 3 dots → "Add to Home screen"',
          blocked: 'Lock icon → Notifications → Allow'
        },
        safari: {
          permission: 'Tap "Allow" in the Safari popup',
          install: 'Share button → "Add to Home Screen"',
          blocked: 'Settings → Safari → Notifications → Allow'
        },
        firefox: {
          permission: 'Tap "Allow" in the notification',
          install: 'Menu → "Install" or "Add to Home screen"',
          blocked: 'Menu → Settings → Notifications → Allow'
        }
      }
    }
  };

  const t = text[language as keyof typeof text];

  useEffect(() => {
    detectBrowserAndDevice();
  }, []);

  useEffect(() => {
    if (browserInfo) {
      generateSteps();
    }
  }, [browserInfo, permission]);

  const detectBrowserAndDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    let browserName = 'unknown';
    let version = '';
    
    // Détection navigateur mobile
    if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
      browserName = 'chrome';
    } else if (userAgent.includes('firefox') && userAgent.includes('mobile')) {
      browserName = 'firefox';
    } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
      browserName = 'safari';
    } else if (userAgent.includes('edg') && userAgent.includes('mobile')) {
      browserName = 'edge';
    } else if (userAgent.includes('samsungbrowser')) {
      browserName = 'samsung';
    }
    
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setBrowserInfo({
      name: browserName,
      version,
      platform: platform.includes('android') ? 'android' : 
                platform.includes('iphone') || platform.includes('ipad') ? 'ios' : 'unknown',
      isMobile
    });
  };

  const generateSteps = () => {
    const newSteps: GuideStep[] = [
      {
        id: 'detect',
        title: t.steps.detect.title,
        description: t.steps.detect.description,
        icon: <Smartphone className="w-5 h-5" />,
        completed: browserInfo !== null
      },
      {
        id: 'permission',
        title: t.steps.permission.title,
        description: t.steps.permission.description,
        icon: permission === 'granted' ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5" />,
        completed: permission === 'granted',
        action: handleRequestPermission,
        helpText: getPermissionHelp()
      },
      {
        id: 'install',
        title: t.steps.install.title,
        description: t.steps.install.description,
        icon: <Download className="w-5 h-5" />,
        completed: window.matchMedia('(display-mode: standalone)').matches,
        helpText: getInstallHelp()
      },
      {
        id: 'test',
        title: t.steps.test.title,
        description: t.steps.test.description,
        icon: <Check className="w-5 h-5" />,
        completed: false,
        action: handleTestNotification
      }
    ];

    // Ajouter étape fallback SMS si PWA bloqué
    if (permission === 'denied') {
      newSteps.push({
        id: 'fallback',
        title: t.steps.fallback.title,
        description: t.steps.fallback.description,
        icon: <RefreshCw className="w-5 h-5" />,
        completed: false,
        action: handleSMSFallback
      });
    }

    setSteps(newSteps);
  };

  const getPermissionHelp = (): string => {
    if (!browserInfo) return '';
    
    const browserKey = browserInfo.name as keyof typeof t.instructions;
    const instructions = t.instructions[browserKey] || t.instructions.chrome;
    
    if (permission === 'denied') {
      return instructions.blocked;
    }
    return instructions.permission;
  };

  const getInstallHelp = (): string => {
    if (!browserInfo) return '';
    
    const browserKey = browserInfo.name as keyof typeof t.instructions;
    const instructions = t.instructions[browserKey] || t.instructions.chrome;
    
    return instructions.install;
  };

  const handleRequestPermission = async () => {
    setIsProcessing(true);
    
    try {
      const result = await requestPermission();
      
      if (result === 'granted') {
        // Passer à l'étape suivante
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      } else if (result === 'denied') {
        // Ajouter étape de récupération
        generateSteps();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestNotification = async () => {
    setIsProcessing(true);
    
    try {
      if (permission === 'granted') {
        // Utiliser le service worker pour envoyer une notification test
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'Configuration réussie !',
            options: {
              body: 'Vos notifications Educafric sont maintenant actives',
              icon: '/educafric-logo-128.png',
              tag: 'setup-complete',
              requireInteraction: false
            }
          });
        }
        
        // Marquer l'étape comme terminée
        const updatedSteps = [...steps];
        const testStepIndex = updatedSteps.findIndex(s => s.id === 'test');
        if (testStepIndex >= 0) {
          updatedSteps[testStepIndex].completed = true;
        }
        setSteps(updatedSteps);
        
        // Configuration terminée
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Error testing notification:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSMSFallback = async () => {
    setIsProcessing(true);
    
    try {
      // Configurer fallback SMS
      await fetch('/api/notifications/configure-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredMethod: 'sms',
          reason: 'pwa_blocked'
        })
      });
      
      // Marquer comme terminé
      const updatedSteps = [...steps];
      const fallbackStepIndex = updatedSteps.findIndex(s => s.id === 'fallback');
      if (fallbackStepIndex >= 0) {
        updatedSteps[fallbackStepIndex].completed = true;
      }
      setSteps(updatedSteps);
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error configuring SMS fallback:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const getCompletedStepsCount = () => steps.filter(step => step.completed).length;
  const progressPercentage = (getCompletedStepsCount() / steps.length) * 100;

  if (!supported) {
    return (
      <Alert className="w-full max-w-2xl mx-auto">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          Les notifications PWA ne sont pas supportées sur cet appareil. Utilisation des notifications SMS par défaut.
        </AlertDescription>
      </Alert>
    );
  }

  if (!browserInfo) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">{t.detecting}</p>
        </CardContent>
      </Card>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header avec progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.title}</h2>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
          </CardTitle>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t.step} {currentStep + 1} {t.of} {steps.length}</span>
              <span>{Math.round(progressPercentage)}% complet</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          {/* Info appareil */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Badge variant="outline">
              {t.browser[browserInfo.name as keyof typeof t.browser] || t.browser.unknown}
            </Badge>
            <Badge variant="outline">
              {browserInfo.platform.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Étape courante */}
      {currentStepData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {currentStepData.icon}
              <span>{currentStepData.title}</span>
              {currentStepData.completed && <Check className="w-5 h-5 text-green-500" />}
            </CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentStepData.helpText && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>{currentStepData.helpText}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-3">
              {currentStepData.action && !currentStepData.completed && (
                <Button
                  onClick={currentStepData.action}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    currentStepData.icon
                  )}
                  {currentStepData.title}
                </Button>
              )}
              
              {currentStepData.completed && currentStep < steps.length - 1 && (
                <Button onClick={handleNextStep} className="flex-1">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  {t.continue}
                </Button>
              )}
              
              {currentStepData.completed && currentStep === steps.length - 1 && (
                <Button onClick={onComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  {t.complete}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des étapes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  index === currentStep ? 'bg-blue-50 border border-blue-200' : 
                  step.completed ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300'
                }`}>
                  {step.completed ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartPWAGuide;