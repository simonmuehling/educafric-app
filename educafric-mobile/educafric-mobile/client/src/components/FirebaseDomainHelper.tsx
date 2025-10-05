import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FirebaseDomainHelper() {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [showHelper, setShowHelper] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentDomain(window?.location?.hostname);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator?.clipboard?.writeText(text);
    toast({
      title: 'Copié !',
      description: `"${text}" copié dans le presse-papiers`,
    });
  };

  const domains = [
    currentDomain,
    `${currentDomain}:5000`,
    'localhost',
    'www.educafric.com',
    'educafric.com'
  ];

  if (!showHelper) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHelper(true)}
        className="text-xs"
      >
        <Info className="w-3 h-3 mr-1" />
        Aide Firebase
      </Button>
    );
  }

  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium">Configuration Firebase requise :</p>
          
          <div className="space-y-2">
            <p className="text-sm">Domaine actuel détecté : <code className="bg-gray-100 px-1 rounded">{currentDomain}</code></p>
            
            <p className="text-sm">Ajoutez ces domaines à Firebase Console :</p>
            <div className="space-y-1">
              {(Array.isArray(domains) ? domains : []).map((domain, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <code className="text-sm">{domain}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(domain)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://console?.firebase?.google.com/', '_blank')}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Ouvrir Firebase Console
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelper(false)}
              className="text-xs"
            >
              Fermer
            </Button>
          </div>

          <div className="text-xs text-gray-600 mt-2">
            <p>Étapes : Firebase Console → Authentication → Settings → Authorized domains → Add domain</p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}