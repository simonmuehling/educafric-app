import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle, XCircle, Clock, Search, Filter, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AttendanceManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('6eme-A');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any>(null);

  const text = {
    fr: {
      title: 'Gestion des Présences',
      subtitle: 'Suivi et enregistrement des présences des élèves',
      date: 'Date',
      class: 'Classe',
      search: 'Rechercher élève...',
      present: 'Présent',
      absent: 'Absent',
      late: 'Retard',
      excused: 'Excusé',
      student: 'Élève',
      status: 'Statut',
      time: 'Heure',
      actions: 'Actions',
      markPresent: 'Marquer Présent',
      markAbsent: 'Marquer Absent',
      markLate: 'Marquer en Retard',
      markExcused: 'Marquer Excusé',
      saveAttendance: 'Sauvegarder Présences',
      generateReport: 'Générer Rapport',
      totalStudents: 'Total Élèves',
      totalPresent: 'Total Présents',
      totalAbsent: 'Total Absents',
      attendanceRate: 'Taux de Présence'
    },
    en: {
      title: 'Attendance Management',
      subtitle: 'Track and record student attendance',
      date: 'Date',
      class: 'Class',
      search: 'Search student...',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      student: 'Student',
      status: 'Status',
      time: 'Time',
      actions: 'Actions',
      markPresent: 'Mark Present',
      markAbsent: 'Mark Absent',
      markLate: 'Mark Late',
      markExcused: 'Mark Excused',
      saveAttendance: 'Save Attendance',
      generateReport: 'Generate Report',
      totalStudents: 'Total Students',
      totalPresent: 'Total Present',
      totalAbsent: 'Total Absent',
      attendanceRate: 'Attendance Rate'
    }
  };

  const t = text[language as keyof typeof text];

  // Données d'exemple d'élèves africains
  const students = [
    { id: 1, name: 'Amina Traoré', class: '6eme-A', status: 'present', time: '08:00' },
    { id: 2, name: 'Kwame Asante', class: '6eme-A', status: 'present', time: '08:05' },
    { id: 3, name: 'Fatou Diallo', class: '6eme-A', status: 'late', time: '08:15' },
    { id: 4, name: 'Emmanuel Ngozi', class: '6eme-A', status: 'absent', time: '--' },
    { id: 5, name: 'Aisha Kone', class: '6eme-A', status: 'present', time: '07:58' },
    { id: 6, name: 'Moussa Camara', class: '6eme-A', status: 'excused', time: '--' },
    { id: 7, name: 'Zara Ouédraogo', class: '6eme-A', status: 'present', time: '08:02' },
    { id: 8, name: 'Kofi Mensah', class: '6eme-A', status: 'present', time: '08:08' },
    { id: 9, name: 'Mariam Sawadogo', class: '6eme-A', status: 'late', time: '08:20' },
    { id: 10, name: 'Abdul Rahman', class: '6eme-A', status: 'present', time: '07:55' }
  ];

  const classes = ['6eme-A', '6eme-B', '5eme-A', '5eme-B', '4eme-A', '4eme-B', '3eme-A', '3eme-B'];

  const filteredStudents = students.filter(student => 
    student.class === selectedClass &&
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStudentStatus = (studentId: number, newStatus: string) => {
    const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    // Ici on mettrait à jour la base de données
    toast({
      title: language === 'fr' ? 'Présence mise à jour' : 'Attendance updated',
      description: language === 'fr' ? 
        `Statut mis à jour pour l'élève` : 
        `Status updated for student`,
    });
  };

  const saveAttendance = () => {
    setAttendanceData({
      date: selectedDate,
      class: selectedClass,
      students: filteredStudents,
      stats: stats
    });
    setShowConfirmDialog(true);
  };

  const confirmSaveAttendance = () => {
    toast({
      title: language === 'fr' ? 'Présences sauvegardées' : 'Attendance saved',
      description: language === 'fr' ? 
        `Les présences du ${selectedDate} ont été enregistrées` : 
        `Attendance for ${selectedDate} has been recorded`,
    });
    setShowConfirmDialog(false);
    setAttendanceData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'excused': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const stats = {
    total: filteredStudents.length,
    present: filteredStudents.filter(s => s.status === 'present').length,
    absent: filteredStudents.filter(s => s.status === 'absent').length,
    late: filteredStudents.filter(s => s.status === 'late').length,
    excused: filteredStudents.filter(s => s.status === 'excused').length
  };

  const attendanceRate = Math.round((stats.present / stats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.date}</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.class}</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t.totalStudents}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{t.totalPresent}</p>
                <p className="text-2xl font-bold text-green-700">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">{t.totalAbsent}</p>
                <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">{t.attendanceRate}</p>
                <p className="text-2xl font-bold text-purple-700">{attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.class} {selectedClass} - {selectedDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(student.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">
                      {t.time}: {student.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(student.status)} text-xs`}>
                    {student.status === 'present' ? t.present :
                     student.status === 'absent' ? t.absent :
                     student.status === 'late' ? t.late : t.excused}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStudentStatus(student.id, 'present')}
                      className="text-xs p-1 h-7"
                      disabled={student.status === 'present'}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStudentStatus(student.id, 'absent')}
                      className="text-xs p-1 h-7"
                      disabled={student.status === 'absent'}
                    >
                      <XCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStudentStatus(student.id, 'late')}
                      className="text-xs p-1 h-7"
                      disabled={student.status === 'late'}
                    >
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6 pt-6 border-t">
            <Button onClick={saveAttendance} className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="w-4 h-4 mr-2" />
              {t.saveAttendance}
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {t.generateReport}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer l\'enregistrement des présences' : 'Confirm Attendance Recording'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' ? 'Êtes-vous sûr de vouloir enregistrer les présences ? Cette action enverra des notifications automatiques aux parents pour les absences et retards.' : 'Are you sure you want to record attendance? This action will send automatic notifications to parents for absences and late arrivals.'}
              <br /><br />
              {attendanceData && (
                <>
                  <strong>{language === 'fr' ? 'Date:' : 'Date:'}</strong> {attendanceData.date}
                  <br />
                  <strong>{language === 'fr' ? 'Classe:' : 'Class:'}</strong> {attendanceData.class}
                  <br />
                  <strong>{language === 'fr' ? 'Présents:' : 'Present:'}</strong> {attendanceData.stats.present}
                  <br />
                  <strong>{language === 'fr' ? 'Absents:' : 'Absent:'}</strong> {attendanceData.stats.absent}
                  <br />
                  <strong>{language === 'fr' ? 'Retards:' : 'Late:'}</strong> {attendanceData.stats.late}
                  <br />
                  <strong>{language === 'fr' ? 'Notifications à envoyer:' : 'Notifications to send:'}</strong> {attendanceData.stats.absent + attendanceData.stats.late}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSaveAttendance}>
              {language === 'fr' ? 'Confirmer l\'enregistrement' : 'Confirm Recording'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AttendanceManagement;