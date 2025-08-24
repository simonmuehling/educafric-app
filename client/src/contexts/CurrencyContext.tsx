/**
 * Currency Context - Dynamic Currency Management
 * Provides currency detection and formatting throughout the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  countryCode: string;
  country: string;
  currency: string;
  symbol: string;
  locale: string;
  exchangeRate: number;
  isLoading: boolean;
  formatPrice: (amount: number) => string;
  convertFromCFA: (amountInCFA: number) => number;
  detectCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currencyData, setCurrencyData] = useState({
    countryCode: 'CM',
    country: 'Cameroon',
    currency: 'XAF',
    symbol: 'CFA',
    locale: 'fr-CM',
    exchangeRate: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  const detectCurrency = async () => {
    try {
      setIsLoading(true);
      console.log('[CURRENCY_CONTEXT] Detecting user currency...');
      
      const response = await fetch('/api/currency/detect', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[CURRENCY_CONTEXT] ✅ Currency detected:', data);
        
        setCurrencyData({
          countryCode: data.countryCode,
          country: data.country,
          currency: data.currency,
          symbol: data.symbol,
          locale: data.locale,
          exchangeRate: data.exchangeRate
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('educafric-currency', JSON.stringify({
          ...data,
          detectedAt: Date.now()
        }));
      } else {
        console.warn('[CURRENCY_CONTEXT] Currency detection failed, using default');
      }
    } catch (error) {
      console.error('[CURRENCY_CONTEXT] Currency detection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number): string => {
    try {
      return new Intl.NumberFormat(currencyData.locale, {
        style: 'currency',
        currency: currencyData.currency,
        minimumFractionDigits: currencyData.currency === 'XAF' || currencyData.currency === 'XOF' ? 0 : 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currencyData.symbol} ${amount.toLocaleString()}`;
    }
  };

  const convertFromCFA = (amountInCFA: number): number => {
    return Math.round(amountInCFA / currencyData.exchangeRate);
  };

  useEffect(() => {
    // Check if we have recent currency data in localStorage
    const stored = localStorage.getItem('educafric-currency');
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        if (Date.now() - parsedData.detectedAt < twentyFourHours) {
          console.log('[CURRENCY_CONTEXT] Using cached currency data');
          setCurrencyData({
            countryCode: parsedData.countryCode,
            country: parsedData.country,
            currency: parsedData.currency,
            symbol: parsedData.symbol,
            locale: parsedData.locale,
            exchangeRate: parsedData.exchangeRate
          });
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('[CURRENCY_CONTEXT] Invalid cached currency data');
      }
    }
    
    // Detect currency if no valid cached data
    detectCurrency();
  }, []);

  const value: CurrencyContextType = {
    ...currencyData,
    isLoading,
    formatPrice,
    convertFromCFA,
    detectCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;