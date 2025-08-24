import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler } from '@/hooks/useStableCallback';
import { useFastModule } from '@/utils/consolidatedFastLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Users, Calendar, CheckSquare, BarChart3, BookOpen, FileText,
  MessageSquare, User, Clock, Settings, HelpCircle, MapPin, Bell, Star, Mail
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
import NotificationCenter from '@/components/shared/NotificationCenter';
import SubscriptionStatusCard from '@/components/shared/SubscriptionStatusCard';
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';
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
  // Removed old slow loading system
  const [apiDataPreloaded, setApiDataPreloaded] = useState(false);
  
  // AGGRESSIVE API DATA PRELOADING - Teacher APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadTeacherApiData = async () => {
      console.log('[TEACHER_DASHBOARD] 🚀 PRELOADING API DATA for instant access...');
      
      const apiEndpoints = [
        '/api/teacher/grades',
        '/api/teacher/classes',
        '/api/teacher/assignments',
        '/api/teacher/attendance',
        '/api/teacher/communications'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`[TEACHER_DASHBOARD] 📡 Preloading ${endpoint}...`);
          await queryClient.prefetchQuery({
            queryKey: [endpoint],
            queryFn: async () => {
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
          console.log(`[TEACHER_DASHBOARD] ✅ ${endpoint} data cached!`);
          return true;
        } catch (error) {
          console.error(`[TEACHER_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
      console.log('[TEACHER_DASHBOARD] 🎯 ALL TEACHER API DATA PRELOADED!');
    };
    
    preloadTeacherApiData();
  }, [user, queryClient]);
  
  // Modules now load instantly from consolidated fast loader
  
  // INSTANT module component creator using consolidated fast loader
  const createInstantModule = (moduleName: string) => {
    const InstantModule = ({ moduleName }: { moduleName: string }) => {
      const { component: Component, loading, error } = useFastModule(moduleName);
      
      if (error) {
        console.error(`[TEACHER_DASHBOARD] ❌ Error loading ${moduleName}:`, error);
        return <div className="p-4 text-red-500">Error loading module</div>;
      }
      
      if (loading || !Component) {
        return (
          <div className="flex items-center justify-center h-32">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        );
      }
      
      console.log(`[TEACHER_DASHBOARD] ⚡ ${moduleName} loaded INSTANTLY!`);
      return <Component />;
    };
    
    return <InstantModule moduleName={moduleName} />;
  };

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
      component: createInstantModule('FunctionalMyClasses')
    },
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createInstantModule('TeacherTimetable')
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createInstantModule('FunctionalTeacherAttendance')
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createInstantModule('FunctionalTeacherGrades')
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: createInstantModule('FunctionalTeacherAssignments')
    },
    {
      id: 'content',
      label: t.content,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createInstantModule('CreateEducationalContent')
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createInstantModule('ReportCards')
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createInstantModule('FunctionalTeacherCommunications')
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
      component: <NotificationCenter userRole="Teacher" userId={1} />
    },
    {
      id: 'multirole',
      label: t.multirole,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Teacher"
        onRoleSwitch={(role) => {
          console.log(`[TEACHER_DASHBOARD] 🔄 Role switch requested: ${role}`);
          // Handle role switch logic here
          if (role === 'Parent') {
            window.location.href = '/parent';
          } else if (role === 'Freelancer') {
            window.location.href = '/freelancer';
          }
        }} 
      />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createInstantModule('HelpCenter')
    },
    {
      id: 'profile',
      label: language === 'fr' ? 'Paramètres Enseignant' : 'Teacher Settings',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-600',
      component: createInstantModule('FunctionalTeacherProfile')
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