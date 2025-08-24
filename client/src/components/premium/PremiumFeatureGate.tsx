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
    
    // Rôles avec accès gratuit (Teachers et Students n'ont pas besoin d'abonnement)
    const freeAccessRoles = ['Teacher', 'Student'];
    if (freeAccessRoles.includes(user.role)) {
      return true;
    }
    
    // Pour les comptes sandbox/test SEULEMENT, donner accès gratuit
    if (user.email?.includes('test.educafric.com') || user.email?.includes('sandbox')) {
      console.log('[PREMIUM_GATE] 🎯 Sandbox user detected, granting free access:', user.email);
      return true;
    }

    // FREELANCER DEMO ACCESS - Allow full access for freelancer demos
    if (user.role === 'Freelancer' && user.email?.includes('demo')) {
      console.log('[PREMIUM_GATE] 🎓 Freelancer demo user detected, granting access:', user.email);
      return true;
    }

    // Pour les vrais utilisateurs, vérifier l'abonnement actif
    const hasActiveSubscription = user.subscriptionStatus === 'active' && user.subscriptionPlan;
    
    if (!hasActiveSubscription) {
      return false; // Bloquer l'accès si pas d'abonnement actif
    }

    // Mapper les plans EDUCAFRIC aux niveaux de fonctionnalités
    const userPlan = user.subscriptionPlan;
    const planLevels = {
      'basic': ['basic'],
      'geolocation': ['basic', 'premium'], // Plan géolocalisation = premium
      'premium': ['basic', 'premium'],
      'pro': ['basic', 'premium', 'pro'],
      'enterprise': ['basic', 'premium', 'pro', 'enterprise']
    };
    
    const userLevels = planLevels[userPlan as keyof typeof planLevels] || [];
    
    switch (requiredPlan) {
      case 'premium':
        return userLevels.includes('premium');
      case 'pro':
        return userLevels.includes('pro');
      case 'enterprise':
        return userLevels.includes('enterprise');
      default:
        return userLevels.includes('basic');
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