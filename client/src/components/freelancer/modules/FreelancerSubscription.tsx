import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, Crown, Star, CheckCircle, DollarSign, 
  CalendarDays, Smartphone, Mail, Users, BookOpen, 
  BarChart3, TrendingUp, MapPin, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/ModernCard';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const FreelancerSubscription = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');

  const text = {
    fr: {
      title: 'Gestion des Abonnements Répétiteur',
      subtitle: 'Choisissez le plan qui correspond à vos besoins d\'enseignement',
      currentPlan: 'Plan Actuel',
      upgradeNow: 'Mettre à Niveau',
      selectPlan: 'Sélectionner ce Plan',
      features: 'Fonctionnalités',
      popular: 'Populaire',
      recommended: 'Recommandé',
      perMonth: 'par mois',
      perSemester: 'par semestre',
      perYear: 'par an',
      savings: 'économies',
      freePlan: 'Plan Gratuit',
      freePlanDesc: 'Fonctionnalités de base pour débuter',
      semesterPlan: 'Répétiteur Semestriel',
      semesterPlanDesc: 'Plan adapté pour un semestre d\'enseignement',
      annualPlan: 'Répétiteur Annuel',
      annualPlanDesc: 'Le meilleur rapport qualité-prix',
      geoLocationPlan: 'Répétiteur GPS',
      geoLocationPlanDesc: 'Avec suivi géolocalisation avancé',
      // Fonctionnalités Free
      freeFeature1: 'Profil répétiteur de base',
      freeFeature2: 'Jusqu\'à 5 élèves',
      freeFeature3: 'Communication simple',
      // Fonctionnalités Semester
      semesterFeature1: 'Jusqu\'à 20 élèves',
      semesterFeature2: 'Gestion classes avancée',
      semesterFeature3: 'Suivi des progrès',
      semesterFeature4: 'Communication parents',
      semesterFeature5: 'Planification cours',
      // Fonctionnalités Annual
      annualFeature1: 'Élèves illimités',
      annualFeature2: 'Analytiques détaillées',
      annualFeature3: 'Rapports personnalisés',
      annualFeature4: 'Support prioritaire',
      annualFeature5: 'Formation continue',
      annualFeature6: 'Certification qualité',
      // Fonctionnalités GPS
      geoFeature1: 'Suivi GPS temps réel',
      geoFeature2: 'Zones d\'enseignement',
      geoFeature3: 'Alertes de sécurité',
      geoFeature4: 'Historique déplacements',
      geoFeature5: 'Notifications parents',
      // Méthodes de paiement
      paymentMethods: 'Méthodes de Paiement',
      stripeCard: 'Carte Bancaire (Stripe)',
      orangeMoney: 'Orange Money',
      bankTransfer: 'Virement Bancaire',
      payNow: 'Payer Maintenant',
      subscribeSuccess: 'Abonnement activé avec succès!',
      subscribeError: 'Erreur lors de l\'abonnement'
    },
    en: {
      title: 'Freelancer Subscription Management',
      subtitle: 'Choose the plan that fits your teaching needs',
      currentPlan: 'Current Plan',
      upgradeNow: 'Upgrade Now',
      selectPlan: 'Select This Plan',
      features: 'Features',
      popular: 'Popular',
      recommended: 'Recommended',
      perMonth: 'per month',
      perSemester: 'per semester',
      perYear: 'per year',
      savings: 'savings',
      freePlan: 'Free Plan',
      freePlanDesc: 'Basic features to get started',
      semesterPlan: 'Semester Tutor',
      semesterPlanDesc: 'Perfect for one semester of teaching',
      annualPlan: 'Annual Tutor',
      annualPlanDesc: 'Best value for money',
      geoLocationPlan: 'GPS Tutor',
      geoLocationPlanDesc: 'With advanced geolocation tracking',
      // Free Features
      freeFeature1: 'Basic tutor profile',
      freeFeature2: 'Up to 5 students',
      freeFeature3: 'Simple communication',
      // Semester Features
      semesterFeature1: 'Up to 20 students',
      semesterFeature2: 'Advanced class management',
      semesterFeature3: 'Progress tracking',
      semesterFeature4: 'Parent communication',
      semesterFeature5: 'Lesson planning',
      // Annual Features
      annualFeature1: 'Unlimited students',
      annualFeature2: 'Detailed analytics',
      annualFeature3: 'Custom reports',
      annualFeature4: 'Priority support',
      annualFeature5: 'Continuous training',
      annualFeature6: 'Quality certification',
      // GPS Features
      geoFeature1: 'Real-time GPS tracking',
      geoFeature2: 'Teaching zones',
      geoFeature3: 'Security alerts',
      geoFeature4: 'Movement history',
      geoFeature5: 'Parent notifications',
      // Payment methods
      paymentMethods: 'Payment Methods',
      stripeCard: 'Bank Card (Stripe)',
      orangeMoney: 'Orange Money',
      bankTransfer: 'Bank Transfer',
      payNow: 'Pay Now',
      subscribeSuccess: 'Subscription activated successfully!',
      subscribeError: 'Error during subscription'
    }
  };

  const t = text[language as keyof typeof text];

  const subscriptionPlans = [
    {
      id: 'free',
      name: t.freePlan,
      description: t.freePlanDesc,
      price: 0,
      period: '',
      currency: 'CFA',
      badge: '',
      color: 'gray',
      features: [
        t.freeFeature1,
        t.freeFeature2,
        t.freeFeature3
      ],
      icon: <Users className="w-6 h-6" />,
      buttonText: (user as any)?.subscriptionStatus === 'active' ? t.currentPlan : t.selectPlan,
      isCurrentPlan: (user as any)?.subscriptionStatus !== 'active'
    },
    {
      id: 'semester',
      name: t.semesterPlan,
      description: t.semesterPlanDesc,
      price: 12500,
      period: t.perSemester,
      currency: 'CFA',
      badge: t.popular,
      color: 'blue',
      features: [
        t.semesterFeature1,
        t.semesterFeature2,
        t.semesterFeature3,
        t.semesterFeature4,
        t.semesterFeature5
      ],
      icon: <BookOpen className="w-6 h-6" />,
      buttonText: t.upgradeNow,
      isCurrentPlan: false
    },
    {
      id: 'annual',
      name: t.annualPlan,
      description: t.annualPlanDesc,
      price: 25000,
      period: t.perYear,
      currency: 'CFA',
      badge: t.recommended,
      color: 'green',
      savings: '5,000 CFA',
      features: [
        t.annualFeature1,
        t.annualFeature2,
        t.annualFeature3,
        t.annualFeature4,
        t.annualFeature5,
        t.annualFeature6
      ],
      icon: <Award className="w-6 h-6" />,
      buttonText: t.upgradeNow,
      isCurrentPlan: false
    },
    {
      id: 'geolocation',
      name: t.geoLocationPlan,
      description: t.geoLocationPlanDesc,
      price: 15000,
      period: t.perYear,
      currency: 'CFA',
      badge: '',
      color: 'purple',
      features: [
        t.geoFeature1,
        t.geoFeature2,
        t.geoFeature3,
        t.geoFeature4,
        t.geoFeature5
      ],
      icon: <MapPin className="w-6 h-6" />,
      buttonText: t.upgradeNow,
      isCurrentPlan: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      // Redirection vers la page d'abonnement avec le plan sélectionné
      if (window && window.location) {
        window.location.href = `/subscribe?plan=${planId}&type=freelancer`;
      }
      
      toast({
        title: t.subscribeSuccess,
        description: language === 'fr' 
          ? 'Vous allez être redirigé vers la page de paiement' 
          : 'You will be redirected to the payment page'
      });
    } catch (error) {
      toast({
        title: t.subscribeError,
        description: language === 'fr' 
          ? 'Une erreur est survenue' 
          : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-700';
      case 'green': return 'bg-green-600 hover:bg-green-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getBadgeColor = (badge: string) => {
    if (badge === t.popular) return 'bg-blue-100 text-blue-800';
    if (badge === t.recommended) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.title || ''}</h3>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Array.isArray(subscriptionPlans) ? subscriptionPlans : []).map((plan) => (
          <ModernCard 
            key={plan.id} 
            className={`relative p-6 hover:shadow-lg transition-all duration-300 ${
              plan.isCurrentPlan ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <Badge className={`absolute top-4 right-4 ${getBadgeColor(plan.badge)}`}>
                {plan.badge}
              </Badge>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex p-3 rounded-full bg-${plan.color}-100 text-${plan.color}-600 mb-4`}>
                {plan.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name || ''}</h4>
              <p className="text-gray-600 text-sm mb-4">{plan.description || ''}</p>
              
              {/* Pricing */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {plan?.price?.toLocaleString()} {plan.currency}
                </div>
                {plan.period && (
                  <div className="text-gray-600 text-sm">{plan.period}</div>
                )}
                {plan.savings && (
                  <div className="text-green-600 text-sm font-medium">
                    {t.savings}: {plan.savings}
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <Button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || plan.isCurrentPlan}
              className={`w-full ${getButtonColor(plan.color)} text-white`}
            >
              {plan.isCurrentPlan ? (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  {plan.buttonText}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {plan.buttonText}
                </>
              )}
            </Button>
          </ModernCard>
        ))}
      </div>

      {/* Payment Methods */}
      <ModernCard className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t.paymentMethods}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">{t.stripeCard}</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Smartphone className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">{t.orangeMoney}</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">{t.bankTransfer}</span>
          </div>
        </div>
      </ModernCard>

      {/* Current Subscription Status */}
      <ModernCard className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{t.currentPlan}</h4>
            <p className="text-gray-600">
              {(user as any)?.subscriptionStatus === 'active' ? 'Plan Premium Actif' : t.freePlan}
            </p>
          </div>
          <Badge variant={(user as any)?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
            {(user as any)?.subscriptionStatus === 'active' ? 'Actif' : 'Gratuit'}
          </Badge>
        </div>
      </ModernCard>
    </div>
  );
};

export default FreelancerSubscription;