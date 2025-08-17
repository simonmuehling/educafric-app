import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignaturePad } from "./SignaturePad";
import { AlertTriangle, FileCheck, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BulletinSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulletinData: {
    id: number;
    studentName: string;
    className: string;
    generalAverage: number;
    classRank: number;
  };
  userType: "director" | "teacher";
  userId: number;
  userName: string;
  existingSignature?: string;
  onSignatureComplete: () => void;
}

export function BulletinSignatureModal({
  isOpen,
  onClose,
  bulletinData,
  userType,
  userId,
  userName,
  existingSignature,
  onSignatureComplete,
}: BulletinSignatureModalProps) {
  const [currentSignature, setCurrentSignature] = useState(existingSignature);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSignatureSave = (signature: string) => {
    setCurrentSignature(signature);
  };

  const handleConfirmSignature = () => {
    if (!currentSignature) {
      toast({
        title: "Signature requise",
        description: "Veuillez créer ou télécharger une signature avant de continuer",
        variant: "destructive",
      });
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalConfirmation = async () => {
    if (!currentSignature) return;

    setIsSending(true);
    
    try {
      // Sign the bulletin
      const response = await fetch(`/api/bulletins/${bulletinData.id}/sign`, {
        method: "POST",
        body: JSON.stringify({
          signatureUrl: currentSignature,
          signerRole: userType,
          signerName: userName,
          digitalSignatureHash: btoa(`${bulletinData.id}-${userId}-${Date.now()}`),
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // Create notifications
        const notificationResponse = await fetch("/api/notifications/bulletin-signed", {
          method: "POST",
          body: JSON.stringify({
            bulletinId: bulletinData.id,
            studentName: bulletinData.studentName,
            className: bulletinData.className,
            signerRole: userType,
            signerName: userName,
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (notificationResponse.ok) {
          toast({
            title: "Bulletin signé avec succès",
            description: `Le bulletin de ${bulletinData.studentName} a été signé et les notifications ont été envoyées`,
          });
          
          onSignatureComplete();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error signing bulletin:", error);
      toast({
        title: "Erreur",
        description: "Impossible de signer le bulletin",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      setIsConfirming(false);
    }
  };

  const getRoleTitle = () => {
    return userType === "director" ? "Directeur/Directrice" : "Professeur Principal";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Signature du Bulletin - {getRoleTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulletin Information */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-2">Informations du Bulletin</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Élève:</span> {bulletinData.studentName}
                </div>
                <div>
                  <span className="font-medium">Classe:</span> {bulletinData.className}
                </div>
                <div>
                  <span className="font-medium">Moyenne Générale:</span> {bulletinData.generalAverage}/20
                </div>
                <div>
                  <span className="font-medium">Rang:</span> {bulletinData.classRank}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isConfirming ? (
            <>
              {/* Signature Pad */}
              <SignaturePad
                title={`Signature ${getRoleTitle()}`}
                userType={userType === "teacher" ? "teacher" : "director"}
                userId={userId}
                existingSignature={currentSignature}
                onSignatureSave={handleSignatureSave}
              />

              {/* Current Signature Preview */}
              {currentSignature && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Aperçu de la signature:</h4>
                    <img 
                      src={currentSignature} 
                      alt="Signature" 
                      className="max-h-16 border rounded"
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Confirmation Step */
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      Confirmation de signature
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      Vous êtes sur le point de signer définitivement le bulletin de{" "}
                      <strong>{bulletinData.studentName}</strong>. Cette action :
                    </p>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1 mb-4">
                      <li>Marquera le bulletin comme signé</li>
                      <li>Enverra des notifications aux parents</li>
                      <li>Sera enregistrée de manière permanente</li>
                      <li>Ne pourra pas être annulée</li>
                    </ul>
                    <p className="text-yellow-700 font-medium">
                      Confirmez-vous cette signature ?
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          {!isConfirming ? (
            <>
              <Button variant="outline" onClick={onClose} data-testid="button-cancel-signature">
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmSignature}
                disabled={!currentSignature}
                data-testid="button-confirm-signature"
              >
                Confirmer et Signer
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsConfirming(false)}
                disabled={isSending}
                data-testid="button-back-signature"
              >
                Retour
              </Button>
              <Button 
                onClick={handleFinalConfirmation}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-final-sign"
              >
                {isSending ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Signer et Envoyer
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}