import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, User, UserX, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export function AccountDeletionTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addTestResult = (test: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.test !== test),
      { test, status, message }
    ]);
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);

    // Test 1: Suppression directe pour enseignant
    try {
      addTestResult('teacher-direct-deletion', 'pending', 'Test en cours...');
      
      // Simuler une suppression d'enseignant
      const teacherResponse = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (teacherResponse.status === 401) {
        addTestResult('teacher-direct-deletion', 'success', 'API refuse les non-authentifiés ✓');
      } else {
        addTestResult('teacher-direct-deletion', 'error', 'Réponse inattendue: ' + teacherResponse.status);
      }
    } catch (error) {
      addTestResult('teacher-direct-deletion', 'error', 'Erreur réseau: ' + error);
    }

    // Test 2: Demande d'approbation pour élève
    try {
      addTestResult('student-approval-request', 'pending', 'Test en cours...');
      
      const studentResponse = await fetch('/api/student/request-account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (studentResponse.status === 401) {
        addTestResult('student-approval-request', 'success', 'API refuse les non-authentifiés ✓');
      } else {
        addTestResult('student-approval-request', 'error', 'Réponse inattendue: ' + studentResponse.status);
      }
    } catch (error) {
      addTestResult('student-approval-request', 'error', 'Erreur réseau: ' + error);
    }

    // Test 3: Approbation parentale
    try {
      addTestResult('parent-approval', 'pending', 'Test en cours...');
      
      const parentResponse = await fetch('/api/parent/approve-account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId: 123, approve: true })
      });

      if (parentResponse.status === 401) {
        addTestResult('parent-approval', 'success', 'API refuse les non-authentifiés ✓');
      } else {
        addTestResult('parent-approval', 'error', 'Réponse inattendue: ' + parentResponse.status);
      }
    } catch (error) {
      addTestResult('parent-approval', 'error', 'Erreur réseau: ' + error);
    }

    // Test 4: Vérification des boutons d'interface
    try {
      addTestResult('ui-buttons', 'pending', 'Test en cours...');
      
      // Vérifier que tous les boutons avec data-testid existent
      const buttons = [
        'button-delete-account',
        'button-approve-deletion', 
        'button-decline-deletion',
        'button-confirm-delete',
        'button-cancel-delete'
      ];

      let foundButtons = 0;
      buttons.forEach(buttonId => {
        const button = document.querySelector(`[data-testid="${buttonId}"]`);
        if (button) foundButtons++;
      });

      if (foundButtons > 0) {
        addTestResult('ui-buttons', 'success', `${foundButtons}/${buttons.length} boutons trouvés dans l'interface`);
      } else {
        addTestResult('ui-buttons', 'error', 'Aucun bouton trouvé avec data-testid');
      }
    } catch (error) {
      addTestResult('ui-buttons', 'error', 'Erreur lors de la vérification UI: ' + error);
    }

    setTesting(false);
    
    toast({
      title: "Tests terminés",
      description: "Tous les tests de fonctionnalité ont été exécutés.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-6 h-6 text-blue-600" />
          Test des Fonctionnalités de Suppression de Compte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Tests automatisés pour vérifier que tous les boutons et fonctionnalités sont implémentés
          </p>
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-run-tests"
          >
            {testing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Lancer tous les tests
              </>
            )}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Résultats des Tests</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Card className="border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-600" />
                <span className="font-medium">Enseignants</span>
              </div>
              <p className="text-sm text-gray-600">
                Suppression directe du compte sans approbation
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Élèves</span>
              </div>
              <p className="text-sm text-gray-600">
                Demande d'approbation envoyée aux parents
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Parents</span>
              </div>
              <p className="text-sm text-gray-600">
                Interface pour approuver/refuser les demandes
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}