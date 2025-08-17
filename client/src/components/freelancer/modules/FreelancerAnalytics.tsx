import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Lock, Crown, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

const FreelancerAnalytics = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Mes Analyses',
      subtitle: 'Analytics business pour activités de tutorat',
      premiumRequired: 'Fonctionnalité Premium Requise',
      upgradeToPremium: 'Passer au Premium',
      features: [
        'Métriques de performance d\'enseignement',
        'Taux de réussite des élèves',
        'Analyses d\'efficacité des séances',
        'Analytics de revenus et réservations',
        'Optimisation des méthodes pédagogiques',
        'Rapports de rentabilité par matière',
        'Tendances de croissance du business',
        'Comparaisons avec autres répétiteurs'
      ]
    },
    en: {
      title: 'My Analytics',
      subtitle: 'Business analytics for tutoring activities',
      premiumRequired: 'Premium Feature Required',
      upgradeToPremium: 'Upgrade to Premium',
      features: [
        'Teaching performance metrics',
        'Student success rates',
        'Session effectiveness analysis',
        'Revenue and booking analytics',
        'Pedagogical method optimization',
        'Profitability reports by subject',
        'Business growth trends',
        'Comparisons with other tutors'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.premiumRequired}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {language === 'fr' 
              ? 'Optimisez votre activité de tutorat avec des analytics business avancés.'
              : 'Optimize your tutoring business with advanced business analytics.'}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8">
            <Crown className="w-5 h-5 mr-2" />
            {t.upgradeToPremium}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">
            {language === 'fr' ? 'Analytics Business' : 'Business Analytics'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerAnalytics;