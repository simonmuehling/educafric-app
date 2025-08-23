import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

interface SandboxPremiumContextType {
  hasFullAccess: boolean;
  isPremiumFeature: (feature: string) => boolean;
  getUserPlan: () => string;
  isPremiumUnlocked: boolean;
  isEnhancedUser: boolean;
  lastRefresh: Date;
  refreshSandbox: () => void;
}

const SandboxPremiumContext = createContext<SandboxPremiumContextType | null>(null);

// Fixed for Fast Refresh compatibility
const useSandboxPremiumHook = () => {
  const context = useContext(SandboxPremiumContext);
  if (!context) {
    throw new Error('useSandboxPremium must be used within SandboxPremiumProvider');
  }
  return context;
};

export const useSandboxPremium = useSandboxPremiumHook;

interface SandboxPremiumProviderProps {
  children: React.ReactNode;
}

export const SandboxPremiumProvider: React.FC<SandboxPremiumProviderProps> = ({ children }) => {
  // Use AuthContext directly to avoid circular dependency issues
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [contextKey, setContextKey] = useState(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const duplicateCheckRef = useRef<Set<string>>(new Set());

  // Sandbox mode detection - stable check without setState
  const isSandboxUser = Boolean(
    user && (
      (user as any)?.sandboxMode || 
      user?.email?.includes('sandbox.') ||
      user?.email?.includes('.demo@') ||
      user?.email?.includes('test.educafric.com') ||
      (typeof window !== 'undefined' && window.location?.pathname.includes('/sandbox'))
    )
  );

  // Autoscale refresh function to prevent duplications
  const refreshSandbox = () => {
    const now = new Date();
    setLastRefresh(now);
    setContextKey(prev => prev + 1);
    
    // Clear duplicate tracking
    duplicateCheckRef.current.clear();
    
    // Force component re-render to clear any stale data (with error handling)
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sandbox-refresh'));
      }
    } catch (error) {
      console.log('Sandbox refresh event failed (non-critical)');
    }
    
    console.log('🔄 Sandbox Autoscale: Refreshed at', now.toLocaleTimeString());
  };

  // Auto-refresh every 20 minutes to prevent duplications (less aggressive)
  useEffect(() => {
    if (isSandboxUser) {
      refreshIntervalRef.current = setInterval(() => {
        refreshSandbox();
      }, 20 * 60 * 1000); // 20 minutes - less aggressive

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [isSandboxUser]);

  // Prevent duplicate logging
  const logOnce = (key: string, logFn: () => void) => {
    if (!duplicateCheckRef.current.has(key)) {
      duplicateCheckRef.current.add(key);
      logFn();
    }
  };

  // Debug logging for sandbox detection (deduplicated)
  if (user && import.meta.env.DEV) {
    logOnce(`sandbox-detection-${user.id}`, () => {
      console.log('🔬 Sandbox Detection:', {
        email: user.email,
        isSandboxUser,
        emailCheck: {
          hasSandbox: user?.email?.includes('sandbox.'),
          hasDemo: user?.email?.includes('.demo@'),
          hasTest: user?.email?.includes('test.educafric.com')
        }
      });
    });
  }

  // Vérification authentique des abonnements pour les vrais clients
  const _originalAccess = Boolean(
    (user as any)?.subscription === 'premium' ||
    (user as any)?.premiumFeatures ||
    (user as any)?.isPremium ||
    false // Les vrais clients doivent avoir un abonnement valide
  );

  // Séparation claire : Sandbox users vs Real customers
  const hasFullAccess = isSandboxUser ? true : _originalAccess;

  const isPremiumFeature = (feature: string): boolean => {
    // In sandbox mode: Show premium features but allow testing
    if (isSandboxUser) {
      console.log(`🏖️ Sandbox Demo: Feature "${feature}" → Available for testing`);
      // Show premium UI but allow access for demonstration
      return false; 
    }
    
    // For regular users, apply normal premium logic
    const premiumFeatures = [
      'geolocation', 'payments', 'advanced_analytics', 'communication',
      'document_management', 'enhanced_reports', 'priority_support'
    ];
    
    return premiumFeatures.includes(feature) && !_originalAccess;
  };

  // Enhanced user detection (for backwards compatibility)
  const isEnhancedUser = Boolean(
    user?.role === 'SiteAdmin' || 
    user?.role === 'Admin' || 
    user?.role === 'Director' ||
    isSandboxUser
  );

  // Premium unlocked detection (for backwards compatibility)
  const isPremiumUnlocked = isSandboxUser ? true : _originalAccess;

  const getUserPlan = (): string => {
    if (!user) return 'free';
    
    if (isSandboxUser) {
      // Sandbox premium plans based on role
      switch (user.role) {
        case 'Parent':
          return 'Sandbox Premium Parent';
        case 'Teacher':
          return 'Sandbox Premium Teacher';
        case 'Student':
          return 'Sandbox Premium Student';
        case 'Freelancer':
          return 'Sandbox Premium Freelancer';
        case 'Director':
        case 'Admin':
          return 'Sandbox Premium School';
        case 'Commercial':
          return 'Sandbox Commercial CRM';
        case 'SiteAdmin':
          return 'Sandbox Site Administrator';
        default:
          return 'Sandbox Premium';
      }
    }
    
    // Regular user plans
    return (user as any)?.subscription || 'free';
  };

  // Final values for context
  const value: SandboxPremiumContextType = {
    hasFullAccess,
    isPremiumFeature,
    getUserPlan,
    isPremiumUnlocked: hasFullAccess,
    isEnhancedUser: isSandboxUser || Boolean(
      user?.role === 'SiteAdmin' || 
      user?.role === 'Admin' || 
      user?.role === 'Director'
    ),
    lastRefresh,
    refreshSandbox,
  };

  // Debug logging for final context values (deduplicated)
  if (user && import.meta.env.DEV) {
    logOnce(`sandbox-context-${user.id}-${contextKey}`, () => {
      console.log('🎯 Sandbox Context Values:', {
        hasFullAccess,
        isPremiumUnlocked: value.isPremiumUnlocked,
        isEnhancedUser: value.isEnhancedUser,
        getUserPlan: getUserPlan(),
        isSandboxUser
      });
    });
  }

  return (
    <SandboxPremiumContext.Provider key={contextKey} value={value}>
      {children}
    </SandboxPremiumContext.Provider>
  );
};

export default SandboxPremiumProvider;