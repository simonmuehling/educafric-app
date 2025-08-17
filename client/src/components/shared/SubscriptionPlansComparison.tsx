// React import removed
import { Check, X, Star, Shield, MapPin, Users, MessageSquare, Bell, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export const SubscriptionPlansComparison = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const text = {
    fr: {
      title: 'Plans d\'Abonnement EDUCAFRIC',
      subtitle: 'Choisissez le plan qui convient le mieux à vos besoins éducatifs',
      planBasic: 'Plan Basique',
      planGeolocation: 'Plan Géolocalisation',
      priceBasic: '15,000 CFA/mois',
      priceGeolocation: '25,000 CFA/mois',
      mostPopular: 'Le Plus Populaire',
      recommended: 'Recommandé',
      features: 'Fonctionnalités',
      basicFeatures: {
        communication: 'Communication bidirectionnelle école-parents',
        bulletins: 'Bulletins numériques professionnels',
        timetables: 'Emplois du temps interactifs',
        notifications: 'Notifications temps réel (Email, SMS, Push)',
        admin: 'Gestion administrative complète',
        support: 'Support technique standard',
        users: 'Jusqu\'à 200 utilisateurs',
        storage: '5 GB de stockage'
      },
      geolocationFeatures: {
        allBasic: 'Toutes les fonctionnalités du Plan Basique',
        gps: 'Suivi GPS temps réel des élèves',
        safeZones: 'Zones de sécurité configurables',
        alerts: 'Alertes géolocalisation automatiques',
        history: 'Historique détaillé des déplacements',
        emergencyContacts: 'Contacts d\'urgence prioritaires',
        prioritySupport: 'Support technique prioritaire 24/7',
        unlimitedUsers: 'Utilisateurs illimités',
        unlimitedStorage: 'Stockage illimité'
      },
      currentPlan: 'Plan Actuel',
      subscribeTo: 'S\'abonner au',
      upgradeFrom: 'Mettre à niveau depuis',
      contactSales: 'Contacter Commercial',
      importantNote: 'Important',
      bidirectionalRequirement: 'Pour une communication bidirectionnelle complète, l\'école ET les parents doivent avoir au minimum le Plan Basique actif.',
      includes: 'Inclus',
      notIncluded: 'Non inclus'
    },
    en: {
      title: 'EDUCAFRIC Subscription Plans',
      subtitle: 'Choose the plan that best fits your educational needs',
      planBasic: 'Basic Plan',
      planGeolocation: 'Geolocation Plan',
      priceBasic: '15,000 CFA/month',
      priceGeolocation: '25,000 CFA/month',
      mostPopular: 'Most Popular',
      recommended: 'Recommended',
      features: 'Features',
      basicFeatures: {
        communication: 'Bidirectional school-parent communication',
        bulletins: 'Professional digital report cards',
        timetables: 'Interactive timetables',
        notifications: 'Real-time notifications (Email, SMS, Push)',
        admin: 'Complete administrative management',
        support: 'Standard technical support',
        users: 'Up to 200 users',
        storage: '5 GB storage'
      },
      geolocationFeatures: {
        allBasic: 'All Basic Plan features',
        gps: 'Real-time GPS tracking of students',
        safeZones: 'Configurable safety zones',
        alerts: 'Automatic geolocation alerts',
        history: 'Detailed movement history',
        emergencyContacts: 'Priority emergency contacts',
        prioritySupport: '24/7 priority technical support',
        unlimitedUsers: 'Unlimited users',
        unlimitedStorage: 'Unlimited storage'
      },
      currentPlan: 'Current Plan',
      subscribeTo: 'Subscribe to',
      upgradeFrom: 'Upgrade from',
      contactSales: 'Contact Sales',
      importantNote: 'Important',
      bidirectionalRequirement: 'For complete bidirectional communication, both school AND parents must have at least an active Basic Plan.',
      includes: 'Included',
      notIncluded: 'Not included'
    }
  };

  const t = text[language];

  const isCurrentPlan = (planType: string) => {
    return user?.subscriptionPlan === planType && user?.subscriptionStatus === 'active';
  };

  const getActionButton = (planType: string) => {
    if (isCurrentPlan(planType)) {
      return (
        <Badge variant="default" className="w-full justify-center py-2">
          {t.currentPlan}
        </Badge>
      );
    }

    if (planType === 'basic') {
      return (
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {t.subscribeTo} {t.planBasic}
        </Button>
      );
    }

    if (planType === 'geolocation') {
      if (user?.subscriptionPlan === 'basic') {
        return (
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {t.upgradeFrom} {t.planBasic}
          </Button>
        );
      }
      return (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          {t.subscribeTo} {t.planGeolocation}
        </Button>
      );
    }
  };

  const FeatureItem = ({ included, children }: { included: boolean; children: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      {included ? (
        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        {children}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t.subtitle}
        </p>
      </div>

      {/* Important Communication Note */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
              {t.importantNote}
            </h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {t.bidirectionalRequirement}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plan Basique */}
        <Card className={`relative ${isCurrentPlan('basic') ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
          {isCurrentPlan('basic') && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">
                {t.currentPlan}
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.planBasic}
              </h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {t.priceBasic}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'fr' ? 'Parfait pour les écoles débutantes' : 'Perfect for starting schools'}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t.features}
              </h4>
              <div className="space-y-1">
                <FeatureItem included={true}>
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  {t.basicFeatures.communication}
                </FeatureItem>
                <FeatureItem included={true}>
                  <Shield className="w-4 h-4 inline mr-2" />
                  {t.basicFeatures.bulletins}
                </FeatureItem>
                <FeatureItem included={true}>
                  <Bell className="w-4 h-4 inline mr-2" />
                  {t.basicFeatures.notifications}
                </FeatureItem>
                <FeatureItem included={true}>
                  <Users className="w-4 h-4 inline mr-2" />
                  {t.basicFeatures.users}
                </FeatureItem>
                <FeatureItem included={true}>
                  {t.basicFeatures.support}
                </FeatureItem>
                <FeatureItem included={false}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {language === 'fr' ? 'Géolocalisation GPS' : 'GPS Geolocation'}
                </FeatureItem>
                <FeatureItem included={false}>
                  {language === 'fr' ? 'Support prioritaire 24/7' : '24/7 priority support'}
                </FeatureItem>
              </div>
            </div>

            <div className="pt-4">
              {getActionButton('basic')}
            </div>
          </CardContent>
        </Card>

        {/* Plan Géolocalisation */}
        <Card className={`relative ${isCurrentPlan('geolocation') ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'ring-2 ring-emerald-200 dark:ring-emerald-800'}`}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-emerald-600 text-white px-4 py-1">
              {isCurrentPlan('geolocation') ? t.currentPlan : t.recommended}
            </Badge>
          </div>
          
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.planGeolocation}
              </h3>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {t.priceGeolocation}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'fr' ? 'Sécurité maximale pour vos élèves' : 'Maximum security for your students'}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t.features}
              </h4>
              <div className="space-y-1">
                <FeatureItem included={true}>
                  <Check className="w-4 h-4 inline mr-2 text-emerald-500" />
                  {t.geolocationFeatures.allBasic}
                </FeatureItem>
                <FeatureItem included={true}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {t.geolocationFeatures.gps}
                </FeatureItem>
                <FeatureItem included={true}>
                  <Shield className="w-4 h-4 inline mr-2" />
                  {t.geolocationFeatures.safeZones}
                </FeatureItem>
                <FeatureItem included={true}>
                  <Bell className="w-4 h-4 inline mr-2" />
                  {t.geolocationFeatures.alerts}
                </FeatureItem>
                <FeatureItem included={true}>
                  {t.geolocationFeatures.prioritySupport}
                </FeatureItem>
                <FeatureItem included={true}>
                  <Users className="w-4 h-4 inline mr-2" />
                  {t.geolocationFeatures.unlimitedUsers}
                </FeatureItem>
              </div>
            </div>

            <div className="pt-4">
              {getActionButton('geolocation')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Sales */}
      <div className="text-center pt-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {language === 'fr' 
            ? 'Besoin d\'un plan personnalisé ou d\'une démonstration ?' 
            : 'Need a custom plan or demonstration?'
          }
        </p>
        <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
          <CreditCard className="w-4 h-4 mr-2" />
          {t.contactSales}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPlansComparison;