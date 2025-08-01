import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
const logoImage = '/educafric-logo-128.png';

interface ModernFormWrapperProps {
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
  showBackground?: boolean;
}

export function ModernFormWrapper({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  showBackground = true
}: ModernFormWrapperProps) {
  const { language } = useLanguage();
  const formContent = (
    <Card className={cn(
      "relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden",
      className
    )}>
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
      
      {(title || subtitle || Icon) && (
        <CardHeader className="text-center relative z-10 space-y-6 pb-6">
          {Icon && (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                  <img 
                    src={logoImage} 
                    alt={language === 'fr' ? 'Logo Educafric' : 'Educafric Logo'} 
                    className="w-16 h-16 object-contain rounded-2xl"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-sm text-white font-bold">✨</span>
                </div>
              </div>
            </div>
          )}
          {title && (
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
              {title}
            </CardTitle>
          )}
          {subtitle && (
            <p className="text-white/90 text-base font-medium">
              {subtitle}
            </p>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-6 relative z-10">
        {children}
      </CardContent>
    </Card>
  );

  if (!showBackground) {
    return formContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-yellow-400/40 rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-32 left-32 w-5 h-5 bg-pink-400/40 rounded-full animate-bounce delay-1000"></div>

      {formContent}
    </div>
  );
}

// Modern form input styles to be used consistently
export const modernInputClasses = "bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all";
export const modernLabelClasses = "text-white/90 font-medium";
export const modernButtonClasses = "w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300";
export const modernErrorClasses = "bg-red-500/20 border border-red-300/30 rounded-2xl backdrop-blur-sm text-white";