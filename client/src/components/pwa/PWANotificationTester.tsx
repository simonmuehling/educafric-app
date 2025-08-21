import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TestTube } from 'lucide-react';
import { usePWANotifications } from '@/hooks/usePWANotifications';

const PWANotificationTester: React.FC = () => {
  const { testNotification } = usePWANotifications(null, false);

  const testSecurityAlert = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: '🚨 Alerte de sécurité EDUCAFRIC',
        options: {
          body: 'Test d\'alerte de géolocalisation - Votre enfant a quitté une zone de sécurité.',
          icon: '/educafric-logo-128.png',
          badge: '/android-icon-192x192.png',
          tag: 'security-test',
          requireInteraction: true,
          actions: [
            {
              action: 'view_location',
              title: 'Voir position',
              icon: '/icons/location.png'
            },
            {
              action: 'dismiss',
              title: 'Fermer',
              icon: '/icons/close.png'
            }
          ],
          vibrate: [200, 100, 200, 100, 200]
        }
      });
    }
  };

  const testGradeNotification = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: '📚 Nouvelle note EDUCAFRIC',
        options: {
          body: 'Emma a reçu une nouvelle note en Mathématiques : 18/20 - Excellent travail !',
          icon: '/educafric-logo-128.png',
          tag: 'grade-test',
          requireInteraction: false,
          actions: [
            {
              action: 'view_grades',
              title: 'Voir notes',
              icon: '/icons/grades.png'
            }
          ]
        }
      });
    }
  };

  const testHomeworkReminder = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: '📝 Rappel devoir EDUCAFRIC',
        options: {
          body: 'N\'oubliez pas : Devoir de Français à rendre demain - Analyse de texte',
          icon: '/educafric-logo-128.png',
          tag: 'homework-reminder',
          requireInteraction: false
        }
      });
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        testNotification();
      } else {
        alert('Permission de notification refusée. Activez-les dans les paramètres de votre navigateur.');
      }
    }
  };

  const currentPermission = 'Notification' in window ? Notification.permission : 'not-supported';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Test Notifications PWA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Permission actuelle: <span className={`font-semibold ${
            currentPermission === 'granted' ? 'text-green-600' : 
            currentPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {currentPermission === 'granted' ? 'Accordée' : 
             currentPermission === 'denied' ? 'Refusée' : 
             currentPermission === 'default' ? 'En attente' : 'Non supporté'}
          </span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentPermission !== 'granted' && (
          <Button 
            onClick={requestPermission}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            Activer les notifications
          </Button>
        )}
        
        {currentPermission === 'granted' && (
          <>
            <Button 
              onClick={testNotification}
              variant="outline"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test notification basique
            </Button>
            
            <Button 
              onClick={testSecurityAlert}
              variant="destructive"
              className="w-full"
            >
              🚨 Test alerte sécurité
            </Button>
            
            <Button 
              onClick={testGradeNotification}
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              📚 Test notification note
            </Button>
            
            <Button 
              onClick={testHomeworkReminder}
              variant="outline"
              className="w-full"
            >
              📝 Test rappel devoir
            </Button>
          </>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p>💡 Conseils :</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Les notifications fonctionnent même si l'onglet est fermé</li>
            <li>Vous pouvez les désactiver dans les paramètres du navigateur</li>
            <li>Sur mobile, elles apparaissent comme des notifications système</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWANotificationTester;