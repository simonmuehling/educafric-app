import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Bell, Lock, AlertTriangle, Calendar } from 'lucide-react';

export const ParentNotifications = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Notifications',
      subtitle: 'Gérer et voir les notifications éducatives',
      premiumFeature: 'Fonctionnalité Premium',
      upgradeText: 'Recevez toutes les notifications scolaires importantes avec un abonnement premium.',
      upgradeNow: 'Mettre à Niveau Maintenant',
      features: 'Fonctionnalités Premium',
      feature1: 'Notifications scolaires en temps réel',
      feature2: 'Alertes de notes et présence',
      feature3: 'Rappels d\'échéances de devoirs',
      feature4: 'Notifications d\'événements scolaires',
      feature5: 'Alertes d\'urgence'
    },
    en: {
      title: 'Notifications',
      subtitle: 'Manage and view educational notifications',
      premiumFeature: 'Premium Feature',
      upgradeText: 'Receive all important school notifications with a premium subscription.',
      upgradeNow: 'Upgrade Now',
      features: 'Premium Features',
      feature1: 'Real-time school notifications',
      feature2: 'Grade and attendance alerts',
      feature3: 'Assignment deadline reminders',
      feature4: 'School event notifications',
      feature5: 'Emergency alerts'
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-white" />
          <Lock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <ModernCard gradient="default" className="relative">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.premiumFeature}</h3>
          <p className="text-gray-600 text-center max-w-md mb-6">{t.upgradeText}</p>
          
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border max-w-lg">
            <h4 className="font-semibold text-gray-800 mb-4">{t.features}:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {t.feature1}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {t.feature2}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {t.feature3}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {t.feature4}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {t.feature5}
              </li>
            </ul>
          </div>
          
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-2">
            {t.upgradeNow}
          </Button>
        </div>

        <div className="filter blur-sm pointer-events-none">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Nouvelle note - Mathématiques</h4>
                    <p className="text-gray-600">Marie a reçu 16/20 en mathématiques</p>
                    <p className="text-sm text-gray-500">Il y a 2 heures</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModernCard>
    </div>
  );
};