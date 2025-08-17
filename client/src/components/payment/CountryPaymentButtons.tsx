/**
 * Country Payment Buttons - Fully configured payment buttons by country
 */

import React, { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  CheckCircle, 
  Clock, 
  Shield,
  ArrowRight,
  Zap
} from 'lucide-react';

interface CountryPaymentButtonsProps {
  planId: string;
  planName: string;
  amount: number; // Amount in local currency
  onPaymentInitiated?: (method: any, details: any) => void;
  className?: string;
}

const CountryPaymentButtons: React.FC<CountryPaymentButtonsProps> = ({
  planId,
  planName,
  amount,
  onPaymentInitiated,
  className = ""
}) => {
  const { language } = useLanguage();
  const { country, currency, formatPrice } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get country code mapping
  const getCountryCode = (country: string): string => {
    const countryMap: { [key: string]: string } = {
      'Cameroon': 'CM',
      'Nigeria': 'NG', 
      'Ghana': 'GH',
      'Kenya': 'KE',
      'South Africa': 'ZA',
      'International': 'INTL'
    };
    return countryMap[country] || 'INTL';
  };

  const countryCode = getCountryCode(country);

  // Fetch payment methods for current country
  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['payment-methods', countryCode],
    queryFn: async () => {
      const response = await fetch(`/api/payment-methods/country/${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    }
  });

  // Payment initiation mutation
  const paymentMutation = useMutation({
    mutationFn: async ({ methodId, paymentData }: { methodId: string, paymentData: any }) => {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          methodId,
          amount,
          currency,
          planId,
          planName,
          ...paymentData
        })
      });
      
      if (!response.ok) throw new Error('Payment initiation failed');
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log(`[PAYMENT] Payment initiated successfully:`, data);
      onPaymentInitiated?.(variables.methodId, data);
    },
    onError: (error) => {
      console.error('[PAYMENT] Payment initiation failed:', error);
      setIsProcessing(false);
    }
  });

  const text = {
    fr: {
      payWith: "Payer avec",
      instant: "Instantané",
      secure: "Sécurisé", 
      processing: "Traitement en cours...",
      preferred: "Recommandé",
      fees: "Frais",
      free: "Gratuit",
      selectPayment: "Choisir ce moyen de paiement",
      noMethods: "Aucune méthode de paiement disponible",
      loadingMethods: "Chargement des méthodes de paiement..."
    },
    en: {
      payWith: "Pay with",
      instant: "Instant",
      secure: "Secure",
      processing: "Processing...",
      preferred: "Recommended", 
      fees: "Fees",
      free: "Free",
      selectPayment: "Choose this payment method",
      noMethods: "No payment methods available",
      loadingMethods: "Loading payment methods..."
    }
  };

  const t = text[language];

  const handlePaymentClick = async (method: any) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelectedMethod(method.id);
    
    try {
      // Different handling based on payment method type
      switch (method.type) {
        case 'mobile_money':
          await handleMobileMoneyPayment(method);
          break;
        case 'bank_transfer':
          await handleBankTransferPayment(method);
          break;
        case 'card':
          await handleCardPayment(method);
          break;
        default:
          await handleGenericPayment(method);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  const handleMobileMoneyPayment = async (method: any) => {
    // For mobile money, we'll create a payment request and show instructions
    paymentMutation.mutate({
      methodId: method.id,
      paymentData: {
        type: 'mobile_money',
        provider: method.provider,
        instructions: method.instructions
      }
    });
  };

  const handleBankTransferPayment = async (method: any) => {
    // For bank transfer, create payment reference and show bank details
    paymentMutation.mutate({
      methodId: method.id,
      paymentData: {
        type: 'bank_transfer',
        provider: method.provider,
        instructions: method.instructions
      }
    });
  };

  const handleCardPayment = async (method: any) => {
    // For card payments, integrate with Stripe
    if (method.provider === 'Stripe') {
      paymentMutation.mutate({
        methodId: method.id,
        paymentData: {
          type: 'stripe_card',
          provider: 'Stripe'
        }
      });
    } else {
      // Other card processors
      paymentMutation.mutate({
        methodId: method.id,
        paymentData: {
          type: 'card',
          provider: method.provider
        }
      });
    }
  };

  const handleGenericPayment = async (method: any) => {
    paymentMutation.mutate({
      methodId: method.id,
      paymentData: {
        type: method.type,
        provider: method.provider
      }
    });
  };

  const getMethodIcon = (type: string, icon: string) => {
    if (icon && (Array.isArray(icon) ? icon.length : 0) === 2) return icon; // Emoji icon
    
    switch (type) {
      case 'mobile_money': return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer': return <Building2 className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getButtonColor = (method: any, isPreferred: boolean) => {
    if (selectedMethod === method.id && isProcessing) {
      return "bg-gray-400 text-white cursor-not-allowed";
    }
    
    if (isPreferred) {
      return "bg-green-600 hover:bg-green-700 text-white";
    }
    
    switch (method.type) {
      case 'mobile_money': return "bg-blue-600 hover:bg-blue-700 text-white";
      case 'bank_transfer': return "bg-indigo-600 hover:bg-indigo-700 text-white";
      case 'card': return "bg-purple-600 hover:bg-purple-700 text-white";
      default: return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
            <span>{t.loadingMethods}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData?.success || !paymentData.methods) {
    return (
      <Alert>
        <AlertDescription>
          {t.noMethods} {country}
        </AlertDescription>
      </Alert>
    );
  }

  const preferredMethods = (Array.isArray(paymentData.methods) ? paymentData.methods : []).filter((method: any) =>
    paymentData?.preferred?.includes(method.id) && method.enabled
  );
  
  const otherMethods = (Array.isArray(paymentData.methods) ? paymentData.methods : []).filter((method: any) =>
    !paymentData?.preferred?.includes(method.id) && method.enabled
  );

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        {/* Preferred Payment Methods */}
        {(Array.isArray(preferredMethods) ? preferredMethods.length : 0) > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-700">{t.preferred}</span>
            </div>
            
            <div className="space-y-3">
              {(Array.isArray(preferredMethods) ? preferredMethods : []).map((method: any) => (
                <Button
                  key={method.id}
                  onClick={() => handlePaymentClick(method)}
                  disabled={isProcessing}
                  className={`w-full justify-between p-4 h-auto ${getButtonColor(method, true)}`}
                  data-testid={`payment-button-${method.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getMethodIcon(method.type, method.icon)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{method.name || ''}</div>
                      <div className="text-sm opacity-90">{method.provider}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {method?.processingTime?.toLowerCase().includes('instant') && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {t.instant}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        {t.secure}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      {method?.fees?.percentage === 0 && method?.fees?.fixed === 0 ? (
                        <span className="text-green-200">{t.free}</span>
                      ) : (
                        <span className="opacity-90">
                          {method?.fees?.percentage > 0 && `${method?.fees?.percentage}%`}
                          {method?.fees?.fixed > 0 && ` +${formatPrice(method?.fees?.fixed)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {selectedMethod === method.id && isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>{t.processing}</span>
                    </div>
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Other Payment Methods */}
        {(Array.isArray(otherMethods) ? otherMethods.length : 0) > 0 && (
          <>
            {(Array.isArray(preferredMethods) ? preferredMethods.length : 0) > 0 && <Separator />}
            <div className="space-y-3">
              {(Array.isArray(otherMethods) ? otherMethods : []).map((method: any) => (
                <Button
                  key={method.id}
                  onClick={() => handlePaymentClick(method)}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full justify-between p-4 h-auto hover:bg-gray-50"
                  data-testid={`payment-button-${method.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {getMethodIcon(method.type, method.icon)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{method.name || ''}</div>
                      <div className="text-sm text-gray-500">{method.provider}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {method?.fees?.percentage === 0 && method?.fees?.fixed === 0 ? (
                        <span className="text-green-600 font-medium">{t.free}</span>
                      ) : (
                        <span>
                          {method?.fees?.percentage > 0 && `${method?.fees?.percentage}%`}
                          {method?.fees?.fixed > 0 && ` +${formatPrice(method?.fees?.fixed)}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{method.processingTime}</div>
                  </div>
                  
                  {selectedMethod === method.id && isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Payment Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(amount)}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {planName} - {country}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryPaymentButtons;