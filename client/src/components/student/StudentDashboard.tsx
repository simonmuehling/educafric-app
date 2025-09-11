import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, Calendar, FileText, MessageSquare, User, Clock, 
  BarChart3, Award, Target, HelpCircle, MapPin, Settings, Bell, Star, Heart
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
  
  // AGGRESSIVE API DATA PRELOADING - Load data BEFORE user clicks!
  React.useEffect(() => {
    if (!user) return;
    
    const preloadCriticalApiData = async () => {
      console.log('[STUDENT_DASHBOARD] 🚀 PRELOADING API DATA for instant access...');
      
      const apiEndpoints = [
        '/api/student/grades',
        '/api/student/homework', 
        '/api/student/attendance',
        '/api/student/messages',
        '/api/student/geolocation/safe-zones',
        '/api/student/geolocation/device-status'
      ];
      
      // Preload all critical API data simultaneously
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`[STUDENT_DASHBOARD] 📡 Preloading ${endpoint}...`);
          
          // Use prefetchQuery to load data into cache WITHOUT showing loading states
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
            staleTime: 1000 * 60 * 5 // Keep data fresh for 5 minutes
          });
          
          console.log(`[STUDENT_DASHBOARD] ✅ ${endpoint} data cached!`);
          return true;
        } catch (error) {
          console.error(`[STUDENT_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
      console.log('[STUDENT_DASHBOARD] 🎯 ALL API DATA PRELOADED - MODULES WILL BE INSTANT!');
    };
    
    preloadCriticalApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules
  React.useEffect(() => {
    const criticalModules = ['grades', 'assignments', 'attendance', 'messages'];
    
    const forceLoadCriticalModules = async () => {
      console.log('[STUDENT_DASHBOARD] 🚀 FORCE LOADING critical modules...');
      
      const promises = criticalModules.map(async (moduleName) => {
        try {
          console.log(`[STUDENT_DASHBOARD] ⚡ Force loading ${moduleName}...`);
          await preloadModule(moduleName);
          console.log(`[STUDENT_DASHBOARD] ✅ ${moduleName} ready!`);
          return true;
        } catch (error) {
          console.error(`[STUDENT_DASHBOARD] ❌ Failed to load ${moduleName}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setCriticalModulesReady(true);
      console.log('[STUDENT_DASHBOARD] 🎯 ALL CRITICAL MODULES READY FOR INSTANT USE!');
    };
    
    forceLoadCriticalModules();
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
      
      return React.createElement(ModuleComponent);
    }
    
    // Critical modules should NEVER show spinner if properly preloaded
    const isCritical = ['grades', 'assignments', 'attendance', 'messages'].includes(moduleName);
    
    if (isCritical && criticalModulesReady) {
      // Force immediate retry for critical modules
      console.log(`[STUDENT_DASHBOARD] 🔄 RETRY loading critical module: ${moduleName}`);
      preloadModule(moduleName);
    }
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-red-600 font-medium">
            {isCritical ? 
              (language === 'fr' ? 
                (apiDataPreloaded ? '⚡ Finalisation...' : '⚡ Chargement prioritaire...') :
                (apiDataPreloaded ? '⚡ Finalizing...' : '⚡ Priority loading...')
              ) :
              (language === 'fr' ? 'Chargement...' : 'Loading...')
            }
          </p>
          {isCritical && apiDataPreloaded && (
            <p className="mt-1 text-xs text-gray-500">
              {language === 'fr' ? 'Données préchargées ✓' : 'Data preloaded ✓'}
            </p>
          )}
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
      progress: 'Mon Progrès',
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
      progress: 'My Progress',
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
      label: t.progress,
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
      component: createDynamicModule('achievements')
    },
    {
      id: 'student-settings',
      label: language === 'fr' ? 'Paramètres Étudiant' : 'Student Settings',
      icon: <User className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: createDynamicModule('student-settings')
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-slate-500',
      component: createDynamicModule('help')
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: createDynamicModule('notifications')
    },
    {
      id: 'geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createDynamicModule('student-geolocation')
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('multirole')
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