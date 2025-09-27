import React, { useState, useMemo } from 'react';
import { useFastModules } from '@/utils/fastModuleLoader';
import { useAuth } from '@/contexts/AuthContext';
import { Users, School, Activity, Settings, Shield, Database, BarChart3, Search, Bell, Plus, TrendingUp, MessageSquare, FileText, CreditCard, Building2, Network, Eye, Lock, UserCheck, Briefcase, Megaphone, Zap, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import NotificationCenter from '@/components/shared/NotificationCenter';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Import functional modules
// Optimized: Removed static imports - using dynamic loading only for better bundle size

interface PlatformStats {
  totalUsers: number;
  totalSchools: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newRegistrations: number;
  systemUptime: number;
  storageUsed: number;
  apiCalls: number;
  activeAdmins: number;
  pendingAdminRequests: number;
  lastUpdated: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

const SiteAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getModule, preloadModule } = useFastModules();
  const [apiDataPreloaded, setApiDataPreloaded] = React.useState(false);
  
  
  // AGGRESSIVE API DATA PRELOADING - SiteAdmin APIs
  React.useEffect(() => {
    if (!user) return;
    
    const preloadSiteAdminApiData = async () => {
      
      const apiEndpoints = [
        '/api/siteadmin/platform-stats',
        '/api/siteadmin/users',
        '/api/siteadmin/schools',
        '/api/siteadmin/analytics',
        '/api/siteadmin/system-health'
      ];
      
      const promises = apiEndpoints.map(async (endpoint) => {
        try {
          await queryClient.prefetchQuery({
            queryKey: [endpoint],
            queryFn: async () => {
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return response.json();
            },
            staleTime: 1000 * 60 * 5
          });
          return true;
        } catch (error) {
          console.error(`[SITEADMIN_DASHBOARD] ❌ Failed to preload ${endpoint}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
      setApiDataPreloaded(true);
    };
    
    preloadSiteAdminApiData();
  }, [user, queryClient]);
  
  // FORCE IMMEDIATE preload of critical slow modules - SiteAdmin specific
  React.useEffect(() => {
    const criticalModules = ['siteadmin-overview', 'siteadmin-settings'];
    
    const forceLoadCriticalModules = async () => {
      
      const promises = criticalModules.map(async (moduleName) => {
        try {
          await preloadModule(moduleName);
          return true;
        } catch (error) {
          console.error(`[SITEADMIN_DASHBOARD] ❌ Failed to load ${moduleName}:`, error);
          return false;
        }
      });
      
      await Promise.all(promises);
    };
    
    forceLoadCriticalModules();
  }, [preloadModule]);
  
  // ULTRA-FAST module component creator
  const createDynamicModule = (moduleName: string, fallbackComponent?: React.ReactNode) => {
    const ModuleComponent = getModule(moduleName);
    
    if (ModuleComponent) {
      const isCritical = ['platform-stats', 'users', 'schools', 'analytics', 'system-health'].includes(moduleName);
      if (isCritical && apiDataPreloaded) {
        console.log(`[SITEADMIN_DASHBOARD] 🚀 ${moduleName} served INSTANTLY with PRELOADED DATA!`);
      }
      return React.createElement(ModuleComponent);
    }
    
    // Préchargement à la demande seulement pour modules non-critiques
    React.useEffect(() => {
      console.log(`[SITEADMIN_DASHBOARD] 🔄 On-demand loading ${moduleName}...`);
      preloadModule(moduleName);
    }, []);
    
    return fallbackComponent || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-red-600">
            {apiDataPreloaded ? '⚡ Finalisation...' : 'Chargement du module...'}
          </p>
        </div>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      const data = await response.json();
      
      if (data.message === 'Logged out successfully') {
        // Clear all cached data
        queryClient.clear();
        
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès.",
        });
        
        // Redirect to login page
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error('[LOGOUT] Error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  // Platform statistics query
  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/siteadmin/stats'],
    refetchInterval: 60000 // Refresh every minute
  });

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'create-user',
      label: 'Créer Utilisateur',
      icon: <Users className="h-5 w-5" />,
      description: 'Ajouter un nouvel utilisateur à la plateforme',
      action: () => setActiveTab('users')
    },
    {
      id: 'add-school',
      label: 'Ajouter École',
      icon: <School className="h-5 w-5" />,
      description: 'Enregistrer une nouvelle école',
      action: () => setActiveTab('schools')
    },
    {
      id: 'system-check',
      label: 'Vérification Système',
      icon: <Activity className="h-5 w-5" />,
      description: 'Effectuer un diagnostic du système',
      action: () => setActiveTab('health')
    },
    {
      id: 'backup-data',
      label: 'Sauvegarde',
      icon: <Database className="h-5 w-5" />,
      description: 'Créer une sauvegarde complète',
      action: () => console.log('Backup initiated')
    }
  ], []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-3 sm:p-6">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2">
              <h3 className={`text-lg sm:text-2xl font-bold ${color} break-words`}>
                {typeof value === 'number' ? formatNumber(value) : value}
              </h3>
              {trend && (
                <span className="text-xs sm:text-sm text-green-600 flex items-center mt-1 sm:mt-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} self-end sm:self-auto`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              Administration Plateforme
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gestion complète de la plateforme EDUCAFRIC
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 text-sm sm:text-base"
                data-testid="input-search-global"
              />
            </div>
            {/* PWA Notification Bell - SITE ADMIN VERSION */}
            {user?.id && (
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative self-end sm:self-auto"
                    data-testid="button-notifications-admin"
                  >
                    <Bell className="h-4 w-4 text-gray-600" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[min(95vw,420px)] p-0 max-h-[85vh] overflow-auto sm:rounded-lg rounded-none" 
                  align="end"
                  data-testid="notifications-popover-admin"
                >
                  <NotificationCenter
                    userId={user.id}
                    userRole={user.role as any}
                    className="border-0 shadow-none"
                  />
                </PopoverContent>
              </Popover>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="self-end sm:self-auto flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* Platform Overview Stats - Mobile Optimized */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard
              title="Utilisateurs Total"
              value={platformStats?.totalUsers || 0}
              subtitle="Tous rôles confondus"
              icon={<Users className="h-4 w-4 sm:h-6 sm:w-6" />}
              color="text-blue-600"
              trend="+12.3%"
            />
            <StatCard
              title="Écoles Actives"
              value={platformStats?.totalSchools || 0}
              subtitle="Établissements inscrits"
              icon={<School className="h-4 w-4 sm:h-6 sm:w-6" />}
              color="text-green-600"
              trend="+8.7%"
            />
            <StatCard
              title="Revenus Mensuels"
              value={formatCurrency(platformStats?.monthlyRevenue || 0)}
              subtitle="Abonnements actifs"
              icon={<BarChart3 className="h-4 w-4 sm:h-6 sm:w-6" />}
              color="text-purple-600"
              trend="+15.2%"
            />
            <StatCard
              title="Temps de Fonctionnement"
              value={`${platformStats?.systemUptime || 0}%`}
              subtitle="Disponibilité système"
              icon={<Activity className="h-4 w-4 sm:h-6 sm:w-6" />}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Quick Actions */}
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={action.action}
                    data-testid={`quick-action-${action.id}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                          {action.icon}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {action.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-start overflow-x-auto md:grid md:grid-cols-9 h-auto md:h-auto w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-1 gap-0.5 md:gap-0 scrollbar-hide">
            {/* Row 1 - Core Management */}
            <TabsTrigger 
              value="overview" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md text-xs" 
              title="Vue d'Ensemble"
            >
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md" 
              title="Utilisateurs"
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="schools" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md" 
              title="Écoles"
            >
              <School className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-md" 
              title="Documents"
            >
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="commercial" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 rounded-md" 
              title="Gestion Commerciale"
            >
              <Briefcase className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            
            {/* Row 2 - Advanced Features */}
            <TabsTrigger 
              value="payments" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-md" 
              title="Paiements"
            >
              <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 rounded-md" 
              title="Sécurité"
            >
              <Lock className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-md" 
              title="Audit & Santé Système"
            >
              <Activity className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex-shrink-0 p-1 md:p-2 flex items-center justify-center min-w-[35px] md:min-w-0 h-8 md:h-10 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 rounded-md" 
              title="Configuration"
            >
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nouveaux utilisateurs</p>
                          <p className="text-xs text-gray-600">
                            {platformStats?.newRegistrations || 0} nouvelles inscriptions aujourd'hui
                          </p>
                        </div>
                        <Badge variant="secondary">+{platformStats?.newRegistrations || 0}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Système en ligne</p>
                          <p className="text-xs text-gray-600">
                            {platformStats?.systemUptime || 0}% de disponibilité
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Database className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Utilisation stockage</p>
                          <p className="text-xs text-gray-600">
                            {platformStats?.storageUsed || 0}% de l'espace utilisé
                          </p>
                        </div>
                        <Badge variant="secondary">{platformStats?.storageUsed || 0}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">État du Système</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">API Calls</span>
                        <span className="font-semibold">
                          {formatNumber(platformStats?.apiCalls || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admins Actifs</span>
                        <span className="font-semibold">{platformStats?.activeAdmins || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Demandes En Attente</span>
                        <span className="font-semibold">{platformStats?.pendingAdminRequests || 0}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Dernière mise à jour: {
                          platformStats?.lastUpdated ? 
                          new Date(platformStats.lastUpdated).toLocaleString('fr-FR') : 
                          'Inconnue'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {createDynamicModule('siteadmin-users')}
          </TabsContent>

          <TabsContent value="schools" className="mt-6">
            {createDynamicModule('school-mgmt')}
          </TabsContent>



          <TabsContent value="documents" className="mt-6">
            {createDynamicModule('siteadmin-documents')}
          </TabsContent>




          <TabsContent value="commercial" className="mt-6">
            {createDynamicModule('commercial')}
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            {createDynamicModule('siteadmin-payments')}
          </TabsContent>



          <TabsContent value="security" className="mt-6">
            {createDynamicModule('security')}
          </TabsContent>




          <TabsContent value="system" className="mt-6">
            {createDynamicModule('health')}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            {createDynamicModule('siteadmin-config')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteAdminDashboard;