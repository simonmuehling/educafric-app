import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Eye, 
  Plus, 
  Trash2, 
  Download, 
  Settings, 
  School, 
  User, 
  BookOpen, 
  Languages, 
  Upload, 
  Camera,
  Clock,
  CheckCircle,
  Send,
  Archive,
  UserCheck,
  AlertCircle,
  Mail,
  MessageSquare,
  Bell
} from 'lucide-react';

interface Subject {
  name: string;
  t1Grade: number;
  t2Grade: number;
  t3Grade: number;
  coefficient: number;
  total: number;
  position: number;
  averageMark: number;
  remark: string;
  teacherName: string;
  comments: string;
}

interface BulletinFromTeacher {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  teacherName: string;
  period: string;
  academicYear: string;
  status: 'draft' | 'submitted' | 'approved' | 'sent';
  submittedAt?: string;
  approvedAt?: string;
  sentAt?: string;
  subjects: Subject[];
  teacherComments: string;
  generalAverage: number;
  classRank: number;
  totalStudentsInClass: number;
}

export default function BulletinManagementUnified() {
  const { language } = useLanguage();
  const { toast } = useToast();

  // États pour le générateur modulable
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [subjectsSource, setSubjectsSource] = useState<'class' | 'default' | 'manual'>('manual');

  // États pour la gestion des bulletins reçus des enseignants
  const [pendingBulletins, setPendingBulletins] = useState<BulletinFromTeacher[]>([]);
  const [approvedBulletins, setApprovedBulletins] = useState<BulletinFromTeacher[]>([]);
  const [sentBulletins, setSentBulletins] = useState<BulletinFromTeacher[]>([]);
  const [myBulletins, setMyBulletins] = useState<BulletinFromTeacher[]>([]);

  // État pour le formulaire modulable
  const [formData, setFormData] = useState({
    // Informations officielles Cameroun
    regionalDelegation: 'DU CENTRE',
    departmentalDelegation: 'DU MFOUNDI',
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    directorName: '',
    
    // Informations élève
    studentFirstName: '',
    studentLastName: '',
    studentBirthDate: '',
    studentBirthPlace: '',
    studentGender: '',
    studentNumber: '',
    studentPhoto: '',
    
    // Informations académiques
    className: '',
    enrollment: 0,
    academicYear: '2024-2025',
    term: 'Premier Trimestre',
    
    // Matières et notes
    subjectsGeneral: [] as Subject[],
    subjectsProfessional: [] as Subject[],
    subjectsOthers: [] as Subject[],
    
    // Évaluations et appréciations
    generalAverage: 0,
    classRank: 1,
    totalStudents: 0,
    workAppreciation: 'Satisfaisant',
    conductAppreciation: 'Très Bien',
    generalAppreciation: '',
    
    // Informations système
    verificationCode: '',
    
    // Language
    language: 'fr' as 'fr' | 'en'
  });

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    loadPendingBulletins();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Charger les données de l'école depuis les paramètres
      const settingsResponse = await fetch('/api/director/settings');
      if (settingsResponse.ok) {
        const { settings } = await settingsResponse.json();
        setFormData(prev => ({
          ...prev,
          schoolName: settings.school?.name || '',
          schoolAddress: settings.school?.address || '',
          schoolPhone: settings.school?.phone || '',
          schoolEmail: settings.school?.email || '',
          directorName: settings.school?.directorName || ''
        }));
      }

      // Charger classes, enseignants
      const [classesRes, teachersRes] = await Promise.all([
        fetch('/api/director/classes'),
        fetch('/api/director/teachers')
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.teachers || []);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les bulletins en attente d'approbation
  const loadPendingBulletins = async () => {
    try {
      const response = await fetch('/api/bulletins');
      if (response.ok) {
        const data = await response.json();
        const bulletins = data.bulletins || [];
        
        // Séparer les bulletins par statut
        setPendingBulletins(bulletins.filter((b: BulletinFromTeacher) => b.status === 'submitted'));
        setApprovedBulletins(bulletins.filter((b: BulletinFromTeacher) => b.status === 'approved'));
        setSentBulletins(bulletins.filter((b: BulletinFromTeacher) => b.status === 'sent'));
        setMyBulletins(bulletins); // Tous les bulletins pour la vue "Mes Bulletins"
      }
    } catch (error) {
      console.error('Erreur chargement bulletins:', error);
    }
  };

  // Approuver un bulletin
  const approveBulletin = async (bulletinId: number) => {
    try {
      const response = await fetch(`/api/bulletins/bulletins/${bulletinId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Bulletin approuvé avec succès",
        });
        
        // Recharger les bulletins
        await loadPendingBulletins();
      }
    } catch (error) {
      console.error('Erreur approbation bulletin:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'approbation du bulletin",
        variant: "destructive",
      });
    }
  };

  // Signer et envoyer des bulletins avec notifications
  const signAndSendBulletins = async (bulletinIds: number[]) => {
    try {
      setLoading(true);
      
      // Signature digitale et envoi avec notifications
      const response = await fetch('/api/bulletins/send-with-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletinIds,
          notificationTypes: ['sms', 'email', 'whatsapp'],
          language: formData.language
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Succès",
          description: `${result.sent} bulletins signés et envoyés avec notifications`,
        });
        
        // Recharger les bulletins
        await loadPendingBulletins();
      }
    } catch (error) {
      console.error('Erreur envoi bulletins:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi des bulletins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const text = {
    fr: {
      title: 'Gestion des Bulletins EDUCAFRIC - Module Unifié',
      description: 'Modulez et validez les bulletins envoyés par les enseignants, puis envoyez-les aux élèves et parents avec signature digitale.',
      pendingTab: 'En Attente d\'Approbation',
      approvedTab: 'Approuvés',
      sentTab: 'Envoyés',
      myBulletinsTab: 'Mes Bulletins',
      createNewTab: 'Créer Nouveau',
      approve: 'Approuver',
      signAndSend: 'Signer et Envoyer',
      viewDetails: 'Voir Détails',
      downloadPdf: 'Télécharger PDF',
      student: 'Élève',
      class: 'Classe',
      teacher: 'Enseignant',
      average: 'Moyenne',
      rank: 'Rang',
      status: 'Statut',
      submittedBy: 'Soumis par',
      submittedAt: 'Soumis le',
      approvedAt: 'Approuvé le',
      sentAt: 'Envoyé le',
      noData: 'Aucune donnée disponible',
      selectClass: 'Sélectionner une classe',
      selectStudent: 'Sélectionner un élève',
      createBulletin: 'Créer le bulletin',
      generatePdf: 'Générer PDF',
      preview: 'Aperçu',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès'
    },
    en: {
      title: 'EDUCAFRIC Bulletin Management - Unified Module',
      description: 'Modulate and validate bulletins sent by teachers, then send them to students and parents with digital signature.',
      pendingTab: 'Pending Approval',
      approvedTab: 'Approved',
      sentTab: 'Sent',
      myBulletinsTab: 'My Bulletins',
      createNewTab: 'Create New',
      approve: 'Approve',
      signAndSend: 'Sign and Send',
      viewDetails: 'View Details',
      downloadPdf: 'Download PDF',
      student: 'Student',
      class: 'Class',
      teacher: 'Teacher',
      average: 'Average',
      rank: 'Rank',
      status: 'Status',
      submittedBy: 'Submitted by',
      submittedAt: 'Submitted on',
      approvedAt: 'Approved on',
      sentAt: 'Sent on',
      noData: 'No data available',
      selectClass: 'Select a class',
      selectStudent: 'Select a student',
      createBulletin: 'Create bulletin',
      generatePdf: 'Generate PDF',
      preview: 'Preview',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  };

  const t = text[language];

  // Composant pour afficher une liste de bulletins
  const BulletinList = ({ bulletins, showActions = true, actionType = 'approve' }: { 
    bulletins: BulletinFromTeacher[], 
    showActions?: boolean,
    actionType?: 'approve' | 'send' | 'view'
  }) => (
    <div className="space-y-3">
      {bulletins.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          {t.noData}
        </Card>
      ) : (
        bulletins.map((bulletin) => (
          <Card key={bulletin.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t.student}</Label>
                  <p className="text-sm">{bulletin.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t.class}</Label>
                  <p className="text-sm">{bulletin.className}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t.teacher}</Label>
                  <p className="text-sm">{bulletin.teacherName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t.average}</Label>
                  <p className="text-sm">{bulletin.generalAverage.toFixed(1)}/20</p>
                </div>
              </div>
              
              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t.viewDetails}
                  </Button>
                  
                  {actionType === 'approve' && bulletin.status === 'submitted' && (
                    <Button
                      onClick={() => approveBulletin(bulletin.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t.approve}
                    </Button>
                  )}
                  
                  {actionType === 'send' && bulletin.status === 'approved' && (
                    <Button
                      onClick={() => signAndSendBulletins([bulletin.id])}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      disabled={loading}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {t.signAndSend}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              )}
            </div>
            
            {/* Statut et dates */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {bulletin.submittedAt && (
                  <span>{t.submittedAt}: {new Date(bulletin.submittedAt).toLocaleDateString()}</span>
                )}
                {bulletin.approvedAt && (
                  <span>{t.approvedAt}: {new Date(bulletin.approvedAt).toLocaleDateString()}</span>
                )}
                {bulletin.sentAt && (
                  <span>{t.sentAt}: {new Date(bulletin.sentAt).toLocaleDateString()}</span>
                )}
              </div>
              <Badge variant={
                bulletin.status === 'draft' ? 'secondary' :
                bulletin.status === 'submitted' ? 'default' :
                bulletin.status === 'approved' ? 'success' :
                'primary'
              }>
                {bulletin.status === 'draft' ? 'Brouillon' :
                 bulletin.status === 'submitted' ? 'Soumis' :
                 bulletin.status === 'approved' ? 'Approuvé' :
                 'Envoyé'}
              </Badge>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-6 w-6 text-blue-600" />
              {t.title}
            </h1>
            <p className="text-gray-600 mt-1">{t.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-1" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-2xl font-bold">{pendingBulletins.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Approuvés</p>
              <p className="text-2xl font-bold">{approvedBulletins.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Envoyés</p>
              <p className="text-2xl font-bold">{sentBulletins.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Archive className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{myBulletins.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {t.pendingTab}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t.approvedTab}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center">
            <Send className="w-4 h-4 mr-1" />
            {t.sentTab}
          </TabsTrigger>
          <TabsTrigger value="my-bulletins" className="flex items-center">
            <Archive className="w-4 h-4 mr-1" />
            {t.myBulletinsTab}
          </TabsTrigger>
          <TabsTrigger value="create-new" className="flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            {t.createNewTab}
          </TabsTrigger>
        </TabsList>

        {/* En Attente d'Approbation */}
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Bulletins en Attente d'Approbation ({pendingBulletins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulletinList bulletins={pendingBulletins} actionType="approve" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approuvés */}
        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Bulletins Approuvés ({approvedBulletins.length})
                </div>
                {approvedBulletins.length > 0 && (
                  <Button
                    onClick={() => signAndSendBulletins(approvedBulletins.map(b => b.id))}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Envoyer Tous
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulletinList bulletins={approvedBulletins} actionType="send" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Envoyés */}
        <TabsContent value="sent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2 text-blue-600" />
                Bulletins Envoyés ({sentBulletins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulletinList bulletins={sentBulletins} actionType="view" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mes Bulletins */}
        <TabsContent value="my-bulletins" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="w-5 h-5 mr-2 text-gray-600" />
                Tous Mes Bulletins ({myBulletins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulletinList bulletins={myBulletins} actionType="view" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Créer Nouveau - Module Modulable Intégré */}
        <TabsContent value="create-new" className="mt-6">
          <div className="space-y-6">
            {/* Sélection de Classe et Élève */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <School className="mr-2 h-5 w-5" />
                  Sélection de Classe et Élève
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Classe</Label>
                    <Select
                      value={selectedClassId}
                      onValueChange={(value) => setSelectedClassId(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectClass} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name} ({cls.studentCount || 0} élèves)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Élève</Label>
                    <Select
                      value={selectedStudentId}
                      onValueChange={(value) => setSelectedStudentId(value)}
                      disabled={!selectedClassId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectStudent} />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.firstName} {student.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations École Auto-chargées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <School className="mr-2 h-5 w-5 text-blue-600" />
                  Informations École (Auto-chargées)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom de l'École</Label>
                  <Input value={formData.schoolName} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Directeur</Label>
                  <Input value={formData.directorName} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Input value={formData.schoolAddress} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input value={formData.schoolPhone} readOnly className="bg-gray-50" />
                </div>
              </CardContent>
            </Card>

            {/* Informations Élève */}
            {selectedStudentId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-green-600" />
                    Informations Élève
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <Input 
                      value={formData.studentFirstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentFirstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input 
                      value={formData.studentLastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentLastName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Matricule</Label>
                    <Input 
                      value={formData.studentNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Photo Élève (optionnel)</Label>
                    <div className="mt-2 space-y-3">
                      {formData.studentPhoto && (
                        <div className="flex items-center space-x-3">
                          <img 
                            src={formData.studentPhoto} 
                            alt="Photo élève" 
                            className="w-16 h-20 object-cover border border-gray-300 rounded"
                          />
                          <Button
                            onClick={() => setFormData(prev => ({ ...prev, studentPhoto: '' }))}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label className="text-sm">URL de la photo</Label>
                          <Input 
                            value={formData.studentPhoto}
                            onChange={(e) => setFormData(prev => ({ ...prev, studentPhoto: e.target.value }))}
                            placeholder="https://... ou utilisez le bouton ci-dessous"
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="text-center">
                          <span className="text-sm text-gray-500">ou</span>
                        </div>
                        
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="photo-upload"
                            disabled={uploadingPhoto}
                          />
                          <Button
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            variant="outline"
                            size="sm"
                            disabled={uploadingPhoto}
                            className="w-full"
                          >
                            {uploadingPhoto ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Téléchargement...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Télécharger une photo
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">
                            Max 5MB • JPG, PNG, GIF
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions de création */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Créer le Bulletin</h3>
                    <p className="text-sm text-gray-600">
                      Générer un bulletin modulable avec les données sélectionnées
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" disabled={!selectedStudentId}>
                      <Eye className="w-4 h-4 mr-1" />
                      {t.preview}
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!selectedStudentId || loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t.loading}
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-1" />
                          {t.createBulletin}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}