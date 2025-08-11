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
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddZone, setShowAddZone] = useState(false);
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
  const { data: childrenData = [], isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ['/api/parent/geolocation/children'],
    enabled: !!user
  });

  const { data: safeZonesData = [], isLoading: zonesLoading } = useQuery<SafeZone[]>({
    queryKey: ['/api/parent/geolocation/safe-zones'],
    enabled: !!user
  });

  const { data: alertsData = [], isLoading: alertsLoading } = useQuery<GeolocationAlert[]>({
    queryKey: ['/api/parent/geolocation/alerts'],
    enabled: !!user
  });

  // Create safe zone mutation
  const createSafeZoneMutation = useMutation({
    mutationFn: async (zoneData: any) => {
      const response = await fetch('/api/parent/geolocation/safe-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(zoneData)
      });
      if (!response.ok) throw new Error('Failed to create safe zone');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/geolocation/safe-zones'] });
      setShowAddZone(false);
    }
  });

  // Stable callback handlers - moved to top level to avoid hooks rule violations
  const handleViewZoneMap = useStableCallback((zone: SafeZone) => {
    console.log(`[PARENT_GEOLOCATION] 🗺️ View safe zone ${zone.name || ''} on map`);
    fetch(`/api/parent/geolocation/safe-zones/${zone.id}/map`, {
      method: 'GET',
      credentials: 'include'
    }).then(async response => {
      if (response.ok) {
        const zoneMapData = await response.json();
        console.log(`[PARENT_GEOLOCATION] ✅ Zone map data:`, zoneMapData);
        window.dispatchEvent(new CustomEvent('openSafeZoneMap', { 
          detail: { zone, zoneMapData } 
        }));
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] View zone map error:', error);
    });
  });

  const handleModifyZone = useStableCallback((zone: SafeZone) => {
    console.log(`[PARENT_GEOLOCATION] ✏️ Modifying safe zone ${zone.id}: ${zone.name || ''}`);
    fetch(`/api/parent/geolocation/safe-zones/${zone.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        action: 'modify_zone',
        updates: { name: zone.name, active: !zone.active }
      })
    }).then(response => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/parent/geolocation/safe-zones'] });
        console.log(`[PARENT_GEOLOCATION] ✅ Successfully modified safe zone ${zone.name || ''}`);
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] Modify safe zone error:', error);
    });
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
    fetch(`/api/parent/geolocation/children/${child.id}/location`, {
      method: 'GET',
      credentials: 'include'
    }).then(async response => {
      if (response.ok) {
        const locationData = await response.json();
        console.log(`[PARENT_GEOLOCATION] ✅ Location data for ${child.name}:`, locationData);
        window.dispatchEvent(new CustomEvent('openChildMap', { 
          detail: { child, locationData } 
        }));
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] View map error:', error);
    });
  });

  const handleConfigureChildTracking = useStableCallback((child: Child) => {
    console.log(`[PARENT_GEOLOCATION] 🔧 Configuring tracking for child ${child.id}: ${child.name || ''}`);
    fetch(`/api/parent/geolocation/children/${child.id}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'configure_tracking' })
    }).then(response => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/parent/geolocation/children'] });
        console.log(`[PARENT_GEOLOCATION] ✅ Successfully configured tracking for ${child.name || ''}`);
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] Configure tracking error:', error);
    });
  });

  const handleViewAlertLocation = useStableCallback((alert: GeolocationAlert) => {
    console.log(`[PARENT_GEOLOCATION] 🗺️ View alert location for ${alert.childName}`);
    fetch(`/api/parent/geolocation/alerts/${alert.id}/location`, {
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
    fetch(`/api/parent/geolocation/alerts/${alert.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'acknowledge' })
    }).then(response => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/parent/geolocation/alerts'] });
        console.log(`[PARENT_GEOLOCATION] ✅ Successfully acknowledged alert ${alert.id}`);
      }
    }).catch(error => {
      console.error('[PARENT_GEOLOCATION] Acknowledge alert error:', error);
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
    { id: 'children', label: t.children, icon: <Users className="w-4 h-4" /> },
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
            <ModernCard gradient="blue">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">{t.activeDevices}</p>
                  <p className="text-2xl font-bold text-blue-900">{(Array.isArray(childrenData) ? childrenData.length : 0)}</p>
                </div>
                <Smartphone className="w-8 h-8 text-blue-500" />
              </div>
            </ModernCard>

            <ModernCard gradient="green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">{t.safeZonesCount}</p>
                  <p className="text-2xl font-bold text-green-900">{(Array.isArray(safeZonesData) ? safeZonesData.length : 0)}</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </ModernCard>

            <ModernCard gradient="orange">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">{t.todayAlerts}</p>
                  <p className="text-2xl font-bold text-orange-900">{(Array.isArray(alertsData) ? alertsData : []).filter(a => !a.resolved).length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </ModernCard>
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
                {(Array.isArray(childrenData) ? childrenData : []).map(child => (
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

      {/* Children Tab */}
      {activeTab === 'children' && !(childrenLoading || zonesLoading || alertsLoading) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Array.isArray(childrenData) ? childrenData : []).map(child => (
              <Card key={child.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{child.name || ''}</h3>
                    <Badge className={getStatusColor(child.status)}>
                      {t[child.status as keyof typeof t]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Classe</p>
                      <p className="font-medium">{child.class}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Appareil</p>
                      <p className="font-medium">{getDeviceIcon(child.deviceType || '')} {child.deviceId}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">{t.lastSeen}</p>
                    <p className="font-medium">{child.lastLocation?.address}</p>
                    <p className="text-xs text-gray-500">{new Date(child.lastLocation?.timestamp || '').toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${child.batteryLevel! > 50 ? 'bg-green-500' : child.batteryLevel! > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${child.batteryLevel}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{child.batteryLevel}%</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleConfigureChildTracking(child)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurer Suivi
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
            {(Array.isArray(safeZonesData) ? safeZonesData : []).map(zone => (
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
                      <span className="text-gray-600">Enfants:</span>
                      <span>{Array.isArray(zone.children) ? zone.children.length : 0}</span>
                    </div>
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
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t.recentAlerts}
              </h3>
            </CardHeader>
            <CardContent>
              {(Array.isArray(alertsData) ? alertsData.length : 0) === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.noAlerts}</p>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(alertsData) ? alertsData : []).map(alert => (
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
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Résoudre
                            </Button>
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
              
              const zoneData = {
                name: formData.get('name') as string,
                type: formData.get('type') as string,
                latitude: parseFloat(formData.get('latitude') as string),
                longitude: parseFloat(formData.get('longitude') as string),
                radius: parseInt(formData.get('radius') as string),
                active: true,
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
    </div>
  );
};

export default ParentGeolocation;