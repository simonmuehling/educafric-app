/**
 * PAGE DE TEST POUR LES PAIEMENTS MTN
 * Interface de démonstration pour tester l'intégration MTN
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import MTNPaymentForm from './MTNPaymentForm';
import { BookOpen, CheckCircle, AlertCircle, Smartphone, Activity } from 'lucide-react';

export default function MTNPaymentTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | null>(null);
  const [balance, setBalance] = useState<{ balance: number; currency: string } | null>(null);
  const [paymentResults, setPaymentResults] = useState<Array<{
    type: 'success' | 'error';
    message: string;
    timestamp: string;
    transactionId?: string;
  }>>([]);

  const { toast } = useToast();

  // Test de connexion MTN
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('/api/mtn-payments/test-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('connected');
        toast({
          title: "Connexion MTN réussie",
          description: "L'API MTN Mobile Money est opérationnelle",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Erreur de connexion",
        description: error.message || 'Impossible de se connecter à l\'API MTN',
        variant: "destructive",
      });
    }
  };

  // Vérifier le solde du compte
  const checkBalance = async () => {
    try {
      const response = await fetch('/api/mtn-payments/balance');
      const data = await response.json();
      
      if (data.success) {
        setBalance({ balance: data.balance, currency: data.currency });
        toast({
          title: "Solde récupéré",
          description: `Solde: ${data.balance.toLocaleString()} ${data.currency}`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: "Erreur solde",
        description: error.message || 'Impossible de récupérer le solde',
        variant: "destructive",
      });
    }
  };

  // Gérer le succès de paiement
  const handlePaymentSuccess = (transactionId: string) => {
    const result = {
      type: 'success' as const,
      message: `Paiement réussi - Transaction: ${transactionId}`,
      timestamp: new Date().toLocaleTimeString(),
      transactionId
    };
    setPaymentResults(prev => [result, ...prev]);
  };

  // Gérer l'échec de paiement
  const handlePaymentFailed = (error: string) => {
    const result = {
      type: 'error' as const,
      message: `Paiement échoué: ${error}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setPaymentResults(prev => [result, ...prev]);
  };

  // Plans de test
  const testPlans = [
    {
      id: 'parent_monthly',
      name: 'Parent Mensuel',
      amount: 1000,
      currency: 'XAF'
    },
    {
      id: 'teacher_quarterly',
      name: 'Enseignant Trimestriel',
      amount: 5000,
      currency: 'XAF'
    },
    {
      id: 'school_annual',
      name: 'École Annuel',
      amount: 50000,
      currency: 'XAF'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Test MTN Mobile Money</h1>
          <p className="text-gray-600">Interface de test pour l'intégration paiements MTN</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tests de connectivité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Tests Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test de connexion */}
              <div>
                <Button
                  onClick={testConnection}
                  disabled={connectionStatus === 'testing'}
                  className="w-full"
                  variant={connectionStatus === 'connected' ? 'default' : 'outline'}
                >
                  {connectionStatus === 'testing' ? (
                    <>
                      <BookOpen className="w-4 h-4 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Tester Connexion MTN
                    </>
                  )}
                </Button>
                
                {connectionStatus && (
                  <div className={`flex items-center mt-2 text-sm ${
                    connectionStatus === 'connected' ? 'text-green-600' : 
                    connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {connectionStatus === 'error' && <AlertCircle className="w-4 h-4 mr-1" />}
                    {connectionStatus === 'testing' && <BookOpen className="w-4 h-4 mr-1 animate-spin" />}
                    {connectionStatus === 'connected' && 'Connexion réussie'}
                    {connectionStatus === 'error' && 'Connexion échouée'}
                    {connectionStatus === 'testing' && 'Test en cours...'}
                  </div>
                )}
              </div>

              {/* Vérification du solde */}
              <div>
                <Button
                  onClick={checkBalance}
                  variant="outline"
                  className="w-full"
                  disabled={connectionStatus !== 'connected'}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Vérifier Solde
                </Button>
                
                {balance && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <strong>Solde:</strong> {balance.balance.toLocaleString()} {balance.currency}
                  </div>
                )}
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <div className="text-sm font-semibold">Statut API:</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
                    {connectionStatus === 'connected' ? 'Connecté' : 'Déconnecté'}
                  </Badge>
                  <Badge variant="outline">
                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tests de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Test Paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testPlans.map((plan) => (
                  <div key={plan.id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {plan.amount.toLocaleString()} {plan.currency}
                    </p>
                    
                    <MTNPaymentForm
                      planId={plan.id}
                      planName={plan.name}
                      amount={plan.amount}
                      currency={plan.currency}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailed={handlePaymentFailed}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Résultats des tests */}
          <Card>
            <CardHeader>
              <CardTitle>Résultats des Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {paymentResults.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Aucun test effectué
                  </p>
                ) : (
                  paymentResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        result.type === 'success' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        {result.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className={result.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {result.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {result.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {paymentResults.length > 0 && (
                <Button
                  onClick={() => setPaymentResults([])}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                >
                  Effacer les résultats
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🔧 Tests Techniques</h4>
                <ol className="text-sm space-y-1">
                  <li>1. Testez d'abord la connexion à l'API MTN</li>
                  <li>2. Vérifiez le solde du compte (admin requis)</li>
                  <li>3. Testez la validation des numéros MTN</li>
                  <li>4. Initiez un paiement de test</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">📱 Tests Utilisateur</h4>
                <ol className="text-sm space-y-1">
                  <li>1. Entrez un numéro MTN valide (67X, 65X, 68X)</li>
                  <li>2. Sélectionnez un montant de test</li>
                  <li>3. Confirmez sur votre téléphone MTN</li>
                  <li>4. Vérifiez la confirmation automatique</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> En mode sandbox, les paiements utilisent de l'argent virtuel. 
                En production, assurez-vous d'avoir configuré les vraies credentials MTN.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}