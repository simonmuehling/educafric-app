import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, Calendar, CheckSquare, BarChart3, BookOpen, FileText,
  MessageSquare, User, Clock, Settings, HelpCircle, MapPin,
  CreditCard, Bell, Trophy, Heart
} from 'lucide-react';
import { MobileDashboardLayout, MobileDashboardCard, MobileModuleView } from './MobileDashboardLayout';

interface MobileDashboardDemoProps {
  userRole?: 'teacher' | 'student' | 'parent' | 'director';
}

const MobileDashboardDemo: React.FC<MobileDashboardDemoProps> = ({ 
  userRole = 'parent' 
}) => {
  const { language } = useLanguage();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const text = {
    fr: {
      parent: {
        title: 'Tableau de Bord Parent',
        subtitle: 'Suivi complet de l\'éducation de vos enfants',
        children: 'Mes Enfants',
        messages: 'Messages',
        grades: 'Notes',
        attendance: 'Présences',
        payments: 'Paiements',
        calendar: 'Calendrier',
        notifications: 'Notifications',
        geolocation: 'Géolocalisation',
        help: 'Aide',
        settings: 'Paramètres',
        achievements: 'Réussites',
        health: 'Santé',
        backToDashboard: 'Retour au tableau de bord'
      },
      teacher: {
        title: 'Tableau de Bord Enseignant',
        subtitle: 'Gestion complète de vos classes et élèves',
        classes: 'Mes Classes',
        timetable: 'Emploi du temps',
        attendance: 'Présences',
        grades: 'Notes',
        assignments: 'Devoirs',
        content: 'Contenu',
        reports: 'Bulletins',
        communications: 'Communications',
        profile: 'Profil',
        help: 'Aide',
        backToDashboard: 'Retour au tableau de bord'
      }
    },
    en: {
      parent: {
        title: 'Parent Dashboard',
        subtitle: 'Complete educational monitoring for your children',
        children: 'My Children',
        messages: 'Messages',
        grades: 'Grades',
        attendance: 'Attendance',
        payments: 'Payments',
        calendar: 'Calendar',
        notifications: 'Notifications',
        geolocation: 'Geolocation',
        help: 'Help',
        settings: 'Settings',
        achievements: 'Achievements',
        health: 'Health',
        backToDashboard: 'Back to dashboard'
      },
      teacher: {
        title: 'Teacher Dashboard',
        subtitle: 'Complete management of your classes and students',
        classes: 'My Classes',
        timetable: 'Timetable',
        attendance: 'Attendance',
        grades: 'Grades',
        assignments: 'Assignments',
        content: 'Content',
        reports: 'Report Cards',
        communications: 'Communications',
        profile: 'Profile',
        help: 'Help',
        backToDashboard: 'Back to dashboard'
      }
    }
  };

  const t = text[language as keyof typeof text][userRole];

  const getModules = () => {
    if (userRole === 'parent') {
      return [
        {
          id: 'children',
          title: t.children,
          icon: <Users className="w-6 h-6" />,
          color: 'bg-blue-500'
        },
        {
          id: 'messages',
          title: t.messages,
          icon: <MessageSquare className="w-6 h-6" />,
          color: 'bg-purple-500'
        },
        {
          id: 'grades',
          title: t.grades,
          icon: <BookOpen className="w-6 h-6" />,
          color: 'bg-green-500'
        },
        {
          id: 'attendance',
          title: t.attendance,
          icon: <CheckSquare className="w-6 h-6" />,
          color: 'bg-orange-500'
        },
        {
          id: 'payments',
          title: t.payments,
          icon: <CreditCard className="w-6 h-6" />,
          color: 'bg-red-500'
        },
        {
          id: 'calendar',
          title: t.calendar,
          icon: <Calendar className="w-6 h-6" />,
          color: 'bg-indigo-500'
        },
        {
          id: 'notifications',
          title: t.notifications,
          icon: <Bell className="w-6 h-6" />,
          color: 'bg-yellow-500'
        },
        {
          id: 'geolocation',
          title: t.geolocation,
          icon: <MapPin className="w-6 h-6" />,
          color: 'bg-pink-500'
        },
        {
          id: 'achievements',
          title: t.achievements,
          icon: <Trophy className="w-6 h-6" />,
          color: 'bg-cyan-500'
        },
        {
          id: 'health',
          title: t.health,
          icon: <Heart className="w-6 h-6" />,
          color: 'bg-rose-500'
        },
        {
          id: 'settings',
          title: t.settings,
          icon: <Settings className="w-6 h-6" />,
          color: 'bg-gray-500'
        },
        {
          id: 'help',
          title: t.help,
          icon: <HelpCircle className="w-6 h-6" />,
          color: 'bg-teal-500'
        }
      ];
    }

    // Teacher modules
    return [
      {
        id: 'classes',
        title: t.classes,
        icon: <Users className="w-6 h-6" />,
        color: 'bg-blue-500'
      },
      {
        id: 'timetable',
        title: t.timetable,
        icon: <Clock className="w-6 h-6" />,
        color: 'bg-green-500'
      },
      {
        id: 'attendance',
        title: t.attendance,
        icon: <CheckSquare className="w-6 h-6" />,
        color: 'bg-orange-500'
      },
      {
        id: 'grades',
        title: t.grades,
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'bg-purple-500'
      },
      {
        id: 'assignments',
        title: t.assignments,
        icon: <FileText className="w-6 h-6" />,
        color: 'bg-red-500'
      },
      {
        id: 'content',
        title: t.content,
        icon: <BookOpen className="w-6 h-6" />,
        color: 'bg-indigo-500'
      },
      {
        id: 'reports',
        title: t.reports,
        icon: <FileText className="w-6 h-6" />,
        color: 'bg-yellow-500'
      },
      {
        id: 'communications',
        title: t.communications,
        icon: <MessageSquare className="w-6 h-6" />,
        color: 'bg-pink-500'
      },
      {
        id: 'profile',
        title: t.profile,
        icon: <User className="w-6 h-6" />,
        color: 'bg-gray-500'
      },
      {
        id: 'help',
        title: t.help,
        icon: <HelpCircle className="w-6 h-6" />,
        color: 'bg-teal-500'
      }
    ];
  };

  const modules = getModules();

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const handleBackClick = () => {
    setActiveModule(null);
  };

  const renderModuleContent = () => {
    const activeModuleData = modules.find(m => m.id === activeModule);
    if (!activeModuleData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {activeModuleData.title || ''}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === 'fr' 
              ? `Module ${activeModuleData.title || ''} - Interface mobile optimisée pour smartphone`
              : `${activeModuleData.title || ''} Module - Mobile-optimized interface for smartphones`
            }
          </p>
          
          {/* Demo content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2">
                {language === 'fr' ? 'Fonctionnalité 1' : 'Feature 1'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Interface tactile optimisée pour les écrans de smartphone'
                  : 'Touch-optimized interface for smartphone screens'
                }
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2">
                {language === 'fr' ? 'Fonctionnalité 2' : 'Feature 2'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Navigation simplifiée et buttons plus grands'
                  : 'Simplified navigation and larger buttons'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-specific features demonstration */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'fr' ? 'Optimisations Mobile' : 'Mobile Optimizations'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {language === 'fr' ? 'Espacement tactile optimisé (44px minimum)' : 'Touch-optimized spacing (44px minimum)'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {language === 'fr' ? 'Grille responsive adaptée aux smartphones' : 'Responsive grid adapted for smartphones'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {language === 'fr' ? 'Navigation simplifiée avec boutons plus grands' : 'Simplified navigation with larger buttons'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {language === 'fr' ? 'Texte tronqué pour éviter les débordements' : 'Text truncation to prevent overflow'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (activeModule) {
    const activeModuleData = modules.find(m => m.id === activeModule);
    return (
      <MobileModuleView
        title={activeModuleData?.title || ''}
        onBack={handleBackClick}
        backText={t.backToDashboard}
      >
        {renderModuleContent()}
      </MobileModuleView>
    );
  }

  return (
    <MobileDashboardLayout title={t.title || ''} subtitle={t.subtitle} columns={2}>
      {(Array.isArray(modules) ? modules : []).map((module) => (
        <MobileDashboardCard
          key={module.id}
          id={module.id}
          title={module.title || ''}
          icon={module.icon}
          color={module.color}
          onClick={() => handleModuleClick(module.id)}
        />
      ))}
    </MobileDashboardLayout>
  );
};

export default MobileDashboardDemo;