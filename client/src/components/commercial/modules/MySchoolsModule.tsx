import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Building, Users, DollarSign, TrendingUp, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

const MySchoolsModule = () => {
  const { language } = useLanguage();

  // Fetch schools data from API
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['/api/commercial/schools'],
    queryFn: async () => {
      const response = await fetch('/api/commercial/schools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    }
  });

  const mockSchools = [
    {
      id: 1,
      name: 'École Primaire Yaoundé Centre',
      type: 'Public',
      students: 450,
      teachers: 28,
      subscription: 'Premium Annual',
      revenue: 50000,
      contact: '+237 656 123 456',
      email: 'direction@ecolecenyaounde.cm',
      status: 'active',
      renewalDate: '2024-09-15'
    },
    {
      id: 2,
      name: 'Lycée Bilingue de Douala',
      type: 'Private',
      students: 680,
      teachers: 45,
      subscription: 'Premium Annual',
      revenue: 50000,
      contact: '+237 656 789 012',
      email: 'admin@lyceebdouala.cm',
      status: 'active',
      renewalDate: '2024-12-20'
    },
    {
      id: 3,
      name: 'Collège Saint-Joseph Bamenda',
      type: 'Private',
      students: 320,
      teachers: 22,
      subscription: 'Trial',
      revenue: 0,
      contact: '+237 656 345 678',
      email: 'info@saintjoseph.cm',
      status: 'trial',
      renewalDate: '2024-02-01'
    }
  ];

  const displaySchools = (Array.isArray(schools) ? schools.length : 0) > 0 ? schools : mockSchools;
  const totalRevenue = (Array.isArray(displaySchools) ? displaySchools : []).reduce((acc: number, school: any) => acc + (school.value || school.revenue || 0), 0);
  const activeSchools = (Array.isArray(displaySchools) ? displaySchools : []).filter((s: any) => s.status === 'active' || s.status === 'client').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={language === 'fr' ? 'Écoles Gérées' : 'Managed Schools'}
          value={(Array.isArray(displaySchools) ? displaySchools.length : 0).toString()}
          icon={<Building className="w-5 h-5" />}
          gradient="blue"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Écoles Actives' : 'Active Schools'}
          value={activeSchools.toString()}
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="green"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Élèves Total' : 'Total Students'}
          value={(Array.isArray(displaySchools) ? displaySchools : []).reduce((acc: number, s: any) => acc + (s.students || 0), 0).toString()}
          icon={<Users className="w-5 h-5" />}
          gradient="purple"
        />
        <ModernStatsCard
          title={language === 'fr' ? 'Revenus Annuels' : 'Annual Revenue'}
          value={`${totalRevenue.toLocaleString()} CFA`}
          icon={<DollarSign className="w-5 h-5" />}
          gradient="orange"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <ModernCard gradient="default">
        <h3 className="text-xl font-bold mb-6">
          {language === 'fr' ? 'Portfolio d\'Écoles' : 'School Portfolio'}
        </h3>
        <div className="space-y-6">
          {(Array.isArray(displaySchools) ? displaySchools : []).map((school: any, index: number) => (
            <div key={school.id} className={`activity-card-${['blue', 'green', 'purple'][index % 3]} p-6 rounded-xl transition-all duration-300 hover:scale-102`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-xl font-bold text-gray-800">{school.name || ''}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      school.status === 'active' ? 'bg-green-100 text-green-800' :
                      school.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {school.status === 'active' ? (language === 'fr' ? 'Actif' : 'Active') :
                       school.status === 'trial' ? (language === 'fr' ? 'Essai' : 'Trial') :
                       school.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      school.type === 'Public' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {school.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Élèves' : 'Students'}</p>
                      <p className="font-semibold text-gray-800">{school.students}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Enseignants' : 'Teachers'}</p>
                      <p className="font-semibold text-gray-800">{school.teachers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Statut' : 'Status'}</p>
                      <p className="font-semibold text-gray-800">{school.subscription || school.contract}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fr' ? 'Revenus' : 'Revenue'}</p>
                      <p className="font-semibold text-gray-800">{(school.value || school.revenue || 0).toLocaleString()} CFA</p>
                    </div>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{school.contact || school.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{school.email || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>{language === 'fr' ? 'Renouvellement:' : 'Renewal:'}</p>
                  <p className="font-medium text-gray-800">{school.renewalDate}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {language === 'fr' ? 'Contacter' : 'Contact'}
                  </Button>
                  <Button size="sm" variant="outline">
                    {language === 'fr' ? 'Rapport' : 'Report'}
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {language === 'fr' ? 'Gérer' : 'Manage'}
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

export default MySchoolsModule;