import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  BookOpen, Calculator, User, Save, 
  Eye, FileText, Clock, CheckCircle2,
  AlertCircle, GraduationCap
} from 'lucide-react';

interface Subject {
  id: number;
  nameFr: string;
  nameEn: string;
  code: string;
  coefficient: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  classId: number;
}

interface GradeInput {
  subjectId: number;
  studentId: number;
  grade: number;
  coefficient: number;
  comment: string;
  assignments?: any[];
  participation?: number;
  homework?: number;
  tests?: number;
}

const BulletinGradeInput = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState('trimestre1');
  const [grades, setGrades] = useState<Record<string, GradeInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const text = {
    fr: {
      title: 'Saisie des Notes - Bulletins',
      subtitle: 'Saisie des notes par matière pour la création des bulletins',
      selectClass: 'Sélectionner une classe',
      selectTerm: 'Période',
      trimestre1: 'Trimestre 1',
      trimestre2: 'Trimestre 2', 
      trimestre3: 'Trimestre 3',
      semestre1: 'Semestre 1',
      semestre2: 'Semestre 2',
      students: 'Élèves',
      subjects: 'Matières',
      grade: 'Note',
      coefficient: 'Coefficient',
      comment: 'Commentaire',
      participation: 'Participation',
      homework: 'Devoirs',
      tests: 'Tests',
      saveGrades: 'Enregistrer Notes',
      submitForApproval: 'Soumettre pour Validation',
      gradeRange: '/20',
      invalidGrade: 'Note invalide (0-20)',
      gradesSaved: 'Notes enregistrées',
      gradesSubmitted: 'Notes soumises pour validation',
      error: 'Erreur',
      loading: 'Chargement...',
      noStudents: 'Aucun élève trouvé',
      noSubjects: 'Aucune matière assignée',
      status: 'Statut',
      draft: 'Brouillon',
      submitted: 'Soumis',
      approved: 'Approuvé',
      totalPoints: 'Points Total',
      average: 'Moyenne',
      preview: 'Aperçu',
      teacherNotes: 'Notes Enseignant'
    },
    en: {
      title: 'Grade Input - Report Cards',
      subtitle: 'Grade input by subject for report card creation',
      selectClass: 'Select a class',
      selectTerm: 'Term',
      trimestre1: 'Quarter 1',
      trimestre2: 'Quarter 2',
      trimestre3: 'Quarter 3', 
      semestre1: 'Semester 1',
      semestre2: 'Semester 2',
      students: 'Students',
      subjects: 'Subjects',
      grade: 'Grade',
      coefficient: 'Coefficient',
      comment: 'Comment',
      participation: 'Participation',
      homework: 'Homework',
      tests: 'Tests',
      saveGrades: 'Save Grades',
      submitForApproval: 'Submit for Approval',
      gradeRange: '/20',
      invalidGrade: 'Invalid grade (0-20)',
      gradesSaved: 'Grades saved',
      gradesSubmitted: 'Grades submitted for approval',
      error: 'Error',
      loading: 'Loading...',
      noStudents: 'No students found',
      noSubjects: 'No subjects assigned',
      status: 'Status',
      draft: 'Draft',
      submitted: 'Submitted',
      approved: 'Approved',
      totalPoints: 'Total Points',
      average: 'Average',
      preview: 'Preview',
      teacherNotes: 'Teacher Notes'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch teacher's classes
  const { data: classes = [] } = useQuery({
    queryKey: ['/api/teacher/classes'],
    enabled: !!user?.id,
  });

  // Fetch students for selected class
  const { data: students = [] } = useQuery({
    queryKey: ['/api/teacher/students', selectedClass],
    enabled: !!selectedClass,
  });

  // Fetch subjects taught by teacher
  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/teacher/subjects'],
    enabled: !!user?.id,
  });

  // Fetch existing grades for the term
  const { data: existingGrades = [] } = useQuery({
    queryKey: ['/api/teacher/bulletin-grades', selectedClass, selectedTerm],
    enabled: !!selectedClass && !!selectedTerm,
  });

  useEffect(() => {
    if (Array.isArray(existingGrades) && (Array.isArray(existingGrades) ? existingGrades.length : 0) > 0) {
      const gradeMap: Record<string, GradeInput> = {};
      (existingGrades as any[]).forEach((grade: any) => {
        const key = `${grade.studentId}-${grade.subjectId}`;
        gradeMap[key] = {
          subjectId: grade.subjectId,
          studentId: grade.studentId,
          grade: grade.grade,
          coefficient: grade.coefficient,
          comment: grade.teacherComment || '',
          participation: grade.participation,
          homework: grade.homework,
          tests: grade.tests,
          assignments: grade.assignments
        };
      });
      setGrades(gradeMap);
    }
  }, [existingGrades]);

  const updateGrade = (studentId: number, subjectId: number, field: string, value: any) => {
    const key = `${studentId}-${subjectId}`;
    setGrades(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        studentId,
        subjectId,
        coefficient: Array.isArray(subjects) ? (subjects as Subject[]).find((s: Subject) => s.id === subjectId)?.coefficient || 1 : 1,
        [field]: value
      }
    }));
  };

  const validateGrade = (grade: number) => {
    return grade >= 0 && grade <= 20;
  };

  const calculateAverage = (studentId: number) => {
    const studentGrades = Object.values(grades).filter(g => g.studentId === studentId);
    if ((Array.isArray(studentGrades) ? studentGrades.length : 0) === 0) return 0;

    const totalPoints = (Array.isArray(studentGrades) ? studentGrades : []).reduce((sum, g) => sum + (g.grade * g.coefficient), 0);
    const totalCoefficients = (Array.isArray(studentGrades) ? studentGrades : []).reduce((sum, g) => sum + g.coefficient, 0);
    
    return totalCoefficients > 0 ? (totalPoints / totalCoefficients).toFixed(2) : 0;
  };

  const saveGradesMutation = useMutation({
    mutationFn: (gradeData: any) => apiRequest('POST', '/api/teacher/bulletin-grades', gradeData),
    onSuccess: () => {
      toast({
        title: t.gradesSaved,
        description: language === 'fr' ? 'Les notes ont été enregistrées avec succès.' : 'Grades have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/bulletin-grades'] });
    },
    onError: (error) => {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Erreur lors de l\'enregistrement des notes.' : 'Error saving grades.',
        variant: 'destructive',
      });
    }
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: (submissionData: any) => apiRequest('POST', '/api/teacher/submit-bulletin-grades', submissionData),
    onSuccess: () => {
      toast({
        title: t.gradesSubmitted,
        description: language === 'fr' ? 'Les notes ont été soumises pour validation.' : 'Grades have been submitted for approval.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/bulletin-grades'] });
    },
    onError: (error) => {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Erreur lors de la soumission.' : 'Error submitting grades.',
        variant: 'destructive',
      });
    }
  });

  const handleSaveGrades = async () => {
    setIsSubmitting(true);
    try {
      const gradeEntries = Object.values(grades).map(grade => ({
        ...grade,
        classId: selectedClass,
        termId: selectedTerm,
        teacherId: user?.id,
        status: 'draft'
      }));

      await saveGradesMutation.mutateAsync({
        grades: gradeEntries,
        classId: selectedClass,
        termId: selectedTerm
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      const gradeEntries = Object.values(grades).map(grade => ({
        ...grade,
        classId: selectedClass,
        termId: selectedTerm,
        teacherId: user?.id,
        status: 'submitted'
      }));

      await submitForApprovalMutation.mutateAsync({
        grades: gradeEntries,
        classId: selectedClass,
        termId: selectedTerm
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.title || ''}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Sélecteurs */}
      <ModernCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="class-select">{t.selectClass}</Label>
            <select
              id="class-select"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(Number(e?.target?.value) || null)}
            >
              <option value="">{t.selectClass}</option>
              {Array.isArray(classes) && (classes as any[]).map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name || ''} - {cls.level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="term-select">{t.selectTerm}</Label>
            <select
              id="term-select"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e?.target?.value)}
            >
              <option value="trimestre1">{t.trimestre1}</option>
              <option value="trimestre2">{t.trimestre2}</option>
              <option value="trimestre3">{t.trimestre3}</option>
              <option value="semestre1">{t.semestre1}</option>
              <option value="semestre2">{t.semestre2}</option>
            </select>
          </div>
        </div>
      </ModernCard>

      {/* Saisie des notes */}
      {selectedClass && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">{t.students}</h3>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveGrades}
                disabled={isSubmitting}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveGrades}
              </Button>
              <Button 
                onClick={handleSubmitForApproval}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t.submitForApproval}
              </Button>
            </div>
          </div>

          {!Array.isArray(students) || (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t.noStudents}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.isArray(students) && (students as Student[]).map((student: Student) => (
                <div key={student.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-lg">
                        {student.firstName || ''} {student.lastName || ''}
                      </h4>
                      <Badge variant="secondary">{student.className}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{t.average}</div>
                      <div className="text-xl font-bold text-blue-600">
                        {calculateAverage(student.id)}{t.gradeRange}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {Array.isArray(subjects) && (subjects as Subject[]).map((subject: Subject) => {
                      const key = `${student.id}-${subject.id}`;
                      const gradeData = grades[key] || {};
                      const gradeValue = gradeData.grade || '';
                      
                      return (
                        <div key={subject.id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center gap-3 mb-3">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">
                              {language === 'fr' ? subject.nameFr : subject.nameEn}
                            </span>
                            <Badge variant="outline">
                              {t.coefficient}: {subject.coefficient}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`grade-${key}`}>{t.grade}{t.gradeRange}</Label>
                              <Input
                                id={`grade-${key}`}
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={gradeValue}
                                onChange={(e) => updateGrade(student.id, subject.id, 'grade', Number(e?.target?.value))}
                                className={!validateGrade(Number(gradeValue)) && gradeValue !== '' ? 'border-red-500' : ''}
                                placeholder="0.00"
                              />
                              {!validateGrade(Number(gradeValue)) && gradeValue !== '' && (
                                <p className="text-red-500 text-sm mt-1">{t.invalidGrade}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor={`participation-${key}`}>{t.participation}</Label>
                              <Input
                                id={`participation-${key}`}
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={gradeData.participation || ''}
                                onChange={(e) => updateGrade(student.id, subject.id, 'participation', Number(e?.target?.value))}
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`homework-${key}`}>{t.homework}</Label>
                              <Input
                                id={`homework-${key}`}
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={gradeData.homework || ''}
                                onChange={(e) => updateGrade(student.id, subject.id, 'homework', Number(e?.target?.value))}
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`tests-${key}`}>{t.tests}</Label>
                              <Input
                                id={`tests-${key}`}
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={gradeData.tests || ''}
                                onChange={(e) => updateGrade(student.id, subject.id, 'tests', Number(e?.target?.value))}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <Label htmlFor={`comment-${key}`}>{t.comment}</Label>
                            <Textarea
                              id={`comment-${key}`}
                              value={gradeData.comment || ''}
                              onChange={(e) => updateGrade(student.id, subject.id, 'comment', e?.target?.value)}
                              placeholder={language === 'fr' ? 'Commentaire sur les performances...' : 'Comment on performance...'}
                              rows={2}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCard>
      )}
    </div>
  );
};

export default BulletinGradeInput;