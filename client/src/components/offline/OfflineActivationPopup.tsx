import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  Download, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone,
  HardDrive,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';

const OFFLINE_ACTIVATION_ACKNOWLEDGED_KEY = 'educafric_offline_activation_acknowledged';
const ACKNOWLEDGEMENT_EXPIRY_DAYS = 30;

interface OfflineActivationPopupProps {
  isOfflineEnabled?: boolean;
  forceShow?: boolean;
  onClose?: () => void;
}

export function OfflineActivationPopup({ 
  isOfflineEnabled = false, 
  forceShow = false,
  onClose 
}: OfflineActivationPopupProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { 
    isOnline, 
    offlineDataReady,
    offlineDataStatus,
    isPreparing,
    prepareOfflineData
  } = useOfflinePremium();

  const [isOpen, setIsOpen] = useState(false);
  const [prepareProgress, setPrepareProgress] = useState(0);
  const [prepareStatus, setPrepareStatus] = useState<'idle' | 'preparing' | 'success' | 'error'>('idle');

  const text = language === 'fr' ? {
    title: 'Préparez votre appareil pour le mode hors ligne',
    subtitle: 'Utilisez Educafric sans connexion Internet',
    
    mainMessage: 'Préparez votre appareil pour utiliser Educafric sans connexion internet. Les données seront stockées localement.',
    
    benefits: {
      title: 'Avantages du mode hors ligne',
      items: [
        'Accédez aux données même sans Internet',
        'Travaillez dans les zones sans réseau',
        'Synchronisation automatique à la reconnexion',
        'Données sécurisées sur votre appareil'
      ]
    },

    requirements: {
      title: 'Ce dont vous avez besoin',
      internet: 'Connexion Internet active',
      storage: 'Espace de stockage disponible (500 Mo - 2 Go)',
      time: 'Quelques minutes pour le téléchargement initial'
    },

    status: {
      online: 'En ligne - Prêt pour la préparation',
      offline: 'Hors ligne - Connexion requise',
      ready: 'Appareil déjà prêt !',
      preparing: 'Préparation en cours...',
      success: 'Préparation terminée avec succès !',
      error: 'Erreur lors de la préparation'
    },

    buttons: {
      prepare: 'Préparer mon appareil',
      preparing: 'Préparation...',
      later: 'Plus tard',
      close: 'Fermer',
      retry: 'Réessayer'
    },

    data: {
      classes: 'Classes',
      students: 'Élèves', 
      teachers: 'Enseignants',
      items: 'éléments prêts'
    },

    tips: {
      title: 'Conseils',
      tip1: 'Reconnectez-vous tous les 2 jours pour synchroniser',
      tip2: 'Les modifications hors ligne sont sauvegardées automatiquement',
      tip3: 'Synchronisation automatique à la reconnexion'
    }
  } : {
    title: 'Prepare your device for offline mode',
    subtitle: 'Use Educafric without Internet connection',
    
    mainMessage: 'Prepare your device to use Educafric without internet connection. Data will be stored locally.',
    
    benefits: {
      title: 'Offline mode benefits',
      items: [
        'Access data even without Internet',
        'Work in areas without network',
        'Automatic sync on reconnection',
        'Data secured on your device'
      ]
    },

    requirements: {
      title: 'What you need',
      internet: 'Active Internet connection',
      storage: 'Available storage space (500 MB - 2 GB)',
      time: 'A few minutes for initial download'
    },

    status: {
      online: 'Online - Ready for preparation',
      offline: 'Offline - Connection required',
      ready: 'Device already ready!',
      preparing: 'Preparing...',
      success: 'Preparation completed successfully!',
      error: 'Error during preparation'
    },

    buttons: {
      prepare: 'Prepare my device',
      preparing: 'Preparing...',
      later: 'Later',
      close: 'Close',
      retry: 'Retry'
    },

    data: {
      classes: 'Classes',
      students: 'Students',
      teachers: 'Teachers',
      items: 'items ready'
    },

    tips: {
      title: 'Tips',
      tip1: 'Reconnect every 2 days to sync',
      tip2: 'Offline changes are saved automatically',
      tip3: 'Automatic sync on reconnection'
    }
  };

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    if (!isOfflineEnabled || !user) {
      setIsOpen(false);
      return;
    }

    const acknowledged = localStorage.getItem(OFFLINE_ACTIVATION_ACKNOWLEDGED_KEY);
    if (acknowledged) {
      const { timestamp, schoolId } = JSON.parse(acknowledged);
      const expiryTime = timestamp + (ACKNOWLEDGEMENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      
      if (Date.now() < expiryTime && schoolId === user.schoolId) {
        if (offlineDataReady) {
          setIsOpen(false);
          return;
        }
      }
    }

    if (!offlineDataReady && isOnline) {
      setIsOpen(true);
    }
  }, [isOfflineEnabled, offlineDataReady, isOnline, forceShow, user]);

  const handlePrepareDevice = async () => {
    setPrepareStatus('preparing');
    setPrepareProgress(0);

    const progressInterval = setInterval(() => {
      setPrepareProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const success = await prepareOfflineData();
      clearInterval(progressInterval);
      setPrepareProgress(100);
      
      if (success) {
        setPrepareStatus('success');
        localStorage.setItem(OFFLINE_ACTIVATION_ACKNOWLEDGED_KEY, JSON.stringify({
          timestamp: Date.now(),
          schoolId: user?.schoolId
        }));
        
        setTimeout(() => {
          setIsOpen(false);
          onClose?.();
        }, 2000);
      } else {
        setPrepareStatus('error');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setPrepareStatus('error');
    }
  };

  const handleClose = () => {
    if (prepareStatus === 'preparing') return;
    
    localStorage.setItem(OFFLINE_ACTIVATION_ACKNOWLEDGED_KEY, JSON.stringify({
      timestamp: Date.now(),
      schoolId: user?.schoolId
    }));
    
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && prepareStatus !== 'preparing') {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-lg bg-white" data-testid="dialog-offline-activation">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <WifiOff className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-green-800">{text.title}</DialogTitle>
              <DialogDescription className="text-green-600">{text.subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Main message */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-green-800 font-medium">{text.mainMessage}</p>
            </div>
          </div>

          {/* Connection status */}
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            isOnline 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            {isOnline ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <span className={isOnline ? 'text-green-800' : 'text-yellow-800'}>
              {offlineDataReady ? text.status.ready : (isOnline ? text.status.online : text.status.offline)}
            </span>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              {text.benefits.title}
            </h4>
            <ul className="space-y-1">
              {text.benefits.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2">{text.requirements.title}</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-blue-500" />
                {text.requirements.internet}
              </li>
              <li className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                {text.requirements.storage}
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                {text.requirements.time}
              </li>
            </ul>
          </div>

          {/* Data status if already prepared */}
          {offlineDataStatus && offlineDataReady && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{text.status.ready}</span>
              </div>
              <div className="flex gap-4 text-xs text-green-700">
                <span>{offlineDataStatus.classesCount} {text.data.classes}</span>
                <span>{offlineDataStatus.studentsCount} {text.data.students}</span>
                <span>{offlineDataStatus.teachersCount} {text.data.teachers}</span>
              </div>
            </div>
          )}

          {/* Preparation progress */}
          {prepareStatus === 'preparing' && (
            <div className="space-y-2">
              <Progress value={prepareProgress} className="h-2" />
              <p className="text-sm text-center text-gray-500">{text.status.preparing}</p>
            </div>
          )}

          {/* Success message */}
          {prepareStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg border border-green-300">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{text.status.success}</span>
            </div>
          )}

          {/* Error message */}
          {prepareStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{text.status.error}</span>
            </div>
          )}

          {/* Tips */}
          {(prepareStatus === 'success' || offlineDataReady) && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {text.tips.title}
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• {text.tips.tip1}</li>
                <li>• {text.tips.tip2}</li>
                <li>• {text.tips.tip3}</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {prepareStatus !== 'success' && (
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={prepareStatus === 'preparing'}
              data-testid="button-offline-later"
            >
              {text.buttons.later}
            </Button>
          )}
          
          {!offlineDataReady && prepareStatus !== 'success' && (
            <Button 
              onClick={handlePrepareDevice}
              disabled={!isOnline || isPreparing || prepareStatus === 'preparing'}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-prepare-device-popup"
            >
              <Download className="w-4 h-4 mr-2" />
              {prepareStatus === 'preparing' ? text.buttons.preparing : 
               prepareStatus === 'error' ? text.buttons.retry : text.buttons.prepare}
            </Button>
          )}

          {(prepareStatus === 'success' || offlineDataReady) && (
            <Button 
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-close-offline-popup"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {text.buttons.close}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OfflineActivationPopup;
