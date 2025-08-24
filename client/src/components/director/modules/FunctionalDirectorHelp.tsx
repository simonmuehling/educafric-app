// 📱 MOBILE-OPTIMIZED Director Help & Support
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Search, BookOpen, MessageCircle, Phone, Mail, FileText, Video, ChevronRight } from 'lucide-react';

const FunctionalDirectorHelp: React.FC = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const t = {
    title: language === 'fr' ? 'Centre d\'Aide' : 'Help Center',
    searchPlaceholder: language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...',
    categories: language === 'fr' ? 'Catégories' : 'Categories',
    all: language === 'fr' ? 'Tout' : 'All',
    gettingStarted: language === 'fr' ? 'Premiers pas' : 'Getting Started',
    userManagement: language === 'fr' ? 'Gestion utilisateurs' : 'User Management',
    academics: language === 'fr' ? 'Académique' : 'Academics',
    finances: language === 'fr' ? 'Finances' : 'Finances',
    technical: language === 'fr' ? 'Technique' : 'Technical',
    contactSupport: language === 'fr' ? 'Contacter le Support' : 'Contact Support',
    quickStart: language === 'fr' ? 'Démarrage Rapide' : 'Quick Start',
    userGuides: language === 'fr' ? 'Guides Utilisateur' : 'User Guides',
    tutorials: language === 'fr' ? 'Tutoriels' : 'Tutorials',
    faq: language === 'fr' ? 'FAQ' : 'FAQ'
  };

  const helpCategories = [
    { id: 'all', label: t.all },
    { id: 'getting-started', label: t.gettingStarted },
    { id: 'user-management', label: t.userManagement },
    { id: 'academics', label: t.academics },
    { id: 'finances', label: t.finances },
    { id: 'technical', label: t.technical }
  ];

  const helpArticles = [
    {
      id: 1,
      title: language === 'fr' ? 'Configuration initiale de votre école' : 'Initial school setup',
      description: language === 'fr' ? 'Guide complet pour configurer votre établissement sur EducAfric' : 'Complete guide to set up your institution on EducAfric',
      category: 'getting-started',
      type: 'guide',
      readTime: '10 min',
      popular: true
    },
    {
      id: 2,
      title: language === 'fr' ? 'Ajouter et gérer les enseignants' : 'Adding and managing teachers',
      description: language === 'fr' ? 'Comment ajouter des enseignants et gérer leurs permissions' : 'How to add teachers and manage their permissions',
      category: 'user-management',
      type: 'tutorial',
      readTime: '5 min',
      popular: true
    },
    {
      id: 3,
      title: language === 'fr' ? 'Configuration des bulletins de notes' : 'Grade report configuration',
      description: language === 'fr' ? 'Personnaliser les bulletins selon votre système éducatif' : 'Customize grade reports according to your educational system',
      category: 'academics',
      type: 'guide',
      readTime: '8 min',
      popular: false
    },
    {
      id: 4,
      title: language === 'fr' ? 'Gestion des frais de scolarité' : 'Tuition fee management',
      description: language === 'fr' ? 'Configurer et suivre les paiements des frais de scolarité' : 'Configure and track tuition fee payments',
      category: 'finances',
      type: 'tutorial',
      readTime: '12 min',
      popular: true
    },
    {
      id: 5,
      title: language === 'fr' ? 'Résolution des problèmes de connexion' : 'Connection troubleshooting',
      description: language === 'fr' ? 'Solutions aux problèmes techniques courants' : 'Solutions to common technical issues',
      category: 'technical',
      type: 'troubleshooting',
      readTime: '6 min',
      popular: false
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <BookOpen className="w-4 h-4" />;
      case 'tutorial': return <Video className="w-4 h-4" />;
      case 'troubleshooting': return <HelpCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'tutorial': return 'bg-green-100 text-green-800';
      case 'troubleshooting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Mobile-optimized header */}
      <div className="text-center space-y-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          {language === 'fr' ? 
            'Trouvez des réponses à vos questions et apprenez à utiliser EducAfric efficacement' : 
            'Find answers to your questions and learn how to use EducAfric effectively'
          }
        </p>
      </div>

      {/* Mobile-optimized search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: BookOpen, label: t.quickStart, color: 'bg-blue-500' },
          { icon: FileText, label: t.userGuides, color: 'bg-green-500' },
          { icon: Video, label: t.tutorials, color: 'bg-purple-500' },
          { icon: HelpCircle, label: t.faq, color: 'bg-orange-500' }
        ].map((item, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className={`${item.color} rounded-full p-2 sm:p-3 w-fit mx-auto mb-2`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {item.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile-optimized category selector */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {helpCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap min-w-fit"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Mobile-optimized help articles */}
      <div className="space-y-3 sm:space-y-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between space-x-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    {article.popular && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        {language === 'fr' ? 'Populaire' : 'Popular'}
                      </Badge>
                    )}
                    <Badge className={`${getTypeColor(article.type)} text-xs`}>
                      <span className="flex items-center space-x-1">
                        {getTypeIcon(article.type)}
                        <span className="capitalize">{article.type}</span>
                      </span>
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {article.description}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {language === 'fr' ? 'Lecture' : 'Read time'}: {article.readTime}
                  </p>
                </div>
                
                <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact support */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4 sm:p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">
            {language === 'fr' ? 'Besoin d\'aide supplémentaire ?' : 'Need additional help?'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {language === 'fr' ? 
              'Notre équipe de support est là pour vous aider' : 
              'Our support team is here to help you'
            }
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Chat en direct' : 'Live chat'}
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:flex-1">
              <Mail className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Email' : 'Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalDirectorHelp;