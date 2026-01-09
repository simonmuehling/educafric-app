import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardNavbar from './DashboardNavbar';
import { useFastModules } from '@/utils/fastModuleLoader';
import OptimizedModuleWrapper from '@/components/ui/OptimizedModuleWrapper';

interface IconModule {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  component?: React.ReactNode;
  skipPreload?: boolean;
  externalUrl?: string;
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
  
  // Initialize state synchronously, filtering out external modules to prevent blank renders
  const [internalActiveModule, setInternalActiveModule] = useState<string | null>(() => {
    if (!propActiveModule) return null;
    const module = modules.find(m => m.id === propActiveModule);
    // External modules should never be set as active - they open in new tab
    if (module?.externalUrl) return null;
    return propActiveModule;
  });
  
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when modules load
  const lastProcessedProp = React.useRef<string | null>(null);
  
  // Wrapped setter with logging
  const setActiveModule = (value: string | null) => {
    const stack = new Error().stack;
    console.log(`[UNIFIED_DASHBOARD] 🔧 setActiveModule called:`, {
      from: internalActiveModule,
      to: value,
      stack: stack?.split('\n').slice(2, 4).join('\n')
    });
    setInternalActiveModule(value);
  };
  
  const activeModule = internalActiveModule;

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

  // Handle external-only modules passed as activeModule prop
  // Tracks last processed prop to avoid infinite loops while allowing re-selection
  useEffect(() => {
    // Reset tracking when prop is cleared to allow re-selection
    if (!propActiveModule) {
      lastProcessedProp.current = null;
      return;
    }
    
    if (propActiveModule !== lastProcessedProp.current) {
      const module = modules.find(m => m.id === propActiveModule);
      if (module?.externalUrl) {
        console.log(`[UNIFIED_DASHBOARD] 🔗 External module via prop: ${propActiveModule}`);
        lastProcessedProp.current = propActiveModule;
        window.open(module.externalUrl, '_blank');
        // State already initialized to null in useState for external modules
      }
    }
  }, [propActiveModule, modules]);

  // Ultra-fast preload ALL modules instantly when dashboard opens  
  useEffect(() => {
    const preloadAllModules = async () => {
      // Filter out external-only modules that don't need React component preloading
      const moduleIds = modules.filter(m => !m.skipPreload).map(m => m.id);
      console.log(`[UNIFIED_DASHBOARD] ⚡ Instant preloading ${moduleIds.length} modules`);
      
      // Preload ALL modules immediately in parallel - no delays
      const preloadPromises = moduleIds.map(id => preloadModule(id));
      const results = await Promise.allSettled(preloadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[UNIFIED_DASHBOARD] 🚀 ${successful}/${moduleIds.length} modules instantly ready`);
    };

    // Start preloading immediately without any delays
    preloadAllModules();
  }, [modules, preloadModule]);

  const handleModuleClick = async (moduleId: string) => {
    console.log(`[UNIFIED_DASHBOARD] ⚡ Switching to module: ${moduleId}`);
    
    // Handle external link modules (documentation, guides, etc.)
    const module = modules.find(m => m.id === moduleId);
    if (module?.externalUrl) {
      console.log(`[UNIFIED_DASHBOARD] 🔗 Opening external document: ${moduleId}`);
      window.open(module.externalUrl, '_blank');
      return;
    }
    
    // Set active module immediately to show loading state
    setActiveModule(moduleId);
    
    // Check if module is already preloaded (should be instant)
    const preloadedComponent = getModule(moduleId);
    if (preloadedComponent) {
      console.log(`[UNIFIED_DASHBOARD] 🚀 Instant load: ${moduleId}`);
      return;
    }

    // Fallback: load module if not preloaded
    console.log(`[UNIFIED_DASHBOARD] 🔄 Loading module: ${moduleId}`);
    try {
      await preloadModule(moduleId);
      console.log(`[UNIFIED_DASHBOARD] ✅ Module ${moduleId} loaded, triggering render`);
      // Trigger re-render to show the loaded module
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error(`[UNIFIED_DASHBOARD] ❌ Failed to load module ${moduleId}:`, error);
    }
  };

  const handleModuleHover = (moduleId: string) => {
    // Skip preload for external-only modules
    const module = modules.find(m => m.id === moduleId);
    if (module?.skipPreload) return;
    
    if (!isReady(moduleId)) {
      preloadModule(moduleId);
    }
  };

  const handleBackClick = () => {
    console.log('[UNIFIED_DASHBOARD] ⬅️ Back button clicked - returning to icon grid');
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
        // Handle external-only modules (documentation links, etc.)
        if (module.externalUrl) {
          console.log(`[UNIFIED_DASHBOARD] 🔗 External module detected via event: ${moduleId}`);
          window.open(module.externalUrl, '_blank');
          return;
        }
        
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
    <div className="min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
      <DashboardNavbar 
        title={title} 
        subtitle={subtitle} 
        onTutorialClick={() => {
          // Signal to parent components to show tutorial
          if ((window as any).showTutorial) (window as any).showTutorial();
        }}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Modern title section */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A202C]">{title}</h1>
          {subtitle && <p className="text-sm text-[#90A3BF] mt-2">{subtitle}</p>}
        </div>

        {/* Mobile-first compact grid - Max 3 items per row on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto" data-testid="main-navigation">
          {(Array.isArray(modules) ? modules : []).map((module, index) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              onMouseEnter={() => handleModuleHover(module.id)}
              className="relative bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-[#7C5CFC]/20 group min-h-[90px] sm:min-h-[110px] touch-action-manipulation"
              style={{ animationDelay: `${index * 30}ms` }}
              data-testid={module.id === 'grades' ? 'student-grades' : module.id === 'assignments' ? 'student-homework' : `module-${module.id}`}
            >
              {/* Compact mobile layout */}
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 h-full justify-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${module.color}`}>
                  <div className="scale-85 sm:scale-90 md:scale-100 module-icon">
                    {module.icon}
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-[#1A202C] leading-tight line-clamp-2 max-w-full break-words group-hover:text-[#7C5CFC] transition-colors">
                  {module.label}
                </span>
              </div>
              
              {/* Modern gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC]/5 to-transparent rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleView = () => {
    const activeModuleData = modules.find(m => m.id === activeModule);
    if (!activeModuleData) return null;
    
    // External modules should never reach here - state initialization prevents it
    // If we do reach here, show visible error instead of silent blank
    if (activeModuleData.externalUrl) {
      console.error(`[UNIFIED_DASHBOARD] ❌ CRITICAL: External module bypassed state guard: ${activeModule}`);
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'fr' ? 'Erreur de Navigation' : 'Navigation Error'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'fr' 
                ? "Ce module devrait s'ouvrir dans un nouvel onglet. Veuillez réessayer."
                : 'This module should open in a new tab. Please try again.'}
            </p>
            <button
              onClick={handleBackClick}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t.backToDashboard}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F3F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
        <DashboardNavbar 
          title={activeModuleData.label} 
          onTutorialClick={() => {
            // Signal to parent components to show tutorial
            if ((window as any).showTutorial) (window as any).showTutorial();
          }}
        />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Mobile-optimized back button with modern styling */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-[#596780] hover:text-[#7C5CFC] border border-[#C3D4E9] hover:border-[#7C5CFC]/30 text-sm sm:text-base font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t.backToDashboard}</span>
            </button>
          </div>

          {/* Mobile-optimized module content container with modern styling */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 md:p-6 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <OptimizedModuleWrapper key={`${activeModule}-${forceUpdate}`} moduleName={activeModule || undefined} className="animate-in fade-in-0 duration-300">
                {(() => {
                  // Si le module a un component défini, l'utiliser (mais seulement si c'est un élément React valide)
                  if (activeModuleData.component) {
                    // Vérifier si c'est un élément React (JSX) 
                    if (React.isValidElement(activeModuleData.component)) {
                      return activeModuleData.component;
                    }
                    // Si c'est autre chose, traiter comme erreur
                    console.warn(`[UNIFIED_DASHBOARD] ⚠️ Invalid component for ${activeModule}:`, typeof activeModuleData.component);
                  }
                  
                  // Sinon, charger dynamiquement via fastModuleLoader
                  const DynamicComponent = getModule(activeModule || '');
                  if (DynamicComponent) {
                    return <DynamicComponent key={forceUpdate} />;
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