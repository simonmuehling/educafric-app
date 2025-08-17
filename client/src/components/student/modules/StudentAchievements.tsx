import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  Award, Trophy, Star, Target, Medal, Calendar, 
  TrendingUp, BookOpen, BarChart3, CheckCircle
} from 'lucide-react';

const StudentAchievements: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const text = {
    fr: {
      title: 'Mes Réussites',
      subtitle: 'Vos accomplissements et récompenses scolaires',
      loading: 'Chargement...',
      error: 'Erreur de chargement',
      stats: {
        totalAchievements: 'Réussites Totales',
        points: 'Points Gagnés',
        streak: 'Série Actuelle',
        rank: 'Classement'
      },
      categories: {
        all: 'Toutes',
        academic: 'Académique',
        behavior: 'Comportement',
        participation: 'Participation',
        special: 'Spécial'
      },
      status: {
        earned: 'Obtenu',
        inProgress: 'En cours',
        locked: 'Verrouillé'
      },
      recent: 'Réussites Récentes',
      progress: 'Progression',
      nextGoal: 'Prochain Objectif',
      details: 'Voir Détails'
    },
    en: {
      title: 'My Achievements',
      subtitle: 'Your school accomplishments and rewards',
      loading: 'Loading...',
      error: 'Loading error',
      stats: {
        totalAchievements: 'Total Achievements',
        points: 'Points Earned',
        streak: 'Current Streak',
        rank: 'Class Rank'
      },
      categories: {
        all: 'All',
        academic: 'Academic',
        behavior: 'Behavior',
        participation: 'Participation',
        special: 'Special'
      },
      status: {
        earned: 'Earned',
        inProgress: 'In Progress',
        locked: 'Locked'
      },
      recent: 'Recent Achievements',
      progress: 'Progress',
      nextGoal: 'Next Goal',
      details: 'View Details'
    }
  };

  const t = text[language as keyof typeof text];

  const { data: achievementsData, isLoading, error } = useQuery({
    queryKey: ['/api/student/achievements', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/student/achievements${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.title || ''}</h1>
          <p className="text-red-600">{t.error}</p>
        </div>
      </div>
    );
  }

  const achievementStats = [
    {
      title: t?.stats?.totalAchievements,
      value: (achievementsData?.stats?.total || 0).toString(),
      icon: <Award className="w-5 h-5" />,
      gradient: 'blue' as const,
      trend: { value: 2, isPositive: true }
    },
    {
      title: t?.stats?.points,
      value: (achievementsData?.stats?.points || 0).toString(),
      icon: <Star className="w-5 h-5" />,
      gradient: 'yellow' as const,
      trend: { value: 150, isPositive: true }
    },
    {
      title: t?.stats?.streak,
      value: `${achievementsData?.stats?.streak || 0} jours`,
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: 'green' as const,
      trend: { value: 5, isPositive: true }
    },
    {
      title: t?.stats?.rank,
      value: `#${achievementsData?.stats?.rank || 1}`,
      icon: <Trophy className="w-5 h-5" />,
      gradient: 'purple' as const
    }
  ];

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="w-6 h-6" />;
      case 'behavior':
        return <Star className="w-6 h-6" />;
      case 'participation':
        return <Target className="w-6 h-6" />;
      case 'special':
        return <Medal className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'earned':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'locked':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            {t.title || ''}
          </h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {/* Category Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap">
              {Object.entries(t.categories).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="text-sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Array.isArray(achievementStats) ? achievementStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {t.recent}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {(achievementsData?.recent || []).map((achievement: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      {getAchievementIcon(achievement.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{achievement.title || ''}</h3>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description || ''}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(achievement.status)}>
                          {t.status[achievement.status as keyof typeof t.status]}
                        </Badge>
                        <span className="text-xs text-gray-500">{achievement.earnedDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600">
                        +{achievement.points} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Progress */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              {t.progress}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(achievementsData?.inProgress || []).map((goal: any, index: number) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getAchievementIcon(goal.category)}
                      </div>
                      <div>
                        <h3 className="font-medium">{goal.title || ''}</h3>
                        <p className="text-sm text-gray-600">{goal.description || ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {goal.current}/{goal.target}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((goal.current / goal.target) * 100)}%
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Achievements Grid */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Toutes les Réussites</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(achievementsData?.all || []).map((achievement: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                    achievement.status === 'earned' ? 'border-green-200 bg-green-50' :
                    achievement.status === 'inProgress' ? 'border-blue-200 bg-blue-50' :
                    'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      achievement.status === 'earned' ? 'bg-yellow-100' :
                      achievement.status === 'inProgress' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {getAchievementIcon(achievement.category)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{achievement.title || ''}</h3>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description || ''}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge className={getStatusColor(achievement.status)}>
                        {t.status[achievement.status as keyof typeof t.status]}
                      </Badge>
                      {achievement.status === 'earned' && (
                        <div className="text-sm font-medium text-yellow-600">
                          +{achievement.points} pts
                        </div>
                      )}
                    </div>
                    {achievement.status === 'inProgress' && achievement.progress && (
                      <div className="space-y-1">
                        <Progress value={achievement.progress} className="h-2" />
                        <p className="text-xs text-gray-500">
                          {achievement.current}/{achievement.target}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAchievements;