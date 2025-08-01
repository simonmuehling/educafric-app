import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Watch, 
  Tablet, 
  Settings, 
  Wifi, 
  MapPin, 
  Battery, 
  Download,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const DeviceConfigurationGuide = () => {
  const { language } = useLanguage();
  const [selectedDevice, setSelectedDevice] = useState('smartphone');

  const text = {
    fr: {
      title: 'Guide Configuration Appareils',
      subtitle: 'Instructions détaillées pour configurer le suivi GPS',
      deviceTypes: 'Types d\'Appareils',
      smartphone: 'Smartphone',
      smartwatch: 'Montre Connectée',
      tablet: 'Tablette',
      configuration: 'Configuration',
      installation: 'Installation',
      permissions: 'Permissions',
      testing: 'Test',
      troubleshooting: 'Dépannage',
      requirements: 'Prérequis',
      steps: 'Étapes',
      downloadApp: 'Télécharger l\'App',
      enableGPS: 'Activer GPS',
      setPermissions: 'Configurer Permissions',
      testLocation: 'Tester Localisation',
      completed: 'Terminé',
      pending: 'En attente',
      failed: 'Échec',
      androidVersion: 'Android 8.0+',
      iosVersion: 'iOS 12.0+',
      internetConnection: 'Connexion Internet',
      batteryOptimization: 'Optimisation Batterie Désactivée',
      locationServices: 'Services de Localisation Activés',
      firebaseSetup: 'Configuration Firebase',
      realTimeTracking: 'Suivi Temps Réel',
      safeZoneAlerts: 'Alertes Zones Sécurisées',
      batteryMonitoring: 'Surveillance Batterie',
      parentalControls: 'Contrôles Parentaux',
      emergencyFeatures: 'Fonctions d\'Urgence'
    },
    en: {
      title: 'Device Configuration Guide',
      subtitle: 'Detailed instructions for GPS tracking setup',
      deviceTypes: 'Device Types',
      smartphone: 'Smartphone',
      smartwatch: 'Smartwatch',
      tablet: 'Tablet',
      configuration: 'Configuration',
      installation: 'Installation',
      permissions: 'Permissions',
      testing: 'Testing',
      troubleshooting: 'Troubleshooting',
      requirements: 'Requirements',
      steps: 'Steps',
      downloadApp: 'Download App',
      enableGPS: 'Enable GPS',
      setPermissions: 'Set Permissions',
      testLocation: 'Test Location',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      androidVersion: 'Android 8.0+',
      iosVersion: 'iOS 12.0+',
      internetConnection: 'Internet Connection',
      batteryOptimization: 'Battery Optimization Disabled',
      locationServices: 'Location Services Enabled',
      firebaseSetup: 'Firebase Setup',
      realTimeTracking: 'Real-time Tracking',
      safeZoneAlerts: 'Safe Zone Alerts',
      batteryMonitoring: 'Battery Monitoring',
      parentalControls: 'Parental Controls',
      emergencyFeatures: 'Emergency Features'
    }
  };

  const t = text[language as keyof typeof text];

  const deviceConfigurations = {
    smartphone: {
      icon: <Smartphone className="w-8 h-8" />,
      name: t.smartphone,
      requirements: [
        t.androidVersion + ' / ' + t.iosVersion,
        t.internetConnection,
        t.locationServices,
        t.batteryOptimization
      ],
      steps: [
        {
          title: t.downloadApp,
          description: 'Télécharger EDUCAFRIC GPS Tracker depuis Play Store/App Store',
          status: 'completed',
          icon: <Download className="w-5 h-5" />
        },
        {
          title: t.firebaseSetup,
          description: 'Configurer la synchronisation Firebase pour le suivi temps réel',
          status: 'completed',
          icon: <Settings className="w-5 h-5" />
        },
        {
          title: t.enableGPS,
          description: 'Activer les services de localisation dans Paramètres > Localisation',
          status: 'completed',
          icon: <MapPin className="w-5 h-5" />
        },
        {
          title: t.setPermissions,
          description: 'Autoriser l\'accès à la localisation en permanence',
          status: 'pending',
          icon: <Settings className="w-5 h-5" />
        },
        {
          title: t.batteryOptimization,
          description: 'Désactiver l\'optimisation batterie pour EDUCAFRIC',
          status: 'pending',
          icon: <Battery className="w-5 h-5" />
        },
        {
          title: t.testLocation,
          description: 'Vérifier que la position est transmise correctement',
          status: 'pending',
          icon: <CheckCircle className="w-5 h-5" />
        }
      ],
      features: [
        t.realTimeTracking,
        t.safeZoneAlerts,
        t.batteryMonitoring,
        t.parentalControls,
        t.emergencyFeatures
      ]
    },
    smartwatch: {
      icon: <Watch className="w-8 h-8" />,
      name: t.smartwatch,
      requirements: [
        'WearOS 2.0+ / watchOS 6.0+',
        'Connexion Bluetooth/WiFi',
        'Application EDUCAFRIC installée',
        'Synchronisation avec téléphone parent'
      ],
      steps: [
        {
          title: 'Installation WearOS',
          description: 'Installer EDUCAFRIC Kids Watch depuis le Play Store de la montre',
          status: 'completed',
          icon: <Download className="w-5 h-5" />
        },
        {
          title: 'Jumelage Parent',
          description: 'Jumeler la montre avec le téléphone du parent via Bluetooth',
          status: 'completed',
          icon: <Wifi className="w-5 h-5" />
        },
        {
          title: 'Configuration GPS',
          description: 'Activer le GPS intégré de la montre connectée',
          status: 'completed',
          icon: <MapPin className="w-5 h-5" />
        },
        {
          title: 'Synchronisation Firebase',
          description: 'Configurer la synchronisation temps réel avec Firebase',
          status: 'pending',
          icon: <RotateCcw className="w-5 h-5" />
        },
        {
          title: 'Mode Économie',
          description: 'Configurer l\'envoi de position toutes les 5 minutes',
          status: 'pending',
          icon: <Battery className="w-5 h-5" />
        },
        {
          title: 'Test Fonctionnel',
          description: 'Vérifier réception des alertes sur le téléphone parent',
          status: 'pending',
          icon: <Play className="w-5 h-5" />
        }
      ],
      features: [
        'Géolocalisation autonome',
        'Bouton SOS intégré',
        'Appels d\'urgence',
        'Résistance à l\'eau',
        'Suivi activité physique'
      ]
    },
    tablet: {
      icon: <Tablet className="w-8 h-8" />,
      name: t.tablet,
      requirements: [
        'Android 9.0+ / iPadOS 13.0+',
        'GPS/A-GPS intégré',
        'Connexion WiFi/4G',
        'Espace stockage 500MB+'
      ],
      steps: [
        {
          title: 'Installation Tablette',
          description: 'Télécharger EDUCAFRIC Student Tracker pour tablettes',
          status: 'completed',
          icon: <Download className="w-5 h-5" />
        },
        {
          title: 'Configuration Éducative',
          description: 'Paramétrer le mode école avec restrictions appropriées',
          status: 'completed',
          icon: <Settings className="w-5 h-5" />
        },
        {
          title: 'Géofencing École',
          description: 'Définir les zones scolaires autorisées automatiquement',
          status: 'completed',
          icon: <MapPin className="w-5 h-5" />
        },
        {
          title: 'Firebase Éducatif',
          description: 'Connecter au système Firebase éducatif pour suivi classe',
          status: 'pending',
          icon: <Wifi className="w-5 h-5" />
        },
        {
          title: 'Contrôles Professeur',
          description: 'Permettre au professeur de voir la position en classe',
          status: 'pending',
          icon: <Settings className="w-5 h-5" />
        },
        {
          title: 'Mode Examen',
          description: 'Configurer restrictions pendant les examens',
          status: 'pending',
          icon: <AlertTriangle className="w-5 h-5" />
        }
      ],
      features: [
        'Suivi en classe',
        'Mode examen sécurisé',
        'Contrôle professeur',
        'Applications éducatives',
        'Historique présence'
      ]
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{t.completed}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t.pending}</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">{t.failed}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{t.pending}</Badge>;
    }
  };

  const currentDevice = deviceConfigurations[selectedDevice as keyof typeof deviceConfigurations];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
        </div>

        {/* Device Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t.deviceTypes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(deviceConfigurations).map(([key, device]) => (
                <Button
                  key={key}
                  variant={selectedDevice === key ? "default" : "outline"}
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setSelectedDevice(key)}
                >
                  {device.icon}
                  <span>{device.name || ''}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t.requirements}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentDevice.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{req}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Fonctionnalités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentDevice.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Étapes de Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentDevice.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      {step.icon}
                      <h3 className="font-semibold">{step.title || ''}</h3>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-sm text-gray-600">{step.description || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t.troubleshooting}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="common">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="common">Problèmes Courants</TabsTrigger>
                <TabsTrigger value="firebase">Firebase</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="common" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                    <h4 className="font-semibold">GPS ne fonctionne pas</h4>
                    <p className="text-sm mt-1">Vérifiez que les services de localisation sont activés et que l'app a les permissions nécessaires.</p>
                  </div>
                  <div className="p-4 border-l-4 border-red-400 bg-red-50">
                    <h4 className="font-semibold">Batterie se vide rapidement</h4>
                    <p className="text-sm mt-1">Désactivez l'optimisation batterie pour EDUCAFRIC et ajustez la fréquence de mise à jour.</p>
                  </div>
                  <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                    <h4 className="font-semibold">Pas de connexion Firebase</h4>
                    <p className="text-sm mt-1">Vérifiez votre connexion internet et les paramètres de firewall.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="firebase" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Configuration Firebase</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>Project ID:</strong> educafric-geolocation</p>
                      <p><strong>API Key:</strong> Configuré automatiquement</p>
                      <p><strong>Database URL:</strong> Temps réel Firebase</p>
                      <p><strong>Authentication:</strong> Google Sign-In activé</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="support" className="mt-4">
                <div className="space-y-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Besoin d'aide ?</h4>
                    <p className="text-sm mb-4">Notre équipe support est disponible pour vous accompagner</p>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Email:</strong> support@educafric.com</p>
                      <p className="text-sm"><strong>WhatsApp:</strong> +237 656 200 472</p>
                      <p className="text-sm"><strong>Horaires:</strong> Lun-Ven 8h-18h (GMT+1)</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceConfigurationGuide;