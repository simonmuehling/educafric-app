import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Settings, Smartphone, CheckCircle, Shield, AlertTriangle, Edit, TrendingUp, FileText } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';

const GeolocationManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);

  const text = {
    fr: {
      title: 'Gestion Géolocalisation',
      subtitle: 'Suivi des appareils et zones sécurisées',
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
      viewLocation: 'Voir Position',
      configureZones: 'Config. Zones',
      active: 'Actif',
      inactive: 'Inactif',
      smartphone: 'Smartphone',
      smartwatch: 'Smartwatch',
      tablet: 'Tablette',
      deviceAdded: 'Appareil ajouté avec succès!',
      zonesConfigured: 'Zones configurées!'
    },
    en: {
      title: 'Geolocation Management',
      subtitle: 'Device tracking and safe zones management',
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
      viewLocation: 'View Location',
      configureZones: 'Configure Zones',
      active: 'Active',
      inactive: 'Inactive',
      smartphone: 'Smartphone',
      smartwatch: 'Smartwatch',
      tablet: 'Tablet',
      deviceAdded: 'Device added successfully!',
      zonesConfigured: 'Zones configured!'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock data for demonstration
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

  const handleAddDevice = () => {
    toast({
      title: t.deviceAdded,
      description: language === 'fr' ? 'Le nouvel appareil a été ajouté au système de suivi.' : 'New device has been added to tracking system.'
    });
    setShowAddDeviceModal(false);
  };

  const handleViewLocation = (device: any) => {
    toast({
      title: language === 'fr' ? 'Position GPS' : 'GPS Location',
      description: `${device.studentName}: ${device.lastSeen}`
    });
  };

  const handleConfigureZones = () => {
    toast({
      title: t.zonesConfigured,
      description: language === 'fr' ? 'Zones sécurisées mises à jour pour tous les élèves.' : 'Safe zones updated for all students.'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case 'smartphone': return '📱';
      case 'smartwatch': return '⌚';
      case 'tablet': return '📺';
      default: return '📱';
    }
  };

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
            <div className="flex gap-2">
              <Button 
                onClick={handleAddDevice}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addDevice}
              </Button>
              <Button 
                variant="outline"
                onClick={handleConfigureZones}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t.configureZones}
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.totalDevices}</p>
                <p className="text-2xl font-bold">{(Array.isArray(devices) ? devices.length : 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.activeDevices}</p>
                <p className="text-2xl font-bold">{(Array.isArray(devices) ? devices : []).filter(d => d.status === 'active').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.safeZones}</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.activeAlerts}</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MobileActionsOverlay
              title={language === 'fr' ? 'Actions Géolocalisation' : 'Geolocation Actions'}
              maxVisibleButtons={3}
              actions={[
                {
                  id: 'add-device',
                  label: language === 'fr' ? 'Ajouter Appareil' : 'Add Device',
                  icon: <Plus className="w-5 h-5" />,
                  onClick: () => setShowAddDeviceModal(true),
                  color: 'bg-blue-600 hover:bg-blue-700'
                },
                {
                  id: 'configure-zones',
                  label: language === 'fr' ? 'Config. Zones' : 'Configure Zones',
                  icon: <Shield className="w-5 h-5" />,
                  onClick: handleConfigureZones,
                  color: 'bg-green-600 hover:bg-green-700'
                },
                {
                  id: 'view-all-locations',
                  label: language === 'fr' ? 'Voir Positions' : 'View Locations',
                  icon: <MapPin className="w-5 h-5" />,
                  onClick: () => toast({ title: language === 'fr' ? 'Carte générale des positions' : 'General location map' }),
                  color: 'bg-purple-600 hover:bg-purple-700'
                },
                {
                  id: 'emergency-alert',
                  label: language === 'fr' ? 'Alerte Urgence' : 'Emergency Alert',
                  icon: <AlertTriangle className="w-5 h-5" />,
                  onClick: () => toast({ title: language === 'fr' ? 'Système d\'alerte d\'urgence activé' : 'Emergency alert system activated' }),
                  color: 'bg-red-600 hover:bg-red-700'
                },
                {
                  id: 'generate-report',
                  label: language === 'fr' ? 'Rapport Activité' : 'Activity Report',
                  icon: <FileText className="w-5 h-5" />,
                  onClick: () => toast({ title: language === 'fr' ? 'Rapport d\'activité géolocalisation généré' : 'Geolocation activity report generated' }),
                  color: 'bg-orange-600 hover:bg-orange-700'
                }
              ]}
            />
          </CardContent>
        </Card>

        {/* Devices Table */}
        <Card className="bg-white border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">{t.deviceName}</th>
                  <th className="text-left p-4 font-semibold">{t.studentName}</th>
                  <th className="text-left p-4 font-semibold">{t.deviceType}</th>
                  <th className="text-left p-4 font-semibold">{t.status}</th>
                  <th className="text-left p-4 font-semibold">{t.lastSeen}</th>
                  <th className="text-left p-4 font-semibold">{t.battery}</th>
                  <th className="text-left p-4 font-semibold">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(devices) ? devices : []).map((device) => (
                  <tr key={device.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                        <span className="font-medium">{device.name || ''}</span>
                      </div>
                    </td>
                    <td className="p-4">{device.studentName}</td>
                    <td className="p-4">{t[device.type as keyof typeof t]}</td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(device.status)}>
                        {t[device.status as keyof typeof t]}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">{device.lastSeen}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${
                        parseInt(device.battery) > 50 ? 'text-green-600' : 
                        parseInt(device.battery) > 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {device.battery}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewLocation(device)}
                          disabled={device.status === 'inactive'}
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GeolocationManagement;