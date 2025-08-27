import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';

interface SandboxContextType {
  isSandboxMode: boolean;
  isPremiumUnlocked: boolean;
  sandboxUser: string | null;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function SandboxProvider({ children }: { children: ReactNode }) {
  // Use AuthContext directly instead of useAuth hook to avoid circular dependency
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // ✅ MISE À JOUR 2025: Détection sandbox améliorée avec sécurité renforcée
  const isSandboxMode = Boolean(
    (user as any)?.sandboxMode ||
    user?.email?.includes('@test.educafric.com') ||
    user?.email?.includes('sandbox.') ||
    user?.email?.includes('.demo@') ||
    user?.email?.includes('@educafric.demo') ||
    (typeof window !== 'undefined' && (
      window?.location?.pathname.includes('/sandbox') ||
      window?.location?.pathname.includes('/enhanced-sandbox')
    ))
  );

  // In sandbox mode, all premium features are unlocked
  const isPremiumUnlocked = isSandboxMode;

  // ✅ SANDBOX 2025: Types d'utilisateurs sandbox étendus
  const sandboxUser = user?.role?.toLowerCase() === 'director' ? 'director' :
                     user?.role?.toLowerCase() === 'teacher' ? 'teacher' :
                     user?.role?.toLowerCase() === 'student' ? 'student' :
                     user?.role?.toLowerCase() === 'parent' ? 'parent' :
                     user?.role?.toLowerCase() === 'freelancer' ? 'freelancer' :
                     user?.role?.toLowerCase() === 'commercial' ? 'commercial' :
                     user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'siteadmin' ? 'admin' :
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