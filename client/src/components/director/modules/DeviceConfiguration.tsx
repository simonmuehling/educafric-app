import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Smartphone, Watch, Tablet, MapPin, Wifi, Battery, Signal, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Device {
  id: number;
  name: string;
  type: string;
  student: string;
  status: string;
  battery: number;
  signal: number;
  lastSeen: string;
  location: string;
}

export default function DeviceConfiguration() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('devices');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  const t = {
    title: language === 'fr' ? 'Ajouter Appareil' : 'Add Device',
    subtitle: language === 'fr' ? 'Configuration des appareils connectés pour le suivi des élèves' : 'Configure connected devices for student tracking',
    addDevice: language === 'fr' ? 'Ajouter Appareil' : 'Add Device',
    devices: language === 'fr' ? 'Appareils' : 'Devices',
    setup: language === 'fr' ? 'Configuration' : 'Setup',
    gpsTracking: language === 'fr' ? 'Suivi GPS' : 'GPS Tracking',
    connectivity: language === 'fr' ? 'Connectivité' : 'Connectivity',
    online: language === 'fr' ? 'En ligne' : 'Online',
    offline: language === 'fr' ? 'Hors ligne' : 'Offline',
    locate: language === 'fr' ? 'Localiser' : 'Locate',
    configure: language === 'fr' ? 'Configurer' : 'Configure',
    lastPosition: language === 'fr' ? 'Dernière position:' : 'Last position:',
    lastActivity: language === 'fr' ? 'Dernière activité:' : 'Last activity:',
    deviceTypeLabel: language === 'fr' ? "Type d'appareil" : 'Device type',
    deviceName: language === 'fr' ? "Nom de l'appareil" : 'Device name',
    assignedStudent: language === 'fr' ? 'Élève assigné' : 'Assigned student',
    uniqueId: language === 'fr' ? 'Identifiant unique (IMEI/MAC)' : 'Unique ID (IMEI/MAC)',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    addNewDevice: language === 'fr' ? 'Ajouter un Nouvel Appareil' : 'Add New Device',
    selectDeviceType: language === 'fr' ? "Choisir le type d'appareil" : 'Choose device type',
    selectStudent: language === 'fr' ? 'Sélectionner un élève' : 'Select a student',
    deviceAdded: language === 'fr' ? 'Appareil ajouté' : 'Device added',
    deviceAddedDesc: language === 'fr' ? "L'appareil a été configuré avec succès" : 'Device configured successfully',
    error: language === 'fr' ? 'Erreur' : 'Error',
    errorDesc: language === 'fr' ? "Impossible d'ajouter l'appareil" : 'Unable to add device',
    noDevices: language === 'fr' ? 'Aucun appareil configuré' : 'No devices configured',
    noDevicesDesc: language === 'fr' ? 'Ajoutez des appareils pour suivre vos élèves.' : 'Add devices to track your students.',
    configGuide: language === 'fr' ? 'Guide de Configuration des Appareils' : 'Device Configuration Guide',
    features: language === 'fr' ? 'Fonctionnalités:' : 'Features:',
    configInstructions: language === 'fr' ? 'Instructions de Configuration' : 'Configuration Instructions',
    gpsSettings: language === 'fr' ? 'Paramètres de Suivi GPS' : 'GPS Tracking Settings',
    locationFrequency: language === 'fr' ? 'Fréquence de localisation' : 'Location frequency',
    everyMinute: language === 'fr' ? 'Toutes les minutes' : 'Every minute',
    every5Min: language === 'fr' ? 'Toutes les 5 minutes' : 'Every 5 minutes',
    every15Min: language === 'fr' ? 'Toutes les 15 minutes' : 'Every 15 minutes',
    every30Min: language === 'fr' ? 'Toutes les 30 minutes' : 'Every 30 minutes',
    defaultSafeZone: language === 'fr' ? 'Zone de sécurité par défaut' : 'Default safe zone',
    alertRadius: language === 'fr' ? 'Rayon d\'alerte (mètres)' : 'Alert radius (meters)',
    autoNotifications: language === 'fr' ? 'Notifications automatiques' : 'Automatic notifications',
    schoolEntry: language === 'fr' ? 'Entrée dans l\'école' : 'School entry',
    schoolExit: language === 'fr' ? 'Sortie de l\'école' : 'School exit',
    safeZoneExit: language === 'fr' ? 'Sortie de zone sécurisée' : 'Safe zone exit',
    lowBattery: language === 'fr' ? 'Batterie faible (<20%)' : 'Low battery (<20%)',
    emergencyButton: language === 'fr' ? 'Bouton d\'urgence' : 'Emergency button',
    immediateParentAlert: language === 'fr' ? 'Alerte parents immédiate' : 'Immediate parent alert',
    schoolNotification: language === 'fr' ? 'Notification école' : 'School notification',
    autoSecurityCall: language === 'fr' ? 'Appel automatique sécurité' : 'Automatic security call',
    saveConfig: language === 'fr' ? 'Sauvegarder Configuration' : 'Save Configuration',
    connectivityStatus: language === 'fr' ? 'État de la Connectivité' : 'Connectivity Status',
    wifiSchool: language === 'fr' ? 'WiFi École' : 'School WiFi',
    connected: language === 'fr' ? 'Connecté - Signal fort' : 'Connected - Strong signal',
    devicesConnected: (n: number) => language === 'fr' ? `${n} appareils connectés` : `${n} devices connected`,
    mobileNetwork: language === 'fr' ? 'Réseau Mobile' : 'Mobile Network',
    available: language === 'fr' ? 'Disponible' : 'Available',
    optimalCoverage: language === 'fr' ? 'Couverture optimale' : 'Optimal coverage',
    gpsSatellites: language === 'fr' ? 'GPS Satellites' : 'GPS Satellites',
    satellitesDetected: (n: number) => language === 'fr' ? `${n} satellites détectés` : `${n} satellites detected`,
    precision: language === 'fr' ? 'Précision: ±3 mètres' : 'Precision: ±3 meters',
    networkConfig: language === 'fr' ? 'Configuration Réseau' : 'Network Configuration',
    mainWifi: language === 'fr' ? 'Réseau WiFi principal' : 'Main WiFi Network',
    test: language === 'fr' ? 'Tester' : 'Test',
    mobileProvider: language === 'fr' ? 'Fournisseur de données mobiles' : 'Mobile data provider',
    geoServer: language === 'fr' ? 'Serveur de géolocalisation' : 'Geolocation server',
    updateConfig: language === 'fr' ? 'Mettre à Jour Configuration' : 'Update Configuration',
    smartwatch: language === 'fr' ? 'Montre connectée' : 'Smartwatch',
    smartwatchDesc: language === 'fr' ? 'Montre connectée pour élèves' : 'Connected watch for students',
    smartphone: language === 'fr' ? 'Smartphone' : 'Smartphone',
    smartphoneDesc: language === 'fr' ? 'Téléphone intelligent des élèves' : 'Student smartphone',
    tablet: language === 'fr' ? 'Tablette' : 'Tablet',
    tabletDesc: language === 'fr' ? 'Tablette pour usage scolaire' : 'Tablet for school use',
    gpsTracker: language === 'fr' ? 'Traceur GPS' : 'GPS Tracker',
    gpsTrackerDesc: language === 'fr' ? 'Dispositif GPS dédié' : 'Dedicated GPS device',
    smartwatchFeatures: language === 'fr' 
      ? ['GPS intégré', 'Appel d\'urgence', 'Géofencing', 'Suivi activité']
      : ['Built-in GPS', 'Emergency call', 'Geofencing', 'Activity tracking'],
    smartphoneFeatures: language === 'fr'
      ? ['Localisation précise', 'Communication', 'Applications éducatives', 'Contrôle parental']
      : ['Precise location', 'Communication', 'Educational apps', 'Parental control'],
    tabletFeatures: language === 'fr'
      ? ['Grand écran', 'Applications éducatives', 'Partage d\'écran', 'Mode classe']
      : ['Large screen', 'Educational apps', 'Screen sharing', 'Class mode'],
    gpsTrackerFeatures: language === 'fr'
      ? ['Longue autonomie', 'Résistant à l\'eau', 'Bouton SOS', 'Historique de trajets']
      : ['Long battery life', 'Water resistant', 'SOS button', 'Trip history'],
    smartwatchInstructions: language === 'fr'
      ? ['1. Télécharger l\'application EDUCAFRIC sur l\'appareil', '2. Créer un compte avec l\'email de l\'élève', '3. Activer la géolocalisation et les notifications', '4. Synchroniser avec le compte parent/école']
      : ['1. Download the EDUCAFRIC app on the device', '2. Create an account with the student email', '3. Enable geolocation and notifications', '4. Sync with parent/school account'],
    tabletInstructions: language === 'fr'
      ? ['1. Installer EDUCAFRIC depuis le Play Store/App Store', '2. Configurer le mode "Classe" pour usage partagé', '3. Définir les applications autorisées', '4. Activer le contrôle de présence automatique']
      : ['1. Install EDUCAFRIC from Play Store/App Store', '2. Configure "Class" mode for shared use', '3. Set allowed applications', '4. Enable automatic attendance control'],
    gpsTrackerInstructions: language === 'fr'
      ? ['1. Charger complètement l\'appareil avant premier usage', '2. Insérer la carte SIM fournie par l\'école', '3. Enregistrer l\'IMEI dans le système EDUCAFRIC', '4. Tester la localisation et les alertes d\'urgence']
      : ['1. Fully charge the device before first use', '2. Insert the SIM card provided by the school', '3. Register the IMEI in the EDUCAFRIC system', '4. Test location and emergency alerts']
  };

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
    queryFn: () => fetch('/api/devices', { credentials: 'include' }).then(res => res.json())
  });

  const { data: students = [] } = useQuery({
    queryKey: ['/api/director/students'],
    queryFn: () => fetch('/api/director/students', { credentials: 'include' }).then(res => res.json())
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      return apiRequest('POST', '/api/devices', deviceData);
    },
    onSuccess: () => {
      toast({
        title: t.deviceAdded,
        description: t.deviceAddedDesc,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.errorDesc,
        variant: "destructive",
      });
    }
  });

  const tabs = [
    { id: 'devices', label: t.devices, icon: <Smartphone className="w-4 h-4" /> },
    { id: 'setup', label: t.setup, icon: <Settings className="w-4 h-4" /> },
    { id: 'tracking', label: t.gpsTracking, icon: <MapPin className="w-4 h-4" /> },
    { id: 'network', label: t.connectivity, icon: <Wifi className="w-4 h-4" /> }
  ];

  const deviceTypes = [
    {
      type: 'smartwatch',
      name: t.smartwatch,
      icon: <Watch className="w-8 h-8 text-blue-500" />,
      description: t.smartwatchDesc,
      features: t.smartwatchFeatures
    },
    {
      type: 'smartphone',
      name: t.smartphone,
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      description: t.smartphoneDesc,
      features: t.smartphoneFeatures
    },
    {
      type: 'tablet',
      name: t.tablet,
      icon: <Tablet className="w-8 h-8 text-purple-500" />,
      description: t.tabletDesc,
      features: t.tabletFeatures
    },
    {
      type: 'gps_tracker',
      name: t.gpsTracker,
      icon: <MapPin className="w-8 h-8 text-red-500" />,
      description: t.gpsTrackerDesc,
      features: t.gpsTrackerFeatures
    }
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch': return <Watch className="w-6 h-6" />;
      case 'smartphone': return <Smartphone className="w-6 h-6" />;
      case 'tablet': return <Tablet className="w-6 h-6" />;
      case 'gps_tracker': return <MapPin className="w-6 h-6" />;
      default: return <Smartphone className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayDevices = Array.isArray(devices) ? devices : [];
  const displayStudents = Array.isArray(students) ? students : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.addDevice}
        </Button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'devices' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
              ))}
            </div>
          ) : displayDevices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">{t.noDevices}</h3>
              <p className="text-gray-500 mb-4">{t.noDevicesDesc}</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.addDevice}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayDevices.map((device) => (
                <ModernCard key={device.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{device.name || ''}</h3>
                          <p className="text-sm text-gray-600">{device.student}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(device.status)}>
                        {device.status === 'online' ? t.online : t.offline}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Battery className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{device.battery}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Signal className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{device.signal}/5</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">{t.lastPosition}</span> {device.location}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{t.lastActivity}</span> {device.lastSeen}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        {t.locate}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        {t.configure}
                      </Button>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.configGuide}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deviceTypes.map((deviceType) => (
                <div key={deviceType.type} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    {deviceType.icon}
                    <div>
                      <h4 className="font-medium">{deviceType.name || ''}</h4>
                      <p className="text-sm text-gray-600">{deviceType.description || ''}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">{t.features}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {deviceType.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setSelectedDeviceType(deviceType.type);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    {t.configure} {deviceType.name || ''}
                  </Button>
                </div>
              ))}
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.configInstructions}</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📱 {t.smartwatch} / {t.smartphone}</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  {t.smartwatchInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">📱 {t.tablet}</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  {t.tabletInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">🗺️ {t.gpsTracker}</h4>
                <ol className="text-sm text-purple-800 space-y-1">
                  {t.gpsTrackerInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.gpsSettings}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.locationFrequency}
                  </label>
                  <Select defaultValue="5min">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">{t.everyMinute}</SelectItem>
                      <SelectItem value="5min">{t.every5Min}</SelectItem>
                      <SelectItem value="15min">{t.every15Min}</SelectItem>
                      <SelectItem value="30min">{t.every30Min}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.defaultSafeZone}
                  </label>
                  <Input placeholder="Ex: School Name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.alertRadius}
                  </label>
                  <Input type="number" defaultValue="100" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{t.autoNotifications}</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{t.schoolEntry}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{t.schoolExit}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{t.safeZoneExit}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{t.lowBattery}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t.emergencyButton}</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{t.immediateParentAlert}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{t.schoolNotification}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{t.autoSecurityCall}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button>{t.saveConfig}</Button>
            </div>
          </ModernCard>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.connectivityStatus}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Wifi className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-green-900">{t.wifiSchool}</h4>
                <p className="text-sm text-green-700">{t.connected}</p>
                <p className="text-xs text-green-600 mt-1">{t.devicesConnected(15)}</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Signal className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900">{t.mobileNetwork}</h4>
                <p className="text-sm text-blue-700">4G/LTE {t.available}</p>
                <p className="text-xs text-blue-600 mt-1">{t.optimalCoverage}</p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-medium text-yellow-900">{t.gpsSatellites}</h4>
                <p className="text-sm text-yellow-700">{t.satellitesDetected(12)}</p>
                <p className="text-xs text-yellow-600 mt-1">{t.precision}</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.networkConfig}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.mainWifi}
                </label>
                <div className="flex space-x-2">
                  <Input placeholder="WiFi network name" defaultValue="EDUCAFRIC-School" />
                  <Button variant="outline">{t.test}</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.mobileProvider}
                </label>
                <Select defaultValue="orange">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange">Orange Cameroun</SelectItem>
                    <SelectItem value="mtn">MTN Cameroun</SelectItem>
                    <SelectItem value="camtel">Camtel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.geoServer}
                </label>
                <Input defaultValue="gps.educafric.com" />
              </div>

              <div className="flex justify-end">
                <Button>{t.updateConfig}</Button>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{t.addNewDevice}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.deviceTypeLabel}
              </label>
              <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectDeviceType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartwatch">{t.smartwatch}</SelectItem>
                  <SelectItem value="smartphone">{t.smartphone}</SelectItem>
                  <SelectItem value="tablet">{t.tablet}</SelectItem>
                  <SelectItem value="gps_tracker">{t.gpsTracker}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.deviceName}
              </label>
              <Input placeholder="Ex: Smartwatch Student Name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.assignedStudent}
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectStudent} />
                </SelectTrigger>
                <SelectContent>
                  {displayStudents.map((student: any) => (
                    <SelectItem key={student.id} value={student.id?.toString()}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.uniqueId}
              </label>
              <Input placeholder="Ex: 123456789012345" />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={() => addDeviceMutation.mutate({})}>
                {t.addDevice}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
