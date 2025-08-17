import { useState } from 'react';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { wrap, submitting, getIdempotencyKey } = useEducafricSubmit();
  const { selectedSchoolId, currentSchool } = useTeacherMultiSchool();
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<number, boolean>>({});
  
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
      
      return await apiRequest('/api/teacher/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
    },
    onSuccess: (response) => {
      toast({
        title: "✅ Présences enregistrées",
        description: `Présences du ${attendanceDate} sauvegardées avec succès`,
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
          title: "⏳ Opération en cours",
          description: "Les présences sont déjà en cours d'enregistrement pour cette classe",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erreur",
          description: "Impossible d'enregistrer les présences. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }
  });
  
  // Fonction sécurisée pour enregistrer les présences
  const handleSubmitAttendance = wrap(async () => {
    if (!selectedClass) {
      toast({
        title: "⚠️ Classe non sélectionnée",
        description: "Veuillez sélectionner une classe",
        variant: "destructive",
      });
      return;
    }
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      toast({
        title: "⚠️ Aucun élève",
        description: "Aucun élève trouvé dans cette classe",
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
      title: present ? "✅ Tous marqués présents" : "❌ Tous marqués absents",
      description: `${students.length} élèves mis à jour`,
    });
  };
  
  const presentCount = Array.isArray(students) ? (students as Student[]).filter((s: Student) => attendanceData[s.id]).length : 0;
  const totalStudents = Array.isArray(students) ? students.length : 0;
  
  return (
    <div className="space-y-6">
      <SchoolSelector />
      
      {/* En-tête avec statut de sécurité */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-5 h-5" />
            Prise de Présence Sécurisée
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-300">
            Système anti-duplication activé • Protection contre les soumissions multiples
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Sélection de classe et date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Classe</label>
              <select
                value={selectedClass || ''}
                onChange={(e) => {
                  setSelectedClass(e.target.value ? parseInt(e.target.value) : null);
                  setAttendanceData({}); // Réinitialiser les données
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={submitting}
              >
                <option value="">Sélectionner une classe</option>
                {(classes as any[])?.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.level}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
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
                Élèves ({totalStudents})
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {presentCount} présents
                </Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {totalStudents - presentCount} absents
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Boutons de sélection rapide */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllStudents(true)}
                disabled={submitting}
                className="bg-green-50 hover:bg-green-100"
              >
                Tous présents
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllStudents(false)}
                disabled={submitting}
                className="bg-red-50 hover:bg-red-100"
              >
                Tous absents
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
            
            {/* Bouton d'enregistrement sécurisé */}
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
                    Enregistrement en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer les Présences
                  </div>
                )}
              </Button>
            </div>
            
            {/* Statut de protection */}
            {submitting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Protection anti-duplication active • Veuillez patienter
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