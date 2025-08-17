import * as React from 'react';

interface SandboxContextType {
  isSandboxMode: boolean;
  setSandboxMode: (enabled: boolean) => void;
}

// Static context without hooks for testing
const defaultValue: SandboxContextType = {
  isSandboxMode: true, // Enable sandbox by default for development
  setSandboxMode: (enabled) => console.log('setSandboxMode called:', enabled)
};

const SandboxContext = React.createContext<SandboxContextType>(defaultValue);

export function SandboxProvider({ children }: { children: React.ReactNode }) {
  // NO HOOKS - just static value to test if React works
  return (
    <SandboxContext.Provider value={defaultValue}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  return React.useContext(SandboxContext);
}