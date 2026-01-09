import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileIconTabProps {
  tabs: {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

const MobileIconTabNavigation: React.FC<MobileIconTabProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={cn("block font-['Plus_Jakarta_Sans',sans-serif]", className)}>
      {/* Navigation par onglets modernes - Grille adaptative */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-[#F3F5F7] rounded-xl">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <Button
              key={tab.value}
              variant="ghost"
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 h-auto py-3 px-2 text-xs rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-white text-[#7C5CFC] shadow-sm border-0" 
                  : "bg-transparent text-[#596780] hover:bg-white/60 hover:text-[#7C5CFC] border-0"
              )}
              data-testid={`button-tab-${tab.value}`}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? "bg-[#7C5CFC] text-white" 
                  : "bg-[#7C5CFC]/10 text-[#7C5CFC]"
              )}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="font-semibold text-[10px] sm:text-xs line-clamp-1 text-center">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileIconTabNavigation;