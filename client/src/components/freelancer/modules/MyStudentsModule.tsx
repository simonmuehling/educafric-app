import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { User, BookOpen, Clock, TrendingUp, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyStudentsModule = () => {
  const { language } = useLanguage();

  const students = [
    {
      id: 1,
      name: 'Jean Mbarga',
      subject: 'Mathématiques',
      level: '5ème',
      sessionHours: 24,
      progress: 85,
      nextSession: '2024-01-25 14h00'
    },
    {
      id: 2,
      name: 'Marie Nkomo', 
      subject: 'Français',
      level: '3ème',
      sessionHours: 18,
      progress: 92,
      nextSession: '2024-01-26 10h00'
    },
    {
      id: 3,
      name: 'Paul Kamga',
      subject: 'Sciences',
      level: 'Terminale',
      sessionHours: 32,
      progress: 78,
      nextSession: '2024-01-25 16h00'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Élèves Actifs' : 'Active Students'}
          value={(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0).toString()}
          icon={<User className="w-5 h-5" />}
          gradient="blue"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Heures Totales' : 'Total Hours'}
          value={(Array.isArray(students) ? students : []).reduce((acc, s) => acc + s.sessionHours, 0).toString()}
          icon={<Clock className="w-5 h-5" />}
          gradient="green"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Matières' : 'Subjects'}
          value={new Set((Array.isArray(students) ? students : []).map(s => s.subject)).size.toString()}
          icon={<BookOpen className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Progrès Moyen' : 'Average Progress'}
          value={`${Math.round((Array.isArray(students) ? students : []).reduce((acc, s) => acc + s.progress, 0) / (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0))}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="orange"
          trend={{ value: 5.2, isPositive: true }}
        />
      </div>

      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Mes Élèves' : 'My Students'}
        </h3>
        <div className="space-y-4">
          {(Array.isArray(students) ? students : []).map((student, index) => (
            <div key={student.id} className={`activity-card-${['blue', 'green', 'purple'][index % 3]} p-6 rounded-xl transition-all duration-300 hover:scale-102`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{student.name || ''}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">  
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Matière' : 'Subject'}</p>
                      <p className="font-semibold text-gray-800">{student.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Niveau' : 'Level'}</p>
                      <p className="font-semibold text-gray-800">{student.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Heures' : 'Hours'}</p>
                      <p className="font-semibold text-gray-800">{student.sessionHours}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Progrès' : 'Progress'}</p>
                      <p className="font-semibold text-gray-800">{student.progress}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{language === 'fr' ? 'Progression' : 'Progress'}</span>
                  <span className="text-sm font-medium text-gray-800">{student.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>{language === 'fr' ? 'Prochaine séance:' : 'Next session:'}</p>
                  <p className="font-medium text-gray-800">{student.nextSession}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Détails' : 'Details'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Contact' : 'Contact'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default MyStudentsModule;