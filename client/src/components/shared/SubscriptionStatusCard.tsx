import React from 'react';
import { User, Shield, MapPin, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { FEATURE_FLAGS } from '@shared/config';

interface SubscriptionStatusCardProps {
  showForRole?: string;
}

export const SubscriptionStatusCard = ({ showForRole }: SubscriptionStatusCardProps) => {
  // ⚡ FEATURE FLAG: Don't show subscription status if enforcement is disabled
  if (!FEATURE_FLAGS.PREMIUM_ENFORCEMENT_ENABLED) {
    return null;
  }

  const { language } = useLanguage();
  const { user } = useAuth();

  // Only show subscription info for roles that need it (Teachers and Students get free access)  
  const rolesWithSubscriptions = ['Parent', 'SiteAdmin', 'Admin', 'Director', 'Commercial', 'Freelancer'];
  const currentRole = showForRole || user?.role;
  
  if (!rolesWithSubscriptions.includes(currentRole || '')) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border-2">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'fr' ? 'Accès Gratuit' : 'Free Access'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'fr' 
              ? 'Votre accès est géré par votre école. Aucun abonnement personnel requis.'
              : 'Your access is managed by your school. No personal subscription required.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const text = {
    fr: {
      subscriptionStatus: 'Statut d\'Abonnement',
      planBasic: 'Plan Basique',
      planGeolocation: 'Plan Géolocalisation',
      noActivePlan: 'Aucun Plan Actif',
      active: 'Actif',
      inactive: 'Inactif',
      expired: 'Expiré',
      cancelled: 'Annulé',
      upgrade: 'Mettre à Niveau',
      subscribe: 'S\'Abonner',
      manage: 'Gérer',
      communicationIncluded: 'Communication bidirectionnelle',
      gpsIncluded: 'Suivi GPS inclus',
      requiresSubscription: 'Communication bidirectionnelle nécessite un abonnement actif',
      viewPlans: 'Voir les Plans'
    },
    en: {
      subscriptionStatus: 'Subscription Status',
      planBasic: 'Basic Plan',
      planGeolocation: 'Geolocation Plan',
      noActivePlan: 'No Active Plan',
      active: 'Active',
      inactive: 'Inactive',
      expired: 'Expired',
      cancelled: 'Cancelled',
      upgrade: 'Upgrade',
      subscribe: 'Subscribe',
      manage: 'Manage',
      communicationIncluded: 'Bidirectional communication',
      gpsIncluded: 'GPS tracking included',
      requiresSubscription: 'Bidirectional communication requires active subscription',
      viewPlans: 'View Plans'
    }
  };

  const t = text[language];

  const getPlanDisplayInfo = () => {
    const plan = user?.subscriptionPlan;
    const status = user?.subscriptionStatus || 'inactive';

    if (!plan || status === 'inactive') {
      return {
        name: t.noActivePlan,
        status: t.inactive,
        statusVariant: 'destructive' as const,
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
        description: t.requiresSubscription,
        actionText: t.subscribe,
        actionLink: '/subscribe',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800'
      };
    }

    if (plan === 'basic') {
      return {
        name: t.planBasic,
        status: status === 'active' ? t.active : t.inactive,
        statusVariant: (status === 'active' ? 'default' : 'destructive') as const,
        icon: <User className="w-5 h-5 text-blue-500" />,
        description: t.communicationIncluded,
        actionText: t.upgrade,
        actionLink: '/geolocation-pricing',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    }

    if (plan === 'geolocation') {
      return {
        name: t.planGeolocation,
        status: status === 'active' ? t.active : t.inactive,
        statusVariant: (status === 'active' ? 'default' : 'destructive') as const,
        icon: <Crown className="w-5 h-5 text-emerald-500" />,
        description: t.gpsIncluded,
        actionText: t.manage,
        actionLink: '/profile',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800'
      };
    }

    return {
      name: t.noActivePlan,
      status: t.inactive,
      statusVariant: 'destructive' as const,
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      description: t.requiresSubscription,
      actionText: t.viewPlans,
      actionLink: '/subscribe',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800'
    };
  };

  const planInfo = getPlanDisplayInfo();

  return (
    <Card className={`${planInfo.bgColor} ${planInfo.borderColor} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {planInfo.icon}
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.subscriptionStatus}
            </h3>
          </div>
          <Badge variant={planInfo.statusVariant}>
            {planInfo.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {planInfo.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {planInfo.description}
            </p>
          </div>
          
          {user?.subscriptionStatus === 'inactive' && (
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>{language === 'fr' ? 'Important' : 'Important'}:</strong>{' '}
                  {language === 'fr' 
                    ? 'Pour communiquer avec l\'école/parents, les deux parties doivent avoir un plan actif.'
                    : 'To communicate with school/parents, both parties must have an active plan.'
                  }
                </p>
              </div>
            </div>
          )}

          <Link href={planInfo.actionLink}>
            <Button 
              size="sm" 
              className="w-full"
              variant={planInfo.statusVariant === 'destructive' ? 'default' : 'outline'}
            >
              {planInfo.actionText}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;