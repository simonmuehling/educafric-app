import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Target, Lock, Star, TrendingUp } from 'lucide-react';

export const ParentPremiumServices = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Services Premium',
      subtitle: 'Accéder aux fonctionnalités avancées d\'engagement parental',
      premiumFeature: 'Fonctionnalité Premium',
      upgradeText: 'Accédez aux services premium avec des outils avancés d\'engagement parental.',
      upgradeNow: 'Mettre à Niveau Maintenant',
      features: 'Fonctionnalités Premium',
      feature1: 'Analyses et rapports avancés',
      feature2: 'Suivi détaillé des progrès',
      feature3: 'Outils de communication améliorés',
      feature4: 'Accès au support prioritaire',
      feature5: 'Paramètres de notification personnalisés'
    },
    en: {
      title: 'Premium Services',
      subtitle: 'Access advanced parental engagement features',
      premiumFeature: 'Premium Feature',
      upgradeText: 'Access premium services with advanced parental engagement tools.',
      upgradeNow: 'Upgrade Now',
      features: 'Premium Features',
      feature1: 'Advanced analytics and reports',
      feature2: 'Detailed progress tracking',
      feature3: 'Enhanced communication tools',
      feature4: 'Priority support access',
      feature5: 'Custom notification settings'
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center relative">
          <Target className="w-5 h-5 text-white" />
          <Lock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <ModernCard gradient="default" className="relative">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.premiumFeature}</h3>
          <p className="text-gray-600 text-center max-w-md mb-6">{t.upgradeText}</p>
          
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border max-w-lg">
            <h4 className="font-semibold text-gray-800 mb-4">{t.features}:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                {t.feature1}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                {t.feature2}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                {t.feature3}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                {t.feature4}
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                {t.feature5}
              </li>
            </ul>
          </div>
          
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-2">
            {t.upgradeNow}
          </Button>
        </div>

        <div className="filter blur-sm pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border">
              <h4 className="font-semibold text-gray-800 mb-4">Analytics</h4>
              <div className="h-32 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <h4 className="font-semibold text-gray-800 mb-4">Rapports</h4>
              <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};