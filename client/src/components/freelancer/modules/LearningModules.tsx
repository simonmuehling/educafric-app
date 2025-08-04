import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCap, Lock, Crown, BookOpen, FileText, Video, Image, Puzzle, BarChart3, Share2 } from 'lucide-react';

const LearningModules = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Modules Pédagogiques',
      subtitle: 'Création et gestion de contenu éducatif personnalisé',
      premiumRequired: 'Fonctionnalité Premium Requise',
      upgradeToPremium: 'Passer au Premium',
      features: [
        'Créateur de modules d\'apprentissage interactifs',
        'Bibliothèque de ressources éducatives',
        'Conception d\'exercices et évaluations',
        'Contenu multimédia (vidéos, images, audio)',
        'Modules adaptés au contexte africain',
        'Progression pédagogique personnalisée',
        'Partage de contenu entre répétiteurs',
        'Analytics de performance des modules'
      ],
      benefits: [
        'Plus de 500 templates pré-conçus',
        'Contenu adapté aux programmes africains',
        'Exercices interactifs gamifiés',
        'Suivi des progrès en temps réel',
        'Exportation vers différents formats',
        'Collaboration avec autres répétiteurs'
      ]
    },
    en: {
      title: 'Learning Modules',
      subtitle: 'Creation and management of personalized educational content',
      premiumRequired: 'Premium Feature Required',
      upgradeToPremium: 'Upgrade to Premium',
      features: [
        'Interactive learning module creator',
        'Educational resource library',
        'Exercise and assessment design',
        'Multimedia content (videos, images, audio)',
        'Modules adapted to African context',
        'Personalized pedagogical progression',
        'Content sharing between tutors',
        'Module performance analytics'
      ],
      benefits: [
        'Over 500 pre-designed templates',
        'Content adapted to African curricula',
        'Gamified interactive exercises',
        'Real-time progress tracking',
        'Export to different formats',
        'Collaboration with other tutors'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  const moduleFeatures = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: language === 'fr' ? 'Créateur de Contenu' : 'Content Creator',
      description: language === 'fr' ? 'Outils intuitifs pour créer des modules' : 'Intuitive tools for creating modules'
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: language === 'fr' ? 'Contenu Multimédia' : 'Multimedia Content',
      description: language === 'fr' ? 'Intégration vidéos, images et audio' : 'Video, image and audio integration'
    },
    {
      icon: <Puzzle className="w-5 h-5" />,
      title: language === 'fr' ? 'Exercices Interactifs' : 'Interactive Exercises',
      description: language === 'fr' ? 'Jeux éducatifs et quiz dynamiques' : 'Educational games and dynamic quizzes'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: language === 'fr' ? 'Analytics Avancés' : 'Advanced Analytics',
      description: language === 'fr' ? 'Suivi des performances des modules' : 'Module performance tracking'
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: language === 'fr' ? 'Partage de Contenu' : 'Content Sharing',
      description: language === 'fr' ? 'Collaboration entre répétiteurs' : 'Collaboration between tutors'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: language === 'fr' ? 'Templates Prêts' : 'Ready Templates',
      description: language === 'fr' ? 'Bibliothèque de modèles éducatifs' : 'Educational template library'
    }
  ];

  const sampleModules = [
    {
      title: language === 'fr' ? 'Algèbre Niveau 3ème' : 'Algebra Grade 9',
      subject: language === 'fr' ? 'Mathématiques' : 'Mathematics',
      students: 15,
      completion: 78,
      rating: 4.8,
      type: 'interactive'
    },
    {
      title: language === 'fr' ? 'Équilibres Chimiques' : 'Chemical Equilibrium',
      subject: language === 'fr' ? 'Chimie' : 'Chemistry',
      students: 8,
      completion: 65,
      rating: 4.6,
      type: 'multimedia'
    },
    {
      title: language === 'fr' ? 'Histoire du Cameroun' : 'History of Cameroon',
      subject: language === 'fr' ? 'Histoire' : 'History',
      students: 22,
      completion: 89,
      rating: 4.9,
      type: 'document'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interactive': return <Puzzle className="w-4 h-4" />;
      case 'multimedia': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
          <GraduationCap className="w-6 h-6 text-white" />
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
              ? 'Créez du contenu éducatif professionnel adapté au contexte africain et engagez vos élèves.'
              : 'Create professional educational content adapted to African context and engage your students.'}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8">
            <Crown className="w-5 h-5 mr-2" />
            {t.upgradeToPremium}
          </Button>
        </CardContent>
      </Card>

      {/* Module Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(moduleFeatures) ? moduleFeatures : []).map((feature, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Premium
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
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

      {/* Sample Modules Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-500" />
            {language === 'fr' ? 'Aperçu Modules (Premium)' : 'Modules Preview (Premium)'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Array.isArray(sampleModules) ? sampleModules : []).map((module, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                    {getTypeIcon(module.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{module.title || ''}</h4>
                    <p className="text-sm text-gray-600">{module.subject}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{module.students} élèves</div>
                    <div className="text-xs text-gray-500">{module.completion}% complété</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-yellow-600">★ {module.rating}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              {language === 'fr' 
                ? '🔒 Aperçu limité - Créez vos propres modules avec Premium'
                : '🔒 Limited preview - Create your own modules with Premium'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">
            {language === 'fr' ? 'Fonctionnalités Complètes' : 'Complete Features'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">
            {language === 'fr' ? 'Avantages Premium' : 'Premium Benefits'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {t.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-sm font-semibold mt-0.5">
                  ✓
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            {language === 'fr' ? 'Révolutionnez votre enseignement' : 'Revolutionize your teaching'}
          </h3>
          <p className="mb-4 opacity-90">
            {language === 'fr' 
              ? 'Créez du contenu éducatif engageant adapté aux élèves africains.'
              : 'Create engaging educational content adapted to African students.'}
          </p>
          <Button variant="secondary" size="lg">
            <Crown className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Commencer à créer' : 'Start Creating'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningModules;