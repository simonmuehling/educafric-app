import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardNavbar from './DashboardNavbar';

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

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const handleBackClick = () => {
    setActiveModule(null);
  };

  const renderIconGrid = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardNavbar title={title} subtitle={subtitle} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile-first compact grid - Max 3 items per row on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 max-w-5xl mx-auto" data-testid="main-navigation">
          {(Array.isArray(modules) ? modules : []).map((module, index) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100/50 hover:border-blue-200 group min-h-[80px] sm:min-h-[100px] touch-action-manipulation"
              style={{ animationDelay: `${index * 50}ms` }}
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
        <DashboardNavbar title={activeModuleData.label} />
        
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
              {activeModuleData.component}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return activeModule ? renderModuleView() : renderIconGrid();
};

export default UnifiedIconDashboard;