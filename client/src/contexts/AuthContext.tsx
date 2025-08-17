import * as React from 'react';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  resetPassword: () => Promise<void>;
}

// Static context without any hooks to test if React works
const defaultValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => { console.log('login called'); },
  logout: async () => { console.log('logout called'); },
  register: async () => { console.log('register called'); },
  requestPasswordReset: async () => { console.log('requestPasswordReset called'); },
  resetPassword: async () => { console.log('resetPassword called'); }
};

const AuthContext = React.createContext<AuthContextType>(defaultValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // NO HOOKS AT ALL - just static value
  return (
    <AuthContext.Provider value={defaultValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}