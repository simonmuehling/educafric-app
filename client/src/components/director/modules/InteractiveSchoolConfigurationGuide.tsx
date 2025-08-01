import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  MapPin,
  Shield,
  CreditCard,
  FileText,
  ChevronRight,
  Play,
  Lightbulb
} from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ConfigurationStep {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  priority: 'Urgent' | 'Important' | 'Essentiel' | 'Utile';
  estimatedTime: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'pending' | 'missing';
  module: string;
  action: () => void;
  requirements: string[];
  benefits: {
    fr: string[];
    en: string[];
  };
}

const InteractiveSchoolConfigurationGuide = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [configurationProgress, setConfigurationProgress] = useState(0);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ConfigurationStep | null>(null);

  const t = {
    title: language === 'fr' ? 'Guide Configuration École Interactive' : 'Interactive School Setup Guide',
    subtitle: language === 'fr' ? 'Configuration complète de votre tableau de bord en 10 étapes' : 'Complete your dashboard setup in 10 steps',
    progress: language === 'fr' ? 'Progression' : 'Progress',
    completed: language === 'fr' ? 'Terminé' : 'Completed',
    inProgress: language === 'fr' ? 'En cours' : 'In Progress',
    pending: language === 'fr' ? 'En attente' : 'Pending',
    missing: language === 'fr' ? 'Manquant' : 'Missing',
    startStep: language === 'fr' ? 'Commencer cette étape' : 'Start this step',
    continueStep: language === 'fr' ? 'Continuer' : 'Continue',
    viewDetails: language === 'fr' ? 'Voir détails' : 'View details',
    estimatedTime: language === 'fr' ? 'Temps estimé' : 'Estimated time',
    priority: language === 'fr' ? 'Priorité' : 'Priority',
    requirements: language === 'fr' ? 'Prérequis' : 'Requirements',
    benefits: language === 'fr' ? 'Avantages' : 'Benefits',
    nextStep: language === 'fr' ? 'Étape suivante' : 'Next step',
    previousStep: language === 'fr' ? 'Étape précédente' : 'Previous step',
    completionMessage: language === 'fr' ? 'Configuration terminée!' : 'Setup completed!',
    missingElements: language === 'fr' ? 'Éléments manquants' : 'Missing elements'
  };

  const configurationSteps: ConfigurationStep[] = [
    {
      id: 'school-info',
      titleFr: 'Informations École',
      titleEn: 'School Information',
      descriptionFr: 'Configurez les informations de base de votre école',
      descriptionEn: 'Configure your school\'s basic information',
      priority: 'Urgent',
      estimatedTime: '5 min',
      icon: <Settings className="w-5 h-5" />,
      status: 'pending',
      module: 'SchoolSettings',
      action: () => dispatchNavigationEvent('switchToSchoolSettings'),
      requirements: ['Nom de l\'école', 'Adresse', 'Téléphone', 'Email'],
      benefits: {
        fr: ['Identification claire de votre établissement', 'Communication officielle'],
        en: ['Clear identification of your institution', 'Official communication']
      }
    },
    {
      id: 'admin-accounts',
      titleFr: 'Comptes Administrateurs',
      titleEn: 'Administrator Accounts',
      descriptionFr: 'Créez les comptes administrateurs de l\'école',
      descriptionEn: 'Create school administrator accounts',
      priority: 'Urgent',
      estimatedTime: '10 min',
      icon: <Shield className="w-5 h-5" />,
      status: 'pending',
      module: 'AdministratorManagement',
      action: () => dispatchNavigationEvent('switchToAdministrators'),
      requirements: ['Directeur principal', 'Directeur adjoint', 'Permissions'],
      benefits: {
        fr: ['Gestion sécurisée', 'Délégation efficace des tâches'],
        en: ['Secure management', 'Efficient task delegation']
      }
    },
    {
      id: 'teachers',
      titleFr: 'Enseignants',
      titleEn: 'Teachers',
      descriptionFr: 'Ajoutez vos enseignants au système',
      descriptionEn: 'Add your teachers to the system',
      priority: 'Important',
      estimatedTime: '15 min',
      icon: <Users className="w-5 h-5" />,
      status: 'pending',
      module: 'TeacherManagement',
      action: () => dispatchNavigationEvent('switchToTeacherManagement'),
      requirements: ['Liste des enseignants', 'Matières enseignées', 'Contacts'],
      benefits: {
        fr: ['Gestion centralisée du personnel', 'Suivi des performances'],
        en: ['Centralized staff management', 'Performance tracking']
      }
    },
    {
      id: 'classes',
      titleFr: 'Classes',
      titleEn: 'Classes',
      descriptionFr: 'Créez les classes et assignez les enseignants',
      descriptionEn: 'Create classes and assign teachers',
      priority: 'Important',
      estimatedTime: '20 min',
      icon: <BookOpen className="w-5 h-5" />,
      status: 'pending',
      module: 'ClassManagement',
      action: () => dispatchNavigationEvent('switchToClassManagement'),
      requirements: ['Niveaux scolaires', 'Effectifs par classe', 'Enseignants assignés'],
      benefits: {
        fr: ['Organisation pédagogique claire', 'Suivi par classe'],
        en: ['Clear educational organization', 'Class-based tracking']
      }
    },
    {
      id: 'students',
      titleFr: 'Élèves',
      titleEn: 'Students',
      descriptionFr: 'Enregistrez vos élèves dans le système',
      descriptionEn: 'Register your students in the system',
      priority: 'Important',
      estimatedTime: '30 min',
      icon: <Users className="w-5 h-5" />,
      status: 'pending',
      module: 'StudentManagement',
      action: () => dispatchNavigationEvent('switchToStudentManagement'),
      requirements: ['Informations élèves', 'Affectation classes', 'Contacts parents'],
      benefits: {
        fr: ['Suivi individuel des élèves', 'Communication avec parents'],
        en: ['Individual student tracking', 'Parent communication']
      }
    },
    {
      id: 'timetable',
      titleFr: 'Emploi du Temps',
      titleEn: 'Timetable',
      descriptionFr: 'Configurez les emplois du temps des classes',
      descriptionEn: 'Configure class timetables',
      priority: 'Essentiel',
      estimatedTime: '25 min',
      icon: <Calendar className="w-5 h-5" />,
      status: 'pending',
      module: 'TimetableConfiguration',
      action: () => dispatchNavigationEvent('switchToTimetable'),
      requirements: ['Horaires école', 'Matières par classe', 'Salles disponibles'],
      benefits: {
        fr: ['Organisation temporelle optimale', 'Éviter les conflits d\'horaires'],
        en: ['Optimal time organization', 'Avoid schedule conflicts']
      }
    },
    {
      id: 'communications',
      titleFr: 'Communications',
      titleEn: 'Communications',
      descriptionFr: 'Configurez les canaux de communication',
      descriptionEn: 'Configure communication channels',
      priority: 'Essentiel',
      estimatedTime: '15 min',
      icon: <MessageSquare className="w-5 h-5" />,
      status: 'pending',
      module: 'Communications',
      action: () => dispatchNavigationEvent('switchToCommunications'),
      requirements: ['Modèles de messages', 'Contacts parents', 'Canaux préférés'],
      benefits: {
        fr: ['Communication efficace', 'Information en temps réel'],
        en: ['Efficient communication', 'Real-time information']
      }
    },
    {
      id: 'attendance',
      titleFr: 'Présences',
      titleEn: 'Attendance',
      descriptionFr: 'Configurez le système de présences',
      descriptionEn: 'Configure attendance system',
      priority: 'Essentiel',
      estimatedTime: '10 min',
      icon: <CheckCircle className="w-5 h-5" />,
      status: 'pending',
      module: 'AttendanceManagement',
      action: () => dispatchNavigationEvent('switchToAttendance'),
      requirements: ['Règles de présence', 'Seuils d\'alerte', 'Notifications automatiques'],
      benefits: {
        fr: ['Suivi automatique', 'Alertes précoces d\'absentéisme'],
        en: ['Automatic tracking', 'Early absenteeism alerts']
      }
    },
    {
      id: 'geolocation',
      titleFr: 'Géolocalisation',
      titleEn: 'Geolocation',
      descriptionFr: 'Configurez le suivi géographique (optionnel)',
      descriptionEn: 'Configure geographic tracking (optional)',
      priority: 'Utile',
      estimatedTime: '20 min',
      icon: <MapPin className="w-5 h-5" />,
      status: 'pending',
      module: 'GeolocationManagement',
      action: () => dispatchNavigationEvent('switchToGeolocation'),
      requirements: ['Zones sécurisées', 'Appareils tracking', 'Permissions parents'],
      benefits: {
        fr: ['Sécurité renforcée', 'Localisation temps réel'],
        en: ['Enhanced security', 'Real-time location']
      }
    },
    {
      id: 'subscription',
      titleFr: 'Abonnement',
      titleEn: 'Subscription',
      descriptionFr: 'Finalisez votre abonnement école',
      descriptionEn: 'Finalize your school subscription',
      priority: 'Utile',
      estimatedTime: '8 min',
      icon: <CreditCard className="w-5 h-5" />,
      status: 'pending',
      module: 'SubscriptionManagement',
      action: () => window.open('/subscribe?plan=school-standard', '_blank'),
      requirements: ['Plan sélectionné', 'Informations paiement', 'Validation'],
      benefits: {
        fr: ['Accès complet aux fonctionnalités', 'Support prioritaire'],
        en: ['Full feature access', 'Priority support']
      }
    }
  ];

  const dispatchNavigationEvent = (eventType: string) => {
    const event = new CustomEvent(eventType, { 
      detail: { source: 'ConfigurationGuide' }
    });
    window.dispatchEvent(event);
    console.log(`[CONFIG_GUIDE] Navigation vers ${eventType}`);
  };

  // Simuler la détection des éléments configurés
  useEffect(() => {
    const detectConfigurationStatus = async () => {
      try {
        // Vérifier l'état de configuration via l'API
        const response = await fetch('/api/school/configuration-status');
        if (response.ok) {
          const status = await response.json();
          updateStepsStatus(status);
        } else {
          // Mode hors-ligne : détecter basé sur le localStorage ou les données utilisateur
          detectOfflineStatus();
        }
      } catch (error) {
        console.log('[CONFIG_GUIDE] Mode hors-ligne activé');
        detectOfflineStatus();
      }
    };

    detectConfigurationStatus();
  }, []);

  const detectOfflineStatus = () => {
    // Détecter les éléments configurés basé sur les données locales
    const completed = [];
    
    if (user?.schoolName && user?.email) completed.push('school-info');
    if (localStorage.getItem('teachersConfigured')) completed.push('teachers');
    if (localStorage.getItem('classesConfigured')) completed.push('classes');
    if (localStorage.getItem('studentsConfigured')) completed.push('students');
    
    setCompletedSteps(completed);
    updateProgress((Array.isArray(completed) ? completed.length : 0));
  };

  const updateStepsStatus = (status: any) => {
    const completed = Object.keys(status).filter(key => status[key] === 'completed');
    setCompletedSteps(completed);
    updateProgress((Array.isArray(completed) ? completed.length : 0));
  };

  const updateProgress = (completedCount: number) => {
    const progress = Math.round((completedCount / (Array.isArray(configurationSteps) ? configurationSteps.length : 0)) * 100);
    setConfigurationProgress(progress);
  };

  const getStepStatus = (stepId: string): 'completed' | 'in-progress' | 'pending' | 'missing' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === configurationSteps[currentStep]?.id) return 'in-progress';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'missing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'missing': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'Important': return 'bg-orange-100 text-orange-800';
      case 'Essentiel': return 'bg-blue-100 text-blue-800';
      case 'Utile': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStepClick = (step: ConfigurationStep, index: number) => {
    setCurrentStep(index);
    setSelectedStep(step);
    setShowDetailedView(true);
  };

  const executeStepAction = (step: ConfigurationStep) => {
    console.log(`[CONFIG_GUIDE] Démarrage étape: ${step.id}`);
    step.action();
    
    // Marquer comme en cours
    if (!completedSteps.includes(step.id)) {
      // Mise à jour de l'état local
      localStorage.setItem(`step_${step.id}_started`, 'true');
    }
  };

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      updateProgress((Array.isArray(newCompleted) ? newCompleted.length : 0));
      localStorage.setItem(`step_${stepId}_completed`, 'true');
    }
  };

  const renderStepsList = () => (
    <div className="space-y-4">
      {(Array.isArray(configurationSteps) ? configurationSteps : []).map((step, index) => {
        const status = getStepStatus(step.id);
        
        return (
          <ModernCard 
            key={step.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              status === 'completed' ? 'bg-green-50 border-green-200' : 
              status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
              'bg-white hover:bg-gray-50'
            }`}
            onClick={() => handleStepClick(step, index)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {language === 'fr' ? step.titleFr : step.titleEn}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {language === 'fr' ? step.descriptionFr : step.descriptionEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(step.priority)}`}>
                    {step.priority}
                  </span>
                  {getStatusIcon(status)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {step.estimatedTime}
                  </span>
                  <span className={getStatusColor(status)}>
                    {status === 'completed' ? t.completed :
                     status === 'in-progress' ? t.inProgress : t.pending}
                  </span>
                </div>
                
                <Button
                  variant={status === 'completed' ? 'outline' : 'default'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    executeStepAction(step);
                  }}
                  className="flex items-center gap-2"
                >
                  {status === 'completed' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t.viewDetails}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {t.startStep}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ModernCard>
        );
      })}
    </div>
  );

  const renderDetailedView = () => {
    if (!selectedStep) return null;

    return (
      <ModernCard className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost" 
            onClick={() => setShowDetailedView(false)}
            className="mb-4"
          >
            ← Retour à la liste
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              {selectedStep.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'fr' ? selectedStep.titleFr : selectedStep.titleEn}
              </h2>
              <p className="text-gray-600">
                {language === 'fr' ? selectedStep.descriptionFr : selectedStep.descriptionEn}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              {t.requirements}
            </h3>
            <ul className="space-y-2">
              {selectedStep.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t.benefits}
            </h3>
            <ul className="space-y-2">
              {(language === 'fr' ? selectedStep?.benefits?.fr : selectedStep?.benefits?.en).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedStep.priority)}`}>
              {selectedStep.priority}
            </span>
            <span className="text-sm text-gray-600">
              {t.estimatedTime}: {selectedStep.estimatedTime}
            </span>
          </div>
          
          <Button
            onClick={() => executeStepAction(selectedStep)}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {t.startStep}
          </Button>
        </div>
      </ModernCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t.title || ''}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {configurationProgress}%
            </div>
            <div className="text-sm text-gray-600">{t.progress}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{(Array.isArray(completedSteps) ? completedSteps.length : 0)}/{(Array.isArray(configurationSteps) ? configurationSteps.length : 0)} étapes terminées</span>
            <span>{configurationProgress}% terminé</span>
          </div>
          <Progress value={configurationProgress} className="h-2" />
        </div>

        {configurationProgress === 100 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{t.completionMessage}</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Votre école est maintenant entièrement configurée et prête à utiliser toutes les fonctionnalités d'Educafric.
            </p>
          </div>
        )}
      </ModernCard>

      {/* Vue détaillée ou liste des étapes */}
      {showDetailedView ? renderDetailedView() : renderStepsList()}

      {/* Éléments manquants prioritaires */}
      {configurationProgress < 100 && (
        <ModernCard className="p-6 border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t.missingElements}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configurationSteps
              .filter(step => !completedSteps.includes(step.id) && step.priority === 'Urgent')
              .map(step => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    {step.icon}
                    <div>
                      <div className="font-medium text-sm">
                        {language === 'fr' ? step.titleFr : step.titleEn}
                      </div>
                      <div className="text-xs text-gray-600">{step.estimatedTime}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => executeStepAction(step)}
                    className="text-xs"
                  >
                    Commencer
                  </Button>
                </div>
              ))}
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default InteractiveSchoolConfigurationGuide;