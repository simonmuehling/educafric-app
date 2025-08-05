import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TutorialApi } from '@/services/tutorialApi';

const TUTORIAL_STORAGE_KEY = 'educafric_tutorial_completed';
const TUTORIAL_VERSION = '1.0';

interface TutorialState {
  isVisible: boolean;
  hasCompletedTutorial: boolean;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;
  completeTutorial: () => Promise<void>;
  skipTutorial: () => Promise<void>;
  resetTutorial: () => Promise<void>;
  updateProgress: (step: number, total: number) => Promise<void>;
}

export function useTutorial(): TutorialState {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check tutorial status from backend
  useEffect(() => {
    if (!user) {
      console.log('[TUTORIAL] No user found, hiding tutorial');
      setHasCompletedTutorial(true);
      setIsVisible(false);
      return;
    }

    console.log('[TUTORIAL] User found:', user.role, 'Checking tutorial status...');

    const checkTutorialStatus = async () => {
      try {
        setIsLoading(true);
        const status = await TutorialApi.getTutorialStatus(user.role, TUTORIAL_VERSION);
        
        setHasCompletedTutorial(status.hasCompleted);
        setCurrentStep(status.currentStep);
        setTotalSteps(status.totalSteps);

        // Show tutorial for new users or incomplete tutorial
        if (!status.hasCompleted && status.canRestart) {
          // Delay to allow dashboard to load first
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 1500);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('[TUTORIAL] Failed to get tutorial status:', error);
        // Fall back to localStorage if backend is unavailable
        const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
        const completed = localStorage.getItem(storageKey);
        const hasCompleted = completed === 'true';
        
        setHasCompletedTutorial(hasCompleted);
        if (!hasCompleted) {
          setTimeout(() => setIsVisible(true), 1500);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkTutorialStatus();
  }, [user]);

  const showTutorial = () => {
    console.log('[TUTORIAL] 🎯 Manual tutorial trigger - forcing tutorial to show');
    setIsVisible(true);
    setHasCompletedTutorial(false); // Allow manual restart
    setCurrentStep(0); // Reset to first step
    setTotalSteps(5); // Set reasonable total
  };

  const hideTutorial = () => {
    setIsVisible(false);
  };

  const updateProgress = async (step: number, total: number) => {
    if (!user) return;

    try {
      setCurrentStep(step);
      setTotalSteps(total);
      
      await TutorialApi.updateProgress({
        currentStep: step,
        totalSteps: total,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        sessionData: {
          timestamp: new Date().toISOString(),
          browserInfo: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        }
      });
    } catch (error) {
      console.error('[TUTORIAL] Failed to update progress:', error);
      // Fall back to localStorage
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_progress_v${TUTORIAL_VERSION}`;
      localStorage.setItem(storageKey, JSON.stringify({ step, total }));
    }
  };

  const completeTutorial = async () => {
    if (!user) return;

    try {
      await TutorialApi.completeTutorial({
        completionMethod: 'completed',
        finalStep: totalSteps,
        totalSteps,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        sessionData: {
          completedAt: new Date().toISOString(),
          duration: 'completed_naturally'
        }
      });
      
      setHasCompletedTutorial(true);
    } catch (error) {
      console.error('[TUTORIAL] Failed to complete tutorial:', error);
      // Fall back to localStorage
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
    }
    
    setIsVisible(false);
  };

  const skipTutorial = async () => {
    if (!user) return;

    try {
      await TutorialApi.completeTutorial({
        completionMethod: 'skipped',
        finalStep: currentStep,
        totalSteps,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        sessionData: {
          skippedAt: new Date().toISOString(),
          skippedAtStep: currentStep
        }
      });
      
      setHasCompletedTutorial(true);
    } catch (error) {
      console.error('[TUTORIAL] Failed to skip tutorial:', error);
      // Fall back to localStorage
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
    }
    
    setIsVisible(false);
  };

  const resetTutorial = async () => {
    if (!user) return;

    try {
      await TutorialApi.resetTutorial(user.role);
      setHasCompletedTutorial(false);
      setCurrentStep(0);
      setTotalSteps(0);
    } catch (error) {
      console.error('[TUTORIAL] Failed to reset tutorial:', error);
      // Fall back to localStorage
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
      localStorage.removeItem(storageKey);
      setHasCompletedTutorial(false);
    }
  };

  return {
    isVisible,
    hasCompletedTutorial,
    currentStep,
    totalSteps,
    isLoading,
    showTutorial,
    hideTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
    updateProgress
  };
}