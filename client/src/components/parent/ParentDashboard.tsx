import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, MessageSquare,
  Calendar, FileText, Bell,
  MapPin, Users, User, GraduationCap,
  CheckCircle2, Star, CreditCard, HelpCircle,
  Heart, Video, UtensilsCrossed, Bus
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';

interface ParentDashboardProps {
  activeModule?: string;
}

const ParentDashboard = ({ activeModule }: ParentDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);
  
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
      help: 'Aide',
      canteen: 'Cantine Enfants',
      bus: 'Transport Scolaire'
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
      help: 'Help',
      canteen: 'Children Canteen',
      bus: 'School Bus'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'subscription',
      label: language === 'fr' ? 'Mon Abonnement' : 'My Subscription',
      icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      id: 'family',
      label: language === 'fr' ? 'Connexions Familiales' : 'Family Connections',
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'children',
      label: t.myChildren,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'parent-messages',
      label: t.communications,
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'parent-library',
      label: language === 'fr' ? 'Bibliothèque' : 'Library',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'parent-online-classes',
      label: language === 'fr' ? 'Classes en Ligne' : 'Online Classes',
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'parent-private-courses',
      label: language === 'fr' ? 'Cours Privés Enfants' : 'Children Private Courses',
      icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-indigo-600'
    },
    {
      id: 'parent-attendance',
      label: t.attendance,
      icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'parent-timetable',
      label: language === 'fr' ? 'Emploi du Temps Enfants' : 'Children Timetable',
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'canteen',
      label: t.canteen,
      icon: <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      id: 'bus',
      label: t.bus,
      icon: <Bus className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-blue-600'
    },
    {
      id: 'requests',
      label: t.requests,
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'parent-settings',
      label: language === 'fr' ? 'Paramètres Parent' : 'Parent Settings',
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-gray-500'
    },
    {
      id: 'multirole',
      label: language === 'fr' ? 'Changer de Rôle' : 'Switch Role',
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-purple-600'
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'bg-cyan-500'
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