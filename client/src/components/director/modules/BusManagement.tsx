import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bus, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Clock 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BusManagement() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  
  // Route form state
  const [busName, setBusName] = useState("");
  const [description, setDescription] = useState("");
  // Keep both language values to preserve bilingual data
  const [busNameFr, setBusNameFr] = useState("");
  const [busNameEn, setBusNameEn] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Station form state
  const [stationName, setStationName] = useState("");
  // Keep both language values to preserve bilingual data
  const [stationNameFr, setStationNameFr] = useState("");
  const [stationNameEn, setStationNameEn] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [stationTime, setStationTime] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [routeIdForStation, setRouteIdForStation] = useState<number | null>(null);

  const schoolId = user?.schoolId;

  // Sync visible fields with language-specific fields when language or data changes
  useEffect(() => {
    setBusName(language === 'fr' ? busNameFr : busNameEn);
    setDescription(language === 'fr' ? descriptionFr : descriptionEn);
  }, [language, busNameFr, busNameEn, descriptionFr, descriptionEn]);

  useEffect(() => {
    setStationName(language === 'fr' ? stationNameFr : stationNameEn);
  }, [language, stationNameFr, stationNameEn]);

  // Handler to update bus name - updates both visible field and appropriate language field
  const handleBusNameChange = (value: string) => {
    setBusName(value);
    if (language === 'fr') {
      setBusNameFr(value);
    } else {
      setBusNameEn(value);
    }
  };

  // Handler to update description - updates both visible field and appropriate language field
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (language === 'fr') {
      setDescriptionFr(value);
    } else {
      setDescriptionEn(value);
    }
  };

  // Handler to update station name - updates both visible field and appropriate language field
  const handleStationNameChange = (value: string) => {
    setStationName(value);
    if (language === 'fr') {
      setStationNameFr(value);
    } else {
      setStationNameEn(value);
    }
  };

  // Fetch routes
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ["/api/bus/routes", schoolId],
    enabled: !!schoolId,
  });

  // Fetch stations for selected route
  const { data: stations = [] } = useQuery({
    queryKey: ["/api/bus/stations", selectedRoute?.id],
    enabled: !!selectedRoute?.id,
  });

  // Fetch all students
  const { data: students = [] } = useQuery({
    queryKey: ["/api/director/students", schoolId],
    enabled: !!schoolId,
  });

  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: async (routeData: any) => {
      return apiRequest("POST", "/api/bus/routes", routeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus/routes"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Route créée avec succès' : 'Route created successfully',
      });
      resetRouteForm();
      setIsRouteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la création de la route' : 'Failed to create route',
        variant: "destructive",
      });
    },
  });

  // Update route mutation
  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/bus/routes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus/routes"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Route modifiée avec succès' : 'Route updated successfully',
      });
      resetRouteForm();
      setIsRouteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la modification de la route' : 'Failed to update route',
        variant: "destructive",
      });
    },
  });

  // Delete route mutation
  const deleteRouteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/bus/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus/routes"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Route supprimée avec succès' : 'Route deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la suppression de la route' : 'Failed to delete route',
        variant: "destructive",
      });
    },
  });

  // Create station mutation
  const createStationMutation = useMutation({
    mutationFn: async (stationData: any) => {
      return apiRequest("POST", "/api/bus/stations", stationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus/stations"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Station créée avec succès' : 'Station created successfully',
      });
      resetStationForm();
      setIsStationDialogOpen(false);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la création de la station' : 'Failed to create station',
        variant: "destructive",
      });
    },
  });

  // Delete station mutation
  const deleteStationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/bus/stations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus/stations"] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 'Station supprimée avec succès' : 'Station deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de la suppression de la station' : 'Failed to delete station',
        variant: "destructive",
      });
    },
  });

  const resetRouteForm = () => {
    setSelectedRoute(null);
    setBusName("");
    setDescription("");
    setBusNameFr("");
    setBusNameEn("");
    setDescriptionFr("");
    setDescriptionEn("");
    setDriverName("");
    setDriverPhone("");
    setVehiclePlate("");
    setCapacity("");
    setStartTime("");
    setIsActive(true);
  };

  const resetStationForm = () => {
    setSelectedStation(null);
    setStationName("");
    setStationNameFr("");
    setStationNameEn("");
    setLatitude("");
    setLongitude("");
    setStationTime("");
    setOrderIndex("");
    setRouteIdForStation(null);
  };

  const openCreateRouteDialog = () => {
    resetRouteForm();
    setIsRouteDialogOpen(true);
  };

  const openEditRouteDialog = (route: any) => {
    setSelectedRoute(route);
    // Load both language values to preserve bilingual data
    setBusNameFr(route.busNameFr || "");
    setBusNameEn(route.busNameEn || "");
    setDescriptionFr(route.descriptionFr || "");
    setDescriptionEn(route.descriptionEn || "");
    // Set visible fields based on current language
    setBusName(language === 'fr' ? (route.busNameFr || route.busNameEn || "") : (route.busNameEn || route.busNameFr || ""));
    setDescription(language === 'fr' ? (route.descriptionFr || route.descriptionEn || "") : (route.descriptionEn || route.descriptionFr || ""));
    setDriverName(route.driverName || "");
    setDriverPhone(route.driverPhone || "");
    setVehiclePlate(route.vehiclePlate || "");
    setCapacity(route.capacity?.toString() || "");
    setStartTime(route.startTime || "");
    setIsActive(route.isActive ?? true);
    setIsRouteDialogOpen(true);
  };

  const openCreateStationDialog = (route?: any) => {
    resetStationForm();
    if (route) {
      setRouteIdForStation(route.id);
    }
    setIsStationDialogOpen(true);
  };

  const handleSubmitRoute = () => {
    if (!busName || !driverName || !vehiclePlate || !schoolId) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: "destructive",
      });
      return;
    }

    // Preserve both language values - use existing values or current input if creating new
    const routeData = {
      schoolId,
      busNameFr: busNameFr || busName,
      busNameEn: busNameEn || busName,
      descriptionFr: descriptionFr || description,
      descriptionEn: descriptionEn || description,
      driverName,
      driverPhone,
      vehiclePlate,
      capacity: capacity ? parseInt(capacity) : null,
      startTime,
      isActive,
    };

    if (selectedRoute) {
      updateRouteMutation.mutate({ id: selectedRoute.id, data: routeData });
    } else {
      createRouteMutation.mutate(routeData);
    }
  };

  const handleSubmitStation = () => {
    if (!stationName || !latitude || !longitude || !routeIdForStation) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: "destructive",
      });
      return;
    }

    // Preserve both language values - use existing values or current input if creating new
    const stationData = {
      routeId: routeIdForStation,
      stationNameFr: stationNameFr || stationName,
      stationNameEn: stationNameEn || stationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      stationTime,
      orderIndex: orderIndex ? parseInt(orderIndex) : (Array.isArray(stations) ? stations.length + 1 : 1),
    };

    createStationMutation.mutate(stationData);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Bus className="h-8 w-8" />
            {language === 'fr' ? 'Gestion du Transport Scolaire' : 'School Bus Management'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'fr' ? 'Gérez les routes de bus et les stations' : 'Manage bus routes and stations'}
          </p>
        </div>
        
        <Button onClick={openCreateRouteDialog} data-testid="button-create-route">
          <Plus className="h-4 w-4 mr-2" />
          {language === 'fr' ? 'Nouvelle Route' : 'New Route'}
        </Button>
      </div>

      <Tabs defaultValue="routes" className="w-full">
        <TabsList>
          <TabsTrigger value="routes" data-testid="tab-routes">
            {language === 'fr' ? 'Routes' : 'Routes'}
          </TabsTrigger>
          <TabsTrigger value="stations" data-testid="tab-stations">
            {language === 'fr' ? 'Stations' : 'Stations'}
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="tab-statistics">
            {language === 'fr' ? 'Statistiques' : 'Statistics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          {routesLoading ? (
            <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
          ) : !Array.isArray(routes) || routes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {language === 'fr' ? 'Aucune route disponible. Créez votre première route!' : 'No routes available. Create your first route!'}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route: any) => (
                <Card key={route.id} data-testid={`card-route-${route.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bus className="h-5 w-5" />
                        {language === 'fr' ? route.busNameFr : route.busNameEn}
                      </CardTitle>
                      {route.isActive && (
                        <Badge variant="default">{language === 'fr' ? 'Actif' : 'Active'}</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {language === 'fr' ? route.descriptionFr : route.descriptionEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">{language === 'fr' ? 'Chauffeur' : 'Driver'}</p>
                        <p className="font-medium">{route.driverName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'fr' ? 'Plaque' : 'Plate'}</p>
                        <p className="font-medium">{route.vehiclePlate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'fr' ? 'Capacité' : 'Capacity'}</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {route.capacity || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'fr' ? 'Départ' : 'Start Time'}</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {route.startTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRoute(route);
                          openCreateStationDialog(route);
                        }}
                        data-testid={`button-add-station-${route.id}`}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {language === 'fr' ? 'Stations' : 'Stations'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditRouteDialog(route)}
                        data-testid={`button-edit-route-${route.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {language === 'fr' ? 'Modifier' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteRouteMutation.mutate(route.id)}
                        disabled={deleteRouteMutation.isPending}
                        data-testid={`button-delete-route-${route.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          {!selectedRoute ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {language === 'fr' ? 'Sélectionnez une route pour voir ses stations' : 'Select a route to view its stations'}
              </CardContent>
            </Card>
          ) : !Array.isArray(stations) || stations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {language === 'fr' ? 'Aucune station pour cette route' : 'No stations for this route'}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'fr' ? 'Stations de' : 'Stations for'} {language === 'fr' ? selectedRoute.busNameFr : selectedRoute.busNameEn}
                </CardTitle>
                <CardDescription>
                  {stations.length} {language === 'fr' ? 'station(s)' : 'station(s)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'fr' ? 'Ordre' : 'Order'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Nom' : 'Name'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Heure' : 'Time'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Position' : 'Position'}</TableHead>
                      <TableHead>{language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stations
                      .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                      .map((station: any) => (
                        <TableRow key={station.id} data-testid={`row-station-${station.id}`}>
                          <TableCell>
                            <Badge variant="outline">{station.orderIndex}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {language === 'fr' ? station.stationNameFr : station.stationNameEn}
                          </TableCell>
                          <TableCell>{station.stationTime || 'N/A'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {station.latitude}, {station.longitude}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteStationMutation.mutate(station.id)}
                              disabled={deleteStationMutation.isPending}
                              data-testid={`button-delete-station-${station.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  {language === 'fr' ? 'Total Routes' : 'Total Routes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="stat-total-routes">
                  {Array.isArray(routes) ? routes.length : 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bus className="h-4 w-4 text-green-600" />
                  {language === 'fr' ? 'Routes Actives' : 'Active Routes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600" data-testid="stat-active-routes">
                  {Array.isArray(routes) ? routes.filter((r: any) => r.isActive).length : 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {language === 'fr' ? 'Total Stations' : 'Total Stations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="stat-total-stations">
                  {Array.isArray(stations) ? stations.length : 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Route Dialog */}
      <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRoute 
                ? (language === 'fr' ? 'Modifier la Route' : 'Edit Route') 
                : (language === 'fr' ? 'Nouvelle Route' : 'New Route')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'fr' 
                ? 'Remplissez les informations de la route de bus' 
                : 'Fill in the bus route information'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="busName">{language === 'fr' ? 'Nom de la route' : 'Route Name'} *</Label>
              <Input
                id="busName"
                value={busName}
                onChange={(e) => handleBusNameChange(e.target.value)}
                placeholder={language === 'fr' ? 'Route Nord' : 'North Route'}
                data-testid="input-bus-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{language === 'fr' ? 'Description' : 'Description'}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder={language === 'fr' ? 'Description de la route...' : 'Route description...'}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="driverName">{language === 'fr' ? 'Nom du Chauffeur' : 'Driver Name'} *</Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Jean Dupont"
                  data-testid="input-driver-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driverPhone">{language === 'fr' ? 'Téléphone Chauffeur' : 'Driver Phone'}</Label>
                <Input
                  id="driverPhone"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  data-testid="input-driver-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vehiclePlate">{language === 'fr' ? 'Plaque' : 'Vehicle Plate'} *</Label>
                <Input
                  id="vehiclePlate"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="ABC-123"
                  data-testid="input-vehicle-plate"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">{language === 'fr' ? 'Capacité' : 'Capacity'}</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="40"
                  data-testid="input-capacity"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">{language === 'fr' ? 'Heure Départ' : 'Start Time'}</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  data-testid="input-start-time"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
                data-testid="checkbox-is-active"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {language === 'fr' ? 'Route Active' : 'Active Route'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRouteDialogOpen(false)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmitRoute}
              disabled={createRouteMutation.isPending || updateRouteMutation.isPending}
              data-testid="button-submit-route"
            >
              {createRouteMutation.isPending || updateRouteMutation.isPending
                ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                : (language === 'fr' ? 'Enregistrer' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Station Dialog */}
      <Dialog open={isStationDialogOpen} onOpenChange={setIsStationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Nouvelle Station' : 'New Station'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr' 
                ? 'Ajoutez une station à la route' 
                : 'Add a station to the route'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="routeSelect">{language === 'fr' ? 'Route' : 'Route'} *</Label>
              <Select 
                value={routeIdForStation?.toString()} 
                onValueChange={(value) => setRouteIdForStation(parseInt(value))}
              >
                <SelectTrigger data-testid="select-route">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner une route' : 'Select a route'} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(routes) && routes.map((route: any) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {language === 'fr' ? route.busNameFr : route.busNameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stationName">{language === 'fr' ? 'Nom de la station' : 'Station Name'} *</Label>
              <Input
                id="stationName"
                value={stationName}
                onChange={(e) => handleStationNameChange(e.target.value)}
                placeholder={language === 'fr' ? 'Carrefour Central' : 'Central Junction'}
                data-testid="input-station-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">{language === 'fr' ? 'Latitude' : 'Latitude'} *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="3.8480"
                  data-testid="input-latitude"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">{language === 'fr' ? 'Longitude' : 'Longitude'} *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="11.5021"
                  data-testid="input-longitude"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stationTime">{language === 'fr' ? 'Heure' : 'Time'}</Label>
                <Input
                  id="stationTime"
                  type="time"
                  value={stationTime}
                  onChange={(e) => setStationTime(e.target.value)}
                  data-testid="input-station-time"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orderIndex">{language === 'fr' ? 'Ordre' : 'Order'}</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                  placeholder="1"
                  data-testid="input-order-index"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStationDialogOpen(false)}>
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmitStation}
              disabled={createStationMutation.isPending}
              data-testid="button-submit-station"
            >
              {createStationMutation.isPending
                ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                : (language === 'fr' ? 'Enregistrer' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
