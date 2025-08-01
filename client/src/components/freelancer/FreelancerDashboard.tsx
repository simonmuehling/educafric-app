import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, Calendar, DollarSign, BarChart3, BookOpen, MessageSquare,
  Settings, Clock, MapPin, FileText, HelpCircle
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import FunctionalFreelancerProfile from './modules/FunctionalFreelancerProfile';
import FunctionalFreelancerStudents from './modules/FunctionalFreelancerStudents';
import FunctionalFreelancerSessions from './modules/FunctionalFreelancerSessions';
import FunctionalFreelancerPayments from './modules/FunctionalFreelancerPayments';
import FunctionalFreelancerSchedule from './modules/FunctionalFreelancerSchedule';
import FunctionalFreelancerResources from './modules/FunctionalFreelancerResources';
import FreelancerCommunications from './modules/FreelancerCommunications';
import FreelancerGeolocation from './modules/FreelancerGeolocation';
import HelpCenter from '@/components/help/HelpCenter';

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
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <FunctionalFreelancerProfile />
    },
    {
      id: 'students',
      label: t.students,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      component: <FunctionalFreelancerStudents />
    },
    {
      id: 'sessions',
      label: t.sessions,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: <FunctionalFreelancerSessions />
    },
    {
      id: 'payments',
      label: t.payments,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <FunctionalFreelancerPayments />
    },
    {
      id: 'schedule',
      label: t.schedule,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: <FunctionalFreelancerSchedule />
    },
    {
      id: 'resources',
      label: t.resources,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: <FunctionalFreelancerResources />
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: <FreelancerCommunications />
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: <FreelancerGeolocation />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: <HelpCenter userType="freelancer" />
    }
  ];

  return (
    <UnifiedIconDashboard
      title={t.title}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={activeModule}
    />
  );
};

export default FreelancerDashboard;