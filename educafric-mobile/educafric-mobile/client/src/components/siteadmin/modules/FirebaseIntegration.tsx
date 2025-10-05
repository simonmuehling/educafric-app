import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Smartphone, Database, MessageSquare, BarChart3, Settings, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function FirebaseIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [testingService, setTestingService] = useState<string | null>(null);

  const { data: firebaseStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['/api/admin/firebase/status'],
    queryFn: () => fetch('/api/admin/firebase/status', { credentials: 'include' }).then(res => res.json())
  });

  const { data: firebaseStats } = useQuery({
    queryKey: ['/api/admin/firebase/stats'],
    queryFn: () => fetch('/api/admin/firebase/stats', { credentials: 'include' }).then(res => res.json())
  });

  const testServiceMutation = useMutation({
    mutationFn: async (service: string) => {
      return apiRequest('POST', `/api/admin/firebase/test/${service}`, {});
    },
    onSuccess: (data, service) => {
      toast({
        title: "Test réussi",
        description: `Service ${service} fonctionne correctement`,
      });
      setTestingService(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/firebase'] });
    },
    onError: (error, service) => {
      toast({
        title: "Test échoué",
        description: `Erreur lors du test du service ${service}`,
        variant: "destructive",
      });
      setTestingService(null);
    }
  });

  const handleTestService = (service: string) => {
    setTestingService(service);
    testServiceMutation.mutate(service);
  };

  const firebaseServices = [
    {
      id: 'authentication',
      name: 'Authentication',
      description: 'Authentification Google OAuth et 2FA',
      status: 'active',
      icon: <Smartphone className="w-5 h-5" />,
      usage: 85,
      color: 'green'
    },
    {
      id: 'messaging',
      name: 'Cloud Messaging',
      description: 'Notifications push pour applications mobiles',
      status: 'configured',
      icon: <MessageSquare className="w-5 h-5" />,
      usage: 45,
      color: 'blue'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Suivi comportement utilisateurs et métriques',
      status: 'pending',
      icon: <BarChart3 className="w-5 h-5" />,
      usage: 20,
      color: 'orange'
    },
    {
      id: 'database',
      name: 'Firestore Database',
      description: 'Base de données NoSQL pour géolocalisation',
      status: 'configured',
      icon: <Database className="w-5 h-5" />,
      usage: 60,
      color: 'purple'
    },
    {
      id: 'storage',
      name: 'Cloud Storage',
      description: 'Stockage fichiers et documents utilisateurs',
      status: 'inactive',
      icon: <Settings className="w-5 h-5" />,
      usage: 0,
      color: 'gray'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Zap className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Database className="w-4 h-4" /> },
    { id: 'testing', label: 'Tests', icon: <TestTube className="w-4 h-4" /> },
    { id: 'configuration', label: 'Configuration', icon: <Settings className="w-4 h-4" /> }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'configured':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'configured':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Intégration Firebase</h2>
        <p className="text-gray-600">Configuration et gestion des services Firebase pour EDUCAFRIC</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Services Actifs</h3>
                  <p className="text-2xl font-bold text-green-600">2/5</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Authentication, Database</p>
            </ModernCard>

            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Utilisateurs Firebase</h3>
                  <p className="text-2xl font-bold text-blue-600">3,247</p>
                </div>
                <Smartphone className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Authentifiés avec Google</p>
            </ModernCard>

            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Messages Push</h3>
                  <p className="text-2xl font-bold text-purple-600">15,432</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Ce mois</p>
            </ModernCard>

            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stockage Utilisé</h3>
                  <p className="text-2xl font-bold text-orange-600">2.4GB</p>
                </div>
                <Database className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Sur 10GB disponibles</p>
            </ModernCard>
          </div>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Actuelle</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Projet Firebase</h4>
                  <p className="text-sm text-gray-600">smartwatch-tracker-e061f</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Configuré</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Domaine Autorisé</h4>
                  <p className="text-sm text-gray-600">www?.educafric?.com</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Actif</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">API Keys</h4>
                  <p className="text-sm text-gray-600">Configurées et sécurisées</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Sécurisé</Badge>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Array.isArray(firebaseServices) ? firebaseServices : []).map((service) => (
              <ModernCard key={service.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {service.icon}
                    <div>
                      <h3 className="font-semibold">{service.name || ''}</h3>
                      <p className="text-sm text-gray-600">{service.description || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <Badge className={getStatusColor(service.status)}>
                      {service.status === 'active' ? 'Actif' :
                       service.status === 'configured' ? 'Configuré' :
                       service.status === 'pending' ? 'En attente' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilisation</span>
                      <span>{service.usage}%</span>
                    </div>
                    <Progress value={service.usage} className="w-full" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestService(service.id)}
                      disabled={testingService === service.id}
                    >
                      {testingService === service.id ? 'Test...' : 'Tester'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      )}

      {/* Testing Tab */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tests de Services Firebase</h3>
            
            <div className="space-y-4">
              {(Array.isArray(firebaseServices) ? firebaseServices : []).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {service.icon}
                    <div>
                      <h4 className="font-medium">{service.name || ''}</h4>
                      <p className="text-sm text-gray-600">
                        {service.status === 'active' ? 'Service opérationnel' :
                         service.status === 'configured' ? 'Configuration requise' :
                         service.status === 'pending' ? 'En cours de configuration' : 'Service inactif'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestService(service.id)}
                      disabled={testingService === service.id || testServiceMutation.isPending}
                    >
                      {testingService === service.id ? (
                        <>
                          <TestTube className="w-4 h-4 mr-1 animate-spin" />
                          Test...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-1" />
                          Tester
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Résultats des Tests</h3>
            <div className="space-y-3">
              {[
                { service: 'Authentication', status: 'success', time: '125ms', message: 'Connexion Google OAuth réussie' },
                { service: 'Cloud Messaging', status: 'success', time: '89ms', message: 'Notification push envoyée' },
                { service: 'Firestore Database', status: 'success', time: '234ms', message: 'Lecture/écriture données OK' },
                { service: 'Analytics', status: 'warning', time: '567ms', message: 'Configuration partielle' },
                { service: 'Cloud Storage', status: 'error', time: 'N/A', message: 'Service non configuré' }
              ].map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : result.status === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{result.service}</p>
                      <p className="text-xs text-gray-500">{result.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{result.time}</span>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Environnement</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firebase Project ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <code className="text-sm">smartwatch-tracker-e061f</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auth Domain
                  </label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <code className="text-sm">www?.educafric?.com</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Status
                  </label>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <span className="text-sm text-green-800">✅ Configurée</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App ID Status
                  </label>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <span className="text-sm text-green-800">✅ Configurée</span>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions Configuration</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Renouveler API Keys
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Configurer Firestore Rules
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Activer Cloud Messaging
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Configurer Analytics
              </Button>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
}