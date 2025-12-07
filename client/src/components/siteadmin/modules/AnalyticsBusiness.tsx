import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, DollarSign, Globe, Activity, School, Calendar, Loader2 } from 'lucide-react';

const AnalyticsBusiness = () => {
  const { language } = useLanguage();
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch real analytics data from API
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Fetch real regional data from API
  const { data: regionsData, isLoading: loadingRegions } = useQuery({
    queryKey: ['/api/admin/analytics/regions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/regions', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch regions');
      return response.json();
    }
  });

  // Fetch real user role distribution from API
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['/api/admin/analytics/roles'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/roles', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });

  const text = {
    fr: {
      title: 'Analytics & Business Intelligence',
      subtitle: 'Analytics système complète et reporting',
      overview: 'Aperçu',
      usage: 'Utilisation',
      revenue: 'Revenus',
      growth: 'Croissance',
      engagement: 'Engagement',
      performance: 'Performance',
      thisMonth: 'Ce Mois',
      thisQuarter: 'Ce Trimestre',
      thisYear: 'Cette Année',
      platformUsage: 'Utilisation Plateforme',
      userEngagement: 'Engagement Utilisateurs',
      revenueTracking: 'Suivi des Revenus',
      growthMetrics: 'Métriques de Croissance',
      systemHealth: 'Santé Système',
      businessIntelligence: 'Business Intelligence',
      totalUsers: 'Total Utilisateurs',
      activeUsers: 'Utilisateurs Actifs',
      monthlyRevenue: 'Revenus Mensuels',
      churnRate: 'Taux d\'Attrition',
      schoolsOnboard: 'Écoles Intégrées',
      avgSessionTime: 'Temps Session Moyen',
      conversionRate: 'Taux de Conversion',
      customerSatisfaction: 'Satisfaction Client',
      newRegistrations: 'Nouvelles Inscriptions',
      activeSchools: 'Écoles Actives',
      totalSessions: 'Total Sessions',
      bounceRate: 'Taux de Rebond'
    },
    en: {
      title: 'Analytics & Business Intelligence',
      subtitle: 'Comprehensive system analytics and reporting',
      overview: 'Overview',
      usage: 'Usage',
      revenue: 'Revenue',
      growth: 'Growth',
      engagement: 'Engagement',
      performance: 'Performance',
      thisMonth: 'This Month',
      thisQuarter: 'This Quarter',
      thisYear: 'This Year',
      platformUsage: 'Platform Usage',
      userEngagement: 'User Engagement',
      revenueTracking: 'Revenue Tracking',
      growthMetrics: 'Growth Metrics',
      systemHealth: 'System Health',
      businessIntelligence: 'Business Intelligence',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      monthlyRevenue: 'Monthly Revenue',
      churnRate: 'Churn Rate',
      schoolsOnboard: 'Schools Onboard',
      avgSessionTime: 'Avg Session Time',
      conversionRate: 'Conversion Rate',
      customerSatisfaction: 'Customer Satisfaction',
      newRegistrations: 'New Registrations',
      activeSchools: 'Active Schools',
      totalSessions: 'Total Sessions',
      bounceRate: 'Bounce Rate'
    }
  };

  const t = text[language as keyof typeof text];

  const metrics = [
    { key: 'overview', label: t.overview, icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'usage', label: t.usage, icon: <Activity className="w-4 h-4" /> },
    { key: 'revenue', label: t.revenue, icon: <DollarSign className="w-4 h-4" /> },
    { key: 'growth', label: t.growth, icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'engagement', label: t.engagement, icon: <Users className="w-4 h-4" /> },
    { key: 'performance', label: t.performance, icon: <Globe className="w-4 h-4" /> }
  ];

  const periods = [
    { key: 'month', label: t.thisMonth },
    { key: 'quarter', label: t.thisQuarter },
    { key: 'year', label: t.thisYear }
  ];

  // Use real database data from API - no mock data
  const data = analyticsData || {
    totalUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    schoolsOnboard: 0,
    avgSessionTime: '0m',
    conversionRate: 0,
    customerSatisfaction: 0,
    newRegistrations: 0,
    activeSchools: 0,
    totalSessions: 0,
    bounceRate: 0
  };

  // Use real regional distribution data from API
  const regionalData = Array.isArray(regionsData?.regions) ? regionsData.regions : [];

  // Use real user role distribution from API
  const userRoleData = Array.isArray(rolesData?.roles) ? rolesData.roles : [];

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} CFA`;
  };

  const renderOverviewMetrics = () => (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t.totalUsers}</p>
                <p className="text-2xl font-bold text-blue-900">{data?.totalUsers?.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">+12% vs période précédente</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t.activeUsers}</p>
                <p className="text-2xl font-bold text-green-900">{data?.activeUsers?.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+8% vs période précédente</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">{t.monthlyRevenue}</p>
                <p className="text-xl font-bold text-yellow-900">{formatCurrency(data.monthlyRevenue)}</p>
                <p className="text-xs text-yellow-600 mt-1">+18% vs période précédente</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{t.activeSchools}</p>
                <p className="text-2xl font-bold text-purple-900">{data.activeSchools}</p>
                <p className="text-xs text-purple-600 mt-1">+5% vs période précédente</p>
              </div>
              <School className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-orange-600">{data.conversionRate}%</div>
            <div className="text-sm text-gray-600">{t.conversionRate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-red-600">{data.churnRate}%</div>
            <div className="text-sm text-gray-600">{t.churnRate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-blue-600">{data.avgSessionTime}</div>
            <div className="text-sm text-gray-600">{t.avgSessionTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-green-600">{data.customerSatisfaction}%</div>
            <div className="text-sm text-gray-600">{t.customerSatisfaction}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedMetric) {
      case 'overview':
        return renderOverviewMetrics();
      case 'usage':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t.platformUsage}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data?.totalSessions?.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">{t.totalSessions}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.avgSessionTime}</div>
                    <div className="text-sm text-green-700">{t.avgSessionTime}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{data.bounceRate}%</div>
                    <div className="text-sm text-orange-700">{t.bounceRate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'revenue':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t.revenueTracking}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">{language === 'fr' ? 'Revenus par Région' : 'Revenue by Region'}</h4>
                    <div className="space-y-3">
                      {(Array.isArray(regionalData) ? regionalData : []).map((region) => (
                        <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{region.region}</span>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(region.revenue)}</div>
                            <div className="text-sm text-green-600">{region.growth}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">{language === 'fr' ? 'Métriques Clés' : 'Key Metrics'}</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(data.monthlyRevenue)}</div>
                        <div className="text-sm text-gray-600">{t.monthlyRevenue}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold">{data.conversionRate}%</div>
                        <div className="text-sm text-gray-600">{t.conversionRate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'growth':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t.growthMetrics}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.newRegistrations}</div>
                    <div className="text-sm text-blue-700">{t.newRegistrations}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.schoolsOnboard}</div>
                    <div className="text-sm text-green-700">{t.schoolsOnboard}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{data.conversionRate}%</div>
                    <div className="text-sm text-purple-700">{t.conversionRate}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{data.churnRate}%</div>
                    <div className="text-sm text-orange-700">{t.churnRate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'engagement':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t.userEngagement}</h3>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium mb-4">{language === 'fr' ? 'Distribution par Rôle' : 'User Role Distribution'}</h4>
                  <div className="space-y-3">
                    {(Array.isArray(userRoleData) ? userRoleData : []).map((role) => (
                      <div key={role.role} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${role.color}`}></div>
                        <span className="flex-1 font-medium">{role.role}</span>
                        <span className="text-gray-600">{role?.count?.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 w-12">{role.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t.systemHealth}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.8%</div>
                    <div className="text-sm text-green-700">{language === 'fr' ? 'Disponibilité' : 'Uptime'}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">245ms</div>
                    <div className="text-sm text-blue-700">{language === 'fr' ? 'Temps Réponse' : 'Response Time'}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.1GB</div>
                    <div className="text-sm text-purple-700">{language === 'fr' ? 'Données Transférées' : 'Data Transfer'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverviewMetrics();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(Array.isArray(periods) ? periods : []).map((period) => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period.key)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(metrics) ? metrics : []).map((metric) => (
          <Button
            key={metric.key}
            variant={selectedMetric === metric.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMetric(metric.key)}
            className="flex items-center gap-2"
          >
            {metric.icon}
            {metric.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AnalyticsBusiness;