import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/CardLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Lock, Crown, Star, BarChart3, MessageSquare, Calendar, BookOpen, TrendingUp } from 'lucide-react';

const MyStudents = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Mes Élèves',
      subtitle: 'Gestion complète de vos élèves en tutorat privé',
      premiumRequired: 'Fonctionnalité Premium Requise',
      upgradeToPremium: 'Passer au Premium',
      features: [
        'Gestion du carnet d\'élèves privés',
        'Profils individuels détaillés de chaque élève',
        'Suivi des progrès académiques personnalisés',
        'Analyses de performance par élève',
        'Gestion des contacts parents',
        'Historique des séances par élève',
        'Notes et observations pédagogiques',
        'Planification personnalisée des cours'
      ],
      benefits: [
        'Suivi précis de 50+ élèves simultanément',
        'Rapports de progrès automatisés',
        'Communication directe avec les familles',
        'Analytics de performance détaillées',
        'Gestion des absences et retards',
        'Facturation par élève simplifiée'
      ]
    },
    en: {
      title: 'My Students',
      subtitle: 'Complete management of your private tutoring students',
      premiumRequired: 'Premium Feature Required',
      upgradeToPremium: 'Upgrade to Premium',
      features: [
        'Private student roster management',
        'Detailed individual student profiles',
        'Personalized academic progress tracking',
        'Performance analytics per student',
        'Parent contact management',
        'Session history per student',
        'Pedagogical notes and observations',
        'Personalized lesson planning'
      ],
      benefits: [
        'Precise tracking of 50+ students simultaneously',
        'Automated progress reports',
        'Direct family communication',
        'Detailed performance analytics',
        'Absence and tardiness management',
        'Simplified per-student billing'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  const premiumFeatures = [
    {
      icon: <Users className="w-5 h-5" />,
      title: language === 'fr' ? 'Gestion d\'Élèves' : 'Student Management',
      description: language === 'fr' ? 'Carnet d\'élèves avec profils complets' : 'Student roster with complete profiles'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: language === 'fr' ? 'Analyses de Performance' : 'Performance Analytics',
      description: language === 'fr' ? 'Statistiques détaillées par élève' : 'Detailed statistics per student'
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: language === 'fr' ? 'Communication Parents' : 'Parent Communication',
      description: language === 'fr' ? 'Messages directs avec les familles' : 'Direct messaging with families'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: language === 'fr' ? 'Planification Séances' : 'Session Planning',
      description: language === 'fr' ? 'Organisation des cours privés' : 'Private lesson organization'
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: language === 'fr' ? 'Suivi Pédagogique' : 'Educational Tracking',
      description: language === 'fr' ? 'Notes et observations détaillées' : 'Detailed notes and observations'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: language === 'fr' ? 'Rapports de Progrès' : 'Progress Reports',
      description: language === 'fr' ? 'Rapports automatiques pour parents' : 'Automatic reports for parents'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Premium Lock Card */}
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
              ? 'Débloquez la gestion complète de vos élèves en tutorat privé avec notre abonnement premium.'
              : 'Unlock complete private tutoring student management with our premium subscription.'}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8">
            <Crown className="w-5 h-5 mr-2" />
            {t.upgradeToPremium}
          </Button>
        </CardContent>
      </Card>

      {/* Premium Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(premiumFeatures) ? premiumFeatures : []).map((feature, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Premium
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{feature.title || ''}</h4>
                  <p className="text-sm text-gray-600">{feature.description || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {language === 'fr' ? 'Fonctionnalités Incluses' : 'Included Features'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            {language === 'fr' ? 'Avantages Premium' : 'Premium Benefits'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {t.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-semibold mt-0.5">
                  ✓
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            {language === 'fr' ? 'Prêt à développer votre activité de tutorat?' : 'Ready to grow your tutoring business?'}
          </h3>
          <p className="mb-4 opacity-90">
            {language === 'fr' 
              ? 'Rejoignez plus de 500 répétiteurs qui utilisent EDUCAFRIC pour gérer leurs élèves.'
              : 'Join over 500 tutors using EDUCAFRIC to manage their students.'}
          </p>
          <Button variant="secondary" size="lg">
            <Crown className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Passer au Premium' : 'Upgrade to Premium'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyStudents;