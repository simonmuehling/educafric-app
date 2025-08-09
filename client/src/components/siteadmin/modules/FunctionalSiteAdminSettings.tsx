import React, { useState } from 'react';
import { Settings, Shield, Database, Globe, Bell, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MobileIconTabNavigation from '@/components/shared/MobileIconTabNavigation';

interface SystemSettings {
  platform: {
    siteName: string;
    version: string;
    environment: string;
    maintenance: boolean;
  };
  features: {
    registrationOpen: boolean;
    paymentProcessing: boolean;
    geoLocation: boolean;
    whatsappIntegration: boolean;
    smsNotifications: boolean;
  };
  limits: {
    maxUsersPerSchool: number;
    maxSchoolsPerCommercial: number;
    apiRateLimit: number;
    fileUploadLimit: number;
  };
}

interface SecuritySettings {
  authentication: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    passwordMinLength: number;
    maxLoginAttempts: number;
  };
  permissions: {
    strictRoleAccess: boolean;
    adminApprovalRequired: boolean;
    auditLogging: boolean;
  };
  encryption: {
    dataAtRest: boolean;
    dataInTransit: boolean;
    tokenExpiry: number;
  };
}

const FunctionalSiteAdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Local state for editing
  const [localSystemSettings, setLocalSystemSettings] = useState<SystemSettings | null>(null);
  const [localSecuritySettings, setLocalSecuritySettings] = useState<SecuritySettings | null>(null);

  // Queries
  const { data: systemSettings, isLoading: loadingSystem } = useQuery({
    queryKey: ['/api/admin/system-settings'],
    queryFn: () => apiRequest('GET', '/api/admin/system-settings').then(res => res.json())
  });

  const { data: securitySettings, isLoading: loadingSecurity } = useQuery({
    queryKey: ['/api/admin/security-settings'],
    queryFn: () => apiRequest('GET', '/api/admin/security-settings').then(res => res.json())
  });

  // Initialize local state when data loads
  React.useEffect(() => {
    if (systemSettings && !localSystemSettings) {
      setLocalSystemSettings(systemSettings);
    }
  }, [systemSettings, localSystemSettings]);

  React.useEffect(() => {
    if (securitySettings && !localSecuritySettings) {
      setLocalSecuritySettings(securitySettings);
    }
  }, [securitySettings, localSecuritySettings]);

  // Mutations
  const updateSystemMutation = useMutation({
    mutationFn: (data: SystemSettings) => 
      apiRequest('PUT', '/api/admin/system-settings', data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
      toast({
        title: "Paramètres système mis à jour",
        description: "Les paramètres ont été sauvegardés avec succès.",
      });
    }
  });

  const updateSecurityMutation = useMutation({
    mutationFn: (data: SecuritySettings) => 
      apiRequest('PUT', '/api/admin/security-settings', data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security-settings'] });
      toast({
        title: "Paramètres de sécurité mis à jour",
        description: "Les paramètres ont été sauvegardés avec succès.",
      });
    }
  });

  const handleSystemSave = () => {
    if (localSystemSettings) {
      updateSystemMutation.mutate(localSystemSettings);
    }
  };

  const handleSecuritySave = () => {
    if (localSecuritySettings) {
      updateSecurityMutation.mutate(localSecuritySettings);
    }
  };

  const handleSystemReset = () => {
    setLocalSystemSettings(systemSettings);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les modifications ont été annulées.",
    });
  };

  const handleSecurityReset = () => {
    setLocalSecuritySettings(securitySettings);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les modifications ont été annulées.",
    });
  };

  if (loadingSystem || loadingSecurity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabConfig = [
    { value: 'system', label: 'Système', icon: Settings },
    { value: 'security', label: 'Sécurité', icon: Shield },
    { value: 'database', label: 'Base de données', icon: Database },
    { value: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Paramètres Site Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Icon Navigation */}
          <MobileIconTabNavigation
            tabs={tabConfig}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {/* Desktop Tab List */}
          <TabsList className="hidden md:grid grid-cols-4 w-full">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Système
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de données
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuration Plateforme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Nom du Site</Label>
                    <Input
                      id="siteName"
                      value={localSystemSettings?.platform?.siteName || ''}
                      onChange={(e) => setLocalSystemSettings(prev => prev ? {
                        ...prev,
                        platform: { ...prev.platform, siteName: e.target.value }
                      } : null)}
                      data-testid="input-site-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={localSystemSettings?.platform?.version || ''}
                      onChange={(e) => setLocalSystemSettings(prev => prev ? {
                        ...prev,
                        platform: { ...prev.platform, version: e.target.value }
                      } : null)}
                      data-testid="input-version"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environnement</Label>
                    <select
                      id="environment"
                      value={localSystemSettings?.platform?.environment || 'development'}
                      onChange={(e) => setLocalSystemSettings(prev => prev ? {
                        ...prev,
                        platform: { ...prev.platform, environment: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="select-environment"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance"
                      checked={localSystemSettings?.platform?.maintenance || false}
                      onCheckedChange={(checked) => setLocalSystemSettings(prev => prev ? {
                        ...prev,
                        platform: { ...prev.platform, maintenance: checked }
                      } : null)}
                      data-testid="switch-maintenance"
                    />
                    <Label htmlFor="maintenance">Mode Maintenance</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fonctionnalités</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(localSystemSettings?.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => setLocalSystemSettings(prev => prev ? {
                          ...prev,
                          features: { ...prev.features, [key]: checked }
                        } : null)}
                        data-testid={`switch-${key}`}
                      />
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSystemSave} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-system">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button onClick={handleSystemReset} variant="outline" data-testid="button-reset-system">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authentification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twoFactor"
                      checked={localSecuritySettings?.authentication?.twoFactorRequired || false}
                      onCheckedChange={(checked) => setLocalSecuritySettings(prev => prev ? {
                        ...prev,
                        authentication: { ...prev.authentication, twoFactorRequired: checked }
                      } : null)}
                      data-testid="switch-two-factor"
                    />
                    <Label htmlFor="twoFactor">2FA Obligatoire</Label>
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Timeout Session (heures)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={localSecuritySettings?.authentication?.sessionTimeout || 0}
                      onChange={(e) => setLocalSecuritySettings(prev => prev ? {
                        ...prev,
                        authentication: { ...prev.authentication, sessionTimeout: parseInt(e.target.value) }
                      } : null)}
                      data-testid="input-session-timeout"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSecuritySave} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-security">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button onClick={handleSecurityReset} variant="outline" data-testid="button-reset-security">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestion Base de Données</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Configuration de la base de données disponible prochainement.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paramètres Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Configuration des notifications disponible prochainement.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FunctionalSiteAdminSettings;