// 📱 MOBILE-OPTIMIZED Freelancer Subscription Management
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Clock, CreditCard, Calendar, Gift, ArrowUpRight, Star } from 'lucide-react';

const FunctionalFreelancerSubscription: React.FC = () => {
  const { language } = useLanguage();
  const [currentPlan, setCurrentPlan] = useState('professional'); // Current active plan
  
  const t = {
    title: language === 'fr' ? 'Mon Abonnement' : 'My Subscription',
    currentPlan: language === 'fr' ? 'Plan Actuel' : 'Current Plan',
    active: language === 'fr' ? 'Actif' : 'Active',
    expires: language === 'fr' ? 'Expire le' : 'Expires on',
    upgrade: language === 'fr' ? 'Mettre à niveau' : 'Upgrade',
    manage: language === 'fr' ? 'Gérer' : 'Manage',
    features: language === 'fr' ? 'Fonctionnalités' : 'Features',
    usage: language === 'fr' ? 'Utilisation' : 'Usage',
    billing: language === 'fr' ? 'Facturation' : 'Billing',
    professional: language === 'fr' ? 'Professionnel' : 'Professional',
    premium: language === 'fr' ? 'Premium' : 'Premium',
    perMonth: language === 'fr' ? '/mois' : '/month',
    perYear: language === 'fr' ? '/an' : '/year',
    studentsLimit: language === 'fr' ? 'Limite d\'étudiants' : 'Student limit',
    sessionsLimit: language === 'fr' ? 'Sessions par mois' : 'Sessions per month',
    supportLevel: language === 'fr' ? 'Support' : 'Support',
    priority: language === 'fr' ? 'Prioritaire' : 'Priority',
    standard: language === 'fr' ? 'Standard' : 'Standard',
    unlimited: language === 'fr' ? 'Illimité' : 'Unlimited'
  };

  const subscriptionPlans = [
    {
      id: 'professional',
      name: t.professional,
      price: '12,500',
      period: language === 'fr' ? '/semestre' : '/semester',
      yearlyPrice: '25,000',
      yearlyPeriod: t.perYear,
      icon: Crown,
      color: 'bg-blue-500',
      features: [
        language === 'fr' ? 'Jusqu\'à 50 étudiants' : 'Up to 50 students',
        language === 'fr' ? '20 sessions par mois' : '20 sessions per month',
        language === 'fr' ? 'Support standard' : 'Standard support',
        language === 'fr' ? 'Outils de base' : 'Basic tools'
      ],
      limits: {
        students: 50,
        sessions: 20,
        support: t.standard
      }
    },
    {
      id: 'premium',
      name: t.premium,
      price: '20,000',
      period: language === 'fr' ? '/semestre' : '/semester',
      yearlyPrice: '40,000',
      yearlyPeriod: t.perYear,
      icon: Star,
      color: 'bg-purple-500',
      features: [
        language === 'fr' ? 'Étudiants illimités' : 'Unlimited students',
        language === 'fr' ? 'Sessions illimitées' : 'Unlimited sessions',
        language === 'fr' ? 'Support prioritaire' : 'Priority support',
        language === 'fr' ? 'Outils avancés' : 'Advanced tools',
        language === 'fr' ? 'Analyses détaillées' : 'Detailed analytics'
      ],
      limits: {
        students: '∞',
        sessions: '∞',
        support: t.priority
      }
    }
  ];

  const currentPlanData = subscriptionPlans.find(plan => plan.id === currentPlan);
  const usage = {
    students: 32,
    sessions: 15,
    storageUsed: 2.4,
    storageLimit: 10
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized header */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {language === 'fr' ? 
            'Gérez votre abonnement et suivez votre utilisation' : 
            'Manage your subscription and track your usage'
          }
        </p>
      </div>

      {/* Current Plan Card - Mobile Optimized */}
      {currentPlanData && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`${currentPlanData.color} rounded-full p-2 sm:p-3`}>
                  <currentPlanData.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {currentPlanData.name}
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      {t.active}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t.expires}: 2025-07-15
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t.manage}
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {t.upgrade}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics - Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {usage.students}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {language === 'fr' ? 'Étudiants actifs' : 'Active students'}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'fr' ? 'sur' : 'of'} {currentPlanData?.limits.students}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {usage.sessions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {language === 'fr' ? 'Sessions ce mois' : 'Sessions this month'}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'fr' ? 'sur' : 'of'} {currentPlanData?.limits.sessions}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {usage.storageUsed}GB
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {language === 'fr' ? 'Stockage utilisé' : 'Storage used'}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'fr' ? 'sur' : 'of'} {usage.storageLimit}GB
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {currentPlanData?.limits.support}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {t.supportLevel}
              </div>
              <div className="text-xs text-gray-500">
                24/7
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans - Mobile Optimized */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          {language === 'fr' ? 'Plans Disponibles' : 'Available Plans'}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`hover:shadow-lg transition-shadow ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${plan.color} rounded-full p-2`}>
                        <plan.icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg">{plan.name}</h4>
                    </div>
                    {currentPlan === plan.id && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {language === 'fr' ? 'Actuel' : 'Current'}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {plan.price} XAF
                      <span className="text-sm font-normal text-gray-600">{plan.period}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'fr' ? 'ou' : 'or'} {plan.yearlyPrice} XAF{plan.yearlyPeriod}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${currentPlan === plan.id ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? 
                      (language === 'fr' ? 'Plan Actuel' : 'Current Plan') : 
                      (language === 'fr' ? 'Choisir ce Plan' : 'Choose This Plan')
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Information - Mobile Optimized */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{t.billing}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="font-medium">{language === 'fr' ? 'Prochaine facturation' : 'Next billing'}</p>
              <p className="text-sm text-gray-600">2025-07-15</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{currentPlanData?.price} XAF</p>
              <p className="text-sm text-gray-600">{currentPlanData?.period}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Historique des paiements' : 'Payment history'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalFreelancerSubscription;