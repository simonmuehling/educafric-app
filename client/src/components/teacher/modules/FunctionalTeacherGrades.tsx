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
    classId: '',
    grade: '',
    maxGrade: '20',
    total: '20',
    assignment: '',
    type: 'homework',
    comment: ''
  });

  // Fetch teacher classes data
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/teacher/classes'],
    enabled: !!user
  });
  const classes = classesData?.classes || [];

  // Fetch teacher subjects data
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/teacher/subjects'],
    enabled: !!user
  });
  const subjects = subjectsData?.subjects || [];

  // Fetch students data based on selected class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/teacher/students', gradeForm.classId],
    enabled: !!user && !!gradeForm.classId
  });
  const students = studentsData?.students || [];

  // Fetch teacher grades data from PostgreSQL API
  const { data: grades = [], isLoading, error } = useQuery<Grade[]>({
    queryKey: ['/api/teacher/grades'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/grades', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[TEACHER_GRADES] API request failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('[TEACHER_GRADES] Successfully fetched grades:', data?.grades?.length || 0);
      
      // Return the grades array from the response
      if (data.success && Array.isArray(data.grades)) {
        return data.grades;
      } else {
        console.error('[TEACHER_GRADES] Invalid response format:', data);
        throw new Error(t.apiError);
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Safe grades array handling to prevent runtime errors
  const safeGrades = Array.isArray(grades) ? grades : [];

  // Add grade mutation with improved error handling
  const addGradeMutation = useMutation({
    mutationFn: async (gradeData: any) => {
      console.log('[TEACHER_GRADES] Submitting grade data:', gradeData);
      
      const response = await fetch('/api/teacher/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[TEACHER_GRADES] Grade submission failed:', data);
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      console.log('[TEACHER_GRADES] Grade submitted successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/grades'] });
      setIsAddGradeOpen(false);
      setGradeForm({ studentId: '', subjectId: '', classId: '', grade: '', maxGrade: '20', total: '20', assignment: '', type: 'homework', comment: '' });
      toast({
        title: t.gradeAdded,
        description: data.message || t.gradeAddedDesc
      });
    },
    onError: (error: Error) => {
      console.error('[TEACHER_GRADES] Grade submission error:', error);
      toast({
        title: t.error,
        description: error.message || t.failedToAdd,
        variant: 'destructive'
      });
    }
  });

  const handleAddGrade = () => {
    if (gradeForm.studentId && gradeForm.subjectId && gradeForm.classId && gradeForm.grade && gradeForm.assignment) {
      addGradeMutation.mutate({
        studentId: parseInt(gradeForm.studentId),
        subjectId: parseInt(gradeForm.subjectId),
        classId: parseInt(gradeForm.classId),
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
      loadingError: 'Erreur de chargement',
      failedToLoad: 'Impossible de charger les notes',
      apiError: 'Format de réponse invalide du serveur',
      retry: 'Réessayer',
      gradeAdded: 'Note ajoutée',
      gradeAddedDesc: 'La note a été ajoutée avec succès.',
      error: 'Erreur',
      failedToAdd: 'Impossible d\'ajouter la note.',
      exportInProgress: 'Export en cours',
      exportDesc: 'Les notes sont en cours d\'export...',
      performanceOverview: 'Répartition des Performances',
      addGradeSection: 'Ajouter une Note',
      totalGrades: 'Total: {{count}} notes',
      recentGrades: 'Notes Récentes',
      emptyStateDesc: 'Commencez par ajouter des notes pour vos élèves.',
      adding: 'Ajout...',
      addGradeAction: 'Ajouter la Note',
      cancel: 'Annuler',
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
      badges: {
        excellent: 'Excellent',
        good: 'Bien',
        average: 'Moyen',
        poor: 'Faible'
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
      },
      form: {
        classLabel: 'Classe *',
        studentLabel: 'Élève *',
        subjectLabel: 'Matière *',
        gradeLabel: 'Note',
        totalLabel: 'Total',
        evaluationLabel: 'Évaluation',
        typeLabel: 'Type',
        commentLabel: 'Commentaire',
        selectClass: 'Sélectionner une classe',
        selectStudent: 'Sélectionner un élève',
        selectSubject: 'Sélectionner une matière',
        gradePlaceholder: 'Ex: 15.5',
        totalPlaceholder: 'Ex: 20',
        evaluationPlaceholder: 'Ex: Devoir de mathématiques',
        commentPlaceholder: 'Commentaire sur la note...',
        typeExam: 'Examen',
        typeHomework: 'Devoir maison',
        typeQuiz: 'Interrogation',
        typeParticipation: 'Participation'
      },
      subjects: {
        math: 'Mathématiques',
        french: 'Français',
        science: 'Sciences'
      },
      classes: {
        class6A: '6ème A',
        class6B: '6ème B',
        class5A: '5ème A'
      },
      units: {
        students: 'élèves',
        coeff: 'Coeff:'
      }
    },
    en: {
      title: 'Grade Management',
      subtitle: 'Track and manage all your students evaluations',
      loading: 'Loading grades...',
      noData: 'No grades recorded',
      loadingError: 'Loading Error',
      failedToLoad: 'Failed to load grades',
      apiError: 'Invalid response format from server',
      retry: 'Retry',
      gradeAdded: 'Grade Added',
      gradeAddedDesc: 'Grade added successfully.',
      error: 'Error',
      failedToAdd: 'Failed to add grade.',
      exportInProgress: 'Export in progress',
      exportDesc: 'Grades are being exported...',
      performanceOverview: 'Performance Overview',
      addGradeSection: 'Add Grade',
      totalGrades: 'Total: {{count}} grades',
      recentGrades: 'Recent Grades',
      emptyStateDesc: 'Start by adding grades for your students.',
      adding: 'Adding...',
      addGradeAction: 'Add Grade',
      cancel: 'Cancel',
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
      badges: {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        poor: 'Poor'
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
      },
      form: {
        classLabel: 'Class *',
        studentLabel: 'Student *',
        subjectLabel: 'Subject *',
        gradeLabel: 'Grade',
        totalLabel: 'Total',
        evaluationLabel: 'Evaluation',
        typeLabel: 'Type',
        commentLabel: 'Comment',
        selectClass: 'Select a class',
        selectStudent: 'Select a student',
        selectSubject: 'Select a subject',
        gradePlaceholder: 'Ex: 15.5',
        totalPlaceholder: 'Ex: 20',
        evaluationPlaceholder: 'Ex: Math homework',
        commentPlaceholder: 'Comment about the grade...',
        typeExam: 'Exam',
        typeHomework: 'Homework',
        typeQuiz: 'Quiz',
        typeParticipation: 'Participation'
      },
      subjects: {
        math: 'Mathematics',
        french: 'French',
        science: 'Science'
      },
      classes: {
        class6A: '6th Grade A',
        class6B: '6th Grade B',
        class5A: '5th Grade A'
      },
      units: {
        students: 'students',
        coeff: 'Coeff:'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t.loadingError}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {error instanceof Error ? error.message : t.failedToLoad}
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/teacher/grades'] })}
                  variant="outline"
                  className="mr-2"
                >
                  {t.retry}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Content skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics using safe grades
  const totalGrades = safeGrades.length;
  const avgGrade = safeGrades.length > 0 ? ((Array.isArray(safeGrades) ? safeGrades : []).reduce((sum, g) => sum + (g.grade || 0), 0) / safeGrades.length).toFixed(1) : '0';
  const excellentCount = (Array.isArray(safeGrades) ? safeGrades : []).filter(g => (g.grade || 0) >= 16).length;
  const needsHelpCount = (Array.isArray(safeGrades) ? safeGrades : []).filter(g => (g.grade || 0) < 12).length;

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600 bg-green-100';
    if (grade >= 14) return 'text-blue-600 bg-blue-100';
    if (grade >= 12) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">{t.badges.excellent}</Badge>;
    if (percentage >= 70) return <Badge className="bg-blue-100 text-blue-800">{t.badges.good}</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-100 text-orange-800">{t.badges.average}</Badge>;
    return <Badge className="bg-red-100 text-red-800">{t.badges.poor}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: t.exportInProgress,
                description: t.exportDesc
              });
            }}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            onClick={() => setIsAddGradeOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t?.actions?.addGrade}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          <h3 className="text-lg font-semibold">{t.performanceOverview}</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              {t.addGradeSection}
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button 
              className="bg-green-600 hover:bg-green-700 w-full sm:flex-1" 
              data-testid="button-add-grade"
              onClick={() => setIsAddGradeOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addGradeSection}
            </Button>
            <div className="text-sm text-gray-500 text-center sm:text-left">
              {t.totalGrades.replace('{{count}}', grades.length.toString())}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Grade Modal - Mobile Optimized */}
      {isAddGradeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t.addGradeSection}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.form.classLabel}</label>
                <select
                  value={gradeForm.classId}
                  onChange={(e) => {
                    setGradeForm(prev => ({ ...prev, classId: e.target.value, studentId: '' }));
                  }}
                  className="w-full border rounded-md px-3 py-2"
                  disabled={classesLoading}
                >
                  <option value="">{t.form.selectClass}</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id.toString()}>
                      {cls.name} ({cls.studentCount || 0} {t.units.students})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.form.studentLabel}</label>
                <select
                  value={gradeForm.studentId}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                  disabled={studentsLoading || !gradeForm.classId}
                >
                  <option value="">{t.form.selectStudent}</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id.toString()}>
                      {student.fullName} ({student.matricule})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.form.subjectLabel}</label>
                <select
                  value={gradeForm.subjectId}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                  disabled={subjectsLoading}
                >
                  <option value="">{t.form.selectSubject}</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id.toString()}>
                      {subject.name || subject.nameFr} ({t.units.coeff} {subject.coefficient || 1})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">{t.form.gradeLabel}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder={t.form.gradePlaceholder}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.form.totalLabel}</label>
                  <input
                    type="number"
                    value={gradeForm.maxGrade}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, maxGrade: e.target.value }))}
                    placeholder={t.form.totalPlaceholder}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t.form.evaluationLabel}</label>
                <input
                  type="text"
                  value={gradeForm.assignment}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, assignment: e.target.value }))}
                  placeholder={t.form.evaluationPlaceholder}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.form.typeLabel}</label>
                <select
                  value={gradeForm.type}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="exam">{t.form.typeExam}</option>
                  <option value="homework">{t.form.typeHomework}</option>
                  <option value="quiz">{t.form.typeQuiz}</option>
                  <option value="participation">{t.form.typeParticipation}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.form.commentLabel}</label>
                <textarea
                  value={gradeForm.comment}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder={t.form.commentPlaceholder}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  onClick={handleAddGrade}
                  disabled={addGradeMutation.isPending || !gradeForm.studentId || !gradeForm.subjectId || !gradeForm.classId || !gradeForm.grade || !gradeForm.assignment}
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                >
                  {addGradeMutation.isPending ? t.adding : t.addGradeAction}
                </Button>
                <Button 
                  onClick={() => setIsAddGradeOpen(false)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {t.cancel}
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
            <h3 className="text-lg font-semibold">{t.recentGrades}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm w-full sm:w-auto"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="math">{t.subjects.math}</option>
                  <option value="french">{t.subjects.french}</option>
                  <option value="science">{t.subjects.science}</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm w-full sm:w-auto"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="6A">{t.classes.class6A}</option>
                  <option value="6B">{t.classes.class6B}</option>
                  <option value="5A">{t.classes.class5A}</option>
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
              <p className="text-gray-600">{t.emptyStateDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(grades) ? grades : [])
                .sort((a, b) => a.studentName?.localeCompare(b.studentName, language === 'fr' ? 'fr' : 'en', {
                  sensitivity: 'base',
                  numeric: true,
                  ignorePunctuation: true
                }))
                .map((grade) => (
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