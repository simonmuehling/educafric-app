import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Smartphone, Users, Shield, Settings, BarChart3, 
  AlertTriangle, Eye, Zap, Clock, Battery, Map, Plus,
  AlertCircle, CheckCircle, XCircle, Navigation, Home, BookOpen,
  RefreshCw
} from 'lucide-react';

interface GeolocationStats {
  activeStudents: number;
  totalStudents: number;
  teachingZones: number;
  completedSessions: number;
}

interface Student {
  id: number;
  studentName: string;
  subject: string;
  status: string;
  lastUpdate: string;
  location: string;
}

interface TeachingZone {
  id: number;
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
  radius: number;
  studentsToday: number;
}

interface Session {
  id: number;
  studentName: string;
  subject: string;
  startTime: string;
  duration: string;
  status: string;
  location: string;
}

const FreelancerGeolocation = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null);

  const t = language === 'fr' ? {
    title: 'Géolocalisation Élèves',
    subtitle: 'Suivi sécurisé des cours particuliers',
    overview: 'Vue d\'Ensemble',
    students: 'Élèves',
    zones: 'Zones de Cours',
    sessions: 'Sessions',
    activeStudents: 'Élèves Actifs',
    totalStudents: 'Total Élèves',
    teachingZones: 'Zones de Cours',
    completedSessions: 'Sessions Terminées',
    viewMap: 'Voir Carte',
    configureAlerts: 'Config. Alertes',
    addTeachingZone: 'Ajouter Zone',
    zoneName: 'Nom de la Zone',
    radius: 'Rayon (mètres)',
    address: 'Adresse ou Description',
    zoneType: 'Type de Zone',
    setOnMap: 'Définir sur la carte',
    clickToSelect: 'Cliquez sur la carte pour sélectionner',
    coordinates: 'Coordonnées',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    inSession: 'En Session',
    completed: 'Terminé',
    absent: 'Absent'
  } : {
    title: 'Student Geolocation',
    subtitle: 'Secure tracking for private lessons',
    overview: 'Overview',
    students: 'Students',
    zones: 'Teaching Zones',
    sessions: 'Sessions',
    activeStudents: 'Active Students',
    totalStudents: 'Total Students',
    teachingZones: 'Teaching Zones',
    completedSessions: 'Completed Sessions',
    viewMap: 'View Map',
    configureAlerts: 'Config. Alerts',
    addTeachingZone: 'Add Zone',
    zoneName: 'Zone Name',
    radius: 'Radius (meters)',
    address: 'Address or Description',
    zoneType: 'Zone Type',
    setOnMap: 'Set on map',
    clickToSelect: 'Click on map to select',
    coordinates: 'Coordinates',
    save: 'Save',
    cancel: 'Cancel',
    inSession: 'In Session',
    completed: 'Completed',
    absent: 'Absent'
  };

  // Fetch geolocation stats from API
  const { data: stats, isLoading: statsLoading } = useQuery<GeolocationStats>({
    queryKey: ['/api/freelancer/geolocation/stats'],
    queryFn: async () => {
      console.log('[FREELANCER_GEOLOCATION] 🔍 Fetching stats...');
      const response = await fetch('/api/freelancer/geolocation/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[FREELANCER_GEOLOCATION] ❌ Failed to fetch stats');
        throw new Error('Failed to fetch geolocation stats');
      }
      const data = await response.json();
      console.log('[FREELANCER_GEOLOCATION] ✅ Stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch students from API
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/freelancer/geolocation/students'],
    queryFn: async () => {
      console.log('[FREELANCER_GEOLOCATION] 🔍 Fetching students...');
      const response = await fetch('/api/freelancer/geolocation/students', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[FREELANCER_GEOLOCATION] ❌ Failed to fetch students');
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('[FREELANCER_GEOLOCATION] ✅ Students loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch teaching zones from API
  const { data: teachingZones = [], isLoading: zonesLoading } = useQuery<TeachingZone[]>({
    queryKey: ['/api/freelancer/geolocation/zones'],
    queryFn: async () => {
      console.log('[FREELANCER_GEOLOCATION] 🔍 Fetching zones...');
      const response = await fetch('/api/freelancer/geolocation/zones', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[FREELANCER_GEOLOCATION] ❌ Failed to fetch zones');
        throw new Error('Failed to fetch teaching zones');
      }
      const data = await response.json();
      console.log('[FREELANCER_GEOLOCATION] ✅ Zones loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch sessions from API
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ['/api/freelancer/geolocation/sessions'],
    queryFn: async () => {
      console.log('[FREELANCER_GEOLOCATION] 🔍 Fetching sessions...');
      const response = await fetch('/api/freelancer/geolocation/sessions', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[FREELANCER_GEOLOCATION] ❌ Failed to fetch sessions');
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      console.log('[FREELANCER_GEOLOCATION] ✅ Sessions loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Add teaching zone mutation
  const addZoneMutation = useMutation({
    mutationFn: async (zoneData: any) => {
      const response = await fetch('/api/freelancer/geolocation/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add zone');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/geolocation/zones'] });
      queryClient.invalidateQueries({ queryKey: ['/api/freelancer/geolocation/stats'] });
      setShowAddZoneModal(false);
      setSelectedCoordinates(null);
      toast({
        title: language === 'fr' ? 'Zone ajoutée' : 'Zone added',
        description: language === 'fr' ? 'Zone d\'enseignement créée avec succès' : 'Teaching zone created successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de créer la zone' : 'Failed to create zone',
        variant: 'destructive'
      });
    }
  });

  const handleInteractiveSelection = () => {
    toast({
      title: language === 'fr' ? 'Carte Interactive' : 'Interactive Map',
      description: language === 'fr' ? 
        'Mode sélection activé - Cliquez sur la carte pour définir la zone de cours' : 
        'Selection mode enabled - Click on map to set teaching zone',
    });
    // Simulation de sélection de coordonnées
    setSelectedCoordinates({ lat: 3.8480, lng: 11.5021 });
  };

  const handleAddZone = () => {
    if (!selectedCoordinates) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner une position sur la carte' : 'Please select a position on the map',
        variant: 'destructive'
      });
      return;
    }

    addZoneMutation.mutate({
      name: 'Nouvelle Zone Cours',
      type: 'teaching_center',
      coordinates: selectedCoordinates,
      radius: 100,
      description: 'Zone d\'enseignement créée interactivement'
    });
  };

  const handleViewStudents = () => {
    const activeStudents = (Array.isArray(students) ? students : []).filter((s: any) => s.status === 'inSession' || s.status === 'active').length;
    toast({
      title: language === 'fr' ? 'Élèves Actifs' : 'Active Students',
      description: language === 'fr' ? `${activeStudents} élèves connectés actuellement` : `${activeStudents} students currently connected`
    });
  };

  const handleConfigureZones = () => {
    toast({
      title: language === 'fr' ? 'Zones Configurées' : 'Configured Zones',
      description: language === 'fr' ? `${(Array.isArray(teachingZones) ? teachingZones.length : 0)} zones d'enseignement actives` : `${(Array.isArray(teachingZones) ? teachingZones.length : 0)} active teaching zones`
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      inSession: { color: 'bg-green-100 text-green-800', text: t.inSession, icon: <CheckCircle className="w-3 h-3" /> },
      completed: { color: 'bg-blue-100 text-blue-800', text: t.completed, icon: <CheckCircle className="w-3 h-3" /> },
      absent: { color: 'bg-red-100 text-red-800', text: t.absent, icon: <XCircle className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'educational': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'residential': return <Home className="w-4 h-4 text-green-500" />;
      case 'library': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  if (statsLoading || studentsLoading || zonesLoading || sessionsLoading) {
    return (
      <div className="space-y-6 p-6 bg-white">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {language === 'fr' ? 'Chargement des données géolocalisation...' : 'Loading geolocation data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleViewStudents}>
            <Map className="w-4 h-4" />
            {t.students}
          </Button>
          <Button className="flex items-center gap-2" onClick={handleConfigureZones}>
            <Settings className="w-4 h-4" />
            {t.zones}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="students">{t.students}</TabsTrigger>
          <TabsTrigger value="zones">{t.zones}</TabsTrigger>
          <TabsTrigger value="sessions">{t.sessions}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.activeStudents}</p>
                  <p className="text-2xl font-bold">{stats?.activeStudents || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.totalStudents}</p>
                  <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <MapPin className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.teachingZones}</p>
                  <p className="text-2xl font-bold">{stats?.teachingZones || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t.completedSessions}</p>
                  <p className="text-2xl font-bold">{stats?.completedSessions || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {(Array.isArray(students) ? students : []).map((student) => (
            <Card key={student.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">{student.studentName}</h4>
                    <p className="text-sm text-gray-600">{student.subject}</p>
                    <p className="text-sm text-gray-600">{student.location}</p>
                    <p className="text-xs text-gray-500">{student.lastUpdate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(student.status)}
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Zones de Cours Configurées</h3>
            <Dialog open={showAddZoneModal} onOpenChange={setShowAddZoneModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t.addTeachingZone}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader className="bg-white">
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    {language === 'fr' ? 'Ajouter une Zone de Cours' : 'Add Teaching Zone'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4 bg-white">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">{t.zoneName}</label>
                    <Input placeholder="Ex: Domicile élève Quartier X" className="w-full bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">{t.address}</label>
                    <Input placeholder="Près de..., à côté de..." className="w-full bg-white" />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full mt-2 bg-white"
                      onClick={handleInteractiveSelection}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {t.setOnMap}
                    </Button>
                    {selectedCoordinates && (
                      <div className="p-2 bg-green-50 rounded text-sm">
                        <p className="font-medium text-green-800">{t.coordinates}:</p>
                        <p className="text-green-700">
                          Lat: {selectedCoordinates.lat}, Lng: {selectedCoordinates.lng}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {language === 'fr' ? 'Position définie sur la carte' : 'Position set on map'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">{t.radius}</label>
                    <Input placeholder="150" type="number" className="w-full bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">{t.zoneType}</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="residential">{language === 'fr' ? 'Domicile Élève' : 'Student Home'}</option>
                      <option value="educational">{language === 'fr' ? 'Centre de Cours' : 'Learning Center'}</option>
                      <option value="library">{language === 'fr' ? 'Bibliothèque' : 'Library'}</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4 bg-white">
                    <Button 
                      className="flex-1" 
                      onClick={handleAddZone}
                      disabled={addZoneMutation.isPending}
                    >
                      {t.save}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-white" 
                      onClick={() => {
                        setShowAddZoneModal(false);
                        setSelectedCoordinates(null);
                      }}
                    >
                      {t.cancel}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(Array.isArray(teachingZones) ? teachingZones : []).map((zone) => (
            <Card key={zone.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getZoneIcon(zone.type)}
                  <div>
                    <h4 className="font-semibold">{zone.name || ''}</h4>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Coordonnées' : 'Coordinates'}: {zone?.coordinates?.lat}, {zone?.coordinates?.lng}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Rayon' : 'Radius'}: {zone.radius}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {zone.studentsToday} élèves aujourd'hui
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {(Array.isArray(sessions) ? sessions : []).map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">{session.studentName}</h4>
                    <p className="text-sm text-gray-600">{session.subject}</p>
                    <p className="text-sm text-gray-600">{session.location}</p>
                    <p className="text-xs text-gray-500">{session.startTime} - {session.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(session.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FreelancerGeolocation;