/**
 * SÉLECTEUR DE MÉTHODES DE PAIEMENT
 * Choix entre Carte de crédit, Orange Money, et Virement bancaire
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, Check, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type PaymentMethod = 'card' | 'orange_money' | 'mtn_money' | 'bank_transfer';

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copié!",
        description: `${fieldName} copié dans le presse-papier`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papier",
        variant: "destructive",
      });
    }
  };

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      title: '💳 Carte de crédit',
      description: 'Paiement sécurisé par Stripe',
      icon: <CreditCard className="h-6 w-6" />,
      badge: 'Instantané',
      badgeColor: 'bg-green-100 text-green-800',
      features: ['Paiement immédiat', 'Sécurisé par Stripe', 'Support 24/7']
    },
    {
      id: 'orange_money' as PaymentMethod,
      title: '📱 Orange Money',
      description: 'Mobile Money Cameroun',
      icon: <Smartphone className="h-6 w-6" />,
      badge: 'Local',
      badgeColor: 'bg-orange-100 text-orange-800',
      features: ['Sans frais bancaires', 'Confirmation par SMS', 'Support local']
    },
    {
      id: 'mtn_money' as PaymentMethod,
      title: '📱 MTN Mobile Money',
      description: 'Mobile Money Cameroun',
      icon: <Smartphone className="h-6 w-6" />,
      badge: 'Local',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      features: ['Sans frais bancaires', 'Confirmation par SMS', 'Support local']
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      title: '🏦 Virement bancaire',
      description: 'Banque au Cameroun',
      icon: <Building className="h-6 w-6" />,
      badge: '1-2 jours',
      badgeColor: 'bg-blue-100 text-blue-800',
      features: ['Transfert sécurisé', 'Toutes banques', 'Reçu officiel']
    }
  ];

  const renderPaymentDetails = () => {
    if (selectedMethod === 'orange_money') {
      return (
        <Card className="mt-4 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Smartphone className="h-5 w-5" />
              Instructions Orange Money
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">🔸 Étapes de paiement:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Composez <strong>#150#</strong> sur votre téléphone Orange</li>
                <li>Sélectionnez <strong>1</strong> (Transfert d'argent)</li>
                <li>Sélectionnez <strong>1</strong> (Vers un numéro Orange)</li>
                <li>Entrez le numéro: <strong className="text-orange-600">677 004 011</strong></li>
                <li>Entrez le montant: <strong className="text-green-600">{amount.toLocaleString()} XAF</strong></li>
                <li>Confirmez avec votre code PIN</li>
              </ol>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Informations du bénéficiaire:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nom:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">ABANDA AKAK</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('ABANDA AKAK', 'Nom du bénéficiaire')}
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
                  <span className="text-gray-600">Numéro:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">677 004 011</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('677004011', 'Numéro Orange Money')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Numéro Orange Money' ? 
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
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> Après le transfert, envoyez-nous une capture d'écran 
                du SMS de confirmation à <strong>support@educafric.com</strong> pour validation.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (selectedMethod === 'mtn_money') {
      return (
        <Card className="mt-4 border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Smartphone className="h-5 w-5" />
              Instructions MTN Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">🔸 Étapes de paiement:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Composez <strong>*126#</strong> sur votre téléphone MTN</li>
                <li>Sélectionnez <strong>1</strong> (Transfert d'argent)</li>
                <li>Sélectionnez <strong>1</strong> (Vers un numéro MTN)</li>
                <li>Entrez le numéro: <strong className="text-yellow-600">672 128 559</strong></li>
                <li>Entrez le montant: <strong className="text-green-600">{amount.toLocaleString()} XAF</strong></li>
                <li>Confirmez avec votre code PIN</li>
              </ol>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Informations du bénéficiaire:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nom:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">ABANDA AKAK</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('ABANDA AKAK', 'Nom du bénéficiaire MTN')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Nom du bénéficiaire MTN' ? 
                        <Check className="h-3 w-3 text-green-600" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Numéro:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">672 128 559</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('672128559', 'Numéro MTN Mobile Money')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Numéro MTN Mobile Money' ? 
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
                      onClick={() => copyToClipboard(amount.toString(), 'Montant MTN')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Montant MTN' ? 
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
                <strong>⚠️ Important:</strong> Après le transfert, envoyez-nous une capture d'écran 
                du SMS de confirmation à <strong>support@educafric.com</strong> pour validation.
              </p>
            </div>
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