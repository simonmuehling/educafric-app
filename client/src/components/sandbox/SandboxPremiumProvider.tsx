import React, { createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SandboxPremiumContextType {
  hasFullAccess: boolean;
  isPremiumFeature: (feature: string) => boolean;
  getUserPlan: () => string;
  isPremiumUnlocked: boolean;
  isEnhancedUser: boolean;
}

const SandboxPremiumContext = createContext<SandboxPremiumContextType | null>(null);

export const useSandboxPremium = () => {
  const context = useContext(SandboxPremiumContext);
  if (!context) {
    throw new Error('useSandboxPremium must be used within SandboxPremiumProvider');
  }
  return context;
};

interface SandboxPremiumProviderProps {
  children: React.ReactNode;
}

export const SandboxPremiumProvider: React.FC<SandboxPremiumProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Sandbox mode detection - comprehensive check
  const isSandboxUser = Boolean(
    (user as any)?.sandboxMode || 
    user?.email?.includes('sandbox.') ||
    user?.email?.includes('.demo@') ||
    user?.email?.includes('test.educafric.com') ||
    user?.role === 'SandboxUser' ||
    (typeof window !== 'undefined' && window.location?.pathname.includes('/sandbox'))
  );

  // Debug logging for sandbox detection
  if (user && import.meta.env.DEV) {
    console.log('🔬 Sandbox Detection:', {
      email: user.email,
      isSandboxUser,
      sandboxMode: (user as any)?.sandboxMode,
      emailCheck: {
        hasSandbox: user?.email?.includes('sandbox.'),
        hasDemo: user?.email?.includes('.demo@'),
        hasTest: user?.email?.includes('test?.educafric?.com')
      }
    });
  }

  // In sandbox mode, ALL users get FULL premium access to ALL features
  const hasFullAccess = isSandboxUser ? true : true; // SANDBOX: Always true for testing
  
  // For demonstration purposes: show premium overlays but allow instant access
  const _originalAccess = Boolean(
    (user as any)?.subscription === 'premium' ||
    (user as any)?.premiumFeatures ||
    isSandboxUser // Sandbox users get premium access
  );

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
  const isPremiumUnlocked = isSandboxUser ? true : hasFullAccess;

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
  };

  // Debug logging for final context values
  if (user && import.meta.env.DEV) {
    console.log('🎯 Sandbox Context Values:', {
      hasFullAccess,
      isPremiumUnlocked: value.isPremiumUnlocked,
      isEnhancedUser: value.isEnhancedUser,
      getUserPlan: getUserPlan(),
      isSandboxUser
    });
  }

  return (
    <SandboxPremiumContext.Provider value={value}>
      {children}
    </SandboxPremiumContext.Provider>
  );
};

export default SandboxPremiumProvider;