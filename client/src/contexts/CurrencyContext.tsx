import * as React from 'react';

interface CurrencyContextType {
  currency: 'XAF' | 'USD' | 'EUR';
  setCurrency: (currency: 'XAF' | 'USD' | 'EUR') => void;
  formatCurrency: (amount: number) => string;
}

// Static context without hooks for testing
const defaultValue: CurrencyContextType = {
  currency: 'XAF',
  setCurrency: (currency) => console.log('setCurrency called:', currency),
  formatCurrency: (amount) => `${amount} XAF` // Simple formatting for now
};

const CurrencyContext = React.createContext<CurrencyContextType>(defaultValue);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // NO HOOKS - just static value to test if React works
  return (
    <CurrencyContext.Provider value={defaultValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return React.useContext(CurrencyContext);
}