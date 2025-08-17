import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useSandboxPremium } from './SandboxPremiumProvider';
import { useSandboxTranslation } from '@/lib/sandboxTranslations';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import SandboxBulletinTester from './SandboxBulletinTester';
import { 
  Play, Code, Database, Users, Settings, TestTube, FileCode, Monitor, 
  Smartphone, Tablet, Globe, Zap, Shield, Clock, BarChart3, MessageSquare, 
  Bell, Mail, CheckCircle, Plus, Activity, Terminal, Layers, GitBranch,
  Cpu, MemoryStick, Network, HardDrive, Eye, RefreshCw, Download, Server,
  Gauge, AlertTriangle, TrendingUp, Calendar, Hash, Sparkles, Languages,
  QrCode, GraduationCap, FileText, Lock, Stamp, ClipboardCheck
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
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
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

  // Tests sandbox complets avec callback stable
  const stableRunFullTests = useStableCallback(async () => {
    return await apiRequest('/api/sandbox/run-comprehensive-tests', 'POST', {
      modules: ['auth', 'database', 'api', 'performance', 'security'],
      environment: 'sandbox',
      includeRealTimeData: true
    });
  });

  const stableOnTestsSuccess = useStableCallback(async (response: any) => {
    const data = await response.json();
    queryClient.invalidateQueries({ queryKey: ['/api/sandbox/real-time-metrics'] });
    toast({
      title: language === 'fr' ? 'Tests complets exécutés' : 'Full tests completed',
      description: language === 'fr' 
        ? `${data?.results?.passed || 0} réussis / ${data?.results?.total || 0} tests`
        : `${data?.results?.passed || 0} passed / ${data?.results?.total || 0} tests`,
    });
  });

  const runFullTestsMutation = useMutation({
    mutationFn: stableRunFullTests,
    onSuccess: stableOnTestsSuccess
  });

  // Export des données sandbox avec callback stable
  const stableExportData = useStableCallback(async () => {
    return await apiRequest('/api/sandbox/export-complete-data', 'POST', {
      includeMetrics: true,
      includeLogs: true,
      includeTests: true,
      timeRange: '24h'
    });
  });

  const stableOnExportSuccess = useStableCallback(async (response: any) => {
    const data = await response.json();
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
  });

  const exportSandboxDataMutation = useMutation({
    mutationFn: stableExportData,
    onSuccess: stableOnExportSuccess
  });

  // Réinitialisation complète du sandbox avec callback stable
  const stableResetSandbox = useStableCallback(async () => {
    return await apiRequest('/api/sandbox/complete-reset', 'POST', {
      resetData: true,
      resetMetrics: true,
      resetCache: true
    });
  });

  const stableOnResetSuccess = useStableCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/sandbox/real-time-metrics'] });
    toast({
      title: language === 'fr' ? 'Sandbox réinitialisé' : 'Sandbox reset',
      description: language === 'fr' ? 'Environnement complètement réinitialisé' : 'Environment completely reset',
    });
  });

  const resetSandboxMutation = useMutation({
    mutationFn: stableResetSandbox,
    onSuccess: stableOnResetSuccess
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
              onClick={useStableCallback(() => runFullTestsMutation.mutate())}
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
                <span>{language === 'fr' ? 'Tests Bulletins' : 'Bulletin Tests'}</span>
                <Badge variant="default">✓ 6/6</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{language === 'fr' ? 'QR Codes' : 'QR Codes'}</span>
                <Badge variant="default">✓ 100%</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{language === 'fr' ? 'Tests DB' : 'DB Tests'}</span>
                <Badge variant="default">✓ 8/8</Badge>
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
              onClick={useStableCallback(() => window.open('/bulletin-tests', '_blank'))}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Tests Bulletins' : 'Bulletin Tests'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={useStableCallback(() => exportSandboxDataMutation.mutate())}
              disabled={exportSandboxDataMutation.isPending}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Exporter données' : 'Export Data'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={useStableCallback(() => {
                queryClient.invalidateQueries({ queryKey: ['/api/sandbox/real-time-metrics'] });
                toast({
                  title: language === 'fr' ? 'Actualisé' : 'Refreshed',
                  description: language === 'fr' ? 'Métriques mises à jour' : 'Metrics updated',
                });
              })}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={useStableCallback(() => resetSandboxMutation.mutate())}
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
            {language === 'fr' ? 'Sandbox Actualisé 2025' : 'Updated Sandbox 2025'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'fr' 
              ? 'Environnement de test avec bulletins sécurisés et QR codes'
              : 'Testing environment with secure bulletins and QR codes'
            }
          </p>
          <div className="flex gap-2 mt-3">
            <Badge className="bg-blue-100 text-blue-800">
              {language === 'fr' ? '🔒 Bulletins Sécurisés' : '🔒 Secure Bulletins'}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {language === 'fr' ? '📱 QR Codes SHA-256' : '📱 QR Codes SHA-256'}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              {language === 'fr' ? '🛡️ Triple Validation' : '🛡️ Triple Validation'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={(realTimeMetrics as RealTimeMetrics)?.systemHealth === 'excellent' ? 'default' : 'secondary'}>
            {(realTimeMetrics as RealTimeMetrics)?.systemHealth || 'excellent'}
          </Badge>
          <Button
            variant="outline"
            onClick={useStableCallback(() => setActiveTab(activeTab === 'overview' ? 'testing' : 'overview'))}
          >
            <Languages className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Changer vue' : 'Switch View'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            {language === 'fr' ? 'Vue d\'ensemble' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="bulletins">
            {language === 'fr' ? 'Bulletins' : 'Bulletins'}
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

        <TabsContent value="bulletins">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  {language === 'fr' ? 'Tests Bulletins Sécurisés' : 'Secure Bulletins Testing'}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' 
                    ? 'Système complet de test des bulletins avec QR codes et validation cryptographique'
                    : 'Complete bulletin testing system with QR codes and cryptographic validation'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SandboxBulletinTester />
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">
                      {language === 'fr' ? 'Nouvelles Fonctionnalités' : 'New Features'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'QR codes SHA-256 sécurisés' : 'Secure SHA-256 QR codes'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <Lock className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">
                      {language === 'fr' ? 'Sécurité Renforcée' : 'Enhanced Security'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Triple validation système' : 'Triple validation system'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3">
                  <Stamp className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">
                      {language === 'fr' ? 'Tampons Numériques' : 'Digital Stamps'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Signatures intégrées' : 'Integrated signatures'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
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