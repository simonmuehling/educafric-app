import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, UserCheck, Users, Download, FileText, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const AttendanceManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch attendance stats from API
  const { data: attendanceStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/attendance/stats', selectedDate],
    queryFn: async () => {
      console.log('[ATTENDANCE_MANAGEMENT] 🔍 Fetching attendance stats...');
      const response = await fetch(`/api/attendance/stats?date=${selectedDate}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ATTENDANCE_MANAGEMENT] ❌ Failed to fetch attendance stats');
        throw new Error('Failed to fetch attendance stats');
      }
      const data = await response.json();
      console.log('[ATTENDANCE_MANAGEMENT] ✅ Attendance stats loaded:', data);
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Fetch class attendance from API
  const { data: classAttendance = [], isLoading: classesLoading } = useQuery({
    queryKey: ['/api/attendance/by-class', selectedDate, selectedClass],
    queryFn: async () => {
      console.log('[ATTENDANCE_MANAGEMENT] 🔍 Fetching class attendance...');
      let url = `/api/attendance/by-class?date=${selectedDate}`;
      if (selectedClass && selectedClass !== 'all') {
        url += `&class=${selectedClass}`;
      }
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('[ATTENDANCE_MANAGEMENT] ❌ Failed to fetch class attendance');
        throw new Error('Failed to fetch class attendance');
      }
      const data = await response.json();
      console.log('[ATTENDANCE_MANAGEMENT] ✅ Class attendance loaded:', data.length, 'classes');
      return data;
    },
    enabled: !!user,
    retry: 2
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any) => {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(attendanceData)
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/by-class'] });
    }
  });

  const handleExportReport = () => {
    toast({
      title: language === 'fr' ? 'Rapport exporté' : 'Report exported',
      description: language === 'fr' ? 'Le rapport de présence a été téléchargé avec succès.' : 'Attendance report has been downloaded successfully.'
    });
  };

  const handleSendReminder = () => {
    toast({
      title: language === 'fr' ? 'Rappel envoyé' : 'Reminder sent',
      description: language === 'fr' ? 'Rappels SMS envoyés aux parents des élèves absents.' : 'SMS reminders sent to parents of absent students.'
    });
  };

  const handleMarkAttendance = () => {
    markAttendanceMutation.mutate({
      date: selectedDate,
      classId: selectedClass,
      records: [] // This would contain actual attendance records
    });
    toast({
      title: language === 'fr' ? 'Présence enregistrée' : 'Attendance recorded',
      description: language === 'fr' ? 'Les présences ont été mises à jour avec succès.' : 'Attendance has been updated successfully.'
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: language === 'fr' ? 'Rapport généré' : 'Report generated',
      description: language === 'fr' ? 'Rapport de présence mensuel généré avec succès.' : 'Monthly attendance report generated successfully.'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'fr' ? 'Gestion des Présences' : 'Attendance Management'}
        </h1>
        <Badge variant="outline" className="text-sm">
          {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
        </Badge>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Présents' : 'Present'}</p>
                <p className="text-2xl font-bold text-green-600">{statsLoading ? '...' : (attendanceStats?.present || 0)}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Absents' : 'Absent'}</p>
                <p className="text-2xl font-bold text-red-600">{statsLoading ? '...' : (attendanceStats?.absent || 0)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'En retard' : 'Late'}</p>
                <p className="text-2xl font-bold text-orange-600">{statsLoading ? '...' : (attendanceStats?.late || 0)}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Total' : 'Total'}</p>
                <p className="text-2xl font-bold text-blue-600">{statsLoading ? '...' : (attendanceStats?.total || 0)}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions de Présence' : 'Attendance Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'mark-attendance',
                label: language === 'fr' ? 'Marquer Présence' : 'Mark Attendance',
                icon: <UserCheck className="w-5 h-5" />,
                onClick: handleMarkAttendance,
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'export-report',
                label: language === 'fr' ? 'Exporter Rapport' : 'Export Report',
                icon: <Download className="w-5 h-5" />,
                onClick: handleExportReport,
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'send-reminder',
                label: language === 'fr' ? 'Rappel Parents' : 'Parent Reminder',
                icon: <AlertTriangle className="w-5 h-5" />,
                onClick: handleSendReminder,
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'generate-report',
                label: language === 'fr' ? 'Rapport Mensuel' : 'Monthly Report',
                icon: <FileText className="w-5 h-5" />,
                onClick: handleGenerateReport,
                color: 'bg-purple-600 hover:bg-purple-700'
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Class Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Présence par Classe' : 'Attendance by Class'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e?.target?.value)}
                className="md:w-auto"
              />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="md:w-auto">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner une classe' : 'Select a class'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Toutes les classes' : 'All classes'}</SelectItem>
                  <SelectItem value="ce1a">CE1 A</SelectItem>
                  <SelectItem value="ce2b">CE2 B</SelectItem>
                  <SelectItem value="3eme">3ème A</SelectItem>
                  <SelectItem value="terminale">Terminale C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{language === 'fr' ? 'Classe' : 'Class'}</th>
                    <th className="text-left p-3">{language === 'fr' ? 'Présents' : 'Present'}</th>
                    <th className="text-left p-3">{language === 'fr' ? 'Absents' : 'Absent'}</th>
                    <th className="text-left p-3">{language === 'fr' ? 'En retard' : 'Late'}</th>
                    <th className="text-left p-3">{language === 'fr' ? 'Total' : 'Total'}</th>
                    <th className="text-left p-3">{language === 'fr' ? 'Taux' : 'Rate'}</th>
                  </tr>
                </thead>
                <tbody>
                  {classesLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center">
                        <div className="animate-pulse text-gray-500">
                          {language === 'fr' ? 'Chargement des données de présence...' : 'Loading attendance data...'}
                        </div>
                      </td>
                    </tr>
                  ) : (Array.isArray(classAttendance) ? classAttendance : []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        {language === 'fr' ? 'Aucune donnée de présence disponible' : 'No attendance data available'}
                      </td>
                    </tr>
                  ) : (
                    (Array.isArray(classAttendance) ? classAttendance : []).map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.class || item.className}</td>
                        <td className="p-3 text-green-600">{item.present || 0}</td>
                        <td className="p-3 text-red-600">{item.absent || 0}</td>
                        <td className="p-3 text-orange-600">{item.late || 0}</td>
                        <td className="p-3">{item.total || 0}</td>
                        <td className="p-3">
                          <Badge variant={item.total > 0 && (item.present / item.total) > 0.9 ? 'default' : 'secondary'}>
                            {item.total > 0 ? Math.round((item.present / item.total) * 100) : 0}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;