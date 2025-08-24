import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardNavbar from './DashboardNavbar';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useSmartPreloader } from '@/utils/smartPreloader';
import OptimizedModuleWrapper from '@/components/ui/OptimizedModuleWrapper';

interface IconModule {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  component: React.ReactNode;
}

interface UnifiedIconDashboardProps {
  title: string;
  subtitle: string;
  modules: IconModule[];
  activeModule?: string;
}

const UnifiedIconDashboard: React.FC<UnifiedIconDashboardProps> = ({
  title,
  subtitle,
  modules,
  activeModule: propActiveModule
}) => {
  const { language } = useLanguage();
  const [activeModule, setActiveModule] = useState<string | null>(propActiveModule || null);

  const text = {
    fr: {
      backToDashboard: 'Retour au tableau de bord'
    },
    en: {
      backToDashboard: 'Back to dashboard'
    }
  };

  const t = text[language as keyof typeof text];

  const { preloadModule, getModule, isReady } = useFastModules();
  const { setupHoverPreloading, predictivePreload, backgroundPreload } = useSmartPreloader();
  const moduleRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ⚡ ULTRA-FAST preload ALL modules instantly when dashboard opens  
  useEffect(() => {
    const preloadAllModules = async () => {
      const moduleIds = modules.map(m => m.id);
      console.log(`[UNIFIED_DASHBOARD] ⚡ Instant preloading ${moduleIds.length} modules`);
      
      // Preload ALL modules immediately in parallel - no delays
      const preloadPromises = moduleIds.map(id => preloadModule(id));
      const results = await Promise.allSettled(preloadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[UNIFIED_DASHBOARD] 🚀 ${successful}/${moduleIds.length} modules instantly ready`);

      // ✅ Setup intelligent hover preloading for remaining modules
      moduleIds.forEach(moduleId => {
        const element = moduleRefs.current.get(moduleId);
        if (element) {
          setupHoverPreloading(element, moduleId);
        }
      });
    };

    // Start preloading immediately without any delays
    preloadAllModules();
  }, [modules, preloadModule]);

  const handleModuleClick = async (moduleId: string) => {
    console.log(`[UNIFIED_DASHBOARD] ⚡ Switching to module: ${moduleId}`);
    
    // Check if module is already preloaded (should be instant)
    const preloadedComponent = getModule(moduleId);
    if (preloadedComponent) {
      console.log(`[UNIFIED_DASHBOARD] 🚀 Instant load: ${moduleId}`);
      setActiveModule(moduleId);
      return;
    }

    // Fallback: load module if not preloaded (should rarely happen)
    console.log(`[UNIFIED_DASHBOARD] 🔄 Fallback loading: ${moduleId}`);
    setActiveModule(moduleId); // Set immediately for instant UI response
    preloadModule(moduleId); // Load in background
  };

  // ✅ ENHANCED hover handling with predictive preloading
  const handleModuleHover = (moduleId: string) => {
    if (!isReady(moduleId)) {
      console.log(`[UNIFIED_DASHBOARD] 🎯 Smart hover preloading: ${moduleId}`);
      preloadModule(moduleId);
      
      // Predictive preloading based on user patterns
      const userRole = detectUserRole();
      predictivePreload(moduleId, userRole);
    }
  };

  // ✅ Detect user role for predictive preloading
  const detectUserRole = (): string => {
    if (title.toLowerCase().includes('parent')) return 'parent';
    if (title.toLowerCase().includes('teacher') || title.toLowerCase().includes('enseignant')) return 'teacher';
    if (title.toLowerCase().includes('student') || title.toLowerCase().includes('étudiant')) return 'student';
    if (title.toLowerCase().includes('director') || title.toLowerCase().includes('directeur')) return 'director';
    if (title.toLowerCase().includes('commercial')) return 'commercial';
    if (title.toLowerCase().includes('freelancer') || title.toLowerCase().includes('répétiteur')) return 'freelancer';
    return 'unknown';
  };

  const handleBackClick = () => {
    setActiveModule(null);
  };

  // Écouter les événements de changement de module
  useEffect(() => {
    const handleSwitchModule = (event: CustomEvent) => {
      const { moduleId } = event.detail;
      console.log(`[UNIFIED_DASHBOARD] 📡 Received switchModule event for: ${moduleId}`);
      
      // Vérifier si le module existe
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        console.log(`[UNIFIED_DASHBOARD] ✅ Switching to module: ${moduleId}`);
        setActiveModule(moduleId);
      } else {
        console.warn(`[UNIFIED_DASHBOARD] ❌ Module not found: ${moduleId}`);
        console.log(`[UNIFIED_DASHBOARD] Available modules:`, modules.map(m => m.id));
      }
    };

    window.addEventListener('switchModule', handleSwitchModule as EventListener);

    return () => {
      window.removeEventListener('switchModule', handleSwitchModule as EventListener);
    };
  }, [modules]);

  const renderIconGrid = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardNavbar 
        title={title} 
        subtitle={subtitle} 
        onTutorialClick={() => {
          // Signal to parent components to show tutorial
          if ((window as any).showTutorial) (window as any).showTutorial();
        }}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile-first compact grid - Max 3 items per row on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-5xl mx-auto" data-testid="main-navigation">
          {(Array.isArray(modules) ? modules : []).map((module, index) => (
            <div
              key={module.id}
              ref={(el) => {
                if (el) moduleRefs.current.set(module.id, el);
              }}
              onClick={() => handleModuleClick(module.id)}
              onMouseEnter={() => handleModuleHover(module.id)}
              className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100/50 hover:border-blue-200 group min-h-[80px] sm:min-h-[100px] touch-action-manipulation"
              style={{ animationDelay: `${index * 30}ms` }}
              data-testid={module.id === 'grades' ? 'student-grades' : module.id === 'assignments' ? 'student-homework' : `module-${module.id}`}
            >
              {/* Compact mobile layout */}
              <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2 h-full justify-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${module.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm transition-all duration-300 group-hover:scale-110`}>
                  <div className="scale-75 sm:scale-85 md:scale-100">
                    {module.icon}
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 leading-tight line-clamp-2 max-w-full break-words">
                  {module.label}
                </span>
              </div>
              
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleView = () => {
    const activeModuleData = modules.find(m => m.id === activeModule);
    if (!activeModuleData) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <DashboardNavbar 
          title={activeModuleData.label} 
          onTutorialClick={() => {
            // Signal to parent components to show tutorial
            if ((window as any).showTutorial) (window as any).showTutorial();
          }}
        />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Mobile-optimized back button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">{t.backToDashboard}</span>
            </button>
          </div>

          {/* Mobile-optimized module content container */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <OptimizedModuleWrapper moduleName={activeModule || undefined} className="animate-in fade-in-0 duration-300">
                {(() => {
                  // Si le module a un component défini, l'utiliser
                  if (activeModuleData.component) {
                    return activeModuleData.component;
                  }
                  
                  // Sinon, charger dynamiquement via fastModuleLoader
                  const DynamicComponent = getModule(activeModule || '');
                  if (DynamicComponent) {
                    return <DynamicComponent />;
                  }
                  
                  // Afficher un loading si le module n'est pas encore chargé
                  return (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Chargement du module...</span>
                    </div>
                  );
                })()}
              </OptimizedModuleWrapper>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return activeModule ? renderModuleView() : renderIconGrid();
};

export default UnifiedIconDashboard;