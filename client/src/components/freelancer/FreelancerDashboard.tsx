import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, Calendar, DollarSign, BarChart3, BookOpen, MessageSquare,
  Settings, Clock, MapPin, FileText, HelpCircle, Bell, User, Star
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';

interface FreelancerDashboardProps {
  stats?: any;
  activeModule?: string;
}

const FreelancerDashboard = ({ stats, activeModule }: FreelancerDashboardProps) => {
  const { language } = useLanguage();

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
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      id: 'freelancer-settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'freelancer-students',
      label: t.students,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'sessions',
      label: t.sessions,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'schedule',
      label: t.schedule,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'resources',
      label: t.resources,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'freelancer-communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-teal-500'
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600'
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
      color: 'bg-cyan-500'
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