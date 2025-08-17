import React from 'react';
import { Lock, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PremiumUpgradeOverlayProps {
  moduleName: string;
  userType: 'Parent' | 'School' | 'Freelancer';
  features: string[];
  onUpgrade: () => void;
  className?: string;
}

const PremiumUpgradeOverlay: React.FC<PremiumUpgradeOverlayProps> = ({
  moduleName,
  userType,
  features,
  onUpgrade,
  className = ""
}) => {
  const getUpgradeText = () => {
    switch (userType) {
      case 'Parent':
        return {
          title: "Fonctionnalité Premium Parent",
          subtitle: "Débloquez le suivi complet de votre enfant",
          price: "1,000 CFA/mois",
          priceDetails: "ou 12,000 CFA/an (économisez 2,000 CFA)",
          benefits: [
            "Géolocalisation temps réel",
            "Bulletins détaillés",
            "Communication directe avec enseignants",
            "Historique complet des notes"
          ]
        };
      case 'School':
        return {
          title: "Module Premium École",
          subtitle: "Accédez à la gestion avancée",
          price: "50,000 CFA/an",
          priceDetails: "École publique - École privée : 75,000 CFA/an",
          benefits: [
            "Gestion multi-classes illimitée",
            "Rapports analytiques avancés",
            "Communication automatisée",
            "Support technique prioritaire"
          ]
        };
      case 'Freelancer':
        return {
          title: "Outils Premium Freelancer",
          subtitle: "Maximisez vos opportunités",
          price: "25,000 CFA/an",
          priceDetails: "ou 12,500 CFA/semestre",
          benefits: [
            "Accès à toutes les écoles",
            "Profil certifié premium",
            "Outils de gestion avancés",
            "Support commercial dédié"
          ]
        };
      default:
        return {
          title: "Fonctionnalité Premium",
          subtitle: "Débloquez toutes les fonctionnalités",
          price: "À partir de 1,000 CFA/mois",
          priceDetails: "",
          benefits: features
        };
    }
  };

  const upgradeInfo = getUpgradeText();

  return (
    <div className={`relative ${className}`}>
      {/* Overlay de verrouillage avec effet glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-purple-50/95 to-indigo-50/95 backdrop-blur-sm border-2 border-dashed border-blue-300 rounded-xl z-10 flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto">
          {/* Icône de verrouillage animée */}
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Titre et sous-titre */}
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              {upgradeInfo.title || ''}
            </Badge>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {moduleName}
            </h3>
            <p className="text-gray-600 text-sm">
              {upgradeInfo.subtitle}
            </p>
          </div>

          {/* Prix attractif */}
          <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border">
            <div className="text-2xl font-bold text-green-700">
              {upgradeInfo.price}
            </div>
            {upgradeInfo.priceDetails && (
              <div className="text-xs text-gray-600">
                {upgradeInfo.priceDetails}
              </div>
            )}
          </div>

          {/* Liste des bénéfices */}
          <div className="mb-6 text-left">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Inclus dans Premium:
            </h4>
            <ul className="space-y-1">
              {upgradeInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Bouton d'upgrade attractif */}
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Crown className="w-4 h-4 mr-2" />
            Passer au Premium
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Message de motivation */}
          <div className="mt-3 text-xs text-gray-500">
            🎁 Essai gratuit de 7 jours • 💳 Annulation à tout moment
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeOverlay;