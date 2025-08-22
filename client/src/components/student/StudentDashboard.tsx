import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { 
  BookOpen, Calendar, FileText, MessageSquare, User, Clock, 
  BarChart3, Award, Target, HelpCircle, MapPin, Settings, Bell, Star, Heart
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Dynamic imports only - no static imports to enable fast loading

// import StudentAchievements from './modules/StudentAchievements';
import HelpCenter from '@/components/help/HelpCenter';
import StudentProfile from './modules/StudentProfile';
import NotificationCenter from '@/components/shared/NotificationCenter';
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';
import SubscriptionStatusCard from '@/components/shared/SubscriptionStatusCard';
// Dynamic components loaded via fastModuleLoader

interface StudentDashboardProps {
  activeModule?: string;
}

const StudentDashboard = ({ activeModule }: StudentDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);
  const { getModule, preloadModule } = useFastModules();
  
  // Dynamic module component creator (same as DirectorDashboard)
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      return React.createElement(ModuleComponent);
    }
    
    // Preload module if not cached
    React.useEffect(() => {
      preloadModule(moduleName);
    }, []);
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {language === 'fr' ? 'Chargement du module...' : 'Loading module...'}
          </p>
        </div>
      </div>
    );
  };

  // Stable event handlers that survive server restarts
  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 📅 Event received: switchToTimetable');
    setCurrentActiveModule('timetable');
  }, 'switchToTimetable');

  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 📊 Event received: switchToGrades');
    setCurrentActiveModule('grades');
  }, 'switchToGrades');

  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 💬 Event received: switchToMessages');
    setCurrentActiveModule('messages');
  }, 'switchToMessages');

  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 📋 Event received: switchToAttendance');
    setCurrentActiveModule('attendance');
  }, 'switchToAttendance');

  const text = {
    fr: {
      title: 'Tableau de Bord Étudiant',
      subtitle: 'Votre espace personnel d\'apprentissage',
      timetable: 'Emploi du temps',
      grades: 'Notes',
      assignments: 'Devoirs',
      notes: 'Mes Notes',
      attendance: 'Présences',
      library: 'Bibliothèque',
      messages: 'Messages',
      achievements: 'Réussites',
      profile: 'Profil',
      notifications: 'Notifications',
      settings: 'Paramètres',
      help: 'Aide',
      parentConnection: 'Trouver mes parents'
    },
    en: {
      title: 'Student Dashboard',
      subtitle: 'Your personal learning space',
      timetable: 'Timetable',
      grades: 'Grades',
      assignments: 'Assignments',
      notes: 'My Notes',
      attendance: 'Attendance',
      library: 'Library',
      messages: 'Messages',
      achievements: 'Achievements',
      profile: 'Profile',
      notifications: 'Notifications',
      settings: 'Settings',
      help: 'Help',
      parentConnection: 'Find my parents'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('timetable')
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createDynamicModule('grades')
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createDynamicModule('assignments')
    },
    {
      id: 'bulletins',
      label: t.notes,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('bulletins')
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: createDynamicModule('attendance')
    },
    {
      id: 'progress',
      label: t.library,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createDynamicModule('progress')
    },
    {
      id: 'messages',
      label: t.messages,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createDynamicModule('messages')
    },
    {
      id: 'parentConnection',
      label: t.parentConnection,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-pink-600',
      component: createDynamicModule('parentConnection')
    },
    {
      id: 'achievements',
      label: t.achievements,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <div className="p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Réussites</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-sm sm:text-base">Excellent Élève</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Moyenne générale de 17/20</p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
              <span className="font-medium text-sm sm:text-base">Participation Active</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">95% de présence</p>
          </div>
        </div>
      </div>
    },
    {
      id: 'profile',
      label: language === 'fr' ? 'Paramètres Étudiant' : 'Student Settings',
      icon: <User className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: <UnifiedProfileManager userType="student" showPhotoUpload={true} />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-slate-500',
      component: <HelpCenter userType="student" />
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: <NotificationCenter userRole="Student" userId={1} />
    },
    {
      id: 'geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Géolocalisation Parent</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Votre localisation est suivie par vos parents pour votre sécurité.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Statut:</span>
              <span className="text-sm font-medium text-green-600">Activé</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Zone actuelle:</span>
              <span className="text-sm font-medium">École</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Dernière mise à jour:</span>
              <span className="text-sm font-medium">Il y a 2 min</span>
            </div>
          </div>
        </div>
      </div>
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Student"
        onRoleSwitch={(role) => {
          console.log(`[STUDENT_DASHBOARD] 🔄 Role switch requested: ${role}`);
          if (role === 'Teacher') {
            window.location.href = '/teacher';
          } else if (role === 'Parent') {
            window.location.href = '/parent';
          }
        }} 
      />
    }
  ];

  return (
    <div data-testid="dashboard-overview">
      <UnifiedIconDashboard
        title={t.title || ''}
        subtitle={t.subtitle}
        modules={modules}
        activeModule={currentActiveModule || activeModule}
      />
    </div>
  );
};

export default StudentDashboard;