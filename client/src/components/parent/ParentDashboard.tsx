import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, Settings, BookOpen, MessageSquare,
  Calendar, FileText, Clock, Bell, DollarSign,
  MapPin, Award, Users, Smartphone, User, GraduationCap,
  CheckCircle2, AlertCircle, Target, Star, CreditCard, HelpCircle,
  ChevronDown, Mail, Heart
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';
// Dynamic components loaded via fastModuleLoader
import NotificationCenter from '@/components/shared/NotificationCenter';
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';
import SubscriptionStatusCard from '@/components/shared/SubscriptionStatusCard';
import { useAuth } from '@/contexts/AuthContext';

interface ParentDashboardProps {
  activeModule?: string;
}

// Gate component - minimal hooks, conditions only
const ParentDashboardGate = ({ activeModule }: ParentDashboardProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return <ParentDashboardContent activeModule={activeModule} />;
};

// Content component - all hooks here
const ParentDashboardContent = ({ activeModule }: ParentDashboardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = useState(false);
  
  // AGGRESSIVE API DATA PRELOADING - Parent APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadParentApiData = async () => {
      console.log('[PARENT_DASHBOARD] 🚀 PRELOADING API DATA for instant access...');
      
      const apiEndpoints = [
        '/api/parent/children',
        '/api/parent/grades',
        '/api/parent/attendance',
        '/api/parent/messages',
        '/api/parent/payments'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`[PARENT_DASHBOARD] 📡 Preloading ${endpoint}...`);
          await queryClient.prefetchQuery({
            queryKey: [endpoint],
            queryFn: async () => {
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
          console.log(`[PARENT_DASHBOARD] ✅ ${endpoint} data cached!`);
          return true;
        } catch (error) {
          console.error(`[PARENT_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
      console.log('[PARENT_DASHBOARD] 🎯 ALL PARENT API DATA PRELOADED!');
    };
    
    preloadParentApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules - Parent specific
  React.useEffect(() => {
    // ✅ ULTRA-EXTENDED critical modules list - ALL important modules preloaded
    const criticalModules = [
      'children', 'parent-messages', 'parent-grades', 'parent-attendance', 'payments', 
      'geolocation', 'parent-profile', 'help', 'requests', 'family', 'subscription'
    ];
    
    const forceLoadCriticalModules = async () => {
      console.log('[PARENT_DASHBOARD] 🚀 FORCE LOADING critical modules...');
      
      const promises = criticalModules.map(async (moduleName) => {
        try {
          console.log(`[PARENT_DASHBOARD] ⚡ Force loading ${moduleName}...`);
          await preloadModule(moduleName);
          console.log(`[PARENT_DASHBOARD] ✅ ${moduleName} module ready!`);
          return true;
        } catch (error) {
          console.error(`[PARENT_DASHBOARD] ❌ Failed to load ${moduleName}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      console.log('[PARENT_DASHBOARD] 🎯 ALL CRITICAL MODULES PRELOADED - INSTANT ACCESS!');
    };
    
    forceLoadCriticalModules();
  }, [preloadModule]);
  
  // ✅ HOOK-SAFE module component creator - NO HOOKS INSIDE
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      // ✅ EXTENDED critical list - matches preloaded modules exactly
      const isCritical = [
        'children', 'parent-messages', 'parent-grades', 'parent-attendance', 'payments', 
        'geolocation', 'parent-profile', 'help', 'requests', 'family', 'subscription'
      ].includes(moduleName);
      if (isCritical) {
        console.log(`[PARENT_DASHBOARD] 🚀 ${moduleName} served INSTANTLY - Module + Data PRELOADED!`);
      }
      return React.createElement(ModuleComponent);
    }
    
    // ✅ NO useEffect here - preloading handled elsewhere
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-green-600">
            {apiDataPreloaded ? (language === 'fr' ? '⚡ Finalisation...' : '⚡ Finalizing...') : (language === 'fr' ? 'Chargement...' : 'Loading...')}
          </p>
        </div>
      </div>
    );
  };

  // ✅ Preload missing modules - SEPARATE useEffect with all hooks called
  const missingModules = ['requests', 'parent-profile', 'help'];
  React.useEffect(() => {
    const preloadMissingModules = async () => {
      for (const moduleName of missingModules) {
        const ModuleComponent = getModule(moduleName);
        if (!ModuleComponent) {
          console.log(`[PARENT_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
          try {
            await preloadModule(moduleName);
          } catch (error) {
            console.warn(`[PARENT_DASHBOARD] Failed to preload ${moduleName}:`, error);
          }
        }
      }
    };
    preloadMissingModules();
  }, [getModule, preloadModule]);

  // Stable event handlers that survive server restarts
  const handleSwitchToGrades = useStableCallback(() => {
    console.log('[PARENT_DASHBOARD] 📊 Event received: switchToGrades');
    setCurrentActiveModule('grades');
  });

  const handleSwitchToAttendance = useStableCallback(() => {
    console.log('[PARENT_DASHBOARD] 📋 Event received: switchToAttendance');
    setCurrentActiveModule('attendance');
  });

  const handleSwitchToMessages = useStableCallback(() => {
    console.log('[PARENT_DASHBOARD] 💬 Event received: switchToMessages');
    setCurrentActiveModule('messages');
  });
  
  const text = {
    fr: {
      title: 'Tableau de Bord Parent',
      subtitle: 'Suivi complet de l\'éducation de vos enfants',
      overview: 'Aperçu',
      settings: 'Paramètres Parent',
      myChildren: 'Mes Enfants',
      timetable: 'Emploi du Temps',
      results: 'Résultats',
      homework: 'Devoirs',
      communications: 'Communications',
      notifications: 'Notifications',
      whatsapp: 'WhatsApp (Bientôt)',
      attendance: 'Suivi de Présence',
      geolocation: 'Géolocalisation Enfants',
      requests: 'Demandes Parents',
      help: 'Aide'
    },
    en: {
      title: 'Parent Dashboard',
      subtitle: 'Complete educational monitoring for your children',
      overview: 'Overview',
      settings: 'Parent Settings',
      myChildren: 'My Children',
      timetable: 'Timetable',
      results: 'Results',
      homework: 'Homework',
      communications: 'Communications',
      notifications: 'Notifications',
      whatsapp: 'WhatsApp (Soon)',
      attendance: 'Attendance',
      geolocation: 'Children Geolocation',
      requests: 'Parent Requests',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'subscription',
      label: language === 'fr' ? 'Mon Abonnement' : 'My Subscription',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      component: createDynamicModule('subscription')
    },
    {
      id: 'children',
      label: t.myChildren,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('children')
    },
    {
      id: 'messages',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createDynamicModule('parent-messages')
    },
    {
      id: 'grades',
      label: t.results,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createDynamicModule('parent-grades')
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('parent-attendance')
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('payments')
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createDynamicModule('geolocation')
    },
    {
      id: 'family',
      label: language === 'fr' ? 'Connexions Familiales' : 'Family Connections',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: createDynamicModule('family')
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: <NotificationCenter userRole="Parent" userId={user?.id || 0} />
    },
    {
      id: 'requests',
      label: t.requests,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('requests')
    },
    {
      id: 'profile',
      label: language === 'fr' ? 'Paramètres Parent' : 'Parent Settings',
      icon: <User className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: createDynamicModule('parent-profile')
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Parent"
        onRoleSwitch={(role) => {
          console.log(`[PARENT_DASHBOARD] 🔄 Role switch requested: ${role}`);
          if (role === 'Teacher') {
            window.location.href = '/teacher';
          } else if (role === 'Student') {
            window.location.href = '/student';
          }
        }} 
      />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: createDynamicModule('help')
    }
  ];

  return (
    <UnifiedIconDashboard
      title={t.title || ''}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={currentActiveModule || activeModule}
    />
  );
};

export default ParentDashboardGate;