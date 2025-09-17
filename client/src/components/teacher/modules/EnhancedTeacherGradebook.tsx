import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Grid, Users, BookOpen, Save, Send, AlertTriangle, CheckCircle2,
  Eye, Edit3, Copy, Undo2, Redo2, Download, Upload, Clock,
  Calculator, TrendingUp, Award, Filter, RefreshCw, Wifi, WifiOff,
  UserCheck, UserX, Activity, Bell, AlertCircle, Info,
  Zap, Clock3, CheckSquare, XSquare, RotateCcw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

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
  status: 'draft' | 'submitted' | 'approved' | 'returned';
  createdAt?: string;
  updatedAt?: string;
}

interface GradebookCell {
  studentId: number;
  subjectId: number;
  grade: number | null;
  status: 'empty' | 'draft' | 'submitted' | 'approved' | 'returned';
  hasChanges: boolean;
  isConflicted?: boolean;
  lastModifiedBy?: string;
}

interface ConnectedUser {
  userId: number;
  userName: string;
  userRole: string;
  currentModule?: string;
  workingOn?: {
    type: string;
    id: number;
    description: string;
  };
}

const EnhancedTeacherGradebook: React.FC = () => {
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
  const [conflictedCells, setConflictedCells] = useState<Set<string>>(new Set());

  // Real-time integration
  const {
    isConnected,
    isConnecting,
    hasError,
    connectedUsers,
    notifyActivity,
    notifyGradeSubmissionStart,
    notifyGradeSubmissionEnd,
    connect,
    disconnect
  } = useRealTimeUpdates({
    onGradeStatusUpdate: handleGradeStatusUpdate,
    onConflictAlert: handleConflictAlert,
    onUserPresenceUpdate: handleUserPresenceUpdate,
    enableToasts: true
  });

  // Filter connected users working on grades
  const gradingUsers = useMemo(() => {
    return connectedUsers.filter((user: ConnectedUser) => 
      user.currentModule === 'gradebook' || 
      user.workingOn?.type === 'GRADE_ENTRY'
    );
  }, [connectedUsers]);

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

  // Fetch existing grade entries with real-time updates
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
    enabled: !!selectedClassId && subjects.length > 0,
    refetchInterval: isConnected ? false : 30000 // Only auto-refresh if not connected to real-time
  });

  // Real-time event handlers
  function handleGradeStatusUpdate(payload: any) {
    const { submissionId, studentId, subjectId, oldStatus, newStatus } = payload;
    
    // Update local state
    const cellKey = `${studentId}-${subjectId}`;
    setGradebookData(prev => {
      const newData = new Map(prev);
      const cell = newData.get(cellKey);
      if (cell) {
        newData.set(cellKey, {
          ...cell,
          status: newStatus as any,
          hasChanges: false
        });
      }
      return newData;
    });

    // Show status update notification
    toast({
      title: language === 'fr' ? 'Statut mis à jour' : 'Status updated',
      description: language === 'fr' 
        ? `Note ${oldStatus} → ${newStatus}` 
        : `Grade ${oldStatus} → ${newStatus}`,
      variant: newStatus === 'approved' ? 'default' : newStatus === 'returned' ? 'destructive' : 'default'
    });
  }

  function handleConflictAlert(payload: any) {
    const { resourceId, conflictingUserName, message } = payload;
    
    // Mark conflicted cells
    setConflictedCells(prev => new Set([...prev, `conflict-${resourceId}`]));
    
    toast({
      title: language === 'fr' ? 'Conflit détecté' : 'Conflict detected',
      description: message,
      variant: 'destructive'
    });
  }

  function handleUserPresenceUpdate(payload: any) {
    // This is handled by the hook itself, but we can add specific logic here
    console.log('User presence update:', payload);
  }

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
          status: existingGrade ? (existingGrade.status || 'draft') : 'empty',
          hasChanges: false,
          isConflicted: conflictedCells.has(cellKey)
        });
      });
    });

    setGradebookData(newGradebookData);
  }, [students, subjects, existingGrades, conflictedCells]);

  // Notify activity when module loads
  useEffect(() => {
    if (selectedClassId) {
      notifyActivity('gradebook', {
        type: 'GRADE_ENTRY',
        id: selectedClassId,
        description: `Working on class ${selectedClassId} grades`
      });
    }
  }, [selectedClassId, notifyActivity]);

  // Save grade entries mutation with real-time integration
  const saveGradesMutation = useMutation({
    mutationFn: async (gradeEntries: GradeEntry[]) => {
      // Notify start of grade submission
      gradeEntries.forEach(entry => {
        if (entry.id) {
          notifyGradeSubmissionStart(entry.id);
        }
      });

      const response = await fetch('/api/teacher/grade-entries/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ grades: gradeEntries })
      });
      if (!response.ok) throw new Error('Failed to save grades');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: language === 'fr' ? 'Notes sauvegardées' : 'Grades saved',
        description: language === 'fr' ? 'Les notes ont été sauvegardées avec succès' : 'Grades have been saved successfully'
      });
      
      // Notify end of grade submission
      data.savedGrades?.forEach((grade: any) => {
        if (grade.id) {
          notifyGradeSubmissionEnd(grade.id);
        }
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

  // Submit grades mutation with real-time integration
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

  // Cell update handler with undo/redo support and conflict detection
  const updateCell = useCallback((studentId: number, subjectId: number, grade: number | null) => {
    const cellKey = `${studentId}-${subjectId}`;
    
    // Check for conflicts
    if (conflictedCells.has(cellKey)) {
      toast({
        title: language === 'fr' ? 'Conflit' : 'Conflict',
        description: language === 'fr' ? 'Un autre utilisateur modifie cette note' : 'Another user is editing this grade',
        variant: 'destructive'
      });
      return;
    }
    
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
  }, [gradebookData, conflictedCells, language, toast]);

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
          coefficient: 1,
          examType: 'evaluation',
          status: 'draft'
        });
      }
    });

    if (draftGrades.length > 0) {
      saveGradesMutation.mutate(draftGrades);
    }
  };

  // Submit grades for review
  const handleSubmitGrades = async (subjectId: number) => {
    submitGradesMutation.mutate({
      classId: selectedClassId!,
      subjectId,
      term: selectedTerm
    });
  };

  // Get status color for cell
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 border-yellow-300';
      case 'submitted': return 'bg-blue-100 border-blue-300';
      case 'approved': return 'bg-green-100 border-green-300';
      case 'returned': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-3 h-3 text-yellow-600" />;
      case 'submitted': return <Clock3 className="w-3 h-3 text-blue-600" />;
      case 'approved': return <CheckSquare className="w-3 h-3 text-green-600" />;
      case 'returned': return <XSquare className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  // Render connection status indicator
  const renderConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">
            {language === 'fr' ? 'Temps réel activé' : 'Real-time enabled'}
          </span>
        </>
      ) : isConnecting ? (
        <>
          <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
          <span className="text-sm text-yellow-600">
            {language === 'fr' ? 'Connexion...' : 'Connecting...'}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">
            {language === 'fr' ? 'Hors ligne' : 'Offline'}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={connect}
            className="ml-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {language === 'fr' ? 'Reconnecter' : 'Reconnect'}
          </Button>
        </>
      )}
    </div>
  );

  // Render active users
  const renderActiveUsers = () => {
    if (gradingUsers.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {language === 'fr' ? 'Utilisateurs actifs' : 'Active users'}
            </span>
            <Badge variant="secondary">{gradingUsers.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {gradingUsers.map((user: ConnectedUser) => (
              <TooltipProvider key={user.userId}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>{user.userName}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.userRole} - {user.currentModule}</p>
                    {user.workingOn && (
                      <p className="text-xs text-gray-500">{user.workingOn.description}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="enhanced-teacher-gradebook">
      {/* Header with real-time status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'fr' ? 'Carnet de Notes Collaboratif' : 'Collaborative Gradebook'}
          </h2>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Saisie de notes en temps réel avec suivi des statuts' 
              : 'Real-time grade entry with status tracking'}
          </p>
        </div>
        {renderConnectionStatus()}
      </div>

      {/* Real-time notifications */}
      {hasError && (
        <Alert variant="destructive" data-testid="connection-error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{language === 'fr' ? 'Erreur de connexion' : 'Connection error'}</AlertTitle>
          <AlertDescription>
            {language === 'fr' 
              ? 'Impossible de se connecter au service temps réel. Certaines fonctionnalités peuvent être limitées.' 
              : 'Unable to connect to real-time service. Some features may be limited.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Active users */}
      {renderActiveUsers()}

      {/* Class and term selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="class-select">
                {language === 'fr' ? 'Classe' : 'Class'}
              </Label>
              <Select value={selectedClassId?.toString() || ""} onValueChange={(value) => setSelectedClassId(parseInt(value))}>
                <SelectTrigger data-testid="select-class">
                  <SelectValue placeholder={language === 'fr' ? "Sélectionner une classe" : "Select a class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="term-select">
                {language === 'fr' ? 'Trimestre' : 'Term'}
              </Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger data-testid="select-term">
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
        </CardHeader>
      </Card>

      {/* Action buttons */}
      {selectedClassId && (
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              onClick={handleUndo} 
              disabled={undoStack.length === 0}
              variant="outline"
              data-testid="button-undo"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Annuler' : 'Undo'}
            </Button>
            <Button 
              onClick={handleRedo} 
              disabled={redoStack.length === 0}
              variant="outline"
              data-testid="button-redo"
            >
              <Redo2 className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Refaire' : 'Redo'}
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveDrafts}
              disabled={saveGradesMutation.isPending}
              variant="outline"
              data-testid="button-save-drafts"
            >
              <Save className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Sauvegarder' : 'Save Drafts'}
            </Button>
          </div>
        </div>
      )}

      {/* Gradebook table */}
      {selectedClassId && students.length > 0 && subjects.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="gradebook-table">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">
                      {language === 'fr' ? 'Élève' : 'Student'}
                    </th>
                    {subjects.map((subject: Subject) => (
                      <th key={subject.id} className="text-center p-3 font-medium min-w-[120px]">
                        <div className="space-y-1">
                          <div>{subject.name}</div>
                          <div className="text-xs text-gray-500">Coef. {subject.coefficient}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubmitGrades(subject.id)}
                            disabled={submitGradesMutation.isPending}
                            data-testid={`button-submit-${subject.id}`}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {language === 'fr' ? 'Soumettre' : 'Submit'}
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: Student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        <div>
                          <div>{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-gray-500">{student.matricule}</div>
                        </div>
                      </td>
                      {subjects.map((subject: Subject) => {
                        const cellKey = `${student.id}-${subject.id}`;
                        const cell = gradebookData.get(cellKey);
                        const isEditing = editingCell?.studentId === student.id && editingCell?.subjectId === subject.id;
                        const isConflicted = cell?.isConflicted || conflictedCells.has(cellKey);

                        return (
                          <td key={subject.id} className="p-1">
                            <div className={`
                              relative p-2 rounded border-2 min-h-[60px] flex flex-col items-center justify-center
                              ${getStatusColor(cell?.status || 'empty')}
                              ${isConflicted ? 'border-red-500 bg-red-50' : ''}
                              ${cell?.hasChanges ? 'ring-2 ring-blue-200' : ''}
                            `}>
                              {isConflicted && (
                                <AlertTriangle className="absolute top-1 right-1 w-3 h-3 text-red-500" />
                              )}
                              
                              {getStatusIcon(cell?.status || 'empty') && (
                                <div className="absolute top-1 left-1">
                                  {getStatusIcon(cell?.status || 'empty')}
                                </div>
                              )}

                              {isEditing ? (
                                <Input
                                  value={gradeInput}
                                  onChange={(e) => setGradeInput(e.target.value)}
                                  onBlur={() => {
                                    const grade = validateGrade(gradeInput);
                                    updateCell(student.id, subject.id, grade);
                                    setEditingCell(null);
                                    setGradeInput('');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const grade = validateGrade(gradeInput);
                                      updateCell(student.id, subject.id, grade);
                                      setEditingCell(null);
                                      setGradeInput('');
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                      setGradeInput('');
                                    }
                                  }}
                                  className="w-full text-center text-sm"
                                  placeholder="0-20"
                                  autoFocus
                                  data-testid={`input-grade-${student.id}-${subject.id}`}
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    if (!isConflicted) {
                                      setEditingCell({ studentId: student.id, subjectId: subject.id });
                                      setGradeInput(cell?.grade?.toString() || '');
                                    }
                                  }}
                                  className="w-full h-full flex flex-col items-center justify-center hover:bg-white/50 rounded"
                                  disabled={isConflicted}
                                  data-testid={`cell-grade-${student.id}-${subject.id}`}
                                >
                                  <div className="text-lg font-semibold">
                                    {cell?.grade !== null ? cell.grade : '-'}
                                  </div>
                                  {cell?.hasChanges && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      {language === 'fr' ? 'Non sauvé' : 'Unsaved'}
                                    </div>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading states */}
      {(studentsLoading || subjectsLoading) && selectedClassId && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 animate-spin" />
            <p>{language === 'fr' ? 'Chargement des données...' : 'Loading data...'}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedClassId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'fr' ? 'Sélectionnez une classe' : 'Select a class'}
            </h3>
            <p className="text-gray-500 text-center">
              {language === 'fr' 
                ? 'Choisissez une classe pour commencer la saisie des notes' 
                : 'Choose a class to start entering grades'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTeacherGradebook;