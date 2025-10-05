import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  orientation = 'horizontal',
  className
}: TabNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (orientation === 'vertical') {
    return (
      <div className={cn("flex flex-col space-y-1", className)}>
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left",
              activeTab === tab.id
                ? "bg-orange-100 text-orange-700 border-l-2 border-orange-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Mobile dropdown for horizontal tabs
  const MobileTabDropdown = () => (
    <div className="md:hidden relative">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <div className="flex items-center space-x-2">
          {activeTabData?.icon && (
            <span className="w-4 h-4">{activeTabData.icon}</span>
          )}
          <span>{activeTabData?.label}</span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {(Array.isArray(tabs) ? tabs : []).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!tab.disabled) {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }
              }}
              disabled={tab.disabled}
              className={cn(
                "flex items-center space-x-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md",
                activeTab === tab.id && "bg-orange-50 text-orange-700",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Desktop horizontal tabs
  const DesktopTabs = () => {
    if (variant === 'pills') {
      return (
        <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(Array.isArray(tabs) ? tabs : []).map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-white text-orange-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      );
    }

    if (variant === 'underline') {
      return (
        <div className="hidden md:flex border-b border-gray-200">
          {(Array.isArray(tabs) ? tabs : []).map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      );
    }

    // Default variant
    return (
      <div className="hidden md:flex space-x-1">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.id
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <MobileTabDropdown />
      <DesktopTabs />
    </div>
  );
}

// Tab content wrapper component
interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ children, className }: TabContentProps) {
  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  );
}

// Add default export for compatibility
export default TabNavigation;
