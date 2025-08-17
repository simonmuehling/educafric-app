import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, CheckCircle, XCircle, QrCode, FileText, Mail, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ConnectionMetrics {
  totalConnections: number;
  pendingRequests: number;
  approvedToday: number;
  averageResponseTime: number;
  systemUptime: number;
  satisfactionRate: number;
  equityCompliance: number;
  securityValidation: number;
  timestamp: string;
}

interface MethodStats {
  method: string;
  count: number;
  percentage: number;
}

interface PendingStats {
  byPriority: Array<{ priority: string; count: number }>;
  oldestRequest: any;
  averageWaitTimeHours: number;
  totalPending: number;
}

interface ConnectionSystemDashboardProps {
  language: 'fr' | 'en';
  userRole: string;
}

const ConnectionSystemDashboard: React.FC<ConnectionSystemDashboardProps> = ({ language, userRole }) => {
  const [metrics, setMetrics] = useState<ConnectionMetrics | null>(null);
  const [methodStats, setMethodStats] = useState<MethodStats[]>([]);
  const [pendingStats, setPendingStats] = useState<PendingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const texts = {
    fr: {
      title: 'Système Connexions Parents-Enfants',
      subtitle: 'Monitoring et analytics du système de connexion familiale',
      overview: 'Vue d\'ensemble',
      metrics: 'Métriques',
      methods: 'Méthodes de Connexion',
      pending: 'Demandes en Attente',
      totalConnections: 'Connexions Totales',
      pendingRequests: 'Demandes Pendantes',
      approvedToday: 'Approuvées Aujourd\'hui',
      responseTime: 'Temps Réponse Moyen',
      uptime: 'Disponibilité Système',
      satisfaction: 'Satisfaction Utilisateurs',
      equity: 'Conformité Équité',
      security: 'Validation Sécurité',
      methodLabels: {
        automatic_invitation: 'Invitation École',
        qr_code: 'Code QR',
        manual_request: 'Demande Manuelle'
      },
      priorities: {
        urgent: 'Urgent',
        high: 'Élevée',
        normal: 'Normale',
        low: 'Faible'
      },
      oldestRequest: 'Demande la Plus Ancienne',
      avgWaitTime: 'Temps d\'Attente Moyen',
      hours: 'heures',
      minutes: 'minutes',
      excellent: 'Excellent',
      good: 'Bon',
      warning: 'Attention',
      critical: 'Critique'
    },
    en: {
      title: 'Parent-Child Connection System',
      subtitle: 'Monitoring and analytics for family connection system',
      overview: 'Overview',
      metrics: 'Metrics',
      methods: 'Connection Methods',
      pending: 'Pending Requests',
      totalConnections: 'Total Connections',
      pendingRequests: 'Pending Requests',
      approvedToday: 'Approved Today',
      responseTime: 'Average Response Time',
      uptime: 'System Uptime',
      satisfaction: 'User Satisfaction',
      equity: 'Equity Compliance',
      security: 'Security Validation',
      methodLabels: {
        automatic_invitation: 'School Invitation',
        qr_code: 'QR Code',
        manual_request: 'Manual Request'
      },
      priorities: {
        urgent: 'Urgent',
        high: 'High',
        normal: 'Normal',
        low: 'Low'
      },
      oldestRequest: 'Oldest Request',
      avgWaitTime: 'Average Wait Time',
      hours: 'hours',
      minutes: 'minutes',
      excellent: 'Excellent',
      good: 'Good',
      warning: 'Warning',
      critical: 'Critical'
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Charger métriques principales
      if (['SiteAdmin', 'Admin'].includes(userRole)) {
        const metricsResponse = await apiRequest('GET', '/api/admin/connection-metrics');
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData.metrics);
        }
      }

      // Charger statistiques par méthode
      if (['SiteAdmin', 'Admin', 'Commercial'].includes(userRole)) {
        const methodResponse = await apiRequest('GET', '/api/admin/connections-by-method');
        if (methodResponse.ok) {
          const methodData = await methodResponse.json();
          setMethodStats(methodData.data);
        }
      }

      // Charger statistiques demandes en attente
      if (['SiteAdmin', 'Admin', 'Director'].includes(userRole)) {
        const pendingResponse = await apiRequest('GET', '/api/admin/pending-stats');
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingStats(pendingData.data);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, type: string) => {
    switch (type) {
      case 'uptime':
      case 'satisfaction':
      case 'equity':
      case 'security':
        if (value >= 95) return 'text-green-600';
        if (value >= 80) return 'text-yellow-600';
        return 'text-red-600';
      case 'responseTime':
        if (value <= 200) return 'text-green-600';
        if (value <= 500) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (value: number, type: string) => {
    const color = getStatusColor(value, type);
    let status = t.good;
    
    if (type === 'uptime' || type === 'satisfaction' || type === 'equity' || type === 'security') {
      if (value >= 95) status = t.excellent;
      else if (value >= 80) status = t.good;
      else status = t.warning;
    } else if (type === 'responseTime') {
      if (value <= 200) status = t.excellent;
      else if (value <= 500) status = t.good;
      else status = t.warning;
    }

    return <Badge variant="outline" className={color}>{status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'automatic_invitation': return <Mail className="h-4 w-4" />;
      case 'qr_code': return <QrCode className="h-4 w-4" />;
      case 'manual_request': return <FileText className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-blue-800">
            <Users className="h-6 w-6" />
            <span>{t.title || ''}</span>
          </CardTitle>
          <p className="text-blue-600">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* Principe d'Équité */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">
              {language === 'fr' ? 'PRINCIPE D\'ÉQUITÉ APPLIQUÉ' : 'EQUITY PRINCIPLE APPLIED'}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium text-center">
              {language === 'fr' 
                ? '⚡ TOUS LES PARENTS PAYANTS = MÊMES DROITS COMPLETS' 
                : '⚡ ALL PAYING PARENTS = SAME FULL ACCESS RIGHTS'
              }
            </p>
            <div className="flex items-center justify-center mt-2">
              <Badge className="bg-green-100 text-green-800">
                {metrics?.equityCompliance || 100}% {t.equity}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques Principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.totalConnections}</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalConnections}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.pendingRequests}</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.pendingRequests}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.approvedToday}</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.approvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.responseTime}</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime}ms</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicateurs de Performance */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.uptime}</span>
                  {getStatusBadge(metrics.systemUptime, 'uptime')}
                </div>
                <Progress value={metrics.systemUptime} className="h-2" />
                <p className="text-sm text-gray-600">{metrics.systemUptime}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.satisfaction}</span>
                  {getStatusBadge(metrics.satisfactionRate, 'satisfaction')}
                </div>
                <Progress value={metrics.satisfactionRate} className="h-2" />
                <p className="text-sm text-gray-600">{metrics.satisfactionRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.equity}</span>
                  {getStatusBadge(metrics.equityCompliance, 'equity')}
                </div>
                <Progress value={metrics.equityCompliance} className="h-2" />
                <p className="text-sm text-gray-600">{metrics.equityCompliance}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.security}</span>
                  {getStatusBadge(metrics.securityValidation, 'security')}
                </div>
                <Progress value={metrics.securityValidation} className="h-2" />
                <p className="text-sm text-gray-600">{metrics.securityValidation}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Méthodes de Connexion */}
      {(Array.isArray(methodStats) ? methodStats.length : 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              <span>{t.methods}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Array.isArray(methodStats) ? methodStats : []).map((method) => (
                <div key={method.method} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getMethodIcon(method.method)}
                    <div>
                      <h4 className="font-medium">{t.methodLabels[method.method as keyof typeof t.methodLabels]}</h4>
                      <p className="text-sm text-gray-600">{method.count} connexions</p>
                    </div>
                  </div>
                  <Progress value={method.percentage} className="h-3" />
                  <p className="text-sm font-medium text-right">{method.percentage}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques Demandes en Attente */}
      {pendingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>{t.pending}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingStats.byPriority.map((priority) => (
                  <div key={priority.priority} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t.priorities[priority.priority as keyof typeof t.priorities]}
                    </span>
                    <Badge variant="outline">{priority.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>{t.avgWaitTime}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(pendingStats.averageWaitTimeHours)}
                  </p>
                  <p className="text-sm text-gray-600">{t.hours}</p>
                </div>
                {pendingStats.oldestRequest && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">{t.oldestRequest}:</p>
                    <p className="text-sm text-gray-600">{pendingStats?.oldestRequest?.parentName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(pendingStats?.oldestRequest?.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ConnectionSystemDashboard;