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
      const userData = await response.json();
      
      if (!response.ok) {
        throw new Error(userData.message || 'Login failed');
      }
      
      setUser(userData);
      
      // Minimal logging for performance
      if (import.meta.env.DEV) {
        console.log(`Login successful: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      }
      
      // Lightweight confetti for fast login
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      
      // Immediate navigation to dashboard (no delay)
      setLocation('/dashboard');
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
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
      const newUser = await response.json();
      
      if (!response.ok) {
        throw new Error(newUser.message || 'Registration failed');
      }
      
      // Enhanced registration notification with user details
      const userDisplayName = `${userData.firstName || ''} ${userData.lastName || ''}`;
      const roleDisplay = userData.role === 'SiteAdmin' ? 'Site Administrator' : userData.role;
      console.log(`🎊 Registration successful: ${userDisplayName} (${roleDisplay}) - ${userData.email || ''}`);
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
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }
      
      console.log(`📧 Password reset requested for: ${email}`);
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
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      console.log('🔐 Password reset successful');
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Alternative export name for backward compatibility
export const useAuthContext = useAuth;