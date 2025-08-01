import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Watch, 
  Tablet, 
  School, 
  Users, 
  UserCheck,
  MapPin,
  Shield,
  Plus,
  QrCode,
  Download,
  Wifi,
  Battery,
  AlertTriangle,
  CheckCircle,
  Info,
  Book,
  Home,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeviceType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  compatibility: string[];
  features: string[];
  setup: string[];
  africaOptimized: boolean;
}

interface UserGuide {
  type: 'school' | 'parent' | 'freelancer';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  devices: DeviceType[];
  benefits: string[];
  setupSteps: string[];
  requirements: string[];
}

export default function GeolocationDeviceGuide() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'school' | 'parent' | 'freelancer'>('school');

  const deviceTypes: DeviceType[] = [
    {
      id: 'smartwatch',
      name: language === 'fr' ? 'Montre Connectée' : 'Smart Watch',
      icon: <Watch className="w-8 h-8 text-blue-500" />,
      description: language === 'fr' 
        ? 'Parfait pour surveiller les enfants en temps réel avec alertes d\'urgence'
        : 'Perfect for real-time child monitoring with emergency alerts',
      compatibility: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit', 'Garmin'],
      features: [
        language === 'fr' ? 'GPS haute précision' : 'High-precision GPS',
        language === 'fr' ? 'Bouton panique' : 'Panic button',
        language === 'fr' ? 'Surveillance batterie' : 'Battery monitoring',
        language === 'fr' ? 'Zones sécurisées' : 'Safe zones'
      ],
      setup: [
        language === 'fr' ? 'Télécharger l\'app EDUCAFRIC' : 'Download EDUCAFRIC app',
        language === 'fr' ? 'Scanner le QR code du dispositif' : 'Scan device QR code',
        language === 'fr' ? 'Configurer les alertes' : 'Configure alerts',
        language === 'fr' ? 'Tester la connexion' : 'Test connection'
      ],
      africaOptimized: true
    },
    {
      id: 'smartphone',
      name: language === 'fr' ? 'Smartphone' : 'Smartphone',
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      description: language === 'fr'
        ? 'Solution la plus accessible pour la géolocalisation des étudiants'
        : 'Most accessible solution for student geolocation',
      compatibility: ['Android 8+', 'iOS 12+', 'Huawei', 'Tecno', 'Infinix'],
      features: [
        language === 'fr' ? 'Application native' : 'Native app',
        language === 'fr' ? 'Mode économie batterie' : 'Battery saver mode',
        language === 'fr' ? 'Connexion offline' : 'Offline connectivity',
        language === 'fr' ? 'Partage de position' : 'Location sharing'
      ],
      setup: [
        language === 'fr' ? 'Installer EDUCAFRIC depuis Play Store' : 'Install EDUCAFRIC from Play Store',
        language === 'fr' ? 'Créer compte étudiant' : 'Create student account',
        language === 'fr' ? 'Autoriser la géolocalisation' : 'Allow location access',
        language === 'fr' ? 'Lier au compte parent/école' : 'Link to parent/school account'
      ],
      africaOptimized: true
    },
    {
      id: 'tablet',
      name: language === 'fr' ? 'Tablette Éducative' : 'Educational Tablet',
      icon: <Tablet className="w-8 h-8 text-purple-500" />,
      description: language === 'fr'
        ? 'Idéal pour les écoles avec suivi des tablettes partagées'
        : 'Ideal for schools with shared tablet tracking',
      compatibility: ['iPad', 'Samsung Tab', 'Lenovo Tab', 'Amazon Fire'],
      features: [
        language === 'fr' ? 'Gestion multi-utilisateurs' : 'Multi-user management',
        language === 'fr' ? 'Contrôle parental' : 'Parental controls',
        language === 'fr' ? 'Suivi utilisation' : 'Usage tracking',
        language === 'fr' ? 'Synchronisation cloud' : 'Cloud sync'
      ],
      setup: [
        language === 'fr' ? 'Configuration administrateur' : 'Admin setup',
        language === 'fr' ? 'Profils étudiants multiples' : 'Multiple student profiles',
        language === 'fr' ? 'Zones autorisées' : 'Authorized zones',
        language === 'fr' ? 'Politiques d\'usage' : 'Usage policies'
      ],
      africaOptimized: false
    }
  ];

  const userGuides: UserGuide[] = [
    {
      type: 'school',
      title: language === 'fr' ? 'Guide École' : 'School Guide',
      description: language === 'fr' 
        ? 'Surveillance complète du campus et sécurité des étudiants'
        : 'Complete campus monitoring and student safety',
      icon: <School className="w-6 h-6" />,
      color: 'bg-blue-500',
      devices: deviceTypes,
      benefits: [
        language === 'fr' ? 'Sécurité renforcée du campus' : 'Enhanced campus security',
        language === 'fr' ? 'Suivi présence automatique' : 'Automatic attendance tracking',
        language === 'fr' ? 'Alertes parents temps réel' : 'Real-time parent alerts',
        language === 'fr' ? 'Gestion des urgences' : 'Emergency management',
        language === 'fr' ? 'Rapports de fréquentation' : 'Attendance reports'
      ],
      setupSteps: [
        language === 'fr' ? 'Définir les zones du campus (salles, cour, bibliothèque)' : 'Define campus zones (classrooms, yard, library)',
        language === 'fr' ? 'Enregistrer tous les dispositifs des étudiants' : 'Register all student devices',
        language === 'fr' ? 'Configurer les horaires de surveillance' : 'Configure monitoring schedules',
        language === 'fr' ? 'Former le personnel sur les alertes' : 'Train staff on alerts',
        language === 'fr' ? 'Tester le système d\'urgence' : 'Test emergency system'
      ],
      requirements: [
        language === 'fr' ? 'Connexion internet stable' : 'Stable internet connection',
        language === 'fr' ? 'Couverture réseau mobile' : 'Mobile network coverage',
        language === 'fr' ? 'Personnel formé' : 'Trained staff',
        language === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'
      ]
    },
    {
      type: 'parent',
      title: language === 'fr' ? 'Guide Parent' : 'Parent Guide',
      description: language === 'fr'
        ? 'Surveillance familiale et sécurité des enfants'
        : 'Family monitoring and child safety',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      devices: (Array.isArray(deviceTypes) ? deviceTypes : []).filter(d => d.id !== 'tablet'),
      benefits: [
        language === 'fr' ? 'Localisation enfants en temps réel' : 'Real-time child location',
        language === 'fr' ? 'Notifications arrivée/départ école' : 'School arrival/departure notifications',
        language === 'fr' ? 'Zones sécurisées personnalisées' : 'Custom safe zones',
        language === 'fr' ? 'Historique des déplacements' : 'Movement history',
        language === 'fr' ? 'Bouton panique d\'urgence' : 'Emergency panic button'
      ],
      setupSteps: [
        language === 'fr' ? 'Créer compte parent sur EDUCAFRIC' : 'Create parent account on EDUCAFRIC',
        language === 'fr' ? 'Ajouter profils des enfants' : 'Add children profiles',
        language === 'fr' ? 'Configurer dispositifs de chaque enfant' : 'Configure each child device',
        language === 'fr' ? 'Définir zones maison, école, grands-parents' : 'Define home, school, grandparents zones',
        language === 'fr' ? 'Personnaliser les notifications' : 'Customize notifications'
      ],
      requirements: [
        language === 'fr' ? 'Smartphone avec EDUCAFRIC app' : 'Smartphone with EDUCAFRIC app',
        language === 'fr' ? 'Dispositif pour chaque enfant' : 'Device for each child',
        language === 'fr' ? 'Autorisation de géolocalisation' : 'Location permission',
        language === 'fr' ? 'Numéro de téléphone vérifié' : 'Verified phone number'
      ]
    },
    {
      type: 'freelancer',
      title: language === 'fr' ? 'Guide Répétiteur' : 'Freelancer Guide',
      description: language === 'fr'
        ? 'Suivi des étudiants en cours particuliers'
        : 'Student tracking during private lessons',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-purple-500',
      devices: (Array.isArray(deviceTypes) ? deviceTypes : []).filter(d => d.id === 'smartphone'),
      benefits: [
        language === 'fr' ? 'Confirmation présence étudiants' : 'Student attendance confirmation',
        language === 'fr' ? 'Sécurité cours privés' : 'Private lesson security',
        language === 'fr' ? 'Communication avec parents' : 'Parent communication',
        language === 'fr' ? 'Suivi ponctualité' : 'Punctuality tracking',
        language === 'fr' ? 'Zones d\'enseignement autorisées' : 'Authorized teaching zones'
      ],
      setupSteps: [
        language === 'fr' ? 'Créer profil répétiteur certifié' : 'Create certified tutor profile',
        language === 'fr' ? 'Valider identité et qualifications' : 'Validate identity and qualifications',
        language === 'fr' ? 'Définir zones d\'enseignement' : 'Define teaching zones',
        language === 'fr' ? 'Connecter avec comptes parents' : 'Connect with parent accounts',
        language === 'fr' ? 'Activer notifications de sécurité' : 'Enable security notifications'
      ],
      requirements: [
        language === 'fr' ? 'Certification répétiteur vérifié' : 'Verified tutor certification',
        language === 'fr' ? 'Smartphone personnel' : 'Personal smartphone',
        language === 'fr' ? 'Autorisation parentale' : 'Parental authorization',
        language === 'fr' ? 'Assurance responsabilité civile' : 'Liability insurance'
      ]
    }
  ];

  const currentGuide = userGuides.find(guide => guide.type === activeTab)!;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'fr' ? 'Guide de Géolocalisation EDUCAFRIC' : 'EDUCAFRIC Geolocation Guide'}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {language === 'fr'
            ? 'Découvrez comment configurer et utiliser les dispositifs de géolocalisation pour assurer la sécurité et le suivi éducatif en Afrique'
            : 'Learn how to set up and use geolocation devices for safety and educational tracking in Africa'}
        </p>
      </div>

      {/* User Type Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {(Array.isArray(userGuides) ? userGuides : []).map(guide => (
            <TabsTrigger key={guide.type} value={guide.type} className="flex items-center gap-2">
              {guide.icon}
              {guide.title || ''}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Array.isArray(userGuides) ? userGuides : []).map(guide => (
          <TabsContent key={guide.type} value={guide.type} className="space-y-6">
            
            {/* Guide Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${guide.color} text-white`}>
                    {guide.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{guide.title || ''}</CardTitle>
                    <CardDescription className="text-lg">{guide.description || ''}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Benefits */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {language === 'fr' ? 'Avantages' : 'Benefits'}
                    </h3>
                    <ul className="space-y-2">
                      {guide.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      {language === 'fr' ? 'Prérequis' : 'Requirements'}
                    </h3>
                    <ul className="space-y-2">
                      {guide.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compatible Devices */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                {language === 'fr' ? 'Dispositifs Compatibles' : 'Compatible Devices'}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {guide.devices.map(device => (
                  <Card key={device.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {device.icon}
                        <div>
                          <CardTitle className="text-lg">{device.name || ''}</CardTitle>
                          {device.africaOptimized && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {language === 'fr' ? 'Optimisé Afrique' : 'Africa Optimized'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{device.description || ''}</p>
                      
                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          {language === 'fr' ? 'Fonctionnalités' : 'Features'}
                        </h4>
                        <ul className="space-y-1">
                          {device.features.map((feature, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Compatibility */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          {language === 'fr' ? 'Compatibilité' : 'Compatibility'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {device.compatibility.map((comp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Setup Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  {language === 'fr' ? 'Guide de Configuration' : 'Setup Guide'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guide.setupSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    {language === 'fr' ? 'Ajouter un Dispositif' : 'Add Device'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Start Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="w-6 h-6" />
              <span className="text-sm">
                {language === 'fr' ? 'Télécharger App' : 'Download App'}
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <QrCode className="w-6 h-6" />
              <span className="text-sm">
                {language === 'fr' ? 'Scanner QR Code' : 'Scan QR Code'}
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Wifi className="w-6 h-6" />
              <span className="text-sm">
                {language === 'fr' ? 'Tester Connexion' : 'Test Connection'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Info className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">
            {language === 'fr' ? 'Support Technique' : 'Technical Support'}
          </span>
        </div>
        <p className="text-gray-600">
          {language === 'fr'
            ? 'Pour toute assistance, contactez notre équipe support EDUCAFRIC au +237 656 200 472'
            : 'For any assistance, contact our EDUCAFRIC support team at +237 656 200 472'}
        </p>
      </div>
    </div>
  );
}