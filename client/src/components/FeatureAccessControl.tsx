import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import { useSandbox } from '@/contexts/SandboxContext';
import { useSandboxPremium } from '@/components/sandbox/SandboxPremiumProvider';
import PremiumFeatureBlock from './PremiumFeatureBlock';

interface FeatureAccessControlProps {
  feature: 'premium' | 'basic';
  requiredPlan?: string;
  children: React.ReactNode;
  featureName?: string;
  featureDescription?: string;
}

export default function FeatureAccessControl({
  feature,
  requiredPlan,
  children,
  featureName = '',
  featureDescription
}: FeatureAccessControlProps) {
  const { user } = useAuth();
  const { isPremiumUnlocked } = useSandboxPremium();

  // 🚀 SANDBOX BYPASS TOTAL - AUCUN BLOCAGE PREMIUM EN SANDBOX
  const isSandboxUser = Boolean(
    user?.email?.includes('sandbox') ||
    user?.email?.includes('.demo@') ||
    user?.email?.includes('test.educafric.com') ||
    user?.email?.endsWith('@test.educafric.com') ||
    user?.email?.includes('demo') ||
    (user as any)?.sandboxMode ||
    (user as any)?.premiumFeatures ||
    (user?.id && user.id >= 9000) || // Tous les IDs sandbox (9001-9006)
    isPremiumUnlocked ||
    window?.location?.hostname?.includes('sandbox') ||
    window?.location?.href?.includes('/sandbox')
  );

  // Check if user is school admin (Director, Admin)
  const isSchoolAdmin = user?.role === 'Admin' || user?.role === 'Director';
  
  // 🚀 SANDBOX ACCESS COMPLET - BYPASS TOTAL
  if (isSandboxUser) {
    return <>{children}</>;
  }

  // For school administrators, grant access to all modules (they need full school management)
  if (isSchoolAdmin) {
    return <>{children}</>;
  }

  // For basic features, always allow access
  if (feature === 'basic') {
    return <>{children}</>;
  }

  // For premium features with real users (non-sandbox), check subscription
  if (feature === 'premium') {
    // All non-sandbox/non-admin users see premium block
    return (
      <PremiumFeatureBlock
        feature={featureName}
        description={featureDescription}
        className="min-h-[400px]"
      />
    );
  }

  return <>{children}</>;
}