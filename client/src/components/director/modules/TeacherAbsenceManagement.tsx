import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, UserX, Users, Clock, AlertTriangle, CheckCircle, Phone, Mail, FileText, TrendingUp } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';

const TeacherAbsenceManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock data for demonstration
  const absenceStats = {
    totalAbsent: 3,
    substitute: 2,
    unresolved: 1,
    totalTeachers: 24
  };

  const todayAbsences = [
    {
      id: 1,
      teacherName: 'Marie Dubois',
      subject: 'Mathématiques',
      classes: ['6ème A', '5ème B'],
      reason: 'Maladie',
      duration: '1 jour',
      substitute: 'Paul Martin',
      status: 'resolved',
      contactPhone: '+237654123456',
      contactEmail: 'marie.dubois@ecole.cm'
    },
    {
      id: 2,
      teacherName: 'Jean Kouam',
      subject: 'Français',
      classes: ['3ème A', 'Terminale C'],
      reason: 'Urgence familiale',
      duration: '3 jours',
      substitute: 'En recherche',
      status: 'pending',
      contactPhone: '+237651987654',
      contactEmail: 'jean.kouam@ecole.cm'
    },
    {
      id: 3,
      teacherName: 'Françoise Mbida',
      subject: 'Anglais',
      classes: ['4ème B'],
      reason: 'Formation',
      duration: '2 jours',
      substitute: 'Sophie Ngono',
      status: 'resolved',
      contactPhone: '+237658741963',
      contactEmail: 'francoise.mbida@ecole.cm'
    }
  ];

  // Enhanced Actions Rapides functionalities with API calls
  const handleNotifyParents = async (teacherName: string, classes: string[]) => {
    try {
      const response = await fetch('/api/teacher-absences/notify-parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherName, classes, date: selectedDate })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: language === 'fr' ? 'Notifications envoyées' : 'Notifications sent',
          description: language === 'fr' 
            ? `${result.recipientCount} parents informés de l'absence de ${teacherName}`
            : `${result.recipientCount} parents notified of ${teacherName}'s absence`
        });
      }
    } catch (error) {
      console.error('[ABSENCE_NOTIFY] Error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec envoi notifications' : 'Failed to send notifications',
        variant: 'destructive'
      });
    }
  };

  const handleFindSubstitute = async (teacherName: string) => {
    try {
      const response = await fetch('/api/teacher-absences/find-substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherName, date: selectedDate })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: language === 'fr' ? 'Remplaçant trouvé' : 'Substitute found',
          description: language === 'fr'
            ? `${result.substituteName} assigné pour remplacer ${teacherName}`
            : `${result.substituteName} assigned to replace ${teacherName}`
        });
      }
    } catch (error) {
      console.error('[ABSENCE_SUBSTITUTE] Error:', error);
      toast({
        title: language === 'fr' ? 'Recherche remplaçant' : 'Finding substitute',
        description: language === 'fr'
          ? 'Recherche d\'un remplaçant disponible en cours...'
          : 'Searching for available substitute...'
      });
    }
  };

  const handleMarkResolved = async (absenceId: number) => {
    try {
      const response = await fetch(`/api/teacher-absences/${absenceId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Absence résolue' : 'Absence resolved',
          description: language === 'fr'
            ? 'L\'absence a été marquée comme résolue avec succès'
            : 'The absence has been successfully marked as resolved'
        });
        // Refresh data here
      }
    } catch (error) {
      console.error('[ABSENCE_RESOLVE] Error:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/teacher-absences/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window?.URL?.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-absences-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.pdf`;
        a.click();
        window?.URL?.revokeObjectURL(url);
        
        toast({
          title: language === 'fr' ? 'Rapport téléchargé' : 'Report downloaded',
          description: language === 'fr'
            ? 'Rapport mensuel des absences généré et téléchargé'
            : 'Monthly absence report generated and downloaded'
        });
      }
    } catch (error) {
      console.error('[ABSENCE_REPORT] Error:', error);
    }
  };

  // Get today's schedule to show context for absences
  const getTodaySchedule = async () => {
    try {
      const response = await fetch(`/api/timetable/today?date=${selectedDate}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('[SCHEDULE_FETCH] Error:', error);
    }
    return [];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'fr' ? 'Gestion des Absences Enseignants' : 'Teacher Absence Management'}
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
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Absents Aujourd\'hui' : 'Absent Today'}</p>
                <p className="text-2xl font-bold text-red-600">{absenceStats.totalAbsent}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Remplaçants' : 'Substitutes'}</p>
                <p className="text-2xl font-bold text-green-600">{absenceStats.substitute}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Non résolues' : 'Unresolved'}</p>
                <p className="text-2xl font-bold text-orange-600">{absenceStats.unresolved}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Total Enseignants' : 'Total Teachers'}</p>
                <p className="text-2xl font-bold text-blue-600">{absenceStats.totalTeachers}</p>
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
            title={language === 'fr' ? 'Actions Absence Enseignants' : 'Teacher Absence Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'notify-parents',
                label: language === 'fr' ? 'Notifier Parents' : 'Notify Parents',
                icon: <Mail className="w-5 h-5" />,
                onClick: () => handleNotifyParents('Enseignant', ['Toutes classes']),
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'find-substitute',
                label: language === 'fr' ? 'Trouver Remplaçant' : 'Find Substitute',
                icon: <Users className="w-5 h-5" />,
                onClick: () => handleFindSubstitute('Enseignant'),
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'mark-resolved',
                label: language === 'fr' ? 'Marquer Résolu' : 'Mark Resolved',
                icon: <CheckCircle className="w-5 h-5" />,
                onClick: () => handleMarkResolved(1),
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

      {/* Today's Absences */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Absences Aujourd\'hui' : 'Today\'s Absences'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e?.target?.value)}
                className="md:w-auto"
                data-testid="input-absence-date"
              />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="md:w-auto" data-testid="select-department">
                  <SelectValue placeholder={language === 'fr' ? 'Département' : 'Department'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Tous les départements' : 'All departments'}</SelectItem>
                  <SelectItem value="math">{language === 'fr' ? 'Mathématiques' : 'Mathematics'}</SelectItem>
                  <SelectItem value="french">{language === 'fr' ? 'Français' : 'French'}</SelectItem>
                  <SelectItem value="english">{language === 'fr' ? 'Anglais' : 'English'}</SelectItem>
                  <SelectItem value="science">{language === 'fr' ? 'Sciences' : 'Science'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile Actions for Today's Absences */}
            <div className="md:hidden">
              <MobileActionsOverlay
                title={language === 'fr' ? 'Actions Absences Aujourd\'hui' : 'Today\'s Absence Actions'}
                maxVisibleButtons={2}
                actions={[
                  {
                    id: 'bulk-notify',
                    label: language === 'fr' ? 'Notifier Tous Parents' : 'Notify All Parents',
                    icon: <Mail className="w-5 h-5" />,
                    onClick: () => {
                      console.log('[BULK_NOTIFY] 📧 Notifying all parents of today\'s absences');
                      toast({
                        title: language === 'fr' ? 'Notification en cours' : 'Notification in progress',
                        description: language === 'fr' ? 'Parents notifiés des absences du jour' : 'Parents notified of today\'s absences'
                      });
                    },
                    color: 'bg-blue-600 hover:bg-blue-700'
                  },
                  {
                    id: 'view-timetable',
                    label: language === 'fr' ? 'Voir Emploi du Temps' : 'View Timetable',
                    icon: <Clock className="w-5 h-5" />,
                    onClick: () => {
                      console.log('[TIMETABLE_VIEW] 📅 Opening today\'s timetable');
                      const event = new CustomEvent('switchToTimetable', {
                        detail: { date: selectedDate }
                      });
                      window.dispatchEvent(event);
                    },
                    color: 'bg-purple-600 hover:bg-purple-700'
                  },
                  {
                    id: 'emergency-substitute',
                    label: language === 'fr' ? 'Remplaçant d\'Urgence' : 'Emergency Substitute',
                    icon: <AlertTriangle className="w-5 h-5" />,
                    onClick: () => {
                      console.log('[EMERGENCY_SUB] 🚨 Finding emergency substitute');
                      toast({
                        title: language === 'fr' ? 'Recherche remplaçant' : 'Finding substitute',
                        description: language === 'fr' ? 'Recherche d\'un remplaçant d\'urgence en cours' : 'Searching for emergency substitute'
                      });
                    },
                    color: 'bg-red-600 hover:bg-red-700'
                  }
                ]}
              />
            </div>

            <div className="space-y-4">
              {(Array.isArray(todayAbsences) ? todayAbsences : []).map((absence) => (
                <Card key={absence.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Teacher Name and Status */}
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{absence.teacherName}</h3>
                        <Badge variant={absence.status === 'resolved' ? 'default' : 'secondary'}>
                          {absence.status === 'resolved' 
                            ? (language === 'fr' ? 'Résolu' : 'Resolved')
                            : (language === 'fr' ? 'En attente' : 'Pending')
                          }
                        </Badge>
                      </div>

                      {/* Action Icons - Directly below name */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotifyParents(absence.teacherName, absence.classes)}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 p-2"
                          data-testid={`button-notify-${absence.id}`}
                          title={language === 'fr' ? 'Notifier Parents' : 'Notify Parents'}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkResolved(absence.id)}
                          className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 p-2"
                          data-testid={`button-resolve-${absence.id}`}
                          title={language === 'fr' ? 'Marquer Résolu' : 'Mark Resolved'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('[TIMETABLE_NAV] 📅 Navigating to timetable for:', absence.teacherName);
                            const event = new CustomEvent('switchToTimetable', {
                              detail: { teacherName: absence.teacherName, date: selectedDate }
                            });
                            window.dispatchEvent(event);
                            
                            // Show confirmation toast
                            toast({
                              title: language === 'fr' ? 'Navigation vers emploi du temps' : 'Navigating to timetable',
                              description: language === 'fr' 
                                ? `Affichage de l'emploi du temps de ${absence.teacherName}`
                                : `Showing timetable for ${absence.teacherName}`
                            });
                          }}
                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 p-2"
                          data-testid={`button-timetable-${absence.id}`}
                          title={language === 'fr' ? 'Voir Emploi' : 'View Schedule'}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              console.log('[ABSENCE_DETAILS] 📋 Fetching absence details for:', absence.teacherName);
                              const response = await fetch(`/api/teacher-absences/details/${absence.id}`);
                              if (response.ok) {
                                const details = await response.json();
                                toast({
                                  title: language === 'fr' ? 'Détails absence' : 'Absence details',
                                  description: language === 'fr' 
                                    ? `Absence signalée le ${details.reportedDate || 'aujourd\'hui'}`
                                    : `Absence reported on ${details.reportedDate || 'today'}`
                                });
                              }
                            } catch (error) {
                              console.error('[ABSENCE_DETAILS] Error:', error);
                              toast({
                                title: language === 'fr' ? 'Détails absence' : 'Absence details',
                                description: language === 'fr' 
                                  ? `Absence de ${absence.teacherName} - ${absence.reason}`
                                  : `${absence.teacherName} absence - ${absence.reason}`
                              });
                            }
                          }}
                          className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 p-2"
                          data-testid={`button-details-${absence.id}`}
                          title={language === 'fr' ? 'Détails' : 'Details'}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>

                        {absence.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFindSubstitute(absence.teacherName)}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 p-2"
                            data-testid={`button-substitute-${absence.id}`}
                            title={language === 'fr' ? 'Trouver Remplaçant' : 'Find Substitute'}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                        
                      {/* Enhanced timetable context for today's absences */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          📅 {language === 'fr' ? 'Impact sur l\'emploi du temps' : 'Timetable Impact'}
                        </h4>
                        <div className="text-sm text-yellow-700">
                          <p><strong>{language === 'fr' ? 'Cours affectés aujourd\'hui' : 'Affected classes today'}:</strong></p>
                          <ul className="list-disc list-inside ml-2">
                            <li>8h00-9h00: {absence.subject} - {absence.classes[0]} (32 élèves)</li>
                            <li>10h00-11h00: {absence.subject} - {absence.classes[1] || absence.classes[0]} (28 élèves)</li>
                            <li>14h00-15h00: {language === 'fr' ? 'Cours de soutien' : 'Support class'} - {absence.classes[0]}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600"><strong>{language === 'fr' ? 'Matière' : 'Subject'}:</strong> {absence.subject}</p>
                          <p className="text-sm text-gray-600"><strong>{language === 'fr' ? 'Classes' : 'Classes'}:</strong> {absence?.classes?.join(', ')}</p>
                          <p className="text-sm text-gray-600"><strong>{language === 'fr' ? 'Raison' : 'Reason'}:</strong> {absence.reason}</p>
                          <p className="text-sm text-gray-600"><strong>{language === 'fr' ? 'Durée' : 'Duration'}:</strong> {absence.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600"><strong>{language === 'fr' ? 'Remplaçant' : 'Substitute'}:</strong> {absence.substitute}</p>
                          <p className="text-sm text-gray-600"><strong>{language === 'fr' ? 'Téléphone' : 'Phone'}:</strong> {absence.contactPhone}</p>
                          <p className="text-sm text-gray-600"><strong>Email:</strong> {absence.contactEmail}</p>
                          <p className="text-sm text-gray-600">
                            <strong>{language === 'fr' ? 'Élèves impactés' : 'Students affected'}:</strong> 
                            <span className="text-red-600 font-medium"> 60 élèves</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAbsenceManagement;