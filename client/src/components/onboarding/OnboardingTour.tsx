import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlightType: 'spotlight' | 'outline' | 'glow';
  action?: 'click' | 'hover' | 'scroll';
  role?: string[];
  priority: 'high' | 'medium' | 'low';
}

interface OnboardingTourProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  tourType?: 'first-time' | 'feature-update' | 'role-specific';
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isVisible,
  onClose,
  onComplete,
  tourType = 'first-time'
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const text = {
    fr: {
      welcome: 'Bienvenue sur EDUCAFRIC',
      tourTitle: 'Découverte Guidée',
      skip: 'Ignorer',
      next: 'Suivant',
      previous: 'Précédent',
      finish: 'Terminer',
      play: 'Lecture Auto',
      pause: 'Pause',
      restart: 'Recommencer',
      step: 'Étape',
      of: 'sur',
      gotIt: 'Compris !',
      close: 'Fermer',
      progress: 'Progression'
    },
    en: {
      welcome: 'Welcome to EDUCAFRIC',
      tourTitle: 'Guided Tour',
      skip: 'Skip',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      play: 'Auto Play',
      pause: 'Pause',
      restart: 'Restart',
      step: 'Step',
      of: 'of',
      gotIt: 'Got it!',
      close: 'Close',
      progress: 'Progress'
    }
  };

  const t = text[language as keyof typeof text];

  // Role-specific tour steps
  const getAllTourSteps = (): TourStep[] => {
    const commonSteps: TourStep[] = [
      {
        id: 'welcome',
        target: '[data-testid="header-logo"]',
        title: language === 'fr' ? 'Bienvenue sur EDUCAFRIC' : 'Welcome to EDUCAFRIC',
        content: language === 'fr' 
          ? 'Votre plateforme éducative africaine complète. Explorons ensemble les fonctionnalités principales.'
          : 'Your comprehensive African educational platform. Let\'s explore the main features together.',
        position: 'bottom',
        highlightType: 'glow',
        priority: 'high'
      },
      {
        id: 'navigation',
        target: '[data-testid="main-navigation"]',
        title: language === 'fr' ? 'Navigation Principale' : 'Main Navigation',
        content: language === 'fr'
          ? 'Utilisez ce menu pour naviguer entre les différentes sections de votre tableau de bord.'
          : 'Use this menu to navigate between different sections of your dashboard.',
        position: 'right',
        highlightType: 'outline',
        priority: 'high'
      },
      {
        id: 'language',
        target: '[data-testid="language-toggle"]',
        title: language === 'fr' ? 'Changement de Langue' : 'Language Switch',
        content: language === 'fr'
          ? 'Basculez facilement entre le français et l\'anglais selon vos préférences.'
          : 'Easily switch between French and English according to your preferences.',
        position: 'bottom',
        highlightType: 'spotlight',
        action: 'click',
        priority: 'medium'
      }
    ];

    const roleSpecificSteps: { [key: string]: TourStep[] } = {
      Parent: [
        {
          id: 'child-overview',
          target: '[data-testid="child-cards"]',
          title: language === 'fr' ? 'Aperçu de vos Enfants' : 'Your Children Overview',
          content: language === 'fr'
            ? 'Consultez rapidement les informations essentielles de chacun de vos enfants : notes, présence, devoirs.'
            : 'Quickly view essential information for each of your children: grades, attendance, homework.',
          position: 'top',
          highlightType: 'glow',
          priority: 'high'
        },
        {
          id: 'notifications',
          target: '[data-testid="notification-bell"]',
          title: language === 'fr' ? 'Notifications' : 'Notifications',
          content: language === 'fr'
            ? 'Recevez des alertes instantanées sur les notes, absences et événements importants.'
            : 'Receive instant alerts about grades, absences, and important events.',
          position: 'bottom',
          highlightType: 'spotlight',
          priority: 'high'
        },
        {
          id: 'communication',
          target: '[data-testid="messages-section"]',
          title: language === 'fr' ? 'Communication' : 'Communication',
          content: language === 'fr'
            ? 'Échangez directement avec les enseignants et l\'administration de l\'école.'
            : 'Communicate directly with teachers and school administration.',
          position: 'left',
          highlightType: 'outline',
          priority: 'medium'
        }
      ],
      Teacher: [
        {
          id: 'classes',
          target: '[data-testid="class-management"]',
          title: language === 'fr' ? 'Gestion des Classes' : 'Class Management',
          content: language === 'fr'
            ? 'Gérez vos classes, prenez les présences et suivez les progrès de vos élèves.'
            : 'Manage your classes, take attendance, and track your students\' progress.',
          position: 'top',
          highlightType: 'glow',
          priority: 'high'
        },
        {
          id: 'gradebook',
          target: '[data-testid="gradebook"]',
          title: language === 'fr' ? 'Carnet de Notes' : 'Gradebook',
          content: language === 'fr'
            ? 'Saisissez et suivez les notes de vos élèves avec des outils de statistiques avancés.'
            : 'Enter and track your students\' grades with advanced statistics tools.',
          position: 'right',
          highlightType: 'spotlight',
          priority: 'high'
        },
        {
          id: 'homework',
          target: '[data-testid="homework-assignments"]',
          title: language === 'fr' ? 'Devoirs' : 'Homework',
          content: language === 'fr'
            ? 'Créez et assignez des devoirs, suivez les soumissions et donnez des feedback.'
            : 'Create and assign homework, track submissions, and provide feedback.',
          position: 'bottom',
          highlightType: 'outline',
          priority: 'medium'
        }
      ],
      Student: [
        {
          id: 'dashboard',
          target: '[data-testid="student-dashboard"]',
          title: language === 'fr' ? 'Votre Tableau de Bord' : 'Your Dashboard',
          content: language === 'fr'
            ? 'Voici votre espace personnel avec vos notes, devoirs et emploi du temps.'
            : 'Here\'s your personal space with your grades, homework, and schedule.',
          position: 'top',
          highlightType: 'glow',
          priority: 'high'
        },
        {
          id: 'assignments',
          target: '[data-testid="pending-assignments"]',
          title: language === 'fr' ? 'Devoirs à Faire' : 'Pending Assignments',
          content: language === 'fr'
            ? 'Consultez vos devoirs en cours et leurs dates limites.'
            : 'Check your pending assignments and their due dates.',
          position: 'right',
          highlightType: 'spotlight',
          priority: 'high'
        },
        {
          id: 'grades',
          target: '[data-testid="recent-grades"]',
          title: language === 'fr' ? 'Mes Notes' : 'My Grades',
          content: language === 'fr'
            ? 'Suivez vos résultats scolaires et votre évolution dans chaque matière.'
            : 'Track your academic results and progress in each subject.',
          position: 'left',
          highlightType: 'outline',
          priority: 'medium'
        }
      ],
      SiteAdmin: [
        {
          id: 'admin-panel',
          target: '[data-testid="admin-controls"]',
          title: language === 'fr' ? 'Panneau Administrateur' : 'Admin Panel',
          content: language === 'fr'
            ? 'Gérez la plateforme, les utilisateurs et les paramètres système.'
            : 'Manage the platform, users, and system settings.',
          position: 'top',
          highlightType: 'glow',
          priority: 'high'
        },
        {
          id: 'analytics',
          target: '[data-testid="platform-analytics"]',
          title: language === 'fr' ? 'Analytiques' : 'Analytics',
          content: language === 'fr'
            ? 'Consultez les statistiques d\'utilisation et les performances de la plateforme.'
            : 'View usage statistics and platform performance metrics.',
          position: 'bottom',
          highlightType: 'spotlight',
          priority: 'high'
        }
      ],
      Commercial: [
        {
          id: 'schools',
          target: '[data-testid="school-portfolio"]',
          title: language === 'fr' ? 'Portfolio Écoles' : 'School Portfolio',
          content: language === 'fr'
            ? 'Gérez vos écoles partenaires et suivez leur utilisation de la plateforme.'
            : 'Manage your partner schools and track their platform usage.',
          position: 'top',
          highlightType: 'glow',
          priority: 'high'
        },
        {
          id: 'revenue',
          target: '[data-testid="revenue-tracking"]',
          title: language === 'fr' ? 'Suivi des Revenus' : 'Revenue Tracking',
          content: language === 'fr'
            ? 'Suivez vos commissions et performances commerciales.'
            : 'Track your commissions and commercial performance.',
          position: 'right',
          highlightType: 'spotlight',
          priority: 'medium'
        }
      ]
    };

    const userRole = user?.role || 'Student';
    const roleSteps = roleSpecificSteps[userRole] || [];
    
    return [...commonSteps, ...roleSteps];
  };

  useEffect(() => {
    if (isVisible) {
      const steps = getAllTourSteps();
      setTourSteps(steps);
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isVisible, user?.role, language]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < tourSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000);
    } else if (currentStep >= tourSteps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, tourSteps.length]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSkip = () => {
    onClose();
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsCompleted(false);
  };

  const getCurrentStepElement = () => {
    if (!tourSteps[currentStep]) return null;
    const target = tourSteps[currentStep].target;
    return document.querySelector(target);
  };

  const getTooltipPosition = () => {
    const element = getCurrentStepElement();
    if (!element) return { top: '50%', left: '50%' };

    const rect = element.getBoundingClientRect();
    const step = tourSteps[currentStep];
    
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - 20;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 20;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 20;
        break;
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  if (!isVisible || tourSteps.length === 0) return null;

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      data-testid="onboarding-overlay"
    >
      {/* Highlight Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {getCurrentStepElement() && (
          <div
            className={`absolute border-4 rounded-lg transition-all duration-300 ${
              currentStepData.highlightType === 'spotlight' ? 'border-yellow-400 shadow-xl shadow-yellow-400/50' :
              currentStepData.highlightType === 'glow' ? 'border-blue-400 shadow-xl shadow-blue-400/50' :
              'border-orange-400 shadow-lg shadow-orange-400/30'
            }`}
            style={{
              top: `${getCurrentStepElement()?.getBoundingClientRect().top}px`,
              left: `${getCurrentStepElement()?.getBoundingClientRect().left}px`,
              width: `${getCurrentStepElement()?.getBoundingClientRect().width}px`,
              height: `${getCurrentStepElement()?.getBoundingClientRect().height}px`,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <Card 
        className="absolute max-w-sm transform -translate-x-1/2 -translate-y-1/2 shadow-2xl border-2 border-orange-200 bg-white"
        style={getTooltipPosition()}
        data-testid="tour-tooltip"
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                {t.step} {currentStep + 1} {t.of} {tourSteps.length}
              </Badge>
              <Badge 
                variant={currentStepData.priority === 'high' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {currentStepData.priority}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
              data-testid="tour-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-orange-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentStepData.title || ''}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {currentStepData.content}
            </p>
            {currentStepData.action && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 {language === 'fr' ? 'Action suggérée:' : 'Suggested action:'} {
                    currentStepData.action === 'click' ? (language === 'fr' ? 'Cliquez ici' : 'Click here') :
                    currentStepData.action === 'hover' ? (language === 'fr' ? 'Survolez cette zone' : 'Hover over this area') :
                    (language === 'fr' ? 'Faites défiler' : 'Scroll here')
                  }
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                data-testid="tour-previous"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t.previous}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAutoPlay}
                className="text-blue-600 hover:text-blue-700"
                data-testid="tour-autoplay"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="text-gray-600 hover:text-gray-700"
                data-testid="tour-restart"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-700"
                data-testid="tour-skip"
              >
                {t.skip}
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white"
                data-testid="tour-next"
              >
                {currentStep === tourSteps.length - 1 ? t.finish : t.next}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Animation */}
      {isCompleted && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <Card className="p-8 text-center shadow-2xl border-2 border-green-200 bg-white">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              {language === 'fr' ? 'Félicitations !' : 'Congratulations!'}
            </h2>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Vous avez terminé la visite guidée !' 
                : 'You\'ve completed the guided tour!'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OnboardingTour;