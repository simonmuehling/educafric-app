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
  
  // ULTRA-FAST module component creator
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['children', 'grades', 'attendance', 'messages', 'payments'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[PARENT_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      return React.createElement(ModuleComponent);
    }
    
    React.useEffect(() => {
      preloadModule(moduleName);
    }, []);
    
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
          {createDynamicModule('messages')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'grades',
      label: t.results,
      icon: <BookOpen className="w-6 h-6" />,
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
          {createDynamicModule('grades')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle2 className="w-6 h-6" />,
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
          {createDynamicModule('attendance')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-red-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Paiements"
          userType="Parent"
          features={[
            "Paiements Orange Money & MTN",
            "Historique complet des factures",
            "Rappels automatiques d'échéance",
            "Reçus PDF téléchargeables"
          ]}
        >
          {createDynamicModule('payments')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: (
        <PremiumFeatureGate
          featureName="Géolocalisation Premium"
          userType="Parent"
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
      id: 'family',
      label: language === 'fr' ? 'Connexions Familiales' : 'Family Connections',
      icon: <Heart className="w-6 h-6" />,
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
      component: createDynamicModule('profile')
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

export default ParentDashboard;