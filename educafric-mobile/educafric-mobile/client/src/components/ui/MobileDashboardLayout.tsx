import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function MobileDashboardLayout({ 
  children, 
  title, 
  subtitle, 
  className,
  columns = 2
}: MobileDashboardLayoutProps) {
  const { language } = useLanguage();

  const columnClasses = {
    2: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    3: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6', 
    4: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
      className
    )}>
      {/* Mobile-optimized header */}
      {(title || subtitle) && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto">
            {title && (
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 text-center mt-1 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile-optimized content with superposition support */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 py-3 sm:py-4 md:py-6">
        <div className={cn(
          "grid gap-2 sm:gap-3 md:gap-4",
          columnClasses[columns],
          "mobile-overlay-stack"
        )}>
          {children}
        </div>
      </div>
      
      {/* Mobile safe area padding */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}

interface MobileDashboardCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  className?: string;
}

export function MobileDashboardCard({
  id,
  title,
  icon,
  color,
  onClick,
  className
}: MobileDashboardCardProps) {
  return (
    <div
      data-testid={`card-dashboard-${id}`}
      onClick={onClick}
      className={cn(
        "bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4",
        "mobile-shadow-subtle hover:shadow-md sm:hover:shadow-lg",
        "transform hover:scale-105 transition-all duration-200",
        "cursor-pointer border border-gray-100/50 hover:border-blue-200",
        "group min-h-[70px] sm:min-h-[85px] md:min-h-[100px]",
        "touch-action-manipulation relative",
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2 h-full justify-center">
        <div className={cn(
          "rounded-lg sm:rounded-xl flex items-center justify-center text-white",
          "shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-110",
          "w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12",
          color
        )}>
          <div className="scale-75 sm:scale-85 md:scale-100">
            {icon}
          </div>
        </div>
        <span 
          className="mobile-text-micro sm:text-xs md:text-sm font-medium text-gray-700 leading-tight line-clamp-2 max-w-full break-words px-0.5"
          data-testid={`text-card-title-${id}`}
        >
          {title}
        </span>
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  );
}

interface MobileModuleViewProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  backText?: string;
}

export function MobileModuleView({
  title,
  children,
  onBack,
  backText = "Retour"
}: MobileModuleViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Mobile-optimized header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          {onBack && (
            <button
              data-testid="button-back"
              onClick={onBack}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 text-sm sm:text-base mr-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium hidden sm:inline">{backText}</span>
            </button>
          )}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex-1 text-center sm:text-left">
            {title}
          </h1>
        </div>
      </div>
      
      {/* Mobile-optimized content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="w-full overflow-x-auto scroll-smooth-mobile">
            {children}
          </div>
        </div>
      </div>
      
      {/* Mobile safe area padding */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}