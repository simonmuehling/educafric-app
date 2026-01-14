import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { queryClient } from '@/lib/queryClient';

interface Props {
  children: ReactNode;
  language?: 'fr' | 'en';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isOnline: boolean;
  isChunkError: boolean;
}

const translations = {
  fr: {
    title: 'Une erreur est survenue',
    networkTitle: 'Connexion perdue',
    chunkTitle: 'Mise à jour requise',
    description: 'Nous nous excusons pour ce désagrément. Veuillez réessayer.',
    networkDescription: 'Vérifiez votre connexion internet et réessayez.',
    chunkDescription: 'Une nouvelle version est disponible. Veuillez rafraîchir la page.',
    retry: 'Réessayer',
    refresh: 'Rafraîchir',
    goHome: 'Retour à l\'accueil',
    offline: 'Hors ligne',
    online: 'En ligne'
  },
  en: {
    title: 'Something went wrong',
    networkTitle: 'Connection lost',
    chunkTitle: 'Update required',
    description: 'We apologize for the inconvenience. Please try again.',
    networkDescription: 'Check your internet connection and try again.',
    chunkDescription: 'A new version is available. Please refresh the page.',
    retry: 'Try again',
    refresh: 'Refresh',
    goHome: 'Go to home',
    offline: 'Offline',
    online: 'Online'
  }
};

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isChunkError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isChunkError = 
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError';
    
    return { 
      hasError: true, 
      error,
      isChunkError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    console.error('[GlobalErrorBoundary] Caught error:', error);
    console.error('[GlobalErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
    if (this.state.hasError && !this.state.isChunkError) {
      this.handleRetry();
    }
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    if (error instanceof Error) {
      const isNetworkError = 
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('NetworkError') ||
        error.message.includes('net::ERR_');
      
      const isChunkError = 
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module');
      
      if (isNetworkError || isChunkError) {
        event.preventDefault();
        this.setState({ 
          hasError: true, 
          error, 
          isChunkError 
        });
      }
    }
  };

  handleRetry = () => {
    try {
      queryClient.clear();
      console.log('[GlobalErrorBoundary] QueryClient cache cleared');
    } catch (e) {
      console.error('[GlobalErrorBoundary] Failed to clear cache:', e);
    }
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isChunkError: false
    });
  };

  handleRefresh = () => {
    const doReload = () => {
      (window as Window).location.reload();
    };
    
    try {
      queryClient.clear();
    } catch (e) {
      console.error('[GlobalErrorBoundary] Failed to clear cache before refresh:', e);
    }
    
    if ('caches' in window) {
      caches.keys().then((names: string[]) => {
        names.forEach((name: string) => {
          caches.delete(name);
        });
        console.log('[GlobalErrorBoundary] Service worker caches cleared');
        doReload();
      }).catch(() => {
        doReload();
      });
    } else {
      doReload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, isOnline, isChunkError, error } = this.state;
    const { children, language = 'fr' } = this.props;
    const t = translations[language];

    if (hasError) {
      const isNetworkError = !isOnline || 
        (error?.message?.includes('Failed to fetch') ||
         error?.message?.includes('Network') ||
         error?.message?.includes('net::ERR_'));

      let title = t.title;
      let description = t.description;
      let Icon = AlertTriangle;

      if (isChunkError) {
        title = t.chunkTitle;
        description = t.chunkDescription;
        Icon = RefreshCw;
      } else if (isNetworkError) {
        title = t.networkTitle;
        description = t.networkDescription;
        Icon = WifiOff;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{description}</p>
              
              <div className="flex items-center justify-center gap-2 text-sm">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    {t.online}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    {t.offline}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-4">
                {isChunkError ? (
                  <Button 
                    onClick={this.handleRefresh}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.refresh}
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!isOnline && isNetworkError}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.retry}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t.goHome}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default GlobalErrorBoundary;
