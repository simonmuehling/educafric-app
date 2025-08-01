import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, FileText, Download, ExternalLink, HelpCircle, Users, Calendar, Phone } from 'lucide-react';

export const ParentResources = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Ressources',
      subtitle: 'Accès aux ressources éducatives et matériel de soutien',
      parentingGuides: 'Guides Parentaux',
      schoolPolicies: 'Politiques Scolaires',
      helpResources: 'Ressources d\'Aide',
      communityResources: 'Ressources Communautaires',
      downloadable: 'Téléchargeable',
      online: 'En ligne',
      support: 'Support',
      emergency: 'Urgence',
      viewMore: 'Voir Plus',
      download: 'Télécharger',
      category: 'Catégorie',
      lastUpdated: 'Mis à jour'
    },
    en: {
      title: 'Resources',
      subtitle: 'Access educational resources and support materials',
      parentingGuides: 'Parenting Guides',
      schoolPolicies: 'School Policies',
      helpResources: 'Help Resources',
      communityResources: 'Community Resources',
      downloadable: 'Downloadable',
      online: 'Online',
      support: 'Support',
      emergency: 'Emergency',
      viewMore: 'View More',
      download: 'Download',
      category: 'Category',
      lastUpdated: 'Last Updated'
    }
  };

  const t = text[language as keyof typeof text];

  // Resource categories data
  const resourceCategories = [
    {
      id: 'parenting',
      title: t.parentingGuides,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: language === 'fr' 
        ? 'Guides pour accompagner votre enfant dans sa scolarité'
        : 'Guides to support your child in their education',
      resources: [
        {
          title: language === 'fr' ? 'Comment aider votre enfant avec ses devoirs' : 'How to help your child with homework',
          type: 'downloadable',
          format: 'PDF',
          updated: '2024-01-15'
        },
        {
          title: language === 'fr' ? 'Communication efficace avec les enseignants' : 'Effective communication with teachers',
          type: 'downloadable',
          format: 'PDF',
          updated: '2024-01-10'
        },
        {
          title: language === 'fr' ? 'Gérer le stress scolaire de votre enfant' : 'Managing your child\'s school stress',
          type: 'online',
          format: 'Article',
          updated: '2024-01-08'
        }
      ]
    },
    {
      id: 'policies',
      title: t.schoolPolicies,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-green-500',
      description: language === 'fr' 
        ? 'Politique et règlements de l\'établissement scolaire'
        : 'School policies and regulations documentation',
      resources: [
        {
          title: language === 'fr' ? 'Règlement intérieur de l\'école' : 'School internal regulations',
          type: 'downloadable',
          format: 'PDF',
          updated: '2024-01-01'
        },
        {
          title: language === 'fr' ? 'Politique de discipline' : 'Discipline policy',
          type: 'downloadable',
          format: 'PDF',
          updated: '2023-12-15'
        },
        {
          title: language === 'fr' ? 'Calendrier scolaire 2024' : 'School calendar 2024',
          type: 'downloadable',
          format: 'PDF',
          updated: '2024-01-01'
        }
      ]
    },
    {
      id: 'help',
      title: t.helpResources,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: language === 'fr' 
        ? 'FAQ et ressources d\'aide pour les parents'
        : 'FAQ and help resources for parents',
      resources: [
        {
          title: language === 'fr' ? 'Questions fréquemment posées' : 'Frequently Asked Questions',
          type: 'online',
          format: 'Web',
          updated: '2024-01-12'
        },
        {
          title: language === 'fr' ? 'Guide d\'utilisation de la plateforme' : 'Platform usage guide',
          type: 'downloadable',
          format: 'PDF',
          updated: '2024-01-10'
        },
        {
          title: language === 'fr' ? 'Tutoriels vidéo' : 'Video tutorials',
          type: 'online',
          format: 'Video',
          updated: '2024-01-05'
        }
      ]
    },
    {
      id: 'community',
      title: t.communityResources,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: language === 'fr' 
        ? 'Ressources communautaires et événements scolaires'
        : 'Community resources and school events',
      resources: [
        {
          title: language === 'fr' ? 'Événements communautaires' : 'Community events',
          type: 'online',
          format: 'Calendar',
          updated: '2024-01-15'
        },
        {
          title: language === 'fr' ? 'Contacts utiles' : 'Useful contacts',
          type: 'downloadable',
          format: 'PDF',
          updated: '2024-01-01'
        },
        {
          title: language === 'fr' ? 'Ressources de la communauté locale' : 'Local community resources',
          type: 'online',
          format: 'Web',
          updated: '2024-01-08'
        }
      ]
    }
  ];

  const getResourceTypeIcon = (type: string) => {
    return type === 'downloadable' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />;
  };

  const getResourceTypeBadge = (type: string) => {
    return type === 'downloadable' 
      ? <Badge className="bg-green-100 text-green-800">{t.downloadable}</Badge>
      : <Badge className="bg-blue-100 text-blue-800">{t.online}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-violet-400 to-violet-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <ModernCard gradient="orange">
        <div className="flex items-center space-x-2 mb-4">
          <Phone className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-700">
            {language === 'fr' ? 'Contacts d\'Urgence' : 'Emergency Contacts'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-800 mb-2">
              {language === 'fr' ? 'École' : 'School'}
            </h4>
            <p className="text-gray-600">+237 677 123 456</p>
            <p className="text-gray-600">info@educafric.com</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-800 mb-2">
              {language === 'fr' ? 'Infirmerie' : 'Nurse Office'}
            </h4>
            <p className="text-gray-600">+237 677 123 457</p>
            <p className="text-gray-600">nurse@educafric.com</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-800 mb-2">
              {language === 'fr' ? 'Support Technique' : 'Technical Support'}
            </h4>
            <p className="text-gray-600">+237 677 123 458</p>
            <p className="text-gray-600">support@educafric.com</p>
          </div>
        </div>
      </ModernCard>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Array.isArray(resourceCategories) ? resourceCategories : []).map((category, index) => (
          <ModernCard key={category.id} gradient={['blue', 'green', 'purple', 'orange'][index % 4] as any}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                {category.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{category.title || ''}</h3>
                <p className="text-gray-600 text-sm">{category.description || ''}</p>
              </div>
            </div>

            <div className="space-y-3">
              {category.resources.map((resource, resourceIndex) => (
                <div key={resourceIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 flex-1">{resource.title || ''}</h4>
                    {getResourceTypeBadge(resource.type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{resource.format}</span>
                      <span>{t.lastUpdated}: {resource.updated}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      {getResourceTypeIcon(resource.type)}
                      <span>{resource.type === 'downloadable' ? t.download : t.viewMore}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Quick Links */}
      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6 text-gray-800">
          {language === 'fr' ? 'Liens Rapides' : 'Quick Links'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: language === 'fr' ? 'Calendrier' : 'Calendar',
              icon: <Calendar className="w-5 h-5" />,
              color: 'bg-blue-500'
            },
            {
              title: language === 'fr' ? 'FAQ' : 'FAQ',
              icon: <HelpCircle className="w-5 h-5" />,
              color: 'bg-green-500'
            },
            {
              title: language === 'fr' ? 'Guides' : 'Guides',
              icon: <BookOpen className="w-5 h-5" />,
              color: 'bg-purple-500'
            },
            {
              title: language === 'fr' ? 'Contact' : 'Contact',
              icon: <Phone className="w-5 h-5" />,
              color: 'bg-orange-500'
            }
          ].map((link, index) => (
            <button
              key={index}
              className={`${link.color} text-white p-6 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-center group`}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-opacity-30 transition-all">
                {link.icon}
              </div>
              <span className="text-sm font-semibold">{link.title || ''}</span>
            </button>
          ))}
        </div>
      </ModernCard>

      {/* Help Section */}
      <ModernCard gradient="default">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {language === 'fr' ? 'Besoin d\'aide ?' : 'Need Help?'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'fr' 
              ? 'Notre équipe de support est disponible pour vous aider.'
              : 'Our support team is available to help you.'}
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            {language === 'fr' ? 'Contacter le Support' : 'Contact Support'}
          </Button>
        </div>
      </ModernCard>
    </div>
  );
};