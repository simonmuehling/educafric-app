import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  Download, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Users,
  GraduationCap,
  School,
  RefreshCw
} from 'lucide-react';

interface OfflineDataNotReadyModalProps {
  isOpen: boolean;
  onClose?: () => void;
  moduleName?: string;
}

export function OfflineDataNotReadyModal({ 
  isOpen, 
  onClose,
  moduleName 
}: OfflineDataNotReadyModalProps) {
  const { language } = useLanguage();
  const { 
    isOnline, 
    offlineDataStatus, 
    isPreparing, 
    prepareOfflineData,
    offlineDataReady 
  } = useOfflinePremium();
  
  const [prepareProgress, setPrepareProgress] = useState(0);
  const [prepareStatus, setPrepareStatus] = useState<'idle' | 'preparing' | 'success' | 'error'>('idle');

  const t = {
    fr: {
      title: 'Données hors ligne non disponibles',
      description: 'Pour utiliser Educafric en mode hors ligne, certaines informations doivent d\'abord être téléchargées et stockées sur cet appareil.',
      offlineWarning: 'Vous êtes actuellement hors ligne et ces informations ne sont pas disponibles localement.',
      connectFirst: 'Veuillez vous connecter à Internet au moins une fois pour préparer votre appareil au mode hors ligne.',
      prepareButton: 'Préparer cet appareil',
      preparingButton: 'Préparation en cours...',
      closeButton: 'Fermer',
      retryButton: 'Réessayer',
      dataStatus: 'État des données locales',
      classes: 'Classes',
      students: 'Élèves',
      teachers: 'Enseignants',
      items: 'éléments',
      noData: 'Non disponible',
      lastPrepared: 'Dernière préparation',
      never: 'Jamais',
      success: 'Données téléchargées avec succès!',
      error: 'Erreur lors de la préparation. Veuillez réessayer.',
      moduleBlocked: (name: string) => `Le module "${name}" nécessite des données hors ligne.`,
      readyMessage: 'Vos données sont prêtes pour le mode hors ligne!'
    },
    en: {
      title: 'Offline Data Not Available',
      description: 'To use Educafric in offline mode, some information must first be downloaded and stored on this device.',
      offlineWarning: 'You are currently offline and this information is not available locally.',
      connectFirst: 'Please connect to the internet at least once to prepare your device for offline use.',
      prepareButton: 'Prepare This Device',
      preparingButton: 'Preparing...',
      closeButton: 'Close',
      retryButton: 'Retry',
      dataStatus: 'Local Data Status',
      classes: 'Classes',
      students: 'Students',
      teachers: 'Teachers',
      items: 'items',
      noData: 'Not available',
      lastPrepared: 'Last prepared',
      never: 'Never',
      success: 'Data downloaded successfully!',
      error: 'Error during preparation. Please try again.',
      moduleBlocked: (name: string) => `The "${name}" module requires offline data.`,
      readyMessage: 'Your data is ready for offline mode!'
    }
  };

  const text = t[language as keyof typeof t] || t.fr;

  const handlePrepare = async () => {
    setPrepareStatus('preparing');
    setPrepareProgress(10);
    
    const progressInterval = setInterval(() => {
      setPrepareProgress(prev => Math.min(prev + 15, 90));
    }, 500);

    try {
      const success = await prepareOfflineData();
      clearInterval(progressInterval);
      setPrepareProgress(100);
      
      if (success) {
        setPrepareStatus('success');
        setTimeout(() => {
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

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return text.never;
    return new Date(timestamp).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose?.()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <WifiOff className="w-5 h-5" />
            {text.title}
          </DialogTitle>
          <DialogDescription>
            {moduleName && (
              <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 inline mr-2 text-orange-500" />
                {text.moduleBlocked(moduleName)}
              </div>
            )}
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isOnline && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <WifiOff className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">{text.offlineWarning}</p>
                  <p className="text-xs text-red-600 mt-1">{text.connectFirst}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Database className="w-4 h-4" />
              {text.dataStatus}
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <School className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <div className="text-lg font-bold text-gray-800">
                  {offlineDataStatus?.classesCount || 0}
                </div>
                <div className="text-xs text-gray-500">{text.classes}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <GraduationCap className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <div className="text-lg font-bold text-gray-800">
                  {offlineDataStatus?.studentsCount || 0}
                </div>
                <div className="text-xs text-gray-500">{text.students}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <div className="text-lg font-bold text-gray-800">
                  {offlineDataStatus?.teachersCount || 0}
                </div>
                <div className="text-xs text-gray-500">{text.teachers}</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>{text.lastPrepared}:</span>
              <span className="font-medium">
                {formatDate(offlineDataStatus?.lastPrepared || null)}
              </span>
            </div>
          </div>

          {prepareStatus === 'preparing' && (
            <div className="space-y-2">
              <Progress value={prepareProgress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {text.preparingButton} {prepareProgress}%
              </p>
            </div>
          )}

          {prepareStatus === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700">{text.success}</span>
            </div>
          )}

          {prepareStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{text.error}</span>
            </div>
          )}

          {offlineDataReady && prepareStatus === 'idle' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700">{text.readyMessage}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isOnline && prepareStatus !== 'success' && (
            <Button
              onClick={handlePrepare}
              disabled={isPreparing || prepareStatus === 'preparing'}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {prepareStatus === 'preparing' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {text.preparingButton}
                </>
              ) : prepareStatus === 'error' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {text.retryButton}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {text.prepareButton}
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => onClose?.()}
            className="flex-1"
          >
            {text.closeButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useOfflineDataCheck() {
  const { isOnline, offlineDataReady, hasOfflineAccess } = useOfflinePremium();
  
  const shouldShowModal = !isOnline && hasOfflineAccess && !offlineDataReady;
  
  return {
    shouldShowModal,
    isOfflineWithoutData: shouldShowModal
  };
}
