import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Download, Smartphone, RefreshCw, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWALogoPreview: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [logoStatus, setLogoStatus] = useState<{[key: string]: 'loading' | 'success' | 'error'}>({});
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const text = {
    fr: {
      title: 'Aperçu des Logos PWA EDUCAFRIC',
      subtitle: 'Vérification et test d\'installation avec logos',
      testLogos: 'Tester les logos',
      installWithLogo: 'Installer avec logo',
      logoStatus: 'État des logos',
      installPreview: 'Aperçu installation',
      loading: 'Chargement...',
      success: 'Chargé',
      error: 'Erreur',
      installing: 'Installation...'
    },
    en: {
      title: 'EDUCAFRIC PWA Logo Preview',
      subtitle: 'Logo verification and installation test',
      testLogos: 'Test logos',
      installWithLogo: 'Install with logo',
      logoStatus: 'Logo status',
      installPreview: 'Installation preview',
      loading: 'Loading...',
      success: 'Loaded',
      error: 'Error',
      installing: 'Installing...'
    }
  };

  const t = text[language as keyof typeof text];

  const logoSources = [
    { name: 'Logo 128px', src: '/educafric-logo-128.png', size: '128x128' },
    { name: 'Android Chrome 192px', src: '/android-chrome-192x192.png', size: '192x192' },
    { name: 'Android Chrome 512px', src: '/android-chrome-512x512.png', size: '512x512' },
    { name: 'Apple Touch Icon', src: '/apple-touch-icon.png', size: '180x180' },
    { name: 'Favicon', src: '/favicon.png', size: '32x32' }
  ];

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const testLogos = async () => {
    setLogoStatus({});
    
    for (const logo of logoSources) {
      setLogoStatus(prev => ({ ...prev, [logo.src]: 'loading' }));
      
      try {
        const img = new Image();
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        img.src = logo.src;
        await loadPromise;
        
        setLogoStatus(prev => ({ ...prev, [logo.src]: 'success' }));
      } catch (error) {
        setLogoStatus(prev => ({ ...prev, [logo.src]: 'error' }));
      }
    }

    toast({
      title: 'Test terminé',
      description: 'Vérification des logos PWA terminée',
    });
  };

  const installPWAWithLogo = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          toast({
            title: '🎉 Installation acceptée !',
            description: 'EDUCAFRIC sera installé avec le logo sur votre écran d\'accueil',
            duration: 5000,
          });
          
          // Show preview of what the user should see
          setTimeout(() => {
            const previewMessage = language === 'fr' ?
              '📱 L\'icône EDUCAFRIC apparaîtra sur votre écran d\'accueil avec le logo officiel.\n\n🎨 Logo: Rond bleu avec "E" blanc\n📋 Nom: EDUCAFRIC\n🚀 Lancement: Instantané\n\nSi vous ne voyez pas l\'icône, vérifiez dans vos applications récemment installées.' :
              '📱 The EDUCAFRIC icon will appear on your home screen with the official logo.\n\n🎨 Logo: Blue circle with white "E"\n📋 Name: EDUCAFRIC\n🚀 Launch: Instant\n\nIf you don\'t see the icon, check your recently installed apps.';
            
            alert(previewMessage);
          }, 2000);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Installation error:', error);
        toast({
          title: 'Erreur d\'installation',
          description: 'Essayez l\'installation manuelle via le menu du navigateur',
          variant: 'destructive'
        });
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Manual installation with logo instructions
      const instructions = language === 'fr' ?
        'Installation manuelle EDUCAFRIC:\n\n1. Menu navigateur (⋮)\n2. "Installer EDUCAFRIC" ou "Ajouter à l\'écran"\n3. Le logo officiel sera utilisé automatiquement\n\n✅ Vous verrez l\'icône bleue EDUCAFRIC sur votre écran d\'accueil' :
        'Manual EDUCAFRIC installation:\n\n1. Browser menu (⋮)\n2. "Install EDUCAFRIC" or "Add to screen"\n3. Official logo will be used automatically\n\n✅ You will see the blue EDUCAFRIC icon on your home screen';
      
      alert(instructions);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline">{t.loading}</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">{t.success}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t.error}</Badge>;
      default:
        return <Badge variant="outline">Non testé</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>{t.title}</CardTitle>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testLogos}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-test-logos"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t.testLogos}
            </Button>
            
            <Button 
              onClick={installPWAWithLogo}
              disabled={isInstalling}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
              data-testid="button-install-with-logo"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.installing}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t.installWithLogo}
                </>
              )}
            </Button>
          </div>

          {/* Logo Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logoSources.map((logo) => (
              <Card key={logo.src} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img 
                      src={logo.src}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setLogoStatus(prev => ({ ...prev, [logo.src]: 'error' }));
                      }}
                      onLoad={() => {
                        if (logoStatus[logo.src] === 'loading') {
                          setLogoStatus(prev => ({ ...prev, [logo.src]: 'success' }));
                        }
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{logo.name}</p>
                    <p className="text-xs text-gray-500">{logo.size}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(logoStatus[logo.src] || 'default')}
                    {getStatusBadge(logoStatus[logo.src] || 'default')}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Installation Preview */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">{t.installPreview}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🏠 Sur votre écran d'accueil :</h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">E</span>
                      </div>
                      <div>
                        <p className="font-medium">EDUCAFRIC</p>
                        <p className="text-xs text-gray-500">Application installée</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📱 Lors du lancement :</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Démarrage instantané</li>
                    <li>✅ Écran de démarrage avec logo</li>
                    <li>✅ Interface native</li>
                    <li>✅ Notifications actives</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current PWA Status */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-900">État actuel PWA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Prompt disponible:</span>
                  <Badge variant={deferredPrompt ? "default" : "outline"}>
                    {deferredPrompt ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mode standalone:</span>
                  <Badge variant={window.matchMedia('(display-mode: standalone)').matches ? "default" : "outline"}>
                    {window.matchMedia('(display-mode: standalone)').matches ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Service Worker:</span>
                  <Badge variant={'serviceWorker' in navigator ? "default" : "destructive"}>
                    {'serviceWorker' in navigator ? "Supporté" : "Non supporté"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>HTTPS:</span>
                  <Badge variant={location.protocol === 'https:' || location.hostname === 'localhost' ? "default" : "destructive"}>
                    {location.protocol === 'https:' || location.hostname === 'localhost' ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWALogoPreview;