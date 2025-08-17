import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, TrendingUp, CheckCircle, XCircle, 
  Clock, AlertCircle, BookOpen, User, Calendar,
  BarChart3, Activity
} from 'lucide-react';

interface AttendanceRecord {
  id: number;
  studentId: number;
  subject: string;
  subjectId: number;
  teacher: string;
  teacherId: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason: string;
  notes: string;
  markedAt: string;
  period: string;
}

const FunctionalStudentAttendance: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Fetch attendance data from PostgreSQL API
  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/student/attendance'],
    enabled: !!user
  });

  const text = {
    fr: {
      title: 'Ma Présence',
      subtitle: 'Suivi de votre assiduité scolaire',
      loading: 'Chargement des données de présence...',
      stats: {
        overall: 'Taux Global',
        present: 'Présent',
        absent: 'Absent',
        late: 'Retard',
        excused: 'Excusé',
        total: 'Total Cours'
      },
      filters: {
        all: 'Tous',
        present: 'Présent',
        absent: 'Absent',
        late: 'Retard',
        excused: 'Excusé',
        allSubjects: 'Toutes matières'
      },
      recentActivity: 'Activité Récente',
      date: 'Date',
      subject: 'Matière',
      teacher: 'Professeur',
      status: 'Statut',
      reason: 'Raison',
      period: 'Période',
      notes: 'Notes',
      noRecords: 'Aucun enregistrement trouvé',
      noRecordsDesc: 'Aucune donnée de présence ne correspond aux filtres sélectionnés.'
    },
    en: {
      title: 'My Attendance',
      subtitle: 'Track your school attendance',
      loading: 'Loading attendance data...',
      stats: {
        overall: 'Overall Rate',
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused',
        total: 'Total Classes'
      },
      filters: {
        all: 'All',
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused',
        allSubjects: 'All subjects'
      },
      recentActivity: 'Recent Activity',
      date: 'Date',
      subject: 'Subject',
      teacher: 'Teacher',
      status: 'Status',
      reason: 'Reason',
      period: 'Period',
      notes: 'Notes',
      noRecords: 'No records found',
      noRecordsDesc: 'No attendance data matches the selected filters.'
    }
  };

  const t = text[language as keyof typeof text];

  // Calculate statistics from real data
  const calculateStats = () => {
    const total = (Array.isArray(attendanceRecords) ? attendanceRecords.length : 0);
    const present = (Array.isArray(attendanceRecords) ? attendanceRecords : []).filter(r => r.status === 'present').length;
    const absent = (Array.isArray(attendanceRecords) ? attendanceRecords : []).filter(r => r.status === 'absent').length;
    const late = (Array.isArray(attendanceRecords) ? attendanceRecords : []).filter(r => r.status === 'late').length;
    const excused = (Array.isArray(attendanceRecords) ? attendanceRecords : []).filter(r => r.status === 'excused').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, rate };
  };

  const stats = calculateStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      case 'excused': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Filter records
  const filteredRecords = (Array.isArray(attendanceRecords) ? attendanceRecords : []).filter(record => {
    if (!record) return false;
    const statusMatch = filterStatus === 'all' || record.status === filterStatus;
    const subjectMatch = filterSubject === 'all' || record.subject === filterSubject;
    return statusMatch && subjectMatch;
  });

  // Get unique subjects for filter
  const subjects = Array.from(new Set((Array.isArray(attendanceRecords) ? attendanceRecords : []).map(r => r.subject)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.rate}%</div>
              <div className="text-sm text-gray-600">{t?.stats?.overall}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.present}</div>
              <div className="text-sm text-gray-600">{t?.stats?.present}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.absent}</div>
              <div className="text-sm text-gray-600">{t?.stats?.absent}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.late}</div>
              <div className="text-sm text-gray-600">{t?.stats?.late}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.excused}</div>
              <div className="text-sm text-gray-600">{t?.stats?.excused}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">{t?.stats?.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              {t?.filters?.all}
            </Button>
            <Button
              variant={filterStatus === 'present' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('present')}
              size="sm"
            >
              {t?.filters?.present}
            </Button>
            <Button
              variant={filterStatus === 'absent' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('absent')}
              size="sm"
            >
              {t?.filters?.absent}
            </Button>
            <Button
              variant={filterStatus === 'late' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('late')}
              size="sm"
            >
              {t?.filters?.late}
            </Button>
            <Button
              variant={filterStatus === 'excused' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('excused')}
              size="sm"
            >
              {t?.filters?.excused}
            </Button>
          </div>
          
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e?.target?.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white"
          >
            <option value="all">{t?.filters?.allSubjects}</option>
            {(Array.isArray(subjects) ? subjects : []).map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Attendance Records */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-white">
            <h3 className="text-xl font-semibold text-gray-900">{t.recentActivity}</h3>
          </CardHeader>
          <CardContent className="bg-white">
            {(Array.isArray(filteredRecords) ? filteredRecords.length : 0) > 0 ? (
              <div className="space-y-4">
                {(Array.isArray(filteredRecords) ? filteredRecords : []).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <Badge className={getStatusColor(record.status)}>
                          {t.filters[record.status as keyof typeof t.filters] || record.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{record.period}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{record.subject}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{record.teacher}</span>
                        </div>
                        
                        {record.reason && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{t.reason}:</span> {record.reason}
                          </div>
                        )}
                        
                        {record.notes && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{t.notes}:</span> {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(record.markedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noRecords}</h3>
                <p className="text-gray-600">{t.noRecordsDesc}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunctionalStudentAttendance;