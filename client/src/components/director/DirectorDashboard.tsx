import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  School, Users, BookOpen, Calendar, DollarSign, Settings,
  BarChart3, FileText, MessageSquare, Shield, Award,
  UserCheck, ClipboardList, Clock, UserX, CheckCircle, HelpCircle, Bell, Building2, Star, Languages
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
import NotificationCenter from '@/components/shared/NotificationCenter';
import EducationalContentApproval from '@/components/director/modules/EducationalContentApproval';

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
  
  // AGGRESSIVE API DATA PRELOADING - Director APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadDirectorApiData = async () => {
      console.log('[DIRECTOR_DASHBOARD] 🚀 PRELOADING API DATA for instant access...');
      
      const apiEndpoints = [
        '/api/director/teachers',
        '/api/director/students',
        '/api/director/classes',
        '/api/director/analytics',
        '/api/director/settings'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`[DIRECTOR_DASHBOARD] 📡 Preloading ${endpoint}...`);
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
          console.log(`[DIRECTOR_DASHBOARD] ✅ ${endpoint} data cached!`);
          return true;
        } catch (error) {
          console.error(`[DIRECTOR_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
      console.log('[DIRECTOR_DASHBOARD] 🎯 ALL DIRECTOR API DATA PRELOADED!');
    };
    
    preloadDirectorApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules - Director specific
  React.useEffect(() => {
    const criticalModules = ['overview', 'teachers', 'students', 'classes', 'director-timetable', 'director-attendance', 'director-communications'];
    
    const forceLoadCriticalModules = async () => {
      console.log('[DIRECTOR_DASHBOARD] 🚀 FORCE LOADING critical modules...');
      
      const promises = criticalModules.map(async (moduleName) => {
        try {
          console.log(`[DIRECTOR_DASHBOARD] ⚡ Force loading ${moduleName}...`);
          await preloadModule(moduleName);
          console.log(`[DIRECTOR_DASHBOARD] ✅ ${moduleName} module ready!`);
          return true;
        } catch (error) {
          console.error(`[DIRECTOR_DASHBOARD] ❌ Failed to load ${moduleName}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      console.log('[DIRECTOR_DASHBOARD] 🎯 ALL CRITICAL MODULES PRELOADED - INSTANT ACCESS!');
    };
    
    forceLoadCriticalModules();
  }, [preloadModule]);
  
  // ULTRA-FAST module component creator with proper type checking
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    // Preload modules on demand without using hooks
    if (!ModuleComponent) {
      console.log(`[DIRECTOR_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
      preloadModule(moduleName);
    }
    
    if (ModuleComponent) {
      const isCritical = ['teachers', 'students', 'classes', 'analytics', 'settings'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[DIRECTOR_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      
      // Safe component creation with type checking
      try {
        if (typeof ModuleComponent === 'function') {
          return React.createElement(ModuleComponent);
        } else if (ModuleComponent && typeof ModuleComponent === 'object' && 'default' in ModuleComponent) {
          // Handle default export
          return React.createElement((ModuleComponent as any).default);
        } else {
          console.warn(`[DIRECTOR_DASHBOARD] ⚠️ Invalid component for ${moduleName}:`, typeof ModuleComponent);
          return fallbackComponent;
        }
      } catch (error) {
        console.error(`[DIRECTOR_DASHBOARD] ❌ Error creating component ${moduleName}:`, error);
        return fallbackComponent;
      }
    }
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-indigo-600">
            {apiDataPreloaded ? (language === 'fr' ? '⚡ Finalisation...' : '⚡ Finalizing...') : (language === 'fr' ? 'Chargement...' : 'Loading...')}
          </p>
        </div>
      </div>
    );
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
      'switchToSubscription': 'subscription'
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
      'switchToGeolocation', 'switchToSubscription'
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
      overview: 'Vue d\'ensemble',
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

      finances: 'Finances',
      reports: 'Rapports', 
      help: 'Aide',
      configGuide: 'Guide Configuration',
      schoolSettings: 'Paramètres École'
    },
    en: {
      title: 'Director Dashboard',
      subtitle: 'Complete administration of your educational institution',
      overview: 'Overview',
      settings: 'Director Profile',
      teachers: 'Teachers',
      students: 'Students',
      classes: 'Classes',
      timetable: 'Schedule',
      attendance: 'School Attendance',
      communications: 'Communications',
      teacherAbsence: 'Teacher Absences',
      parentRequests: 'Parent Requests',

      bulletins: 'Bulletins',
      notifications: 'Notifications',
      schoolAdministrators: 'Delegate Administrators',

      finances: 'Finances',
      reports: 'Reports',
      help: 'Help',
      configGuide: 'Configuration Guide',
      schoolSettings: 'School Settings'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'overview',
      label: t.overview,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('overview')
    },
    {
      id: 'subscription',
      label: language === 'fr' ? 'Mon Abonnement' : 'My Subscription',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      component: createDynamicModule('subscription')
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: createDynamicModule('director-settings')
    },
    {
      id: 'classes',
      label: t.classes,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Classes Multi-niveaux"
          userType="School"
          features={[
            "Classes illimitées tous niveaux",
            "Outils pédagogiques avancés",
            "Affectation automatique enseignants",
            "Analytics de performance par classe"
          ]}
        >
          {createDynamicModule('classes')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'teachers',
      label: t.teachers,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-green-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Enseignants Avancée"
          userType="School"
          features={[
            "Gestion illimitée d'enseignants",
            "Rapports de performance détaillés", 
            "Planification automatique des cours",
            "Outils de communication intégrés"
          ]}
        >
          {createDynamicModule('teachers')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'students',
      label: t.students,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Élèves Premium"
          userType="School"
          features={[
            "Base de données étudiants illimitée",
            "Suivi personnalisé de progression",
            "Communication automatisée avec parents",
            "Rapports d'analyse comportementale"
          ]}
        >
          {createDynamicModule('students')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: (
        <PremiumFeatureGate
          featureName="Emploi du Temps Intelligent"
          userType="School"
          features={[
            "Génération automatique d'emplois du temps",
            "Optimisation des conflits d'horaires",
            "Synchronisation multi-classes",
            "Notifications automatiques de changements"
          ]}
        >
          {createDynamicModule('director-timetable')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createDynamicModule('director-attendance')
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: (
        <PremiumFeatureGate
          featureName="Centre Communications Pro"
          userType="School"
          features={[
            "Messages groupés SMS/WhatsApp illimités",
            "Templates de communication automatisés",
            "Suivi de livraison des messages",
            "Intégration avec systèmes de notation"
          ]}
        >
          {createDynamicModule('director-communications')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'teacher-absence',
      label: t.teacherAbsence,
      icon: <UserX className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('teacher-absence')
    },
    {
      id: 'parent-requests',
      label: t.parentRequests,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: createDynamicModule('parent-requests')
    },

    {
      id: 'content-approval',
      label: language === 'fr' ? 'Contenu Pédagogique' : 'Educational Content',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <EducationalContentApproval />
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: <NotificationCenter userRole="Director" userId={user?.id || 0} />
    },
    {
      id: 'school-administrators',
      label: t.schoolAdministrators,
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-amber-500',
      component: createDynamicModule('school-administrators')
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-violet-500',
      component: createDynamicModule('reports')
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-rose-500',
      component: createDynamicModule('help')
    },
    {
      id: 'config-guide',
      label: t.configGuide,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createDynamicModule('config-guide')
    },
    {
      id: 'school-settings',
      label: t.schoolSettings || (language === 'fr' ? 'Paramètres École' : 'School Settings'),
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-slate-600',
      component: createDynamicModule('school-settings')
    },
    {
      id: 'document-management',
      label: language === 'fr' ? 'Gestion Documents' : 'Document Management',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: createDynamicModule('document-management')
    },
    {
      id: 'bulletin-management',
      label: language === 'fr' ? 'Bulletins' : 'Bulletins',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createDynamicModule('bulletin-management')
    },
  ];

  return (
    <UnifiedIconDashboard
      title={t.title || ''}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={activeModule}
    />
  );
};

export default DirectorDashboard;