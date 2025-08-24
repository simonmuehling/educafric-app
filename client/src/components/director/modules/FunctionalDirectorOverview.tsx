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

export function FunctionalDirectorOverview() {
  const { data: overviewData = [], isLoading, error } = useQuery<DirectorOverviewData[]>({
    queryKey: ['/api/director/overview'],
    queryFn: async () => {
      const response = await fetch('/api/director/overview', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch director overview');
      }
      return response.json();
    }
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

  // Default overview cards if no data from API
  const defaultStats = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Élèves Total",
      value: "0",
      description: "Aucun élève enregistré",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Enseignants",
      value: "0", 
      description: "Aucun enseignant enregistré",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Classes Actives",
      value: "0",
      description: "Aucune classe créée",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Moyenne Générale",
      value: "0.0",
      description: "Aucune note disponible",
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
          {(Array.isArray(defaultStats) ? defaultStats : []).map((stat, index) => (
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
}