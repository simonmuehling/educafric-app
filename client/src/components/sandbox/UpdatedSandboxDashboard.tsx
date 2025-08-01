import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSandboxPremium } from './SandboxPremiumProvider';
import { 
  Play, Code, Database, Users, Settings, TestTube, FileCode, Monitor, 
  Smartphone, Tablet, Globe, Zap, Shield, Clock, BarChart3, MessageSquare, 
  Bell, Mail, CheckCircle, Plus, Activity, Terminal, Layers, GitBranch,
  Cpu, MemoryStick, Network, HardDrive, Eye, RefreshCw, Download, Server,
  Gauge, AlertTriangle, TrendingUp, Calendar, Hash, Sparkles
} from 'lucide-react';

interface SystemMetrics {
  apiCalls: number;
  errors: number;
  responseTime: number;
  uptime: number;
  memoryUsage: number;
  activeUsers: number;
  dbConnections: number;
  lastUpdate: string;
}

const UpdatedSandboxDashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { hasFullAccess, getUserPlan } = useSandboxPremium();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    apiCalls: 1247,
    errors: 3,
    responseTime: 85,
    uptime: 99.8,
    memoryUsage: 67,
    activeUsers: 12,
    dbConnections: 8,
    lastUpdate: new Date().toLocaleTimeString()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = {
    title: language === 'fr' ? 'Sandbox Educafric - Actualisé' : 'Educafric Sandbox - Updated',
    subtitle: language === 'fr' ? 'Environnement de développement modernisé et optimisé' : 'Modernized and optimized development environment',
    overview: language === 'fr' ? 'Vue d\'ensemble' : 'Overview',
    realTimeStats: language === 'fr' ? 'Statistiques Temps Réel' : 'Real-time Statistics',
    systemHealth: language === 'fr' ? 'Santé du Système' : 'System Health',
    apiTesting: language === 'fr' ? 'Tests API' : 'API Testing',
    components: language === 'fr' ? 'Composants UI' : 'UI Components',
    database: language === 'fr' ? 'Base de données' : 'Database',
    performance: language === 'fr' ? 'Performance' : 'Performance',
    security: language === 'fr' ? 'Sécurité' : 'Security',
    monitoring: language === 'fr' ? 'Surveillance' : 'Monitoring',
    testing: language === 'fr' ? 'Tests' : 'Testing',
    deployment: language === 'fr' ? 'Déploiement' : 'Deployment',
    refresh: language === 'fr' ? 'Actualiser' : 'Refresh',
    status: language === 'fr' ? 'Statut' : 'Status',
    lastUpdated: language === 'fr' ? 'Dernière mise à jour' : 'Last updated',
    healthy: language === 'fr' ? 'Sain' : 'Healthy',
    excellent: language === 'fr' ? 'Excellent' : 'Excellent',
    good: language === 'fr' ? 'Bon' : 'Good',
    warning: language === 'fr' ? 'Attention' : 'Warning',
    version: language === 'fr' ? 'Version' : 'Version',
    buildTime: language === 'fr' ? 'Temps de build' : 'Build time'
  };

  // Simulation de métriques en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 8) + 1,
        errors: prev.errors + (Math.random() > 0.95 ? 1 : 0),
        responseTime: Math.floor(Math.random() * 50) + 70,
        uptime: Math.max(99.5, prev.uptime + (Math.random() - 0.5) * 0.1),
        memoryUsage: Math.max(45, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeUsers: Math.max(8, Math.min(25, prev.activeUsers + Math.floor((Math.random() - 0.5) * 3))),
        dbConnections: Math.max(5, Math.min(15, prev.dbConnections + Math.floor((Math.random() - 0.5) * 2))),
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMetrics(prev => ({
      ...prev,
      lastUpdate: new Date().toLocaleTimeString()
    }));
    setIsRefreshing(false);
  };

  const getStatusColor = (value: number, type: 'uptime' | 'memory' | 'response') => {
    switch (type) {
      case 'uptime':
        return value >= 99.5 ? 'text-green-600' : value >= 98 ? 'text-yellow-600' : 'text-red-600';
      case 'memory':
        return value <= 70 ? 'text-green-600' : value <= 85 ? 'text-yellow-600' : 'text-red-600';
      case 'response':
        return value <= 100 ? 'text-green-600' : value <= 200 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (value: number, type: 'uptime' | 'memory' | 'response') => {
    const getStatus = () => {
      switch (type) {
        case 'uptime':
          return value >= 99.5 ? t.excellent : value >= 98 ? t.good : t.warning;
        case 'memory':
          return value <= 70 ? t.good : value <= 85 ? t.warning : 'Critical';
        case 'response':
          return value <= 100 ? t.excellent : value <= 200 ? t.good : t.warning;
        default:
          return t.good;
      }
    };

    const variant = type === 'uptime' ? (value >= 99.5 ? 'default' : 'secondary') :
                   type === 'memory' ? (value <= 70 ? 'default' : 'destructive') :
                   value <= 100 ? 'default' : 'secondary';

    return <Badge variant={variant as any}>{getStatus()}</Badge>;
  };

  const quickStats = [
    {
      title: language === 'fr' ? 'Appels API' : 'API Calls',
      value: metrics.apiCalls.toLocaleString(),
      icon: <Hash className="w-4 h-4" />,
      trend: '+12.5%',
      color: 'text-blue-600'
    },
    {
      title: language === 'fr' ? 'Erreurs' : 'Errors',
      value: metrics.errors.toString(),
      icon: <AlertTriangle className="w-4 h-4" />,
      trend: '-2.1%',
      color: 'text-red-600'
    },
    {
      title: language === 'fr' ? 'Temps Réponse' : 'Response Time',
      value: `${metrics.responseTime}ms`,
      icon: <Clock className="w-4 h-4" />,
      trend: '-8.3%',
      color: getStatusColor(metrics.responseTime, 'response')
    },
    {
      title: language === 'fr' ? 'Disponibilité' : 'Uptime',
      value: `${metrics.uptime.toFixed(1)}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      trend: '+0.2%',
      color: getStatusColor(metrics.uptime, 'uptime')
    }
  ];

  const systemInfo = [
    {
      title: language === 'fr' ? 'Utilisation Mémoire' : 'Memory Usage',
      value: `${metrics.memoryUsage}%`,
      status: getStatusBadge(metrics.memoryUsage, 'memory'),
      icon: <MemoryStick className="w-5 h-5" />
    },
    {
      title: language === 'fr' ? 'Utilisateurs Actifs' : 'Active Users',
      value: metrics.activeUsers.toString(),
      status: <Badge variant="outline">{t.healthy}</Badge>,
      icon: <Users className="w-5 h-5" />
    },
    {
      title: language === 'fr' ? 'Connexions DB' : 'DB Connections',
      value: metrics.dbConnections.toString(),
      status: <Badge variant="default">Stable</Badge>,
      icon: <Database className="w-5 h-5" />
    }
  ];

  const sandboxModules = [
    {
      id: 'api-testing',
      title: language === 'fr' ? 'Tests API' : 'API Testing',
      description: language === 'fr' ? 'Tester les endpoints REST et GraphQL' : 'Test REST and GraphQL endpoints',
      icon: <Code className="w-6 h-6" />,
      status: 'active',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      id: 'ui-components',
      title: language === 'fr' ? 'Composants UI' : 'UI Components',
      description: language === 'fr' ? 'Bibliothèque de composants interactifs' : 'Interactive component library',
      icon: <FileCode className="w-6 h-6" />,
      status: 'active',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      id: 'database',
      title: language === 'fr' ? 'Base de données' : 'Database',
      description: language === 'fr' ? 'Requêtes et gestion des données' : 'Data queries and management',
      icon: <Database className="w-6 h-6" />,
      status: 'active',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      id: 'performance',
      title: language === 'fr' ? 'Performance' : 'Performance',
      description: language === 'fr' ? 'Analyse et optimisation' : 'Analysis and optimization',
      icon: <Gauge className="w-6 h-6" />,
      status: 'active',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    {
      id: 'security',
      title: language === 'fr' ? 'Sécurité' : 'Security',
      description: language === 'fr' ? 'Tests de sécurité et vulnérabilités' : 'Security testing and vulnerabilities',
      icon: <Shield className="w-6 h-6" />,
      status: 'active',
      color: 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      id: 'monitoring',
      title: language === 'fr' ? 'Surveillance' : 'Monitoring',
      description: language === 'fr' ? 'Logs système et métriques' : 'System logs and metrics',
      icon: <Monitor className="w-6 h-6" />,
      status: 'active',
      color: 'bg-gradient-to-r from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.title || ''}
            </h1>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Server className="w-3 h-3 mr-1" />
                {t.version} 4.2.1
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                {t.buildTime}: 17.36s
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t.lastUpdated}: {metrics.lastUpdate}
              </span>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(quickStats) ? quickStats : []).map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title || ''}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend} vs last week
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Health */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              {t.systemHealth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Array.isArray(systemInfo) ? systemInfo : []).map((info, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-600 shadow-sm">
                      {info.icon}
                    </div>
                    <div>
                      <p className="font-medium">{info.title || ''}</p>
                      <p className="text-xl font-bold text-blue-600">{info.value}</p>
                    </div>
                  </div>
                  {info.status}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sandbox Modules */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Modules Sandbox
            </CardTitle>
            <CardDescription>
              {language === 'fr' ? 'Outils de développement et test disponibles' : 'Available development and testing tools'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(sandboxModules) ? sandboxModules : []).map((module) => (
                <Card key={module.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`inline-flex p-3 rounded-lg text-white mb-4 ${module.color}`}>
                          {module.icon}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {module.title || ''}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{module.description || ''}</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bg-white/80 hover:bg-white">
                <Play className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Lancer Tests' : 'Run Tests'}
              </Button>
              <Button variant="outline" className="bg-white/80 hover:bg-white">
                <Download className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Export Logs' : 'Export Logs'}
              </Button>
              <Button variant="outline" className="bg-white/80 hover:bg-white">
                <GitBranch className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Version Control' : 'Version Control'}
              </Button>
              <Button variant="outline" className="bg-white/80 hover:bg-white">
                <Settings className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Configuration' : 'Configuration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdatedSandboxDashboard;