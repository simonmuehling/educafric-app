import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, Cpu, 
  Database, Globe, HardDrive, MemoryStick, Network, 
  Server, Wifi, Zap, TrendingUp, TrendingDown,
  RefreshCw, Download, Eye, Terminal
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdate: Date;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
}

const SandboxMonitor = () => {
  const { language } = useLanguage();
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'good', trend: 'stable', lastUpdate: new Date() },
    { name: 'Memory', value: 68, unit: '%', status: 'warning', trend: 'up', lastUpdate: new Date() },
    { name: 'Disk I/O', value: 23, unit: 'MB/s', status: 'good', trend: 'down', lastUpdate: new Date() },
    { name: 'Network', value: 156, unit: 'KB/s', status: 'good', trend: 'stable', lastUpdate: new Date() },
    { name: 'API Response', value: 245, unit: 'ms', status: 'good', trend: 'down', lastUpdate: new Date() },
    { name: 'Active Connections', value: 89, unit: '', status: 'good', trend: 'up', lastUpdate: new Date() }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: new Date(), level: 'info', message: 'Sandbox environment initialized successfully', source: 'System' },
    { id: '2', timestamp: new Date(Date.now() - 30000), level: 'debug', message: 'API endpoint /api/test executed in 156ms', source: 'API' },
    { id: '3', timestamp: new Date(Date.now() - 60000), level: 'warn', message: 'Memory usage above 65% threshold', source: 'Monitor' },
    { id: '4', timestamp: new Date(Date.now() - 120000), level: 'info', message: 'Database connection pool optimized', source: 'Database' }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  const t = {
    title: language === 'fr' ? 'Moniteur Sandbox' : 'Sandbox Monitor',
    subtitle: language === 'fr' ? 'Surveillance système temps réel' : 'Real-time system monitoring',
    metrics: language === 'fr' ? 'Métriques' : 'Metrics',
    logs: language === 'fr' ? 'Journaux' : 'Logs',
    performance: language === 'fr' ? 'Performance' : 'Performance',
    network: language === 'fr' ? 'Réseau' : 'Network',
    database: language === 'fr' ? 'Base de données' : 'Database',
    refresh: language === 'fr' ? 'Actualiser' : 'Refresh',
    export: language === 'fr' ? 'Exporter' : 'Export',
    clear: language === 'fr' ? 'Effacer' : 'Clear',
    pause: language === 'fr' ? 'Pause' : 'Pause',
    resume: language === 'fr' ? 'Reprendre' : 'Resume',
    lastUpdate: language === 'fr' ? 'Dernière MAJ' : 'Last Update',
    status: language === 'fr' ? 'Statut' : 'Status',
    good: language === 'fr' ? 'Bon' : 'Good',
    warning: language === 'fr' ? 'Attention' : 'Warning',
    critical: language === 'fr' ? 'Critique' : 'Critical'
  };

  // Simulation de métriques en temps réel
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => (Array.isArray(prev) ? prev : []).map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
        status: metric.value > 80 ? 'critical' : metric.value > 60 ? 'warning' : 'good',
        lastUpdate: new Date()
      })));

      // Ajouter des logs aléatoirement
      if (Math.random() > 0.8) {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: ['info', 'warn', 'error', 'debug'][Math.floor(Math.random() * 4)] as LogEntry['level'],
          message: `System event ${Math.floor(Math.random() * 1000)}`,
          source: ['System', 'API', 'Database', 'Monitor'][Math.floor(Math.random() * 4)]
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Activity className="w-3 h-3 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warn': return 'text-orange-600 bg-orange-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'debug': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            data-testid="toggle-monitoring"
          >
            {isMonitoring ? t.pause : t.resume}
          </Button>
          <Button variant="outline" size="sm" data-testid="refresh-metrics">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline" size="sm" data-testid="export-data">
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-green-600">
                  {language === 'fr' ? 'Système Opérationnel' : 'System Operational'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Tous services fonctionnels' : 'All services functional'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-600">
                  {isMonitoring ? 
                    (language === 'fr' ? 'Surveillance Active' : 'Monitoring Active') :
                    (language === 'fr' ? 'Surveillance Pausée' : 'Monitoring Paused')
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Métriques temps réel' : 'Real-time metrics'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-purple-600">
                  {language === 'fr' ? 'Uptime 99.9%' : 'Uptime 99.9%'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Derniers 30 jours' : 'Last 30 days'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes vues */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">{t.metrics}</TabsTrigger>
          <TabsTrigger value="logs">{t.logs}</TabsTrigger>
          <TabsTrigger value="performance">{t.performance}</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(metrics) ? metrics : []).map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{metric.name || ''}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value.toFixed(0)}{metric.unit}
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {t[metric.status as keyof typeof t]}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {t.lastUpdate}: {metric.lastUpdate.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  {t.logs}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setLogs([])}>
                  {t.clear}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(Array.isArray(logs) ? logs : []).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900">{log.message}</div>
                      <div className="text-xs text-gray-500">
                        {log.source} • {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  {language === 'fr' ? 'Performance CPU' : 'CPU Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {metrics.find(m => m.name === 'CPU Usage')?.value.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'Utilisation moyenne' : 'Average usage'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  {language === 'fr' ? 'Utilisation Mémoire' : 'Memory Usage'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {metrics.find(m => m.name === 'Memory')?.value.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'fr' ? 'RAM utilisée' : 'RAM used'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SandboxMonitor;