import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock } from 'lucide-react';

interface InactivityMonitorProps {
  warningTime?: number; // Time in minutes before showing warning
  logoutTime?: number;  // Time in minutes before auto logout
}

const InactivityMonitor: React.FC<InactivityMonitorProps> = ({ 
  warningTime = 25, // Show warning at 25 minutes
  logoutTime = 30   // Auto logout at 30 minutes
}) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const text = {
    fr: {
      warningTitle: 'Session inactive',
      warningMessage: 'Votre session va expirer dans',
      minutes: 'minutes',
      continueSession: 'Continuer la session',
      logout: 'Se déconnecter',
      sessionExpired: 'Session expirée',
      autoLogout: 'Vous avez été déconnecté automatiquement pour des raisons de sécurité.'
    },
    en: {
      warningTitle: 'Inactive session',
      warningMessage: 'Your session will expire in',
      minutes: 'minutes',
      continueSession: 'Continue session',
      logout: 'Logout',
      sessionExpired: 'Session expired',
      autoLogout: 'You have been automatically logged out for security reasons.'
    }
  };

  const t = text[language];

  const resetActivityTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();
    setIsActive(true);
    setShowWarning(false);

    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Debug uniquement en développement si nécessaire
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_INACTIVITY === 'true') {
      console.log('[INACTIVITY] Activity detected, resetting timers');
    }

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_INACTIVITY === 'true') {
        console.log('[INACTIVITY] ⚠️ Showing inactivity warning');
      }
      setShowWarning(true);
      setCountdown(logoutTime - warningTime);
      
      // Start countdown
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
      
    }, warningTime * 60 * 1000);

    // Set logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, logoutTime * 60 * 1000);

  }, [user, warningTime, logoutTime]);

  const handleAutoLogout = useCallback(async () => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_INACTIVITY === 'true') {
      console.log('[INACTIVITY] 🚪 Auto logout triggered');
    }
    setShowWarning(false);
    
    try {
      // Call backend force logout to destroy session
      await fetch('/api/auth/force-logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Then logout from frontend
      await logout();
      
      // Show session expired message with proper bilingual toast
      setTimeout(() => {
        toast({
          title: t.sessionExpired,
          description: t.autoLogout,
          variant: "destructive",
          duration: 5000,
        });
      }, 500);
      
    } catch (error) {
      console.error('[INACTIVITY] Logout error:', error);
      // Still try to logout even if API call fails
      await logout();
      // Show error message with proper bilingual toast
      toast({
        title: t.sessionExpired,
        description: t.autoLogout,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [logout, t.autoLogout, toast]);

  const handleContinueSession = useCallback(() => {
    console.log('[INACTIVITY] 🔄 User chose to continue session');
    setShowWarning(false);
    resetActivityTimer();
  }, [resetActivityTimer]);

  const handleManualLogout = useCallback(async () => {
    console.log('[INACTIVITY] 🚪 User chose manual logout');
    setShowWarning(false);
    await logout();
  }, [logout]);

  // Activity event listeners
  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const throttledResetTimer = (() => {
      let timeout: NodeJS.Timeout | null = null;
      return () => {
        if (timeout) return;
        timeout = setTimeout(() => {
          resetActivityTimer();
          timeout = null;
        }, 1000); // Throttle to once per second
      };
    })();

    events.forEach(event => {
      document.addEventListener(event, throttledResetTimer, true);
    });

    // Initial timer setup
    resetActivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledResetTimer, true);
      });
      
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [user, resetActivityTimer]);

  // Check session status with backend
  const checkSessionStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/auth/session-status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.log('[INACTIVITY] Session expired on server');
        handleAutoLogout();
        return;
      }
      
      const data = await response.json();
      console.log('[INACTIVITY] Server session status:', data);
      
      if (!data.active) {
        handleAutoLogout();
      } else if (data.timeRemaining <= 5) { // 5 minutes or less
        setShowWarning(true);
        setCountdown(data.timeRemaining);
      }
    } catch (error) {
      console.error('[INACTIVITY] Session status check failed:', error);
    }
  }, [user, handleAutoLogout]);

  // Page visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('[INACTIVITY] Page became visible, checking session status');
        checkSessionStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check session status every 5 minutes
    const statusInterval = setInterval(checkSessionStatus, 5 * 60 * 1000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(statusInterval);
    };
  }, [user, checkSessionStatus]);

  // ✅ HOOK BUG FIX: Move return after all hooks are declared  
  if (!user) return null;

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="max-w-md bg-white border border-orange-200">
        <DialogHeader className="bg-white">
          <DialogTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {t.warningTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 bg-white p-4">
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">
                {t.warningMessage}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {countdown} {t.minutes}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p>
              {language === 'fr' 
                ? 'Pour des raisons de sécurité, votre session sera fermée automatiquement après une période d\'inactivité.'
                : 'For security reasons, your session will be automatically closed after a period of inactivity.'
              }
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleContinueSession}
              data-testid="button-continue-session"
            >
              {t.continueSession}
            </Button>
            <Button 
              variant="outline"
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleManualLogout}
              data-testid="button-manual-logout"
            >
              {t.logout}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InactivityMonitor;