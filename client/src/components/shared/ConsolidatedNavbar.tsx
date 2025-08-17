import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Globe, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ConsolidatedNavbarProps {
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  userRole?: string;
}

const ConsolidatedNavbar: React.FC<ConsolidatedNavbarProps> = ({
  showBackButton = false,
  onBack,
  title,
  userRole
}) => {
  const { language, setLanguage } = useLanguage();
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLanguage);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      fr: {
        Director: 'Directeur',
        Teacher: 'Enseignant',
        Student: 'Élève',
        Parent: 'Parent',
        Freelancer: 'Répétiteur',
        Commercial: 'Commercial',
        Admin: 'Administrateur'
      },
      en: {
        Director: 'Director',
        Teacher: 'Teacher',
        Student: 'Student',
        Parent: 'Parent',
        Freelancer: 'Freelancer',
        Commercial: 'Commercial',
        Admin: 'Administrator'
      }
    };
    return roleNames[language]?.[role as keyof typeof roleNames.fr] || role;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors duration-200"
                title={language === 'fr' ? 'Retour' : 'Back'}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo with Home Button */}
            <button
              onClick={() => setLocation('/')}
              className="flex items-center hover:opacity-80 transition-opacity"
              title={language === 'fr' ? 'Accueil' : 'Home'}
            >
              <img 
                src="/assets/Edu_new (128 x 128 px)-2_1753244365562.png" 
                alt="Educafric Logo" 
                className="h-8 w-8 rounded-full"
                onError={(e) => {
                  // Fallback si logo non trouvé
                  const target = e.currentTarget as HTMLImageElement;
                  target?.style?.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback?.style?.display = 'flex';
                }}
              />
              <div 
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Educafric</span>
            </button>

            {/* Title */}
            {title && (
              <div className="hidden sm:block">
                <span className="text-gray-600 mx-2">•</span>
                <span className="text-lg font-medium text-gray-700">{title}</span>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span>{user.email || ''}</span>
                <span className="text-blue-600 font-medium">
                  ({getRoleDisplayName(userRole || user.role)})
                </span>
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title={language === 'fr' ? 'Switch to English' : 'Passer au français'}
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              title={language === 'fr' ? 'Se déconnecter' : 'Sign out'}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">
                {language === 'fr' ? 'Déconnexion' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ConsolidatedNavbar;