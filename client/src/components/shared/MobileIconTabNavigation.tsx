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
    <div className={cn("block md:hidden", className)}>
      {/* Mobile: Icon Grid Navigation */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center gap-2 h-auto py-4 text-xs",
                activeTab === tab.value 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-white hover:bg-gray-100"
              )}
            >
              <IconComponent className="w-6 h-6" />
              <span className="font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileIconTabNavigation;