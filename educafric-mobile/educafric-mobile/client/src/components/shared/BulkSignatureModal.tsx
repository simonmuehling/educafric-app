import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import DigitalSignatureCanvas from './DigitalSignatureCanvas';
import { 
  FileSignature, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  X
} from 'lucide-react';

interface BulkSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBulletins: Array<{
    id: number;
    studentId: number;
    studentName: string;
    className: string;
    term: string;
    academicYear: string;
    hasSignature?: boolean;
  }>;
  onSignatureComplete: (results: any) => void;
  directorName?: string;
}

const BulkSignatureModal: React.FC<BulkSignatureModalProps> = ({
  isOpen,
  onClose,
  selectedBulletins,
  onSignatureComplete,
  directorName = "Directeur"
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentSignature, setCurrentSignature] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [signingProgress, setSigningProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'signature' | 'preview' | 'signing' | 'complete'>('signature');
  const [signatureResults, setSignatureResults] = useState<any>(null);

  const text = {
    fr: {
      title: 'Signature Numérique en Lot',
      subtitle: 'Signer plusieurs bulletins à la fois',
      selectedBulletins: 'Bulletins Sélectionnés',
      step1: 'Étape 1: Créer/Sélectionner Signature',
      step2: 'Étape 2: Prévisualiser',
      step3: 'Étape 3: Appliquer Signatures',
      bulletinsToSign: 'bulletins à signer',
      alreadySigned: 'déjà signé(s)',
      createSignature: 'Veuillez créer ou sélectionner une signature',
      preview: 'Prévisualiser',
      signBulletins: 'Signer les Bulletins',
      signing: 'Signature en cours...',
      complete: 'Signature Terminée',
      cancel: 'Annuler',
      close: 'Fermer',
      successMessage: 'Bulletins signés avec succès',
      errorMessage: 'Erreur lors de la signature',
      signaturePreview: 'Aperçu de la Signature',
      willBeApplied: 'Cette signature sera appliquée à',
      bulletinsSelected: 'bulletins sélectionnés',
      progress: 'Progression',
      processing: 'Traitement...',
      results: 'Résultats de la Signature',
      successfullySigned: 'Signés avec succès',
      errors: 'Erreurs',
      viewDetails: 'Voir Détails'
    },
    en: {
      title: 'Bulk Digital Signature',
      subtitle: 'Sign multiple bulletins at once',
      selectedBulletins: 'Selected Bulletins',
      step1: 'Step 1: Create/Select Signature',
      step2: 'Step 2: Preview',
      step3: 'Step 3: Apply Signatures',
      bulletinsToSign: 'bulletins to sign',
      alreadySigned: 'already signed',
      createSignature: 'Please create or select a signature',
      preview: 'Preview',
      signBulletins: 'Sign Bulletins',
      signing: 'Signing in progress...',
      complete: 'Signature Complete',
      cancel: 'Cancel',
      close: 'Close',
      successMessage: 'Bulletins signed successfully',
      errorMessage: 'Error during signing',
      signaturePreview: 'Signature Preview',
      willBeApplied: 'This signature will be applied to',
      bulletinsSelected: 'selected bulletins',
      progress: 'Progress',
      processing: 'Processing...',
      results: 'Signature Results',
      successfullySigned: 'Successfully Signed',
      errors: 'Errors',
      viewDetails: 'View Details'
    }
  };

  const t = text[language as keyof typeof text] || text.fr;

  // Calculate signature statistics
  const totalBulletins = selectedBulletins.length;
  const alreadySigned = selectedBulletins.filter(b => b.hasSignature).length;
  const toSign = totalBulletins - alreadySigned;

  // Bulk signature mutation
  const bulkSignMutation = useMutation({
    mutationFn: async ({ bulletinIds, signature }: { bulletinIds: number[], signature: string }) => {
      return apiRequest('/api/comprehensive-bulletins/bulk-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletinIds,
          signature,
          signerName: directorName
        })
      });
    },
    onSuccess: (data: any) => {
      console.log('[BULK_SIGNATURE] ✅ Bulk signature successful:', data);
      setSignatureResults(data);
      setCurrentStep('complete');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins/approved-students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins/signed-bulletins'] });
      
      onSignatureComplete(data);
      
      toast({
        title: t.successMessage,
        description: `${data.summary?.successfullySigned || 0} bulletins signés`,
      });
    },
    onError: (error: any) => {
      console.error('[BULK_SIGNATURE] ❌ Bulk signature failed:', error);
      toast({
        title: t.errorMessage,
        description: error.message || 'Une erreur est survenue lors de la signature',
        variant: 'destructive'
      });
      setCurrentStep('signature');
    }
  });

  const handleSignatureChange = (signature: string | null) => {
    setCurrentSignature(signature);
  };

  const handlePreview = () => {
    if (!currentSignature) {
      toast({
        title: t.errorMessage,
        description: t.createSignature,
        variant: 'destructive'
      });
      return;
    }
    setCurrentStep('preview');
  };

  const handleApplySignature = async () => {
    if (!currentSignature) {
      toast({
        title: t.errorMessage,
        description: t.createSignature,
        variant: 'destructive'
      });
      return;
    }

    setCurrentStep('signing');
    setSigningProgress(0);

    // Get bulletins that need signing (exclude already signed ones)
    const bulletinsToSign = selectedBulletins
      .filter(b => !b.hasSignature)
      .map(b => b.id);

    if (bulletinsToSign.length === 0) {
      toast({
        title: 'Information',
        description: 'Tous les bulletins sélectionnés sont déjà signés',
      });
      setCurrentStep('complete');
      return;
    }

    // Simulate progress during signing
    const progressInterval = setInterval(() => {
      setSigningProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await bulkSignMutation.mutateAsync({
        bulletinIds: bulletinsToSign,
        signature: currentSignature
      });
      setSigningProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setSigningProgress(0);
    }
  };

  const handleClose = () => {
    setCurrentSignature(null);
    setCurrentStep('signature');
    setSigningProgress(0);
    setSignatureResults(null);
    setShowPreview(false);
    onClose();
  };

  const renderSignatureStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t.step1}</h3>
        <p className="text-gray-600 mb-4">{t.createSignature}</p>
      </div>

      <DigitalSignatureCanvas
        onSignatureChange={handleSignatureChange}
        userName={directorName}
        showSaveOption={true}
        className="mx-auto"
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleClose} data-testid="button-cancel-signature">
          {t.cancel}
        </Button>
        <Button 
          onClick={handlePreview} 
          disabled={!currentSignature}
          data-testid="button-preview-signature"
        >
          <Eye className="h-4 w-4 mr-2" />
          {t.preview}
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t.step2}</h3>
        <p className="text-gray-600">{t.willBeApplied} <strong>{toSign}</strong> {t.bulletinsSelected}</p>
      </div>

      {/* Signature Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.signaturePreview}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <img 
              src={currentSignature!} 
              alt="Signature preview" 
              className="max-w-full max-h-32 object-contain mx-auto border rounded bg-white"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Signataire: <strong>{directorName}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Bulletins to sign list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulletins à signer ({toSign})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedBulletins
              .filter(b => !b.hasSignature)
              .map(bulletin => (
                <div 
                  key={bulletin.id} 
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div>
                    <div className="font-medium">{bulletin.studentName}</div>
                    <div className="text-gray-500">{bulletin.className} - {bulletin.term}</div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              ))
            }
          </div>
          
          {alreadySigned > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm text-yellow-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {alreadySigned} bulletin(s) déjà signé(s) - seront ignorés
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('signature')}>
          Retour
        </Button>
        <Button 
          onClick={handleApplySignature} 
          disabled={toSign === 0}
          data-testid="button-apply-signatures"
        >
          <FileSignature className="h-4 w-4 mr-2" />
          {t.signBulletins} ({toSign})
        </Button>
      </div>
    </div>
  );

  const renderSigningStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t.step3}</h3>
        <p className="text-gray-600">{t.signing}</p>
      </div>

      <div className="space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
        
        <div className="space-y-2">
          <div className="text-sm text-gray-600">{t.progress}: {signingProgress}%</div>
          <Progress value={signingProgress} className="w-full" />
        </div>
        
        <div className="text-sm text-gray-500">
          {t.processing} {toSign} bulletin{toSign > 1 ? 's' : ''}...
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t.complete}</h3>
        <p className="text-gray-600">{t.successMessage}</p>
      </div>

      {signatureResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.results}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {signatureResults.summary?.successfullySigned || 0}
                </div>
                <div className="text-gray-600">{t.successfullySigned}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {signatureResults.summary?.errorCount || 0}
                </div>
                <div className="text-gray-600">{t.errors}</div>
              </div>
            </div>

            {signatureResults.summary?.successRate && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Taux de réussite: {signatureResults.summary.successRate}%
                </div>
                <Progress value={signatureResults.summary.successRate} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleClose} data-testid="button-close-signature">
        {t.close}
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="bulk-signature-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Selected Bulletins Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{t.selectedBulletins}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {totalBulletins} sélectionnés
                </Badge>
                {toSign > 0 && (
                  <Badge variant="default">
                    {toSign} {t.bulletinsToSign}
                  </Badge>
                )}
                {alreadySigned > 0 && (
                  <Badge variant="secondary">
                    {alreadySigned} {t.alreadySigned}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'signature' && renderSignatureStep()}
          {currentStep === 'preview' && renderPreviewStep()}
          {currentStep === 'signing' && renderSigningStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkSignatureModal;