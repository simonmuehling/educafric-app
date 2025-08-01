import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Users, User, GraduationCap, Calendar, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChildrenManagement = () => {
  const { language } = useLanguage();

  const children = [
    {
      id: 1,
      name: 'Marie Kamga',
      class: '6ème A',
      school: 'École Primaire Yaoundé',
      average: 15.2,
      attendance: 94,
      nextExam: '2024-01-28'
    },
    {
      id: 2,
      name: 'Paul Kamga',
      class: '3ème B', 
      school: 'Lycée Bilingue Yaoundé',
      average: 13.8,
      attendance: 91,
      nextExam: '2024-01-30'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Mes Enfants' : 'My Children'}
          value={(Array.isArray(children) ? children.length : 0).toString()}
          icon={<Users className="w-5 h-5" />}
          gradient="blue"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Moyenne Globale' : 'Overall Average'}
          value="14.5/20"
          icon={<GraduationCap className="w-5 h-5" />}
          gradient="green"
          trend={{ value: 1.2, isPositive: true }}
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Présence' : 'Attendance'}
          value="92.5%"
          icon={<Calendar className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Écoles' : 'Schools'}
          value="2"
          icon={<User className="w-5 h-5" />}
          gradient="orange"
        />
      </div>

      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Mes Enfants' : 'My Children'}
        </h3>
        <div className="space-y-6">
          {(Array.isArray(children) ? children : []).map((child, index) => (
            <div key={child.id} className={`activity-card-${index % 2 === 0 ? 'blue' : 'green'} p-6 rounded-xl transition-all duration-300 hover:scale-102`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{child.name || ''}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Classe' : 'Class'}</p>
                      <p className="font-semibold text-gray-800">{child.class}</p>  
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'École' : 'School'}</p>
                      <p className="font-semibold text-gray-800">{child.school}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Moyenne' : 'Average'}</p>
                      <p className="font-semibold text-gray-800">{child.average}/20</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Présence' : 'Attendance'}</p>
                      <p className="font-semibold text-gray-800">{child.attendance}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Voir Détails' : 'View Details'}
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Contacter École' : 'Contact School'}
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {language === 'fr' ? 'Suivi Complet' : 'Full Tracking'}
                </Button>
              </div>
              
              {child.nextExam && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    {language === 'fr' ? 'Prochain examen:' : 'Next exam:'} {child.nextExam}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default ChildrenManagement;