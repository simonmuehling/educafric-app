import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckSquare, X, Clock, Users, Calendar, Save, 
  Download, Filter, Search, Eye, BarChart3, Phone, Mail, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const FunctionalAttendance = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('6eme-a');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  const text = {
    fr: {
      title: 'Gestion des Présences',
      subtitle: 'Suivi des présences par classe et date',
      selectClass: 'Sélectionner une classe',
      selectDate: 'Sélectionner une date',
      markAll: 'Marquer tous présents',
      saveAttendance: 'Enregistrer les présences',
      exportReport: 'Exporter le rapport',
      present: 'Présent',
      absent: 'Absent',
      late: 'Retard',
      totalStudents: 'Total élèves',
      presentCount: 'Présents',
      absentCount: 'Absents',
      lateCount: 'Retards',
      attendanceRate: 'Taux de présence',
      search: 'Rechercher un élève...',
      viewHistory: 'Voir l\'historique',
      quickStats: 'Statistiques rapides'
    },
    en: {
      title: 'Attendance Management',
      subtitle: 'Track attendance by class and date',
      selectClass: 'Select a class',
      selectDate: 'Select a date',
      markAll: 'Mark all present',
      saveAttendance: 'Save attendance',
      exportReport: 'Export report',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      totalStudents: 'Total students',
      presentCount: 'Present',
      absentCount: 'Absent',
      lateCount: 'Late',
      attendanceRate: 'Attendance rate',
      search: 'Search student...',
      viewHistory: 'View history',
      quickStats: 'Quick stats'
    }
  };

  const t = text[language as keyof typeof text];

  const classes = [
    { id: '6eme-a', name: '6ème A', students: 32 },
    { id: '5eme-b', name: '5ème B', students: 28 },
    { id: '4eme-c', name: '4ème C', students: 30 }
  ];

  const students = [
    { id: 1, name: 'ABANDA Marie', number: '001', parentName: 'Mme Rose Abanda', parentPhone: '+237 677 123 456', parentEmail: 'rose.abanda@gmail.com' },
    { id: 2, name: 'BELLO Jean', number: '002', parentName: 'M. Paul Bello', parentPhone: '+237 655 987 654', parentEmail: 'paul.bello@yahoo.fr' },
    { id: 3, name: 'DJOMO Sarah', number: '003', parentName: 'Dr. Marie Djomo', parentPhone: '+237 698 456 789', parentEmail: 'marie.djomo@health.cm' },
    { id: 4, name: 'FOKO Paul', number: '004', parentName: 'Mme Christine Foko', parentPhone: '+237 677 321 987', parentEmail: 'christine.foko@gmail.com' },
    { id: 5, name: 'KAMGA Alice', number: '005', parentName: 'M. Jean Kamga', parentPhone: '+237 655 654 321', parentEmail: 'jean.kamga@business.cm' },
    { id: 6, name: 'MOMO Pierre', number: '006' },
    { id: 7, name: 'NANA Grace', number: '007' },
    { id: 8, name: 'TAMO Daniel', number: '008' }
  ];

  const markAttendance = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const allPresent: Record<string, 'present'> = {};
    students.forEach(student => {
      allPresent[student.id] = 'present';
    });
    setAttendance(allPresent);
    toast({
      title: language === 'fr' ? 'Tous marqués présents' : 'All marked present',
      description: `${(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)} ${language === 'fr' ? 'élèves marqués présents' : 'students marked present'}`
    });
  };

  const saveAttendance = async () => {
    try {
      const attendanceData = {
        classId: selectedClass,
        date: selectedDate,
        attendance: attendance
      };
      
      await apiRequest('POST', '/api/attendance', attendanceData);
      
      const presentCount = Object.values(attendance).filter(status => status === 'present').length;
      const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
      const lateCount = Object.values(attendance).filter(status => status === 'late').length;
      
      toast({
        title: language === 'fr' ? 'Présences enregistrées' : 'Attendance saved',
        description: `${presentCount} ${t?.present?.toLowerCase()}, ${absentCount} ${t?.absent?.toLowerCase()}, ${lateCount} ${t?.late?.toLowerCase()}`
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'enregistrer les présences' : 'Failed to save attendance',
        variant: 'destructive'
      });
    }
  };

  const exportReport = async () => {
    try {
      await apiRequest('GET', `/api/attendance/export?class=${selectedClass}&date=${selectedDate}`);
      toast({
        title: language === 'fr' ? 'Rapport exporté' : 'Report exported',
        description: language === 'fr' ? 'Le rapport a été téléchargé' : 'Report has been downloaded'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'exporter le rapport' : 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  const viewHistory = () => {
    setIsHistoryDialogOpen(true);
  };

  const showQuickStats = () => {
    setIsStatsDialogOpen(true);
  };

  const contactParent = (student: any) => {
    setSelectedStudent(student);
  };

  const getAttendanceStats = () => {
    const total = (Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0);
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, rate };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportReport}
          </Button>
          <Button onClick={saveAttendance} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            {t.saveAttendance}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t.selectClass}</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e?.target?.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Array.isArray(classes) ? classes : []).map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name || ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t.selectDate}</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e?.target?.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t.search}</label>
          <Input
            type="text"
            placeholder={t.search}
            className="w-full"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ModernCard className="p-4 text-center activity-card-blue">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">{t.totalStudents}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-green">
          <div className="text-2xl font-bold text-gray-800">{stats.present}</div>
          <div className="text-sm text-gray-600">{t.presentCount}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-red">
          <div className="text-2xl font-bold text-gray-800">{stats.absent}</div>
          <div className="text-sm text-gray-600">{t.absentCount}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-yellow">
          <div className="text-2xl font-bold text-gray-800">{stats.late}</div>
          <div className="text-sm text-gray-600">{t.lateCount}</div>
        </ModernCard>
        <ModernCard className="p-4 text-center activity-card-purple">
          <div className="text-2xl font-bold text-gray-800">{stats.rate}%</div>
          <div className="text-sm text-gray-600">{t.attendanceRate}</div>
        </ModernCard>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button onClick={markAllPresent} variant="outline" className="text-green-600">
          <CheckSquare className="w-4 h-4 mr-2" />
          {t.markAll}
        </Button>
        <Button onClick={viewHistory} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          {t.viewHistory}
        </Button>
        <Button onClick={showQuickStats} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          {t.quickStats}
        </Button>
      </div>

      {/* Student List - Version Mobile Améliorée */}
      <ModernCard className="p-4">
        <div className="space-y-4">
          {(Array.isArray(students) ? students : []).map(student => {
            const status = attendance[student.id];
            return (
              <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50">
                {/* Version Mobile - Nom au-dessus des boutons */}
                <div className="block md:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {student.number}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.name || ''}</p>
                        {student.parentName && (
                          <p className="text-xs text-gray-500">Parent: {student.parentName}</p>
                        )}
                      </div>
                    </div>
                    {student.parentPhone && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => contactParent(student)}
                        className="text-blue-600"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Boutons de présence pour mobile */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={status === 'present' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'present')}
                      className={`w-full ${status === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-green-600 hover:text-green-700 border-green-300'}`}
                    >
                      <div className="flex flex-col items-center">
                        <CheckSquare className="w-4 h-4 mb-1" />
                        <span className="text-xs">{t.present}</span>
                      </div>
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'late' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'late')}
                      className={`w-full ${status === 'late' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'text-yellow-600 hover:text-yellow-700 border-yellow-300'}`}
                    >
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 mb-1" />
                        <span className="text-xs">{t.late}</span>
                      </div>
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'absent' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'absent')}
                      className={`w-full ${status === 'absent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 hover:text-red-700 border-red-300'}`}
                    >
                      <div className="flex flex-col items-center">
                        <X className="w-4 h-4 mb-1" />
                        <span className="text-xs">{t.absent}</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Version Desktop - Layout horizontal */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {student.number}
                    </div>
                    <div>
                      <p className="font-medium">{student.name || ''}</p>
                      <p className="text-sm text-gray-500">ID: {student.number}</p>
                      {student.parentName && (
                        <p className="text-xs text-gray-500">Parent: {student.parentName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={status === 'present' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'present')}
                      className={`${status === 'present' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 hover:text-green-700'}`}
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      {t.present}
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'late' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'late')}
                      className={`${status === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : 'text-yellow-600 hover:text-yellow-700'}`}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      {t.late}
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'absent' ? 'default' : 'outline'}
                      onClick={() => markAttendance(student.id, 'absent')}
                      className={`${status === 'absent' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 hover:text-red-700'}`}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t.absent}
                    </Button>
                    {student.parentPhone && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => contactParent(student)}
                        className="text-blue-600"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ModernCard>

      {/* Dialog Historique des Présences */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Historique des Présences - {selectedClass.toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-800">92%</div>
                <div className="text-sm text-green-600">Taux moyen de présence</div>
              </div>
              <div className="text-center p-4 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-800">15</div>
                <div className="text-sm text-yellow-600">Retards ce mois</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-800">8</div>
                <div className="text-sm text-red-600">Absences ce mois</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Élèves avec absences fréquentes :</h4>
              <div className="space-y-2">
                {['DJOMO Sarah - 3 absences', 'FOKO Paul - 2 absences'].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{item}</span>
                    <Button size="sm" variant="outline">Contacter parents</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Statistiques Rapides */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Statistiques Rapides - {selectedClass.toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Cette semaine :</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lundi:</span>
                  <Badge className="bg-green-100 text-green-800">28/30 présents</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mardi:</span>
                  <Badge className="bg-green-100 text-green-800">30/30 présents</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mercredi:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">25/30 présents</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Tendances :</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Meilleur jour:</span>
                  <span className="font-medium">Mardi</span>
                </div>
                <div className="flex justify-between">
                  <span>Heure critique:</span>
                  <span className="font-medium">8h00-9h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Amélioration:</span>
                  <span className="text-green-600 font-medium">+5% ce mois</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Contact Parent */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Contacter le Parent - {selectedStudent.name || ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Parent/Tuteur :</label>
                  <p className="text-lg font-medium">{selectedStudent.parentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone :</label>
                  <p className="text-lg">{selectedStudent.parentPhone}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(`tel:${selectedStudent.parentPhone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedStudent.parentEmail}?subject=Concernant ${selectedStudent.name || ''}`)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message rapide :</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button size="sm" variant="outline" className="justify-start">
                    📞 Absence de {selectedStudent.name || ''} aujourd'hui
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    ⏰ {selectedStudent.name || ''} est en retard
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    📚 RDV pour discuter du comportement
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FunctionalAttendance;