import React, { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ModernTabNavigation from '@/components/ui/ModernTabNavigation';
import { ModernDashboardLayout } from '@/components/ui/ModernDashboardLayout';

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface UserStat {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

interface UnifiedDashboardLayoutProps {
  title: string;
  subtitle: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userStats: UserStat[];
  children: ReactNode;
}

export const UnifiedDashboardLayout = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  userStats,
  children
}: UnifiedDashboardLayoutProps) => {
  return (
    <ModernDashboardLayout 
      title={title} 
      subtitle={subtitle}
      userStats={userStats}
    >
      <div className="space-y-6">
        {/* Unified Horizontal Tab Navigation */}
        <ModernTabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {/* Unified Content Container */}
        <div className="pb-20 min-h-screen h-screen overflow-y-auto">
          {children}
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default UnifiedDashboardLayout;