import React from 'react';
import PWANotificationTester from '@/components/pwa/PWANotificationTester';

const PWANotificationTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔔 Test des Notifications PWA
          </h1>
          <p className="text-gray-600">
            Testez le système de notifications push EDUCAFRIC
          </p>
        </div>
        
        <div className="flex justify-center">
          <PWANotificationTester />
        </div>
        
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">📖 Comment ça marche</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>🎯 Notifications en temps réel :</strong> Recevez des alertes importantes même quand l'application est fermée.
            </p>
            <p>
              <strong>🔒 Sécurité :</strong> Alertes de géolocalisation quand votre enfant entre ou sort d'une zone de sécurité.
            </p>
            <p>
              <strong>📚 Éducation :</strong> Notifications de nouvelles notes, devoirs, et messages des enseignants.
            </p>
            <p>
              <strong>📱 Multi-plateformes :</strong> Fonctionne sur ordinateur, tablette et smartphone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWANotificationTest;