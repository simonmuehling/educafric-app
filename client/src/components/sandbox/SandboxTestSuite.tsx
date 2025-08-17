import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Play, Square, CheckCircle, XCircle, Clock, 
  TestTube, Code, Database, Globe, Zap
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'ui' | 'database' | 'integration';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

const SandboxTestSuite = () => {
  const { language } = useLanguage();
  const [tests, setTests] = useState<TestCase[]>([
    {
      id: 'api-auth',
      name: 'Authentication API',
      description: language === 'fr' ? 'Test des endpoints d\'authentification' : 'Test authentication endpoints',
      category: 'api',
      status: 'pending'
    },
    {
      id: 'api-users',
      name: 'Users API',
      description: language === 'fr' ? 'Test des opérations CRUD utilisateurs' : 'Test user CRUD operations',
      category: 'api',
      status: 'pending'
    },
    {
      id: 'ui-components',
      name: 'UI Components',
      description: language === 'fr' ? 'Test du rendu des composants' : 'Test component rendering',
      category: 'ui',
      status: 'pending'
    },
    {
      id: 'db-connection',
      name: 'Database Connection',
      description: language === 'fr' ? 'Test de connectivité base de données' : 'Test database connectivity',
      category: 'database',
      status: 'pending'
    },
    {
      id: 'integration-full',
      name: 'Full Integration',
      description: language === 'fr' ? 'Test d\'intégration complète' : 'Full integration test',
      category: 'integration',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const t = {
    title: language === 'fr' ? 'Suite de Tests Sandbox' : 'Sandbox Test Suite',
    subtitle: language === 'fr' ? 'Tests automatisés pour validation' : 'Automated tests for validation',
    runAll: language === 'fr' ? 'Lancer Tous' : 'Run All',
    runSelected: language === 'fr' ? 'Lancer Sélection' : 'Run Selected',
    stop: language === 'fr' ? 'Arrêter' : 'Stop',
    clear: language === 'fr' ? 'Effacer' : 'Clear',
    progress: language === 'fr' ? 'Progression' : 'Progress',
    results: language === 'fr' ? 'Résultats' : 'Results',
    passed: language === 'fr' ? 'Réussi' : 'Passed',
    failed: language === 'fr' ? 'Échoué' : 'Failed',
    pending: language === 'fr' ? 'En attente' : 'Pending',
    running: language === 'fr' ? 'En cours' : 'Running',
    duration: language === 'fr' ? 'Durée' : 'Duration',
    error: language === 'fr' ? 'Erreur' : 'Error'
  };

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Update test status to running
      setTests(prev => (Array.isArray(prev) ? prev : []).map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ));

      // Simulate test execution
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      const duration = Date.now() - startTime;

      // Random pass/fail for demo
      const passed = Math.random() > 0.2;
      
      setTests(prev => (Array.isArray(prev) ? prev : []).map(t => 
        t.id === test.id ? { 
          ...t, 
          status: passed ? 'passed' : 'failed',
          duration,
          error: passed ? undefined : 'Mock error for demonstration'
        } : t
      ));

      setProgress((i + 1) / tests.length * 100);
    }

    setIsRunning(false);
  };

  const stopTests = () => {
    setIsRunning(false);
    setTests(prev => (Array.isArray(prev) ? prev : []).map(t => 
      t.status === 'running' ? { ...t, status: 'pending' } : t
    ));
  };

  const clearResults = () => {
    setTests(prev => (Array.isArray(prev) ? prev : []).map(t => ({ 
      ...t, 
      status: 'pending',
      duration: undefined,
      error: undefined
    })));
    setProgress(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <TestTube className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api': return <Code className="w-4 h-4" />;
      case 'ui': return <Zap className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'integration': return <Globe className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const passedCount = (Array.isArray(tests) ? tests : []).filter(t => t.status === 'passed').length;
  const failedCount = (Array.isArray(tests) ? tests : []).filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="run-all-tests"
          >
            <Play className="w-4 h-4 mr-2" />
            {t.runAll}
          </Button>
          {isRunning && (
            <Button 
              onClick={stopTests} 
              variant="outline"
              data-testid="stop-tests"
            >
              <Square className="w-4 h-4 mr-2" />
              {t.stop}
            </Button>
          )}
          <Button 
            onClick={clearResults} 
            variant="outline"
            disabled={isRunning}
            data-testid="clear-results"
          >
            {t.clear}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {(isRunning || progress > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t.progress}</span>
              <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{passedCount}</div>
                <div className="text-sm text-gray-600">{t.passed}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm text-gray-600">{t.failed}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Array.isArray(tests) ? tests : []).map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex items-center gap-2 text-gray-600">
                    {getCategoryIcon(test.category)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{test.name || ''}</div>
                    <div className="text-sm text-gray-600">{test.description || ''}</div>
                    {test.error && (
                      <div className="text-xs text-red-600 mt-1">{test.error}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && (
                    <span className="text-xs text-gray-500">
                      {test.duration}ms
                    </span>
                  )}
                  <Badge className={getStatusColor(test.status)}>
                    {t[test.status as keyof typeof t]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SandboxTestSuite;