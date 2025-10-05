import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient?: string;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient = 'from-blue-50 to-blue-100',
  change,
  className
}: StatCardProps) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeSymbol = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase': return '+';
      case 'decrease': return '-';
      case 'neutral': return '';
      default: return '';
    }
  };

  const getIconColor = (gradient: string) => {
    if (gradient.includes('blue')) return 'text-blue-600';
    if (gradient.includes('green')) return 'text-green-600';
    if (gradient.includes('yellow')) return 'text-yellow-600';
    if (gradient.includes('purple')) return 'text-purple-600';
    if (gradient.includes('red')) return 'text-red-600';
    if (gradient.includes('orange')) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getTitleColor = (gradient: string) => {
    if (gradient.includes('blue')) return 'text-blue-600';
    if (gradient.includes('green')) return 'text-green-600';
    if (gradient.includes('yellow')) return 'text-yellow-600';
    if (gradient.includes('purple')) return 'text-purple-600';
    if (gradient.includes('red')) return 'text-red-600';
    if (gradient.includes('orange')) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getValueColor = (gradient: string) => {
    if (gradient.includes('blue')) return 'text-blue-900';
    if (gradient.includes('green')) return 'text-green-900';
    if (gradient.includes('yellow')) return 'text-yellow-900';
    if (gradient.includes('purple')) return 'text-purple-900';
    if (gradient.includes('red')) return 'text-red-900';
    if (gradient.includes('orange')) return 'text-orange-900';
    return 'text-blue-900';
  };

  return (
    <Card className={cn(`bg-gradient-to-r ${gradient}`, className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={cn("text-sm font-medium", getTitleColor(gradient))}>
              {title}
            </p>
            <p className={cn("text-2xl font-bold mt-1", getValueColor(gradient))}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className={cn("text-xs mt-1", getTitleColor(gradient))}>
                {subtitle}
              </p>
            )}
            {change && (
              <p className={cn("text-xs mt-1", getChangeColor(change.type))}>
                {getChangeSymbol(change.type)}{change.value}
                {change.type === 'increase' ? ' vs période précédente' : 
                 change.type === 'decrease' ? ' vs période précédente' : ''}
              </p>
            )}
          </div>
          <div className={cn("w-8 h-8 flex items-center justify-center", getIconColor(gradient))}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;