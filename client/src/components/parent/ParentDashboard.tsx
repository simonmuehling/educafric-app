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
  ChevronDown, Mail, Heart, BarChart3, Video
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: Removed static imports - using dynamic loading only for better bundle size

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';
// Dynamic components loaded via fastModuleLoader
// NotificationCenter, UniversalMultiRoleSwitch, and SubscriptionStatusCard now loaded dynamically via fastModuleLoader
import { useAuth } from '@/contexts/AuthContext';

interface ParentDashboardProps {
  activeModule?: string;
}

const ParentDashboard = ({ activeModule }: ParentDashboardProps) => {
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
      
      const apiEndpoints = [
        '/api/parent/children',
        '/api/parent/grades',
        '/api/parent/attendance',
        '/api/parent/messages',
        '/api/parent/payments'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
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
          return true;
        } catch (error) {
          console.error(`[PARENT_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
    };
    
    preloadParentApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules - Parent specific
  React.useEffect(() => {
    const criticalModules = ['children', 'parent-messages', 'parent-grades', 'parent-attendance', 'payments', 'geolocation', 'parent-timetable'];
    
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
  
  // ✅ SAFE on-demand module preloading - ALL HOOKS AT COMPONENT LEVEL
  React.useEffect(() => {
    // Préchargement des modules non-critiques à la demande
    const nonCriticalModules = ['parent-settings', 'help', 'requests'];
    
    nonCriticalModules.forEach((moduleName) => {
      const ModuleComponent = getModule(moduleName);
      if (!ModuleComponent) {
        console.log(`[PARENT_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
        preloadModule(moduleName);
      }
    });
  }, [getModule, preloadModule]);
  
  // ✅ SAFE module component creator - NO CONDITIONAL HOOKS
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['children', 'parent-grades', 'parent-attendance', 'parent-messages', 'payments', 'parent-library'].includes(moduleName);
      if (isCritical) {
        console.log(`[PARENT_DASHBOARD] 🚀 ${moduleName} served INSTANTLY - Module + Data PRELOADED!`);
      }
      return React.createElement(ModuleComponent);
    }
    
    // ✅ NO useEffect here - moved to component level
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
      icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      component: createDynamicModule('subscription')
    },
    {
      id: 'family',
      label: language === 'fr' ? 'Connexions Familiales' : 'Family Connections',
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-pink-500',
      component: (
        <PremiumFeatureGate
          featureName="Communication Familiale Directe"
          userType="Parent"
          features={[
            "Communication directe parent-enfant",
            "Messages chiffrés end-to-end",
            "Connexions sécurisées par QR code",
            "Chat temps réel avec statut en ligne"
          ]}
        >
          {createDynamicModule('family')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'children',
      label: t.myChildren,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('children')
    },
    {
      id: 'messages',
      label: t.communications,
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-500',
      component: (
        <PremiumFeatureGate
          featureName="Messages Enseignants"
          userType="Parent"
          features={[
            "Communication directe avec les enseignants",
            "Notifications push instantanées",
            "Historique complet des conversations",
            "Pièces jointes et photos"
          ]}
        >
          {createDynamicModule('parent-messages')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'grades',
      label: t.results,
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-green-500',
      component: (
        <PremiumFeatureGate
          featureName="Bulletins & Notes Détaillés"
          userType="Parent"
          features={[
            "Bulletins avec graphiques détaillés",
            "Analyse de progression par matière",
            "Comparaison avec la moyenne de classe",
            "Téléchargement PDF professionnel"
          ]}
        >
          {createDynamicModule('parent-grades')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'library',
      label: language === 'fr' ? 'Bibliothèque' : 'Library',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('parent-library')
    },
    {
      id: 'parent-online-classes',
      label: language === 'fr' ? 'Classes en Ligne' : 'Online Classes',
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('parent-online-classes')
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-500',
      component: (
        <PremiumFeatureGate
          featureName="Suivi Présence Avancé"
          userType="Parent"
          features={[
            "Alertes absence en temps réel",
            "Historique de présence détaillé",
            "Justification d'absence en ligne",
            "Rapport mensuel automatique"
          ]}
        >
          {createDynamicModule('parent-attendance')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('payments')
    },
    {
      id: 'parent-timetable',
      label: language === 'fr' ? 'Emploi du Temps Enfants' : 'Children Timetable',
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-500',
      component: (
        <PremiumFeatureGate
          featureName="Emploi du Temps des Enfants"
          userType="Parent"
          features={[
            "Emploi du temps détaillé par enfant",
            "Vue hebdomadaire interactive",
            "Informations professeur et salle",
            "Navigation jour par jour"
          ]}
        >
          {createDynamicModule('parent-timetable')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-emerald-500',
      component: (
        <PremiumFeatureGate
          featureName="Géolocalisation Premium"
          userType="Parent"
          requiredPlan="premium"
          features={[
            "Suivi GPS temps réel de votre enfant",
            "Zones de sécurité personnalisées",
            "Alertes d'arrivée/départ école",
            "Historique des déplacements"
          ]}
        >
          {createDynamicModule('geolocation')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-600',
      component: createDynamicModule('notifications')
    },
    {
      id: 'requests',
      label: t.requests,
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('requests')
    },
    {
      id: 'profile',
      label: language === 'fr' ? 'Paramètres Parent' : 'Parent Settings',
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gray-500',
      component: createDynamicModule('parent-settings')
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('multirole')
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
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

export default ParentDashboard;