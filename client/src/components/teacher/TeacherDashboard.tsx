import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStableEventHandler } from '@/hooks/useStableCallback';
import { 
  Users, Calendar, CheckSquare, BarChart3, BookOpen, FileText,
  MessageSquare, User, Clock, Settings, HelpCircle, MapPin, Bell, Star, Mail
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import FunctionalTeacherClasses from './modules/FunctionalTeacherClasses';
import AttendanceManagement from './modules/AttendanceManagement';
import FunctionalTeacherGrades from './modules/FunctionalTeacherGrades';
import FunctionalTeacherAssignments from './modules/FunctionalTeacherAssignments';
import CreateEducationalContent from './modules/CreateEducationalContent';
import ReportCardManagement from './modules/ReportCardManagement';
import EnhancedTeacherCommunications from './modules/EnhancedTeacherCommunications';
import TeacherTimetable from './modules/TeacherTimetable';
import FunctionalTeacherProfile from './modules/FunctionalTeacherProfile';
import UniversalMultiRoleSwitch from '@/components/shared/UniversalMultiRoleSwitch';
import HelpCenter from '@/components/help/HelpCenter';
import NotificationCenter from '@/components/shared/NotificationCenter';
import SubscriptionStatusCard from '@/components/shared/SubscriptionStatusCard';
import { TeacherMultiSchoolProvider } from '@/contexts/TeacherMultiSchoolContext';

interface TeacherDashboardProps {
  stats?: any;
  activeModule?: string;
}

const TeacherDashboard = ({ stats, activeModule }: TeacherDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState<string>(activeModule || '');

  // Stable event handlers that survive server restarts
  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 📋 Event received: switchToAttendance');
    setCurrentActiveModule('attendance');
  }, 'switchToAttendance');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 📊 Event received: switchToGrades');
    setCurrentActiveModule('grades');
  }, 'switchToGrades');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 💬 Event received: switchToCommunications');
    setCurrentActiveModule('communications');
  }, 'switchToCommunications');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 👥 Event received: switchToClasses');
    setCurrentActiveModule('classes');
  }, 'switchToClasses');

  useStableEventHandler(() => {
    console.log('[TEACHER_DASHBOARD] 📅 Event received: switchToTimetable');
    setCurrentActiveModule('timetable');
  }, 'switchToTimetable');

  const text = {
    fr: {
      title: 'Tableau de Bord Enseignant',
      subtitle: 'Gestion complète de vos classes et élèves',
      classes: 'Mes Classes',
      timetable: 'Emploi du temps',
      attendance: 'Présences',
      grades: 'Notes',
      assignments: 'Devoirs',
      content: 'Contenu Pédagogique',
      reports: 'Bulletins',
      communications: 'Communications',
      profile: 'Profil',
      multirole: 'Multi-Rôles',
      notifications: 'Notifications',
      help: 'Aide'
    },
    en: {
      title: 'Teacher Dashboard',
      subtitle: 'Complete management of your classes and students',
      classes: 'My Classes',
      timetable: 'Timetable',
      attendance: 'Attendance',
      grades: 'Grades',
      assignments: 'Assignments',
      content: 'Educational Content',
      reports: 'Report Cards',
      communications: 'Communications',
      profile: 'Profile',
      notifications: 'Notifications',
      multirole: 'Multi-Roles',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'classes',
      label: t.classes,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <FunctionalTeacherClasses />
    },
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-green-500',
      component: <TeacherTimetable />
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: <AttendanceManagement />
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <FunctionalTeacherGrades />
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: <FunctionalTeacherAssignments />
    },
    {
      id: 'content',
      label: t.content,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: <CreateEducationalContent />
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: <ReportCardManagement />
    },
    {
      id: 'communications',
      label: t.communications,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <EnhancedTeacherCommunications />
    },

    {
      id: 'geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Géolocalisation Élèves</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Suivi de localisation de vos élèves pour leur sécurité.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Junior Kamga (6ème A)</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">À l'école</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Marie Nkomo (5ème B)</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">En route</span>
            </div>
          </div>
        </div>
      </div>
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600',
      component: <NotificationCenter userRole="Teacher" userId={1} />
    },
    {
      id: 'multirole',
      label: t.multirole,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <UniversalMultiRoleSwitch 
        currentUserRole="Teacher"
        onRoleSwitch={(role) => {
          console.log(`[TEACHER_DASHBOARD] 🔄 Role switch requested: ${role}`);
          // Handle role switch logic here
          if (role === 'Parent') {
            window.location.href = '/parent';
          } else if (role === 'Freelancer') {
            window.location.href = '/freelancer';
          }
        }} 
      />
    },
    {
      id: 'profile',
      label: 'PROFIL',
      icon: <User className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: <FunctionalTeacherProfile />
    },
    {
      id: 'email-settings',
      label: language === 'fr' ? 'Préférences Email' : 'Email Settings',
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: (
        <div className="p-6">
          <div className="text-center">
            <Mail className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'fr' ? 'Gérez vos préférences email' : 'Manage your email preferences'}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === 'fr' 
                ? 'Configurez quels emails vous souhaitez recevoir'
                : 'Configure which emails you want to receive'
              }
            </p>
            <button 
              onClick={() => window.location.href = '/profile-settings'}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
              data-testid="button-open-email-settings"
            >
              {language === 'fr' ? 'Ouvrir les paramètres' : 'Open Settings'}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <HelpCenter userType="teacher" />
    }
  ];

  return (
    <TeacherMultiSchoolProvider>
      <UnifiedIconDashboard
        title={t.title || ''}
        subtitle={t.subtitle}
        modules={modules}
        activeModule={currentActiveModule}
      />
    </TeacherMultiSchoolProvider>
  );
};

export default TeacherDashboard;