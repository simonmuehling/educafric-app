import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import confetti from 'canvas-confetti';
import { useLocation } from 'wouter';
import { AuthenticatedUser } from '@shared/types';

// Use AuthenticatedUser from shared types to include subscription fields
type User = AuthenticatedUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      
      let userData;
      try {
        userData = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server during login');
      }
      
      if (!response.ok) {
        throw new Error(userData.message || 'Login failed');
      }
      
      // Extract user from response - server returns { user: userData }
      const actualUserData = userData.user || userData;
      setUser(actualUserData);
      
      // Minimal logging for performance
      if (import.meta.env.DEV) {
        console.log(`Login successful: ${actualUserData.firstName} ${actualUserData.lastName} (${actualUserData.role})`);
      }
      
      // Lightweight confetti for fast login
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      
      // Force check auth status after successful login
      await checkAuthStatus();
      
      // Immediate navigation to dashboard (no delay)
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message || 'Unknown login error',
        stack: error.stack,
        response: error.response?.data || 'No response data'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Clear user even if API call fails
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      
      let newUser;
      try {
        newUser = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server during registration');
      }
      
      if (!response.ok) {
        throw new Error(newUser.message || 'Registration failed');
      }
      
      // Registration notification only in dev mode for performance
      if (import.meta.env.DEV) {
        const userDisplayName = `${userData.firstName || ''} ${userData.lastName || ''}`;
        const roleDisplay = userData.role === 'SiteAdmin' ? 'Site Administrator' : userData.role;
        console.log(`🎊 Registration successful: ${userDisplayName} (${roleDisplay}) - ${userData.email || ''}`);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/forgot-password', { email });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server during password reset request');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }
      
      if (import.meta.env.DEV) {
        console.log(`📧 Password reset requested for: ${email}`);
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server during password reset');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      if (import.meta.env.DEV) {
        console.log('🔐 Password reset successful');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      
      if (response.ok) {
        try {
          const userData = await response.json();
          // Validate userData has expected structure
          if (userData && typeof userData === 'object' && userData.user) {
            setUser(userData.user);
          } else if (userData && userData.id) {
            setUser(userData);
          } else {
            console.warn('Invalid user data structure received');
            setUser(null);
          }
        } catch (jsonError) {
          console.warn('Failed to parse auth response JSON');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // Silently handle auth check - reduces console spam
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      requestPasswordReset,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🚫 CRITICAL: Re-export useAuth to fix HMR import errors
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Alternative export for compatibility 
export const useAuthContext = useAuth;