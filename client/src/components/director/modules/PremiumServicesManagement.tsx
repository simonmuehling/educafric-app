import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { MapPin, Shield, Smartphone, AlertTriangle, Settings, Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PremiumServicesManagement = () => {
  const { language } = useLanguage();
  const [activeService, setActiveService] = useState('gps');

  const text = {
    fr: {
      title: 'Services Premium',
      subtitle: 'Gestion des services premium - Géolocalisation',
      gpsTracking: 'Suivi GPS',
      deviceManagement: 'Gestion Appareils',
      safeZones: 'Zones de Sécurité',
      emergencyAlerts: 'Alertes d\'Urgence',
      activeDevices: 'Appareils Actifs',
      studentsTracked: 'Élèves Suivis',
      safeZoneAlerts: 'Alertes Zone Sécurisée',
      emergencyNotifications: 'Notifications d\'Urgence',
      deviceType: 'Type d\'Appareil',
      batteryLevel: 'Niveau Batterie',
      lastLocation: 'Dernière Position',
      status: 'Statut',
      online: 'En Ligne',
      offline: 'Hors Ligne',
      lowBattery: 'Batterie Faible',
      tablet: 'Tablette',
      smartwatch: 'Montre Connectée',
      phone: 'Téléphone',
      configure: 'Configurer',
      viewMap: 'Voir Carte',
      sendAlert: 'Envoyer Alerte',
      recentActivity: 'Activité Récente',
      student: 'Élève',
      location: 'Localisation',
      time: 'Heure',
      schoolArrival: 'Arrivée École',
      schoolDeparture: 'Départ École',
      safeZoneEntry: 'Entrée Zone Sécurisée',
      safeZoneExit: 'Sortie Zone Sécurisée'
    },
    en: {
      title: 'Premium Services',
      subtitle: 'Premium services management - Geolocation',
      gpsTracking: 'GPS Tracking',
      deviceManagement: 'Device Management',
      safeZones: 'Safe Zones',
      emergencyAlerts: 'Emergency Alerts',
      activeDevices: 'Active Devices',
      studentsTracked: 'Students Tracked',
      safeZoneAlerts: 'Safe Zone Alerts',
      emergencyNotifications: 'Emergency Notifications',
      deviceType: 'Device Type',
      batteryLevel: 'Battery Level',
      lastLocation: 'Last Location',
      status: 'Status',
      online: 'Online',
      offline: 'Offline',
      lowBattery: 'Low Battery',
      tablet: 'Tablet',
      smartwatch: 'Smartwatch',
      phone: 'Phone',
      configure: 'Configure',
      viewMap: 'View Map',
      sendAlert: 'Send Alert',
      recentActivity: 'Recent Activity',
      student: 'Student',
      location: 'Location',
      time: 'Time',
      schoolArrival: 'School Arrival',
      schoolDeparture: 'School Departure',
      safeZoneEntry: 'Safe Zone Entry',
      safeZoneExit: 'Safe Zone Exit'
    }
  };

  const t = text[language as keyof typeof text];

  const gpsStats = [
    {
      title: t.activeDevices,
      value: '42',
      icon: <Smartphone className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'blue'
    },
    {
      title: t.studentsTracked,
      value: '38',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'green'
    },
    {
      title: t.safeZoneAlerts,
      value: '12',
      icon: <Shield className="w-5 h-5" />,
      trend: { value: 1, isPositive: true },
      gradient: 'purple'
    },
    {
      title: t.emergencyNotifications,
      value: '2',
      icon: <AlertTriangle className="w-5 h-5" />,
      trend: { value: 0, isPositive: true },
      gradient: 'red'
    }
  ];

  const trackedDevices = [
    {
      id: 1,
      student: 'Marie Nkomo',
      class: '6ème A',
      device: 'Tablette',
      battery: 85,
      status: 'online',
      lastLocation: 'École Primaire',
      lastUpdate: '09:45'
    },
    {
      id: 2,
      student: 'Jean Mballa',
      class: 'CE2 B',
      device: 'Montre Connectée',
      battery: 45,
      status: 'online',
      lastLocation: 'Domicile',
      lastUpdate: '09:30'
    },
    {
      id: 3,
      student: 'Sophie Atangana',
      class: 'CM1 A',
      device: 'Téléphone',
      battery: 15,
      status: 'lowBattery',
      lastLocation: 'Transport Scolaire',
      lastUpdate: '09:20'
    },
    {
      id: 4,
      student: 'Paul Kouam',
      class: 'CE1 B',
      device: 'Tablette',
      battery: 0,
      status: 'offline',
      lastLocation: 'Inconnu',
      lastUpdate: '08:45'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      student: 'Marie Nkomo',
      activity: 'Arrivée École',
      location: 'École Primaire',
      time: '07:45',
      type: 'arrival'
    },
    {
      id: 2,
      student: 'Jean Mballa',
      activity: 'Entrée Zone Sécurisée',
      location: 'Domicile',
      time: '16:30',
      type: 'safeZone'
    },
    {
      id: 3,
      student: 'Sophie Atangana',
      activity: 'Batterie Faible',
      location: 'Transport Scolaire',
      time: '09:15',
      type: 'alert'
    },
    {
      id: 4,
      student: 'Paul Kouam',
      activity: 'Appareil Hors Ligne',
      location: 'Dernière: École',
      time: '08:45',
      type: 'offline'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'lowBattery':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return t.online;
      case 'offline':
        return t.offline;
      case 'lowBattery':
        return t.lowBattery;
      default:
        return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'arrival':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'safeZone':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'offline':
        return <Clock className="w-4 h-4 text-red-600" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleConfigure = (deviceId: number) => {
    console.log(`Configuring device #${deviceId}`);
    alert(`Configuration de l'appareil #${deviceId}`);
  };

  const handleViewMap = (deviceId: number) => {
    console.log(`Viewing map for device #${deviceId}`);
    alert(`Ouverture de la carte pour l'appareil #${deviceId}`);
  };

  const handleSendAlert = (deviceId: number) => {
    console.log(`Sending alert to device #${deviceId}`);
    alert(`Alerte envoyée à l'appareil #${deviceId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(gpsStats) ? gpsStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Service Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'gps', label: t.gpsTracking, icon: <MapPin className="w-4 h-4" /> },
            { id: 'devices', label: t.deviceManagement, icon: <Smartphone className="w-4 h-4" /> },
            { id: 'safety', label: t.safeZones, icon: <Shield className="w-4 h-4" /> },
            { id: 'alerts', label: t.emergencyAlerts, icon: <AlertTriangle className="w-4 h-4" /> }
          ].map((service) => (
            <Button
              key={service.id}
              variant={activeService === service.id ? 'default' : 'outline'}
              onClick={() => setActiveService(service.id)}
              className="flex items-center gap-2"
            >
              {service.icon}
              {service.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Management */}
        <ModernCard title="Appareils Suivis" className="p-6">
          <div className="space-y-4">
            {(Array.isArray(trackedDevices) ? trackedDevices : []).map((device) => (
              <div key={device.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.student}</h3>
                    <p className="text-sm text-gray-600">{device.class}</p>
                  </div>
                  <Badge className={getStatusColor(device.status)}>
                    {getStatusText(device.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">{t.deviceType}:</span>
                    <p className="font-medium">{device.device}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.batteryLevel}:</span>
                    <p className={`font-medium ${device.battery < 20 ? 'text-red-600' : 'text-green-600'}`}>
                      {device.battery}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.lastLocation}:</span>
                    <p className="font-medium">{device.lastLocation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Dernière MAJ:</span>
                    <p className="font-medium">{device.lastUpdate}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleConfigure(device.id)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {t.configure}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewMap(device.id)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    {t.viewMap}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendAlert(device.id)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {t.sendAlert}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Recent Activity */}
        <ModernCard title={t.recentActivity} className="p-6">
          <div className="space-y-4">
            {(Array.isArray(recentActivity) ? recentActivity : []).map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.student}</p>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                  <p className="text-xs text-gray-500">{activity.location} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default PremiumServicesManagement;