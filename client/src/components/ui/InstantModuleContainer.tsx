import React, { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { useModulePreloader } from '@/utils/modulePreloader';

interface InstantModuleContainerProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
  moduleName?: string;
  children?: React.ReactNode;
  onModuleLoad?: (moduleName: string) => void;
}

// Optimized container with instant module loading
const InstantModuleContainer = memo(function InstantModuleContainer({
  children,
  title,
  subtitle,
  icon,
  iconColor = 'from-blue-500 to-blue-600',
  className,
  moduleName,
  onModuleLoad
}: InstantModuleContainerProps) {
  const [isVisible, setIsVisible] = useState(true); // Start visible for instant loading
  const { predictivePreload } = useModulePreloader();

  useEffect(() => {
    // Delayed intersection observer for better performance
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && moduleName) {
            predictivePreload(moduleName);
            onModuleLoad?.(moduleName);
          }
        },
        { threshold: 0.2, rootMargin: '50px' }
      );

      const element = document.getElementById(`module-${title.replace(/\s+/g, '-').toLowerCase()}`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [title, moduleName, predictivePreload, onModuleLoad]);

  return (
    <div 
      id={`module-${title.replace(/\s+/g, '-').toLowerCase()}`}
      className={cn("space-y-6 transition-all duration-200", className)}
    >
      {/* Optimized Module Header */}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 bg-gradient-to-r rounded-lg shadow-sm", iconColor)}>
          <div className="w-6 h-6 text-white flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>
      
      {/* Instant Module Content */}
      <div className="space-y-6">
        {children || (
          <div className="h-24 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="w-5 h-5 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
});

export default InstantModuleContainer;