import React from 'react';
import { useLocation } from 'wouter';
import { Home, LogOut, Globe, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import UnifiedNotificationBell from '@/components/shared/UnifiedNotificationBell';

interface DashboardNavbarProps {
  title?: string;
  subtitle?: string;
  showUserInfo?: boolean;
  onTutorialClick?: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ 
  title, 
  subtitle, 
  showUserInfo = true,
  onTutorialClick 
}) => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const text = {
    fr: {
      home: 'Accueil',
      logout: 'Déconnexion',
      switchLanguage: 'English',
      tutorial: 'Tutoriel 2025'
    },
    en: {
      home: 'Home',
      logout: 'Sign Out',
      switchLanguage: 'Français',
      tutorial: 'Tutorial 2025'
    }
  };

  const t = text[language as keyof typeof text];

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLanguageSwitch = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="bg-white border-b border-[#F3F5F7] sticky top-0 z-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side: Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div onClick={handleHomeClick} className="cursor-pointer hover:opacity-80 transition-opacity">
              <Logo size="sm" showText={false} />
            </div>
          </div>

          {/* Center: Title and subtitle - Mobile optimised */}
          {(title || subtitle) && (
            <div className="flex-1 text-center px-2 sm:px-4 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-[#1A202C] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#90A3BF] truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Right side: Actions - Mobile optimised */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Home Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              className="p-2 rounded-full hover:bg-[#F3F5F7] transition-colors"
              data-testid="button-home"
            >
              <Home className="h-4 w-4 text-[#596780]" />
              <span className="hidden sm:inline ml-2 text-xs font-medium text-[#596780]">{t.home}</span>
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageSwitch}
              className="p-2 rounded-full hover:bg-[#F3F5F7] transition-colors"
              data-testid="button-language"
            >
              <Globe className="h-4 w-4 text-[#596780]" />
              <span className="hidden sm:inline ml-2 text-xs font-medium text-[#596780]">{t.switchLanguage}</span>
            </Button>

            {/* Tutorial Button */}
            {onTutorialClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTutorialClick}
                className="p-2 rounded-full hover:bg-[#F3F5F7] transition-colors"
                data-testid="button-tutorial"
              >
                <HelpCircle className="h-4 w-4 text-[#596780]" />
                <span className="hidden sm:inline ml-2 text-xs font-medium text-[#596780]">{t.tutorial}</span>
              </Button>
            )}

            {/* Unified Notification Bell */}
            <UnifiedNotificationBell iconSize={4} badgeSize="sm" />

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-xs font-medium">{t.logout}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;