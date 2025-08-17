import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Watch, 
  Tablet, 
  QrCode,
  Wifi,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  School,
  Users,
  UserCheck,
  Phone,
  Mail,
  Shield,
  Battery,
  Signal
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeviceSetupProps {
  userType: 'school' | 'parent' | 'freelancer';
  onComplete?: (deviceData: any) => void;
  onCancel?: () => void;
}

interface SetupStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function DeviceSetupWizard({ userType, onComplete, onCancel }: DeviceSetupProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceData, setDeviceData] = useState({
    deviceType: '',
    deviceName: '',
    studentName: '',
    studentId: '',
    deviceId: '',
    phoneNumber: '',
    emergencyContact: '',
    zones: [],
    permissions: {
      location: false,
      emergency: false,
      notifications: false
    }
  });

  const deviceTypes = [
    {
      id: 'smartwatch',
      name: language === 'fr' ? 'Montre Connectée' : 'Smart Watch',
      icon: <Watch className="w-6 h-6" />,
      description: language === 'fr' ? 'Surveillance temps réel avec bouton panique' : 'Real-time monitoring with panic button'
    },
    {
      id: 'smartphone',
      name: language === 'fr' ? 'Smartphone' : 'Smartphone',
      icon: <Smartphone className="w-6 h-6" />,
      description: language === 'fr' ? 'Application mobile pour étudiants' : 'Mobile app for students'
    },
    {
      id: 'tablet',
      name: language === 'fr' ? 'Tablette' : 'Tablet',
      icon: <Tablet className="w-6 h-6" />,
      description: language === 'fr' ? 'Dispositif éducatif partagé' : 'Shared educational device'
    }
  ];

  const getUserTypeConfig = () => {
    switch (userType) {
      case 'school':
        return {
          title: language === 'fr' ? 'Configuration École' : 'School Setup',
          icon: <School className="w-6 h-6" />,
          color: 'text-blue-600',
          studentLabel: language === 'fr' ? 'Étudiant assigné' : 'Assigned student',
          zones: [
            language === 'fr' ? 'Salles de classe' : 'Classrooms',
            language === 'fr' ? 'Cour de récréation' : 'Playground',
            language === 'fr' ? 'Bibliothèque' : 'Library',
            language === 'fr' ? 'Cantine' : 'Cafeteria'
          ]
        };
      case 'parent':
        return {
          title: language === 'fr' ? 'Configuration Parent' : 'Parent Setup',
          icon: <Users className="w-6 h-6" />,
          color: 'text-green-600',
          studentLabel: language === 'fr' ? 'Nom de l\'enfant' : 'Child name',
          zones: [
            language === 'fr' ? 'Maison' : 'Home',
            language === 'fr' ? 'École' : 'School',
            language === 'fr' ? 'Grands-parents' : 'Grandparents',
            language === 'fr' ? 'Centre commercial' : 'Shopping center'
          ]
        };
      case 'freelancer':
        return {
          title: language === 'fr' ? 'Configuration Répétiteur' : 'Freelancer Setup',
          icon: <UserCheck className="w-6 h-6" />,
          color: 'text-purple-600',
          studentLabel: language === 'fr' ? 'Étudiant en cours particulier' : 'Private lesson student',
          zones: [
            language === 'fr' ? 'Domicile répétiteur' : 'Tutor home',
            language === 'fr' ? 'Domicile étudiant' : 'Student home',
            language === 'fr' ? 'Bibliothèque publique' : 'Public library',
            language === 'fr' ? 'Centre éducatif' : 'Educational center'
          ]
        };
      default:
        return { title: '', icon: null, color: '', studentLabel: '', zones: [] };
    }
  };

  const config = getUserTypeConfig();

  const steps: SetupStep[] = [
    {
      id: 1,
      title: language === 'fr' ? 'Type de Dispositif' : 'Device Type',
      description: language === 'fr' ? 'Sélectionnez le type de dispositif à configurer' : 'Select the device type to configure',
      component: (
        <div className="space-y-4">
          <div className="grid gap-4">
            {(Array.isArray(deviceTypes) ? deviceTypes : []).map(device => (
              <Card 
                key={device.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  deviceData.deviceType === device.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setDeviceData({...deviceData, deviceType: device.id})}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="text-blue-600">{device.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{device.name || ''}</h3>
                    <p className="text-sm text-gray-600">{device.description || ''}</p>
                  </div>
                  {deviceData.deviceType === device.id && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: language === 'fr' ? 'Informations de Base' : 'Basic Information',
      description: language === 'fr' ? 'Configurez les informations essentielles' : 'Configure essential information',
      component: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deviceName">
                {language === 'fr' ? 'Nom du dispositif' : 'Device name'}
              </Label>
              <Input
                id="deviceName"
                value={deviceData.deviceName}
                onChange={(e) => setDeviceData({...deviceData, deviceName: e?.target?.value})}
                placeholder={language === 'fr' ? 'ex: Montre de Marie' : 'ex: Marie\'s Watch'}
              />
            </div>
            <div>
              <Label htmlFor="studentName">{config.studentLabel}</Label>
              <Input
                id="studentName"
                value={deviceData.studentName}
                onChange={(e) => setDeviceData({...deviceData, studentName: e?.target?.value})}
                placeholder={language === 'fr' ? 'Nom complet' : 'Full name'}
              />
            </div>
            <div>
              <Label htmlFor="deviceId">
                {language === 'fr' ? 'ID du dispositif' : 'Device ID'}
              </Label>
              <Input
                id="deviceId"
                value={deviceData.deviceId}
                onChange={(e) => setDeviceData({...deviceData, deviceId: e?.target?.value})}
                placeholder={language === 'fr' ? 'Scanner le QR code' : 'Scan QR code'}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">
                {language === 'fr' ? 'Numéro de téléphone' : 'Phone number'}
              </Label>
              <Input
                id="phoneNumber"
                value={deviceData.phoneNumber}
                onChange={(e) => setDeviceData({...deviceData, phoneNumber: e?.target?.value})}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="emergencyContact">
              {language === 'fr' ? 'Contact d\'urgence' : 'Emergency contact'}
            </Label>
            <Input
              id="emergencyContact"
              value={deviceData.emergencyContact}
              onChange={(e) => setDeviceData({...deviceData, emergencyContact: e?.target?.value})}
              placeholder={language === 'fr' ? 'Numéro d\'urgence' : 'Emergency number'}
            />
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: language === 'fr' ? 'Zones Autorisées' : 'Authorized Zones',
      description: language === 'fr' ? 'Définissez les zones de sécurité' : 'Define safety zones',
      component: (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">
                {language === 'fr' ? 'Configuration des zones' : 'Zone configuration'}
              </span>
            </div>
            <p>
              {language === 'fr'
                ? 'Sélectionnez les zones où l\'étudiant est autorisé à se trouver. Des alertes seront envoyées en cas de sortie de ces zones.'
                : 'Select zones where the student is authorized to be. Alerts will be sent if they leave these zones.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {config.zones.map((zone, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="flex-1">{zone}</span>
                  <Button size="sm" variant="outline">
                    {language === 'fr' ? 'Définir' : 'Define'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: language === 'fr' ? 'Permissions' : 'Permissions',
      description: language === 'fr' ? 'Configurez les autorisations du dispositif' : 'Configure device permissions',
      component: (
        <div className="space-y-4">
          <div className="space-y-4">
            {[
              {
                key: 'location',
                icon: <MapPin className="w-5 h-5" />,
                title: language === 'fr' ? 'Géolocalisation' : 'Location tracking',
                description: language === 'fr' ? 'Autoriser le suivi de position en temps réel' : 'Allow real-time location tracking'
              },
              {
                key: 'emergency',
                icon: <Shield className="w-5 h-5" />,
                title: language === 'fr' ? 'Alertes d\'urgence' : 'Emergency alerts',
                description: language === 'fr' ? 'Activer le bouton panique et les alertes automatiques' : 'Enable panic button and automatic alerts'
              },
              {
                key: 'notifications',
                icon: <Phone className="w-5 h-5" />,
                title: language === 'fr' ? 'Notifications' : 'Notifications',
                description: language === 'fr' ? 'Recevoir des notifications par SMS et app' : 'Receive SMS and app notifications'
              }
            ].map(permission => (
              <Card key={permission.key}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="text-blue-600">{permission.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{permission.title || ''}</h3>
                    <p className="text-sm text-gray-600">{permission.description || ''}</p>
                  </div>
                  <Button
                    variant={deviceData.permissions[permission.key as keyof typeof deviceData.permissions] ? "default" : "outline"}
                    onClick={() => setDeviceData({
                      ...deviceData,
                      permissions: {
                        ...deviceData.permissions,
                        [permission.key]: !deviceData.permissions[permission.key as keyof typeof deviceData.permissions]
                      }
                    })}
                  >
                    {deviceData.permissions[permission.key as keyof typeof deviceData.permissions] 
                      ? (language === 'fr' ? 'Activé' : 'Enabled')
                      : (language === 'fr' ? 'Désactivé' : 'Disabled')
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: language === 'fr' ? 'Test de Connexion' : 'Connection Test',
      description: language === 'fr' ? 'Vérifiez que le dispositif fonctionne correctement' : 'Verify the device works correctly',
      component: (
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'fr' ? 'Configuration Terminée' : 'Setup Complete'}
            </h3>
            <p className="text-gray-600">
              {language === 'fr'
                ? 'Votre dispositif est maintenant configuré et prêt à être utilisé'
                : 'Your device is now configured and ready to use'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Signal className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">
                    {language === 'fr' ? 'Signal' : 'Signal'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {language === 'fr' ? 'Excellent' : 'Excellent'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Battery className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">
                    {language === 'fr' ? 'Batterie' : 'Battery'}
                  </p>
                  <p className="text-xs text-gray-600">95%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">GPS</p>
                  <p className="text-xs text-gray-600">
                    {language === 'fr' ? 'Actif' : 'Active'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">
                {language === 'fr' ? 'Étapes suivantes' : 'Next steps'}
              </span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• {language === 'fr' ? 'Testez le bouton panique avec l\'étudiant' : 'Test panic button with student'}</li>
              <li>• {language === 'fr' ? 'Vérifiez les notifications d\'urgence' : 'Verify emergency notifications'}</li>
              <li>• {language === 'fr' ? 'Configurez les horaires de surveillance' : 'Configure monitoring schedules'}</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / (Array.isArray(steps) ? steps.length : 0)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return deviceData.deviceType !== '';
      case 2:
        return deviceData.deviceName && deviceData.studentName && deviceData.deviceId;
      case 3:
        return true; // Zone configuration is optional for this demo
      case 4:
        return true; // Permissions can be set later
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < (Array.isArray(steps) ? steps.length : 0)) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(deviceData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${config.color} bg-opacity-10`}>
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-2xl">{config.title || ''}</CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Assistant de configuration des dispositifs de géolocalisation'
                  : 'Geolocation device setup wizard'}
              </CardDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {language === 'fr' ? 'Étape' : 'Step'} {currentStep} / {(Array.isArray(steps) ? steps.length : 0)}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Header */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentStepData?.title}</h2>
            <p className="text-gray-600">{currentStepData?.description}</p>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStepData?.component}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                {currentStep === (Array.isArray(steps) ? steps.length : 0) 
                  ? (language === 'fr' ? 'Terminer' : 'Finish')
                  : (language === 'fr' ? 'Suivant' : 'Next')
                }
                {currentStep < (Array.isArray(steps) ? steps.length : 0) && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}