import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, School, Activity, Settings, Shield, Database, BarChart3, Search, Bell, TrendingUp, FileText, CreditCard, Building2, Lock, UserCheck, Briefcase, LogOut, Hash, Video, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import NotificationCenter from '@/components/shared/NotificationCenter';
import UnifiedIconDashboard from '@/components/shared/UnifiedIconDashboard';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Access control - Only SiteAdmin can access
  const hasAccess = user?.role === 'SiteAdmin';
  
  // Show access denied for non-SiteAdmin users
  if (user && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Accès Refusé / Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              Seuls les administrateurs système (SiteAdmin) peuvent accéder au tableau de bord administrateur.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have the necessary permissions to access this page.
              Only system administrators (SiteAdmin) can access the admin dashboard.
            </p>
            <div className="pt-4">
              <Button onClick={() => window.location.href = '/'} className="w-full">
                Retour à l'accueil / Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      action: () => setActiveModule('siteadmin-users')
    },
    {
      id: 'add-school',
      label: 'Ajouter École',
      icon: <School className="h-5 w-5" />,
      description: 'Enregistrer une nouvelle école',
      action: () => setActiveModule('siteadmin-schools')
    },
    {
      id: 'system-check',
      label: 'Vérification Système',
      icon: <Activity className="h-5 w-5" />,
      description: 'Effectuer un diagnostic du système',
      action: () => setActiveModule('siteadmin-system')
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

  // Modules array WITHOUT component properties - UnifiedIconDashboard handles dynamic loading
  const modules = [
    {
      id: 'siteadmin-users',
      label: 'Utilisateurs',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'siteadmin-schools',
      label: 'Écoles',
      icon: <School className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'siteadmin-documents',
      label: 'Documents',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'siteadmin-commercial',
      label: 'Gestion Commerciale',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'siteadmin-educafric-numbers',
      label: 'Numéros EDUCAFRIC',
      icon: <Hash className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'siteadmin-payments',
      label: 'Paiements',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'siteadmin-security',
      label: 'Sécurité',
      icon: <Lock className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'siteadmin-system',
      label: 'Audit & Santé Système',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-pink-500'
    },
    {
      id: 'siteadmin-settings',
      label: 'Configuration',
      icon: <Settings className="w-6 h-6" />,
      color: 'bg-gray-500'
    },
    {
      id: 'siteadmin-online-class-activations',
      label: 'Cours en Ligne',
      icon: <Video className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-600'
    },
    {
      id: 'offline-premium-guide',
      label: 'Guide Offline Premium',
      icon: <WifiOff className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-green-600 to-emerald-600'
    }
  ];

  // If a module is active, show UnifiedIconDashboard with that module
  if (activeModule) {
    return (
      <UnifiedIconDashboard
        title="Administration Plateforme"
        subtitle="Gestion complète de la plateforme EDUCAFRIC"
        modules={modules}
        activeModule={activeModule}
      />
    );
  }

  // Otherwise show the dashboard overview
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

        {/* Quick Actions */}
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

        {/* Module Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Modules d'Administration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-blue-300"
                  onClick={() => setActiveModule(module.id)}
                  data-testid={`module-${module.id}`}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[120px]">
                    <div className={`p-3 ${module.color} rounded-full mb-3 text-white`}>
                      {module.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{module.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Abonnements actifs</p>
                      <p className="text-xs text-gray-600">
                        {platformStats?.activeSubscriptions || 0} abonnements en cours
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Actif</Badge>
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
      </div>
    </div>
  );
};

export default SiteAdminDashboard;
