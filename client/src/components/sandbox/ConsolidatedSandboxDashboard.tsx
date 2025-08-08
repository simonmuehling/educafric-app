import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSandboxPremium } from './SandboxPremiumProvider';
import { SimpleTutorial } from '@/components/tutorial/SimpleTutorial';
import { 
  Play, Code, Database, Users, Settings, TestTube, FileCode, Monitor, 
  Smartphone, Tablet, Globe, Zap, Shield, Clock, BarChart3, MessageSquare, 
  Bell, Mail, CheckCircle, Plus, Activity, Terminal, Layers, GitBranch,
  Cpu, MemoryStick, Network, HardDrive, Eye, RefreshCw, Download, Server,
  Gauge, AlertTriangle, TrendingUp, Calendar, Hash, Sparkles
} from 'lucide-react';
import APITester from './APITester';
import ComponentPlayground from './ComponentPlayground';
import FirebaseDeviceTest from './FirebaseDeviceTest';
import SMSTestSuite from './SMSTestSuite';
import SandboxMonitor from './SandboxMonitor';

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

const ConsolidatedSandboxDashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { hasFullAccess, getUserPlan } = useSandboxPremium();
  const [activeTab, setActiveTab] = useState('overview');
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Teacher');
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Fonctions pour les boutons
  const handleRunTests = () => {
    console.log('Lancement des tests...');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('Tests terminés');
    }, 2000);
  };

  const handleExportLogs = () => {
    console.log('Export des logs en cours...');
    const logs = `Sandbox Logs - ${new Date().toISOString()}\n`;
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sandbox-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleVersionControl = () => {
    console.log('Ouverture du contrôle de version...');
    alert(language === 'fr' ? 'Contrôle de version - Version actuelle: 2.1.0' : 'Version Control - Current version: 2.1.0');
  };

  const handleConfiguration = () => {
    console.log('Ouverture de la configuration...');
    alert(language === 'fr' ? 'Configuration du Sandbox - Accès complet activé' : 'Sandbox Configuration - Full access enabled');
  };

  const refreshMetrics = () => {
    setIsRefreshing(true);
    setMetrics({
      ...metrics,
      apiCalls: metrics.apiCalls + Math.floor(Math.random() * 50),
      responseTime: 85 + Math.floor(Math.random() * 30) - 15,
      activeUsers: metrics.activeUsers + Math.floor(Math.random() * 5) - 2,
      lastUpdate: new Date().toLocaleTimeString()
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const t = {
    title: language === 'fr' ? 'Environnement de Développement - Consolidé' : 'Development Environment - Consolidated',
    subtitle: language === 'fr' ? 'Environnement de développement unifié avec tutoriel interactif' : 'Unified development environment with interactive tutorial',
    overview: language === 'fr' ? 'Vue d\'ensemble' : 'Overview',
    interactiveTutorial: language === 'fr' ? 'Tutoriel Interactif 2025' : 'Interactive Tutorial 2025',
    apiTesting: language === 'fr' ? 'Tests API' : 'API Testing',
    components: language === 'fr' ? 'Composants UI' : 'UI Components',
    database: language === 'fr' ? 'Base de données' : 'Database',
    monitoring: language === 'fr' ? 'Surveillance' : 'Monitoring',
    deviceTesting: language === 'fr' ? 'Test Appareils' : 'Device Testing',
    realTimeMetrics: language === 'fr' ? 'Métriques Temps Réel' : 'Real-time Metrics',
    systemHealth: language === 'fr' ? 'Santé du Système' : 'System Health',
    testTutorial: language === 'fr' ? 'Tester le Tutoriel' : 'Test Tutorial',
    tutorialFeatures: language === 'fr' ? 'Fonctionnalités du Tutoriel' : 'Tutorial Features',
    presentation2025: language === 'fr' ? 'Basé sur Présentation 2025' : 'Based on 2025 Presentation',
    multiRole: language === 'fr' ? 'Multi-rôles' : 'Multi-role',
    bilingual: language === 'fr' ? 'Bilingue FR/EN' : 'Bilingual FR/EN',
    mobileFirst: language === 'fr' ? 'Mobile-First' : 'Mobile-First',
    refresh: language === 'fr' ? 'Actualiser' : 'Refresh',
    version: language === 'fr' ? 'Version' : 'Version',
    buildTime: language === 'fr' ? 'Temps de build' : 'Build time',
    lastUpdated: language === 'fr' ? 'Dernière mise à jour' : 'Last updated',
    healthy: language === 'fr' ? 'Sain' : 'Healthy',
    excellent: language === 'fr' ? 'Excellent' : 'Excellent',
    good: language === 'fr' ? 'Bon' : 'Good',
    warning: language === 'fr' ? 'Attention' : 'Warning'
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

  // Permettre le déclenchement du tutoriel depuis l'extérieur
  useEffect(() => {
    (window as any).showTutorial = () => setShowTutorial(true);
    return () => {
      delete (window as any).showTutorial;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
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

    const status = getStatus();
    const variant = status === t.excellent || status === t.good ? 'default' : 'destructive';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const quickStats = [
    {
      title: language === 'fr' ? 'Appels API' : 'API Calls',
      value: metrics.apiCalls.toString(),
      trend: '+23%',
      icon: <Code className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: language === 'fr' ? 'Temps Réponse' : 'Response Time',
      value: `${metrics.responseTime}ms`,
      trend: '-12%',
      icon: <Clock className="w-5 h-5" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: language === 'fr' ? 'Disponibilité' : 'Uptime',
      value: `${metrics.uptime.toFixed(1)}%`,
      trend: '+0.2%',
      icon: <Activity className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: language === 'fr' ? 'Erreurs' : 'Errors',
      value: metrics.errors.toString(),
      trend: '-45%',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const systemInfo = [
    {
      title: language === 'fr' ? 'Temps de Réponse' : 'Response Time',
      value: `${metrics.responseTime}ms`,
      status: getStatusBadge(metrics.responseTime, 'response'),
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: language === 'fr' ? 'Disponibilité' : 'Uptime',
      value: `${metrics.uptime.toFixed(1)}%`,
      status: getStatusBadge(metrics.uptime, 'uptime'),
      icon: <TrendingUp className="w-5 h-5" />
    },
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

  const sandboxTabs = [
    {
      id: 'overview',
      label: t.overview,
      icon: <Monitor className="w-4 h-4" />
    },
    {
      id: 'tutorial',
      label: t.interactiveTutorial,
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'api-testing',
      label: t.apiTesting,
      icon: <Code className="w-4 h-4" />
    },
    {
      id: 'components',
      label: t.components,
      icon: <FileCode className="w-4 h-4" />
    },
    {
      id: 'monitoring',
      label: t.monitoring,
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'device-testing',
      label: t.deviceTesting,
      icon: <Smartphone className="w-4 h-4" />
    },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Server className="w-3 h-3 mr-1" />
                {t.version} 5.0.0
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                {t.buildTime}: 14.21s
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
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend} vs last week
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {sandboxTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Health */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  {t.systemHealth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {systemInfo.map((info, index) => (
                    <div key={index} className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-600 shadow-sm mb-3">
                        {info.icon}
                      </div>
                      <p className="font-medium text-sm text-center">{info.title}</p>
                      <p className="text-lg font-bold text-blue-600 mb-2">{info.value}</p>
                      {info.status}
                    </div>
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
                  <Button 
                    variant="outline" 
                    className="bg-white/80 hover:bg-white"
                    onClick={handleRunTests}
                    disabled={isRefreshing}
                    data-testid="button-run-tests"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Lancer Tests' : 'Run Tests'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/80 hover:bg-white"
                    onClick={handleExportLogs}
                    data-testid="button-export-logs"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Export Logs' : 'Export Logs'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/80 hover:bg-white"
                    onClick={handleVersionControl}
                    data-testid="button-version-control"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Version Control' : 'Version Control'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/80 hover:bg-white"
                    onClick={handleConfiguration}
                    data-testid="button-configuration"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Configuration' : 'Configuration'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/80 hover:bg-white"
                    onClick={refreshMetrics}
                    disabled={isRefreshing}
                    data-testid="button-refresh-metrics"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {language === 'fr' ? 'Actualiser' : 'Refresh'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorial" className="space-y-6">
            {/* Tutorial EDUCAFRIC 2025 */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {t.interactiveTutorial}
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    2025
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {language === 'fr' 
                    ? 'Tutoriel basé sur la présentation officielle EDUCAFRIC 2025 avec contenu authentique pour chaque rôle utilisateur'
                    : 'Tutorial based on the official EDUCAFRIC 2025 presentation with authentic content for each user role'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { role: 'Teacher', modules: 8, color: 'text-blue-500' },
                    { role: 'Student', modules: 13, color: 'text-green-500' },
                    { role: 'Commercial', modules: 6, color: 'text-purple-500' },
                    { role: 'Parent', modules: 11, color: 'text-pink-500' }
                  ].map((item) => (
                    <div 
                      key={item.role}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm cursor-pointer border-2 transition-all ${
                        selectedRole === item.role ? 'border-purple-300 bg-purple-50' : 'border-transparent hover:border-gray-200'
                      }`}
                      onClick={() => setSelectedRole(item.role)}
                    >
                      <Users className={`w-5 h-5 ${item.color}`} />
                      <div>
                        <p className="font-medium text-sm">{item.role}</p>
                        <p className="text-xs text-muted-foreground">{item.modules} modules</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">{t.tutorialFeatures}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{t.presentation2025}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{t.multiRole}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{t.bilingual}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{t.mobileFirst}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center space-y-3">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">
                        {language === 'fr' ? 'Rôle sélectionné :' : 'Selected role:'}
                      </p>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        {selectedRole}
                      </Badge>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                      onClick={() => setShowTutorial(true)}
                      data-testid="button-test-tutorial"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {t.testTutorial}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {language === 'fr' 
                        ? 'Cliquez sur un rôle puis démarrez le tutoriel'
                        : 'Click on a role then start the tutorial'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-testing">
            <APITester />
          </TabsContent>

          <TabsContent value="components">
            <ComponentPlayground />
          </TabsContent>

          <TabsContent value="monitoring">
            <SandboxMonitor />
          </TabsContent>

          <TabsContent value="device-testing">
            <FirebaseDeviceTest />
          </TabsContent>


        </Tabs>
      </div>

      {/* Tutoriel Interactif */}
      <SimpleTutorial 
        isVisible={showTutorial}
        userRole={selectedRole}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};

export default ConsolidatedSandboxDashboard;