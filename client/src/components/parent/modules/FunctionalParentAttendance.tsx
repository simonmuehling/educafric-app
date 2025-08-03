import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Calendar, Filter, Search, Eye, 
  TrendingUp, Users, FileText, Phone
} from 'lucide-react';

interface ParentAttendance {
  id: number;
  studentName: string;
  className: string;
  date: string;
  status: string;
  arrivalTime: string;
  departureTime: string;
  excusedReason: string;
  teacherName: string;
  period: string;
  subject: string;
  lateMinutes: number;
  notificationSent: boolean;
  parentNotified: boolean;
}

const FunctionalParentAttendance: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('week');
  const [isExcuseOpen, setIsExcuseOpen] = useState(false);
  const [excuseForm, setExcuseForm] = useState({
    studentName: 'Junior Kamga',
    date: '',
    reason: ''
  });

  // Fetch parent attendance data from PostgreSQL API
  const { data: attendance = [], isLoading } = useQuery<ParentAttendance[]>({
    queryKey: ['/api/parent/attendance'],
    enabled: !!user
  });

  // Create excuse mutation
  const createExcuseMutation = useMutation({
    mutationFn: async (excuseData: any) => {
      const response = await fetch('/api/parent/attendance/excuse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(excuseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit excuse');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/attendance'] });
      setIsExcuseOpen(false);
      setExcuseForm({ studentName: 'Junior Kamga', date: '', reason: '' });
      toast({
        title: "Demande d'excuse envoyée",
        description: "Votre demande d'excuse a été soumise avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la demande d'excuse. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitExcuse = () => {
    if (excuseForm.date && excuseForm.reason) {
      createExcuseMutation.mutate(excuseForm);
    }
  };

  const text = {
    fr: {
      title: 'Suivi de Présence',
      subtitle: 'Assiduité et ponctualité de vos enfants',
      loading: 'Chargement des présences...',
      noData: 'Aucune donnée de présence',
      stats: {
        totalDays: 'Jours Totaux',
        presentDays: 'Présent',
        absentDays: 'Absent',
        lateArrivals: 'Retards'
      },
      status: {
        present: 'Présent',
        absent: 'Absent',
        late: 'En retard',
        excused: 'Excusé',
        partial: 'Présence partielle'
      },
      periods: {
        morning: 'Matin',
        afternoon: 'Après-midi',
        fullday: 'Journée complète',
        period1: '1ère heure',
        period2: '2ème heure',
        period3: '3ème heure',
        period4: '4ème heure'
      },
      dateRanges: {
        week: 'Cette semaine',
        month: 'Ce mois',
        term: 'Ce trimestre',
        year: 'Cette année'
      },
      actions: {
        viewDetails: 'Voir Détails',
        excuseAbsence: 'Justifier Absence',
        contactSchool: 'Contacter École',
        downloadReport: 'Télécharger Rapport'
      },
      filters: {
        allStudents: 'Tous les enfants',
        allStatuses: 'Tous statuts'
      },
      attendance: {
        student: 'Élève',
        date: 'Date',
        status: 'Statut',
        arrival: 'Arrivée',
        departure: 'Départ',
        period: 'Période',
        subject: 'Matière',
        teacher: 'Enseignant',
        reason: 'Motif',
        lateBy: 'Retard de'
      }
    },
    en: {
      title: 'Attendance Tracking',
      subtitle: 'Monitor your children\'s attendance and punctuality',
      loading: 'Loading attendance...',
      noData: 'No attendance data available',
      stats: {
        totalDays: 'Total Days',
        presentDays: 'Present',
        absentDays: 'Absent',
        lateArrivals: 'Late'
      },
      status: {
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused',
        partial: 'Partial attendance'
      },
      periods: {
        morning: 'Morning',
        afternoon: 'Afternoon',
        fullday: 'Full day',
        period1: '1st period',
        period2: '2nd period',
        period3: '3rd period',
        period4: '4th period'
      },
      dateRanges: {
        week: 'This week',
        month: 'This month',
        term: 'This term',
        year: 'This year'
      },
      actions: {
        viewDetails: 'View Details',
        excuseAbsence: 'Excuse Absence',
        contactSchool: 'Contact School',
        downloadReport: 'Download Report'
      },
      filters: {
        allStudents: 'All children',
        allStatuses: 'All statuses'
      },
      attendance: {
        student: 'Student',
        date: 'Date',
        status: 'Status',
        arrival: 'Arrival',
        departure: 'Departure',
        period: 'Period',
        subject: 'Subject',
        teacher: 'Teacher',
        reason: 'Reason',
        lateBy: 'Late by'
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

  // Filter attendance records
  const filteredAttendance = (Array.isArray(attendance) ? attendance : []).filter(record => {
    if (!record) return false;
    const matchesStudent = selectedStudent === 'all' || record.studentName === selectedStudent;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    
    // Date range filtering logic would go here
    const recordDate = new Date(record.date);
    const now = new Date();
    let matchesDateRange = true;
    
    switch (dateRange) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDateRange = recordDate >= weekAgo;
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        matchesDateRange = recordDate >= monthAgo;
        break;
      case 'term':
        const termStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        matchesDateRange = recordDate >= termStart;
        break;
    }
    
    return matchesStudent && matchesStatus && matchesDateRange;
  });

  // Get unique values for filters
  const uniqueStudents = Array.from(new Set((Array.isArray(attendance) ? attendance : []).map(a => a.studentName)));

  // Calculate statistics
  const totalDays = (Array.isArray(filteredAttendance) ? filteredAttendance.length : 0);
  const presentDays = (Array.isArray(filteredAttendance) ? filteredAttendance : []).filter(a => a.status === 'present').length;
  const absentDays = (Array.isArray(filteredAttendance) ? filteredAttendance : []).filter(a => a.status === 'absent').length;
  const lateArrivals = (Array.isArray(filteredAttendance) ? filteredAttendance : []).filter(a => a.status === 'late').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800',
      partial: 'bg-orange-100 text-orange-800'
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
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'excused':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAttendanceRate = () => {
    if (totalDays === 0) return 0;
    return Math.round(((presentDays + lateArrivals) / totalDays) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalDays}</p>
                <p className="text-2xl font-bold">{totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.presentDays}</p>
                <p className="text-2xl font-bold text-green-600">{presentDays}</p>
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
                <p className="text-sm text-gray-600">{t?.stats?.absentDays}</p>
                <p className="text-2xl font-bold text-red-600">{absentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.lateArrivals}</p>
                <p className="text-2xl font-bold text-yellow-600">{lateArrivals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Taux de Présence Global</h3>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-blue-600">{getAttendanceRate()}%</div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  <span className="text-sm">+2.5% ce mois</span>
                </div>
              </div>
            </div>
            <div className="w-32 h-32">
              <div className="relative w-full h-full">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none" stroke="#e5e7eb" strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none" stroke="#3b82f6" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${getAttendanceRate() * 2.51}, 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{getAttendanceRate()}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demande d'Excuse Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <FileText className="w-5 h-5 mr-2 inline" />
              Demander une Excuse
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isExcuseOpen} onOpenChange={setIsExcuseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 w-full" data-testid="button-request-excuse">
                <FileText className="w-4 h-4 mr-2" />
                Demander une Excuse
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Demande d'Excuse d'Absence</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Élève</label>
                  <Select value={excuseForm.studentName} onValueChange={(value) => setExcuseForm(prev => ({ ...prev, studentName: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior Kamga">Junior Kamga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date d'absence</label>
                  <Input
                    type="date"
                    value={excuseForm.date}
                    onChange={(e) => setExcuseForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Motif de l'absence</label>
                  <Textarea
                    value={excuseForm.reason}
                    onChange={(e) => setExcuseForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Expliquez la raison de l'absence (maladie, rendez-vous médical, etc.)"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSubmitExcuse}
                    disabled={createExcuseMutation.isPending || !excuseForm.date || !excuseForm.reason}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {createExcuseMutation.isPending ? 'Envoi...' : 'Soumettre la Demande'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsExcuseOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Historique des Présences - Reorganized Layout */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold mb-4">Historique des Présences</h3>
            {/* Filter Fields - Moved Under Title */}
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allStudents}</option>
                {(Array.isArray(uniqueStudents) ? uniqueStudents : []).map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.allStatuses}</option>
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="late">En retard</option>
                <option value="excused">Excusé</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="week">{t?.dateRanges?.week}</option>
                <option value="month">{t?.dateRanges?.month}</option>
                <option value="term">{t?.dateRanges?.term}</option>
                <option value="year">{t?.dateRanges?.year}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(Array.isArray(filteredAttendance) ? filteredAttendance.length : 0) === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucun enregistrement de présence ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredAttendance) ? filteredAttendance : []).map((record) => (
                <Card key={record.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getStatusIcon(record.status)}
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {record.studentName} - {record.className}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(record.date).toLocaleDateString()} - {record.subject}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {getStatusBadge(record.status)}
                            {record.lateMinutes > 0 && (
                              <Badge variant="outline" className="text-yellow-700">
                                +{record.lateMinutes} min
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.attendance?.period}</p>
                            <p className="font-medium">
                              {t.periods[record.period as keyof typeof t.periods] || record.period}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.attendance?.arrival}</p>
                            <p className="font-medium">{record.arrivalTime || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.attendance?.departure}</p>
                            <p className="font-medium">{record.departureTime || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.attendance?.teacher}</p>
                            <p className="font-medium">{record.teacherName}</p>
                          </div>
                        </div>

                        {record.excusedReason && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Motif d'excuse:</p>
                            <p className="text-sm text-blue-700">{record.excusedReason}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              {t?.actions?.viewDetails}
                            </Button>
                            {record.status === 'absent' && (
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                {t?.actions?.excuseAbsence}
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Phone className="w-4 h-4 mr-2" />
                              {t?.actions?.contactSchool}
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {record.parentNotified && (
                              <Badge variant="outline" className="text-green-700">
                                Parent notifié
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalParentAttendance;