import { toast } from '@/hooks/use-toast';
import { getLocalizedErrorMessage } from './errorMessages';

type ErrorType = 'authentication' | 'validation' | 'network' | 'permission' | 'data' | 'unknown';

interface ErrorHandlerOptions {
  language?: 'en' | 'fr';
  useToast?: boolean;
  onError?: (error: string) => void;
}

export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = 'unknown',
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
) => {
  const { language = 'en', useToast = false, onError } = options;
  
  let errorMessage = '';
  let errorType: ErrorType = 'unknown';

  if (error instanceof AppError) {
    errorMessage = error.message;
    errorType = error.type;
  } else if (error instanceof Error) {
    // Map common error patterns to localized messages
    if (error?.message?.includes('Invalid credentials') || error?.message?.includes('Invalid email or password')) {
      errorMessage = getLocalizedErrorMessage('invalidCredentials', language);
      errorType = 'authentication';
    } else if (error?.message?.includes('already exists')) {
      errorMessage = getLocalizedErrorMessage('accountExists', language);
      errorType = 'validation';
    } else if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
      errorMessage = getLocalizedErrorMessage('networkError', language);
      errorType = 'network';
    } else if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      errorMessage = getLocalizedErrorMessage('accessDenied', language);
      errorType = 'permission';
    } else if (error?.message?.includes('/api/auth/login') && (error?.message?.includes('401') || error?.message?.includes('Unauthorized'))) {
      // Login-specific 401 error = invalid credentials
      errorMessage = getLocalizedErrorMessage('invalidCredentials', language);
      errorType = 'authentication';
    } else if (error?.message?.includes('upload') && (error?.message?.includes('403') || error?.message?.includes('Forbidden'))) {
      // Upload-specific 403 error = session expired
      errorMessage = language === 'fr' 
        ? 'Votre session a expiré. Veuillez recharger la page (F5) et réessayer.'
        : 'Your session has expired. Please reload the page (F5) and try again.';
      errorType = 'authentication';
    } else if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      errorMessage = getLocalizedErrorMessage('sessionExpired', language);
      errorType = 'authentication';
    } else if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
      errorMessage = getLocalizedErrorMessage('notFound', language);
      errorType = 'data';
    } else {
      errorMessage = error.message;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = getLocalizedErrorMessage('serverError', language);
  }

  // Log error for debugging
  console.error(`[${errorType.toUpperCase()}] Error:`, error);

  // Handle error display
  if (useToast) {
    toast({
      title: language === 'fr' ? 'Erreur' : 'Error',
      description: errorMessage,
      variant: 'destructive'
    });
  }

  if (onError) {
    onError(errorMessage);
  }

  return {
    message: errorMessage,
    type: errorType
  };
};

// Validation helpers for forms
export const validateEmail = (email: string, language: 'en' | 'fr' = 'en'): string | null => {
  if (!email) {
    return getLocalizedErrorMessage('fillAllFields', language);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return getLocalizedErrorMessage('invalidEmail', language);
  }
  return null;
};

export const validatePassword = (password: string, language: 'en' | 'fr' = 'en'): string | null => {
  if (!password) {
    return getLocalizedErrorMessage('fillAllFields', language);
  }
  if (password.length < 8) {
    return getLocalizedErrorMessage('passwordTooShort', language);
  }
  return null;
};

export const validatePasswordMatch = (
  password: string, 
  confirmPassword: string, 
  language: 'en' | 'fr' = 'en'
): string | null => {
  if (password !== confirmPassword) {
    return getLocalizedErrorMessage('passwordsDontMatch', language);
  }
  return null;
};

// Mobile-specific error display helper
export const createMobileError = (message: string, type: 'error' | 'warning' | 'success' | 'info' = 'error') => {
  return {
    message,
    type,
    mobile: true,
    timestamp: Date.now()
  };
};