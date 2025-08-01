import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  Download,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Users,
  School,
  GraduationCap,
  UserCheck,
  Home,
  MapPin,
  Shield,
  CreditCard,
  Settings,
  Bell,
  HelpCircle,
  FileText,
  Globe,
  Headphones
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SchoolConfigurationGuide from '../director/modules/SchoolConfigurationGuide';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  topics: HelpTopic[];
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'features' | 'troubleshooting' | 'advanced';
  readTime: number;
  content: string;
  downloadLinks?: { title: string; url: string }[];
}

interface HelpCenterProps {
  userType: 'student' | 'school' | 'teacher' | 'parent' | 'freelancer';
}

export default function HelpCenter({ userType }: HelpCenterProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [showSchoolGuide, setShowSchoolGuide] = useState(false);

  const getUserTypeConfig = () => {
    switch (userType) {
      case 'student':
        return {
          title: language === 'fr' ? 'Centre d\'aide Étudiant' : 'Student Help Center',
          icon: <GraduationCap className="w-6 h-6" />,
          color: 'bg-blue-500',
          description: language === 'fr' 
            ? 'Guides et ressources pour les étudiants utilisant EDUCAFRIC'
            : 'Guides and resources for students using EDUCAFRIC'
        };
      case 'school':
        return {
          title: language === 'fr' ? 'Centre d\'aide École' : 'School Help Center',
          icon: <School className="w-6 h-6" />,
          color: 'bg-indigo-500',
          description: language === 'fr'
            ? 'Documentation complète pour l\'administration scolaire'
            : 'Complete documentation for school administration'
        };
      case 'teacher':
        return {
          title: language === 'fr' ? 'Centre d\'aide Enseignant' : 'Teacher Help Center',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-green-500',
          description: language === 'fr'
            ? 'Ressources pédagogiques et outils de gestion de classe'
            : 'Educational resources and classroom management tools'
        };
      case 'parent':
        return {
          title: language === 'fr' ? 'Centre d\'aide Parent' : 'Parent Help Center',
          icon: <Home className="w-6 h-6" />,
          color: 'bg-purple-500',
          description: language === 'fr'
            ? 'Guide pour suivre la scolarité de vos enfants'
            : 'Guide to track your children\'s education'
        };
      case 'freelancer':
        return {
          title: language === 'fr' ? 'Centre d\'aide Répétiteur' : 'Freelancer Help Center',
          icon: <UserCheck className="w-6 h-6" />,
          color: 'bg-orange-500',
          description: language === 'fr'
            ? 'Outils et ressources pour les cours particuliers'
            : 'Tools and resources for private tutoring'
        };
      default:
        return { title: '', icon: null, color: '', description: '' };
    }
  };

  const getHelpSections = (): HelpSection[] => {
    const baseContent = {
      gettingStarted: {
        student: [
          {
            id: 'first-login',
            title: language === 'fr' ? 'Première connexion' : 'First login',
            description: language === 'fr' ? 'Comment se connecter pour la première fois' : 'How to log in for the first time',
            category: 'getting-started' as const,
            readTime: 3,
            content: language === 'fr' 
              ? 'Guide étape par étape pour votre première connexion à EDUCAFRIC...'
              : 'Step-by-step guide for your first login to EDUCAFRIC...'
          },
          {
            id: 'dashboard-overview',
            title: language === 'fr' ? 'Aperçu du tableau de bord' : 'Dashboard overview',
            description: language === 'fr' ? 'Découvrez les fonctionnalités de votre espace étudiant' : 'Discover your student dashboard features',
            category: 'getting-started' as const,
            readTime: 5,
            content: language === 'fr'
              ? 'Votre tableau de bord étudiant contient toutes les informations importantes...'
              : 'Your student dashboard contains all important information...'
          }
        ],
        school: [
          {
            id: 'school-configuration-guide',
            title: language === 'fr' ? '🎯 Guide Configuration École' : '🎯 School Configuration Guide',
            description: language === 'fr' ? 'Guide interactif complet pour configurer votre profil école étape par étape' : 'Complete interactive guide to configure your school profile step by step',
            category: 'getting-started' as const,
            readTime: 15,
            content: language === 'fr'
              ? 'Guide interactif pour configurer complètement votre école dans EDUCAFRIC avec suivi de progression et étapes prioritaires...'
              : 'Interactive guide to completely configure your school in EDUCAFRIC with progress tracking and priority steps...',
            downloadLinks: [
              {
                title: language === 'fr' ? 'Guide PDF Configuration École' : 'School Configuration PDF Guide',
                url: '/guides/school-configuration-guide.pdf'
              }
            ]
          },
          {
            id: 'school-setup',
            title: language === 'fr' ? 'Configuration initiale' : 'Initial setup',
            description: language === 'fr' ? 'Configurer votre établissement scolaire' : 'Set up your educational institution',
            category: 'getting-started' as const,
            readTime: 10,
            content: language === 'fr'
              ? 'La configuration de votre école dans EDUCAFRIC comprend plusieurs étapes...'
              : 'Setting up your school in EDUCAFRIC involves several steps...'
          },
          {
            id: 'user-management',
            title: language === 'fr' ? 'Gestion des utilisateurs' : 'User management',
            description: language === 'fr' ? 'Ajouter et gérer enseignants, élèves et parents' : 'Add and manage teachers, students and parents',
            category: 'getting-started' as const,
            readTime: 8,
            content: language === 'fr'
              ? 'La gestion des utilisateurs est centralisée dans votre tableau de bord...'
              : 'User management is centralized in your dashboard...'
          }
        ],
        teacher: [
          {
            id: 'class-setup',
            title: language === 'fr' ? 'Configuration des classes' : 'Class setup',
            description: language === 'fr' ? 'Créer et organiser vos classes' : 'Create and organize your classes',
            category: 'getting-started' as const,
            readTime: 6,
            content: language === 'fr'
              ? 'Pour commencer à utiliser EDUCAFRIC en tant qu\'enseignant...'
              : 'To start using EDUCAFRIC as a teacher...'
          },
          {
            id: 'grade-management',
            title: language === 'fr' ? 'Gestion des notes' : 'Grade management',
            description: language === 'fr' ? 'Saisir et gérer les notes des élèves' : 'Enter and manage student grades',
            category: 'features' as const,
            readTime: 7,
            content: language === 'fr'
              ? 'Le système de notes d\'EDUCAFRIC vous permet...'
              : 'EDUCAFRIC\'s grading system allows you...'
          }
        ],
        parent: [
          {
            id: 'child-tracking',
            title: language === 'fr' ? 'Suivi de votre enfant' : 'Tracking your child',
            description: language === 'fr' ? 'Monitorer la scolarité et la sécurité' : 'Monitor education and safety',
            category: 'getting-started' as const,
            readTime: 5,
            content: language === 'fr'
              ? 'En tant que parent, EDUCAFRIC vous offre une vue complète...'
              : 'As a parent, EDUCAFRIC gives you a complete view...'
          },
          {
            id: 'geolocation-setup',
            title: language === 'fr' ? 'Configuration géolocalisation' : 'Geolocation setup',
            description: language === 'fr' ? 'Activer le suivi de position de votre enfant' : 'Enable your child\'s location tracking',
            category: 'features' as const,
            readTime: 8,
            content: language === 'fr'
              ? 'La géolocalisation d\'EDUCAFRIC assure la sécurité...'
              : 'EDUCAFRIC\'s geolocation ensures safety...'
          }
        ],
        freelancer: [
          {
            id: 'tutor-profile',
            title: language === 'fr' ? 'Profil répétiteur' : 'Tutor profile',
            description: language === 'fr' ? 'Créer et optimiser votre profil professionnel' : 'Create and optimize your professional profile',
            category: 'getting-started' as const,
            readTime: 6,
            content: language === 'fr'
              ? 'Votre profil répétiteur est essentiel pour attirer des étudiants...'
              : 'Your tutor profile is essential to attract students...'
          },
          {
            id: 'lesson-scheduling',
            title: language === 'fr' ? 'Planification des cours' : 'Lesson scheduling',
            description: language === 'fr' ? 'Organiser vos cours particuliers' : 'Organize your private lessons',
            category: 'features' as const,
            readTime: 7,
            content: language === 'fr'
              ? 'La planification efficace de vos cours particuliers...'
              : 'Efficient planning of your private lessons...'
          }
        ]
      }
    };

    const commonSections: HelpSection[] = [
      {
        id: 'getting-started',
        title: language === 'fr' ? 'Commencer' : 'Getting Started',
        icon: <BookOpen className="w-5 h-5" />,
        topics: baseContent.gettingStarted[userType] || []
      },
      {
        id: 'features',
        title: language === 'fr' ? 'Fonctionnalités' : 'Features',
        icon: <Settings className="w-5 h-5" />,
        topics: [
          {
            id: 'notifications',
            title: language === 'fr' ? 'Notifications' : 'Notifications',
            description: language === 'fr' ? 'Configurer vos alertes et notifications' : 'Configure your alerts and notifications',
            category: 'features',
            readTime: 4,
            content: language === 'fr'
              ? 'EDUCAFRIC offre un système de notifications complet...'
              : 'EDUCAFRIC offers a comprehensive notification system...'
          },
          {
            id: 'mobile-app',
            title: language === 'fr' ? 'Application mobile' : 'Mobile app',
            description: language === 'fr' ? 'Utiliser EDUCAFRIC sur votre smartphone' : 'Use EDUCAFRIC on your smartphone',
            category: 'features',
            readTime: 5,
            content: language === 'fr'
              ? 'L\'application mobile EDUCAFRIC vous permet...'
              : 'The EDUCAFRIC mobile app allows you...'
          }
        ]
      },
      {
        id: 'troubleshooting',
        title: language === 'fr' ? 'Dépannage' : 'Troubleshooting',
        icon: <HelpCircle className="w-5 h-5" />,
        topics: [
          {
            id: 'login-issues',
            title: language === 'fr' ? 'Problèmes de connexion' : 'Login issues',
            description: language === 'fr' ? 'Résoudre les difficultés de connexion' : 'Resolve login difficulties',
            category: 'troubleshooting',
            readTime: 3,
            content: language === 'fr'
              ? 'Si vous ne parvenez pas à vous connecter...'
              : 'If you cannot log in...'
          },
          {
            id: 'password-reset',
            title: language === 'fr' ? 'Réinitialisation mot de passe' : 'Password reset',
            description: language === 'fr' ? 'Récupérer l\'accès à votre compte' : 'Recover access to your account',
            category: 'troubleshooting',
            readTime: 2,
            content: language === 'fr'
              ? 'Pour réinitialiser votre mot de passe...'
              : 'To reset your password...'
          }
        ]
      },
      {
        id: 'support',
        title: language === 'fr' ? 'Contact & Support' : 'Contact & Support',
        icon: <Headphones className="w-5 h-5" />,
        topics: [
          {
            id: 'contact-support',
            title: language === 'fr' ? 'Contacter le support' : 'Contact support',
            description: language === 'fr' ? 'Obtenir de l\'aide personnalisée' : 'Get personalized help',
            category: 'advanced',
            readTime: 2,
            content: language === 'fr'
              ? 'Notre équipe support est disponible pour vous aider...'
              : 'Our support team is available to help you...'
          }
        ]
      }
    ];

    return commonSections;
  };

  const config = getUserTypeConfig();
  const helpSections = getHelpSections();

  const filteredSections = (Array.isArray(helpSections) ? helpSections : []).map(section => ({
    ...section,
    topics: (Array.isArray(section.topics) ? section.topics : []).filter(topic =>
      topic?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => (Array.isArray(section.topics) ? section.topics.length : 0) > 0);

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      'getting-started': { label: language === 'fr' ? 'Débutant' : 'Beginner', color: 'bg-green-100 text-green-800' },
      'features': { label: language === 'fr' ? 'Fonctionnalités' : 'Features', color: 'bg-blue-100 text-blue-800' },
      'troubleshooting': { label: language === 'fr' ? 'Dépannage' : 'Troubleshooting', color: 'bg-yellow-100 text-yellow-800' },
      'advanced': { label: language === 'fr' ? 'Avancé' : 'Advanced', color: 'bg-purple-100 text-purple-800' }
    };

    const config = categoryConfig[category as keyof typeof categoryConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (selectedTopic) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedTopic(null)}
          className="mb-6 flex items-center gap-2"
        >
          ← {language === 'fr' ? 'Retour au centre d\'aide' : 'Back to help center'}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {getCategoryBadge(selectedTopic.category)}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {selectedTopic.readTime} min
                  </div>
                </div>
                <CardTitle className="text-2xl">{selectedTopic.title || ''}</CardTitle>
                <CardDescription className="text-lg">{selectedTopic.description || ''}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {selectedTopic.content}
            </div>



            {selectedTopic.downloadLinks && (Array.isArray(selectedTopic.downloadLinks) ? selectedTopic.downloadLinks.length : 0) > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    {language === 'fr' ? 'Téléchargements' : 'Downloads'}
                  </span>
                </div>
                <div className="space-y-2">
                  {(Array.isArray(selectedTopic.downloadLinks) ? selectedTopic.downloadLinks : []).map((link, index) => (
                    <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      {link.title || ''}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {language === 'fr' ? 'Cet article vous a-t-il été utile ?' : 'Was this article helpful?'}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  👍 {language === 'fr' ? 'Oui' : 'Yes'}
                </Button>
                <Button size="sm" variant="outline">
                  👎 {language === 'fr' ? 'Non' : 'No'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className={`p-3 rounded-lg ${config.color} text-white`}>
            {config.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{config.title || ''}</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {config.description || ''}
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-semibold text-sm">
                {language === 'fr' ? 'Support téléphone' : 'Phone support'}
              </p>
              <p className="text-xs text-gray-600">+237 656 200 472</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">
                {language === 'fr' ? 'Support Email' : 'Email Support'}
              </p>
              <p className="text-xs text-gray-600">info@educafric.com</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Sections */}
      <div className="space-y-8">
        {(Array.isArray(filteredSections) ? filteredSections : []).map(section => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                {section.icon}
                {section.title || ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {(Array.isArray(section.topics) ? section.topics : []).map(topic => (
                  <Card 
                    key={topic.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      if (topic.id === 'school-configuration-guide') {
                        setShowSchoolGuide(true);
                      } else {
                        setSelectedTopic(topic);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(topic.category)}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {topic.readTime} min
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <h3 className="font-semibold mb-2">{topic.title || ''}</h3>
                      <p className="text-sm text-gray-600">{topic.description || ''}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Section */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center">
            {language === 'fr' ? 'Besoin d\'aide supplémentaire ?' : 'Need additional help?'}
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'fr'
              ? 'Notre équipe support est là pour vous accompagner'
              : 'Our support team is here to help you'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-sm">info@educafric.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-sm">+237 656 200 472</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="text-sm">www?.educafric?.com</span>
            </div>
          </div>
          
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <MessageCircle className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Démarrer une conversation' : 'Start a conversation'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const helpCenterContent = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${config.color} rounded-2xl mb-4`}>
          <div className="text-white">
            {config.icon}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {config.title || ''}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {config.description || ''}
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-4 p-4">
              <Phone className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-sm">
                  {language === 'fr' ? 'Support Téléphone' : 'Phone Support'}
                </p>
                <p className="text-xs text-gray-600">+237 656 200 472</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-4 p-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-sm">
                  {language === 'fr' ? 'Support Email' : 'Email Support'}
                </p>
                <p className="text-xs text-gray-600">info@educafric.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Sections */}
        <div className="space-y-8">
          {(Array.isArray(filteredSections) ? filteredSections : []).map(section => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  {section.icon}
                  {section.title || ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {(Array.isArray(section.topics) ? section.topics : []).map(topic => (
                    <Card 
                      key={topic.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        if (topic.id === 'school-configuration-guide') {
                          setShowSchoolGuide(true);
                        } else {
                          setSelectedTopic(topic);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(topic.category)}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {topic.readTime} min
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{topic.title || ''}</h3>
                        <p className="text-sm text-gray-600">{topic.description || ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center">
              {language === 'fr' ? 'Besoin d\'aide supplémentaire ?' : 'Need additional help?'}
            </CardTitle>
            <CardDescription className="text-center">
              {language === 'fr'
                ? 'Notre équipe support est là pour vous accompagner'
                : 'Our support team is here to help you'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm">info@educafric.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
                <span className="text-sm">+237 656 200 472</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="text-sm">www?.educafric?.com</span>
              </div>
            </div>
            
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Démarrer une conversation' : 'Start a conversation'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Show interactive school guide when requested
  if (showSchoolGuide) {
    return (
      <div className="w-full">
        <Button 
          variant="ghost" 
          onClick={() => setShowSchoolGuide(false)}
          className="mb-6 flex items-center gap-2"
        >
          ← {language === 'fr' ? 'Retour au centre d\'aide' : 'Back to help center'}
        </Button>
        <SchoolConfigurationGuide />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className={`p-3 rounded-lg ${config.color} text-white`}>
            {config.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{config.title || ''}</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {config.description || ''}
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-semibold text-sm">
                {language === 'fr' ? 'Support téléphone' : 'Phone support'}
              </p>
              <p className="text-xs text-gray-600">+237 656 200 472</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">
                {language === 'fr' ? 'Support Email' : 'Email Support'}
              </p>
              <p className="text-xs text-gray-600">info@educafric.com</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Sections */}
      <div className="space-y-8">
        {(Array.isArray(filteredSections) ? filteredSections : []).map(section => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                {section.icon}
                {section.title || ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {(Array.isArray(section.topics) ? section.topics : []).map(topic => (
                  <Card 
                    key={topic.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      if (topic.id === 'school-configuration-guide') {
                        setShowSchoolGuide(true);
                      } else {
                        setSelectedTopic(topic);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(topic.category)}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {topic.readTime} min
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <h3 className="font-semibold mb-2">{topic.title || ''}</h3>
                      <p className="text-sm text-gray-600">{topic.description || ''}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}