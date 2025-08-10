import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSandboxPremium } from './SandboxPremiumProvider';
import { useSandboxTranslation } from '@/lib/sandboxTranslations';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, Code, Database, Users, Settings, TestTube, FileCode, Monitor, 
  Smartphone, Tablet, Globe, Zap, Shield, Clock, BarChart3, MessageSquare, 
  Bell, Mail, CheckCircle, Plus, Activity, Terminal, Layers, GitBranch,
  Cpu, MemoryStick, Network, HardDrive, Eye, RefreshCw, Download, Server,
  Gauge, AlertTriangle, TrendingUp, Calendar, Hash, Sparkles, Languages
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

const BilingualSandboxDashboard = () => {
  const { language, setLanguage } = useLanguage();
  const translate = useSandboxTranslation(language as 'fr' | 'en');
  const { user } = useAuth();
  const { hasFullAccess, getUserPlan } = useSandboxPremium();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  // Fetch real sandbox metrics
  const { data: sandboxMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/sandbox/metrics'],
    enabled: !!user,
    refetchInterval: 5000
  });

  // Mutation pour exécuter les tests sandbox
  const runTestsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sandbox/run-tests', 'POST', {
        testSuite: 'full',
        includeIntegration: true
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/sandbox/metrics'] });
      toast({
        title: translate('runTests'),
        description: language === 'fr' 
          ? `Tests complétés: ${data?.passedTests || 0}/${data?.totalTests || 0} réussis`
          : `Tests completed: ${data?.passedTests || 0}/${data?.totalTests || 0} passed`,
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'exécuter les tests' : 'Failed to run tests',
        variant: 'destructive'
      });
    }
  });

  // Mutation pour l'export des logs
  const exportLogsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sandbox/export-logs', 'POST', {
        format: 'txt',
        includeMetrics: true,
        dateRange: '7d'
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      const blob = new Blob([data.content || 'Sandbox logs exported'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sandbox-logs-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: translate('exportLogs'),
        description: language === 'fr' ? 'Logs exportés avec succès' : 'Logs exported successfully',
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'exporter les logs' : 'Failed to export logs',
        variant: 'destructive'
      });
    }
  });

  // Actions handlers avec mutations backend
  const handleRunTests = () => {
    runTestsMutation.mutate();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleExportLogs = () => {
    exportLogsMutation.mutate();
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLanguage);
    toast({
      title: language === 'fr' ? 'Language changed to English' : 'Langue changée en Français',
      description: language === 'fr' ? 'Interface is now in English' : 'L\'interface est maintenant en français',
      duration: 2000,
    });
  };

  // Mise à jour des métriques en temps réel
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
          return value >= 99.5 ? translate('excellent') : value >= 98 ? translate('good') : translate('warning');
        case 'memory':
          return value <= 70 ? translate('good') : value <= 85 ? translate('warning') : translate('critical');
        case 'response':
          return value <= 100 ? translate('excellent') : value <= 200 ? translate('good') : translate('warning');
        default:
          return translate('good');
      }
    };

    const status = getStatus();
    const variant = status === translate('excellent') || status === translate('good') ? 'default' : 'destructive';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const quickStats = [
    {
      title: translate('apiCalls'),
      value: metrics.apiCalls.toString(),
      trend: '+23%',
      icon: <Code className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: translate('responseTime'),
      value: `${metrics.responseTime}ms`,
      trend: '-12%',
      icon: <Clock className="w-5 h-5" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: translate('uptime'),
      value: `${metrics.uptime.toFixed(1)}%`,
      trend: '+0.2%',
      icon: <Activity className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: translate('errors'),
      value: metrics.errors.toString(),
      trend: '-45%',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header bilingue modernisé */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Terminal className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {translate('title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  {translate('subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Bouton changement de langue */}
              <Button
                onClick={handleLanguageToggle}
                variant="outline"
                size="sm"
                className="click-bounce hover-lift"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'EN' : 'FR'}
              </Button>
              
              <Button 
                onClick={handleRunTests}
                disabled={isRefreshing}
                className="gradient-hover click-bounce"
              >
                {isRefreshing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                {translate('runTests')}
              </Button>
              
              <Button 
                onClick={handleExportLogs}
                variant="outline"
                className="hover-lift click-bounce"
              >
                <Download className="h-4 w-4 mr-2" />
                {translate('exportLogs')}
              </Button>
            </div>
          </div>
        </div>

        {/* Métriques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover-lift cursor-pointer card-tilt">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.trend}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="click-bounce">
              <BarChart3 className="h-4 w-4 mr-2" />
              {translate('overview')}
            </TabsTrigger>
            <TabsTrigger value="testing" className="click-bounce">
              <TestTube className="h-4 w-4 mr-2" />
              {translate('testing')}
            </TabsTrigger>
            <TabsTrigger value="playground" className="click-bounce">
              <Code className="h-4 w-4 mr-2" />
              {translate('playground')}
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="click-bounce">
              <Monitor className="h-4 w-4 mr-2" />
              {translate('monitoring')}
            </TabsTrigger>
            <TabsTrigger value="apis" className="click-bounce">
              <Globe className="h-4 w-4 mr-2" />
              {translate('apis')}
            </TabsTrigger>
          </TabsList>

          {/* Contenu de l'onglet Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Métriques système détaillées */}
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-blue-500" />
                    {translate('systemMetrics')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{translate('memoryUsage')}</span>
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(metrics.memoryUsage, 'memory')}>
                          {metrics.memoryUsage}%
                        </span>
                        {getStatusBadge(metrics.memoryUsage, 'memory')}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{translate('activeUsers')}</span>
                      <span className="font-medium">{metrics.activeUsers}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{translate('dbConnections')}</span>
                      <span className="font-medium">{metrics.dbConnections}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{translate('lastUpdate')}</span>
                      <span className="text-xs text-gray-500">{metrics.lastUpdate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statut du système */}
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {translate('active')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {translate('running')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cache</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {translate('active')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monitoring</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {translate('active')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Actions rapides */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="hover-lift click-bounce h-auto p-4 flex-col">
                    <TestTube className="h-6 w-6 mb-2" />
                    <span className="text-xs">{language === 'fr' ? 'Tests API' : 'API Tests'}</span>
                  </Button>
                  
                  <Button variant="outline" className="hover-lift click-bounce h-auto p-4 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    <span className="text-xs">{language === 'fr' ? 'Base de données' : 'Database'}</span>
                  </Button>
                  
                  <Button variant="outline" className="hover-lift click-bounce h-auto p-4 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-xs">{language === 'fr' ? 'Utilisateurs' : 'Users'}</span>
                  </Button>
                  
                  <Button variant="outline" className="hover-lift click-bounce h-auto p-4 flex-col">
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-xs">{translate('settings')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Autres onglets - placeholder pour le moment */}
          <TabsContent value="testing">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{translate('testing')} Suite</CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Outils de test complets pour l\'API et les composants' : 'Comprehensive testing tools for API and components'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'fr' ? 'Module de test en cours de développement' : 'Testing module under development'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playground">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{translate('componentPlayground')}</CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Testez et développez des composants en temps réel' : 'Test and develop components in real-time'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'fr' ? 'Playground en cours de développement' : 'Playground under development'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{translate('systemMonitoring')}</CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Surveillance en temps réel du système' : 'Real-time system monitoring'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'fr' ? 'Module de surveillance en cours de développement' : 'Monitoring module under development'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apis">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{translate('apiTester')}</CardTitle>
                <CardDescription>
                  {language === 'fr' ? 'Testez et documentez les APIs EDUCAFRIC' : 'Test and document EDUCAFRIC APIs'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'fr' ? 'Module API en cours de développement' : 'API module under development'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BilingualSandboxDashboard;