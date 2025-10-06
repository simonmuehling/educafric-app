import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  School, Users, BookOpen, Calendar, DollarSign, Settings,
  BarChart3, FileText, MessageSquare, Shield, Award,
  UserCheck, ClipboardList, Clock, UserX, CheckCircle, HelpCircle, Bell, Building2, Star, Languages, CheckSquare, FileSpreadsheet, Video
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
// NotificationCenter and EducationalContentApproval now loaded dynamically via fastModuleLoader

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';
import CalendarExport from '@/components/shared/CalendarExport';

interface DirectorDashboardProps {
  activeModule?: string;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ activeModule }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = React.useState(false);
  
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
      schoolSettings: 'Paramètres École',
      onlineClasses: 'Classes en ligne',
      onlineClassScheduler: 'Planification Sessions en Ligne',
      calendarExport: 'Export Calendrier'
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
      schoolSettings: 'School Settings',
      onlineClasses: 'Online Classes',
      onlineClassScheduler: 'Online Class Scheduler',
      calendarExport: 'Calendar Export'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
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
      id: 'calendar-export',
      label: t.calendarExport,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <CalendarExport userType="school" schoolId={user?.schoolId} />
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
      component: createDynamicModule('content-approval')
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: createDynamicModule('notifications')
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
    // comprehensive-bulletins module removed - now integrated in academic-management
    {
      id: 'academic-management',
      label: language === 'fr' ? 'Gestion Académique' : 'Academic Management',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      component: createDynamicModule('academic-management')
    },
    {
      id: 'online-classes',
      label: t.onlineClasses,
      icon: <Video className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      component: (
        <PremiumFeatureGate
          featureName="Classes en ligne avec Jitsi Meet"
          userType="School"
          features={[
            "Visioconférences illimitées avec Jitsi Meet",
            "Gestion avancée des sessions de cours",
            "Enregistrement et suivi de présence",
            "Interface bilingue FR/EN optimisée",
            "Support technique dédié 24/7"
          ]}
        >
          {createDynamicModule('online-classes')}
        </PremiumFeatureGate>
      )
    }
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