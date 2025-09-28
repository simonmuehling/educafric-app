/**
 * PAGE DE TEST MTN MOBILE MONEY
 * Interface complète pour tester l'intégration MTN avec de vraies credentials
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Zap, Shield, CheckCircle } from 'lucide-react';
import MTNPaymentTest from '@/components/payments/MTNPaymentTest';

export default function MTNTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mr-4">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                MTN Mobile Money Integration
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Test de l'API MTN avec vos vraies credentials
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-4 h-4 mr-1" />
              API Production
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Zap className="w-4 h-4 mr-1" />
              Paiements Réels
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="w-4 h-4 mr-1" />
              Sécurisé
            </Badge>
          </div>
        </div>

        {/* Info importante */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Information Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-800 space-y-2">
              <p>
                <strong>✅ Credentials MTN configurées:</strong> Votre Customer Key et Customer Secret sont maintenant actives
              </p>
              <p>
                <strong>⚠️ Paiements réels:</strong> Cette page utilise l'API de production MTN. Les paiements seront réels!
              </p>
              <p>
                <strong>🔧 Tests recommandés:</strong> Commencez par de petits montants (100-500 XAF) pour valider
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interface de test MTN */}
        <MTNPaymentTest />

        {/* Documentation API */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation API MTN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-yellow-700">🔑 Credentials Configurées</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customer Key:</span>
                    <Badge variant="outline" className="bg-green-50">Configurée ✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Secret:</span>
                    <Badge variant="outline" className="bg-green-50">Configurée ✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <Badge variant="outline" className="bg-blue-50">Production</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-yellow-700">📱 Numéros MTN Supportés</h4>
                <div className="space-y-1 text-sm">
                  <div>• <code>67X XXX XXX</code> - MTN Cameroun</div>
                  <div>• <code>65X XXX XXX</code> - MTN Business</div>
                  <div>• <code>68X XXX XXX</code> - MTN PostPaid</div>
                  <div className="text-gray-500 mt-2">
                    Format accepté: avec ou sans +237
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">🚀 Fonctionnalités Implémentées</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Paiements Collection:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Initiation automatique</li>
                    <li>• Validation numéros</li>
                    <li>• Suivi temps réel</li>
                  </ul>
                </div>
                <div>
                  <strong>Gestion Tokens:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• OAuth2 automatique</li>
                    <li>• Renouvellement auto</li>
                    <li>• Gestion erreurs</li>
                  </ul>
                </div>
                <div>
                  <strong>Cashout (Admin):</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Paiements sortants</li>
                    <li>• Solde du compte</li>
                    <li>• Logs détaillés</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aide et support */}
        <Card>
          <CardHeader>
            <CardTitle>Support et Aide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-3">
              <div>
                <strong>🔍 Debugging:</strong> Consultez les logs du serveur pour voir les requêtes MTN en détail
              </div>
              <div>
                <strong>📞 Support MTN:</strong> En cas d'erreur API, contactez le support MTN/Paynote avec vos logs
              </div>
              <div>
                <strong>💳 Intégration EDUCAFRIC:</strong> Les paiements MTN sont maintenant intégrés dans tous les modules d'abonnement
              </div>
              <div>
                <strong>🌐 URL de référence:</strong> 
                <a 
                  href="https://www.paynote.africa/comment-deployer-lapi-de-webpaiement-mtn-mobile-money/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-2"
                >
                  Documentation paynote.africa
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}