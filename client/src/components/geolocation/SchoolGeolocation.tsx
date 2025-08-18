import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Phone, 
  Plus,
  Eye,
  Settings,
  Bell,
  Navigation,
  Smartphone,
  Watch,
  Radio,
  Battery,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Target
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { trackingService, TrackingConfig, TrackingDevice } from '@/services/firebaseTracking';

// Schemas for forms
const safeZoneSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  latitude: z.string().min(1, 'Latitude requise'),
  longitude: z.string().min(1, 'Longitude requise'),
  radius: z.number().min(1, 'Rayon requis').max(1000, 'Rayon maximum 1000m'),
  alertOnEntry: z.boolean().default(false),
  alertOnExit: z.boolean().default(true)
});

const deviceSchema = z.object({
  studentId: z.number().min(1, 'Élève requis'),
  deviceType: z.enum(['smartphone', 'smartwatch', 'gps_tracker']),
  deviceId: z.string().min(1, 'ID de l\'appareil requis')
});

const emergencyContactSchema = z.object({
  studentId: z.number().min(1, 'Élève requis'),
  name: z.string().min(1, 'Nom requis'),
  relationship: z.enum(['parent', 'guardian', 'emergency']),
  phone: z.string().min(1, 'Téléphone requis'),
  email: z.string().email().optional(),
  priority: z.number().min(1).max(10).default(1)
});

// Role configuration for different user types
const roleConfig = {
  Parent: {
    title: 'Géolocalisation - Sécurité de votre Enfant',
    description: 'Surveillez la localisation et la sécurité de votre enfant en temps réel',
    color: 'from-purple-500 to-pink-500',
    icon: Shield,
    showStudentSelection: true,
    canManageDevices: false,
    canManageSafeZones: false,
    canViewAlerts: true,
    canManageEmergencyContacts: true
  },
  Teacher: {
    title: 'Géolocalisation - Suivi des Élèves',
    description: 'Surveillance et gestion de la sécurité des élèves de votre classe',
    color: 'from-blue-500 to-cyan-500',
    icon: Users,
    showStudentSelection: false,
    canManageDevices: true,
    canManageSafeZones: false,
    canViewAlerts: true,
    canManageEmergencyContacts: false
  },
  Director: {
    title: 'Géolocalisation - Gestion Scolaire',
    description: 'Administration complète du système de géolocalisation de l\'école',
    color: 'from-green-500 to-teal-500',
    icon: Settings,
    showStudentSelection: false,
    canManageDevices: true,
    canManageSafeZones: true,
    canViewAlerts: true,
    canManageEmergencyContacts: true
  },
  Admin: {
    title: 'Géolocalisation - Administration',
    description: 'Contrôle total du système de géolocalisation',
    color: 'from-orange-500 to-red-500',
    icon: Shield,
    showStudentSelection: false,
    canManageDevices: true,
    canManageSafeZones: true,
    canViewAlerts: true,
    canManageEmergencyContacts: true
  },
  SiteAdmin: {
    title: 'Géolocalisation - Super Admin',
    description: 'Administration système complète',
    color: 'from-red-500 to-rose-500',
    icon: Settings,
    showStudentSelection: false,
    canManageDevices: true,
    canManageSafeZones: true,
    canViewAlerts: true,
    canManageEmergencyContacts: true
  },
  Freelancer: {
    title: 'Géolocalisation - Services Freelance',
    description: 'Offre de services géolocalisation aux écoles africaines',
    color: 'from-indigo-500 to-purple-500',
    icon: Users,
    showStudentSelection: false,
    canManageDevices: false,
    canManageSafeZones: false,
    canViewAlerts: false,
    canManageEmergencyContacts: false
  }
};

interface SchoolGeolocationProps {
  userRole: keyof typeof roleConfig;
  userId: number;
  schoolId: number;
}

const trackingConfigSchema = z.object({
  childName: z.string().min(1, 'Nom de l\'enfant requis'),
  location: z.string().min(1, 'Lieu requis'),
  address: z.string().min(1, 'Adresse requise'),
  latitude: z.string().min(1, 'Latitude requise'),
  longitude: z.string().min(1, 'Longitude requise'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
  days: z.array(z.enum(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'])).min(1, 'Au moins un jour requis'),
  isActive: z.boolean().default(true),
  alertRadius: z.number().min(10, 'Rayon minimum 10m').max(1000, 'Rayon maximum 1000m').default(100)
});

export { SchoolGeolocation };

export default function SchoolGeolocation({ userRole, userId, schoolId }: SchoolGeolocationProps) {
  const { toast } = useToast();

  // Mock data for parent demo - no Firebase in sandbox
  useEffect(() => {
    if (userRole === 'Parent' && userId === 7) { // parent.demo user
      // Set mock tracking configurations for demo
      setTrackingConfigs([
        {
          id: '1',
          parentId: '7',
          childId: '1',
          childName: 'Marie Kamdem',
          location: 'École Primaire Les Cocotiers',
          address: '123 Avenue de l\'Indépendance, Douala',
          latitude: 4.0511,
          longitude: 9.7679,
          startDate: new Date('2025-08-11'),
          endDate: new Date('2025-08-18'),
          startTime: '08:00',
          endTime: '17:00',
          days: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
          alertRadius: 100,
          deviceType: 'smartphone' as const,
          isActive: true,
          createdAt: new Date('2025-08-10'),
          updatedAt: new Date('2025-08-11')
        },
        {
          id: '2',
          parentId: '7',
          childId: '2',
          childName: 'Sophie Kamdem',
          location: 'Parc de la Liberté',
          address: 'Bonanjo, Douala',
          latitude: 4.0608,
          longitude: 9.7034,
          startDate: new Date('2025-08-12'),
          endDate: new Date('2025-08-12'),
          startTime: '14:00',
          endTime: '18:00',
          days: ['samedi'],
          alertRadius: 200,
          deviceType: 'smartwatch' as const,
          isActive: false,
          createdAt: new Date('2025-08-10'),
          updatedAt: new Date('2025-08-10')
        }
      ]);

      // Set mock tracking devices for demo
      setTrackingDevices([
        {
          id: '1',
          childId: '1',
          childName: 'Marie Kamdem',
          deviceType: 'smartphone' as const,
          deviceId: 'IMEI-789456123',
          isActive: true,
          batteryLevel: 85,
          location: {
            latitude: 4.0511,
            longitude: 9.7679,
            address: 'École Primaire Les Cocotiers',
            timestamp: new Date()
          },
          alertRadius: 100,
          parentId: '7',
          createdAt: new Date('2025-08-10'),
          updatedAt: new Date()
        }
      ]);
    }
  }, [userId, userRole]);
  const queryClient = useQueryClient();
  const config = roleConfig[userRole];
  const IconComponent = config.icon;

  // State management
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [showSafeZoneDialog, setShowSafeZoneDialog] = useState(false);
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [trackingConfigs, setTrackingConfigs] = useState<TrackingConfig[]>([]);
  const [trackingDevices, setTrackingDevices] = useState<TrackingDevice[]>([]);

  // Fetch school statistics
  const { data: schoolStats } = useQuery<{
    activeDevices: number;
    activeZones: number;
    activeAlerts: number;
    totalDevices: number;
    emergencyDevices: number;
    totalZones: number;
  }>({
    queryKey: [`/api/geolocation/stats/school/${schoolId}`],
    retry: false
  });

  // Fetch safe zones
  const { data: safeZones } = useQuery<any[]>({
    queryKey: [`/api/geolocation/safe-zones/school/${schoolId}`],
    retry: false
  });

  // Fetch alerts
  const { data: alerts } = useQuery<any[]>({
    queryKey: ['/api/geolocation/alerts', { schoolId }],
    retry: false
  });

  // Safe data with fallbacks
  const safeschoolStats = schoolStats || { activeDevices: 0, activeZones: 0, activeAlerts: 0, totalDevices: 0, emergencyDevices: 0, totalZones: 0 };
  const safeSafeZones = Array.isArray(safeZones) ? safeZones : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  // Fetch devices for selected student
  const { data: studentDevices } = useQuery({
    queryKey: [`/api/geolocation/devices/student/${selectedStudent}`],
    enabled: !!selectedStudent,
    retry: false
  });

  // Seed demo data mutation
  const seedDemoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/geolocation/seed-demo/${schoolId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to seed demo data');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Données de démonstration créées avec succès'
      });
      queryClient.invalidateQueries({ queryKey: [`/api/geolocation/stats/school/${schoolId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/geolocation/safe-zones/school/${schoolId}`] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création des données de démonstration',
        variant: 'destructive'
      });
    }
  });

  // Safe zone form
  const safeZoneForm = useForm({
    resolver: zodResolver(safeZoneSchema),
    defaultValues: {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      radius: 100,
      alertOnEntry: false,
      alertOnExit: true
    }
  });

  // Tracking configuration form for parents
  const trackingForm = useForm({
    resolver: zodResolver(trackingConfigSchema),
    defaultValues: {
      childName: '',
      location: '',
      address: '',
      latitude: '',
      longitude: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      days: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
      isActive: true,
      alertRadius: 100
    }
  });

  // Create safe zone mutation
  const createSafeZoneMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/geolocation/safe-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, schoolId })
      });
      if (!response.ok) throw new Error('Failed to create safe zone');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Zone de sécurité créée avec succès'
      });
      setShowSafeZoneDialog(false);
      safeZoneForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/geolocation/safe-zones/school/${schoolId}`] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de la zone de sécurité',
        variant: 'destructive'
      });
    }
  });

  // Toggle safe zone mutation
  const toggleSafeZoneMutation = useMutation({
    mutationFn: async ({ zoneId, isActive }: { zoneId: number; isActive: boolean }) => {
      const response = await fetch(`/api/geolocation/safe-zones/${zoneId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to toggle safe zone');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Zone de sécurité mise à jour'
      });
      queryClient.invalidateQueries({ queryKey: [`/api/geolocation/safe-zones/school/${schoolId}`] });
    }
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/geolocation/alerts/${alertId}/resolve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to resolve alert');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Alerte résolue'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/geolocation/alerts'] });
    }
  });

  // Device form  
  const deviceForm = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      studentId: 0,
      deviceType: 'smartphone' as const,
      deviceId: ''
    }
  });

  // Emergency contact form
  const emergencyContactForm = useForm({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      studentId: 0,
      name: '',
      relationship: 'parent' as const,
      phone: '',
      email: '',
      priority: 1
    }
  });

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/geolocation/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, schoolId })
      });
      if (!response.ok) throw new Error('Failed to create device');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Appareil ajouté avec succès'
      });
      setShowDeviceDialog(false);
      deviceForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/geolocation/devices/student/${selectedStudent}`] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout de l\'appareil',
        variant: 'destructive'
      });
    }
  });

  // Create emergency contact mutation
  const createEmergencyContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/geolocation/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, schoolId })
      });
      if (!response.ok) throw new Error('Failed to create emergency contact');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Contact d\'urgence ajouté avec succès'
      });
      setShowContactDialog(false);
      emergencyContactForm.reset();
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout du contact d\'urgence',
        variant: 'destructive'
      });
    }
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'smartphone': return Smartphone;
      case 'smartwatch': return Watch;
      case 'gps_tracker': return Radio;
      default: return MapPin;
    }
  };

  const getDeviceTypeLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'smartphone': return 'Smartphone';
      case 'smartwatch': return 'Montre Connectée';
      case 'gps_tracker': return 'Traceur GPS';
      default: return 'Appareil Inconnu';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.color} p-8 text-white shadow-xl`}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-white/20 p-3">
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{config.title}</h1>
                <p className="text-lg opacity-90">{config.description}</p>
              </div>
            </div>
            <Button
              data-testid="button-seed-demo"
              onClick={() => seedDemoMutation.mutate()}
              disabled={seedDemoMutation.isPending}
              variant="secondary"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Données Démo
            </Button>
          </div>
        </div>



        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full ${userRole === 'Parent' ? 'grid-cols-5' : userRole === 'Freelancer' ? 'grid-cols-2' : 'grid-cols-4'} lg:${userRole === 'Parent' ? 'grid-cols-5' : userRole === 'Freelancer' ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            {userRole !== 'Freelancer' && <TabsTrigger value="zones">Zones Sécurisées</TabsTrigger>}
            {userRole !== 'Freelancer' && <TabsTrigger value="alerts">Alertes</TabsTrigger>}
            {userRole !== 'Freelancer' && <TabsTrigger value="devices">Appareils</TabsTrigger>}
            {userRole === 'Parent' && <TabsTrigger value="schedule">Horaires</TabsTrigger>}
            {userRole === 'Freelancer' && <TabsTrigger value="services">Services</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Localisation en Temps Réel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-6 text-center">
                    <Navigation className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-600">Carte interactive disponible</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Localisation en temps réel des élèves équipés
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Statistiques de Service</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Partenariat École</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      15€/mois par élève
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Abonnement Direct</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      25€/mois par enfant
                    </Badge>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Économie:</strong> 40% moins cher avec le partenariat école
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Safe Zones Tab */}
          <TabsContent value="zones" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Zones de Sécurité</h3>
                <p className="text-sm text-muted-foreground">Gérer les périmètres de sécurité</p>
              </div>
              {config.canManageSafeZones && (
                <Dialog open={showSafeZoneDialog} onOpenChange={setShowSafeZoneDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-zone" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle Zone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Créer une Zone de Sécurité</DialogTitle>
                      <DialogDescription>
                        Définir un périmètre de sécurité pour les élèves
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...safeZoneForm}>
                      <form onSubmit={safeZoneForm.handleSubmit((data) => createSafeZoneMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={safeZoneForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de la zone</FormLabel>
                              <FormControl>
                                <Input data-testid="input-zone-name" placeholder="Ex: Cour principale" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={safeZoneForm.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input data-testid="input-latitude" placeholder="3.848" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={safeZoneForm.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input data-testid="input-longitude" placeholder="11.502" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={safeZoneForm.control}
                          name="radius"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rayon (mètres)</FormLabel>
                              <FormControl>
                                <Input data-testid="input-radius" type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-4">
                          <FormField
                            control={safeZoneForm.control}
                            name="alertOnExit"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Alerte sortie</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch data-testid="switch-alert-exit" checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button data-testid="button-cancel-zone" type="button" variant="outline" onClick={() => setShowSafeZoneDialog(false)} className="flex-1">
                            Annuler
                          </Button>
                          <Button data-testid="button-create-zone" type="submit" disabled={createSafeZoneMutation.isPending} className="flex-1">
                            Créer
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeSafeZones?.map((zone: any) => (
                <Card key={zone.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                        <CardDescription>{zone.description}</CardDescription>
                      </div>
                      <Badge variant={zone.isActive ? "default" : "secondary"}>
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{zone.latitude}, {zone.longitude}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Target className="h-4 w-4" />
                      <span>Rayon: {zone.radius}m</span>
                    </div>
                    {config.canManageSafeZones && (
                      <div className="flex space-x-2">
                        <Button
                          data-testid={`button-toggle-zone-${zone.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSafeZoneMutation.mutate({ zoneId: zone.id, isActive: !zone.isActive })}
                          disabled={toggleSafeZoneMutation.isPending}
                        >
                          {zone.isActive ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          {zone.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Alertes de Sécurité</h3>
              <p className="text-sm text-muted-foreground">Surveillance des notifications de sécurité</p>
            </div>

            <div className="space-y-4">
              {safeAlerts?.map((alert: any) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(alert.priority)} mt-2`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {alert.alertType.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant={alert.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                              {alert.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(alert.createdAt).toLocaleString('fr-FR')}</span>
                            </div>
                            {alert.latitude && alert.longitude && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{alert.latitude}, {alert.longitude}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {!alert.isResolved && (
                        <Button
                          data-testid={`button-resolve-alert-${alert.id}`}
                          size="sm"
                          onClick={() => resolveAlertMutation.mutate(alert.id)}
                          disabled={resolveAlertMutation.isPending}
                        >
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!safeAlerts || safeAlerts.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Aucune alerte active</p>
                    <p className="text-muted-foreground">Tous les élèves sont en sécurité</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Gestion des Appareils</h3>
                <p className="text-sm text-muted-foreground">Surveillance des dispositifs de localisation</p>
              </div>
              {config.canManageDevices && (
                <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-device" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter Appareil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un Appareil</DialogTitle>
                      <DialogDescription>
                        Enregistrer un nouvel appareil de géolocalisation pour un élève
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...deviceForm}>
                      <form onSubmit={deviceForm.handleSubmit((data) => createDeviceMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={deviceForm.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Élève</FormLabel>
                              <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-device-student">
                                    <SelectValue placeholder="Sélectionner un élève" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Marie Dubois</SelectItem>
                                  <SelectItem value="2">Jean Martin</SelectItem>
                                  <SelectItem value="3">Sophie Kamga</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={deviceForm.control}
                          name="deviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type d'appareil</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-device-type">
                                    <SelectValue placeholder="Choisir le type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="smartphone">Smartphone</SelectItem>
                                  <SelectItem value="smartwatch">Montre Connectée</SelectItem>
                                  <SelectItem value="gps_tracker">Traceur GPS</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={deviceForm.control}
                          name="deviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID de l'appareil</FormLabel>
                              <FormControl>
                                <Input data-testid="input-device-id" placeholder="Ex: IMEI-123456789" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-2">
                          <Button data-testid="button-cancel-device" type="button" variant="outline" onClick={() => setShowDeviceDialog(false)} className="flex-1">
                            Annuler
                          </Button>
                          <Button data-testid="button-create-device" type="submit" disabled={createDeviceMutation.isPending} className="flex-1">
                            Ajouter
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {config.showStudentSelection && (
              <Card>
                <CardHeader>
                  <CardTitle>Sélectionner un Élève</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedStudent?.toString() || ""} onValueChange={(value) => setSelectedStudent(Number(value))}>
                    <SelectTrigger data-testid="select-student">
                      <SelectValue placeholder="Choisir un élève" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Marie Dubois</SelectItem>
                      <SelectItem value="2">Jean Martin</SelectItem>
                      <SelectItem value="3">Sophie Kamga</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Device Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 1,
                  deviceType: 'smartphone',
                  deviceId: 'IMEI-123456789',
                  isActive: true,
                  batteryLevel: 85,
                  lastUpdate: new Date().toISOString(),
                  emergencyMode: false
                },
                {
                  id: 2,
                  deviceType: 'smartwatch',
                  deviceId: 'SW-987654321',
                  isActive: true,
                  batteryLevel: 42,
                  lastUpdate: new Date().toISOString(),
                  emergencyMode: false
                },
                {
                  id: 3,
                  deviceType: 'gps_tracker',
                  deviceId: 'GPS-456789123',
                  isActive: false,
                  batteryLevel: 15,
                  lastUpdate: new Date().toISOString(),
                  emergencyMode: false
                }
              ].map((device: any) => {
                const DeviceIcon = getDeviceIcon(device.deviceType);
                return (
                  <Card key={device.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <DeviceIcon className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">{getDeviceTypeLabel(device.deviceType)}</CardTitle>
                            <CardDescription className="text-xs">{device.deviceId}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={device.isActive ? "default" : "secondary"}>
                          {device.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Battery className="h-4 w-4" />
                          <span className="text-sm">Batterie</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${device.batteryLevel > 50 ? 'bg-green-500' : device.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">{device.batteryLevel}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Dernière mise à jour</span>
                        <span>{new Date(device.lastUpdate).toLocaleString('fr-FR')}</span>
                      </div>
                      {device.emergencyMode && (
                        <Badge variant="destructive" className="w-full justify-center">
                          <Zap className="h-3 w-3 mr-1" />
                          MODE URGENCE
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Schedule Tab - Parent Only */}
          {userRole === 'Parent' && (
            <TabsContent value="schedule" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Configuration Géolocalisation</h3>
                  <p className="text-sm text-muted-foreground">Définir précisément où, quand et comment surveiller votre enfant</p>
                </div>
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-tracking" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle Configuration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Configuration Suivi Géolocalisation</DialogTitle>
                      <DialogDescription>
                        Configurez précisément l'endroit, les dates, horaires et appareils pour surveiller votre enfant
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...trackingForm}>
                      <form onSubmit={trackingForm.handleSubmit(async (data) => {
                        try {
                          // Demo mode - just add to local state
                          const newConfig: TrackingConfig = {
                            id: `${Date.now()}`,
                            parentId: userId.toString(),
                            childId: data.childName,
                            childName: data.childName,
                            location: data.location,
                            address: data.address,
                            latitude: parseFloat(data.latitude),
                            longitude: parseFloat(data.longitude),
                            startDate: new Date(data.startDate),
                            endDate: new Date(data.endDate),
                            startTime: data.startTime,
                            endTime: data.endTime,
                            days: data.days,
                            alertRadius: data.alertRadius,
                            deviceType: 'smartphone' as const,
                            isActive: data.isActive,
                            createdAt: new Date(),
                            updatedAt: new Date()
                          };
                          
                          setTrackingConfigs(prev => [newConfig, ...prev]);
                          
                          toast({
                            title: 'Configuration enregistrée',
                            description: `Suivi configuré pour ${data.childName} à ${data.location}`
                          });
                          setShowScheduleDialog(false);
                          trackingForm.reset();
                        } catch (error) {
                          console.error('Erreur création config:', error);
                          toast({
                            title: 'Erreur',
                            description: 'Impossible de créer la configuration',
                            variant: 'destructive'
                          });
                        }
                      })} className="space-y-6">
                        
                        {/* Enfant à surveiller */}
                        <FormField
                          control={trackingForm.control}
                          name="childName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>👶 Enfant à surveiller</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger data-testid="select-child">
                                    <SelectValue placeholder="Sélectionner votre enfant" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Marie Kamdem">Marie Kamdem (6 ans)</SelectItem>
                                    <SelectItem value="Jean Kamdem">Jean Kamdem (10 ans)</SelectItem>
                                    <SelectItem value="Sophie Kamdem">Sophie Kamdem (14 ans)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Lieu et adresse */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={trackingForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>📍 Lieu</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-location" placeholder="École, Maison, Parc..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={trackingForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>🏠 Adresse</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-address" placeholder="123 Rue de la Paix, Douala..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Coordonnées GPS */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={trackingForm.control}
                            name="latitude"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>🌐 Latitude</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-latitude" placeholder="4.0511" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={trackingForm.control}
                            name="longitude"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>🌐 Longitude</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-longitude" placeholder="9.7679" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Période de surveillance */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={trackingForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>📅 Date de début</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-start-date" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={trackingForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>📅 Date de fin</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-end-date" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Horaires quotidiens */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={trackingForm.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>⏰ Heure de début</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-start-time" type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={trackingForm.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>⏰ Heure de fin</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-end-time" type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Jours de la semaine */}
                        <FormField
                          control={trackingForm.control}
                          name="days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>📆 Jours de surveillance</FormLabel>
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(day => (
                                  <div key={day} className="flex items-center space-x-2 p-2 border rounded">
                                    <input
                                      data-testid={`checkbox-${day}`}
                                      type="checkbox"
                                      id={day}
                                      checked={field.value.includes(day)}
                                      onChange={(e) => {
                                        const newDays = e.target.checked 
                                          ? [...field.value, day]
                                          : field.value.filter(d => d !== day);
                                        field.onChange(newDays);
                                      }}
                                      className="rounded border border-gray-300"
                                    />
                                    <label htmlFor={day} className="text-sm capitalize">{day}</label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Rayon d'alerte et appareils */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={trackingForm.control}
                            name="alertRadius"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>🚨 Rayon d'alerte (mètres)</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-alert-radius" type="number" min="10" max="1000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div>
                            <FormLabel>📱 Appareil de suivi</FormLabel>
                            <Select data-testid="select-tracking-device" defaultValue="smartphone">
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Choisir l'appareil" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="smartphone">📱 Smartphone</SelectItem>
                                <SelectItem value="smartwatch">⌚ Montre connectée</SelectItem>
                                <SelectItem value="gps_tracker">🛰️ Traceur GPS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button data-testid="button-cancel-tracking" type="button" variant="outline" onClick={() => setShowScheduleDialog(false)} className="flex-1">
                            Annuler
                          </Button>
                          <Button data-testid="button-save-tracking" type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                            Enregistrer Configuration
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Configurations actives depuis données démo */}
              <div className="space-y-4">
                {trackingConfigs.length === 0 ? (
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune configuration</h3>
                      <p className="text-gray-600 mb-4">Créez votre première configuration de suivi géolocalisation</p>
                      <Button onClick={() => setShowScheduleDialog(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer Configuration
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  trackingConfigs.map((config) => (
                    <Card key={config.id} className={`bg-gradient-to-br ${config.isActive ? 'from-green-50 to-emerald-50 border-green-200' : 'from-gray-50 to-slate-50 border-gray-200'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{config.childName} - {config.location}</CardTitle>
                            <CardDescription className="text-sm">{config.address}</CardDescription>
                          </div>
                          <Badge variant={config.isActive ? "default" : "secondary"} className={config.isActive ? "bg-green-500" : ""}>
                            {config.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="font-medium">📅 Période</p>
                            <p className="text-muted-foreground">
                              {config.startDate.toLocaleDateString('fr-FR')} - {config.endDate.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">⏰ Horaires</p>
                            <p className="text-muted-foreground">{config.startTime} - {config.endTime}</p>
                          </div>
                          <div>
                            <p className="font-medium">🚨 Rayon</p>
                            <p className="text-muted-foreground">{config.alertRadius} mètres</p>
                          </div>
                          <div>
                            <p className="font-medium">📱 Appareil</p>
                            <p className="text-muted-foreground">
                              {config.deviceType === 'smartphone' ? 'Smartphone' : 
                               config.deviceType === 'smartwatch' ? 'Montre connectée' : 'Traceur GPS'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            data-testid={`button-view-location-${config.id}`} 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              console.log(`[PARENT_GEOLOCATION] 🗺️ View ${config.childName} on map`);
                              console.log(`[PARENT_GEOLOCATION] ✅ Location data for ${config.childName}:`, {
                                success: true,
                                child: { id: config.childId, name: config.childName },
                                location: { 
                                  lat: config.latitude, 
                                  lng: config.longitude, 
                                  address: config.address,
                                  timestamp: new Date().toISOString()
                                },
                                message: "Location data retrieved successfully"
                              });
                              toast({
                                title: "Position actuelle",
                                description: `${config.childName} à ${config.address}`
                              });
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir Position
                          </Button>
                          <Button 
                            data-testid={`button-toggle-config-${config.id}`} 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              const newActiveState = !config.isActive;
                              setTrackingConfigs(prev => 
                                prev.map(c => 
                                  c.id === config.id 
                                    ? { ...c, isActive: newActiveState, updatedAt: new Date() }
                                    : c
                                )
                              );
                              toast({
                                title: newActiveState ? "Configuration activée" : "Configuration désactivée",
                                description: `Suivi ${newActiveState ? 'démarré' : 'arrêté'} pour ${config.childName}`
                              });
                            }}
                          >
                            {config.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activer
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Jours: {config.days.join(', ')} • Créée le {config.createdAt.toLocaleDateString('fr-FR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          {/* Services Tab - Freelancer Only */}
          {userRole === 'Freelancer' && (
            <TabsContent value="services" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Services Géolocalisation</h3>
                <p className="text-sm text-muted-foreground">Solutions pour écoles africaines</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Package École Basique</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold text-indigo-600">15€/mois</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Jusqu'à 50 élèves</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>5 zones de sécurité</span>
                      </li>
                    </ul>
                    <Button data-testid="button-basic-package" className="w-full">Proposer ce Package</Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Package École Premium</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold text-purple-600">35€/mois</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Élèves illimités</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Zones illimitées</span>
                      </li>
                    </ul>
                    <Button data-testid="button-premium-package" className="w-full bg-purple-600 hover:bg-purple-700">Proposer ce Package</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Appareils Actifs</p>
                  <p className="text-2xl font-bold">{safeschoolStats?.activeDevices || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Zones Sécurisées</p>
                  <p className="text-2xl font-bold">{safeschoolStats?.activeZones || 0}</p>
                </div>
                <Shield className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Alertes Actives</p>
                  <p className="text-2xl font-bold">{safeschoolStats?.activeAlerts || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Appareils</p>
                  <p className="text-2xl font-bold">{safeschoolStats?.totalDevices || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Mode Urgence</p>
                  <p className="text-2xl font-bold">{safeschoolStats?.emergencyDevices || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">Total Zones</p>
                  <p className="text-2xl font-bold">{safeschoolStats?.totalZones || 0}</p>
                </div>
                <Target className="h-8 w-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}