import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Users, School, BookOpen, GraduationCap, UserCheck, RefreshCw, Download, Shield, Lock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useEducafricSubmit } from '@/hooks/useSingleSubmit';

interface DuplicationAnalysis {
  users: {
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  };
  schools: {
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  };
  classes: {
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  };
  students: {
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  };
  teachers: {
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  };
  summary: {
    totalDuplicates: number;
    criticalIssues: number;
    autoFixable: number;
    timestamp: string;
  };
}

export default function DuplicationControlDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wrap, submitting } = useEducafricSubmit();
  const [lastAnalysis, setLastAnalysis] = useState<DuplicationAnalysis | null>(null);
  
  // Requête pour l'analyse des duplications
  const { data: analysisData, isLoading: loadingAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['/api/admin/duplication-analysis'],
    enabled: false, // Démarrage manuel
    onSuccess: (data) => {
      setLastAnalysis(data.analysis);
    }
  });
  
  // Mutation pour la correction automatique
  const autoFixMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/auto-fix-duplications');
    },
    onSuccess: (response) => {
      toast({
        title: "✅ Corrections appliquées",
        description: `${response.fixed} duplications corrigées automatiquement`,
      });
      
      // Relancer l'analyse après correction
      refetchAnalysis();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur de correction",
        description: error.message || "Impossible d'appliquer les corrections",
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour générer le rapport
  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/duplication-report');
      if (!response.ok) throw new Error('Erreur génération rapport');
      return await response.text();
    },
    onSuccess: (reportContent) => {
      // Télécharger le rapport
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-duplications-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📄 Rapport téléchargé",
        description: "Le rapport de duplications a été téléchargé avec succès",
      });
    }
  });
  
  // Fonction sécurisée pour démarrer l'analyse
  const handleStartAnalysis = wrap(async () => {
    await refetchAnalysis();
  });
  
  // Fonction sécurisée pour correction automatique
  const handleAutoFix = wrap(async () => {
    await autoFixMutation.mutateAsync();
  });
  
  // Fonction sécurisée pour générer rapport
  const handleGenerateReport = wrap(async () => {
    await reportMutation.mutateAsync();
  });
  
  const analysis = lastAnalysis || analysisData?.analysis;
  
  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Shield className="w-6 h-6" />
            Contrôle des Duplications Educafric
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Système de détection et correction automatique des duplications sur la plateforme
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Actions principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Actions de Contrôle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleStartAnalysis}
              disabled={submitting || loadingAnalysis}
              className="h-16 flex flex-col items-center gap-2"
              variant="outline"
            >
              <RefreshCw className={`w-5 h-5 ${loadingAnalysis ? 'animate-spin' : ''}`} />
              <span>{loadingAnalysis ? 'Analyse en cours...' : 'Analyser les Duplications'}</span>
            </Button>
            
            <Button
              onClick={handleAutoFix}
              disabled={submitting || !analysis || analysis.summary.autoFixable === 0}
              className="h-16 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Corrections Automatiques</span>
            </Button>
            
            <Button
              onClick={handleGenerateReport}
              disabled={submitting || !analysis}
              className="h-16 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
              variant="secondary"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger Rapport</span>
            </Button>
          </div>
          
          {submitting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Protection anti-duplication active • Opération en cours
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Résumé de l'analyse */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Résumé de l'Analyse
              </div>
              <Badge variant={analysis.summary.criticalIssues > 0 ? "destructive" : "default"}>
                {analysis.summary.criticalIssues > 0 ? 'Action Requise' : 'Système Sain'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Dernière analyse: {new Date(analysis.summary.timestamp).toLocaleString('fr-FR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 font-semibold">Problèmes Critiques</div>
                <div className="text-2xl font-bold text-red-600">{analysis.summary.criticalIssues}</div>
                <div className="text-red-600 text-sm">Intervention immédiate requise</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 font-semibold">Corrections Automatiques</div>
                <div className="text-2xl font-bold text-yellow-600">{analysis.summary.autoFixable}</div>
                <div className="text-yellow-600 text-sm">Peuvent être corrigées automatiquement</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 font-semibold">Total Duplications</div>
                <div className="text-2xl font-bold text-blue-600">{analysis.summary.totalDuplicates}</div>
                <div className="text-blue-600 text-sm">Détectées sur la plateforme</div>
              </div>
            </div>
            
            {/* Barre de progression de santé */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Santé du Système</span>
                <span>{Math.max(0, 100 - (analysis.summary.totalDuplicates * 5))}%</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (analysis.summary.totalDuplicates * 5))} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Détails par catégorie */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Emails dupliqués</span>
                  <Badge variant={analysis.users.details.emailDuplicates > 0 ? "destructive" : "default"}>
                    {analysis.users.details.emailDuplicates}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Noms d'utilisateur dupliqués</span>
                  <Badge variant="secondary">{analysis.users.details.usernameDuplicates}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Téléphones dupliqués</span>
                  <Badge variant="secondary">{analysis.users.details.phoneDuplicates}</Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Critiques:</strong> {analysis.users.critical} | 
                  <strong> Auto-fixables:</strong> {analysis.users.autoFixable}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Écoles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <School className="w-5 h-5" />
                Écoles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Noms dupliqués</span>
                  <Badge variant="secondary">{analysis.schools.details.nameDuplicates}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Codes dupliqués</span>
                  <Badge variant={analysis.schools.details.codeDuplicates > 0 ? "destructive" : "default"}>
                    {analysis.schools.details.codeDuplicates}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Critiques:</strong> {analysis.schools.critical} | 
                  <strong> Auto-fixables:</strong> {analysis.schools.autoFixable}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5" />
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Classes dupliquées</span>
                  <Badge variant={analysis.classes.details.classDuplicates > 0 ? "destructive" : "default"}>
                    {analysis.classes.details.classDuplicates}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Critiques:</strong> {analysis.classes.critical} | 
                  <strong> Intervention manuelle requise</strong>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Élèves */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5" />
                Élèves
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Emails dupliqués</span>
                  <Badge variant={analysis.students.details.emailDuplicates > 0 ? "destructive" : "default"}>
                    {analysis.students.details.emailDuplicates}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Numéros dupliqués</span>
                  <Badge variant={analysis.students.details.rollNumberDuplicates > 0 ? "destructive" : "default"}>
                    {analysis.students.details.rollNumberDuplicates}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Critiques:</strong> {analysis.students.critical}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Enseignants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="w-5 h-5" />
                Enseignants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Multi-écoles</span>
                  <Badge variant="secondary">{analysis.teachers.details.multiSchoolTeachers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Matricules dupliqués</span>
                  <Badge variant={analysis.teachers.details.employeeIdDuplicates > 0 ? "destructive" : "default"}>
                    {analysis.teachers.details.employeeIdDuplicates}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Critiques:</strong> {analysis.teachers.critical} | 
                  <strong> Auto-fixables:</strong> {analysis.teachers.autoFixable}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Statut des systèmes */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                <Shield className="w-5 h-5" />
                Systèmes de Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Middleware d'idempotence actif</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Verrous de concurrence opérationnels</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Hooks anti-double-clic déployés</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Validation formulaires active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* État initial */}
      {!analysis && !loadingAnalysis && (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Contrôle des Duplications
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Cliquez sur "Analyser les Duplications" pour démarrer un scan complet 
              de la plateforme et détecter toutes les duplications.
            </p>
            <Button onClick={handleStartAnalysis} disabled={submitting}>
              Démarrer l'Analyse
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}