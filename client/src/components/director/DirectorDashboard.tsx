import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  School, Users, BookOpen, Calendar, DollarSign, Settings,
  BarChart3, FileText, MessageSquare, Shield, Award,
  UserCheck, ClipboardList, Clock, UserX, CheckCircle, HelpCircle
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import FunctionalDirectorProfile from './modules/FunctionalDirectorProfile';
import TeacherManagement from './modules/TeacherManagement';
import StudentManagement from './modules/StudentManagement';
import ClassManagement from './modules/ClassManagement';
import FunctionalDirectorClassManagement from './modules/FunctionalDirectorClassManagement';
import FunctionalDirectorStudentManagement from './modules/FunctionalDirectorStudentManagement';
import FunctionalDirectorTeacherManagement from './modules/FunctionalDirectorTeacherManagement';
import SchoolAttendanceManagement from './modules/SchoolAttendanceManagement';
import ParentRequestsNew from './modules/ParentRequestsNew';
import SchoolAdministration from './modules/SchoolAdministration';
import GeolocationManagementImproved from './modules/GeolocationManagementImproved';
import BulletinApprovalNew from './modules/BulletinApprovalNew';
import BulletinValidation from './modules/BulletinValidation';
import TeacherAbsenceManager from './modules/TeacherAbsenceManager';
import TimetableConfiguration from './modules/TimetableConfiguration';
import FinancialManagement from './modules/FinancialManagement';
import ReportsAnalytics from './modules/ReportsAnalytics';
import AdministratorManagementFunctional from './modules/AdministratorManagementFunctional';
import HelpCenter from '@/components/help/HelpCenter';
import { FunctionalDirectorOverview } from './modules/FunctionalDirectorOverview';
import { FunctionalDirectorTeachers } from './modules/FunctionalDirectorTeachers';
import CommunicationsCenter from './modules/CommunicationsCenter';
import SchoolConfigurationGuide from './modules/SchoolConfigurationGuide';

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';

interface DirectorDashboardProps {
  activeModule?: string;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ activeModule }) => {
  const { language } = useLanguage();

  // Add event listeners for Quick Actions navigation from SchoolSettings
  useEffect(() => {
    const handleQuickActions = (event: CustomEvent) => {
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
        'switchToGeolocation': 'geolocation',
        'switchToSubscription': 'subscription'
      };
      
      const moduleId = moduleMap[event.type];
      if (moduleId) {
        console.log(`[DIRECTOR_DASHBOARD] ✅ Mapping ${event.type} → ${moduleId}`);
        // Trigger module switch in UnifiedIconDashboard
        const moduleEvent = new CustomEvent('switchModule', { detail: { moduleId } });
        window.dispatchEvent(moduleEvent);
      } else {
        console.log(`[DIRECTOR_DASHBOARD] ❌ No mapping found for event: ${event.type}`);
      }
    };

    // Register all quick action events from SchoolSettings
    const eventTypes = [
      'switchToTimetable', 'switchToTeacherManagement', 'switchToClassManagement', 'switchToCommunications',
      'switchToSettings', 'switchToAdministrators', 'switchToStudent-management', 'switchToAttendance-management',
      'switchToGeolocation', 'switchToSubscription'
    ];
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleQuickActions as EventListener);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleQuickActions as EventListener);
      });
    };
  }, []);

  const text = {
    fr: {
      title: 'Tableau de Bord Directeur',
      subtitle: 'Administration complète de votre établissement scolaire',
      overview: 'Vue d\'ensemble',
      settings: 'Paramètres École',
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
      administrators: 'Administrateurs',
      schoolAdministrators: 'Administrateurs École',
      finances: 'Finances',
      reports: 'Rapports',
      help: 'Aide',
      configGuide: 'Guide Configuration'
    },
    en: {
      title: 'Director Dashboard',
      subtitle: 'Complete administration of your educational institution',
      overview: 'Overview',
      settings: 'School Settings',
      teachers: 'Teachers',
      students: 'Students',
      classes: 'Classes',
      timetable: 'Schedule',
      attendance: 'School Attendance',
      communications: 'Communications',
      teacherAbsence: 'Teacher Absences',
      parentRequests: 'Parent Requests',
      geolocation: 'Geolocation',
      bulletinApproval: 'Bulletin Approval',
      administrators: 'Administrators',
      schoolAdministrators: 'School Administrators',
      finances: 'Finances',
      reports: 'Reports',
      help: 'Help',
      configGuide: 'Configuration Guide'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'overview',
      label: t.overview,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <FunctionalDirectorOverview />
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: <FunctionalDirectorProfile />
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
          <FunctionalDirectorTeacherManagement />
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
          <FunctionalDirectorStudentManagement />
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
          <FunctionalDirectorClassManagement />
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
          <TimetableConfiguration />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: <SchoolAttendanceManagement />
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
          <CommunicationsCenter />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'teacher-absence',
      label: t.teacherAbsence,
      icon: <UserX className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <TeacherAbsenceManager />
    },
    {
      id: 'parent-requests',
      label: t.parentRequests,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: <ParentRequestsNew />
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: (
        <PremiumFeatureGate
          featureName="Géolocalisation Sécurisée"
          userType="School"
          features={[
            "Suivi GPS temps réel de tous les élèves",
            "Zones de sécurité personnalisables",
            "Alertes automatiques parents/école",
            "Rapports de fréquentation géolocalisés"
          ]}
        >
          <GeolocationManagementImproved />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'bulletin-validation',
      label: t.bulletinApproval,
      icon: <ClipboardList className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: <BulletinValidation />
    },
    {
      id: 'administrators',
      label: t.administrators,
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-slate-500',
      component: <AdministratorManagementFunctional />
    },
    {
      id: 'school-administrators',
      label: t.schoolAdministrators,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-amber-500',
      component: <SchoolAdministration />
    },

    {
      id: 'reports',
      label: t.reports,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-violet-500',
      component: <ReportsAnalytics />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-rose-500',
      component: <HelpCenter userType="school" />
    },
    {
      id: 'config-guide',
      label: t.configGuide,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: <SchoolConfigurationGuide />
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