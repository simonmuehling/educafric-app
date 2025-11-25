import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  School, Users, BookOpen, Calendar, DollarSign, Settings,
  BarChart3, FileText, MessageSquare, Shield, Award,
  UserCheck, ClipboardList, Clock, UserX, CheckCircle, HelpCircle, Bell, Building2, Star, Languages, CheckSquare, FileSpreadsheet, Video, UtensilsCrossed, Bus
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import { OfflineIndicatorBadge } from '@/components/offline/OfflineSyncStatus';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
// NotificationCenter and EducationalContentApproval now loaded dynamically via fastModuleLoader

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';

interface DirectorDashboardProps {
  activeModule?: string;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ activeModule }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = React.useState(false);
  
  // Fetch school settings to get module visibility
  const { data: settingsData } = useQuery({
    queryKey: ['/api/director/settings'],
    enabled: !!user && user.role === 'Director'
  });
  
  // API PRELOADING DISABLED - Load data on-demand only for better performance
  // Previously: Aggressive preloading of 5 APIs caused slow dashboard loading
  React.useEffect(() => {
    setApiDataPreloaded(true);
  }, []);
  
  // MODULE PRELOADING DISABLED - Load modules on-demand only for instant dashboard load
  // Previously: Aggressive preloading of 6 modules caused slow initial load
  // Now: Modules load instantly when clicked (better UX)
  
  // ULTRA-FAST module component creator with proper type checking
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    // Preload modules on demand without using hooks
    if (!ModuleComponent) {
      console.log(`[DIRECTOR_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
      preloadModule(moduleName);
      
      // Show loading state while module is being fetched
      return fallbackComponent || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-indigo-600">
              {language === 'fr' ? 'Chargement du module...' : 'Loading module...'}
            </p>
          </div>
        </div>
      );
    }
    
    // Module is loaded - render it
    const isCritical = ['teachers', 'students', 'classes', 'analytics', 'settings'].includes(moduleName);
    if (isCritical && apiDataPreloaded) {
      console.log(`[DIRECTOR_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
    }
    
    // Prepare props for specific modules that need them
    const moduleProps: any = {};
    
    // NotificationCenter needs userId and userRole
    if (moduleName === 'notifications' || moduleName === 'director.notifications') {
      moduleProps.userId = user?.id;
      moduleProps.userRole = user?.role;
    }
    
    // Safe component creation with type checking
    try {
      if (typeof ModuleComponent === 'function') {
        return React.createElement(ModuleComponent, moduleProps);
      } else if (ModuleComponent && typeof ModuleComponent === 'object' && 'default' in ModuleComponent) {
        // Handle default export
        return React.createElement((ModuleComponent as any).default, moduleProps);
      } else {
        console.warn(`[DIRECTOR_DASHBOARD] ⚠️ Invalid component for ${moduleName}:`, typeof ModuleComponent);
        return fallbackComponent || (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{language === 'fr' ? 'Erreur de chargement du module' : 'Module loading error'}</p>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error(`[DIRECTOR_DASHBOARD] ❌ Error creating component ${moduleName}:`, error);
      return fallbackComponent || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">{language === 'fr' ? 'Erreur de chargement du module' : 'Module loading error'}</p>
          </div>
        </div>
      );
    }
  };

  // Stable callback for handling quick actions
  const stableHandleQuickActions = useStableCallback((event: CustomEvent) => {
    console.log(`[DIRECTOR_DASHBOARD] 🔥 Received event: ${event.type}`);
    
    const moduleMap: { [key: string]: string } = {
      'switchToTimetable': 'timetable',
      'switchToTeacherManagement': 'teachers', 
      'switchToTeacher-management': 'teachers',
      'switchToClassManagement': 'classes',
      'switchToClass-management': 'classes',
      'switchToCommunications': 'communications',
      'switchToSettings': 'settings',
      'switchToAdministrators': 'administrators',
      'switchToStudent-management': 'students',
      'switchToAttendance-management': 'attendance',
      'switchToOnlineClasses': 'online-classes'
    };
    
    const moduleId = moduleMap[event.type];
    if (moduleId) {
      console.log(`[DIRECTOR_DASHBOARD] ✅ Mapping ${event.type} → ${moduleId}`);
      const moduleEvent = new CustomEvent('switchModule', { detail: { moduleId } });
      window.dispatchEvent(moduleEvent);
    } else {
      console.log(`[DIRECTOR_DASHBOARD] ❌ No mapping found for event: ${event.type}`);
    }
  });

  // Register stable event handlers for all quick actions
  useEffect(() => {
    const eventTypes = [
      'switchToTimetable', 'switchToTeacherManagement', 'switchToClassManagement', 'switchToCommunications',
      'switchToSettings', 'switchToAdministrators', 'switchToStudent-management', 'switchToAttendance-management',
      'switchToGeolocation'
    ];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, stableHandleQuickActions as EventListener);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, stableHandleQuickActions as EventListener);
      });
    };
  }, [stableHandleQuickActions]);

  const text = {
    fr: {
      title: 'Tableau de Bord Directeur',
      subtitle: 'Administration complète de votre établissement scolaire',
      settings: 'Profil Directeur',
      teachers: 'Enseignants',
      students: 'Élèves',
      classes: 'Classes',
      timetable: 'Emploi du temps',
      attendance: 'Présence École',
      communications: 'Communications',
      teacherAbsence: 'Absences Profs',
      parentRequests: 'Demandes Parents',
      geolocation: 'Géolocalisation',
      bulletins: 'Bulletins',
      notifications: 'Notifications',
      schoolAdministrators: 'Administrateurs Délégués',
      
      pdfGenerators: 'Générateurs PDF',

      finances: 'Finances',
      reports: 'Rapports', 
      configGuide: 'Guide Configuration',
      offlinePremiumGuide: 'Guide Offline Premium',
      schoolSettings: 'Paramètres École',
      onlineClasses: 'Classes en ligne',
      onlineClassScheduler: 'Planification Sessions en Ligne',
      canteen: 'Cantine',
      bus: 'Transport Scolaire'
    },
    en: {
      title: 'Director Dashboard',
      subtitle: 'Complete administration of your educational institution',
      settings: 'Director Profile',
      teachers: 'Teachers',
      students: 'Students',
      classes: 'Classes',
      timetable: 'Schedule',
      attendance: 'School Attendance',
      communications: 'Communications',
      teacherAbsence: 'Teacher Absences',
      parentRequests: 'Parent Requests',

      bulletins: 'Report Cards',
      notifications: 'Notifications',
      schoolAdministrators: 'Delegate Administrators',
      
      pdfGenerators: 'PDF Generators',

      finances: 'Finances',
      reports: 'Reports',
      configGuide: 'Configuration Guide',
      offlinePremiumGuide: 'Offline Premium Guide',
      schoolSettings: 'School Settings',
      onlineClasses: 'Online Classes',
      onlineClassScheduler: 'Online Class Scheduler',
      canteen: 'Canteen',
      bus: 'School Bus'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'director-settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500'
    },
    {
      id: 'classes',
      label: t.classes,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'teachers',
      label: t.teachers,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'students',
      label: t.students,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'director-timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'director-attendance',
      label: t.attendance,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'director-communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'teacher-absence',
      label: t.teacherAbsence,
      icon: <UserX className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'parent-requests',
      label: t.parentRequests,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-teal-500'
    },
    {
      id: 'content-approval',
      label: language === 'fr' ? 'Contenu Pédagogique' : 'Educational Content',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600'
    },
    {
      id: 'school-administrators',
      label: t.schoolAdministrators,
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-amber-500'
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-violet-500'
    },
    {
      id: 'config-guide',
      label: t.configGuide,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'offline-premium-guide',
      label: t.offlinePremiumGuide,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-600 to-violet-600',
      skipPreload: true,
      externalUrl: '/documents/guide-utilisation-offline-premium.html'
    },
    {
      id: 'school-settings',
      label: t.schoolSettings || (language === 'fr' ? 'Paramètres École' : 'School Settings'),
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-slate-600'
    },
    {
      id: 'academic-management',
      label: language === 'fr' ? 'Gestion Académique' : 'Academic Management',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      id: 'canteen-management',
      label: t.canteen,
      icon: <UtensilsCrossed className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      id: 'bus-management',
      label: t.bus,
      icon: <Bus className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    {
      id: 'online-classes',
      label: t.onlineClasses,
      icon: <Video className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    }
  ];

  // Filter modules based on school visibility settings
  const schoolSettings = (settingsData as any)?.settings?.school;
  const visibleModules = modules.filter(module => {
    // Map module IDs to their corresponding visibility fields
    const moduleVisibilityMap: { [key: string]: boolean } = {
      'director-communications': schoolSettings?.communicationsEnabled ?? true,
      'content-approval': schoolSettings?.educationalContentEnabled ?? true,
      'school-administrators': schoolSettings?.delegateAdminsEnabled ?? true,
      'canteen-management': schoolSettings?.canteenEnabled ?? true,
      'bus-management': schoolSettings?.schoolBusEnabled ?? true,
      'online-classes': schoolSettings?.onlineClassesEnabled ?? true
    };

    // Check if module should be visible
    if (module.id in moduleVisibilityMap) {
      return moduleVisibilityMap[module.id];
    }

    // All other modules are always visible
    return true;
  });

  return (
    <>
      <UnifiedIconDashboard
        title={t.title || ''}
        subtitle={t.subtitle}
        modules={visibleModules}
        activeModule={activeModule}
      />
      <OfflineIndicatorBadge />
    </>
  );
};

export default DirectorDashboard;