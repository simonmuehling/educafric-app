import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Calendar, Clock, AlertTriangle, Users, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const SchoolAttendanceManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Présence École',
      subtitle: 'La direction peut aussi signaler les absences comme l\'enseignant',
      totalPresent: 'Présents Aujourd\'hui',
      totalAbsent: 'Absents',
      lateArrivals: 'Retards',
      attendanceRate: 'Taux de Présence',
      selectDate: 'Sélectionner la date',
      selectClass: 'Sélectionner la classe',
      markAttendance: 'Marquer Présence',
      student: 'Élève',
      status: 'Statut',
      present: 'Présent',
      absent: 'Absent',
      late: 'Retard',
      excused: 'Excusé',
      saveAttendance: 'Enregistrer Présence',
      cancel: 'Annuler',
      attendanceMarked: 'Présence marquée',
      viewAttendance: 'Voir Présence',
      directorNote: 'Note Direction',
      addNote: 'Ajouter Note'
    },
    en: {
      title: 'School Attendance',
      subtitle: 'Directors can also mark absences like teachers',
      totalPresent: 'Present Today',
      totalAbsent: 'Absent',
      lateArrivals: 'Late Arrivals',
      attendanceRate: 'Attendance Rate',
      selectDate: 'Select date',
      selectClass: 'Select class',
      markAttendance: 'Mark Attendance',
      student: 'Student',
      status: 'Status',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      saveAttendance: 'Save Attendance',
      cancel: 'Cancel',
      attendanceMarked: 'Attendance marked',
      viewAttendance: 'View Attendance',
      directorNote: 'Director Note',
      addNote: 'Add Note'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch classes for selection (Director API)
  const { data: classesResponse = { classes: [] } } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: async () => {
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });
  
  const classes = classesResponse.classes || [];

  // Fetch students for selected class (Director API)
  const { data: studentsResponse = { students: [] } } = useQuery({
    queryKey: ['/api/director/students', selectedClass],
    queryFn: async () => {
      if (!selectedClass) return { students: [] };
      const response = await fetch(`/api/director/students?classId=${selectedClass}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    enabled: !!selectedClass
  });
  
  const students = studentsResponse.students || [];

  // Fetch attendance data for selected class and date
  const { data: attendanceData = [] } = useQuery({
    queryKey: ['/api/attendance', selectedClass, selectedDate],
    queryFn: async () => {
      if (!selectedClass || !selectedDate) return [];
      const response = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    enabled: !!(selectedClass && selectedDate)
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any) => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({
        title: language === 'fr' ? 'Présence enregistrée' : 'Attendance recorded',
        description: language === 'fr' ? 'La présence a été enregistrée avec succès.' : 'Attendance has been recorded successfully.'
      });
      setShowMarkAttendance(false);
    },
    onError: (error) => {
      console.error('Error marking attendance:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de l\'enregistrement de la présence.' : 'Error recording attendance.',
        variant: 'destructive'
      });
    }
  });

  // Calculate attendance statistics
  const todayAttendance = (Array.isArray(attendanceData) ? attendanceData : []).filter((a: any) => 
    new Date(a.date).toDateString() === new Date().toDateString()
  );
  
  const presentCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter((a: any) => a.status === 'present').length;
  const absentCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter((a: any) => a.status === 'absent').length;
  const lateCount = (Array.isArray(todayAttendance) ? todayAttendance : []).filter((a: any) => a.status === 'late').length;
  const totalCount = (Array.isArray(todayAttendance) ? todayAttendance.length : 0);
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const stats = [
    {
      title: t.totalPresent,
      value: presentCount.toString(),
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t.totalAbsent,
      value: absentCount.toString(),
      icon: <XCircle className="w-5 h-5" />,
      trend: { value: 1, isPositive: false },
      gradient: 'red' as const
    },
    {
      title: t.lateArrivals,
      value: lateCount.toString(),
      icon: <Clock className="w-5 h-5" />,
      trend: { value: 0, isPositive: true },
      gradient: 'orange' as const
    },
    {
      title: t.attendanceRate,
      value: `${attendanceRate}%`,
      icon: <UserCheck className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
      gradient: 'blue' as const
    }
  ];

  const handleMarkAttendance = (studentId: number, status: string) => {
    const student = students.find((s: any) => s.id === studentId);
    const attendanceRecord = {
      studentId,
      classId: parseInt(selectedClass),
      date: new Date(selectedDate),
      status,
      teacherId: null, // Director marking attendance
      directorNote: 'Marqué par la direction',
      timestamp: new Date()
    };

    // Send notification to parent and student if status is absent or late
    if (status === 'absent' || status === 'late') {
      sendAttendanceNotification(student, status);
    }

    markAttendanceMutation.mutate(attendanceRecord);
  };

  // Function to send attendance notifications
  const sendAttendanceNotification = async (student: any, status: string) => {
    try {
      const notificationData = {
        studentId: student.id,
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        status: status,
        date: selectedDate,
        className: classes.find((c: any) => c.id.toString() === selectedClass)?.name,
        message: status === 'absent' 
          ? `${student.firstName || 'Votre enfant'} est marqué(e) absent(e) aujourd'hui`
          : `${student.firstName || 'Votre enfant'} est arrivé(e) en retard aujourd'hui`,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        timestamp: new Date()
      };

      // Send notification via API
      const response = await fetch('/api/notifications/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? '📱 Notification envoyée' : '📱 Notification Sent',
          description: language === 'fr' 
            ? `Parent et élève notifiés pour ${status === 'absent' ? 'absence' : 'retard'}`
            : `Parent and student notified for ${status}`
        });
      } else {
        console.warn('Failed to send notification:', await response.text());
        toast({
          title: language === 'fr' ? '⚠️ Notification partiellement envoyée' : '⚠️ Notification Partially Sent',
          description: language === 'fr' 
            ? 'Présence marquée mais notification peut avoir échoué'
            : 'Attendance marked but notification may have failed',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't show error toast to avoid spamming, just log it
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return t[status as keyof typeof t] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(stats) ? stats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Attendance Controls */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Présences</h3>
          <Button 
            onClick={() => setShowMarkAttendance(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            size="sm"
            disabled={!selectedClass}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t.markAttendance}</span>
            <span className="sm:hidden">Marquer</span>
          </Button>
        </div>

        {/* Date and Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.selectDate}
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e?.target?.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.selectClass}
            </label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e?.target?.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">{t.selectClass}</option>
              {(Array.isArray(classes) ? classes : []).map((classItem: any) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name || classItem.className || `Classe ${classItem.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance List */}
        {selectedClass && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Présence - {classes.find((c: any) => c?.id?.toString() === selectedClass)?.name || 'Classe sélectionnée'} - {selectedDate}
            </h4>
            
            {(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) > 0 ? (
              <div className="space-y-2">
                {(Array.isArray(students) ? students : []).map((student: any) => {
                  const attendance = attendanceData.find((a: any) => 
                    a.studentId === student.id && 
                    new Date(a.date).toDateString() === new Date(selectedDate).toDateString()
                  );
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName || ''} {student.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-600">ID: {student.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {attendance && (
                          <Badge className={getStatusColor(attendance.status)}>
                            {getStatusText(attendance.status)}
                          </Badge>
                        )}
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={attendance?.status === 'present' ? 'default' : 'outline'}
                            onClick={() => handleMarkAttendance(student.id, 'present')}
                            className="text-xs"
                          >
                            {t.present}
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance?.status === 'absent' ? 'default' : 'outline'}
                            onClick={() => handleMarkAttendance(student.id, 'absent')}
                            className="text-xs"
                          >
                            {t.absent}
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance?.status === 'late' ? 'default' : 'outline'}
                            onClick={() => handleMarkAttendance(student.id, 'late')}
                            className="text-xs"
                          >
                            {t.late}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedClass ? 'Aucun élève trouvé pour cette classe' : 'Sélectionnez une classe pour voir les élèves'}
              </div>
            )}
          </div>
        )}
      </ModernCard>
    </div>
  );
};

export default SchoolAttendanceManagement;