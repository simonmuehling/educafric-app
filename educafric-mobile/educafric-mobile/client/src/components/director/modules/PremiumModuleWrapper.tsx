import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSandboxPremium } from '@/components/sandbox/SandboxPremiumProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useLocation } from 'wouter';
import UnifiedPremiumGate from '@/components/shared/UnifiedPremiumGate';

interface PremiumModuleWrapperProps {
  children: React.ReactNode;
  moduleName: string;
  moduleDescription?: string;
}

export const PremiumModuleWrapper: React.FC<PremiumModuleWrapperProps> = ({
  children,
  moduleName,
  moduleDescription
}) => {
  const { user } = useAuth();
  const { isPremiumUnlocked } = useSandboxPremium();
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  // Check if user should have premium access
  const isSandboxUser = Boolean(
    user?.email?.includes('@test.educafric.com') || 
    user?.email?.includes('sandbox.') || 
    user?.email?.includes('.demo@') ||
    (user as any)?.sandboxMode ||
    isPremiumUnlocked
  );
  const isSchoolAdmin = user?.role === 'Admin' || user?.role === 'Director';
  // Global sandbox detection
  const isGlobalSandbox = Boolean(
    window?.location?.hostname.includes('sandbox') ||
    window?.location?.hostname.includes('test') ||
    localStorage.getItem('sandboxMode') === 'true' ||
    process?.env?.NODE_ENV === 'development'
  );
  const hasAccess = isSandboxUser || isSchoolAdmin;

  const text = {
    fr: {
      premiumFeature: 'Fonctionnalité Premium',
      upgradeRequired: 'Mise à niveau requise',
      upgradeText: `Cette fonctionnalité ${moduleName} nécessite un abonnement premium pour gérer votre établissement scolaire.`,
      upgradeNow: 'Mettre à Niveau Maintenant'
    },
    en: {
      premiumFeature: 'Premium Feature',
      upgradeRequired: 'Upgrade Required',
      upgradeText: `This ${moduleName} feature requires a premium subscription to manage your educational institution.`,
      upgradeNow: 'Upgrade Now'
    }
  };

  const t = text[language as keyof typeof text];

  // SANDBOX OVERRIDE: Always grant access in sandbox mode
  if (hasAccess || isSandboxUser || isGlobalSandbox) {
    return <>{children}</>;
  }

  // Premium block overlay for regular users only (non-sandbox)
  return (
    <UnifiedPremiumGate
      title={t.premiumFeature}
      description={moduleDescription || t.upgradeText}
    >
      {children}
    </UnifiedPremiumGate>
  );
};

export default PremiumModuleWrapper;