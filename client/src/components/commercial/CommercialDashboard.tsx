import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, Users, CreditCard, FileText, BarChart3, Phone, 
  Building2, Calendar, DollarSign, Target, UserCheck, Archive,
  MessageSquare, Settings, HelpCircle, User, Activity, Mail, Bell, WifiOff
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import { useFastModules } from '@/utils/fastModuleLoader';
import ActivitySummary from './modules/ActivitySummary';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
// UniversalMultiRoleSwitch now loaded dynamically via fastModuleLoader

interface CommercialDashboardProps {
  activeModule?: string;
}

const CommercialDashboard = ({ activeModule }: CommercialDashboardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = React.useState(false);
  
  // PRELOADING DISABLED - Load on-demand for instant dashboard
  // Previously: 7 APIs + 6 modules = slow initial load
  React.useEffect(() => {
    setApiDataPreloaded(true);
  }, []);
  
  // MODULE PRELOADING DISABLED - Load on-demand only via UnifiedIconDashboard

  // Preload modules when dashboard loads (LEGACY - keeping for compatibility)
  useEffect(() => {
    const criticalModules = [
      'commercial-documents', 'commercial-statistics', 'commercial-contacts', 
      'commercial-schools', 'commercial-whatsapp'
    ];
    
    criticalModules.forEach(module => {
      preloadModule(module);
    });
  }, [preloadModule]);
  
  const text = {
    fr: {
      title: 'Tableau de Bord Commercial',
      subtitle: 'Gestion des ventes et relations clients éducatives',
      overview: 'Aperçu',
      mySchools: 'Mes Écoles',
      leads: 'Prospects',
      contacts: 'Contacts',
      payments: 'Paiements',
      documents: 'Documents',
      statistics: 'Statistiques',
      reports: 'Rapports',
      appointments: 'Rendez-vous',
      whatsapp: 'WhatsApp Business',
      offerLetters: 'Lettres d\'Offres',
      settings: 'Paramètres',
      help: 'Aide'
    },
    en: {
      title: 'Commercial Dashboard',
      subtitle: 'Sales management and educational client relationships',
      overview: 'Overview',
      mySchools: 'My Schools',
      leads: 'Leads',
      contacts: 'Contacts',
      payments: 'Payments',
      documents: 'Documents',
      statistics: 'Statistics',
      reports: 'Reports',
      appointments: 'Calls & Appointments',
      whatsapp: 'WhatsApp Business',
      offerLetters: 'Offer Letters',
      settings: 'Settings',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'commercial-schools',
      label: t.mySchools,
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'leads',
      label: t.leads,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'commercial-contacts',
      label: t.contacts,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'commercial-documents',
      label: t.documents,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'commercial-statistics',
      label: t.statistics,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'appointments',
      label: t.appointments,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'commercial-whatsapp',
      label: t.whatsapp,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-green-600'
    },
    {
      id: 'offer-letters',
      label: t.offerLetters,
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'activity-summary',
      label: language === 'fr' ? 'Mon Activité' : 'My Activity',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'commercial-notifications',
      label: language === 'fr' ? 'Notifications' : 'Notifications',
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-orange-600'
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-600'
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-gray-500'
    },
    {
      id: 'offline-premium-guide',
      label: language === 'fr' ? 'Guide Offline Premium' : 'Offline Premium Guide',
      icon: <WifiOff className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-green-600 to-emerald-600'
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

export default CommercialDashboard;