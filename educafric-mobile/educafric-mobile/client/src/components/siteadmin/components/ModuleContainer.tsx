import React from 'react';
import { cn } from '@/lib/utils';

interface ModuleContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function ModuleContainer({
  children,
  title,
  subtitle,
  icon,
  iconColor = 'from-blue-500 to-blue-600',
  className
}: ModuleContainerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Normalized Module Header */}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 bg-gradient-to-r rounded-lg", iconColor)}>
          <div className="w-6 h-6 text-white flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
      
      {/* Module Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export default ModuleContainer;