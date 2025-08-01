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
  Cpu, MemoryStick, Network, HardDrive, Eye, RefreshCw, Download
} from 'lucide-react';

const EnhancedSandboxDashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { hasFullAccess, getUserPlan } = useSandboxPremium();
  const [activeMetrics, setActiveMetrics] = useState({
    apiCalls: 0,
    errors: 0,
    responseTime: 0,
    uptime: 100
  });

  const t = {
    title: language === 'fr' ? 'Sandbox Educafric Avancé' : 'Advanced Educafric Sandbox',
    subtitle: language === 'fr' ? 'Environnement de développement et test complet' : 'Complete development and testing environment',
    overview: language === 'fr' ? 'Vue d\'ensemble' : 'Overview',
    apiTesting: language === 'fr' ? 'Tests API' : 'API Testing',
    components: language === 'fr' ? 'Composants' : 'Components',
    database: language === 'fr' ? 'Base de données' : 'Database',
    performance: language === 'fr' ? 'Performance' : 'Performance',
    monitoring: language === 'fr' ? 'Surveillance' : 'Monitoring',
    logs: language === 'fr' ? 'Journaux' : 'Logs',
    testing: language === 'fr' ? 'Tests' : 'Testing',
    deployment: language === 'fr' ? 'Déploiement' : 'Deployment',
    security: language === 'fr' ? 'Sécurité' : 'Security',
    analytics: language === 'fr' ? 'Analytiques' : 'Analytics',
    realTimeMetrics: language === 'fr' ? 'Métriques Temps Réel' : 'Real-time Metrics',
    systemHealth: language === 'fr' ? 'Santé du Système' : 'System Health',
    activeConnections: language === 'fr' ? 'Connexions Actives' : 'Active Connections',
    memoryUsage: language === 'fr' ? 'Utilisation Mémoire' : 'Memory Usage',
    diskSpace: language === 'fr' ? 'Espace Disque' : 'Disk Space',
    networkLatency: language === 'fr' ? 'Latence Réseau' : 'Network Latency',
    refresh: language === 'fr' ? 'Actualiser' : 'Refresh',
    export: language === 'fr' ? 'Exporter' : 'Export',
    clearLogs: language === 'fr' ? 'Effacer Logs' : 'Clear Logs',
    runTests: language === 'fr' ? 'Lancer Tests' : 'Run Tests',
    viewDetails: language === 'fr' ? 'Voir Détails' : 'View Details'
  };

  // Simulation de métriques en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetrics(prev => ({
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 5),
        errors: prev.errors + (Math.random() > 0.9 ? 1 : 0),
        responseTime: Math.floor(Math.random() * 200) + 50,
        uptime: Math.max(95, 100 - Math.random() * 5)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const systemStats = [
    {
      title: t.activeConnections,
      value: "247",
      change: "+12%",
      icon: <Network className="w-4 h-4" />,
      color: "text-blue-600"
    },
    {
      title: t.memoryUsage,
      value: "64%",
      change: "-2%", 
      icon: <MemoryStick className="w-4 h-4" />,
      color: "text-green-600"
    },
    {
      title: t.diskSpace,
      value: "78%",
      change: "+1%",
      icon: <HardDrive className="w-4 h-4" />,
      color: "text-orange-600"
    },
    {
      title: t.networkLatency,
      value: `${activeMetrics.responseTime}ms`,
      change: "~",
      icon: <Activity className="w-4 h-4" />,
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: t.runTests,
      description: language === 'fr' ? 'Lancer la suite de tests complète' : 'Run complete test suite',
      icon: <TestTube className="w-5 h-5" />,
      action: () => console.log('Running tests...'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: t.refresh,
      description: language === 'fr' ? 'Actualiser toutes les métriques' : 'Refresh all metrics',
      icon: <RefreshCw className="w-5 h-5" />,
      action: () => window.location.reload(),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: t.export,
      description: language === 'fr' ? 'Exporter les données de debug' : 'Export debug data',
      icon: <Download className="w-5 h-5" />,
      action: () => console.log('Exporting data...'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: t.clearLogs,
      description: language === 'fr' ? 'Effacer tous les journaux' : 'Clear all logs',
      icon: <Terminal className="w-5 h-5" />,
      action: () => console.log('Clearing logs...'),
      color: "bg-red-500 hover:bg-red-600"
    }
  ];

  const devTools = [
    {
      id: 'inspector',
      title: 'Web Inspector',
      description: language === 'fr' ? 'Outil d\'inspection et de débogage avancé' : 'Advanced inspection and debugging tool',
      icon: <Eye className="w-6 h-6" />,
      route: '/debug-inspector',
      status: 'active'
    },
    {
      id: 'api-tester',
      title: 'API Tester',
      description: language === 'fr' ? 'Interface de test pour toutes les APIs' : 'Testing interface for all APIs',
      icon: <Code className="w-6 h-6" />,
      route: '/sandbox/api-testing',
      status: 'active'
    },
    {
      id: 'component-playground',
      title: 'Component Playground',
      description: language === 'fr' ? 'Bac à sable pour tester les composants UI' : 'Sandbox for testing UI components',
      icon: <Layers className="w-6 h-6" />,
      route: '/sandbox/components',
      status: 'active'
    },
    {
      id: 'database-explorer',
      title: 'Database Explorer',
      description: language === 'fr' ? 'Explorateur et requêteur de base de données' : 'Database explorer and query tool',
      icon: <Database className="w-6 h-6" />,
      route: '/sandbox/database',
      status: 'beta'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header avec statistiques temps réel */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{t.title || ''}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
          <Badge className="bg-green-500 text-white">
            {language === 'fr' ? 'En ligne' : 'Online'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(Array.isArray(systemStats) ? systemStats : []).map((stat, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className={stat.color}>
                  {stat.icon}
                </div>
                <span className="text-sm text-blue-100">{stat.change}</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.title || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Array.isArray(quickActions) ? quickActions : []).map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white h-auto p-4 flex flex-col items-start gap-2`}
                data-testid={`quick-action-${(action.title || '').toLowerCase().replace(/\s+/g, '-')}`}
              >
                {action.icon}
                <div className="text-left">
                  <div className="font-semibold text-sm">{action.title || ''}</div>
                  <div className="text-xs opacity-90">{action.description || ''}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outils de développement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {language === 'fr' ? 'Outils de Développement' : 'Development Tools'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(devTools) ? devTools : []).map((tool) => (
              <Card key={tool.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.open(tool.route, '_blank')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{tool.title || ''}</h3>
                        <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                          {tool.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{tool.description || ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métriques de performance en temps réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t.realTimeMetrics}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{activeMetrics.apiCalls}</div>
              <div className="text-sm text-gray-600">{language === 'fr' ? 'Appels API' : 'API Calls'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{activeMetrics.errors}</div>
              <div className="text-sm text-gray-600">{language === 'fr' ? 'Erreurs' : 'Errors'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{activeMetrics.uptime.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">{language === 'fr' ? 'Disponibilité' : 'Uptime'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État du système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.systemHealth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === 'fr' ? 'Serveur Backend' : 'Backend Server'}</span>
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" /> {language === 'fr' ? 'Opérationnel' : 'Operational'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === 'fr' ? 'Base de données' : 'Database'}</span>
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" /> {language === 'fr' ? 'Connectée' : 'Connected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === 'fr' ? 'Services externes' : 'External Services'}</span>
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" /> {language === 'fr' ? 'Disponibles' : 'Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === 'fr' ? 'Cache Redis' : 'Redis Cache'}</span>
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" /> {language === 'fr' ? 'Actif' : 'Active'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSandboxDashboard;