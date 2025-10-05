import { useEffect, useState, useCallback } from 'react';
import { useSandboxPremium } from '@/components/sandbox/SandboxPremiumProvider';

interface SandboxAutoscaleHookReturn {
  lastRefresh: Date;
  timeSinceRefresh: number;
  refreshSandbox: () => void;
  isRefreshing: boolean;
  nextRefreshIn: number;
}

export const useSandboxAutoscale = (): SandboxAutoscaleHookReturn => {
  const { lastRefresh, refreshSandbox } = useSandboxPremium();
  const [timeSinceRefresh, setTimeSinceRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(300); // 5 minutes in seconds

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
      setTimeSinceRefresh(diffInSeconds);
      
      // Calculate time until next refresh (5 minutes)
      const remaining = Math.max(300 - diffInSeconds, 0);
      setNextRefreshIn(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  // Enhanced refresh function with loading state
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshSandbox();
    
    // Reset refreshing state after 2 seconds
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  }, [refreshSandbox]);

  // Listen for sandbox refresh events
  useEffect(() => {
    const handleSandboxRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 2000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sandbox-refresh', handleSandboxRefresh);
      return () => {
        window.removeEventListener('sandbox-refresh', handleSandboxRefresh);
      };
    }
  }, []);

  return {
    lastRefresh,
    timeSinceRefresh,
    refreshSandbox: handleRefresh,
    isRefreshing,
    nextRefreshIn,
  };
};