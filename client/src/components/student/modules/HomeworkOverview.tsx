import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomeworkOverview = () => {
  const { language } = useLanguage();

  const homework = [
    {
      id: 1,
      subject: 'Mathématiques',
      title: 'Exercices Ch.4',
      dueDate: '2024-01-25',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2, 
      subject: 'Français',
      title: 'Dissertation',
      dueDate: '2024-01-28',
      status: 'in-progress',
      priority: 'medium'
    },
    {
      id: 3,
      subject: 'Sciences',
      title: 'Rapport Lab',
      dueDate: '2024-01-30',
      status: 'completed',
      priority: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return language === 'fr' ? 'Terminé' : 'Completed';
      case 'in-progress': return language === 'fr' ? 'En cours' : 'In Progress';
      case 'pending': return language === 'fr' ? 'À faire' : 'Pending';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Total Devoirs' : 'Total Homework'}
          value={(Array.isArray(homework) ? homework.length : 0).toString()}
          icon={<BookOpen className="w-5 h-5" />}
          gradient="blue"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'À faire' : 'Pending'}
          value={(Array.isArray(homework) ? homework : []).filter(h => h.status === 'pending').length.toString()}
          icon={<Clock className="w-5 h-5" />}
          gradient="red"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'En cours' : 'In Progress'}
          value={(Array.isArray(homework) ? homework : []).filter(h => h.status === 'in-progress').length.toString()}
          icon={<AlertCircle className="w-5 h-5" />}
          gradient="yellow"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Terminés' : 'Completed'}
          value={(Array.isArray(homework) ? homework : []).filter(h => h.status === 'completed').length.toString()}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="green"
        />
      </div>

      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Mes Devoirs' : 'My Homework'}
        </h3>
        <div className="space-y-4">
          {(Array.isArray(homework) ? homework : []).map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{item.subject}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{item.title || ''}</p>
                  <p className="text-sm text-gray-500">
                    {language === 'fr' ? 'À rendre le:' : 'Due:'} {item.dueDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.status !== 'completed' && (
                    <Button size="sm" variant="outline">
                      {language === 'fr' ? 'Travailler' : 'Work On'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    {language === 'fr' ? 'Détails' : 'Details'}
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

export default HomeworkOverview;