import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, Users, CreditCard, FileText, BarChart3, Phone, 
  Building2, Calendar, DollarSign, Target, UserCheck, Archive,
  MessageSquare, Settings, HelpCircle, User
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import { useFastModules } from '@/utils/fastModuleLoader';
// Optimized: Removed static imports - using dynamic loading only for better bundle size
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';

interface CommercialDashboardProps {
  activeModule?: string;
}

const CommercialDashboard = ({ activeModule }: CommercialDashboardProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = React.useState(false);
  
  // AGGRESSIVE API DATA PRELOADING - Commercial APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadCommercialApiData = async () => {
      console.log('[COMMERCIAL_DASHBOARD] 🚀 PRELOADING API DATA for instant access...');
      
      const apiEndpoints = [
        '/api/commercial/leads',
        '/api/commercial/appointments',
        '/api/commercial/schools',
        '/api/commercial/contacts',
        '/api/commercial/statistics',
        '/api/commercial/documents'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          console.log(`[COMMERCIAL_DASHBOARD] 📡 Preloading ${endpoint}...`);
          await queryClient.prefetchQuery({
            queryKey: [endpoint],
            queryFn: async () => {
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
          console.log(`[COMMERCIAL_DASHBOARD] ✅ ${endpoint} data cached!`);
          return true;
        } catch (error) {
          console.error(`[COMMERCIAL_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
      console.log('[COMMERCIAL_DASHBOARD] 🎯 ALL COMMERCIAL API DATA PRELOADED!');
    };
    
    preloadCommercialApiData();
  }, [user, queryClient]);
  
  // ULTRA-FAST module component creator
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['leads', 'appointments', 'schools', 'contacts', 'statistics', 'documents'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[COMMERCIAL_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      return React.createElement(ModuleComponent);
    }
    
    React.useEffect(() => {
      preloadModule(moduleName);
    }, []);
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-orange-600">
            {apiDataPreloaded ? (language === 'fr' ? '⚡ Finalisation...' : '⚡ Finalizing...') : (language === 'fr' ? 'Chargement...' : 'Loading...')}
          </p>
        </div>
      </div>
    );
  };

  // Preload modules when dashboard loads
  useEffect(() => {
    const criticalModules = [
      'DocumentsContracts', 'CommercialStatistics', 'ContactsManagement', 
      'MySchools', 'WhatsAppManager', 'CommercialCRM'
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
      settings: 'Settings',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'schools',
      label: t.mySchools,
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('schools')
    },
    {
      id: 'leads',
      label: t.leads,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('leads')
    },
    {
      id: 'contacts',
      label: t.contacts,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createDynamicModule('contacts')
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createDynamicModule('payments')
    },
    {
      id: 'documents',
      label: t.documents,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('documents')
    },
    {
      id: 'statistics',
      label: t.statistics,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('statistics')
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: createDynamicModule('reports')
    },
    {
      id: 'appointments',
      label: t.appointments,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createDynamicModule('appointments')
    },
    {
      id: 'whatsapp',
      label: t.whatsapp,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-green-600',
      component: createDynamicModule('whatsapp')
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-600',
      component: createDynamicModule('settings')
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Commercial"
        onRoleSwitch={(role) => {
          console.log(`[COMMERCIAL_DASHBOARD] 🔄 Role switch requested: ${role}`);
          if (role === 'Teacher') {
            window.location.href = '/teacher';
          } else if (role === 'Freelancer') {
            window.location.href = '/freelancer';
          }
        }} 
      />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-gray-500',
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

export default CommercialDashboard;