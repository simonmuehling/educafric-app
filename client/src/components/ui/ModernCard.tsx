import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'minimal';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  children,
  className,
  headerContent,
  footer,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl transition-all',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all',
    minimal: 'bg-transparent border-none shadow-none'
  };

  return (
    <Card className={cn(
      variantClasses[variant],
      'rounded-xl overflow-hidden',
      className
    )}>
      {(title || subtitle || headerContent) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerContent}
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6 pt-0">
          {footer}
        </div>
      )}
    </Card>
  );
};

// Stats Card Component
interface ModernStatsCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  className?: string;
}

export const ModernStatsCard: React.FC<ModernStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  gradient = 'blue',
  className
}) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <Card className={cn(
      'bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1',
      gradientClasses[gradient],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-white mb-2">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-200' : 'text-red-200'
                )}>
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-white/20 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernCard;