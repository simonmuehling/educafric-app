import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Progress } from '../../ui/progress';
import { CheckCircle, Clock, AlertCircle, ChevronRight, Settings, Users, BookOpen, Calendar, MessageSquare, UserCheck, MapPin, CreditCard, Sparkles, Star, Trophy, Target } from 'lucide-react';

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

const SchoolConfigurationGuide: React.FC = () => {
  const { language, t } = useLanguage();
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.log('[CONFIG_GUIDE] Status loaded:', data);
      }
    } catch (error) {
      console.error('[CONFIG_GUIDE] Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

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
    window.location.hash = 'settings';
    alert(language === 'fr' 
      ? 'Redirection vers la configuration des informations de l\'école' 
      : 'Redirecting to school information configuration');
  };

  const configureAdminAccounts = () => {
    console.log('[CONFIG_GUIDE] Configuring admin accounts');
    window.location.hash = 'administrators';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des comptes administrateurs' 
      : 'Redirecting to administrator accounts management');
  };

  const configureTeachers = () => {
    console.log('[CONFIG_GUIDE] Configuring teachers');
    window.location.hash = 'teacher-management';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des enseignants' 
      : 'Redirecting to teacher management');
  };

  const configureClasses = () => {
    console.log('[CONFIG_GUIDE] Configuring classes');
    window.location.hash = 'class-management';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des classes' 
      : 'Redirecting to class management');
  };

  const configureStudents = () => {
    console.log('[CONFIG_GUIDE] Configuring students');
    window.location.hash = 'student-management';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des élèves' 
      : 'Redirecting to student management');
  };

  const configureTimetable = () => {
    console.log('[CONFIG_GUIDE] Configuring timetable');
    window.location.hash = 'timetable';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des emplois du temps' 
      : 'Redirecting to timetable management');
  };

  const configureCommunications = () => {
    console.log('[CONFIG_GUIDE] Configuring communications');
    window.location.hash = 'communications';
    alert(language === 'fr' 
      ? 'Redirection vers la configuration des communications' 
      : 'Redirecting to communications setup');
  };

  const configureAttendance = () => {
    console.log('[CONFIG_GUIDE] Configuring attendance');
    window.location.hash = 'attendance-management';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des présences' 
      : 'Redirecting to attendance management');
  };

  const configureGeolocation = () => {
    console.log('[CONFIG_GUIDE] Configuring geolocation');
    window.location.hash = 'geolocation';
    alert(language === 'fr' 
      ? 'Redirection vers la configuration de la géolocalisation' 
      : 'Redirecting to geolocation configuration');
  };

  const configureSubscription = () => {
    console.log('[CONFIG_GUIDE] Configuring subscription');
    window.location.hash = 'premium-services';
    alert(language === 'fr' 
      ? 'Redirection vers la gestion des abonnements' 
      : 'Redirecting to subscription management');
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

  return (
    <div className="w-full space-y-6">
      {/* Header inspiré de la présentation Educafric */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>')] opacity-20"></div>
        
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

      {/* Simon Abanda Credit - Inspiré du PDF */}
      <div className="text-center text-sm text-gray-600 -mt-4">
        <p>
          <span className="font-medium">Simon Abanda</span> - 
          <span className="text-blue-600 ml-1">
            {language === 'fr' ? 'Créateur & CEO' : 'Creator & CEO'}
          </span> | 
          <span className="text-blue-600 ml-1">www.educafric.com</span>
        </p>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            {language === 'fr' ? 'Guide Configuration École' : 'School Configuration Guide'}
          </CardTitle>
          
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
                  {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0)} {language === 'fr' ? 'éléments à configurer pour optimiser votre école' : 'elements to configure to optimize your school'}
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
    </div>
  );
};

export default SchoolConfigurationGuide;