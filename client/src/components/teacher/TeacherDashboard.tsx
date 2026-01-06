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
import TeacherWorkModeToggle from './TeacherWorkModeToggle';

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
  
  // PRELOADING DISABLED - Load on-demand for instant dashboard
  // Previously: 5 APIs + 6 modules = slow initial load
  React.useEffect(() => {
    setApiDataPreloaded(true);
  }, []);
  
  // ULTRA-FAST module component creator - Fixed hook violation with DEBUG
  const createDynamicModule = React.useCallback((moduleName: string, fallbackComponent?: React.ReactNode) => {
    
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['grades', 'classes', 'assignments', 'attendance', 'communications'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[TEACHER_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      console.log(`[TEACHER_DASHBOARD] ✅ Successfully creating component for "${moduleName}"`);
      
      // Prepare props for specific modules that need them
      const moduleProps: any = {};
      
      // NotificationCenter needs userId and userRole
      if (moduleName === 'notifications' || moduleName === 'teacher.notifications') {
        moduleProps.userId = user?.id;
        moduleProps.userRole = user?.role;
      }
      
      return React.createElement(ModuleComponent, moduleProps);
    }
    
    console.log(`[TEACHER_DASHBOARD] ❌ Module "${moduleName}" not found in cache, loading...`);
    
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
            {language === 'fr' ? 'Chargement du module...' : 'Loading module...'}
          </p>
          <p className="mt-1 text-xs text-gray-500">{moduleName}</p>
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
      multirole: 'Changer de Rôle',
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
      onlineClasses: 'Online Classes',
      absenceDeclaration: 'Declare Absence',
      profile: 'Profile',
      notifications: 'Notifications',
      multirole: 'Switch Role',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  // Show independent courses module only if workMode is 'independent' or 'hybrid'
  const showIndependentCourses = user?.workMode === 'independent' || user?.workMode === 'hybrid';
  
  // Debug log to check workMode
  console.log('[TEACHER_DASHBOARD] User workMode:', user?.workMode, 'Show independent courses:', showIndependentCourses);
  
  // Current active context for hybrid teachers
  const [activeContext, setActiveContext] = useState<'school' | 'independent'>('school');
  
  const handleModeChange = (mode: 'school' | 'independent') => {
    setActiveContext(mode);
    // Could also update backend preference here if needed
  };

  const modules = [
    ...(showIndependentCourses ? [{
      id: 'teacher-independent-courses',
      label: language === 'fr' ? 'Mes Cours Privés' : 'My Private Courses',
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-500'
    }] : []),
    {
      id: 'teacher-classes',
      label: t.classes,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'teacher-timetable',
      label: t.timetable,
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'teacher-attendance',
      label: t.attendance,
      icon: <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'teacher-assignments',
      label: t.assignments,
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'teacher-content',
      label: t.content,
      icon: <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'teacher-library',
      label: language === 'fr' ? 'Bibliothèque' : 'Library',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'teacher-bulletins',
      label: t.reports,
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'teacher-communications',
      label: t.communications,
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'teacher-online-classes',
      label: t.onlineClasses,
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'teacher-absence-declaration',
      label: t.absenceDeclaration,
      icon: <UserX className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-600'
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-600'
    },
    {
      id: 'multirole',
      label: t.multirole,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'teacher-settings',
      label: language === 'fr' ? 'Paramètres' : 'Settings',
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gray-600'
    }
  ];

  return (
    <TeacherMultiSchoolProvider>
      <div>
        {/* Work Mode Toggle - only show if teacher has independent/hybrid capability */}
        {showIndependentCourses && user?.workMode && (
          <TeacherWorkModeToggle
            currentMode={user.workMode as 'school' | 'independent' | 'hybrid'}
            onModeChange={handleModeChange}
          />
        )}
        
        <UnifiedIconDashboard
          title={t.title || ''}
          subtitle={t.subtitle}
          modules={modules}
          activeModule={currentActiveModule}
        />
      </div>
    </TeacherMultiSchoolProvider>
  );
};

export default TeacherDashboard;