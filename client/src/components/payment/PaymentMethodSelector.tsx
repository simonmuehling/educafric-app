/**
 * Payment Method Selector - Country-specific payment options
 */

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CreditCard,
  Smartphone,
  Building2,
  Clock,
  Info,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'card' | 'cash' | 'crypto';
  provider: string;
  icon: string;
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
  currency: string;
  enabled: boolean;
  instructions?: string;
}

interface PaymentMethodSelectorProps {
  amount: number;
  onMethodSelect: (method: PaymentMethod, fees: any) => void;
  selectedMethodId?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  onMethodSelect,
  selectedMethodId
}) => {
  const { language } = useLanguage();
  const { country, currency, formatPrice, convertFromCFA } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  
  // Get country code from currency context
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
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      return response.json();
    }
  });

  // Calculate fees for selected method
  const { data: feesData } = useQuery({
    queryKey: ['payment-fees', selectedMethod?.id, amount, currency],
    queryFn: async () => {
      if (!selectedMethod) return null;
      
      const response = await fetch('/api/payment-methods/calculate-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          methodId: selectedMethod.id,
          amount,
          currency
        })
      });
      
      if (!response.ok) throw new Error('Failed to calculate fees');
      return response.json();
    },
    enabled: !!selectedMethod
  });

  const text = {
    fr: {
      title: "Choisir Mode de Paiement",
      preferred: "Méthodes Recommandées",
      other: "Autres Méthodes",
      fees: "Frais",
      processing: "Délai",
      instructions: "Instructions",
      selectMethod: "Sélectionner",
      selected: "Sélectionné",
      total: "Total à payer",
      instant: "Instantané",
      loading: "Chargement des méthodes de paiement..."
    },
    en: {
      title: "Choose Payment Method",
      preferred: "Recommended Methods",
      other: "Other Methods",
      fees: "Fees",
      processing: "Processing Time",
      instructions: "Instructions",
      selectMethod: "Select",
      selected: "Selected",
      total: "Total to pay",
      instant: "Instant",
      loading: "Loading payment methods..."
    }
  };

  const t = text[language];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (feesData?.success) {
      onMethodSelect(method, feesData.calculation);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile_money': return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer': return <Building2 className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'mobile_money': return 'bg-green-500';
      case 'bank_transfer': return 'bg-blue-500';
      case 'card': return 'bg-purple-500';
      case 'crypto': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
            <span>{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData?.success || !paymentData.methods) {
    return (
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          No payment methods available for {country}
        </AlertDescription>
      </Alert>
    );
  }

  const preferredMethods = (Array.isArray(paymentData.methods) ? paymentData.methods : []).filter((method: PaymentMethod) =>
    paymentData?.preferred?.includes(method.id) && method.enabled
  );
  
  const otherMethods = (Array.isArray(paymentData.methods) ? paymentData.methods : []).filter((method: PaymentMethod) =>
    !paymentData?.preferred?.includes(method.id) && method.enabled
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t.title || ''} - {country}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Methods */}
          {(Array.isArray(preferredMethods) ? preferredMethods.length : 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-green-500" />
                <h3 className="font-semibold text-green-700">{t.preferred}</h3>
              </div>
              
              <div className="grid gap-3">
                {(Array.isArray(preferredMethods) ? preferredMethods : []).map((method: PaymentMethod) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedMethod?.id === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMethodSelect(method)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${getMethodColor(method.type)} flex items-center justify-center text-white`}>
                          {method.icon}
                        </div>
                        <div>
                          <div className="font-medium">{method.name || ''}</div>
                          <div className="text-sm text-gray-500">{method.provider}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {method?.fees?.percentage > 0 && `${method?.fees?.percentage}%`}
                            {method?.fees?.fixed > 0 && ` +${formatPrice(method?.fees?.fixed)}`}
                            {method?.fees?.percentage === 0 && method?.fees?.fixed === 0 && 'Free'}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {method.processingTime}
                          </div>
                        </div>
                        
                        {selectedMethod?.id === method.id ? (
                          <Button size="sm" className="mt-2">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t.selected}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="mt-2">
                            {t.selectMethod}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {method.instructions && selectedMethod?.id === method.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{t.instructions}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {method.instructions}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Methods */}
          {(Array.isArray(otherMethods) ? otherMethods.length : 0) > 0 && (
            <>
              {(Array.isArray(preferredMethods) ? preferredMethods.length : 0) > 0 && <Separator />}
              <div>
                <h3 className="font-semibold mb-4">{t.other}</h3>
                <div className="grid gap-3">
                  {(Array.isArray(otherMethods) ? otherMethods : []).map((method: PaymentMethod) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleMethodSelect(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded ${getMethodColor(method.type)} flex items-center justify-center text-white`}>
                            {getMethodIcon(method.type)}
                          </div>
                          <div>
                            <div className="font-medium">{method.name || ''}</div>
                            <div className="text-sm text-gray-500">{method.provider}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {method?.fees?.percentage > 0 && `${method?.fees?.percentage}%`}
                              {method?.fees?.fixed > 0 && ` +${formatPrice(method?.fees?.fixed)}`}
                              {method?.fees?.percentage === 0 && method?.fees?.fixed === 0 && 'Free'}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {method.processingTime}
                            </div>
                          </div>
                          
                          {selectedMethod?.id === method.id ? (
                            <Button size="sm" className="mt-2">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t.selected}
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="mt-2">
                              {t.selectMethod}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {method.instructions && selectedMethod?.id === method.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">{t.instructions}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {method.instructions}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      {selectedMethod && feesData?.success && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>{formatPrice(feesData?.calculation?.amount)}</span>
              </div>
              {feesData?.calculation?.fees > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t.fees}:</span>
                  <span>+{formatPrice(feesData?.calculation?.fees)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t.total}:</span>
                <span>{formatPrice(feesData?.calculation?.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;