import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, MessageSquare, BookOpen, CheckSquare, CreditCard, Calendar,
  Bell, MapPin, Settings, HelpCircle, Trophy, Heart, Info, X
} from 'lucide-react';
import { MobileCompactSearch, MobileInfoBubble, MobileOverlayInfo } from './MobileCompactSearch';
import DashboardNavbar from '@/components/shared/DashboardNavbar';

const MobileSmartphoneDemo: React.FC = () => {
  const { language } = useLanguage();
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const text = {
    fr: {
      title: 'Vue Smartphone',
      subtitle: 'Interface optimisée mobile',
      modules: {
        children: 'Enfants',
        messages: 'Messages',
        grades: 'Notes',
        attendance: 'Présence',
        payments: 'Paiements',
        calendar: 'Calendrier',
        notifications: 'Notifications',
        geolocation: 'Géoloc',
        achievements: 'Réussites',
        health: 'Santé',
        settings: 'Paramètres',
        help: 'Aide'
      },
      overlayTitles: {
        children: 'Gestion des Enfants',
        messages: 'Centre de Messages',
        grades: 'Suivi des Notes',
        info: 'Informations Détaillées'
      },
      overlayContent: {
        children: 'Interface compacte pour gérer vos enfants. Accès rapide aux informations essentielles avec superposition intelligente.',
        messages: 'Messages optimisés pour mobile avec bulles courtes et navigation tactile intuitive.',
        grades: 'Visualisation des notes avec interface smartphone-first. Scrolling fluide et informations superposées.'
      }
    },
    en: {
      title: 'Smartphone View',
      subtitle: 'Mobile-optimized interface',
      modules: {
        children: 'Children',
        messages: 'Messages',
        grades: 'Grades',
        attendance: 'Attendance',
        payments: 'Payments',
        calendar: 'Calendar',
        notifications: 'Alerts',
        geolocation: 'Location',
        achievements: 'Awards',
        health: 'Health',
        settings: 'Settings',
        help: 'Help'
      },
      overlayTitles: {
        children: 'Children Management',
        messages: 'Message Center',
        grades: 'Grade Tracking',
        info: 'Detailed Information'
      },
      overlayContent: {
        children: 'Compact interface for managing your children. Quick access to essential information with smart overlay.',
        messages: 'Mobile-optimized messages with short bubbles and intuitive touch navigation.',
        grades: 'Grade visualization with smartphone-first interface. Smooth scrolling and overlay information.'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    { id: 'children', icon: Users, color: 'bg-blue-500' },
    { id: 'messages', icon: MessageSquare, color: 'bg-purple-500' },
    { id: 'grades', icon: BookOpen, color: 'bg-green-500' },
    { id: 'attendance', icon: CheckSquare, color: 'bg-orange-500' },
    { id: 'payments', icon: CreditCard, color: 'bg-red-500' },
    { id: 'calendar', icon: Calendar, color: 'bg-indigo-500' },
    { id: 'notifications', icon: Bell, color: 'bg-yellow-500' },
    { id: 'geolocation', icon: MapPin, color: 'bg-pink-500' },
    { id: 'achievements', icon: Trophy, color: 'bg-cyan-500' },
    { id: 'health', icon: Heart, color: 'bg-rose-500' },
    { id: 'settings', icon: Settings, color: 'bg-gray-500' },
    { id: 'help', icon: HelpCircle, color: 'bg-teal-500' }
  ];

  const handleModuleClick = (moduleId: string) => {
    setActiveOverlay(moduleId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search:', query);
  };

  const handleFilter = () => {
    console.log('Filter clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardNavbar title={t.title || ''} subtitle={t.subtitle} />
      
      {/* Mobile-optimized header with compact search */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">3x4 Layout</h2>
          <MobileCompactSearch
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
            onSearch={handleSearch}
            onFilter={handleFilter}
          />
        </div>
      </div>
      
      {/* Ultra-compact grid - 3 columns on mobile */}
      <div className="max-w-7xl mx-auto px-2 py-3">
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
          {(Array.isArray(modules) ? modules : []).map((module, index) => {
            const IconComponent = module.icon;
            const title = t.modules[module.id as keyof typeof t.modules];
            
            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className="relative bg-white/90 backdrop-blur-sm rounded-lg p-2 mobile-shadow-subtle hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100/50 hover:border-blue-200 group min-h-[70px] touch-action-manipulation"
                style={{ animationDelay: `${index * 30}ms` }}
                data-testid={`module-${module.id}`}
              >
                {/* Compact layout */}
                <div className="flex flex-col items-center text-center space-y-1 h-full justify-center">
                  <div className={`w-7 h-7 ${module.color} rounded-lg flex items-center justify-center text-white shadow-sm transition-all duration-200 group-hover:scale-110`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="mobile-text-micro font-medium text-gray-700 leading-tight line-clamp-2 max-w-full break-words">
                    {title}
                  </span>
                </div>
                
                {/* Info bubble trigger */}
                <MobileInfoBubble
                  trigger={
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-2 h-2 text-white" />
                    </div>
                  }
                  position="top"
                >
                  <div className="text-xs">
                    <p className="font-medium mb-1">{title}</p>
                    <p className="text-gray-600">
                      {language === 'fr' 
                        ? `Module ${title} optimisé pour smartphone`
                        : `${title} module optimized for smartphone`
                      }
                    </p>
                  </div>
                </MobileInfoBubble>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Demonstration of overlay information system */}
      <div className="px-3 py-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            {language === 'fr' ? 'Optimisations Mobiles' : 'Mobile Optimizations'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {language === 'fr' ? '3 colonnes maximum sur smartphone' : 'Maximum 3 columns on smartphone'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {language === 'fr' ? 'Icônes compactes (28px) avec text micro' : 'Compact icons (28px) with micro text'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {language === 'fr' ? 'Recherche en superposition pour économiser l\'espace' : 'Overlay search to save space'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {language === 'fr' ? 'Bulles d\'info courtes et contextuelle' : 'Short contextual info bubbles'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay information system */}
      <MobileOverlayInfo
        isOpen={!!activeOverlay}
        onClose={() => setActiveOverlay(null)}
        title={activeOverlay ? t.overlayTitles[activeOverlay as keyof typeof t.overlayTitles] : ''}
      >
        {activeOverlay && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              {t.overlayContent[activeOverlay as keyof typeof t.overlayContent]}
            </p>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {language === 'fr' ? 'Fonctionnalités' : 'Features'}
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• {language === 'fr' ? 'Interface tactile optimisée' : 'Touch-optimized interface'}</li>
                <li>• {language === 'fr' ? 'Navigation simplifiée' : 'Simplified navigation'}</li>
                <li>• {language === 'fr' ? 'Informations superposées' : 'Overlay information'}</li>
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-500 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors">
                {language === 'fr' ? 'Accéder' : 'Access'}
              </button>
              <button 
                onClick={() => setActiveOverlay(null)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </MobileOverlayInfo>

      {/* Safe area for mobile */}
      <div className="h-20 sm:h-4" />
    </div>
  );
};

export default MobileSmartphoneDemo;