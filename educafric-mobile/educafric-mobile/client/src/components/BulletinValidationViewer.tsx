import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, QrCode, CheckCircle, XCircle, Eye, Download, Stamp } from 'lucide-react';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface BulletinValidationViewerProps {
  bulletinId?: number;
  showVerifyByHash?: boolean;
}

export default function BulletinValidationViewer({ 
  bulletinId, 
  showVerifyByHash = true 
}: BulletinValidationViewerProps) {
  const { toast } = useToast();
  const [verificationHash, setVerificationHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const { data: validation, isLoading } = useQuery({
    queryKey: ['/api/bulletins', bulletinId, 'validation'],
    queryFn: () => fetch(`/api/bulletins/${bulletinId}/validation`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!bulletinId
  });

  const handleVerifyByHash = async () => {
    if (!verificationHash.trim()) {
      toast({
        title: "Hash requis",
        description: "Veuillez entrer un hash de validation",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`/api/bulletins/verify/${verificationHash}`, {
        credentials: 'include'
      });
      const result = await response.json();
      setVerificationResult(result);
      
      if (result.isValid) {
        toast({
          title: "Bulletin validé",
          description: "Le bulletin est authentique et valide"
        });
      } else {
        toast({
          title: "Validation échouée",
          description: result.errorMessage || "Le bulletin n'est pas valide",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le bulletin",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getValidationLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'basic': return 'bg-yellow-100 text-yellow-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'maximum': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidationTypeIcon = (type: string | undefined) => {
    switch (type) {
      case 'qr_code': return <QrCode className="w-4 h-4" />;
      case 'digital_signature': return <Shield className="w-4 h-4" />;
      case 'combined': return <CheckCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <ModernCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulletin Validation Status */}
      {validation && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Validation du Bulletin
            </h3>
            <Badge className={`${validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {validation.isValid ? 'Valide' : 'Invalide'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Type de validation</label>
              <div className="flex items-center gap-2">
                {getValidationTypeIcon(validation.validationType)}
                <span className="capitalize">{validation.validationType ? validation.validationType.replace('_', ' ') : 'Combined'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Niveau de sécurité</label>
              <Badge className={getValidationLevelColor(validation.validationLevel || 'enhanced')}>
                {validation.validationLevel || 'Enhanced'}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Hash de validation</label>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                {validation.validationHash || 'Non disponible'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Vérifications</label>
              <span className="text-sm">{validation.verificationCount || 0} fois vérifié</span>
            </div>
          </div>

          {/* QR Code Display */}
          {validation.qrCodeImageUrl && (
            <div className="text-center space-y-4">
              <h4 className="font-medium">QR Code de Validation</h4>
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={validation.qrCodeImageUrl} 
                  alt="QR Code de validation" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600">
                Scannez ce QR code pour vérifier l'authenticité du bulletin
              </p>
            </div>
          )}

          {/* Digital Signatures Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              {validation.teacherSignatureHash ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Signature Enseignant</span>
            </div>

            <div className="flex items-center gap-2">
              {validation.directorSignatureHash ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Signature Directeur</span>
            </div>

            <div className="flex items-center gap-2">
              {validation.schoolStampHash ? (
                <Stamp className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Tampon École</span>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Verification by Hash */}
      {showVerifyByHash && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Vérifier un Bulletin
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hash de validation ou scan QR code
              </label>
              <div className="flex gap-2">
                <Input
                  value={verificationHash}
                  onChange={(e) => setVerificationHash(e.target.value)}
                  placeholder="Entrez le hash de validation..."
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={handleVerifyByHash}
                  disabled={isVerifying}
                  className="whitespace-nowrap"
                >
                  {isVerifying ? 'Vérification...' : 'Vérifier'}
                </Button>
              </div>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-4 rounded-lg ${
                verificationResult.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {verificationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.isValid ? 'Bulletin Valide' : 'Bulletin Invalide'}
                  </span>
                </div>

                {verificationResult.isValid && verificationResult.bulletinData && (
                  <div className="space-y-2 text-sm">
                    <p><strong>Étudiant:</strong> {verificationResult.bulletinData.student?.firstName} {verificationResult.bulletinData.student?.lastName}</p>
                    <p><strong>Classe:</strong> {verificationResult.bulletinData.student?.className}</p>
                    <p><strong>École:</strong> {verificationResult.bulletinData.school?.name}</p>
                    <p><strong>Validé le:</strong> {new Date(verificationResult.validationInfo?.validatedAt).toLocaleDateString()}</p>
                  </div>
                )}

                {!verificationResult.isValid && (
                  <p className="text-red-700 text-sm">
                    {verificationResult.errorMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </ModernCard>
      )}
    </div>
  );
}