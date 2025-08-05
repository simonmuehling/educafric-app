import React from 'react';
import { useLocation } from 'wouter';
import { Home, LogOut, Globe, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
// import { useTutorial } from '@/hooks/useTutorial';
import Logo from '@/components/Logo';

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
  // const { showTutorial } = useTutorial();

  const text = {
    fr: {
      home: 'Accueil',
      logout: 'Déconnexion',
      switchLanguage: 'English',
      tutorial: 'Tutoriel'
    },
    en: {
      home: 'Home',
      logout: 'Sign Out',
      switchLanguage: 'Français',
      tutorial: 'Tutorial'
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
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side: Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div onClick={handleHomeClick} className="cursor-pointer">
              <Logo size="sm" showText={false} />
            </div>
          </div>

          {/* Center: Title and subtitle - Mobile optimized */}
          {(title || subtitle) && (
            <div className="flex-1 text-center px-2 sm:px-4 min-w-0">
              {title && (
                <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Right side: Compact mobile actions */}
          <div className="flex items-center">
            {/* Mobile: Only essential buttons visible */}
            <div className="flex items-center space-x-1">
              {/* Tutorial Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[TUTORIAL] 🎯 Question mark icon clicked!');
                  onTutorialClick?.();
                }}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 p-0 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors duration-200"
                title={t.tutorial}
                data-testid="tutorial-help-button"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* Language Switch - Compact */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageSwitch}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 p-0 text-gray-600 hover:text-gray-900 rounded-full"
                title={t.switchLanguage}
              >
                <Globe className="w-4 h-4" />
              </Button>

              {/* Home - Icon only on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 p-0 text-gray-600 hover:text-gray-900 rounded-full"
                title={t.home}
              >
                <Home className="w-4 h-4" />
              </Button>

              {/* Logout - Icon only on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 p-0 text-red-600 hover:text-red-700 rounded-full"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* User info - Hidden on mobile, overlay on tablet+ */}
            {showUserInfo && user && (
              <div className="hidden md:flex items-center ml-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50" data-testid="user-profile">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900 truncate max-w-24">
                    {user.firstName || ''} {user.lastName || ''}
                  </p>
                  <p className="text-[10px] text-gray-500">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;