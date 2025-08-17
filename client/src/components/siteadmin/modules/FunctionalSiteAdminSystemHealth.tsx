import React from 'react';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SystemService {
  name: string;
  status: string;
  uptime: number;
}

interface SystemHealth {
  status: string;
  uptime: number;
  lastIncident: string;
  services: SystemService[];
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

interface PerformanceMetrics {
  responseTime: {
    current: number;
    target: number;
    trend: string;
  };
  throughput: {
    requestsPerSecond: number;
    peakHour: string;
    dailyRequests: number;
  };
  errorRates: {
    total: number;
    byType: Array<{ type: string; rate: number }>;
  };
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
}

const FunctionalSiteAdminSystemHealth: React.FC = () => {
  const { data: systemHealth, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/system-health'],
    queryFn: () => apiRequest('/api/admin/system-health'),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/admin/performance-metrics'],
    queryFn: () => apiRequest('/api/admin/performance-metrics'),
    refetchInterval: 30000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (healthLoading || metricsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Statut Système</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(systemHealth?.status || 'unknown')}
                  <span className="ml-2 text-lg font-semibold capitalize">
                    {systemHealth?.status === 'healthy' ? 'Sain' : systemHealth?.status}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temps de Fonctionnement</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {systemHealth?.uptime?.toFixed(1) || 0}%
                </p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temps de Réponse</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {performanceMetrics?.responseTime?.current?.toFixed(0) || 0}ms
                </p>
              </div>
              <Wifi className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'Erreur</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {performanceMetrics?.errorRates?.total?.toFixed(2) || 0}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            État des Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth?.services?.map((service: SystemService) => (
              <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-600">Disponibilité: {service.uptime}%</p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status === 'operational' ? 'Opérationnel' : 
                   service.status === 'degraded' ? 'Dégradé' : 
                   service.status === 'down' ? 'Hors Service' : service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilisation des Ressources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">CPU</span>
                  <span className="text-sm font-bold">{performanceMetrics?.resourceUsage?.cpu?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={performanceMetrics?.resourceUsage?.cpu || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Mémoire</span>
                  <span className="text-sm font-bold">{performanceMetrics?.resourceUsage?.memory?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={performanceMetrics?.resourceUsage?.memory || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Stockage</span>
                  <span className="text-sm font-bold">{performanceMetrics?.resourceUsage?.storage?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={performanceMetrics?.resourceUsage?.storage || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Bande Passante</span>
                  <span className="text-sm font-bold">{performanceMetrics?.resourceUsage?.bandwidth?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={performanceMetrics?.resourceUsage?.bandwidth || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métriques de Trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-800">
                    {formatNumber(performanceMetrics?.throughput?.requestsPerSecond || 0)}
                  </div>
                  <div className="text-sm text-blue-600">Requêtes/seconde</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-800">
                    {formatNumber(performanceMetrics?.throughput?.dailyRequests || 0)}
                  </div>
                  <div className="text-sm text-green-600">Requêtes/jour</div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600 mb-1">Heure de Pointe</div>
                <div className="text-lg font-bold text-purple-800">
                  {performanceMetrics?.throughput?.peakHour || 'N/A'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Taux d'Erreur par Type</div>
                {performanceMetrics?.errorRates?.byType?.map((error: { type: string; rate: number }) => (
                  <div key={error.type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{error.type}</span>
                    <span className="text-sm font-medium">{error.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunctionalSiteAdminSystemHealth;