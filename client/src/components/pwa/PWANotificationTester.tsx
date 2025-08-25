import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TestTube, Check, X } from 'lucide-react';
import hybridNotificationService from '@/services/hybridNotificationService';

const PWANotificationTester: React.FC = () => {
  const [status, setStatus] = useState(hybridNotificationService.getStatus());

  useEffect(() => {
    // Update status when component mounts
    setStatus(hybridNotificationService.getStatus());
  }, []);

  const requestPermission = async () => {
    const granted = await hybridNotificationService.requestPermission();
    setStatus(hybridNotificationService.getStatus());
    
    if (!granted) {
      alert('Permission de notification refusée. Activez-les dans les paramètres de votre navigateur.');
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
              onClick={() => hybridNotificationService.testBasicNotification()}
              variant="outline"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test notification basique
            </Button>
            
            <Button 
              onClick={() => hybridNotificationService.testSecurityAlert()}
              variant="destructive"
              className="w-full"
            >
              🚨 Test alerte sécurité
            </Button>
            
            <Button 
              onClick={() => hybridNotificationService.testGeolocationNotification()}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              📍 Test géolocalisation
            </Button>
            
            <Button 
              onClick={() => hybridNotificationService.testLocationAlert()}
              variant="destructive"
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              🗺️ Test zone de sécurité
            </Button>
            
            <Button 
              onClick={() => hybridNotificationService.testEmergencyAlert()}
              variant="destructive"
              className="w-full bg-red-800 hover:bg-red-900"
            >
              🆘 Test urgence
            </Button>
            
            <Button 
              onClick={() => hybridNotificationService.testGradeNotification()}
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              📚 Test notification note
            </Button>
            
            <Button 
              onClick={() => hybridNotificationService.testHomeworkReminder()}
              variant="outline"
              className="w-full"
            >
              📝 Test rappel devoir
            </Button>
          </>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p className="font-semibold mb-2">📊 État du système :</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {status.notificationSupport ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-500" />}
              <span>Support notifications: {status.notificationSupport ? 'Oui' : 'Non'}</span>
            </div>
            <div className="flex items-center gap-2">
              {status.hasNotificationPermission ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-500" />}
              <span>Permission accordée: {status.hasNotificationPermission ? 'Oui' : 'Non'}</span>
            </div>
            <div className="flex items-center gap-2">
              {status.hasServiceWorker ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-400" />}
              <span>Service Worker: {status.hasServiceWorker ? 'Actif' : 'Mode direct'}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <p>💡 Conseils :</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Fonctionne avec ou sans Service Worker</li>
              <li>Notifications directes dans le navigateur en développement</li>
              <li>Notifications système complètes en production</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWANotificationTester;