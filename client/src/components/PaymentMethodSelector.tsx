/**
 * SÉLECTEUR DE MÉTHODES DE PAIEMENT
 * Choix entre Carte de crédit, Orange Money, et Virement bancaire
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export type PaymentMethod = 'card' | 'mtn_money' | 'bank_transfer';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
  planName: string;
  amount: number;
  currency: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  planName,
  amount,
  currency
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState('');

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: t('common.copied') || "Copié!",
        description: `${fieldName} ${t('common.copiedToClipboard') || 'copié dans le presse-papier'}`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: t('errors.network.networkError') || "Erreur",
        description: t('common.copyError') || "Impossible de copier dans le presse-papier",
        variant: "destructive",
      });
    }
  };

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      title: `💳 ${t('payment.methods.card') || 'Carte de crédit'}`,
      description: t('payment.subscription.securedBy') || 'Paiement sécurisé par Stripe',
      icon: <CreditCard className="h-6 w-6" />,
      badge: t('common.instant') || 'Instantané',
      badgeColor: 'bg-green-100 text-green-800',
      features: [
        t('payment.features.instant') || 'Paiement immédiat', 
        t('payment.features.securedByStripe') || 'Sécurisé par Stripe', 
        t('payment.features.support24') || 'Support 24/7'
      ]
    },
    {
      id: 'mtn_money' as PaymentMethod,
      title: '📱 MTN Mobile Money',
      description: t('payment.features.mobilePlatform') || 'Plateforme de paiement mobile',
      icon: <Smartphone className="h-6 w-6" />,
      badge: t('common.instant') || 'Instantané',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      features: [
        t('payment.features.automatic') || 'Paiement automatique', 
        t('payment.features.immediateActivation') || 'Activation immédiate', 
        t('payment.features.securedMTN') || 'Sécurisé MTN'
      ]
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      title: `🏦 ${t('payment.methods.bankTransfer') || 'Virement bancaire'}`,
      description: t('payment.features.bankCameroon') || 'Banque au Cameroun',
      icon: <Building className="h-6 w-6" />,
      badge: t('payment.features.1to2days') || '1-2 jours',
      badgeColor: 'bg-blue-100 text-blue-800',
      features: [
        t('payment.features.secureTransfer') || 'Transfert sécurisé', 
        t('payment.features.allBanks') || 'Toutes banques', 
        t('payment.features.officialReceipt') || 'Reçu officiel'
      ]
    }
  ];

  const handleMTNPayment = async () => {
    if (!phoneNumber) {
      setShowPhoneInput(true);
      return;
    }

    try {
      toast({
        title: "📱 Initialisation paiement Y-Note...",
        description: "Connexion à l'API Y-Note MTN en cours...",
      });

      const response = await fetch('/api/mtn-payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session-based auth
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          planName: planName,
          phoneNumber: phoneNumber,
          callbackUrl: `${window.location.origin}/api/mtn-payments/webhook`,
          returnUrl: `${window.location.origin}/subscription-success?plan=${planName}`
        })
      });

      // Read raw response first
      const text = await response.text();
      let data: any;
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('[Y-NOTE_FRONTEND] ❌ JSON parse failed:', parseError);
        console.error('[Y-NOTE_FRONTEND] Raw response:', text);
        data = { raw: text, error: 'Invalid JSON response' };
      }

      // Detailed response logging
      console.group('[Y-NOTE_FRONTEND] 📋 Payment Response Debug');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Raw Text:', text);
      console.log('Parsed Data:', data);
      console.groupEnd();

      if (!response.ok) {
        throw new Error(
          data?.message || 
          data?.error || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }
      
      if (data.success) {
        // Y-Note renvoie un objet avec paymentUrl et instructions
        if (data.paymentUrl) {
          // Rediriger vers l'URL de paiement Y-Note
          window.location.href = data.paymentUrl;
        } else {
          // Afficher les instructions Y-Note
          setPaymentInstructions(data.instructions || "Paiement Y-Note initié avec succès. Vérifiez votre téléphone MTN.");
          toast({
            title: "✅ Paiement Y-Note initié !",
            description: "Vérifiez votre téléphone MTN pour confirmer le paiement",
            variant: "default",
          });
        }
      } else {
        throw new Error(data.message || 'Erreur lors de la création du paiement Y-Note MTN');
      }
    } catch (error: any) {
      // Detailed error logging
      console.group('[Y-NOTE_FRONTEND] ❌ Payment Creation Failed');
      console.log('Error Type:', error?.constructor?.name);
      console.log('Error Message:', error?.message);
      console.log('Error Name:', error?.name);
      console.log('Error Stack:', error?.stack);
      console.log('Full Error Object:', error);
      console.groupEnd();

      const errorMessage = error?.message || "Erreur réseau - vérifiez la console pour plus de détails";
      
      toast({
        title: "❌ Erreur Y-Note MTN",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const renderPaymentDetails = () => {

    if (selectedMethod === 'mtn_money') {
      return (
        <Card className="mt-4 border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Smartphone className="h-5 w-5" />
              MTN Mobile Money - Paiement Sécurisé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentInstructions ? (
              // Afficher les instructions après envoi SMS
              <div className="bg-white p-6 rounded-lg border text-center">
                <div className="mb-4">
                  <MessageCircle className="h-16 w-16 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    📱 Popup USSD envoyé !
                  </h3>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-green-800">
                      {paymentInstructions}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>📱 Confirmez sur votre téléphone :</strong><br />
                      1. Un menu USSD s'affiche sur votre MTN ({phoneNumber})<br />
                      2. Vérifiez le montant et les détails du paiement<br />
                      3. Saisissez votre code PIN MTN pour confirmer<br />
                      4. Votre abonnement sera activé instantanément
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setPaymentInstructions('');
                    setPhoneNumber('');
                    setShowPhoneInput(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Recommencer
                </Button>
              </div>
            ) : (
              // Interface de saisie du numéro de téléphone ou bouton de paiement
              <div className="bg-white p-6 rounded-lg border text-center">
                <div className="mb-4">
                  <Smartphone className="h-16 w-16 text-yellow-600 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Paiement MTN Mobile Money
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Un popup USSD apparaîtra directement sur votre téléphone MTN pour confirmer le paiement.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Comment ça marche :</strong> Popup USSD instantané • Confirmation avec PIN • Activation automatique
                    </p>
                  </div>
                </div>
                
                {showPhoneInput || phoneNumber ? (
                  <div className="space-y-4">
                    <div className="text-left">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Numéro MTN Mobile Money
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="677 XX XX XX"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format accepté : 677 XX XX XX, 65X XX XX XX, 68X XX XX XX
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleMTNPayment}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg"
                      size="lg"
                      disabled={!phoneNumber}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Déclencher popup USSD - {amount.toLocaleString()} XAF
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowPhoneInput(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg"
                    size="lg"
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Payer {amount.toLocaleString()} XAF avec MTN
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (selectedMethod === 'bank_transfer') {
      return (
        <Card className="mt-4 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Building className="h-5 w-5" />
              Informations de virement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">🏦 Détails du compte bancaire:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bénéficiaire:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">AFRO METAVERSE MARKETING</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('AFRO METAVERSE MARKETING', 'Nom du bénéficiaire')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Nom du bénéficiaire' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Banque:</span>
                  <span className="font-medium">Afriland First Bank</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Code banque:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">10033</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('10033', 'Code banque')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Code banque' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Code guichet:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">00368</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('00368', 'Code guichet')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Code guichet' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">N° de compte:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">31500012045</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('31500012045', 'Numéro de compte')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Numéro de compte' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clé RIB:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">68</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('68', 'Clé RIB')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Clé RIB' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RIB complet:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">10033 00368 31500012045 68</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('10033003683150001204568', 'RIB complet')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'RIB complet' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Montant:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">{amount.toLocaleString()} XAF</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(amount.toString(), 'Montant')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Montant' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Motif:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Abonnement EDUCAFRIC - {planName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`Abonnement EDUCAFRIC - ${planName}`, 'Motif')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Motif' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> Après le virement, envoyez-nous le reçu bancaire 
                à <strong>support@educafric.com</strong> ou WhatsApp <strong>+237 657 004 011</strong> 
                pour validation (délai: 1-2 jours ouvrables).
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Choisissez votre méthode de paiement</h3>
        <p className="text-gray-600">
          Pour votre abonnement <span className="font-medium">{planName}</span> - 
          <span className="font-bold text-green-600"> {amount.toLocaleString()} {currency.toUpperCase()}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMethod === method.id
                ? 'ring-2 ring-blue-500 bg-blue-50/50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onMethodSelect(method.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {method.icon}
                  <div>
                    <CardTitle className="text-base">{method.title}</CardTitle>
                    <CardDescription className="text-xs">{method.description}</CardDescription>
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <Badge className={`w-fit text-xs ${method.badgeColor}`}>
                {method.badge}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {method.features.map((feature, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {renderPaymentDetails()}
      
      {selectedMethod && selectedMethod !== 'card' && (
        <div className="flex justify-center mt-6">
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            onClick={() => {
              toast({
                title: "Instructions envoyées!",
                description: "Vous avez reçu les instructions de paiement. Suivez les étapes ci-dessus.",
              });
            }}
          >
            ✅ J'ai compris, je vais effectuer le paiement
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;