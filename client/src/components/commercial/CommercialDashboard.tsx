import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, Users, CreditCard, FileText, BarChart3, Phone, 
  Building2, Calendar, DollarSign, Target, UserCheck, Archive,
  MessageSquare, Settings, HelpCircle, User
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import MySchoolsModule from './modules/MySchoolsModule';
import CommercialCRM from './modules/CommercialCRM';
import ContactsManagement from './modules/ContactsManagement';
import PaymentConfirmation from './modules/PaymentConfirmation';
import DocumentsContracts from './modules/DocumentsContracts';
import CommercialStatistics from './modules/CommercialStatistics';
import CallsAppointments from './modules/CallsAppointments';
import Messages from './modules/Messages';
import WhatsAppManager from './modules/WhatsAppManager';
import HelpCenter from '@/components/help/HelpCenter';
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';
import FunctionalCommercialSchools from './modules/FunctionalCommercialSchools';
import FunctionalCommercialLeads from './modules/FunctionalCommercialLeads';
import FunctionalCommercialReports from './modules/FunctionalCommercialReports';
import FunctionalCommercialSettings from './modules/FunctionalCommercialSettings';
import FunctionalCommercialAppointments from './modules/FunctionalCommercialAppointments';
import FunctionalCommercialWhatsApp from './modules/FunctionalCommercialWhatsApp';
import FunctionalCommercialStatistics from './modules/FunctionalCommercialStatistics';

interface CommercialDashboardProps {
  activeModule?: string;
}

const CommercialDashboard = ({ activeModule }: CommercialDashboardProps) => {
  const { language } = useLanguage();
  
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
      component: <FunctionalCommercialSchools />
    },
    {
      id: 'leads',
      label: t.leads,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <FunctionalCommercialLeads />
    },
    {
      id: 'contacts',
      label: t.contacts,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      component: <ContactsManagement />
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: <PaymentConfirmation />
    },
    {
      id: 'documents',
      label: t.documents,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <DocumentsContracts />
    },
    {
      id: 'statistics',
      label: t.statistics,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <FunctionalCommercialStatistics />
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: <FunctionalCommercialReports />
    },
    {
      id: 'appointments',
      label: t.appointments,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: <FunctionalCommercialAppointments />
    },
    {
      id: 'whatsapp',
      label: t.whatsapp,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-green-600',
      component: <FunctionalCommercialWhatsApp />
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-600',
      component: <FunctionalCommercialSettings />
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
      component: <HelpCenter userType="school" />
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