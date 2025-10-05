/**
 * Currency Display Component
 * Shows detected currency and allows testing currency conversion
 */

import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, DollarSign, RefreshCw } from 'lucide-react';

interface CurrencyDisplayProps {
  showPricing?: boolean;
  compact?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  showPricing = true, 
  compact = false 
}) => {
  const { 
    country, 
    currency, 
    symbol, 
    exchangeRate, 
    isLoading, 
    formatPrice, 
    convertFromCFA, 
    detectCurrency 
  } = useCurrency();

  // Sample Educafric pricing in CFA
  const samplePricing = {
    'Parent Basic': 0,
    'Parent Premium': 5000,
    'Parent GPS Basic': 15000,
    'Public School': 25000,
    'Private School': 75000,
    'Freelancer Premium': 15000
  };

  const handleRefreshCurrency = async () => {
    await detectCurrency();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Globe className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{country}</span>
        <Badge variant="outline" className="text-xs">
          {currency} {symbol}
        </Badge>
        {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Currency Auto-Detection
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detection Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Country</div>
            <div className="font-semibold">{country}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Currency</div>
            <Badge variant="outline" className="font-semibold">
              {currency}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Symbol</div>
            <div className="font-semibold text-lg">{symbol}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Exchange Rate</div>
            <div className="font-semibold">1:{exchangeRate}</div>
          </div>
        </div>

        {/* Sample Pricing Display */}
        {showPricing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Educafric Pricing in {currency}
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshCurrency}
                disabled={isLoading}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(samplePricing).map(([plan, priceInCFA]) => (
                <div key={plan} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{plan}</span>
                  <span className="font-semibold text-blue-600">
                    {priceInCFA === 0 ? 'Free' : formatPrice(convertFromCFA(priceInCFA))}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Prices automatically converted from CFA based on your location
            </div>
          </div>
        )}

        {/* Technical Info */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">Technical Details</summary>
          <div className="mt-2 space-y-1">
            <div>Exchange Rate: {exchangeRate} CFA = 1 {currency}</div>
            <div>Detection: IP-based geolocation</div>
            <div>Last Updated: {new Date().toLocaleString()}</div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default CurrencyDisplay;