import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Phone, 
  Clock, 
  Navigation,
  Users,
  Smartphone,
  Watch,
  Tablet,
  Home,
  School,
  Heart,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationData {
  userId: number;
  userName: string;
  role: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  isOnline: boolean;
  address?: string;
}

interface SafeZone {
  id: number;
  name: string;
  description?: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  zoneType: string;
  isActive: boolean;
  allowedTimeStart?: string;
  allowedTimeEnd?: string;
  allowedDays?: string[];
}

interface GeofenceAlert {
  id: number;
  alertType: string;
  severity: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
}

const FamilySafetyNetwork: React.FC = () => {
  const { t } = useLanguage();
  const [familyLocations, setFamilyLocations] = useState<LocationData[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Mock family locations for testing
  useEffect(() => {
    setTimeout(() => {
      setFamilyLocations([
        {
          userId: 25,
          userName: "Marie Kamdem",
          role: "child",
          latitude: 4.0511,
          longitude: 9.7679,
          accuracy: 5,
          timestamp: new Date().toISOString(),
          isOnline: true,
          address: "École Saint-Paul, Douala"
        },
        {
          userId: 24,
          userName: "Jean-Pierre Kamdem",
          role: "parent",
          latitude: 4.0501,
          longitude: 9.7669,
          accuracy: 8,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isOnline: true,
          address: "Bureau, Akwa, Douala"
        }
      ]);

      setSafeZones([
        {
          id: 1,
          name: "École Saint-Paul",
          description: "Zone scolaire avec horaires de cours",
          centerLatitude: 4.0511,
          centerLongitude: 9.7679,
          radius: 300,
          zoneType: "school",
          isActive: true,
          allowedTimeStart: "07:00",
          allowedTimeEnd: "18:00",
          allowedDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        },
        {
          id: 2,
          name: "Maison familiale",
          description: "Domicile de la famille Kamdem",
          centerLatitude: 4.0501,
          centerLongitude: 9.7669,
          radius: 200,
          zoneType: "home",
          isActive: true,
          allowedTimeStart: "00:00",
          allowedTimeEnd: "23:59",
          allowedDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        }
      ]);

      setAlerts([
        {
          id: 1,
          alertType: "entry",
          severity: "low",
          message: "Marie Kamdem est arrivée à École Saint-Paul",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          isResolved: false
        },
        {
          id: 2,
          alertType: "exit",
          severity: "medium",
          message: "Marie Kamdem a quitté Maison familiale",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          isResolved: false
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEmergencyPanic = async () => {
    if (!currentLocation) {
      alert("Localisation non disponible. Activez la géolocalisation.");
      return;
    }

    try {
      const response = await fetch('/api/geolocation/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deviceId: 1,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          panicType: 'security',
          message: 'Bouton de panique déclenché depuis l\'application'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('🚨 Alerte d\'urgence envoyée à votre famille!');
      }
    } catch (error) {
      console.error('Emergency panic failed:', error);
      alert('Erreur lors de l\'envoi de l\'alerte d\'urgence');
    }
  };

  const updateCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator?.geolocation?.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Send location update to server
          fetch('/api/geolocation/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              deviceId: 1,
              latitude,
              longitude,
              accuracy: position?.coords?.accuracy,
              speed: position?.coords?.speed
            })
          }).then(response => response.json())
            .then(result => {
              console.log('Location updated:', result);
              if (result.alerts && result.(Array.isArray(alerts) ? alerts.length : 0) > 0) {
                setAlerts(prev => [...result.alerts, ...prev]);
              }
            })
            .catch(error => console.error('Location update failed:', error));
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getZoneIcon = (zoneType: string) => {
    switch (zoneType) {
      case 'school': return <School className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'medical': return <Heart className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'child': return <Users className="w-4 h-4" />;
      case 'parent': return <Shield className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Navigation className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Chargement du réseau de sécurité familiale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency Panic Button */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Bouton d'Urgence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">
              En cas d'urgence, appuyez pour alerter immédiatement votre famille
            </p>
            <Button 
              onClick={handleEmergencyPanic}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              🚨 URGENCE
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="locations">Localisations</TabsTrigger>
          <TabsTrigger value="safezones">Zones Sûres</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Localisation Familiale</h3>
            <Button onClick={updateCurrentLocation} variant="outline" size="sm">
              <Navigation className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(Array.isArray(familyLocations) ? familyLocations : []).map((location) => (
              <Card key={location.userId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(location.role)}
                      <div>
                        <h4 className="font-medium">{location.userName}</h4>
                        <p className="text-sm text-gray-600 capitalize">{location.role}</p>
                      </div>
                    </div>
                    <Badge variant={location.isOnline ? "default" : "secondary"}>
                      {location.isOnline ? "En ligne" : "Hors ligne"}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {location.address || `${location?.latitude?.toFixed(4)}, ${location?.longitude?.toFixed(4)}`}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {new Date(location.timestamp).toLocaleTimeString('fr-FR')}
                    </div>
                    {location.accuracy && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Navigation className="w-4 h-4" />
                        Précision: ±{location.accuracy}m
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="safezones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Zones de Sécurité</h3>
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              Ajouter Zone
            </Button>
          </div>

          <div className="grid gap-4">
            {(Array.isArray(safeZones) ? safeZones : []).map((zone) => (
              <Card key={zone.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getZoneIcon(zone.zoneType)}
                      <div>
                        <h4 className="font-medium">{zone.name || ''}</h4>
                        <p className="text-sm text-gray-600">{zone.description || ''}</p>
                      </div>
                    </div>
                    <Badge variant={zone.isActive ? "default" : "secondary"}>
                      {zone.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rayon:</span>
                      <span className="ml-2 font-medium">{zone.radius}m</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium capitalize">{zone.zoneType}</span>
                    </div>
                    {zone.allowedTimeStart && zone.allowedTimeEnd && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Horaires autorisés:</span>
                        <span className="ml-2 font-medium">
                          {zone.allowedTimeStart} - {zone.allowedTimeEnd}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <h3 className="text-lg font-semibold">Alertes Géofencing</h3>
          
          <div className="space-y-3">
            {(Array.isArray(alerts) ? alerts : []).map((alert) => (
              <Alert key={alert.id}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <h3 className="text-lg font-semibold">Paramètres de Géolocalisation</h3>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appareils Connectés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Téléphone de Marie</p>
                    <p className="text-sm text-gray-600">Samsung Galaxy A54</p>
                  </div>
                </div>
                <Badge variant="outline">Connecté</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tablet className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Tablette École</p>
                    <p className="text-sm text-gray-600">iPad 9ème génération</p>
                  </div>
                </div>
                <Badge variant="outline">Connecté</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Watch className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Montre Connectée</p>
                    <p className="text-sm text-gray-600">Apple Watch SE</p>
                  </div>
                </div>
                <Badge variant="secondary">Hors ligne</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimisation Africaine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Économie de batterie</label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Limite données mobiles</label>
                <Input type="number" defaultValue="50" className="w-20" />
                <span className="text-sm text-gray-600">MB/mois</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode hors ligne</label>
                <input type="checkbox" className="rounded" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilySafetyNetwork;