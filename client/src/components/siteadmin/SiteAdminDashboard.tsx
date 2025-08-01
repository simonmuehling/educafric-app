import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Settings, Users, Building2, Shield, BarChart3, CreditCard, 
  GraduationCap, FileText, MessageSquare, Database, MapPin, 
  UserCog, Monitor, Zap, Mail, HelpCircle, Archive
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import FunctionalSiteAdminDashboard from '../site-admin/modules/FunctionalSiteAdminDashboard';
import FunctionalSiteAdminUsers from '../site-admin/modules/FunctionalSiteAdminUsers';
import FunctionalSiteAdminSchools from '../site-admin/modules/FunctionalSiteAdminSchools';
import FunctionalSiteAdminSettings from '../site-admin/modules/FunctionalSiteAdminSettings';
import SecurityAudit from './modules/SecurityAudit';
import AnalyticsBusiness from './modules/AnalyticsBusiness';
import CommercialManagement from './modules/CommercialManagement';
import PaymentAdministration from './modules/PaymentAdministration';
import ContentManagement from './modules/ContentManagement';
import MultiRoleManagement from './modules/MultiRoleManagement';
import DocumentManagement from '../admin/modules/DocumentManagement';
import CommercialDocumentManagement from './CommercialDocumentManagement';
import EmailSystemManagement from './EmailSystemManagement';
import HelpCenter from '@/components/help/HelpCenter';

interface SiteAdminDashboardProps {
  activeModule?: string;
}

const SiteAdminDashboard = ({ activeModule }: SiteAdminDashboardProps) => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Tableau de Bord Admin Site',
      subtitle: 'Administration complète de la plateforme éducative',
      overview: 'Vue d\'ensemble',
      users: 'Utilisateurs',
      schools: 'Écoles',
      settings: 'Paramètres',
      commercial: 'Commercial',
      payments: 'Paiements',
      academic: 'Académique',
      security: 'Sécurité',
      content: 'Contenu',
      documents: 'Documents',
      commercialDocs: 'Documents Com.',
      communication: 'Communication',
      analytics: 'Analytics',
      data: 'Données',
      geolocation: 'Géolocalisation',
      emails: 'Système Email',
      help: 'Aide'
    },
    en: {
      title: 'Site Admin Dashboard',
      subtitle: 'Complete educational platform administration',
      overview: 'Overview',
      users: 'Users',
      schools: 'Schools',
      settings: 'Settings',
      commercial: 'Commercial',
      payments: 'Payments',
      academic: 'Academic',
      security: 'Security',
      content: 'Content',
      documents: 'Documents',
      commercialDocs: 'Commercial Docs',
      communication: 'Communication',
      analytics: 'Analytics',
      data: 'Data',
      geolocation: 'Geolocation',
      emails: 'Email System',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'overview',
      label: t.overview,
      icon: <Monitor className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <FunctionalSiteAdminDashboard />
    },
    {
      id: 'users',
      label: t.users,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      component: <FunctionalSiteAdminUsers />
    },
    {
      id: 'schools',
      label: t.schools,
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: <FunctionalSiteAdminSchools />
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-600',
      component: <FunctionalSiteAdminSettings />
    },
    {
      id: 'commercial',
      label: t.commercial,
      icon: <UserCog className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <CommercialManagement />
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <PaymentAdministration />
    },
    {
      id: 'security',
      label: t.security,
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: <SecurityAudit />
    },
    {
      id: 'analytics',
      label: t.analytics,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: <AnalyticsBusiness />
    },
    {
      id: 'content',
      label: t.content,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: <ContentManagement />
    },
    {
      id: 'documents',
      label: t.documents,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: <DocumentManagement />
    },
    {
      id: 'commercialDocs',
      label: t.commercialDocs,
      icon: <Archive className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: <CommercialDocumentManagement />
    },
    {
      id: 'communication',
      label: t.communication,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <EmailSystemManagement />
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

export default SiteAdminDashboard;