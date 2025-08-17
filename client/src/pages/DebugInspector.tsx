import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal, Bug, Activity, Code, Database, Settings } from 'lucide-react';
import WebInspector from '@/components/developer/WebInspector';
import { useToast } from '@/hooks/use-toast';

const DebugInspector = () => {
  const { toast } = useToast();

  // Test functions to generate logs and errors for demonstration
  const generateTestLogs = () => {
    console.log('Test log message');
    console.info('Test info message');
    console.warn('Test warning message');
    console.error('Test error message');
    console.debug('Test debug message');
    
    toast({
      title: "Logs de test générés",
      description: "Différents types de logs ont été créés pour le test"
    });
  };

  const generateTestError = () => {
    // Generate a test error
    try {
      throw new Error('Test error for debugging purposes');
    } catch (error) {
      console.error('Caught test error:', error);
    }
    
    toast({
      title: "Erreur de test générée",
      description: "Une erreur test a été créée pour l'inspecteur"
    });
  };

  const generateNetworkRequest = async () => {
    try {
      // Make a test API call
      await fetch('/api/health', { method: 'GET' });
      toast({
        title: "Requête test envoyée",
        description: "Une requête réseau de test a été envoyée"
      });
    } catch (error) {
      console.error('Network test failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Terminal className="w-6 h-6 text-slate-600" />
              <span>Debug Inspector - Outils de Développement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Interface de debug complète pour le développement et le diagnostic des erreurs.
                Utilisez les outils ci-dessous pour tester et analyser l'application.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={generateTestLogs}
                  className="flex items-center space-x-2"
                  data-testid="button-generate-logs"
                >
                  <Bug className="w-4 h-4" />
                  <span>Générer Logs Test</span>
                </Button>
                
                <Button 
                  onClick={generateTestError}
                  variant="outline" 
                  className="flex items-center space-x-2"
                  data-testid="button-generate-error"
                >
                  <Activity className="w-4 h-4" />
                  <span>Générer Erreur Test</span>
                </Button>
                
                <Button 
                  onClick={generateNetworkRequest}
                  variant="outline" 
                  className="flex items-center space-x-2"
                  data-testid="button-generate-network"
                >
                  <Database className="w-4 h-4" />
                  <span>Test Requête Réseau</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Terminal className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Console Logs</h3>
              <p className="text-sm text-gray-600">
                Capture et affichage de tous les logs console
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Network Monitor</h3>
              <p className="text-sm text-gray-600">
                Surveillance des requêtes HTTP/HTTPS
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Bug className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Error Tracking</h3>
              <p className="text-sm text-gray-600">
                Détection et analyse des erreurs JS
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Settings className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Performance</h3>
              <p className="text-sm text-gray-600">
                Métriques de performance temps réel
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Comment utiliser l'inspecteur</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Accès rapide</p>
                  <p className="text-gray-600">
                    Cliquez sur le bouton "Inspecteur Web" en bas à droite de n'importe quelle page
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Navigation des onglets</p>
                  <p className="text-gray-600">
                    Console pour les logs, Network pour les requêtes, Errors pour les erreurs
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Filtres et export</p>
                  <p className="text-gray-600">
                    Filtrez les logs par niveau, exportez les données pour analyse
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Debug en temps réel</p>
                  <p className="text-gray-600">
                    L'inspecteur capture automatiquement tous les événements de l'application
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web Inspector Component */}
      <WebInspector />
    </div>
  );
};

export default DebugInspector;