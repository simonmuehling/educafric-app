import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Users, Building2, DollarSign, 
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Globe, Server, Database, Shield
} from 'lucide-react';

const FunctionalSiteAdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/site-admin/dashboard', selectedPeriod],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Tableau de Bord Administrateur',
      subtitle: 'Vue d\'ensemble de la plateforme Educafric',
      loading: 'Chargement des statistiques...',
      overview: 'Aperçu Global',
      systemHealth: 'État du Système',
      userActivity: 'Activité Utilisateurs',
      platformMetrics: 'Métriques Plateforme',
      periods: {
        day: 'Aujourd\'hui',
        week: 'Cette Semaine',
        month: 'Ce Mois',
        year: 'Cette Année'
      },
      metrics: {
        totalUsers: 'Utilisateurs Totaux',
        activeSchools: 'Écoles Actives',
        totalRevenue: 'Revenus Totaux',
        systemUptime: 'Disponibilité Système',
        newRegistrations: 'Nouvelles Inscriptions',
        activeSubscriptions: 'Abonnements Actifs',
        supportTickets: 'Tickets Support',
        apiCalls: 'Appels API'
      },
      status: {
        healthy: 'Excellent',
        warning: 'Attention',
        critical: 'Critique',
        operational: 'Opérationnel'
      }
    },
    en: {
      title: 'Administrator Dashboard',
      subtitle: 'Educafric Platform Overview',
      loading: 'Loading statistics...',
      overview: 'Global Overview',
      systemHealth: 'System Health',
      userActivity: 'User Activity',
      platformMetrics: 'Platform Metrics',
      periods: {
        day: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year'
      },
      metrics: {
        totalUsers: 'Total Users',
        activeSchools: 'Active Schools',
        totalRevenue: 'Total Revenue',
        systemUptime: 'System Uptime',
        newRegistrations: 'New Registrations',
        activeSubscriptions: 'Active Subscriptions',
        supportTickets: 'Support Tickets',
        apiCalls: 'API Calls'
      },
      status: {
        healthy: 'Healthy',
        warning: 'Warning',
        critical: 'Critical',
        operational: 'Operational'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockStats = {
    overview: {
      totalUsers: 15420,
      activeSchools: 847,
      totalRevenue: 12500000,
      systemUptime: 99.7,
      growth: {
        users: 12.5,
        schools: 8.3,
        revenue: 18.7
      }
    },
    activity: {
      newRegistrations: 142,
      activeSubscriptions: 1236,
      supportTickets: 23,
      apiCalls: 847320
    },
    systemHealth: {
      database: 'healthy',
      server: 'healthy',
      api: 'healthy',
      storage: 'warning'
    },
    recentAlerts: [
      {
        id: 1,
        type: 'warning',
        title: 'Stockage à 85%',
        description: 'L\'espace de stockage approche de la limite',
        timestamp: '2025-08-01 07:15'
      },
      {
        id: 2,
        type: 'info',
        title: 'Maintenance programmée',
        description: 'Maintenance serveur prévue demain à 02h00',
        timestamp: '2025-08-01 06:30'
      }
    ],
    topSchools: [
      { name: 'École Excellence International', users: 485, plan: 'Enterprise' },
      { name: 'Collège Bilingue Elite', users: 367, plan: 'Premium' },
      { name: 'Institut Supérieur Technique', users: 298, plan: 'Premium' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="day">{t?.periods?.day}</option>
            <option value="week">{t?.periods?.week}</option>
            <option value="month">{t?.periods?.month}</option>
            <option value="year">{t?.periods?.year}</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.totalUsers}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockStats.overview.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +{mockStats.overview.growth.users}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.activeSchools}</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockStats.overview.activeSchools}
                </p>
                <p className="text-xs text-green-600">
                  +{mockStats.overview.growth.schools}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.totalRevenue}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(mockStats.overview.totalRevenue / 1000000).toFixed(1)}M CFA
                </p>
                <p className="text-xs text-green-600">
                  +{mockStats.overview.growth.revenue}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.systemUptime}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockStats.overview.systemUptime}%
                </p>
                <p className="text-xs text-green-600">
                  {t?.status?.operational}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t?.systemHealth}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'database', label: 'Base de données', icon: Database },
                { key: 'server', label: 'Serveur', icon: Server },
                { key: 'api', label: 'API', icon: Globe },
                { key: 'storage', label: 'Stockage', icon: Shield }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Badge className={getStatusColor(mockStats.systemHealth[key as keyof typeof mockStats.systemHealth])}>
                    {getStatusIcon(mockStats.systemHealth[key as keyof typeof mockStats.systemHealth])}
                    <span className="ml-1">
                      {t?.status?.[mockStats.systemHealth[key as keyof typeof mockStats.systemHealth] as keyof typeof t.status]}
                    </span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t?.userActivity}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t?.metrics?.newRegistrations}</span>
                <span className="font-semibold text-blue-600">
                  {mockStats.activity.newRegistrations}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t?.metrics?.activeSubscriptions}</span>
                <span className="font-semibold text-green-600">
                  {mockStats.activity.activeSubscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t?.metrics?.supportTickets}</span>
                <span className="font-semibold text-orange-600">
                  {mockStats.activity.supportTickets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t?.metrics?.apiCalls}</span>
                <span className="font-semibold text-purple-600">
                  {mockStats.activity.apiCalls.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Alertes Récentes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStats.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded ${
                    alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {alert.type === 'warning' ? 
                      <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.title || ''}</div>
                    <div className="text-xs text-gray-600">{alert.description || ''}</div>
                    <div className="text-xs text-gray-500 mt-1">{alert.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Schools */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Top Écoles par Activité</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStats.topSchools.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{school.name || ''}</div>
                    <div className="text-sm text-gray-600">{school.users} utilisateurs</div>
                  </div>
                </div>
                <Badge variant={school.plan === 'Enterprise' ? 'default' : 'secondary'}>
                  {school.plan}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalSiteAdminDashboard;