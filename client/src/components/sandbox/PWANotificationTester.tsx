import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellRing, 
  Shield, 
  MapPin, 
  BookOpen, 
  MessageSquare,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface NotificationTest {
  type: string;
  title: string;
  body: string;
  icon: string;
  badge: string;
  actions?: Array<{ action: string; title: string; icon: string }>;
  priority: 'low' | 'normal' | 'high';
  category: string;
}

const PWANotificationTester: React.FC = () => {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  // Test notifications disponibles
  const testNotifications: NotificationTest[] = [
    {
      type: 'zone_exit',
      title: 'Sortie de zone de sécurité',
      body: 'ALERTE: Emma Talla a quitté la zone "École Primaire Central". Position actuelle: Douala',
      icon: '/educafric-logo-128.png',
      badge: '/android-icon-192x192.png',
      actions: [
        { action: 'view_location', title: 'Voir position', icon: '/icons/location.png' },
        { action: 'dismiss', title: 'Fermer', icon: '/icons/close.png' }
      ],
      priority: 'high',
      category: 'security'
    },
    {
      type: 'zone_entry',
      title: 'Entrée en zone de sécurité',
      body: 'Emma Talla est entré dans la zone "École Primaire Central". Tout va bien.',
      icon: '/educafric-logo-128.png',
      badge: '/android-icon-192x192.png',
      priority: 'low',
      category: 'security'
    },
    {
      type: 'new_message',
      title: 'Nouveau message',
      body: 'Professeur Dubois vous a envoyé un message concernant les devoirs de mathématiques.',
      icon: '/educafric-logo-128.png',
      badge: '/android-icon-192x192.png',
      actions: [
        { action: 'read_message', title: 'Lire', icon: '/icons/message.png' },
        { action: 'dismiss', title: 'Plus tard', icon: '/icons/clock.png' }
      ],
      priority: 'normal',
      category: 'communication'
    },
    {
      type: 'homework_reminder',
      title: 'Rappel de devoir',
      body: 'N\'oubliez pas : Devoir de français à rendre demain avant 18h.',
      icon: '/educafric-logo-128.png',
      badge: '/android-icon-192x192.png',
      priority: 'normal',
      category: 'academic'
    }
  ];

  useEffect(() => {
    // Vérifier le support des notifications
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    // Vérifier les permissions
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Vérifier l'installation PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsPWAInstalled(isStandalone || isInWebAppiOS);

    // Récupérer l'enregistrement du service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications push ne sont pas supportées sur ce navigateur.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Permission accordée",
          description: "Vous recevrez maintenant les notifications EducAfric !",
          variant: "default"
        });
      } else {
        toast({
          title: "Permission refusée",
          description: "Activez les notifications dans les paramètres du navigateur.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur permission notifications:', error);
    }
  };

  const sendTestNotification = async (notif: NotificationTest) => {
    if (permission !== 'granted') {
      toast({
        title: "Permission requise",
        description: "Accordez d'abord la permission pour les notifications.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (swRegistration) {
        // Utiliser le service worker pour les notifications
        await swRegistration.showNotification(notif.title, {
          body: notif.body,
          icon: notif.icon,
          badge: notif.badge,
          tag: `test-${notif.type}-${Date.now()}`,
          data: {
            type: notif.type,
            category: notif.category,
            url: '/',
            timestamp: Date.now()
          },
          actions: notif.actions as any,
          requireInteraction: notif.priority === 'high',
          vibrate: notif.priority === 'high' ? [200, 100, 200, 100, 200] : [200, 100, 200],
          timestamp: Date.now()
        });
      } else {
        // Fallback avec l'API Notification native
        new Notification(notif.title, {
          body: notif.body,
          icon: notif.icon,
          tag: `test-${notif.type}-${Date.now()}`
        });
      }

      toast({
        title: "Notification envoyée",
        description: `Test "${notif.title}" envoyé avec succès !`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification test.",
        variant: "destructive"
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'normal': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'academic': return <BookOpen className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BellRing className="w-6 h-6 text-blue-600" />
            Testeur de Notifications PWA EducAfric
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-5 h-5 ${isSupported ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">
                Support: {isSupported ? 'Disponible' : 'Non supporté'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {isPWAInstalled ? <Smartphone className="w-5 h-5 text-green-500" /> : <Monitor className="w-5 h-5 text-gray-500" />}
              <span className="text-sm">
                Mode: {isPWAInstalled ? 'PWA Installée' : 'Navigateur Web'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${permission === 'granted' ? 'text-green-500' : permission === 'denied' ? 'text-red-500' : 'text-yellow-500'}`} />
              <span className="text-sm">
                Permission: {permission === 'granted' ? 'Accordée' : permission === 'denied' ? 'Refusée' : 'Demander'}
              </span>
            </div>
          </div>

          {/* Actions */}
          {permission !== 'granted' && (
            <Button 
              onClick={requestPermission}
              disabled={!isSupported}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Demander la Permission de Notifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tests de notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testNotifications.map((notif, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(notif.category)}
                  <span className="text-lg">{notif.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(notif.priority)}
                  <Badge variant={notif.priority === 'high' ? 'destructive' : notif.priority === 'normal' ? 'default' : 'secondary'}>
                    {notif.priority}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Aperçu du message:</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-sm">{notif.title}</p>
                  <p className="text-sm text-gray-700">{notif.body}</p>
                </div>
              </div>

              {notif.actions && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Actions disponibles:</p>
                  <div className="flex gap-2">
                    {notif.actions.map((action, actionIndex) => (
                      <Badge key={actionIndex} variant="outline" className="text-xs">
                        {action.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => sendTestNotification(notif)}
                disabled={permission !== 'granted'}
                className="w-full"
                variant={notif.priority === 'high' ? 'destructive' : 'default'}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Tester cette Notification
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📱 Test sur Mobile (Android/iOS)</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Installez EducAfric comme PWA depuis votre navigateur</li>
              <li>Accordez la permission pour les notifications</li>
              <li>Testez chaque type de notification ci-dessus</li>
              <li>Vérifiez que les notifications apparaissent même quand l'app est fermée</li>
            </ol>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🔔 Notifications Réelles</h4>
            <p className="text-sm text-green-700">
              Les notifications de géolocalisation se déclenchent automatiquement toutes les 30 secondes selon l'activité simulée. 
              Connectez-vous comme Parent pour voir les alertes de sécurité en temps réel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWANotificationTester;