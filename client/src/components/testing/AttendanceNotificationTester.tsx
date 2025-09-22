import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, MessageSquare, Mail, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AttendanceNotificationTester() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    studentId: '1',
    studentName: 'Ange Marie Fotso',
    className: '6ème A',
    date: new Date().toISOString().split('T')[0],
    status: 'absent',
    notes: '',
    schoolName: 'École Internationale de Yaoundé',
    markedBy: 'M. Directeur'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const text = {
    fr: {
      title: 'Test de Notifications d\'Attendance',
      description: 'Testez le système de notifications automatiques pour les parents',
      studentInfo: 'Informations Élève',
      studentId: 'ID Élève',
      studentName: 'Nom Élève',
      className: 'Classe',
      date: 'Date',
      status: 'Statut',
      notes: 'Notes (optionnel)',
      schoolInfo: 'Informations École',
      schoolName: 'Nom École',
      markedBy: 'Marqué par',
      testNotification: 'Tester Notification',
      testing: 'Test en cours...',
      results: 'Résultats du Test',
      success: 'Succès',
      failed: 'Échec',
      notProvided: 'Non fourni',
      channels: 'Canaux de Communication',
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
      pwa: 'PWA',
      notificationsSent: 'Notifications envoyées',
      errors: 'Erreurs',
      present: 'Présent(e)',
      absent: 'Absent(e)',
      late: 'En retard',
      excused: 'Absence excusée'
    },
    en: {
      title: 'Attendance Notification Tester',
      description: 'Test the automated notification system for parents',
      studentInfo: 'Student Information',
      studentId: 'Student ID',
      studentName: 'Student Name',
      className: 'Class',
      date: 'Date',
      status: 'Status',
      notes: 'Notes (optional)',
      schoolInfo: 'School Information',
      schoolName: 'School Name',
      markedBy: 'Marked by',
      testNotification: 'Test Notification',
      testing: 'Testing...',
      results: 'Test Results',
      success: 'Success',
      failed: 'Failed',
      notProvided: 'Not provided',
      channels: 'Communication Channels',
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
      pwa: 'PWA',
      notificationsSent: 'Notifications sent',
      errors: 'Errors',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused absence'
    }
  };

  const t = text[language as keyof typeof text];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const testNotification = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // First mark attendance to trigger notification
      const attendanceResponse = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          studentId: formData.studentId,
          classId: '1', // Mock class ID
          date: formData.date,
          status: formData.status,
          directorNote: formData.notes
        })
      });

      const attendanceResult = await attendanceResponse.json();
      
      if (attendanceResult.success) {
        setTestResult({
          attendance: attendanceResult,
          timestamp: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })
        });
        
        toast({
          title: "✅ Test réussi",
          description: `Notification ${attendanceResult.notificationTriggered ? 'déclenchée' : 'non déclenchée'} pour ${formData.studentName}`,
        });
      } else {
        throw new Error(attendanceResult.message || 'Échec du test');
      }
      
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "❌ Erreur du test",
        description: error.message || 'Une erreur est survenue lors du test',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'sent' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status === 'sent' ? t.success : status === 'failed' ? t.failed : t.notProvided}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.studentInfo}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">{t.studentId}</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  data-testid="input-student-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName">{t.studentName}</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  data-testid="input-student-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="className">{t.className}</Label>
                <Input
                  id="className"
                  value={formData.className}
                  onChange={(e) => handleInputChange('className', e.target.value)}
                  data-testid="input-class-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t.date}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  data-testid="input-date"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">{t.present}</SelectItem>
                    <SelectItem value="absent">{t.absent}</SelectItem>
                    <SelectItem value="late">{t.late}</SelectItem>
                    <SelectItem value="excused">{t.excused}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Ajouter des notes..."
                  data-testid="textarea-notes"
                />
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t.schoolInfo}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">{t.schoolName}</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  data-testid="input-school-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="markedBy">{t.markedBy}</Label>
                <Input
                  id="markedBy"
                  value={formData.markedBy}
                  onChange={(e) => handleInputChange('markedBy', e.target.value)}
                  data-testid="input-marked-by"
                />
              </div>
            </div>
          </div>

          {/* Test Button */}
          <Button 
            onClick={testNotification} 
            disabled={isLoading}
            className="w-full"
            data-testid="button-test-notification"
          >
            {isLoading ? t.testing : t.testNotification}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t.results}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Attendance Status</Label>
                <p className="text-sm text-muted-foreground">
                  {testResult.attendance.success ? '✅ Marked successfully' : '❌ Failed to mark'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Notification Triggered</Label>
                <p className="text-sm text-muted-foreground">
                  {testResult.attendance.notificationTriggered ? '🔔 Yes' : '⏸️ No'}
                </p>
              </div>
            </div>

            {testResult.attendance.notificationTriggered && (
              <div className="space-y-3">
                <h4 className="font-medium">{t.channels}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{t.email}</span>
                    </div>
                    {getStatusBadge('sent')}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{t.sms}</span>
                    </div>
                    {getStatusBadge('sent')}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{t.whatsapp}</span>
                    </div>
                    {getStatusBadge('sent')}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">{t.pwa}</span>
                    </div>
                    {getStatusBadge('sent')}
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Test executed at: {testResult.timestamp}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}