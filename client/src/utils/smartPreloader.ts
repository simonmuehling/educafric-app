// ⚡ SMART PRELOADER - Préchargement ultra-intelligent au survol
// Charge les modules AVANT que l'utilisateur clique pour une vitesse instantanée

import { fastModuleLoader } from './fastModuleLoader';

class SmartPreloader {
  private hoverTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private preloadedOnHover: Set<string> = new Set();
  private readonly HOVER_DELAY = 200; // ms - Délai avant préchargement

  // ✅ Préchargement intelligent au survol d'icônes
  setupHoverPreloading(element: HTMLElement, moduleName: string) {
    if (!element || !moduleName) return;

    const handleMouseEnter = () => {
      // Précharger seulement si pas déjà fait
      if (this.preloadedOnHover.has(moduleName)) {
        console.log(`[SMART_PRELOADER] ⚡ ${moduleName} already preloaded on hover - INSTANT!`);
        return;
      }

      // Délai court pour éviter les préchargements accidentels
      const timeoutId = setTimeout(async () => {
        try {
          console.log(`[SMART_PRELOADER] 🎯 Hover detected - preloading ${moduleName}...`);
          
          const startTime = performance.now();
          await fastModuleLoader.preloadModule(moduleName);
          const endTime = performance.now();
          
          this.preloadedOnHover.add(moduleName);
          console.log(`[SMART_PRELOADER] ✅ ${moduleName} preloaded in ${Math.round(endTime - startTime)}ms - WILL BE INSTANT!`);
        } catch (error) {
          console.warn(`[SMART_PRELOADER] ⚠️ Failed to preload ${moduleName} on hover:`, error);
        }
      }, this.HOVER_DELAY);

      this.hoverTimeouts.set(moduleName, timeoutId);
    };

    const handleMouseLeave = () => {
      // Annuler le préchargement si l'utilisateur quitte rapidement
      const timeoutId = this.hoverTimeouts.get(moduleName);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.hoverTimeouts.delete(moduleName);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      const timeoutId = this.hoverTimeouts.get(moduleName);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.hoverTimeouts.delete(moduleName);
      }
    };
  }

  // ✅ Préchargement prédictif basé sur l'utilisation
  predictivePreload(currentModule: string, userRole: string) {
    const predictions = this.getPredictedModules(currentModule, userRole);
    
    predictions.forEach(async (moduleName) => {
      if (!this.preloadedOnHover.has(moduleName)) {
        try {
          console.log(`[SMART_PRELOADER] 🔮 Predictive preloading ${moduleName}...`);
          await fastModuleLoader.preloadModule(moduleName);
          this.preloadedOnHover.add(moduleName);
          console.log(`[SMART_PRELOADER] 🎯 ${moduleName} predictively preloaded!`);
        } catch (error) {
          console.warn(`[SMART_PRELOADER] Failed predictive preload of ${moduleName}:`, error);
        }
      }
    });
  }

  // ✅ Logique de prédiction basée sur les patterns d'usage
  private getPredictedModules(currentModule: string, userRole: string): string[] {
    const predictions: { [key: string]: { [key: string]: string[] } } = {
      'parent': {
        'children': ['parent-grades', 'parent-attendance', 'parent-messages'],
        'parent-grades': ['parent-attendance', 'children'],
        'parent-attendance': ['parent-grades', 'parent-messages'],
        'payments': ['subscription', 'help'],
        'geolocation': ['children', 'help']
      },
      'teacher': {
        'teacher-classes': ['teacher-attendance', 'teacher-grades'],
        'teacher-grades': ['teacher-assignments', 'teacher-classes'],
        'teacher-attendance': ['teacher-classes', 'teacher-grades'],
        'teacher-assignments': ['teacher-grades', 'teacher-content'],
        'teacher-communications': ['teacher-classes', 'help']
      },
      'student': {
        'grades': ['assignments', 'attendance'],
        'assignments': ['grades', 'timetable'],
        'attendance': ['grades', 'timetable'],
        'messages': ['assignments', 'help'],
        'timetable': ['assignments', 'attendance']
      },
      'director': {
        'overview': ['teachers', 'classes'],
        'teachers': ['classes', 'director-students'],
        'classes': ['teachers', 'director-attendance'],
        'director-students': ['classes', 'director-attendance'],
        'director-communications': ['teachers', 'help']
      }
    };

    return predictions[userRole]?.[currentModule] || [];
  }

  // ✅ Préchargement intelligent en arrière-plan
  backgroundPreload(modules: string[], priority: 'low' | 'medium' | 'high' = 'medium') {
    const delays = { low: 2000, medium: 1000, high: 500 };
    const delay = delays[priority];

    modules.forEach((moduleName, index) => {
      setTimeout(async () => {
        if (!this.preloadedOnHover.has(moduleName)) {
          try {
            console.log(`[SMART_PRELOADER] 🔄 Background preloading ${moduleName} (${priority} priority)...`);
            await fastModuleLoader.preloadModule(moduleName);
            this.preloadedOnHover.add(moduleName);
            console.log(`[SMART_PRELOADER] ✅ ${moduleName} background preloaded!`);
          } catch (error) {
            console.warn(`[SMART_PRELOADER] Background preload failed for ${moduleName}:`, error);
          }
        }
      }, delay + (index * 200)); // Étaler les chargements
    });
  }

  // ✅ Stats de performance
  getStats() {
    return {
      preloadedModules: this.preloadedOnHover.size,
      activeHoverTimeouts: this.hoverTimeouts.size,
      moduleList: Array.from(this.preloadedOnHover)
    };
  }

  // ✅ Cleanup
  cleanup() {
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.hoverTimeouts.clear();
    this.preloadedOnHover.clear();
    console.log('[SMART_PRELOADER] 🧹 Cleanup completed');
  }
}

// Instance singleton
export const smartPreloader = new SmartPreloader();

// Hook React pour l'utilisation facile
export const useSmartPreloader = () => {
  return {
    setupHoverPreloading: smartPreloader.setupHoverPreloading.bind(smartPreloader),
    predictivePreload: smartPreloader.predictivePreload.bind(smartPreloader),
    backgroundPreload: smartPreloader.backgroundPreload.bind(smartPreloader),
    getStats: smartPreloader.getStats.bind(smartPreloader)
  };
};