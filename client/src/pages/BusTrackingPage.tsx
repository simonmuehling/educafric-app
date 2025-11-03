import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Bus, MapPin, Clock, Users } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function BusTrackingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const schoolId = user?.schoolId;
  const studentId = user?.role === "Student" ? user?.id : null;

  // Fetch bus routes
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ["/api/bus/routes", schoolId],
    enabled: !!schoolId,
  });

  // Fetch active routes only
  const { data: activeRoutes = [] } = useQuery({
    queryKey: ["/api/bus/routes", schoolId, "active"],
    enabled: !!schoolId,
  });

  // Fetch stations for selected route
  const { data: stations = [] } = useQuery({
    queryKey: ["/api/bus/stations", selectedRoute?.id],
    enabled: !!selectedRoute?.id,
  });

  // Fetch student enrollment
  const { data: enrollment } = useQuery({
    queryKey: ["/api/bus/enrollments/student", studentId],
    enabled: !!studentId,
  });

  // Auto-select first route
  useEffect(() => {
    if (Array.isArray(routes) && routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
  }, [routes, selectedRoute]);

  // Calculate route line from stations
  const routeLine = Array.isArray(stations)
    ? stations
        .sort((a: any, b: any) => a.stationOrder - b.stationOrder)
        .map((station: any) => [station.latitude, station.longitude] as [number, number])
    : [];

  // Default center (Yaoundé, Cameroon)
  const defaultCenter: [number, number] = [3.848, 11.5021];
  const mapCenter = Array.isArray(stations) && stations.length > 0
    ? [stations[0].latitude, stations[0].longitude] as [number, number]
    : defaultCenter;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Bus className="h-8 w-8" />
            {t("busTracking")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("liveTracking")}</p>
        </div>
        
        {enrollment && (
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t("enrollment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold" data-testid="text-route-name">
                {(enrollment as any)?.routeName}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("pickupStation")}: {(enrollment as any)?.pickupStationName}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList>
          <TabsTrigger value="map" data-testid="tab-map">{t("viewOnMap")}</TabsTrigger>
          <TabsTrigger value="routes" data-testid="tab-routes">{t("busRoutes")}</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("routes")}</CardTitle>
                  <CardDescription>{Array.isArray(activeRoutes) ? activeRoutes.length : 0} active</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {routesLoading ? (
                    <p>Loading routes...</p>
                  ) : !Array.isArray(routes) || routes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No routes available</p>
                  ) : (
                    Array.isArray(routes) && routes.map((route: any) => (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedRoute?.id === route.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        data-testid={`button-route-${route.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{route.routeName}</p>
                            <p className="text-xs opacity-80">
                              {route.driverName}
                            </p>
                          </div>
                          {route.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              {t("active")}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              {selectedRoute && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("stations")}</CardTitle>
                    <CardDescription>{Array.isArray(stations) ? stations.length : 0} stops</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.isArray(stations) && stations
                      .sort((a: any, b: any) => a.stationOrder - b.stationOrder)
                      .map((station: any) => (
                        <div
                          key={station.id}
                          className="flex items-start gap-2 p-2 rounded border"
                          data-testid={`station-${station.id}`}
                        >
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{station.stationName}</p>
                            {station.arrivalTime && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {station.arrivalTime}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {station.stationOrder}
                          </Badge>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-0">
                  <div className="h-[600px] rounded-lg overflow-hidden" data-testid="map-container">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {Array.isArray(stations) && stations.map((station: any) => (
                        <Marker
                          key={station.id}
                          position={[station.latitude, station.longitude]}
                        >
                          <Popup>
                            <div>
                              <p className="font-semibold">{station.stationName}</p>
                              <p className="text-xs">
                                {t("stationOrder")}: {station.stationOrder}
                              </p>
                              {station.arrivalTime && (
                                <p className="text-xs">
                                  {t("arrivalTime")}: {station.arrivalTime}
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                      
                      {Array.isArray(routeLine) && routeLine.length > 1 && (
                        <Polyline
                          positions={routeLine}
                          color="blue"
                          weight={3}
                          opacity={0.6}
                        />
                      )}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          {routesLoading ? (
            <p>Loading routes...</p>
          ) : !Array.isArray(routes) || routes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No bus routes available
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(routes) && routes.map((route: any) => (
                <Card key={route.id} data-testid={`card-route-${route.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bus className="h-5 w-5" />
                        {route.routeName}
                      </CardTitle>
                      {route.isActive && (
                        <Badge variant="default">{t("active")}</Badge>
                      )}
                    </div>
                    <CardDescription>{route.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("driverName")}</p>
                        <p className="font-medium">{route.driverName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("vehiclePlate")}</p>
                        <p className="font-medium">{route.vehiclePlate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("capacity")}</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {route.capacity}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("startTime")}</p>
                        <p className="font-medium">{route.startTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
