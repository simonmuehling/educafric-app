import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSandboxPremium } from '@/components/sandbox/SandboxPremiumProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useLocation } from 'wouter';

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
    user?.email?.includes('demo@test?.educafric?.com') || 
    user?.email?.includes('sandbox.') || 
    user?.email?.includes('.demo@') ||
    user?.email?.includes('test?.educafric?.com') ||
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
    <div className="relative">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.premiumFeature}</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          {moduleDescription || t.upgradeText}
        </p>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-2"
          onClick={() => {
            console.log(`[${moduleName.toUpperCase()}] Redirecting to subscription page for school plans`);
            navigate('/subscribe');
          }}
        >
          {t.upgradeNow}
        </Button>
      </div>
      
      {/* Background Content (blurred) */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default PremiumModuleWrapper;