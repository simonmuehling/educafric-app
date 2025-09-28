/**
 * FORMULAIRE DE PAIEMENT MTN MOBILE MONEY
 * Interface utilisateur pour les paiements automatiques MTN
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';

interface MTNPaymentFormProps {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailed?: (error: string) => void;
}

export default function MTNPaymentForm({
  planId,
  planName,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentFailed
}: MTNPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [externalId, setExternalId] = useState('');
  const [checkCount, setCheckCount] = useState(0);
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    formattedNumber: string;
    message: string;
  } | null>(null);

  const { toast } = useToast();

  // Valider le numéro MTN
  const validatePhoneNumber = async (phone: string) => {
    if (!phone.trim()) {
      setPhoneValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/mtn-payments/validate-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPhoneValidation({
          isValid: data.isValidMTN,
          formattedNumber: data.formattedNumber,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Erreur validation numéro:', error);
      setPhoneValidation({
        isValid: false,
        formattedNumber: phone,
        message: 'Erreur lors de la validation'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Initier le paiement MTN
  const initiatePayment = async () => {
    if (!phoneValidation?.isValid) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro MTN valide",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[MTN_FORM] 💰 Initiating payment...');
      
      const response = await fetch('/api/mtn-payments/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          phoneNumber: phoneValidation.formattedNumber,
          amount,
          currency
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTransactionId(data.transactionId);
        setExternalId(data.externalId);
        setPaymentInitiated(true);
        
        toast({
          title: "Paiement initié !",
          description: data.message,
        });

        // Commencer la vérification automatique
        if (data.instructions?.autoCheck) {
          startPaymentChecking();
        }
      } else {
        throw new Error(data.message || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error: any) {
      console.error('[MTN_FORM] ❌ Payment initiation failed:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || 'Impossible d\'initier le paiement MTN',
        variant: "destructive",
      });
      onPaymentFailed?.(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Vérifier le statut du paiement
  const checkPaymentStatus = async () => {
    if (!externalId) return;

    try {
      console.log('[MTN_FORM] 🔍 Checking payment status...');
      
      const response = await fetch(`/api/mtn-payments/payment-status/${externalId}`);
      const data = await response.json();
      
      if (data.success) {
        if (data.status === 'SUCCESSFUL') {
          toast({
            title: "Paiement réussi !",
            description: `Votre paiement de ${amount.toLocaleString()} ${currency} a été confirmé.`,
          });
          onPaymentSuccess?.(data.transactionId);
          setIsChecking(false);
          return true;
        } else if (data.status === 'FAILED') {
          toast({
            title: "Paiement échoué",
            description: data.reason || 'Le paiement MTN a échoué',
            variant: "destructive",
          });
          onPaymentFailed?.(data.reason);
          setIsChecking(false);
          return true;
        }
        // Status PENDING - continuer la vérification
      }
      return false;
    } catch (error) {
      console.error('[MTN_FORM] ❌ Status check failed:', error);
      return false;
    }
  };

  // Démarrer la vérification automatique
  const startPaymentChecking = () => {
    setIsChecking(true);
    setCheckCount(0);
    
    const checkInterval = setInterval(async () => {
      const newCount = checkCount + 1;
      setCheckCount(newCount);
      
      const isComplete = await checkPaymentStatus();
      
      // Arrêter après 30 vérifications (5 minutes)
      if (isComplete || newCount >= 30) {
        clearInterval(checkInterval);
        setIsChecking(false);
        
        if (newCount >= 30 && !isComplete) {
          toast({
            title: "Timeout de vérification",
            description: "Vérification manuelle nécessaire. Contactez le support si le paiement a été effectué.",
            variant: "destructive",
          });
        }
      }
    }, 10000); // Vérifier toutes les 10 secondes
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">MTN Mobile Money</CardTitle>
            <p className="text-sm text-gray-600">Paiement automatique</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Zap className="w-3 h-3 mr-1" />
            Instantané
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Sécurisé
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Détails du paiement */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Plan:</span>
            <span className="font-semibold">{planName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Montant:</span>
            <span className="font-bold text-lg text-green-600">
              {amount.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {!paymentInitiated ? (
          <>
            {/* Formulaire de numéro */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro MTN Mobile Money</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ex: 671234567"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  validatePhoneNumber(e.target.value);
                }}
                disabled={isValidating || isProcessing}
                className={phoneValidation ? 
                  (phoneValidation.isValid ? 'border-green-500' : 'border-red-500') 
                  : ''
                }
              />
              
              {isValidating && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validation en cours...
                </div>
              )}
              
              {phoneValidation && (
                <div className={`flex items-center text-sm ${
                  phoneValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {phoneValidation.isValid ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  {phoneValidation.message}
                  {phoneValidation.isValid && (
                    <span className="ml-2 text-gray-500">
                      ({phoneValidation.formattedNumber})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bouton de paiement */}
            <Button
              onClick={initiatePayment}
              disabled={!phoneValidation?.isValid || isProcessing}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initiation en cours...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Payer {amount.toLocaleString()} {currency}
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Statut du paiement */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                {isChecking ? (
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">
                  {isChecking ? 'Vérification en cours...' : 'Paiement initié'}
                </h3>
                <p className="text-sm text-gray-600">
                  Vérifiez votre téléphone MTN et confirmez le paiement
                </p>
              </div>
              
              {isChecking && (
                <div className="text-xs text-gray-500">
                  Vérification #{checkCount}/30 - {(30 - checkCount) * 10}s restantes
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
              <ol className="text-xs space-y-1">
                <li>1. Vérifiez la notification sur votre téléphone</li>
                <li>2. Tapez votre code PIN MTN</li>
                <li>3. Confirmez le paiement</li>
                <li>4. La confirmation sera automatique</li>
              </ol>
            </div>

            {/* Bouton de vérification manuelle */}
            <Button
              onClick={() => checkPaymentStatus()}
              variant="outline"
              className="w-full"
              disabled={isChecking}
            >
              Vérifier manuellement
            </Button>
          </>
        )}

        {/* Note sécurité */}
        <div className="text-xs text-gray-500 text-center">
          🔒 Paiement sécurisé par MTN Mobile Money
        </div>
      </CardContent>
    </Card>
  );
}