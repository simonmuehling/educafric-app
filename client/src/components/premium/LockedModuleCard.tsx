import React from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LockedModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  userType: 'Parent' | 'School' | 'Freelancer';
  premiumFeatures: string[];
  onUpgradeClick: () => void;
  className?: string;
}

const LockedModuleCard: React.FC<LockedModuleCardProps> = ({
  title,
  description,
  icon,
  userType,
  premiumFeatures,
  onUpgradeClick,
  className = ""
}) => {
  const getPricing = () => {
    switch (userType) {
      case 'Parent':
        return { price: '1,000 CFA', period: '/mois' };
      case 'School':
        return { price: '50,000 CFA', period: '/an' };
      case 'Freelancer':
        return { price: '25,000 CFA', period: '/an' };
      default:
        return { price: '1,000 CFA', period: '/mois' };
    }
  };

  const pricing = getPricing();

  return (
    <Card className={`relative overflow-hidden group transition-all duration-300 hover:shadow-xl ${className}`}>
      {/* Badge Premium */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1">
          <Crown className="w-3 h-3 mr-1" />
          PREMIUM
        </Badge>
      </div>

      {/* Overlay de verrouillage avec effet de flou */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/80 via-blue-50/80 to-purple-50/80 backdrop-blur-[2px] z-5"></div>

      <CardContent className="relative p-6 h-full">
        {/* Contenu flouté en arrière-plan */}
        <div className="filter blur-sm opacity-40 mb-4">
          <div className="flex items-center mb-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-3">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          {/* Aperçu des fonctionnalités */}
          <div className="space-y-2 mb-4">
            {premiumFeatures.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu de déverrouillage centré */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center p-4">
            {/* Icône de verrouillage avec animation */}
            <div className="relative mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Message d'upgrade */}
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Module Premium
            </h4>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Débloquez cette fonctionnalité avec un abonnement Premium
            </p>

            {/* Prix */}
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600">
                {pricing.price}
              </div>
              <div className="text-xs text-gray-500">
                {pricing.period} • {userType === 'Parent' ? 'Essai gratuit 7 jours' : 'Voir tous les plans'}
              </div>
            </div>

            {/* Bouton d'upgrade */}
            <Button 
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Débloquer
            </Button>
          </div>
        </div>

        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
      </CardContent>
    </Card>
  );
};

export default LockedModuleCard;