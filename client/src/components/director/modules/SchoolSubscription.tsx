import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, Star, Users, MessageSquare, Bell, MapPin, 
  CreditCard, Calendar, Check, ArrowRight, Heart,
  Smartphone, Eye, AlertTriangle, ScanEye, Loader2,
  School, GraduationCap, BookOpen, UserCheck
} from 'lucide-react';

const SchoolSubscription = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // 📡 Récupérer les vraies données d'abonnement école
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['/api/school/subscription', user?.id],
    queryFn: () => apiRequest('GET', '/api/school/subscription'),
    enabled: !!user?.id
  });

  // 📡 Récupérer l'état des passerelles avec les parents
  const { data: gatewayStatus } = useQuery({
    queryKey: ['/api/school/gateway-status', user?.id],
    queryFn: () => apiRequest('GET', '/api/school/gateway-status'),
    enabled: !!user?.id
  });

  const text = {
    fr: {
      title: 'Abonnement École',
      subtitle: 'Gérer le plan d\'abonnement de votre établissement scolaire',
      currentPlan: 'Plan Actuel',
      subscriptionLevel: 'Niveau d\'Abonnement',
      planDetails: 'Détails du Plan',
      upgrade: 'Mettre à niveau',
      downgrade: 'Rétrograder',
      features: 'Fonctionnalités',
      billingCycle: 'Cycle de Facturation',
      nextBilling: 'Prochaine Facture',
      paymentMethod: 'Méthode de Paiement',
      planOptions: 'Options de Plan',
      freePlan: 'Plan Gratuit (Freemium)',
      schoolBasic: 'École Basique',
      schoolPremium: 'École Premium',
      schoolEnterprise: 'École Enterprise',
      monthly: 'Mensuel',
      annual: 'Annuel',
      perMonth: '/mois',
      perYear: '/an',
      savings: 'Économies',
      popular: 'Populaire',
      current: 'Actuel',
      choosePlan: 'Choisir ce Plan',
      viewAllPlans: 'Voir Tous Les Plans',
      manageBilling: 'Gérer Facturation',
      downloadInvoice: 'Télécharger Facture',
      cancelSubscription: 'Annuler Abonnement',
      studentLimits: 'Limites Élèves',
      teacherLimits: 'Limites Enseignants',
      classLimits: 'Limites Classes',
      basicFeatures: 'Fonctionnalités de Base',
      premiumFeatures: 'Fonctionnalités Premium',
      feature1: 'Gestion complète des élèves',
      feature2: 'Système de notes et bulletins',
      feature3: 'Communication parents-école',
      feature4: 'Rapports de présence',
      feature5: 'Emploi du temps avancé',
      feature6: 'Géolocalisation et sécurité',
      feature7: 'Support technique prioritaire',
      feature8: 'Analytics et statistiques',
      feature9: 'Intégrations API',
      feature10: 'Formation équipe',
      priceInCFA: 'Prix en CFA',
      activateNow: 'Activer Maintenant',
      billingAddress: 'Adresse de Facturation',
      paymentHistory: 'Historique des Paiements',
      renewalDate: 'Date de Renouvellement',
      autoRenewal: 'Renouvellement Automatique',
      cancelAnytime: 'Annuler À Tout Moment',
      gatewayStatus: 'État Communication Parents',
      activeConnections: 'Connexions Actives',
      inactiveConnections: 'Connexions Inactives',
      educafricPays: 'Educafric PAIE l\'École',
      negativeRevenue: 'Revenus Négatifs'
    },
    en: {
      title: 'School Subscription',
      subtitle: 'Manage your educational institution subscription plan',
      currentPlan: 'Current Plan',
      subscriptionLevel: 'Subscription Level',
      planDetails: 'Plan Details',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade',
      features: 'Features',
      billingCycle: 'Billing Cycle',
      nextBilling: 'Next Billing',
      paymentMethod: 'Payment Method',
      planOptions: 'Plan Options',
      freePlan: 'Free Plan (Freemium)',
      schoolBasic: 'School Basic',
      schoolPremium: 'School Premium',
      schoolEnterprise: 'School Enterprise',
      monthly: 'Monthly',
      annual: 'Annual',
      perMonth: '/month',
      perYear: '/year',
      savings: 'Savings',
      popular: 'Popular',
      current: 'Current',
      choosePlan: 'Choose Plan',
      viewAllPlans: 'View All Plans',
      manageBilling: 'Manage Billing',
      downloadInvoice: 'Download Invoice',
      cancelSubscription: 'Cancel Subscription',
      studentLimits: 'Student Limits',
      teacherLimits: 'Teacher Limits',
      classLimits: 'Class Limits',
      basicFeatures: 'Basic Features',
      premiumFeatures: 'Premium Features',
      feature1: 'Complete student management',
      feature2: 'Grading and report cards',
      feature3: 'Parent-school communication',
      feature4: 'Attendance reports',
      feature5: 'Advanced timetabling',
      feature6: 'Geolocation and security',
      feature7: 'Priority technical support',
      feature8: 'Analytics and statistics',
      feature9: 'API integrations',
      feature10: 'Team training',
      priceInCFA: 'Price in CFA',
      activateNow: 'Activate Now',
      billingAddress: 'Billing Address',
      paymentHistory: 'Payment History',
      renewalDate: 'Renewal Date',
      autoRenewal: 'Auto Renewal',
      cancelAnytime: 'Cancel Anytime',
      gatewayStatus: 'Parent Communication Status',
      activeConnections: 'Active Connections',
      inactiveConnections: 'Inactive Connections',
      educafricPays: 'Educafric PAYS the School',
      negativeRevenue: 'Negative Revenue'
    }
  };

  const t = text[language as keyof typeof text];

  const schoolPlans = [
    {
      id: 'freemium',
      name: t.freePlan,
      price: 0,
      period: 'free',
      color: 'from-gray-400 to-gray-500',
      limits: {
        students: 30,
        teachers: 5,
        classes: 5
      },
      features: [
        { icon: <Users className="w-4 h-4" />, text: `${t.feature1} (max 30 élèves)` },
        { icon: <GraduationCap className="w-4 h-4" />, text: `${t.feature2} (basique)` },
        { icon: <MessageSquare className="w-4 h-4" />, text: t.feature3 },
        { icon: <Calendar className="w-4 h-4" />, text: t.feature4 }
      ],
      current: true
    },
    {
      id: 'school_basic',
      name: t.schoolBasic,
      price: -50000, // École reçoit de l'argent
      period: 'monthly',
      color: 'from-blue-500 to-blue-600',
      popular: true,
      limits: {
        students: 500,
        teachers: 50,
        classes: 25
      },
      features: [
        { icon: <Users className="w-4 h-4" />, text: `${t.feature1} (jusqu'à 500)` },
        { icon: <Star className="w-4 h-4" />, text: t.feature2 },
        { icon: <MessageSquare className="w-4 h-4" />, text: t.feature3 },
        { icon: <BookOpen className="w-4 h-4" />, text: t.feature5 },
        { icon: <Shield className="w-4 h-4" />, text: t.feature7 }
      ]
    },
    {
      id: 'school_premium',
      name: t.schoolPremium,
      price: -100000, // École reçoit plus d'argent
      period: 'monthly',
      color: 'from-purple-500 to-purple-600',
      limits: {
        students: 1500,
        teachers: 150,
        classes: 75
      },
      features: [
        { icon: <Users className="w-4 h-4" />, text: `${t.feature1} (jusqu'à 1500)` },
        { icon: <Star className="w-4 h-4" />, text: t.feature2 },
        { icon: <MapPin className="w-4 h-4" />, text: t.feature6 },
        { icon: <Eye className="w-4 h-4" />, text: t.feature8 },
        { icon: <Heart className="w-4 h-4" />, text: t.feature10 }
      ]
    },
    {
      id: 'school_enterprise',
      name: t.schoolEnterprise,
      price: -200000, // École reçoit le maximum
      period: 'monthly',
      color: 'from-green-500 to-green-600',
      premium: true,
      limits: {
        students: 'unlimited',
        teachers: 'unlimited',
        classes: 'unlimited'
      },
      features: [
        { icon: <Users className="w-4 h-4" />, text: `${t.feature1} (illimité)` },
        { icon: <Shield className="w-4 h-4" />, text: t.feature9 },
        { icon: <UserCheck className="w-4 h-4" />, text: t.feature10 },
        { icon: <Star className="w-4 h-4" />, text: 'Support dédié 24/7' },
        { icon: <Bell className="w-4 h-4" />, text: 'Formations personnalisées' }
      ]
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    if (planId !== 'freemium') {
      // Redirect to subscription page
      window.open('/subscribe', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Current Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard title={t.currentPlan} className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Chargement de votre abonnement...</span>
            </div>
          ) : (
            <div className={`p-4 bg-gradient-to-r rounded-lg border ${
              (subscriptionData as any)?.isFreemium !== false 
                ? 'from-orange-50 to-red-50 border-orange-200' 
                : 'from-green-50 to-blue-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-semibold ${
                  (subscriptionData as any)?.isFreemium !== false ? 'text-orange-900' : 'text-green-900'
                }`}>
                  {(subscriptionData as any)?.planName || t.freePlan}
                </h4>
                <Badge className={`${
                  (subscriptionData as any)?.isFreemium !== false 
                    ? 'bg-orange-100 text-orange-800 border-orange-200' 
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {t.current}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">{t.priceInCFA}:</span>
                  <span className={`font-semibold ml-2 ${subscriptionData?.price < 0 ? 'text-green-600' : ''}`}>
                    {(subscriptionData as any)?.price < 0 ? '+' : ''}{Math.abs((subscriptionData as any)?.price || 0)} CFA{(subscriptionData as any)?.isFreemium !== false ? '' : t.perMonth}
                  </span>
                  {(subscriptionData as any)?.price < 0 && (
                    <div className="text-xs text-green-600 font-medium">💰 {t.educafricPays}</div>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">{t.studentLimits}:</span>
                  <span className="font-semibold ml-2">
                    {(subscriptionData as any)?.limits?.students || 30} élèves
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t.billingCycle}:</span>
                  <span className="font-semibold ml-2">
                    {(subscriptionData as any)?.billingCycle || (language === 'fr' ? 'Gratuit' : 'Free')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t.renewalDate}:</span>
                  <span className="font-semibold ml-2">
                    {(subscriptionData as any)?.nextRenewal ? new Date((subscriptionData as any).nextRenewal).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>

              {/* AFFICHAGE ÉTAT DES PASSERELLES AVEC PARENTS */}
              {gatewayStatus && Object.keys(gatewayStatus).length > 0 && (
                <div className="mb-4 p-3 bg-white/60 rounded-lg border">
                  <h5 className="font-semibold text-gray-800 mb-2">🔄 {t.gatewayStatus}:</h5>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-green-700 font-semibold">{(gatewayStatus as any)?.activeConnections || 0}</div>
                      <div className="text-green-600">{t.activeConnections}</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-red-700 font-semibold">{(gatewayStatus as any)?.inactiveConnections || 0}</div>
                      <div className="text-red-600">{t.inactiveConnections}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={`pt-3 border-t ${
                (subscriptionData as any)?.isFreemium !== false ? 'border-orange-200' : 'border-green-200'
              }`}>
                {(subscriptionData as any)?.isFreemium !== false ? (
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => window.open('/subscribe', '_blank')}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {t.upgrade}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('/subscribe', '_blank')}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {t.manageBilling}
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                      onClick={() => window.open('/subscribe?upgrade=true', '_blank')}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Améliorer Plan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModernCard>

        <ModernCard title={t.negativeRevenue} className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-semibold text-green-800 mb-2">💰 {t.educafricPays}</h5>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center justify-between">
                  <span>🏫 École Basique</span>
                  <Badge className="bg-green-100 text-green-800">+50,000 CFA/mois</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>🚀 École Premium</span>
                  <Badge className="bg-green-100 text-green-800">+100,000 CFA/mois</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>⭐ École Enterprise</span>
                  <Badge className="bg-green-100 text-green-800">+200,000 CFA/mois</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">📊 Modèle Révolutionnaire</h5>
              <div className="text-sm text-blue-700 space-y-1">
                <span>• Plus d'élèves = Plus de revenus</span>
                <span>• Parents payent pour leurs enfants</span>
                <span>• École reçoit part des revenus</span>
                <span>• Croissance partagée</span>
              </div>
            </div>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => window.open('/subscribe', '_blank')}
            >
              <School className="w-4 h-4 mr-2" />
              {t.viewAllPlans}
            </Button>
          </div>
        </ModernCard>
      </div>

      {/* Available Plans */}
      <ModernCard title={t.planOptions} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(schoolPlans) ? schoolPlans : []).map((plan) => (
            <div 
              key={plan.id}
              className={`relative p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                plan.current ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
                    {t.popular}
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    {t.current}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name || ''}</h3>
                <div className={`text-3xl font-bold ${plan.price < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {plan.price < 0 ? '+' : ''}{Math.abs(plan?.price || 0).toLocaleString()} CFA
                </div>
                <div className="text-sm text-gray-600">
                  {plan.period === 'free' ? (language === 'fr' ? 'Gratuit' : 'Free') : t.perMonth}
                </div>
                {plan.price < 0 && (
                  <div className="text-xs text-green-600 font-medium mt-1">💰 École reçoit</div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-2 bg-blue-50 rounded text-center text-xs">
                  <div className="font-semibold text-blue-800">Limites:</div>
                  <div className="text-blue-700">
                    {typeof plan.limits.students === 'string' ? plan.limits.students : plan.limits.students + ' élèves'} • 
                    {typeof plan.limits.teachers === 'string' ? plan.limits.teachers : plan.limits.teachers + ' prof'} • 
                    {typeof plan.limits.classes === 'string' ? plan.limits.classes : plan.limits.classes + ' classes'}
                  </div>
                </div>
                {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="text-green-600">{feature.icon}</div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  plan.current 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : plan.id === 'freemium'
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                }`}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={plan.current}
              >
                {plan.current ? t.current : plan.id === 'freemium' ? t.freePlan : t.choosePlan}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center pt-6 border-t border-gray-200 mt-6">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
            onClick={() => window.open('/subscribe', '_blank')}
          >
            🚀 {t.viewAllPlans}
          </Button>
        </div>
      </ModernCard>
    </div>
  );
};

export default SchoolSubscription;