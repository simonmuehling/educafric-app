import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFastModules } from '@/utils/fastModuleLoader';
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
  const { getModule, preloadModule } = useFastModules();
  
  // Dynamic module component creator (same as DirectorDashboard)
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
      component: createDynamicModule('subscription')
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('settings')
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
          {createDynamicModule('students')}
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
          {createDynamicModule('sessions')}
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
          {createDynamicModule('payments')}
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
          {createDynamicModule('schedule')}
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
          {createDynamicModule('resources')}
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
          {createDynamicModule('communications')}
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
          {createDynamicModule('geolocation')}
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
      component: createDynamicModule('help')
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