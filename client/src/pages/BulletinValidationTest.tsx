import { useState } from 'react';
import { Shield, QrCode, Stamp, FileCheck, Upload, Check, X } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import BulletinValidationViewer from '@/components/BulletinValidationViewer';
import { SchoolAssetUploader } from '@/components/SchoolAssetUploader';

export default function BulletinValidationTest() {
  const { toast } = useToast();
  const [testBulletinId, setTestBulletinId] = useState('1');
  const [validationType, setValidationType] = useState('combined');
  const [validationLevel, setValidationLevel] = useState('enhanced');
  const [isCreatingValidation, setIsCreatingValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleCreateValidation = async () => {
    if (!testBulletinId) {
      toast({
        title: "ID bulletin requis",
        description: "Veuillez entrer un ID de bulletin valide",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingValidation(true);
    try {
      const response = await fetch(`/api/bulletins/${testBulletinId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          validationType,
          validationLevel,
          teacherSignatureUrl: '/school-assets/teacher-signature.png',
          directorSignatureUrl: '/school-assets/director-signature.png',
          schoolStampUrl: '/school-assets/school-stamp.png'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setValidationResult(result.validation);
        toast({
          title: "Validation créée",
          description: "Le système de validation du bulletin a été configuré avec succès"
        });
      } else {
        throw new Error(result.error || 'Erreur de validation');
      }
    } catch (error) {
      console.error('Validation creation error:', error);
      toast({
        title: "Erreur de validation",
        description: "Impossible de créer la validation du bulletin",
        variant: "destructive"
      });
    } finally {
      setIsCreatingValidation(false);
    }
  };

  const validationFeatures = [
    {
      icon: <QrCode className="w-6 h-6 text-blue-600" />,
      title: "QR Code Sécurisé",
      description: "Code QR avec hash cryptographique SHA-256 pour validation instantanée",
      status: "active"
    },
    {
      icon: <Stamp className="w-6 h-6 text-green-600" />,
      title: "Tampons Numériques",
      description: "Integration des tampons officiels de l'école avec vérification d'intégrité",
      status: "active"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Signatures Cryptées",
      description: "Signatures numériques des enseignants et directeurs avec hash sécurisé",
      status: "active"
    },
    {
      icon: <FileCheck className="w-6 h-6 text-orange-600" />,
      title: "Anti-Falsification",
      description: "Détection automatique de modifications avec suivi d'intégrité",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Système de Validation des Bulletins
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test complet du système de validation EDUCAFRIC avec QR codes, tampons numériques et signatures cryptographiques
          </p>
        </div>

        {/* Validation Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {validationFeatures.map((feature, index) => (
            <ModernCard key={index} className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
              <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Actif
              </Badge>
            </ModernCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* School Assets Management */}
          <ModernCard className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" />
              Gestion des Assets École
            </h2>
            <SchoolAssetUploader />
          </ModernCard>

          {/* Validation Test Panel */}
          <ModernCard className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              Test de Validation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID du Bulletin de Test
                </label>
                <Input
                  value={testBulletinId}
                  onChange={(e) => setTestBulletinId(e.target.value)}
                  placeholder="Entrez l'ID du bulletin..."
                  type="number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Validation
                </label>
                <Select value={validationType} onValueChange={setValidationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr_code">QR Code Seulement</SelectItem>
                    <SelectItem value="digital_signature">Signatures Numériques</SelectItem>
                    <SelectItem value="combined">Combiné (Recommandé)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau de Sécurité
                </label>
                <Select value={validationLevel} onValueChange={setValidationLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basique</SelectItem>
                    <SelectItem value="enhanced">Renforcé</SelectItem>
                    <SelectItem value="maximum">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCreateValidation}
                disabled={isCreatingValidation}
                className="w-full"
                size="lg"
              >
                {isCreatingValidation ? 'Création en cours...' : 'Créer Validation Test'}
              </Button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Validation Créée avec Succès
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Hash:</strong> <span className="font-mono text-xs break-all">{validationResult.validationHash}</span></p>
                  <p><strong>Type:</strong> {validationResult.validationType}</p>
                  <p><strong>Niveau:</strong> {validationResult.validationLevel}</p>
                </div>
              </div>
            )}
          </ModernCard>
        </div>

        {/* Validation Viewer */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            Visualiseur et Vérificateur de Validation
          </h2>
          <BulletinValidationViewer 
            bulletinId={testBulletinId ? parseInt(testBulletinId) : undefined}
            showVerifyByHash={true}
          />
        </div>

        {/* Implementation Guide */}
        <ModernCard className="p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-orange-600" />
            Guide d'Implémentation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Étapes de Validation</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Upload des assets école (logo, tampon, signatures)</li>
                <li>Génération automatique du QR code avec hash SHA-256</li>
                <li>Intégration des signatures numériques cryptées</li>
                <li>Validation par scan QR ou vérification hash</li>
                <li>Suivi d'intégrité et audit trail complet</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités Sécurisées</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Cryptographie SHA-256 pour tous les hash</li>
                <li>Détection automatique de falsification</li>
                <li>Expiration configurable des validations</li>
                <li>Audit trail complet des vérifications</li>
                <li>Support multi-école avec assets personnalisés</li>
              </ul>
            </div>
          </div>
        </ModernCard>

        {/* Footer */}
        <div className="text-center mt-8 py-6 border-t border-gray-200">
          <p className="text-gray-600">
            Système de validation sécurisé EDUCAFRIC - Technologie anti-falsification de pointe
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Compatible avec tous les types de bulletins et dispositifs de scan QR
          </p>
        </div>
      </div>
    </div>
  );
}