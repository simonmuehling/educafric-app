import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { 
  MapPin, 
  School, 
  Users, 
  Shield, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  Smartphone,
  Building,
  MessageSquare
} from 'lucide-react';

export default function SchoolGeolocation() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState('overview');

  const t = {
    title: language === 'fr' ? 'Géolocalisation École' : 'School Geolocation',
    subtitle: language === 'fr' ? 'Configuration centralisée et suivi temps réel' : 'Centralized configuration and real-time tracking',
    overview: language === 'fr' ? 'Aperçu' : 'Overview',
    zoneConfig: language === 'fr' ? 'Configuration Zones' : 'Zone Configuration',
    analytics: language === 'fr' ? 'Analyses' : 'Analytics',
    settings: language === 'fr' ? 'Paramètres' : 'Settings',
    studentsTracked: language === 'fr' ? 'Élèves Suivis' : 'Students Tracked',
    safeZones: language === 'fr' ? 'Zones Sécurisées' : 'Safe Zones',
    activeAlerts: language === 'fr' ? 'Alertes Actives' : 'Active Alerts',
    totalStudents: language === 'fr' ? 'Total Élèves' : 'Total Students',
    present: language === 'fr' ? 'Présents' : 'Present',
    absent: language === 'fr' ? 'Absents' : 'Absent',
    delayed: language === 'fr' ? 'Retards' : 'Delayed',
    outOfZone: language === 'fr' ? 'Hors Zone' : 'Out of Zone',
    setupMass: language === 'fr' ? 'Configuration Massive' : 'Mass Setup',
    deploymentGuide: language === 'fr' ? 'Guide de Déploiement' : 'Deployment Guide',
    classManagement: language === 'fr' ? 'Gestion par Classe' : 'Class Management',
    emergencyProtocol: language === 'fr' ? 'Protocole d\'Urgence' : 'Emergency Protocol',
    manageZones: language === 'fr' ? 'Gérer les Zones' : 'Manage Zones',
    createZone: language === 'fr' ? 'Créer une Zone' : 'Create Zone',
    editZone: language === 'fr' ? 'Modifier Zone' : 'Edit Zone',
    deleteZone: language === 'fr' ? 'Supprimer Zone' : 'Delete Zone',
    zoneName: language === 'fr' ? 'Nom de la Zone' : 'Zone Name',
    zoneRadius: language === 'fr' ? 'Rayon (mètres)' : 'Radius (meters)',
    assignToClasses: language === 'fr' ? 'Assigner aux Classes' : 'Assign to Classes',
    scheduleActive: language === 'fr' ? 'Horaires Actifs' : 'Active Schedule',
    parentSubscription: language === 'fr' ? 'Abonnement Parents' : 'Parent Subscription',
    subscribedParents: language === 'fr' ? 'Parents Abonnés' : 'Subscribed Parents',
    pendingSubscriptions: language === 'fr' ? 'Abonnements en Attente' : 'Pending Subscriptions'
  };

  // Demo school data for 500+ students
  const schoolStats = {
    totalStudents: 524,
    studentsWithPhones: 487,
    tracked: 452,
    present: 389,
    absent: 35,
    delayed: 18,
    outOfZone: 10,
    safeZones: 8,
    activeAlerts: 3
  };

  const trackingPercentage = Math.round((schoolStats.tracked / schoolStats.totalStudents) * 100);

  const demoClasses = [
    {
      id: 1,
      name: 'CM2 A',
      totalStudents: 28,
      tracked: 25,
      present: 22,
      teacher: 'Mme Kouam',
      safeZones: ['École Mont-Fébé', 'Cour de Récréation']
    },
    {
      id: 2,
      name: 'CE2 B',
      totalStudents: 32,
      tracked: 29,
      present: 26,
      teacher: 'M. Mbarga',
      safeZones: ['École Mont-Fébé', 'Cantine']
    },
    {
      id: 3,
      name: '6ème Sciences',
      totalStudents: 35,
      tracked: 33,
      present: 31,
      teacher: 'Dr. Tchoumi',
      safeZones: ['École Mont-Fébé', 'Laboratoire', 'Bibliothèque']
    }
  ];

  const demoAlerts = [
    {
      id: 1,
      type: 'warning',
      studentName: 'Marie Tchoumi',
      class: 'CM2 A',
      message: language === 'fr' ? 'Sortie non autorisée détectée' : 'Unauthorized exit detected',
      timestamp: new Date().toISOString(),
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      studentName: 'Lucas Mbongo',
      class: 'CE2 B',
      message: language === 'fr' ? 'Retard de 15 minutes' : '15 minutes late',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      priority: 'medium'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 mb-1 sm:mb-0" />;
      case 'delayed':
        return <Clock className="h-5 w-5 mb-1 sm:mb-0" />;
      case 'absent':
        return <AlertTriangle className="h-5 w-5 mb-1 sm:mb-0" />;
      default:
        return <Activity className="h-5 w-5 mb-1 sm:mb-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-testid="school-geolocation-page">
      <DashboardHeader 
        title={t.title}
        subtitle={t.subtitle}
      />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full" data-testid="geolocation-tabs">
          {/* Mobile-optimized small horizontal icons per user requirement */}
          <TabsList className="flex w-full overflow-x-auto mb-6">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-overview">
              <BarChart3 className="h-5 w-5 mb-1 md:mb-0 md:mr-2" />
              <span className="text-xs sm:text-sm">{t.overview}</span>
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-zones">
              <Shield className="h-5 w-5 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">{t.zoneConfig}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-analytics">
              <Activity className="h-5 w-5 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">{t.analytics}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-settings">
              <Settings className="h-5 w-5 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">{t.settings}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" data-testid="overview-content">
            <div className="space-y-6">
              {/* School-wide Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card data-testid="stat-total-students">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{schoolStats.totalStudents}</p>
                        <p className="text-xs text-gray-600">{t.totalStudents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="stat-tracked-students">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 mb-1 sm:mb-0 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{schoolStats.tracked}</p>
                        <p className="text-xs text-gray-600">{t.studentsTracked}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="stat-present-students">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 mb-1 sm:mb-0 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{schoolStats.present}</p>
                        <p className="text-xs text-gray-600">{t.present}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="stat-active-alerts">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 mb-1 sm:mb-0 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{schoolStats.activeAlerts}</p>
                        <p className="text-xs text-gray-600">{t.activeAlerts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tracking Progress */}
              <Card data-testid="tracking-progress">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                    {language === 'fr' ? 'Couverture Géolocalisation' : 'Geolocation Coverage'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">
                        {language === 'fr' ? 'Élèves équipés et configurés' : 'Students equipped and configured'}
                      </span>
                      <span className="text-xs sm:text-sm">{schoolStats.tracked}/{schoolStats.totalStudents}</span>
                    </div>
                    <Progress value={trackingPercentage} className="h-3" data-testid="tracking-progress-bar" />
                    <div className="text-center">
                      <span className="text-xs sm:text-sm" data-testid="tracking-percentage">{trackingPercentage}%</span>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'de couverture géolocalisation' : 'geolocation coverage'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Class Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="class-overview">
                {demoClasses.map((classData) => (
                  <Card key={classData.id} data-testid={`class-card-${classData.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{classData.name}</span>
                        <Badge variant={classData.tracked === classData.totalStudents ? "default" : "outline"}>
                          {classData.tracked}/{classData.totalStudents}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Enseignant:' : 'Teacher:'}</strong> {classData.teacher}
                      </div>
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Présents:' : 'Present:'}</strong> {classData.present}/{classData.tracked}
                      </div>
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Zones assignées:' : 'Assigned zones:'}</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {classData.safeZones.map((zone, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {zone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-positions-${classData.id}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Voir Positions' : 'View Positions'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Active Alerts */}
              {demoAlerts.length > 0 && (
                <Card data-testid="active-alerts">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 mb-1 sm:mb-0 text-orange-500" />
                      {t.activeAlerts}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {demoAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20" data-testid={`alert-${alert.id}`}>
                          <AlertTriangle className="h-5 w-5 mb-1 sm:mb-0 text-orange-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{alert.studentName} - {alert.class}</p>
                              <Badge variant="outline" className="text-xs border-orange-400 text-orange-800">
                                {alert.priority === 'high' ? 
                                  (language === 'fr' ? 'Priorité Haute' : 'High Priority') : 
                                  (language === 'fr' ? 'Priorité Moyenne' : 'Medium Priority')
                                }
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Zone Configuration Tab */}
          <TabsContent value="zones" data-testid="zones-content">
            <div className="space-y-6">
              <Alert data-testid="schedule-verification-alert">
                <Clock className="h-5 w-5 mb-1 sm:mb-0" />
                <AlertDescription>
                  <strong>{language === 'fr' ? 'Vérification Automatique Emploi du Temps:' : 'Automatic Schedule Verification:'}</strong>{' '}
                  {language === 'fr' 
                    ? 'Le système vérifie automatiquement si les élèves sont dans les zones sécurisées aux heures de début des classes et alerte les parents abonnés en cas d\'absence.'
                    : 'The system automatically checks if students are in safe zones at class start times and alerts subscribed parents if absent.'}
                </AlertDescription>
              </Alert>

              {/* Parent Choice System */}
              <div className="space-y-6">
                <Card data-testid="parent-choice-system">
                  <CardHeader>
                    <CardTitle>{language === 'fr' ? 'Choix des Parents' : 'Parent Choice System'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <Users className="h-5 w-5 mb-1 sm:mb-0" />
                        <AlertDescription>
                          <strong>{language === 'fr' ? 'Liberté de Configuration:' : 'Configuration Freedom:'}</strong>{' '}
                          {language === 'fr' 
                            ? 'Chaque parent peut choisir d\'utiliser la configuration de l\'école ou créer sa propre configuration personnalisée.'
                            : 'Each parent can choose to use the school configuration or create their own personalized configuration.'}
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200" data-testid="school-configuration">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                              {language === 'fr' ? 'Configuration École' : 'School Configuration'}
                            </h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span>{language === 'fr' ? 'Parents utilisant:' : 'Parents using:'}</span>
                              <Badge className="bg-blue-600">{language === 'fr' ? '64 Parents' : '64 Parents'}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {language === 'fr' ? 'Zones scolaires automatiquement synchronisées' : 'School zones automatically synchronized'}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200" data-testid="custom-configuration">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-5 w-5 mb-1 sm:mb-0 text-green-500" />
                            <h4 className="font-semibold text-green-800 dark:text-green-300">
                              {language === 'fr' ? 'Configuration Personnalisée' : 'Custom Configuration'}
                            </h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span>{language === 'fr' ? 'Parents utilisant:' : 'Parents using:'}</span>
                              <Badge className="bg-green-600">{language === 'fr' ? '25 Parents' : '25 Parents'}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {language === 'fr' ? 'Zones personnalisées créées par les parents' : 'Custom zones created by parents'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200" data-testid="choice-system-benefits">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                          {language === 'fr' ? 'Avantages du Système de Choix' : 'Choice System Benefits'}
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                          <li>• {language === 'fr' ? 'Flexibilité totale pour les parents' : 'Complete flexibility for parents'}</li>
                          <li>• {language === 'fr' ? 'Configuration école disponible par défaut' : 'School configuration available by default'}</li>
                          <li>• {language === 'fr' ? 'Zones personnalisées pour besoins spécifiques' : 'Custom zones for specific needs'}</li>
                          <li>• {language === 'fr' ? 'Changement possible à tout moment' : 'Can change at any time'}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card data-testid="proposed-zones">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{language === 'fr' ? 'Zones École Proposées' : 'Proposed School Zones'}</span>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-zone">
                          <MapPin className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Créer Zone' : 'Create Zone'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { 
                            id: 1, 
                            name: 'École Mont-Fébé Principal', 
                            radius: 50, 
                            parentsUsing: 64,
                            active: true,
                            schedule: '07:00-18:00'
                          },
                          { 
                            id: 2, 
                            name: 'Cour de Récréation', 
                            radius: 30, 
                            parentsUsing: 64,
                            active: true,
                            schedule: '10:00-10:30, 15:00-15:30'
                          },
                          { 
                            id: 3, 
                            name: 'Cantine Scolaire', 
                            radius: 25, 
                            parentsUsing: 64,
                            active: true,
                            schedule: '12:00-14:00'
                          },
                          { 
                            id: 4, 
                            name: 'Bibliothèque', 
                            radius: 20, 
                            parentsUsing: 64,
                            active: true,
                            schedule: '08:00-17:00'
                          }
                        ].map((zone) => (
                          <div key={zone.id} className="p-4 border rounded-lg space-y-3" data-testid={`zone-${zone.id}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                                <span className="text-xs sm:text-sm">{zone.name}</span>
                              </div>
                              <Badge variant={zone.active ? "default" : "secondary"}>
                                {zone.active ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>
                                <strong>{language === 'fr' ? 'Rayon:' : 'Radius:'}</strong> {zone.radius}m
                              </div>
                              <div>
                                <strong>{language === 'fr' ? 'Horaires:' : 'Schedule:'}</strong> {zone.schedule}
                              </div>
                              <div>
                                <strong>{language === 'fr' ? 'Parents utilisant:' : 'Parents using:'}</strong> {zone.parentsUsing}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-xs" data-testid={`button-edit-zone-${zone.id}`}>
                                {language === 'fr' ? 'Modifier' : 'Edit'}
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs" data-testid={`button-view-map-${zone.id}`}>
                                <MapPin className="h-4 w-4 mr-1" />
                                {language === 'fr' ? 'Voir Carte' : 'View Map'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="parent-statistics">
                    <CardHeader>
                      <CardTitle>{language === 'fr' ? 'Statistiques Parents' : 'Parent Statistics'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm">{language === 'fr' ? 'Parents Abonnés' : 'Subscribed Parents'}</span>
                              <Badge className="bg-green-600">{language === 'fr' ? '89/124' : '89/124'}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {language === 'fr' ? '89 parents sur 124 ont activé la géolocalisation' : '89 out of 124 parents have activated geolocation'}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm">{language === 'fr' ? 'Configuration École' : 'School Configuration'}</span>
                              <Badge className="bg-blue-600">{language === 'fr' ? '64 Parents' : '64 Parents'}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {language === 'fr' ? '72% des parents utilisent la configuration école' : '72% of parents use school configuration'}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs sm:text-sm">{language === 'fr' ? 'Configuration Personnalisée' : 'Custom Configuration'}</span>
                              <Badge className="bg-purple-600">{language === 'fr' ? '25 Parents' : '25 Parents'}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {language === 'fr' ? '28% des parents ont créé leurs propres zones' : '28% of parents have created their own zones'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            {language === 'fr' ? 'Actions Disponibles' : 'Available Actions'}
                          </h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-view-school-config-parents">
                              <Building className="h-4 w-4 mr-2" />
                              {language === 'fr' ? 'Voir Parents Configuration École' : 'View School Configuration Parents'}
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-view-custom-config-parents">
                              <Users className="h-4 w-4 mr-2" />
                              {language === 'fr' ? 'Voir Parents Configuration Personnalisée' : 'View Custom Configuration Parents'}
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-send-message-parents">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {language === 'fr' ? 'Envoyer Message Parents' : 'Send Message to Parents'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" data-testid="analytics-content">
            <div className="space-y-6">
              {/* Automatic Schedule Monitoring System */}
              <Card data-testid="automatic-monitoring-system">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                    {language === 'fr' ? 'Système de Surveillance Automatique' : 'Automatic Monitoring System'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Clock className="h-5 w-5 mb-1 sm:mb-0" />
                      <AlertDescription>
                        <strong>{language === 'fr' ? 'Fonctionnement Principal:' : 'Main Function:'}</strong>{' '}
                        {language === 'fr' 
                          ? 'Le système vérifie automatiquement la position des élèves dans les zones sécurisées à chaque heure de début de cours selon l\'emploi du temps. Si un élève n\'est pas dans la zone à l\'heure prévue, une alerte SMS est envoyée aux parents abonnés.'
                          : 'The system automatically checks student positions in safe zones at each class start time according to the schedule. If a student is not in the zone at the scheduled time, an SMS alert is sent to subscribed parents.'}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="automatic-checks-today">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                          {language === 'fr' ? 'Vérifications Automatiques Aujourd\'hui' : 'Automatic Checks Today'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{language === 'fr' ? 'Heures de contrôle:' : 'Check times:'}</span>
                            <span className="font-medium">8:00, 10:00, 14:00, 16:00</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{language === 'fr' ? 'Élèves vérifiés:' : 'Students checked:'}</span>
                            <span className="font-medium">{schoolStats.tracked}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{language === 'fr' ? 'Conformité zone:' : 'Zone compliance:'}</span>
                            <span className="text-xs sm:text-sm">86%</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg" data-testid="automatic-alerts">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                          {language === 'fr' ? 'Alertes Automatiques' : 'Automatic Alerts'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{language === 'fr' ? 'Alertes envoyées:' : 'Alerts sent:'}</span>
                            <span className="font-medium">28</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{language === 'fr' ? 'Parents contactés:' : 'Parents contacted:'}</span>
                            <span className="font-medium">23</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{language === 'fr' ? 'Temps de réponse:' : 'Response time:'}</span>
                            <span className="text-xs sm:text-sm">&lt; 2 min</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg" data-testid="next-scheduled-checks">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">
                        {language === 'fr' ? 'Prochaines Vérifications Programmées' : 'Next Scheduled Checks'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="text-sm">
                          <div className="font-medium">16:00 - {language === 'fr' ? 'Cours d\'Anglais' : 'English Class'}</div>
                          <div className="text-xs text-gray-600">CM2 A, CM2 B (60 élèves)</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">17:00 - {language === 'fr' ? 'Étude Dirigée' : 'Study Hall'}</div>
                          <div className="text-xs text-gray-600">6ème Sciences (35 élèves)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card data-testid="realtime-attendance">
                  <CardHeader>
                    <CardTitle>{language === 'fr' ? 'Présences Temps Réel' : 'Real-time Attendance'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm">{t.present}</span>
                        <span className="text-xs sm:text-sm">{schoolStats.present}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm">{t.delayed}</span>
                        <span className="text-xs sm:text-sm">{schoolStats.delayed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm">{t.absent}</span>
                        <span className="text-xs sm:text-sm">{schoolStats.absent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm">{t.outOfZone}</span>
                        <span className="text-xs sm:text-sm">{schoolStats.outOfZone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="coverage-by-class">
                  <CardHeader>
                    <CardTitle>{language === 'fr' ? 'Couverture par Classe' : 'Coverage by Class'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {demoClasses.map((classData) => (
                        <div key={classData.id} className="flex justify-between items-center" data-testid={`class-coverage-${classData.id}`}>
                          <span className="text-xs sm:text-sm">{classData.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(classData.tracked / classData.totalStudents) * 100} 
                              className="w-20 h-2" 
                            />
                            <span className="text-xs sm:text-sm">
                              {Math.round((classData.tracked / classData.totalStudents) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="school-safety-zones">
                <CardHeader>
                  <CardTitle>{language === 'fr' ? 'Zones de Sécurité École' : 'School Safety Zones'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: 'Périmètre Principal', students: 524, active: true },
                      { name: 'Cour de Récréation', students: 487, active: true },
                      { name: 'Cantine', students: 245, active: true },
                      { name: 'Bibliothèque', students: 89, active: true },
                      { name: 'Laboratoires', students: 156, active: true },
                      { name: 'Terrain de Sport', students: 203, active: true },
                      { name: 'Parking Transport', students: 78, active: true },
                      { name: 'Entrée Principale', students: 524, active: true }
                    ].map((zone, index) => (
                      <div key={index} className="p-3 border rounded-lg" data-testid={`safety-zone-${index}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Shield className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                          <Badge variant={zone.active ? "default" : "secondary"}>
                            {zone.active ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{zone.name}</p>
                        <p className="text-xs text-gray-600">{zone.students} élèves</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" data-testid="settings-content">
            <div className="space-y-6">
              <Card data-testid="emergency-protocol">
                <CardHeader>
                  <CardTitle>{t.emergencyProtocol}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-5 w-5 mb-1 sm:mb-0 text-red-500" />
                    <AlertDescription>
                      <strong>{language === 'fr' ? 'Protocole d\'urgence activé:' : 'Emergency protocol activated:'}</strong>{' '}
                      {language === 'fr' 
                        ? 'En cas d\'urgence, l\'école peut localiser instantanément tous les élèves et déclencher des alertes automatiques aux parents.'
                        : 'In case of emergency, the school can instantly locate all students and trigger automatic alerts to parents.'}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-testid="emergency-procedures">
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">
                        {language === 'fr' ? 'Procédures d\'Urgence' : 'Emergency Procedures'}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {language === 'fr' ? 'Localisation immédiate tous élèves' : 'Immediate location of all students'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {language === 'fr' ? 'SMS automatique parents' : 'Automatic SMS to parents'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {language === 'fr' ? 'Coordination services d\'urgence' : 'Emergency services coordination'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {language === 'fr' ? 'Suivi temps réel évacuation' : 'Real-time evacuation tracking'}
                        </li>
                      </ul>
                    </div>

                    <div data-testid="system-configuration">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                        {language === 'fr' ? 'Configuration Système' : 'System Configuration'}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {language === 'fr' ? 'Zones sécurité automatiques' : 'Automatic safety zones'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {language === 'fr' ? 'Alertes retard/absence' : 'Delay/absence alerts'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {language === 'fr' ? 'Notifications parents temps réel' : 'Real-time parent notifications'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {language === 'fr' ? 'Rapports quotidiens automatiques' : 'Automatic daily reports'}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg" data-testid="geolocation-benefits">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      {language === 'fr' ? 'Avantages École Géolocalisation' : 'School Geolocation Benefits'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-400">
                      <div>
                        <p className="font-medium mb-1">{language === 'fr' ? 'Sécurité' : 'Security'}</p>
                        <ul className="space-y-1 text-xs">
                          <li>• {language === 'fr' ? 'Surveillance périmètre' : 'Perimeter surveillance'}</li>
                          <li>• {language === 'fr' ? 'Détection intrusions' : 'Intrusion detection'}</li>
                          <li>• {language === 'fr' ? 'Alertes sorties non autorisées' : 'Unauthorized exit alerts'}</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">{language === 'fr' ? 'Efficacité' : 'Efficiency'}</p>
                        <ul className="space-y-1 text-xs">
                          <li>• {language === 'fr' ? 'Présences automatiques' : 'Automatic attendance'}</li>
                          <li>• {language === 'fr' ? 'Réduction temps administratif' : 'Reduced admin time'}</li>
                          <li>• {language === 'fr' ? 'Communication parents optimisée' : 'Optimized parent communication'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}