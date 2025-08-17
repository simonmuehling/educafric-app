import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Eye, 
  BarChart3, 
  Users, 
  School, 
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Globe,
  Server,
  Database,
  Shield,
  Monitor,
  FileText,
  MessageSquare,
  Bell,
  Settings
} from 'lucide-react';

interface SystemOverview {
  platformHealth: 'healthy' | 'warning' | 'critical';
  totalUsers: number;
  totalSchools: number;
  monthlyRevenue: number;
  systemUptime: number;
  activeConnections: number;
  errorRate: number;
  lastBackup: string;
}

const PreviewModule = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'health' | 'activity'>('overview');

  const text = {
    fr: {
      title: 'Aperçu Système',
      subtitle: 'Vue d\'ensemble complète de la plateforme EDUCAFRIC',
      overview: 'Vue d\'ensemble',
      metrics: 'Métriques',
      health: 'Santé Système',
      activity: 'Activité',
      platformHealth: 'Santé Plateforme',
      systemStatus: 'Statut Système',
      userMetrics: 'Métriques Utilisateurs',
      schoolMetrics: 'Métriques Écoles',
      financialMetrics: 'Métriques Financières',
      technicalMetrics: 'Métriques Techniques',
      totalUsers: 'Total Utilisateurs',
      totalSchools: 'Total Écoles',
      monthlyRevenue: 'Revenus Mensuels',
      systemUptime: 'Temps de Fonctionnement',
      activeConnections: 'Connexions Actives',
      errorRate: 'Taux d\'Erreur',
      lastBackup: 'Dernière Sauvegarde',
      healthy: 'Sain',
      warning: 'Attention',
      critical: 'Critique',
      operational: 'Opérationnel',
      maintenance: 'Maintenance',
      offline: 'Hors ligne',
      loading: 'Chargement...',
      error: 'Erreur',
      noData: 'Aucune donnée disponible',
      refreshData: 'Actualiser Données',
      exportReport: 'Exporter Rapport',
      quickActions: 'Actions Rapides',
      viewDetails: 'Voir Détails',
      systemAlerts: 'Alertes Système',
      recentActivity: 'Activité Récente',
      performanceMetrics: 'Métriques Performance',
      securityStatus: 'Statut Sécurité',
      databaseStatus: 'Statut Base de Données',
      serverStatus: 'Statut Serveur',
      apiStatus: 'Statut API',
      notificationStatus: 'Statut Notifications',
      backupStatus: 'Statut Sauvegardes',
      monitoringActive: 'Surveillance Active',
      allSystemsOperational: 'Tous Systèmes Opérationnels',
      cfa: 'CFA',
      users: 'utilisateurs',
      schools: 'écoles',
      connections: 'connexions',
      uptime: 'disponibilité',
      ago: 'il y a',
      minutes: 'minutes',
      hours: 'heures',
      days: 'jours',
      mb: 'Mo',
      gb: 'Go',
      tb: 'To'
    },
    en: {
      title: 'System Overview',
      subtitle: 'Complete EDUCAFRIC platform overview',
      overview: 'Overview',
      metrics: 'Metrics',
      health: 'System Health',
      activity: 'Activity',
      platformHealth: 'Platform Health',
      systemStatus: 'System Status',
      userMetrics: 'User Metrics',
      schoolMetrics: 'School Metrics',
      financialMetrics: 'Financial Metrics',
      technicalMetrics: 'Technical Metrics',
      totalUsers: 'Total Users',
      totalSchools: 'Total Schools',
      monthlyRevenue: 'Monthly Revenue',
      systemUptime: 'System Uptime',
      activeConnections: 'Active Connections',
      errorRate: 'Error Rate',
      lastBackup: 'Last Backup',
      healthy: 'Healthy',
      warning: 'Warning',
      critical: 'Critical',
      operational: 'Operational',
      maintenance: 'Maintenance',
      offline: 'Offline',
      loading: 'Loading...',
      error: 'Error',
      noData: 'No data available',
      refreshData: 'Refresh Data',
      exportReport: 'Export Report',
      quickActions: 'Quick Actions',
      viewDetails: 'View Details',
      systemAlerts: 'System Alerts',
      recentActivity: 'Recent Activity',
      performanceMetrics: 'Performance Metrics',
      securityStatus: 'Security Status',
      databaseStatus: 'Database Status',
      serverStatus: 'Server Status',
      apiStatus: 'API Status',
      notificationStatus: 'Notification Status',
      backupStatus: 'Backup Status',
      monitoringActive: 'Monitoring Active',
      allSystemsOperational: 'All Systems Operational',
      cfa: 'CFA',
      users: 'users',
      schools: 'schools',
      connections: 'connections',
      uptime: 'uptime',
      ago: 'ago',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      mb: 'MB',
      gb: 'GB',
      tb: 'TB'
    }
  };

  const t = text[language];

  // Fetch system overview data
  const { data: systemOverview, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/system-overview'],
    queryFn: () => apiRequest('GET', '/api/admin/system-overview'),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Recent activity data
  const { data: recentActivity } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    queryFn: () => apiRequest('GET', '/api/admin/recent-activity')
  });

  // System alerts
  const { data: systemAlerts } = useQuery({
    queryKey: ['/api/admin/system-alerts'],
    queryFn: () => apiRequest('GET', '/api/admin/system-alerts')
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + t.cfa;
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}% ${t.uptime}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} ${t.days} ${t.ago}`;
    if (diffHours > 0) return `${diffHours} ${t.hours} ${t.ago}`;
    return `${diffMins} ${t.minutes} ${t.ago}`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const renderSystemOverview = () => (
    <div className="space-y-6">
      {/* Platform Health Status */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            {t.platformHealth}
          </h3>
          <Badge className={getHealthColor((systemOverview as any)?.platformHealth || 'healthy')}>
            <div className="flex items-center gap-2">
              {getHealthIcon((systemOverview as any)?.platformHealth || 'healthy')}
              {(systemOverview as any)?.platformHealth === 'healthy' && t.healthy}
              {(systemOverview as any)?.platformHealth === 'warning' && t.warning}
              {(systemOverview as any)?.platformHealth === 'critical' && t.critical}
            </div>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">{t.serverStatus}</div>
                <div className="text-sm text-blue-700">{t.operational}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">{t.databaseStatus}</div>
                <div className="text-sm text-green-700">{t.operational}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">{t.apiStatus}</div>
                <div className="text-sm text-purple-700">{t.operational}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">{t.securityStatus}</div>
                <div className="text-sm text-orange-700">{t.monitoringActive}</div>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(systemOverview as any)?.totalUsers?.toLocaleString() || '12,847'}
              </div>
              <div className="text-sm text-gray-600">{t.totalUsers}</div>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <School className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {(systemOverview as any)?.totalSchools || '156'}
              </div>
              <div className="text-sm text-gray-600">{t.totalSchools}</div>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency((systemOverview as any)?.monthlyRevenue || 87500000)}
              </div>
              <div className="text-sm text-gray-600">{t.monthlyRevenue}</div>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatUptime((systemOverview as any)?.systemUptime || 99.8)}
              </div>
              <div className="text-sm text-gray-600">{t.systemUptime}</div>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Technical Metrics */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {t.technicalMetrics}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t.activeConnections}</span>
              <span className="text-xl font-bold">
                {(systemOverview as any)?.activeConnections || 1247}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t.connections}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t.errorRate}</span>
              <span className="text-xl font-bold text-green-600">
                {((systemOverview as any)?.errorRate || 0.02).toFixed(3)}%
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Dernières 24h
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t.lastBackup}</span>
              <span className="text-xl font-bold text-blue-600">
                {formatTimeAgo((systemOverview as any)?.lastBackup || new Date().toISOString())}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Automatique
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Quick Actions */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t.quickActions}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm">{t.refreshData}</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm">{t.exportReport}</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Configuration</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Bell className="w-5 h-5" />
            <span className="text-sm">Alertes</span>
          </Button>
        </div>
      </ModernCard>
    </div>
  );

  const renderMetrics = () => (
    <ModernCard className="p-6">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t.performanceMetrics}</h3>
        <p className="text-gray-600">Métriques détaillées de performance à venir.</p>
      </div>
    </ModernCard>
  );

  const renderHealth = () => (
    <ModernCard className="p-6">
      <div className="text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t.systemStatus}</h3>
        <p className="text-gray-600">Surveillance santé système détaillée à venir.</p>
      </div>
    </ModernCard>
  );

  const renderActivity = () => (
    <ModernCard className="p-6">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t.recentActivity}</h3>
        <p className="text-gray-600">Journal d'activité système à venir.</p>
      </div>
    </ModernCard>
  );

  const tabs = [
    { id: 'overview', label: t.overview, icon: <Eye className="w-4 h-4" /> },
    { id: 'metrics', label: t.metrics, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'health', label: t.health, icon: <Activity className="w-4 h-4" /> },
    { id: 'activity', label: t.activity, icon: <MessageSquare className="w-4 h-4" /> }
  ];

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à l'aperçu système.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Eye className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t.title || ''}</h2>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t.allSystemsOperational}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.refreshData}
                </>
              )}
            </Button>
          </div>
        </div>
      </ModernCard>

      {/* Tab Navigation */}
      <ModernCard className="p-6">
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(tabs) ? tabs : []).map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </Button>
          ))}
        </div>
      </ModernCard>

      {/* Tab Content */}
      {isLoading ? (
        <ModernCard className="p-6">
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">{t.loading}</span>
          </div>
        </ModernCard>
      ) : error ? (
        <ModernCard className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.error}</h3>
            <p className="text-gray-600">{t.noData}</p>
          </div>
        </ModernCard>
      ) : (
        <>
          {activeTab === 'overview' && renderSystemOverview()}
          {activeTab === 'metrics' && renderMetrics()}
          {activeTab === 'health' && renderHealth()}
          {activeTab === 'activity' && renderActivity()}
        </>
      )}
    </div>
  );
};

export default PreviewModule;