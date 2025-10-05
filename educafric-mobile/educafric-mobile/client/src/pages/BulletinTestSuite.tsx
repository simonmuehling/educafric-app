import React from 'react';
import { FileText, QrCode, Shield, Plus, Eye, Download, TestTube } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BulletinTestSuite() {
  const testModules = [
    {
      id: 'creation',
      title: 'Création de Bulletins',
      description: 'Test complet du système de création de bulletins avec notes, appréciations et calculs automatiques',
      icon: <Plus className="w-6 h-6 text-blue-600" />,
      route: '/bulletin-creation-test',
      status: 'ready',
      features: [
        'Sélection d\'étudiants de test',
        'Saisie des notes par matière',
        'Calcul automatique des moyennes',
        'Appréciations et conduite',
        'Génération aléatoire de données'
      ]
    },
    {
      id: 'validation',
      title: 'Validation et Sécurisation',
      description: 'Test du système de validation avec QR codes, tampons numériques et signatures cryptographiques',
      icon: <Shield className="w-6 h-6 text-green-600" />,
      route: '/bulletin-validation-test',
      status: 'ready',
      features: [
        'QR codes sécurisés SHA-256',
        'Tampons numériques d\'école',
        'Signatures cryptographiques',
        'Vérification d\'intégrité',
        'Audit trail complet'
      ]
    },
    {
      id: 'verification',
      title: 'Vérification et Contrôle',
      description: 'Test des systèmes de vérification par QR code et hash pour détecter les falsifications',
      icon: <QrCode className="w-6 h-6 text-purple-600" />,
      route: '/bulletin-validation-test',
      status: 'ready',
      features: [
        'Scan QR code mobile',
        'Vérification par hash',
        'Détection de falsification',
        'Statuts de validation',
        'Historique des vérifications'
      ]
    },
    {
      id: 'pdf-generation',
      title: 'Génération PDF',
      description: 'Test de génération automatique de bulletins PDF avec mise en page africaine et watermarks',
      icon: <Download className="w-6 h-6 text-orange-600" />,
      route: '/bulletin-creation-test',
      status: 'ready',
      features: [
        'Template africain personnalisé',
        'QR codes intégrés',
        'Watermarks de sécurité',
        'Signatures numériques',
        'Export multi-format'
      ]
    },
    {
      id: 'integration',
      title: 'Tests d\'Intégration',
      description: 'Tests bout-en-bout du flux complet depuis la création jusqu\'à la validation',
      icon: <TestTube className="w-6 h-6 text-red-600" />,
      route: '/bulletin-creation-test',
      status: 'ready',
      features: [
        'Workflow complet',
        'Gestion des erreurs',
        'Performance et charge',
        'Compatibilité mobile',
        'Tests de régression'
      ]
    },
    {
      id: 'visualization',
      title: 'Visualisation et Aperçu',
      description: 'Interface de prévisualisation des bulletins avec différents thèmes et formats',
      icon: <Eye className="w-6 h-6 text-teal-600" />,
      route: '/bulletin-validation-test',
      status: 'ready',
      features: [
        'Aperçu en temps réel',
        'Thèmes multiples',
        'Mode impression',
        'Responsive design',
        'Export image'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'issues': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt';
      case 'testing': return 'En test';
      case 'issues': return 'Problèmes';
      default: return 'Indisponible';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Suite de Tests - Bulletins EDUCAFRIC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Système complet de tests pour la création, validation et sécurisation des bulletins scolaires
          </p>
          <div className="flex justify-center mt-6">
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              6 Modules de Test Disponibles
            </Badge>
          </div>
        </div>

        {/* Test Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testModules.map((module) => (
            <ModernCard key={module.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {module.icon}
                  <Badge className={getStatusColor(module.status)}>
                    {getStatusText(module.status)}
                  </Badge>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {module.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {module.description}
              </p>

              <div className="space-y-2 mb-6">
                <h4 className="font-medium text-gray-800 text-sm">Fonctionnalités testées :</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {module.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => window.location.href = module.route}
                className="w-full"
                disabled={module.status !== 'ready'}
              >
                {module.status === 'ready' ? 'Lancer Test' : 'Indisponible'}
              </Button>
            </ModernCard>
          ))}
        </div>

        {/* Quick Access Panel */}
        <ModernCard className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <TestTube className="w-6 h-6 text-blue-600" />
            Accès Rapide aux Tests
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = '/bulletin-creation-test'}
              className="flex items-center gap-2 justify-center p-4 h-auto"
              variant="outline"
            >
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Création Rapide</div>
                <div className="text-xs opacity-75">Créer un bulletin de test</div>
              </div>
            </Button>

            <Button 
              onClick={() => window.location.href = '/bulletin-validation-test'}
              className="flex items-center gap-2 justify-center p-4 h-auto"
              variant="outline"
            >
              <Shield className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Validation</div>
                <div className="text-xs opacity-75">Tester la sécurisation</div>
              </div>
            </Button>

            <Button 
              onClick={() => window.location.href = '/bulletin-validation-test'}
              className="flex items-center gap-2 justify-center p-4 h-auto"
              variant="outline"
            >
              <QrCode className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Vérification</div>
                <div className="text-xs opacity-75">Scanner QR code</div>
              </div>
            </Button>
          </div>
        </ModernCard>

        {/* Test Workflow Guide */}
        <ModernCard className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            Guide de Test Complet
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Workflow de Test Recommandé</h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">1.</span>
                  <div>
                    <strong>Création :</strong> Commencer par créer un bulletin avec des données de test
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-green-600">2.</span>
                  <div>
                    <strong>Validation :</strong> Appliquer QR codes et tampons de sécurité
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-purple-600">3.</span>
                  <div>
                    <strong>Vérification :</strong> Tester la lecture QR et validation hash
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-orange-600">4.</span>
                  <div>
                    <strong>Export :</strong> Générer PDF et tester l'impression
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-red-600">5.</span>
                  <div>
                    <strong>Intégration :</strong> Tests bout-en-bout et performance
                  </div>
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Données de Test Disponibles</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Étudiants de Test</h4>
                  <ul className="text-blue-600 mt-1 space-y-1">
                    <li>• Emma Talla (6ème A)</li>
                    <li>• Paul Ngono (5ème B)</li>
                    <li>• Marie Fokam (4ème C)</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Matières Configurées</h4>
                  <ul className="text-green-600 mt-1 space-y-1">
                    <li>• Mathématiques (Coef. 4)</li>
                    <li>• Français (Coef. 4)</li>
                    <li>• Anglais (Coef. 3)</li>
                    <li>• Sciences Physiques (Coef. 3)</li>
                    <li>• Histoire-Géographie (Coef. 2)</li>
                    <li>• Éducation Physique (Coef. 1)</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Assets de Test</h4>
                  <ul className="text-purple-600 mt-1 space-y-1">
                    <li>• Tampons d'école numériques</li>
                    <li>• Signatures enseignants/directeurs</li>
                    <li>• Logos officiels</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Footer */}
        <div className="text-center mt-8 py-6 border-t border-gray-200">
          <p className="text-gray-600">
            Suite de tests EDUCAFRIC - Validation complète du système de bulletins
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tous les tests utilisent des données sécurisées et des environnements isolés
          </p>
        </div>
      </div>
    </div>
  );
}