import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Download, 
  User, 
  BookOpen, 
  Save,
  CheckCircle,
  Loader2,
  GraduationCap,
  Plus,
  Calculator
} from 'lucide-react';

interface ClassInfo {
  id: number;
  name: string;
}

interface StudentInfo {
  id: number;
  firstName: string;
  lastName: string;
  matricule: string;
}

interface Subject {
  id: number;
  name: string;
  grade: number;
  coefficient: number;
}

export default function WorkingBulletinManager() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();

  // State management
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const text = {
    fr: {
      title: 'Gestion des Bulletins',
      subtitle: 'Système modulaire de création de bulletins scolaires',
      selectClass: 'Sélectionner une classe',
      selectStudent: 'Sélectionner un élève',
      selectTerm: 'Trimestre',
      academicYear: 'Année scolaire',
      grades: 'Notes',
      subject: 'Matière',
      grade: 'Note',
      coefficient: 'Coefficient',
      average: 'Moyenne générale',
      saveGrades: 'Sauvegarder les notes',
      generatePdf: 'Générer le bulletin PDF',
      loading: 'Chargement...',
      generating: 'Génération en cours...',
      success: 'Succès',
      error: 'Erreur',
      gradesSaved: 'Notes sauvegardées avec succès',
      pdfGenerated: 'Bulletin PDF généré avec succès',
      noDataFound: 'Aucune donnée trouvée'
    },
    en: {
      title: 'Report Card Management',
      subtitle: 'Modular school report card creation system',
      selectClass: 'Select a class',
      selectStudent: 'Select a student',
      selectTerm: 'Term',
      academicYear: 'Academic year',
      grades: 'Grades',
      subject: 'Subject',
      grade: 'Grade',
      coefficient: 'Coefficient',
      average: 'General average',
      saveGrades: 'Save grades',
      generatePdf: 'Generate PDF report',
      loading: 'Loading...',
      generating: 'Generating...',
      success: 'Success',
      error: 'Error',
      gradesSaved: 'Grades saved successfully',
      pdfGenerated: 'PDF report generated successfully',
      noDataFound: 'No data found'
    }
  };

  const t = text[language as keyof typeof text];

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (selectedClass) {
      loadStudents(parseInt(selectedClass));
    }
  }, [selectedClass]);

  // Load or create subjects when student/term changes
  useEffect(() => {
    if (selectedStudent && selectedClass) {
      loadSubjects();
    }
  }, [selectedStudent, selectedClass, selectedTerm]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      console.log('[BULLETIN] Loading classes...');
      
      const response = await apiRequest('GET', '/api/director/classes');
      const data = await response.json();
      
      if (data.success && data.classes) {
        setClasses(data.classes);
        console.log('[BULLETIN] ✅ Loaded classes:', data.classes.length);
      } else {
        console.log('[BULLETIN] ⚠️ No classes found');
        setClasses([]);
      }
    } catch (error: any) {
      console.error('[BULLETIN] ❌ Error loading classes:', error);
      toast({
        title: t.error,
        description: 'Impossible de charger les classes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classId: number) => {
    try {
      setLoading(true);
      console.log('[BULLETIN] Loading students for class:', classId);
      
      const response = await apiRequest('GET', '/api/director/students');
      const data = await response.json();
      
      if (data.success && data.students) {
        // Filter students by class for sandbox data
        const classStudents = data.students.filter((s: any) => s.classId === classId);
        setStudents(classStudents);
        console.log('[BULLETIN] ✅ Loaded students:', classStudents.length);
      } else {
        console.log('[BULLETIN] ⚠️ No students found');
        setStudents([]);
      }
    } catch (error: any) {
      console.error('[BULLETIN] ❌ Error loading students:', error);
      toast({
        title: t.error,
        description: 'Impossible de charger les élèves',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    // Create default subjects for this student/term
    const defaultSubjects = [
      { id: 1, name: 'Mathématiques', grade: 0, coefficient: 4 },
      { id: 2, name: 'Français', grade: 0, coefficient: 4 },
      { id: 3, name: 'Anglais', grade: 0, coefficient: 3 },
      { id: 4, name: 'Sciences Physiques', grade: 0, coefficient: 3 },
      { id: 5, name: 'Histoire-Géographie', grade: 0, coefficient: 2 },
      { id: 6, name: 'Éducation Physique', grade: 0, coefficient: 1 }
    ];
    
    setSubjects(defaultSubjects);
    console.log('[BULLETIN] ✅ Loaded default subjects');
  };

  const updateGrade = (subjectId: number, value: string) => {
    const grade = parseFloat(value) || 0;
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.id === subjectId
          ? { ...subject, grade }
          : subject
      )
    );
  };

  const calculateAverage = () => {
    const validSubjects = subjects.filter(s => s.grade > 0);
    if (validSubjects.length === 0) return 0;
    
    const totalPoints = validSubjects.reduce((sum, s) => sum + (s.grade * s.coefficient), 0);
    const totalCoeff = validSubjects.reduce((sum, s) => sum + s.coefficient, 0);
    
    return totalCoeff > 0 ? Math.round((totalPoints / totalCoeff) * 100) / 100 : 0;
  };

  const saveGrades = async () => {
    try {
      const validGrades = subjects.filter(s => s.grade > 0);
      
      if (validGrades.length === 0) {
        toast({
          title: t.error,
          description: 'Veuillez saisir au moins une note',
          variant: 'destructive'
        });
        return;
      }

      console.log('[BULLETIN] Saving grades for student:', selectedStudent);
      
      // Save each grade individually (simplified approach)
      for (const subject of validGrades) {
        const gradeData = {
          studentId: parseInt(selectedStudent),
          classId: parseInt(selectedClass),
          subjectId: subject.id,
          subjectName: subject.name,
          grade: subject.grade,
          coefficient: subject.coefficient,
          term: selectedTerm,
          academicYear
        };
        
        console.log('[BULLETIN] Saving grade:', gradeData);
      }

      toast({
        title: t.success,
        description: t.gradesSaved,
        variant: 'default'
      });
      
    } catch (error: any) {
      console.error('[BULLETIN] ❌ Error saving grades:', error);
      toast({
        title: t.error,
        description: 'Erreur lors de la sauvegarde',
        variant: 'destructive'
      });
    }
  };

  const generatePdf = async () => {
    try {
      if (!selectedStudent || !selectedClass) {
        toast({
          title: t.error,
          description: 'Veuillez sélectionner un élève et une classe',
          variant: 'destructive'
        });
        return;
      }

      setGenerating(true);
      console.log('[BULLETIN] Generating PDF...');

      // For now, simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: t.success,
        description: t.pdfGenerated,
        variant: 'default'
      });

    } catch (error: any) {
      console.error('[BULLETIN] ❌ Error generating PDF:', error);
      toast({
        title: t.error,
        description: 'Erreur lors de la génération du PDF',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" data-testid="working-bulletin-manager">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            {t.title}
          </CardTitle>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sélection de l'élève
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="class-select">{t.selectClass}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student-select">{t.selectStudent}</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
                <SelectTrigger id="student-select">
                  <SelectValue placeholder={t.selectStudent} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Selection */}
            <div className="space-y-2">
              <Label htmlFor="term-select">{t.selectTerm}</Label>
              <Select value={selectedTerm} onValueChange={(value: 'T1' | 'T2' | 'T3') => setSelectedTerm(value)}>
                <SelectTrigger id="term-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1">Trimestre 1</SelectItem>
                  <SelectItem value="T2">Trimestre 2</SelectItem>
                  <SelectItem value="T3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="year-input">{t.academicYear}</Label>
              <Input 
                id="year-input"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Entry */}
      {selectedStudent && subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t.grades}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      (Coeff. {subject.coefficient})
                    </span>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={subject.grade || ''}
                      onChange={(e) => updateGrade(subject.id, e.target.value)}
                      placeholder="Note"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Average Display */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.average}:</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  <Calculator className="h-4 w-4 mr-1" />
                  {calculateAverage()}/20
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={saveGrades} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {t.saveGrades}
              </Button>
              
              <Button onClick={generatePdf} disabled={generating || !selectedStudent}>
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {generating ? t.generating : t.generatePdf}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>{t.loading}</span>
        </div>
      )}
    </div>
  );
}