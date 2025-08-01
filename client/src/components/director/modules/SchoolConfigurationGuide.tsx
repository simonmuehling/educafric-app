import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Progress } from '../../ui/progress';
import { CheckCircle, Clock, AlertCircle, ChevronRight, Settings, Users, BookOpen, Calendar, MessageSquare, UserCheck, MapPin, CreditCard } from 'lucide-react';

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

  const navigateToModule = (moduleKey: string) => {
    const config = stepConfig[moduleKey as keyof typeof stepConfig];
    if (config) {
      const eventName = `switchTo${config?.module?.charAt(0).toUpperCase() + config?.module?.slice(1)}`;
      const event = new CustomEvent(eventName, {
        detail: { source: 'config-guide' }
      });
      window.dispatchEvent(event);
      console.log(`[CONFIG_GUIDE] Navigating to ${config.module}`);
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {language === 'fr' ? 'Guide Configuration École' : 'School Configuration Guide'}
        </CardTitle>
        {configStatus && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {language === 'fr' ? 'Progression globale' : 'Overall Progress'}
              </span>
              <span className="text-sm text-gray-600">{configStatus.overallProgress}%</span>
            </div>
            <Progress value={configStatus.overallProgress} className="w-full" />
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{config.title || ''}</div>
                      <div className="text-sm text-gray-600">{config.description || ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm">{getStatusText(status)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToModule(stepKey)}
                      className="flex items-center gap-1"
                    >
                      {status === 'completed' 
                        ? (language === 'fr' ? 'Voir' : 'View')
                        : (language === 'fr' ? 'Configurer' : 'Configure')
                      }
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0) > 0 && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">
                  {language === 'fr' ? 'Éléments manquants' : 'Missing Elements'}
                </h4>
                <p className="text-sm text-orange-700">
                  {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0)} {language === 'fr' ? 'éléments à configurer' : 'elements to configure'}
                </p>
              </div>
            )}
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
  );
};

export default SchoolConfigurationGuide;