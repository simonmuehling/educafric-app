import * as React from 'react';

// Minimal test context to verify React works
const TestAuthContext = React.createContext({ isAuthenticated: false });

export function TestAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <TestAuthContext.Provider value={{ isAuthenticated: false }}>
      {children}
    </TestAuthContext.Provider>
  );
}

export function useTestAuth() {
  return React.useContext(TestAuthContext);
}