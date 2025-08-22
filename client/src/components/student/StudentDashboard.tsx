import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler, useStableCallback } from '@/hooks/useStableCallback';
import { useFastModules } from '@/utils/fastModuleLoader';
import { 
  BookOpen, Calendar, FileText, MessageSquare, User, Clock, 
  BarChart3, Award, Target, HelpCircle, MapPin, Settings, Bell, Star, Heart
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
// Optimized: All modules loaded dynamically for ultra-fast loading
import SubscriptionStatusCard from '@/components/shared/SubscriptionStatusCard';

interface StudentDashboardProps {
  activeModule?: string;
}

const StudentDashboard = ({ activeModule }: StudentDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);
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

  // Stable event handlers that survive server restarts
  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 📅 Event received: switchToTimetable');
    setCurrentActiveModule('timetable');
  }, 'switchToTimetable');

  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 📊 Event received: switchToGrades');
    setCurrentActiveModule('grades');
  }, 'switchToGrades');

  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 💬 Event received: switchToMessages');
    setCurrentActiveModule('messages');
  }, 'switchToMessages');

  useStableEventHandler(() => {
    console.log('[STUDENT_DASHBOARD] 📋 Event received: switchToAttendance');
    setCurrentActiveModule('attendance');
  }, 'switchToAttendance');

  const text = {
    fr: {
      title: 'Tableau de Bord Étudiant',
      subtitle: 'Votre espace personnel d\'apprentissage',
      timetable: 'Emploi du temps',
      grades: 'Notes',
      assignments: 'Devoirs',
      notes: 'Mes Notes',
      attendance: 'Présences',
      library: 'Bibliothèque',
      messages: 'Messages',
      achievements: 'Réussites',
      profile: 'Profil',
      notifications: 'Notifications',
      settings: 'Paramètres',
      help: 'Aide',
      parentConnection: 'Trouver mes parents'
    },
    en: {
      title: 'Student Dashboard',
      subtitle: 'Your personal learning space',
      timetable: 'Timetable',
      grades: 'Grades',
      assignments: 'Assignments',
      notes: 'My Notes',
      attendance: 'Attendance',
      library: 'Library',
      messages: 'Messages',
      achievements: 'Achievements',
      profile: 'Profile',
      notifications: 'Notifications',
      settings: 'Settings',
      help: 'Help',
      parentConnection: 'Find my parents'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: createDynamicModule('timetable')
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-green-500',
      component: createDynamicModule('grades')
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: createDynamicModule('assignments')
    },
    {
      id: 'bulletins',
      label: t.notes,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: createDynamicModule('bulletins')
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: createDynamicModule('attendance')
    },
    {
      id: 'progress',
      label: t.library,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: createDynamicModule('progress')
    },
    {
      id: 'messages',
      label: t.messages,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: createDynamicModule('messages')
    },
    {
      id: 'parentConnection',
      label: t.parentConnection,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-pink-600',
      component: createDynamicModule('parentConnection')
    },
    {
      id: 'achievements',
      label: t.achievements,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-red-500',
      component: createDynamicModule('achievements')
    },
    {
      id: 'profile',
      label: language === 'fr' ? 'Paramètres Étudiant' : 'Student Settings',
      icon: <User className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: createDynamicModule('profile')
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-slate-500',
      component: createDynamicModule('help')
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: createDynamicModule('notifications')
    },
    {
      id: 'geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: createDynamicModule('student-geolocation')
    },
    {
      id: 'multirole',
      label: 'Multi-Rôles',
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: createDynamicModule('multirole')
    }
  ];

  return (
    <div data-testid="dashboard-overview">
      <UnifiedIconDashboard
        title={t.title || ''}
        subtitle={t.subtitle}
        modules={modules}
        activeModule={currentActiveModule || activeModule}
      />
    </div>
  );
};

export default StudentDashboard;