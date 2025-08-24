import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModernCard } from '../../ui/ModernCard';
import { Book, Users, GraduationCap, BarChart } from 'lucide-react';

interface DirectorOverviewData {
  id: number;
  type: string;
  title: string;
  value: string;
  description: string;
}

const FunctionalDirectorOverview: React.FC = () => {
  // Use existing director analytics data instead of separate overview endpoint
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['/api/director/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/director/analytics', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[DIRECTOR_OVERVIEW] Analytics API Error:', response.status, response.statusText);
        throw new Error('Failed to fetch director analytics');
      }
      const data = await response.json();
      console.log('[DIRECTOR_OVERVIEW] Analytics Response:', data);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Vue d'Ensemble de l'École
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erreur de Chargement
        </h3>
        <p className="text-red-600">
          Impossible de charger les données de vue d'ensemble.
        </p>
      </div>
    );
  }

  // Create overview stats from analytics data
  const overviewStats = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Élèves Total",
      value: analyticsData?.totalStudents?.toString() || "0",
      description: analyticsData?.totalStudents > 0 ? `${analyticsData.totalStudents} élèves inscrits` : "Aucun élève enregistré",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Enseignants",
      value: analyticsData?.totalTeachers?.toString() || "0",
      description: analyticsData?.totalTeachers > 0 ? `${analyticsData.totalTeachers} enseignants actifs` : "Aucun enseignant enregistré",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Classes Actives",
      value: analyticsData?.totalClasses?.toString() || "0",
      description: analyticsData?.totalClasses > 0 ? `${analyticsData.totalClasses} classes ouvertes` : "Aucune classe créée",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Performance",
      value: analyticsData?.averagePerformance ? `${Math.round(analyticsData.averagePerformance)}%` : "N/A",
      description: analyticsData?.averagePerformance ? `Performance moyenne de l'école` : "Aucune donnée de performance",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Vue d'Ensemble de l'École
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(overviewStats) ? overviewStats : []).map((stat: any, index: number) => (
            <ModernCard key={index} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title || ''}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description || ''}
                </p>
              </div>
            </ModernCard>
          ))}
        </div>


      </div>
    </div>
  );
};

export default FunctionalDirectorOverview;