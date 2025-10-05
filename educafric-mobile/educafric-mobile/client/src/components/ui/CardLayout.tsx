import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Export all card components for backward compatibility
export { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick
}: StatsCardProps) {
  const cardContent = (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="w-8 h-8 text-orange-500">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center space-x-2">
            {trend && (
              <Badge 
                variant={trend.isPositive ? "default" : "destructive"}
                className="text-xs"
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Badge>
            )}
            {description && (
              <p className="text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return onClick ? (
    <div onClick={onClick} role="button" tabIndex={0}>
      {cardContent}
    </div>
  ) : cardContent;
}

interface MetricCardProps {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  className?: string;
  actions?: React.ReactNode;
}

export function MetricCard({
  title,
  metrics,
  className,
  actions
}: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(Array.isArray(metrics) ? metrics : []).map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {metric.label}
              </span>
              <span 
                className="text-sm font-semibold"
                style={metric.color ? { color: metric.color } : undefined}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoCardProps {
  title: string;
  description?: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function InfoCard({
  title,
  description,
  content,
  footer,
  className,
  variant = 'default'
}: InfoCardProps) {
  const cardClasses = {
    default: "",
    outlined: "border-2",
    elevated: "shadow-lg"
  };

  return (
    <Card className={cn(cardClasses[variant], className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6">
          {footer}
        </div>
      )}
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    disabled?: boolean;
  }>;
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon,
  actions,
  className
}: ActionCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start space-x-4">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-gray-600 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(actions) ? actions : []).map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CardGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}

export function CardGrid({
  children,
  cols = 3,
  gap = 6,
  className
}: CardGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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

interface ProgressCardProps {
  title: string;
  description?: string;
  progress: number; // 0-100
  progressText?: string;
  color?: string;
  className?: string;
}

export function ProgressCard({
  title,
  description,
  progress,
  progressText,
  color = '#f97316', // orange-500
  className
}: ProgressCardProps) {
  const { t } = useLanguage();
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {t('general.progress')}
            </span>
            <span className="text-sm font-semibold">
              {progressText || `${progress}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}