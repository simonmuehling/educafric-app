import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { 
  MapPin, 
  Shield, 
  Clock, 
  Battery, 
  Signal, 
  AlertTriangle,
  CheckCircle,
  School,
  Home,
  Users,
  Activity,
  Bell
} from 'lucide-react';

interface SafeZone {
  id: number;
  name: string;
  type: 'home' | 'school' | 'relative' | 'activity';
  radius: number;
  active: boolean;
  createdBy: number;
  updatedAt: string;
}

interface DeviceStatus {
  id: string;
  name: string;
  type: 'smartphone' | 'tablet' | 'smartwatch';
  batteryLevel: number;
  gpsEnabled: boolean;
  lastUpdate: string;
  isActive: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    inSafeZone?: boolean;
    safeZoneName?: string;
  };
}

const StudentGeolocation: React.FC = () => {
  const { language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  const t = {
    fr: {
      title: 'Ma Géolocalisation',
      subtitle: 'Géolocalisation contrôlée par vos parents pour votre sécurité',
      myDevices: 'Mes Appareils',
      safeZones: 'Zones de Sécurité Actives',
      currentStatus: 'Statut Actuel',
      deviceInfo: 'Infos Appareil',
      battery: 'Batterie',
      gps: 'GPS',
      lastUpdate: 'Dernière MAJ',
      inSafeZone: 'Dans Zone de Sécurité',
      outOfSafeZone: 'Hors Zone de Sécurité',
      active: 'Actif',
      inactive: 'Inactif',
      enabled: 'Activé',
      disabled: 'Désactivé',
      home: 'Domicile',
      school: 'École',
      relative: 'Famille',
      activity: 'Activité',
      radius: 'Rayon',
      meters: 'm',
      updatedRecently: 'Mis à jour récemment',
      parentControlled: 'Contrôlé par les parents',
      safetyFirst: 'Votre sécurité est notre priorité',
      autoTracking: 'Suivi automatique activé',
      notifications: 'Notifications Récentes',
      noNotifications: 'Aucune nouvelle notification',
      zoneModifiedAlert: 'Vos parents ont modifié vos zones de sécurité',
      viewNotifications: 'Voir toutes les notifications'
    },
    en: {
      title: 'My Geolocation',
      subtitle: 'Geolocation controlled by your parents for your safety',
      myDevices: 'My Devices',
      safeZones: 'Active Safe Zones',
      currentStatus: 'Current Status',
      deviceInfo: 'Device Info',
      battery: 'Battery',
      gps: 'GPS',
      lastUpdate: 'Last Update',
      inSafeZone: 'In Safe Zone',
      outOfSafeZone: 'Outside Safe Zone',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      home: 'Home',
      school: 'School',
      relative: 'Family',
      activity: 'Activity',
      radius: 'Radius',
      meters: 'm',
      updatedRecently: 'Updated recently',
      parentControlled: 'Parent controlled',
      safetyFirst: 'Your safety is our priority',
      autoTracking: 'Auto tracking enabled',
      notifications: 'Recent Notifications',
      noNotifications: 'No new notifications',
      zoneModifiedAlert: 'Your parents have modified your safety zones',
      viewNotifications: 'View all notifications'
    }
  };

  const translations = t[language as keyof typeof t] || t.fr;

  // Fetch student's active safe zones
  const { data: safeZones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['/api/student/geolocation/safe-zones'],
    retry: false,
  });

  // Fetch student's device status
  const { data: deviceStatus, isLoading: deviceLoading } = useQuery({
    queryKey: ['/api/student/geolocation/device-status'],
    retry: false,
  });

  // Fetch recent geolocation notifications for this student
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications', 'Student', 15, 'security', false], // Student ID 15, security category
    retry: false,
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getZoneIcon = (type: string) => {
    switch(type) {
      case 'home': return <Home className="w-5 h-5 text-blue-500" />;
      case 'school': return <School className="w-5 h-5 text-green-500" />;
      case 'relative': return <Users className="w-5 h-5 text-purple-500" />;
      case 'activity': return <Activity className="w-5 h-5 text-orange-500" />;
      default: return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case 'smartphone': return '📱';
      case 'tablet': return '📱';
      case 'smartwatch': return '⌚';
      default: return '📍';
    }
  };

  // Mock data for demonstration
  const mockDeviceStatus: DeviceStatus = {
    id: 'STU001',
    name: 'Mon Smartphone',
    type: 'smartphone',
    batteryLevel: 78,
    gpsEnabled: true,
    lastUpdate: new Date().toISOString(),
    isActive: true,
    currentLocation: {
      latitude: 4.0511,
      longitude: 9.7679,
      address: 'École Primaire Central, Douala',
      inSafeZone: true,
      safeZoneName: 'École Primaire Central'
    }
  };

  const mockSafeZones: SafeZone[] = [
    {
      id: 1,
      name: 'École Primaire Central',
      type: 'school',
      radius: 200,
      active: true,
      createdBy: 7,
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Maison',
      type: 'home',
      radius: 100,
      active: true,
      createdBy: 7,
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  ];

  if (zonesLoading || deviceLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const activeSafeZones = mockSafeZones.filter(zone => zone.active);
  const currentDevice = mockDeviceStatus;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Shield className="w-8 h-8 text-green-500" />
          {translations.title}
        </h1>
        <p className="text-gray-600">{translations.subtitle}</p>
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          {translations.autoTracking}
        </div>
      </div>

      {/* Recent Notifications - Only show if there are unread geolocation notifications */}
      {notifications.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              {translations.notifications} ({notifications.filter((n: any) => !n.isRead).length})
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 2).map((notification: any) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-white border-amber-300'}`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-amber-500 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {notifications.length > 2 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  data-testid="button-view-all-notifications"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {translations.viewNotifications} ({notifications.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            {translations.currentStatus}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{currentDevice.currentLocation?.address}</p>
              <div className="flex items-center gap-2 mt-1">
                {currentDevice.currentLocation?.inSafeZone ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">
                      {translations.inSafeZone}: {currentDevice.currentLocation.safeZoneName}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 font-medium">{translations.outOfSafeZone}</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant={currentDevice.currentLocation?.inSafeZone ? "default" : "secondary"}>
              {currentDevice.currentLocation?.inSafeZone ? translations.active : translations.inactive}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-600">{currentTime.toLocaleTimeString()}</p>
            </div>
            <div className="text-center">
              <Signal className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-sm text-green-600">{translations.parentControlled}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📱 {translations.deviceInfo}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getDeviceIcon(currentDevice.type)}</span>
              <div>
                <p className="font-medium">{currentDevice.name}</p>
                <p className="text-sm text-gray-600">{translations.lastUpdate}: {new Date(currentDevice.lastUpdate).toLocaleTimeString()}</p>
              </div>
            </div>
            <Badge variant={currentDevice.isActive ? "default" : "secondary"}>
              {currentDevice.isActive ? translations.active : translations.inactive}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-green-500" />
              <span className="text-sm">{translations.battery}: {currentDevice.batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{translations.gps}: {currentDevice.gpsEnabled ? translations.enabled : translations.disabled}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Safe Zones */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            {translations.safeZones} ({activeSafeZones.length})
          </h3>
        </CardHeader>
        <CardContent>
          {activeSafeZones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune zone de sécurité active</p>
          ) : (
            <div className="space-y-4">
              {activeSafeZones.map(zone => {
                const wasRecentlyUpdated = new Date(zone.updatedAt).getTime() > Date.now() - 5 * 60 * 1000;
                
                return (
                  <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getZoneIcon(zone.type)}
                      <div>
                        <p className="font-medium">{zone.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{translations[zone.type as keyof typeof translations]}</span>
                          <span>{translations.radius}: {zone.radius}{translations.meters}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="mb-1">
                        {zone.active ? translations.active : translations.inactive}
                      </Badge>
                      {wasRecentlyUpdated && (
                        <p className="text-xs text-green-600">{translations.updatedRecently}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Shield className="w-12 h-12 mx-auto text-blue-500" />
            <p className="font-medium text-blue-800">{translations.safetyFirst}</p>
            <p className="text-sm text-blue-600">
              {language === 'fr' 
                ? "Vos parents peuvent voir votre position et modifier vos zones de sécurité à tout moment pour assurer votre protection."
                : "Your parents can see your location and modify your safe zones at any time to ensure your protection."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGeolocation;