import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Globe,
  HardDrive,
  Cpu,
  BarChart3,
  Monitor,
  Power,
  Wrench
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
}

interface PlatformConfig {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUsers: number;
  sessionTimeout: number;
  apiRateLimit: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  debugMode: boolean;
  backupFrequency: string;
  logLevel: string;
}

const PlatformManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'maintenance' | 'monitoring'>('overview');
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  const text = {
    fr: {
      title: 'Gestion de la Plateforme',
      subtitle: 'Administration système et configuration plateforme',
      overview: 'Vue d\'ensemble',
      config: 'Configuration',
      maintenance: 'Maintenance',
      monitoring: 'Surveillance',
      systemMetrics: 'Métriques Système',
      platformConfig: 'Configuration Plateforme',
      systemHealth: 'Santé du Système',
      serverStatus: 'Statut Serveur',
      databaseStatus: 'Statut Base de Données',
      apiStatus: 'Statut API',
      maintenanceMode: 'Mode Maintenance',
      allowRegistration: 'Autoriser Inscriptions',
      maxUsers: 'Utilisateurs Maximum',
      sessionTimeout: 'Timeout Session (min)',
      apiRateLimit: 'Limite Taux API',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      debugMode: 'Mode Debug',
      backupFrequency: 'Fréquence Sauvegarde',
      logLevel: 'Niveau Log',
      updateConfig: 'Mettre à jour Configuration',
      restartService: 'Redémarrer Service',
      clearCache: 'Vider Cache',
      exportLogs: 'Exporter Logs',
      runBackup: 'Lancer Sauvegarde',
      healthy: 'Sain',
      warning: 'Attention',
      critical: 'Critique',
      online: 'En ligne',
      offline: 'Hors ligne',
      maintenanceStatus: 'Maintenance',
      updating: 'Mise à jour...',
      success: 'Succès',
      error: 'Erreur',
      configUpdated: 'Configuration mise à jour',
      configUpdateFailed: 'Échec mise à jour configuration',
      serviceRestarted: 'Service redémarré',
      cacheCleared: 'Cache vidé',
      backupStarted: 'Sauvegarde lancée',
      logsExported: 'Logs exportés'
    },
    en: {
      title: 'Platform Management',
      subtitle: 'System administration and platform configuration',
      overview: 'Overview',
      config: 'Configuration',
      maintenance: 'Maintenance',
      monitoring: 'Monitoring',
      systemMetrics: 'System Metrics',
      platformConfig: 'Platform Configuration',
      systemHealth: 'System Health',
      serverStatus: 'Server Status',
      databaseStatus: 'Database Status',
      apiStatus: 'API Status',
      maintenanceMode: 'Maintenance Mode',
      allowRegistration: 'Allow Registration',
      maxUsers: 'Maximum Users',
      sessionTimeout: 'Session Timeout (min)',
      apiRateLimit: 'API Rate Limit',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      debugMode: 'Debug Mode',
      backupFrequency: 'Backup Frequency',
      logLevel: 'Log Level',
      updateConfig: 'Update Configuration',
      restartService: 'Restart Service',
      clearCache: 'Clear Cache',
      exportLogs: 'Export Logs',
      runBackup: 'Run Backup',
      healthy: 'Healthy',
      warning: 'Warning',
      critical: 'Critical',
      online: 'Online',
      offline: 'Offline',
      maintenanceStatus: 'Maintenance',
      updating: 'Updating...',
      success: 'Success',
      error: 'Error',
      configUpdated: 'Configuration updated',
      configUpdateFailed: 'Configuration update failed',
      serviceRestarted: 'Service restarted',
      cacheCleared: 'Cache cleared',
      backupStarted: 'Backup started',
      logsExported: 'Logs exported'
    }
  };

  const t = text[language];

  // Fetch system metrics
  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/system-metrics'],
    queryFn: () => apiRequest('GET', '/api/admin/system-metrics')
  });

  // Fetch platform configuration
  const { data: platformConfig, isLoading: configLoading } = useQuery({
    queryKey: ['/api/admin/platform-config'],
    queryFn: () => apiRequest('GET', '/api/admin/platform-config')
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<PlatformConfig>) => 
      apiRequest('PATCH', '/api/admin/platform-config', config),
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.configUpdated
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-config'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.configUpdateFailed,
        variant: "destructive"
      });
    }
  });

  // System actions mutations
  const restartServiceMutation = useMutation({
    mutationFn: (service: string) => 
      apiRequest('POST', '/api/admin/restart-service', { service }),
    onSuccess: () => {
      toast({ title: t.success, description: t.serviceRestarted });
    }
  });

  const clearCacheMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/clear-cache'),
    onSuccess: () => {
      toast({ title: t.success, description: t.cacheCleared });
    }
  });

  const runBackupMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/run-backup'),
    onSuccess: () => {
      toast({ title: t.success, description: t.backupStarted });
    }
  });

  const exportLogsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/export-logs'),
    onSuccess: () => {
      toast({ title: t.success, description: t.logsExported });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Health Summary */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {t.systemHealth}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">{t.serverStatus}</div>
                <Badge className="bg-green-100 text-green-800">{t.online}</Badge>
              </div>
            </div>
            <div className="mt-2 text-sm text-green-700">
              Uptime: 99.8% | CPU: 45% | RAM: 62%
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">{t.databaseStatus}</div>
                <Badge className="bg-blue-100 text-blue-800">{t.online}</Badge>
              </div>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              Connections: 1,247 | Queries/sec: 89
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">{t.apiStatus}</div>
                <Badge className="bg-purple-100 text-purple-800">{t.online}</Badge>
              </div>
            </div>
            <div className="mt-2 text-sm text-purple-700">
              Requests/min: 3,456 | Avg response: 89ms
            </div>
          </div>
        </div>
      </ModernCard>

      {/* System Metrics */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {t.systemMetrics}
        </h3>
        {metricsLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {(systemMetrics as any)?.metrics?.map((metric: SystemMetric, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <div className="font-medium">{metric.name || ''}</div>
                    <div className="text-sm text-gray-600">{metric.description || ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{metric.value}</div>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status === 'healthy' && t.healthy}
                    {metric.status === 'warning' && t.warning}
                    {metric.status === 'critical' && t.critical}
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                Aucune métrique disponible
              </div>
            )}
          </div>
        )}
      </ModernCard>

      {/* Quick Actions */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => restartServiceMutation.mutate('web')}
            disabled={restartServiceMutation.isPending}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <Power className="w-6 h-6" />
            <span className="text-sm">{t.restartService}</span>
          </Button>
          <Button
            onClick={() => clearCacheMutation.mutate()}
            disabled={clearCacheMutation.isPending}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-sm">{t.clearCache}</span>
          </Button>
          <Button
            onClick={() => runBackupMutation.mutate()}
            disabled={runBackupMutation.isPending}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <HardDrive className="w-6 h-6" />
            <span className="text-sm">{t.runBackup}</span>
          </Button>
          <Button
            onClick={() => exportLogsMutation.mutate()}
            disabled={exportLogsMutation.isPending}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <Activity className="w-6 h-6" />
            <span className="text-sm">{t.exportLogs}</span>
          </Button>
        </div>
      </ModernCard>
    </div>
  );

  const renderConfiguration = () => (
    <ModernCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        {t.platformConfig}
      </h3>
      {configLoading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Configuration Générale</h4>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{t.maintenanceMode}</span>
                <Badge variant={(platformConfig as any)?.maintenanceMode ? "destructive" : "default"}>
                  {(platformConfig as any)?.maintenanceMode ? "Activé" : "Désactivé"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{t.allowRegistration}</span>
                <Badge variant={(platformConfig as any)?.allowRegistration ? "default" : "secondary"}>
                  {(platformConfig as any)?.allowRegistration ? "Activé" : "Désactivé"}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.maxUsers}</label>
                <Input
                  type="number"
                  defaultValue={(platformConfig as any)?.maxUsers || 10000}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.sessionTimeout}</label>
                <Input
                  type="number"
                  defaultValue={(platformConfig as any)?.sessionTimeout || 60}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Configuration Notifications</h4>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{t.emailNotifications}</span>
                <Badge variant={(platformConfig as any)?.emailNotifications ? "default" : "secondary"}>
                  {(platformConfig as any)?.emailNotifications ? "Activé" : "Désactivé"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{t.smsNotifications}</span>
                <Badge variant={(platformConfig as any)?.smsNotifications ? "default" : "secondary"}>
                  {(platformConfig as any)?.smsNotifications ? "Activé" : "Désactivé"}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.apiRateLimit}</label>
                <Input
                  type="number"
                  defaultValue={(platformConfig as any)?.apiRateLimit || 1000}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.logLevel}</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info" selected>Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => updateConfigMutation.mutate({})}
              disabled={updateConfigMutation.isPending}
              className="w-full"
            >
              {updateConfigMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.updating}
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  {t.updateConfig}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </ModernCard>
  );

  const tabs = [
    { id: 'overview', label: t.overview, icon: <Monitor className="w-4 h-4" /> },
    { id: 'config', label: t.config, icon: <Settings className="w-4 h-4" /> },
    { id: 'maintenance', label: t.maintenance, icon: <Wrench className="w-4 h-4" /> },
    { id: 'monitoring', label: t.monitoring, icon: <Activity className="w-4 h-4" /> }
  ];

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion de la plateforme.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'config' && renderConfiguration()}
      {activeTab === 'maintenance' && (
        <ModernCard className="p-6">
          <div className="text-center">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Maintenance</h3>
            <p className="text-gray-600">Outils de maintenance système à venir.</p>
          </div>
        </ModernCard>
      )}
      {activeTab === 'monitoring' && (
        <ModernCard className="p-6">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Surveillance</h3>
            <p className="text-gray-600">Outils de surveillance avancée à venir.</p>
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default PlatformManagement;