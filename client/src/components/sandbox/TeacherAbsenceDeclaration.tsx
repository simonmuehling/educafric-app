import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, UserPlus, Users, Clock, AlertTriangle, CheckCircle, Phone, Mail, FileText, Send } from 'lucide-react';

interface TeacherAbsence {
  id: number;
  teacherName: string;
  subject: string;
  classes: string[];
  reason: string;
  startDate: string;
  endDate: string;
  duration: string;
  substitute: string;
  status: 'pending' | 'resolved';
  contactPhone: string;
  contactEmail: string;
  reportedBy: string;
  reportedAt: string;
}

const TeacherAbsenceDeclaration: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // Form state for new absence declaration
  const [newAbsence, setNewAbsence] = useState({
    teacherName: '',
    subject: '',
    classes: [] as string[],
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    contactPhone: '',
    contactEmail: '',
    details: ''
  });

  const [selectedTab, setSelectedTab] = useState<'declare' | 'manage'>('declare');

  // Mock data for existing absences
  const [absences, setAbsences] = useState<TeacherAbsence[]>([
    {
      id: 1,
      teacherName: 'Marie Dubois',
      subject: 'Mathématiques',
      classes: ['6ème A', '5ème B'],
      reason: 'Maladie',
      startDate: '2025-08-12',
      endDate: '2025-08-12',
      duration: '1 jour',
      substitute: 'Paul Martin',
      status: 'resolved',
      contactPhone: '+237654123456',
      contactEmail: 'marie.dubois@ecole.cm',
      reportedBy: 'Directeur',
      reportedAt: '2025-08-12T08:30:00Z'
    },
    {
      id: 2,
      teacherName: 'Jean Kouam',
      subject: 'Français',
      classes: ['3ème A', 'Terminale C'],
      reason: 'Urgence familiale',
      startDate: '2025-08-12',
      endDate: '2025-08-14',
      duration: '3 jours',
      substitute: 'En recherche',
      status: 'pending',
      contactPhone: '+237651987654',
      contactEmail: 'jean.kouam@ecole.cm',
      reportedBy: 'Enseignant',
      reportedAt: '2025-08-12T07:15:00Z'
    }
  ]);

  // Mock teachers and classes data
  const mockTeachers = [
    { name: 'Marie Dubois', subject: 'Mathématiques', phone: '+237654123456', email: 'marie.dubois@ecole.cm' },
    { name: 'Jean Kouam', subject: 'Français', phone: '+237651987654', email: 'jean.kouam@ecole.cm' },
    { name: 'Françoise Mbida', subject: 'Anglais', phone: '+237658741963', email: 'francoise.mbida@ecole.cm' },
    { name: 'Paul Martin', subject: 'Sciences', phone: '+237655432109', email: 'paul.martin@ecole.cm' },
    { name: 'Sophie Ngono', subject: 'Histoire', phone: '+237652147896', email: 'sophie.ngono@ecole.cm' }
  ];

  const mockClasses = ['6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B', '3ème A', '3ème B', 'Seconde A', 'Seconde B', 'Première C', 'Terminale C'];

  const text = {
    fr: {
      title: 'Déclaration Absence Enseignant',
      subtitle: 'Gérer les absences et remplacements',
      declare: 'Déclarer',
      manage: 'Gérer',
      teacherName: 'Nom de l\'enseignant',
      subject: 'Matière',
      classes: 'Classes affectées',
      reason: 'Motif d\'absence',
      startDate: 'Date début',
      endDate: 'Date fin',
      contactPhone: 'Téléphone',
      contactEmail: 'Email',
      details: 'Détails supplémentaires',
      declareAbsence: 'Déclarer l\'absence',
      currentAbsences: 'Absences en cours',
      resolved: 'Résolu',
      pending: 'En attente',
      notifyParents: 'Notifier parents',
      findSubstitute: 'Trouver remplaçant',
      markResolved: 'Marquer résolu',
      viewDetails: 'Voir détails',
      duration: 'Durée',
      substitute: 'Remplaçant',
      reportedBy: 'Signalé par',
      actions: 'Actions',
      reasons: {
        illness: 'Maladie',
        family: 'Urgence familiale',
        training: 'Formation',
        personal: 'Congé personnel',
        medical: 'Rendez-vous médical',
        other: 'Autre'
      },
      absenceDeclared: 'Absence déclarée',
      absenceDeclarationSuccess: 'L\'absence a été déclarée avec succès',
      parentsNotified: 'Parents notifiés',
      substituteFound: 'Remplaçant trouvé',
      absenceResolved: 'Absence résolue'
    },
    en: {
      title: 'Teacher Absence Declaration',
      subtitle: 'Manage absences and substitutes',
      declare: 'Declare',
      manage: 'Manage',
      teacherName: 'Teacher name',
      subject: 'Subject',
      classes: 'Affected classes',
      reason: 'Absence reason',
      startDate: 'Start date',
      endDate: 'End date',
      contactPhone: 'Phone',
      contactEmail: 'Email',
      details: 'Additional details',
      declareAbsence: 'Declare absence',
      currentAbsences: 'Current absences',
      resolved: 'Resolved',
      pending: 'Pending',
      notifyParents: 'Notify parents',
      findSubstitute: 'Find substitute',
      markResolved: 'Mark resolved',
      viewDetails: 'View details',
      duration: 'Duration',
      substitute: 'Substitute',
      reportedBy: 'Reported by',
      actions: 'Actions',
      reasons: {
        illness: 'Illness',
        family: 'Family emergency',
        training: 'Training',
        personal: 'Personal leave',
        medical: 'Medical appointment',
        other: 'Other'
      },
      absenceDeclared: 'Absence declared',
      absenceDeclarationSuccess: 'The absence has been successfully declared',
      parentsNotified: 'Parents notified',
      substituteFound: 'Substitute found',
      absenceResolved: 'Absence resolved'
    }
  };

  const t = text[language as keyof typeof text];

  const handleTeacherSelect = (teacherName: string) => {
    const teacher = mockTeachers.find(t => t.name === teacherName);
    if (teacher) {
      setNewAbsence(prev => ({
        ...prev,
        teacherName,
        subject: teacher.subject,
        contactPhone: teacher.phone,
        contactEmail: teacher.email
      }));
    }
  };

  const handleClassToggle = (className: string) => {
    setNewAbsence(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }));
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 jour' : `${diffDays} jours`;
  };

  const handleDeclareAbsence = () => {
    if (!newAbsence.teacherName || !newAbsence.reason || newAbsence.classes.length === 0) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    const absence: TeacherAbsence = {
      id: absences.length + 1,
      teacherName: newAbsence.teacherName,
      subject: newAbsence.subject,
      classes: newAbsence.classes,
      reason: newAbsence.reason,
      startDate: newAbsence.startDate,
      endDate: newAbsence.endDate,
      duration: calculateDuration(newAbsence.startDate, newAbsence.endDate),
      substitute: 'En recherche',
      status: 'pending',
      contactPhone: newAbsence.contactPhone,
      contactEmail: newAbsence.contactEmail,
      reportedBy: 'Directeur (Sandbox)',
      reportedAt: new Date().toISOString()
    };

    setAbsences(prev => [absence, ...prev]);

    toast({
      title: t.absenceDeclared,
      description: t.absenceDeclarationSuccess
    });

    // Reset form
    setNewAbsence({
      teacherName: '',
      subject: '',
      classes: [],
      reason: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      contactPhone: '',
      contactEmail: '',
      details: ''
    });

    setSelectedTab('manage');
  };

  const handleNotifyParents = (absence: TeacherAbsence) => {
    toast({
      title: t.parentsNotified,
      description: `${absence.classes.length * 15} parents informés de l'absence de ${absence.teacherName}`
    });
  };

  const handleFindSubstitute = (absenceId: number) => {
    setAbsences(prev => prev.map(absence => 
      absence.id === absenceId 
        ? { ...absence, substitute: 'Sophie Ngono', status: 'resolved' }
        : absence
    ));

    toast({
      title: t.substituteFound,
      description: 'Sophie Ngono assignée comme remplaçante'
    });
  };

  const handleMarkResolved = (absenceId: number) => {
    setAbsences(prev => prev.map(absence => 
      absence.id === absenceId 
        ? { ...absence, status: 'resolved' }
        : absence
    ));

    toast({
      title: t.absenceResolved,
      description: 'L\'absence a été marquée comme résolue'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            {t.title}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={selectedTab === 'declare' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('declare')}
              className="flex-1"
              data-testid="tab-declare"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.declare}
            </Button>
            <Button
              variant={selectedTab === 'manage' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('manage')}
              className="flex-1"
              data-testid="tab-manage"
            >
              <Users className="w-4 h-4 mr-2" />
              {t.manage}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {selectedTab === 'declare' && (
            <div className="space-y-6">
              {/* Teacher Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.teacherName} *</label>
                  <Select value={newAbsence.teacherName} onValueChange={handleTeacherSelect}>
                    <SelectTrigger data-testid="select-teacher">
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeachers.map(teacher => (
                        <SelectItem key={teacher.name} value={teacher.name}>
                          {teacher.name} - {teacher.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t.subject}</label>
                  <Input
                    value={newAbsence.subject}
                    readOnly
                    className="bg-gray-50"
                    data-testid="input-subject"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.startDate} *</label>
                  <Input
                    type="date"
                    value={newAbsence.startDate}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, startDate: e.target.value }))}
                    data-testid="input-start-date"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t.endDate} *</label>
                  <Input
                    type="date"
                    value={newAbsence.endDate}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, endDate: e.target.value }))}
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.reason} *</label>
                <Select value={newAbsence.reason} onValueChange={(value) => setNewAbsence(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger data-testid="select-reason">
                    <SelectValue placeholder="Sélectionner un motif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illness">{t.reasons.illness}</SelectItem>
                    <SelectItem value="family">{t.reasons.family}</SelectItem>
                    <SelectItem value="training">{t.reasons.training}</SelectItem>
                    <SelectItem value="personal">{t.reasons.personal}</SelectItem>
                    <SelectItem value="medical">{t.reasons.medical}</SelectItem>
                    <SelectItem value="other">{t.reasons.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Classes Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.classes} *</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {mockClasses.map(className => (
                    <Button
                      key={className}
                      variant={newAbsence.classes.includes(className) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleClassToggle(className)}
                      data-testid={`class-${className}`}
                    >
                      {className}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.contactPhone}</label>
                  <Input
                    value={newAbsence.contactPhone}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, contactPhone: e.target.value }))}
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t.contactEmail}</label>
                  <Input
                    value={newAbsence.contactEmail}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, contactEmail: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.details}</label>
                <Textarea
                  value={newAbsence.details}
                  onChange={(e) => setNewAbsence(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Informations supplémentaires..."
                  data-testid="textarea-details"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleDeclareAbsence}
                className="w-full h-12 text-base font-medium"
                data-testid="button-declare-absence"
              >
                <Send className="w-4 h-4 mr-2" />
                {t.declareAbsence}
              </Button>
            </div>
          )}

          {selectedTab === 'manage' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t.currentAbsences}</h3>
              
              {absences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune absence déclarée
                </div>
              ) : (
                <div className="space-y-4">
                  {absences.map(absence => (
                    <Card key={absence.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">{absence.teacherName}</h4>
                              <Badge variant={absence.status === 'resolved' ? 'default' : 'secondary'}>
                                {absence.status === 'resolved' ? t.resolved : t.pending}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {absence.duration}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Matière:</span> {absence.subject}
                            </div>
                            <div>
                              <span className="font-medium">Classes:</span> {absence.classes.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Motif:</span> {absence.reason}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Remplaçant:</span> {absence.substitute}
                            </div>
                            <div>
                              <span className="font-medium">Signalé par:</span> {absence.reportedBy}
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span> {absence.contactPhone}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNotifyParents(absence)}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              data-testid={`button-notify-${absence.id}`}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              {t.notifyParents}
                            </Button>

                            {absence.status === 'pending' && absence.substitute === 'En recherche' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFindSubstitute(absence.id)}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                data-testid={`button-substitute-${absence.id}`}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                {t.findSubstitute}
                              </Button>
                            )}

                            {absence.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkResolved(absence.id)}
                                className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                data-testid={`button-resolve-${absence.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t.markResolved}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAbsenceDeclaration;