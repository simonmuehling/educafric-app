import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, Calendar, FileText, MessageSquare, User, Clock, 
  BarChart3, Award, Target, HelpCircle, MapPin, Settings
} from 'lucide-react';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import StudentTimetable from './modules/StudentTimetable';
import StudentGrades from './modules/StudentGrades';
import StudentHomework from './modules/StudentHomework';
import StudentCommunications from './modules/StudentCommunications';
import FunctionalStudentProfile from './modules/FunctionalStudentProfile';
import FunctionalStudentBulletins from './modules/FunctionalStudentBulletins';
import FunctionalStudentAttendance from './modules/FunctionalStudentAttendance';
import FunctionalStudentClasses from './modules/FunctionalStudentClasses';
import StudentProgress from './modules/StudentProgress';

// import StudentAchievements from './modules/StudentAchievements';
import HelpCenter from '@/components/help/HelpCenter';
import StudentSettings from './modules/StudentSettings';

interface StudentDashboardProps {
  activeModule?: string;
}

const StudentDashboard = ({ activeModule }: StudentDashboardProps) => {
  const { language } = useLanguage();
  const [currentActiveModule, setCurrentActiveModule] = useState(activeModule);

  // Add event listeners for navigation from child components (if needed in future)
  useEffect(() => {
    const handleSwitchToTimetable = () => {
      console.log('[STUDENT_DASHBOARD] 📅 Event received: switchToTimetable');
      setCurrentActiveModule('timetable');
    };

    const handleSwitchToGrades = () => {
      console.log('[STUDENT_DASHBOARD] 📊 Event received: switchToGrades');
      setCurrentActiveModule('grades');
    };

    const handleSwitchToMessages = () => {
      console.log('[STUDENT_DASHBOARD] 💬 Event received: switchToMessages');
      setCurrentActiveModule('messages');
    };

    const handleSwitchToAttendance = () => {
      console.log('[STUDENT_DASHBOARD] 📋 Event received: switchToAttendance');
      setCurrentActiveModule('attendance');
    };

    // Register event listeners
    window.addEventListener('switchToTimetable', handleSwitchToTimetable);
    window.addEventListener('switchToGrades', handleSwitchToGrades);
    window.addEventListener('switchToMessages', handleSwitchToMessages);
    window.addEventListener('switchToAttendance', handleSwitchToAttendance);

    return () => {
      window.removeEventListener('switchToTimetable', handleSwitchToTimetable);
      window.removeEventListener('switchToGrades', handleSwitchToGrades);
      window.removeEventListener('switchToMessages', handleSwitchToMessages);
      window.removeEventListener('switchToAttendance', handleSwitchToAttendance);
    };
  }, []);

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
      settings: 'Paramètres',
      help: 'Aide'
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
      settings: 'Settings',
      help: 'Help'
    }
  };

  const t = text[language as keyof typeof text];

  const modules = [
    {
      id: 'timetable',
      label: t.timetable,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-500',
      component: <FunctionalStudentClasses />
    },
    {
      id: 'grades',
      label: t.grades,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-green-500',
      component: <StudentGrades />
    },
    {
      id: 'assignments',
      label: t.assignments,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
      component: <StudentHomework />
    },
    {
      id: 'bulletins',
      label: t.notes,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-orange-500',
      component: <FunctionalStudentBulletins />
    },
    {
      id: 'attendance',
      label: t.attendance,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      component: <FunctionalStudentAttendance />
    },
    {
      id: 'progress',
      label: t.library,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-yellow-500',
      component: <StudentProgress />
    },
    {
      id: 'messages',
      label: t.messages,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      component: <StudentCommunications />
    },
    {
      id: 'achievements',
      label: t.achievements,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-red-500',
      component: <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Réussites</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium">Excellent Élève</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Moyenne générale de 17/20</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium">Participation Active</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">95% de présence</p>
          </div>
        </div>
      </div>
    },
    {
      id: 'profile',
      label: t.profile,
      icon: <User className="w-6 h-6" />,
      color: 'bg-teal-500',
      component: <FunctionalStudentProfile />
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500',
      component: <StudentSettings />
    },
    {
      id: 'help',
      label: t.help,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-slate-500',
      component: <HelpCenter userType="student" />
    },
    {
      id: 'geolocation',
      label: 'Géolocalisation',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-emerald-500',
      component: <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Géolocalisation Parent</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Votre localisation est suivie par vos parents pour votre sécurité.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Statut:</span>
              <span className="text-sm font-medium text-green-600">Activé</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Zone actuelle:</span>
              <span className="text-sm font-medium">École</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Dernière mise à jour:</span>
              <span className="text-sm font-medium">Il y a 2 min</span>
            </div>
          </div>
        </div>
      </div>
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

export default StudentDashboard;