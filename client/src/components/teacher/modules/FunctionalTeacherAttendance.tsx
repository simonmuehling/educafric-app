import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, Clock, AlertTriangle,
  Calendar, Users, Filter, Download,
  Search, Eye, Edit
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

  // Fetch teacher's assigned classes for selection
  const { data: teacherClasses = [], isLoading: classesLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/classes'],
    enabled: !!user
  });

  // Fetch teacher attendance data from PostgreSQL API
  const { data: attendance = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/teacher/attendance'],
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
        title: 'Présences marquées',
        description: 'Les présences ont été enregistrées avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer les présences.',
        variant: 'destructive'
      });
    }
  });

  const handleMarkAttendance = () => {
    if (attendanceForm.classId && attendanceForm.date && attendanceForm.subject) {
      markAttendanceMutation.mutate({
        classId: parseInt(attendanceForm.classId),
        date: attendanceForm.date,
        subject: attendanceForm.subject,
        students: attendanceForm.students,
        notes: attendanceForm.notes
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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'excused':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t?.actions?.export}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
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
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <XCircle className="w-6 h-6 text-red-600" />
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
                <Clock className="w-6 h-6 text-orange-600" />
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
                <AlertTriangle className="w-6 h-6 text-blue-600" />
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
              <CheckCircle className="w-5 h-5 mr-2 inline" />
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
              <CheckCircle className="w-4 h-4 mr-2" />
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
                    <label className="text-sm font-medium">Classe Assignée</label>
                    {classesLoading ? (
                      <div className="w-full border rounded-md px-3 py-2 bg-gray-50">
                        Chargement des classes...
                      </div>
                    ) : (
                      <select
                        value={attendanceForm.classId}
                        onChange={(e) => setAttendanceForm(prev => ({ ...prev, classId: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                        data-testid="select-assigned-class"
                      >
                        <option value="">Sélectionner une classe</option>
                        {Array.isArray(teacherClasses) && teacherClasses.map((classe) => (
                          <option key={classe.id} value={classe.id}>
                            {classe.name} - {classe.subject || 'Matière'} ({classe.students || 0} élèves)
                          </option>
                        ))}
                      </select>
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
                    <label className="text-sm font-medium">Matière</label>
                    <input
                      type="text"
                      value={attendanceForm.subject}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Ex: Mathématiques"
                      className="w-full border rounded-md px-3 py-2"
                    />
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
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-2">Info:</p>
                    <p className="text-xs text-gray-500">
                      La liste des élèves sera automatiquement chargée pour la classe sélectionnée.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleMarkAttendance}
                      disabled={markAttendanceMutation.isPending || !attendanceForm.classId || !attendanceForm.date || !attendanceForm.subject}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {markAttendanceMutation.isPending ? 'Enregistrement...' : 'Marquer Présences'}
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
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e?.target?.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
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
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
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