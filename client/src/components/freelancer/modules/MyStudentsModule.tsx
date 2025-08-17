import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { User, BookOpen, Clock, TrendingUp, MessageSquare, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Student {
  id: number;
  name: string;
  subject: string;
  level: string;
  sessionHours: number;
  progress: number;
  nextSession: string;
}

const MyStudentsModule = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Fetch students data from API
  const { data: students = [], isLoading, error, refetch } = useQuery<Student[]>({
    queryKey: ['/api/freelancer/students'],
    queryFn: async () => {
      console.log('[MY_STUDENTS_MODULE] 🔍 Fetching students...');
      const response = await fetch('/api/freelancer/students', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[MY_STUDENTS_MODULE] ❌ Failed to fetch students');
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('[MY_STUDENTS_MODULE] ✅ Students loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {language === 'fr' ? 'Chargement des élèves...' : 'Loading students...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">
            {language === 'fr' ? 'Erreur lors du chargement' : 'Error loading students'}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

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