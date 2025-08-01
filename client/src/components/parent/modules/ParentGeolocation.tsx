import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernCard } from '@/components/ui/ModernCard';
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
  center: { lat: number; lng: number };
  radius: number;
  children: number[];
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

  const text = {
    fr: {
      title: 'Géolocalisation Enfants',
      subtitle: 'Suivez la localisation de vos enfants en temps réel pour leur sécurité',
      overview: 'Vue d\'ensemble',
      children: 'Enfants',
      safeZones: 'Zones Sécurisées',
      alerts: 'Alertes',
      devices: 'Appareils',
      realTimeTracking: 'Suivi Temps Réel',
      batteryLevel: 'Niveau Batterie',
      lastSeen: 'Dernière Position',
      status: 'Statut',
      addSafeZone: 'Ajouter Zone Sécurisée',
      zoneName: 'Nom de la Zone',
      zoneType: 'Type de Zone',
      home: 'Maison',
      school: 'École',
      relative: 'Famille',
      activity: 'Activité',
      radius: 'Rayon (mètres)',
      createZone: 'Créer Zone',
      recentAlerts: 'Alertes Récentes',
      noAlerts: 'Aucune alerte',
      viewMap: 'Voir sur Carte',
      emergency: 'Urgence',
      safe: 'En sécurité',
      atSchool: 'À l\'école',
      inTransit: 'En transit',
      unknown: 'Position inconnue',
      activeDevices: 'Appareils Actifs',
      safeZonesCount: 'Zones Configurées',
      todayAlerts: 'Alertes Aujourd\'hui'
    },
    en: {
      title: 'Children Geolocation',
      subtitle: 'Track your children\'s location in real-time for their safety',
      overview: 'Overview',
      children: 'Children',
      safeZones: 'Safe Zones',
      alerts: 'Alerts',
      devices: 'Devices',
      realTimeTracking: 'Real-Time Tracking',
      batteryLevel: 'Battery Level',
      lastSeen: 'Last Position',
      status: 'Status',
      addSafeZone: 'Add Safe Zone',
      zoneName: 'Zone Name',
      zoneType: 'Zone Type',
      home: 'Home',
      school: 'School',
      relative: 'Family',
      activity: 'Activity',
      radius: 'Radius (meters)',
      createZone: 'Create Zone',
      recentAlerts: 'Recent Alerts',
      noAlerts: 'No alerts',
      viewMap: 'View on Map',
      emergency: 'Emergency',
      safe: 'Safe',
      atSchool: 'At school',
      inTransit: 'In transit',
      unknown: 'Unknown location',
      activeDevices: 'Active Devices',
      safeZonesCount: 'Configured Zones',
      todayAlerts: 'Today\'s Alerts'
    }
  };

  const t = text[language as keyof typeof text];

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
                onClick={() => setActiveTab(tab.id)}
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
                    
                    <Button size="sm" variant="outline" className="w-full mt-3">
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
                    onClick={() => {
                      console.log(`[PARENT_GEOLOCATION] 🔧 Configuring tracking for child ${child.id}: ${child.name || ''}`);
                      // This would typically open a configuration modal
                      queryClient.invalidateQueries({ queryKey: ['/api/parent/geolocation/children'] });
                    }}
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
            <Button onClick={() => setShowAddZone(true)}>
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
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => {
                      console.log(`[PARENT_GEOLOCATION] ✏️ Modifying safe zone ${zone.id}: ${zone.name || ''}`);
                      // This would typically open an edit modal
                      queryClient.invalidateQueries({ queryKey: ['/api/parent/geolocation/safe-zones'] });
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParentGeolocation;