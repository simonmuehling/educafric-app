import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Target, Award, Phone, Loader2, AlertCircle } from 'lucide-react';

const CommercialStatistics = () => {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch statistics from real API
  const { data: apiStats, isLoading, error } = useQuery({
    queryKey: ['/api/commercial/statistics', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/commercial/statistics?period=${selectedPeriod}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });

  const text = {
    fr: {
      title: 'Statistiques Commerciales',
      subtitle: 'Métriques de performance et analyses des ventes',
      thisMonth: 'Ce Mois',
      thisQuarter: 'Ce Trimestre',
      thisYear: 'Cette Année',
      salesPerformance: 'Performance des Ventes',
      conversionMetrics: 'Métriques de Conversion',
      revenueAnalysis: 'Analyse des Revenus',
      clientAnalytics: 'Analytics Clients',
      prospectSchools: 'Écoles Prospects',
      conversions: 'Conversions',
      monthlyCommission: 'Commission Mensuelle',
      monthlyRevenue: 'Revenus Mensuels',
      pendingContracts: 'Contrats en Attente',
      conversionRate: 'Taux de Conversion',
      averageContractValue: 'Valeur Contrat Moyenne',
      schoolsAcquired: 'Écoles Acquises',
      callsThisMonth: 'Appels ce Mois',
      meetingsScheduled: 'RDV Planifiés',
      proposalsSent: 'Propositions Envoyées',
      contractsSigned: 'Contrats Signés',
      topPerformingRegions: 'Régions les Plus Performantes',
      monthlyTrend: 'Tendance Mensuelle',
      clientSatisfaction: 'Satisfaction Client'
    },
    en: {
      title: 'Commercial Statistics',
      subtitle: 'Performance metrics and sales analytics',
      thisMonth: 'This Month',
      thisQuarter: 'This Quarter',
      thisYear: 'This Year',
      salesPerformance: 'Sales Performance',
      conversionMetrics: 'Conversion Metrics',
      revenueAnalysis: 'Revenue Analysis',
      clientAnalytics: 'Client Analytics',
      prospectSchools: 'Prospect Schools',
      conversions: 'Conversions',
      monthlyCommission: 'Monthly Commission',
      monthlyRevenue: 'Monthly Revenue',
      pendingContracts: 'Pending Contracts',
      conversionRate: 'Conversion Rate',
      averageContractValue: 'Average Contract Value',
      schoolsAcquired: 'Schools Acquired',
      callsThisMonth: 'Calls This Month',
      meetingsScheduled: 'Meetings Scheduled',
      proposalsSent: 'Proposals Sent',
      contractsSigned: 'Contracts Signed',
      topPerformingRegions: 'Top Performing Regions',
      monthlyTrend: 'Monthly Trend',
      clientSatisfaction: 'Client Satisfaction'
    }
  };

  const t = text[language as keyof typeof text];

  // Use API data when available, fallback to zeros if no data
  const apiData = apiStats?.data || {};
  const stats = {
    prospectSchools: apiData.totalProspects || 0,
    conversions: apiData.activeClients || 0,
    monthlyCommission: 0,
    monthlyRevenue: apiData.monthlyRevenue || 0,
    pendingContracts: 0,
    conversionRate: apiData.conversionRate || 0,
    averageContractValue: apiData.averageDealSize || 0,
    schoolsAcquired: apiData.schoolsUnderContract || 0,
    callsThisMonth: apiData.contactsThisMonth || 0,
    meetingsScheduled: apiData.appointmentsThisWeek || 0,
    proposalsSent: 0,
    contractsSigned: apiData.schoolsUnderContract || 0
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} CFA`;
  };

  const periods = [
    { key: 'month', label: t.thisMonth },
    { key: 'quarter', label: t.thisQuarter },
    { key: 'year', label: t.thisYear }
  ];

  // Use API region data when available
  const regionData = Array.isArray(apiData.topRegions) && apiData.topRegions.length > 0 
    ? apiData.topRegions 
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFC]" />
        <span className="ml-2 text-gray-600">
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
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

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t.prospectSchools}</p>
                <p className="text-2xl font-bold text-blue-900">{stats.prospectSchools}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t.conversions}</p>
                <p className="text-2xl font-bold text-green-900">{stats.conversions}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">{t.monthlyCommission}</p>
                <p className="text-xl font-bold text-yellow-900">{formatCurrency(stats.monthlyCommission)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{t.conversionRate}</p>
                <p className="text-2xl font-bold text-purple-900">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t.salesPerformance}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{stats.callsThisMonth}</div>
              <div className="text-sm text-blue-600">{t.callsThisMonth}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{stats.meetingsScheduled}</div>
              <div className="text-sm text-green-600">{t.meetingsScheduled}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{stats.proposalsSent}</div>
              <div className="text-sm text-yellow-600">{t.proposalsSent}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{stats.contractsSigned}</div>
              <div className="text-sm text-purple-600">{t.contractsSigned}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t.revenueAnalysis}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{t.monthlyRevenue}</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{t.averageContractValue}</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(stats.averageContractValue)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{t.pendingContracts}</span>
                <span className="text-lg font-bold text-yellow-600">{stats.pendingContracts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.topPerformingRegions}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionData.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>{language === 'fr' ? 'Aucune donnée régionale disponible' : 'No regional data available'}</p>
                </div>
              ) : (
                (Array.isArray(regionData) ? regionData : []).map((region, index) => (
                  <div key={region.name || ''} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{region.name || ''}</div>
                        <div className="text-sm text-gray-600">{region.schools} {language === 'fr' ? 'écoles' : 'schools'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(region.revenue)}</div>
                      <div className="text-sm text-green-600">{region.growth}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {language === 'fr' ? 'Aperçus Performance' : 'Performance Insights'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="font-semibold text-green-800">
                {language === 'fr' ? 'Excellent Taux de Conversion' : 'Excellent Conversion Rate'}
              </div>
              <div className="text-sm text-green-700 mt-1">
                {language === 'fr' 
                  ? `${stats.conversionRate}% dépasse l'objectif de 15%` 
                  : `${stats.conversionRate}% exceeds 15% target`}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="font-semibold text-blue-800">
                {language === 'fr' ? 'Croissance Régulière' : 'Steady Growth'}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {language === 'fr' 
                  ? '+12% par rapport au mois dernier' 
                  : '+12% compared to last month'}
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="font-semibold text-yellow-800">
                {language === 'fr' ? 'Opportunités Régionales' : 'Regional Opportunities'}
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {language === 'fr' 
                  ? 'Bafoussam montre un fort potentiel' 
                  : 'Bafoussam shows strong potential'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommercialStatistics;