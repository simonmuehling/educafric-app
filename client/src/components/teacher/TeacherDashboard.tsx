import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Users, Calendar, CheckSquare, BarChart3, BookOpen, FileText,
  MessageSquare, User, Clock, Settings, HelpCircle, Bell, Star, Mail, UserX, Grid, PenTool, Video
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
// NotificationCenter, SubscriptionStatusCard, and UniversalMultiRoleSwitch now loaded dynamically via fastModuleLoader
import { TeacherMultiSchoolProvider } from '@/contexts/TeacherMultiSchoolContext';
import { CalendarExport } from '@/components/shared/CalendarExport';

interface TeacherDashboardProps {
  stats?: any;
  activeModule?: string;
}

const TeacherDashboard = ({ stats, activeModule }: TeacherDashboardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentActiveModule, setCurrentActiveModule] = useState<string>(activeModule || '');
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = useState(false);
  
  // AGGRESSIVE API DATA PRELOADING - Teacher APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadTeacherApiData = async () => {
      
      const apiEndpoints = [
        '/api/teacher/grades',
        '/api/teacher/classes',
        '/api/teacher/assignments',
        '/api/teacher/attendance',
        '/api/teacher/communications'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          await queryClient.prefetchQuery({
            queryKey: [endpoint],
            queryFn: async () => {
              const response = await fetch(endpoint, {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
          return true;
        } catch (error) {
          console.error(`[TEACHER_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
    };
    
    preloadTeacherApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules - Teacher specific
  React.useEffect(() => {
    const criticalModules = ['teacher-classes', 'teacher-attendance', 'teacher-assignments', 'teacher-communications', 'teacher-timetable', 'teacher-bulletins'];
    
    const forceLoadCriticalModules = async () => {
      console.log('[TEACHER_DASHBOARD] 🚀 FORCE LOADING critical modules...');
      
      const promises = criticalModules.map(async (moduleName) => {
        try {
          console.log(`[TEACHER_DASHBOARD] ⚡ Force loading ${moduleName}...`);
          await preloadModule(moduleName);
          console.log(`[TEACHER_DASHBOARD] ✅ ${moduleName} module ready!`);
          return true;
        } catch (error) {
          console.error(`[TEACHER_DASHBOARD] ❌ Failed to load ${moduleName}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      console.log('[TEACHER_DASHBOARD] 🎯 ALL CRITICAL MODULES PRELOADED - INSTANT ACCESS!');
    };
    
    forceLoadCriticalModules();
  }, [preloadModule]);
  
  // ULTRA-FAST module component creator - Fixed hook violation with DEBUG
  const createDynamicModule = React.useCallback((moduleName: string, fallbackComponent?: React.ReactNode) => {
    
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['grades', 'classes', 'assignments', 'attendance', 'communications'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[TEACHER_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      console.log(`[TEACHER_DASHBOARD] ✅ Successfully creating component for "${moduleName}"`);
      return React.createElement(ModuleComponent);
    }
    
    console.log(`[TEACHER_DASHBOARD] ❌ Module "${moduleName}" not found in cache, showing fallback`);
    
    // Try to load module immediately if not in cache
    preloadModule(moduleName).then((loadedComponent) => {
      if (loadedComponent) {
        console.log(`[TEACHER_DASHBOARD] ✅ Module "${moduleName}" loaded successfully, triggering re-render`);
        // Force re-render by updating state
        setCurrentActiveModule(prev => prev === moduleName ? moduleName + '_reload' : prev);
      } else {
        console.error(`[TEACHER_DASHBOARD] ❌ Failed to load module "${moduleName}"`);
      }
    }).catch((error) => {
      console.error(`[TEACHER_DASHBOARD] ❌ Error loading module "${moduleName}":`, error);
    });
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-blue-600">
            {apiDataPreloaded ? (language === 'fr' ? '⚡ Finalisation...' : '⚡ Finalizing...') : (language === 'fr' ? 'Chargement...' : 'Loading...')}
          </p>
          <p className="mt-1 text-xs text-gray-500">Module: {moduleName}</p>
        </div>
      </div>
    );
  }, [getModule, apiDataPreloaded, language, preloadModule]);

  // Preload non-critical modules on demand
  React.useEffect(() => {
    const nonCriticalModules = ['teacher-settings', 'help'];
    nonCriticalModules.forEach(moduleName => {
      console.log(`[TEACHER_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
      preloadModule(moduleName);
    });
  }, [preloadModule]);

  // Stable event handlers that survive server restarts
  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 📋 Event received: switchToAttendance');
    setCurrentActiveModule('attendance');
  }, 'switchToAttendance');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 📊 Event received: switchToGrades');
    setCurrentActiveModule('grades');
  }, 'switchToGrades');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 💬 Event received: switchToCommunications');
    setCurrentActiveModule('communications');
  }, 'switchToCommunications');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 👥 Event received: switchToClasses');
    setCurrentActiveModule('classes');
  }, 'switchToClasses');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 📅 Event received: switchToTimetable');
    setCurrentActiveModule('timetable');
  }, 'switchToTimetable');

  const text = {
    fr: {
      title: 'Tableau de Bord Enseignant',
      subtitle: 'Gestion complète de vos classes et élèves',
      classes: 'Mes Classes',
      timetable: 'Emploi du temps',
      attendance: 'Présences',
      // grades: 'Notes', - removed (unified bulletin system)
      assignments: 'Devoirs',
      content: 'Contenu Pédagogique',
      reports: 'Bulletins',
      communications: 'Communications',
      onlineClasses: 'Cours en Ligne',
      absenceDeclaration: 'Déclarer Absence',
      profile: 'Profil',
      multirole: 'Multi-Rôles',
      notifications: 'Notifications',
      help: 'Aide',
      calendarExport: 'Export Calendrier'
    },
    en: {
      title: 'Teacher Dashboard',
      subtitle: 'Complete management of your classes and students',
      classes: 'My Classes',
      timetable: 'Timetable',
      attendance: 'Attendance',
      grades: 'Grades',
      assignments: 'Assignments',
      content: 'Educational Content',
      reports: 'Report Cards',
      communications: 'Communications',
      onlineClasses: 'Online Classes',
      absenceDeclaration: 'Declare Absence',
      profile: 'Profile',
      notifications: 'Notifications',
      multirole: 'Multi-Roles',
      help: 'Help',
      calendarExport: 'Calendar Export'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'classes',
      label: t.classes,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('teacher-classes')
    },
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createDynamicModule('teacher-timetable')
    },
    {
      id: 'calendar-export',
      label: t.calendarExport,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: <CalendarExport userType="teacher" userId={user?.id} />
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createDynamicModule('teacher-attendance')
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: createDynamicModule('teacher-assignments')
    },
    {
      id: 'content',
      label: t.content,
      icon: <PenTool className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createDynamicModule('teacher-content')
    },
    {
      id: 'library',
      label: language === 'fr' ? 'Bibliothèque' : 'Library',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createDynamicModule('teacher-library')
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createDynamicModule('teacher-bulletins')
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('teacher-communications')
    },
    {
      id: 'online-classes',
      label: t.onlineClasses,
      icon: <Video className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('teacher-online-classes')
    },
    {
      id: 'absence-declaration',
      label: t.absenceDeclaration,
      icon: <UserX className="w-6 h-6" />,
      color: 'bg-orange-600',
      component: createDynamicModule('teacher-absence-declaration')
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: createDynamicModule('notifications')
    },
    {
      id: 'multirole',
      label: t.multirole,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('multirole')
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createDynamicModule('help')
    },
    {
      id: 'settings',
      label: language === 'fr' ? 'Paramètres' : 'Settings',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-600',
      component: createDynamicModule('teacher-settings')
    }
  ];

  return (
    <TeacherMultiSchoolProvider>
      <UnifiedIconDashboard
        title={t.title || ''}
        subtitle={t.subtitle}
        modules={modules}
        activeModule={currentActiveModule}
      />
    </TeacherMultiSchoolProvider>
  );
};

export default TeacherDashboard;