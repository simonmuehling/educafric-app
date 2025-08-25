import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/ModernCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnifiedPremiumGateProps {
  title?: string;
  description?: string;
  features?: string[];
  children?: React.ReactNode;
  className?: string;
}

const UnifiedPremiumGate: React.FC<UnifiedPremiumGateProps> = ({
  title,
  description,
  features = [],
  children,
  className = ''
}) => {
  const { language } = useLanguage();

  const defaultText = {
    fr: {
      premiumFeature: 'Fonctionnalité Premium',
      upgradeRequired: 'Mise à niveau requise',
      upgradeText: 'Cette fonctionnalité nécessite un abonnement premium pour être utilisée.',
      upgradeNow: 'Mettre à Niveau Maintenant',
      features: 'Fonctionnalités Premium'
    },
    en: {
      premiumFeature: 'Premium Feature',
      upgradeRequired: 'Upgrade Required',
      upgradeText: 'This feature requires a premium subscription to be used.',
      upgradeNow: 'Upgrade Now',
      features: 'Premium Features'
    }
  };

  const t = defaultText[language as keyof typeof defaultText];

  return (
    <ModernCard className={`relative ${className}`}>
      {/* Premium Lock Overlay - Design blanc unifié */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {title || t.premiumFeature}
        </h3>
        
        <p className="text-gray-600 text-center max-w-md mb-6">
          {description || t.upgradeText}
        </p>
        
        {/* Premium Features List */}
        {features.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border max-w-lg">
            <h4 className="font-semibold text-gray-800 mb-4">{t.features}:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-2">
          {t.upgradeNow}
        </Button>
      </div>

      {/* Background Content (blurred) */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
    </ModernCard>
  );
};

export default UnifiedPremiumGate;