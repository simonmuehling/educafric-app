import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TUTORIAL_STORAGE_KEY = 'educafric_tutorial_completed';
const TUTORIAL_VERSION = '1.0';

interface TutorialState {
  isVisible: boolean;
  hasCompletedTutorial: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
}

export function useTutorial(): TutorialState {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);

  // Check if user has completed tutorial
  useEffect(() => {
    if (!user) {
      setHasCompletedTutorial(true);
      setIsVisible(false);
      return;
    }

    const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
    const completed = localStorage.getItem(storageKey);
    const hasCompleted = completed === 'true';
    
    setHasCompletedTutorial(hasCompleted);

    // Show tutorial for new users or those who haven't completed it
    if (!hasCompleted) {
      // Delay to allow dashboard to load first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const showTutorial = () => {
    setIsVisible(true);
  };

  const hideTutorial = () => {
    setIsVisible(false);
  };

  const completeTutorial = () => {
    if (user) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
    }
    setIsVisible(false);
  };

  const skipTutorial = () => {
    if (user) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
    }
    setIsVisible(false);
  };

  const resetTutorial = () => {
    if (user) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}_v${TUTORIAL_VERSION}`;
      localStorage.removeItem(storageKey);
      setHasCompletedTutorial(false);
    }
  };

  return {
    isVisible,
    hasCompletedTutorial,
    showTutorial,
    hideTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial
  };
}