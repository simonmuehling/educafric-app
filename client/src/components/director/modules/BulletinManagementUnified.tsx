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
  Calendar
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
  const [selectedBulletins, setSelectedBulletins] = useState<number[]>([]);

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

  // Charger les élèves d'une classe
  const loadStudentsByClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/director/students?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
    }
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

  // Gestion de la sélection d'élève
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentId(studentId);
    
    if (studentId) {
      const selectedStudent = students.find(s => s.id.toString() === studentId);
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          studentFirstName: selectedStudent.firstName || '',
          studentLastName: selectedStudent.lastName || '',
          studentBirthDate: selectedStudent.birthDate || '',
          studentBirthPlace: selectedStudent.birthPlace || '',
          studentGender: selectedStudent.gender || '',
          studentNumber: selectedStudent.studentNumber || selectedStudent.matricule || '',
          studentPhoto: selectedStudent.photoUrl || '',
        }));
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

  // Télécharger le PDF d'un bulletin - vraie logique
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

      // Construire la même logique que createModularBulletin mais pour l'aperçu
      const getTermSpecificData = () => {
        const baseData = {
          generalAverage: formData.generalAverage,
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
        grades: {
          general: formData.subjectsGeneral,
          professional: formData.subjectsProfessional,
          others: formData.subjectsOthers
        },
        evaluations: termSpecificData,
        termSpecificData: termSpecificData,
        language: formData.language
      };

      console.log('[PREVIEW_BULLETIN] 📋 Sending preview data:', previewData);

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

      // Utilisation de fetch avec POST
      const response = await fetch('/api/templates/bulletin/preview-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData)
      });

      if (response.ok) {
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

  // Créer un nouveau bulletin avec vraie logique workflow et différenciation par trimestre
  const createModularBulletin = async () => {
    try {
      setLoading(true);
      
      console.log('[BULLETIN_CREATE] Création du bulletin pour élève:', selectedStudentId, 'classe:', selectedClassId, 'trimestre:', formData.term);

      // 🎯 IMPORTATION AUTOMATIQUE DES NOTES selon la classe
      console.log('[BULLETIN_AUTO_IMPORT] Démarrage importation automatique...');
      
      try {
        // Mapper le trimestre vers le format API
        const termMapping = {
          'Premier Trimestre': 'T1',
          'Deuxième Trimestre': 'T2', 
          'Troisième Trimestre': 'T3'
        };
        
        const apiTerm = termMapping[formData.term as keyof typeof termMapping] || 'T1';
        
        // Appeler la nouvelle route d'importation automatique
        const importResponse = await fetch('/api/bulletins/create-with-import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedStudentId,
            classId: selectedClassId,
            term: apiTerm,
            academicYear: formData.academicYear,
            language: formData.language || 'fr'
          }),
        });

        if (importResponse.ok) {
          const importData = await importResponse.json();
          console.log('[BULLETIN_AUTO_IMPORT] ✅ Import réussi:', importData);
          
          // Pré-remplir le formulaire avec les données importées
          if (importData.success && importData.data) {
            const { calculatedData, importedGrades } = importData.data;
            
            // Mettre à jour la moyenne générale calculée automatiquement
            if (calculatedData.termAverages[apiTerm]) {
              setFormData(prev => ({
                ...prev,
                generalAverage: calculatedData.termAverages[apiTerm]
              }));
              
              console.log('[BULLETIN_AUTO_IMPORT] ✅ Moyenne automatique:', calculatedData.termAverages[apiTerm]);
            }
            
            // Afficher un message de succès avec les détails
            toast({
              title: "🎯 Importation automatique réussie",
              description: `Notes importées pour ${formData.term}. Moyenne calculée: ${calculatedData.termAverages[apiTerm] || 'N/A'}/20`,
            });
          }
        } else {
          console.log('[BULLETIN_AUTO_IMPORT] ⚠️ Pas de notes à importer pour cette classe/trimestre');
          toast({
            title: "ℹ️ Saisie manuelle requise",
            description: "Aucune note trouvée pour cette classe. Veuillez saisir manuellement.",
          });
        }
      } catch (importError) {
        console.error('[BULLETIN_AUTO_IMPORT] ❌ Erreur importation:', importError);
        toast({
          title: "⚠️ Importation partielle",
          description: "Notes non trouvées - Saisie manuelle nécessaire",
          variant: "destructive",
        });
      }

      // Logique spécifique par trimestre
      const getTermSpecificData = () => {
        const baseData = {
          generalAverage: formData.generalAverage,
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
              canPromote: false, // Pas de décision de passage au 1er trimestre
              generalAppreciation: baseData.generalAppreciation || 'Début d\'année scolaire - Adaptation en cours'
            };
          
          case 'Deuxième Trimestre':
            return {
              ...baseData,
              termType: 'second',
              evaluationPeriod: 'Évaluation du 2ème trimestre',
              nextTermAdvice: 'Préparation pour l\'évaluation finale',
              canPromote: false, // Pas de décision de passage au 2ème trimestre
              generalAppreciation: baseData.generalAppreciation || 'Milieu d\'année - Évaluation des progrès'
            };
          
          case 'Troisième Trimestre':
            // Logique de passage/redoublement pour le 3ème trimestre
            const averageThreshold = 10; // Seuil de passage (sur 20)
            const isPromoted = baseData.generalAverage >= averageThreshold;
            
            return {
              ...baseData,
              termType: 'third',
              evaluationPeriod: 'Évaluation finale de l\'année',
              nextTermAdvice: isPromoted ? 'Admis en classe supérieure' : 'Doit reprendre la classe',
              canPromote: true, // Le 3ème trimestre détermine le passage
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

      const bulletinData = {
        studentId: parseInt(selectedStudentId),
        classId: parseInt(selectedClassId),
        term: formData.term,
        academicYear: formData.academicYear,
        // Données spécifiques au trimestre
        termSpecificData: termSpecificData,
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
        grades: {
          general: formData.subjectsGeneral,
          professional: formData.subjectsProfessional,
          others: formData.subjectsOthers
        },
        evaluations: termSpecificData, // Utilise les données spécifiques au trimestre
        language: formData.language
      };

      console.log('[BULLETIN_CREATE] Données du bulletin:', bulletinData);

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
            {/* Boutons paramètres et notifications supprimés selon demande utilisateur */}
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
                            {student.firstName} {student.lastName}
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
                    <Label>Trimestre</Label>
                    <Select
                      value={formData.term}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Premier Trimestre">1er Trimestre</SelectItem>
                        <SelectItem value="Deuxième Trimestre">2ème Trimestre</SelectItem>
                        <SelectItem value="Troisième Trimestre">3ème Trimestre</SelectItem>
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
                  {/* Informations spécifiques au trimestre */}
                  {formData.term === 'Troisième Trimestre' && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center text-sm text-orange-800">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium">Trimestre Final:</span>
                        <span className="ml-2">Ce bulletin détermine le passage en classe supérieure</span>
                      </div>
                    </div>
                  )}
                  {formData.term === 'Premier Trimestre' && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">1er Trimestre:</span> Évaluation de début d'année - Adaptation en cours
                      </div>
                    </div>
                  )}
                  {formData.term === 'Deuxième Trimestre' && (
                    <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded-md">
                      <div className="text-sm text-purple-800">
                        <span className="font-medium">2ème Trimestre:</span> Évaluation de milieu d'année - Préparation finale
                      </div>
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
                    <Button 
                      variant="outline" 
                      disabled={!selectedStudentId}
                      onClick={previewBulletin}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t.preview}
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!selectedStudentId || loading}
                      onClick={createModularBulletin}
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