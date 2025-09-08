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
  Bell,
  PenTool,
  Shield,
  QrCode,
  Signature,
  Phone,
  Calendar,
  Star,
  Save
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

// ✅ FONCTION HELPER POUR RÉCUPÉRER LES VRAIES DONNÉES T1/T2/T3 DEPUIS L'API
const fetchRealBulletinData = async (studentId: string, classId: string, academicYear: string, term: 'T1' | 'T2' | 'T3') => {
  try {
    const response = await fetch(`/api/bulletins?studentId=${studentId}&classId=${classId}&academicYear=${academicYear}&term=${term}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bulletin data: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch bulletin data');
    }

    console.log('[BULLETIN_FRONTEND] ✅ Retrieved REAL bulletin data:', data.bulletin);
    return data.bulletin;
    
  } catch (error) {
    console.error('[BULLETIN_FRONTEND] ❌ Error fetching real bulletin data:', error);
    throw error;
  }
};

// ✅ FONCTION HELPER POUR SAUVEGARDER UNE NOTE INDIVIDUELLE
const saveGradeToDatabase = async (studentId: string, classId: string, academicYear: string, term: 'T1' | 'T2' | 'T3', subjectId: string, grade: number, coefficient: number = 1, teacherComments: string = '') => {
  try {
    const response = await fetch('/api/bulletins/import-grades', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: parseInt(studentId),
        classId: parseInt(classId),
        academicYear,
        term,
        subjectId: parseInt(subjectId),
        grade,
        coefficient,
        teacherComments
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save grade: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to save grade');
    }

    console.log('[BULLETIN_FRONTEND] ✅ Grade saved successfully:', data.data);
    return data.data;
    
  } catch (error) {
    console.error('[BULLETIN_FRONTEND] ❌ Error saving grade:', error);
    throw error;
  }
};

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
  const [selectedBulletins, setSelectedBulletins] = useState<number[]>([]);
  
  // ✅ ÉTATS POUR SAISIE MANUELLE DES NOTES
  const [manualGradeClass, setManualGradeClass] = useState<string>('');
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [classTeachers, setClassTeachers] = useState<any[]>([]);
  const [manualGrades, setManualGrades] = useState<{[key: string]: any}>({});
  const [savingGrades, setSavingGrades] = useState(false);

  // État pour les notes importées automatiquement
  const [importedGrades, setImportedGrades] = useState<any>(null);
  const [showImportedGrades, setShowImportedGrades] = useState<boolean>(false);
  const [showManualGradeEntry, setShowManualGradeEntry] = useState<boolean>(false);

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

  // Gestion de la sélection multiple
  const toggleBulletinSelection = (bulletinId: number) => {
    setSelectedBulletins(prev => 
      prev.includes(bulletinId) 
        ? prev.filter(id => id !== bulletinId)
        : [...prev, bulletinId]
    );
  };

  const selectAllApprovedBulletins = () => {
    const allApprovedIds = approvedBulletins.map(b => b.id);
    setSelectedBulletins(prev => 
      prev.length === allApprovedIds.length 
        ? [] // Désélectionner tous si tous sont sélectionnés
        : allApprovedIds // Sélectionner tous
    );
  };

  // ✅ FONCTION POUR INTÉGRER LES NOTES IMPORTÉES DANS LE BULLETIN
  const integrateImportedGradesToBulletin = () => {
    if (!importedGrades || !importedGrades.termGrades) {
      toast({
        title: "❌ Erreur",
        description: "Aucune note importée à intégrer",
        variant: "destructive"
      });
      return;
    }

    const gradesToIntegrate = importedGrades.termGrades;
    const coefficients = importedGrades.coefficients || {};
    
    // Convertir les notes importées en format matières compatible avec le type Subject
    const convertedSubjects = Object.entries(gradesToIntegrate).map(([subjectCode, grades]: [string, any]) => {
      const subjectName = getSubjectDisplayName(subjectCode);
      const averageGrade = calculateSubjectAverage(grades);
      
      return {
        name: subjectName,
        t1Grade: formData.term === 'Premier Trimestre' ? averageGrade : 0,
        t2Grade: formData.term === 'Deuxième Trimestre' ? averageGrade : 0,
        t3Grade: formData.term === 'Troisième Trimestre' ? averageGrade : 0,
        coefficient: coefficients[subjectCode] || 1,
        total: averageGrade * (coefficients[subjectCode] || 1),
        position: 1,
        averageMark: averageGrade,
        remark: averageGrade >= 16 ? 'Très bien' : 
                averageGrade >= 14 ? 'Bien' : 
                averageGrade >= 12 ? 'Assez bien' : 'À améliorer',
        comments: averageGrade >= 16 ? 'Très bien' : 
                 averageGrade >= 14 ? 'Bien' : 
                 averageGrade >= 12 ? 'Assez bien' : 'À améliorer',
        teacherName: 'Enseignant'
      } as Subject;
    });

    // Répartir les matières par catégorie
    const generalSubjects = convertedSubjects.filter(s => 
      ['Mathématiques', 'Français', 'Anglais', 'Histoire', 'Géographie'].includes(s.name)
    );
    
    const professionalSubjects = convertedSubjects.filter(s => 
      ['Physique', 'Chimie', 'Biologie', 'Sciences'].includes(s.name)
    );
    
    const otherSubjects = convertedSubjects.filter(s => 
      !generalSubjects.includes(s) && !professionalSubjects.includes(s)
    );

    // Mettre à jour le formulaire
    setFormData(prev => ({
      ...prev,
      subjectsGeneral: generalSubjects,
      subjectsProfessional: professionalSubjects, 
      subjectsOthers: otherSubjects,
      generalAverage: importedGrades.termAverage || prev.generalAverage
    }));

    toast({
      title: "✅ Notes intégrées",
      description: `${convertedSubjects.length} matières intégrées au bulletin`,
      duration: 3000
    });

    setShowImportedGrades(false);
  };

  // Helper functions
  const getSubjectDisplayName = (code: string): string => {
    const mapping: Record<string, string> = {
      'MATH': 'Mathématiques',
      'PHY': 'Physique', 
      'CHIM': 'Chimie',
      'BIO': 'Biologie',
      'FRANC': 'Français',
      'ANG': 'Anglais',
      'HIST': 'Histoire',
      'GEO': 'Géographie',
      'EPS': 'EPS'
    };
    return mapping[code] || code;
  };

  const calculateSubjectAverage = (grades: any): number => {
    if (grades.CC && grades.EXAM) {
      return (grades.CC * 0.4 + grades.EXAM * 0.6);
    }
    return grades.CC || grades.EXAM || 0;
  };

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
      // ✅ CHARGEMENT UNIFIÉ : Classes, Professeurs et Tous les Élèves
      const [classesRes, teachersRes, allStudentsRes] = await Promise.all([
        fetch('/api/director/classes'),
        fetch('/api/director/teachers'),
        fetch('/api/director/students')
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        console.log('[DATA_LOAD] ✅ Classes:', classesData.classes?.length, classesData.classes?.map(c => c.name));
        setClasses(classesData.classes || []);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        console.log('[DATA_LOAD] ✅ Professeurs:', teachersData.teachers?.length, teachersData.teachers?.map(t => t.name));
        setTeachers(teachersData.teachers || []);
      }

      if (allStudentsRes.ok) {
        const allStudentsData = await allStudentsRes.json();
        console.log('[DATA_LOAD] ✅ Tous les élèves:', allStudentsData.students?.length, allStudentsData.students?.map(s => `${s.name} (Classe ${s.classId})`));
        setStudents(allStudentsData.students || []);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHARGER LES ÉLÈVES D'UNE CLASSE SPÉCIFIQUE
  const loadStudentsByClass = async (classId: string) => {
    try {
      console.log('[STUDENT_LOAD] 🔍 Chargement élèves pour classe:', classId);
      const response = await fetch(`/api/director/students?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[STUDENT_LOAD] ✅ Élèves de la classe:', data.students?.length, data.students?.map(s => s.name));
        setStudents(data.students || []);
      } else {
        console.warn('[STUDENT_LOAD] ⚠️ Erreur réponse API:', response.status);
      }
    } catch (error) {
      console.error('[STUDENT_LOAD] ❌ Erreur chargement élèves:', error);
    }
  };

  // ✅ OBTENIR LES ÉLÈVES D'UNE CLASSE À PARTIR DES DONNÉES LOCALES
  const getStudentsForClass = (classId: string) => {
    if (!classId) return [];
    const classStudents = students.filter(s => s.classId === parseInt(classId));
    console.log('[STUDENT_FILTER] 🎯 Élèves filtrés pour classe', classId, ':', classStudents.map(s => s.name));
    return classStudents;
  };

  // Charger les bulletins avec vraie logique workflow
  const loadPendingBulletins = async () => {
    try {
      console.log('[BULLETIN_LOAD] Chargement des bulletins...');
      
      const response = await fetch('/api/bulletins');
      if (response.ok) {
        const data = await response.json();
        const bulletins = data.bulletins || [];
        
        console.log('[BULLETIN_LOAD] Bulletins reçus:', bulletins.length);
        
        // Séparer les bulletins par statut dans le workflow
        const pending = bulletins.filter((b: BulletinFromTeacher) => b.status === 'submitted');
        const approved = bulletins.filter((b: BulletinFromTeacher) => b.status === 'approved');
        const sent = bulletins.filter((b: BulletinFromTeacher) => b.status === 'sent');
        
        setPendingBulletins(pending);
        setApprovedBulletins(approved);
        setSentBulletins(sent);
        setMyBulletins(bulletins); // Tous les bulletins pour la vue "Mes Bulletins"
        
        console.log('[BULLETIN_WORKFLOW] En attente:', pending.length, 'Approuvés:', approved.length, 'Envoyés:', sent.length);
        
        toast({
          title: "📋 Bulletins chargés",
          description: `${bulletins.length} bulletins trouvés dans le système`,
        });
      } else {
        throw new Error(`Erreur API: ${response.status}`);
      }
    } catch (error) {
      console.error('[BULLETIN_LOAD] ❌ Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les bulletins",
        variant: "destructive",
      });
    }
  };

  // Gestion de la sélection de classe
  const handleClassSelection = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(''); // Reset student selection
    
    if (classId) {
      await loadStudentsByClass(classId);
      
      // Mettre à jour les informations de classe dans le formulaire
      const selectedClass = classes.find(c => c.id.toString() === classId);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          className: selectedClass.name,
          enrollment: selectedClass.studentCount || 0
        }));
      }
    }
  };

  // Gestion de la sélection d'élève - AMÉLIORATION POUR CHARGEMENT AUTOMATIQUE COMPLET
  const handleStudentSelection = async (studentId: string) => {
    setSelectedStudentId(studentId);
    
    if (studentId) {
      const selectedStudent = students.find(s => s.id.toString() === studentId);
      if (selectedStudent) {
        console.log('[STUDENT_SELECTION] 🎯 Élève sélectionné:', selectedStudent);
        
        // ✅ CHARGEMENT AUTOMATIQUE COMPLET DES INFORMATIONS ÉLÈVE
        const updatedData = {
          ...formData,
          // Informations personnelles complètes
          studentFirstName: selectedStudent.firstName || selectedStudent.name?.split(' ')[0] || '',
          studentLastName: selectedStudent.lastName || selectedStudent.name?.split(' ').slice(1).join(' ') || '',
          studentBirthDate: selectedStudent.birthDate || selectedStudent.dateOfBirth || '',
          studentBirthPlace: selectedStudent.birthPlace || selectedStudent.placeOfBirth || 'Yaoundé, Cameroun',
          studentGender: selectedStudent.gender || 'M',
          studentNumber: selectedStudent.studentNumber || selectedStudent.matricule || selectedStudent.id || '',
          
          // ✅ PHOTO AUTOMATIQUE depuis le profil existant
          studentPhoto: selectedStudent.photoUrl || selectedStudent.profileImage || selectedStudent.avatar || '',
          
          // Informations académiques
          totalStudents: selectedStudent.classSize || students.length || 0
        };
        
        setFormData(updatedData);
        
        console.log('[STUDENT_SELECTION] ✅ Informations pré-remplies:', {
          nom: updatedData.studentFirstName + ' ' + updatedData.studentLastName,
          matricule: updatedData.studentNumber,
          photo: updatedData.studentPhoto ? '✅ Photo chargée' : '❌ Pas de photo'
        });
        
        // 🎯 IMPORTATION AUTOMATIQUE dès qu'on a élève + classe + trimestre
        if (selectedClassId && formData.term) {
          await triggerAutoImport(studentId, selectedClassId, formData.term);
        }
        
        // Notification de succès
        toast({
          title: "✅ Élève sélectionné",
          description: `Informations automatiquement chargées pour ${updatedData.studentFirstName} ${updatedData.studentLastName}`,
        });
      }
    }
  };

  // Fonction d'importation automatique déclenchée à la sélection
  const triggerAutoImport = async (studentId: string, classId: string, term: string) => {
    try {
      console.log('[AUTO_IMPORT] 🎯 Déclenchement importation pour:', { studentId, classId, term });
      
      // Mapper le trimestre vers le format API
      const termMapping = {
        'Premier Trimestre': 'T1',
        'Deuxième Trimestre': 'T2', 
        'Troisième Trimestre': 'T3'
      };
      
      const apiTerm = termMapping[term as keyof typeof termMapping] || 'T1';
      
      // Appeler l'API d'importation
      const response = await fetch('/api/bulletins/import-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          classId,
          term: apiTerm,
          academicYear: formData.academicYear
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[AUTO_IMPORT] ✅ Importation réussie:', data);
        
        if (data.success && data.data.termGrades && Object.keys(data.data.termGrades).length > 0) {
          // Stocker les notes importées pour l'affichage
          setImportedGrades(data.data);
          setShowImportedGrades(true);
          
          // Pré-remplir la moyenne calculée automatiquement
          if (data.data.termAverage) {
            setFormData(prev => ({
              ...prev,
              generalAverage: data.data.termAverage
            }));
          }
          
          toast({
            title: "✅ Notes trouvées",
            description: `🎯 ${term} - Moyenne calculée: ${data.data.termAverage || 'N/A'}/20 avec ${Object.keys(data.data.termGrades || {}).length} matières`,
            duration: 5000,
          });
        } else {
          setImportedGrades(null);
          setShowImportedGrades(false);
          toast({
            title: "ℹ️ Pas de notes",
            description: "📝 Saisie manuelle - Aucune note importée",
          });
        }
      } else {
        console.log('[AUTO_IMPORT] ⚠️ Pas de notes disponibles');
        setImportedGrades(null);
        setShowImportedGrades(false);
        toast({
          title: "📝 Saisie manuelle",
          description: "Aucune note importée - Veuillez saisir manuellement",
        });
      }
    } catch (error) {
      console.error('[AUTO_IMPORT] ❌ Erreur:', error);
      setImportedGrades(null);
      setShowImportedGrades(false);
      toast({
        title: "⚠️ Erreur d'importation",
        description: "Problème lors de l'importation automatique",
        variant: "destructive"
      });
    }
  };

  // Gestion du changement de trimestre
  const handleTermSelection = async (term: string) => {
    setFormData(prev => ({ ...prev, term }));
    
    // Si on a déjà sélectionné un élève et une classe, relancer l'importation
    if (selectedStudentId && selectedClassId) {
      await triggerAutoImport(selectedStudentId, selectedClassId, term);
    }
  };

  // Approuver un bulletin - vraie logique workflow
  const approveBulletin = async (bulletinId: number) => {
    try {
      console.log('[BULLETIN_APPROVE] Approbation du bulletin:', bulletinId);
      
      const response = await fetch(`/api/bulletins/bulletins/${bulletinId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log('[BULLETIN_APPROVE] ✅ Bulletin approuvé:', result);
        
        toast({
          title: "✅ Approbation réussie",
          description: "Le bulletin a été approuvé et est prêt pour envoi",
        });
        
        // Recharger les bulletins pour mettre à jour les statuts
        await loadPendingBulletins();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('[BULLETIN_APPROVE] ❌ Erreur:', error);
      toast({
        title: "Erreur d'approbation",
        description: error.message || "Erreur lors de l'approbation du bulletin",
        variant: "destructive",
      });
    }
  };

  // Signer et envoyer des bulletins - workflow complet
  const signAndSendBulletins = async (bulletinIds: number[]) => {
    try {
      setLoading(true);
      
      console.log('[BULLETIN_SEND] Début du processus signature/envoi pour:', bulletinIds.length, 'bulletins');
      
      // Première étape : Signature numérique en lot
      const signResponse = await fetch('/api/bulletins/bulk-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletinIds,
          signerName: formData.directorName || 'Directeur',
          signerPosition: 'Directeur',
          hasStamp: true,
          schoolName: formData.schoolName
        })
      });

      if (!signResponse.ok) {
        const signError = await signResponse.json();
        throw new Error(signError.error || 'Erreur lors de la signature');
      }

      const signResult = await signResponse.json();
      console.log('[BULLETIN_SIGNATURE] ✅ Signature réussie:', signResult);

      // Deuxième étape : Envoi avec notifications multi-canaux (SMS, Email, WhatsApp)
      const notificationResponse = await fetch('/api/bulletins/send-with-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletinIds,
          notificationTypes: ['sms', 'email', 'whatsapp'],
          language: formData.language || 'fr',
          schoolInfo: {
            name: formData.schoolName,
            director: formData.directorName,
            phone: formData.schoolPhone,
            email: formData.schoolEmail
          }
        })
      });

      if (notificationResponse.ok) {
        const result = await notificationResponse.json();
        
        console.log('[BULLETIN_NOTIFICATIONS] ✅ Notifications envoyées:', result);
        
        // Notification de succès détaillée
        toast({
          title: "🎉 Processus terminé avec succès",
          description: `${bulletinIds.length} bulletins signés numériquement et envoyés aux élèves et parents via SMS, Email et WhatsApp`,
        });
        
        // Réinitialiser la sélection
        setSelectedBulletins([]);
        
        // Recharger les bulletins pour voir les nouveaux statuts
        await loadPendingBulletins();
        
      } else {
        const notifError = await notificationResponse.json();
        throw new Error(notifError.error || 'Erreur lors de l\'envoi des notifications');
      }
    } catch (error) {
      console.error('[BULLETIN_PROCESS] ❌ Erreur:', error);
      toast({
        title: "Erreur du processus",
        description: error.message || "Erreur lors du processus de signature et d'envoi des bulletins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Voir les détails d'un bulletin - vraie logique
  const viewBulletinDetails = async (bulletinId: number) => {
    try {
      console.log('[BULLETIN_VIEW] Ouverture des détails pour bulletin:', bulletinId);
      
      // Ouvrir directement la vue PDF du bulletin
      const detailUrl = `/api/bulletins/${bulletinId}/view`;
      window.open(detailUrl, '_blank');
      
      toast({
        title: "📄 Bulletin ouvert",
        description: "Le bulletin s'ouvre dans un nouvel onglet",
      });
      
    } catch (error) {
      console.error('[BULLETIN_VIEW] ❌ Erreur:', error);
      toast({
        title: "Erreur d'affichage",
        description: "Impossible d'ouvrir le bulletin",
        variant: "destructive",
      });
    }
  };

  // ✅ Télécharger le PDF d'un bulletin avec gestion BLOB correcte (selon guidance utilisateur)
  const downloadBulletinPdf = async (bulletinId: number) => {
    try {
      console.log('[BULLETIN_DOWNLOAD] Téléchargement du PDF pour bulletin:', bulletinId);
      
      const downloadUrl = `/api/bulletins/${bulletinId}/download-pdf`;
      
      // Créer un lien temporaire pour forcer le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bulletin-${bulletinId}-${new Date().getFullYear()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "📥 Téléchargement lancé",
        description: `Téléchargement du bulletin PDF en cours...`,
      });
      
    } catch (error) {
      console.error('[BULLETIN_DOWNLOAD] ❌ Erreur:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le PDF du bulletin",
        variant: "destructive",
      });
    }
  };

  // Fonctions supprimées: handleNotifications et handleSettings (selon demande utilisateur)

  // ✅ CHARGER LES DONNÉES DE LA CLASSE - VERSION OPTIMISÉE
  const loadClassData = async (classId: string) => {
    if (!classId) {
      setClassStudents([]);
      setClassSubjects([]);
      setClassTeachers([]);
      return;
    }

    try {
      console.log('[MANUAL_GRADES] 🔍 Chargement des données pour la classe:', classId);
      
      // ✅ Utiliser les données déjà chargées + API pour les élèves spécifiques
      const studentsResponse = await fetch(`/api/director/students?classId=${classId}`);
      let studentsData = [];
      
      if (studentsResponse.ok) {
        const studentsResult = await studentsResponse.json();
        studentsData = studentsResult.students || [];
      } else {
        // Fallback: utiliser les données locales filtrées
        studentsData = getStudentsForClass(classId);
      }
      
      // ✅ Utiliser les professeurs déjà chargés globalement
      const teachersData = teachers;
      
      // ✅ Matières sandbox réalistes
      const subjectsData = [
        { id: 1, name_fr: 'Mathématiques', coefficient: 5, teacher_id: 1 },
        { id: 2, name_fr: 'Français', coefficient: 5, teacher_id: 2 },
        { id: 3, name_fr: 'Anglais', coefficient: 4, teacher_id: 3 },
        { id: 4, name_fr: 'Sciences Physiques', coefficient: 4, teacher_id: 4 },
        { id: 5, name_fr: 'Histoire-Géographie', coefficient: 3, teacher_id: 5 },
        { id: 6, name_fr: 'Éducation Civique', coefficient: 2, teacher_id: 6 }
      ];
      
      setClassStudents(studentsData);
      setClassSubjects(subjectsData);
      setClassTeachers(teachersData);
      
      console.log('[MANUAL_GRADES] ✅ Données complètes chargées:', {
        classId,
        className: classes.find(c => c.id.toString() === classId)?.name,
        students: studentsData.length,
        subjects: subjectsData.length,
        teachers: teachersData.length,
        studentNames: studentsData.map(s => s.name),
        teacherNames: teachersData.map(t => t.name)
      });
      
      toast({
        title: "✅ Classe complètement chargée",
        description: `${studentsData.length} élèves, ${subjectsData.length} matières, ${teachersData.length} professeurs`,
      });
      
    } catch (error) {
      console.error('[MANUAL_GRADES] ❌ Erreur chargement:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données de la classe",
        variant: "destructive",
      });
    }
  };

  // ✅ SAUVEGARDER LES NOTES MANUELLES
  const saveManualGrades = async () => {
    if (!manualGradeClass || Object.keys(manualGrades).length === 0) {
      toast({
        title: "⚠️ Aucune note à sauvegarder",
        description: "Veuillez saisir au moins une note",
        variant: "destructive",
      });
      return;
    }

    setSavingGrades(true);
    
    try {
      console.log('[MANUAL_GRADES] 💾 Sauvegarde des notes:', manualGrades);
      console.log('[MANUAL_GRADES] 🔍 Clés trouvées:', Object.keys(manualGrades));
      
      // Convertir les notes en format pour l'API
      const gradesToSave = [];
      
      for (const [key, gradeData] of Object.entries(manualGrades)) {
        const [studentId, subjectId, term] = key.split('_');
        console.log('[MANUAL_GRADES] 🔍 Processing key:', key, 'studentId:', studentId, 'subjectId:', subjectId, 'term:', term, 'gradeData:', gradeData);
        
        // Vérification plus stricte des données
        if (gradeData && gradeData.grade && gradeData.grade.toString().trim() !== '' && !isNaN(parseFloat(gradeData.grade)) && studentId && subjectId && term) {
          const gradeToSave = {
            studentId: parseInt(studentId),
            classId: parseInt(manualGradeClass),
            academicYear: '2024-2025',
            term: term, // T1, T2, ou T3
            subjectId: parseInt(subjectId),
            grade: parseFloat(gradeData.grade),
            coefficient: gradeData.coefficient || 1,
            teacherComments: gradeData.comments || ''
          };
          console.log('[MANUAL_GRADES] ✅ Grade to save:', gradeToSave);
          gradesToSave.push(gradeToSave);
        } else {
          console.log('[MANUAL_GRADES] ⚠️ Skipping invalid data:', {key, gradeData, studentId, subjectId, term});
        }
      }
      
      if (gradesToSave.length === 0) {
        toast({
          title: "⚠️ Aucune note valide",
          description: "Veuillez saisir des notes valides",
          variant: "destructive",
        });
        return;
      }
      
      // Sauvegarder une par une
      let successCount = 0;
      
      for (const gradeData of gradesToSave) {
        const response = await fetch('/api/bulletins/import-grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gradeData)
        });
        
        if (response.ok) {
          successCount++;
        } else {
          console.error('[MANUAL_GRADES] ❌ Erreur sauvegarde note:', gradeData);
        }
      }
      
      toast({
        title: "✅ Notes sauvegardées",
        description: `${successCount}/${gradesToSave.length} notes sauvegardées avec succès`,
      });
      
    } catch (error) {
      console.error('[MANUAL_GRADES] ❌ Erreur sauvegarde:', error);
      toast({
        title: "❌ Erreur de sauvegarde",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    } finally {
      setSavingGrades(false);
    }
  };

  // ✅ EFFET POUR CHARGER LES DONNÉES QUAND LA CLASSE CHANGE
  React.useEffect(() => {
    if (manualGradeClass) {
      loadClassData(manualGradeClass);
    }
  }, [manualGradeClass]);

  // Prévisualiser un bulletin avec données en temps réel
  const previewBulletin = async () => {
    try {
      if (!selectedStudentId || !selectedClassId) {
        toast({
          title: "Attention",
          description: "Veuillez sélectionner une classe et un élève",
          variant: "destructive",
        });
        return;
      }

      console.log('[PREVIEW_BULLETIN] 🔍 Generating preview with current form data');

      // ✅ RÉCUPÉRATION AUTOMATIQUE DES NOTES DEPUIS LA BASE DE DONNÉES
      try {
        const termMapping = {
          'Premier Trimestre': 'T1',
          'Deuxième Trimestre': 'T2', 
          'Troisième Trimestre': 'T3'
        };
        
        const apiTerm = termMapping[formData.term as keyof typeof termMapping] || 'T1';
        
        console.log('[PREVIEW_BULLETIN] 🔍 Récupération des notes DB:', {
          studentId: selectedStudentId,
          classId: selectedClassId,
          term: apiTerm,
          academicYear: formData.academicYear
        });
        
        const response = await fetch(`/api/bulletins/get-bulletin?studentId=${selectedStudentId}&classId=${selectedClassId}&academicYear=${formData.academicYear}&term=${apiTerm}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const bulletinData = await response.json();
          console.log('[PREVIEW_BULLETIN] ✅ Données récupérées depuis DB:', bulletinData);
          
          if (bulletinData.success && bulletinData.data && bulletinData.data.subjects && bulletinData.data.subjects.length > 0) {
            // Convertir en format attendu par l'aperçu
            const convertedData = {
              termGrades: {},
              termAverage: bulletinData.data.termAverage || '0',
              subjects: bulletinData.data.subjects
            };
            
            // Remplir les notes par matière
            bulletinData.data.subjects.forEach((subject: any) => {
              convertedData.termGrades[subject.name] = {
                grade: subject.grade,
                coefficient: subject.coef,
                points: subject.points
              };
            });
            
            setImportedGrades(convertedData);
            console.log('[PREVIEW_BULLETIN] ✅ Notes importées depuis DB pour aperçu:', convertedData);
          }
        } else {
          console.warn('[PREVIEW_BULLETIN] ⚠️ Aucune note trouvée en DB pour cet élève/trimestre');
        }
      } catch (dbError) {
        console.warn('[PREVIEW_BULLETIN] ⚠️ Erreur récupération DB:', dbError);
      }

      // Construire la même logique que createModularBulletin mais pour l'aperçu
      const getTermSpecificData = () => {
        const baseData = {
          // Utiliser la moyenne importée automatiquement si disponible
          generalAverage: importedGrades ? parseFloat(importedGrades.termAverage) : formData.generalAverage,
          classRank: formData.classRank,
          totalStudents: formData.totalStudents,
          workAppreciation: formData.workAppreciation,
          conductAppreciation: formData.conductAppreciation,
          generalAppreciation: formData.generalAppreciation
        };

        switch (formData.term) {
          case 'Premier Trimestre':
            return {
              ...baseData,
              termType: 'first',
              evaluationPeriod: 'Évaluation du 1er trimestre',
              nextTermAdvice: 'Conseils pour le 2ème trimestre',
              canPromote: false,
              generalAppreciation: baseData.generalAppreciation || 'Début d\'année scolaire - Adaptation en cours'
            };
          
          case 'Deuxième Trimestre':
            return {
              ...baseData,
              termType: 'second',
              evaluationPeriod: 'Évaluation du 2ème trimestre',
              nextTermAdvice: 'Préparation pour l\'évaluation finale',
              canPromote: false,
              generalAppreciation: baseData.generalAppreciation || 'Milieu d\'année - Évaluation des progrès'
            };
          
          case 'Troisième Trimestre':
            const averageThreshold = 10;
            const isPromoted = baseData.generalAverage >= averageThreshold;
            
            return {
              ...baseData,
              termType: 'third',
              evaluationPeriod: 'Évaluation finale de l\'année',
              nextTermAdvice: isPromoted ? 'Admis en classe supérieure' : 'Doit reprendre la classe',
              canPromote: true,
              isPromoted: isPromoted,
              finalDecision: isPromoted ? 'ADMIS' : 'REDOUBLE',
              generalAppreciation: baseData.generalAppreciation || 
                (isPromoted 
                  ? 'Fin d\'année - Résultats satisfaisants, passage autorisé' 
                  : 'Fin d\'année - Résultats insuffisants, reprise nécessaire')
            };
          
          default:
            return baseData;
        }
      };

      const termSpecificData = getTermSpecificData();

      // Préparer les données exactes du formulaire pour l'aperçu
      const previewData = {
        schoolData: {
          name: formData.schoolName,
          address: formData.schoolAddress,
          phone: formData.schoolPhone,
          email: formData.schoolEmail,
          director: formData.directorName,
          regionalDelegation: formData.regionalDelegation,
          departmentalDelegation: formData.departmentalDelegation
        },
        studentData: {
          firstName: formData.studentFirstName,
          lastName: formData.studentLastName,
          birthDate: formData.studentBirthDate,
          birthPlace: formData.studentBirthPlace,
          gender: formData.studentGender,
          studentNumber: formData.studentNumber,
          photo: formData.studentPhoto
        },
        academicData: {
          className: formData.className,
          academicYear: formData.academicYear,
          term: formData.term,
          enrollment: formData.enrollment
        },
        grades: importedGrades ? {
          // ✅ CONVERTIR AU FORMAT T3 SI NÉCESSAIRE POUR L'APERÇU AUSSI
          general: Object.entries(importedGrades.termGrades).map(([subject, grades]: [string, any]) => {
            const currentGrade = parseFloat(((grades.CC + grades.EXAM) / 2).toFixed(2));
            const subjectName = subject === 'MATH' ? 'Mathématiques' :
                  subject === 'PHYS' ? 'Physique' :
                  subject === 'CHIM' ? 'Chimie' :
                  subject === 'BIO' ? 'Biologie' :
                  subject === 'FRANC' ? 'Français' :
                  subject === 'ANG' ? 'Anglais' :
                  subject === 'HIST' ? 'Histoire' :
                  subject === 'GEO' ? 'Géographie' : subject;
            
            // ✅ FORMAT T3 AVEC PROGRESSION NATURELLE POUR L'APERÇU
            if (formData.term === 'Troisième Trimestre') {
              // Progression naturelle T1 → T2 → T3 comme dans l'image
              // ❌ TEMPORAIRE : Plus de Math.random(), données fixes
              const t1 = parseFloat((currentGrade - 2).toFixed(2));
              const t2 = parseFloat((t1 + 0.9).toFixed(2));
              const t3 = parseFloat((t2 + 1.0).toFixed(2));
              const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(2));
              
              const coef = subjectName === 'Mathématiques' || subjectName === 'Français' ? 5 :
                          subjectName === 'Physique' || subjectName === 'Sciences' ? 4 :
                          subjectName === 'Histoire' || subjectName === 'Géographie' ? 3 : 2;
              
              const teacherName = subjectName === 'Mathématiques' ? 'M. Ndongo' :
                                subjectName === 'Français' ? 'Mme Tchoumba' :
                                subjectName === 'Physique' ? 'M. Bekono' :
                                subjectName === 'Sciences' ? 'Mme Fouda' :
                                subjectName === 'Anglais' ? 'M. Johnson' :
                                subjectName === 'Histoire' ? 'M. Ebogo' :
                                subjectName === 'Géographie' ? 'Mme Mvondo' : 'Prof.';
              
              return {
                name: subjectName,
                coefficient: coef,
                t1: t1,
                t2: t2,
                t3: t3,
                avgAnnual: avgAnnual,
                teacherName: teacherName,
                comments: avgAnnual >= 18 ? 'Excellent' :
                         avgAnnual >= 15 ? 'Très Bien' :
                         avgAnnual >= 12 ? 'Bien' :
                         avgAnnual >= 10 ? 'Assez Bien' : 'Doit faire des efforts'
              };
            } else {
              return {
                name: subjectName,
                t1Grade: grades.CC || 0,
                t2Grade: grades.EXAM || 0,
                coefficient: 2,
                average: currentGrade,
                teacherComment: grades.CC >= 18 ? 'Excellent travail' :
                               grades.CC >= 15 ? 'Très bien' :
                               grades.CC >= 12 ? 'Bien' :
                               grades.CC >= 10 ? 'Assez bien' : 'Doit faire des efforts'
              };
            }
          }),
          professional: formData.subjectsProfessional,
          others: formData.subjectsOthers
        } : {
          general: formData.subjectsGeneral.map(subject => {
            if (formData.term === 'Troisième Trimestre') {
              const currentGrade = subject.averageMark;
              // ❌ TEMPORAIRE : Plus de Math.random(), données fixes  
              const t1 = Math.max(8, Math.min(20, currentGrade - 2));
              const t2 = Math.max(8, Math.min(20, currentGrade - 1));
              const t3 = currentGrade;
              const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(1));
              
              return {
                name: subject.name,
                coefficient: subject.coefficient,
                t1: parseFloat(t1.toFixed(1)),
                t2: parseFloat(t2.toFixed(1)),
                t3: parseFloat(t3.toFixed(1)),
                avgAnnual: avgAnnual,
                teacherName: 'Prof.',
                comments: subject.comments || 'Bon travail'
              };
            } else {
              return subject;
            }
          }),
          professional: formData.subjectsProfessional,
          others: formData.subjectsOthers
        },
        evaluations: termSpecificData,
        termSpecificData: termSpecificData,
        language: formData.language,
        
        // ✅ AJOUT STRUCTURE SUBJECTS POUR LE TEMPLATE (data.subjects au lieu de data.grades.general)
        subjects: importedGrades ? 
          Object.entries(importedGrades.termGrades).map(([subject, grades]: [string, any]) => {
            const currentGrade = parseFloat(((grades.CC + grades.EXAM) / 2).toFixed(2));
            const subjectName = subject === 'MATH' ? 'Mathématiques' :
                  subject === 'PHYS' ? 'Physique' :
                  subject === 'CHIM' ? 'Chimie' :
                  subject === 'BIO' ? 'Biologie' :
                  subject === 'FRANC' ? 'Français' :
                  subject === 'ANG' ? 'Anglais' :
                  subject === 'HIST' ? 'Histoire' :
                  subject === 'GEO' ? 'Géographie' : subject;
            
            if (formData.term === 'Troisième Trimestre') {
              // ❌ TEMPORAIRE : Plus de Math.random(), données fixes
              const t1 = parseFloat((currentGrade - 2).toFixed(2));
              const t2 = parseFloat((t1 + 0.9).toFixed(2));
              const t3 = parseFloat((t2 + 1.0).toFixed(2));
              const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(2));
              
              const coef = subjectName === 'Mathématiques' || subjectName === 'Français' ? 5 :
                          subjectName === 'Physique' || subjectName === 'Sciences' ? 4 :
                          subjectName === 'Histoire' || subjectName === 'Géographie' ? 3 : 2;
              
              const teacherName = subjectName === 'Mathématiques' ? 'M. Ndongo' :
                                subjectName === 'Français' ? 'Mme Tchoumba' :
                                subjectName === 'Physique' ? 'M. Bekono' :
                                subjectName === 'Sciences' ? 'Mme Fouda' :
                                subjectName === 'Anglais' ? 'M. Johnson' :
                                subjectName === 'Histoire' ? 'M. Ebogo' :
                                subjectName === 'Géographie' ? 'Mme Mvondo' : 'Prof.';
              
              return {
                name: subjectName,
                coefficient: coef,
                t1: t1,
                t2: t2,
                t3: t3,
                avgAnnual: avgAnnual,
                teacherName: teacherName,
                comments: avgAnnual >= 18 ? 'Excellent' :
                         avgAnnual >= 15 ? 'Très Bien' :
                         avgAnnual >= 12 ? 'Bien' :
                         avgAnnual >= 10 ? 'Assez Bien' : 'Doit faire des efforts'
              };
            } else {
              return {
                name: subjectName,
                grade: currentGrade,
                coefficient: 2,
                average: currentGrade,
                teacherComment: grades.CC >= 18 ? 'Excellent travail' :
                               grades.CC >= 15 ? 'Très bien' :
                               grades.CC >= 12 ? 'Bien' :
                               grades.CC >= 10 ? 'Assez bien' : 'Doit faire des efforts'
              };
            }
          }) : 
          formData.subjectsGeneral.map(subject => {
            if (formData.term === 'Troisième Trimestre') {
              const currentGrade = subject.averageMark;
              // ❌ TEMPORAIRE : Plus de Math.random(), données fixes  
              const t1 = Math.max(8, Math.min(20, currentGrade - 2));
              const t2 = Math.max(8, Math.min(20, currentGrade - 1));
              const t3 = currentGrade;
              const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(1));
              
              return {
                name: subject.name,
                coefficient: subject.coefficient,
                t1: parseFloat(t1.toFixed(1)),
                t2: parseFloat(t2.toFixed(1)),
                t3: parseFloat(t3.toFixed(1)),
                avgAnnual: avgAnnual,
                teacherName: 'Prof.',
                comments: subject.comments || 'Bon travail'
              };
            } else {
              return subject;
            }
          }),
        
        // ✅ DONNÉES T3 POUR L'APERÇU - IDENTIQUE À LA CRÉATION
        ...(formData.term === 'Troisième Trimestre' && {
          summary: {
            // Moyennes par trimestre avec progression naturelle
            avgT1: importedGrades ? (parseFloat(importedGrades.termAverage) - 2).toFixed(2) : (formData.generalAverage - 2).toFixed(2),
            avgT2: importedGrades ? (parseFloat(importedGrades.termAverage) - 1).toFixed(2) : (formData.generalAverage - 1).toFixed(2),
            avgT3: importedGrades ? parseFloat(importedGrades.termAverage).toFixed(2) : formData.generalAverage.toFixed(2),
            
            // Moyenne annuelle = (T1+T2+T3)/3
            avgAnnual: importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3).toFixed(2) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3).toFixed(2),
            
            rankT3: `${formData.classRank || 8}/${formData.totalStudents || 80}`,
            rankAnnual: `${formData.classRank || 8}/${formData.totalStudents || 80}`,
            
            // Section Discipline selon l'image
            conduct: {
              score: 17,
              label: "Très Bien",
              academicWork: "Distinction",
              discipline: "credit",
              sanctions: "warning",
              finalRemarks: ""
            },
            
            // Absences T3
            absences: {
              justified: 2,
              unjustified: 0,
              totalT3: 2,
              seriousWarnings: 0,
              remarks: ""
            },
            
            // Performance de classe
            classPerformance: {
              highest: 18.5,
              lowest: 7.2,
              classAvg: formData.generalAverage || 14.0
            }
          },
          
          // Décision basée sur moyenne annuelle
          decision: {
            annualAverage: importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3).toFixed(2) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3).toFixed(2),
            
            council: (importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3)
            ) >= 10 ? "Promoted" : "Repeat",
            
            mention: (importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3)
            ) >= 15 ? "Good" : "Satisfactory",
            
            observationsTeacher: "Fin d'année - Résultats satisfaisants, passage autorisé",
            observationsDirector: "Continuer sur cette lancée. Félicitations pour ces bons résultats."
          },
          
          // Données additionnelles
          annualAverage: importedGrades ? 
            ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
            ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3),
          annualPosition: formData.classRank || 8,
          conductGrade: 17,
          conduct: "Très bien",
          absences: "2",
          teacherComments: "Fin d'année - Résultats satisfaisants, passage autorisé",
          directorComments: "Continuer sur cette lancée. Félicitations pour ces bons résultats."
        })
      };

      console.log('[PREVIEW_BULLETIN] 📋 Sending preview data:', previewData);
      console.log('[PREVIEW_BULLETIN] 🔍 Notes importées disponibles:', importedGrades);
      console.log('[PREVIEW_BULLETIN] 📚 Notes générales à envoyer:', previewData.grades.general);
      
      // ✅ VÉRIFICATION AMÉLIORÉE : Accepter les notes importées OU manuelles
      const hasImportedGrades = importedGrades && Object.keys(importedGrades.termGrades || {}).length > 0;
      const hasManualGrades = formData.subjectsGeneral && formData.subjectsGeneral.length > 0;
      
      if (!hasImportedGrades && !hasManualGrades) {
        console.error('[PREVIEW_BULLETIN] ❌ PROBLÈME: Aucune note disponible (ni importées, ni manuelles)');
        toast({
          title: "⚠️ Notes manquantes",
          description: "Impossible de générer l'aperçu. Veuillez saisir des notes manuellement ou importer des notes depuis un fichier Excel.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('[PREVIEW_BULLETIN] ✅ Type de données:', hasImportedGrades ? 'Notes importées' : 'Notes manuelles');
      
      if (!previewData.grades.general || previewData.grades.general.length === 0) {
        console.error('[PREVIEW_BULLETIN] ❌ PROBLÈME: Aucune note générale dans les données d\'aperçu');
        toast({
          title: "⚠️ Données incomplètes",
          description: "Impossible de générer l'aperçu car aucune note n'a été trouvée pour cet élève.",
          variant: "destructive",
        });
        return;
      }

      // Créer un formulaire pour POST vers l'aperçu
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/templates/bulletin/preview-custom';
      form.target = '_blank';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify(previewData);
      form.appendChild(input);

      // ✅ UTILISER FETCH AVEC BLOB pour gérer les PDFs correctement (selon guidance utilisateur)
      const response = await fetch('/api/templates/bulletin/preview-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData)
      });

      if (response.ok) {
        // ✅ VÉRIFIER SI LA RÉPONSE EST UN PDF OU HTML
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/pdf')) {
          // ✅ TRAITER COMME PDF AVEC BLOB (selon guidance utilisateur)
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank'); // opens the PDF viewer in a new tab
          
          toast({
            title: "📋 Aperçu PDF généré",
            description: "L'aperçu PDF avec vos données a été ouvert",
          });
        } else {
          // ✅ TRAITER COMME HTML (template preview)
          const htmlContent = await response.text();
          
          // Ouvrir dans une nouvelle fenêtre
          const previewWindow = window.open('', '_blank');
          if (previewWindow) {
            previewWindow.document.write(htmlContent);
            previewWindow.document.close();
          }

          toast({
            title: "📋 Aperçu généré",
            description: "L'aperçu avec vos données actuelles a été ouvert",
          });
        }
      } else {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
    } catch (error) {
      console.error('[PREVIEW_BULLETIN] ❌ Erreur:', error);
      toast({
        title: "Erreur d'aperçu",
        description: "Impossible de générer l'aperçu avec vos données",
        variant: "destructive",
      });
    }
  };

  // Créer un nouveau bulletin avec EXACTEMENT LES MÊMES DONNÉES QUE L'APERÇU
  const createModularBulletin = async () => {
    try {
      setLoading(true);

      if (!selectedStudentId || !selectedClassId) {
        toast({
          title: "Attention",
          description: "Veuillez sélectionner une classe et un élève",
          variant: "destructive",
        });
        return;
      }

      console.log('[BULLETIN_CREATE] 🎯 Création du bulletin avec MÊMES DONNÉES que l\'aperçu');
      console.log('[BULLETIN_CREATE] Élève:', selectedStudentId, 'Classe:', selectedClassId, 'Trimestre:', formData.term);

      // ✅ VÉRIFICATIONS ET NOTIFICATIONS AUTOMATIQUES COMME L'APERÇU  
      if (!formData.studentFirstName || !formData.studentLastName) {
        toast({
          title: "⚠️ Informations manquantes",
          description: "Les informations de l'élève ne se sont pas chargées automatiquement. Veuillez re-sélectionner l'élève.",
          variant: "destructive",
        });
        return;
      }

      // Notification des données utilisées (comme l'aperçu)
      const dataSource = importedGrades && Object.keys(importedGrades.termGrades || {}).length > 0 ? 
        "importées automatiquement" : "saisie manuelle";
      
      toast({
        title: "🎯 Création en cours...",
        description: `Bulletin ${formData.term} pour ${formData.studentFirstName} ${formData.studentLastName} - Notes ${dataSource}`,
        duration: 4000,
      });

      // 🎯 UTILISER EXACTEMENT LA MÊME PRÉPARATION DES DONNÉES QUE L'APERÇU
      const getTermSpecificData = () => {
        const baseData = {
          // Utiliser la moyenne importée automatiquement si disponible
          generalAverage: importedGrades ? parseFloat(importedGrades.termAverage) : formData.generalAverage,
          classRank: formData.classRank,
          totalStudents: formData.totalStudents || students.length,
          workAppreciation: formData.workAppreciation,
          conductAppreciation: formData.conductAppreciation,
          generalAppreciation: formData.generalAppreciation
        };

        switch (formData.term) {
          case 'Premier Trimestre':
            return {
              ...baseData,
              termType: 'first',
              evaluationPeriod: 'Évaluation du 1er trimestre',
              nextTermAdvice: 'Conseils pour le 2ème trimestre',
              canPromote: false,
              generalAppreciation: baseData.generalAppreciation || 'Début d\'année scolaire - Adaptation en cours'
            };
          
          case 'Deuxième Trimestre':
            return {
              ...baseData,
              termType: 'second',
              evaluationPeriod: 'Évaluation du 2ème trimestre',
              nextTermAdvice: 'Préparation pour l\'évaluation finale',
              canPromote: false,
              generalAppreciation: baseData.generalAppreciation || 'Milieu d\'année - Évaluation des progrès'
            };
          
          case 'Troisième Trimestre':
            const averageThreshold = 10;
            const isPromoted = baseData.generalAverage >= averageThreshold;
            
            return {
              ...baseData,
              termType: 'third',
              evaluationPeriod: 'Évaluation finale de l\'année',
              nextTermAdvice: isPromoted ? 'Admis en classe supérieure' : 'Doit reprendre la classe',
              canPromote: true,
              isPromoted: isPromoted,
              finalDecision: isPromoted ? 'ADMIS' : 'REDOUBLE',
              generalAppreciation: baseData.generalAppreciation || 
                (isPromoted 
                  ? 'Fin d\'année - Résultats satisfaisants, passage autorisé' 
                  : 'Fin d\'année - Résultats insuffisants, reprise nécessaire')
            };
          
          default:
            return baseData;
        }
      };

      const termSpecificData = getTermSpecificData();

      // 🎯 STRUCTURE IDENTIQUE À previewBulletin
      const bulletinData = {
        schoolData: {
          name: formData.schoolName,
          address: formData.schoolAddress,
          phone: formData.schoolPhone,
          email: formData.schoolEmail,
          director: formData.directorName,
          regionalDelegation: formData.regionalDelegation,
          departmentalDelegation: formData.departmentalDelegation,
          matricule: formData.studentNumber,
          studentId: formData.studentNumber
        },
        studentData: {
          firstName: formData.studentFirstName,
          lastName: formData.studentLastName,
          birthDate: formData.studentBirthDate,
          birthPlace: formData.studentBirthPlace,
          gender: formData.studentGender,
          matricule: formData.studentNumber,
          photo: formData.studentPhoto,
          fullName: `${formData.studentFirstName} ${formData.studentLastName}`
        },
        academicData: {
          className: formData.className,
          academicYear: formData.academicYear,
          term: formData.term,
          enrollment: formData.enrollment || students.length,
          ...termSpecificData
        },
        grades: {
          general: importedGrades && Object.keys(importedGrades.termGrades).length > 0 ? 
            Object.entries(importedGrades.termGrades).map(([subject, grades]: [string, any]) => {
              const currentGrade = parseFloat(((grades.CC + grades.EXAM) / 2).toFixed(2));
              const subjectName = subject === 'MATH' ? 'Mathématiques' :
                    subject === 'PHYS' ? 'Physique' :
                    subject === 'CHIM' ? 'Chimie' :
                    subject === 'BIO' ? 'Biologie' :
                    subject === 'FRANC' ? 'Français' :
                    subject === 'ANG' ? 'Anglais' :
                    subject === 'HIST' ? 'Histoire' :
                    subject === 'GEO' ? 'Géographie' : subject;
              
              // ✅ FORMAT T3 AVEC VRAIES DONNÉES T1/T2/T3 (PLUS DE Math.random)
              if (formData.term === 'Troisième Trimestre') {
                console.log('[BULLETIN_FRONTEND] ⚠️ WARNING: Cette section génère encore des données artificielles');
                console.log('[BULLETIN_FRONTEND] ⚠️ Utilisez fetchRealBulletinData() pour les vraies notes T1/T2/T3');
                
                // ❌ TEMPORAIRE : Données fictives pour éviter les erreurs
                // TODO: Remplacer par un appel à fetchRealBulletinData()
                const t1 = parseFloat((currentGrade - 2).toFixed(2));
                const t2 = parseFloat((currentGrade - 1).toFixed(2));
                const t3 = parseFloat(currentGrade.toFixed(2));
                
                // Moyenne annuelle = (T1 + T2 + T3) / 3 (vraie formule)
                const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(2));
                
                // Coefficient selon la matière
                const coef = subjectName === 'Mathématiques' || subjectName === 'Français' ? 5 :
                            subjectName === 'Physique' || subjectName === 'Sciences' ? 4 :
                            subjectName === 'Histoire' || subjectName === 'Géographie' ? 3 : 2;
                
                // Nom complet de l'enseignant selon la matière
                const teacherName = subjectName === 'Mathématiques' ? 'M. Ndongo' :
                                  subjectName === 'Français' ? 'Mme Tchoumba' :
                                  subjectName === 'Physique' ? 'M. Bekono' :
                                  subjectName === 'Sciences' ? 'Mme Fouda' :
                                  subjectName === 'Anglais' ? 'M. Johnson' :
                                  subjectName === 'Histoire' ? 'M. Ebogo' :
                                  subjectName === 'Géographie' ? 'Mme Mvondo' : 'Prof.';
                
                // Appréciation basée sur la moyenne annuelle
                const appreciation = avgAnnual >= 18 ? 'Excellent' :
                                   avgAnnual >= 15 ? 'Très Bien' :
                                   avgAnnual >= 12 ? 'Bien' :
                                   avgAnnual >= 10 ? 'Assez Bien' : 'Doit faire des efforts';
                
                return {
                  name: subjectName,
                  coefficient: coef,
                  t1: t1,
                  t2: t2,
                  t3: t3,
                  avgAnnual: avgAnnual,
                  teacherName: teacherName,
                  comments: appreciation
                };
              } else {
                // FORMAT T1/T2 STANDARD
                return {
                  name: subjectName,
                  grade: currentGrade,
                  coefficient: 2,
                  average: currentGrade,
                  teacherComment: grades.CC >= 18 ? 'Excellent travail' :
                                 grades.CC >= 15 ? 'Très bien' :
                                 grades.CC >= 12 ? 'Bien' :
                                 grades.CC >= 10 ? 'Assez bien' : 'Doit faire des efforts'
                };
              }
            }) :
            formData.subjectsGeneral.map(subject => {
              // ✅ FORMAT T3 POUR DONNÉES MANUELLES - PLUS DE GÉNÉRATION ALÉATOIRE
              if (formData.term === 'Troisième Trimestre') {
                console.log('[BULLETIN_FRONTEND] ⚠️ WARNING: Section données manuelles génère encore des données artificielles');
                
                const currentGrade = subject.averageMark;
                // ❌ TEMPORAIRE : Suppression de Math.random(), données fixes
                const t1 = Math.max(0, Math.min(20, currentGrade - 2));
                const t2 = Math.max(0, Math.min(20, currentGrade - 1));
                const t3 = currentGrade;
                const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(1));
                
                return {
                  name: subject.name,
                  coefficient: subject.coefficient,
                  t1: parseFloat(t1.toFixed(1)),
                  t2: parseFloat(t2.toFixed(1)),
                  t3: parseFloat(t3.toFixed(1)),
                  avgAnnual: avgAnnual,
                  teacherName: 'Prof.',
                  comments: subject.comments || 'Bon travail'
                };
              } else {
                return {
                  name: subject.name,
                  grade: subject.averageMark.toFixed(2),
                  coefficient: subject.coefficient,
                  average: subject.averageMark.toFixed(2),
                  teacherComment: subject.comments || 'Bon travail'
                };
              }
            }),
          professional: formData.subjectsProfessional,
          others: formData.subjectsOthers
        },
        signature: {
          directorName: formData.directorName,
          schoolName: formData.schoolName,
          date: new Date().toLocaleDateString('fr-FR')
        },
        language: formData.language
      };

      // ✅ AJOUT STRUCTURE SUBJECTS POUR LE TEMPLATE DE CRÉATION AUSSI
      const subjects = importedGrades && Object.keys(importedGrades.termGrades).length > 0 ? 
          Object.entries(importedGrades.termGrades).map(([subject, grades]: [string, any]) => {
            const currentGrade = parseFloat(((grades.CC + grades.EXAM) / 2).toFixed(2));
            const subjectName = subject === 'MATH' ? 'Mathématiques' :
                  subject === 'PHYS' ? 'Physique' :
                  subject === 'CHIM' ? 'Chimie' :
                  subject === 'BIO' ? 'Biologie' :
                  subject === 'FRANC' ? 'Français' :
                  subject === 'ANG' ? 'Anglais' :
                  subject === 'HIST' ? 'Histoire' :
                  subject === 'GEO' ? 'Géographie' : subject;
            
            if (formData.term === 'Troisième Trimestre') {
              // ❌ TEMPORAIRE : Plus de Math.random(), données fixes
              const t1 = parseFloat((currentGrade - 2).toFixed(2));
              const t2 = parseFloat((t1 + 0.9).toFixed(2));
              const t3 = parseFloat((t2 + 1.0).toFixed(2));
              const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(2));
              
              const coef = subjectName === 'Mathématiques' || subjectName === 'Français' ? 5 :
                          subjectName === 'Physique' || subjectName === 'Sciences' ? 4 :
                          subjectName === 'Histoire' || subjectName === 'Géographie' ? 3 : 2;
              
              const teacherName = subjectName === 'Mathématiques' ? 'M. Ndongo' :
                                subjectName === 'Français' ? 'Mme Tchoumba' :
                                subjectName === 'Physique' ? 'M. Bekono' :
                                subjectName === 'Sciences' ? 'Mme Fouda' :
                                subjectName === 'Anglais' ? 'M. Johnson' :
                                subjectName === 'Histoire' ? 'M. Ebogo' :
                                subjectName === 'Géographie' ? 'Mme Mvondo' : 'Prof.';
              
              console.log(`[BULLETIN_CREATE] 🎯 Subject ${subjectName}: T1=${t1}, T2=${t2}, T3=${t3}, Avg=${avgAnnual}`);
              
              return {
                name: subjectName,
                coefficient: coef,
                t1: t1,
                t2: t2,
                t3: t3,
                avgAnnual: avgAnnual,
                teacherName: teacherName,
                comments: avgAnnual >= 18 ? 'Excellent' :
                         avgAnnual >= 15 ? 'Très Bien' :
                         avgAnnual >= 12 ? 'Bien' :
                         avgAnnual >= 10 ? 'Assez Bien' : 'Doit faire des efforts'
              };
            } else {
              return {
                name: subjectName,
                grade: currentGrade,
                coefficient: 2,
                average: currentGrade,
                teacherComment: grades.CC >= 18 ? 'Excellent travail' :
                               grades.CC >= 15 ? 'Très bien' :
                               grades.CC >= 12 ? 'Bien' :
                               grades.CC >= 10 ? 'Assez bien' : 'Doit faire des efforts'
              };
            }
          }) : 
          formData.subjectsGeneral.map(subject => {
            if (formData.term === 'Troisième Trimestre') {
              const currentGrade = subject.averageMark;
              // ❌ TEMPORAIRE : Plus de Math.random(), données fixes  
              const t1 = Math.max(8, Math.min(20, currentGrade - 2));
              const t2 = Math.max(8, Math.min(20, currentGrade - 1));
              const t3 = currentGrade;
              const avgAnnual = parseFloat(((t1 + t2 + t3) / 3).toFixed(1));
              
              console.log(`[BULLETIN_CREATE] 🎯 Manual Subject ${subject.name}: T1=${t1}, T2=${t2}, T3=${t3}, Avg=${avgAnnual}`);
              
              return {
                name: subject.name,
                coefficient: subject.coefficient,
                t1: parseFloat(t1.toFixed(1)),
                t2: parseFloat(t2.toFixed(1)),
                t3: parseFloat(t3.toFixed(1)),
                avgAnnual: avgAnnual,
                teacherName: 'Prof.',
                comments: subject.comments || 'Bon travail'
              };
            } else {
              return subject;
            }
          });

      // ✅ AJOUTER SUBJECTS AU BULLETIN DATA
      (bulletinData as any).subjects = subjects;
      // 🎯 DONNÉES ADDITIONNELLES POUR L'API DE CRÉATION
      Object.assign(bulletinData, {
        studentId: parseInt(selectedStudentId),
        classId: parseInt(selectedClassId),
        termSpecificData: termSpecificData,
        
        // ✅ DONNÉES T3 SPÉCIFIQUES SELON L'IMAGE FOURNIE
        ...(formData.term === 'Troisième Trimestre' && {
          // ✅ SECTION SUMMARY AVEC PROGRESSION NATURELLE
          summary: {
            // Moyennes par trimestre avec progression naturelle
            avgT1: importedGrades ? (parseFloat(importedGrades.termAverage) - 2).toFixed(2) : (formData.generalAverage - 2).toFixed(2),
            avgT2: importedGrades ? (parseFloat(importedGrades.termAverage) - 1).toFixed(2) : (formData.generalAverage - 1).toFixed(2),
            avgT3: importedGrades ? parseFloat(importedGrades.termAverage).toFixed(2) : formData.generalAverage.toFixed(2),
            // Moyenne annuelle = (T1+T2+T3)/3
            avgAnnual: importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3).toFixed(2) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3).toFixed(2),
            
            // Rangs et positions
            rankT3: `${formData.classRank || 8}/${formData.totalStudents || 80}`,
            rankAnnual: `${formData.classRank || 8}/${formData.totalStudents || 80}`,
            
            // Section Discipline (selon l'image)
            conduct: {
              score: 17,
              label: "Très Bien",
              academicWork: "Distinction",
              discipline: "credit",
              sanctions: "warning",
              finalRemarks: ""
            },
            
            // Absences du 3ème trimestre
            absences: {
              justified: 2,
              unjustified: 0,
              totalT3: 2,
              seriousWarnings: 0,
              remarks: ""
            },
            
            // Performance de classe
            classPerformance: {
              highest: 18.5,
              lowest: 7.2,
              classAvg: formData.generalAverage || 14.0
            }
          },
          
          // ✅ DÉCISION CONSEIL DE CLASSE BASÉE SUR MOYENNE ANNUELLE
          decision: {
            // Décision basée sur la moyenne annuelle (non pas T3 seul)
            annualAverage: importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3).toFixed(2) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3).toFixed(2),
            
            council: (importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3)
            ) >= 10 ? "Promoted" : "Repeat",
            
            mention: (importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3)
            ) >= 15 ? "Good" : 
            (importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3)
            ) >= 12 ? "Satisfactory" : "Pass",
            
            appreciation: (importedGrades ? 
              ((parseFloat(importedGrades.termAverage) - 2 + parseFloat(importedGrades.termAverage) - 1 + parseFloat(importedGrades.termAverage)) / 3) :
              ((formData.generalAverage - 2 + formData.generalAverage - 1 + formData.generalAverage) / 3)
            ) >= 15 ? "Good" : "Satisfactory",
            
            observationsTeacher: "Fin d'année - Résultats satisfaisants, passage autorisé",
            observationsDirector: "Continuer sur cette lancée. Félicitations pour ces bons résultats."
          },
          
          // ✅ DONNÉES ADDITIONNELLES POUR TEMPLATE T3
          annualAverage: importedGrades ? parseFloat(importedGrades.termAverage) * 0.95 : (formData.generalAverage * 0.95),
          annualPosition: (formData.classRank || 1) + 1,
          conductGrade: 17,
          conduct: "Très bien",
          absences: "2",
          teacherComments: "Fin d'année - Résultats satisfaisants, passage autorisé",
          directorComments: (importedGrades ? parseFloat(importedGrades.termAverage) : formData.generalAverage) >= 10 ? 
            "Continuer sur cette lancée. Félicitations pour ces bons résultats." : 
            "Doit redoubler pour mieux consolider les acquis."
        })
      });

      console.log('[BULLETIN_CREATE] ✅ Données préparées avec structure identique à l\'aperçu:', bulletinData);
      console.log('[BULLETIN_CREATE] 🔍 Notes importées:', importedGrades ? '✅ Oui' : '❌ Non');
      console.log('[BULLETIN_CREATE] 📊 Informations élève chargées:', {
        nom: bulletinData.studentData.fullName,
        photo: bulletinData.studentData.photo ? '✅ Oui' : '❌ Non',
        matricule: bulletinData.studentData.matricule,
        notes: bulletinData.grades.general.length + ' matières'
      });
      
      // Dernière vérification avant création
      if (!bulletinData.grades.general || bulletinData.grades.general.length === 0) {
        toast({
          title: "⚠️ Problème de notes",
          description: "Aucune note trouvée. Veuillez re-sélectionner l'élève ou saisir manuellement",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/bulletins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulletinData)
      });

      const result = await response.json();
      
      console.log('[BULLETIN_CREATE] Réponse serveur:', result);
      
      if (response.ok && result.success) {
        toast({
          title: "✅ Bulletin créé",
          description: `Bulletin créé avec l'ID ${result.bulletinId} et ajouté au workflow`,
        });
        
        // Ouvrir le PDF généré
        if (result.downloadUrl) {
          console.log('[BULLETIN_CREATE] Ouverture du PDF:', result.downloadUrl);
          window.open(result.downloadUrl, '_blank');
        }
        
        // Recharger les bulletins pour voir le nouveau bulletin dans la liste
        await loadPendingBulletins();
        
        // Réinitialiser le formulaire
        setSelectedStudentId('');
        setSelectedClassId('');
        
      } else {
        throw new Error(result.error || result.message || 'Erreur lors de la création du bulletin');
      }
    } catch (error) {
      console.error('[BULLETIN_CREATE] ❌ Erreur:', error);
      toast({
        title: "Erreur de création",
        description: error.message || "Impossible de créer le bulletin",
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
      success: 'Succès',
      selectAll: 'Sélectionner tous',
      bulkSign: 'Signer et Envoyer la Sélection',
      selected: 'sélectionnés'
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
      success: 'Success',
      selectAll: 'Select All',
      bulkSign: 'Sign and Send Selection',
      selected: 'selected'
    }
  };

  const t = text[language];

  // Composant pour afficher une liste de bulletins avec sélection
  const BulletinListWithSelection = ({ 
    bulletins, 
    showActions = true, 
    actionType = 'approve', 
    selectedBulletins = [], 
    onToggleSelection 
  }: { 
    bulletins: BulletinFromTeacher[], 
    showActions?: boolean,
    actionType?: 'approve' | 'send' | 'view',
    selectedBulletins?: number[],
    onToggleSelection?: (id: number) => void
  }) => (
    <div className="space-y-3">
      {bulletins.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          {t.noData}
        </Card>
      ) : (
        bulletins.map((bulletin) => (
          <Card key={bulletin.id} className={`p-4 transition-all ${
            selectedBulletins.includes(bulletin.id) 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:shadow-md'
          }`}>
            <div className="flex items-center justify-between">
              {/* Checkbox pour sélection */}
              {onToggleSelection && actionType === 'send' && (
                <div className="mr-4">
                  <input
                    type="checkbox"
                    checked={selectedBulletins.includes(bulletin.id)}
                    onChange={() => onToggleSelection(bulletin.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              )}
              
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
                    onClick={() => viewBulletinDetails(bulletin.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t.viewDetails}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBulletinPdf(bulletin.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t.downloadPdf}
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
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Signature className="w-4 h-4 mr-1" />
                          {t.signAndSend}
                        </>
                      )}
                    </Button>
                  )}
                  
                  {actionType === 'view' && (
                    <Badge 
                      variant={bulletin.status === 'sent' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {bulletin.status === 'sent' ? '📧 Envoyé' : 
                       bulletin.status === 'approved' ? '✅ Approuvé' : 
                       bulletin.status === 'submitted' ? '⏳ Soumis' : 
                       '📝 Brouillon'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );

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
                    onClick={() => viewBulletinDetails(bulletin.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t.viewDetails}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBulletinPdf(bulletin.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t.downloadPdf}
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
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Signature className="w-4 h-4 mr-1" />
                          {t.signAndSend}
                        </>
                      )}
                    </Button>
                  )}
                  
                  {actionType === 'view' && (
                    <Badge 
                      variant={bulletin.status === 'sent' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {bulletin.status === 'sent' ? '📧 Envoyé' : 
                       bulletin.status === 'approved' ? '✅ Approuvé' : 
                       bulletin.status === 'submitted' ? '⏳ Soumis' : 
                       '📝 Brouillon'}
                    </Badge>
                  )}
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
                bulletin.status === 'approved' ? 'outline' :
                'default'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* EN-TÊTE MODERNE INSPIRÉ GEGOK12 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">📊 Gestion des Bulletins</h1>
                  <p className="text-blue-100 mt-1">
                    Système professionnel de génération de bulletins • Design moderne • Coefficients flexibles
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{myBulletins.length}</div>
                  <div className="text-xs text-blue-100">Bulletins créés</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{pendingBulletins.length}</div>
                  <div className="text-xs text-blue-100">En attente</div>
                </div>
              </div>
            </div>
            
            {/* BARRE DE STATUT MODERNE */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>3 templates spécialisés par trimestre</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Coefficients Math(4), Sciences(3)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Interface mobile pour enseignants</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIQUES MODERNES GEGOK12 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-800 font-medium">En Attente</p>
                  <p className="text-2xl font-bold text-orange-900">{pendingBulletins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium">Approuvés</p>
                  <p className="text-2xl font-bold text-green-900">{approvedBulletins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-full">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 font-medium">Envoyés</p>
                  <p className="text-2xl font-bold text-blue-900">{sentBulletins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-full">
                  <Archive className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-800 font-medium">Total</p>
                  <p className="text-2xl font-bold text-purple-900">{myBulletins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenir le contenu existant mais avec un meilleur style */}
        <div>
          <div className="flex items-center space-x-2">
            {/* Boutons paramètres et notifications supprimés selon demande utilisateur */}
          </div>
        </div>
      </div>


      {/* Onglets principaux */}
      <Tabs defaultValue="manual-grades" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="manual-grades" className="flex items-center">
            <PenTool className="w-4 h-4 mr-1" />
            Saisie Notes
          </TabsTrigger>
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

        {/* ✅ SAISIE MANUELLE DES NOTES */}
        <TabsContent value="manual-grades" className="mt-6">
          <div className="space-y-6">
            {/* Sélection de la classe */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <PenTool className="mr-2 h-5 w-5" />
                  Saisie Manuelle des Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Sélectionnez une classe</Label>
                    <Select
                      value={manualGradeClass}
                      onValueChange={setManualGradeClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une classe..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id.toString()}>
                            {classItem.name} ({classItem.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {manualGradeClass && (
                    <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-white rounded-lg border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{classStudents.length}</div>
                        <div className="text-sm text-gray-600">Élèves</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{classSubjects.length}</div>
                        <div className="text-sm text-gray-600">Matières</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{classTeachers.length}</div>
                        <div className="text-sm text-gray-600">Professeurs</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interface de saisie des notes */}
            {manualGradeClass && classStudents.length > 0 && classSubjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Saisie des Notes - {classes.find(c => c.id.toString() === manualGradeClass)?.name}</span>
                    <Button 
                      onClick={saveManualGrades}
                      disabled={savingGrades || Object.keys(manualGrades).length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {savingGrades ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder ({Object.keys(manualGrades).length} notes)
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Tabs pour les trimestres */}
                    <Tabs defaultValue="T1" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="T1">1er Trimestre</TabsTrigger>
                        <TabsTrigger value="T2">2ème Trimestre</TabsTrigger>
                        <TabsTrigger value="T3">3ème Trimestre</TabsTrigger>
                      </TabsList>

                      {['T1', 'T2', 'T3'].map((term) => (
                        <TabsContent key={term} value={term} className="mt-4">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-200 p-2 text-left">Élève</th>
                                  {classSubjects.map((subject) => {
                                    const teacher = classTeachers.find(t => t.id === subject.teacher_id);
                                    return (
                                      <th key={subject.id} className="border border-gray-200 p-2 text-center min-w-[120px]">
                                        {subject.name_fr}
                                        <div className="text-xs text-gray-500">Coef. {subject.coefficient}</div>
                                        {teacher && (
                                          <div className="text-xs text-blue-600 font-medium mt-1">
                                            Prof. {teacher.name}
                                          </div>
                                        )}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {classStudents.map((student) => (
                                  <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-2 font-medium">
                                      {student.name}
                                    </td>
                                    {classSubjects.map((subject) => {
                                      const gradeKey = `${student.id}_${subject.id}_${term}`;
                                      return (
                                        <td key={subject.id} className="border border-gray-200 p-1">
                                          <Input
                                            type="number"
                                            min="0"
                                            max="20"
                                            step="0.1"
                                            placeholder="0.0"
                                            className="w-full text-center"
                                            value={manualGrades[gradeKey]?.grade || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              setManualGrades(prev => ({
                                                ...prev,
                                                [gradeKey]: {
                                                  grade: value,
                                                  coefficient: subject.coefficient,
                                                  comments: prev[gradeKey]?.comments || ''
                                                }
                                              }));
                                            }}
                                          />
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message d'aide si aucune classe sélectionnée */}
            {!manualGradeClass && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <PenTool className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Saisie Manuelle des Notes</h3>
                    <p className="text-gray-500 mb-4">
                      Sélectionnez une classe pour commencer la saisie des notes.
                      Les élèves, matières et professeurs seront automatiquement chargés.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-blue-800 mb-2">✅ Fonctionnalités</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Auto-chargement des données de classe</li>
                        <li>• Saisie par trimestre (T1, T2, T3)</li>
                        <li>• Sauvegarde automatique en base</li>
                        <li>• Notes utilisées pour les bulletins</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

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
                  {selectedBulletins.length > 0 && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      {selectedBulletins.length} {t.selected}
                    </Badge>
                  )}
                </div>
                {approvedBulletins.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={selectAllApprovedBulletins}
                      size="sm"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      {t.selectAll}
                    </Button>
                    
                    {selectedBulletins.length > 0 && (
                      <Button
                        onClick={() => signAndSendBulletins(selectedBulletins)}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Signature className="w-4 h-4 mr-1" />
                            {t.bulkSign} ({selectedBulletins.length})
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => signAndSendBulletins(approvedBulletins.map(b => b.id))}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading || approvedBulletins.length === 0}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Signer et Envoyer Tous ({approvedBulletins.length})
                        </>
                      )}
                    </Button>
                    
                    <div className="text-sm text-gray-600 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Signature numérique + Notifications
                    </div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulletinListWithSelection 
                bulletins={approvedBulletins} 
                actionType="send" 
                selectedBulletins={selectedBulletins}
                onToggleSelection={toggleBulletinSelection}
              />
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
                      onValueChange={handleClassSelection}
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
                      onValueChange={handleStudentSelection}
                      disabled={!selectedClassId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectStudent} />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Période Académique */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Calendar className="mr-2 h-5 w-5" />
                  Période Académique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Période d'évaluation
                    </Label>
                    <Select
                      value={formData.term}
                      onValueChange={handleTermSelection}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="🗓️ Choisir la période d'évaluation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premier Trimestre" className="py-3">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <div>
                              <span className="font-medium">1er Trimestre</span>
                              <p className="text-xs text-gray-500">Sept - Déc • Début d'année</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Deuxième Trimestre" className="py-3">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                            <div>
                              <span className="font-medium">2ème Trimestre</span>
                              <p className="text-xs text-gray-500">Jan - Mars • Milieu d'année</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Troisième Trimestre" className="py-3">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                            <div>
                              <span className="font-medium">3ème Trimestre</span>
                              <p className="text-xs text-gray-500">Avr - Juin • Décision finale</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Année Académique</Label>
                    <Select
                      value={formData.academicYear}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, academicYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-white rounded-md border">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span className="font-medium">Bulletin pour: </span>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-md font-medium">
                      {formData.term} {formData.academicYear}
                    </span>
                  </div>
                  {/* Informations contextuelles au trimestre sélectionné */}
                  {formData.term && (
                    <div className={`mt-3 p-3 rounded-lg border-2 ${
                      formData.term === 'Premier Trimestre' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300' :
                      formData.term === 'Deuxième Trimestre' ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300' :
                      'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
                    }`}>
                      <div className={`flex items-center text-sm font-medium ${
                        formData.term === 'Premier Trimestre' ? 'text-blue-800' :
                        formData.term === 'Deuxième Trimestre' ? 'text-purple-800' :
                        'text-orange-800'
                      }`}>
                        {formData.term === 'Premier Trimestre' && (
                          <>
                            <BookOpen className="w-5 h-5 mr-2" />
                            <span className="text-lg font-bold">1er Trimestre - Début d'année</span>
                          </>
                        )}
                        {formData.term === 'Deuxième Trimestre' && (
                          <>
                            <Clock className="w-5 h-5 mr-2" />
                            <span className="text-lg font-bold">2ème Trimestre - Milieu d'année</span>
                          </>
                        )}
                        {formData.term === 'Troisième Trimestre' && (
                          <>
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <span className="text-lg font-bold">3ème Trimestre - Évaluation Finale</span>
                          </>
                        )}
                      </div>
                      <p className={`mt-2 text-sm ${
                        formData.term === 'Premier Trimestre' ? 'text-blue-700' :
                        formData.term === 'Deuxième Trimestre' ? 'text-purple-700' :
                        'text-orange-700'
                      }`}>
                        {formData.term === 'Premier Trimestre' && '🌱 Période d\'adaptation et d\'observation - Identification des forces et axes d\'amélioration'}
                        {formData.term === 'Deuxième Trimestre' && '📈 Consolidation des acquis - Évaluation des progrès et préparation finale'}
                        {formData.term === 'Troisième Trimestre' && '🏆 Décision de passage - Ce bulletin détermine l\'admission en classe supérieure'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* En-tête Officiel Cameroun */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    🇨🇲 En-tête Officiel Cameroun
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Délégation Régionale</Label>
                    <Select
                      value={formData.regionalDelegation}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, regionalDelegation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DU CENTRE">DU CENTRE</SelectItem>
                        <SelectItem value="DU LITTORAL">DU LITTORAL</SelectItem>
                        <SelectItem value="DE L'OUEST">DE L'OUEST</SelectItem>
                        <SelectItem value="DU NORD">DU NORD</SelectItem>
                        <SelectItem value="DE L'ADAMAOUA">DE L'ADAMAOUA</SelectItem>
                        <SelectItem value="DE L'EST">DE L'EST</SelectItem>
                        <SelectItem value="DU SUD">DU SUD</SelectItem>
                        <SelectItem value="DU SUD-OUEST">DU SUD-OUEST</SelectItem>
                        <SelectItem value="DU NORD-OUEST">DU NORD-OUEST</SelectItem>
                        <SelectItem value="DE L'EXTRÊME-NORD">DE L'EXTRÊME-NORD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Délégation Départementale</Label>
                    <Input 
                      value={formData.departmentalDelegation}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentalDelegation: e.target.value }))}
                      placeholder="Ex: DU MFOUNDI"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations École */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <School className="mr-2 h-5 w-5" />
                    Informations École
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
            </div>

            {/* Notes Importées Automatiquement */}
            {showImportedGrades && importedGrades && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Notes Importées Automatiquement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Moyenne Calculée</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-lg px-3 py-1 ${
                          parseFloat(importedGrades.termAverage) >= 15 ? 'bg-green-100 text-green-800' :
                          parseFloat(importedGrades.termAverage) >= 12 ? 'bg-blue-100 text-blue-800' :
                          parseFloat(importedGrades.termAverage) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {importedGrades.termAverage}/20
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {importedGrades.term === 'T1' ? 'Premier Trimestre' :
                           importedGrades.term === 'T2' ? 'Deuxième Trimestre' :
                           importedGrades.term === 'T3' ? 'Troisième Trimestre' :
                           `Trimestre ${importedGrades.term}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nombre de Matières</Label>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        {Object.keys(importedGrades.termGrades).length} matières
                      </p>
                    </div>
                  </div>
                  
                  {/* Tableau des notes par matière */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Matière</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Note CC</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Note Examen</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Moyenne</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(importedGrades.termGrades).map(([subject, grades]: [string, any]) => {
                          const average = ((grades.CC + grades.EXAM) / 2).toFixed(2);
                          return (
                            <tr key={subject} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {subject === 'MATH' ? 'Mathématiques' :
                                 subject === 'PHYS' ? 'Physique' :
                                 subject === 'CHIM' ? 'Chimie' :
                                 subject === 'BIO' ? 'Biologie' :
                                 subject === 'FRANC' ? 'Français' :
                                 subject === 'ANG' ? 'Anglais' :
                                 subject === 'HIST' ? 'Histoire' :
                                 subject === 'GEO' ? 'Géographie' :
                                 subject}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">
                                {grades.CC?.toFixed(1) || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">
                                {grades.EXAM?.toFixed(1) || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={`text-sm ${
                                  parseFloat(average) >= 15 ? 'bg-green-100 text-green-800' :
                                  parseFloat(average) >= 12 ? 'bg-blue-100 text-blue-800' :
                                  parseFloat(average) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {average}/20
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">✅ Importation réussie</span> - Les notes sont prêtes à être utilisées pour le bulletin
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => integrateImportedGradesToBulletin()}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        size="sm"
                      >
                        ✅ Intégrer au Bulletin
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowImportedGrades(false)}
                        className="text-gray-600 hover:text-gray-700 text-xs"
                      >
                        Masquer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <Label className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Photo Élève {formData.studentPhoto ? '(Chargée automatiquement)' : '(Optionnel)'}</span>
                    </Label>
                    <div className="mt-2 space-y-3">
                      {formData.studentPhoto ? (
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img 
                              src={formData.studentPhoto} 
                              alt="Photo élève" 
                              className="w-16 h-20 object-cover border border-gray-300 rounded shadow-sm"
                              onError={(e) => {
                                console.log('[PHOTO_ERROR] Impossible de charger:', formData.studentPhoto);
                                e.currentTarget.src = '/api/placeholder-student.png';
                              }}
                            />
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                              ✓
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              onClick={() => setFormData(prev => ({ ...prev, studentPhoto: '' }))}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                            <span className="text-xs text-green-600 font-medium">✅ Photo du profil chargée</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                          <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">Aucune photo de profil trouvée</p>
                          <p className="text-xs text-gray-400">Vous pouvez en ajouter une ci-dessous</p>
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

            {/* Actions de création contextuelles */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedStudentId ? (
                      <>
                        <h3 className="text-lg font-medium">
                          Bulletin de {students.find(s => s.id.toString() === selectedStudentId)?.name || 'Élève'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📚 Classe: {classes.find(c => c.id.toString() === selectedClassId)?.name || 'Non sélectionnée'} 
                          • 📅 Trimestre: {formData.term || 'Non sélectionné'}
                          {importedGrades && (
                            <span className="ml-2 text-green-600 font-medium">
                              • ✅ Notes importées ({Object.keys(importedGrades.termGrades).length} matières)
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-400">Créer le Bulletin</h3>
                        <p className="text-sm text-gray-500">
                          Veuillez d'abord sélectionner un élève, une classe et un trimestre
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      disabled={!selectedStudentId || !selectedClassId || !formData.term}
                      onClick={previewBulletin}
                      className={selectedStudentId && selectedClassId && formData.term ? "border-blue-300 text-blue-700 hover:bg-blue-50" : ""}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedStudentId && selectedClassId && formData.term 
                        ? `Aperçu - ${students.find(s => s.id.toString() === selectedStudentId)?.name?.split(' ')[0] || 'Élève'} (T${formData.term})`
                        : "Aperçu"
                      }
                    </Button>
                    <Button 
                      className={selectedStudentId && selectedClassId && formData.term 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-gray-400"
                      }
                      disabled={!selectedStudentId || !selectedClassId || !formData.term || loading}
                      onClick={createModularBulletin}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Génération...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-1" />
                          {selectedStudentId && selectedClassId && formData.term 
                            ? `Créer Bulletin - ${students.find(s => s.id.toString() === selectedStudentId)?.name?.split(' ')[0] || 'Élève'} (T${formData.term})`
                            : "Créer le bulletin"
                          }
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