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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  FileText, 
  Download, 
  User, 
  BookOpen, 
  Save,
  Eye,
  CheckCircle,
  Loader2,
  AlertCircle,
  Calculator,
  GraduationCap,
  Star
} from 'lucide-react';

// Simplified interfaces
interface Subject {
  id: number;
  name: string;
  grade: number;
  coefficient: number;
  teacherName: string;
  comments: string;
}

interface StudentInfo {
  id: number;
  firstName: string;
  lastName: string;
  matricule: string;
  className: string;
  photo?: string;
}

interface ClassInfo {
  id: number;
  name: string;
}

interface BulletinPreview {
  subjects: Subject[];
  generalAverage: number;
  totalCoefficient: number;
  totalPoints: number;
}

export default function SimplifiedBulletinManager() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // State management
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bulletinPreview, setBulletinPreview] = useState<BulletinPreview | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  // Bilingual text system
  const text = {
    fr: {
      title: 'Gestionnaire de Bulletins Simplifié',
      subtitle: 'Workflow unifié : Sélection → Notes → PDF',
      step1: 'Étape 1: Sélection',
      step2: 'Étape 2: Notes',
      step3: 'Étape 3: PDF',
      selectClass: 'Sélectionner une classe',
      selectStudent: 'Sélectionner un élève',
      selectTerm: 'Trimestre',
      academicYear: 'Année académique',
      studentSelected: 'Élève sélectionné',
      gradeEntry: 'Saisie des notes',
      subject: 'Matière',
      grade: 'Note',
      coefficient: 'Coefficient',
      average: 'Moyenne',
      saveGrades: 'Sauvegarder les notes',
      saving: 'Sauvegarde...',
      generatePdf: 'Générer le PDF',
      generating: 'Génération...',
      download: 'Télécharger',
      preview: 'Aperçu',
      bulletinPreview: 'Aperçu du bulletin',
      generalAverage: 'Moyenne générale',
      totalPoints: 'Points totaux',
      totalCoefficient: 'Coefficient total',
      noStudentSelected: 'Aucun élève sélectionné',
      selectStudentFirst: 'Veuillez sélectionner un élève',
      gradesLoaded: 'Notes chargées',
      gradesSaved: 'Notes sauvegardées',
      pdfGenerated: 'PDF généré avec succès',
      error: 'Erreur',
      success: 'Succès',
      loading: 'Chargement...',
      firstTerm: 'Premier Trimestre',
      secondTerm: 'Deuxième Trimestre',
      thirdTerm: 'Troisième Trimestre',
      realTimePreview: 'Aperçu en temps réel',
      oneClickPdf: 'PDF en un clic',
      streamlinedWorkflow: 'Workflow simplifié'
    },
    en: {
      title: 'Simplified Report Card Manager',
      subtitle: 'Unified workflow: Selection → Grades → PDF',
      step1: 'Step 1: Selection',
      step2: 'Step 2: Grades',
      step3: 'Step 3: PDF',
      selectClass: 'Select a class',
      selectStudent: 'Select a student',
      selectTerm: 'Term',
      academicYear: 'Academic year',
      studentSelected: 'Student selected',
      gradeEntry: 'Grade entry',
      subject: 'Subject',
      grade: 'Grade',
      coefficient: 'Coefficient',
      average: 'Average',
      saveGrades: 'Save grades',
      saving: 'Saving...',
      generatePdf: 'Generate PDF',
      generating: 'Generating...',
      download: 'Download',
      preview: 'Preview',
      bulletinPreview: 'Report card preview',
      generalAverage: 'General average',
      totalPoints: 'Total points',
      totalCoefficient: 'Total coefficient',
      noStudentSelected: 'No student selected',
      selectStudentFirst: 'Please select a student first',
      gradesLoaded: 'Grades loaded',
      gradesSaved: 'Grades saved',
      pdfGenerated: 'PDF generated successfully',
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
      firstTerm: 'First Term',
      secondTerm: 'Second Term',
      thirdTerm: 'Third Term',
      realTimePreview: 'Real-time preview',
      oneClickPdf: 'One-click PDF',
      streamlinedWorkflow: 'Streamlined workflow'
    }
  };

  const t = text[language] || text.fr;

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadClasses();
    }
  }, [isAuthenticated]);

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {t.error}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Vous devez être connecté pour accéder à cette fonctionnalité.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="w-full"
            data-testid="button-login"
          >
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Load classes with proper authentication and error handling
  const loadClasses = async () => {
    try {
      // Use director-specific endpoint for sandbox users
      const isSandboxUser = user?.email?.includes('sandbox') || user?.email?.includes('educafric.demo');
      const apiEndpoint = isSandboxUser ? '/api/director/classes' : '/api/classes';
      
      console.log('[BULLETIN] Loading classes from:', apiEndpoint, 'for user:', user?.email);
      
      const response = await apiRequest('GET', apiEndpoint);
      const data = await response.json();
      
      if (data.success && data.classes) {
        // Preserve full class objects with ID and name
        setClasses(data.classes);
        console.log('[BULLETIN] ✅ Classes loaded successfully:', data.classes.length);
        toast({
          title: t.success,
          description: `${data.classes.length} classes chargées`,
          variant: 'default'
        });
      } else {
        console.warn('No classes found or invalid response:', data);
        setClasses([]);
        toast({
          title: t.error,
          description: 'Aucune classe trouvée',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error loading classes:', error);
      if (error.message?.includes('401')) {
        toast({
          title: t.error,
          description: 'Session expirée. Veuillez vous reconnecter.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: t.error,
          description: `Impossible de charger les classes: ${error.message}`,
          variant: 'destructive'
        });
      }
      setClasses([]);
    }
  };

  // Load students when class changes
  useEffect(() => {
    if (selectedClassId) {
      loadStudents(selectedClassId);
    }
  }, [selectedClassId]);

  const loadStudents = async (classId: number) => {
    try {
      setLoading(true);
      
      // Use director-specific endpoint for sandbox users
      const isSandboxUser = user?.email?.includes('sandbox') || user?.email?.includes('educafric.demo');
      let apiEndpoint: string;
      let response: Response;
      
      if (isSandboxUser) {
        // For sandbox users, use director endpoint (doesn't require classId)
        apiEndpoint = '/api/director/students';
        console.log('[BULLETIN] Loading students from:', apiEndpoint, 'for user:', user?.email);
        response = await apiRequest('GET', apiEndpoint);
      } else {
        // For regular users, use class-specific endpoint
        apiEndpoint = `/api/students/class/${classId}`;
        console.log('[BULLETIN] Loading students from:', apiEndpoint, 'for classId:', classId);
        response = await apiRequest('GET', apiEndpoint);
      }
      
      const data = await response.json();
      
      if (data.success && data.students) {
        // For sandbox users, filter students by class if needed
        let filteredStudents = data.students;
        if (isSandboxUser && classId) {
          filteredStudents = data.students.filter((student: any) => 
            student.classId === classId || student.className === classes.find(c => c.id === classId)?.name
          );
        }
        
        setStudents(filteredStudents);
        setSelectedStudent(''); // Reset student selection
        setStudentInfo(null);
        setSubjects([]);
        setBulletinPreview(null);
        
        console.log('[BULLETIN] ✅ Students loaded successfully:', filteredStudents.length);
        toast({
          title: t.success,
          description: `${filteredStudents.length} élèves chargés`,
          variant: 'default'
        });
      } else {
        console.warn('No students found for class:', classId, 'Response:', data);
        setStudents([]);
        toast({
          title: t.error,
          description: 'Aucun élève trouvé pour cette classe',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error loading students:', error);
      if (error.message?.includes('401')) {
        toast({
          title: t.error,
          description: 'Session expirée. Veuillez vous reconnecter.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: t.error,
          description: `Impossible de charger les élèves: ${error.message}`,
          variant: 'destructive'
        });
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load student grades when student/term changes
  useEffect(() => {
    if (selectedStudent && selectedClassId && selectedTerm) {
      loadStudentData();
    }
  }, [selectedStudent, selectedClassId, selectedTerm]);

  const loadStudentData = async () => {
    if (!selectedStudent || !selectedClassId) return;

    try {
      setLoading(true);
      
      // Find student info
      const student = students.find(s => s.id.toString() === selectedStudent);
      if (student) {
        setStudentInfo(student);
      }

      // Load grades with correct classId
      const response = await apiRequest(
        'GET', 
        `/api/bulletins?studentId=${selectedStudent}&classId=${selectedClassId}&academicYear=${academicYear}&term=${selectedTerm}`
      );
      const data = await response.json();
      
      if (data.success && data.data.subjects.length > 0) {
        // Convert API data to our format
        const loadedSubjects = data.data.subjects.map((s: any) => ({
          id: s.id,
          name: s.name,
          grade: s.grade || 0,
          coefficient: s.coef || 1,
          teacherName: s.teacherName || '',
          comments: s.comments || ''
        }));
        
        setSubjects(loadedSubjects);
        updatePreview(loadedSubjects);
        
        toast({
          title: t.success,
          description: `${t.gradesLoaded} - ${data.data.subjects.length} matières`,
          variant: 'default'
        });
      } else {
        // No grades found, load real subjects catalog and create empty grades
        await loadRealSubjects();
      }
    } catch (error: any) {
      console.error('Error loading student data:', error);
      if (error.message?.includes('401')) {
        toast({
          title: t.error,
          description: 'Session expirée. Veuillez vous reconnecter.',
          variant: 'destructive'
        });
      } else {
        // Try to load real subjects catalog as fallback
        await loadRealSubjects();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load real subjects catalog from backend
  const loadRealSubjects = async () => {
    try {
      if (!selectedClassId) return;
      
      // Try to get subjects for this class
      const response = await apiRequest('GET', `/api/subjects?classId=${selectedClassId}`);
      const data = await response.json();
      
      if (data.success && data.subjects && data.subjects.length > 0) {
        // Use real subjects from database
        const realSubjects = data.subjects.map((s: any) => ({
          id: s.id,
          name: s.name_fr || s.name || `Matière ${s.id}`,
          grade: 0,
          coefficient: s.coefficient || 1,
          teacherName: '',
          comments: ''
        }));
        
        setSubjects(realSubjects);
        updatePreview(realSubjects);
        
        console.log(`Loaded ${realSubjects.length} real subjects for class ${selectedClassId}`);
      } else {
        // Fallback to common subjects if no specific subjects found
        createFallbackSubjects();
      }
    } catch (error) {
      console.error('Error loading real subjects:', error);
      // Use fallback subjects if API fails
      createFallbackSubjects();
    }
  };

  const createFallbackSubjects = () => {
    // Fallback subjects with more realistic structure
    const fallbackSubjects = [
      { id: 101, name: 'Mathématiques', grade: 0, coefficient: 4, teacherName: '', comments: '' },
      { id: 102, name: 'Français', grade: 0, coefficient: 4, teacherName: '', comments: '' },
      { id: 103, name: 'Anglais', grade: 0, coefficient: 3, teacherName: '', comments: '' },
      { id: 104, name: 'Sciences Physiques', grade: 0, coefficient: 3, teacherName: '', comments: '' },
      { id: 105, name: 'Sciences de la Vie et de la Terre', grade: 0, coefficient: 3, teacherName: '', comments: '' },
      { id: 106, name: 'Histoire-Géographie', grade: 0, coefficient: 2, teacherName: '', comments: '' },
      { id: 107, name: 'Éducation Physique et Sportive', grade: 0, coefficient: 1, teacherName: '', comments: '' }
    ];
    
    setSubjects(fallbackSubjects);
    updatePreview(fallbackSubjects);
    
    console.log('Using fallback subjects as no real subjects were available');
  };

  // Update grade and preview in real-time
  const updateGrade = (subjectId: number, field: keyof Subject, value: any) => {
    const updatedSubjects = subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, [field]: field === 'grade' || field === 'coefficient' ? parseFloat(value) || 0 : value }
        : subject
    );
    
    setSubjects(updatedSubjects);
    updatePreview(updatedSubjects);
  };

  // Update preview calculation
  const updatePreview = (subjectsToCalculate: Subject[]) => {
    const validSubjects = subjectsToCalculate.filter(s => s.grade > 0);
    
    if (validSubjects.length === 0) {
      setBulletinPreview(null);
      return;
    }

    const totalPoints = validSubjects.reduce((sum, s) => sum + (s.grade * s.coefficient), 0);
    const totalCoefficient = validSubjects.reduce((sum, s) => sum + s.coefficient, 0);
    const generalAverage = totalCoefficient > 0 ? totalPoints / totalCoefficient : 0;

    setBulletinPreview({
      subjects: validSubjects,
      generalAverage: Math.round(generalAverage * 100) / 100,
      totalPoints: Math.round(totalPoints * 100) / 100,
      totalCoefficient
    });
  };

  // Save grades to database with proper authentication and validation
  const saveGrades = async () => {
    if (!selectedStudent || !selectedClassId || !selectedTerm) {
      toast({
        title: t.error,
        description: t.selectStudentFirst,
        variant: 'destructive'
      });
      return;
    }

    setSavingGrades(true);
    try {
      const validGrades = subjects.filter(s => s.grade > 0);
      
      if (validGrades.length === 0) {
        toast({
          title: t.error,
          description: 'Aucune note valide à sauvegarder',
          variant: 'destructive'
        });
        return;
      }
      
      // Save each grade individually with proper error handling
      let savedCount = 0;
      for (const subject of validGrades) {
        try {
          await apiRequest('POST', '/api/bulletins/import-grades', {
            studentId: parseInt(selectedStudent),
            classId: selectedClassId,
            academicYear,
            term: selectedTerm,
            subjectId: subject.id,
            grade: subject.grade,
            coefficient: subject.coefficient,
            teacherComments: subject.comments
          });
          savedCount++;
        } catch (gradeError) {
          console.error(`Error saving grade for subject ${subject.name}:`, gradeError);
        }
      }

      if (savedCount > 0) {
        toast({
          title: t.success,
          description: `${t.gradesSaved} - ${savedCount}/${validGrades.length} notes`,
          variant: 'default'
        });
        
        // Refresh data after successful save
        await loadStudentData();
      } else {
        toast({
          title: t.error,
          description: 'Aucune note n\'a pu être sauvegardée',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error saving grades:', error);
      if (error.message?.includes('401')) {
        toast({
          title: t.error,
          description: 'Session expirée. Veuillez vous reconnecter.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: t.error,
          description: 'Erreur lors de la sauvegarde des notes',
          variant: 'destructive'
        });
      }
    } finally {
      setSavingGrades(false);
    }
  };

  // Generate and download PDF with proper end-to-end flow
  const generatePdf = async () => {
    if (!selectedStudent || !selectedClassId || !studentInfo || !bulletinPreview) {
      toast({
        title: t.error,
        description: t.selectStudentFirst,
        variant: 'destructive'
      });
      return;
    }

    setGeneratingPdf(true);
    try {
      // First ensure grades are saved
      const validGrades = subjects.filter(s => s.grade > 0);
      if (validGrades.length === 0) {
        toast({
          title: t.error,
          description: 'Aucune note disponible pour générer le bulletin',
          variant: 'destructive'
        });
        return;
      }
      
      // Generate bulletin with proper classId
      // First, save grades if not already saved
      await saveGrades();

      // Create bulletin with proper authentication
      const createResponse = await apiRequest('POST', '/api/bulletins/create', {
        studentId: parseInt(selectedStudent),
        classId: selectedClassId,
        academicYear,
        term: selectedTerm,
        subjects: subjects.filter(s => s.grade > 0),
        generalAverage: bulletinPreview.generalAverage
      });

      const bulletinData = await createResponse.json();
      const bulletinId = bulletinData.id;

      // Generate PDF with proper authentication
      const pdfResponse = await fetch(`/api/bulletins/${bulletinId}/pdf`, {
        credentials: 'include'
      });

      if (pdfResponse.ok) {
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bulletin-${studentInfo.firstName}-${studentInfo.lastName}-${selectedTerm}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: t.success,
          description: t.pdfGenerated,
          variant: 'default'
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      if (error.message?.includes('401')) {
        toast({
          title: t.error,
          description: 'Session expirée. Veuillez vous reconnecter.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: t.error,
          description: 'Erreur lors de la génération du PDF',
          variant: 'destructive'
        });
      }
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" data-testid="simplified-bulletin-manager">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            {t.title}
          </CardTitle>
          <p className="text-muted-foreground">{t.subtitle}</p>
          
          {/* Progress indicators */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedStudent ? "default" : "outline"}>
                <User className="h-4 w-4 mr-1" />
                {t.step1}
              </Badge>
              <div className="w-8 border-t border-muted-foreground" />
              <Badge variant={subjects.length > 0 ? "default" : "outline"}>
                <BookOpen className="h-4 w-4 mr-1" />
                {t.step2}
              </Badge>
              <div className="w-8 border-t border-muted-foreground" />
              <Badge variant={bulletinPreview ? "default" : "outline"}>
                <FileText className="h-4 w-4 mr-1" />
                {t.step3}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Selection & Grade Entry */}
        <div className="space-y-6">
          {/* Step 1: Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.step1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class-select">{t.selectClass}</Label>
                  <Select 
                    value={selectedClassId?.toString() || ''} 
                    onValueChange={(value) => setSelectedClassId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger data-testid="select-class">
                      <SelectValue placeholder={t.selectClass} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="term-select">{t.selectTerm}</Label>
                  <Select value={selectedTerm} onValueChange={(value: 'T1' | 'T2' | 'T3') => setSelectedTerm(value)}>
                    <SelectTrigger data-testid="select-term">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T1">{t.firstTerm}</SelectItem>
                      <SelectItem value="T2">{t.secondTerm}</SelectItem>
                      <SelectItem value="T3">{t.thirdTerm}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="student-select">{t.selectStudent}</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder={t.selectStudent} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName} ({student.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academic-year">{t.academicYear}</Label>
                <Input 
                  id="academic-year"
                  value={academicYear} 
                  onChange={(e) => setAcademicYear(e.target.value)}
                  data-testid="input-academic-year"
                />
              </div>

              {studentInfo && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">{t.studentSelected}:</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    {studentInfo.firstName} {studentInfo.lastName} - {studentInfo.className} ({studentInfo.matricule})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Grade Entry */}
          {selectedStudent && selectedClassId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t.step2} - {t.realTimePreview}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">{t.loading}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="grid grid-cols-4 gap-2 items-center p-3 border rounded-lg">
                        <div className="font-medium text-sm">{subject.name}</div>
                        <Input
                          type="number"
                          placeholder="Note"
                          value={subject.grade || ''}
                          onChange={(e) => updateGrade(subject.id, 'grade', e.target.value)}
                          min="0"
                          max="20"
                          step="0.1"
                          className="text-center"
                          data-testid={`input-grade-${subject.id}`}
                        />
                        <Input
                          type="number"
                          placeholder="Coef"
                          value={subject.coefficient || ''}
                          onChange={(e) => updateGrade(subject.id, 'coefficient', e.target.value)}
                          min="1"
                          max="10"
                          className="text-center"
                          data-testid={`input-coefficient-${subject.id}`}
                        />
                        <div className="text-center text-sm font-medium">
                          {subject.grade > 0 ? (subject.grade * subject.coefficient).toFixed(1) : '-'}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={saveGrades} 
                        disabled={savingGrades || !bulletinPreview}
                        className="flex-1"
                        data-testid="button-save-grades"
                      >
                        {savingGrades ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t.saving}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {t.saveGrades}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Preview & PDF Generation */}
        <div className="space-y-6">
          {/* Step 3: Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t.bulletinPreview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedStudent ? (
                <div className="text-center p-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  {t.noStudentSelected}
                </div>
              ) : !bulletinPreview ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4" />
                  Enter grades to see preview
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Student Info */}
                  {studentInfo && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900">
                        {studentInfo.firstName} {studentInfo.lastName}
                      </h3>
                      <p className="text-blue-700 text-sm">
                        {studentInfo.className} • {selectedTerm} • {academicYear}
                      </p>
                    </div>
                  )}

                  {/* Grades Summary */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Matières avec notes:</h4>
                    {bulletinPreview.subjects.map((subject) => (
                      <div key={subject.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{subject.name}</span>
                        <div className="text-sm">
                          <span className="font-medium">{subject.grade}/20</span>
                          <span className="text-muted-foreground ml-2">(coef {subject.coefficient})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {bulletinPreview.generalAverage}
                      </div>
                      <div className="text-xs text-green-600">{t.generalAverage}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {bulletinPreview.totalPoints}
                      </div>
                      <div className="text-xs text-green-600">{t.totalPoints}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {bulletinPreview.totalCoefficient}
                      </div>
                      <div className="text-xs text-green-600">{t.totalCoefficient}</div>
                    </div>
                  </div>

                  {/* Appreciation */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {bulletinPreview.generalAverage >= 16 ? 'Excellent' :
                         bulletinPreview.generalAverage >= 14 ? 'Très Bien' :
                         bulletinPreview.generalAverage >= 12 ? 'Bien' :
                         bulletinPreview.generalAverage >= 10 ? 'Assez Bien' : 'Doit faire des efforts'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PDF Generation */}
          {bulletinPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t.step3} - {t.oneClickPdf}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generatePdf} 
                  disabled={generatingPdf || !bulletinPreview}
                  className="w-full h-12 text-lg"
                  data-testid="button-generate-pdf"
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t.generating}
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      {t.generatePdf}
                    </>
                  )}
                </Button>
                
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t.streamlinedWorkflow}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sauvegarde automatique + Génération PDF + Téléchargement direct
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}