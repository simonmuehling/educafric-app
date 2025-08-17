import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { BarChart3, TrendingUp, Award, BookOpen, Filter, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Grade {
  id: number;
  studentId: number;
  subject: string;
  subjectName: string;
  grade: number;
  maxGrade: number;
  coefficient: number;
  type: string;
  date: string;
  term: string;
  comments: string;
  percentage: number;
}

interface GradeStats {
  overallAverage: number;
  trend: number;
  classRank: number;
  totalStudents: number;
  subjectCount: number;
  progress: number;
}

const GradeOverview = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState('current');

  // Fetch grades from API
  const { data: gradesData = [], isLoading: gradesLoading, refetch } = useQuery<Grade[]>({
    queryKey: ['/api/student/grades', selectedTerm],
    queryFn: async () => {
      console.log('[GRADE_OVERVIEW] 🔍 Fetching grades...');
      let url = '/api/student/grades';
      if (selectedTerm !== 'current') {
        url += `?term=${selectedTerm}`;
      }
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[GRADE_OVERVIEW] ❌ Failed to fetch grades');
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      console.log('[GRADE_OVERVIEW] ✅ Grades loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch grade statistics
  const { data: statsData, isLoading: statsLoading } = useQuery<GradeStats>({
    queryKey: ['/api/student/grades/stats', selectedTerm],
    queryFn: async () => {
      console.log('[GRADE_OVERVIEW] 🔍 Fetching grade stats...');
      let url = '/api/student/grades/stats';
      if (selectedTerm !== 'current') {
        url += `?term=${selectedTerm}`;
      }
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[GRADE_OVERVIEW] ❌ Failed to fetch stats');
        throw new Error('Failed to fetch grade stats');
      }
      const data = await response.json();
      console.log('[GRADE_OVERVIEW] ✅ Stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  const text = {
    fr: {
      title: 'Aperçu des Notes',
      subtitle: 'Vue d\'ensemble de vos résultats scolaires',
      loading: 'Chargement des notes...',
      error: 'Erreur lors du chargement des notes',
      noData: 'Aucune note disponible',
      overallAverage: 'Moyenne Générale',
      subjects: 'Matières',
      classRank: 'Rang Classe',
      progress: 'Progrès',
      gradesBySubject: 'Notes par Matière',
      coefficient: 'Coeff.',
      currentTerm: 'Trimestre Actuel',
      term1: 'Trimestre 1',
      term2: 'Trimestre 2',
      term3: 'Trimestre 3',
      refresh: 'Actualiser',
      filter: 'Filtrer',
      excellent: 'Excellent',
      good: 'Bien',
      average: 'Moyen',
      needsImprovement: 'À améliorer'
    },
    en: {
      title: 'Grade Overview',
      subtitle: 'Overview of your academic results',
      loading: 'Loading grades...',
      error: 'Error loading grades',
      noData: 'No grades available',
      overallAverage: 'Overall Average',
      subjects: 'Subjects',
      classRank: 'Class Rank',
      progress: 'Progress',
      gradesBySubject: 'Grades by Subject',
      coefficient: 'Coeff.',
      currentTerm: 'Current Term',
      term1: 'Term 1',
      term2: 'Term 2',
      term3: 'Term 3',
      refresh: 'Refresh',
      filter: 'Filter',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      needsImprovement: 'Needs Improvement'
    }
  };

  const t = text[language as keyof typeof text];

  // Calculate subject averages from real data
  const calculateSubjectAverages = () => {
    const subjectMap = new Map();
    
    (Array.isArray(gradesData) ? gradesData : []).forEach(grade => {
      const key = grade.subject || grade.subjectName;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          name: key,
          grades: [],
          coefficient: grade.coefficient || 1,
          color: getSubjectColor(key)
        });
      }
      subjectMap.get(key).grades.push(grade.grade || 0);
    });

    return Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      grade: subject.grades.length > 0 
        ? (subject.grades.reduce((sum: number, g: number) => sum + g, 0) / subject.grades.length).toFixed(1)
        : '0'
    }));
  };

  const getSubjectColor = (subject: string) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'yellow'];
    const index = subject.length % colors.length;
    return colors[index];
  };

  const subjects = calculateSubjectAverages();
  const average = statsData?.overallAverage || 0;
  const trend = statsData?.trend || 0;
  const classRank = statsData?.classRank || 0;
  const totalStudents = statsData?.totalStudents || 0;
  const progress = statsData?.progress || 0;

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600';
    if (grade >= 14) return 'text-blue-600';
    if (grade >= 12) return 'text-orange-600';
    return 'text-red-600';
  };

  if (gradesLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.currentTerm} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">{t.currentTerm}</SelectItem>
              <SelectItem value="term1">{t.term1}</SelectItem>
              <SelectItem value="term2">{t.term2}</SelectItem>
              <SelectItem value="term3">{t.term3}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-grades">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={t.overallAverage}
          value={`${average.toFixed(1)}/20`}
          icon={<BarChart3 className="w-5 h-5" />}
          gradient="blue"
          trend={{ value: Math.abs(trend), isPositive: trend >= 0 }}
        />
        <ModernStatsCard
          title={t.subjects}
          value={(Array.isArray(subjects) ? subjects.length : 0).toString()}  
          icon={<BookOpen className="w-5 h-5" />}
          gradient="green"
        />
        <ModernStatsCard
          title={t.classRank}
          value={`${classRank}/${totalStudents}`}
          icon={<Award className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={t.progress}
          value={`${progress >= 0 ? '+' : ''}${progress}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="orange"
          trend={{ value: Math.abs(progress), isPositive: progress >= 0 }}
        />
      </div>

      {/* Grades by Subject */}
      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {t.gradesBySubject}
        </h3>
        <div className="space-y-4">
          {(Array.isArray(subjects) ? subjects.length : 0) > 0 ? (
            (Array.isArray(subjects) ? subjects : []).map((subject, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900">{subject.name || ''}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getGradeColor(parseFloat(subject.grade))}`}>
                      {subject.grade}/20
                    </span>
                    <span className="text-sm text-gray-500">{t.coefficient} {subject.coefficient}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${subject.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min((parseFloat(subject.grade) / 20) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {parseFloat(subject.grade) >= 16 ? t.excellent :
                   parseFloat(subject.grade) >= 14 ? t.good :
                   parseFloat(subject.grade) >= 12 ? t.average : t.needsImprovement}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t.noData}</p>
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
};

export default GradeOverview;