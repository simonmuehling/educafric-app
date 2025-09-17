import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Users, Calendar, CheckSquare, BarChart3, BookOpen, FileText,
  MessageSquare, User, Clock, Settings, HelpCircle, MapPin, Bell, Star, Mail, UserX, Grid
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
// NotificationCenter, SubscriptionStatusCard, and UniversalMultiRoleSwitch now loaded dynamically via fastModuleLoader
import { TeacherMultiSchoolProvider } from '@/contexts/TeacherMultiSchoolContext';

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
    const criticalModules = ['teacher-classes', 'teacher-attendance', 'teacher-grades', 'teacher-assignments', 'teacher-communications', 'teacher-timetable'];
    
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
      grades: 'Notes',
      assignments: 'Devoirs',
      content: 'Contenu Pédagogique',
      reports: 'Bulletins',
      communications: 'Communications',
      absenceDeclaration: 'Déclarer Absence',
      profile: 'Profil',
      multirole: 'Multi-Rôles',
      notifications: 'Notifications',
      help: 'Aide'
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
      absenceDeclaration: 'Declare Absence',
      profile: 'Profile',
      notifications: 'Notifications',
      multirole: 'Multi-Roles',
      help: 'Help'
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
      id: 'attendance',
      label: t.attendance,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createDynamicModule('teacher-attendance')
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('teacher-grades')
    },
    {
      id: 'gradebook',
      label: language === 'fr' ? 'Carnet de Notes' : 'Gradebook',
      icon: <Grid className="w-6 h-6" />,
      color: 'bg-indigo-600',
      component: createDynamicModule('teacher-gradebook')
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
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createDynamicModule('teacher-content')
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createDynamicModule('teacher-reports')
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('teacher-communications')
    },
    {
      id: 'absence-declaration',
      label: t.absenceDeclaration,
      icon: <UserX className="w-6 h-6" />,
      color: 'bg-orange-600',
      component: createDynamicModule('teacher-absence-declaration')
    },

    {
      id: 'geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <div className="p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Géolocalisation Élèves</h3>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Suivi de localisation de vos élèves pour leur sécurité.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium">Junior Kamga (6ème A)</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-fit">À l'école</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium">Marie Nkomo (5ème B)</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded w-fit">En route</span>
            </div>
          </div>
        </div>
      </div>
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