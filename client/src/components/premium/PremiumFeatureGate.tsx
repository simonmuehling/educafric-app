import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PremiumUpgradeOverlay from './PremiumUpgradeOverlay';
import LockedModuleCard from './LockedModuleCard';
import { offlineStorage } from '@/services/offlineStorage';
import { AlertTriangle } from 'lucide-react';

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
  const [subscriptionFreshness, setSubscriptionFreshness] = useState<{
    isFresh: boolean;
    daysOld: number;
    shouldWarn: boolean;
    shouldBlock: boolean;
  } | null>(null);

  // Check subscription data freshness when offline
  useEffect(() => {
    const checkFreshness = async () => {
      if (!user || navigator.onLine) {
        setSubscriptionFreshness(null);
        return;
      }

      try {
        const freshness = await offlineStorage.isSubscriptionDataFresh(user.id);
        setSubscriptionFreshness(freshness);
        
        if (freshness.shouldWarn && import.meta.env.DEV) {
          console.warn(`[PREMIUM_GATE] ⚠️ Subscription data is ${freshness.daysOld} days old`);
        }
      } catch (error) {
        console.error('[PREMIUM_GATE] Error checking subscription freshness:', error);
        setSubscriptionFreshness(null);
      }
    };

    checkFreshness();
  }, [user]);

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
      if (import.meta.env.DEV) {
        console.log('[PREMIUM_GATE] 🎯 Sandbox user detected, granting free access:', user.email);
      }
      return true;
    }

    // FREELANCER DEMO ACCESS - Allow full access for freelancer demos
    if (user.role === 'Freelancer' && user.email?.includes('demo')) {
      if (import.meta.env.DEV) {
        console.log('[PREMIUM_GATE] 🎓 Freelancer demo user detected, granting access:', user.email);
      }
      return true;
    }

    // OFFLINE MODE: Block access if subscription data is too old (>14 days)
    if (!navigator.onLine && subscriptionFreshness?.shouldBlock) {
      console.warn('[PREMIUM_GATE] 🚫 Offline access blocked - subscription data is too old');
      return false;
    }

    // Pour les vrais utilisateurs, vérifier l'abonnement actif
    const hasActiveSubscription = user.subscriptionStatus === 'active' && user.subscriptionPlan;
    
    if (!hasActiveSubscription) {
      return false; // Bloquer l'accès si pas d'abonnement actif
    }

    const userPlan = user.subscriptionPlan;
    
    // SPECIAL CASE: Géolocalisation requires parent_gps ONLY
    // Check for geolocation features (case-insensitive, both French and English)
    const isGeolocationFeature = featureName.toLowerCase().includes('géolocalisation') || 
                                  featureName.toLowerCase().includes('geolocation') ||
                                  featureName.toLowerCase().includes('gps');
    
    if (isGeolocationFeature) {
      // Only parent_gps or geolocation plan unlocks geolocation features
      return userPlan === 'parent_gps' || userPlan === 'geolocation';
    }

    // Mapper les plans EDUCAFRIC aux niveaux de fonctionnalités
    // parent_bronze and parent_bronze_p unlock ALL premium features EXCEPT geolocation
    const planLevels = {
      'basic': ['basic'],
      'parent_bronze': ['basic', 'premium'], // Public school - premium access to all features except geo
      'parent_bronze_p': ['basic', 'premium'], // Private school - premium access to all features except geo
      'parent_gps': ['basic'], // GPS ONLY - no premium access to other features
      'geolocation': ['basic', 'premium'], // Plan géolocalisation = premium (ancien, compatibility)
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
    // Show warning banner if subscription data is stale but still valid
    if (!navigator.onLine && subscriptionFreshness?.shouldWarn && !subscriptionFreshness.shouldBlock) {
      return (
        <>
          {/* Warning banner for stale subscription data */}
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Offline Mode - Subscription data may be outdated
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Your subscription was last verified {subscriptionFreshness.daysOld} days ago. 
                  Please reconnect to the internet to refresh your subscription status.
                  {subscriptionFreshness.daysOld >= 10 && (
                    <span className="block mt-1 font-semibold">
                      Access will be blocked after {14 - subscriptionFreshness.daysOld} more days offline.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          {children}
        </>
      );
    }
    
    return <>{children}</>;
  }

  const currentUserType = getUserType();
  const featureList = features.length > 0 ? features : defaultFeatures[currentUserType];

  // Special case: Blocked due to stale subscription data (>14 days offline)
  if (!navigator.onLine && subscriptionFreshness?.shouldBlock) {
    return (
      <div className={`relative ${className}`}>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Offline Access Expired
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Your subscription data is {subscriptionFreshness.daysOld} days old and could not be verified.
                For security reasons, offline access to premium features is limited to 14 days.
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                  To regain access:
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Connect to the internet</li>
                  <li>Your subscription will be automatically verified</li>
                  <li>Offline access will be renewed for another 14 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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