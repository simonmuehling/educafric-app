import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Download, 
  Users, 
  Clock, 
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PWAAnalyticsData {
  totalPwaUsers: number;
  totalWebUsers: number;
  dailyPwaAccess: number;
  pwaInstallRate: number;
  avgSessionDuration: number;
  topDeviceTypes: { type: string; count: number }[];
  lastUpdated: string;
  installationTrend: string;
  peakUsageHours: string[];
  offlineUsagePercent: number;
}

const PWAAnalytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/pwa'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/pwa', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PWA analytics');
      }
      
      const result = await response.json();
      return result.data as PWAAnalyticsData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    onError: (error: any) => {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les analyses PWA",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="pwa-analytics-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card data-testid="pwa-analytics-error">
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur lors du chargement des statistiques PWA
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = analytics.totalPwaUsers + analytics.totalWebUsers;
  const pwaPercentage = totalUsers > 0 ? (analytics.totalPwaUsers / totalUsers) * 100 : 0;
  const webPercentage = 100 - pwaPercentage;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min ${remainingSeconds}s`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="pwa-analytics-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" data-testid="title-pwa-analytics">
            Analyse PWA (Progressive Web App)
          </h2>
          <p className="text-muted-foreground">
            Statistiques d'utilisation des applications web progressives
          </p>
        </div>
        <Badge variant="outline" data-testid="last-updated">
          Mis à jour: {new Date(analytics.lastUpdated).toLocaleTimeString('fr-FR')}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-pwa-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs PWA</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-total-pwa-users">
              {analytics.totalPwaUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {pwaPercentage.toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-web-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Web</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-web-users">
              {analytics.totalWebUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {webPercentage.toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-daily-pwa-access">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accès PWA quotidiens</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-daily-pwa-access">
              {analytics.dailyPwaAccess}
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs actifs aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-install-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'installation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-install-rate">
              {(analytics.pwaInstallRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tendance: {analytics.installationTrend}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-usage-distribution">
          <CardHeader>
            <CardTitle>Répartition d'utilisation</CardTitle>
            <CardDescription>PWA vs Navigation Web</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-500" />
                  PWA ({analytics.totalPwaUsers})
                </span>
                <span className="text-sm text-muted-foreground">
                  {pwaPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={pwaPercentage} 
                className="h-2"
                data-testid="progress-pwa-usage"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-green-500" />
                  Web ({analytics.totalWebUsers})
                </span>
                <span className="text-sm text-muted-foreground">
                  {webPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={webPercentage} 
                className="h-2"
                data-testid="progress-web-usage"
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-device-types">
          <CardHeader>
            <CardTitle>Types d'appareils</CardTitle>
            <CardDescription>Répartition par type d'appareil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topDeviceTypes.map((device, index) => {
                const percentage = totalUsers > 0 ? (device.count / totalUsers) * 100 : 0;
                return (
                  <div key={device.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <span className="text-sm font-medium capitalize">
                        {device.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {device.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card data-testid="card-session-duration">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée de session moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-session-duration">
              {formatDuration(analytics.avgSessionDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Temps moyen passé dans l'app
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-offline-usage">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisation hors ligne</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-offline-usage">
              {analytics.offlineUsagePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              Du temps passé hors ligne
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-peak-hours">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures de pointe</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analytics.peakUsageHours.map((hour, index) => (
                <div key={index} className="text-sm font-medium">
                  {hour}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Information */}
      <Card data-testid="card-pwa-summary">
        <CardHeader>
          <CardTitle>Résumé des performances PWA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Adoption PWA</span>
            </div>
            <Badge variant={pwaPercentage > 30 ? "default" : "secondary"}>
              {pwaPercentage > 30 ? "Excellente" : pwaPercentage > 15 ? "Bonne" : "À améliorer"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="font-medium">Engagement utilisateurs</span>
            </div>
            <Badge variant={analytics.avgSessionDuration > 1000 ? "default" : "secondary"}>
              {analytics.avgSessionDuration > 1000 ? "Élevé" : "Modéré"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAAnalytics;