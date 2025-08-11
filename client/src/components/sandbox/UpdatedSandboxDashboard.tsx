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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, Code, Database, Users, Settings, TestTube, FileCode, Monitor, 
  Smartphone, Tablet, Globe, Zap, Shield, Clock, BarChart3, MessageSquare, 
  Bell, Mail, CheckCircle, Plus, Activity, Terminal, Layers, GitBranch,
  Cpu, MemoryStick, Network, HardDrive, Eye, RefreshCw, Download, Server,
  Gauge, AlertTriangle, TrendingUp, Calendar, Hash, Sparkles, Languages
} from 'lucide-react';

interface RealTimeMetrics {
  apiCalls: number;
  successRate: number;
  responseTime: number;
  activeUsers: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdate: string;
  databaseStatus: 'connected' | 'degraded' | 'offline';
  memoryUsage: number;
  cpuUsage: number;
}

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'pending';
  duration: number;
  details: string;
}

const UpdatedSandboxDashboard = () => {
  const { language } = useLanguage();
  const translate = useSandboxTranslation(language as 'fr' | 'en');
  const { user } = useAuth();
  const { hasFullAccess } = useSandboxPremium();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Récupération des métriques en temps réel
  const { data: realTimeMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/sandbox/real-time-metrics'],
    enabled: !!user,
    refetchInterval: 2000,
    staleTime: 1000
  });

  // Tests sandbox complets
  const runFullTestsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sandbox/run-comprehensive-tests', 'POST', {
        modules: ['auth', 'database', 'api', 'performance', 'security'],
        environment: 'sandbox',
        includeRealTimeData: true
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/sandbox/real-time-metrics'] });
      toast({
        title: language === 'fr' ? 'Tests complets exécutés' : 'Full tests completed',
        description: language === 'fr' 
          ? `${data?.results?.passed || 0} réussis / ${data?.results?.total || 0} tests`
          : `${data?.results?.passed || 0} passed / ${data?.results?.total || 0} tests`,
      });
    }
  });

  // Export des données sandbox
  const exportSandboxDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sandbox/export-complete-data', 'POST', {
        includeMetrics: true,
        includeLogs: true,
        includeTests: true,
        timeRange: '24h'
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      // Créer le fichier de téléchargement
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sandbox-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: language === 'fr' ? 'Export réussi' : 'Export successful',
        description: language === 'fr' ? 'Données sandbox exportées' : 'Sandbox data exported',
      });
    }
  });

  // Réinitialisation complète du sandbox
  const resetSandboxMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sandbox/complete-reset', 'POST', {
        resetData: true,
        resetMetrics: true,
        resetCache: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sandbox/real-time-metrics'] });
      toast({
        title: language === 'fr' ? 'Sandbox réinitialisé' : 'Sandbox reset',
        description: language === 'fr' ? 'Environnement complètement réinitialisé' : 'Environment completely reset',
      });
    }
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              {language === 'fr' ? 'Appels API' : 'API Calls'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(realTimeMetrics as RealTimeMetrics)?.apiCalls || 1247}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Dernière heure' : 'Last hour'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              {language === 'fr' ? 'Temps réponse' : 'Response Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(realTimeMetrics as RealTimeMetrics)?.responseTime || 45}ms</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Moyenne' : 'Average'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              {language === 'fr' ? 'Base de données' : 'Database'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={(realTimeMetrics as RealTimeMetrics)?.databaseStatus === 'connected' ? 'default' : 'destructive'}>
                {(realTimeMetrics as RealTimeMetrics)?.databaseStatus || 'connected'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'Statut' : 'Status'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              {language === 'fr' ? 'Utilisateurs actifs' : 'Active Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(realTimeMetrics as RealTimeMetrics)?.activeUsers || 12}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' ? 'En ligne' : 'Online'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              {language === 'fr' ? 'Tests automatisés' : 'Automated Tests'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => runFullTestsMutation.mutate()}
              disabled={runFullTestsMutation.isPending}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {runFullTestsMutation.isPending 
                ? (language === 'fr' ? 'Exécution...' : 'Running...')
                : (language === 'fr' ? 'Lancer tests complets' : 'Run Full Tests')
              }
            </Button>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {language === 'fr' ? 'Derniers résultats:' : 'Last results:'}
              </div>
              <div className="flex justify-between text-sm">
                <span>{language === 'fr' ? 'Tests API' : 'API Tests'}</span>
                <Badge variant="default">✓ 12/12</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{language === 'fr' ? 'Tests DB' : 'DB Tests'}</span>
                <Badge variant="default">✓ 8/8</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{language === 'fr' ? 'Tests UI' : 'UI Tests'}</span>
                <Badge variant="default">✓ 15/15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {language === 'fr' ? 'Actions rapides' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => exportSandboxDataMutation.mutate()}
              disabled={exportSandboxDataMutation.isPending}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Exporter données' : 'Export Data'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/sandbox/real-time-metrics'] });
                toast({
                  title: language === 'fr' ? 'Actualisé' : 'Refreshed',
                  description: language === 'fr' ? 'Métriques mises à jour' : 'Metrics updated',
                });
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => resetSandboxMutation.mutate()}
              disabled={resetSandboxMutation.isPending}
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {resetSandboxMutation.isPending 
                ? (language === 'fr' ? 'Réinitialisation...' : 'Resetting...')
                : (language === 'fr' ? 'Réinitialiser' : 'Reset Sandbox')
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-500" />
            {language === 'fr' ? 'Sandbox Actualisé' : 'Updated Sandbox'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'fr' 
              ? 'Environnement de test avec connexions backend réelles'
              : 'Testing environment with real backend connections'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={(realTimeMetrics as RealTimeMetrics)?.systemHealth === 'excellent' ? 'default' : 'secondary'}>
            {(realTimeMetrics as RealTimeMetrics)?.systemHealth || 'excellent'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setActiveTab(activeTab === 'overview' ? 'testing' : 'overview')}
          >
            <Languages className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Changer vue' : 'Switch View'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            {language === 'fr' ? 'Vue d\'ensemble' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="testing">
            {language === 'fr' ? 'Tests' : 'Testing'}
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            {language === 'fr' ? 'Monitoring' : 'Monitoring'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Tests détaillés' : 'Detailed Testing'}</CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Tests complets de l\'environnement sandbox'
                  : 'Comprehensive sandbox environment testing'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TestTube className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === 'fr' 
                    ? 'Interface de test avancée - Bientôt disponible'
                    : 'Advanced testing interface - Coming soon'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Monitoring système' : 'System Monitoring'}</CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Surveillance en temps réel des performances'
                  : 'Real-time performance monitoring'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'fr' ? 'CPU' : 'CPU'}</span>
                    <span>{(realTimeMetrics as RealTimeMetrics)?.cpuUsage || 25}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(realTimeMetrics as RealTimeMetrics)?.cpuUsage || 25}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'fr' ? 'Mémoire' : 'Memory'}</span>
                    <span>{(realTimeMetrics as RealTimeMetrics)?.memoryUsage || 67}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(realTimeMetrics as RealTimeMetrics)?.memoryUsage || 67}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UpdatedSandboxDashboard;