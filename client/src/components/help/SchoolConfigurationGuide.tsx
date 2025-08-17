import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  School, 
  Users, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Image,
  FileText,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  UserCheck,
  Palette
} from 'lucide-react';

interface ConfigurationStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ReactNode;
  priority: 'urgent' | 'important' | 'essential' | 'useful';
  completed: boolean;
  requiredFields: string[];
  estimatedTime: string;
  route: string;
}

const SchoolConfigurationGuide: React.FC = () => {
  const { language } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [schoolData, setSchoolData] = useState<any>(null);

  const configurationSteps: ConfigurationStep[] = [
    {
      id: 'basic-info',
      title: 'Informations Générales',
      titleEn: 'General Information',
      description: 'Configurez les informations de base de votre école (nom, adresse, contacts)',
      descriptionEn: 'Configure your school basic information (name, address, contacts)',
      icon: <School className="w-6 h-6" />,
      priority: 'urgent',
      completed: false,
      requiredFields: ['nom', 'adresse', 'téléphone', 'email'],
      estimatedTime: '10 minutes',
      route: '/director#settings'
    },
    {
      id: 'branding',
      title: 'Identité Visuelle',
      titleEn: 'Visual Identity',
      description: 'Téléchargez le logo, signatures et configurez les couleurs de l\'école',
      descriptionEn: 'Upload logo, signatures and configure school colors',
      icon: <Palette className="w-6 h-6" />,
      priority: 'important',
      completed: false,
      requiredFields: ['logo', 'signature directeur', 'couleurs'],
      estimatedTime: '15 minutes',
      route: '/director#bulletins'
    },
    {
      id: 'administrators',
      title: 'Administrateurs',
      titleEn: 'Administrators',
      description: 'Ajoutez les directeurs adjoints et définissez leurs permissions',
      descriptionEn: 'Add deputy directors and define their permissions',
      icon: <UserCheck className="w-6 h-6" />,
      priority: 'important',
      completed: false,
      requiredFields: ['directeur principal', 'permissions'],
      estimatedTime: '8 minutes',
      route: '/director#administrators'
    },
    {
      id: 'teachers',
      title: 'Enseignants',
      titleEn: 'Teachers',
      description: 'Inscrivez tous vos enseignants avec leurs matières et classes',
      descriptionEn: 'Register all teachers with their subjects and classes',
      icon: <GraduationCap className="w-6 h-6" />,
      priority: 'essential',
      completed: false,
      requiredFields: ['liste enseignants', 'matières', 'classes assignées'],
      estimatedTime: '30 minutes',
      route: '/director#teachers'
    },
    {
      id: 'classes',
      title: 'Classes',
      titleEn: 'Classes',
      description: 'Créez toutes les classes avec leurs enseignants titulaires',
      descriptionEn: 'Create all classes with their homeroom teachers',
      icon: <BookOpen className="w-6 h-6" />,
      priority: 'essential',
      completed: false,
      requiredFields: ['structure classes', 'enseignants titulaires', 'effectifs'],
      estimatedTime: '20 minutes',
      route: '/director#classes'
    },
    {
      id: 'students',
      title: 'Élèves',
      titleEn: 'Students',
      description: 'Inscrivez tous les élèves avec leurs informations familiales',
      descriptionEn: 'Register all students with their family information',
      icon: <Users className="w-6 h-6" />,
      priority: 'essential',
      completed: false,
      requiredFields: ['liste élèves', 'informations parents', 'affectation classes'],
      estimatedTime: '45 minutes',
      route: '/director#students'
    },
    {
      id: 'timetable',
      title: 'Emploi du Temps',
      titleEn: 'Timetable',
      description: 'Configurez les emplois du temps pour toutes les classes',
      descriptionEn: 'Configure timetables for all classes',
      icon: <Calendar className="w-6 h-6" />,
      priority: 'essential',
      completed: false,
      requiredFields: ['horaires généraux', 'planning par classe', 'matières/enseignants'],
      estimatedTime: '40 minutes',
      route: '/director#timetable'
    },
    {
      id: 'communications',
      title: 'Communications',
      titleEn: 'Communications',
      description: 'Configurez SMS, emails et notifications automatiques',
      descriptionEn: 'Configure SMS, emails and automatic notifications',
      icon: <MessageSquare className="w-6 h-6" />,
      priority: 'useful',
      completed: false,
      requiredFields: ['canaux communication', 'messages types', 'contacts urgence'],
      estimatedTime: '25 minutes',
      route: '/director#communications'
    }
  ];

  const priorityColors = {
    urgent: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    important: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    essential: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    useful: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
  };

  const priorityLabels = {
    fr: { urgent: 'URGENT', important: 'IMPORTANT', essential: 'ESSENTIEL', useful: 'UTILE' },
    en: { urgent: 'URGENT', important: 'IMPORTANT', essential: 'ESSENTIAL', useful: 'USEFUL' }
  };

  useEffect(() => {
    checkSchoolConfiguration();
  }, []);

  const checkSchoolConfiguration = async () => {
    try {
      // Simuler la vérification des données école configurées
      const mockCompletedSteps = ['basic-info', 'administrators']; // Exemple
      setCompletedSteps(mockCompletedSteps);
      
      // Simuler données école
      setSchoolData({
        name: 'École Excellence Yaoundé',
        address: 'Avenue Kennedy, Bastos',
        phone: '+237 656 200 472',
        email: 'contact@excellence?.edu?.cm',
        hasLogo: true,
        teachersCount: 25,
        classesCount: 12,
        studentsCount: 347
      });
    } catch (error) {
      console.error('Error checking school configuration:', error);
    }
  };

  const calculateProgress = () => {
    const totalSteps = (Array.isArray(configurationSteps) ? configurationSteps.length : 0);
    const completed = (Array.isArray(completedSteps) ? completedSteps.length : 0);
    return Math.round((completed / totalSteps) * 100);
  };

  const getNextPriorityStep = () => {
    const priorities = ['urgent', 'important', 'essential', 'useful'];
    for (const priority of priorities) {
      const step = configurationSteps.find(s => 
        s.priority === priority && !completedSteps.includes(s.id)
      );
      if (step) return step;
    }
    return null;
  };

  const handleStepClick = (route: string) => {
    // Simuler navigation vers le module approprié
    console.log(`[SCHOOL_CONFIG_GUIDE] Navigation vers: ${route}`);
    // Dans une vraie implémentation, utiliser le routeur
    // window?.location?.hash = route;
  };

  const nextStep = getNextPriorityStep();
  const progress = calculateProgress();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête avec progression */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-800 flex items-center gap-3">
                <School className="w-8 h-8" />
                {language === 'fr' ? 'Configuration Profil École' : 'School Profile Configuration'}
              </CardTitle>
              <p className="text-blue-600 mt-2">
                {language === 'fr' 
                  ? 'Guide interactif pour configurer complètement votre tableau de bord'
                  : 'Interactive guide to completely configure your dashboard'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-800">{progress}%</div>
              <div className="text-sm text-blue-600">
                {language === 'fr' ? 'Complété' : 'Completed'}
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
          <div className="text-sm text-blue-600 mt-2">
            {(Array.isArray(completedSteps) ? completedSteps.length : 0)} / {(Array.isArray(configurationSteps) ? configurationSteps.length : 0)} {language === 'fr' ? 'étapes terminées' : 'steps completed'}
          </div>
        </CardHeader>
      </Card>

      {/* Prochaine étape prioritaire */}
      {nextStep && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {language === 'fr' ? 'Prochaine Étape Recommandée' : 'Next Recommended Step'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {nextStep.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {language === 'fr' ? nextStep.title : nextStep.titleEn}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'fr' ? nextStep.description : nextStep.descriptionEn}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${priorityColors[nextStep.priority].bg} ${priorityColors[nextStep.priority].text}`}>
                      {priorityLabels[language as 'fr' | 'en'][nextStep.priority]}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {nextStep.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleStepClick(nextStep.route)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {language === 'fr' ? 'Commencer' : 'Start'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      {schoolData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{schoolData.teachersCount}</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Enseignants' : 'Teachers'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{schoolData.classesCount}</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Classes' : 'Classes'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{schoolData.studentsCount}</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Élèves' : 'Students'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <div className="text-2xl font-bold text-gray-800">{progress}%</div>
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Configuration' : 'Configuration'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste complète des étapes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Array.isArray(configurationSteps) ? configurationSteps : []).map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const colors = priorityColors[step.priority];
          
          return (
            <Card 
              key={step.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isCompleted ? 'bg-green-50 border-green-200' : `${colors.border} border`
              }`}
              onClick={() => handleStepClick(step.route)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100' : colors.bg
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {index + 1}. {language === 'fr' ? step.title : step.titleEn}
                      </h3>
                      <Badge className={`${colors.bg} ${colors.text} text-xs mt-1`}>
                        {priorityLabels[language as 'fr' | 'en'][step.priority]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {step.estimatedTime}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-3">
                  {language === 'fr' ? step.description : step.descriptionEn}
                </p>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">
                    {language === 'fr' ? 'Éléments requis :' : 'Required elements:'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {step.requiredFields.map((field, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  variant={isCompleted ? "secondary" : "default"}
                  size="sm" 
                  className="w-full mt-3"
                >
                  {isCompleted 
                    ? (language === 'fr' ? 'Revoir' : 'Review')
                    : (language === 'fr' ? 'Configurer' : 'Configure')
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section support */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5" />
            {language === 'fr' ? 'Besoin d\'Aide ?' : 'Need Help?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-gray-600">info@educafric.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Téléphone</div>
                <div className="text-sm text-gray-600">+237 656 200 472</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm text-gray-600">+237 656 200 472</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 {language === 'fr' 
                ? 'Formation personnalisée gratuite disponible ! Contactez-nous pour programmer une session adaptée à votre école.'
                : 'Free personalized training available! Contact us to schedule a session tailored to your school.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolConfigurationGuide;