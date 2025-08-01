import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, UserCheck, UserX, Clock, Phone, 
  MessageSquare, Calendar, BookOpen, Send, AlertTriangle
} from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  parentEmail?: string;
  parentPhone?: string;
  attendance?: {
    status: 'present' | 'absent' | 'late';
    date: string;
  };
}

const AttendanceManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [contactForm, setContactForm] = useState({
    message: '',
    quickMessage: ''
  });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch students with attendance data
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students', attendanceDate],
    enabled: !!user
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: number; status: 'present' | 'absent' | 'late' }) => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          status,
          date: attendanceDate
        }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/students'] });
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

  // Send message to parent mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ studentId, message }: { studentId: number; message: string }) => {
      const response = await fetch('/api/communications/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          message,
          type: 'attendance'
        }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Message envoyé' : 'Message Sent',
        description: language === 'fr' ? 'Le message a été envoyé au parent.' : 'Message has been sent to parent.'
      });
      setContactForm({ message: '', quickMessage: '' });
      setSelectedStudent(null);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer le message.' : 'Failed to send message.',
        variant: 'destructive'
      });
    }
  });

  const text = {
    fr: {
      title: 'Gestion des Présences',
      subtitle: 'Marquez les présences et contactez les parents',
      date: 'Date',
      present: 'Présent',
      absent: 'Absent',
      late: 'Retard',
      call: 'Appeler',
      contactParent: 'Contacter le Parent',
      quickMessage: 'Message rapide',
      customMessage: 'Message personnalisé',
      sendMessage: 'Envoyer Message',
      cancel: 'Annuler',
      sending: 'Envoi...',
      totalStudents: 'Total Élèves',
      presentCount: 'Présents',
      absentCount: 'Absents',
      lateCount: 'Retards',
      selectQuickMessage: 'Sélectionner un message rapide',
      absenceToday: '📞 Absence de {name} aujourd\'hui',
      lateToday: '⏰ {name} est en retard',
      behaviorMeeting: '📚 RDV pour discuter du comportement de {name}'
    },
    en: {
      title: 'Attendance Management',
      subtitle: 'Mark attendance and contact parents',
      date: 'Date',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      call: 'Call',
      contactParent: 'Contact Parent',
      quickMessage: 'Quick Message',
      customMessage: 'Custom Message',
      sendMessage: 'Send Message',
      cancel: 'Cancel',
      sending: 'Sending...',
      totalStudents: 'Total Students',
      presentCount: 'Present',
      absentCount: 'Absent',
      lateCount: 'Late',
      selectQuickMessage: 'Select a quick message',
      absenceToday: '📞 Absence of {name} today',
      lateToday: '⏰ {name} is late',
      behaviorMeeting: '📚 Meeting to discuss {name}\'s behavior'
    }
  };

  const t = text[language as keyof typeof text];

  const handleMarkAttendance = (studentId: number, status: 'present' | 'absent' | 'late') => {
    markAttendanceMutation.mutate({ studentId, status });
  };

  const handleQuickMessage = (template: string, student: Student) => {
    const message = template.replace('{name}', `${student.firstName || ''} ${student.lastName || ''}`);
    setContactForm({ ...contactForm, message, quickMessage: template });
  };

  const handleSendMessage = () => {
    if (!selectedStudent || !contactForm?.message?.trim()) return;
    sendMessageMutation.mutate({
      studentId: selectedStudent.id,
      message: contactForm.message
    });
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="w-6 h-6 text-green-600" />;
      case 'absent':
        return <UserX className="w-6 h-6 text-red-600" />;
      case 'late':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Users className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const presentCount = (Array.isArray(students) ? students : []).filter(s => s.attendance?.status === 'present').length;
  const absentCount = (Array.isArray(students) ? students : []).filter(s => s.attendance?.status === 'absent').length;
  const lateCount = (Array.isArray(students) ? students : []).filter(s => s.attendance?.status === 'late').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Label>{t.date}:</Label>
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e?.target?.value)}
              className="w-auto"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.totalStudents}</p>
                <p className="text-3xl font-bold text-gray-900">{(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.presentCount}</p>
                <p className="text-3xl font-bold text-green-600">{presentCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.absentCount}</p>
                <p className="text-3xl font-bold text-red-600">{absentCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t.lateCount}</p>
                <p className="text-3xl font-bold text-yellow-600">{lateCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Students Grid with Overlay Design */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(Array.isArray(students) ? students : []).map((student) => (
            <Card key={student.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Student Name Overlay */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 text-center">
                  <h3 className="font-bold text-lg mb-1">
                    {student.firstName || ''}
                  </h3>
                  <p className="text-sm opacity-90">
                    {student.lastName || ''}
                  </p>
                  {student.attendance?.status && (
                    <Badge className={`mt-2 ${getStatusColor(student?.attendance?.status)}`}>
                      {t[student?.attendance?.status as keyof typeof t]}
                    </Badge>
                  )}
                </div>

                {/* Attendance Icons Below */}
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-4 gap-2">
                    {/* Present Button */}
                    <Button
                      variant={student.attendance?.status === 'present' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                      className="p-2 h-auto flex flex-col items-center gap-1"
                      disabled={markAttendanceMutation.isPending}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs">{t.present}</span>
                    </Button>

                    {/* Absent Button */}
                    <Button
                      variant={student.attendance?.status === 'absent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                      className="p-2 h-auto flex flex-col items-center gap-1"
                      disabled={markAttendanceMutation.isPending}
                    >
                      <UserX className="w-4 h-4" />
                      <span className="text-xs">{t.absent}</span>
                    </Button>

                    {/* Late Button */}
                    <Button
                      variant={student.attendance?.status === 'late' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkAttendance(student.id, 'late')}
                      className="p-2 h-auto flex flex-col items-center gap-1"
                      disabled={markAttendanceMutation.isPending}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{t.late}</span>
                    </Button>

                    {/* Call/Contact Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 h-auto flex flex-col items-center gap-1"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="text-xs">{t.call}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle>{t.contactParent}</DialogTitle>
                        </DialogHeader>
                        <div className="bg-white p-6 rounded-lg space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">{t.quickMessage}</Label>
                            <Select onValueChange={(value) => handleQuickMessage(value, student)}>
                              <SelectTrigger>
                                <SelectValue placeholder={t.selectQuickMessage} />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value={t.absenceToday}>📞 {t?.absenceToday?.replace('{name}', `${student.firstName || ''}`)}</SelectItem>
                                <SelectItem value={t.lateToday}>⏰ {t?.lateToday?.replace('{name}', `${student.firstName || ''}`)}</SelectItem>
                                <SelectItem value={t.behaviorMeeting}>📚 {t?.behaviorMeeting?.replace('{name}', `${student.firstName || ''}`)}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">{t.customMessage}</Label>
                            <Textarea
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e?.target?.value })}
                              placeholder={language === 'fr' ? 'Tapez votre message...' : 'Type your message...'}
                              rows={4}
                              className="bg-white"
                            />
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={handleSendMessage}
                              disabled={sendMessageMutation.isPending || !contactForm?.message?.trim()}
                              className="flex-1"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {sendMessageMutation.isPending ? t.sending : t.sendMessage}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(null);
                                setContactForm({ message: '', quickMessage: '' });
                              }}
                              className="flex-1"
                            >
                              {t.cancel}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {(Array.isArray(students) ? (Array.isArray(students) ? students.length : 0) : 0) === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'fr' ? 'Aucun élève trouvé' : 'No students found'}
            </h3>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Aucun élève trouvé pour cette date.' 
                : 'No students found for this date.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;