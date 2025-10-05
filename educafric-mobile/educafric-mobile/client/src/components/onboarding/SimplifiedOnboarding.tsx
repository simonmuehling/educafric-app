import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  User, 
  Settings,
  Zap,
  X,
  Leaf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickSetupStep {
  id: string;
  title: string;
  description: string;
  action: string;
  actionUrl?: string;
  actionCallback?: () => void;
  isCompleted: boolean;
  isRequired: boolean;
  estimatedTime: string;
  icon: React.ReactNode;
}

interface SimplifiedOnboardingProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  variant?: 'first-time' | 'quick-setup';
}

export const SimplifiedOnboarding: React.FC<SimplifiedOnboardingProps> = ({
  isVisible,
  onClose,
  onComplete,
  variant = 'quick-setup'
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupSteps, setSetupSteps] = useState<QuickSetupStep[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const text = {
    fr: {
      title: 'Configuration Rapide - Style Klapp',
      subtitle: 'Configurons l\'essentiel en 3 minutes pour commencer immédiatement',
      environmental: 'Contribuez à sauver la planète avec le numérique',
      
      welcome: 'Bienvenue sur Educafric',
      quickSetup: 'Configuration Rapide',
      getStarted: 'Commencer',
      nextStep: 'Étape Suivante',
      complete: 'Terminer',
      skip: 'Ignorer',
      completed: 'Terminé',
      required: 'Requis',
      optional: 'Optionnel',
      estimatedTime: 'Temps estimé',
      
      steps: {
        profile: {
          title: 'Complétez votre Profil',
          description: 'Ajoutez vos informations essentielles',
          action: 'Compléter le Profil'
        },
        communication: {
          title: 'Configurez les Communications',
          description: 'Choisissez comment vous souhaitez être contacté',
          action: 'Configurer Notifications'
        },
        quickTour: {
          title: 'Aperçu Rapide des Fonctionnalités',
          description: 'Découvrez les 3 fonctions les plus importantes',
          action: 'Voir les Fonctions Clés'
        },
        ready: {
          title: 'Prêt à Utiliser Educafric',
          description: 'Tout est configuré, explorez votre tableau de bord',
          action: 'Accéder au Tableau de Bord'
        }
      },
      
      success: {
        title: 'Configuration Terminée !',
        message: 'Vous êtes prêt à utiliser Educafric. Commencez votre parcours éducatif dès maintenant.',
        environmental: 'En utilisant Educafric, vous contribuez à économiser du papier et protéger l\'environnement africain.',
        cta: 'Commencer l\'Exploration'
      }
    },
    
    en: {
      title: 'Quick Setup - Klapp Style',
      subtitle: 'Let\'s configure the essentials in 3 minutes to start immediately',
      environmental: 'Help save the planet with digital solutions',
      
      welcome: 'Welcome to Educafric',
      quickSetup: 'Quick Setup',
      getStarted: 'Get Started',
      nextStep: 'Next Step',
      complete: 'Complete',
      skip: 'Skip',
      completed: 'Completed',
      required: 'Required',
      optional: 'Optional',
      estimatedTime: 'Estimated time',
      
      steps: {
        profile: {
          title: 'Complete Your Profile',
          description: 'Add your essential information',
          action: 'Complete Profile'
        },
        communication: {
          title: 'Setup Communications',
          description: 'Choose how you want to be contacted',
          action: 'Configure Notifications'
        },
        quickTour: {
          title: 'Quick Feature Overview',
          description: 'Discover the 3 most important functions',
          action: 'See Key Features'
        },
        ready: {
          title: 'Ready to Use Educafric',
          description: 'Everything is configured, explore your dashboard',
          action: 'Access Dashboard'
        }
      },
      
      success: {
        title: 'Setup Complete!',
        message: 'You\'re ready to use Educafric. Start your educational journey now.',
        environmental: 'By using Educafric, you\'re helping save paper and protect the African environment.',
        cta: 'Start Exploring'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Klapp-style simplified setup steps based on user role
  const getQuickSetupSteps = (): QuickSetupStep[] => {
    const baseSteps: QuickSetupStep[] = [
      {
        id: 'profile',
        title: t.steps.profile.title,
        description: t.steps.profile.description,
        action: t.steps.profile.action,
        actionUrl: '/profile',
        isCompleted: false,
        isRequired: true,
        estimatedTime: '2 min',
        icon: <User className="w-5 h-5" />
      },
      {
        id: 'communication',
        title: t.steps.communication.title,
        description: t.steps.communication.description,
        action: t.steps.communication.action,
        actionCallback: () => showNotificationDemo(),
        isCompleted: false,
        isRequired: true,
        estimatedTime: '1 min',
        icon: <MessageSquare className="w-5 h-5" />
      },
      {
        id: 'quickTour',
        title: t.steps.quickTour.title,
        description: t.steps.quickTour.description,
        action: t.steps.quickTour.action,
        actionCallback: () => showQuickTour(),
        isCompleted: false,
        isRequired: false,
        estimatedTime: '30 sec',
        icon: <Sparkles className="w-5 h-5" />
      }
    ];

    return baseSteps;
  };

  const showNotificationDemo = () => {
    toast({
      title: language === 'fr' ? '🔔 Notifications Configurées' : '🔔 Notifications Configured',
      description: language === 'fr' 
        ? 'Vous recevrez des alertes pour les événements importants'
        : 'You\'ll receive alerts for important events'
    });
    markStepCompleted('communication');
  };

  const showQuickTour = () => {
    toast({
      title: language === 'fr' ? '✨ Aperçu des Fonctionnalités' : '✨ Features Overview',
      description: language === 'fr'
        ? 'Explorez le tableau de bord, les messages et les statistiques'
        : 'Explore dashboard, messages, and statistics'
    });
    markStepCompleted('quickTour');
  };

  const markStepCompleted = (stepId: string) => {
    setSetupSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, isCompleted: true } : step
      )
    );
  };

  const handleStepAction = (step: QuickSetupStep) => {
    if (step.actionCallback) {
      step.actionCallback();
    } else if (step.actionUrl) {
      // Navigate to the action URL
      window.location.href = step.actionUrl;
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    
    // Mark all required steps as completed
    setSetupSteps(steps => 
      steps.map(step => ({ ...step, isCompleted: true }))
    );
    
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2000);
  };

  const calculateProgress = () => {
    const completedSteps = setupSteps.filter(step => step.isCompleted).length;
    return (completedSteps / setupSteps.length) * 100;
  };

  const requiredStepsCompleted = () => {
    return setupSteps
      .filter(step => step.isRequired)
      .every(step => step.isCompleted);
  };

  useEffect(() => {
    if (isVisible) {
      setSetupSteps(getQuickSetupSteps());
    }
  }, [isVisible, language]);

  // ✅ HOOK BUG FIX: Move return after all hooks are declared  
  if (!isVisible) return null;

  const progress = calculateProgress();
  const canComplete = requiredStepsCompleted();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Zap className="w-8 h-8" />
                {t.title}
              </CardTitle>
              <p className="text-blue-100 mt-2 text-lg">{t.subtitle}</p>
              <div className="flex items-center gap-2 mt-2 text-green-100">
                <Leaf className="w-4 h-4" />
                <span className="text-sm">{t.environmental}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
              data-testid="simplified-onboarding-close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                {t.estimatedTime}: 3-5 min
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% {language === 'fr' ? 'terminé' : 'complete'}
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4 mb-8">
            {setupSteps.map((step, index) => (
              <Card 
                key={step.id}
                className={`transition-all duration-300 ${
                  step.isCompleted 
                    ? 'bg-green-50 border-green-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-full ${
                        step.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {step.isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            step.isCompleted ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h3>
                          <Badge 
                            variant={step.isRequired ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {step.isRequired ? t.required : t.optional}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {step.description}
                        </p>
                        <span className="text-xs text-gray-500">
                          {t.estimatedTime}: {step.estimatedTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {step.isCompleted ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          {t.completed}
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => handleStepAction(step)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid={`onboarding-step-${step.id}`}
                        >
                          {step.action}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
              data-testid="simplified-onboarding-skip"
            >
              {t.skip}
            </Button>

            <Button
              onClick={handleComplete}
              disabled={!canComplete || isCompleting}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8"
              data-testid="simplified-onboarding-complete"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === 'fr' ? 'Finalisation...' : 'Completing...'}
                </>
              ) : (
                <>
                  {t.complete}
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Environmental Impact Footer */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {t.success.environmental}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Success Modal */}
      {isCompleting && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/70 backdrop-blur-sm">
          <Card className="p-8 text-center shadow-2xl border-2 border-green-200 bg-white max-w-md">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-3">
              {t.success.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.success.message}
            </p>
            <Button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white w-full"
            >
              {t.success.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimplifiedOnboarding;