import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Lock, Crown, BarChart3, Target, Award, FileText } from 'lucide-react';

const StudentProgress = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Progrès Élèves',
      subtitle: 'Suivi détaillé des performances individuelles',
      premiumRequired: 'Fonctionnalité Premium Requise',
      upgradeToPremium: 'Passer au Premium',
      features: [
        'Suivi individuel des progrès par élève',
        'Analyses de tendances de performance',
        'Objectifs d\'apprentissage personnalisés',
        'Évaluations des compétences acquises',
        'Plans d\'amélioration individualisés',
        'Comparaisons de progression dans le temps',
        'Rapports détaillés pour les parents',
        'Recommandations pédagogiques adaptées'
      ]
    },
    en: {
      title: 'Student Progress',
      subtitle: 'Detailed tracking of individual performance',
      premiumRequired: 'Premium Feature Required',
      upgradeToPremium: 'Upgrade to Premium',
      features: [
        'Individual progress tracking per student',
        'Performance trend analysis',
        'Personalized learning objectives',
        'Acquired skills assessment',
        'Individualized improvement plans',
        'Progress comparisons over time',
        'Detailed reports for parents',
        'Adapted pedagogical recommendations'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
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
              ? 'Suivez précisément les progrès de chaque élève avec des analytics avancés.'
              : 'Precisely track each student\'s progress with advanced analytics.'}
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
            {language === 'fr' ? 'Fonctionnalités de Suivi' : 'Tracking Features'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgress;