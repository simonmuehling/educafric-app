import React from 'react';
import { CheckCircle, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessNotificationProps {
  title: string;
  message: string;
  type?: 'login' | 'signup' | 'success';
  className?: string;
}

export function SuccessNotification({ 
  title, 
  message, 
  type = 'success',
  className 
}: SuccessNotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'login':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'signup':
        return <Star className="h-6 w-6 text-yellow-500" />;
      default:
        return <Sparkles className="h-6 w-6 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'login':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800';
      case 'signup':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20 dark:border-yellow-800';
      default:
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800';
    }
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm",
      "animate-in slide-in-from-right-full duration-300",
      getColors(),
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {message}
          </p>
        </div>
      </div>
      
      {type === 'signup' && (
        <div className="mt-3 flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
          <Sparkles className="h-3 w-3" />
          <span>Welcome to Educafric family!</span>
        </div>
      )}
      
      {type === 'login' && (
        <div className="mt-3 flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          <span>Redirecting to dashboard...</span>
        </div>
      )}
    </div>
  );
}