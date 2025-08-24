import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { createInstantModule } from '@/utils/instantModuleHelper';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  School, Users, BookOpen, Calendar, DollarSign, Settings,
  BarChart3, FileText, MessageSquare, Shield, Award,
  UserCheck, ClipboardList, Clock, UserX, CheckCircle, HelpCircle, Bell, Building2
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';

interface DirectorDashboardProps {
  activeModule?: string;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ activeModule }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
        } catch (error) {
          console.warn(`[DIRECTOR_DASHBOARD] ⚠️ Failed to preload ${endpoint}:`, error);
        }
      });
      
      await Promise.allSettled(promises);
      console.log('[DIRECTOR_DASHBOARD] ✅ All API data PRELOADED - Modules will open INSTANTLY!');
      setApiDataPreloaded(true);
    };
    
    preloadDirectorApiData();
  }, [user, queryClient]);

  const t = {
    title: language === 'fr' ? 'Tableau de Bord Directeur' : 'Director Dashboard',
    subtitle: language === 'fr' ? 'Gestion complète de votre établissement' : 'Complete management of your institution',
    teachers: language === 'fr' ? 'Enseignants' : 'Teachers',
    students: language === 'fr' ? 'Étudiants' : 'Students',
    classes: language === 'fr' ? 'Classes' : 'Classes',
    timetable: language === 'fr' ? 'Emploi du Temps' : 'Timetable',
    finances: language === 'fr' ? 'Finances' : 'Finances',
    settings: language === 'fr' ? 'Paramètres' : 'Settings',
    reports: language === 'fr' ? 'Rapports' : 'Reports',
    communication: language === 'fr' ? 'Communication' : 'Communication',
    help: language === 'fr' ? 'Aide' : 'Help',
    configGuide: language === 'fr' ? 'Guide de Configuration' : 'Configuration Guide',
    schoolSettings: language === 'fr' ? 'Paramètres École' : 'School Settings'
  };

  // 🎯 TOUS LES MODULES DIRECTEUR - 9 modules optimisés
  const modules = [
    {
      id: 'teachers',
      label: t.teachers,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createInstantModule('FunctionalDirectorTeachers')
    },
    {
      id: 'students', 
      label: t.students,
      icon: <School className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createInstantModule('FunctionalDirectorStudents')
    },
    {
      id: 'classes',
      label: t.classes,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createInstantModule('FunctionalDirectorClasses')
    },
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createInstantModule('FunctionalDirectorTimetable')
    },
    {
      id: 'finances',
      label: t.finances,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createInstantModule('FunctionalDirectorFinances')
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-violet-500',
      component: createInstantModule('FunctionalDirectorReports')
    },
    {
      id: 'communication',
      label: t.communication,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: createInstantModule('CommunicationsCenter')
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-rose-500',
      component: createInstantModule('FunctionalDirectorHelp')
    },
    {
      id: 'config-guide',
      label: t.configGuide,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createInstantModule('MobileSchoolConfigurationGuide')
    },
    {
      id: 'school-settings',
      label: t.schoolSettings,
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-slate-600',
      component: createInstantModule('FunctionalDirectorSettings')
    }
  ];

  return (
    <UnifiedIconDashboard
      title={t.title}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={activeModule}
    />
  );
};

export default DirectorDashboard;