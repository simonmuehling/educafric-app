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

  // Check if user is sandbox user (all sandbox users have premium access)
  
  // Extended sandbox detection
  const isAnyDemo = Boolean(
    user?.email?.includes('demo') || 
    user?.email?.includes('test') ||
    user?.email?.includes('sandbox') ||
    (user as any)?.sandboxMode ||
    window?.location?.hostname.includes('sandbox') ||
    window?.location?.hostname.includes('test')
  );

  const isSandboxUser = Boolean(
    user?.email?.includes('demo@test?.educafric?.com') || 
    user?.email?.includes('sandbox.') || 
    user?.email?.includes('.demo@') ||
    user?.email?.includes('test?.educafric?.com') ||
    (user as any)?.sandboxMode ||
    isPremiumUnlocked
  );

  // Check if user is school admin (Director, Admin)
  const isSchoolAdmin = user?.role === 'Admin' || user?.role === 'Director';
  
  // For sandbox users, always grant access (no premium blocks)
  if (isSandboxUser || isAnyDemo) {
    console.log('🏖️ Sandbox Access Granted: Feature unlocked');
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