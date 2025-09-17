import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Grid, Users, BookOpen, Save, Send, AlertTriangle, CheckCircle2,
  Eye, Edit3, Copy, Undo2, Redo2, Download, Upload, Clock,
  Calculator, TrendingUp, Award, Filter, RefreshCw
} from 'lucide-react';

// Types for gradebook data
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  matricule: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  coefficient: number;
}

interface GradeEntry {
  id?: number;
  studentId: number;
  subjectId: number;
  classId: number;
  term: string;
  grade: number | null;
  coefficient: number;
  examType: string;
  comments?: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt?: string;
  updatedAt?: string;
}

interface GradebookCell {
  studentId: number;
  subjectId: number;
  grade: number | null;
  status: 'empty' | 'draft' | 'submitted' | 'approved';
  hasChanges: boolean;
}

const TeacherGradebook: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('Premier Trimestre');
  const [editingCell, setEditingCell] = useState<{ studentId: number; subjectId: number } | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [gradebookData, setGradebookData] = useState<Map<string, GradebookCell>>(new Map());
  const [undoStack, setUndoStack] = useState<Map<string, GradebookCell>[]>([]);
  const [redoStack, setRedoStack] = useState<Map<string, GradebookCell>[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set());

  // Fetch teacher classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      return data.classes || [];
    },
    enabled: !!user
  });

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/teacher/students', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const response = await fetch(`/api/teacher/students?classId=${selectedClassId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      return data.students || [];
    },
    enabled: !!selectedClassId
  });

  // Fetch subjects for selected class  
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/teacher/subjects', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const response = await fetch(`/api/teacher/subjects?classId=${selectedClassId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      return data.subjects || [];
    },
    enabled: !!selectedClassId
  });

  // Fetch existing grade entries
  const { data: existingGrades = [], refetch: refetchGrades } = useQuery({
    queryKey: ['/api/teacher/grade-entries', selectedClassId, subjects.map(s => s.id), selectedTerm],
    queryFn: async () => {
      if (!selectedClassId || subjects.length === 0) return [];
      
      const gradePromises = subjects.map(async (subject) => {
        try {
          const response = await fetch(
            `/api/teacher/grade-entries?classId=${selectedClassId}&subjectId=${subject.id}&termId=${selectedTerm}`,
            {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            }
          );
          if (!response.ok) return [];
          const data = await response.json();
          return data.gradeEntries || [];
        } catch (error) {
          console.error(`Failed to fetch grades for subject ${subject.id}:`, error);
          return [];
        }
      });

      const gradeResults = await Promise.all(gradePromises);
      return gradeResults.flat();
    },
    enabled: !!selectedClassId && subjects.length > 0
  });

  // Initialize gradebook data when dependencies change
  useEffect(() => {
    if (!students.length || !subjects.length) {
      setGradebookData(new Map());
      return;
    }

    const newGradebookData = new Map<string, GradebookCell>();

    // Create cells for all student-subject combinations
    students.forEach((student: Student) => {
      subjects.forEach((subject: Subject) => {
        const cellKey = `${student.id}-${subject.id}`;
        const existingGrade = existingGrades.find(
          (grade: any) => grade.studentId === student.id && grade.subjectId === subject.id
        );

        newGradebookData.set(cellKey, {
          studentId: student.id,
          subjectId: subject.id,
          grade: existingGrade?.score || null,
          status: existingGrade ? (existingGrade.examType === 'submitted' ? 'submitted' : 'draft') : 'empty',
          hasChanges: false
        });
      });
    });

    setGradebookData(newGradebookData);
  }, [students, subjects, existingGrades]);

  // Save grade entries mutation
  const saveGradesMutation = useMutation({
    mutationFn: async (gradeEntries: GradeEntry[]) => {
      const response = await fetch('/api/teacher/grade-entries/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ grades: gradeEntries })
      });
      if (!response.ok) throw new Error('Failed to save grades');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Notes sauvegardées' : 'Grades saved',
        description: language === 'fr' ? 'Les notes ont été sauvegardées avec succès' : 'Grades have been saved successfully'
      });
      refetchGrades();
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder les notes' : 'Failed to save grades',
        variant: 'destructive'
      });
    }
  });

  // Submit grades mutation
  const submitGradesMutation = useMutation({
    mutationFn: async (submissionData: { classId: number; subjectId: number; term: string }) => {
      const response = await fetch('/api/teacher/grade-entries/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) throw new Error('Failed to submit grades');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Notes soumises' : 'Grades submitted',
        description: language === 'fr' ? 'Les notes ont été soumises pour validation' : 'Grades have been submitted for approval'
      });
      refetchGrades();
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de soumettre les notes' : 'Failed to submit grades',
        variant: 'destructive'
      });
    }
  });

  // Cell update handler with undo/redo support
  const updateCell = useCallback((studentId: number, subjectId: number, grade: number | null) => {
    const cellKey = `${studentId}-${subjectId}`;
    
    // Save current state to undo stack
    setUndoStack(prev => [...prev, new Map(gradebookData)]);
    setRedoStack([]);

    setGradebookData(prev => {
      const newData = new Map(prev);
      const currentCell = newData.get(cellKey);
      
      if (currentCell) {
        newData.set(cellKey, {
          ...currentCell,
          grade,
          status: grade !== null ? 'draft' : 'empty',
          hasChanges: true
        });
      }
      
      return newData;
    });
  }, [gradebookData]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, new Map(gradebookData)]);
    setUndoStack(prev => prev.slice(0, -1));
    setGradebookData(previousState);
  }, [undoStack, gradebookData]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, new Map(gradebookData)]);
    setRedoStack(prev => prev.slice(0, -1));
    setGradebookData(nextState);
  }, [redoStack, gradebookData]);

  // Grade validation
  const validateGrade = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const numValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numValue) || numValue < 0 || numValue > 20) return null;
    return Math.round(numValue * 2) / 2; // Round to nearest 0.5
  };

  // Save draft grades
  const handleSaveDrafts = async () => {
    const draftGrades: GradeEntry[] = [];
    
    gradebookData.forEach((cell, cellKey) => {
      if (cell.hasChanges && cell.grade !== null) {
        draftGrades.push({
          studentId: cell.studentId,
          subjectId: cell.subjectId,
          classId: selectedClassId!,
          term: selectedTerm,
          grade: cell.grade,
          coefficient: subjects.find(s => s.id === cell.subjectId)?.coefficient || 1,
          examType: 'draft',
          comments: ''
        });
      }
    });

    if (draftGrades.length > 0) {
      saveGradesMutation.mutate(draftGrades);
    }
  };

  // Submit grades for a subject
  const handleSubmitSubject = async (subjectId: number) => {
    if (!selectedClassId) return;
    
    submitGradesMutation.mutate({
      classId: selectedClassId,
      subjectId,
      term: selectedTerm
    });
  };

  // Get cell style based on status
  const getCellStyle = (cell: GradebookCell | undefined) => {
    if (!cell) return 'bg-gray-50 border-gray-200';
    
    switch (cell.status) {
      case 'empty': return 'bg-white border-gray-200 hover:bg-gray-50';
      case 'draft': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'submitted': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'approved': return 'bg-green-50 border-green-200 hover:bg-green-100';
      default: return 'bg-white border-gray-200';
    }
  };

  // Get grade color based on value
  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-400';
    if (grade >= 16) return 'text-green-600 font-semibold';
    if (grade >= 14) return 'text-blue-600 font-medium';
    if (grade >= 12) return 'text-orange-600';
    return 'text-red-600 font-medium';
  };

  // Statistics calculation
  const statistics = useMemo(() => {
    const totalCells = students.length * subjects.length;
    const filledCells = Array.from(gradebookData.values()).filter(cell => cell.grade !== null).length;
    const draftCells = Array.from(gradebookData.values()).filter(cell => cell.status === 'draft').length;
    const submittedCells = Array.from(gradebookData.values()).filter(cell => cell.status === 'submitted').length;
    
    return {
      totalCells,
      filledCells,
      draftCells,
      submittedCells,
      completionRate: totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0
    };
  }, [students.length, subjects.length, gradebookData]);

  const text = {
    fr: {
      title: 'Carnet de Notes',
      subtitle: 'Saisie et gestion des notes par matière et trimestre',
      selectClass: 'Sélectionner une classe',
      selectTerm: 'Sélectionner un trimestre',
      student: 'Élève',
      actions: {
        saveDrafts: 'Sauvegarder Brouillons',
        submit: 'Soumettre',
        export: 'Exporter',
        import: 'Importer',
        undo: 'Annuler',
        redo: 'Refaire'
      },
      stats: {
        completion: 'Complétude',
        filled: 'Cases remplies',
        drafts: 'Brouillons',
        submitted: 'Soumises'
      },
      status: {
        empty: 'Vide',
        draft: 'Brouillon',
        submitted: 'Soumise',
        approved: 'Validée'
      }
    },
    en: {
      title: 'Gradebook',
      subtitle: 'Grade entry and management by subject and term',
      selectClass: 'Select a class',
      selectTerm: 'Select a term',
      student: 'Student',
      actions: {
        saveDrafts: 'Save Drafts',
        submit: 'Submit',
        export: 'Export',
        import: 'Import',
        undo: 'Undo',
        redo: 'Redo'
      },
      stats: {
        completion: 'Completion',
        filled: 'Filled cells',
        drafts: 'Drafts',
        submitted: 'Submitted'
      },
      status: {
        empty: 'Empty',
        draft: 'Draft',
        submitted: 'Submitted',
        approved: 'Approved'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (classesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <Grid className="w-6 h-6 mr-2 text-blue-600" />
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            {t.actions.undo}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            data-testid="button-redo"
          >
            <Redo2 className="w-4 h-4 mr-1" />
            {t.actions.redo}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDrafts}
            disabled={saveGradesMutation.isPending}
            data-testid="button-save-drafts"
          >
            <Save className="w-4 h-4 mr-1" />
            {saveGradesMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              t.actions.saveDrafts
            )}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.selectClass}</label>
              <Select 
                value={selectedClassId?.toString() || ''} 
                onValueChange={(value) => setSelectedClassId(value ? parseInt(value) : null)}
                data-testid="select-class"
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} - {cls.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.selectTerm}</label>
              <Select 
                value={selectedTerm} 
                onValueChange={setSelectedTerm}
                data-testid="select-term"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premier Trimestre">Premier Trimestre</SelectItem>
                  <SelectItem value="Deuxième Trimestre">Deuxième Trimestre</SelectItem>
                  <SelectItem value="Troisième Trimestre">Troisième Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedClassId && students.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.completionRate}%</div>
                <div className="text-sm text-gray-600">{t.stats.completion}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.filledCells}</div>
                <div className="text-sm text-gray-600">{t.stats.filled}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.draftCells}</div>
                <div className="text-sm text-gray-600">{t.stats.drafts}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.submittedCells}</div>
                <div className="text-sm text-gray-600">{t.stats.submitted}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gradebook Grid */}
      {selectedClassId && students.length > 0 && subjects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Carnet de Notes - {classes.find((c: any) => c.id === selectedClassId)?.name}</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {students.length} élèves
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {subjects.length} matières
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header Row */}
                <div className="flex bg-gray-50 border-b border-gray-200">
                  <div className="w-48 p-3 font-medium text-sm text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                    {t.student}
                  </div>
                  {subjects.map((subject: Subject) => (
                    <div
                      key={subject.id}
                      className="min-w-[120px] p-3 text-center font-medium text-sm text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (selectedColumns.has(subject.id)) {
                          setSelectedColumns(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(subject.id);
                            return newSet;
                          });
                        } else {
                          setSelectedColumns(prev => new Set(prev).add(subject.id));
                        }
                      }}
                      data-testid={`header-subject-${subject.id}`}
                    >
                      <div className="flex flex-col">
                        <span className={selectedColumns.has(subject.id) ? 'text-blue-600' : ''}>
                          {subject.code}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">{subject.name}</span>
                        {selectedColumns.has(subject.id) && (
                          <Button
                            size="sm"
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs py-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubmitSubject(subject.id);
                            }}
                            disabled={submitGradesMutation.isPending}
                            data-testid={`button-submit-subject-${subject.id}`}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {t.actions.submit}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Student Rows */}
                {students.map((student: Student) => (
                  <div key={student.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                    <div 
                      className="w-48 p-3 font-medium text-sm text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10 cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        if (selectedRows.has(student.id)) {
                          setSelectedRows(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(student.id);
                            return newSet;
                          });
                        } else {
                          setSelectedRows(prev => new Set(prev).add(student.id));
                        }
                      }}
                      data-testid={`row-student-${student.id}`}
                    >
                      <div className={selectedRows.has(student.id) ? 'text-blue-600' : ''}>
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{student.matricule}</div>
                    </div>
                    {subjects.map((subject: Subject) => {
                      const cellKey = `${student.id}-${subject.id}`;
                      const cell = gradebookData.get(cellKey);
                      const isEditing = editingCell?.studentId === student.id && editingCell?.subjectId === subject.id;
                      
                      return (
                        <div
                          key={`${student.id}-${subject.id}`}
                          className={`min-w-[120px] p-0 border-r border-gray-200 ${getCellStyle(cell)}`}
                          data-testid={`cell-${student.id}-${subject.id}`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              onBlur={() => {
                                const validatedGrade = validateGrade(gradeInput);
                                updateCell(student.id, subject.id, validatedGrade);
                                setEditingCell(null);
                                setGradeInput('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const validatedGrade = validateGrade(gradeInput);
                                  updateCell(student.id, subject.id, validatedGrade);
                                  setEditingCell(null);
                                  setGradeInput('');
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                  setGradeInput('');
                                }
                              }}
                              className="w-full h-12 px-3 text-center border-none outline-none bg-transparent"
                              placeholder="0-20"
                              autoFocus
                              data-testid={`input-grade-${student.id}-${subject.id}`}
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCell({ studentId: student.id, subjectId: subject.id });
                                setGradeInput(cell?.grade?.toString() || '');
                              }}
                              className="w-full h-12 px-3 text-center hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                              data-testid={`button-edit-${student.id}-${subject.id}`}
                            >
                              <div className={`font-medium ${getGradeColor(cell?.grade || null)}`}>
                                {cell?.grade !== null ? cell.grade.toFixed(1) : '-'}
                              </div>
                              {cell?.status !== 'empty' && (
                                <div className="flex items-center justify-center mt-1">
                                  {cell.status === 'draft' && <Clock className="w-3 h-3 text-yellow-600" />}
                                  {cell.status === 'submitted' && <Send className="w-3 h-3 text-blue-600" />}
                                  {cell.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Selection State */}
      {!selectedClassId && (
        <Card>
          <CardContent className="p-8 text-center">
            <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'fr' ? 'Sélectionnez une classe' : 'Select a class'}
            </h3>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Choisissez une classe pour commencer à saisir les notes' 
                : 'Choose a class to start entering grades'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherGradebook;