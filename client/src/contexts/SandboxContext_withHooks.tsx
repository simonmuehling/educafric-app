import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface SandboxContextType {
  isSandboxMode: boolean;
  isPremiumUnlocked: boolean;
  sandboxUser: string | null;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Check if user is in sandbox mode with enhanced detection
  const isSandboxMode = Boolean(
    user?.email?.includes('sandbox.demo@educafric.com') || 
    user?.email?.includes('sandbox.') ||
    user?.email?.includes('.demo@') ||
    user?.role === 'SandboxUser' ||
    (typeof window !== 'undefined' && window?.location?.pathname.includes('/sandbox'))
  );

  // In sandbox mode, all premium features are unlocked
  const isPremiumUnlocked = isSandboxMode;

  // Get sandbox user type
  const sandboxUser = user?.email?.includes('director.sandbox') ? 'director' :
                     user?.email?.includes('teacher.sandbox') ? 'teacher' :
                     user?.email?.includes('student.sandbox') ? 'student' :
                     user?.email?.includes('parent.sandbox') ? 'parent' :
                     user?.email?.includes('freelancer.sandbox') ? 'freelancer' :
                     null;

  return (
    <SandboxContext.Provider value={{
      isSandboxMode,
      isPremiumUnlocked,
      sandboxUser
    }}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  const context = useContext(SandboxContext);
  if (context === undefined) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
}