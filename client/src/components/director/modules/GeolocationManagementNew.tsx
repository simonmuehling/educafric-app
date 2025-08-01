import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Plus, Settings, Smartphone, CheckCircle, Shield, 
  AlertTriangle, Edit, Eye, Battery, Clock, MapIcon, 
  Tablet, Watch, Navigation
} from 'lucide-react';

interface TrackingDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  ownerName: string;
  relationship: string;
  emergencyContact: string;
  batteryAlerts: boolean;
  locationSharing: boolean;
  isActive: boolean;
  lastSeen: string;
  batteryLevel: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
}

interface SafeZone {
  id: number;
  name: string;
  description?: string;
  centerLatitude: string;
  centerLongitude: string;
  radius: number;
  zoneType: string;
  isActive: boolean;
  allowedTimeStart?: string;
  allowedTimeEnd?: string;
  allowedDays?: string[];
  createdAt: Date;
}

const GeolocationManagementNew: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TrackingDevice | null>(null);
  
  // Form states
  const [deviceForm, setDeviceForm] = useState({
    deviceName: '',
    deviceType: 'smartphone',
    ownerName: '',
    relationship: '',
    emergencyContact: ''
  });
  
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
    address: '',
    radius: 100,
    latitude: '',
    longitude: '',
    schedule: null
  });

  const text = {
    fr: {
      title: 'Gestion Géolocalisation',
      subtitle: 'Suivi des appareils et zones sécurisées',
      totalDevices: 'Appareils Totaux',
      activeDevices: 'Appareils Actifs',
      safeZones: 'Zones Sécurisées',
      activeAlerts: 'Alertes Actives',
      deviceName: 'Nom Appareil',
      studentName: 'Propriétaire',
      deviceType: 'Type',
      status: 'Statut',
      lastSeen: 'Dernière Position',
      battery: 'Batterie',
      actions: 'Actions',
      addDevice: 'Ajouter Appareil',
      addZone: 'Ajouter Zone',
      viewLocation: 'Voir Position',
      configureZones: 'Config. Zones',
      active: 'Actif',
      inactive: 'Inactif',
      smartphone: 'Smartphone',
      smartwatch: 'Smartwatch',
      tablet: 'Tablette',
      deviceAdded: 'Appareil ajouté avec succès!',
      zonesConfigured: 'Zones configurées!',
      emergency: 'Urgence',
      relationship: 'Relation',
      contact: 'Contact',
      location: 'Position',
      batteryLevel: 'Niveau Batterie',
      cancel: 'Annuler',
      save: 'Enregistrer',
      see: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer'
    },
    en: {
      title: 'Geolocation Management',
      subtitle: 'Device tracking and safe zones management',
      totalDevices: 'Total Devices',
      activeDevices: 'Active Devices',
      safeZones: 'Safe Zones',
      activeAlerts: 'Active Alerts',
      deviceName: 'Device Name',
      studentName: 'Owner',
      deviceType: 'Type',
      status: 'Status',
      lastSeen: 'Last Position',
      battery: 'Battery',
      actions: 'Actions',
      addDevice: 'Add Device',
      addZone: 'Add Zone',
      viewLocation: 'View Location',
      configureZones: 'Configure Zones',
      active: 'Active',
      inactive: 'Inactive',
      smartphone: 'Smartphone',
      smartwatch: 'Smartwatch',
      tablet: 'Tablet',
      deviceAdded: 'Device added successfully!',
      zonesConfigured: 'Zones configured!',
      emergency: 'Emergency',
      relationship: 'Relationship',
      contact: 'Contact',
      location: 'Location',
      batteryLevel: 'Battery Level',
      cancel: 'Cancel',
      save: 'Save',
      see: 'View',
      edit: 'Edit',
      delete: 'Delete'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch tracking devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/tracking/devices'],
    queryFn: async () => {
      const response = await fetch('/api/tracking/devices');
      if (!response.ok) throw new Error('Failed to fetch devices');
      return response.json();
    }
  });

  // Fetch safe zones
  const { data: safeZones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['/api/geolocation/safe-zones'],
    queryFn: async () => {
      const response = await fetch('/api/geolocation/safe-zones');
      if (!response.ok) throw new Error('Failed to fetch safe zones');
      const result = await response.json();
      return result.safeZones || [];
    }
  });

  // Add device mutation
  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      const response = await fetch('/api/tracking/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      if (!response.ok) throw new Error('Failed to add device');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking/devices'] });
      setShowAddDeviceModal(false);
      setDeviceForm({
        deviceName: '',
        deviceType: 'smartphone',
        ownerName: '',
        relationship: '',
        emergencyContact: ''
      });
      toast({ title: t.deviceAdded });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'ajouter l\'appareil',
        variant: 'destructive'
      });
    }
  });

  // Add safe zone mutation
  const addZoneMutation = useMutation({
    mutationFn: async (zoneData: any) => {
      const response = await fetch('/api/tracking/safe-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
      });
      if (!response.ok) throw new Error('Failed to add zone');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/safe-zones'] });
      setShowAddZoneModal(false);
      setZoneForm({
        name: '',
        description: '',
        address: '',
        radius: 100,
        latitude: '',
        longitude: '',
        schedule: null
      });
      toast({ title: t.zonesConfigured });
    },
    onError: (error) => {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'ajouter la zone',
        variant: 'destructive'
      });
    }
  });

  const handleAddDevice = () => {
    addDeviceMutation.mutate({
      ...deviceForm,
      batteryAlerts: true,
      locationSharing: true,
      isActive: true
    });
  };

  const handleAddZone = () => {
    addZoneMutation.mutate({
      name: zoneForm.name,
      type: 'custom',
      address: zoneForm.address,
      radius: zoneForm.radius,
      latitude: parseFloat(zoneForm.latitude),
      longitude: parseFloat(zoneForm.longitude),
      schedule: zoneForm.schedule
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-4 h-4" />;
      case 'smartwatch': return <Watch className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
      {isActive ? t.active : t.inactive}
    </Badge>
  );

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Maintenant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  // Statistics calculations
  const totalDevices = (Array.isArray(devices) ? devices.length : 0);
  const activeDevices = (Array.isArray(devices) ? devices : []).filter((d: TrackingDevice) => d.isActive).length;
  const totalSafeZones = (Array.isArray(safeZones) ? safeZones.length : 0);
  const activeAlerts = 0; // Mock for now

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title || ''}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={showAddDeviceModal} onOpenChange={setShowAddDeviceModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" data-testid="button-add-device">
                <Plus className="w-4 h-4" />
                {t.addDevice}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>{t.addDevice}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t.deviceName}</Label>
                  <Input
                    value={deviceForm.deviceName}
                    onChange={(e) => setDeviceForm({...deviceForm, deviceName: e?.target?.value})}
                    placeholder="iPhone de Sarah"
                    data-testid="input-device-name"
                  />
                </div>
                <div>
                  <Label>{t.deviceType}</Label>
                  <Select value={deviceForm.deviceType} onValueChange={(value) => setDeviceForm({...deviceForm, deviceType: value})}>
                    <SelectTrigger data-testid="select-device-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smartphone">{t.smartphone}</SelectItem>
                      <SelectItem value="smartwatch">{t.smartwatch}</SelectItem>
                      <SelectItem value="tablet">{t.tablet}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.studentName}</Label>
                  <Input
                    value={deviceForm.ownerName}
                    onChange={(e) => setDeviceForm({...deviceForm, ownerName: e?.target?.value})}
                    placeholder="Sarah Kamdem"
                    data-testid="input-owner-name"
                  />
                </div>
                <div>
                  <Label>{t.relationship}</Label>
                  <Input
                    value={deviceForm.relationship}
                    onChange={(e) => setDeviceForm({...deviceForm, relationship: e?.target?.value})}
                    placeholder="Fille, Fils, etc."
                    data-testid="input-relationship"
                  />
                </div>
                <div>
                  <Label>{t.emergency} {t.contact}</Label>
                  <Input
                    value={deviceForm.emergencyContact}
                    onChange={(e) => setDeviceForm({...deviceForm, emergencyContact: e?.target?.value})}
                    placeholder="+237657004011"
                    data-testid="input-emergency-contact"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDeviceModal(false)} data-testid="button-cancel-device">
                    {t.cancel}
                  </Button>
                  <Button onClick={handleAddDevice} disabled={addDeviceMutation.isPending} data-testid="button-save-device">
                    {addDeviceMutation.isPending ? 'Enregistrement...' : t.save}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddZoneModal} onOpenChange={setShowAddZoneModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" data-testid="button-add-zone">
                <Shield className="w-4 h-4" />
                {t.addZone}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>{t.addZone}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nom de la zone</Label>
                  <Input
                    value={zoneForm.name || ''}
                    onChange={(e) => setZoneForm({...zoneForm, name: e?.target?.value})}
                    placeholder="École, Maison, etc."
                    data-testid="input-zone-name"
                  />
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={zoneForm.address}
                    onChange={(e) => setZoneForm({...zoneForm, address: e?.target?.value})}
                    placeholder="Adresse complète"
                    data-testid="input-zone-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      value={zoneForm.latitude}
                      onChange={(e) => setZoneForm({...zoneForm, latitude: e?.target?.value})}
                      placeholder="3.8480"
                      data-testid="input-zone-latitude"
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      value={zoneForm.longitude}
                      onChange={(e) => setZoneForm({...zoneForm, longitude: e?.target?.value})}
                      placeholder="11.5021"
                      data-testid="input-zone-longitude"
                    />
                  </div>
                </div>
                <div>
                  <Label>Rayon (mètres)</Label>
                  <Input
                    type="number"
                    value={zoneForm.radius}
                    onChange={(e) => setZoneForm({...zoneForm, radius: parseInt(e?.target?.value)})}
                    data-testid="input-zone-radius"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddZoneModal(false)} data-testid="button-cancel-zone">
                    {t.cancel}
                  </Button>
                  <Button onClick={handleAddZone} disabled={addZoneMutation.isPending} data-testid="button-save-zone">
                    {addZoneMutation.isPending ? 'Enregistrement...' : t.save}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.totalDevices}</p>
                <p className="text-2xl font-bold">{totalDevices}</p>
              </div>
              <Smartphone className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.activeDevices}</p>
                <p className="text-2xl font-bold text-green-600">{activeDevices}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.safeZones}</p>
                <p className="text-2xl font-bold">{totalSafeZones}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.activeAlerts}</p>
                <p className="text-2xl font-bold text-orange-600">{activeAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Appareils de Suivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <div className="text-center py-8">Chargement des appareils...</div>
          ) : (Array.isArray(devices) ? devices.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun appareil configuré</div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(devices) ? devices : []).map((device: TrackingDevice) => (
                <div key={device.id} className="border rounded-lg p-4 space-y-3">
                  {/* Device Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.deviceType)}
                      <div>
                        <h3 className="font-medium" data-testid={`device-name-${device.id}`}>{device.deviceName}</h3>
                        <p className="text-sm text-gray-500">{device.ownerName}</p>
                      </div>
                    </div>
                    {getStatusBadge(device.isActive)}
                  </div>
                  
                  {/* Device Details - Mobile Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 capitalize" data-testid={`device-type-${device.id}`}>{device.deviceType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Relation:</span>
                      <span className="ml-2" data-testid={`device-relationship-${device.id}`}>{device.relationship}</span>
                    </div>
                    <div className="flex items-center">
                      <Battery className={`w-4 h-4 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                      <span data-testid={`device-battery-${device.id}`}>{device.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs" data-testid={`device-last-seen-${device.id}`}>
                        {formatLastSeen(device.lastSeen)}
                      </span>
                    </div>
                  </div>

                  {/* Current Location */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Position actuelle</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`device-location-${device.id}`}>
                          {device?.currentLocation?.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile Layout */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      data-testid={`button-view-location-${device.id}`}
                      onClick={() => {
                        toast({ title: `Position de ${device.ownerName}`, description: device?.currentLocation?.address });
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">{t.see}</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                      data-testid={`button-configure-${device.id}`}
                      onClick={() => {
                        toast({ title: 'Configuration', description: `Configuration de ${device.deviceName}` });
                      }}
                    >
                      <Settings className="w-3 h-3" />
                      <span className="hidden sm:inline">{t.edit}</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                      data-testid={`button-zones-${device.id}`}
                      onClick={() => {
                        toast({ title: 'Zones sécurisées', description: `Configuration des zones pour ${device.ownerName}` });
                      }}
                    >
                      <Shield className="w-3 h-3" />
                      <span className="hidden sm:inline">Zones</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safe Zones Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Zones Sécurisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {zonesLoading ? (
            <div className="text-center py-8">Chargement des zones...</div>
          ) : (Array.isArray(safeZones) ? safeZones.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucune zone configurée</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(Array.isArray(safeZones) ? safeZones : []).map((zone: SafeZone) => (
                <div key={zone.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium" data-testid={`zone-name-${zone.id}`}>{zone.name || ''}</h3>
                      <p className="text-sm text-gray-500">{zone.description || ''}</p>
                    </div>
                    <Badge variant={zone.isActive ? "default" : "secondary"}>
                      {zone.isActive ? t.active : t.inactive}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="capitalize" data-testid={`zone-type-${zone.id}`}>{zone.zoneType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rayon:</span>
                      <span data-testid={`zone-radius-${zone.id}`}>{zone.radius}m</span>
                    </div>
                    {zone.allowedTimeStart && zone.allowedTimeEnd && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Horaires:</span>
                        <span data-testid={`zone-schedule-${zone.id}`}>
                          {zone.allowedTimeStart} - {zone.allowedTimeEnd}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex items-center gap-1" data-testid={`button-edit-zone-${zone.id}`}>
                      <Edit className="w-3 h-3" />
                      {t.edit}
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1" data-testid={`button-view-zone-${zone.id}`}>
                      <MapIcon className="w-3 h-3" />
                      Carte
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeolocationManagementNew;