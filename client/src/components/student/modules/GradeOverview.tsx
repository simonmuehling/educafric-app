import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';

const GradeOverview = () => {
  const { language } = useLanguage();

  const subjects = [
    { name: 'Mathématiques', grade: 16.5, coefficient: 4, color: 'blue' },
    { name: 'Français', grade: 14.2, coefficient: 4, color: 'green' },  
    { name: 'Sciences', grade: 15.8, coefficient: 3, color: 'purple' },
    { name: 'Histoire', grade: 13.5, coefficient: 2, color: 'orange' }
  ];

  const average = 15.2;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Moyenne Générale' : 'Overall Average'}
          value={`${average}/20`}
          icon={<BarChart3 className="w-5 h-5" />}
          gradient="blue"
          trend={{ value: 1.2, isPositive: true }}
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Matières' : 'Subjects'}
          value={(Array.isArray(subjects) ? subjects.length : 0).toString()}  
          icon={<BookOpen className="w-5 h-5" />}
          gradient="green"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Rang Classe' : 'Class Rank'}
          value="3/28"
          icon={<Award className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Progrès' : 'Progress'}
          value="+8%"
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="orange"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Notes par Matière' : 'Grades by Subject'}
        </h3>
        <div className="space-y-4">
          {(Array.isArray(subjects) ? subjects : []).map((subject, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{subject.name || ''}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800">{subject.grade}/20</span>
                  <span className="text-sm text-gray-500">Coeff. {subject.coefficient}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-${subject.color}-500 h-2 rounded-full`}
                  style={{ width: `${(subject.grade / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default GradeOverview;