import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  WifiOff, 
  Wifi, 
  Download, 
  Database, 
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Laptop,
  CloudOff,
  Cloud,
  Users,
  GraduationCap,
  School,
  Settings,
  HardDrive,
  Timer,
  Zap
} from 'lucide-react';

interface OfflinePremiumGuideProps {
  showCompact?: boolean;
  className?: string;
}

export function OfflinePremiumGuide({ showCompact = false, className = '' }: OfflinePremiumGuideProps) {
  const { language } = useLanguage();
  const { 
    isOnline, 
    offlineDataReady,
    offlineDataStatus,
    isPreparing,
    prepareOfflineData,
    daysOffline,
    warningLevel,
    pendingSyncCount,
    isSyncing,
    triggerSync
  } = useOfflinePremium();

  const [prepareProgress, setPrepareProgress] = useState(0);
  const [prepareStatus, setPrepareStatus] = useState<'idle' | 'preparing' | 'success' | 'error'>('idle');

  const text = language === 'fr' ? {
    title: 'Guide Mode Hors Ligne Premium',
    subtitle: 'Utilisez Educafric sans connexion Internet',
    
    activation: {
      title: 'Activation du Mode Hors Ligne',
      description: 'Activez le mode hors ligne dans Paramètres École > Configuration pour permettre le stockage local des données.',
      step1: 'Accédez à Paramètres École > Configuration',
      step2: 'Activez l\'option "Mode Hors Ligne Premium"',
      step3: 'Préparez votre appareil (téléchargement initial des données)',
      activateNow: 'Activer maintenant'
    },

    storage: {
      title: 'Stockage Local',
      description: 'Les données sont stockées en toute sécurité sur votre appareil.',
      localDb: 'Base de données locale (IndexedDB)',
      encryption: 'Chiffrement des données sensibles',
      capacity: 'Capacité recommandée : 500 Mo - 2 Go',
      clearing: 'Les données peuvent être effacées via les paramètres du navigateur'
    },

    duration: {
      title: 'Durée de Travail Hors Ligne Recommandée',
      description: 'Conseils pour une utilisation optimale du mode hors ligne.',
      optimal: 'Durée optimale : 24 à 48 heures',
      optimalDesc: 'Reconnectez-vous au moins une fois tous les 2 jours pour synchroniser les notes, présences et sauvegardes.',
      warning3: 'Après 3 jours : Avertissement léger (bannière jaune)',
      warning7: 'Après 7 jours : Avertissement urgent (bannière rouge avec compte à rebours)',
      warning14: 'Après 14 jours : Accès Premium suspendu jusqu\'à reconnexion',
      recommendation: 'Recommandation : Synchronisez quotidiennement si possible pour éviter la perte de données.',
      teacherStudent: 'Enseignants & Élèves : Accès illimité hors ligne',
      directorParent: 'Directeurs & Parents : Limite de 14 jours (sauf mode illimité activé)'
    },

    preparation: {
      title: 'Préparation de l\'Appareil',
      description: 'Téléchargez les données essentielles pour le mode hors ligne.',
      button: 'Préparer cet appareil',
      preparing: 'Préparation en cours...',
      success: 'Appareil prêt pour le mode hors ligne !',
      error: 'Erreur lors de la préparation. Réessayez.',
      requiresInternet: 'Connexion Internet requise pour la préparation initiale.',
      dataIncludes: 'Données incluses :',
      classes: 'Classes',
      students: 'Élèves',
      teachers: 'Enseignants',
      items: 'éléments'
    },

    sync: {
      title: 'Synchronisation',
      description: 'Gérez la synchronisation de vos données.',
      online: 'En ligne',
      offline: 'Hors ligne',
      syncing: 'Synchronisation...',
      pending: 'modifications en attente',
      syncNow: 'Synchroniser maintenant',
      allSynced: 'Tout synchronisé',
      autoSync: 'Synchronisation automatique à la reconnexion',
      lastSync: 'Dernière synchronisation'
    },

    features: {
      title: 'Fonctionnalités Disponibles Hors Ligne',
      description: 'Ce que vous pouvez faire sans connexion Internet.',
      available: [
        'Consultation des listes de classes et d\'élèves',
        'Saisie des notes et appréciations',
        'Enregistrement des présences',
        'Consultation des emplois du temps',
        'Génération de bulletins (PDF local)',
        'Envoi de messages (mis en file d\'attente)'
      ],
      requiresOnline: [
        'Première connexion et authentification',
        'Téléchargement initial des données',
        'Paiements et transactions financières',
        'Appels vidéo et conférences',
        'Envoi effectif de SMS/WhatsApp'
      ]
    },

    status: {
      ready: 'Prêt pour le mode hors ligne',
      notReady: 'Configuration requise',
      daysOffline: 'jours hors ligne',
      noData: 'Aucune donnée locale'
    }
  } : {
    title: 'Offline Premium Mode Guide',
    subtitle: 'Use Educafric without Internet connection',
    
    activation: {
      title: 'Activating Offline Mode',
      description: 'Enable offline mode in School Settings > Configuration to allow local data storage.',
      step1: 'Go to School Settings > Configuration',
      step2: 'Enable "Offline Premium Mode"',
      step3: 'Prepare your device (initial data download)',
      activateNow: 'Activate now'
    },

    storage: {
      title: 'Local Storage',
      description: 'Data is securely stored on your device.',
      localDb: 'Local database (IndexedDB)',
      encryption: 'Encryption of sensitive data',
      capacity: 'Recommended capacity: 500 MB - 2 GB',
      clearing: 'Data can be cleared via browser settings'
    },

    duration: {
      title: 'Recommended Offline Working Duration',
      description: 'Tips for optimal offline mode usage.',
      optimal: 'Optimal duration: 24 to 48 hours',
      optimalDesc: 'Reconnect at least once every 2 days to sync grades, attendance, and backups.',
      warning3: 'After 3 days: Light warning (yellow banner)',
      warning7: 'After 7 days: Urgent warning (red banner with countdown)',
      warning14: 'After 14 days: Premium access suspended until reconnection',
      recommendation: 'Recommendation: Sync daily if possible to avoid data loss.',
      teacherStudent: 'Teachers & Students: Unlimited offline access',
      directorParent: 'Directors & Parents: 14-day limit (unless unlimited mode enabled)'
    },

    preparation: {
      title: 'Device Preparation',
      description: 'Download essential data for offline mode.',
      button: 'Prepare this device',
      preparing: 'Preparing...',
      success: 'Device ready for offline mode!',
      error: 'Error during preparation. Please retry.',
      requiresInternet: 'Internet connection required for initial preparation.',
      dataIncludes: 'Data included:',
      classes: 'Classes',
      students: 'Students',
      teachers: 'Teachers',
      items: 'items'
    },

    sync: {
      title: 'Synchronization',
      description: 'Manage your data synchronization.',
      online: 'Online',
      offline: 'Offline',
      syncing: 'Syncing...',
      pending: 'pending changes',
      syncNow: 'Sync now',
      allSynced: 'All synced',
      autoSync: 'Auto-sync on reconnection',
      lastSync: 'Last sync'
    },

    features: {
      title: 'Features Available Offline',
      description: 'What you can do without Internet connection.',
      available: [
        'View class and student lists',
        'Enter grades and comments',
        'Record attendance',
        'View timetables',
        'Generate report cards (local PDF)',
        'Send messages (queued for later)'
      ],
      requiresOnline: [
        'First login and authentication',
        'Initial data download',
        'Payments and financial transactions',
        'Video calls and conferences',
        'Actual SMS/WhatsApp sending'
      ]
    },

    status: {
      ready: 'Ready for offline mode',
      notReady: 'Setup required',
      daysOffline: 'days offline',
      noData: 'No local data'
    }
  };

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
      setPrepareStatus(success ? 'success' : 'error');
    } catch (error) {
      clearInterval(progressInterval);
      setPrepareStatus('error');
    }
  };

  if (showCompact) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
              <CardTitle className="text-lg">{text.title}</CardTitle>
            </div>
            <Badge variant={offlineDataReady ? 'default' : 'secondary'}>
              {offlineDataReady ? text.status.ready : text.status.notReady}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isOnline ? text.sync.online : `${text.sync.offline} - ${daysOffline} ${text.status.daysOffline}`}
              </span>
              {pendingSyncCount > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {pendingSyncCount} {text.sync.pending}
                </Badge>
              )}
            </div>

            {!offlineDataReady && isOnline && (
              <Button 
                onClick={handlePrepareDevice}
                disabled={isPreparing || prepareStatus === 'preparing'}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-prepare-device-compact"
              >
                <Download className="w-4 h-4 mr-2" />
                {isPreparing || prepareStatus === 'preparing' ? text.preparation.preparing : text.preparation.button}
              </Button>
            )}

            {isOnline && pendingSyncCount > 0 && (
              <Button 
                onClick={triggerSync}
                disabled={isSyncing}
                variant="outline"
                className="w-full"
                data-testid="button-sync-now-compact"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? text.sync.syncing : text.sync.syncNow}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <WifiOff className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-800">{text.title}</CardTitle>
              <CardDescription className="text-green-700">{text.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-green-600" />
              ) : (
                <WifiOff className="w-6 h-6 text-orange-600" />
              )}
              <div>
                <p className="font-medium">{isOnline ? text.sync.online : text.sync.offline}</p>
                {!isOnline && daysOffline > 0 && (
                  <p className="text-sm text-gray-500">{daysOffline} {text.status.daysOffline}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium">{offlineDataReady ? text.status.ready : text.status.notReady}</p>
                {offlineDataStatus && (
                  <p className="text-sm text-gray-500">
                    {offlineDataStatus.classesCount + offlineDataStatus.studentsCount + offlineDataStatus.teachersCount} {text.preparation.items}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Cloud className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium">{pendingSyncCount > 0 ? `${pendingSyncCount} ${text.sync.pending}` : text.sync.allSynced}</p>
                <p className="text-sm text-gray-500">{text.sync.autoSync}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion sections */}
      <Accordion type="multiple" defaultValue={['duration', 'activation']} className="space-y-4">
        
        {/* Activation */}
        <AccordionItem value="activation" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-green-600" />
              <span className="font-semibold">{text.activation.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-600 mb-4">{text.activation.description}</p>
            <ol className="space-y-3 mb-4">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">1</span>
                <span>{text.activation.step1}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">2</span>
                <span>{text.activation.step2}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">3</span>
                <span>{text.activation.step3}</span>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Duration recommendations */}
        <AccordionItem value="duration" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-orange-600" />
              <span className="font-semibold">{text.duration.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-600 mb-4">{text.duration.description}</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">{text.duration.optimal}</span>
              </div>
              <p className="text-green-700 text-sm">{text.duration.optimalDesc}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <span className="text-yellow-800 text-sm">{text.duration.warning3}</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <span className="text-red-800 text-sm">{text.duration.warning7}</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-100 rounded-lg border border-red-300">
                <Shield className="w-5 h-5 text-red-700 mt-0.5" />
                <span className="text-red-900 text-sm font-medium">{text.duration.warning14}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm font-medium">{text.duration.recommendation}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <span className="text-sm">{text.duration.teacherStudent}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm">{text.duration.directorParent}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Local Storage */}
        <AccordionItem value="storage" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{text.storage.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-600 mb-4">{text.storage.description}</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{text.storage.localDb}</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm">{text.storage.encryption}</span>
              </li>
              <li className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <span className="text-sm">{text.storage.capacity}</span>
              </li>
              <li className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{text.storage.clearing}</span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Device Preparation */}
        <AccordionItem value="preparation" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">{text.preparation.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-600 mb-4">{text.preparation.description}</p>
            
            {!isOnline && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 text-sm">{text.preparation.requiresInternet}</span>
              </div>
            )}

            {offlineDataStatus && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{text.preparation.dataIncludes}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <School className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{offlineDataStatus.classesCount} {text.preparation.classes}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <GraduationCap className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{offlineDataStatus.studentsCount} {text.preparation.students}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">{offlineDataStatus.teachersCount} {text.preparation.teachers}</span>
                  </div>
                </div>
              </div>
            )}

            {prepareStatus === 'preparing' && (
              <div className="mb-4">
                <Progress value={prepareProgress} className="h-2 mb-2" />
                <p className="text-sm text-gray-500 text-center">{text.preparation.preparing}</p>
              </div>
            )}

            {prepareStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800">{text.preparation.success}</span>
              </div>
            )}

            {prepareStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{text.preparation.error}</span>
              </div>
            )}

            <Button 
              onClick={handlePrepareDevice}
              disabled={!isOnline || isPreparing || prepareStatus === 'preparing'}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-prepare-device"
            >
              <Download className="w-4 h-4 mr-2" />
              {isPreparing || prepareStatus === 'preparing' ? text.preparation.preparing : text.preparation.button}
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Features */}
        <AccordionItem value="features" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold">{text.features.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-600 mb-4">{text.features.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  {language === 'fr' ? 'Disponible hors ligne' : 'Available offline'}
                </h4>
                <ul className="space-y-2">
                  {text.features.available.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  {language === 'fr' ? 'Nécessite Internet' : 'Requires Internet'}
                </h4>
                <ul className="space-y-2">
                  {text.features.requiresOnline.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CloudOff className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sync */}
        <AccordionItem value="sync" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{text.sync.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-gray-600 mb-4">{text.sync.description}</p>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge className="bg-green-500">{text.sync.online}</Badge>
                ) : (
                  <Badge variant="secondary">{text.sync.offline}</Badge>
                )}
                {pendingSyncCount > 0 && (
                  <span className="text-sm text-gray-600">{pendingSyncCount} {text.sync.pending}</span>
                )}
              </div>
              <Button 
                onClick={triggerSync}
                disabled={!isOnline || isSyncing || pendingSyncCount === 0}
                size="sm"
                data-testid="button-sync-now"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? text.sync.syncing : text.sync.syncNow}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default OfflinePremiumGuide;
