import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface ResponsiveTab {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ResponsiveTabsProps {
  tabs: ResponsiveTab[];
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTabsTriggerProps {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}

export const ResponsiveTabsTrigger: React.FC<ResponsiveTabsTriggerProps> = ({
  value,
  icon: Icon,
  label,
  className
}) => (
  <TabsTrigger 
    value={value} 
    className={cn(
      "flex items-center justify-center gap-2 min-h-[44px] px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all",
      "data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm",
      "data-[state=inactive]:text-[#596780] data-[state=inactive]:hover:text-[#7C5CFC]",
      className
    )}
    data-testid={`tab-${value}`}
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
    <span className="hidden sm:inline truncate">{label}</span>
  </TabsTrigger>
);

export const ResponsiveTabsList: React.FC<{
  tabs: ResponsiveTab[];
  className?: string;
  maxCols?: number;
}> = ({ tabs, className, maxCols = 6 }) => {
  const gridCols = Math.min(tabs.length, maxCols);
  
  return (
    <TabsList 
      className={cn(
        "w-full h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1",
        `grid grid-cols-${Math.min(tabs.length, 4)} sm:grid-cols-${Math.min(tabs.length, 5)} md:grid-cols-${gridCols}`,
        className
      )}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(tabs.length, 4)}, 1fr)`
      }}
    >
      {tabs.map((tab) => (
        <ResponsiveTabsTrigger
          key={tab.value}
          value={tab.value}
          icon={tab.icon}
          label={tab.label}
        />
      ))}
    </TabsList>
  );
};

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  value,
  onValueChange,
  children,
  className
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn("w-full", className)}>
      <ResponsiveTabsList tabs={tabs} />
      {children}
    </Tabs>
  );
};

export { TabsContent };
