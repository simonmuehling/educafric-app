import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, Calendar, CheckSquare, BarChart3, BookOpen, FileText,
  MessageSquare, User, Clock, Settings, HelpCircle, MapPin, Bell
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import FunctionalTeacherClasses from './modules/FunctionalTeacherClasses';
import FunctionalTeacherAttendance from './modules/FunctionalTeacherAttendance';
import FunctionalTeacherGrades from './modules/FunctionalTeacherGrades';
import FunctionalTeacherAssignments from './modules/FunctionalTeacherAssignments';
import CreateEducationalContent from './modules/CreateEducationalContent';
import ReportCardManagement from './modules/ReportCardManagement';
import FunctionalTeacherCommunications from './modules/FunctionalTeacherCommunications';
import TeacherTimetable from './modules/TeacherTimetable';
import FunctionalTeacherProfile from './modules/FunctionalTeacherProfile';
import TeacherMultiRoleSwitch from './modules/TeacherMultiRoleSwitch';
import HelpCenter from '@/components/help/HelpCenter';
import NotificationCenter from '@/components/shared/NotificationCenter';

interface TeacherDashboardProps {
  stats?: any;
  activeModule?: string;
}

const TeacherDashboard = ({ stats, activeModule }: TeacherDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState<string>(activeModule || '');

  // Event listeners for navigation between modules
  useEffect(() => {
    const handleSwitchToAttendance = () => {
      console.log('[TEACHER_DASHBOARD] 📋 Event received: switchToAttendance');
      setCurrentActiveModule('attendance');
    };

    const handleSwitchToGrades = () => {
      console.log('[TEACHER_DASHBOARD] 📊 Event received: switchToGrades');
      setCurrentActiveModule('grades');
    };

    const handleSwitchToCommunications = () => {
      console.log('[TEACHER_DASHBOARD] 💬 Event received: switchToCommunications');
      setCurrentActiveModule('communications');
    };

    const handleSwitchToClasses = () => {
      console.log('[TEACHER_DASHBOARD] 👥 Event received: switchToClasses');
      setCurrentActiveModule('classes');
    };

    const handleSwitchToTimetable = () => {
      console.log('[TEACHER_DASHBOARD] 📅 Event received: switchToTimetable');
      setCurrentActiveModule('timetable');
    };

    // Add event listeners
    window.addEventListener('switchToAttendance', handleSwitchToAttendance);
    window.addEventListener('switchToGrades', handleSwitchToGrades);
    window.addEventListener('switchToCommunications', handleSwitchToCommunications);
    window.addEventListener('switchToClasses', handleSwitchToClasses);
    window.addEventListener('switchToTimetable', handleSwitchToTimetable);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('switchToAttendance', handleSwitchToAttendance);
      window.removeEventListener('switchToGrades', handleSwitchToGrades);
      window.removeEventListener('switchToCommunications', handleSwitchToCommunications);
      window.removeEventListener('switchToClasses', handleSwitchToClasses);
      window.removeEventListener('switchToTimetable', handleSwitchToTimetable);
    };
  }, []);

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
      component: <FunctionalTeacherAttendance />
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
      component: <FunctionalTeacherCommunications />
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
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-600',
      component: <TeacherMultiRoleSwitch onRoleSwitch={(role) => {
        console.log(`[TEACHER_DASHBOARD] 🔄 Role switch requested: ${role}`);
        // Handle role switch logic here
        if (role === 'Parent') {
          window.location.href = '/parent';
        } else if (role === 'Freelancer') {
          window.location.href = '/freelancer';
        }
      }} />
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: <FunctionalTeacherProfile />
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
    <UnifiedIconDashboard
      title={t.title || ''}
      subtitle={t.subtitle}
      modules={modules}
      activeModule={currentActiveModule}
    />
  );
};

export default TeacherDashboard;