import React, { useEffect } from 'react';
import { CheckCircle, Star, UserPlus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrationToastProps {
  type: 'login' | 'signup';
  title: string;
  message: string;
  userRole?: string;
  onClose?: () => void;
  className?: string;
}

export function CelebrationToast({ 
  type, 
  title, 
  message, 
  userRole = '',
  onClose,
  className 
}: CelebrationToastProps) {
  useEffect(() => {
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      onClose?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    if (type === 'login') {
      return <LogIn className="h-6 w-6 text-white" />;
    }
    return <UserPlus className="h-6 w-6 text-white" />;
  };

  const getGradient = () => {
    if (type === 'login') {
      return 'bg-gradient-to-r from-green-500 to-emerald-600';
    }
    return 'bg-gradient-to-r from-orange-500 to-yellow-500';
  };

  const getAnimation = () => {
    if (type === 'signup') {
      return 'animate-bounce';
    }
    return 'animate-pulse';
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm rounded-lg shadow-2xl transform transition-all duration-500",
      "animate-in slide-in-from-right-full",
      getGradient(),
      className
    )}>
      <div className="p-4 text-white">
        <div className="flex items-start space-x-3">
          <div className={cn("flex-shrink-0", getAnimation())}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold">
              {title}
            </h4>
            <p className="text-sm opacity-90 mt-1">
              {message}
            </p>
            {userRole && (
              <p className="text-xs opacity-75 mt-1">
                Role: {userRole}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Star className="h-4 w-4 text-yellow-200 animate-spin" />
          </div>
        </div>
        
        {type === 'signup' && (
          <div className="mt-3 flex items-center justify-center space-x-1 text-xs opacity-90">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}
        
        {type === 'login' && (
          <div className="mt-3 text-center">
            <div className="text-xs opacity-90 animate-pulse">
              🎉 Redirecting to dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}