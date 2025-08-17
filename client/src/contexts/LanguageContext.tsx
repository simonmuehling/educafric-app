import * as React from 'react';

interface LanguageContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string) => string;
}

// Static context without hooks for testing
const defaultValue: LanguageContextType = {
  language: 'fr',
  setLanguage: (lang) => console.log('setLanguage called:', lang),
  t: (key) => key // Just return the key for now
};

const LanguageContext = React.createContext<LanguageContextType>(defaultValue);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // NO HOOKS - just static value to test if React works
  return (
    <LanguageContext.Provider value={defaultValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}