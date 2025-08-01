import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, Settings, BookOpen, MessageSquare,
  Calendar, FileText, Clock, Bell, DollarSign,
  MapPin, Award, Users, Smartphone, User, GraduationCap,
  CheckCircle2, AlertCircle, Target, Star, CreditCard, HelpCircle,
  ChevronDown
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import ChildrenManagement from './modules/ChildrenManagement';
import ParentCommunicationsBidirectional from './modules/ParentCommunicationsBidirectional';
import FunctionalParentProfile from './modules/FunctionalParentProfile';
import { WhatsAppNotifications } from './modules/WhatsAppNotifications';

import { ParentGeolocation } from './modules/ParentGeolocation';
import HelpCenter from '@/components/help/HelpCenter';

// Import new functional modules
import FunctionalParentChildren from './modules/FunctionalParentChildren';
import FunctionalParentMessages from './modules/FunctionalParentMessages';
import FunctionalParentGrades from './modules/FunctionalParentGrades';
import FunctionalParentAttendance from './modules/FunctionalParentAttendance';
import FunctionalParentPayments from './modules/FunctionalParentPayments';

interface ParentDashboardProps {
  activeModule?: string;
}

const ParentDashboard = ({ activeModule }: ParentDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);

  // Add event listeners for navigation from child components
  useEffect(() => {
    const handleSwitchToGrades = () => {
      console.log('[PARENT_DASHBOARD] 📊 Event received: switchToGrades');
      setCurrentActiveModule('grades');
    };

    const handleSwitchToAttendance = () => {
      console.log('[PARENT_DASHBOARD] 📋 Event received: switchToAttendance');
      setCurrentActiveModule('attendance');
    };

    const handleSwitchToMessages = () => {
      console.log('[PARENT_DASHBOARD] 💬 Event received: switchToMessages');
      setCurrentActiveModule('messages');
    };

    // Register event listeners
    window.addEventListener('switchToGrades', handleSwitchToGrades);
    window.addEventListener('switchToAttendance', handleSwitchToAttendance);
    window.addEventListener('switchToMessages', handleSwitchToMessages);

    return () => {
      window.removeEventListener('switchToGrades', handleSwitchToGrades);
      window.removeEventListener('switchToAttendance', handleSwitchToAttendance);
      window.removeEventListener('switchToMessages', handleSwitchToMessages);
    };
  }, []);
  
  const text = {
    fr: {
      title: 'Tableau de Bord Parent',
      subtitle: 'Suivi complet de l\'éducation de vos enfants',
      overview: 'Aperçu',
      settings: 'Profil',
      myChildren: 'Mes Enfants',
      timetable: 'Emploi du Temps',
      results: 'Résultats',
      homework: 'Devoirs',
      communications: 'Communications',
      notifications: 'Notifications',
      whatsapp: 'WhatsApp (Bientôt)',
      attendance: 'Suivi de Présence',
      geolocation: 'Géolocalisation Enfants',
      help: 'Aide'
    },
    en: {
      title: 'Parent Dashboard',
      subtitle: 'Complete educational monitoring for your children',
      overview: 'Overview',
      settings: 'Profile',
      myChildren: 'My Children',
      timetable: 'Timetable',
      results: 'Results',
      homework: 'Homework',
      communications: 'Communications',
      notifications: 'Notifications',
      whatsapp: 'WhatsApp (Soon)',
      attendance: 'Attendance',
      geolocation: 'Children Geolocation',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'children',
      label: t.myChildren,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <FunctionalParentChildren />
    },
    {
      id: 'messages',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: <FunctionalParentMessages />
    },
    {
      id: 'grades',
      label: t.results,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      component: <FunctionalParentGrades />
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <FunctionalParentAttendance />
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <FunctionalParentPayments />
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <ParentGeolocation />
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: <FunctionalParentProfile />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-cyan-500',
      component: <HelpCenter userType="parent" />
    }
  ];

  return (
    <UnifiedIconDashboard
      title={t.title}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={currentActiveModule || activeModule}
    />
  );
};

export default ParentDashboard;