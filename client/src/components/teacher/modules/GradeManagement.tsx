import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, TrendingUp, Award, AlertTriangle,
  Plus, Filter, Download, Search, Eye, Edit, BookOpen, Users
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
  type: string;
  assignment: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
}

interface Subject {
  id: number;
  name: string;
}

const GradeManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    subjectId: '',
    grade: '',
    maxGrade: '20',
    assignment: '',
    type: 'homework',
    comment: ''
  });

  // Fetch grades from API
  const { data: gradesData = [], isLoading: gradesLoading } = useQuery<Grade[]>({
    queryKey: ['/api/teacher/grades'],
    queryFn: async () => {
      console.log('[GRADE_MANAGEMENT] 🔍 Fetching grades...');
      const response = await fetch('/api/teacher/grades', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[GRADE_MANAGEMENT] ❌ Failed to fetch grades');
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      console.log('[GRADE_MANAGEMENT] ✅ Grades loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch students from API
  const { data: studentsData = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students'],
    queryFn: async () => {
      console.log('[GRADE_MANAGEMENT] 🔍 Fetching students...');
      const response = await fetch('/api/teacher/students', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[GRADE_MANAGEMENT] ❌ Failed to fetch students');
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('[GRADE_MANAGEMENT] ✅ Students loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch subjects from API
  const { data: subjectsData = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/teacher/subjects'],
    queryFn: async () => {
      console.log('[GRADE_MANAGEMENT] 🔍 Fetching subjects...');
      const response = await fetch('/api/teacher/subjects', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[GRADE_MANAGEMENT] ❌ Failed to fetch subjects');
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      console.log('[GRADE_MANAGEMENT] ✅ Subjects loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Add grade mutation
  const addGradeMutation = useMutation({
    mutationFn: async (gradeData: any) => {
      const response = await fetch('/api/teacher/grades', {
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
      setGradeForm({ studentId: '', subjectId: '', grade: '', maxGrade: '20', assignment: '', type: 'homework', comment: '' });
      toast({
        title: language === 'fr' ? 'Note ajoutée' : 'Grade Added',
        description: language === 'fr' ? 'La note a été ajoutée avec succès.' : 'Grade has been added successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'ajouter la note.' : 'Failed to add grade.',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Gestion des Notes',
      subtitle: 'Saisissez et gérez les notes de vos élèves',
      loading: 'Chargement des notes...',
      noData: 'Aucune note enregistrée',
      searchPlaceholder: 'Rechercher un élève...',
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
        export: 'Exporter',
        viewAnalysis: 'Analyser'
      },
      filters: {
        all: 'Toutes',
        subject: 'Matière',
        class: 'Classe'
      },
      form: {
        student: 'Élève',
        subject: 'Matière',
        grade: 'Note',
        maxGrade: 'Note maximale',
        assignment: 'Évaluation',
        type: 'Type',
        comment: 'Commentaire',
        save: 'Enregistrer',
        cancel: 'Annuler'
      },
      types: {
        homework: 'Devoir',
        exam: 'Examen',
        quiz: 'Interrogation',
        participation: 'Participation'
      }
    },
    en: {
      title: 'Grade Management',
      subtitle: 'Enter and manage your students grades',
      loading: 'Loading grades...',
      noData: 'No grades recorded',
      searchPlaceholder: 'Search student...',
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
        export: 'Export',
        viewAnalysis: 'View Analysis'
      },
      filters: {
        all: 'All',
        subject: 'Subject',
        class: 'Class'
      },
      form: {
        student: 'Student',
        subject: 'Subject',
        grade: 'Grade',
        maxGrade: 'Max Grade',
        assignment: 'Assignment',
        type: 'Type',
        comment: 'Comment',
        save: 'Save',
        cancel: 'Cancel'
      },
      types: {
        homework: 'Homework',
        exam: 'Exam',
        quiz: 'Quiz',
        participation: 'Participation'
      }
    }
  };

  const t = text[language as keyof typeof text];

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

  // Filter grades
  const filteredGrades = (Array.isArray(gradesData) ? gradesData : []).filter(grade => {
    const matchesSearch = grade?.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || grade?.subjectName === selectedSubject;
    const matchesClass = selectedClass === 'all' || grade?.className === selectedClass;
    return matchesSearch && matchesSubject && matchesClass;
  });

  // Calculate statistics
  const totalGrades = (Array.isArray(gradesData) ? gradesData.length : 0);
  const avgGrade = (Array.isArray(gradesData) ? gradesData.length : 0) > 0 
    ? ((Array.isArray(gradesData) ? gradesData : []).reduce((sum, g) => sum + (g.grade || 0), 0) / (Array.isArray(gradesData) ? gradesData.length : 0)).toFixed(1)
    : '0';
  const excellentCount = (Array.isArray(gradesData) ? gradesData : []).filter(g => (g.grade || 0) >= 16).length;
  const needsHelpCount = (Array.isArray(gradesData) ? gradesData : []).filter(g => (g.grade || 0) < 12).length;

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600 bg-green-100';
    if (grade >= 14) return 'text-blue-600 bg-blue-100';
    if (grade >= 12) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (gradesLoading || studentsLoading || subjectsLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Dialog open={isAddGradeOpen} onOpenChange={setIsAddGradeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {t?.actions?.addGrade}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>{t?.actions?.addGrade}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t?.form?.student}</Label>
                  <Select value={gradeForm.studentId} onValueChange={(value) => setGradeForm(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t?.form?.student} />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(studentsData) ? studentsData : []).map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} - {student.className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t?.form?.subject}</Label>
                  <Select value={gradeForm.subjectId} onValueChange={(value) => setGradeForm(prev => ({ ...prev, subjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t?.form?.subject} />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(subjectsData) ? subjectsData : []).map(subject => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{t?.form?.grade}</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={gradeForm.grade}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e?.target?.value }))}
                      placeholder="15.5"
                    />
                  </div>
                  <div>
                    <Label>{t?.form?.maxGrade}</Label>
                    <Input
                      type="number"
                      value={gradeForm.maxGrade}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, maxGrade: e?.target?.value }))}
                      placeholder="20"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t?.form?.assignment}</Label>
                  <Input
                    value={gradeForm.assignment}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, assignment: e?.target?.value }))}
                    placeholder="Devoir de mathématiques"
                  />
                </div>
                <div>
                  <Label>{t?.form?.type}</Label>
                  <Select value={gradeForm.type} onValueChange={(value) => setGradeForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">{t?.types?.homework}</SelectItem>
                      <SelectItem value="exam">{t?.types?.exam}</SelectItem>
                      <SelectItem value="quiz">{t?.types?.quiz}</SelectItem>
                      <SelectItem value="participation">{t?.types?.participation}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t?.form?.comment}</Label>
                  <Textarea
                    value={gradeForm.comment}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, comment: e?.target?.value }))}
                    placeholder="Commentaire sur la note..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddGrade}
                    disabled={addGradeMutation.isPending || !gradeForm.studentId || !gradeForm.grade || !gradeForm.assignment}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {addGradeMutation.isPending ? 'Ajout...' : t?.form?.save}
                  </Button>
                  <Button 
                    onClick={() => setIsAddGradeOpen(false)}
                    variant="outline"
                  >
                    {t?.form?.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={t?.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t?.filters?.subject} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t?.filters?.all}</SelectItem>
                {(Array.isArray(subjectsData) ? subjectsData : []).map(subject => (
                  <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t?.filters?.class} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t?.filters?.all}</SelectItem>
                <SelectItem value="6ème A">6ème A</SelectItem>
                <SelectItem value="6ème B">6ème B</SelectItem>
                <SelectItem value="5ème A">5ème A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grades List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Notes Récentes</h3>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredGrades) ? filteredGrades.length : 0) === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par ajouter des notes pour vos élèves.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(filteredGrades) ? filteredGrades : []).map((grade) => (
                <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{grade.studentName}</div>
                        <div className="text-sm text-gray-500">- {grade.className}</div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">{grade.subjectName}</span>
                        <Badge className={`${getGradeColor(grade.grade)} px-2 py-1 rounded`}>
                          {grade.grade}/{grade.maxGrade} ({grade.percentage}%)
                        </Badge>
                        <span className="text-sm text-gray-500">{grade.assignment}</span>
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

export default GradeManagement;