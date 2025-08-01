import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserCog, Plus, Search, Eye, TrendingUp, Phone, Mail, Calendar } from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';
import StatCard from '../components/StatCard';

const CommercialTeamManagement = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const text = {
    fr: {
      title: 'Gestion Équipe Commerciale',
      subtitle: 'Supervision et administration de l\'équipe commerciale',
      addMember: 'Ajouter Membre',
      searchPlaceholder: 'Rechercher membre commercial...',
      teamPerformance: 'Performance Équipe',
      activityLogs: 'Journaux d\'Activité',
      totalMembers: 'Total Membres',
      activeMembers: 'Membres Actifs',
      monthlyTarget: 'Objectif Mensuel',
      achievementRate: 'Taux Réussite',
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      performance: 'Performance',
      lastLogin: 'Dernière Connexion',
      actions: 'Actions',
      view: 'Voir',
      edit: 'Modifier',
      active: 'Actif',
      inactive: 'Inactif',
      manager: 'Manager',
      agent: 'Agent',
      supervisor: 'Superviseur'
    },
    en: {
      title: 'Commercial Team Management',
      subtitle: 'Commercial team oversight and administration',
      addMember: 'Add Member',
      searchPlaceholder: 'Search commercial team member...',
      teamPerformance: 'Team Performance',
      activityLogs: 'Activity Logs',
      totalMembers: 'Total Members',
      activeMembers: 'Active Members',
      monthlyTarget: 'Monthly Target',
      achievementRate: 'Achievement Rate',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      performance: 'Performance',
      lastLogin: 'Last Login',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      active: 'Active',
      inactive: 'Inactive',
      manager: 'Manager',
      agent: 'Agent',
      supervisor: 'Supervisor'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock commercial team data
  const commercialTeam = [
    {
      id: 1,
      name: 'Marc Commercial',
      email: 'marc.commercial@educafric.com',
      role: 'manager',
      performance: 125,
      target: 100,
      schools: 15,
      revenue: 8500000,
      lastLogin: '2024-01-22 14:30',
      status: 'active'
    },
    {
      id: 2,
      name: 'Sophie Dupont',
      email: 'sophie.dupont@educafric.com',
      role: 'agent',
      performance: 98,
      target: 80,
      schools: 12,
      revenue: 6200000,
      lastLogin: '2024-01-22 13:45',
      status: 'active'
    },
    {
      id: 3,
      name: 'Jean Kouassi',
      email: 'jean.kouassi@educafric.com',
      role: 'agent',
      performance: 87,
      target: 80,
      schools: 10,
      revenue: 5100000,
      lastLogin: '2024-01-22 12:20',
      status: 'active'
    },
    {
      id: 4,
      name: 'Carine Nguetsop',
      email: 'carine.nguetsop@educafric.com',
      role: 'supervisor',
      performance: 115,
      target: 90,
      schools: 18,
      revenue: 9800000,
      lastLogin: '2024-01-22 11:15',
      status: 'active'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number, target: number) => {
    const rate = (performance / target) * 100;
    if (rate >= 100) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTeam = (Array.isArray(commercialTeam) ? commercialTeam : []).filter(member =>
    member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = (Array.isArray(commercialTeam) ? commercialTeam : []).reduce((sum, member) => sum + member.revenue, 0);
  const avgPerformance = (Array.isArray(commercialTeam) ? commercialTeam : []).reduce((sum, member) => sum + (member.performance / member.target * 100), 0) / (Array.isArray(commercialTeam) ? commercialTeam.length : 0);

  return (
    <ModuleContainer
      title={t.title || ''}
      subtitle={t.subtitle}
      icon={<UserCog className="w-6 h-6" />}
      iconColor="from-indigo-500 to-indigo-600"
    >
      {/* Normalized Team Statistics with StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t.totalMembers}
          value={(Array.isArray(commercialTeam) ? commercialTeam.length : 0)}
          icon={<UserCog className="w-8 h-8" />}
          gradient="from-blue-50 to-blue-100"
        />
        
        <StatCard
          title={t.activeMembers}
          value={(Array.isArray(commercialTeam) ? commercialTeam : []).filter(m => m.status === 'active').length}
          icon={<UserCog className="w-8 h-8" />}
          gradient="from-green-50 to-green-100"
        />
        
        <StatCard
          title={language === 'fr' ? 'Revenus Équipe' : 'Team Revenue'}
          value={`${(totalRevenue / 1000000).toFixed(1)}M CFA`}
          icon={<TrendingUp className="w-8 h-8" />}
          gradient="from-yellow-50 to-yellow-100"
        />
        
        <StatCard
          title={t.achievementRate}
          value={`${avgPerformance.toFixed(0)}%`}
          icon={<TrendingUp className="w-8 h-8" />}
          gradient="from-purple-50 to-purple-100"
        />
      </div>

      {/* Search and Add Member */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t.addMember}
        </Button>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{language === 'fr' ? 'Membres de l\'Équipe' : 'Team Members'}</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.name || ''}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.email || ''}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.role}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.performance}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{language === 'fr' ? 'Écoles' : 'Schools'}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{language === 'fr' ? 'Revenus' : 'Revenue'}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.lastLogin}</th>
                  <th className="text-left p-4 font-semibold text-gray-900">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredTeam) ? filteredTeam : []).map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">{member.name || ''}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{member.email || ''}</td>
                    <td className="p-4">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role === 'manager' ? t.manager :
                         member.role === 'supervisor' ? t.supervisor : t.agent}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className={`font-medium ${getPerformanceColor(member.performance, member.target)}`}>
                          {member.performance}/{member.target}
                        </div>
                        <div className="text-gray-500">
                          {((member.performance / member.target) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">{member.schools}</td>
                    <td className="p-4 text-sm">
                      {(member.revenue / 1000000).toFixed(1)}M CFA
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{member.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {t.view}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t.activityLogs}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">Marc Commercial</div>
                  <div className="text-sm text-gray-600">Appel client - École Moderne Bafoussam - il y a 30min</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium">Sophie Dupont</div>
                  <div className="text-sm text-gray-600">Email envoyé - Proposition commerciale - il y a 1h</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <div className="font-medium">Carine Nguetsop</div>
                  <div className="text-sm text-gray-600">RDV planifié - Lycée Excellence - il y a 2h</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t.teamPerformance}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Array.isArray(commercialTeam) ? commercialTeam : []).map((member) => {
                const performanceRate = (member.performance / member.target) * 100;
                return (
                  <div key={member.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{member.name || ''}</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(member.performance, member.target)}`}>
                        {performanceRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          performanceRate >= 100 ? 'bg-green-500' :
                          performanceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(performanceRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleContainer>
  );
};

export default CommercialTeamManagement;