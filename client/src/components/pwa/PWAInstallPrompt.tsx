import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  outcome: 'accepted' | 'dismissed';
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: Event & {
      preventDefault: () => void;
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
  }
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<string>('');

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      if ((window.navigator as any).standalone) {
        setIsInstalled(true);
        return;
      }
      
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA_INSTALL] Installation prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      console.log('[PWA_INSTALL] App installée avec succès');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setInstallOutcome('Installation réussie ! EducAfric est maintenant disponible comme application.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn('[PWA_INSTALL] Pas de prompt d\'installation disponible');
      return;
    }

    setIsInstalling(true);

    try {
      // Afficher le prompt d'installation
      await deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`[PWA_INSTALL] Choix utilisateur: ${outcome}`);
      
      if (outcome === 'accepted') {
        setInstallOutcome('Installation en cours...');
      } else {
        setInstallOutcome('Installation annulée par l\'utilisateur.');
      }
      
      // Nettoyer le prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      
    } catch (error) {
      console.error('[PWA_INSTALL] Erreur installation:', error);
      setInstallOutcome('Erreur lors de l\'installation. Veuillez réessayer.');
    } finally {
      setIsInstalling(false);
    }
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        instructions: [
          'Cliquez sur les trois points (⋮) en haut à droite',
          'Sélectionnez "Installer EducAfric..."',
          'Cliquez sur "Installer" dans la popup'
        ]
      };
    }
    
    if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        instructions: [
          'Cliquez sur l\'icône de maison avec un plus (+) dans la barre d\'adresse',
          'Sélectionnez "Installer cette application"',
          'Cliquez sur "Installer" pour confirmer'
        ]
      };
    }
    
    if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        instructions: [
          'Cliquez sur le bouton Partager (□↑)',
          'Faites défiler et sélectionnez "Sur l\'écran d\'accueil"',
          'Tapez "Ajouter" pour installer'
        ]
      };
    }
    
    if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        instructions: [
          'Cliquez sur les trois points (⋯) en haut à droite',
          'Sélectionnez "Applications" > "Installer EducAfric"',
          'Cliquez sur "Installer" dans la fenêtre de confirmation'
        ]
      };
    }
    
    return {
      browser: 'Navigateur',
      instructions: [
        'Recherchez l\'option "Installer l\'application" dans le menu',
        'Suivez les instructions du navigateur',
        'L\'application sera ajoutée à votre écran d\'accueil'
      ]
    };
  };

  const browserGuide = getBrowserInstructions();

  if (isInstalled) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Application Installée</h3>
              <p className="text-sm text-green-600">
                EducAfric est installé et prêt à utiliser !
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Installation automatique disponible */}
      {isInstallable && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Installation Rapide Disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-700">
              Installez EducAfric comme une application native pour une meilleure expérience !
            </p>
            
            <Button 
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isInstalling ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-pulse" />
                  Installation en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Installer EducAfric
                </>
              )}
            </Button>
            
            {installOutcome && (
              <div className="text-sm text-blue-600 p-2 bg-blue-100 rounded">
                {installOutcome}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions manuelles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Installation Manuelle - {browserGuide.browser}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Si le bouton d'installation ne fonctionne pas, suivez ces étapes :
          </p>
          
          <ol className="space-y-2 text-sm">
            {browserGuide.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <span className="text-gray-700">{instruction}</span>
              </li>
            ))}
          </ol>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-sm mb-2">Avantages de l'installation :</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Accès rapide depuis l'écran d'accueil</li>
              <li>• Notifications push en temps réel</li>
              <li>• Fonctionne hors ligne</li>
              <li>• Interface optimisée mobile</li>
              <li>• Démarrage plus rapide</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Informations de compatibilité */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Monitor className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <h4 className="font-medium text-sm">Compatibilité</h4>
              <p className="text-xs text-gray-600 mt-1">
                Compatible avec Chrome, Firefox, Safari, Edge sur desktop et mobile.
                Les notifications push nécessitent une installation PWA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;