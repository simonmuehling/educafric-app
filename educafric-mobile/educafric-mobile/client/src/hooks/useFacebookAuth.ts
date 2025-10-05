import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
}

interface FacebookUserData {
  id: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      url: string;
    };
  };
}

export function useFacebookAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const initializeFacebook = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (window.FB) {
        resolve();
        return;
      }

      window.fbAsyncInit = () => {
        resolve();
      };
    });
  }, []);

  const checkLoginStatus = useCallback((): Promise<FacebookAuthResponse | null> => {
    return new Promise((resolve) => {
      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          resolve(response.authResponse);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const getUserData = useCallback((accessToken: string): Promise<FacebookUserData> => {
    return new Promise((resolve, reject) => {
      window.FB.api('/me', {
        fields: 'id,name,email,first_name,last_name,picture',
        access_token: accessToken
      }, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(response.error || 'Failed to fetch user data');
        }
      });
    });
  }, []);

  const loginWithFacebook = useCallback(async () => {
    setIsLoading(true);
    try {
      await initializeFacebook();

      // Vérifier d'abord si l'utilisateur est déjà connecté
      const existingAuth = await checkLoginStatus();
      let authResponse: FacebookAuthResponse;

      if (existingAuth) {
        authResponse = existingAuth;
      } else {
        // Ouvrir la popup de connexion Facebook
        const loginResponse = await new Promise<any>((resolve, reject) => {
          window.FB.login((response: any) => {
            if (response.authResponse) {
              resolve(response);
            } else {
              reject(new Error('Facebook login cancelled or failed'));
            }
          }, { 
            scope: 'email,public_profile,whatsapp_business_messaging,whatsapp_business_management,business_management,whatsapp_business_manage_events' 
          });
        });
        authResponse = loginResponse.authResponse;
      }

      // Récupérer les données utilisateur
      const userData = await getUserData(authResponse.accessToken);

      // Vérifier que l'email est disponible
      if (!userData.email) {
        throw new Error('Email address is required for registration');
      }

      // Connecter l'utilisateur via notre système d'authentification Facebook
      const response = await fetch('/api/auth/facebook-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userData.email,
          facebookId: userData.id,
          name: userData.name,
          firstName: userData.first_name,
          lastName: userData.last_name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Facebook authentication failed');
      }

      // Recharger la page pour que le contexte d'authentification se mette à jour
      window.location.reload();

      console.log('Facebook login successful:', userData.name);
    } catch (error: any) {
      console.error('Facebook login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [initializeFacebook, checkLoginStatus, getUserData, login]);

  const logoutFromFacebook = useCallback(async () => {
    try {
      await initializeFacebook();
      
      return new Promise<void>((resolve) => {
        window.FB.logout(() => {
          console.log('Facebook logout successful');
          resolve();
        });
      });
    } catch (error) {
      console.error('Facebook logout error:', error);
    }
  }, [initializeFacebook]);

  return {
    loginWithFacebook,
    logoutFromFacebook,
    isLoading
  };
}