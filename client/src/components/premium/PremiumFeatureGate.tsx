import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PremiumUpgradeOverlay from './PremiumUpgradeOverlay';
import LockedModuleCard from './LockedModuleCard';

interface PremiumFeatureGateProps {
  children: React.ReactNode;
  featureName: string;
  userType?: 'Parent' | 'School' | 'Freelancer';
  requiredPlan?: 'premium' | 'pro' | 'enterprise';
  features?: string[];
  renderAsCard?: boolean;
  cardIcon?: React.ReactNode;
  cardDescription?: string;
  className?: string;
}

const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  children,
  featureName,
  userType,
  requiredPlan = 'premium',
  features = [],
  renderAsCard = false,
  cardIcon,
  cardDescription = '',
  className = ""
}) => {
  const { user } = useAuth();

  // Vérifier si l'utilisateur a un abonnement Premium
  const hasAccess = () => {
    if (!user) return false;
    
    // Pour la démonstration, certains comptes demo ont accès
    if (user.email?.includes('demo') || user.email?.includes('test')) {
      return true;
    }

    // Vérifier le plan de l'utilisateur (à implémenter selon votre logique)
    const userPlan = (user as any).subscriptionPlan || 'freemium';
    
    switch (requiredPlan) {
      case 'premium':
        return ['premium', 'pro', 'enterprise'].includes(userPlan);
      case 'pro':
        return ['pro', 'enterprise'].includes(userPlan);
      case 'enterprise':
        return userPlan === 'enterprise';
      default:
        return false;
    }
  };

  const handleUpgrade = () => {
    // Rediriger vers la page d'abonnement
    window.location.href = '/subscribe';
  };

  const getUserType = (): 'Parent' | 'School' | 'Freelancer' => {
    if (userType) return userType;
    
    const role = user?.role;
    switch (role) {
      case 'Parent':
        return 'Parent';
      case 'Admin':
      case 'Director':
      case 'Teacher':
        return 'School';
      case 'Freelancer':
        return 'Freelancer';
      default:
        return 'Parent';
    }
  };

  const defaultFeatures = {
    Parent: [
      "Géolocalisation temps réel",
      "Bulletins détaillés avec graphiques",
      "Communication directe enseignants",
      "Historique complet des performances"
    ],
    School: [
      "Gestion multi-classes illimitée",
      "Rapports analytiques avancés",
      "Communication automatisée",
      "Support technique prioritaire"
    ],
    Freelancer: [
      "Accès à toutes les écoles partenaires",
      "Profil certifié premium",
      "Outils de gestion avancés",
      "Support commercial dédié"
    ]
  };

  // Si l'utilisateur a accès, afficher le contenu normalement
  if (hasAccess()) {
    return <>{children}</>;
  }

  const currentUserType = getUserType();
  const featureList = features.length > 0 ? features : defaultFeatures[currentUserType];

  // Si renderAsCard est true, afficher comme carte verrouillée
  if (renderAsCard && cardIcon) {
    return (
      <LockedModuleCard
        title={featureName}
        description={cardDescription}
        icon={cardIcon}
        userType={currentUserType}
        premiumFeatures={featureList}
        onUpgradeClick={handleUpgrade}
        className={className}
      />
    );
  }

  // Sinon, afficher l'overlay par-dessus le contenu existant
  return (
    <div className={`relative ${className}`}>
      {/* Contenu flouté en arrière-plan */}
      <div className="filter blur-sm pointer-events-none opacity-30">
        {children}
      </div>
      
      {/* Overlay de mise à niveau */}
      <PremiumUpgradeOverlay
        moduleName={featureName}
        userType={currentUserType}
        features={featureList}
        onUpgrade={handleUpgrade}
        className="absolute inset-0"
      />
    </div>
  );
};

export default PremiumFeatureGate;