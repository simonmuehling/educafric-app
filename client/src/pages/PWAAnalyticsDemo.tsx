import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Users, 
  Download,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PWAAnalyticsDemo: React.FC = () => {
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/analytics/pwa'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/pwa', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Accès non autorisé - Connexion requise avec privilèges administrateur');
        }
        throw new Error('Erreur lors du chargement des statistiques PWA');
      }
      
      const result = await response.json();
      return result.data;
    },
    retry: 1,
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" data-testid="pwa-demo-loading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📱 Analyse PWA - Chargement...
            </h1>
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-8" data-testid="pwa-demo-error">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                ⚠️ Erreur d'accès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                {error?.message || 'Impossible de charger les statistiques PWA'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Pour accéder aux analyses PWA, vous devez être connecté avec des privilèges administrateur.
              </p>
              <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                data-testid="button-retry"
              >
                Réessayer
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalUsers = analytics.totalPwaUsers + analytics.totalWebUsers;
  const pwaPercentage = totalUsers > 0 ? (analytics.totalPwaUsers / totalUsers) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" data-testid="pwa-analytics-demo">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Smartphone className="h-10 w-10 text-blue-600" />
            Analyse PWA (Progressive Web App)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tableau de bord complet des statistiques d'utilisation des applications web progressives sur la plateforme Educafric
          </p>
          <Badge variant="secondary" className="mt-4" data-testid="last-updated">
            Dernière mise à jour: {new Date(analytics.lastUpdated).toLocaleString('fr-FR')}
          </Badge>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow" data-testid="card-pwa-users">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Utilisateurs PWA
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2" data-testid="text-pwa-users">
                {analytics.totalPwaUsers}
              </div>
              <p className="text-sm text-gray-500">
                {pwaPercentage.toFixed(1)}% du total des utilisateurs
              </p>
              <div className="mt-2 flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                Tendance: {analytics.installationTrend}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow" data-testid="card-web-users">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Utilisateurs Web
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <Monitor className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2" data-testid="text-web-users">
                {analytics.totalWebUsers}
              </div>
              <p className="text-sm text-gray-500">
                {(100 - pwaPercentage).toFixed(1)}% du total des utilisateurs
              </p>
              <div className="mt-2 text-sm text-gray-600">
                Navigation classique
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow" data-testid="card-daily-access">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Accès PWA quotidiens
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2" data-testid="text-daily-access">
                {analytics.dailyPwaAccess}
              </div>
              <p className="text-sm text-gray-500">
                Utilisateurs actifs aujourd'hui
              </p>
              <div className="mt-2 text-sm text-gray-600">
                {((analytics.dailyPwaAccess / analytics.totalPwaUsers) * 100).toFixed(1)}% de taux d'engagement
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow" data-testid="card-install-rate">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Taux d'installation
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2" data-testid="text-install-rate">
                {(analytics.pwaInstallRate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">
                Des visiteurs installent la PWA
              </p>
              <div className="mt-2 text-sm text-gray-600">
                {analytics.pwaInstallRate > 0.3 ? '🔥 Excellent' : analytics.pwaInstallRate > 0.15 ? '✅ Bon' : '⚠️ À améliorer'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Device Distribution */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Répartition par appareil
              </CardTitle>
              <CardDescription>
                Types d'appareils utilisés pour accéder à la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topDeviceTypes.map((device: any, index: number) => {
                  const percentage = totalUsers > 0 ? (device.count / totalUsers) * 100 : 0;
                  const getIcon = (type: string) => {
                    switch (type.toLowerCase()) {
                      case 'mobile': return <Smartphone className="h-5 w-5 text-blue-500" />;
                      case 'tablet': return <Smartphone className="h-5 w-5 text-green-500" />;
                      default: return <Monitor className="h-5 w-5 text-purple-500" />;
                    }
                  };

                  return (
                    <div key={device.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getIcon(device.type)}
                        <span className="font-medium capitalize">{device.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{device.count}</div>
                        <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Usage Metrics */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Métriques d'utilisation
              </CardTitle>
              <CardDescription>
                Détails sur l'engagement et la performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Durée de session moyenne</span>
                    <span className="font-bold text-blue-600">
                      {Math.floor(analytics.avgSessionDuration / 60)}min {analytics.avgSessionDuration % 60}s
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((analytics.avgSessionDuration / 3600) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Utilisation hors ligne</span>
                    <span className="font-bold text-green-600">{analytics.offlineUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analytics.offlineUsagePercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium mb-2">Heures de pointe</div>
                  <div className="space-y-1">
                    {analytics.peakUsageHours.map((hour: string, index: number) => (
                      <div key={index} className="text-sm font-mono bg-white px-2 py-1 rounded">
                        {hour}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Recommendations */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Résumé et recommandations</CardTitle>
            <CardDescription>
              Analyse des performances PWA et suggestions d'amélioration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-600">Points forts</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{analytics.totalPwaUsers} utilisateurs ont installé l'application PWA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Taux d'installation de {(analytics.pwaInstallRate * 100).toFixed(1)}%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Tendance d'installation: {analytics.installationTrend}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Support hors ligne à {analytics.offlineUsagePercent}%</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-600">Opportunités d'amélioration</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">➤</span>
                    <span>Promouvoir l'installation PWA auprès des {analytics.totalWebUsers} utilisateurs web</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">➤</span>
                    <span>Optimiser l'expérience mobile pour augmenter l'engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">➤</span>
                    <span>Améliorer les fonctionnalités hors ligne</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">➤</span>
                    <span>Analyser les heures de pointe pour optimiser les performances</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500">
          <p>
            Les données sont collectées automatiquement et mises à jour en temps réel. 
            Toutes les informations respectent la confidentialité des utilisateurs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAAnalyticsDemo;