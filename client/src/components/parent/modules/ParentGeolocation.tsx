import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernCard } from '@/components/ui/ModernCard';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useToast } from '@/hooks/use-toast';
import { csrfFetch } from '@/lib/csrf';
import { 
  MapPin, Shield, Smartphone, Battery, AlertTriangle, 
  Clock, Navigation, Home, School, CheckCircle, 
  Plus, Settings, Users, Activity
} from 'lucide-react';

interface Child {
  id: number;
  name: string;
  class: string;
  deviceId?: string;
  deviceType?: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    address: string;
  };
  batteryLevel?: number;
  status: 'safe' | 'at_school' | 'in_transit' | 'unknown';
}

interface SafeZone {
  id: number;
  name: string;
  type: 'home' | 'school' | 'relative' | 'activity';
  coordinates: { lat: number; lng: number };
  radius: number;
  children?: number[];
  active: boolean;
}

interface GeolocationAlert {
  id: number;
  childName: string;
  type: 'zone_exit' | 'zone_enter' | 'emergency' | 'low_battery' | 'speed_alert';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;
}

export const ParentGeolocation = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showMapModal, setShowMapModal] = useState<{show: boolean, type: 'child' | 'zone' | 'alert', data: any}>({show: false, type: 'child', data: null});
  const [showEditZone, setShowEditZone] = useState<{show: boolean, zone: SafeZone | null}>({show: false, zone: null});
  const [showConfigureChild, setShowConfigureChild] = useState<{show: boolean, child: Child | null}>({show: false, child: null});
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationHelperActive, setLocationHelperActive] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState<Array<{
    name: string;
    type: string;
    lat: number;
    lng: number;
    distance?: number;
  }>>([]);

  // Use proper translations from translation system with safe fallback
  const t = translations[language === 'fr' ? 'fr' : 'en'].geolocation;

  // Real API calls using TanStack Query - Complete Storage-Route-API-Frontend Chain
  const { data: childrenData, isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ['/api/geolocation/parent/children'],
    queryFn: async () => {
      const response = await fetch('/api/geolocation/parent/children', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch children');
      return response.json();
    },
    enabled: !!user
  });

  const { data: safeZonesData, isLoading: zonesLoading } = useQuery<SafeZone[]>({
    queryKey: ['/api/geolocation/parent/safe-zones'],
    queryFn: async () => {
      const response = await fetch('/api/geolocation/parent/safe-zones', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch safe zones');
      return response.json();
    },
    enabled: !!user
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery<GeolocationAlert[]>({
    queryKey: ['/api/geolocation/parent/alerts'],
    queryFn: async () => {
      const response = await fetch('/api/geolocation/parent/alerts', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
    enabled: !!user
  });

  // Safe data with fallbacks
  const children = childrenData || [];
  const safeZones = safeZonesData || [];
  const alerts = alertsData || [];

  // Test zone exit mutation
  const testZoneExitMutation = useMutation({
    mutationFn: async (data: { studentId: number; zoneName: string }) => {
      console.log('[PARENT_GEOLOCATION] 🧪 Testing zone exit alert for:', data);
      const response = await csrfFetch('/api/geolocation/test/zone-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to test zone exit');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('[PARENT_GEOLOCATION] ✅ Zone exit test completed:', data);
      alert(`Test d'alerte de sortie de zone envoyé avec succès!\nLocalisation simulée: ${data.location}`);
    },
    onError: (error) => {
      console.error('[PARENT_GEOLOCATION] ❌ Zone exit test failed:', error);
      alert('Erreur lors du test d\'alerte');
    }
  });

  // Create safe zone mutation
  const createSafeZoneMutation = useMutation({
    mutationFn: async (zoneData: any) => {
      const response = await csrfFetch('/api/geolocation/safe-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
      });
      if (!response.ok) throw new Error('Failed to create safe zone');
      return response.json();
    },
    onSuccess: async (newZone) => {
      console.log('[PARENT_GEOLOCATION] ✅ Zone créée avec succès:', newZone);
      
      // Force immediate data refresh with multiple strategies
      await queryClient.invalidateQueries({ queryKey: ['/api/geolocation/parent/safe-zones'] });
      await queryClient.refetchQueries({ queryKey: ['/api/geolocation/parent/safe-zones'] });
      
      // Force complete geolocation cache refresh
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parent/children'] });
      
      // Add small delay to ensure server has processed the data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/geolocation/parent/safe-zones'] });
      }, 500);
      
      setShowAddZone(false);
      
      toast({
        title: '✅ Zone de sécurité créée avec succès',
        description: `Zone "${newZone.name || 'Nouvelle zone'}" ajoutée et visible immédiatement dans votre liste.`
      });
      
      // Scroll to show the new zone
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  });

  // Stable callback handlers - moved to top level to avoid hooks rule violations
  const handleViewZoneMap = useStableCallback((zone: SafeZone) => {
    console.log(`[PARENT_GEOLOCATION] 🗺️ View safe zone ${zone.name || ''} on map`);
    // For now, just show the zone data in a modal - map integration can be added later
    setShowMapModal({show: true, type: 'zone', data: {zone, coordinates: zone.coordinates}});
  });

  const handleModifyZone = useStableCallback((zone: SafeZone) => {
    console.log(`[PARENT_GEOLOCATION] ✏️ Opening modify modal for safe zone ${zone.id}: ${zone.name || ''}`);
    setShowEditZone({show: true, zone});
  });

  const handleAddSafeZone = useStableCallback(() => {
    console.log('[PARENT_GEOLOCATION] 🔧 Opening add safe zone modal...');
    setShowAddZone(true);
    // Proposer des lieux populaires au Cameroun
    setSuggestedLocations([
      { name: "École Saint-Paul Douala", type: "school", lat: 4.0511, lng: 9.7679 },
      { name: "Université de Douala", type: "school", lat: 4.0616, lng: 9.7736 },
      { name: "Centre-ville Douala", type: "activity", lat: 4.0511, lng: 9.7679 },
      { name: "Marché Central Yaoundé", type: "activity", lat: 3.8667, lng: 11.5167 },
      { name: "École Bilingue Yaoundé", type: "school", lat: 3.8480, lng: 11.5021 }
    ]);
  });

  const detectCurrentLocation = useStableCallback(() => {
    console.log('[PARENT_GEOLOCATION] 🔍 Detecting current location...');
    setLocationHelperActive(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(pos);
          console.log('[PARENT_GEOLOCATION] ✅ Position détectée:', pos);
          
          // Mettre à jour les champs du formulaire
          const latInput = document.querySelector('input[name="latitude"]') as HTMLInputElement;
          const lngInput = document.querySelector('input[name="longitude"]') as HTMLInputElement;
          if (latInput && lngInput) {
            latInput.value = pos.lat.toFixed(6);
            lngInput.value = pos.lng.toFixed(6);
          }
          setLocationHelperActive(false);
        },
        (error) => {
          console.error('[PARENT_GEOLOCATION] ❌ Erreur géolocalisation:', error);
          setLocationHelperActive(false);
          // Proposer Douala par défaut
          const defaultPos = { lat: 4.0511, lng: 9.7679 };
          setCurrentPosition(defaultPos);
          const latInput = document.querySelector('input[name="latitude"]') as HTMLInputElement;
          const lngInput = document.querySelector('input[name="longitude"]') as HTMLInputElement;
          if (latInput && lngInput) {
            latInput.value = defaultPos.lat.toFixed(6);
            lngInput.value = defaultPos.lng.toFixed(6);
          }
        }
      );
    }
  });

  const selectSuggestedLocation = useStableCallback((location: { lat: number; lng: number; name: string }) => {
    console.log('[PARENT_GEOLOCATION] 📍 Location suggérée sélectionnée:', location);
    const latInput = document.querySelector('input[name="latitude"]') as HTMLInputElement;
    const lngInput = document.querySelector('input[name="longitude"]') as HTMLInputElement;
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    
    if (latInput && lngInput) {
      latInput.value = location.lat.toFixed(6);
      lngInput.value = location.lng.toFixed(6);
    }
    if (nameInput && !nameInput.value) {
      nameInput.value = location.name;
    }
    setCurrentPosition({ lat: location.lat, lng: location.lng });
  });

  // Additional stable callback handlers to prevent hooks rule violations
  const handleTabClick = useStableCallback((tabId: string) => {
    setActiveTab(tabId);
  });

  const handleViewChildMap = useStableCallback((child: Child) => {
    console.log(`[PARENT_GEOLOCATION] 🗺️ View ${child.name || ''} on map`);
    fetch(`/api/geolocation/parent/children/${child.id}/location`, {
      method: 'GET',
      credentials: 'include'
    }).then(async response => {
      if (response.ok) {
        const locationData = await response.json();
        console.log(`[PARENT_GEOLOCATION] ✅ Location data for ${child.name}:`, locationData);
        setShowMapModal({show: true, type: 'child', data: {child, locationData}});
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] View map error:', error);
    });
  });

  const handleConfigureChildTracking = useStableCallback((child: Child) => {
    console.log(`[PARENT_GEOLOCATION] 🔧 Opening configuration modal for child ${child.id}: ${child.name || ''}`);
    setShowConfigureChild({show: true, child});
  });

  const handleViewAlertLocation = useStableCallback((alert: GeolocationAlert) => {
    console.log(`[PARENT_GEOLOCATION] 🗺️ View alert location for ${alert.childName}`);
    fetch(`/api/geolocation/parent/alerts/${alert.id}/location`, {
      method: 'GET',
      credentials: 'include'
    }).then(async response => {
      if (response.ok) {
        const alertLocationData = await response.json();
        console.log(`[PARENT_GEOLOCATION] ✅ Alert location data:`, alertLocationData);
        window.dispatchEvent(new CustomEvent('openAlertMap', { 
          detail: { alert, alertLocationData } 
        }));
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] View alert location error:', error);
    });
  });

  const handleAcknowledgeAlert = useStableCallback((alert: GeolocationAlert) => {
    console.log(`[PARENT_GEOLOCATION] ✅ Acknowledging alert ${alert.id}: ${alert.message}`);
    csrfFetch(`/api/geolocation/parent/alerts/${alert.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acknowledge' })
    }).then(response => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/geolocation/parent/alerts'] });
        console.log(`[PARENT_GEOLOCATION] ✅ Successfully acknowledged alert ${alert.id}`);
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] Acknowledge alert error:', error);
    });
  });

  const handleResolveAlert = useStableCallback((alert: GeolocationAlert) => {
    console.log(`[PARENT_GEOLOCATION] 🔧 Resolving alert ${alert.id}: ${alert.message}`);
    csrfFetch(`/api/geolocation/parent/alerts/${alert.id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'resolve', 
        resolution: 'Resolved by parent',
        resolvedAt: new Date().toISOString()
      })
    }).then(response => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/geolocation/parent/alerts'] });
        console.log(`[PARENT_GEOLOCATION] ✅ Successfully resolved alert ${alert.id}`);
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] Resolve alert error:', error);
    });
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-700';
      case 'at_school': return 'bg-blue-100 text-blue-700';
      case 'in_transit': return 'bg-yellow-100 text-yellow-700';
      case 'unknown': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'smartwatch': return '⌚';
      case 'tablet': return '📱';
      case 'smartphone': return '📱';
      default: return '📍';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'zone_exit': return <Navigation className="w-4 h-4 text-orange-500" />;
      case 'zone_enter': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'low_battery': return <Battery className="w-4 h-4 text-yellow-500" />;
      default: return <MapPin className="w-4 h-4 text-blue-500" />;
    }
  };

  const tabs = [
    { id: 'overview', label: t.overview, icon: <Activity className="w-4 h-4" /> },
    { id: 'zones', label: t.safeZones, icon: <Shield className="w-4 h-4" /> },
    { id: 'alerts', label: t.alerts, icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-100 text-green-700">
            <MapPin className="w-3 h-3 mr-1" />
            {t.realTimeTracking}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Optimized */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(Array.isArray(tabs) ? tabs : []).map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => handleTabClick(tab.id)}
                className="flex items-center gap-2 md:gap-2"
                title={tab.label}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(childrenLoading || zonesLoading || alertsLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-600">Chargement des données géolocalisation...</span>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && !(childrenLoading || zonesLoading || alertsLoading) && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-400 to-blue-600 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">{t.activeDevices}</p>
                    <p className="text-2xl font-bold text-white">{children.length}</p>
                  </div>
                  <Smartphone className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-400 to-green-600 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-100">{t.safeZonesCount}</p>
                    <p className="text-2xl font-bold text-white">{safeZones.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-400 to-orange-600 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-100">{t.todayAlerts}</p>
                    <p className="text-2xl font-bold text-white">{alerts.filter(a => !a.resolved).length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Children Status */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                {t.children} - {t.status}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map(child => (
                  <div key={child.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getDeviceIcon(child.deviceType || '')}</div>
                        <div>
                          <h4 className="font-medium text-gray-800">{child.name || ''}</h4>
                          <p className="text-sm text-gray-600">{child.class}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(child.status)}>
                        {t[child.status as keyof typeof t]}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t.batteryLevel}:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-full rounded-full ${child.batteryLevel! > 50 ? 'bg-green-500' : child.batteryLevel! > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${child.batteryLevel}%` }}
                            ></div>
                          </div>
                          <span>{child.batteryLevel}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t.lastSeen}:</span>
                        <span>{new Date(child.lastLocation?.timestamp || '').toLocaleTimeString()}</span>
                      </div>
                      
                      <p className="text-xs text-gray-500">{child.lastLocation?.address}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleViewChildMap(child)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {t.viewMap}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Safe Zones Tab */}
      {activeTab === 'zones' && !(childrenLoading || zonesLoading || alertsLoading) && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t.safeZones}</h3>
            <Button onClick={handleAddSafeZone}>
              <Plus className="w-4 h-4 mr-2" />
              {t.addSafeZone}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeZones.map(zone => (
              <Card key={zone.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {zone.type === 'home' && <Home className="w-5 h-5 text-blue-500" />}
                      {zone.type === 'school' && <School className="w-5 h-5 text-green-500" />}
                      {zone.type === 'relative' && <Users className="w-5 h-5 text-purple-500" />}
                      {zone.type === 'activity' && <Activity className="w-5 h-5 text-orange-500" />}
                      <h4 className="font-medium">{zone.name || ''}</h4>
                    </div>
                    <Badge variant={zone.active ? "default" : "secondary"}>
                      {zone.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{t[zone.type as keyof typeof t]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rayon:</span>
                      <span>{zone.radius}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enfants suivis:</span>
                      <span className="flex items-center gap-1">
                        {Array.isArray(zone.children) ? zone.children.length : 0}
                        {(Array.isArray(zone.children) ? zone.children.length : 0) > 0 && (
                          <span className="w-2 h-2 bg-green-400 rounded-full" title="Suivi actif" />
                        )}
                      </span>
                    </div>
                    {/* Afficher les noms des enfants suivis */}
                    {Array.isArray(zone.children) && zone.children.length > 0 && (
                      <div className="bg-green-50 p-2 rounded text-xs">
                        <span className="text-green-700 font-medium">👶 Enfants:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {zone.children.map((childId: any) => {
                            const child = children.find(c => c.id === childId);
                            return child ? (
                              <span key={childId} className="bg-green-200 text-green-800 px-1 py-0.5 rounded text-xs">
                                {child.name}
                              </span>
                            ) : (
                              <span key={childId} className="bg-gray-200 text-gray-600 px-1 py-0.5 rounded text-xs">
                                ID:{childId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewZoneMap(zone)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {t.viewMap}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleModifyZone(zone)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && !(childrenLoading || zonesLoading || alertsLoading) && (
        <div className="space-y-6">
          {/* Test Alert Button */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Test des Alertes
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const studentId = children.length > 0 ? children[0].id : 15; // Use first child or default
                    testZoneExitMutation.mutate({ 
                      studentId, 
                      zoneName: 'École Primaire Central' 
                    });
                  }}
                  disabled={testZoneExitMutation.isPending}
                  className="bg-orange-50 hover:bg-orange-100 border-orange-200"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {testZoneExitMutation.isPending ? 'Test en cours...' : 'Tester Sortie de Zone'}
                </Button>
              </h3>
              <p className="text-sm text-gray-600">
                Testez les alertes SMS et notifications PWA lorsqu'un enfant sort d'une zone de sécurité
              </p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t.recentAlerts}
              </h3>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.noAlerts}</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">{alert.childName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {alert.severity}
                            </Badge>
                            {alert.resolved && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewAlertLocation(alert)}
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {t.viewMap}
                          </Button>
                          {!alert.resolved && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(alert)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accuser réception
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleResolveAlert(alert)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Résoudre
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Safe Zone Modal */}
      {showAddZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ajouter une Zone de Sécurité</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddZone(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 pt-0">
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              // Récupérer les jours actifs sélectionnés
              const activeDays = Array.from(formData.getAll('activeDays')).map(day => parseInt(day as string));
              
              // Récupérer les enfants sélectionnés
              const selectedChildrenIds = Array.from(formData.getAll('childrenIds')).map(id => parseInt(id as string));
              
              const zoneData = {
                name: formData.get('name') as string,
                type: formData.get('type') as string,
                latitude: parseFloat(formData.get('latitude') as string),
                longitude: parseFloat(formData.get('longitude') as string),
                radius: parseInt(formData.get('radius') as string),
                active: true,
                // Enfants à suivre dans cette zone
                childrenIds: selectedChildrenIds,
                // Configuration horaire
                schedule: {
                  startTime: formData.get('startTime') as string,
                  endTime: formData.get('endTime') as string,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string || null,
                  activeDays: activeDays
                }
              };
              
              console.log('[PARENT_GEOLOCATION] 🏗️ Creating new safe zone with schedule:', zoneData);
              createSafeZoneMutation.mutate(zoneData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de la zone</label>
                <input
                  name="name"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Ex: Maison, École, Chez Grand-mère"
                  required
                />
              </div>

              {/* Configuration des horaires */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3 text-gray-700">Programmation horaire</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Heure de début</label>
                    <input
                      name="startTime"
                      type="time"
                      className="w-full p-2 border rounded-lg"
                      defaultValue="07:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Heure de fin</label>
                    <input
                      name="endTime"
                      type="time"
                      className="w-full p-2 border rounded-lg"
                      defaultValue="18:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date de début</label>
                    <input
                      name="startDate"
                      type="date"
                      className="w-full p-2 border rounded-lg"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date de fin (optionnelle)</label>
                    <input
                      name="endDate"
                      type="date"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Jours actifs</label>
                  <div className="flex flex-wrap gap-2">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                      <label key={day} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          name="activeDays"
                          value={index}
                          defaultChecked={index < 5} // Lun-Ven par défaut
                          className="rounded"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type de zone</label>
                <select
                  name="type"
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="home">🏠 Maison</option>
                  <option value="school">🏫 École</option>
                  <option value="relative">👨‍👩‍👧‍👦 Famille</option>
                  <option value="activity">⚽ Activité</option>
                </select>
              </div>

              {/* Suivi de Localisation des Enfants */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  📍 Suivi de Localisation des Enfants
                </h4>
                <div className="space-y-3">
                  <div className="text-sm text-blue-800 mb-3">
                    Sélectionnez les enfants dont les appareils seront suivis automatiquement dans cette zone de sécurité.
                  </div>
                  
                  {children.map((child) => (
                    <div key={child.id} className="border border-blue-200 rounded-lg p-3 hover:bg-blue-50 transition-colors">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="childrenIds"
                          value={child.id}
                          className="rounded text-blue-600"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {child.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{child.name}</div>
                            <div className="text-xs text-gray-500">{child.class || 'Classe non définie'}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Appareil:</span>
                              <span className={`w-3 h-3 rounded-full ${child.deviceType === 'smartphone' ? 'bg-green-400' : child.deviceType === 'smartwatch' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                              <span className="text-xs font-medium">
                                {child.deviceType === 'smartphone' ? '📱 Smartphone' : 
                                 child.deviceType === 'smartwatch' ? '⌚ Montre' : 
                                 child.deviceType === 'tablet' ? '📱 Tablette' : '📍 Autre'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                  
                  {children.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Aucun enfant trouvé</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-100 p-3 rounded-lg mt-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <strong>Suivi automatique:</strong> Les appareils des enfants sélectionnés seront automatiquement surveillés. Vous recevrez des alertes en temps réel en cas de sortie de zone.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Aide interactive pour la géolocalisation */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-blue-800">🗺️ Aide à la localisation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={detectCurrentLocation}
                    disabled={locationHelperActive}
                    className="w-full"
                  >
                    {locationHelperActive ? (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Navigation className="w-4 h-4 mr-2" />
                    )}
                    {locationHelperActive ? 'Localisation...' : 'Ma Position'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const pos = { lat: 4.0511, lng: 9.7679 };
                      selectSuggestedLocation({ ...pos, name: "Douala Centre" });
                    }}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Douala Centre
                  </Button>
                </div>
                
                {/* Suggestions de lieux populaires */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">Lieux populaires au Cameroun:</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {suggestedLocations.map((loc, index) => (
                      <button
                        key={index}
                        type="button"
                        className="text-left p-2 hover:bg-blue-100 rounded text-sm border"
                        onClick={() => selectSuggestedLocation(loc)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{loc.name}</span>
                          <span className="text-xs text-gray-500">
                            {loc.type === 'school' ? '🏫' : loc.type === 'activity' ? '🏢' : '📍'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude</label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    className="w-full p-2 border rounded-lg"
                    placeholder="3.8575"
                    required
                  />
                  {currentPosition && (
                    <p className="text-xs text-green-600 mt-1">
                      Position détectée: {currentPosition.lat.toFixed(6)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitude</label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    className="w-full p-2 border rounded-lg"
                    placeholder="11.5021"
                    required
                  />
                  {currentPosition && (
                    <p className="text-xs text-green-600 mt-1">
                      Position détectée: {currentPosition.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rayon (mètres)</label>
                <input
                  name="radius"
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="100"
                  min="10"
                  max="1000"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddZone(false)}
                  disabled={createSafeZoneMutation.isPending}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="flex-1"
                  disabled={createSafeZoneMutation.isPending}
                >
                  {createSafeZoneMutation.isPending ? 'Création...' : 'Créer Zone'}
                </Button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carte Interactive */}
      {showMapModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {showMapModal.type === 'child' && `Position de ${showMapModal.data?.child?.name}`}
                  {showMapModal.type === 'zone' && `Zone de Sécurité: ${showMapModal.data?.zone?.name}`}
                  {showMapModal.type === 'alert' && 'Localisation de l\'alerte'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowMapModal({show: false, type: 'child', data: null})}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-green-100 p-8 rounded-lg text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h4 className="text-lg font-medium mb-2">Carte Interactive</h4>
                <p className="text-gray-600 mb-4">
                  {showMapModal.type === 'child' && `Dernière position connue de ${showMapModal.data?.child?.name || 'cet enfant'}`}
                  {showMapModal.type === 'zone' && `Zone de sécurité "${showMapModal.data?.zone?.name || ''}" avec rayon de sécurité`}
                </p>
                
                {/* Informations détaillées */}
                <div className="bg-white p-4 rounded-lg text-left space-y-2">
                  {showMapModal.type === 'child' && showMapModal.data?.locationData && (
                    <>
                      <p><strong>Coordonnées:</strong> {showMapModal.data.locationData.location?.lat?.toFixed(6)}, {showMapModal.data.locationData.location?.lng?.toFixed(6)}</p>
                      <p><strong>Adresse:</strong> {showMapModal.data.locationData.location?.address || 'Position GPS'}</p>
                      <p><strong>Dernière mise à jour:</strong> {new Date(showMapModal.data.locationData.location?.timestamp).toLocaleString('fr-FR')}</p>
                    </>
                  )}
                  
                  {showMapModal.type === 'zone' && showMapModal.data?.zoneMapData && (
                    <>
                      <p><strong>Centre:</strong> {showMapModal.data.zoneMapData.mapData?.center?.lat?.toFixed(6)}, {showMapModal.data.zoneMapData.mapData?.center?.lng?.toFixed(6)}</p>
                      <p><strong>Rayon:</strong> {showMapModal.data.zoneMapData.mapData?.radius} mètres</p>
                      <p><strong>Type:</strong> Zone de sécurité</p>
                    </>
                  )}
                </div>
                
                <Button className="mt-4" onClick={() => {
                  const coords = showMapModal.type === 'child' 
                    ? `${showMapModal.data?.locationData?.location?.lat},${showMapModal.data?.locationData?.location?.lng}`
                    : `${showMapModal.data?.zoneMapData?.mapData?.center?.lat},${showMapModal.data?.zoneMapData?.mapData?.center?.lng}`;
                  window.open(`https://maps.google.com/maps?q=${coords}`, '_blank');
                }}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Ouvrir dans Google Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestion des Appareils */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ajouter un Appareil de Tracking</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddDevice(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const deviceData = {
                  childId: parseInt(formData.get('childId') as string),
                  deviceType: formData.get('deviceType') as string,
                  deviceName: formData.get('deviceName') as string,
                  deviceId: formData.get('deviceId') as string
                };
                console.log('[PARENT_GEOLOCATION] 📱 Adding new tracking device:', deviceData);
                setShowAddDevice(false);
              }}>
                <div>
                  <label className="block text-sm font-medium mb-2">Enfant</label>
                  <select name="childId" className="w-full p-2 border rounded-lg" required>
                    <option value="">Sélectionner un enfant</option>
                    {(childrenData || []).map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type d'appareil</label>
                  <select name="deviceType" className="w-full p-2 border rounded-lg" required>
                    <option value="smartwatch">⌚ Montre connectée</option>
                    <option value="smartphone">📱 Smartphone</option>
                    <option value="tablet">📱 Tablette</option>
                    <option value="gps_tracker">📍 Traceur GPS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nom de l'appareil</label>
                  <input
                    name="deviceName"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Ex: Montre de Marie, Téléphone de Jean"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ID de l'appareil</label>
                  <input
                    name="deviceId"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Ex: IMEI, numéro de série"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddDevice(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Ajouter Appareil
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab Appareils */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Appareils de Tracking</h3>
            <Button onClick={() => setShowAddDevice(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Appareil
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appareils démo */}
            {[
              { id: 1, name: "Montre de Marie", type: "smartwatch", child: "Marie Kamdem", battery: 78, status: "active", lastSeen: "Il y a 5 min" },
              { id: 2, name: "Téléphone de Jean", type: "smartphone", child: "Jean Kamdem", battery: 45, status: "active", lastSeen: "Il y a 12 min" }
            ].map(device => (
              <div key={device.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">
                      {device.type === 'smartwatch' ? '⌚' : device.type === 'smartphone' ? '📱' : '📍'}
                    </div>
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="text-sm text-gray-500">{device.child}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {device.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Batterie:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{width: `${device.battery}%`}}
                        />
                      </div>
                      <span className="text-xs font-medium">{device.battery}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dernière activité:</span>
                    <span className="font-medium">{device.lastSeen}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-1" />
                    Configurer
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    Localiser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Configuration Enfant */}
      {showConfigureChild.show && showConfigureChild.child && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white p-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Configuration du suivi - {showConfigureChild.child.name}</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowConfigureChild({show: false, child: null})}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const configData = {
                  childId: showConfigureChild.child?.id,
                  trackingEnabled: formData.get('trackingEnabled') === 'on',
                  alertsEnabled: formData.get('alertsEnabled') === 'on',
                  locationSharing: formData.get('locationSharing') === 'on',
                  emergencyContactsEnabled: formData.get('emergencyContactsEnabled') === 'on',
                  trackingInterval: parseInt(formData.get('trackingInterval') as string),
                  safeZoneAlerts: formData.get('safeZoneAlerts') === 'on',
                  batteryAlerts: formData.get('batteryAlerts') === 'on'
                };
                
                console.log('[PARENT_GEOLOCATION] 💾 Saving child configuration:', configData);
                
                // API call to save configuration
                csrfFetch(`/api/geolocation/parent/children/${configData.childId}/configure`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(configData)
                }).then(response => {
                  if (response.ok) {
                    queryClient.invalidateQueries({ queryKey: ['/api/geolocation/parent/children'] });
                    console.log(`[PARENT_GEOLOCATION] ✅ Configuration saved for ${showConfigureChild.child?.name}`);
                    setShowConfigureChild({show: false, child: null});
                  }
                }).catch(error => {
                  console.error('[PARENT_GEOLOCATION] Save configuration error:', error);
                });
              }}>
                
                {/* Statut de l'enfant */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Statut actuel</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dernière position:</span>
                      <p className="font-medium">{showConfigureChild.child.lastLocation?.address || 'Position inconnue'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Batterie appareil:</span>
                      <p className="font-medium">{showConfigureChild.child.batteryLevel || 'N/A'}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type appareil:</span>
                      <p className="font-medium">{showConfigureChild.child.deviceType || 'Non configuré'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut sécurité:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        showConfigureChild.child.status === 'safe' ? 'bg-green-100 text-green-700' :
                        showConfigureChild.child.status === 'at_school' ? 'bg-blue-100 text-blue-700' :
                        showConfigureChild.child.status === 'in_transit' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {showConfigureChild.child.status === 'safe' ? 'En sécurité' :
                         showConfigureChild.child.status === 'at_school' ? 'À l\'école' :
                         showConfigureChild.child.status === 'in_transit' ? 'En déplacement' : 'Inconnu'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Configuration de suivi */}
                <div className="space-y-4">
                  <h4 className="font-medium">Paramètres de géolocalisation</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Suivi GPS activé</label>
                      <p className="text-sm text-gray-600">Localisation en temps réel de l'enfant</p>
                    </div>
                    <input type="checkbox" name="trackingEnabled" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Alertes de sécurité</label>
                      <p className="text-sm text-gray-600">Notifications en cas de sortie des zones sécurisées</p>
                    </div>
                    <input type="checkbox" name="alertsEnabled" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Partage de position</label>
                      <p className="text-sm text-gray-600">L'enfant peut partager sa position avec vous</p>
                    </div>
                    <input type="checkbox" name="locationSharing" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Contacts d'urgence</label>
                      <p className="text-sm text-gray-600">Activation des contacts d'urgence en cas d'alerte</p>
                    </div>
                    <input type="checkbox" name="emergencyContactsEnabled" defaultChecked className="rounded" />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Intervalle de mise à jour (minutes)</label>
                    <select name="trackingInterval" className="w-full p-2 border rounded-lg">
                      <option value="1">Temps réel (1 min)</option>
                      <option value="5" selected>Normal (5 min)</option>
                      <option value="15">Économique (15 min)</option>
                      <option value="30">Très économique (30 min)</option>
                    </select>
                  </div>
                </div>

                {/* Configuration des alertes */}
                <div className="space-y-4">
                  <h4 className="font-medium">Types d'alertes</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Alertes zones de sécurité</label>
                      <p className="text-sm text-gray-600">Notifications d'entrée/sortie des zones sécurisées</p>
                    </div>
                    <input type="checkbox" name="safeZoneAlerts" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Alertes batterie faible</label>
                      <p className="text-sm text-gray-600">Notifications quand la batterie est faible</p>
                    </div>
                    <input type="checkbox" name="batteryAlerts" defaultChecked className="rounded" />
                  </div>
                </div>

              </form>
            </div>
            
            {/* Footer fixe avec boutons d'action */}
            <div className="sticky bottom-0 bg-white p-6 pt-4 border-t flex-shrink-0">
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfigureChild({show: false, child: null})}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  onClick={() => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                  }}
                >
                  Enregistrer Configuration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edition Zone de Sécurité */}
      {showEditZone.show && showEditZone.zone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white p-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Modifier la Zone de Sécurité</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEditZone({show: false, zone: null})}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const zoneData = {
                  name: formData.get('name') as string,
                  type: formData.get('type') as string,
                  radius: parseInt(formData.get('radius') as string),
                  active: formData.get('active') === 'on'
                };
                
                console.log('[PARENT_GEOLOCATION] 💾 Updating zone:', showEditZone.zone?.id, zoneData);
                
                // API call to update zone
                csrfFetch(`/api/geolocation/parent/safe-zones/${showEditZone.zone?.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    action: 'modify_zone',
                    updates: zoneData
                  })
                }).then(response => {
                  if (response.ok) {
                    queryClient.invalidateQueries({ queryKey: ['/api/geolocation/parent/safe-zones'] });
                    console.log(`[PARENT_GEOLOCATION] ✅ Zone ${showEditZone.zone?.name} updated successfully`);
                    setShowEditZone({show: false, zone: null});
                  }
                }).catch(error => {
                  console.error('[PARENT_GEOLOCATION] Update zone error:', error);
                });
              }}>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nom de la zone</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={showEditZone.zone.name}
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type de zone</label>
                  <select 
                    name="type" 
                    defaultValue={showEditZone.zone.type}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="home">🏠 Domicile</option>
                    <option value="school">🏫 École</option>
                    <option value="relative">👥 Famille</option>
                    <option value="activity">🎯 Activité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rayon de sécurité (mètres)</label>
                  <input 
                    type="number" 
                    name="radius" 
                    defaultValue={showEditZone.zone.radius}
                    min="10" 
                    max="5000" 
                    className="w-full p-3 border rounded-lg" 
                    required 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Zone active</label>
                    <p className="text-sm text-gray-600">Active la surveillance pour cette zone</p>
                  </div>
                  <input 
                    type="checkbox" 
                    name="active" 
                    defaultChecked={showEditZone.zone.active}
                    className="rounded" 
                  />
                </div>

              </form>
            </div>
            
            {/* Footer fixe avec boutons d'action */}
            <div className="sticky bottom-0 bg-white p-6 pt-4 border-t flex-shrink-0">
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditZone({show: false, zone: null})}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  onClick={() => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                  }}
                >
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentGeolocation;