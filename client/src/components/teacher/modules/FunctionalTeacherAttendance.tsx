import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOffline } from '@/hooks/useOffline';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, Clock, AlertTriangle,
  Calendar, Users, Filter, Download,
  Search, Eye, Edit, WifiOff
} from 'lucide-react';

interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  status: string;
  reason: string;
  markedAt: string;
}

const FunctionalTeacherAttendance: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOnline, queueAction, cacheData, getCachedData } = useOffline();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    classId: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    students: [] as Array<{id: number, name: string, status: string}>,
    notes: ''
  });

  // Fetch teacher's assigned classes for selection (with school grouping)
  const { data: teacherClassesData = { schoolsWithClasses: [], classes: [] }, isLoading: classesLoading } = useQuery<any>({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teacher classes');
      const result = await response.json();
      // Return full response with school grouping
      if (Array.isArray(result)) {
        return { schoolsWithClasses: [], classes: result };
      }
      return {
        schoolsWithClasses: result?.schoolsWithClasses || [],
        classes: result?.classes || result?.schoolsWithClasses?.flatMap((school: any) => school.classes) || []
      };
    },
    enabled: !!user
  });
  
  // Extract flat list of classes for backward compatibility
  const teacherClasses = teacherClassesData.classes || [];
  const schoolsWithClasses = teacherClassesData.schoolsWithClasses || [];

  // Fetch teacher profile to get assigned subjects from school interface
  const { data: teacherProfile = {}, isLoading: profileLoading } = useQuery<any>({
    queryKey: ['/api/teacher/profile'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/profile', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teacher profile');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch students for selected class
  const { data: classStudents = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/students', attendanceForm.classId],
    queryFn: async () => {
      if (!attendanceForm.classId) return [];
      const response = await fetch(`/api/teacher/students?classId=${attendanceForm.classId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch class students');
      const result = await response.json();
      return Array.isArray(result) ? result : (result?.students || []);
    },
    enabled: !!user && !!attendanceForm.classId
  });

  // Fetch teacher attendance data from PostgreSQL API
  const { data: attendance = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/teacher/attendance'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/attendance', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const result = await response.json();
      // Extract attendance array from response
      return result.attendance || result || [];
    },
    enabled: !!user
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any) => {
      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/attendance'] });
      setIsMarkAttendanceOpen(false);
      setAttendanceForm({ classId: '', date: new Date().toISOString().split('T')[0], subject: '', students: [], notes: '' });
      toast({
        title: language === 'fr' ? 'Présences marquées' : 'Attendance marked',
        description: language === 'fr' ? 'Les présences ont été enregistrées avec succès.' : 'Attendance has been recorded successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de marquer les présences.' : 'Failed to mark attendance.',
        variant: 'destructive'
      });
    }
  });

  const handleMarkAttendance = async () => {
    if (attendanceForm.classId && attendanceForm.date && attendanceForm.subject && attendanceForm.students.length > 0) {
      const attendanceData = {
        classId: parseInt(attendanceForm.classId),
        date: attendanceForm.date,
        subject: attendanceForm.subject,
        students: attendanceForm.students,
        notes: attendanceForm.notes
      };

      // If offline, queue for later sync
      if (!isOnline) {
        // Queue each student's attendance separately for proper sync
        for (const student of attendanceForm.students) {
          await queueAction('attendance', 'create', {
            studentId: student.id,
            classId: parseInt(attendanceForm.classId),
            schoolId: user?.schoolId || 0,
            date: attendanceForm.date,
            status: student.status,
            notes: attendanceForm.notes
          }, user?.id || 0);
        }
        
        setIsMarkAttendanceOpen(false);
        setAttendanceForm({ classId: '', date: new Date().toISOString().split('T')[0], subject: '', students: [], notes: '' });
        
        toast({
          title: language === 'fr' ? '📴 Marqué hors ligne' : '📴 Marked offline',
          description: language === 'fr' ? 
            'Présences enregistrées localement. Elles seront synchronisées automatiquement quand vous serez en ligne.' : 
            'Attendance recorded locally. Will sync automatically when you\'re online.',
          duration: 5000
        });
        return;
      }

      // If online, mark attendance normally
      markAttendanceMutation.mutate(attendanceData);
    }
  };

  // Update students list when class changes - use stable reference to prevent infinite loops
  const classStudentsKey = useMemo(() => 
    classStudents.map((s: any) => s.id).join(','), 
    [classStudents]
  );
  
  React.useEffect(() => {
    if (classStudents.length > 0) {
      const studentsWithStatus = classStudents.map((student: any) => ({
        id: student.id,
        name: student.name || student.firstName + ' ' + student.lastName,
        status: 'present' // Default to present
      }));
      setAttendanceForm(prev => ({ ...prev, students: studentsWithStatus }));
    } else {
      setAttendanceForm(prev => ({ ...prev, students: [] }));
    }
  }, [classStudentsKey]);

  // Cycle through 3 statuses: present -> late -> absent -> present
  const toggleStudentStatus = (studentId: number) => {
    setAttendanceForm(prev => ({
      ...prev,
      students: prev.students.map(student => {
        if (student.id !== studentId) return student;
        // Cycle: present -> late -> absent -> present
        const nextStatus = student.status === 'present' ? 'late' : 
                          student.status === 'late' ? 'absent' : 'present';
        return { ...student, status: nextStatus };
      })
    }));
  };

  // Set specific status for a student
  const setStudentStatus = (studentId: number, status: 'present' | 'late' | 'absent') => {
    setAttendanceForm(prev => ({
      ...prev,
      students: prev.students.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    }));
  };

  // Get teacher's assigned subjects from school interface
  const getAssignedSubjects = () => {
    const subjects = new Set<string>();
    
    // Get subjects from teacher profile (assigned by school)
    if (teacherProfile?.teachingSubjects && Array.isArray(teacherProfile.teachingSubjects)) {
      teacherProfile.teachingSubjects.forEach((subject: string) => subjects.add(subject));
    }
    
    // Also get subjects from classes (backup/alternative source)
    if (Array.isArray(teacherClasses)) {
      teacherClasses.forEach((cls: any) => {
        if (cls.subject) subjects.add(cls.subject);
        if (cls.subjects && Array.isArray(cls.subjects)) {
          cls.subjects.forEach((subj: string) => subjects.add(subj));
        }
      });
    }
    
    // Fallback subjects if none found
    if (subjects.size === 0) {
      return ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Éducation Physique'];
    }
    
    return Array.from(subjects).sort();
  };

  // Export attendance data function
  const handleExportAttendance = () => {
    try {
      const exportData = Array.isArray(attendance) ? attendance : [];
      
      if (exportData.length === 0) {
        toast({
          title: language === 'fr' ? 'Aucune donnée' : 'No data',
          description: language === 'fr' ? 'Aucune donnée de présence à exporter' : 'No attendance data to export',
          variant: 'destructive'
        });
        return;
      }

      // Create CSV content
      const headers = ['Élève', 'Classe', 'Date', 'Statut', 'Motif', 'Marqué le'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(record => [
          record.studentName,
          record.className,
          record.date,
          record.status,
          record.reason || '',
          record.markedAt
        ].join(','))
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `presences-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: language === 'fr' ? 'Export réussi' : 'Export successful',
        description: language === 'fr' ? 
          `${exportData.length} enregistrements exportés` : 
          `${exportData.length} records exported`
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'export' : 'Export error',
        description: language === 'fr' ? 'Erreur lors de l\'export' : 'Error during export',
        variant: 'destructive'
      });
    }
  };

  const text = {
    fr: {
      title: 'Gestion des Présences',
      subtitle: 'Suivez et gérez les présences de tous vos élèves',
      loading: 'Chargement des présences...',
      noData: 'Aucune donnée de présence',
      stats: {
        present: 'Présents',
        absent: 'Absents',
        late: 'Retards',
        excused: 'Justifiés'
      },
      status: {
        present: 'Présent',
        absent: 'Absent',
        late: 'Retard',
        excused: 'Justifié'
      },
      filters: {
        all: 'Tous',
        today: 'Aujourd\'hui',
        week: 'Cette semaine',
        month: 'Ce mois'
      },
      actions: {
        markAttendance: 'Marquer Présences',
        generateReport: 'Générer Rapport',
        export: 'Exporter',
        viewDetails: 'Voir Détails'
      },
      table: {
        student: 'Élève',
        class: 'Classe',
        date: 'Date',
        status: 'Statut',
        reason: 'Motif',
        actions: 'Actions'
      }
    },
    en: {
      title: 'Attendance Management',
      subtitle: 'Track and manage attendance for all your students',
      loading: 'Loading attendance...',
      noData: 'No attendance data',
      stats: {
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused'
      },
      status: {
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused'
      },
      filters: {
        all: 'All',
        today: 'Today',
        week: 'This week',
        month: 'This month'
      },
      actions: {
        markAttendance: 'Mark Attendance',
        generateReport: 'Generate Report',
        export: 'Export',
        viewDetails: 'View Details'
      },
      table: {
        student: 'Student',
        class: 'Class',
        date: 'Date',
        status: 'Status',
        reason: 'Reason',
        actions: 'Actions'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const todayAttendance = (Array.isArray(attendance) ? attendance : []).filter(record => record.date === selectedDate);
  const presentCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter(record => record.status === 'present').length;
  const absentCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter(record => record.status === 'absent').length;
  const lateCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter(record => record.status === 'late').length;
  const excusedCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter(record => record.status === 'excused').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />;
      case 'excused':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-orange-100 text-orange-800',
      excused: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => handleExportAttendance()}
            data-testid="button-export-attendance"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsMarkAttendanceOpen(true)}
            data-testid="button-blue-mark-attendance"
          >
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            {t?.actions?.markAttendance}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.present}</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.absent}</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.late}</p>
                <p className="text-2xl font-bold text-orange-600">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.excused}</p>
                <p className="text-2xl font-bold text-blue-600">{excusedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marquer Présences Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
              Marquer les Présences
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button 
              className="bg-green-600 hover:bg-green-700 flex-1 mr-4" 
              data-testid="button-mark-attendance"
              onClick={() => setIsMarkAttendanceOpen(true)}
            >
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
              Marquer les Présences
            </Button>
            <div className="text-sm text-gray-500">
              Date: {selectedDate}
            </div>
          </div>

          {/* Mark Attendance Modal */}
          {isMarkAttendanceOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Marquer les Présences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'fr' ? 'Classe Assignée par École' : 'Assigned Class by School'}
                    </label>
                    {classesLoading ? (
                      <div className="w-full border rounded-md px-3 py-2 bg-gray-50">
                        {language === 'fr' ? 'Chargement des classes...' : 'Loading classes...'}
                      </div>
                    ) : schoolsWithClasses.length === 0 && teacherClasses.length === 0 ? (
                      <div className="w-full border rounded-md px-3 py-2 bg-yellow-50 text-yellow-800 text-sm">
                        {language === 'fr' 
                          ? '⚠️ Aucune classe assignée. Demandez à votre directeur de créer votre emploi du temps.' 
                          : '⚠️ No classes assigned. Ask your director to create your timetable.'}
                      </div>
                    ) : (
                      <select
                        value={attendanceForm.classId}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, classId: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                        data-testid="select-assigned-class"
                      >
                        <option value="">{language === 'fr' ? 'Sélectionner une classe' : 'Select a class'}</option>
                        {schoolsWithClasses.length > 0 ? (
                          // Group classes by school
                          schoolsWithClasses.map((school: any) => (
                            <optgroup key={school.schoolId} label={`🏫 ${school.schoolName}`}>
                              {(school.classes || []).map((classe: any) => (
                                <option key={classe.id} value={classe.id}>
                                  {classe.name || classe.className || ''} 
                                  {classe.subject ? ` - ${classe.subject}` : ''} 
                                  {classe.subjects?.length > 1 ? ` (+${classe.subjects.length - 1})` : ''}
                                </option>
                              ))}
                            </optgroup>
                          ))
                        ) : (
                          // Fallback to flat list if no school grouping
                          Array.isArray(teacherClasses) && teacherClasses.map((classe: any) => (
                            <option key={classe.id} value={classe.id}>
                              {classe.name || classe.className || ''} - {classe.subject || 'Matière'}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                    {schoolsWithClasses.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {language === 'fr' 
                          ? `📊 ${teacherClasses.length} classe(s) dans ${schoolsWithClasses.length} école(s)` 
                          : `📊 ${teacherClasses.length} class(es) in ${schoolsWithClasses.length} school(s)`}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Matière Assignée</label>
                    {profileLoading ? (
                      <div className="w-full border rounded-md px-3 py-2 bg-gray-50">
                        Chargement des matières...
                      </div>
                    ) : (
                      <select
                        value={attendanceForm.subject}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                        data-testid="select-assigned-subject"
                      >
                        <option value="">Sélectionner une matière</option>
                        {getAssignedSubjects().map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Matières assignées par l'école lors de la création de votre compte
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes (optionnel)</label>
                    <textarea
                      value={attendanceForm.notes}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes sur la séance..."
                      rows={3}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  {/* Liste des élèves pour marquer les présences */}
                  {attendanceForm.classId && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-700">Élèves de la classe:</p>
                        {studentsLoading && (
                          <div className="text-xs text-blue-600">Chargement des élèves...</div>
                        )}
                      </div>
                      
                      {attendanceForm.students.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {attendanceForm.students.map((student) => (
                            <div 
                              key={student.id}
                              className={`flex items-center justify-between p-2 rounded border transition-colors ${
                                student.status === 'present' ? 'bg-green-50 border-green-200' : 
                                student.status === 'late' ? 'bg-orange-50 border-orange-200' : 
                                'bg-red-50 border-red-200'
                              }`}
                            >
                              <span className="text-sm font-medium flex-1">{student.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(student.id, 'present')}
                                  className={`p-1.5 rounded transition-colors ${
                                    student.status === 'present' 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-100 text-gray-500 hover:bg-green-100'
                                  }`}
                                  title="Présent"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(student.id, 'late')}
                                  className={`p-1.5 rounded transition-colors ${
                                    student.status === 'late' 
                                      ? 'bg-orange-500 text-white' 
                                      : 'bg-gray-100 text-gray-500 hover:bg-orange-100'
                                  }`}
                                  title="Retard"
                                >
                                  <Clock className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(student.id, 'absent')}
                                  className={`p-1.5 rounded transition-colors ${
                                    student.status === 'absent' 
                                      ? 'bg-red-500 text-white' 
                                      : 'bg-gray-100 text-gray-500 hover:bg-red-100'
                                  }`}
                                  title="Absent"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : attendanceForm.classId && !studentsLoading ? (
                        <p className="text-xs text-gray-500">Aucun élève trouvé dans cette classe.</p>
                      ) : !studentsLoading ? (
                        <p className="text-xs text-gray-500">Sélectionnez une classe pour voir les élèves.</p>
                      ) : null}
                      
                      {attendanceForm.students.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span className="text-green-600">Présents: {attendanceForm.students.filter(s => s.status === 'present').length}</span>
                            <span className="text-orange-600">Retards: {attendanceForm.students.filter(s => s.status === 'late').length}</span>
                            <span className="text-red-600">Absents: {attendanceForm.students.filter(s => s.status === 'absent').length}</span>
                            <span>Total: {attendanceForm.students.length}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleMarkAttendance}
                      disabled={markAttendanceMutation.isPending || !attendanceForm.classId || !attendanceForm.date || !attendanceForm.subject || attendanceForm.students.length === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {markAttendanceMutation.isPending ? 'Enregistrement...' : `Marquer Présences (${attendanceForm.students.length} élèves)`}
                    </Button>
                    <Button 
                      onClick={() => setIsMarkAttendanceOpen(false)}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Présences Récentes</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">{t?.filters?.all}</option>
                  <option value="present">{t?.status?.present}</option>
                  <option value="absent">{t?.status?.absent}</option>
                  <option value="late">{t?.status?.late}</option>
                  <option value="excused">{t?.status?.excused}</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(attendance) ? attendance.length : 0) === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Commencez par marquer les présences de vos élèves.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t?.table?.student}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t?.table?.class}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t?.table?.date}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t?.table?.status}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t?.table?.reason}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t?.table?.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(attendance) ? attendance : []).map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                          <span className="ml-3 font-medium">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.className}</td>
                      <td className="py-3 px-4 text-gray-600">{record.date}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4 text-gray-600">{record.reason || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalTeacherAttendance;