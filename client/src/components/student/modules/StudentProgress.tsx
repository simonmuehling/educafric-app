import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  TrendingUp, Target, Trophy, Calendar, 
  BarChart3, Award, Clock, Star, AlertCircle
} from 'lucide-react';

interface ProgressData {
  subject: string;
  currentGrade: number;
  previousGrade: number;
  trend: 'up' | 'down' | 'stable';
  goal: number;
  assignments: {
    total: number;
    completed: number;
    average: number;
  };
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  date: string;
  points: number;
}

const StudentProgress = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const text = {
    fr: {
      title: 'Mon Progrès',
      subtitle: 'Suivi de vos performances académiques',
      overallProgress: 'Progrès Général',
      academicGoals: 'Objectifs Académiques',
      achievements: 'Réussites',
      subjectProgress: 'Progrès par Matière',
      currentTerm: 'Trimestre Actuel',
      previousTerm: 'Trimestre Précédent',
      yearlyView: 'Vue Annuelle',
      average: 'Moyenne',
      goal: 'Objectif',
      improvement: 'Amélioration',
      assignments: 'Devoirs',
      completed: 'Terminés',
      pending: 'En attente',
      trend: 'Tendance',
      increasing: 'En hausse',
      decreasing: 'En baisse',
      stable: 'Stable',
      points: 'points',
      earnedPoints: 'Points gagnés',
      nextGoal: 'Prochain objectif',
      loading: 'Chargement du progrès...',
      error: 'Erreur lors du chargement du progrès',
      noData: 'Aucune donnée de progrès disponible'
    },
    en: {
      title: 'My Progress',
      subtitle: 'Track your academic performance',
      overallProgress: 'Overall Progress',
      academicGoals: 'Academic Goals',
      achievements: 'Achievements',
      subjectProgress: 'Progress by Subject',
      currentTerm: 'Current Term',
      previousTerm: 'Previous Term',
      yearlyView: 'Yearly View',
      average: 'Average',
      goal: 'Goal',
      improvement: 'Improvement',
      assignments: 'Assignments',
      completed: 'Completed',
      pending: 'Pending',
      trend: 'Trend',
      increasing: 'Increasing',
      decreasing: 'Decreasing',
      stable: 'Stable',
      points: 'points',
      earnedPoints: 'Points earned',
      nextGoal: 'Next goal',
      loading: 'Loading progress...',
      error: 'Error loading progress',
      noData: 'No progress data available'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch student's library data from API
  const { data: progressData = [], isLoading, error } = useQuery({
    queryKey: ['/api/student/library', user?.id, selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/student/library?studentId=${user?.id}&period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user?.id
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/student/achievements', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/student/achievements?studentId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user?.id
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return t.increasing;
      case 'down': return t.decreasing;
      case 'stable': return t.stable;
      default: return t.stable;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-100';
      case 'down': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: number, goal: number) => {
    if (grade >= goal) return 'text-green-600';
    if (grade >= goal * 0.8) return 'text-blue-600';
    if (grade >= goal * 0.6) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateOverallProgress = () => {
    if ((Array.isArray(progressData) ? progressData.length : 0) === 0) return { average: 0, goal: 0, achievement: 0 };
    
    const totalGrade = (Array.isArray(progressData) ? progressData : []).reduce((sum: number, data: ProgressData) => sum + data.currentGrade, 0);
    const totalGoal = (Array.isArray(progressData) ? progressData : []).reduce((sum: number, data: ProgressData) => sum + data.goal, 0);
    const average = totalGrade / (Array.isArray(progressData) ? progressData.length : 0);
    const goalAverage = totalGoal / (Array.isArray(progressData) ? progressData.length : 0);
    const achievement = (average / goalAverage) * 100;
    
    return { average: average.toFixed(1), goal: goalAverage.toFixed(1), achievement: achievement.toFixed(0) };
  };

  const overallStats = calculateOverallProgress();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-gray-500">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{t.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'current', label: t.currentTerm },
          { key: 'previous', label: t.previousTerm },
          { key: 'yearly', label: t.yearlyView }
        ].map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === period.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard gradient="blue">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.average}</p>
              <p className="text-3xl font-bold text-gray-900">{overallStats.average}/20</p>
              <p className="text-sm text-blue-600">{t.goal}: {overallStats.goal}/20</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard gradient="green">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.academicGoals}</p>
              <p className="text-3xl font-bold text-gray-900">{overallStats.achievement}%</p>
              <p className="text-sm text-green-600">{t.nextGoal}</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard gradient="purple">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.earnedPoints}</p>
              <p className="text-3xl font-bold text-gray-900">
                {Array.isArray(achievements) ? (Array.isArray(achievements) ? achievements : []).reduce((sum: number, a: Achievement) => sum + a.points, 0) : 0}
              </p>
              <p className="text-sm text-purple-600">{t.points}</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.subjectProgress}</h3>
          
          {(Array.isArray(progressData) ? progressData.length : 0) > 0 ? (
            <div className="space-y-4">
              {(Array.isArray(progressData) ? progressData : []).map((data: ProgressData, index: number) => (
                <ModernCard key={index} gradient="default">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">{data.subject}</h4>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getTrendColor(data.trend)}`}>
                        {getTrendIcon(data.trend)}
                        <span>{getTrendText(data.trend)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t.average}</p>
                        <p className={`text-xl font-bold ${getGradeColor(data.currentGrade, data.goal)}`}>
                          {data?.currentGrade?.toFixed(1)}/20
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t.goal}</p>
                        <p className="text-xl font-bold text-blue-600">
                          {data?.goal?.toFixed(1)}/20
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.improvement}</span>
                        <span className="font-medium">
                          {data.currentGrade > data.previousGrade ? '+' : ''}
                          {(data.currentGrade - data.previousGrade).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            data.currentGrade >= data.goal ? 'bg-green-500' : 
                            data.currentGrade >= data.goal * 0.8 ? 'bg-blue-500' : 
                            'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min((data.currentGrade / data.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Assignment Stats */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-600">{t.assignments}</p>
                          <p className="font-semibold text-gray-900">{data?.assignments?.total}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">{t.completed}</p>
                          <p className="font-semibold text-green-600">{data?.assignments?.completed}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">{t.average}</p>
                          <p className="font-semibold text-blue-600">{data?.assignments?.average.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t.noData}</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.achievements}</h3>
          
          {Array.isArray(achievements) && (Array.isArray(achievements) ? achievements.length : 0) > 0 ? (
            <div className="space-y-3">
              {(Array.isArray(achievements) ? achievements : []).map((achievement: Achievement) => (
                <ModernCard key={achievement.id} gradient="orange">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.title || ''}</h4>
                      <p className="text-sm text-gray-600">{achievement.description || ''}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(achievement.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-yellow-600 font-medium">
                          <Star className="w-3 h-3" />
                          <span>+{achievement.points} {t.points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{language === 'fr' ? 'Aucune réussite pour le moment' : 'No achievements yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;