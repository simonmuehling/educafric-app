import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Settings, Smartphone, CheckCircle, Shield, AlertTriangle, Edit, TrendingUp, FileText, Navigation, User, Phone, Mail, Loader2, Target, RefreshCw, Eye } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  email: string;
  photo?: string;
  schoolId: number;
}

interface GeolocationFormData {
  name: string;
  description: string;
  address: string;
  radius: number;
  latitude: string;
  longitude: string;
  schedule: string | null;
}

interface DeviceFormData {
  deviceName: string;
  deviceType: string;
  studentId: number;
  emergencyContact: string;
  deviceId: string;
  updateInterval?: number;
}

const GeolocationManagementImproved: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Form states
  const [zoneForm, setZoneForm] = useState<GeolocationFormData>({
    name: '',
    description: '',
    address: '',
    radius: 100,
    latitude: '',
    longitude: '',
    schedule: null
  });
  
  const [deviceForm, setDeviceForm] = useState<DeviceFormData>({
    deviceName: '',
    deviceType: 'smartphone',
    studentId: 0,
    emergencyContact: '',
    deviceId: '',
    updateInterval: 30
  });

  // Fetch students list for device assignment
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['/api/students/school-list'],
    queryFn: async () => {
      const response = await fetch('/api/students/school-list');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  });

  const text = {
    fr: {
      title: 'Gestion Géolocalisation Améliorée',
      subtitle: 'Suivi des appareils et zones sécurisées avec aide interactive',
      totalDevices: 'Appareils Totaux',
      activeDevices: 'Appareils Actifs',
      safeZones: 'Zones Sécurisées',
      activeAlerts: 'Alertes Actives',
      deviceName: 'Nom Appareil',
      studentName: 'Élève',
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
      zoneAdded: 'Zone ajoutée avec succès!',
      zonesConfigured: 'Zones configurées!',
      // Zone form
      zoneName: 'Nom de la zone',
      zoneDescription: 'Description',
      zoneAddress: 'Adresse',
      zoneRadius: 'Rayon (mètres)',
      zoneLatitude: 'Latitude',
      zoneLongitude: 'Longitude',
      getMyLocation: 'Utiliser ma position',
      gettingLocation: 'Localisation en cours...',
      locationError: 'Erreur de géolocalisation',
      locationSuccess: 'Position obtenue avec succès!',
      // Device form
      selectStudent: 'Sélectionner un élève',
      deviceId: 'ID de l\'appareil',
      emergencyContact: 'Contact d\'urgence',
      studentInfo: 'Informations élève',
      parentInfo: 'Informations parent',
      noStudentsFound: 'Aucun élève trouvé',
      loadingStudents: 'Chargement des élèves...',
      cancel: 'Annuler',
      save: 'Enregistrer'
    },
    en: {
      title: 'Enhanced Geolocation Management',
      subtitle: 'Device tracking and safe zones with interactive assistance',
      totalDevices: 'Total Devices',
      activeDevices: 'Active Devices',
      safeZones: 'Safe Zones',
      activeAlerts: 'Active Alerts',
      deviceName: 'Device Name',
      studentName: 'Student',
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
      zoneAdded: 'Zone added successfully!',
      zonesConfigured: 'Zones configured!',
      // Zone form
      zoneName: 'Zone Name',
      zoneDescription: 'Description',
      zoneAddress: 'Address',
      zoneRadius: 'Radius (meters)',
      zoneLatitude: 'Latitude',
      zoneLongitude: 'Longitude',
      getMyLocation: 'Use My Location',
      gettingLocation: 'Getting location...',
      locationError: 'Geolocation error',
      locationSuccess: 'Location obtained successfully!',
      // Device form
      selectStudent: 'Select Student',
      deviceId: 'Device ID',
      emergencyContact: 'Emergency Contact',
      studentInfo: 'Student Information',
      parentInfo: 'Parent Information',
      noStudentsFound: 'No students found',
      loadingStudents: 'Loading students...',
      cancel: 'Cancel',
      save: 'Save'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock data for demonstration - existing devices
  const devices = [
    {
      id: 1,
      name: 'iPhone Junior Kamga',
      studentName: 'Junior Kamga',
      type: 'smartphone',
      status: 'active',
      lastSeen: 'École Excellence - il y a 5 min',
      battery: '85%',
      location: { lat: 3.8667, lng: 11.5167 }
    },
    {
      id: 2,
      name: 'Apple Watch Marie',
      studentName: 'Marie Nkomo',
      type: 'smartwatch',
      status: 'active',
      lastSeen: 'Domicile - il y a 2h',
      battery: '42%',
      location: { lat: 3.8480, lng: 11.5021 }
    },
    {
      id: 3,
      name: 'Tablette Paul',
      studentName: 'Paul Essomba',
      type: 'tablet',
      status: 'inactive',
      lastSeen: 'Hors ligne depuis 1 jour',
      battery: '0%',
      location: null
    }
  ];

  // Get user's current location for zone creation
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: t.locationError,
        description: language === 'fr' ? 'Géolocalisation non supportée par le navigateur' : 'Geolocation not supported by browser',
        variant: 'destructive'
      });
      return;
    }

    setIsGettingLocation(true);
    
    navigator?.geolocation?.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setZoneForm(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        
        setIsGettingLocation(false);
        toast({
          title: t.locationSuccess,
          description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: t.locationError,
          description: error.message,
          variant: 'destructive'
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // GPS Configuration Based on Device Type
  const generateDeviceConfig = (deviceType: string, deviceData: DeviceFormData) => {
    const baseConfig = {
      deviceType,
      childId: `student_${deviceData.studentId}`,
      deviceName: deviceData.deviceName,
      deviceId: deviceData.deviceId,
      apiEndpoint: "https://api?.educonnect?.africa/tracking",
      updateInterval: deviceData.updateInterval || 30,
      emergencyContact: deviceData.emergencyContact || "+237657004011"
    };

    switch (deviceType) {
      case 'smartwatch':
        return {
          ...baseConfig,
          networkSettings: {
            server: "api?.educonnect?.africa",
            port: 443,
            protocol: "REST API",
            updateInterval: deviceData.updateInterval || 30,
            connection: "4G/WiFi/3G"
          },
          qrCodeExpiry: "24h",
          supportedModels: ["Xplora X5/X6 Play", "TickTalk 4/5", "Garmin Bounce"]
        };
      
      case 'gps_tracker':
        return {
          ...baseConfig,
          serverConfig: {
            server: "gps?.educonnect?.africa",
            port: 8080,
            protocol: "TCP",
            apn: "internet",
            smsCommands: [
              "CONFIG#gps?.educonnect?.africa#8080#",
              `TIMER#${deviceData.updateInterval || 30}#`,
              `SOS#${deviceData.emergencyContact}#`,
              "APN#internet##"
            ]
          },
          carrierSettings: {
            mtn: { apn: "internet", username: "", password: "" },
            orange: { apn: "orange.cm", username: "orange", password: "orange" },
            camtel: { apn: "camtel", username: "", password: "" }
          }
        };
      
      case 'tablet':
        return {
          ...baseConfig,
          pwaConfig: {
            installUrl: "https://educonnect.africa/pwa",
            mode: "enfant",
            permissions: ["location_always", "notifications", "background_sync"]
          }
        };
      
      case 'smartphone':
        return {
          ...baseConfig,
          appConfig: {
            downloadUrl: "https://educonnect.africa/mobile",
            setupMode: "parent_child",
            features: ["realtime_tracking", "geofences", "emergency_alerts"]
          }
        };
      
      default:
        return baseConfig;
    }
  };

  // Generate QR Code for Device Setup
  const generateQRCode = async (deviceConfig: any) => {
    try {
      const setupToken = `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const qrData = {
        ...deviceConfig,
        setupToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        apiBase: "https://api?.educonnect?.africa"
      };
      
      console.log('[GPS_CONFIG] Generated QR setup data:', qrData);
      return {
        qrCode: `data:image/svg+xml;base64,${btoa(`<svg>QR_CODE_FOR_${deviceConfig?.deviceType?.toUpperCase()}</svg>`)}`,
        setupData: qrData
      };
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return null;
    }
  };

  // Test Device Connection
  const testDeviceConnection = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/geolocation/devices/${deviceId}/test`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Test de connexion réussi!' : 'Connection test successful!',
          description: language === 'fr' ? 'L\'appareil répond correctement' : 'Device is responding correctly'
        });
      } else {
        toast({
          title: language === 'fr' ? 'Test de connexion échoué' : 'Connection test failed',
          description: language === 'fr' ? 'Vérifiez la configuration de l\'appareil' : 'Please check device configuration',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de test' : 'Test error',
        description: language === 'fr' ? 'Impossible de tester la connexion' : 'Unable to test connection',
        variant: 'destructive'
      });
    }
  };

  const handleAddDevice = async () => {
    if (!deviceForm.studentId || !deviceForm.deviceName || !deviceForm.deviceId) {
      toast({
        title: 'Erreur',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate device configuration based on type
      const deviceConfig = generateDeviceConfig(deviceForm.deviceType, deviceForm);
      console.log('[GPS_CONFIG] Device configuration generated:', deviceConfig);

      // Generate QR code for smartwatch setup
      if (deviceForm.deviceType === 'smartwatch') {
        const qrResult = await generateQRCode(deviceConfig);
        if (qrResult) {
          console.log('[QR_CODE] Generated for smartwatch setup');
        }
      }

      // Make API call to register device
      const response = await fetch('/api/geolocation/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...deviceForm,
          config: deviceConfig
        })
      });

      if (response.ok) {
        // Find selected student info
        const selectedStudent = students.find((s: Student) => s.id === deviceForm.studentId);
        
        toast({
          title: t.deviceAdded,
          description: `${deviceForm.deviceName} → ${selectedStudent?.fullName} (${selectedStudent?.className})`
        });
        
        // Reset form and close modal
        setShowAddDeviceModal(false);
        setDeviceForm({
          deviceName: '',
          deviceType: 'smartphone',
          studentId: 0,
          emergencyContact: '',
          deviceId: '',
          updateInterval: 30
        });
      } else {
        toast({
          title: language === 'fr' ? 'Erreur d\'enregistrement' : 'Registration error',
          description: language === 'fr' ? 'Impossible d\'enregistrer l\'appareil' : 'Failed to register device',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[DEVICE_ADD] Error:', error);
      toast({
        title: language === 'fr' ? 'Erreur système' : 'System error',
        description: language === 'fr' ? 'Une erreur s\'est produite' : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleAddZone = async () => {
    if (!zoneForm.name || !zoneForm.latitude || !zoneForm.longitude) {
      toast({
        title: 'Erreur',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: t.zoneAdded,
      description: `${zoneForm.name || ''} - Rayon: ${zoneForm.radius}m`
    });
    
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
  };

  const handleViewLocation = (device: any) => {
    toast({
      title: language === 'fr' ? 'Position GPS' : 'GPS Location',
      description: `${device.studentName}: ${device.lastSeen}`
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return '📱';
      case 'smartwatch': return '⌚';
      case 'tablet': return '📟';
      default: return '📱';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-700">{t.active}</Badge> :
      <Badge className="bg-gray-100 text-gray-700">{t.inactive}</Badge>;
  };

  // Handle student selection in device form
  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s: Student) => s.id === parseInt(studentId));
    setDeviceForm(prev => ({
      ...prev,
      studentId: parseInt(studentId),
      emergencyContact: student?.parentPhone || ''
    }));
  };

  const selectedStudent = students.find((s: Student) => s.id === deviceForm.studentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                {t.title || ''}
              </h2>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowAddDeviceModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addDevice}
              </Button>
              <Button 
                onClick={() => setShowAddZoneModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                {t.addZone}
              </Button>
              <Button 
                onClick={() => {
                  toast({ 
                    title: t.zonesConfigured,
                    description: language === 'fr' ? 'Interface de configuration des zones sécurisées' : 'Safe zone configuration interface'
                  });
                }} 
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.configureZones}
              </Button>
              
              {/* Quick Actions for GPS Management */}
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/geolocation/overview', { credentials: 'include' });
                    if (response.ok) {
                      const data = await response.json();
                      toast({
                        title: language === 'fr' ? 'Synchronisation réussie' : 'Sync successful',
                        description: language === 'fr' ? `${data.totalDevices || 0} appareils actifs` : `${data.totalDevices || 0} active devices`
                      });
                    }
                  } catch (error) {
                    toast({
                      title: language === 'fr' ? 'Erreur de synchronisation' : 'Sync error',
                      variant: 'destructive'
                    });
                  }
                }}
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Synchroniser' : 'Sync'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">12</p>
                <p className="text-gray-600 text-sm">{t.totalDevices}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">9</p>
                <p className="text-gray-600 text-sm">{t.activeDevices}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">5</p>
                <p className="text-gray-600 text-sm">{t.safeZones}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">3</p>
                <p className="text-gray-600 text-sm">{t.activeAlerts}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Devices List */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {language === 'fr' ? 'Appareils Connectés' : 'Connected Devices'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t.deviceName}</th>
                    <th className="text-left p-3">{t.studentName}</th>
                    <th className="text-left p-3">{t.deviceType}</th>
                    <th className="text-left p-3">{t.status}</th>
                    <th className="text-left p-3">{t.lastSeen}</th>
                    <th className="text-left p-3">{t.battery}</th>
                    <th className="text-left p-3">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(devices) ? devices : []).map((device) => (
                    <tr key={device.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getDeviceIcon(device.type)}</span>
                          {device.name || ''}
                        </div>
                      </td>
                      <td className="p-3">{device.studentName}</td>
                      <td className="p-3">{t[device.type as keyof typeof t] as string}</td>
                      <td className="p-3">{getStatusBadge(device.status)}</td>
                      <td className="p-3">{device.lastSeen}</td>
                      <td className="p-3">{device.battery}</td>
                      <td className="p-3">
                        <MobileActionsOverlay
                          title={`${device.name || ''} Actions`}
                          actions={[
                            {
                              id: `view-location-${device.id}`,
                              label: t.viewLocation,
                              onClick: () => handleViewLocation(device),
                              icon: <Eye className="w-4 h-4" />,
                              color: 'blue'
                            },
                            {
                              id: `test-connection-${device.id}`,
                              label: language === 'fr' ? 'Test Connexion' : 'Test Connection',
                              onClick: () => testDeviceConnection(device?.id?.toString()),
                              icon: <RefreshCw className="w-4 h-4" />,
                              color: 'green'
                            },
                            {
                              id: `edit-device-${device.id}`,
                              label: language === 'fr' ? 'Modifier' : 'Edit',
                              onClick: () => setSelectedDevice(device),
                              icon: <Edit className="w-4 h-4" />,
                              color: 'gray'
                            },
                            {
                              id: `gps-config-${device.id}`,
                              label: language === 'fr' ? 'Config GPS' : 'GPS Config',
                              onClick: () => {
                                const config = generateDeviceConfig(device.type, {
                                  deviceName: device.name,
                                  deviceType: device.type,
                                  studentId: device.id,
                                  emergencyContact: '',
                                  deviceId: device?.id?.toString(),
                                  updateInterval: 30
                                });
                                console.log('[GPS_CONFIG] Device configuration:', config);
                                toast({
                                  title: language === 'fr' ? 'Configuration GPS' : 'GPS Configuration',
                                  description: language === 'fr' ? 'Configuration générée avec succès' : 'Configuration generated successfully'
                                });
                              },
                              icon: <Settings className="w-4 h-4" />,
                              color: 'purple'
                            }
                          ]}
                          maxVisibleButtons={3}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {(Array.isArray(devices) ? devices.length : 0) === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📱</div>
                  <p className="text-lg font-medium mb-2">
                    {language === 'fr' ? 'Aucun appareil configuré' : 'No devices configured'}
                  </p>
                  <p className="text-sm">
                    {language === 'fr' 
                      ? 'Ajoutez votre premier appareil GPS pour commencer le suivi' 
                      : 'Add your first GPS device to start tracking'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Device Modal */}
        {showAddDeviceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
              <CardHeader className="bg-white border-b border-gray-200 flex-shrink-0">
                <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  {t.addDevice}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {language === 'fr' 
                    ? 'Configurez un nouveau dispositif de géolocalisation pour surveiller la sécurité des élèves' 
                    : 'Configure a new GPS tracking device to monitor student safety'
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-6 bg-white overflow-y-auto flex-1 p-6">
                {/* Device Type Selection with Visual Cards */}
                <div>
                  <Label className="text-base font-semibold">{t.deviceType} *</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'fr' ? 'Sélectionnez le type d\'appareil GPS à configurer' : 'Select the GPS device type to configure'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { type: 'smartwatch', icon: '⌚', name: language === 'fr' ? 'Montre GPS' : 'GPS Watch', desc: language === 'fr' ? 'Xplora, TickTalk, Garmin' : 'Xplora, TickTalk, Garmin' },
                      { type: 'smartphone', icon: '📱', name: language === 'fr' ? 'Smartphone' : 'Smartphone', desc: language === 'fr' ? 'iPhone, Android' : 'iPhone, Android' },
                      { type: 'tablet', icon: '📱', name: language === 'fr' ? 'Tablette GPS' : 'GPS Tablet', desc: language === 'fr' ? 'iPad, Samsung' : 'iPad, Samsung' },
                      { type: 'gps_tracker', icon: '🛰️', name: language === 'fr' ? 'Traceur GPS' : 'GPS Tracker', desc: language === 'fr' ? 'GT06N, TK102' : 'GT06N, TK102' }
                    ].map((device) => (
                      <div
                        key={device.type}
                        onClick={() => setDeviceForm(prev => ({ ...prev, deviceType: device.type }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          deviceForm.deviceType === device.type 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{device.icon}</div>
                        <h4 className="font-semibold text-sm">{device.name || ''}</h4>
                        <p className="text-xs text-gray-500">{device.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="deviceName">{t.deviceName} *</Label>
                  <Input
                    id="deviceName"
                    value={deviceForm.deviceName}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, deviceName: e?.target?.value }))}
                    placeholder={language === 'fr' ? 'Ex: iPhone de Marie' : 'Ex: Marie\'s iPhone'}
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="studentSelect">{t.selectStudent} *</Label>
                  {studentsLoading ? (
                    <div className="flex items-center gap-2 p-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.loadingStudents}
                    </div>
                  ) : studentsError ? (
                    <p className="text-red-500 text-sm">{t.noStudentsFound}</p>
                  ) : (
                    <Select value={deviceForm?.studentId?.toString()} onValueChange={handleStudentSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectStudent} />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(students) ? students : []).map((student: Student) => (
                          <SelectItem key={student.id} value={student?.id?.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {student.fullName} - {student.className}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Student Information Display */}
                {selectedStudent && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      {t.studentInfo}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>{language === 'fr' ? 'Nom' : 'Name'}:</strong> {selectedStudent.fullName}</p>
                      <p><strong>{language === 'fr' ? 'Classe' : 'Class'}:</strong> {selectedStudent.className}</p>
                      <p><strong>Email:</strong> {selectedStudent.email || ''}</p>
                    </div>
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mt-3 mb-2">
                      <Phone className="w-4 h-4" />
                      {t.parentInfo}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>{language === 'fr' ? 'Parent' : 'Parent'}:</strong> {selectedStudent.parentName}</p>
                      <p><strong>{language === 'fr' ? 'Téléphone' : 'Phone'}:</strong> {selectedStudent.parentPhone}</p>
                    </div>
                  </Card>
                )}

                {/* GPS Configuration Section */}
                <Card className="p-4 bg-gray-50 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    {language === 'fr' ? 'Configuration GPS' : 'GPS Configuration'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deviceId">{t.deviceId} *</Label>
                      <Input
                        id="deviceId"
                        value={deviceForm.deviceId}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, deviceId: e?.target?.value }))}
                        placeholder={deviceForm.deviceType === 'gps_tracker' ? 'IMEI: 123456789012345' : 'Serial Number / IMEI'}
                        className="bg-white"
                      />
                      {deviceForm.deviceType === 'gps_tracker' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'fr' ? 'Numéro IMEI du traceur GPS (15 chiffres)' : 'GPS tracker IMEI number (15 digits)'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="updateInterval">{language === 'fr' ? 'Intervalle de mise à jour' : 'Update Interval'}</Label>
                      <Select 
                        value={deviceForm.updateInterval?.toString() || '30'} 
                        onValueChange={(value) => setDeviceForm(prev => ({ ...prev, updateInterval: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 {language === 'fr' ? 'secondes' : 'seconds'}</SelectItem>
                          <SelectItem value="30">30 {language === 'fr' ? 'secondes' : 'seconds'}</SelectItem>
                          <SelectItem value="60">1 {language === 'fr' ? 'minute' : 'minute'}</SelectItem>
                          <SelectItem value="300">5 {language === 'fr' ? 'minutes' : 'minutes'}</SelectItem>
                          <SelectItem value="600">10 {language === 'fr' ? 'minutes' : 'minutes'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Device-Specific Configuration Preview */}
                  {deviceForm.deviceType && deviceForm.deviceName && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {language === 'fr' ? 'Configuration Auto-générée' : 'Auto-Generated Configuration'}
                      </h5>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>{language === 'fr' ? 'Type:' : 'Type:'}</strong> {deviceForm.deviceType}</p>
                        <p><strong>{language === 'fr' ? 'Serveur:' : 'Server:'}</strong> 
                          {deviceForm.deviceType === 'smartwatch' ? ' api?.educonnect?.africa:443 (HTTPS)' : 
                           deviceForm.deviceType === 'gps_tracker' ? ' gps?.educonnect?.africa:8080 (TCP)' : 
                           ' educonnect.africa (Mobile App)'}
                        </p>
                        <p><strong>{language === 'fr' ? 'Intervalle:' : 'Interval:'}</strong> {deviceForm.updateInterval || 30}s</p>
                        {deviceForm.emergencyContact && (
                          <p><strong>{language === 'fr' ? 'Urgence:' : 'Emergency:'}</strong> {deviceForm.emergencyContact}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Network Configuration for GPS Trackers */}
                  {deviceForm.deviceType === 'gps_tracker' && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        {language === 'fr' ? 'Configuration Réseau Cameroun' : 'Cameroon Network Configuration'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <strong>MTN:</strong> APN: internet<br/>
                          <strong>Orange:</strong> APN: orange.cm<br/>
                          <strong>Camtel:</strong> APN: camtel
                        </div>
                        <div>
                          <strong>Server:</strong> gps?.educonnect?.africa<br/>
                          <strong>Port:</strong> 8080 (TCP)<br/>
                          <strong>Interval:</strong> 30s
                        </div>
                        <div>
                          <strong>SMS Config:</strong><br/>
                          CONFIG#gps?.educonnect?.africa#8080#<br/>
                          TIMER#30#
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <div>
                  <Label htmlFor="emergencyContact">{t.emergencyContact}</Label>
                  <Input
                    id="emergencyContact"
                    value={deviceForm.emergencyContact}
                    onChange={(e) => setDeviceForm(prev => ({ ...prev, emergencyContact: e?.target?.value }))}
                    placeholder="+237 6XX XXX XXX"
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'fr' 
                      ? 'Numéro d\'urgence pour alertes SOS (optionnel)' 
                      : 'Emergency number for SOS alerts (optional)'
                    }
                  </p>
                </div>

                {/* QR Code Generation for Device Setup */}
                {deviceForm.deviceType === 'smartwatch' && (
                  <Card className="p-4 bg-yellow-50 border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      </div>
                      {language === 'fr' ? 'Configuration Montre GPS' : 'GPS Watch Setup'}
                    </h5>
                    <p className="text-sm text-yellow-700 mb-3">
                      {language === 'fr' 
                        ? 'Un QR Code sera généré pour la configuration de la montre (expire en 24h)'
                        : 'A QR code will be generated for watch configuration (expires in 24h)'
                      }
                    </p>
                    <div className="text-xs text-yellow-600">
                      <strong>{language === 'fr' ? 'Modèles supportés:' : 'Supported models:'}</strong><br/>
                      Xplora X5/X6 Play, TickTalk 4/5, Garmin Bounce
                    </div>
                  </Card>
                )}

              </CardContent>
              <div className="flex gap-2 p-6 pt-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDeviceModal(false)} 
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button 
                  onClick={handleAddDevice} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!deviceForm.deviceName || !deviceForm.deviceId || deviceForm.studentId === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Add Zone Modal */}
        {showAddZoneModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white max-h-[90vh] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t.addZone}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto flex-1">
                <div>
                  <Label htmlFor="zoneName">{t.zoneName} *</Label>
                  <Input
                    id="zoneName"
                    value={zoneForm.name || ''}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, name: e?.target?.value }))}
                    placeholder={language === 'fr' ? 'Ex: École, Maison, Bibliothèque' : 'Ex: School, Home, Library'}
                  />
                </div>

                <div>
                  <Label htmlFor="zoneDescription">{t.zoneDescription}</Label>
                  <Textarea
                    id="zoneDescription"
                    value={zoneForm.description || ''}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, description: e?.target?.value }))}
                    placeholder={language === 'fr' ? 'Description de la zone sécurisée' : 'Safe zone description'}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="zoneAddress">{t.zoneAddress}</Label>
                  <Input
                    id="zoneAddress"
                    value={zoneForm.address}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, address: e?.target?.value }))}
                    placeholder={language === 'fr' ? 'Adresse complète' : 'Full address'}
                  />
                </div>

                <div>
                  <Label htmlFor="zoneRadius">{t.zoneRadius}</Label>
                  <Input
                    id="zoneRadius"
                    type="number"
                    value={zoneForm.radius}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, radius: parseInt(e?.target?.value) || 100 }))}
                    min="10"
                    max="1000"
                  />
                </div>

                {/* GPS Coordinates with Auto-detect */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">{t.zoneLatitude} *</Label>
                    <Input
                      id="latitude"
                      value={zoneForm.latitude}
                      onChange={(e) => setZoneForm(prev => ({ ...prev, latitude: e?.target?.value }))}
                      placeholder="3.8667"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">{t.zoneLongitude} *</Label>
                    <Input
                      id="longitude"
                      value={zoneForm.longitude}
                      onChange={(e) => setZoneForm(prev => ({ ...prev, longitude: e?.target?.value }))}
                      placeholder="11.5167"
                    />
                  </div>
                </div>

                {/* Auto-location button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.gettingLocation}
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      {t.getMyLocation}
                    </>
                  )}
                </Button>

              </CardContent>
              <div className="flex gap-2 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
                <Button variant="outline" onClick={() => setShowAddZoneModal(false)} className="flex-1">
                  {t.cancel}
                </Button>
                <Button onClick={handleAddZone} className="flex-1 bg-green-600 hover:bg-green-700">
                  {t.save}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeolocationManagementImproved;