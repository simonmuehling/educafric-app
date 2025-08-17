// 🌍 EDUCAFRIC LANGUAGE TOGGLE COMPONENT
// Following the perfect bilingual methodology with hierarchical translation support

import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  variant?: 'default' | 'minimal' | 'dropdown' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function LanguageToggle({ 
  variant = 'buttons', 
  size = 'md', 
  showIcon = false,
  className 
}: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleToggle = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  if (variant === 'minimal') {
    return (
      <Button
        onClick={handleToggle}
        variant="ghost"
        size="sm"
        className={cn(
          "text-gray-600 hover:text-gray-900 font-medium transition-colors",
          className
        )}
      >
        {showIcon && <Globe className="w-4 h-4 mr-1" />}
        {language.toUpperCase()}
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn("relative", className)}>
        <Button
          onClick={handleToggle}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          {showIcon && <Globe className="w-4 h-4" />}
          <span>{language === 'fr' ? 'Français' : 'English'}</span>
        </Button>
      </div>
    );
  }

  // Default 'buttons' variant - African educational platform style
  return (
    <div className={cn("flex items-center space-x-1 bg-white rounded-lg shadow-sm border p-1", className)}>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          sizeClasses[size],
          "rounded font-medium transition-all duration-200",
          language === 'en' 
            ? "bg-orange-500 text-white shadow-sm" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        {showIcon && <Globe className="w-3 h-3 mr-1 inline" />}
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={cn(
          sizeClasses[size],
          "rounded font-medium transition-all duration-200",
          language === 'fr' 
            ? "bg-orange-500 text-white shadow-sm" 
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
      >
        {showIcon && <Globe className="w-3 h-3 mr-1 inline" />}
        FR
      </button>
    </div>
  );
}

// 🎯 Mobile-optimized language toggle for responsive design
export function MobileLanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {/* Mobile-friendly touch targets */}
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[50px]",
          language === 'en' 
            ? "bg-orange-500 text-white shadow-md" 
            : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[50px]",
          language === 'fr' 
            ? "bg-orange-500 text-white shadow-md" 
            : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200"
        )}
      >
        FR
      </button>
    </div>
  );
}

// 🏫 African Educational Context Language Selector
export function EducationalLanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border p-2", className)}>
      <div className="text-xs text-gray-500 mb-2 text-center">
        {language === 'fr' ? 'Langue / Language' : 'Language / Langue'}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200",
            language === 'en' 
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
              : "text-gray-600 hover:bg-orange-50 border border-gray-200"
          )}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('fr')}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200",
            language === 'fr' 
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
              : "text-gray-600 hover:bg-orange-50 border border-gray-200"
          )}
        >
          Français
        </button>
      </div>
    </div>
  );
}