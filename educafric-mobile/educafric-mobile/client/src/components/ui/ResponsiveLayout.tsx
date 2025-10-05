import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function ResponsiveLayout({ 
  children, 
  title, 
  subtitle, 
  className,
  maxWidth = 'xl'
}: ResponsiveLayoutProps) {
  const { language } = useLanguage();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      "w-full mx-auto px-4 sm:px-6 lg:px-8 min-h-screen",
      maxWidthClasses[maxWidth],
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-6 sm:mb-8">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="w-full pb-20">
        {children}
      </div>
    </div>
  );
}

interface GridLayoutProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}

export function GridLayout({ 
  children, 
  cols = 2, 
  gap = 6,
  className 
}: GridLayoutProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={cn(
      "grid",
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileContainer({ 
  children, 
  className,
  padding = 'md' 
}: MobileContainerProps) {
  const paddingClasses = {
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={cn(
      "w-full",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Add default export for compatibility  
export default ResponsiveLayout;
