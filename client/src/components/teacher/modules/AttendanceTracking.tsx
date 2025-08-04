import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, UserCheck, UserX, Clock, AlertTriangle, 
  Calendar, TrendingUp, BarChart3, Download, Filter, Search, Phone
} from 'lucide-react';

interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  markedAt: string;
  parentNotified: boolean;
}

interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  classAverages: Array<{
    className: string;
    rate: number;
  }>;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  parentPhone?: string;
  parentEmail?: string;
}

const AttendanceTracking: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch attendance records from API
  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/teacher/attendance', selectedDate, selectedClass],
    queryFn: async () => {
      console.log('[ATTENDANCE_TRACKING] 🔍 Fetching attendance records...');
      let url = `/api/teacher/attendance?date=${selectedDate}`;
      if (selectedClass !== 'all') {
        url += `&class=${selectedClass}`;
      }
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ATTENDANCE_TRACKING] ❌ Failed to fetch attendance');
        throw new Error('Failed to fetch attendance');
      }
      const data = await response.json();
      console.log('[ATTENDANCE_TRACKING] ✅ Attendance loaded:', data.length, 'records');
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch attendance statistics from API
  const { data: statsData, isLoading: statsLoading } = useQuery<AttendanceStats>({
    queryKey: ['/api/teacher/attendance/stats', selectedDate],
    queryFn: async () => {
      console.log('[ATTENDANCE_TRACKING] 🔍 Fetching attendance stats...');
      const response = await fetch(`/api/teacher/attendance/stats?date=${selectedDate}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ATTENDANCE_TRACKING] ❌ Failed to fetch stats');
        throw new Error('Failed to fetch attendance stats');
      }
      const data = await response.json();
      console.log('[ATTENDANCE_TRACKING] ✅ Stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch students from API
  const { data: studentsData = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students'],
    queryFn: async () => {
      console.log('[ATTENDANCE_TRACKING] 🔍 Fetching students...');
      const response = await fetch('/api/teacher/students', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ATTENDANCE_TRACKING] ❌ Failed to fetch students');
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('[ATTENDANCE_TRACKING] ✅ Students loaded:', data.length);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, notes }: { studentId: number; status: string; notes?: string }) => {
      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          status,
          notes: notes || ''
        }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/attendance/stats'] });
      toast({
        title: language === 'fr' ? 'Présence marquée' : 'Attendance Marked',
        description: language === 'fr' ? 'La présence a été mise à jour.' : 'Attendance has been updated.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de marquer la présence.' : 'Failed to mark attendance.',
        variant: 'destructive'
      });
    }
  });

  // Send parent notification mutation
  const notifyParentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch('/api/teacher/attendance/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: selectedDate
        }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to notify parent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/attendance'] });
      toast({
        title: language === 'fr' ? 'Parent notifié' : 'Parent Notified',
        description: language === 'fr' ? 'Le parent a été notifié par SMS.' : 'Parent has been notified via SMS.'
      });
    }
  });

  const text = {
    fr: {
      title: 'Suivi Présence',
      subtitle: 'Gérez la présence de vos élèves et communiquez avec les parents',
      loading: 'Chargement des présences...',
      noData: 'Aucune donnée de présence',
      dateSelector: 'Date',
      classSelector: 'Classe',
      searchPlaceholder: 'Rechercher un élève...',
      stats: {
        totalStudents: 'Total Élèves',
        presentCount: 'Présents',
        absentCount: 'Absents',
        lateCount: 'Retards',
        attendanceRate: 'Taux Présence'
      },
      status: {
        present: 'Présent',
        absent: 'Absent',
        late: 'Retard',
        excused: 'Excusé'
      },
      actions: {
        markPresent: 'Présent',
        markAbsent: 'Absent',
        markLate: 'Retard',
        markExcused: 'Excusé',
        notifyParent: 'Notifier Parent',
        export: 'Exporter',
        bulkAction: 'Action Groupée'
      },
      filters: {
        all: 'Tous',
        allClasses: 'Toutes les classes'
      },
      table: {
        student: 'Élève',
        class: 'Classe',
        status: 'Statut',
        time: 'Heure',
        notes: 'Notes',
        actions: 'Actions'
      }
    },
    en: {
      title: 'Attendance Tracking',
      subtitle: 'Track your students attendance and communicate with parents',
      loading: 'Loading attendance...',
      noData: 'No attendance data',
      dateSelector: 'Date',
      classSelector: 'Class',
      searchPlaceholder: 'Search student...',
      stats: {
        totalStudents: 'Total Students',
        presentCount: 'Present',
        absentCount: 'Absent',
        lateCount: 'Late',
        attendanceRate: 'Attendance Rate'
      },
      status: {
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused'
      },
      actions: {
        markPresent: 'Present',
        markAbsent: 'Absent',
        markLate: 'Late',
        markExcused: 'Excused',
        notifyParent: 'Notify Parent',
        export: 'Export',
        bulkAction: 'Bulk Action'
      },
      filters: {
        all: 'All',
        allClasses: 'All classes'
      },
      table: {
        student: 'Student',
        class: 'Class',
        status: 'Status',
        time: 'Time',
        notes: 'Notes',
        actions: 'Actions'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Filter attendance records
  const filteredAttendance = (Array.isArray(attendanceData) ? attendanceData : []).filter(record => {
    const matchesSearch = record?.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record?.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAttendance = (studentId: number, status: string) => {
    markAttendanceMutation.mutate({ studentId, status });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <UserX className="w-4 h-4 text-red-600" />;
      case 'late':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'excused':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  if (attendanceLoading || statsLoading || studentsLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <Label>{t?.dateSelector}</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e?.target?.value)}
                className="w-auto"
              />
            </div>
            <div className="flex-1">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={t?.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>{t?.classSelector}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.filters?.allClasses}</SelectItem>
                  <SelectItem value="6ème A">6ème A</SelectItem>
                  <SelectItem value="6ème B">6ème B</SelectItem>
                  <SelectItem value="5ème A">5ème A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.filters?.all}</SelectItem>
                  <SelectItem value="present">{t?.status?.present}</SelectItem>
                  <SelectItem value="absent">{t?.status?.absent}</SelectItem>
                  <SelectItem value="late">{t?.status?.late}</SelectItem>
                  <SelectItem value="excused">{t?.status?.excused}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalStudents}</p>
                <p className="text-2xl font-bold">{statsData?.totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.presentCount}</p>
                <p className="text-2xl font-bold text-green-600">{statsData?.presentCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.absentCount}</p>
                <p className="text-2xl font-bold text-red-600">{statsData?.absentCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.lateCount}</p>
                <p className="text-2xl font-bold text-orange-600">{statsData?.lateCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.attendanceRate}</p>
                <p className="text-2xl font-bold text-purple-600">{statsData?.attendanceRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Présences du {selectedDate}</h3>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredAttendance) ? filteredAttendance.length : 0) === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucune donnée de présence pour cette date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t?.table?.student}</th>
                    <th className="text-left p-3">{t?.table?.class}</th>
                    <th className="text-center p-3">{t?.table?.status}</th>
                    <th className="text-center p-3">{t?.table?.time}</th>
                    <th className="text-left p-3">{t?.table?.notes}</th>
                    <th className="text-center p-3">{t?.table?.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(filteredAttendance) ? filteredAttendance : []).map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                          <span className="ml-2 font-medium">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="p-3">{record.className}</td>
                      <td className="p-3 text-center">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="p-3 text-center text-sm text-gray-600">
                        {record.markedAt ? new Date(record.markedAt).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '-'}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {record.notes || '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAttendance(record.studentId, 'present')}
                            className="h-8 w-8 p-0"
                            title={t?.actions?.markPresent}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAttendance(record.studentId, 'absent')}
                            className="h-8 w-8 p-0"
                            title={t?.actions?.markAbsent}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAttendance(record.studentId, 'late')}
                            className="h-8 w-8 p-0"
                            title={t?.actions?.markLate}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          {record.status === 'absent' && !record.parentNotified && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => notifyParentMutation.mutate(record.studentId)}
                              className="h-8 w-8 p-0"
                              title={t?.actions?.notifyParent}
                              disabled={notifyParentMutation.isPending}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
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

export default AttendanceTracking;