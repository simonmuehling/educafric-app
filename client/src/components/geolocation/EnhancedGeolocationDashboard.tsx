import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Route, 
  Shield, 
  Clock, 
  Users, 
  AlertTriangle, 
  Activity,
  Target,
  Zap,
  Brain,
  TrendingUp,
  CheckCircle,
  XCircle,
  Navigation,
  UserCheck,
  Bell,
  BarChart3
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface RouteOptimization {
  studentId: number;
  currentLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  optimizedRoute: RoutePoint[];
  estimatedTime: number;
  safetyScore: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
  safetyLevel: 'high' | 'medium' | 'low';
  checkpoints: string[];
}

interface AttendanceAutomation {
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'auto_marked';
  location: { latitude: number; longitude: number };
  accuracy: number;
  timestamp: Date;
  confidence: number;
}

interface EmergencyResponse {
  alertId: number;
  responseLevel: 'low' | 'medium' | 'high' | 'critical';
  autoActions: string[];
  contactsNotified: number[];
  estimatedResponse: number;
  nearbyResources: EmergencyResource[];
}

interface EmergencyResource {
  type: 'police' | 'medical' | 'fire' | 'school_security';
  distance: number;
  contact: string;
  estimatedArrival: number;
}

export default function EnhancedGeolocationDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('route-optimization');
  const [selectedStudent, setSelectedStudent] = useState<number>(15);
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [routeDestination, setRouteDestination] = useState({
    latitude: 4.0511,
    longitude: 9.7679
  });

  // System status query
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/sandbox/geolocation/enhanced/system/status'],
    queryFn: async () => {
      const response = await fetch('/api/sandbox/geolocation/enhanced/system/status');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch system status');
      }
      return await response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Route optimization mutation
  const routeOptimizationMutation = useMutation({
    mutationFn: async (data: { studentId: number; destinationLat: number; destinationLng: number }) => {
      const response = await fetch('/api/sandbox/geolocation/enhanced/route/optimize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to optimize route');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Route optimisée",
        description: `Route calculée avec ${data.data.optimizedRoute.length} points de passage`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'optimisation",
        description: error.message || "Impossible d'optimiser la route",
        variant: "destructive"
      });
    }
  });

  // Attendance automation mutation
  const attendanceAutomationMutation = useMutation({
    mutationFn: async (data: { schoolId: number; classId: number }) => {
      const response = await fetch('/api/sandbox/geolocation/enhanced/attendance/automate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to automate attendance');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Présences automatisées",
        description: `${data.summary.present} présents, ${data.summary.absent} absents sur ${data.summary.total} élèves`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'automatisation",
        description: error.message || "Impossible d'automatiser les présences",
        variant: "destructive"
      });
    }
  });

  // Emergency response mutation
  const emergencyResponseMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/sandbox/geolocation/enhanced/emergency/trigger/${alertId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to trigger emergency response');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Réponse d'urgence activée",
        description: `Niveau ${data.data.responseLevel} - ${data.data.contactsNotified.length} contacts notifiés`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de réponse d'urgence",
        description: error.message || "Impossible d'activer la réponse d'urgence",
        variant: "destructive"
      });
    }
  });

  // AI route learning mutation
  const aiRouteLearningMutation = useMutation({
    mutationFn: async (data: { schoolId: number; analysisType: string }) => {
      const response = await fetch('/api/sandbox/geolocation/enhanced/ai/learn-routes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to run AI learning');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Apprentissage IA terminé",
        description: `${data.data.patternsIdentified} modèles identifiés avec ${data.data.confidence}% de confiance`,
        variant: "default"
      });
    }
  });

  // Attendance prediction mutation
  const attendancePredictionMutation = useMutation({
    mutationFn: async (data: { classId: number; predictionDays: number }) => {
      const response = await fetch('/api/sandbox/geolocation/enhanced/ai/predict-attendance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to predict attendance');
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Prédictions générées",
        description: `Présence moyenne prévue: ${data.data.averageAttendance.toFixed(1)}%`,
        variant: "default"
      });
    }
  });

  const handleRouteOptimization = () => {
    routeOptimizationMutation.mutate({
      studentId: selectedStudent,
      destinationLat: routeDestination.latitude,
      destinationLng: routeDestination.longitude
    });
  };

  const handleAttendanceAutomation = () => {
    attendanceAutomationMutation.mutate({
      schoolId: 1,
      classId: selectedClass
    });
  };

  const handleEmergencyTest = () => {
    emergencyResponseMutation.mutate(999999); // Test alert ID
  };

  const handleAIRouteLearning = (analysisType: string) => {
    aiRouteLearningMutation.mutate({
      schoolId: 1,
      analysisType
    });
  };

  const handleAttendancePrediction = () => {
    attendancePredictionMutation.mutate({
      classId: selectedClass,
      predictionDays: 7
    });
  };

  const getResponseLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6" data-testid="enhanced-geolocation-dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Géolocalisation Avancée Educafric
          </h1>
          <p className="text-gray-600 text-lg">
            Optimisation de routes • Automatisation présences • Protocoles d'urgence
          </p>
        </div>

        {/* System Status Overview */}
        {systemStatus && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                État du Système en Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Optimisation Routes</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {systemStatus.data.services.routeOptimization.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Routes optimisées: {systemStatus.data.statistics.routesOptimizedToday}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Automatisation</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {systemStatus.data.services.attendanceAutomation.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Présences: {systemStatus.data.statistics.attendanceAutomatedToday}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Urgences</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {systemStatus.data.services.emergencyResponse.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Réponses: {systemStatus.data.statistics.emergencyResponsesTriggered}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="route-optimization" className="flex items-center gap-2" data-testid="tab-route-optimization">
              <Route className="h-4 w-4" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="attendance-automation" className="flex items-center gap-2" data-testid="tab-attendance-automation">
              <UserCheck className="h-4 w-4" />
              Présences
            </TabsTrigger>
            <TabsTrigger value="emergency-response" className="flex items-center gap-2" data-testid="tab-emergency-response">
              <Shield className="h-4 w-4" />
              Urgences
            </TabsTrigger>
            <TabsTrigger value="ai-features" className="flex items-center gap-2" data-testid="tab-ai-features">
              <Brain className="h-4 w-4" />
              IA & Prédictions
            </TabsTrigger>
          </TabsList>

          {/* Route Optimization Tab */}
          <TabsContent value="route-optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-blue-600" />
                  Optimisation de Routes Intelligente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Élève</label>
                    <Select value={selectedStudent.toString()} onValueChange={(value) => setSelectedStudent(parseInt(value))}>
                      <SelectTrigger data-testid="select-student">
                        <SelectValue placeholder="Sélectionner un élève" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Emma Talla (Tablette Active)</SelectItem>
                        <SelectItem value="16">Amadou Diallo (Montre GPS)</SelectItem>
                        <SelectItem value="17">Marie Kouame (Smartphone)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destination (Douala)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Latitude"
                        value={routeDestination.latitude}
                        onChange={(e) => setRouteDestination(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-destination-lat"
                      />
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Longitude"
                        value={routeDestination.longitude}
                        onChange={(e) => setRouteDestination(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        data-testid="input-destination-lng"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleRouteOptimization}
                  disabled={routeOptimizationMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600"
                  data-testid="button-optimize-route"
                >
                  {routeOptimizationMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Optimisation en cours...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Optimiser la Route
                    </>
                  )}
                </Button>

                {routeOptimizationMutation.data && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium text-green-800">Route optimisée avec succès</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Points de passage:</span> {routeOptimizationMutation.data.data.optimizedRoute.length}
                          </div>
                          <div>
                            <span className="font-medium">Temps estimé:</span> {routeOptimizationMutation.data.data.estimatedTime} min
                          </div>
                          <div>
                            <span className="font-medium">Score sécurité:</span> {routeOptimizationMutation.data.data.safetyScore}%
                          </div>
                          <div>
                            <Badge className={getSafetyLevelColor('high')}>
                              Sécurisé
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Automation Tab */}
          <TabsContent value="attendance-automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Automatisation des Présences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Classe</label>
                    <Select value={selectedClass.toString()} onValueChange={(value) => setSelectedClass(parseInt(value))}>
                      <SelectTrigger data-testid="select-class">
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">6ème A (28 élèves)</SelectItem>
                        <SelectItem value="2">5ème B (25 élèves)</SelectItem>
                        <SelectItem value="3">4ème C (30 élèves)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAttendanceAutomation}
                      disabled={attendanceAutomationMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                      data-testid="button-automate-attendance"
                    >
                      {attendanceAutomationMutation.isPending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Automatisation...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Automatiser Présences
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {attendanceAutomationMutation.data && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="font-medium text-blue-800">Automatisation terminée</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(attendanceAutomationMutation.data.summary).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{value as number}</div>
                              <div className="text-xs text-gray-600 capitalize">
                                {key === 'total' ? 'Total' :
                                 key === 'present' ? 'Présents' :
                                 key === 'absent' ? 'Absents' :
                                 key === 'late' ? 'Retards' :
                                 key === 'autoMarked' ? 'Auto-marqués' : key}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Response Tab */}
          <TabsContent value="emergency-response" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Protocoles de Réponse d'Urgence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Les tests d'urgence sont simulés et n'envoient pas de vraies alertes aux autorités.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleEmergencyTest}
                  disabled={emergencyResponseMutation.isPending}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-test-emergency"
                >
                  {emergencyResponseMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Tester Protocole d'Urgence
                    </>
                  )}
                </Button>

                {emergencyResponseMutation.data && (
                  <Alert className="border-red-200 bg-red-50">
                    <Shield className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="font-medium text-red-800">
                          Réponse d'urgence simulée - Niveau {emergencyResponseMutation.data.data.responseLevel}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getResponseLevelColor(emergencyResponseMutation.data.data.responseLevel)}`}></div>
                            <span className="text-sm">
                              {emergencyResponseMutation.data.data.contactsNotified.length} contacts notifiés
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Actions automatiques: {emergencyResponseMutation.data.data.autoActions.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Temps de réponse estimé: {emergencyResponseMutation.data.data.estimatedResponse} minutes
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Features Tab */}
          <TabsContent value="ai-features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Apprentissage IA Routes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {['daily_patterns', 'safety_optimization', 'traffic_analysis'].map((type) => (
                      <Button
                        key={type}
                        onClick={() => handleAIRouteLearning(type)}
                        disabled={aiRouteLearningMutation.isPending}
                        variant="outline"
                        className="w-full justify-start"
                        data-testid={`button-ai-${type}`}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {type === 'daily_patterns' ? 'Analyser Habitudes Quotidiennes' :
                         type === 'safety_optimization' ? 'Optimiser Sécurité' :
                         'Analyser Trafic'}
                      </Button>
                    ))}
                  </div>

                  {aiRouteLearningMutation.data && (
                    <Alert className="border-purple-200 bg-purple-50">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium text-purple-800">Apprentissage IA terminé</div>
                          <div className="text-sm space-y-1">
                            <div>Modèles identifiés: {aiRouteLearningMutation.data.data.patternsIdentified}</div>
                            <div>Optimisations trouvées: {aiRouteLearningMutation.data.data.optimizationsFound}</div>
                            <div>Confiance: {aiRouteLearningMutation.data.data.confidence}%</div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Prédictions Présences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleAttendancePrediction}
                    disabled={attendancePredictionMutation.isPending}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    data-testid="button-predict-attendance"
                  >
                    {attendancePredictionMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Prédiction...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Prédire Présences (7 jours)
                      </>
                    )}
                  </Button>

                  {attendancePredictionMutation.data && (
                    <Alert className="border-indigo-200 bg-indigo-50">
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium text-indigo-800">Prédictions générées</div>
                          <div className="text-sm space-y-1">
                            <div>Présence moyenne: {attendancePredictionMutation.data.data.averageAttendance.toFixed(1)}%</div>
                            <div>Confiance globale: {attendancePredictionMutation.data.data.overallConfidence.toFixed(1)}%</div>
                            <div>Prédictions: {attendancePredictionMutation.data.data.predictions.length} jours</div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Performance Metrics */}
        {systemStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Métriques de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Optimisation Routes</span>
                    <span className="text-sm text-gray-600">{systemStatus.data.performance.routeOptimizationAvgTime}</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux Automatisation</span>
                    <span className="text-sm text-gray-600">{systemStatus.data.performance.attendanceProcessingRate}</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temps Réponse Urgence</span>
                    <span className="text-sm text-gray-600">{systemStatus.data.performance.emergencyResponseTime}</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}