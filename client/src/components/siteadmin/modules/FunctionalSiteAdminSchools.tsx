import React, { useState, useEffect } from 'react';
import { School, Plus, Edit, Trash2, Search, MapPin, Users, DollarSign, TrendingUp, CreditCard, MessageSquare, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { sortBy } from '@/utils/sort';

interface ParentPricing {
  communicationEnabled: boolean;
  communicationPrice: number;
  geolocationEnabled: boolean;
  geolocationPrice: number;
  discount2Children: number;
  discount3PlusChildren: number;
}

interface PlatformSchool {
  id: number;
  name: string;
  location: string;
  studentCount: number;
  teacherCount: number;
  subscriptionStatus: string;
  monthlyRevenue: number;
  createdAt: string;
  contactEmail?: string;
  phone?: string;
  offlinePremiumEnabled?: boolean;
  communicationsEnabled?: boolean;
  educationalContentEnabled?: boolean;
  delegateAdminsEnabled?: boolean;
  canteenEnabled?: boolean;
  schoolBusEnabled?: boolean;
  onlineClassesEnabled?: boolean;
}

const FunctionalSiteAdminSchools: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [schoolForSettings, setSchoolForSettings] = useState<PlatformSchool | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [parentPricing, setParentPricing] = useState<ParentPricing>({
    communicationEnabled: true,
    communicationPrice: 5000,
    geolocationEnabled: true,
    geolocationPrice: 5000,
    discount2Children: 20,
    discount3PlusChildren: 40
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch parent pricing when school is selected
  const { data: pricingData, refetch: refetchPricing } = useQuery({
    queryKey: ['/api/siteadmin/schools', schoolForSettings?.id, 'parent-pricing'],
    queryFn: async () => {
      if (!schoolForSettings?.id) return null;
      const response = await fetch(`/api/siteadmin/schools/${schoolForSettings.id}/parent-pricing`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pricing');
      return response.json();
    },
    enabled: !!schoolForSettings?.id && isSettingsDialogOpen
  });

  // Update parent pricing state when data is fetched
  useEffect(() => {
    if (pricingData?.pricing) {
      setParentPricing({
        communicationEnabled: pricingData.pricing.communicationEnabled ?? true,
        communicationPrice: pricingData.pricing.communicationPrice ?? 5000,
        geolocationEnabled: pricingData.pricing.geolocationEnabled ?? true,
        geolocationPrice: pricingData.pricing.geolocationPrice ?? 5000,
        discount2Children: pricingData.pricing.discount2Children ?? 20,
        discount3PlusChildren: pricingData.pricing.discount3PlusChildren ?? 40
      });
    }
  }, [pricingData]);

  // Update parent pricing mutation
  const updateParentPricingMutation = useMutation({
    mutationFn: async ({ schoolId, updates }: { schoolId: number; updates: Partial<ParentPricing> }) => {
      const response = await fetch(`/api/siteadmin/schools/${schoolId}/parent-pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update pricing');
      return response.json();
    },
    onSuccess: () => {
      refetchPricing();
      toast({
        title: 'Succès / Success',
        description: 'Tarifs parents mis à jour / Parent pricing updated'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur / Error',
        description: 'Échec de la mise à jour / Update failed',
        variant: 'destructive'
      });
    }
  });

  const { data: schoolsData, isLoading, error } = useQuery({
    queryKey: ['/api/siteadmin/schools'],
    queryFn: async () => {
      const response = await fetch('/api/siteadmin/schools', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    }
  });

  // Extract schools from the response structure
  const schools = schoolsData?.schools || [];

  const deleteSchoolMutation = useMutation({
    mutationFn: async (schoolId: number) => {
      const response = await fetch(`/api/admin/platform-schools/${schoolId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-schools'] });
    }
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ schoolId, updates }: { schoolId: number; updates: any }) => {
      const response = await fetch(`/api/admin/platform-schools/${schoolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/platform-schools'] });
    }
  });

  const toggleOfflinePremiumMutation = useMutation({
    mutationFn: async ({ schoolId, enabled }: { schoolId: number; enabled: boolean }) => {
      const response = await fetch(`/api/siteadmin/schools/${schoolId}/offline-premium`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled })
      });
      if (!response.ok) throw new Error('Failed to update offline premium');
      return response.json();
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      toast({
        title: 'Succès',
        description: `Offline Premium ${enabled ? 'activé' : 'désactivé'}`
      });
      if (schoolForSettings) {
        setSchoolForSettings({ ...schoolForSettings, offlinePremiumEnabled: enabled });
      }
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour',
        variant: 'destructive'
      });
    }
  });

  const updateModuleVisibilityMutation = useMutation({
    mutationFn: async ({ schoolId, updates }: { schoolId: number; updates: any }) => {
      const response = await fetch(`/api/siteadmin/schools/${schoolId}/module-visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update module visibility');
      return response.json();
    },
    onSuccess: (_, { updates }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/siteadmin/schools'] });
      toast({
        title: 'Succès',
        description: 'Visibilité des modules mise à jour'
      });
      if (schoolForSettings) {
        setSchoolForSettings({ ...schoolForSettings, ...updates });
      }
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour',
        variant: 'destructive'
      });
    }
  });

  const handleOpenSettings = (school: PlatformSchool) => {
    setSchoolForSettings(school);
    setIsSettingsDialogOpen(true);
  };

  const filteredSchools = sortBy(
    (schools || []).filter((school: PlatformSchool) => {
      return school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             school.location.toLowerCase().includes(searchTerm.toLowerCase());
    }),
    (s: PlatformSchool) => s.name,
    'text'
  );

  const handleDeleteSchool = (schoolId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      deleteSchoolMutation.mutate(schoolId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSubscriptionBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement des écoles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des écoles</p>
            <p className="text-sm mt-2">Veuillez réessayer plus tard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-blue-600" />
            Gestion des Écoles
            <Badge variant="secondary" className="ml-2">
              {filteredSchools.length} écoles
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter École
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Search Control */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom ou localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-schools"
          />
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school: PlatformSchool) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow" data-testid={`card-school-${school.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                      {school.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {school.location}
                    </div>
                    <Badge className={getSubscriptionBadgeColor(school.subscriptionStatus)}>
                      {school.subscriptionStatus === 'active' ? 'Actif' : 'Expiré'}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenSettings(school)}
                      className="h-8 w-8 p-0"
                      title="Paramètres Offline Premium"
                      data-testid={`button-settings-school-${school.id}`}
                    >
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      data-testid={`button-edit-school-${school.id}`}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSchool(school.id)}
                      className="h-8 w-8 p-0"
                      data-testid={`button-delete-school-${school.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-600">Étudiants</div>
                          <div className="font-semibold text-blue-800">{school.studentCount}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-600">Enseignants</div>
                          <div className="font-semibold text-green-800">{school.teacherCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-purple-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-600">Revenus Mensuels</div>
                          <div className="font-semibold text-purple-800">
                            {formatCurrency(school.monthlyRevenue)}
                          </div>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(school.contactEmail || school.phone) && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {school.contactEmail && (
                        <div>Email: {school.contactEmail}</div>
                      )}
                      {school.phone && (
                        <div>Tél: {school.phone}</div>
                      )}
                    </div>
                  )}

                  {/* Creation Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Créé le: {new Date(school.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucune école trouvée</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </CardContent>

      {/* Settings Dialog - Offline Premium & Module Visibility */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offline Premium & Visibilité Modules</DialogTitle>
            <DialogDescription>{schoolForSettings?.name}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Offline Premium Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Offline Premium</h3>
              <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="offline-premium-toggle" className="text-base font-medium">
                    {schoolForSettings?.offlinePremiumEnabled ? 'Offline Premium Activé' : 'Offline Premium Désactivé'}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Accès hors ligne illimité pour tous les 12 modules
                  </p>
                </div>
                <Switch
                  id="offline-premium-toggle"
                  checked={schoolForSettings?.offlinePremiumEnabled || false}
                  onCheckedChange={(checked) => {
                    if (schoolForSettings) {
                      toggleOfflinePremiumMutation.mutate({
                        schoolId: schoolForSettings.id,
                        enabled: checked
                      });
                    }
                  }}
                  disabled={toggleOfflinePremiumMutation.isPending}
                  data-testid="switch-offline-premium"
                />
              </div>
            </div>

            {/* Module Visibility Section */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Visibilité des Modules</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Contrôler quels modules apparaissent dans le tableau de bord Director
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-communications" className="text-sm font-medium cursor-pointer">
                    Communications
                  </Label>
                  <Switch
                    id="module-communications"
                    checked={schoolForSettings?.communicationsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { communicationsEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-communications"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-content" className="text-sm font-medium cursor-pointer">
                    Contenu Éducatif
                  </Label>
                  <Switch
                    id="module-content"
                    checked={schoolForSettings?.educationalContentEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { educationalContentEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-educational-content"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-delegates" className="text-sm font-medium cursor-pointer">
                    Administrateurs Délégués
                  </Label>
                  <Switch
                    id="module-delegates"
                    checked={schoolForSettings?.delegateAdminsEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { delegateAdminsEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-delegate-admins"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-canteen" className="text-sm font-medium cursor-pointer">
                    Cantine
                  </Label>
                  <Switch
                    id="module-canteen"
                    checked={schoolForSettings?.canteenEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { canteenEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-canteen"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-bus" className="text-sm font-medium cursor-pointer">
                    Bus Scolaire
                  </Label>
                  <Switch
                    id="module-bus"
                    checked={schoolForSettings?.schoolBusEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { schoolBusEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-school-bus"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="module-online-classes" className="text-sm font-medium cursor-pointer">
                    Classes en Ligne
                  </Label>
                  <Switch
                    id="module-online-classes"
                    checked={schoolForSettings?.onlineClassesEnabled ?? true}
                    onCheckedChange={(checked) => {
                      if (schoolForSettings) {
                        updateModuleVisibilityMutation.mutate({
                          schoolId: schoolForSettings.id,
                          updates: { onlineClassesEnabled: checked }
                        });
                      }
                    }}
                    disabled={updateModuleVisibilityMutation.isPending}
                    data-testid="switch-module-online-classes"
                  />
                </div>
              </div>
            </div>

            {/* Parent Pricing Section - Tarifs Abonnements Parents */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Tarifs Abonnements Parents / Parent Subscription Pricing
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configurer les tarifs de communication et géolocalisation pour les parents de cette école / Configure communication and geolocation pricing for parents of this school
                </p>
              </div>
              
              {/* Communication Pricing */}
              <div className="p-4 border rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Communication (Passerelle École-Parent)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <Label htmlFor="comm-enabled" className="text-sm">Activer / Enable</Label>
                    <Switch
                      id="comm-enabled"
                      checked={parentPricing.communicationEnabled}
                      onCheckedChange={(checked) => {
                        setParentPricing(prev => ({ ...prev, communicationEnabled: checked }));
                        if (schoolForSettings) {
                          updateParentPricingMutation.mutate({
                            schoolId: schoolForSettings.id,
                            updates: { communicationEnabled: checked }
                          });
                        }
                      }}
                      disabled={updateParentPricingMutation.isPending}
                      data-testid="switch-comm-enabled"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Prix / Price:</Label>
                    <Select
                      value={String(parentPricing.communicationPrice)}
                      onValueChange={(value) => {
                        const price = parseInt(value);
                        setParentPricing(prev => ({ ...prev, communicationPrice: price }));
                        if (schoolForSettings) {
                          updateParentPricingMutation.mutate({
                            schoolId: schoolForSettings.id,
                            updates: { communicationPrice: price }
                          });
                        }
                      }}
                      disabled={updateParentPricingMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-white" data-testid="select-comm-price">
                        <SelectValue placeholder="Prix" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="0">Gratuit / Free</SelectItem>
                        <SelectItem value="5000">5 000 CFA/an</SelectItem>
                        <SelectItem value="10000">10 000 CFA/an</SelectItem>
                        <SelectItem value="15000">15 000 CFA/an</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Geolocation Pricing */}
              <div className="p-4 border rounded-lg bg-green-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-medium">Géolocalisation / Geolocation</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <Label htmlFor="geo-enabled" className="text-sm">Activer / Enable</Label>
                    <Switch
                      id="geo-enabled"
                      checked={parentPricing.geolocationEnabled}
                      onCheckedChange={(checked) => {
                        setParentPricing(prev => ({ ...prev, geolocationEnabled: checked }));
                        if (schoolForSettings) {
                          updateParentPricingMutation.mutate({
                            schoolId: schoolForSettings.id,
                            updates: { geolocationEnabled: checked }
                          });
                        }
                      }}
                      disabled={updateParentPricingMutation.isPending}
                      data-testid="switch-geo-enabled"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Prix / Price:</Label>
                    <Select
                      value={String(parentPricing.geolocationPrice)}
                      onValueChange={(value) => {
                        const price = parseInt(value);
                        setParentPricing(prev => ({ ...prev, geolocationPrice: price }));
                        if (schoolForSettings) {
                          updateParentPricingMutation.mutate({
                            schoolId: schoolForSettings.id,
                            updates: { geolocationPrice: price }
                          });
                        }
                      }}
                      disabled={updateParentPricingMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-white" data-testid="select-geo-price">
                        <SelectValue placeholder="Prix" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="0">Gratuit / Free</SelectItem>
                        <SelectItem value="5000">5 000 CFA/an</SelectItem>
                        <SelectItem value="10000">10 000 CFA/an</SelectItem>
                        <SelectItem value="15000">15 000 CFA/an</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Family Discount Settings */}
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <Label className="text-base font-medium">Réductions Famille / Family Discounts</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">2 enfants:</Label>
                    <Select
                      value={String(parentPricing.discount2Children)}
                      onValueChange={(value) => {
                        const discount = parseInt(value);
                        setParentPricing(prev => ({ ...prev, discount2Children: discount }));
                        if (schoolForSettings) {
                          updateParentPricingMutation.mutate({
                            schoolId: schoolForSettings.id,
                            updates: { discount2Children: discount }
                          });
                        }
                      }}
                      disabled={updateParentPricingMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-white" data-testid="select-discount-2">
                        <SelectValue placeholder="Réduction" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="10">-10%</SelectItem>
                        <SelectItem value="20">-20%</SelectItem>
                        <SelectItem value="30">-30%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">3+ enfants:</Label>
                    <Select
                      value={String(parentPricing.discount3PlusChildren)}
                      onValueChange={(value) => {
                        const discount = parseInt(value);
                        setParentPricing(prev => ({ ...prev, discount3PlusChildren: discount }));
                        if (schoolForSettings) {
                          updateParentPricingMutation.mutate({
                            schoolId: schoolForSettings.id,
                            updates: { discount3PlusChildren: discount }
                          });
                        }
                      }}
                      disabled={updateParentPricingMutation.isPending}
                    >
                      <SelectTrigger className="w-full bg-white" data-testid="select-discount-3plus">
                        <SelectValue placeholder="Réduction" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="20">-20%</SelectItem>
                        <SelectItem value="30">-30%</SelectItem>
                        <SelectItem value="40">-40%</SelectItem>
                        <SelectItem value="50">-50%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsDialogOpen(false)} 
              data-testid="button-close-settings"
            >
              Fermer / Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FunctionalSiteAdminSchools;