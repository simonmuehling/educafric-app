import React from 'react';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileErrorDisplayProps {
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  mobile?: boolean;
}

export const MobileErrorDisplay = ({
  message,
  type = 'error',
  onClose,
  className,
  showIcon = true,
  mobile = true
}: MobileErrorDisplayProps) => {
  const { language } = useLanguage();

  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info
  };

  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: 'text-red-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-500 dark:text-yellow-400'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      icon: 'text-green-500 dark:text-green-400'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      icon: 'text-blue-500 dark:text-blue-400'
    }
  };

  const IconComponent = icons[type];
  const styles = typeStyles[type];
  
  const closeText = language === 'fr' ? 'Fermer' : 'Close';

  return (
    <div
      className={cn(
        'border rounded-lg p-4 flex items-start space-x-3',
        mobile && 'mx-4 my-2',
        styles.container,
        className
      )}
      role="alert"
    >
      {showIcon && (
        <IconComponent 
          className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} 
          aria-hidden="true" 
        />
      )}
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium leading-5',
          mobile && 'text-base'
        )}>
          {message}
        </p>
      </div>
      
      {onClose && (
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn(
              'h-8 w-8 p-0 hover:bg-transparent',
              mobile && 'h-10 w-10 touch-target-44'
            )}
            aria-label={closeText}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized toast-like notification
export const MobileToast = ({
  message,
  type = 'info',
  onClose,
  autoClose = true,
  duration = 5000
}: {
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}) => {
  const { language } = useLanguage();

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:top-6 md:left-6 md:right-auto md:max-w-sm">
      <MobileErrorDisplay
        message={message}
        type={type}
        onClose={onClose}
        mobile={true}
        className="shadow-lg animate-slide-down"
      />
    </div>
  );
};