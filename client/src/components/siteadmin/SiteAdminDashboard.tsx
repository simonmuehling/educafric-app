import React, { useState, useMemo } from 'react';
import { Users, School, Activity, Settings, Shield, Database, BarChart3, Search, Bell, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Import functional modules
import FunctionalSiteAdminUsers from './modules/FunctionalSiteAdminUsers';
import FunctionalSiteAdminSchools from './modules/FunctionalSiteAdminSchools';
import FunctionalSiteAdminSystemHealth from './modules/FunctionalSiteAdminSystemHealth';
import FunctionalSiteAdminSettings from './modules/FunctionalSiteAdminSettings';

interface PlatformStats {
  totalUsers: number;
  totalSchools: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newRegistrations: number;
  systemUptime: number;
  storageUsed: number;
  apiCalls: number;
  activeAdmins: number;
  pendingAdminRequests: number;
  lastUpdated: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

const SiteAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Platform statistics query
  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/admin/platform-stats'],
    queryFn: () => apiRequest('/api/admin/platform-stats'),
    refetchInterval: 60000 // Refresh every minute
  });

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'create-user',
      label: 'Créer Utilisateur',
      icon: <Users className="h-5 w-5" />,
      description: 'Ajouter un nouvel utilisateur à la plateforme',
      action: () => setActiveTab('users')
    },
    {
      id: 'add-school',
      label: 'Ajouter École',
      icon: <School className="h-5 w-5" />,
      description: 'Enregistrer une nouvelle école',
      action: () => setActiveTab('schools')
    },
    {
      id: 'system-check',
      label: 'Vérification Système',
      icon: <Activity className="h-5 w-5" />,
      description: 'Effectuer un diagnostic du système',
      action: () => setActiveTab('health')
    },
    {
      id: 'backup-data',
      label: 'Sauvegarde',
      icon: <Database className="h-5 w-5" />,
      description: 'Créer une sauvegarde complète',
      action: () => console.log('Backup initiated')
    }
  ], []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className={`text-2xl font-bold ${color}`}>
                {typeof value === 'number' ? formatNumber(value) : value}
              </h3>
              {trend && (
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Administration Plateforme
            </h1>
            <p className="text-gray-600">
              Gestion complète de la plateforme EDUCAFRIC
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-global"
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Platform Overview Stats */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Utilisateurs Total"
              value={platformStats?.totalUsers || 0}
              subtitle="Tous rôles confondus"
              icon={<Users className="h-6 w-6" />}
              color="text-blue-600"
              trend="+12.3%"
            />
            <StatCard
              title="Écoles Actives"
              value={platformStats?.totalSchools || 0}
              subtitle="Établissements inscrits"
              icon={<School className="h-6 w-6" />}
              color="text-green-600"
              trend="+8.7%"
            />
            <StatCard
              title="Revenus Mensuels"
              value={formatCurrency(platformStats?.monthlyRevenue || 0)}
              subtitle="Abonnements actifs"
              icon={<BarChart3 className="h-6 w-6" />}
              color="text-purple-600"
              trend="+15.2%"
            />
            <StatCard
              title="Temps de Fonctionnement"
              value={`${platformStats?.systemUptime || 0}%`}
              subtitle="Disponibilité système"
              icon={<Activity className="h-6 w-6" />}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Quick Actions */}
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={action.action}
                    data-testid={`quick-action-${action.id}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                          {action.icon}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {action.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Vue d'Ensemble
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center gap-1">
              <School className="h-4 w-4" />
              Écoles
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Système
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nouveaux utilisateurs</p>
                          <p className="text-xs text-gray-600">
                            {platformStats?.newRegistrations || 0} nouvelles inscriptions aujourd'hui
                          </p>
                        </div>
                        <Badge variant="secondary">+{platformStats?.newRegistrations || 0}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Système en ligne</p>
                          <p className="text-xs text-gray-600">
                            {platformStats?.systemUptime || 0}% de disponibilité
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Database className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Utilisation stockage</p>
                          <p className="text-xs text-gray-600">
                            {platformStats?.storageUsed || 0}% de l'espace utilisé
                          </p>
                        </div>
                        <Badge variant="secondary">{platformStats?.storageUsed || 0}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">État du Système</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">API Calls</span>
                        <span className="font-semibold">
                          {formatNumber(platformStats?.apiCalls || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admins Actifs</span>
                        <span className="font-semibold">{platformStats?.activeAdmins || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Demandes En Attente</span>
                        <span className="font-semibold">{platformStats?.pendingAdminRequests || 0}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Dernière mise à jour: {
                          platformStats?.lastUpdated ? 
                          new Date(platformStats.lastUpdated).toLocaleString('fr-FR') : 
                          'Inconnue'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <FunctionalSiteAdminUsers />
          </TabsContent>

          <TabsContent value="schools" className="mt-6">
            <FunctionalSiteAdminSchools />
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <FunctionalSiteAdminSystemHealth />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <FunctionalSiteAdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteAdminDashboard;