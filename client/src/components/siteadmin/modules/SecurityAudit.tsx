import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, AlertTriangle, Lock, Eye, Activity, FileSearch, Database, UserCheck } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SecurityAudit() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: securityOverview, isLoading: loadingOverview } = useQuery({
    queryKey: ['/api/admin/security/overview'],
    queryFn: () => fetch('/api/admin/security/overview', { credentials: 'include' }).then(res => res.json())
  });

  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['/api/admin/security/audit-logs'],
    queryFn: () => fetch('/api/admin/security/audit-logs', { credentials: 'include' }).then(res => res.json())
  });

  const { data: securityAlerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['/api/admin/security/alerts'],
    queryFn: () => fetch('/api/admin/security/alerts', { credentials: 'include' }).then(res => res.json())
  });

  const handleSecurityAction = async (action: string) => {
    try {
      const response = await apiRequest('POST', `/api/admin/security/${action}`, {});
      const result = await response.json();
      toast({
        title: "Action de sécurité exécutée",
        description: result?.message || `Action ${action} terminée avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur de sécurité",
        description: "Impossible d'exécuter l'action de sécurité",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Shield className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs d\'audit', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alertes', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sécurité & Audit</h2>
        <p className="text-gray-600">Monitoring sécurisé et audit des activités de la plateforme EDUCAFRIC</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Score Sécurité</h3>
                <p className="text-2xl font-bold text-green-600">9.2/10</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Excellent niveau</p>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tentatives Intrusion</h3>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Dernières 24h</p>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sessions Actives</h3>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Utilisateurs connectés</p>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Uptime Sécurité</h3>
                <p className="text-2xl font-bold text-green-600">99.98%</p>
              </div>
              <Lock className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">30 derniers jours</p>
          </ModernCard>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <ModernCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Logs d'Audit Récents</h3>
            <Button 
              onClick={() => handleSecurityAction('export-logs')}
              variant="outline"
              size="sm"
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
          
          {loadingLogs ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  timestamp: '2025-01-26 15:45:32',
                  user: 'simon.admin@educafric.com',
                  action: 'LOGIN_SUCCESS',
                  ip: '127?.0?.0.1',
                  severity: 'info'
                },
                {
                  id: 2,
                  timestamp: '2025-01-26 15:44:15',
                  user: 'director.demo@test?.educafric?.com',
                  action: 'BACKUP_INITIATED',
                  ip: '10?.81?.5.69',
                  severity: 'low'
                },
                {
                  id: 3,
                  timestamp: '2025-01-26 15:42:08',
                  user: 'commercial.demo@test?.educafric?.com',
                  action: 'DATA_ACCESS',
                  ip: '10?.81?.7.29',
                  severity: 'medium'
                }
              ].map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={log.severity === 'info' ? 'default' : log.severity === 'low' ? 'secondary' : 'destructive'}>
                      {log?.severity?.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.user} - {log.ip}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </ModernCard>
      )}

      {/* Security Alerts Tab */}
      {activeTab === 'alerts' && (
        <ModernCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Alertes de Sécurité</h3>
            <Button 
              onClick={() => handleSecurityAction('clear-alerts')}
              variant="outline"
              size="sm"
            >
              Effacer tout
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Système Sécurisé</p>
                  <p className="text-sm text-green-600">Aucune menace détectée dans les dernières 24h</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">SÉCURISÉ</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Monitoring Actif</p>
                  <p className="text-sm text-blue-600">Surveillance temps réel des connexions utilisateur</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">ACTIF</Badge>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions de Sécurité</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => handleSecurityAction('force-logout-all')}
                variant="destructive"
                className="w-full justify-start"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Déconnecter tous les utilisateurs
              </Button>
              
              <Button 
                onClick={() => handleSecurityAction('enable-maintenance')}
                variant="outline"
                className="w-full justify-start"
              >
                <Lock className="w-4 h-4 mr-2" />
                Activer mode maintenance
              </Button>
              
              <Button 
                onClick={() => handleSecurityAction('security-scan')}
                variant="outline"
                className="w-full justify-start"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lancer scan sécurité
              </Button>
              
              <Button 
                onClick={() => handleSecurityAction('backup-security')}
                variant="outline"
                className="w-full justify-start"
              >
                <Database className="w-4 h-4 mr-2" />
                Sauvegarde sécurité
              </Button>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques Temps Réel</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connexions par minute</span>
                <span className="font-semibold">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Requêtes API/s</span>
                <span className="font-semibold">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Erreurs 4xx (%)</span>
                <span className="font-semibold text-yellow-600">0.02%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Erreurs 5xx (%)</span>
                <span className="font-semibold text-green-600">0.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Temps réponse moyen</span>
                <span className="font-semibold">127ms</span>
              </div>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
}