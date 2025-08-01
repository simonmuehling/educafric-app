import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { HelpCircle, BookOpen, Users, Calendar, MessageSquare, BarChart3, CreditCard, Video, Download, ExternalLink } from 'lucide-react';

const FreelancerUserGuide = () => {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('getting-started');

  const text = {
    fr: {
      title: 'Guide d\'Utilisation Freelancer',
      subtitle: 'Tout ce que vous devez savoir pour réussir en tant que répétiteur',
      gettingStarted: 'Premiers pas',
      platformTutorials: 'Tutoriels de la plateforme',
      bestPractices: 'Bonnes pratiques',
      faq: 'Questions fréquentes',
      troubleshooting: 'Dépannage',
      contact: 'Nous contacter',
      downloadGuide: 'Télécharger le guide PDF',
      watchVideo: 'Regarder la vidéo',
      sections: {
        gettingStarted: {
          title: 'Commencer avec EDUCAFRIC',
          items: [
            'Configuration de votre profil professionnel',
            'Définition de vos spécialisations et tarifs',
            'Ajout de votre localisation et disponibilités',
            'Vérification de votre identité professionnelle',
            'Première réservation de séance'
          ]
        },
        tutorials: {
          title: 'Tutoriels détaillés',
          items: [
            'Gestion des élèves et création de profils',
            'Planification et organisation des séances',
            'Utilisation des outils pédagogiques',
            'Communication avec les parents',
            'Suivi des progrès et création de rapports',
            'Gestion des paiements et facturation'
          ]
        },
        bestPractices: {
          title: 'Méthodes d\'enseignement efficaces',
          items: [
            'Adapter votre pédagogie au contexte africain',
            'Créer des modules d\'apprentissage engageants',
            'Maintenir la motivation des élèves',
            'Gérer efficacement votre temps',
            'Construire une relation de confiance avec les familles',
            'Optimiser vos revenus de tutorat'
          ]
        },
        faq: {
          title: 'Questions fréquemment posées',
          items: [
            'Comment fixer mes tarifs de tutorat?',
            'Quelle est la politique de paiement?',
            'Comment gérer les annulations de séances?',
            'Puis-je enseigner plusieurs matières?',
            'Comment obtenir plus d\'élèves?',
            'Que faire en cas de conflit avec un parent?'
          ]
        }
      }
    },
    en: {
      title: 'Freelancer User Guide',
      subtitle: 'Everything you need to know to succeed as a tutor',
      gettingStarted: 'Getting Started',
      platformTutorials: 'Platform Tutorials',
      bestPractices: 'Best Practices',
      faq: 'Frequently Asked Questions',
      troubleshooting: 'Troubleshooting',
      contact: 'Contact Us',
      downloadGuide: 'Download PDF Guide',
      watchVideo: 'Watch Video',
      sections: {
        gettingStarted: {
          title: 'Getting Started with EDUCAFRIC',
          items: [
            'Setting up your professional profile',
            'Defining your specializations and rates',
            'Adding your location and availability',
            'Verifying your professional identity',
            'Booking your first session'
          ]
        },
        tutorials: {
          title: 'Detailed Tutorials',
          items: [
            'Student management and profile creation',
            'Session planning and organization',
            'Using educational tools',
            'Parent communication',
            'Progress tracking and report creation',
            'Payment and billing management'
          ]
        },
        bestPractices: {
          title: 'Effective Teaching Methods',
          items: [
            'Adapting your pedagogy to African context',
            'Creating engaging learning modules',
            'Maintaining student motivation',
            'Managing your time efficiently',
            'Building trust with families',
            'Optimizing your tutoring revenue'
          ]
        },
        faq: {
          title: 'Frequently Asked Questions',
          items: [
            'How to set my tutoring rates?',
            'What is the payment policy?',
            'How to handle session cancellations?',
            'Can I teach multiple subjects?',
            'How to get more students?',
            'What to do in case of conflict with a parent?'
          ]
        }
      }
    }
  };

  const t = text[language as keyof typeof text];

  const sections = [
    {
      id: 'getting-started',
      title: t.gettingStarted,
      icon: <BookOpen className="w-5 h-5" />,
      content: t?.sections?.gettingStarted
    },
    {
      id: 'tutorials',
      title: t.platformTutorials,
      icon: <Video className="w-5 h-5" />,
      content: t?.sections?.tutorials
    },
    {
      id: 'best-practices',
      title: t.bestPractices,
      icon: <Users className="w-5 h-5" />,
      content: t?.sections?.bestPractices
    },
    {
      id: 'faq',
      title: t.faq,
      icon: <HelpCircle className="w-5 h-5" />,
      content: t?.sections?.faq
    }
  ];

  const quickActions = [
    {
      title: language === 'fr' ? 'Guide PDF Complet' : 'Complete PDF Guide',
      description: language === 'fr' ? 'Téléchargez le guide complet (25 pages)' : 'Download complete guide (25 pages)',
      icon: <Download className="w-5 h-5" />,
      action: 'download'
    },
    {
      title: language === 'fr' ? 'Vidéo de Formation' : 'Training Video',
      description: language === 'fr' ? 'Regardez notre formation (45 minutes)' : 'Watch our training (45 minutes)',
      icon: <Video className="w-5 h-5" />,
      action: 'video'
    },
    {
      title: language === 'fr' ? 'Support en Direct' : 'Live Support',
      description: language === 'fr' ? 'Chattez avec notre équipe support' : 'Chat with our support team',
      icon: <MessageSquare className="w-5 h-5" />,
      action: 'support'
    },
    {
      title: language === 'fr' ? 'Communauté Freelancers' : 'Freelancer Community',
      description: language === 'fr' ? 'Rejoignez notre groupe WhatsApp' : 'Join our WhatsApp group',
      icon: <ExternalLink className="w-5 h-5" />,
      action: 'community'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Array.isArray(quickActions) ? quickActions : []).map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{action.title || ''}</h4>
                  <p className="text-xs text-gray-600 mt-1">{action.description || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(sections) ? sections : []).map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            onClick={() => setActiveSection(section.id)}
            className="flex items-center gap-2"
          >
            {section.icon}
            {section.title || ''}
          </Button>
        ))}
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {sections.find(s => s.id === activeSection)?.icon}
            {sections.find(s => s.id === activeSection)?.title}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Array.isArray(sections.find(s => s.id === activeSection)?.content?.items) ? sections.find(s => s.id === activeSection)?.content?.items || [] : []).map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg">
                <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 text-sm font-semibold mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t.contact}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Email:</span>
                <span className="text-blue-600">support@educafric.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">WhatsApp:</span>
                <span className="text-green-600">+237 656 200 472</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{language === 'fr' ? 'Horaires:' : 'Hours:'}</span>
                <span className="text-gray-700">8h-18h (GMT+1)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {language === 'fr' ? 'Statistiques d\'aide' : 'Help Statistics'}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'fr' ? 'Articles consultés:' : 'Articles viewed:'}</span>
                <span className="font-semibold">1,240</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'fr' ? 'Vidéos regardées:' : 'Videos watched:'}</span>
                <span className="font-semibold">856</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'fr' ? 'Support résolu:' : 'Support resolved:'}</span>
                <span className="font-semibold text-green-600">98%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerUserGuide;