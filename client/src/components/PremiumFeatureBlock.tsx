import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumFeatureBlockProps {
  feature?: string;
  description?: string;
  className?: string;
}

export default function PremiumFeatureBlock({ 
  feature = '', 
  description,
  className = '' 
}: PremiumFeatureBlockProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Handle upgrade button click - redirect to unified subscription page
  const handleUpgradeClick = () => {
    console.log('🔗 PremiumFeatureBlock - Redirecting to subscription page:', {
      userRole: user?.role,
      feature: feature,
      description: description
    });
    
    navigate('/subscribe');
  };

  const text = {
    en: {
      title: 'Premium Feature',
      defaultDescription: 'This feature requires a premium subscription to manage teachers, their assignments and performance.',
      upgradeButton: 'Upgrade Now',
      learnMore: 'Learn More'
    },
    fr: {
      title: 'Fonctionnalité Premium',
      defaultDescription: 'Cette fonctionnalité nécessite un abonnement premium pour gérer les enseignants, leurs affectations et performances.',
      upgradeButton: 'Mettre à Niveau Maintenant',
      learnMore: 'En Savoir Plus'
    }
  };

  const t = text[language];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Card className="w-full max-w-md p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300">
        {/* Lock Icon */}
        <div className="relative mx-auto mb-6 w-16 h-16">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-yellow-800" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {t.title || ''}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description || t.defaultDescription}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Crown className="w-4 h-4" />
            <span>{t.upgradeButton}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/demo#pricing')}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t.learnMore}
          </Button>
        </div>

        {/* Premium Badge */}
        <div className="mt-6 inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
          <Crown className="w-3 h-3 mr-1" />
          Premium Required
        </div>
      </Card>
    </div>
  );
}