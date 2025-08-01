import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Navigation, Shield, Clock, AlertTriangle, CheckCircle, 
  Plus, Edit, Trash2, Eye, Target, Smartphone, Watch, Tablet,
  Home, School, Users, Calendar, Settings, Save, RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'smartwatch' | 'tablet';
  childName: string;
  status: 'active' | 'inactive' | 'low_battery';
  lastSeen: string;
  battery: number;
  location?: { lat: number; lng: number; address: string };
}

interface SafeZone {
  id: string;
  name: string;
  type: 'home' | 'school' | 'tutor' | 'activity' | 'custom';
  address: string;
  radius: number; // in meters
  coordinates: { lat: number; lng: number };
  createdBy: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
    validFrom: string;
    validTo: string;
  };
  active: boolean;
  color: string;
}

interface GeolocationManagerProps {
  userRole: 'Parent' | 'Teacher' | 'Freelancer' | 'Director' | 'Admin';
  childrenIds?: string[];
}

const UnifiedGeolocationManager: React.FC<GeolocationManagerProps> = ({ 
  userRole, 
  childrenIds = [] 
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState<Device[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [newZone, setNewZone] = useState<Partial<SafeZone>>({});
  const [isCreatingZone, setIsCreatingZone] = useState(false);

  const text = {
    fr: {
      title: 'Gestion de Géolocalisation',
      subtitle: 'Suivi et sécurité des enfants',
      devices: 'Appareils',
      safeZones: 'Zones Sûres',
      tracking: 'Suivi',
      history: 'Historique',
      addDevice: 'Ajouter Appareil',
      addZone: 'Créer Zone',
      deviceName: 'Nom de l\'appareil',
      childName: 'Nom de l\'enfant',
      deviceType: 'Type d\'appareil',
      smartphone: 'Smartphone',
      smartwatch: 'Montre connectée',
      tablet: 'Tablette',
      zoneName: 'Nom de la zone',
      zoneType: 'Type de zone',
      home: 'Maison',
      school: 'École',
      tutor: 'Répétiteur',
      activity: 'Activité',
      custom: 'Personnalisé',
      address: 'Adresse',
      radius: 'Rayon (mètres)',
      schedule: 'Horaire',
      validDays: 'Jours valides',
      startTime: 'Heure début',
      endTime: 'Heure fin',
      validFrom: 'Valide du',
      validTo: 'Valide au',
      save: 'Enregistrer',
      cancel: 'Annuler',
      active: 'Actif',
      inactive: 'Inactif',
      lowBattery: 'Batterie faible',
      lastSeen: 'Vu pour la dernière fois',
      currentLocation: 'Position actuelle',
      inSafeZone: 'Dans zone sûre',
      outsideZone: 'Hors zone',
      emergencyAlert: 'Alerte urgence',
      viewOnMap: 'Voir sur carte',
      editZone: 'Modifier zone',
      deleteZone: 'Supprimer zone',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    },
    en: {
      title: 'Geolocation Management',
      subtitle: 'Child tracking and safety',
      devices: 'Devices',
      safeZones: 'Safe Zones',
      tracking: 'Tracking',
      history: 'History',
      addDevice: 'Add Device',
      addZone: 'Create Zone',
      deviceName: 'Device name',
      childName: 'Child name',
      deviceType: 'Device type',
      smartphone: 'Smartphone',
      smartwatch: 'Smartwatch',
      tablet: 'Tablet',
      zoneName: 'Zone name',
      zoneType: 'Zone type',
      home: 'Home',
      school: 'School',
      tutor: 'Tutor',
      activity: 'Activity',
      custom: 'Custom',
      address: 'Address',
      radius: 'Radius (meters)',
      schedule: 'Schedule',
      validDays: 'Valid days',
      startTime: 'Start time',
      endTime: 'End time',
      validFrom: 'Valid from',
      validTo: 'Valid to',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      lowBattery: 'Low battery',
      lastSeen: 'Last seen',
      currentLocation: 'Current location',
      inSafeZone: 'In safe zone',
      outsideZone: 'Outside zone',
      emergencyAlert: 'Emergency alert',
      viewOnMap: 'View on map',
      editZone: 'Edit zone',
      deleteZone: 'Delete zone',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    }
  };

  const t = text[language as keyof typeof text];

  // Sample data - Replace with API calls
  useEffect(() => {
    // Load devices and safe zones from API
    setDevices([
      {
        id: '1',
        name: 'iPhone de Marie',
        type: 'smartphone',
        childName: 'Marie Tagne',
        status: 'active',
        lastSeen: '2 min',
        battery: 85,
        location: {
          lat: 3.8480,
          lng: 11.5021,
          address: 'École Publique Central, Yaoundé'
        }
      },
      {
        id: '2',
        name: 'Montre de Paul',
        type: 'smartwatch',
        childName: 'Paul Mbeng',
        status: 'low_battery',
        lastSeen: '15 min',
        battery: 12,
        location: {
          lat: 3.8560,
          lng: 11.5186,
          address: 'Quartier Bastos, Yaoundé'
        }
      }
    ]);

    setSafeZones([
      {
        id: '1',
        name: 'École Primaire',
        type: 'school',
        address: 'École Publique Central, Yaoundé',
        radius: 100,
        coordinates: { lat: 3.8480, lng: 11.5021 },
        createdBy: 'École',
        schedule: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '07:00',
          endTime: '15:00',
          validFrom: '2025-01-01',
          validTo: '2025-12-31'
        },
        active: true,
        color: '#10B981'
      },
      {
        id: '2',
        name: 'Maison Familiale',
        type: 'home',
        address: 'Quartier Bastos, Yaoundé',
        radius: 50,
        coordinates: { lat: 3.8560, lng: 11.5186 },
        createdBy: 'Parent',
        active: true,
        color: '#3B82F6'
      }
    ]);
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-4 h-4" />;
      case 'smartwatch': return <Watch className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'school': return <School className="w-4 h-4" />;
      case 'tutor': return <Users className="w-4 h-4" />;
      case 'activity': return <Target className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: t.active },
      inactive: { color: 'bg-gray-500', text: t.inactive },
      low_battery: { color: 'bg-red-500', text: t.lowBattery }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  const handleCreateZone = () => {
    if (newZone.name && newZone.address && newZone.radius) {
      const zone: SafeZone = {
        id: Date.now().toString(),
        name: newZone.name,
        type: newZone.type || 'custom',
        address: newZone.address,
        radius: newZone.radius,
        coordinates: { lat: 0, lng: 0 }, // Would geocode address
        createdBy: userRole,
        schedule: newZone.schedule,
        active: true,
        color: '#8B5CF6'
      };
      
      setSafeZones([...safeZones, zone]);
      setNewZone({});
      setIsCreatingZone(false);
    }
  };

  const renderDevicesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t.devices}</h3>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t.addDevice}
        </Button>
      </div>

      <div className="grid gap-4">
        {(Array.isArray(devices) ? devices : []).map((device) => (
          <Card key={device.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device.type)}
                <div>
                  <h4 className="font-medium">{device.name || ''}</h4>
                  <p className="text-sm text-gray-600">{device.childName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(device.status)}
                    <span className="text-sm">{device.battery}%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t.lastSeen}: {device.lastSeen}
                  </p>
                </div>
                
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {device.location && (
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{device?.location?.address}</span>
                  <Badge variant="outline" className="text-green-600">
                    {t.inSafeZone}
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSafeZonesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t.safeZones}</h3>
        <Button 
          onClick={() => setIsCreatingZone(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.addZone}
        </Button>
      </div>

      {isCreatingZone && (
        <Card className="p-4 border-2 border-blue-200">
          <h4 className="font-medium mb-4">Créer une nouvelle zone</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.zoneName}
              </label>
              <Input
                value={newZone.name || ''}
                onChange={(e) => setNewZone({...newZone, name: e?.target?.value})}
                placeholder="Ex: Terrain de sport"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.zoneType}
              </label>
              <Select
                value={newZone.type || ''}
                onValueChange={(value) => setNewZone({...newZone, type: value as SafeZone['type']})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">{t.home}</SelectItem>
                  <SelectItem value="school">{t.school}</SelectItem>
                  <SelectItem value="tutor">{t.tutor}</SelectItem>
                  <SelectItem value="activity">{t.activity}</SelectItem>
                  <SelectItem value="custom">{t.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {t.address}
              </label>
              <Textarea
                value={newZone.address || ''}
                onChange={(e) => setNewZone({...newZone, address: e?.target?.value})}
                placeholder="Adresse complète de la zone"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.radius}
              </label>
              <Input
                type="number"
                value={newZone.radius || ''}
                onChange={(e) => setNewZone({...newZone, radius: parseInt(e?.target?.value)})}
                placeholder="50"
                min="10"
                max="1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Durée
              </label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  placeholder="Heure début"
                />
                <Input
                  type="time"
                  placeholder="Heure fin"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Période de validité
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Date début"
                />
                <Input
                  type="date"
                  placeholder="Date fin"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateZone} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t.save}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreatingZone(false);
                setNewZone({});
              }}
            >
              {t.cancel}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {(Array.isArray(safeZones) ? safeZones : []).map((zone) => (
          <Card key={zone.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                {getZoneIcon(zone.type)}
                <div>
                  <h4 className="font-medium">{zone.name || ''}</h4>
                  <p className="text-sm text-gray-600">{zone.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {zone.radius}m
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {zone.schedule && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {zone?.schedule?.startTime} - {zone?.schedule?.endTime}
                  </span>
                  <span className="text-gray-500">
                    ({zone?.schedule?.days.join(', ')})
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTrackingTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Zones Actives</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {(Array.isArray(safeZones) ? safeZones : []).filter(z => z.active).length}
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Appareils Connectés</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {(Array.isArray(devices) ? devices : []).filter(d => d.status === 'active').length}
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Alertes Actives</span>
          </div>
          <p className="text-2xl font-bold text-red-600">0</p>
        </Card>
      </div>
      
      <Card className="p-4">
        <h4 className="font-medium mb-4">Suivi en Temps Réel</h4>
        <div className="bg-gray-100 rounded h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p>Carte interactive à implémenter</p>
            <p className="text-sm">Affichage des positions en temps réel</p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            {t.devices}
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t.safeZones}
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            {t.tracking}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t.history}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          {renderDevicesTab()}
        </TabsContent>

        <TabsContent value="zones">
          {renderSafeZonesTab()}
        </TabsContent>

        <TabsContent value="tracking">
          {renderTrackingTab()}
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p>Historique des déplacements à implémenter</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedGeolocationManager;