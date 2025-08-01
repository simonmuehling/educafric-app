import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Smartphone, Watch, Tablet, MapPin, Wifi, Battery, Signal, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function DeviceConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('devices');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  const { data: devices } = useQuery({
    queryKey: ['/api/devices'],
    queryFn: () => fetch('/api/devices', { credentials: 'include' }).then(res => res.json())
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      return apiRequest('POST', '/api/devices', deviceData);
    },
    onSuccess: () => {
      toast({
        title: "Appareil ajouté",
        description: "L'appareil a été configuré avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'appareil",
        variant: "destructive",
      });
    }
  });

  const tabs = [
    { id: 'devices', label: 'Appareils', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'setup', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
    { id: 'tracking', label: 'Suivi GPS', icon: <MapPin className="w-4 h-4" /> },
    { id: 'network', label: 'Connectivité', icon: <Wifi className="w-4 h-4" /> }
  ];

  const deviceTypes = [
    {
      type: 'smartwatch',
      name: 'Smartwatch',
      icon: <Watch className="w-8 h-8 text-blue-500" />,
      description: 'Montre connectée pour élèves',
      features: ['GPS intégré', 'Appel d\'urgence', 'Géofencing', 'Suivi activité']
    },
    {
      type: 'smartphone',
      name: 'Smartphone',
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      description: 'Téléphone intelligent des élèves',
      features: ['Localisation précise', 'Communication', 'Applications éducatives', 'Contrôle parental']
    },
    {
      type: 'tablet',
      name: 'Tablette',
      icon: <Tablet className="w-8 h-8 text-purple-500" />,
      description: 'Tablette pour usage scolaire',
      features: ['Grand écran', 'Applications éducatives', 'Partage d\'écran', 'Mode classe']
    },
    {
      type: 'gps_tracker',
      name: 'Traceur GPS',
      icon: <MapPin className="w-8 h-8 text-red-500" />,
      description: 'Dispositif GPS dédié',
      features: ['Longue autonomie', 'Résistant à l\'eau', 'Bouton SOS', 'Historique de trajets']
    }
  ];

  const mockDevices = [
    {
      id: 1,
      name: 'Smartwatch Junior Kamga',
      type: 'smartwatch',
      student: 'Junior Kamga',
      status: 'online',
      battery: 85,
      signal: 4,
      lastSeen: '2025-01-26 15:45',
      location: 'École Excellence Yaoundé'
    },
    {
      id: 2,
      name: 'Tablette Terminal C',
      type: 'tablet',
      student: 'Salle Terminal C',
      status: 'online',
      battery: 92,
      signal: 5,
      lastSeen: '2025-01-26 15:50',
      location: 'Salle 12'
    },
    {
      id: 3,
      name: 'GPS Tracker Sophie',
      type: 'gps_tracker',
      student: 'Sophie Nkomo',
      status: 'offline',
      battery: 23,
      signal: 2,
      lastSeen: '2025-01-26 14:30',
      location: 'En route vers école'
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ajouter Appareil</h2>
          <p className="text-gray-600">Configuration des appareils connectés pour le suivi des élèves</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Appareil
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => (
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

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {(Array.isArray(mockDevices) ? mockDevices : []).map((device) => (
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
                      {device.status === 'online' ? 'En ligne' : 'Hors ligne'}
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
                      <span className="font-medium">Dernière position:</span> {device.location}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Dernière activité:</span> {device.lastSeen}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Localiser
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Configurer
                    </Button>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      )}

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Guide de Configuration des Appareils</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Array.isArray(deviceTypes) ? deviceTypes : []).map((deviceType) => (
                <div key={deviceType.type} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    {deviceType.icon}
                    <div>
                      <h4 className="font-medium">{deviceType.name || ''}</h4>
                      <p className="text-sm text-gray-600">{deviceType.description || ''}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Fonctionnalités:</p>
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
                    Configurer {deviceType.name || ''}
                  </Button>
                </div>
              ))}
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Instructions de Configuration</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📱 Smartwatch / Smartphone</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Télécharger l'application EDUCAFRIC sur l'appareil</li>
                  <li>2. Créer un compte avec l'email de l'élève</li>
                  <li>3. Activer la géolocalisation et les notifications</li>
                  <li>4. Synchroniser avec le compte parent/école</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">📱 Tablette</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  <li>1. Installer EDUCAFRIC depuis le Play Store/App Store</li>
                  <li>2. Configurer le mode "Classe" pour usage partagé</li>
                  <li>3. Définir les applications autorisées</li>
                  <li>4. Activer le contrôle de présence automatique</li>
                </ol>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">🗺️ Traceur GPS</h4>
                <ol className="text-sm text-purple-800 space-y-1">
                  <li>1. Charger complètement l'appareil avant premier usage</li>
                  <li>2. Insérer la carte SIM fournie par l'école</li>
                  <li>3. Enregistrer l'IMEI dans le système EDUCAFRIC</li>
                  <li>4. Tester la localisation et les alertes d'urgence</li>
                </ol>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Paramètres de Suivi GPS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence de localisation
                  </label>
                  <Select defaultValue="5min">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">Toutes les minutes</SelectItem>
                      <SelectItem value="5min">Toutes les 5 minutes</SelectItem>
                      <SelectItem value="15min">Toutes les 15 minutes</SelectItem>
                      <SelectItem value="30min">Toutes les 30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone de sécurité par défaut
                  </label>
                  <Input placeholder="Ex: École Excellence Yaoundé" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rayon d'alerte (mètres)
                  </label>
                  <Input type="number" defaultValue="100" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Notifications automatiques</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Entrée dans l'école</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Sortie de l'école</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Sortie de zone sécurisée</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Batterie faible (&lt;20%)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Bouton d'urgence</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Alerte parents immédiate</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Notification école</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Appel automatique sécurité</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button>Sauvegarder Configuration</Button>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">État de la Connectivité</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Wifi className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-green-900">WiFi École</h4>
                <p className="text-sm text-green-700">Connecté - Signal fort</p>
                <p className="text-xs text-green-600 mt-1">15 appareils connectés</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Signal className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900">Réseau Mobile</h4>
                <p className="text-sm text-blue-700">4G/LTE Disponible</p>
                <p className="text-xs text-blue-600 mt-1">Couverture optimale</p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-medium text-yellow-900">GPS Satellites</h4>
                <p className="text-sm text-yellow-700">12 satellites détectés</p>
                <p className="text-xs text-yellow-600 mt-1">Précision: ±3 mètres</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Réseau</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réseau WiFi principal
                </label>
                <div className="flex space-x-2">
                  <Input placeholder="Nom du réseau WiFi" defaultValue="EDUCAFRIC-School" />
                  <Button variant="outline">Tester</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fournisseur de données mobiles
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
                  Serveur de géolocalisation
                </label>
                <Input defaultValue="gps?.educafric?.com" />
              </div>

              <div className="flex justify-end">
                <Button>Mettre à Jour Configuration</Button>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Ajouter un Nouvel Appareil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'appareil
              </label>
              <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type d'appareil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartwatch">Smartwatch</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablette</SelectItem>
                  <SelectItem value="gps_tracker">Traceur GPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'appareil
              </label>
              <Input placeholder="Ex: Smartwatch Junior Kamga" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Élève assigné
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un élève" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior-kamga">Junior Kamga</SelectItem>
                  <SelectItem value="sophie-nkomo">Sophie Nkomo</SelectItem>
                  <SelectItem value="paul-essomba">Paul Essomba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant unique (IMEI/MAC)
              </label>
              <Input placeholder="Ex: 123456789012345" />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => addDeviceMutation.mutate({})}>
                Ajouter Appareil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}