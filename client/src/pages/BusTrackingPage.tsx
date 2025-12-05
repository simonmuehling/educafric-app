import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  className?: string;
}

export default function BusTrackingPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const schoolId = user?.schoolId;
  const isParent = user?.role === "Parent";
  const studentId = user?.role === "Student" ? user?.id : null;

  // For parents: fetch their children
  const { data: children = [], isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ["/api/parent/children"],
    queryFn: async () => {
      const response = await fetch("/api/parent/children", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch children");
      return response.json();
    },
    enabled: isParent,
  });

  // Auto-select first child for parent
  const activeStudentId = isParent 
    ? (selectedChildId || (children.length > 0 ? children[0].id : null))
    : studentId;

  // Fetch bus routes
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ["/api/bus/routes", schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/bus/routes/${schoolId}`);
      if (!response.ok) throw new Error("Failed to fetch routes");
      return response.json();
    },
    enabled: !!schoolId,
  });

  // Fetch active routes only
  const { data: activeRoutes = [] } = useQuery({
    queryKey: ["/api/bus/routes", schoolId, "active"],
    queryFn: async () => {
      const response = await fetch(`/api/bus/routes/${schoolId}/active`);
      if (!response.ok) throw new Error("Failed to fetch active routes");
      return response.json();
    },
    enabled: !!schoolId,
  });

  // Fetch stations for selected route
  const { data: stations = [] } = useQuery({
    queryKey: ["/api/bus/stations", selectedRoute?.id],
    queryFn: async () => {
      const response = await fetch(`/api/bus/stations/${selectedRoute.id}`);
      if (!response.ok) throw new Error("Failed to fetch stations");
      return response.json();
    },
    enabled: !!selectedRoute?.id,
  });

  // Fetch student enrollment (works for both student and parent viewing child)
  const { data: enrollment } = useQuery({
    queryKey: ["/api/bus/enrollments/student", activeStudentId],
    queryFn: async () => {
      const response = await fetch(`/api/bus/enrollments/student/${activeStudentId}`);
      if (!response.ok) throw new Error("Failed to fetch enrollment");
      return response.json();
    },
    enabled: !!activeStudentId,
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
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
        .map((station: any) => [parseFloat(station.latitude), parseFloat(station.longitude)] as [number, number])
    : [];

  // Default center (Yaoundé, Cameroon)
  const defaultCenter: [number, number] = [3.848, 11.5021];
  const mapCenter = Array.isArray(stations) && stations.length > 0
    ? [parseFloat(stations[0].latitude), parseFloat(stations[0].longitude)] as [number, number]
    : defaultCenter;

  // Get selected child name for display
  const getSelectedChildName = () => {
    if (!isParent || !activeStudentId) return "";
    const child = children.find(c => c.id === activeStudentId);
    return child ? `${child.firstName} ${child.lastName}` : "";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Bus className="h-8 w-8" />
            {isParent 
              ? (language === 'fr' ? 'Transport Scolaire Enfants' : 'Children School Bus')
              : t("busTracking")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isParent 
              ? (language === 'fr' ? 'Suivez le transport scolaire de vos enfants' : 'Track your children\'s school transportation')
              : t("liveTracking")}
          </p>
        </div>

        {/* Child Selector for Parents */}
        {isParent && children.length > 0 && (
          <Card className="w-full md:w-72">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                {language === 'fr' ? 'Sélectionner un enfant' : 'Select a child'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={activeStudentId?.toString() || ""}
                onValueChange={(value) => setSelectedChildId(parseInt(value))}
              >
                <SelectTrigger data-testid="select-child">
                  <SelectValue placeholder={language === 'fr' ? 'Choisir un enfant' : 'Choose a child'} />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.firstName} {child.lastName}
                      {child.className && ` - ${child.className}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
        
        {enrollment && (
          <Card className="w-full md:w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {t("enrollment")}
                {isParent && getSelectedChildName() && (
                  <span className="text-xs text-muted-foreground ml-2">({getSelectedChildName()})</span>
                )}
              </CardTitle>
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
                      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
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
                            {station.orderIndex}
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
                          position={[parseFloat(station.latitude), parseFloat(station.longitude)]}
                        >
                          <Popup>
                            <div>
                              <p className="font-semibold">{station.stationName}</p>
                              <p className="text-xs">
                                {t("stationOrder")}: {station.orderIndex}
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
