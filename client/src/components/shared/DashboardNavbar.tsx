import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Home, LogOut, Globe, HelpCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import NotificationCenter from '@/components/shared/NotificationCenter';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notification count to show red indicator only when needed
  const { data: notifications = [] } = useQuery({
    queryKey: ['/pwa/notifications/pending', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/pwa/notifications/pending/${user.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 10000 // Poll every 10 seconds
  });

  // Calculate unread notification count
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

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
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side: Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div onClick={handleHomeClick} className="cursor-pointer">
              <Logo size="sm" showText={false} />
            </div>
          </div>

          {/* Center: Title and subtitle - Mobile optimised */}
          {(title || subtitle) && (
            <div className="flex-1 text-center px-2 sm:px-4 min-w-0">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Right side: Actions - Mobile optimised */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Home Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              className="p-1 sm:p-2"
              data-testid="button-home"
            >
              <Home className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline ml-1 sm:ml-2 text-xs">{t.home}</span>
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageSwitch}
              className="p-1 sm:p-2"
              data-testid="button-language"
            >
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="hidden sm:inline ml-1 sm:ml-2 text-xs">{t.switchLanguage}</span>
            </Button>

            {/* Tutorial Button */}
            {onTutorialClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTutorialClick}
                className="p-1 sm:p-2"
                data-testid="button-tutorial"
              >
                <HelpCircle className="h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline ml-1 sm:ml-2 text-xs">{t.tutorial}</span>
              </Button>
            )}

            {/* PWA Notification Bell - NOW IN ALL DASHBOARDS! */}
            {user?.id && (
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-1 sm:p-2"
                    data-testid="button-notifications"
                  >
                    <Bell className="h-4 w-4 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[min(95vw,420px)] p-0 max-h-[85vh] overflow-auto sm:rounded-lg rounded-none" 
                  align="end"
                  data-testid="notifications-popover"
                >
                  <NotificationCenter
                    userId={user.id}
                    userRole={user.role as any}
                    className="border-0 shadow-none"
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-1 sm:p-2 text-red-600 hover:text-red-700"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1 sm:ml-2 text-xs">{t.logout}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;