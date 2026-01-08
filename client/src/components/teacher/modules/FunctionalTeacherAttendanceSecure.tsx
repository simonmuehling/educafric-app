import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useEducafricSubmit } from '@/hooks/useSingleSubmit';
import { useTeacherMultiSchool } from '@/contexts/TeacherMultiSchoolContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SchoolSelector from '@/components/shared/SchoolSelector';

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  present?: boolean;
}

interface AttendanceData {
  classId: number;
  date: string;
  students: Array<{
    studentId: number;
    present: boolean;
    note?: string;
  }>;
}

export default function FunctionalTeacherAttendanceSecure() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wrap, submitting, getIdempotencyKey } = useEducafricSubmit();
  const { selectedSchoolId, currentSchool } = useTeacherMultiSchool();
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<number, boolean>>({});

  const t = {
    secureAttendance: language === 'fr' ? 'Prise de Présence Sécurisée' : 'Secure Attendance',
    secureDesc: language === 'fr' ? 'Système anti-duplication activé • Protection contre les soumissions multiples' : 'Anti-duplication system active • Protection against multiple submissions',
    configuration: language === 'fr' ? 'Configuration' : 'Configuration',
    class: language === 'fr' ? 'Classe' : 'Class',
    date: language === 'fr' ? 'Date' : 'Date',
    selectClass: language === 'fr' ? 'Sélectionner une classe' : 'Select a class',
    students: language === 'fr' ? 'Élèves' : 'Students',
    present: language === 'fr' ? 'présents' : 'present',
    absent: language === 'fr' ? 'absents' : 'absent',
    allPresent: language === 'fr' ? 'Tous présents' : 'All present',
    allAbsent: language === 'fr' ? 'Tous absents' : 'All absent',
    recordAttendance: language === 'fr' ? 'Enregistrer les Présences' : 'Record Attendance',
    recording: language === 'fr' ? 'Enregistrement en cours...' : 'Recording...',
    protectionActive: language === 'fr' ? 'Protection anti-duplication active • Veuillez patienter' : 'Anti-duplication protection active • Please wait',
    attendanceRecorded: language === 'fr' ? '✅ Présences enregistrées' : '✅ Attendance recorded',
    attendanceSaved: (date: string) => language === 'fr' ? `Présences du ${date} sauvegardées avec succès` : `Attendance for ${date} saved successfully`,
    operationInProgress: language === 'fr' ? '⏳ Opération en cours' : '⏳ Operation in progress',
    alreadyRecording: language === 'fr' ? 'Les présences sont déjà en cours d\'enregistrement pour cette classe' : 'Attendance is already being recorded for this class',
    error: language === 'fr' ? '❌ Erreur' : '❌ Error',
    recordError: language === 'fr' ? 'Impossible d\'enregistrer les présences. Veuillez réessayer.' : 'Unable to record attendance. Please try again.',
    classNotSelected: language === 'fr' ? '⚠️ Classe non sélectionnée' : '⚠️ Class not selected',
    selectClassFirst: language === 'fr' ? 'Veuillez sélectionner une classe' : 'Please select a class',
    noStudents: language === 'fr' ? '⚠️ Aucun élève' : '⚠️ No students',
    noStudentsFound: language === 'fr' ? 'Aucun élève trouvé dans cette classe' : 'No students found in this class',
    allMarkedPresent: language === 'fr' ? '✅ Tous marqués présents' : '✅ All marked present',
    allMarkedAbsent: language === 'fr' ? '❌ Tous marqués absents' : '❌ All marked absent',
    studentsUpdated: (count: number) => language === 'fr' ? `${count} élèves mis à jour` : `${count} students updated`
  };
  
  // Requête pour récupérer les classes de l'enseignant
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['/api/teacher/classes', selectedSchoolId],
    enabled: true
  });
  
  // Requête pour récupérer les élèves de la classe sélectionnée
  const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students', selectedClass],
    enabled: !!selectedClass
  });
  
  // Mutation pour enregistrer les présences avec protection anti-duplication
  const attendanceMutation = useMutation({
    mutationFn: async (data: AttendanceData) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Ajouter la clé d'idempotence pour éviter les doublons
      const idempotencyKey = getIdempotencyKey();
      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }
      
      return await apiRequest('POST', '/api/teacher/attendance', data);
    },
    onSuccess: (response) => {
      toast({
        title: t.attendanceRecorded,
        description: t.attendanceSaved(attendanceDate),
      });
      
      // Invalider le cache pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
      
      // Réinitialiser le formulaire
      setAttendanceData({});
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'enregistrement des présences:', error);
      
      if (error.message?.includes('already in progress')) {
        toast({
          title: t.operationInProgress,
          description: t.alreadyRecording,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.error,
          description: t.recordError,
          variant: "destructive",
        });
      }
    }
  });
  
  // Fonction sécurisée pour enregistrer les présences
  const handleSubmitAttendance = wrap(async () => {
    if (!selectedClass) {
      toast({
        title: t.classNotSelected,
        description: t.selectClassFirst,
        variant: "destructive",
      });
      return;
    }
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      toast({
        title: t.noStudents,
        description: t.noStudentsFound,
        variant: "destructive",
      });
      return;
    }
    
    const attendancePayload: AttendanceData = {
      classId: selectedClass,
      date: attendanceDate,
      students: (students as Student[]).map((student: Student) => ({
        studentId: student.id,
        present: attendanceData[student.id] ?? false,
        note: attendanceData[student.id] ? 'Présent' : 'Absent'
      }))
    };
    
    console.log('[ATTENDANCE_SECURE] Submitting attendance:', attendancePayload);
    await attendanceMutation.mutateAsync(attendancePayload);
  });
  
  // Fonction pour basculer la présence d'un élève
  const toggleStudentAttendance = (studentId: number) => {
    if (submitting) return; // Empêcher les modifications pendant l'envoi
    
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };
  
  // Fonction pour marquer tous présents/absents
  const markAllStudents = (present: boolean) => {
    if (submitting || !students || !Array.isArray(students)) return;
    
    const newData: Record<number, boolean> = {};
    (students as Student[]).forEach((student: Student) => {
      newData[student.id] = present;
    });
    setAttendanceData(newData);
    
    toast({
      title: present ? t.allMarkedPresent : t.allMarkedAbsent,
      description: t.studentsUpdated(students.length),
    });
  };
  
  const presentCount = Array.isArray(students) ? (students as Student[]).filter((s: Student) => attendanceData[s.id]).length : 0;
  const totalStudents = Array.isArray(students) ? students.length : 0;
  
  return (
    <div className="space-y-6">
      <SchoolSelector />
      
      <Card className="border-green-200 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-5 h-5" />
            {t.secureAttendance}
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-300">
            {t.secureDesc}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.configuration}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.class}</label>
              <select
                value={selectedClass || ''}
                onChange={(e) => {
                  setSelectedClass(e.target.value ? parseInt(e.target.value) : null);
                  setAttendanceData({});
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={submitting}
              >
                <option value="">{t.selectClass}</option>
                {(classes as any[])?.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.level}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.date}</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={submitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Liste des élèves */}
      {selectedClass && students && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t.students} ({totalStudents})
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {presentCount} {t.present}
                </Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {totalStudents - presentCount} {t.absent}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllStudents(true)}
                disabled={submitting}
                className="bg-green-50 hover:bg-green-100"
              >
                {t.allPresent}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllStudents(false)}
                disabled={submitting}
                className="bg-red-50 hover:bg-red-100"
              >
                {t.allAbsent}
              </Button>
            </div>
            
            {/* Liste des élèves */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(students as Student[]).map((student: Student) => (
                <div
                  key={student.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    attendanceData[student.id]
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  } ${submitting ? 'opacity-60' : ''}`}
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={attendanceData[student.id] || false}
                    onCheckedChange={() => toggleStudentAttendance(student.id)}
                    disabled={submitting}
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {student.name}
                    <div className="text-xs text-gray-500">
                      N° {student.rollNumber}
                    </div>
                  </label>
                  {attendanceData[student.id] ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmitAttendance}
                disabled={submitting || !selectedClass || totalStudents === 0}
                className="w-full md:w-auto px-8 py-3 text-lg"
                size="lg"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    {t.recording}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t.recordAttendance}
                  </div>
                )}
              </Button>
            </div>
            
            {submitting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">
                    {t.protectionActive}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}