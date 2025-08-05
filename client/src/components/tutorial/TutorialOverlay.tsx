import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Play, BookOpen, Users, GraduationCap, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  target: string;
  title: { en: string; fr: string };
  content: { en: string; fr: string };
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
  action?: 'click' | 'hover' | 'focus';
}

interface TutorialOverlayProps {
  isVisible: boolean;
  userRole: string;
  onComplete: () => void;
  onSkip: () => void;
}

const getTutorialSteps = (userRole: string): TutorialStep[] => {
  const commonSteps: TutorialStep[] = [
    {
      id: 'welcome',
      target: '',
      title: { 
        en: 'Welcome to EDUCAFRIC!', 
        fr: 'Bienvenue sur EDUCAFRIC !' 
      },
      content: { 
        en: 'Let\'s take a quick tour of your educational platform. This will help you get started with the key features.',
        fr: 'Faisons un tour rapide de votre plateforme éducative. Cela vous aidera à découvrir les fonctionnalités clés.'
      },
      position: 'center',
      icon: <GraduationCap className="h-6 w-6" />
    },
    {
      id: 'dashboard',
      target: '[data-testid="dashboard-overview"]',
      title: { 
        en: 'Your Dashboard', 
        fr: 'Votre Tableau de Bord' 
      },
      content: { 
        en: 'This is your main dashboard where you can see an overview of all activities and quick access to important features.',
        fr: 'Voici votre tableau de bord principal où vous pouvez voir un aperçu de toutes les activités et un accès rapide aux fonctionnalités importantes.'
      },
      position: 'bottom',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      id: 'navigation',
      target: '[data-testid="main-navigation"]',
      title: { 
        en: 'Navigation Menu', 
        fr: 'Menu de Navigation' 
      },
      content: { 
        en: 'Use this navigation menu to access different sections of the platform. Each role has access to specific features.',
        fr: 'Utilisez ce menu de navigation pour accéder aux différentes sections de la plateforme. Chaque rôle a accès à des fonctionnalités spécifiques.'
      },
      position: 'right',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'notifications',
      target: '[data-testid="notifications-center"]',
      title: { 
        en: 'Notifications', 
        fr: 'Notifications' 
      },
      content: { 
        en: 'Stay updated with important notifications about grades, assignments, messages, and platform updates.',
        fr: 'Restez informé avec les notifications importantes sur les notes, devoirs, messages et mises à jour de la plateforme.'
      },
      position: 'bottom',
      icon: <Bell className="h-5 w-5" />
    },
    {
      id: 'profile',
      target: '[data-testid="user-profile"]',
      title: { 
        en: 'Your Profile', 
        fr: 'Votre Profil' 
      },
      content: { 
        en: 'Access your profile settings, update your information, and manage your account preferences.',
        fr: 'Accédez aux paramètres de votre profil, mettez à jour vos informations et gérez vos préférences de compte.'
      },
      position: 'left',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // Role-specific steps
  const roleSpecificSteps: Record<string, TutorialStep[]> = {
    Student: [
      {
        id: 'grades',
        target: '[data-testid="student-grades"]',
        title: { en: 'Your Grades', fr: 'Vos Notes' },
        content: { 
          en: 'View your grades, track your academic progress, and see detailed reports of your performance.',
          fr: 'Consultez vos notes, suivez votre progression académique et voyez des rapports détaillés de vos performances.'
        },
        position: 'top',
        icon: <GraduationCap className="h-5 w-5" />
      },
      {
        id: 'homework',
        target: '[data-testid="student-homework"]',
        title: { en: 'Assignments', fr: 'Devoirs' },
        content: { 
          en: 'Check your assignments, submit homework, and track deadlines to stay organized.',
          fr: 'Vérifiez vos devoirs, soumettez vos travaux et suivez les échéances pour rester organisé.'
        },
        position: 'top',
        icon: <BookOpen className="h-5 w-5" />
      }
    ],
    Teacher: [
      {
        id: 'classes',
        target: '[data-testid="teacher-classes"]',
        title: { en: 'Your Classes', fr: 'Vos Classes' },
        content: { 
          en: 'Manage your classes, view student lists, and access teaching tools for each class.',
          fr: 'Gérez vos classes, consultez les listes d\'élèves et accédez aux outils pédagogiques pour chaque classe.'
        },
        position: 'top',
        icon: <Users className="h-5 w-5" />
      },
      {
        id: 'grade-management',
        target: '[data-testid="teacher-grades"]',
        title: { en: 'Grade Management', fr: 'Gestion des Notes' },
        content: { 
          en: 'Enter and manage student grades, create assessments, and generate progress reports.',
          fr: 'Saisissez et gérez les notes des élèves, créez des évaluations et générez des rapports de progression.'
        },
        position: 'top',
        icon: <GraduationCap className="h-5 w-5" />
      }
    ],
    Parent: [
      {
        id: 'children',
        target: '[data-testid="parent-children"]',
        title: { en: 'Your Children', fr: 'Vos Enfants' },
        content: { 
          en: 'Monitor your children\'s academic progress, view grades, and communicate with teachers.',
          fr: 'Surveillez le progrès académique de vos enfants, consultez les notes et communiquez avec les enseignants.'
        },
        position: 'top',
        icon: <Users className="h-5 w-5" />
      },
      {
        id: 'communication',
        target: '[data-testid="parent-communication"]',
        title: { en: 'School Communication', fr: 'Communication École' },
        content: { 
          en: 'Stay connected with teachers and school administration through messages and notifications.',
          fr: 'Restez connecté avec les enseignants et l\'administration scolaire via des messages et notifications.'
        },
        position: 'top',
        icon: <Bell className="h-5 w-5" />
      }
    ]
  };

  return [...commonSteps, ...(roleSpecificSteps[userRole] || [])];
};

export function TutorialOverlay({ isVisible, userRole, onComplete, onSkip }: TutorialOverlayProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const steps = getTutorialSteps(userRole);

  useEffect(() => {
    if (!isVisible) return;

    const step = steps[currentStep];
    if (step?.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.classList.add('tutorial-highlight');
      }
    } else {
      setHighlightedElement(null);
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.style.zIndex = '';
        highlightedElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, isVisible, steps, highlightedElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const isWelcomeStep = currentStepData?.id === 'welcome';

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] tutorial-overlay">
        {/* Tutorial spotlight effect */}
        {highlightedElement && !isWelcomeStep && (
          <div 
            className="absolute border-4 border-blue-400 rounded-lg shadow-2xl pointer-events-none animate-pulse"
            style={{
              left: highlightedElement.offsetLeft - 8,
              top: highlightedElement.offsetTop - 8,
              width: highlightedElement.offsetWidth + 16,
              height: highlightedElement.offsetHeight + 16,
            }}
          />
        )}
      </div>

      {/* Tutorial card */}
      <div className={cn(
        "fixed z-[10000] transition-all duration-300 px-2 sm:px-0",
        isWelcomeStep 
          ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
          : "top-12 left-1/2 transform -translate-x-1/2 sm:top-4 sm:left-auto sm:right-4 sm:transform-none",
        isAnimating && "opacity-50 scale-95"
      )}>
        <Card className="tutorial-card w-64 sm:w-96 max-w-[85vw] sm:max-w-[90vw] shadow-2xl border-2 border-blue-200 bg-white backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-4 px-2 sm:px-6 py-2 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                  <div className="w-3 h-3 sm:w-5 sm:h-5">
                    {currentStepData?.icon}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xs sm:text-lg font-bold text-gray-900 truncate leading-tight">
                    {currentStepData?.title[language as 'en' | 'fr']}
                  </CardTitle>
                  <p className="text-[10px] sm:text-sm text-gray-500 leading-tight">
                    {language === 'fr' ? 'Étape' : 'Step'} {currentStep + 1}/{steps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0 p-0.5 sm:p-2"
                data-testid="tutorial-close"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2 sm:space-y-6 px-2 sm:px-6 pb-2 sm:pb-6">
            <p className="text-gray-700 leading-tight text-[10px] sm:text-sm">
              {currentStepData?.content[language as 'en' | 'fr']}
            </p>

            {/* Progress bar */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between text-[9px] sm:text-sm text-gray-500">
                <span>{language === 'fr' ? 'Progression' : 'Progress'}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 sm:h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 sm:h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-0.5 sm:gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="text-gray-600 text-[9px] sm:text-sm px-1 sm:px-3 py-0.5 sm:py-2 h-6 sm:h-auto"
                    data-testid="tutorial-previous"
                  >
                    <ChevronLeft className="h-2 w-2 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                    <span className="hidden sm:inline">{language === 'fr' ? 'Précédent' : 'Previous'}</span>
                    <span className="sm:hidden">{language === 'fr' ? 'Préc.' : 'Prev'}</span>
                  </Button>
                )}
              </div>

              <div className="flex gap-0.5 sm:gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 text-[9px] sm:text-sm px-1 sm:px-3 py-0.5 sm:py-2 h-6 sm:h-auto"
                  data-testid="tutorial-skip"
                >
                  <span className="hidden sm:inline">{language === 'fr' ? 'Passer le tutoriel' : 'Skip tutorial'}</span>
                  <span className="sm:hidden">{language === 'fr' ? 'Passer' : 'Skip'}</span>
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-[9px] sm:text-sm px-1 sm:px-3 py-0.5 sm:py-2 h-6 sm:h-auto"
                  data-testid="tutorial-next"
                >
                  {currentStep === steps.length - 1 
                    ? (language === 'fr' ? 'Terminer' : 'Finish')
                    : (language === 'fr' ? 'Suivant' : 'Next')
                  }
                  {currentStep < steps.length - 1 && <ChevronRight className="h-2 w-2 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}