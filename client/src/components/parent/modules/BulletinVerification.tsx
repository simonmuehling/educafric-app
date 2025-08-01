import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  QrCode, Shield, Eye, CheckCircle2, 
  AlertTriangle, Smartphone, Hash,
  FileCheck, Lock, Verified
} from 'lucide-react';

interface VerificationResult {
  success: boolean;
  bulletin?: {
    id: number;
    studentName: string;
    className: string;
    termId: string;
    generalAverage: number;
    classRank: number;
    totalStudentsInClass: number;
    publishedAt: string;
    grades: Array<{
      subjectName: string;
      grade: number;
      coefficient: number;
    }>;
  };
  error?: string;
}

const BulletinVerification = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const text = {
    fr: {
      title: 'Vérification des Bulletins',
      subtitle: 'Vérifiez l\'authenticité des bulletins scolaires avec codes QR/3D',
      howItWorks: 'Comment ça marche',
      step1: 'Scannez le code QR sur le bulletin',
      step2: 'Ou saisissez le code de vérification 3D',
      step3: 'Confirmez l\'authenticité avec l\'école',
      qrCodeScanning: 'Scanner Code QR',
      manualVerification: 'Vérification Manuelle',
      qrCodeInput: 'Code QR',
      verificationCodeInput: 'Code de Vérification 3D',
      scanQR: 'Scanner QR',
      verifyCode: 'Vérifier Code',
      openCamera: 'Ouvrir Caméra',
      enterManually: 'Saisir Manuellement',
      verificationSuccess: 'Bulletin Vérifié',
      verificationFailed: 'Vérification Échouée',
      authenticDocument: 'Document Authentique',
      invalidDocument: 'Document Invalide',
      documentDetails: 'Détails du Document',
      studentName: 'Élève',
      className: 'Classe',
      term: 'Période',
      average: 'Moyenne',
      rank: 'Rang',
      publishedDate: 'Date de Publication',
      grades: 'Notes',
      subject: 'Matière',
      grade: 'Note',
      coefficient: 'Coefficient',
      securityInfo: 'Informations de Sécurité',
      bulletinVerified: 'Bulletin vérifié avec succès',
      bulletinInvalid: 'Code de vérification invalide',
      error: 'Erreur',
      loading: 'Vérification...',
      scanInstructions: 'Pointez votre caméra vers le code QR',
      manualInstructions: 'Saisissez le code de 8 caractères',
      documentAuthenticity: 'Authenticité du Document',
      secureVerification: 'Vérification Sécurisée',
      schoolConfirmed: 'Confirmé par l\'École',
      tryAgain: 'Réessayer',
      newVerification: 'Nouvelle Vérification'
    },
    en: {
      title: 'Bulletin Verification',
      subtitle: 'Verify the authenticity of report cards with QR/3D codes',
      howItWorks: 'How it works',
      step1: 'Scan the QR code on the bulletin',
      step2: 'Or enter the 3D verification code',
      step3: 'Confirm authenticity with the school',
      qrCodeScanning: 'QR Code Scanning',
      manualVerification: 'Manual Verification',
      qrCodeInput: 'QR Code',
      verificationCodeInput: '3D Verification Code',
      scanQR: 'Scan QR',
      verifyCode: 'Verify Code',
      openCamera: 'Open Camera',
      enterManually: 'Enter Manually',
      verificationSuccess: 'Bulletin Verified',
      verificationFailed: 'Verification Failed',
      authenticDocument: 'Authentic Document',
      invalidDocument: 'Invalid Document',
      documentDetails: 'Document Details',
      studentName: 'Student',
      className: 'Class',
      term: 'Term',
      average: 'Average',
      rank: 'Rank',
      publishedDate: 'Published Date',
      grades: 'Grades',
      subject: 'Subject',
      grade: 'Grade',
      coefficient: 'Coefficient',
      securityInfo: 'Security Information',
      bulletinVerified: 'Bulletin verified successfully',
      bulletinInvalid: 'Invalid verification code',
      error: 'Error',
      loading: 'Verifying...',
      scanInstructions: 'Point your camera at the QR code',
      manualInstructions: 'Enter the 8-character code',
      documentAuthenticity: 'Document Authenticity',
      secureVerification: 'Secure Verification',
      schoolConfirmed: 'Confirmed by School',
      tryAgain: 'Try Again',
      newVerification: 'New Verification'
    }
  };

  const t = text[language as keyof typeof text];

  const verifyBulletinMutation = useMutation({
    mutationFn: async (data: { qrCode?: string; verificationCode?: string; verificationType: string }) => {
      const response = await apiRequest('POST', '/api/parent/verify-bulletin', {
        ...data,
        parentId: user?.id,
        ipAddress: '127?.0?.0.1', // Would be actual IP in production
        userAgent: navigator.userAgent
      });
      return response;
    },
    onSuccess: (data: VerificationResult) => {
      setVerificationResult(data);
      if (data.success) {
        toast({
          title: t.bulletinVerified,
          description: language === 'fr' ? 'Le bulletin est authentique et vérifié.' : 'The bulletin is authentic and verified.',
        });
      } else {
        toast({
          title: t.bulletinInvalid,
          description: data.error || (language === 'fr' ? 'Code de vérification invalide.' : 'Invalid verification code.'),
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Erreur lors de la vérification.' : 'Error during verification.',
        variant: 'destructive',
      });
    }
  });

  const handleQRScan = async () => {
    if (!qrCode.trim()) return;
    
    await verifyBulletinMutation.mutateAsync({
      qrCode: qrCode.trim(),
      verificationType: 'qr_scan'
    });
  };

  const handleManualVerification = async () => {
    if (!verificationCode.trim()) return;
    
    await verifyBulletinMutation.mutateAsync({
      verificationCode: verificationCode.trim().toUpperCase(),
      verificationType: 'code_entry'
    });
  };

  const openCameraScanner = () => {
    setIsScanning(true);
    // In a real implementation, this would open camera scanner
    toast({
      title: language === 'fr' ? 'Scanner QR' : 'QR Scanner',
      description: language === 'fr' ? 'Fonctionnalité de scanner à implémenter.' : 'Scanner functionality to be implemented.',
    });
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setQrCode('');
    setVerificationCode('');
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.title || ''}</h1>
            <p className="text-green-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <ModernCard className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{t.howItWorks}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              1
            </div>
            <div>
              <div className="font-medium text-gray-900">{t.step1}</div>
              <div className="text-sm text-gray-600 mt-1">{t.scanInstructions}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
              2
            </div>
            <div>
              <div className="font-medium text-gray-900">{t.step2}</div>
              <div className="text-sm text-gray-600 mt-1">{t.manualInstructions}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
              3
            </div>
            <div>
              <div className="font-medium text-gray-900">{t.step3}</div>
              <div className="text-sm text-gray-600 mt-1">{t.secureVerification}</div>
            </div>
          </div>
        </div>
      </ModernCard>

      {!verificationResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner QR Code */}
          <ModernCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">{t.qrCodeScanning}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-code">{t.qrCodeInput}</Label>
                <Input
                  id="qr-code"
                  value={qrCode}
                  onChange={(e) => setQrCode(e?.target?.value)}
                  placeholder="EDUCAFRIC-12345-1234567890"
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={openCameraScanner}
                  variant="outline"
                  className="flex-1"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  {t.openCamera}
                </Button>
                <Button
                  onClick={handleQRScan}
                  disabled={!qrCode.trim() || verifyBulletinMutation.isPending}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {verifyBulletinMutation.isPending ? t.loading : t.scanQR}
                </Button>
              </div>
            </div>
          </ModernCard>

          {/* Vérification Manuelle */}
          <ModernCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold">{t.manualVerification}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-code">{t.verificationCodeInput}</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e?.target?.value.toUpperCase())}
                  placeholder="ABC12XYZ"
                  maxLength={8}
                  className="font-mono text-center text-lg"
                />
              </div>

              <Button
                onClick={handleManualVerification}
                disabled={!verificationCode.trim() || verifyBulletinMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                {verifyBulletinMutation.isPending ? t.loading : t.verifyCode}
              </Button>
            </div>
          </ModernCard>
        </div>
      ) : (
        /* Résultats de vérification */
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {verificationResult.success ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h3 className="text-xl font-semibold">
                  {verificationResult.success ? t.verificationSuccess : t.verificationFailed}
                </h3>
                <p className="text-gray-600">
                  {verificationResult.success ? t.authenticDocument : t.invalidDocument}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {verificationResult.success && (
                <Badge variant="default" className="bg-green-600">
                  <Verified className="w-4 h-4 mr-1" />
                  {t.schoolConfirmed}
                </Badge>
              )}
              <Button onClick={resetVerification} variant="outline">
                {t.newVerification}
              </Button>
            </div>
          </div>

          {verificationResult.success && verificationResult.bulletin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Détails du bulletin */}
              <div>
                <h4 className="text-lg font-semibold mb-4">{t.documentDetails}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t.studentName}:</span>
                    <span>{verificationResult?.bulletin?.studentName}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t.className}:</span>
                    <span>{verificationResult?.bulletin?.className}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t.average}:</span>
                    <span className="font-bold text-blue-600">
                      {verificationResult?.bulletin?.generalAverage.toFixed(2)}/20
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t.rank}:</span>
                    <span>
                      {verificationResult?.bulletin?.classRank}/{verificationResult?.bulletin?.totalStudentsInClass}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{t.publishedDate}:</span>
                    <span>{new Date(verificationResult?.bulletin?.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-lg font-semibold mb-4">{t.grades}</h4>
                <div className="space-y-2">
                  {verificationResult.bulletin.grades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <span className="font-medium">{grade.subjectName}</span>
                        <Badge variant="outline" className="ml-2">
                          {t.coefficient}: {grade.coefficient}
                        </Badge>
                      </div>
                      <span className="font-bold text-blue-600">
                        {grade?.grade?.toFixed(2)}/20
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!verificationResult.success && (
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h4 className="text-lg font-semibold text-red-600 mb-2">{t.invalidDocument}</h4>
              <p className="text-gray-600 mb-4">
                {verificationResult.error || (language === 'fr' ? 'Le code de vérification est invalide ou le document n\'est pas authentique.' : 'The verification code is invalid or the document is not authentic.')}
              </p>
              <Button onClick={resetVerification} variant="outline">
                {t.tryAgain}
              </Button>
            </div>
          )}
        </ModernCard>
      )}

      {/* Informations de sécurité */}
      <ModernCard className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">{t.securityInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="mb-2">
              <strong>{t.documentAuthenticity}:</strong> {language === 'fr' ? 'Chaque bulletin est sécurisé avec un code QR unique et un code de vérification 3D.' : 'Each bulletin is secured with a unique QR code and 3D verification code.'}
            </p>
            <p>
              <strong>{t.secureVerification}:</strong> {language === 'fr' ? 'La vérification se fait directement avec la base de données de l\'école.' : 'Verification is done directly with the school\'s database.'}
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>{t.schoolConfirmed}:</strong> {language === 'fr' ? 'Seuls les documents officiels génèrent des codes de vérification valides.' : 'Only official documents generate valid verification codes.'}
            </p>
            <p>
              <strong>Protection:</strong> {language === 'fr' ? 'Impossible de falsifier les codes ou documents.' : 'Impossible to forge codes or documents.'}
            </p>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};

export default BulletinVerification;