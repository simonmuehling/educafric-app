import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, ArrowLeft, BarChart3, CheckSquare, FileText, Shield, Search } from 'lucide-react';
import { BulkImportManager } from '@/components/bulk/BulkImportManager';
import { Link } from 'wouter';

export default function BulkManagement() {
  const [importResults, setImportResults] = useState<any>(null);

  const handleImportComplete = (results: any) => {
    setImportResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/director">
              <Button variant="outline" size="sm" data-testid="back-to-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import en masse</h1>
              <p className="text-gray-600">Ajoutez facilement plusieurs utilisateurs à votre école</p>
            </div>
          </div>
        </div>

        {/* Import Results Summary */}
        {importResults && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Résultats de l'import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResults.successCount}</div>
                  <p className="text-sm text-gray-600">Utilisateurs créés</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResults.errorCount}</div>
                  <p className="text-sm text-gray-600">Erreurs</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResults.createdUsers?.length || 0}</div>
                  <p className="text-sm text-gray-600">Comptes actifs</p>
                </div>
              </div>
              
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Erreurs détectées:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {importResults.errors.slice(0, 3).map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResults.errors.length > 3 && (
                      <li>... et {importResults.errors.length - 3} autres erreurs</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import Tabs */}
        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Import Enseignants
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Import Élèves
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers">
            <BulkImportManager
              userType="teachers"
              schoolId={1} // This should come from user context
              onImportComplete={handleImportComplete}
            />
          </TabsContent>
          
          <TabsContent value="students">
            <BulkImportManager
              userType="students"
              schoolId={1} // This should come from user context
              onImportComplete={handleImportComplete}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avantages de l'import en masse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="w-3 h-3 text-green-500" />
                <span>Gain de temps considérable</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-3 h-3 text-blue-500" />
                <span>Réduction des erreurs de saisie</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-3 h-3 text-purple-500" />
                <span>Validation automatique des données</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Search className="w-3 h-3 text-orange-500" />
                <span>Détection des doublons</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Formats supportés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="w-3 h-3 text-green-500" />
                <span>Excel (.xlsx, .xls)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-3 h-3 text-blue-500" />
                <span>CSV (.csv)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-3 h-3 text-purple-500" />
                <span>Validation en temps réel</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Search className="w-3 h-3 text-orange-500" />
                <span>Aperçu avant import</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="w-3 h-3 text-green-500" />
                <span>Chiffrement des fichiers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-3 h-3 text-blue-500" />
                <span>Mots de passe sécurisés</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-3 h-3 text-purple-500" />
                <span>Conformité RGPD</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Search className="w-3 h-3 text-orange-500" />
                <span>Suppression automatique des fichiers</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}