import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface StudentQRGeneratorProps {
  language: 'fr' | 'en';
}

const StudentQRGenerator: React.FC<StudentQRGeneratorProps> = ({ language }) => {
  const { toast } = useToast();
  const [qrData, setQrData] = useState<{
    qrCode: string;
    token: string;
    expiresAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const texts = {
    fr: {
      title: 'Générateur Code QR - Connexion Parent',
      subtitle: 'Générez un code QR pour permettre à vos parents de se connecter',
      generate: 'Générer Code QR',
      download: 'Télécharger QR',
      token: 'Token de Sécurité',
      expires: 'Expire le',
      instructions: {
        title: 'Instructions d\'utilisation :',
        steps: [
          '1. Cliquez sur "Générer Code QR"',
          '2. Partagez le code QR avec vos parents',
          '3. Vos parents scannent le code avec l\'app EDUCAFRIC',
          '4. L\'école valide la connexion parent-enfant',
          '5. Vos parents obtiennent l\'accès complet à vos données'
        ]
      },
      security: {
        title: 'Sécurité :',
        points: [
          '• Code valide 24 heures seulement',
          '• Token crypté et sécurisé',
          '• Validation obligatoire par l\'école',
          '• Une seule utilisation par code'
        ]
      },
      success: 'Code QR généré avec succès',
      error: 'Erreur génération QR',
      processing: 'Génération en cours...'
    },
    en: {
      title: 'QR Code Generator - Parent Connection',
      subtitle: 'Generate a QR code to allow your parents to connect',
      generate: 'Generate QR Code',
      download: 'Download QR',
      token: 'Security Token',
      expires: 'Expires on',
      instructions: {
        title: 'Usage Instructions:',
        steps: [
          '1. Click "Generate QR Code"',
          '2. Share the QR code with your parents',
          '3. Your parents scan the code with EDUCAFRIC app',
          '4. School validates the parent-child connection',
          '5. Your parents get full access to your data'
        ]
      },
      security: {
        title: 'Security:',
        points: [
          '• Code valid for 24 hours only',
          '• Encrypted and secure token',
          '• Mandatory school validation',
          '• Single use per code'
        ]
      },
      success: 'QR code generated successfully',
      error: 'QR generation error',
      processing: 'Generating...'
    }
  };

  const t = texts[language];

  const generateQR = async () => {
    setLoading(true);
    try {
      console.log('[QR_GENERATION] Student generating QR code');
      
      const response = await apiRequest('POST', '/api/student/generate-qr', {});

      if (response.ok) {
        const result = await response.json();
        console.log('[QR_GENERATION] ✅ QR code generated:', result);
        
        setQrData({
          qrCode: result.qrCode,
          token: result.token,
          expiresAt: result.expiresAt
        });

        toast({
          title: t.success,
          description: result.message || t.success,
          variant: 'default'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'QR generation failed');
      }
    } catch (error: any) {
      console.error('[QR_GENERATION] ❌ Error:', error);
      toast({
        title: t.error,
        description: error.message || t.error,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCode) return;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `educafric-qr-${Date.now()}.svg`;
    document?.body?.appendChild(link);
    link.click();
    document?.body?.removeChild(link);

    toast({
      title: language === 'fr' ? 'Téléchargement' : 'Download',
      description: language === 'fr' ? 'Code QR téléchargé' : 'QR code downloaded',
      variant: 'default'
    });
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-purple-800">
            <QrCode className="h-6 w-6" />
            <span>{t.title || ''}</span>
          </CardTitle>
          <p className="text-purple-600">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* Generate QR */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {!qrData ? (
              <Button
                onClick={generateQR}
                disabled={loading}
                size="lg"
                className="w-full md:w-auto"
              >
                <QrCode className="h-5 w-5 mr-2" />
                {loading ? t.processing : t.generate}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-lg">
                    <img 
                      src={qrData.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                </div>

                {/* Token and Expiry Info */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{t.token}:</span>
                    <span className="font-mono text-gray-600 text-xs">
                      {qrData?.token?.substring(0, 20)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{t.expires}:</span>
                    <span className="text-red-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatExpiry(qrData.expiresAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 justify-center">
                  <Button onClick={downloadQR} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t.download}
                  </Button>
                  <Button onClick={generateQR} disabled={loading}>
                    <QrCode className="h-4 w-4 mr-2" />
                    {t.generate}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <CheckCircle className="h-5 w-5" />
              <span>{t?.instructions?.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {t.instructions.steps.map((step, index) => (
                <p key={index} className="text-sm text-blue-600">{step}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <AlertCircle className="h-5 w-5" />
              <span>{t?.security?.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {t.security.points.map((point, index) => (
                <p key={index} className="text-sm text-green-600">{point}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Display */}
      {qrData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <h3 className="font-medium text-green-800">
                  {language === 'fr' ? 'Code QR Actif' : 'QR Code Active'}
                </h3>
                <p className="text-sm text-green-600">
                  {language === 'fr' 
                    ? 'Partagez ce code avec vos parents pour qu\'ils puissent se connecter' 
                    : 'Share this code with your parents so they can connect'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentQRGenerator;