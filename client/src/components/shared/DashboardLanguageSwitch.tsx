import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DashboardLanguageSwitchProps {
  className?: string;
}

const DashboardLanguageSwitch = ({ className }: DashboardLanguageSwitchProps) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center space-x-1 bg-white rounded-lg shadow-sm border p-1", className)}>
      <Globe className="w-4 h-4 text-gray-500 mr-1" />
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2 py-1 text-xs rounded font-medium transition-all duration-200",
          language === 'en' 
            ? "bg-orange-500 text-white shadow-sm" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={cn(
          "px-2 py-1 text-xs rounded font-medium transition-all duration-200",
          language === 'fr' 
            ? "bg-orange-500 text-white shadow-sm" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        FR
      </button>
    </div>
  );
};

export default DashboardLanguageSwitch;