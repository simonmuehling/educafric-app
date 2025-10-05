import React, { useState, useEffect } from 'react';
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
  Smartphone, Eye, AlertTriangle, ScanEye, Loader2
} from 'lucide-react';

const ParentSubscription = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // 📡 Récupérer les vraies données d'abonnement parent
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['/api/parent/subscription', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/parent/subscription');
      return response.json();
    },
    enabled: !!user?.id
  });

  // 📡 Récupérer l'état des passerelles pour chaque enfant
  const { data: gatewayStatus } = useQuery({
    queryKey: ['/api/parent/gateway-status', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/parent/gateway-status');
      return response.json();
    },
    enabled: !!user?.id
  });

  const text = {
    fr: {
      title: 'Abonnement Parent',
      subtitle: 'Gérer votre plan d\'abonnement pour le suivi de vos enfants',
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
      freePlan: 'Plan Gratuit',
      parentPublic: 'Parent Bronze',
      parentPrivate: 'Parent Bronze P',
      parentGeolocation: 'Parent Géolocalisation',
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
      familyDiscount: 'Remise Famille',
      twoChildren: '2 enfants: -20%',
      threeChildren: '3+ enfants: -40%',
      basicFeatures: 'Fonctionnalités de Base',
      premiumFeatures: 'Fonctionnalités Premium',
      feature1: 'Suivi des notes en temps réel',
      feature2: 'Notifications SMS/WhatsApp',
      feature3: 'Communication avec enseignants',
      feature4: 'Rapports de présence',
      feature5: 'Accès emploi du temps',
      feature6: 'Géolocalisation avancée',
      feature7: 'Bouton d\'urgence',
      feature8: 'Zones de sécurité',
      feature9: 'Support prioritaire',
      feature10: 'Analyses détaillées',
      tracking: 'Suivi des élèves',
      realtimeNotifications: 'Notifications en temps réel (email + sms)',
      gradeAccess: 'Accès aux notes',
      bulletinReception: 'Réception de bulletins',
      onlineClass: 'Online class',
      teacherComm: 'Communication enseignants',
      bilingualSupport: 'Support bilingue',
      priceInCFA: 'Prix en CFA',
      activateNow: 'Activer Maintenant',
      billingAddress: 'Adresse de Facturation',
      paymentHistory: 'Historique des Paiements',
      renewalDate: 'Date de Renouvellement',
      autoRenewal: 'Renouvellement Automatique',
      cancelAnytime: 'Annuler À Tout Moment'
    },
    en: {
      title: 'Parent Subscription',
      subtitle: 'Manage your subscription plan for tracking your children',
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
      freePlan: 'Free Plan',
      parentPublic: 'Parent Bronze',
      parentPrivate: 'Parent Bronze P',
      parentGeolocation: 'Geolocation Parent',
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
      familyDiscount: 'Family Discount',
      twoChildren: '2 children: -20%',
      threeChildren: '3+ children: -40%',
      basicFeatures: 'Basic Features',
      premiumFeatures: 'Premium Features',
      feature1: 'Real-time grade tracking',
      feature2: 'SMS/WhatsApp notifications',
      feature3: 'Teacher communication',
      feature4: 'Attendance reports',
      feature5: 'Timetable access',
      feature6: 'Advanced geolocation',
      feature7: 'Emergency button',
      feature8: 'Safety zones',
      feature9: 'Priority support',
      feature10: 'Detailed analytics',
      tracking: 'Student tracking',
      realtimeNotifications: 'Real-time notifications (email + sms)',
      gradeAccess: 'Grade access',
      bulletinReception: 'Bulletin reception',
      onlineClass: 'Online class',
      teacherComm: 'Teacher communication',
      bilingualSupport: 'Bilingual support',
      priceInCFA: 'Price in CFA',
      activateNow: 'Activate Now',
      billingAddress: 'Billing Address',
      paymentHistory: 'Payment History',
      renewalDate: 'Renewal Date',
      autoRenewal: 'Auto Renewal',
      cancelAnytime: 'Cancel Anytime'
    }
  };

  const t = text[language as keyof typeof text];

  const parentPlans = [
    {
      id: 'free',
      name: t.freePlan,
      price: 0,
      period: 'free',
      color: 'from-gray-400 to-gray-500',
      features: [
        { icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />, text: t.feature5 },
        { icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />, text: 'Notifications de base' },
        { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, text: 'Support communautaire' }
      ],
      current: true
    },
    {
      id: 'parent_bronze',
      name: t.parentPublic,
      price: 3000,
      period: 'annual',
      color: 'from-blue-500 to-blue-600',
      popular: true,
      features: [
        { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, text: `📍 ${t.tracking}` },
        { icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />, text: `🔔 ${t.realtimeNotifications}` },
        { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, text: `📊 ${t.gradeAccess}` },
        { icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />, text: `📄 ${t.bulletinReception}` },
        { icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />, text: `💻 ${t.onlineClass}` },
        { icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />, text: `💬 ${t.teacherComm}` },
        { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, text: `🌍 ${t.bilingualSupport}` }
      ]
    },
    {
      id: 'parent_bronze_p',
      name: t.parentPrivate,
      price: 4000,
      period: 'annual',
      color: 'from-purple-500 to-purple-600',
      features: [
        { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, text: `📍 ${t.tracking}` },
        { icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />, text: `🔔 ${t.realtimeNotifications}` },
        { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, text: `📊 ${t.gradeAccess}` },
        { icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />, text: `📄 ${t.bulletinReception}` },
        { icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />, text: `💻 ${t.onlineClass}` },
        { icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />, text: `💬 ${t.teacherComm}` },
        { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, text: `🌍 ${t.bilingualSupport}` }
      ]
    },
    {
      id: 'parent_geolocation',
      name: t.parentGeolocation,
      price: 1000,
      period: 'monthly',
      color: 'from-green-500 to-green-600',
      premium: true,
      features: [
        { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, text: t.feature6 },
        { icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />, text: t.feature7 },
        { icon: <ScanEye className="w-5 h-5 sm:w-6 sm:h-6" />, text: t.feature8 },
        { icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />, text: 'Suivi multi-appareils' },
        { icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />, text: 'Alertes de position' }
      ]
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    if (planId !== 'free') {
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
              subscriptionData?.isFreemium !== false 
                ? 'from-green-50 to-blue-50 border-green-200' 
                : 'from-purple-50 to-pink-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-lg font-semibold ${
                  subscriptionData?.isFreemium !== false ? 'text-green-900' : 'text-purple-900'
                }`}>
                  {subscriptionData?.planName || t.freePlan}
                </h4>
                <Badge className={`${
                  subscriptionData?.isFreemium !== false 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-purple-100 text-purple-800 border-purple-200'
                }`}>
                  {t.current}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">{t.priceInCFA}:</span>
                  <span className="font-semibold ml-2">
                    {subscriptionData?.price || 0} CFA{subscriptionData?.isFreemium !== false ? '' : t.perMonth}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t.features}:</span>
                  <span className="font-semibold ml-2">
                    {subscriptionData?.features?.length || 3} {language === 'fr' ? 'disponibles' : 'available'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t.billingCycle}:</span>
                  <span className="font-semibold ml-2">
                    {subscriptionData?.billingCycle || (language === 'fr' ? 'Gratuit' : 'Free')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t.renewalDate}:</span>
                  <span className="font-semibold ml-2">
                    {subscriptionData?.nextRenewal ? new Date(subscriptionData.nextRenewal).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>

              {/* AFFICHAGE ÉTAT DES PASSERELLES PAR ENFANT */}
              {gatewayStatus && Object.keys(gatewayStatus).length > 0 && (
                <div className="mb-4 p-3 bg-white/60 rounded-lg border">
                  <h5 className="font-semibold text-gray-800 mb-2">🔄 État des passerelles enfants:</h5>
                  <div className="space-y-2 text-xs">
                    {Object.entries(gatewayStatus).map(([childId, status]: [string, any]) => (
                      <div key={childId} className="flex items-center justify-between">
                        <span className="text-gray-700">{status.childName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{status.schoolName}</span>
                          <Badge className={`text-xs px-2 py-0.5 ${
                            status.gatewayActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status.gatewayActive ? '✅ Active' : '❌ Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`pt-3 border-t ${
                subscriptionData?.isFreemium !== false ? 'border-green-200' : 'border-purple-200'
              }`}>
                {subscriptionData?.isFreemium !== false ? (
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => window.open('/subscribe', '_blank')}
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {t.upgrade}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('/subscribe', '_blank')}
                    >
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {t.manageBilling}
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                      onClick={() => window.open('/subscribe?upgrade=true', '_blank')}
                    >
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Ajouter enfant
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModernCard>

        <ModernCard title={t.familyDiscount} className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h5 className="font-semibold text-orange-800 mb-2">💰 {t.familyDiscount}</h5>
              <div className="space-y-2 text-sm text-orange-700">
                <div className="flex items-center justify-between">
                  <span>👨‍👩‍👧 {t.twoChildren}</span>
                  <Badge className="bg-orange-100 text-orange-800">-20%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>👨‍👩‍👧‍👦 {t.threeChildren}</span>
                  <Badge className="bg-orange-100 text-orange-800">-40%</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">📱 {t.paymentMethod}</h5>
              <div className="text-sm text-blue-700 space-y-1">
                <span>• 💳 Stripe (Visa, MasterCard)</span>
                <span>• 📱 Orange Money</span>
                <span>• 🏦 Virement Afriland First Bank</span>
              </div>
            </div>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => window.open('/subscribe', '_blank')}
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t.manageBilling}
            </Button>
          </div>
        </ModernCard>
      </div>

      {/* Available Plans */}
      <ModernCard title={t.planOptions} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(parentPlans) ? parentPlans : []).map((plan) => (
            <div 
              key={plan.id}
              className={`relative p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                plan.current ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'
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
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    {t.current}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name || ''}</h3>
                <div className="text-3xl font-bold text-gray-900">
                  {plan?.price?.toLocaleString()} CFA
                </div>
                <div className="text-sm text-gray-600">
                  {plan.period === 'free' ? language === 'fr' ? 'Gratuit' : 'Free' : t.perMonth}
                </div>
              </div>

              <div className="space-y-3 mb-6">
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
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : plan.id === 'free'
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                }`}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={plan.current}
              >
                {plan.current ? t.current : plan.id === 'free' ? t.freePlan : t.choosePlan}
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

export default ParentSubscription;