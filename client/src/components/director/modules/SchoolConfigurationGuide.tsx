import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Progress } from '../../ui/progress';
import { 
  CheckCircle, Clock, AlertCircle, ChevronRight, Settings, Users, BookOpen, Calendar, MessageSquare, UserCheck, MapPin, CreditCard, Sparkles, Star, Trophy, Target, FileText, Eye, Download,
  Search, Mail, Phone, ExternalLink, HelpCircle, Globe, Headphones, Home, GraduationCap, Shield, Bell
} from 'lucide-react';

interface ConfigStep {
  id: string;
  status: 'completed' | 'pending' | 'missing';
  priority: 'urgent' | 'important' | 'essential' | 'useful';
}

interface ConfigStatus {
  schoolId: number;
  overallProgress: number;
  steps: { [key: string]: string };
  missingElements: string[];
  nextRecommendedStep: string;
}

// Interfaces pour la section d'aide intégrée
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

const SchoolConfigurationGuide: React.FC = () => {
  const { language, t } = useLanguage();
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  // États pour la section d'aide intégrée
  const [activeTab, setActiveTab] = useState('configuration');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  useEffect(() => {
    fetchConfigurationStatus();
  }, []);

  const fetchConfigurationStatus = async () => {
    try {
      setLoading(true);
      
      // Configuration statique pour l'affichage immédiat des guides
      const staticConfigStatus = {
        schoolId: 999,
        overallProgress: 75,
        steps: {
          'director-profile': 'completed',
          'classes': 'completed',
          'teachers': 'completed',
          'students': 'completed',
          'timetable': 'pending',
          'attendance': 'completed',
          'communications': 'pending',
          'teacher-absences': 'pending',
          'parent-requests': 'completed',
          'educational-content': 'pending',
          'notifications': 'completed',
          'administrators': 'pending',
          'school-settings': 'completed',
          'reports': 'pending',
          'academic-management': 'completed',
          'online-classes': 'pending'
        },
        missingElements: [
          'timetable',
          'communications',
          'teacher-absences',
          'educational-content',
          'administrators',
          'reports',
          'online-classes'
        ],
        nextRecommendedStep: 'timetable'
      };
      
      setConfigStatus(staticConfigStatus);
      console.log('[CONFIG_GUIDE] ✅ Configuration guides loaded with static data');
      
    } catch (error) {
      console.error('[CONFIG_GUIDE] Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour la section d'aide intégrée
  const getSchoolHelpSections = (): HelpSection[] => {
    return [
      {
        id: 'getting-started',
        title: language === 'fr' ? 'Démarrage' : 'Getting Started',
        icon: <BookOpen className="w-5 h-5" />,
        topics: [
          {
            id: 'school-setup',
            title: language === 'fr' ? 'Configuration initiale' : 'Initial setup',
            description: language === 'fr' ? 'Configurer votre établissement scolaire' : 'Set up your educational institution',
            category: 'getting-started',
            readTime: 10,
            content: language === 'fr'
              ? 'La configuration de votre école dans EDUCAFRIC comprend plusieurs étapes essentielles : création du profil école, ajout des classes, gestion des enseignants et élèves, configuration de l\'emploi du temps, paramétrage des communications avec les parents, et activation des fonctionnalités avancées comme la géolocalisation et les rapports automatisés.'
              : 'Setting up your school in EDUCAFRIC involves several essential steps: creating the school profile, adding classes, managing teachers and students, configuring timetables, setting up parent communications, and activating advanced features like geolocation and automated reports.'
          },
          {
            id: 'user-management',
            title: language === 'fr' ? 'Gestion des utilisateurs' : 'User management',
            description: language === 'fr' ? 'Ajouter et gérer enseignants, élèves et parents' : 'Add and manage teachers, students and parents',
            category: 'getting-started',
            readTime: 8,
            content: language === 'fr'
              ? 'La gestion des utilisateurs est centralisée dans votre tableau de bord directeur. Vous pouvez ajouter des enseignants avec leurs matières, inscrire des élèves dans leurs classes respectives, et faciliter les connexions parent-enfant pour le suivi scolaire.'
              : 'User management is centralized in your director dashboard. You can add teachers with their subjects, enroll students in their respective classes, and facilitate parent-child connections for academic monitoring.'
          }
        ]
      },
      {
        id: 'features',
        title: language === 'fr' ? 'Fonctionnalités' : 'Features',
        icon: <Settings className="w-5 h-5" />,
        topics: [
          {
            id: 'academic-management',
            title: language === 'fr' ? 'Gestion académique' : 'Academic management',
            description: language === 'fr' ? 'Bulletins, notes et évaluations' : 'Report cards, grades and assessments',
            category: 'features',
            readTime: 12,
            content: language === 'fr'
              ? 'Le système de gestion académique d\'EDUCAFRIC permet la création de bulletins personnalisés, la saisie de notes par trimestre, le suivi des comportements, et la génération automatique de rapports de classe avec signatures numériques.'
              : 'EDUCAFRIC\'s academic management system enables creation of personalized report cards, term-based grade entry, behavior tracking, and automatic generation of class reports with digital signatures.'
          },
          {
            id: 'communications',
            title: language === 'fr' ? 'Communications' : 'Communications',
            description: language === 'fr' ? 'Messagerie multicanal avec parents' : 'Multi-channel messaging with parents',
            category: 'features',
            readTime: 6,
            content: language === 'fr'
              ? 'Communiquez avec les parents via SMS, WhatsApp, email et notifications push. Envoyez des alertes automatiques pour les absences, retards, et résultats scolaires.'
              : 'Communicate with parents via SMS, WhatsApp, email and push notifications. Send automatic alerts for absences, delays, and academic results.'
          },
          {
            id: 'geolocation',
            title: language === 'fr' ? 'Géolocalisation' : 'Geolocation',
            description: language === 'fr' ? 'Suivi de position et zones de sécurité' : 'Position tracking and safety zones',
            category: 'features',
            readTime: 8,
            content: language === 'fr'
              ? 'Activez le suivi GPS pour la sécurité des élèves avec zones de sécurité personnalisables, alertes en temps réel, et historique des déplacements.'
              : 'Enable GPS tracking for student safety with customizable safety zones, real-time alerts, and movement history.'
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
              ? 'Si vous ne parvenez pas à vous connecter, vérifiez votre connexion internet, votre email et mot de passe. Contactez le support si le problème persiste.'
              : 'If you cannot log in, check your internet connection, email and password. Contact support if the problem persists.'
          },
          {
            id: 'module-errors',
            title: language === 'fr' ? 'Erreurs de modules' : 'Module errors',
            description: language === 'fr' ? 'Résoudre les problèmes de chargement' : 'Resolve loading issues',
            category: 'troubleshooting',
            readTime: 4,
            content: language === 'fr'
              ? 'Si un module ne se charge pas correctement, actualisez la page ou videz le cache de votre navigateur. Vérifiez également vos permissions d\'accès.'
              : 'If a module does not load correctly, refresh the page or clear your browser cache. Also check your access permissions.'
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
              ? 'Notre équipe support est disponible pour vous aider. Contactez-nous par email à support@educafric.com ou par téléphone au +237 6 57 00 40 11.'
              : 'Our support team is available to help you. Contact us by email at support@educafric.com or by phone at +237 6 57 00 40 11.'
          }
        ]
      }
    ];
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'getting-started':
        return <Badge className="bg-green-100 text-green-800">{language === 'fr' ? 'Démarrage' : 'Getting Started'}</Badge>;
      case 'features':
        return <Badge className="bg-blue-100 text-blue-800">{language === 'fr' ? 'Fonctionnalités' : 'Features'}</Badge>;
      case 'troubleshooting':
        return <Badge className="bg-orange-100 text-orange-800">{language === 'fr' ? 'Dépannage' : 'Troubleshooting'}</Badge>;
      case 'advanced':
        return <Badge className="bg-purple-100 text-purple-800">{language === 'fr' ? 'Avancé' : 'Advanced'}</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const helpSections = getSchoolHelpSections();
  const filteredSections = helpSections.map(section => ({
    ...section,
    topics: section.topics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.topics.length > 0);

  const stepConfig = {
    'school-info': {
      icon: Settings,
      title: language === 'fr' ? 'Informations École' : 'School Information',
      description: language === 'fr' ? 'Configurer nom, adresse et détails' : 'Configure name, address and details',
      module: 'settings'
    },
    'admin-accounts': {
      icon: Users,
      title: language === 'fr' ? 'Comptes Admin' : 'Admin Accounts',
      description: language === 'fr' ? 'Créer comptes administrateurs' : 'Create administrator accounts',
      module: 'administrators'
    },
    'teachers': {
      icon: BookOpen,
      title: language === 'fr' ? 'Enseignants' : 'Teachers',
      description: language === 'fr' ? 'Ajouter enseignants et matières' : 'Add teachers and subjects',
      module: 'teacher-management'
    },
    'classes': {
      icon: Users,
      title: language === 'fr' ? 'Classes' : 'Classes',
      description: language === 'fr' ? 'Créer classes et niveaux' : 'Create classes and levels',
      module: 'class-management'
    },
    'students': {
      icon: UserCheck,
      title: language === 'fr' ? 'Élèves' : 'Students',
      description: language === 'fr' ? 'Inscrire élèves dans classes' : 'Enroll students in classes',
      module: 'student-management'
    },
    'timetable': {
      icon: Calendar,
      title: language === 'fr' ? 'Emploi du temps' : 'Timetable',
      description: language === 'fr' ? 'Planifier horaires cours' : 'Schedule class timetables',
      module: 'timetable'
    },
    'communications': {
      icon: MessageSquare,
      title: language === 'fr' ? 'Communications' : 'Communications',
      description: language === 'fr' ? 'Configurer messagerie parents' : 'Set up parent messaging',
      module: 'communications'
    },
    'attendance': {
      icon: CheckCircle,
      title: language === 'fr' ? 'Présences' : 'Attendance',
      description: language === 'fr' ? 'Activer suivi présences' : 'Enable attendance tracking',
      module: 'attendance-management'
    },
    'geolocation': {
      icon: MapPin,
      title: language === 'fr' ? 'Géolocalisation' : 'Geolocation',
      description: language === 'fr' ? 'Configurer suivi GPS' : 'Configure GPS tracking',
      module: 'geolocation'
    },
    'subscription': {
      icon: CreditCard,
      title: language === 'fr' ? 'Abonnement' : 'Subscription',
      description: language === 'fr' ? 'Choisir plan école' : 'Choose school plan',
      module: 'subscription'
    }
  };

  // Fonctions de configuration spécifiques pour chaque module
  const configureSchoolInfo = () => {
    console.log('[CONFIG_GUIDE] Configuring school information');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'settings', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureAdminAccounts = () => {
    console.log('[CONFIG_GUIDE] Configuring admin accounts');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'school-administrators', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureTeachers = () => {
    console.log('[CONFIG_GUIDE] Configuring teachers');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'teachers', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureClasses = () => {
    console.log('[CONFIG_GUIDE] Configuring classes');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'classes', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureStudents = () => {
    console.log('[CONFIG_GUIDE] Configuring students');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'students', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureTimetable = () => {
    console.log('[CONFIG_GUIDE] Configuring timetable');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'director-timetable', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureCommunications = () => {
    console.log('[CONFIG_GUIDE] Configuring communications');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'director-communications', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureAttendance = () => {
    console.log('[CONFIG_GUIDE] Configuring attendance');
    const event = new CustomEvent('switchModule', {
      detail: { moduleId: 'director-attendance', source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureGeolocation = () => {
    console.log('[CONFIG_GUIDE] Configuring geolocation');
    const event = new CustomEvent('switchToNotifications', {
      detail: { source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  const configureSubscription = () => {
    console.log('[CONFIG_GUIDE] Configuring subscription');
    const event = new CustomEvent('switchToSubscription', {
      detail: { source: 'config-guide' }
    });
    window.dispatchEvent(event);
  };

  // Function to open PDF presentation
  const openPresentationPDF = () => {
    console.log('[CONFIG_GUIDE] Opening EDUCAFRIC presentation PDF');
    window.open('/educafric-school-presentation.pdf', '_blank');
  };

  // Mapper les fonctions de configuration
  const configurationFunctions = {
    'school-info': configureSchoolInfo,
    'admin-accounts': configureAdminAccounts,
    'teachers': configureTeachers,
    'classes': configureClasses,
    'students': configureStudents,
    'timetable': configureTimetable,
    'communications': configureCommunications,
    'attendance': configureAttendance,
    'geolocation': configureGeolocation,
    'subscription': configureSubscription
  };

  const navigateToModule = (moduleKey: string) => {
    const configFunc = configurationFunctions[moduleKey as keyof typeof configurationFunctions];
    if (configFunc) {
      configFunc();
    } else {
      const config = stepConfig[moduleKey as keyof typeof stepConfig];
      if (config) {
        const eventName = `switchTo${config?.module?.charAt(0).toUpperCase() + config?.module?.slice(1)}`;
        const event = new CustomEvent(eventName, {
          detail: { source: 'config-guide' }
        });
        window.dispatchEvent(event);
        console.log(`[CONFIG_GUIDE] Navigating to ${config.module}`);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return language === 'fr' ? 'Terminé' : 'Completed';
      case 'pending':
        return language === 'fr' ? 'En attente' : 'Pending';
      default:
        return language === 'fr' ? 'Manquant' : 'Missing';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {language === 'fr' ? 'Guide Configuration École' : 'School Configuration Guide'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Gestion du contenu de l'aide sélectionnée
  if (selectedTopic) {
    return (
      <div className="w-full space-y-6">
        <Button 
          onClick={() => setSelectedTopic(null)}
          variant="outline"
          className="mb-4"
        >
          ← {language === 'fr' ? 'Retour à l\'aide' : 'Back to Help'}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              {selectedTopic.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getCategoryBadge(selectedTopic.category)}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {selectedTopic.readTime} min
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700">{selectedTopic.content}</p>
              {selectedTopic.downloadLinks && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'fr' ? 'Téléchargements' : 'Downloads'}
                  </h4>
                  {selectedTopic.downloadLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4" />
                      {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header inspiré de la présentation Educafric */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%222%22%20fill%3D%22rgba(255,255,255,0.1)%22/%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2240%22%20r%3D%223%22%20fill%3D%22rgba(255,255,255,0.1)%22/%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2280%22%20r%3D%222%22%20fill%3D%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold">EDUCAFRIC</h1>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          
          <p className="text-xl mb-6 font-medium opacity-90">
            {language === 'fr' ? 'Révolutionnez l\'éducation en Afrique' : 'Revolutionize Education in Africa'}
          </p>
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold">
              {language === 'fr' ? 'WELCOME - Directeur / Établissement' : 'WELCOME - Director / School'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs pour Configuration et Aide */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {language === 'fr' ? 'Configuration' : 'Configuration'}
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            {language === 'fr' ? 'Aide' : 'Help'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="mt-6">
          <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            {language === 'fr' ? 'Guide Configuration École' : 'School Configuration Guide'}
          </CardTitle>
          
          {/* Bouton Présentation PDF EDUCAFRIC */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mt-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 text-lg">
                    {language === 'fr' ? '📋 Présentation EDUCAFRIC' : '📋 EDUCAFRIC Presentation'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' 
                      ? 'Découvrez la présentation officielle de votre plateforme éducative'
                      : 'Discover the official presentation of your educational platform'
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={openPresentationPDF}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-300"
                data-testid="button-view-presentation"
              >
                <Eye className="w-4 h-4" />
                {language === 'fr' ? 'Voir PDF' : 'View PDF'}
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Message motivational inspiré de la présentation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                {language === 'fr' ? 'Objectif de cette configuration' : 'Configuration Objective'}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {language === 'fr' 
                ? 'Ce guide vous accompagne dans la configuration optimale d\'EDUCAFRIC pour votre établissement, vous permettant de tirer le maximum de profit de notre plateforme éducative révolutionnaire.'
                : 'This guide walks you through the optimal configuration of EDUCAFRIC for your institution, allowing you to get the maximum benefit from our revolutionary educational platform.'
              }
            </p>
          </div>
          
          {configStatus && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {language === 'fr' ? 'Progression globale' : 'Overall Progress'}
                </span>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold text-blue-600">{configStatus.overallProgress}%</span>
                </div>
              </div>
              <Progress value={configStatus.overallProgress} className="w-full h-3" />
              
              {configStatus.overallProgress === 100 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">
                      {language === 'fr' ? '🎉 Configuration complète !' : '🎉 Configuration Complete!'}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {language === 'fr' 
                      ? 'Félicitations! Votre école est maintenant optimisée avec EDUCAFRIC.'
                      : 'Congratulations! Your school is now optimized with EDUCAFRIC.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      <CardContent>
        {configStatus ? (
          <div className="space-y-4">
            {Object.entries(configStatus.steps).map(([stepKey, status]) => {
              const config = stepConfig[stepKey as keyof typeof stepConfig];
              if (!config) return null;

              const Icon = config.icon;
              
              return (
                <div
                  key={stepKey}
                  className={`p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                    status === 'completed' 
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                      : status === 'pending'
                      ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
                      : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        status === 'completed' 
                          ? 'bg-green-100' 
                          : status === 'pending'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          status === 'completed' 
                            ? 'text-green-600' 
                            : status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{config.title || ''}</div>
                        <div className="text-sm text-gray-600">{config.description || ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bouton Configurer amélioré */}
                  <div className="w-full">
                    <Button
                      variant={status === 'completed' ? 'outline' : 'default'}
                      size="lg"
                      onClick={() => navigateToModule(stepKey)}
                      className={`w-full flex items-center justify-center gap-3 font-semibold transition-all duration-300 ${
                        status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none' 
                          : status === 'pending'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-lg hover:scale-[1.02]'
                      }`}
                      data-testid={`button-configure-${stepKey}`}
                    >
                      <Icon className="w-5 h-5" />
                      {status === 'completed' 
                        ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {language === 'fr' ? 'Configuration Terminée ✅' : 'Configuration Complete ✅'}
                          </>
                        )
                        : status === 'pending'
                        ? (
                          <>
                            <Clock className="w-4 h-4" />
                            {language === 'fr' ? 'Continuer Configuration' : 'Continue Configuration'}
                          </>
                        )
                        : (
                          <>
                            {language === 'fr' ? 'Démarrer Configuration' : 'Start Configuration'}
                            <Sparkles className="w-4 h-4" />
                          </>
                        )
                      }
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0) > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h4 className="font-bold text-orange-800 text-lg">
                    {language === 'fr' ? '⚠️ Éléments manquants' : '⚠️ Missing Elements'}
                  </h4>
                </div>
                <p className="text-orange-700 font-medium">
                  {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0)} {language === 'fr' ? 'éléments à configurer pour optimiser votre école' : 'elements to configure to optimise your school'}
                </p>
                <div className="mt-4 p-3 bg-white/70 rounded-lg">
                  <p className="text-sm text-orange-600">
                    {language === 'fr' 
                      ? '💡 Astuce: Complétez toutes les étapes pour débloquer le plein potentiel d\'EDUCAFRIC'
                      : '💡 Tip: Complete all steps to unlock the full potential of EDUCAFRIC'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Section motivation finale inspirée du PDF */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-2xl font-bold">
                    {language === 'fr' ? '🚀 Prêt à Révolutionner Votre École ?' : '🚀 Ready to Revolutionize Your School?'}
                  </h3>
                </div>
                <p className="text-lg opacity-90 mb-4">
                  {language === 'fr' 
                    ? 'Avec EDUCAFRIC, transformez votre établissement en leader de l\'innovation éducative africaine'
                    : 'With EDUCAFRIC, transform your institution into a leader of African educational innovation'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="font-semibold">
                      {language === 'fr' ? 'Efficacité +60%' : 'Efficiency +60%'}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl mb-2">🛡️</div>
                    <div className="font-semibold">
                      {language === 'fr' ? 'Sécurité Maximale' : 'Maximum Security'}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-semibold">
                      {language === 'fr' ? 'ROI Garanti' : 'Guaranteed ROI'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {language === 'fr' ? 'Impossible de charger le statut de configuration' : 'Unable to load configuration status'}
            </p>
            <Button onClick={fetchConfigurationStatus} className="mt-4">
              {language === 'fr' ? 'Réessayer' : 'Retry'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
        </TabsContent>

        <TabsContent value="help" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                {language === 'fr' ? 'Centre d\'aide École' : 'School Help Centre'}
              </CardTitle>
              <CardDescription>
                {language === 'fr'
                  ? 'Documentation complète pour l\'administration scolaire'
                  : 'Complete documentation for school administration'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Barre de recherche */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cartes de contact rapide */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-sm">
                      {language === 'fr' ? 'Support Téléphone' : 'Phone Support'}
                    </p>
                    <p className="text-xs text-gray-600">+237 6 57 00 40 11</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-sm">
                      {language === 'fr' ? 'Site Web' : 'Website'}
                    </p>
                    <p className="text-xs text-gray-600">www.educafric.com</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-sm">
                      {language === 'fr' ? 'Support Email' : 'Email Support'}
                    </p>
                    <p className="text-xs text-gray-600">support@educafric.com</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sections d'aide */}
              <div className="space-y-8">
                {filteredSections.map(section => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        {section.icon}
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {section.topics.map(topic => (
                          <Card 
                            key={topic.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedTopic(topic)}
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
                              <h3 className="font-semibold mb-2">{topic.title}</h3>
                              <p className="text-sm text-gray-600">{topic.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolConfigurationGuide;