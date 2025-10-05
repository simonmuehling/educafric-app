import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Users, Building2, 
  DollarSign, Target, Phone, Calendar,
  BarChart3, PieChart, LineChart, Download,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface CommercialStats {
  totalSchools: number;
  activeSchools: number;
  monthlyRevenue: number;
  prospectSchools: number;
  conversionRate: number;
  averageContractValue: number;
  callsThisMonth: number;
  meetingsScheduled: number;
  contractsSigned: number;
}

interface RevenueStats {
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  commission: number;
  trend: Array<{
    month: string;
    revenue: number;
  }>;
}

interface ConversionStats {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageConversionTime: number;
  conversionTrend: Array<{
    month: string;
    leads: number;
    converted: number;
  }>;
}

const FunctionalCommercialStatistics: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'revenue' | 'conversion'>('overview');

  // Fetch general statistics
  const { data: stats, isLoading: statsLoading } = useQuery<CommercialStats>({
    queryKey: [`/api/commercial/statistics/${selectedPeriod}`],
    enabled: !!user
  });

  // Fetch revenue statistics
  const { data: revenueStats, isLoading: revenueLoading } = useQuery<RevenueStats>({
    queryKey: ['/api/commercial/revenue'],
    enabled: !!user
  });

  // Fetch conversion statistics
  const { data: conversionStats, isLoading: conversionLoading } = useQuery<ConversionStats>({
    queryKey: ['/api/commercial/conversion'],
    enabled: !!user
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendClass = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (statsLoading || revenueLoading || conversionLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des statistiques...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
          <p className="text-gray-600">Analysez vos performances commerciales</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-period"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <Button 
            variant="outline"
            className="text-blue-600 hover:text-blue-700"
            data-testid="button-export-stats"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'revenue', label: 'Revenus', icon: DollarSign },
            { id: 'conversion', label: 'Conversion', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Écoles Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSchools}</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(stats.totalSchools, 10)}
                      <span className={`text-sm ml-1 ${getTrendClass(stats.totalSchools, 10)}`}>
                        +2 ce mois
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Écoles Actives</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSchools}</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(stats.activeSchools, 8)}
                      <span className={`text-sm ml-1 ${getTrendClass(stats.activeSchools, 8)}`}>
                        +2 ce mois
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(stats.monthlyRevenue, 2200000)}
                      <span className={`text-sm ml-1 ${getTrendClass(stats.monthlyRevenue, 2200000)}`}>
                        +11.4%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(stats.conversionRate)}
                    </p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(stats.conversionRate, 22.1)}
                      <span className={`text-sm ml-1 ${getTrendClass(stats.conversionRate, 22.1)}`}>
                        +2.4%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appels ce mois</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.callsThisMonth}</p>
                  </div>
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    +12 cette semaine
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">RDV Programmés</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.meetingsScheduled}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    8 cette semaine
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contrats Signés</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.contractsSigned}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    +3 ce mois
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Performance Mensuelle</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Graphique des performances</p>
                  <p className="text-sm text-gray-400">Données des 6 derniers mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Tab */}
      {selectedView === 'revenue' && revenueStats && (
        <div className="space-y-6">
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(revenueStats.monthlyRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus Trimestriels</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(revenueStats.quarterlyRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus Annuels</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(revenueStats.yearlyRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Commission</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(revenueStats.commission)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Évolution des Revenus</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueStats.trend.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600">{item.month}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(item.revenue / 3000000) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-24 text-right">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversion Tab */}
      {selectedView === 'conversion' && conversionStats && (
        <div className="space-y-6">
          {/* Conversion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Prospects</p>
                    <p className="text-2xl font-bold text-gray-900">{conversionStats.totalLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prospects Convertis</p>
                    <p className="text-2xl font-bold text-gray-900">{conversionStats.convertedLeads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(conversionStats.conversionRate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {conversionStats.averageConversionTime}j
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Évolution des Conversions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionStats.conversionTrend.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{item.month}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Prospects</p>
                        <p className="text-lg font-bold text-blue-600">{item.leads}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Convertis</p>
                        <p className="text-lg font-bold text-green-600">{item.converted}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Taux</p>
                        <p className="text-lg font-bold text-purple-600">
                          {formatPercentage((item.converted / item.leads) * 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FunctionalCommercialStatistics;