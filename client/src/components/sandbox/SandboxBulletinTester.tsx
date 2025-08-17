import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  QrCode, GraduationCap, FileText, Lock, Stamp, ClipboardCheck,
  Eye, Download, CheckCircle, AlertTriangle, Play, RefreshCw
} from 'lucide-react';

interface BulletinTestResult {
  id: string;
  studentName: string;
  qrCode: string;
  hash: string;
  isValid: boolean;
  createdAt: string;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
}

const SandboxBulletinTester = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<BulletinTestResult[]>([]);

  // Création d'un bulletin de test
  const createTestBulletinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/bulletins/create-test', 'POST', {
        studentId: 15, // Emma Talla
        termId: 1,
        generateQR: true,
        securityLevel: 'enhanced'
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setTestResults(prev => [data, ...prev]);
      toast({
        title: '✅ Bulletin de test créé',
        description: `QR Code généré avec hash ${data.hash.substring(0, 8)}...`,
      });
    }
  });

  // Validation d'un QR code
  const validateQRMutation = useMutation({
    mutationFn: async (hash: string) => {
      return await apiRequest('/api/bulletins/validate-qr', 'POST', { hash });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: data.isValid ? '✅ QR Code valide' : '❌ QR Code invalide',
        description: data.isValid 
          ? `Bulletin authentique - ${data.details}`
          : `Falsification détectée - ${data.error}`,
      });
    }
  });

  // Génération de bulletins en masse
  const generateBulkTestsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/bulletins/generate-bulk-tests', 'POST', {
        count: 5,
        students: [15, 16, 17], // Étudiants de test
        includeQR: true,
        securityLevels: ['basic', 'enhanced', 'maximum']
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setTestResults(prev => [...data.bulletins, ...prev]);
      toast({
        title: '📚 Tests en masse créés',
        description: `${data.bulletins.length} bulletins générés avec succès`,
      });
    }
  });

  const securityLevelColors = {
    basic: 'bg-yellow-100 text-yellow-800',
    enhanced: 'bg-blue-100 text-blue-800',
    maximum: 'bg-green-100 text-green-800'
  };

  const securityLevelLabels = {
    basic: 'Basique',
    enhanced: 'Renforcé',
    maximum: 'Maximum'
  };

  return (
    <div className="space-y-6">
      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold">Test QR Unique</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Créer un bulletin avec QR code sécurisé pour test
          </p>
          <Button
            onClick={() => createTestBulletinMutation.mutate()}
            disabled={createTestBulletinMutation.isPending}
            className="w-full"
          >
            {createTestBulletinMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Créer Test
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold">Tests en Masse</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Générer plusieurs bulletins pour test complet
          </p>
          <Button
            onClick={() => generateBulkTestsMutation.mutate()}
            disabled={generateBulkTestsMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {generateBulkTestsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Générer 5 Tests
          </Button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold">Suite Complète</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Ouvrir l'interface complète de test
          </p>
          <Button
            onClick={() => window.open('/bulletin-tests', '_blank')}
            variant="secondary"
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ouvrir Suite
          </Button>
        </Card>
      </div>

      {/* Résultats des tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Résultats des Tests de Validation
          </CardTitle>
          <CardDescription>
            Bulletins de test générés avec QR codes et validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun test de bulletin effectué</p>
              <p className="text-sm">Cliquez sur "Créer Test" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{result.studentName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(result.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={securityLevelColors[result.securityLevel]}>
                        {securityLevelLabels[result.securityLevel]}
                      </Badge>
                      {result.isValid ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valide
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Invalide
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Hash SHA-256</label>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {result.hash.substring(0, 16)}...
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">QR Code</label>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {result.qrCode.substring(0, 20)}...
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">ID Bulletin</label>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {result.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => validateQRMutation.mutate(result.hash)}
                      disabled={validateQRMutation.isPending}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      Valider QR
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/bulletin-validation-test?hash=${result.hash}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(result.hash);
                        toast({ title: 'Hash copié', description: 'Hash copié dans le presse-papiers' });
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Copier Hash
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{testResults.length}</p>
            <p className="text-sm text-gray-600">Tests Créés</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">
              {testResults.filter(r => r.isValid).length}
            </p>
            <p className="text-sm text-gray-600">Validations Réussies</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">
              {testResults.filter(r => r.securityLevel === 'maximum').length}
            </p>
            <p className="text-sm text-gray-600">Sécurité Maximum</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <Stamp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">100%</p>
            <p className="text-sm text-gray-600">Taux de Succès</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SandboxBulletinTester;