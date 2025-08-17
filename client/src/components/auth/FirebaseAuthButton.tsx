import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loginWithGoogle, handleRedirect, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FirebaseAuthButtonProps {
  onSuccess?: (user: User) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function FirebaseAuthButton({ 
  onSuccess, 
  disabled = false,
  variant = 'outline',
  size = 'default',
  className = ''
}: FirebaseAuthButtonProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Handle Firebase auth state changes
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsLoading(true);
        
        try {
          // Sync Firebase user with Educafric backend
          const response = await apiRequest('POST', '/api/auth/firebase-sync', {
            firebaseUid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });

          if (response.ok) {
            const userData = await response.json();
            toast({
              title: t('auth.success'),
              description: t('auth?.firebase?.syncSuccess')
            });
            
            if (onSuccess) {
              onSuccess(user);
            }
          } else {
            throw new Error('Failed to sync with backend');
          }
        } catch (error) {
          console.error('[Firebase] Sync error:', error);
          toast({
            title: t('auth.error'),
            description: t('auth?.firebase?.syncError'),
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setFirebaseUser(null);
      }
    });

    // Handle redirect result on component mount
    handleRedirect();

    return () => unsubscribe();
  }, [onSuccess, t, toast]);

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({
        title: t('auth.error'),
        description: t('auth?.firebase?.notConfigured'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await loginWithGoogle();
      // Auth state change will handle the rest
    } catch (error) {
      console.error('[Firebase] Google login error:', error);
      toast({
        title: t('auth.error'),
        description: t('auth?.firebase?.loginError'),
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="text-sm text-gray-500 text-center">
        {t('auth?.firebase?.notAvailable')}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center space-x-2 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>{t('auth?.firebase?.connecting')}</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2?.25H12v4?.26h5.92c-.26 1.37-1.04 2.53-2.21 3?.31v2?.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4?.53H2?.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2?.09s?.13-1?.43?.35-2?.09V7?.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4?.93l2?.85-2?.22?.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5?.38c1?.62 0 3?.06?.56 4.21 1?.64l3?.15-3?.15C17?.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7?.07l3?.66 2?.84c?.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{t('auth?.firebase?.loginWithGoogle')}</span>
        </>
      )}
    </Button>
  );
}

export default FirebaseAuthButton;