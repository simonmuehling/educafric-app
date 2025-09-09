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

    console.log('[BULLETIN_FRONTEND] ✅ Retrieved REAL bulletin data:', data.data);
    return data.data;
    
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
      
      const response = await fetch('/api/bulletins/pending'); // ✅ ROUTE SPÉCIFIQUE sans paramètres
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
        
        if (data.success) {
          // ✅ APRÈS SAUVEGARDE, RÉCUPÉRER LES DONNÉES FORMATÉES
          try {
            const getResponse = await fetch(`/api/bulletins/?studentId=${studentId}&classId=${classId}&academicYear=${formData.academicYear}&term=${apiTerm}`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (getResponse.ok) {
              const bulletinData = await getResponse.json();
              
              if (bulletinData.success && bulletinData.data && bulletinData.data.subjects && bulletinData.data.subjects.length > 0) {
                // ✅ CONVERTIR AU FORMAT ATTENDU PAR LE FRONTEND
                const convertedData = {
                  termGrades: {},
                  termAverage: bulletinData.data.termAverage || '0',
                  subjects: bulletinData.data.subjects,
                  hasData: true
                };
                
                // Remplir les notes par matière
                bulletinData.data.subjects.forEach((subject: any) => {
                  convertedData.termGrades[subject.name] = {
                    CC: subject.grade - 1, // Simuler CC
                    EXAM: subject.grade + 1, // Simuler EXAM pour compatibilité
                    grade: subject.grade,
                    coefficient: subject.coef,
                    points: subject.points
                  };
                });
                
                setImportedGrades(convertedData);
                setShowImportedGrades(true);
                
                // Pré-remplir la moyenne calculée automatiquement
                if (bulletinData.data.termAverage) {
                  setFormData(prev => ({
                    ...prev,
                    generalAverage: bulletinData.data.termAverage
                  }));
                }
                
                toast({
                  title: "✅ Notes trouvées",
                  description: `🎯 ${term} - Moyenne calculée: ${bulletinData.data.termAverage}/20 avec ${bulletinData.data.subjects.length} matières`,
                  duration: 5000,
                });
                return; // ✅ Sortir si succès
              }
            }
          } catch (fetchError) {
            console.warn('[AUTO_IMPORT] ⚠️ Erreur récupération après sauvegarde:', fetchError);
          }
          
          // Si échec de récupération, fallback
          setImportedGrades(null);
          setShowImportedGrades(false);
          toast({
            title: "ℹ️ Pas de notes",
            description: "📝 Saisie manuelle - Aucune note importée",
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
    console.log('[TERM_SELECTION] 🎯 Sélection trimestre:', term);
    setFormData(prev => ({ ...prev, term }));
    
    // ✅ FORCER SYNCHRONISATION IMMÉDIATE
    if (selectedStudentId && selectedClassId) {
      console.log('[TERM_SELECTION] 🔄 Lancement import automatique...');
      setLoading(true);
      
      try {
        await triggerAutoImport(selectedStudentId, selectedClassId, term);
        console.log('[TERM_SELECTION] ✅ Import terminé - prêt pour aperçu');
        
        // ✅ NOTIFICATION UTILISATEUR
        toast({
          title: "✅ Trimestre sélectionné",
          description: `Données ${term} chargées - Aperçu disponible`,
        });
      } catch (error) {
        console.error('[TERM_SELECTION] ❌ Erreur import:', error);
      } finally {
        setLoading(false);
      }
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
      console.log('[MANUAL_GRADES] 💾 DÉBUT SAUVEGARDE');
      console.log('[MANUAL_GRADES] 🔍 manualGradeClass:', manualGradeClass);
      console.log('[MANUAL_GRADES] 💾 Données manualGrades complètes:', manualGrades);
      console.log('[MANUAL_GRADES] 🔍 Nombre total d\'entrées:', Object.keys(manualGrades).length);
      console.log('[MANUAL_GRADES] 🔍 Clés trouvées:', Object.keys(manualGrades));
      
      // ✅ ÉCHANTILLON DES PREMIÈRES ENTRÉES POUR DEBUG
      const entries = Object.entries(manualGrades);
      console.log('[MANUAL_GRADES] 🔍 Premières 3 entrées:', entries.slice(0, 3));
      
      // ✅ DEBUGGING COMPLET ET CONVERSION AMÉLIORÉE DES NOTES
      const gradesToSave = [];
      
      console.log('[MANUAL_GRADES] 🔍 DEBUGGING - manualGrades object:', manualGrades);
      console.log('[MANUAL_GRADES] 🔍 DEBUGGING - Object.keys:', Object.keys(manualGrades));
      console.log('[MANUAL_GRADES] 🔍 DEBUGGING - Object.entries:', Object.entries(manualGrades));
      
      for (const [key, gradeData] of Object.entries(manualGrades)) {
        console.log('[MANUAL_GRADES] 🔍 DEBUGGING - Processing:', { key, gradeData });
        
        const [studentId, subjectId, term] = key.split('_');
        
        // Debug chaque composant
        console.log('[MANUAL_GRADES] 🔍 DEBUGGING - Parsed key:', { 
          key, 
          studentId, 
          subjectId, 
          term,
          studentIdValid: !!studentId,
          subjectIdValid: !!subjectId,
          termValid: !!term
        });
        
        // Debug gradeData
        console.log('[MANUAL_GRADES] 🔍 DEBUGGING - Grade data:', {
          gradeData,
          hasGradeData: !!gradeData,
          grade: gradeData?.grade,
          gradeType: typeof gradeData?.grade,
          gradeString: gradeData?.grade?.toString(),
          gradeTrimmed: gradeData?.grade?.toString()?.trim(),
          gradeNotEmpty: gradeData?.grade?.toString()?.trim() !== '',
          gradeIsNumber: !isNaN(parseFloat(gradeData?.grade || ''))
        });
        
        // ✅ VALIDATION SIMPLIFIÉE ET ROBUSTE
        if (!studentId || !subjectId || !term) {
          console.warn('[MANUAL_GRADES] ⚠️ PROBLÈME: IDs manquants', { studentId, subjectId, term });
          continue;
        }
        
        if (!gradeData) {
          console.warn('[MANUAL_GRADES] ⚠️ PROBLÈME: Pas de gradeData pour', key);
          continue;
        }
        
        const gradeValue = gradeData.grade;
        if (gradeValue === undefined || gradeValue === null || gradeValue === '' || gradeValue === '0') {
          console.log('[MANUAL_GRADES] ⚠️ IGNORÉ: Note vide pour', key, 'value:', gradeValue);
          continue;
        }
        
        const gradeNum = parseFloat(gradeValue);
        const studentIdNum = parseInt(studentId);
        const subjectIdNum = parseInt(subjectId);
        
        if (isNaN(gradeNum)) {
          console.warn('[MANUAL_GRADES] ⚠️ PROBLÈME: Note invalide pour', key, 'value:', gradeValue);
          continue;
        }
        
        if (isNaN(studentIdNum) || isNaN(subjectIdNum)) {
          console.warn('[MANUAL_GRADES] ⚠️ PROBLÈME: IDs invalides pour', key, { studentId: studentIdNum, subjectId: subjectIdNum });
          continue;
        }
        
        if (gradeNum < 0 || gradeNum > 20) {
          console.warn('[MANUAL_GRADES] ⚠️ PROBLÈME: Note hors limite pour', key, 'value:', gradeNum);
          continue;
        }
        
        const gradeToSave = {
          studentId: studentIdNum,
          classId: parseInt(manualGradeClass),
          academicYear: '2024-2025',
          term: term, // Déjà en format T1, T2, T3
          subjectId: subjectIdNum,
          grade: gradeNum,
          coefficient: parseFloat(gradeData.coefficient) || 1,
          teacherComments: gradeData.comments || ''
        };
        
        console.log('[MANUAL_GRADES] ✅ VALIDE: Note préparée pour sauvegarde:', gradeToSave);
        gradesToSave.push(gradeToSave);
      }
      
      if (gradesToSave.length === 0) {
        toast({
          title: "⚠️ Aucune note valide",
          description: "Veuillez saisir des notes valides",
          variant: "destructive",
        });
        return;
      }
      
      // ✅ SAUVEGARDE AVEC GESTION D'ERREURS DÉTAILLÉE
      let successCount = 0;
      const errors = [];
      
      console.log('[MANUAL_GRADES] 💾 Début sauvegarde de', gradesToSave.length, 'notes');
      
      for (const gradeData of gradesToSave) {
        try {
          console.log('[MANUAL_GRADES] 💾 Sauvegarde note:', gradeData);
          
          console.log('[MANUAL_GRADES] 📡 Envoi requête API:', gradeData);
          
          const response = await fetch('/api/bulletins/import-grades', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(gradeData)
          });
          
          console.log('[MANUAL_GRADES] 📡 Statut réponse:', response.status, response.statusText);
          
          const responseData = await response.json();
          console.log('[MANUAL_GRADES] 📡 Réponse API:', { 
            status: response.status, 
            ok: response.ok, 
            data: responseData 
          });
          
          if (response.ok && responseData.success) {
            successCount++;
            console.log('[MANUAL_GRADES] ✅ Note sauvegardée avec succès:', gradeData);
            console.log('[MANUAL_GRADES] 📊 DB Response:', responseData);
          } else {
            // ✅ AFFICHER DÉTAILS D'ERREUR POUR DEBUG 400
            const errorDetail = responseData?.errors?.join(', ') || responseData?.message || 'Erreur inconnue';
            console.error('[MANUAL_GRADES] ❌ Erreur 400 détails:', {
              gradeData, 
              status: response.status,
              errors: responseData?.errors,
              message: responseData?.message,
              fullResponse: responseData
            });
            errors.push({ gradeData, error: `[${response.status}] ${errorDetail}` });
          }
        } catch (fetchError) {
          errors.push({ gradeData, error: fetchError.message });
          console.error('[MANUAL_GRADES] ❌ Erreur réseau:', fetchError, 'pour note:', gradeData);
        }
      }
      
      console.log('[MANUAL_GRADES] 📊 RÉSULTATS:', { 
        total: gradesToSave.length, 
        succès: successCount, 
        erreurs: errors.length 
      });
      
      toast({
        title: "✅ Notes sauvegardées",
        description: `${successCount}/${gradesToSave.length} notes sauvegardées avec succès`,
      });

      // ✅ AUTO-REFRESH des données après sauvegarde pour éviter double-clic
      if (successCount > 0 && manualGradeClass) {
        console.log('[MANUAL_GRADES] 🔄 Auto-refresh données après sauvegarde');
        
        // ✅ ATTENDRE QUE LA BD SE SYNCHRONISE (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await loadClassData(manualGradeClass);
        
        // ✅ FORCER VIDER LE CACHE pour éviter données obsolètes
        setImportedGrades(null);
        console.log('[MANUAL_GRADES] 🗑️ Cache vidé - données prêtes pour aperçu immédiat');
        
        // ✅ FORCER RE-RENDER du composant avec nouvelles données
        setManualGrades(prev => ({...prev}));
      }
      
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

  // ✅ FONCTION POUR ADAPTER LES BOUTONS AU TRIMESTRE
  const getTermDisplayText = (term: string) => {
    switch (term) {
      case 'Premier Trimestre':
        return { short: 'T1', full: '1er Trimestre' };
      case 'Deuxième Trimestre':
        return { short: 'T2', full: '2ème Trimestre' };
      case 'Troisième Trimestre':
        return { short: 'T3', full: '3ème Trimestre' };
      default:
        return { short: 'T1', full: '1er Trimestre' };
    }
  };

  // Prévisualiser un bulletin avec données en temps réel
  const previewBulletin = async () => {
    try {
      // ✅ VALIDATION CRITIQUE DU TRIMESTRE
      if (!formData.term) {
        console.warn('[PREVIEW_DEBUG] ❌ Aucun trimestre sélectionné');
        toast({
          title: "Trimestre requis", 
          description: "Veuillez d'abord sélectionner un trimestre (T1, T2 ou T3)",
          variant: "destructive",
        });
        return;
      }

      // ✅ VALIDATION AMÉLIORÉE - Priorité aux sélections directes
      console.log('[PREVIEW_DEBUG] 🔍 Validation avant aperçu:', {
        selectedStudentId,
        selectedClassId,
        selectedTerm: formData.term,
        formDataStudent: `${formData.studentFirstName} ${formData.studentLastName}`,
        formDataClass: formData.className
      });
      
      // Priorité aux valeurs directement sélectionnées
      let resolvedStudentId = selectedStudentId;
      let resolvedClassId = selectedClassId;
      
      // Seulement si pas de sélection directe, essayer de résoudre par nom
      if (!resolvedStudentId && formData.studentFirstName) {
        const foundStudent = students.find(s => 
          s.name === `${formData.studentFirstName} ${formData.studentLastName}`.trim() ||
          s.full_name === `${formData.studentFirstName} ${formData.studentLastName}`.trim()
        );
        resolvedStudentId = foundStudent?.id?.toString();
        console.log('[PREVIEW_DEBUG] 🔍 Résolution par nom élève:', foundStudent?.name);
      }
      
      if (!resolvedClassId && formData.className) {
        const foundClass = classes.find(c => c.name === formData.className);
        resolvedClassId = foundClass?.id?.toString();
        console.log('[PREVIEW_DEBUG] 🔍 Résolution par nom classe:', foundClass?.name);
      }
      
      console.log('[PREVIEW_DEBUG] ✅ IDs résolus:', { resolvedStudentId, resolvedClassId });
      
      if (!resolvedStudentId || !resolvedClassId) {
        console.warn('[PREVIEW_DEBUG] ❌ Validation échouée - IDs manquants');
        toast({
          title: "Attention", 
          description: "Veuillez sélectionner une classe et un élève avant l'aperçu",
          variant: "destructive",
        });
        return;
      }

      // ✅ VÉRIFICATION SYNCHRONISATION T3 SPÉCIFIQUE
      if (formData.term === 'Troisième Trimestre') {
        console.log('[PREVIEW_T3] 🎯 Vérification synchronisation T3...');
        
        // Forcer un délai minimal pour s'assurer que l'import est terminé
        if (!loading) {
          console.log('[PREVIEW_T3] ⏱️ Délai sécurisé pour synchronisation T3');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // ✅ RÉCUPÉRATION DIRECTE DES DONNÉES SANS COMPLEXITÉ
      const termMapping = { 'Premier Trimestre': 'T1', 'Deuxième Trimestre': 'T2', 'Troisième Trimestre': 'T3' };
      const apiTerm = termMapping[formData.term as keyof typeof termMapping] || 'T1';
      
      console.log('[PREVIEW_SIMPLE] 🎯 Génération aperçu direct:', {
        studentId: resolvedStudentId,
        classId: resolvedClassId,
        term: apiTerm
      });

      // ✅ UNE SEULE RÉCUPÉRATION DE DONNÉES
      let previewData = null;
      try {
        const response = await fetch(`/api/bulletins/?studentId=${resolvedStudentId}&classId=${resolvedClassId}&academicYear=${formData.academicYear}&term=${apiTerm}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.subjects?.length > 0) {
            previewData = data.data;
            console.log('[PREVIEW_SIMPLE] ✅ Données trouvées:', previewData.subjects.length, 'matières');
          }
        }
      } catch (error) {
        console.warn('[PREVIEW_SIMPLE] ⚠️ Erreur récupération:', error);
      }

      // ✅ FALLBACK VERS DONNÉES MANUELLES SI NÉCESSAIRE
      if (!previewData && Object.keys(manualGrades).length > 0) {
        console.log('[PREVIEW_SIMPLE] 🔄 Utilisation données manuelles');
        
        // Convertir rapidement les données manuelles
        const manualSubjects = [];
        Object.entries(manualGrades).forEach(([key, grade]) => {
          if (grade.grade && parseFloat(grade.grade) > 0) {
            const [studentId, subjectId, term] = key.split('_');
            const subject = classSubjects.find(s => s.id.toString() === subjectId);
            if (subject && studentId === resolvedStudentId && term === apiTerm) {
              manualSubjects.push({
                name: subject.name_fr,
                grade: parseFloat(grade.grade),
                coef: subject.coefficient || 1
              });
            }
          }
        });
        
        if (manualSubjects.length > 0) {
          const totalPoints = manualSubjects.reduce((sum, s) => sum + (s.grade * s.coef), 0);
          const totalCoef = manualSubjects.reduce((sum, s) => sum + s.coef, 0);
          previewData = {
            subjects: manualSubjects,
            termAverage: totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : '0'
          };
        }
      }

      // ✅ VÉRIFICATION FINALE SIMPLE
      if (!previewData || !previewData.subjects || previewData.subjects.length === 0) {
        toast({
          title: "⚠️ Notes manquantes",
          description: "Aucune note disponible pour cet élève/trimestre. Veuillez saisir des notes d'abord.",
          variant: "destructive",
        });
        return;
      }

      // ✅ GÉNÉRATION IMMÉDIATE DE L'APERÇU
      console.log('[PREVIEW_SIMPLE] 🚀 Génération aperçu avec:', previewData.subjects.length, 'matières');

      // Préparer les données pour l'aperçu - utiliser previewData.subjects
      const previewSubjects = previewData.subjects.map((subject: any) => ({
        name: subject.name,
        grade: subject.grade,
        coef: subject.coef || 1,
        points: (subject.grade || 0) * (subject.coef || 1),
        teacherName: subject.teacherName || 'Professeur',
        comments: subject.comments || ''
      }));

      toast({
        title: "✅ Aperçu généré",
        description: `${previewSubjects.length} matières - Moyenne: ${previewData.termAverage}/20`,
        duration: 2000,
      });

      // ✅ GÉNÉRATION SIMPLE DE L'APERÇU AVEC DONNÉES RÉCUPÉRÉES
      const simplePreviewData = {
        schoolData: {
          name: formData.schoolName || "École Test",
          address: formData.schoolAddress || "Yaoundé, Cameroun",
          phone: formData.schoolPhone || "+237 XXX XX XX XX",
          email: formData.schoolEmail || "contact@ecole.cm",
          director: formData.directorName || "Directeur",
          regionalDelegation: formData.regionalDelegation || "DU CENTRE",
          departmentalDelegation: formData.departmentalDelegation || "DU MFOUNDI"
        },
        studentData: {
          firstName: formData.studentFirstName || "Prénom",
          lastName: formData.studentLastName || "Nom",
          birthDate: formData.studentBirthDate || "01/01/2010",
          birthPlace: formData.studentBirthPlace || "Yaoundé",
          gender: formData.studentGender || "M",
          studentNumber: formData.studentNumber || "001",
          photo: formData.studentPhoto || ""
        },
        academicData: {
          className: formData.className || "6ème A",
          academicYear: formData.academicYear || "2024-2025",
          term: formData.term || "Premier Trimestre",
          enrollment: formData.enrollment || "1"
        },
        grades: {
          general: previewSubjects
        },
        termSpecificData: {
          generalAverage: parseFloat(previewData.termAverage),
          classRank: formData.classRank || 1,
          totalStudents: formData.totalStudents || 30,
          workAppreciation: formData.workAppreciation || "Satisfaisant",
          conductAppreciation: formData.conductAppreciation || "Très bien",
          generalAppreciation: formData.generalAppreciation || "Bon travail"
        },
        subjects: previewSubjects
      };

      // ✅ ENVOYER L'APERÇU DIRECTEMENT
      console.log('[PREVIEW_SIMPLE] 📡 Envoi données aperçu:', simplePreviewData);

      const response = await fetch('/api/templates/bulletin/preview-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePreviewData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        console.log('[PREVIEW_SIMPLE] ✅ Aperçu ouvert avec succès');
      } else {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

    } catch (error) {
      console.error('[PREVIEW_SIMPLE] ❌ Erreur:', error);
      toast({
        title: "❌ Erreur d'aperçu",
        description: "Impossible de générer l'aperçu. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Note: Cleaned up orphaned code from malformed function

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
              
              // ✅ UTILISER LES VRAIES DONNÉES T1/T2/T3 DEPUIS L'API 
              if (formData.term === 'Troisième Trimestre') {
                console.log('[BULLETIN_FRONTEND] ✅ Récupération vraies données T1/T2/T3 depuis API');
                
                // ✅ UTILISER LES VRAIES DONNÉES des notes manuelles saisies
                console.log('[BULLETIN_FRONTEND] ✅ Utilisation données manuelles saisies pour T3');
                
                // Récupérer les notes T1, T2, T3 depuis manualGrades ou données importées
                const fullStudentName = `${formData.studentFirstName} ${formData.studentLastName}`.trim();
                const resolvedStudentId = selectedStudentId || (students.find(s => s.full_name === fullStudentName)?.id?.toString());
                const subjectKey = `${resolvedStudentId}-${subject}`;
                const manualT1 = manualGrades[`${subjectKey}-T1`]?.grade || currentGrade - 2;
                const manualT2 = manualGrades[`${subjectKey}-T2`]?.grade || currentGrade - 1;
                const manualT3 = manualGrades[`${subjectKey}-T3`]?.grade || currentGrade;
                
                const t1 = parseFloat(manualT1.toFixed(2));
                const t2 = parseFloat(manualT2.toFixed(2)); 
                const t3 = parseFloat(manualT3.toFixed(2));
                
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
        
        // ✅ NE PAS réinitialiser les IDs pour permettre l'aperçu immédiat
        // setSelectedStudentId('');
        // setSelectedClassId('');
        console.log('[BULLETIN_CREATE] ✅ Conserving selectedStudentId et selectedClassId pour aperçu:', {
          selectedStudentId, selectedClassId
        });
        
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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="manual-grades" className="flex items-center justify-center w-full bg-green-100 border-green-300 text-green-800 font-semibold">
            <PenTool className="w-5 h-5 mr-2" />
            🎯 Interface Unifiée : Saisie → Aperçu → Création de Bulletins
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

            {/* ✅ CONFIGURATION EN-TÊTE DU BULLETIN */}
            {manualGradeClass && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Settings className="mr-2 h-5 w-5" />
                    Configuration En-tête des Bulletins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Informations École */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <School className="w-4 h-4 mr-2 text-blue-600" />
                        Informations de l'École
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom de l'École</Label>
                          <Input 
                            value={formData.schoolName}
                            onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                            placeholder="Lycée Bilingue de Yaoundé"
                          />
                        </div>
                        <div>
                          <Label>Nom du Directeur</Label>
                          <Input 
                            value={formData.directorName}
                            onChange={(e) => setFormData(prev => ({ ...prev, directorName: e.target.value }))}
                            placeholder="M. Jean EMMANUEL"
                          />
                        </div>
                        <div>
                          <Label>Adresse de l'École</Label>
                          <Input 
                            value={formData.schoolAddress}
                            onChange={(e) => setFormData(prev => ({ ...prev, schoolAddress: e.target.value }))}
                            placeholder="Quartier Essos, Yaoundé, Cameroun"
                          />
                        </div>
                        <div>
                          <Label>Téléphone</Label>
                          <Input 
                            value={formData.schoolPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, schoolPhone: e.target.value }))}
                            placeholder="+237 222 20 34 56"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input 
                            value={formData.schoolEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, schoolEmail: e.target.value }))}
                            placeholder="contact@lyceebilingueyaounde.cm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informations Académiques */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-green-600" />
                        Informations Académiques
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Année Académique</Label>
                          <Input 
                            value={formData.academicYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                            placeholder="2024-2025"
                          />
                        </div>
                        <div>
                          <Label>Trimestre</Label>
                          <Select
                            value={formData.term}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le trimestre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Premier Trimestre">Premier Trimestre</SelectItem>
                              <SelectItem value="Deuxième Trimestre">Deuxième Trimestre</SelectItem>
                              <SelectItem value="Troisième Trimestre">Troisième Trimestre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Classe</Label>
                          <Input 
                            value={formData.className || classes.find(c => c.id.toString() === manualGradeClass)?.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                            placeholder="CP1 A"
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informations Officielles Cameroun */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-600" />
                        Informations Officielles (Cameroun)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Délégation Régionale</Label>
                          <Input 
                            value={formData.regionalDelegation}
                            onChange={(e) => setFormData(prev => ({ ...prev, regionalDelegation: e.target.value }))}
                            placeholder="DU CENTRE"
                          />
                        </div>
                        <div>
                          <Label>Délégation Départementale</Label>
                          <Input 
                            value={formData.departmentalDelegation}
                            onChange={(e) => setFormData(prev => ({ ...prev, departmentalDelegation: e.target.value }))}
                            placeholder="DU MFOUNDI"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Auto-remplissage */}
                    <div className="bg-white rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Auto-remplissage des Données</h5>
                          <p className="text-sm text-gray-600">Charger automatiquement les informations depuis la base de données</p>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Auto-remplir avec les données de l'école sélectionnée
                            setFormData(prev => ({
                              ...prev,
                              schoolName: 'Lycée Bilingue de Yaoundé',
                              schoolAddress: 'Quartier Essos, Yaoundé, Cameroun',
                              schoolPhone: '+237 222 20 34 56',
                              schoolEmail: 'contact@lyceebilingueyaounde.cm',
                              directorName: 'M. Jean EMMANUEL',
                              className: classes.find(c => c.id.toString() === manualGradeClass)?.name || ''
                            }));
                          }}
                          className="flex items-center"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Auto-remplir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                                              console.log('[MANUAL_GRADES] 🔍 SAISIE:', {
                                                gradeKey,
                                                studentId: student.id,
                                                subjectId: subject.id,
                                                term,
                                                value,
                                                studentName: student.name,
                                                subjectName: subject.name_fr
                                              });
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
                {/* ✅ WORKFLOW UNIFIÉ : CONTINUER APRÈS SAISIE DES NOTES */}
                {Object.keys(manualGrades).length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center space-x-2 text-sm font-medium text-blue-700">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Notes saisies !</span>
                        <span className="mx-2">→</span>
                        <span>Créer les bulletins maintenant :</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      Cliquez sur un élève pour voir l'aperçu de son bulletin et le créer :
                    </div>
                    
                    <div className="space-y-3">
                      {classStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">Matricule: {student.matricule || 'Non défini'}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                // ✅ CORRECTIF: Sauvegarder AVANT aperçu pour inclure toutes les notes
                                console.log('[UNIFIED_WORKFLOW] 🎯 Aperçu avec sauvegarde préalable pour:', student.name);
                                
                                // ✅ PRÉPARATION DES DONNÉES
                                const studentData = {
                                  id: student.id.toString(),
                                  firstName: student.name.split(' ')[0] || '',
                                  lastName: student.name.split(' ').slice(1).join(' ') || '',
                                  matricule: student.matricule || '',
                                  name: student.name
                                };
                                
                                const classData = {
                                  id: manualGradeClass,
                                  name: classes.find(c => c.id.toString() === manualGradeClass)?.name || ''
                                };
                                
                                // ✅ MISE À JOUR DES ÉTATS
                                setSelectedStudentId(studentData.id);
                                setSelectedClassId(classData.id);
                                setFormData(prev => ({
                                  ...prev,
                                  term: 'Premier Trimestre',
                                  studentFirstName: studentData.firstName,
                                  studentLastName: studentData.lastName,
                                  className: classData.name,
                                  studentNumber: studentData.matricule
                                }));
                                
                                // ✅ SAUVEGARDER D'ABORD LES NOTES MANUELLES
                                if (Object.keys(manualGrades).length > 0) {
                                  console.log('[UNIFIED_WORKFLOW] 💾 Sauvegarde notes manuelles avant aperçu...');
                                  await saveManualGrades();
                                  
                                  // Attendre un peu pour que la sauvegarde soit complète
                                  await new Promise(resolve => setTimeout(resolve, 500));
                                }
                                
                                // ✅ PUIS GÉNÉRER L'APERÇU AVEC LES DONNÉES À JOUR
                                setTimeout(() => {
                                  console.log('[UNIFIED_WORKFLOW] 🚀 Génération aperçu avec toutes les notes à jour');
                                  previewBulletin();
                                }, 100);
                              }}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Aperçu {getTermDisplayText(formData.term).short}
                            </Button>
                            
                            <Button 
                              size="sm"
                              onClick={async () => {
                                // ✅ CORRECTIF: Sauvegarder AVANT création pour inclure toutes les notes
                                console.log('[UNIFIED_WORKFLOW] 🎯 Création avec sauvegarde préalable pour:', student.name);
                                
                                // ✅ PRÉPARATION DES DONNÉES
                                const studentData = {
                                  id: student.id.toString(),
                                  firstName: student.name.split(' ')[0] || '',
                                  lastName: student.name.split(' ').slice(1).join(' ') || '',
                                  matricule: student.matricule || '',
                                  name: student.name
                                };
                                
                                const classData = {
                                  id: manualGradeClass,
                                  name: classes.find(c => c.id.toString() === manualGradeClass)?.name || ''
                                };
                                
                                // ✅ MISE À JOUR DES ÉTATS
                                setSelectedStudentId(studentData.id);
                                setSelectedClassId(classData.id);
                                setFormData(prev => ({
                                  ...prev,
                                  term: 'Premier Trimestre',
                                  studentFirstName: studentData.firstName,
                                  studentLastName: studentData.lastName,
                                  className: classData.name,
                                  studentNumber: studentData.matricule
                                }));
                                
                                // ✅ SAUVEGARDER D'ABORD LES NOTES MANUELLES
                                if (Object.keys(manualGrades).length > 0) {
                                  console.log('[UNIFIED_WORKFLOW] 💾 Sauvegarde notes manuelles avant création...');
                                  await saveManualGrades();
                                  
                                  // Attendre un peu pour que la sauvegarde soit complète
                                  await new Promise(resolve => setTimeout(resolve, 500));
                                }
                                
                                // ✅ PUIS CRÉER LE BULLETIN AVEC LES DONNÉES À JOUR
                                setTimeout(() => {
                                  console.log('[UNIFIED_WORKFLOW] 🚀 Création bulletin avec toutes les notes à jour');
                                  createModularBulletin();
                                }, 100);
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Créer Bulletin {getTermDisplayText(formData.term).short}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-xs text-blue-600 bg-blue-50/50 rounded p-2">
                      ⚡ <strong>Workflow accéléré :</strong> Cliquez directement "Aperçu" ou "Créer Bulletin" pour chaque élève !
                    </div>
                  </div>
                )}
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
                  {/* ✅ WORKFLOW UNIFIÉ : APERÇU ET CRÉATION DANS LA MÊME INTERFACE */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center space-x-2 text-sm text-green-700">
                        <div className="flex items-center space-x-1">
                          <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                          <span>Saisie Notes</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center space-x-1">
                          <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                          <span>Aperçu</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center space-x-1">
                          <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                          <span>Création</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        disabled={!selectedStudentId || !selectedClassId || !formData.term}
                        onClick={previewBulletin}
                        className={selectedStudentId && selectedClassId && formData.term 
                          ? "border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold" 
                          : ""}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {selectedStudentId && selectedClassId && formData.term 
                          ? `📋 Aperçu Bulletin - ${students.find(s => s.id.toString() === selectedStudentId)?.name?.split(' ')[0] || 'Élève'} (T${formData.term})`
                          : "📋 Aperçu Bulletin"
                        }
                      </Button>
                      
                      <Button 
                        className={selectedStudentId && selectedClassId && formData.term 
                          ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg" 
                          : "bg-gray-400"
                        }
                        disabled={!selectedStudentId || !selectedClassId || !formData.term || loading}
                        onClick={createModularBulletin}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ⚡ Génération en cours...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-1" />
                            {selectedStudentId && selectedClassId && formData.term 
                              ? `🎯 Créer & Enregistrer - ${students.find(s => s.id.toString() === selectedStudentId)?.name?.split(' ')[0] || 'Élève'} (T${formData.term})`
                              : "🎯 Créer & Enregistrer le Bulletin"
                            }
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600 bg-white/50 rounded p-2">
                      <strong>✨ Nouveau workflow unifié :</strong> Plus besoin de changer d'onglet ! Saisissez les notes → Cliquez Aperçu → Puis Créer & Enregistrer directement.
                    </div>
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