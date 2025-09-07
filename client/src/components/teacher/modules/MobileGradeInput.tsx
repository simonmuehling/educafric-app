import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  PenTool,
  Save,
  Send,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Smartphone,
  Plus,
  Minus,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';

interface Student {
  id: number;
  fullName: string;
  matricule: string;
  photo?: string;
}

interface Subject {
  id: number;
  name: string;
  coefficient: number;
}

interface GradeSubmission {
  studentId: number;
  subjectId: number;
  firstEvaluation?: number;
  secondEvaluation?: number;
  thirdEvaluation?: number;
  comments?: string;
  coefficient: number;
}

export default function MobileGradeInput() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('T1');
  const [grades, setGrades] = useState<{ [key: number]: GradeSubmission }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // === INTERFACE MOBILE MODERNE ===
  const translations = {
    fr: {
      title: 'Saisie de Notes Mobile',
      selectClass: 'Sélectionner la classe',
      selectSubject: 'Sélectionner la matière',
      selectTerm: 'Sélectionner le trimestre',
      students: 'Élèves',
      grade: 'Note',
      coefficient: 'Coef',
      comments: 'Commentaires',
      save: 'Sauvegarder',
      submit: 'Soumettre',
      next: 'Suivant',
      previous: 'Précédent',
      allGrades: 'Toutes les notes',
      quickEntry: 'Saisie rapide',
      detailedEntry: 'Saisie détaillée',
      average: 'Moyenne',
      excellent: 'Excellent',
      good: 'Bien',
      average_grade: 'Moyen',
      poor: 'Insuffisant',
      saved: 'Notes sauvegardées avec succès !',
      submitted: 'Notes soumises avec succès !'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.fr;

  // === CHARGEMENT DES DONNÉES ===
  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadStudents(selectedClassId);
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        console.log('[MOBILE_GRADES] ✅ Classes chargées:', data.length);
      }
    } catch (error) {
      console.error('[MOBILE_GRADES] ❌ Erreur chargement classes:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/teacher/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        console.log('[MOBILE_GRADES] ✅ Matières chargées:', data.length);
      }
    } catch (error) {
      console.error('[MOBILE_GRADES] ❌ Erreur chargement matières:', error);
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/classes/${classId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        setCurrentStudentIndex(0);
        
        // Initialiser les grades
        const initialGrades: { [key: number]: GradeSubmission } = {};
        data.forEach((student: Student) => {
          initialGrades[student.id] = {
            studentId: student.id,
            subjectId: parseInt(selectedSubjectId) || 0,
            coefficient: subjects.find(s => s.id === parseInt(selectedSubjectId))?.coefficient || 1
          };
        });
        setGrades(initialGrades);
        
        console.log('[MOBILE_GRADES] ✅ Élèves chargés:', data.length);
      }
    } catch (error) {
      console.error('[MOBILE_GRADES] ❌ Erreur chargement élèves:', error);
    } finally {
      setLoading(false);
    }
  };

  // === GESTION DES NOTES ===
  const updateGrade = (studentId: number, field: string, value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const getGradeColor = (grade?: number): string => {
    if (!grade) return '#6b7280'; // Gris
    if (grade >= 16) return '#10b981'; // Vert excellent
    if (grade >= 14) return '#3b82f6'; // Bleu bien
    if (grade >= 10) return '#f59e0b'; // Orange passable
    return '#ef4444'; // Rouge insuffisant
  };

  const getGradeLabel = (grade?: number): string => {
    if (!grade) return '';
    if (grade >= 16) return t.excellent;
    if (grade >= 14) return t.good;
    if (grade >= 10) return t.average_grade;
    return t.poor;
  };

  const saveGrades = async (submitToDirector = false) => {
    try {
      setSaving(true);
      const gradeData = Object.values(grades).filter(g => 
        g.firstEvaluation || g.secondEvaluation || g.thirdEvaluation
      );

      const response = await fetch('/api/teacher/grade-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          term: selectedTerm,
          academicYear: '2024-2025',
          grades: gradeData,
          isSubmitted: submitToDirector
        })
      });

      if (response.ok) {
        toast({
          title: submitToDirector ? t.submitted : t.saved,
          description: `${gradeData.length} notes ${submitToDirector ? 'soumises' : 'sauvegardées'}`,
        });
      }
    } catch (error) {
      console.error('[MOBILE_GRADES] ❌ Erreur sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les notes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = students[currentStudentIndex];
  const currentGrade = currentStudent ? grades[currentStudent.id] : null;
  const selectedSubject = subjects.find(s => s.id === parseInt(selectedSubjectId));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-20">
      {/* === EN-TÊTE MOBILE MODERNE === */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-full">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-600">Interface mobile GegoK12</p>
          </div>
        </div>

        {/* === SÉLECTEURS COMPACTS === */}
        <div className="grid grid-cols-1 gap-3">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="h-12 bg-white border-2 border-blue-100">
              <SelectValue placeholder={t.selectClass} />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {cls.name} ({cls.studentCount} élèves)
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="h-12 bg-white border-2 border-green-100">
                <SelectValue placeholder={t.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {subject.name} (coef {subject.coefficient})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="h-12 bg-white border-2 border-purple-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1">T1 - 1er Trimestre</SelectItem>
                <SelectItem value="T2">T2 - 2ème Trimestre</SelectItem>
                <SelectItem value="T3">T3 - 3ème Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* === INTERFACE SAISIE MOBILE === */}
      {selectedClassId && selectedSubjectId && students.length > 0 && (
        <div className="space-y-4">
          
          {/* === NAVIGATION ÉLÈVE === */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {currentStudent?.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{currentStudent?.fullName}</h3>
                    <p className="text-sm text-gray-600">Mat: {currentStudent?.matricule}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  {currentStudentIndex + 1}/{students.length}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* === SAISIE NOTE MODERNE === */}
          <Card className="border-2 border-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                Note {selectedSubject?.name}
                <Badge className="bg-purple-100 text-purple-800">
                  Coef {selectedSubject?.coefficient}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* === SAISIE GRADE SELON TRIMESTRE === */}
              <div className="space-y-3">
                {selectedTerm === 'T1' && (
                  <div>
                    <Label className="text-base font-medium">Note T1</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={currentGrade?.firstEvaluation || ''}
                        onChange={(e) => updateGrade(currentStudent.id, 'firstEvaluation', parseFloat(e.target.value) || 0)}
                        className="text-2xl font-bold text-center h-14 border-2"
                        style={{ 
                          borderColor: getGradeColor(currentGrade?.firstEvaluation),
                          color: getGradeColor(currentGrade?.firstEvaluation)
                        }}
                        placeholder="0.0"
                      />
                      <div className="text-xl font-bold text-gray-400">/20</div>
                    </div>
                    <p className="text-sm text-center mt-2 font-medium" style={{ 
                      color: getGradeColor(currentGrade?.firstEvaluation) 
                    }}>
                      {getGradeLabel(currentGrade?.firstEvaluation)}
                    </p>
                  </div>
                )}

                {selectedTerm === 'T2' && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Note T1 (référence)</Label>
                      <div className="text-lg font-bold text-gray-600">
                        {currentGrade?.firstEvaluation || 'Non saisie'}/20
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Note T2</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={currentGrade?.secondEvaluation || ''}
                          onChange={(e) => updateGrade(currentStudent.id, 'secondEvaluation', parseFloat(e.target.value) || 0)}
                          className="text-2xl font-bold text-center h-14 border-2"
                          style={{ 
                            borderColor: getGradeColor(currentGrade?.secondEvaluation),
                            color: getGradeColor(currentGrade?.secondEvaluation)
                          }}
                          placeholder="0.0"
                        />
                        <div className="text-xl font-bold text-gray-400">/20</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTerm === 'T3' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">T1</Label>
                        <div className="text-sm font-bold text-gray-600">
                          {currentGrade?.firstEvaluation || 'N/A'}/20
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">T2</Label>
                        <div className="text-sm font-bold text-gray-600">
                          {currentGrade?.secondEvaluation || 'N/A'}/20
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Note T3</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={currentGrade?.thirdEvaluation || ''}
                          onChange={(e) => updateGrade(currentStudent.id, 'thirdEvaluation', parseFloat(e.target.value) || 0)}
                          className="text-2xl font-bold text-center h-14 border-2"
                          style={{ 
                            borderColor: getGradeColor(currentGrade?.thirdEvaluation),
                            color: getGradeColor(currentGrade?.thirdEvaluation)
                          }}
                          placeholder="0.0"
                        />
                        <div className="text-xl font-bold text-gray-400">/20</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* === COMMENTAIRES === */}
              <div>
                <Label className="text-base font-medium">{t.comments}</Label>
                <Textarea
                  value={currentGrade?.comments || ''}
                  onChange={(e) => updateGrade(currentStudent.id, 'comments', e.target.value)}
                  placeholder="Appréciation pour cet élève..."
                  className="mt-2 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* === NAVIGATION ET ACTIONS === */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setCurrentStudentIndex(Math.max(0, currentStudentIndex - 1))}
              disabled={currentStudentIndex === 0}
            >
              <Minus className="h-4 w-4 mr-2" />
              {t.previous}
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setCurrentStudentIndex(Math.min(students.length - 1, currentStudentIndex + 1))}
              disabled={currentStudentIndex === students.length - 1}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.next}
            </Button>
          </div>

          {/* === ACTIONS PRINCIPALES === */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              className="h-14 bg-blue-50 hover:bg-blue-100 border-blue-200"
              onClick={() => saveGrades(false)}
              disabled={saving}
            >
              <Save className="h-5 w-5 mr-2" />
              {t.save}
            </Button>
            <Button
              className="h-14 bg-green-600 hover:bg-green-700"
              onClick={() => saveGrades(true)}
              disabled={saving}
            >
              <Send className="h-5 w-5 mr-2" />
              {t.submit}
            </Button>
          </div>

          {/* === STATISTIQUES RAPIDES === */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(grades).filter(g => 
                      g.firstEvaluation || g.secondEvaluation || g.thirdEvaluation
                    ).length}
                  </div>
                  <div className="text-xs text-purple-800">Notes saisies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">
                    {students.length - Object.values(grades).filter(g => 
                      g.firstEvaluation || g.secondEvaluation || g.thirdEvaluation
                    ).length}
                  </div>
                  <div className="text-xs text-pink-800">Restantes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((Object.values(grades).filter(g => 
                      g.firstEvaluation || g.secondEvaluation || g.thirdEvaluation
                    ).length / students.length) * 100)}%
                  </div>
                  <div className="text-xs text-green-800">Progression</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* === MESSAGE INITIAL === */}
      {(!selectedClassId || !selectedSubjectId) && (
        <Card className="text-center py-12">
          <CardContent>
            <Smartphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Interface Mobile Optimisée</h3>
            <p className="text-gray-600">
              Sélectionnez une classe et une matière pour commencer la saisie de notes
            </p>
            <p className="text-sm text-blue-600 mt-2">
              ✨ Inspiré de GegoK12 et ThinkWave
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}