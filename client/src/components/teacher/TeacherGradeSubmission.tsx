import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Send,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  Archive,
  Info
} from 'lucide-react';

interface GradeEntry {
  studentId: number;
  subjectId: number;
  grade: string;
  coefficient: number;
}

const TeacherGradeSubmission: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [grades, setGrades] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Bilingual text
  const text = {
    fr: {
      title: 'Soumettre les Notes à l\'École',
      subtitle: 'Entrez les notes pour vos matières et soumettez-les au directeur pour approbation',
      actionsTeacher: 'Actions Enseignant',
      actionsDesc: 'Les enseignants soumettent les notes uniquement à l\'école. L\'école gère la signature et l\'envoi aux parents.',
      saveDraft: 'Sauvegarder Brouillon',
      saveDraftDesc: 'Travail temporaire',
      archiveByClass: 'Archiver par Classe',
      archiveByClassDesc: 'Organisation par classe',
      submitToSchool: 'Soumettre à l\'École',
      submitToSchoolDesc: 'Validation finale par l\'école',
      archive: 'Archiver',
      teacherRoleReminder: 'Rappel du rôle enseignant :',
      teacherRole1: 'Les enseignants soumettent les notes uniquement à l\'école',
      teacherRole2: 'L\'école valide, signe et envoie aux parents',
      teacherRole3: 'Aucune communication directe enseignant ↔ parents via cette interface',
      selectSchool: 'Sélectionner une école',
      selectClass: 'Sélectionner une classe',
      selectTerm: 'Sélectionner un trimestre',
      student: 'Élève',
      matricule: 'Matricule',
      subjects: 'Matières',
      enterGrade: 'Entrer la note',
      saveGrades: 'Sauvegarder les notes',
      submitting: 'Soumission en cours...',
      saving: 'Sauvegarde...',
      noStudents: 'Aucun élève dans cette classe',
      noSubjects: 'Aucune matière assignée',
      selectClassFirst: 'Sélectionnez une classe pour commencer',
      gradesSubmitted: 'Notes soumises avec succès',
      gradesSubmittedDesc: 'Les notes ont été envoyées au directeur pour approbation',
      gradesSaved: 'Notes sauvegardées',
      gradesSavedDesc: 'Les notes ont été sauvegardées localement',
      errorSubmitting: 'Erreur lors de la soumission',
      errorSaving: 'Erreur lors de la sauvegarde',
      viewSubmissions: 'Voir mes soumissions',
      pendingApproval: 'En attente d\'approbation',
      approved: 'Approuvé',
      rejected: 'Rejeté'
    },
    en: {
      title: 'Submit Grades to School',
      subtitle: 'Enter grades for your subjects and submit them to the director for approval',
      actionsTeacher: 'Teacher Actions',
      actionsDesc: 'Teachers submit grades only to the school. The school manages signing and sending to parents.',
      saveDraft: 'Save Draft',
      saveDraftDesc: 'Temporary work',
      archiveByClass: 'Archive by Class',
      archiveByClassDesc: 'Class organization',
      submitToSchool: 'Submit to School',
      submitToSchoolDesc: 'Final validation by school',
      archive: 'Archive',
      teacherRoleReminder: 'Teacher role reminder:',
      teacherRole1: 'Teachers submit grades only to the school',
      teacherRole2: 'The school validates, signs and sends to parents',
      teacherRole3: 'No direct teacher ↔ parent communication via this interface',
      selectSchool: 'Select a school',
      selectClass: 'Select a class',
      selectTerm: 'Select a term',
      student: 'Student',
      matricule: 'Matricule',
      subjects: 'Subjects',
      enterGrade: 'Enter grade',
      saveGrades: 'Save grades',
      submitting: 'Submitting...',
      saving: 'Saving...',
      noStudents: 'No students in this class',
      noSubjects: 'No subjects assigned',
      selectClassFirst: 'Select a class to start',
      gradesSubmitted: 'Grades submitted successfully',
      gradesSubmittedDesc: 'Grades have been sent to the director for approval',
      gradesSaved: 'Grades saved',
      gradesSavedDesc: 'Grades have been saved locally',
      errorSubmitting: 'Error submitting grades',
      errorSaving: 'Error saving grades',
      viewSubmissions: 'View my submissions',
      pendingApproval: 'Pending approval',
      approved: 'Approved',
      rejected: 'Rejected'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch teacher classes (reuse existing endpoint)
  const { data: classesData, isLoading: isLoadingSchools } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/classes');
      return await response.json();
    },
    enabled: !!user
  });

  const schoolsWithClasses = useMemo(() => {
    if (!classesData) return [];
    
    // Handle response format
    if (classesData.schoolsWithClasses && Array.isArray(classesData.schoolsWithClasses)) {
      return classesData.schoolsWithClasses;
    }
    
    // Fallback: create single school structure from flat classes array
    let allClasses = [];
    if (Array.isArray(classesData)) {
      allClasses = classesData;
    } else if (classesData.classes && Array.isArray(classesData.classes)) {
      allClasses = classesData.classes;
    }
    
    if (allClasses.length > 0) {
      return [{
        schoolId: user?.schoolId || 1,
        schoolName: 'École Principale',
        classes: allClasses
      }];
    }
    return [];
  }, [classesData, user]);

  const schools = useMemo(() => {
    return schoolsWithClasses.map((school: any) => ({
      id: String(school.schoolId),
      name: school.schoolName
    }));
  }, [schoolsWithClasses]);

  const availableClasses = useMemo(() => {
    if (!selectedSchool) return [];
    const school = schoolsWithClasses.find((s: any) => String(s.schoolId) === selectedSchool);
    return school?.classes || [];
  }, [schoolsWithClasses, selectedSchool]);

  // Fetch students for selected class
  const { data: studentsData } = useQuery({
    queryKey: ['/api/teacher/students', selectedClass],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/teacher/students?classId=${selectedClass}`);
      return await response.json();
    },
    enabled: !!selectedClass
  });

  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);

  // Fetch teacher's subjects for this class
  const { data: subjectsData } = useQuery({
    queryKey: ['/api/teacher/class-subjects', selectedClass],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/teacher/class-subjects?classId=${selectedClass}`);
      return await response.json();
    },
    enabled: !!selectedClass
  });

  const subjects = subjectsData?.subjects || [];

  // Submit grades mutation
  const submitGradesMutation = useMutation({
    mutationFn: async (gradesData: GradeEntry[]) => {
      // Group grades by student and submit
      const studentGrades = new Map<number, any[]>();
      
      gradesData.forEach(grade => {
        if (!studentGrades.has(grade.studentId)) {
          studentGrades.set(grade.studentId, []);
        }
        studentGrades.get(grade.studentId)!.push({
          subjectId: grade.subjectId,
          grade: parseFloat(grade.grade),
          coefficient: grade.coefficient
        });
      });

      // Submit for each student
      const promises = Array.from(studentGrades.entries()).map(([studentId, subjectGrades]) => {
        return apiRequest('POST', '/api/comprehensive-bulletins/teacher-submission', {
          studentId,
          classId: parseInt(selectedClass),
          schoolId: parseInt(selectedSchool),
          academicYear,
          term: selectedTerm,
          manualData: {
            subjectGrades
          }
        });
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: t.gradesSubmitted,
        description: t.gradesSubmittedDesc,
      });
      setGrades(new Map());
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/submissions'] });
    },
    onError: () => {
      toast({
        title: t.errorSubmitting,
        variant: 'destructive',
      });
    }
  });

  const handleGradeChange = (studentId: number, subjectId: number, value: string) => {
    const key = `${studentId}-${subjectId}`;
    setGrades(prev => {
      const newMap = new Map(prev);
      if (value === '') {
        newMap.delete(key);
      } else {
        newMap.set(key, value);
      }
      return newMap;
    });
  };

  // Save draft to localStorage
  const handleSaveDraft = () => {
    if (!selectedClass || grades.size === 0) {
      toast({
        title: language === 'fr' ? 'Aucune donnée à sauvegarder' : 'No data to save',
        description: language === 'fr' ? 'Veuillez sélectionner une classe et entrer des notes' : 'Please select a class and enter grades',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const draftKey = `grade_draft_${selectedSchool}_${selectedClass}_${selectedTerm}_${academicYear}`;
      const draftData = {
        schoolId: selectedSchool,
        classId: selectedClass,
        term: selectedTerm,
        academicYear,
        grades: Array.from(grades.entries()),
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      
      toast({
        title: t.gradesSaved,
        description: t.gradesSavedDesc,
      });
    } catch (error) {
      toast({
        title: t.errorSaving,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Archive grades by class
  const handleArchive = () => {
    if (!selectedClass || grades.size === 0) {
      toast({
        title: language === 'fr' ? 'Aucune donnée à archiver' : 'No data to archive',
        description: language === 'fr' ? 'Veuillez sélectionner une classe et entrer des notes' : 'Please select a class and enter grades',
        variant: 'destructive',
      });
      return;
    }

    // For now, this archives to localStorage similar to draft but in a separate archive section
    const archiveKey = `grade_archive_${selectedSchool}_${selectedClass}_${selectedTerm}_${academicYear}_${Date.now()}`;
    const archiveData = {
      schoolId: selectedSchool,
      classId: selectedClass,
      term: selectedTerm,
      academicYear,
      grades: Array.from(grades.entries()),
      archivedAt: new Date().toISOString()
    };
    
    localStorage.setItem(archiveKey, JSON.stringify(archiveData));
    
    toast({
      title: language === 'fr' ? 'Notes archivées' : 'Grades archived',
      description: language === 'fr' ? 'Les notes ont été archivées avec succès' : 'Grades have been archived successfully',
    });
  };

  const handleSubmit = () => {
    const gradesArray: GradeEntry[] = [];
    grades.forEach((grade, key) => {
      const [studentId, subjectId] = key.split('-').map(Number);
      const subject = subjects.find((s: any) => s.id === subjectId);
      if (grade && !isNaN(parseFloat(grade))) {
        gradesArray.push({
          studentId,
          subjectId,
          grade,
          coefficient: subject?.coefficient || 1
        });
      }
    });

    if (gradesArray.length === 0) {
      toast({
        title: language === 'fr' ? 'Aucune note à soumettre' : 'No grades to submit',
        description: language === 'fr' ? 'Veuillez entrer au moins une note' : 'Please enter at least one grade',
        variant: 'destructive',
      });
      return;
    }

    submitGradesMutation.mutate(gradesArray);
  };

  const getGrade = (studentId: number, subjectId: number): string => {
    return grades.get(`${studentId}-${subjectId}`) || '';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>
      </div>

      {/* School, Class, and Term Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.selectSchool}</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool} data-testid="select-school">
                <SelectTrigger>
                  <SelectValue placeholder={t.selectSchool} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school: any) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.selectClass}</Label>
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={!selectedSchool}
                data-testid="select-class"
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.selectTerm}</Label>
              <Select value={selectedTerm} onValueChange={(value: any) => setSelectedTerm(value)} data-testid="select-term">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1">Premier Trimestre</SelectItem>
                  <SelectItem value="T2">Deuxième Trimestre</SelectItem>
                  <SelectItem value="T3">Troisième Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      {selectedClass && students.length > 0 && subjects.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {language === 'fr' ? 'Saisie des Notes' : 'Grade Entry'}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {students.length} {language === 'fr' ? 'élèves' : 'students'}
                </Badge>
                <Badge variant="outline">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {subjects.length} {language === 'fr' ? 'matières' : 'subjects'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Actions Enseignant Header */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t.actionsTeacher}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t.actionsDesc}
              </p>
              
              {/* Top Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={handleSaveDraft}
                  disabled={isSaving || !selectedClass || grades.size === 0}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  data-testid="button-save-draft"
                >
                  <Save className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{t.saveDraft}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.saveDraftDesc}</div>
                  </div>
                </Button>

                <Button
                  onClick={handleArchive}
                  disabled={!selectedClass || grades.size === 0}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                  data-testid="button-archive-class"
                >
                  <Archive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{t.archiveByClass}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.archiveByClassDesc}</div>
                  </div>
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={submitGradesMutation.isPending || grades.size === 0}
                  className="flex flex-col items-center gap-2 h-auto py-4 bg-green-600 hover:bg-green-700 border-2 border-green-500"
                  data-testid="button-submit-school-top"
                >
                  <Send className="h-5 w-5 text-white" />
                  <div className="text-center text-white">
                    <div className="font-semibold text-sm">{t.submitToSchool}</div>
                    <div className="text-xs opacity-90">{t.submitToSchoolDesc}</div>
                  </div>
                </Button>
              </div>

              {/* Teacher Role Reminder */}
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-yellow-700 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {t.teacherRoleReminder}
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                        <span>{t.teacherRole1}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                        <span>{t.teacherRole2}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                        <span>{t.teacherRole3}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-b">
                      {t.student}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-b">
                      {t.matricule}
                    </th>
                    {subjects.map((subject: any) => (
                      <th key={subject.id} className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-b">
                        <div>{subject.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          (Coef: {subject.coefficient})
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-b">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-b">
                        {student.matricule}
                      </td>
                      {subjects.map((subject: any) => (
                        <td key={subject.id} className="px-4 py-3 border-b">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            placeholder="/20"
                            value={getGrade(student.id, subject.id)}
                            onChange={(e) => handleGradeChange(student.id, subject.id, e.target.value)}
                            className="w-20 text-center"
                            data-testid={`grade-${student.id}-${subject.id}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                onClick={handleSaveDraft}
                disabled={isSaving || !selectedClass || grades.size === 0}
                variant="outline"
                className="border-2 border-blue-400 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                data-testid="button-save-draft-bottom"
              >
                <Save className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                {t.saveDraft}
              </Button>

              <Button
                onClick={handleArchive}
                disabled={!selectedClass || grades.size === 0}
                variant="outline"
                className="border-2 border-purple-400 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                data-testid="button-archive-bottom"
              >
                <Archive className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                {t.archive}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitGradesMutation.isPending || grades.size === 0}
                className="bg-green-600 hover:bg-green-700 border-2 border-green-500"
                data-testid="button-submit-school-bottom"
              >
                {submitGradesMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t.submitToSchool}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedClass && students.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t.noStudents}
            </h3>
          </CardContent>
        </Card>
      ) : selectedClass && subjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t.noSubjects}
            </h3>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t.selectClassFirst}
            </h3>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherGradeSubmission;
