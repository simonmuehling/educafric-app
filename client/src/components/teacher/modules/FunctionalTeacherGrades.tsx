import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, Award, AlertTriangle,
  Plus, Filter, Download, Search,
  Eye, Edit, BookOpen, Users
} from 'lucide-react';

interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  subjectName: string;
  className: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  gradedAt: string;
  comments: string;
}

const FunctionalTeacherGrades: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    subjectId: '',
    grade: '',
    maxGrade: '20',
    total: '20',
    assignment: '',
    type: 'homework',
    comment: ''
  });

  // Fetch teacher grades data from PostgreSQL API
  const { data: grades = [], isLoading } = useQuery<Grade[]>({
    queryKey: ['/api/teacher/grades'],
    enabled: !!user
  });

  // Safe grades array handling to prevent runtime errors
  const safeGrades = Array.isArray(grades) ? grades : [];

  // Add grade mutation
  const addGradeMutation = useMutation({
    mutationFn: async (gradeData: any) => {
      const response = await fetch('/api/teacher/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to add grade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/grades'] });
      setIsAddGradeOpen(false);
      setGradeForm({ studentId: '', subjectId: '', grade: '', maxGrade: '20', total: '20', assignment: '', type: 'homework', comment: '' });
      toast({
        title: 'Note ajoutée',
        description: 'La note a été ajoutée avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la note.',
        variant: 'destructive'
      });
    }
  });

  const handleAddGrade = () => {
    if (gradeForm.studentId && gradeForm.subjectId && gradeForm.grade && gradeForm.assignment) {
      addGradeMutation.mutate({
        studentId: parseInt(gradeForm.studentId),
        subjectId: parseInt(gradeForm.subjectId),
        grade: parseFloat(gradeForm.grade),
        maxGrade: parseFloat(gradeForm.maxGrade),
        assignment: gradeForm.assignment,
        type: gradeForm.type,
        comment: gradeForm.comment
      });
    }
  };

  const text = {
    fr: {
      title: 'Gestion des Notes',
      subtitle: 'Suivez et gérez les évaluations de tous vos élèves',
      loading: 'Chargement des notes...',
      noData: 'Aucune note enregistrée',
      stats: {
        totalGrades: 'Notes Totales',
        avgGrade: 'Moyenne Générale',
        excellent: 'Excellents',
        needsHelp: 'Aide Requise'
      },
      performance: {
        excellent: 'Excellent (≥16)',
        good: 'Bien (14-15)',
        average: 'Moyen (12-13)',
        poor: 'Faible (<12)'
      },
      actions: {
        addGrade: 'Ajouter Note',
        generateReport: 'Générer Bulletin',
        export: 'Exporter',
        viewAnalysis: 'Analyser'
      },
      filters: {
        all: 'Toutes',
        subject: 'Matière',
        class: 'Classe',
        recent: 'Récentes'
      },
      table: {
        student: 'Élève',
        subject: 'Matière',
        class: 'Classe',
        grade: 'Note',
        percentage: 'Pourcentage',
        date: 'Date',
        comments: 'Commentaires',
        actions: 'Actions'
      }
    },
    en: {
      title: 'Grade Management',
      subtitle: 'Track and manage all your students evaluations',
      loading: 'Loading grades...',
      noData: 'No grades recorded',
      stats: {
        totalGrades: 'Total Grades',
        avgGrade: 'Average Grade',
        excellent: 'Excellent',
        needsHelp: 'Need Help'
      },
      performance: {
        excellent: 'Excellent (≥16)',
        good: 'Good (14-15)',
        average: 'Average (12-13)',
        poor: 'Poor (<12)'
      },
      actions: {
        addGrade: 'Add Grade',
        generateReport: 'Generate Report',
        export: 'Export',
        viewAnalysis: 'View Analysis'
      },
      filters: {
        all: 'All',
        subject: 'Subject',
        class: 'Class',
        recent: 'Recent'
      },
      table: {
        student: 'Student',
        subject: 'Subject',
        class: 'Class',
        grade: 'Grade',
        percentage: 'Percentage',
        date: 'Date',
        comments: 'Comments',
        actions: 'Actions'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Calculate statistics using safe grades
  const totalGrades = safeGrades.length;
  const avgGrade = safeGrades.length > 0 ? (safeGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / safeGrades.length).toFixed(1) : '0';
  const excellentCount = safeGrades.filter(g => (g.grade || 0) >= 16).length;
  const needsHelpCount = safeGrades.filter(g => (g.grade || 0) < 12).length;

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600 bg-green-100';
    if (grade >= 14) return 'text-blue-600 bg-blue-100';
    if (grade >= 12) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (percentage >= 70) return <Badge className="bg-blue-100 text-blue-800">Bien</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-100 text-orange-800">Moyen</Badge>;
    return <Badge className="bg-red-100 text-red-800">Faible</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.addGrade}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalGrades}</p>
                <p className="text-2xl font-bold">{totalGrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.avgGrade}</p>
                <p className="text-2xl font-bold text-green-600">{avgGrade}/20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.excellent}</p>
                <p className="text-2xl font-bold text-yellow-600">{excellentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.needsHelp}</p>
                <p className="text-2xl font-bold text-red-600">{needsHelpCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Répartition des Performances</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(Array.isArray(grades) ? grades : []).filter(g => g.percentage >= 80).length}
              </div>
              <div className="text-sm text-green-700">{t?.performance?.excellent}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(Array.isArray(grades) ? grades : []).filter(g => g.percentage >= 70 && g.percentage < 80).length}
              </div>
              <div className="text-sm text-blue-700">{t?.performance?.good}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(Array.isArray(grades) ? grades : []).filter(g => g.percentage >= 60 && g.percentage < 70).length}
              </div>
              <div className="text-sm text-orange-700">{t?.performance?.average}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {(Array.isArray(grades) ? grades : []).filter(g => g.percentage < 60).length}
              </div>
              <div className="text-sm text-red-700">{t?.performance?.poor}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ajouter Note Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <Plus className="w-5 h-5 mr-2 inline" />
              Ajouter une Note
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button 
              className="bg-green-600 hover:bg-green-700 flex-1 mr-4" 
              data-testid="button-add-grade"
              onClick={() => setIsAddGradeOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Note
            </Button>
            <div className="text-sm text-gray-500">
              Total: {grades.length} notes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Grade Modal */}
      {isAddGradeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter une Note</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Élève ID</label>
                <input
                  type="text"
                  value={gradeForm.studentId}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, studentId: e.target.value }))}
                  placeholder="ID de l'élève"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Matière ID</label>
                <input
                  type="text"
                  value={gradeForm.subjectId}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  placeholder="ID de la matière"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Note</label>
                  <input
                    type="number"
                    step="0.5"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="Ex: 15.5"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total</label>
                  <input
                    type="number"
                    value={gradeForm.maxGrade}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, maxGrade: e.target.value }))}
                    placeholder="Ex: 20"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Évaluation</label>
                <input
                  type="text"
                  value={gradeForm.assignment}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, assignment: e.target.value }))}
                  placeholder="Ex: Devoir de mathématiques"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={gradeForm.type}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="exam">Examen</option>
                  <option value="homework">Devoir maison</option>
                  <option value="quiz">Interrogation</option>
                  <option value="participation">Participation</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Commentaire</label>
                <textarea
                  value={gradeForm.comment}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Commentaire sur la note..."
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddGrade}
                  disabled={addGradeMutation.isPending || !gradeForm.studentId || !gradeForm.grade || !gradeForm.assignment}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {addGradeMutation.isPending ? 'Ajout...' : 'Ajouter la Note'}
                </Button>
                <Button 
                  onClick={() => setIsAddGradeOpen(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grades List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notes Récentes</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="math">Mathématiques</option>
                  <option value="french">Français</option>
                  <option value="science">Sciences</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="6A">6ème A</option>
                  <option value="6B">6ème B</option>
                  <option value="5A">5ème A</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (Array.isArray(grades) ? grades.length : 0) === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par ajouter des notes pour vos élèves.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grades.map((grade) => (
                <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{grade.studentName}</div>
                        <div className="text-sm text-gray-500">- {grade.className}</div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">{grade.subjectName}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {grade.grade}/{grade.maxGrade} ({grade.percentage}%)
                        </span>
                      </div>
                      {grade.comments && (
                        <div className="text-sm text-gray-500 mt-1">{grade.comments}</div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(grade.gradedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalTeacherGrades;