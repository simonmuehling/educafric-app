import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleTutorialProps {
  isVisible: boolean;
  userRole: string;
  onClose: () => void;
}

export function SimpleTutorial({ isVisible, userRole, onClose }: SimpleTutorialProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible) return null;

  const steps = [
    {
      title: { 
        fr: '🎉 Bienvenue sur EDUCAFRIC !', 
        en: '🎉 Welcome to EDUCAFRIC!' 
      },
      content: { 
        fr: 'Découvrez la plateforme éducative la plus avancée d\'Afrique. Ce tutoriel vous guidera à travers les fonctionnalités principales.',
        en: 'Discover Africa\'s most advanced educational platform. This tutorial will guide you through the main features.'
      }
    },
    {
      title: { 
        fr: '🏠 Navigation Dashboard', 
        en: '🏠 Dashboard Navigation' 
      },
      content: { 
        fr: 'Utilisez les icônes colorées pour naviguer entre les différents modules. Chaque couleur représente une catégorie différente.',
        en: 'Use the colorful icons to navigate between different modules. Each color represents a different category.'
      }
    },
    {
      title: { 
        fr: '📱 Mobile Optimisé', 
        en: '📱 Mobile Optimized' 
      },
      content: { 
        fr: 'L\'interface s\'adapte parfaitement aux smartphones. Faites défiler horizontalement et verticalement selon vos besoins.',
        en: 'The interface adapts perfectly to smartphones. Scroll horizontally and vertically as needed.'
      }
    },
    {
      title: { 
        fr: '🌍 Multilingue', 
        en: '🌍 Multilingual' 
      },
      content: { 
        fr: 'Basculez entre français et anglais en cliquant sur l\'icône globe dans la barre de navigation.',
        en: 'Switch between French and English by clicking the globe icon in the navigation bar.'
      }
    },
    {
      title: { 
        fr: '✅ Prêt à commencer !', 
        en: '✅ Ready to start!' 
      },
      content: { 
        fr: 'Vous êtes maintenant prêt à explorer EDUCAFRIC. Cliquez sur n\'importe quel module pour commencer.',
        en: 'You are now ready to explore EDUCAFRIC. Click on any module to get started.'
      }
    }
  ];

  const currentStepData = steps[currentStep];
  const t = currentStepData.title[language as keyof typeof currentStepData.title];
  const content = currentStepData.content[language as keyof typeof currentStepData.content];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-2">
      <Card className="w-[95vw] sm:w-96 max-w-[95vw] shadow-2xl border-2 border-blue-200 bg-white">
        <CardHeader className="pb-2 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{currentStep + 1}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {t}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="px-3 py-2">
          <p className="text-xs text-gray-700 leading-relaxed mb-4">
            {content}
          </p>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs h-7 px-2"
            >
              <ArrowLeft className="h-3 w-3" />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </Button>

            <span className="text-xs text-gray-500 flex items-center">
              {currentStep + 1} / {steps.length}
            </span>

            <Button
              onClick={handleNext}
              size="sm"
              className="flex items-center gap-1 text-xs h-7 px-2 bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 
                ? (language === 'fr' ? 'Terminer' : 'Finish')
                : (language === 'fr' ? 'Suivant' : 'Next')
              }
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}