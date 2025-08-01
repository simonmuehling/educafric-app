import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, Download, Calendar,
  DollarSign, Users, Building2, Star,
  FileText, PieChart, Activity
} from 'lucide-react';

const FunctionalCommercialReports: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('sales');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/commercial/reports', selectedPeriod, reportType],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Rapports & Analyses',
      subtitle: 'Suivez vos performances commerciales',
      loading: 'Génération du rapport...',
      periods: {
        week: 'Cette Semaine',
        month: 'Ce Mois',
        quarter: 'Ce Trimestre',
        year: 'Cette Année'
      },
      reportTypes: {
        sales: 'Ventes',
        leads: 'Prospects',
        schools: 'Écoles',
        revenue: 'Revenus'
      },
      metrics: {
        totalRevenue: 'Revenus Totaux',
        newSchools: 'Nouvelles Écoles',
        conversionRate: 'Taux de Conversion',
        avgDealSize: 'Taille Moyenne des Contrats'
      },
      actions: {
        exportPDF: 'Exporter PDF',
        exportExcel: 'Exporter Excel',
        shareReport: 'Partager',
        scheduleReport: 'Programmer'
      }
    },
    en: {
      title: 'Reports & Analytics',
      subtitle: 'Track your commercial performance',
      loading: 'Generating report...',
      periods: {
        week: 'This Week',
        month: 'This Month',
        quarter: 'This Quarter',
        year: 'This Year'
      },
      reportTypes: {
        sales: 'Sales',
        leads: 'Leads',
        schools: 'Schools',
        revenue: 'Revenue'
      },
      metrics: {
        totalRevenue: 'Total Revenue',
        newSchools: 'New Schools',
        conversionRate: 'Conversion Rate',
        avgDealSize: 'Avg Deal Size'
      },
      actions: {
        exportPDF: 'Export PDF',
        exportExcel: 'Export Excel',
        shareReport: 'Share',
        scheduleReport: 'Schedule'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockData = {
    totalRevenue: 2450000,
    newSchools: 8,
    conversionRate: 24,
    avgDealSize: 306250,
    monthlyTrend: [
      { month: 'Jan', revenue: 180000, schools: 2 },
      { month: 'Fév', revenue: 220000, schools: 3 },
      { month: 'Mar', revenue: 280000, schools: 4 },
      { month: 'Avr', revenue: 320000, schools: 5 },
      { month: 'Mai', revenue: 290000, schools: 3 },
      { month: 'Jun', revenue: 350000, schools: 6 }
    ],
    topSchools: [
      { name: 'École Excellence Yaoundé', revenue: 450000, students: 500 },
      { name: 'Collège Bilingue Douala', revenue: 380000, students: 420 },
      { name: 'École Primaire Bafoussam', revenue: 320000, students: 350 }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.exportPDF}
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            {t?.actions?.exportExcel}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="week">{t?.periods?.week}</option>
                <option value="month">{t?.periods?.month}</option>
                <option value="quarter">{t?.periods?.quarter}</option>
                <option value="year">{t?.periods?.year}</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="sales">{t?.reportTypes?.sales}</option>
                <option value="leads">{t?.reportTypes?.leads}</option>
                <option value="schools">{t?.reportTypes?.schools}</option>
                <option value="revenue">{t?.reportTypes?.revenue}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.totalRevenue}</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockData.totalRevenue.toLocaleString()} CFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.newSchools}</p>
                <p className="text-2xl font-bold text-blue-600">{mockData.newSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.conversionRate}</p>
                <p className="text-2xl font-bold text-purple-600">{mockData.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.metrics?.avgDealSize}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockData.avgDealSize.toLocaleString()} CFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Tendance des Revenus</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {mockData.monthlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 w-8 rounded-t"
                    style={{ height: `${(item.revenue / 350000) * 200}px` }}
                  ></div>
                  <span className="text-xs mt-2">{item.month}</span>
                  <span className="text-xs text-gray-500">
                    {(item.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Schools */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Écoles par Revenus</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.topSchools.map((school, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{school.name || ''}</div>
                    <div className="text-sm text-gray-500">{school.students} élèves</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {school.revenue.toLocaleString()} CFA
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(school.revenue / 450000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Analyse de Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-green-600">+18%</div>
              <div className="text-sm text-gray-600">Croissance mensuelle</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-blue-600">1,270</div>
              <div className="text-sm text-gray-600">Élèves touchés</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <PieChart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Satisfaction client</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalCommercialReports;