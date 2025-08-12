import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Settings, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  UserCheck, 
  MapPin, 
  CreditCard,
  Smartphone,
  ArrowLeft,
  Info,
  Play,
  Target
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

const MobileSchoolConfigurationGuide: React.FC = () => {
  const { language } = useLanguage();
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchConfigurationStatus();
  }, []);

  const fetchConfigurationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/school/configuration-status', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConfigStatus(data);
        console.log('[MOBILE_CONFIG_GUIDE] Status loaded:', data);
      }
    } catch (error) {
      console.error('[MOBILE_CONFIG_GUIDE] Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const text = {
    fr: {
      title: 'Configuration École',
      subtitle: 'Guide interactif pour configurer votre école',
      progress: 'Progression',
      completed: 'Terminé',
      pending: 'En attente',
      missing: 'Manquant',
      configure: 'Configurer',
      view: 'Voir',
      backToOverview: 'Retour à la vue d\'ensemble',
      nextStep: 'Étape suivante',
      startNow: 'Commencer',
      priority: 'Priorité',
      estimatedTime: 'Temps estimé',
      description: 'Description',
      urgentPriority: 'Urgent',
      importantPriority: 'Important',
      essentialPriority: 'Essentiel',
      usefulPriority: 'Utile',
      missingElements: 'Éléments manquants',
      allConfigured: 'Tout est configuré !',
      steps: {
        'school-info': {
          title: 'Informations École',
          description: 'Nom, adresse, contact de l\'école',
          details: 'Configurez les informations de base de votre établissement : nom complet, adresse, numéros de téléphone, email officiel.',
          time: '5 min'
        },
        'admin-accounts': {
          title: 'Comptes Admin',
          description: 'Création des administrateurs',
          details: 'Créez les comptes pour directeur adjoint, coordinateur académique, surveillant général.',
          time: '10 min'
        },
        'teachers': {
          title: 'Enseignants',
          description: 'Ajout du personnel enseignant',
          details: 'Enregistrez tous vos enseignants avec leurs matières, classes assignées, et informations de contact.',
          time: '20 min'
        },
        'classes': {
          title: 'Classes',
          description: 'Création des classes et niveaux',
          details: 'Organisez votre structure pédagogique : classes par niveau, effectifs, enseignants titulaires.',
          time: '15 min'
        },
        'students': {
          title: 'Élèves',
          description: 'Inscription des étudiants',
          details: 'Inscrivez vos élèves dans leurs classes respectives avec informations complètes.',
          time: '30 min'
        },
        'timetable': {
          title: 'Emploi du temps',
          description: 'Planification des horaires',
          details: 'Créez les emplois du temps pour chaque classe et enseignant.',
          time: '25 min'
        },
        'communications': {
          title: 'Communications',
          description: 'Messagerie avec les parents',
          details: 'Configurez les systèmes de communication SMS, WhatsApp, et email avec les parents.',
          time: '10 min'
        },
        'attendance': {
          title: 'Présences',
          description: 'Suivi d\'assiduité',
          details: 'Activez le système de suivi des présences et des absences.',
          time: '8 min'
        },
        'geolocation': {
          title: 'Géolocalisation',
          description: 'Suivi GPS sécurisé',
          details: 'Configurez les zones de sécurité et le suivi de localisation des élèves.',
          time: '12 min'
        },
        'subscription': {
          title: 'Abonnement',
          description: 'Plan école et paiement',
          details: 'Choisissez votre plan d\'abonnement et configurez les modalités de paiement.',
          time: '5 min'
        }
      }
    },
    en: {
      title: 'School Configuration',
      subtitle: 'Interactive guide to configure your school',
      progress: 'Progress',
      completed: 'Completed',
      pending: 'Pending',
      missing: 'Missing',
      configure: 'Configure',
      view: 'View',
      backToOverview: 'Back to overview',
      nextStep: 'Next step',
      startNow: 'Start now',
      priority: 'Priority',
      estimatedTime: 'Estimated time',
      description: 'Description',
      urgentPriority: 'Urgent',
      importantPriority: 'Important',
      essentialPriority: 'Essential',
      usefulPriority: 'Useful',
      missingElements: 'Missing elements',
      allConfigured: 'Everything is configured!',
      steps: {
        'school-info': {
          title: 'School Information',
          description: 'Name, address, school contact',
          details: 'Configure basic information about your institution: full name, address, phone numbers, official email.',
          time: '5 min'
        },
        'admin-accounts': {
          title: 'Admin Accounts',
          description: 'Administrator creation',
          details: 'Create accounts for deputy director, academic coordinator, general supervisor.',
          time: '10 min'
        },
        'teachers': {
          title: 'Teachers',
          description: 'Teaching staff addition',
          details: 'Register all your teachers with their subjects, assigned classes, and contact information.',
          time: '20 min'
        },
        'classes': {
          title: 'Classes',
          description: 'Classes and levels creation',
          details: 'Organize your educational structure: classes by level, student capacity, homeroom teachers.',
          time: '15 min'
        },
        'students': {
          title: 'Students',
          description: 'Student enrollment',
          details: 'Enroll your students in their respective classes with complete information.',
          time: '30 min'
        },
        'timetable': {
          title: 'Timetable',
          description: 'Schedule planning',
          details: 'Create timetables for each class and teacher.',
          time: '25 min'
        },
        'communications': {
          title: 'Communications',
          description: 'Parent messaging',
          details: 'Configure SMS, WhatsApp, and email communication systems with parents.',
          time: '10 min'
        },
        'attendance': {
          title: 'Attendance',
          description: 'Attendance tracking',
          details: 'Enable the attendance and absence tracking system.',
          time: '8 min'
        },
        'geolocation': {
          title: 'Geolocation',
          description: 'Secure GPS tracking',
          details: 'Configure safety zones and student location tracking.',
          time: '12 min'
        },
        'subscription': {
          title: 'Subscription',
          description: 'School plan and payment',
          details: 'Choose your subscription plan and configure payment methods.',
          time: '5 min'
        }
      }
    }
  };

  const t = text[language as keyof typeof text];

  const stepConfig = {
    'school-info': { icon: Settings, priority: 'urgent' },
    'admin-accounts': { icon: Users, priority: 'important' },
    'teachers': { icon: BookOpen, priority: 'essential' },
    'classes': { icon: Users, priority: 'essential' },
    'students': { icon: UserCheck, priority: 'essential' },
    'timetable': { icon: Calendar, priority: 'important' },
    'communications': { icon: MessageSquare, priority: 'useful' },
    'attendance': { icon: CheckCircle, priority: 'useful' },
    'geolocation': { icon: MapPin, priority: 'useful' },
    'subscription': { icon: CreditCard, priority: 'important' }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'important': return 'text-orange-600 bg-orange-50';
      case 'essential': return 'text-blue-600 bg-blue-50';
      case 'useful': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return t.urgentPriority;
      case 'important': return t.importantPriority;
      case 'essential': return t.essentialPriority;
      case 'useful': return t.usefulPriority;
      default: return priority;
    }
  };

  const navigateToModule = (moduleKey: string) => {
    const moduleMap: { [key: string]: string } = {
      'school-info': 'settings',
      'admin-accounts': 'administrators',
      'teachers': 'teacher-management',
      'classes': 'class-management',
      'students': 'student-management',
      'timetable': 'timetable',
      'communications': 'communications',
      'attendance': 'attendance-management',
      'geolocation': 'geolocation',
      'subscription': 'subscription'
    };

    const module = moduleMap[moduleKey];
    if (module) {
      const eventName = `switchTo${module.charAt(0).toUpperCase() + module.slice(1)}`;
      const event = new CustomEvent(eventName, {
        detail: { source: 'mobile-config-guide' }
      });
      window.dispatchEvent(event);
      console.log(`[MOBILE_CONFIG_GUIDE] Navigating to ${module}`);
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
      case 'completed': return t.completed;
      case 'pending': return t.pending;
      default: return t.missing;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-lg">{t.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue détaillée d'une étape
  if (showDetails && selectedStep) {
    const stepData = t.steps[selectedStep as keyof typeof t.steps];
    const status = configStatus?.steps[selectedStep] || 'missing';
    const config = stepConfig[selectedStep as keyof typeof stepConfig];
    const Icon = config?.icon || Settings;
    const priority = config?.priority || 'useful';

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="p-2"
                data-testid="button-back-overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg leading-tight">{stepData?.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(status)}
              <span className="text-sm font-medium">{getStatusText(status)}</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Priorité */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.priority}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                {getPriorityText(priority)}
              </span>
            </div>

            {/* Temps estimé */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.estimatedTime}</span>
              </div>
              <span className="text-sm text-gray-600">{stepData?.time}</span>
            </div>

            {/* Description détaillée */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.description}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{stepData?.details}</p>
            </div>

            {/* Bouton d'action */}
            <div className="pt-4">
              <Button
                onClick={() => navigateToModule(selectedStep)}
                className="w-full h-12 text-base font-medium"
                data-testid={`button-configure-${selectedStep}`}
              >
                <Play className="w-4 h-4 mr-2" />
                {status === 'completed' ? t.view : t.startNow}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue d'ensemble principale
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-lg text-center">{t.title}</CardTitle>
          </div>
          <p className="text-sm text-gray-600 text-center">{t.subtitle}</p>
          
          {configStatus && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.progress}</span>
                <span className="text-sm text-gray-600">{configStatus.overallProgress}%</span>
              </div>
              <Progress value={configStatus.overallProgress} className="w-full h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {configStatus ? (
            <div className="space-y-3">
              {Object.entries(configStatus.steps).map(([stepKey, status]) => {
                const stepData = t.steps[stepKey as keyof typeof t.steps];
                const config = stepConfig[stepKey as keyof typeof stepConfig];
                
                if (!stepData || !config) return null;

                const Icon = config.icon;
                const priority = config.priority;
                
                return (
                  <div
                    key={stepKey}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{stepData.title}</div>
                        <div className="text-xs text-gray-600 truncate">{stepData.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(status)}
                          <span className="text-xs">{getStatusText(status)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(priority)}`}>
                            {getPriorityText(priority)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStep(stepKey);
                        setShowDetails(true);
                      }}
                      className="ml-2 p-2 flex-shrink-0"
                      data-testid={`button-details-${stepKey}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              
              {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0) > 0 ? (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-orange-800 text-sm">{t.missingElements}</h4>
                  </div>
                  <p className="text-xs text-orange-700">
                    {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0)} éléments à configurer
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">{t.allConfigured}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-4">
                Impossible de charger le statut de configuration
              </p>
              <Button 
                onClick={fetchConfigurationStatus} 
                size="sm"
                data-testid="button-retry-config"
              >
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSchoolConfigurationGuide;