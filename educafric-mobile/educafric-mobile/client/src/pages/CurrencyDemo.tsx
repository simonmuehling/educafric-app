/**
 * Currency Demo Page - Demonstrates IP-based currency detection
 */

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import CurrencyDisplay from '@/components/currency/CurrencyDisplay';
import FrontpageNavbar from '@/components/FrontpageNavbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Globe, 
  DollarSign, 
  RefreshCw, 
  MapPin, 
  Wifi, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  School,
  UserCheck
} from 'lucide-react';

const CurrencyDemo = () => {
  const { language } = useLanguage();
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

  const [testResults, setTestResults] = useState<any>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const text = {
    fr: {
      title: "Démonstration de Détection de Devise Automatique",
      subtitle: "Technologie IP-Géolocalisation",
      description: "Educafric détecte automatiquement votre localisation via votre adresse IP et ajuste les devises en temps réel pour une expérience utilisateur optimale.",
      detectedLocation: "Localisation Détectée",
      currencyInfo: "Informations de Devise",
      pricingExample: "Exemple de Tarification",
      runTest: "Lancer Test API",
      refreshLocation: "Actualiser Localisation",
      features: [
        "Détection automatique basée sur l'IP",
        "Support de 25+ devises africaines",
        "Conversion en temps réel",
        "Cache intelligent 24h",
        "Fallback sécurisé (CFA)"
      ],
      supported: "Devises Supportées",
      technical: "Détails Techniques"
    },
    en: {
      title: "Automatic Currency Detection Demo",
      subtitle: "IP-Geolocation Technology",
      description: "Educafric automatically detects your location via IP address and adjusts currencies in real-time for optimal user experience.",
      detectedLocation: "Detected Location",
      currencyInfo: "Currency Information",
      pricingExample: "Pricing Example",
      runTest: "Run API Test",
      refreshLocation: "Refresh Location",
      features: [
        "Automatic IP-based detection",
        "Support for 25+ African currencies",
        "Real-time conversion",
        "Smart 24h caching",
        "Secure fallback (CFA)"
      ],
      supported: "Supported Currencies",
      technical: "Technical Details"
    }
  };

  const t = text[language];

  // African currencies supported
  const supportedCurrencies = [
    { code: 'XAF', name: 'CFA Franc BEAC', countries: 'Cameroon, Chad, CAR, Congo, Gabon, Equatorial Guinea' },
    { code: 'XOF', name: 'CFA Franc BCEAO', countries: 'Senegal, Mali, Burkina Faso, Niger, Benin, Togo, Côte d\'Ivoire, Guinea-Bissau' },
    { code: 'NGN', name: 'Nigerian Naira', countries: 'Nigeria' },
    { code: 'GHS', name: 'Ghanaian Cedi', countries: 'Ghana' },
    { code: 'KES', name: 'Kenyan Shilling', countries: 'Kenya' },
    { code: 'ZAR', name: 'South African Rand', countries: 'South Africa' },
    { code: 'EGP', name: 'Egyptian Pound', countries: 'Egypt' },
    { code: 'MAD', name: 'Moroccan Dirham', countries: 'Morocco' },
    { code: 'TND', name: 'Tunisian Dinar', countries: 'Tunisia' },
    { code: 'DZD', name: 'Algerian Dinar', countries: 'Algeria' }
  ];

  const runApiTest = async () => {
    setIsTestRunning(true);
    
    try {
      // Test currency detection API
      const detectionResponse = await fetch('/api/currency/detect');
      const detectionData = await detectionResponse.json();
      
      setTestResults({
        detection: {
          success: detectionResponse.ok,
          data: detectionData,
          responseTime: Date.now()
        }
      });
    } catch (error) {
      setTestResults({
        detection: {
          success: false,
          error: error.message
        }
      });
    } finally {
      setIsTestRunning(false);
    }
  };

  // Sample pricing in different scenarios
  const pricingExamples = [
    { plan: 'Parent Basic', priceInCFA: 0 },
    { plan: 'Parent Premium', priceInCFA: 5000 },
    { plan: 'Parent GPS Basic', priceInCFA: 15000 },
    { plan: 'Public School', priceInCFA: 25000 },
    { plan: 'Private School', priceInCFA: 75000 },
    { plan: 'Freelancer Premium', priceInCFA: 15000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <FrontpageNavbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4">
              <Globe className="w-4 h-4 mr-2" />
              {t.subtitle}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.title || ''}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t.description || ''}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={runApiTest} 
              disabled={isTestRunning}
              className="flex items-center gap-2"
            >
              {isTestRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {t.runTest}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={detectCurrency}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {t.refreshLocation}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Demo Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Currency Display Component */}
            <div className="flex justify-center">
              <CurrencyDisplay showPricing={true} compact={false} />
            </div>

            {/* Location & Currency Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    {t.detectedLocation}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Country</div>
                      <div className="font-semibold text-lg">{country}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Currency</div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{currency}</span>
                        <Badge variant="secondary">{symbol}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-500">Exchange Rate (to CFA)</div>
                    <div className="text-2xl font-bold text-blue-600">
                      1 {currency} = {exchangeRate} CFA
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(Array.isArray(t.features) ? t.features : []).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* API Test Results */}
          {testResults && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  API Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {testResults?.detection?.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      Currency Detection API: {testResults?.detection?.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  
                  {testResults?.detection?.success && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(testResults?.detection?.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Examples */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                {t.pricingExample}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(pricingExamples) ? pricingExamples : []).map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {example?.plan?.includes('Parent') && <UserCheck className="w-4 h-4 text-blue-500" />}
                      {example?.plan?.includes('School') && <School className="w-4 h-4 text-purple-500" />}
                      {example?.plan?.includes('Freelancer') && <Users className="w-4 h-4 text-orange-500" />}
                      <span className="font-medium text-sm">{example.plan}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {example.priceInCFA === 0 ? 'Free' : formatPrice(convertFromCFA(example.priceInCFA))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Original: {example.priceInCFA === 0 ? 'Free' : `${example?.priceInCFA?.toLocaleString()} CFA`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Supported Currencies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                {t.supported}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(supportedCurrencies) ? supportedCurrencies : []).map((curr, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{curr.code}</Badge>
                      <span className="font-medium text-sm">{curr.name || ''}</span>
                    </div>
                    <div className="text-xs text-gray-500">{curr.countries}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CurrencyDemo;