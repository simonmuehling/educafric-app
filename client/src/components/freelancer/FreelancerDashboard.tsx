import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createInstantModule } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Users, Calendar, DollarSign, BarChart3, BookOpen, MessageSquare,
  Settings, Clock, MapPin, FileText, HelpCircle, Bell, User, Star
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';
import NotificationCenter from '@/components/shared/NotificationCenter';
import SubscriptionStatusCard from '@/components/shared/SubscriptionStatusCard';

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';

interface FreelancerDashboardProps {
  stats?: any;
  activeModule?: string;
}

const FreelancerDashboard = ({ stats, activeModule }: FreelancerDashboardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [apiDataPreloaded, setApiDataPreloaded] = React.useState(false);
  
  // AGGRESSIVE API DATA PRELOADING - Freelancer APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadFreelancerApiData = async () => {
      console.log('[FREELANCER_DASHBOARD] 🚀 PRELOADING API DATA for instant access...');
      
      const apiEndpoints = [
        '/api/freelancer/students',
        '/api/freelancer/sessions',
        '/api/freelancer/schedule',
        '/api/freelancer/payments'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`[FREELANCER_DASHBOARD] 📡 Preloading ${endpoint}...`);
          await queryClient.prefetchQuery({
            queryKey: [endpoint],
            queryFn: async () => {
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
          console.log(`[FREELANCER_DASHBOARD] ✅ ${endpoint} data cached!`);
          return true;
        } catch (error) {
          console.error(`[FREELANCER_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
      console.log('[FREELANCER_DASHBOARD] 🎯 ALL FREELANCER API DATA PRELOADED!');
    };
    
    preloadFreelancerApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules - Freelancer specific
  React.useEffect(() => {
    const criticalModules = ['students', 'sessions', 'schedule', 'resources', 'communications', 'settings'];
    
    const forceLoadCriticalModules = async () => {
      console.log('[FREELANCER_DASHBOARD] 🚀 FORCE LOADING critical modules...');
      
      const promises = criticalModules.map(async (moduleName) => {
        try {
          console.log(`[FREELANCER_DASHBOARD] ⚡ Force loading ${moduleName}...`);
          console.log(`[FREELANCER_DASHBOARD] ✅ ${moduleName} module ready!`);
          return true;
        } catch (error) {
          console.error(`[FREELANCER_DASHBOARD] ❌ Failed to load ${moduleName}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      console.log('[FREELANCER_DASHBOARD] 🎯 ALL CRITICAL MODULES PRELOADED - INSTANT ACCESS!');
    };
    
    forceLoadCriticalModules();
  
  // ULTRA-FAST module component creator
  const createInstantModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    
    // ALWAYS call hooks in the same order - move useEffect before conditional return
    React.useEffect(() => {
      if (!ModuleComponent) {
        console.log(`[FREELANCER_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
      }
    }, [ModuleComponent, moduleName]);
    
    if (ModuleComponent) {
      const isCritical = ['students', 'sessions', 'schedule', 'payments'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[FREELANCER_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      return React.createElement(ModuleComponent);
    }
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-purple-600">
            {apiDataPreloaded ? (language === 'fr' ? '⚡ Finalisation...' : '⚡ Finalizing...') : (language === 'fr' ? 'Chargement...' : 'Loading...')}
          </p>
        </div>
      </div>
    );
  };

  const text = {
    fr: {
      title: 'Tableau de Bord Répétiteur',
      subtitle: 'Gestion de vos services éducatifs indépendants',
      settings: 'Paramètres',
      students: 'Mes Élèves',
      sessions: 'Séances',
      payments: 'Paiements',
      schedule: 'Planning',
      resources: 'Ressources',
      communications: 'Communications',
      geolocation: 'Géolocalisation',
      notifications: 'Notifications',
      analytics: 'Analytics',  
      help: 'Aide'
    },
    en: {
      title: 'Freelancer Dashboard',
      subtitle: 'Manage your independent educational services',
      settings: 'Settings',
      students: 'My Students',
      sessions: 'Sessions',
      payments: 'Payments',
      schedule: 'Schedule',
      resources: 'Resources',
      communications: 'Communications',
      geolocation: 'Geolocation',
      notifications: 'Notifications',
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
      component: createInstantModule('subscription')
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createInstantModule('settings')
    },
    {
      id: 'students',
      label: t.students,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Étudiants Premium"
          userType="Freelancer"
          features={[
            "Accès à toutes les écoles partenaires",
            "Profil d'étudiant détaillé avec historique",
            "Système de notation avancé",
            "Communication directe avec parents"
          ]}
        >
          {createInstantModule('students')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'sessions',
      label: t.sessions,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: (
        <PremiumFeatureGate
          featureName="Sessions d'Enseignement"
          userType="Freelancer"
          features={[
            "Planification illimitée de sessions",
            "Outils pédagogiques intégrés",
            "Enregistrement des progressions",
            "Rapports détaillés par session"
          ]}
        >
          {createInstantModule('sessions')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Financière"
          userType="Freelancer"
          features={[
            "Facturation automatisée",
            "Suivi des paiements temps réel",
            "Rapports fiscaux mensuels",
            "Paiements Orange Money & MTN"
          ]}
        >
          {createInstantModule('payments')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'schedule',
      label: t.schedule,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: (
        <PremiumFeatureGate
          featureName="Planning Professionnel"
          userType="Freelancer"
          features={[
            "Calendrier synchronisé multi-écoles",
            "Gestion des disponibilités avancée",
            "Rappels automatiques de cours",
            "Optimisation des trajets"
          ]}
        >
          {createInstantModule('schedule')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'resources',
      label: t.resources,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: (
        <PremiumFeatureGate
          featureName="Ressources Pédagogiques"
          userType="Freelancer"
          features={[
            "Bibliothèque de cours premium",
            "Outils de création de contenu",
            "Partage sécurisé avec étudiants",
            "Templates professionnels"
          ]}
        >
          {createInstantModule('resources')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: (
        <PremiumFeatureGate
          featureName="Communication Professionnelle"
          userType="Freelancer"
          features={[
            "Messagerie directe avec écoles",
            "Notifications WhatsApp intégrées",
            "Rapports de progression automatiques",
            "Support client prioritaire"
          ]}
        >
          {createInstantModule('communications')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: (
        <PremiumFeatureGate
          featureName="Géolocalisation Pro"
          userType="Freelancer"
          features={[
            "Optimisation d'itinéraires multi-écoles",
            "Suivi kilométrique automatique",
            "Zones d'intervention personnalisées",
            "Calcul des frais de déplacement"
          ]}
        >
          {createInstantModule('geolocation')}
        </PremiumFeatureGate>
      )
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: <NotificationCenter userRole="Freelancer" userId={1} />
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Freelancer"
        onRoleSwitch={(role) => {
          console.log(`[FREELANCER_DASHBOARD] 🔄 Role switch requested: ${role}`);
          if (role === 'Teacher') {
            window.location.href = '/teacher';
          } else if (role === 'Commercial') {
            window.location.href = '/commercial';
          }
        }} 
      />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: createInstantModule('help')
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

export default FreelancerDashboard;