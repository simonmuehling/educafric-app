import React from 'react';
import { User, Shield, MapPin, Clock, CheckCircle2, XCircle, Star } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlanDisplayProps {
  className?: string;
  showUpgradeButton?: boolean;
  userRole?: string;
}

export const SubscriptionPlanDisplay = ({ className = '', showUpgradeButton = true, userRole }: SubscriptionPlanDisplayProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Only show subscription info for roles that need it (Teachers, Students, and Freelancers get free access)
  const rolesWithSubscriptions = ['Parent', 'SiteAdmin', 'Admin', 'Director', 'Commercial'];
  const currentRole = userRole || user?.role;
  
  if (!rolesWithSubscriptions.includes(currentRole || '')) {
    return (
      <ModernCard className={`${className} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`}>
        <div className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'fr' ? 'Accès Géré par l\'École' : 'School-Managed Access'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'fr' 
              ? 'Votre accès aux fonctionnalités est géré par votre établissement. Aucun abonnement personnel n\'est requis.'
              : 'Your access to features is managed by your institution. No personal subscription is required.'
            }
          </p>
        </div>
      </ModernCard>
    );
  }

  const text = {
    fr: {
      title: 'Plan d\'Abonnement',
      currentPlan: 'Plan Actuel',
      planBasic: 'Plan Basique',
      planGeolocation: 'Plan Géolocalisation',
      planInactive: 'Aucun Plan Actif',
      status: 'Statut',
      activeStatus: 'Actif',
      inactiveStatus: 'Inactif',
      expiredStatus: 'Expiré',
      cancelledStatus: 'Annulé',
      since: 'Depuis le',
      expires: 'Expire le',
      features: 'Fonctionnalités Incluses',
      basicFeatures: [
        'Communication bidirectionnelle école-parents',
        'Bulletins numériques',
        'Emplois du temps',
        'Gestion administrative',
        'Notifications temps réel',
        'Support technique standard'
      ],
      geolocationFeatures: [
        'Toutes les fonctionnalités du Plan Basique',
        'Suivi GPS temps réel',
        'Zones de sécurité configurables',
        'Alertes géolocalisation automatiques',
        'Historique des déplacements',
        'Support technique prioritaire'
      ],
      upgrade: 'Mettre à Niveau',
      manage: 'Gérer l\'Abonnement',
      activateBasic: 'Activer Plan Basique',
      upgradeToGeo: 'Passer au Plan Géolocalisation',
      communication: 'Communication',
      geolocation: 'Géolocalisation',
      administration: 'Administration'
    },
    en: {
      title: 'Subscription Plan',
      currentPlan: 'Current Plan',
      planBasic: 'Basic Plan',
      planGeolocation: 'Geolocation Plan',
      planInactive: 'No Active Plan',
      status: 'Status',
      activeStatus: 'Active',
      inactiveStatus: 'Inactive',
      expiredStatus: 'Expired',
      cancelledStatus: 'Cancelled',
      since: 'Since',
      expires: 'Expires on',
      features: 'Included Features',
      basicFeatures: [
        'Bidirectional school-parent communication',
        'Digital report cards',
        'Timetables',
        'Administrative management',
        'Real-time notifications',
        'Standard technical support'
      ],
      geolocationFeatures: [
        'All Basic Plan features',
        'Real-time GPS tracking',
        'Configurable safety zones',
        'Automatic geolocation alerts',
        'Movement history',
        'Priority technical support'
      ],
      upgrade: 'Upgrade',
      manage: 'Manage Subscription',
      activateBasic: 'Activate Basic Plan',
      upgradeToGeo: 'Upgrade to Geolocation Plan',
      communication: 'Communication',
      geolocation: 'Geolocation',
      administration: 'Administration'
    }
  };

  const t = text[language];

  const getPlanInfo = () => {
    const plan = user?.subscriptionPlan;
    const status = user?.subscriptionStatus || 'inactive';
    
    if (!plan || status === 'inactive') {
      return {
        name: t.planInactive,
        status: t.inactiveStatus,
        statusColor: 'destructive',
        icon: <XCircle className="w-5 h-5" />,
        features: [],
        canUpgrade: true
      };
    }

    if (plan === 'basic') {
      return {
        name: t.planBasic,
        status: status === 'active' ? t.activeStatus : t.inactiveStatus,
        statusColor: status === 'active' ? 'default' : 'destructive',
        icon: <User className="w-5 h-5" />,
        features: t.basicFeatures,
        canUpgrade: true,
        color: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    }

    if (plan === 'geolocation') {
      return {
        name: t.planGeolocation,
        status: status === 'active' ? t.activeStatus : t.inactiveStatus,
        statusColor: status === 'active' ? 'default' : 'destructive',
        icon: <MapPin className="w-5 h-5" />,
        features: t.geolocationFeatures,
        canUpgrade: false,
        color: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        isPremium: true
      };
    }

    return {
      name: t.planInactive,
      status: t.inactiveStatus,
      statusColor: 'destructive',
      icon: <XCircle className="w-5 h-5" />,
      features: [],
      canUpgrade: true
    };
  };

  const planInfo = getPlanInfo();
  const subscriptionStart = user?.subscriptionStart;
  const subscriptionEnd = user?.subscriptionEnd;

  const getStatusIcon = () => {
    if (planInfo.statusColor === 'default') {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getCategoryIcon = (feature: string) => {
    if (feature.toLowerCase().includes('communication') || feature.toLowerCase().includes('notification')) {
      return <Shield className="w-4 h-4 text-blue-500" />;
    }
    if (feature.toLowerCase().includes('gps') || feature.toLowerCase().includes('géo') || feature.toLowerCase().includes('zone')) {
      return <MapPin className="w-4 h-4 text-emerald-500" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
  };

  return (
    <ModernCard className={`${className} ${planInfo.color || ''} ${planInfo.borderColor || ''}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {planInfo.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {planInfo.name}
                {planInfo.isPremium && <Star className="w-4 h-4 text-yellow-500" />}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                <Badge variant={planInfo.statusColor as any} className="text-xs">
                  {planInfo.status}
                </Badge>
              </div>
            </div>
          </div>

          {showUpgradeButton && planInfo.canUpgrade && (
            <Button size="sm" className="ml-4">
              {user?.subscriptionStatus === 'inactive' ? t.activateBasic : t.upgradeToGeo}
            </Button>
          )}
        </div>

        {(subscriptionStart || subscriptionEnd) && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {subscriptionStart && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{t.since}: {new Date(subscriptionStart).toLocaleDateString()}</span>
                </div>
              )}
              {subscriptionEnd && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{t.expires}: {new Date(subscriptionEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {planInfo.features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t.features}
            </h4>
            <div className="space-y-2">
              {planInfo.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {getCategoryIcon(feature)}
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {user?.subscriptionStatus === 'inactive' && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>⚠️ {language === 'fr' ? 'Important' : 'Important'}:</strong>{' '}
              {language === 'fr' 
                ? 'Pour une communication bidirectionnelle complète avec l\'école/parents, un plan actif est requis.'
                : 'For complete bidirectional communication with school/parents, an active plan is required.'
              }
            </p>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

export default SubscriptionPlanDisplay;