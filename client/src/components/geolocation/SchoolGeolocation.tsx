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
  MessageSquare,
  Target,
  Battery,
  Download,
  User,
  UserCheck,
  ArrowLeft,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export default function SchoolGeolocation() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState('overview');

  const t = {
    title: language === 'fr' ? 'Services de Géolocalisation École' : 'School Geolocation Services',
    subtitle: language === 'fr' ? 'Deux options d\'accès • Configuration centralisée • Suivi temps réel' : 'Two access options • Centralized configuration • Real-time tracking',
    overview: language === 'fr' ? 'Aperçu' : 'Overview',
    serviceOptions: language === 'fr' ? 'Options de Service' : 'Service Options',
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
    viaSchool: language === 'fr' ? 'Via École Partenaire' : 'Via Partner School',
    directSubscription: language === 'fr' ? 'Abonnement Direct' : 'Direct Subscription',
    schoolConnection: language === 'fr' ? 'Connexion scolaire' : 'School connection',
    required: language === 'fr' ? 'Obligatoire' : 'Required',
    optional: language === 'fr' ? 'Optionnelle' : 'Optional',
    autonomy: language === 'fr' ? 'Autonomie' : 'Independence',
    dependent: language === 'fr' ? 'Dépendant de l\'école' : 'School dependent',
    independent: language === 'fr' ? 'Totalement indépendant' : 'Completely independent',
    pricing: language === 'fr' ? 'Tarification' : 'Pricing',
    schoolPlusGeo: language === 'fr' ? 'École + Géolocalisation' : 'School + Geolocation',
    geoOnly: language === 'fr' ? 'Géolocalisation uniquement' : 'Geolocation only',
    parentPrice: language === 'fr' ? '1 000 CFA/mois • 12 000 CFA/an' : '1,000 CFA/month • 12,000 CFA/year',
    features: language === 'fr' ? 'Fonctionnalités disponibles' : 'Available features',
    realTimeTracking: language === 'fr' ? 'Suivi temps réel des enfants' : 'Real-time child tracking',
    safeZoneConfig: language === 'fr' ? 'Configuration des zones de sécurité' : 'Safe zone configuration',
    deviceManagement: language === 'fr' ? 'Gestion des appareils (smartphone, montre, GPS)' : 'Device management (smartphone, watch, GPS)',
    multiChannelNotif: language === 'fr' ? 'Notifications multi-canal (SMS, Email, PWA)' : 'Multi-channel notifications (SMS, Email, PWA)',
    setupInstructions: language === 'fr' ? 'Instructions de configuration des téléphones' : 'Phone setup instructions',
    invitationSystem: language === 'fr' ? 'Système d\'invitation parent-enfant' : 'Parent-child invitation system',
    twoWaysAccess: language === 'fr' ? 'IMPORTANT : Il existe DEUX façons d\'accéder aux services de géolocalisation' : 'IMPORTANT: There are TWO ways to access geolocation services'
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
            <TabsTrigger value="service-options" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-service-options">
              <Users className="h-5 w-5 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">{t.serviceOptions}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-analytics">
              <Activity className="h-5 w-5 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">{t.analytics}</span>
            </TabsTrigger>
            <TabsTrigger value="role-guides" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 min-h-[60px] sm:min-h-[40px]" data-testid="tab-role-guides">
              <BookOpen className="h-5 w-5 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">{language === 'fr' ? 'Guides' : 'Guides'}</span>
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

          {/* Service Options Tab - Inspired by the HTML document */}
          <TabsContent value="service-options" data-testid="service-options-content">
            <div className="space-y-6">
              {/* Important Notice */}
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" data-testid="two-ways-access-alert">
                <AlertTriangle className="h-5 w-5 mb-1 sm:mb-0 text-red-500" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>{t.twoWaysAccess}</strong>
                </AlertDescription>
              </Alert>

              {/* Comparison Table */}
              <Card data-testid="service-comparison-table">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                    {language === 'fr' ? 'Comparaison des Options d\'Accès' : 'Access Options Comparison'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                          <th className="text-left p-4 font-semibold border-b border-gray-200 dark:border-gray-700">
                            {language === 'fr' ? 'Aspect' : 'Aspect'}
                          </th>
                          <th className="text-left p-4 font-semibold border-b border-gray-200 dark:border-gray-700">
                            🏫 {t.viaSchool}
                          </th>
                          <th className="text-left p-4 font-semibold border-b border-gray-200 dark:border-gray-700">
                            📱 {t.directSubscription}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-4 font-medium">{t.schoolConnection}</td>
                          <td className="p-4">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              ✅ {t.required}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              ❌ {t.optional}
                            </Badge>
                          </td>
                        </tr>
                        <tr className="bg-gray-50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
                          <td className="p-4 font-medium">{t.autonomy}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="border-orange-300 text-orange-600">
                              ⚠️ {t.dependent}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              ✅ {t.independent}
                            </Badge>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-4 font-medium">{t.pricing}</td>
                          <td className="p-4 text-sm">{t.schoolPlusGeo}</td>
                          <td className="p-4 text-sm">{t.geoOnly}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Service Options */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Option 1: Via School */}
                <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="via-school-option">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-6 w-6 mb-1 sm:mb-0" />
                      🏫 {language === 'fr' ? 'OPTION 1 : VIA ÉCOLE PARTENAIRE' : 'OPTION 1: VIA PARTNER SCHOOL'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                          {language === 'fr' ? 'Processus étape par étape :' : 'Step-by-step process:'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-blue-500">
                            <span className="font-bold text-blue-600">1️⃣</span>
                            <span className="text-sm">
                              {language === 'fr' 
                                ? 'Le parent se connecte d\'abord à une école partenaire'
                                : 'Parent connects first to a partner school'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-blue-500">
                            <span className="font-bold text-blue-600">2️⃣</span>
                            <span className="text-sm">
                              {language === 'fr' 
                                ? 'Il invite ses enfants via cette connexion scolaire'
                                : 'Invites children via this school connection'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-blue-500">
                            <span className="font-bold text-blue-600">3️⃣</span>
                            <span className="text-sm">
                              {language === 'fr' 
                                ? 'La géolocalisation devient un service premium additionnel'
                                : 'Geolocation becomes an additional premium service'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Option 2: Direct Subscription */}
                <Card className="border-2 border-green-200 dark:border-green-800" data-testid="direct-subscription-option">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-6 w-6 mb-1 sm:mb-0" />
                      📱 {language === 'fr' ? 'OPTION 2 : ABONNEMENT DIRECT' : 'OPTION 2: DIRECT SUBSCRIPTION'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                          {language === 'fr' ? 'Processus étape par étape :' : 'Step-by-step process:'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-green-500">
                            <span className="font-bold text-green-600">1️⃣</span>
                            <span className="text-sm">
                              {language === 'fr' 
                                ? 'Le parent s\'abonne directement au service de géolocalisation'
                                : 'Parent subscribes directly to geolocation service'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-green-500">
                            <span className="font-bold text-green-600">2️⃣</span>
                            <span className="text-sm">
                              {language === 'fr' 
                                ? 'Il invite ses enfants immédiatement'
                                : 'Invites children immediately'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-green-500">
                            <span className="font-bold text-green-600">3️⃣</span>
                            <span className="text-sm">
                              {language === 'fr' 
                                ? 'Aucune connexion scolaire requise'
                                : 'No school connection required'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing Information */}
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" data-testid="pricing-information">
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">💰 {language === 'fr' ? 'TARIF PARENT' : 'PARENT PRICING'}</h3>
                    <div className="text-xl font-semibold">{t.parentPrice}</div>
                    <p className="text-sm opacity-90">
                      {language === 'fr' 
                        ? 'Suivi temps réel + Alertes SMS + Zones sécurisées'
                        : 'Real-time tracking + SMS alerts + Safe zones'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Features List */}
              <Card data-testid="features-list">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 mb-1 sm:mb-0 text-green-500" />
                    🎯 {t.features}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{t.realTimeTracking}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{t.safeZoneConfig}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{t.deviceManagement}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{t.multiChannelNotif}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{t.setupInstructions}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{t.invitationSystem}</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

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

          {/* Role-Specific Guides Tab - Inspired by GeolocationGuide */}
          <TabsContent value="role-guides" data-testid="role-guides-content">
            <div className="space-y-6">
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" data-testid="role-guides-intro">
                <BookOpen className="h-5 w-5 mb-1 sm:mb-0 text-blue-500" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>{language === 'fr' ? 'Guides par Rôle' : 'Role-Specific Guides'}</strong><br />
                  {language === 'fr' 
                    ? 'Découvrez comment utiliser efficacement la géolocalisation selon votre profil'
                    : 'Learn how to effectively use geolocation according to your profile'}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Director Guide */}
                <Card className="border-2 border-purple-200 dark:border-purple-800" data-testid="director-guide">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-6 w-6 mb-1 sm:mb-0" />
                      {language === 'fr' ? 'Guide Directeurs' : 'Director Guide'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '1. Souscription École' : '1. School Subscription'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? '25,000 CFA/an pour suivi massif (500+ élèves)'
                              : '25,000 CFA/year for mass tracking (500+ students)'}
                          </p>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '2. Configuration Campus' : '2. Campus Configuration'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Définir périmètres scolaires et zones sécurisées'
                              : 'Define school perimeters and secure zones'}
                          </p>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '3. Supervision Massive' : '3. Mass Supervision'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Dashboard temps réel pour tous les élèves'
                              : 'Real-time dashboard for all students'}
                          </p>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '4. Protocole Urgence' : '4. Emergency Protocol'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Coordination équipes et services d\'urgence'
                              : 'Team coordination and emergency services'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full text-xs" data-testid="button-director-details">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Détails Complets' : 'Full Details'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Guide */}
                <Card className="border-2 border-green-200 dark:border-green-800" data-testid="parent-guide">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6 mb-1 sm:mb-0" />
                      {language === 'fr' ? 'Guide Parents' : 'Parent Guide'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '1. Souscription Service' : '1. Service Subscription'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? '1,000 CFA/mois depuis Services Premium'
                              : '1,000 CFA/month from Premium Services'}
                          </p>
                        </div>

                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '2. Zones Sécurité' : '2. Safety Zones'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Configuration école, maison et alertes SMS'
                              : 'Configure school, home and SMS alerts'}
                          </p>
                        </div>

                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '3. App Enfant' : '3. Child App'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Installation et permissions sur téléphone enfant'
                              : 'Installation and permissions on child phone'}
                          </p>
                        </div>

                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '4. Surveillance Quotidienne' : '4. Daily Monitoring'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Dashboard temps réel et vérification alertes'
                              : 'Real-time dashboard and alert verification'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full text-xs" data-testid="button-parent-details">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Détails Complets' : 'Full Details'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Guide */}
                <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="student-guide">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-6 w-6 mb-1 sm:mb-0" />
                      {language === 'fr' ? 'Guide Élèves' : 'Student Guide'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '1. App Téléphone' : '1. Phone App'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Gardez Educafric actif et chargé'
                              : 'Keep Educafric active and charged'}
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '2. Zones Sécurité' : '2. Safety Zones'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Restez dans zones définies par parents'
                              : 'Stay within zones defined by parents'}
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '3. Mode Urgence' : '3. Emergency Mode'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Triple clic bouton alimentation = alerte parents'
                              : 'Triple click power button = parent alert'}
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm">
                              {language === 'fr' ? '4. Responsabilités' : '4. Responsibilities'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {language === 'fr' 
                              ? 'Communication ouverte avec parents'
                              : 'Open communication with parents'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full text-xs" data-testid="button-student-details">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Détails Complets' : 'Full Details'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Guides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teacher Guide */}
                <Card className="border-2 border-orange-200 dark:border-orange-800" data-testid="teacher-guide">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-6 w-6 mb-1 sm:mb-0" />
                      {language === 'fr' ? 'Guide Enseignants' : 'Teacher Guide'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Surveillance classe' : 'Class monitoring'}:</strong><br />
                        <span className="text-xs text-gray-600">
                          {language === 'fr' 
                            ? 'Dashboard temps réel pour élèves de votre classe'
                            : 'Real-time dashboard for your class students'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Alertes automatiques' : 'Automatic alerts'}:</strong><br />
                        <span className="text-xs text-gray-600">
                          {language === 'fr' 
                            ? 'Notifications sorties non autorisées pendant cours'
                            : 'Unauthorized exit notifications during classes'}
                        </span>
                      </div>
                      <Button variant="outline" className="w-full text-xs" data-testid="button-teacher-details">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Guide Complet' : 'Complete Guide'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Freelancer Guide */}
                <Card className="border-2 border-teal-200 dark:border-teal-800" data-testid="freelancer-guide">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 mb-1 sm:mb-0" />
                      {language === 'fr' ? 'Guide Freelancers' : 'Freelancer Guide'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Cours privés sécurisés' : 'Secure private lessons'}:</strong><br />
                        <span className="text-xs text-gray-600">
                          {language === 'fr' 
                            ? 'Suivi élèves pendant cours particuliers'
                            : 'Student tracking during private lessons'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <strong>{language === 'fr' ? 'Confiance parents' : 'Parent trust'}:</strong><br />
                        <span className="text-xs text-gray-600">
                          {language === 'fr' 
                            ? 'Transparence totale sur lieu et durée cours'
                            : 'Full transparency on lesson location and duration'}
                        </span>
                      </div>
                      <Button variant="outline" className="w-full text-xs" data-testid="button-freelancer-details">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Guide Complet' : 'Complete Guide'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Features Reference */}
              <Card data-testid="quick-features-reference">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 mb-1 sm:mb-0 text-indigo-500" />
                    {language === 'fr' ? 'Référence Rapide des Fonctionnalités' : 'Quick Features Reference'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">
                        {language === 'fr' ? 'Fonctionnalités Principales' : 'Main Features'}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{language === 'fr' ? 'Suivi temps réel des positions' : 'Real-time position tracking'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{language === 'fr' ? 'Zones de sécurité configurables' : 'Configurable safety zones'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{language === 'fr' ? 'Alertes SMS automatiques' : 'Automatic SMS alerts'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{language === 'fr' ? 'Surveillance niveau batterie' : 'Battery level monitoring'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">
                        {language === 'fr' ? 'Tarification' : 'Pricing'}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{language === 'fr' ? 'Parents:' : 'Parents:'}</span>
                          <Badge className="bg-green-100 text-green-800 border-green-200">1,000 CFA/mois</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{language === 'fr' ? 'Écoles:' : 'Schools:'}</span>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">25,000 CFA/an</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{language === 'fr' ? 'Freelancers:' : 'Freelancers:'}</span>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">15,000 CFA/an</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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