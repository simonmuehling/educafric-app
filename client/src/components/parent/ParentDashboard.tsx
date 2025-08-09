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
import ParentProfile from './modules/ParentProfile';
import { WhatsAppNotifications } from './modules/WhatsAppNotifications';

import { ParentGeolocation } from './modules/ParentGeolocation';
import HelpCenter from '@/components/help/HelpCenter';

// Import new functional modules
import FunctionalParentChildren from './modules/FunctionalParentChildren';
import FunctionalParentMessages from './modules/FunctionalParentMessages';
import FunctionalParentGrades from './modules/FunctionalParentGrades';
import FunctionalParentAttendance from './modules/FunctionalParentAttendance';
import FunctionalParentPayments from './modules/FunctionalParentPayments';

// Import Premium components
import PremiumFeatureGate from '@/components/premium/PremiumFeatureGate';
import ParentRequestManager from './modules/ParentRequestManager';
import NotificationCenter from '@/components/shared/NotificationCenter';
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';

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
      requests: 'Demandes Parents',
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
      requests: 'Parent Requests',
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
      component: (
        <PremiumFeatureGate
          featureName="Messages Enseignants"
          userType="Parent"
          features={[
            "Communication directe avec les enseignants",
            "Notifications push instantanées",
            "Historique complet des conversations",
            "Pièces jointes et photos"
          ]}
        >
          <FunctionalParentMessages />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'grades',
      label: t.results,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      component: (
        <PremiumFeatureGate
          featureName="Bulletins & Notes Détaillés"
          userType="Parent"
          features={[
            "Bulletins avec graphiques détaillés",
            "Analyse de progression par matière",
            "Comparaison avec la moyenne de classe",
            "Téléchargement PDF professionnel"
          ]}
        >
          <FunctionalParentGrades />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: (
        <PremiumFeatureGate
          featureName="Suivi Présence Avancé"
          userType="Parent"
          features={[
            "Alertes absence en temps réel",
            "Historique de présence détaillé",
            "Justification d'absence en ligne",
            "Rapport mensuel automatique"
          ]}
        >
          <FunctionalParentAttendance />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-red-500',
      component: (
        <PremiumFeatureGate
          featureName="Gestion Paiements"
          userType="Parent"
          features={[
            "Paiements Orange Money & MTN",
            "Historique complet des factures",
            "Rappels automatiques d'échéance",
            "Reçus PDF téléchargeables"
          ]}
        >
          <FunctionalParentPayments />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'geolocation',
      label: t.geolocation,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: (
        <PremiumFeatureGate
          featureName="Géolocalisation Premium"
          userType="Parent"
          features={[
            "Suivi GPS temps réel de votre enfant",
            "Zones de sécurité personnalisées",
            "Alertes d'arrivée/départ école",
            "Historique des déplacements"
          ]}
        >
          <ParentGeolocation />
        </PremiumFeatureGate>
      )
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: <NotificationCenter userRole="Parent" userId={1} />
    },
    {
      id: 'requests',
      label: t.requests,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <ParentRequestManager />
    },
    {
      id: 'profile',
      label: 'PROFIL',
      icon: <User className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: <ParentProfile />
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Parent"
        onRoleSwitch={(role) => {
          console.log(`[PARENT_DASHBOARD] 🔄 Role switch requested: ${role}`);
          if (role === 'Teacher') {
            window.location.href = '/teacher';
          } else if (role === 'Student') {
            window.location.href = '/student';
          }
        }} 
      />
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
      title={t.title || ''}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={currentActiveModule || activeModule}
    />
  );
};

export default ParentDashboard;