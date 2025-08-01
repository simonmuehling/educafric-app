import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Shield, Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const GeolocationTracker = () => {
  const { language } = useLanguage();
  const [trackingActive, setTrackingActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const text = {
    fr: {
      title: 'Suivi de Géolocalisation',
      enableTracking: 'Activer le Suivi',
      disableTracking: 'Désactiver le Suivi',
      currentLocation: 'Position Actuelle',
      safeZones: 'Zones de Sécurité',
      alerts: 'Alertes de Sécurité',
      trackingStatus: 'État du Suivi',
      active: 'Actif',
      inactive: 'Inactif',
      school: 'École',
      home: 'Maison',
      authorized: 'Zone Autorisée',
      locationHistory: 'Historique des Positions',
      emergencyAlert: 'Alerte d\'Urgence',
      arrived: 'Arrivé(e) à',
      left: 'Quitté',
      inSafeZone: 'Dans une zone sécurisée',
      outsideSafeZone: 'En dehors des zones autorisées'
    },
    en: {
      title: 'Geolocation Tracking',
      enableTracking: 'Enable Tracking',
      disableTracking: 'Disable Tracking',
      currentLocation: 'Current Location',
      safeZones: 'Safe Zones',
      alerts: 'Security Alerts',
      trackingStatus: 'Tracking Status',
      active: 'Active',
      inactive: 'Inactive',
      school: 'School',
      home: 'Home',
      authorized: 'Authorized Zone',
      locationHistory: 'Location History',
      emergencyAlert: 'Emergency Alert',
      arrived: 'Arrived at',
      left: 'Left',
      inSafeZone: 'In safe zone',
      outsideSafeZone: 'Outside authorized zones'
    }
  };

  const t = text[language as keyof typeof text];

  const safeZones = [
    { id: 1, name: t.school, address: 'École Publique Central, Yaoundé', status: 'active', color: 'bg-green-500' },
    { id: 2, name: t.home, address: 'Quartier Bastos, Yaoundé', status: 'active', color: 'bg-blue-500' },
    { id: 3, name: 'Bibliothèque', address: 'Bibliothèque Municipale', status: 'active', color: 'bg-purple-500' }
  ];

  const recentAlerts = [
    { 
      id: 1, 
      type: 'arrival', 
      message: language === 'fr' ? 'Marie est arrivée à l\'école' : 'Marie arrived at school',
      time: '08:15',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    { 
      id: 2, 
      type: 'departure', 
      message: language === 'fr' ? 'Paul a quitté la bibliothèque' : 'Paul left the library',
      time: '16:30',
      icon: <Navigation className="w-4 h-4 text-blue-500" />
    },
    { 
      id: 3, 
      type: 'alert', 
      message: language === 'fr' ? 'Alerte: Sophie en dehors des zones autorisées' : 'Alert: Sophie outside authorized zones',
      time: '17:45',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  ];

  const locationHistory = [
    { time: '08:00', location: t.home, status: 'safe' },
    { time: '08:15', location: t.school, status: 'safe' },
    { time: '12:00', location: 'Cantine scolaire', status: 'safe' },
    { time: '16:00', location: 'Bibliothèque', status: 'safe' },
    { time: '17:30', location: t.home, status: 'safe' }
  ];

  useEffect(() => {
    if (trackingActive && navigator.geolocation) {
      navigator?.geolocation?.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [trackingActive]);

  const toggleTracking = () => {
    setTrackingActive(!trackingActive);
    if (!trackingActive) {
      alert(language === 'fr' 
        ? 'Suivi GPS activé. Les parents recevront des notifications en temps réel.'
        : 'GPS tracking enabled. Parents will receive real-time notifications.'
      );
    } else {
      alert(language === 'fr' 
        ? 'Suivi GPS désactivé.'
        : 'GPS tracking disabled.'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-500" />
              {t.title || ''}
            </h2>
            <div className="flex items-center gap-3">
              <Badge variant={trackingActive ? "default" : "secondary"}>
                {trackingActive ? t.active : t.inactive}
              </Badge>
              <Button 
                onClick={toggleTracking}
                variant={trackingActive ? "destructive" : "default"}
                className={trackingActive ? "" : "bg-green-600 hover:bg-green-700"}
              >
                {trackingActive ? t.disableTracking : t.enableTracking}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-green-500" />
              {t.currentLocation}
            </h3>
          </CardHeader>
          <CardContent>
            {trackingActive ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">{t.inSafeZone}</span>
                  </div>
                  <p className="text-green-700">École Publique Central</p>
                  <p className="text-sm text-green-600">Quartier Melen, Yaoundé</p>
                </div>
                {currentLocation && (
                  <div className="text-sm text-gray-600">
                    <p>Latitude: {currentLocation?.lat?.toFixed(6)}</p>
                    <p>Longitude: {currentLocation?.lng?.toFixed(6)}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'fr' 
                    ? 'Activez le suivi pour voir la position actuelle'
                    : 'Enable tracking to see current location'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safe Zones */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              {t.safeZones}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Array.isArray(safeZones) ? safeZones : []).map((zone) => (
                <div key={zone.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 ${zone.color} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{zone.name || ''}</p>
                    <p className="text-sm text-gray-600">{zone.address}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {t.authorized}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {t.alerts}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Array.isArray(recentAlerts) ? recentAlerts : []).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {alert.icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location History */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              {t.locationHistory}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Array.isArray(locationHistory) ? locationHistory : []).map((entry, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border-l-2 border-blue-200 pl-4">
                  <div className="text-sm text-gray-600 w-16">{entry.time}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.location}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                    {entry.status === 'safe' ? (language === 'fr' ? 'Sécurisé' : 'Safe') : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Button */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">{t.emergencyAlert}</h3>
                <p className="text-red-600 text-sm">
                  {language === 'fr' 
                    ? 'En cas d\'urgence, cliquez pour alerter les parents et autorités'
                    : 'In case of emergency, click to alert parents and authorities'}
                </p>
              </div>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (confirm(language === 'fr' 
                  ? 'Êtes-vous sûr de vouloir déclencher une alerte d\'urgence?'
                  : 'Are you sure you want to trigger an emergency alert?'
                )) {
                  alert(language === 'fr' 
                    ? 'Alerte d\'urgence envoyée! Parents et autorités notifiés.'
                    : 'Emergency alert sent! Parents and authorities notified.'
                  );
                }
              }}
            >
              {language === 'fr' ? 'URGENCE' : 'EMERGENCY'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeolocationTracker;