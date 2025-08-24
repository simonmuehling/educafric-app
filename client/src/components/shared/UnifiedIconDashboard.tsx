import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardNavbar from './DashboardNavbar';
import { OptimizedModuleWrapper } from '@/utils/consolidatedFastLoader';

export interface IconModule {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  component?: React.ReactNode;
  premium?: boolean;
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

  const handleModuleClick = (moduleId: string) => {
    console.log(`[UNIFIED_DASHBOARD] ⚡ Switching to module: ${moduleId}`);
    setActiveModule(moduleId);
  };

  const handleBackClick = () => {
    setActiveModule(null);
  };

  const renderIconGrid = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <DashboardNavbar 
          title={title} 
          onTutorialClick={() => {
            if ((window as any).showTutorial) (window as any).showTutorial();
          }}
        />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              {title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100 hover:border-gray-200 p-4 sm:p-6"
              >
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className={`${module.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <div className="text-white">
                      {module.icon}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base group-hover:text-blue-600 transition-colors duration-300">
                      {module.label}
                    </h3>
                  </div>
                </div>

                {module.premium && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    PRO
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModuleView = () => {
    const activeModuleData = modules.find(m => m.id === activeModule);
    if (!activeModuleData) return renderIconGrid();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <DashboardNavbar 
          title={activeModuleData.label} 
          onTutorialClick={() => {
            if ((window as any).showTutorial) (window as any).showTutorial();
          }}
        />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
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

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <OptimizedModuleWrapper moduleName={activeModule || undefined} className="animate-in fade-in-0 duration-300">
                {activeModuleData.component || (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading module...</span>
                  </div>
                )}
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