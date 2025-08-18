import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedModuleWrapperProps {
  children: React.ReactNode;
  className?: string;
  moduleName?: string;
}

// Wrapper to prevent unnecessary re-renders of heavy modules
const OptimizedModuleWrapper = memo(function OptimizedModuleWrapper({
  children,
  className,
  moduleName
}: OptimizedModuleWrapperProps) {
  
  // Memoize the container to prevent layout shifts
  const containerClass = useMemo(() => 
    cn("space-y-6 transition-opacity duration-200", className),
    [className]
  );

  return (
    <div className={containerClass} data-module={moduleName}>
      {children}
    </div>
  );
});

export default OptimizedModuleWrapper;