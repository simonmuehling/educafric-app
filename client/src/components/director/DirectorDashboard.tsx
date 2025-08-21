import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { 
  School, Users, BookOpen, Calendar, DollarSign, Settings,
  BarChart3, FileText, MessageSquare, Shield, Award,
  UserCheck, ClipboardList, Clock, UserX, CheckCircle, HelpCircle, Bell, Building2
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size


// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';

interface DirectorDashboardProps {
  activeModule?: string;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ activeModule }) => {
  const { language } = useLanguage();
  const { getModule, preloadModule } = useFastModules();
  
  // Dynamic module component creator
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
      bulletinApproval: 'Validation Bulletins',
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

      bulletinApproval: 'Bulletin Approval',
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
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: createDynamicModule('settings')
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
          {createDynamicModule('timetable')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createDynamicModule('attendance')
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
          {createDynamicModule('communications')}
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
      id: 'bulletin-validation',
      label: t.bulletinApproval,
      icon: <ClipboardList className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: createDynamicModule('bulletin-validation')
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