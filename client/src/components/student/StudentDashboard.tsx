import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, Calendar, FileText, MessageSquare, User, Clock, 
  BarChart3, Award, Target, HelpCircle, MapPin, Settings, Bell, Star, Heart, Video, GraduationCap, UtensilsCrossed, Bus
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: All modules loaded dynamically for ultra-fast loading
// SubscriptionStatusCard and NotificationCenter now loaded dynamically via fastModuleLoader

interface StudentDashboardProps {
  activeModule?: string;
}

const StudentDashboard = ({ activeModule }: StudentDashboardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);
  const { getModule, preloadModule } = useFastModules();
  const [criticalModulesReady, setCriticalModulesReady] = useState(false);
  const [apiDataPreloaded, setApiDataPreloaded] = useState(false);
  
  // PRELOADING DISABLED - Load on-demand for instant dashboard
  // Previously: 6 APIs + 4 modules = slow initial load
  React.useEffect(() => {
    setApiDataPreloaded(true);
    setCriticalModulesReady(true);
  }, []);
  
  // ULTRA-FAST module component creator - MODULE + API DATA PRELOADED
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['grades', 'assignments', 'attendance', 'messages'].includes(moduleName);
      
      if (isCritical && apiDataPreloaded) {
        console.log(`[STUDENT_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      } else {
        console.log(`[STUDENT_DASHBOARD] ⚡ ${moduleName} served INSTANTLY from cache`);
      }
      
      // Prepare props for specific modules that need them
      const moduleProps: any = {};
      
      // NotificationCenter needs userId and userRole
      if (moduleName === 'notifications' || moduleName === 'student.notifications') {
        moduleProps.userId = user?.id;
        moduleProps.userRole = user?.role;
      }
      
      return React.createElement(ModuleComponent, moduleProps);
    }
    
    // Module not loaded yet - load it
    console.log(`[STUDENT_DASHBOARD] 🔄 Loading module: ${moduleName}`);
    preloadModule(moduleName);
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-red-600 font-medium">
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
      bulletins: 'Bulletins',
      attendance: 'Présences',
      progress: 'Mon Progrès',
      messages: 'Messages',
      achievements: 'Réussites',
      onlineClasses: 'Cours en Ligne',
      profile: 'Profil',
      notifications: 'Notifications',
      settings: 'Paramètres',
      help: 'Aide',
      parentConnection: 'Trouver mes parents',
      canteen: 'Cantine',
      bus: 'Transport Scolaire',
      multirole: 'Multi-Rôles'
    },
    en: {
      title: 'Student Dashboard',
      subtitle: 'Your personal learning space',
      timetable: 'Timetable',
      grades: 'Grades',
      assignments: 'Assignments',
      bulletins: 'Report Cards',
      attendance: 'Attendance',
      progress: 'My Progress',
      messages: 'Messages',
      achievements: 'Achievements',
      onlineClasses: 'Online Classes',
      profile: 'Profile',
      notifications: 'Notifications',
      settings: 'Settings',
      help: 'Help',
      parentConnection: 'Find my parents',
      canteen: 'Canteen',
      bus: 'School Bus',
      multirole: 'Multi-Roles'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'student-my-school',
      label: language === 'fr' ? 'Mon École' : 'My School',
      icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-red-600'
    },
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'student-bulletins',
      label: t.bulletins,
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'student-library',
      label: language === 'fr' ? 'Bibliothèque' : 'Library',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'progress',
      label: t.progress,
      icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'canteen',
      label: t.canteen,
      icon: <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      id: 'bus',
      label: t.bus,
      icon: <Bus className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    {
      id: 'student-messages',
      label: t.messages,
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'student-online-classes',
      label: t.onlineClasses,
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'student-private-courses',
      label: language === 'fr' ? 'Mes Cours Privés' : 'My Private Courses',
      icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-indigo-600'
    },
    {
      id: 'parentConnection',
      label: t.parentConnection,
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-pink-600'
    },
    {
      id: 'achievements',
      label: t.achievements,
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'student-settings',
      label: language === 'fr' ? 'Paramètres Étudiant' : 'Student Settings',
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-teal-500'
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-slate-500'
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-600'
    },
    {
      id: 'student-geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'multirole',
      label: t.multirole,
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
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