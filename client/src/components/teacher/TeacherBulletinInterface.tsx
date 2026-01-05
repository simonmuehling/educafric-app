import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, FileText, Save, Send, PenTool, Users, School, GraduationCap, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatName } from '@/utils/formatName';
import { 
  getBulletinConfig, 
  detectBulletinType, 
  getFormatDescription,
  type BulletinType,
  type SchoolType,
  type SchoolLanguage,
  type BulletinConfig
} from '@/lib/bulletinConfig';
// Preview functionality removed - only Academic Management bulletins should be previewed

// Ministry-required Teacher Comments - LISTE DES COMMENTAIRES POUR L'ENSEIGNANT
const TEACHER_COMMENTS = {
  fr: [
    { id: 'excellent_work', text: 'Excellent travail. Félicitations.' },
    { id: 'very_good', text: 'Très bon travail. Continuez ainsi.' },
    { id: 'satisfactory', text: 'Travail satisfaisant. Bien.' },
    { id: 'can_do_better', text: 'Peut mieux faire. Travaillez davantage.' },
    { id: 'effort_needed', text: 'Un effort supplémentaire est nécessaire.' },
    { id: 'good_progress', text: 'Bons progrès constatés.' },
    { id: 'irregular_work', text: 'Travail irrégulier. Soyez plus assidu(e).' },
    { id: 'weak_results', text: 'Résultats faibles. Redoublez d\'efforts.' },
    { id: 'good_behavior', text: 'Bon comportement en classe.' },
    { id: 'participation', text: 'Participation active appréciée.' },
    { id: 'homework_regular', text: 'Devoirs régulièrement faits.' },
    { id: 'homework_irregular', text: 'Devoirs irréguliers.' },
    { id: 'concentrate_more', text: 'Concentrez-vous davantage.' },
    { id: 'good_attitude', text: 'Bonne attitude de travail.' },
    { id: 'leadership', text: 'Esprit de leadership remarquable.' }
  ],
  en: [
    { id: 'excellent_work', text: 'Excellent work. Congratulations.' },
    { id: 'very_good', text: 'Very good work. Keep it up.' },
    { id: 'satisfactory', text: 'Satisfactory work. Good.' },
    { id: 'can_do_better', text: 'Can do better. Work harder.' },
    { id: 'effort_needed', text: 'Additional effort is needed.' },
    { id: 'good_progress', text: 'Good progress observed.' },
    { id: 'irregular_work', text: 'Irregular work. Be more diligent.' },
    { id: 'weak_results', text: 'Weak results. Double your efforts.' },
    { id: 'good_behavior', text: 'Good classroom behaviour.' },
    { id: 'participation', text: 'Active participation appreciated.' },
    { id: 'homework_regular', text: 'Homework regularly done.' },
    { id: 'homework_irregular', text: 'Irregular homework.' },
    { id: 'concentrate_more', text: 'Concentrate more.' },
    { id: 'good_attitude', text: 'Good work attitude.' },
    { id: 'leadership', text: 'Remarkable leadership spirit.' }
  ]
};

interface Subject {
  id: string;
  name: string;
  coefficient: number;
  grade: number;
  remark: string;
  competencies?: string;
  competencyLevel?: 'CTBA' | 'CBA' | 'CA' | 'CMA' | 'CNA' | 'CVWA' | 'CWA' | 'CAA';
  note1: number;
  moyenneFinale: number;
  competence1: string;
  competence2: string;
  competence3: string; // Ajout de la 3ème compétence comme dans le système académique
  totalPondere: number;
  cote: string;
}

interface StudentInfo {
  name: string;
  id: string;
  classLabel: string;
  classSize: number;
  birthDate: string;
  birthPlace: string;
  gender: string;
  headTeacher: string;
  guardian: string;
  isRepeater: boolean;
  numberOfSubjects: number;
  numberOfPassed: number;
  schoolName?: string;
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
}

interface DisciplineInfo {
  absJ: number;
  absNJ: number;
  late: number;
  sanctions: number;
}

interface SavedBulletin {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  term: string;
  status: 'draft' | 'signed' | 'sent';
  lastModified: string;
  createdDate: string;
}

const TeacherBulletinInterface: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Selection states
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  
  // Bulletin type and format configuration - auto-detected from school
  const [bulletinType, setBulletinType] = useState<BulletinType>('general-fr');
  const [bulletinConfig, setBulletinConfig] = useState<BulletinConfig>(getBulletinConfig('general-fr'));
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('selection');
  
  // Bulletin data states
  const [student, setStudent] = useState<StudentInfo>({
    name: '',
    id: '',
    classLabel: '',
    classSize: 0,
    birthDate: '',
    birthPlace: '',
    gender: '',
    headTeacher: '',
    guardian: '',
    isRepeater: false,
    numberOfSubjects: 0,
    numberOfPassed: 0
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [discipline, setDiscipline] = useState<DisciplineInfo>({
    absJ: 0,
    absNJ: 0,
    late: 0,
    sanctions: 0
  });

  // Selected teacher comments (max 3)
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [generalAppreciation, setGeneralAppreciation] = useState('');

  // Check if this is third trimester for annual summary
  const isThirdTrimester = selectedTerm === 'T3';

  // Annual summary state for third trimester
  const [annualSummary, setAnnualSummary] = useState({
    firstTrimesterAverage: 0,
    secondTrimesterAverage: 0,
    thirdTrimesterAverage: 0,
    annualAverage: 0,
    annualRank: 0,
    totalStudents: 45,
    passDecision: '', // 'PASSE', 'REDOUBLE', 'RENVOYÉ' or 'Promoted', 'Repeat', 'Dismissed'
    finalAppreciation: '',
    holidayRecommendations: ''
  });

  // Bilingual labels
  const labels = {
    fr: {
      title: 'Création de Bulletin - Enseignant',
      selectSchool: 'Sélectionner une école',
      selectClass: 'Sélectionner une classe', 
      selectStudent: 'Sélectionner un élève',
      selectTerm: 'Sélectionner le trimestre',
      bulletinCreation: 'Création du bulletin',
      savedBulletins: 'Bulletins sauvegardés',
      studentInfo: 'Informations de l\'élève',
      subjectGrades: 'Notes par matière',
      discipline: 'Discipline',
      teacherComments: 'Commentaires de l\'enseignant (max 3)',
      generalAppreciation: 'Appréciation générale',
      actions: 'Actions',
      save: 'Sauvegarder',
      signBulletin: 'Signer le bulletin',
      sendToSchool: 'Envoyer à l\'école',
      preview: 'Aperçu',
      status: 'Statut',
      lastModified: 'Dernière modification',
      draft: 'Brouillon',
      signed: 'Signé',
      sent: 'Envoyé',
      continue: 'Continuer',
      delete: 'Supprimer',
      annualSummary: 'Résumé Annuel - 3e Trimestre',
      firstTrimAvg: 'Moy. 1er Trim.',
      secondTrimAvg: 'Moy. 2e Trim.',
      thirdTrimAvg: 'Moy. 3e Trim.',
      annualAvg: 'Moy. Annuelle',
      annualRank: 'Rang Annuel',
      totalStudentsLabel: 'Total Élèves',
      passDecisionLabel: 'Décision Conseil',
      finalAppreciationLabel: 'Appréciation Finale',
      holidayRecommendationsLabel: 'Recommandations Vacances',
      promoted: 'PASSE',
      repeat: 'REDOUBLE',
      dismissed: 'RENVOYÉ'
    },
    en: {
      title: 'Report Card Creation - Teacher',
      selectSchool: 'Select a school',
      selectClass: 'Select a class',
      selectStudent: 'Select a student', 
      selectTerm: 'Select term',
      bulletinCreation: 'Report card creation',
      savedBulletins: 'Saved report cards',
      studentInfo: 'Student information',
      subjectGrades: 'Subject grades',
      discipline: 'Discipline',
      teacherComments: 'Teacher comments (max 3)',
      generalAppreciation: 'General appreciation',
      actions: 'Actions',
      save: 'Save',
      signBulletin: 'Sign report card',
      sendToSchool: 'Send to school',
      preview: 'Preview',
      status: 'Status',
      lastModified: 'Last modified',
      draft: 'Draft',
      signed: 'Signed',
      sent: 'Sent',
      continue: 'Continue',
      delete: 'Delete',
      annualSummary: 'Annual Summary - 3rd Term',
      firstTrimAvg: '1st Term Avg.',
      secondTrimAvg: '2nd Term Avg.',
      thirdTrimAvg: '3rd Term Avg.',
      annualAvg: 'Annual Avg.',
      annualRank: 'Annual Rank',
      totalStudentsLabel: 'Total Students',
      passDecisionLabel: 'Council Decision',
      finalAppreciationLabel: 'Final Appreciation',
      holidayRecommendationsLabel: 'Holiday Recommendations',
      promoted: 'Promoted',
      repeat: 'Repeat',
      dismissed: 'Dismissed'
    }
  };

  const t = labels[language as keyof typeof labels];

  // Fetch classes for teacher (includes school information)
  const { data: classesData } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/classes');
      return await response.json();
    },
    enabled: !!user
  });

  // Fetch students for selected class
  const { data: studentsData } = useQuery({
    queryKey: ['/api/teacher/students', selectedClass],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/teacher/students?classId=${selectedClass}`);
      return await response.json();
    },
    enabled: !!selectedClass
  });

  // Fetch saved bulletins
  const { data: savedBulletinsData } = useQuery({
    queryKey: ['/api/teacher/saved-bulletins'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/saved-bulletins');
      return await response.json();
    }
  });

  // Process schools and classes data similar to ConsolidatedBulletinManagement
  const schoolsWithClasses = React.useMemo(() => {
    if (!classesData) return [];
    if (classesData.schoolsWithClasses && Array.isArray(classesData.schoolsWithClasses)) {
      return classesData.schoolsWithClasses;
    }
    
    // Fallback for other formats
    let allClasses = [];
    if (Array.isArray(classesData)) {
      allClasses = classesData;
    } else if (classesData.classes && Array.isArray(classesData.classes)) {
      allClasses = classesData.classes;
    }
    
    if (allClasses.length > 0) {
      return [{
        schoolId: user?.schoolId || 1,
        schoolName: 'École Principale',
        classes: allClasses
      }];
    }
    return [];
  }, [classesData, user]);

  // Extract schools from schoolsWithClasses
  const schools = React.useMemo(() => {
    return schoolsWithClasses.map((school: any) => ({
      id: String(school.schoolId),
      name: school.schoolName
    }));
  }, [schoolsWithClasses]);

  // Extract classes for selected school
  const classes = React.useMemo(() => {
    if (!selectedSchool) return [];
    const school = schoolsWithClasses.find((s: any) => String(s.schoolId) === selectedSchool);
    return school?.classes || [];
  }, [schoolsWithClasses, selectedSchool]);

  const students = studentsData?.students || studentsData || [];
  const savedBulletins: SavedBulletin[] = savedBulletinsData?.bulletins || [];

  // Auto-detect bulletin type when school is selected
  useEffect(() => {
    if (selectedSchool) {
      const school = schoolsWithClasses.find((s: any) => String(s.schoolId) === selectedSchool);
      if (school) {
        // Detect school type (primaire, secondaire-general, secondaire-technique, professionnel)
        const educationalType = school.educationalType || school.schoolType || 'secondaire-general';
        let schoolType: SchoolType = 'secondaire-general';
        
        if (educationalType.includes('primaire') || educationalType.includes('primary')) {
          schoolType = 'primaire';
        } else if (educationalType.includes('technique') || educationalType.includes('technical')) {
          schoolType = 'secondaire-technique';
        } else if (educationalType.includes('profess')) {
          schoolType = 'professionnel';
        }
        
        // Detect language
        const schoolLanguage = school.language || (language === 'en' ? 'en' : 'fr');
        const detectedLanguage: SchoolLanguage = schoolLanguage.includes('en') ? 'en' : 'fr';
        
        // Get detected bulletin type
        const detectedType = detectBulletinType(schoolType, detectedLanguage);
        setBulletinType(detectedType);
        setBulletinConfig(getBulletinConfig(detectedType));
        
        console.log('[BULLETIN_CONFIG] Auto-detected:', { 
          schoolType, 
          language: detectedLanguage, 
          bulletinType: detectedType,
          format: getBulletinConfig(detectedType).format
        });
      }
    }
  }, [selectedSchool, schoolsWithClasses, language]);

  // Initialize subjects when student is selected
  useEffect(() => {
    if (selectedStudent) {
      const selectedStudentData = students.find((s: any) => s.id.toString() === selectedStudent);
      if (selectedStudentData) {
        setStudent({
          name: formatName(selectedStudentData.firstName, selectedStudentData.lastName, language),
          id: selectedStudentData.matricule || selectedStudentData.id,
          classLabel: selectedStudentData.className || selectedStudentData.classLabel || '',
          classSize: 30,
          birthDate: selectedStudentData.dateOfBirth || '',
          birthPlace: selectedStudentData.placeOfBirth || '',
          gender: selectedStudentData.gender || '',
          headTeacher: user?.firstName ? formatName(user.firstName, user.lastName, language) : '',
          guardian: selectedStudentData.parentName || '',
          isRepeater: false,
          numberOfSubjects: 0,
          numberOfPassed: 0
        });

        // Initialize default subjects
        if (subjects.length === 0) {
          setSubjects([
            { id: '1', name: 'Mathématiques', coefficient: 4, grade: 0, remark: '', note1: 0, moyenneFinale: 0, competence1: '', competence2: '', competence3: '', totalPondere: 0, cote: '' },
            { id: '2', name: 'Français', coefficient: 4, grade: 0, remark: '', note1: 0, moyenneFinale: 0, competence1: '', competence2: '', competence3: '', totalPondere: 0, cote: '' },
            { id: '3', name: 'Anglais', coefficient: 3, grade: 0, remark: '', note1: 0, moyenneFinale: 0, competence1: '', competence2: '', competence3: '', totalPondere: 0, cote: '' },
            { id: '4', name: 'Sciences', coefficient: 3, grade: 0, remark: '', note1: 0, moyenneFinale: 0, competence1: '', competence2: '', competence3: '', totalPondere: 0, cote: '' },
            { id: '5', name: 'Histoire-Géographie', coefficient: 2, grade: 0, remark: '', note1: 0, moyenneFinale: 0, competence1: '', competence2: '', competence3: '', totalPondere: 0, cote: '' }
          ]);
        }
      }
    }
  }, [selectedStudent, students]);

  // Save bulletin mutation
  const saveBulletinMutation = useMutation({
    mutationFn: async (bulletinData: any) => {
      const response = await apiRequest('POST', '/api/teacher/bulletins/save', bulletinData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Bulletin sauvegardé' : 'Report card saved',
        description: language === 'fr' ? 'Le bulletin a été sauvegardé avec succès' : 'Report card has been saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/saved-bulletins'] });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder le bulletin' : 'Unable to save report card',
        variant: 'destructive',
      });
    }
  });

  // Sign bulletin mutation
  const signBulletinMutation = useMutation({
    mutationFn: async (bulletinData: any) => {
      const response = await apiRequest('POST', '/api/teacher/bulletins/sign', bulletinData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Bulletin signé' : 'Report card signed',
        description: language === 'fr' ? 'Le bulletin a été signé avec succès' : 'Report card has been signed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/saved-bulletins'] });
    }
  });

  // Send to school mutation
  const sendToSchoolMutation = useMutation({
    mutationFn: async (bulletinData: any) => {
      const response = await apiRequest('POST', '/api/teacher/bulletins/send-to-school', bulletinData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Bulletin envoyé' : 'Report card sent',
        description: language === 'fr' ? 'Le bulletin a été envoyé à l\'école' : 'Report card has been sent to school',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/saved-bulletins'] });
    }
  });

  const handleSubjectChange = (index: number, field: keyof Subject, value: any) => {
    setSubjects(prev => prev.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    ));
  };

  const addSubject = () => {
    const newId = (subjects.length + 1).toString();
    setSubjects([...subjects, {
      id: newId,
      name: '',
      coefficient: 1,
      grade: 0,
      remark: '',
      note1: 0,
      moyenneFinale: 0,
      competence1: '',
      competence2: '',
      competence3: '',
      totalPondere: 0,
      cote: ''
    }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleCommentToggle = (commentId: string) => {
    setSelectedComments(prev => {
      if (prev.includes(commentId)) {
        return prev.filter(id => id !== commentId);
      } else if (prev.length < 3) {
        return [...prev, commentId];
      }
      return prev;
    });
  };

  const handleSave = () => {
    const bulletinData = {
      schoolId: selectedSchool,
      classId: selectedClass,
      studentId: selectedStudent,
      term: selectedTerm,
      academicYear,
      student,
      subjects,
      discipline,
      selectedComments,
      generalAppreciation,
      status: 'draft',
      // Include annual summary for third trimester
      isThirdTrimester,
      annualSummary: isThirdTrimester ? annualSummary : null
    };
    saveBulletinMutation.mutate(bulletinData);
  };

  const handleSignBulletin = () => {
    const bulletinData = {
      schoolId: selectedSchool,
      classId: selectedClass,
      studentId: selectedStudent,
      term: selectedTerm,
      academicYear,
      student,
      subjects,
      discipline,
      selectedComments,
      generalAppreciation,
      status: 'signed',
      // Include annual summary for third trimester
      isThirdTrimester,
      annualSummary: isThirdTrimester ? annualSummary : null
    };
    signBulletinMutation.mutate(bulletinData);
  };

  const handleSendToSchool = () => {
    const bulletinData = {
      schoolId: selectedSchool,
      classId: selectedClass,
      studentId: selectedStudent,
      term: selectedTerm,
      academicYear,
      student,
      subjects,
      discipline,
      selectedComments,
      generalAppreciation,
      status: 'sent',
      // Include annual summary for third trimester
      isThirdTrimester,
      annualSummary: isThirdTrimester ? annualSummary : null
    };
    sendToSchoolMutation.mutate(bulletinData);
  };

  const canProceedToCreation = selectedSchool && selectedClass && selectedStudent && selectedTerm;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="selection" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {language === 'fr' ? 'Sélection' : 'Selection'}
          </TabsTrigger>
          <TabsTrigger value="creation" className="flex items-center gap-2" disabled={!canProceedToCreation}>
            <FileText className="h-4 w-4" />
            {t.bulletinCreation}
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t.savedBulletins}
          </TabsTrigger>
        </TabsList>

        {/* Selection Tab */}
        <TabsContent value="selection" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {language === 'fr' ? 'Sélection École → Classe → Élève' : 'Selection School → Class → Student'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* School Selection */}
              <div className="space-y-2">
                <Label htmlFor="school">{t.selectSchool}</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectSchool} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school: any) => (
                      <SelectItem key={school.id} value={String(school.id)}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="class">{t.selectClass}</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectClass} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.name || cls.className || cls.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">{t.selectStudent}</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectStudent} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName} - {student.matricule || student.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Term Selection */}
              <div className="space-y-2">
                <Label htmlFor="term">{t.selectTerm}</Label>
                <Select value={selectedTerm} onValueChange={(value) => setSelectedTerm(value as 'T1' | 'T2' | 'T3')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">{language === 'fr' ? 'Premier Trimestre' : 'First Term'}</SelectItem>
                    <SelectItem value="T2">{language === 'fr' ? 'Deuxième Trimestre' : 'Second Term'}</SelectItem>
                    <SelectItem value="T3">{language === 'fr' ? 'Troisième Trimestre' : 'Third Term'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulletin Format Info */}
              {selectedSchool && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      {language === 'fr' ? 'Type de Bulletin Détecté' : 'Detected Bulletin Type'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {bulletinConfig.labelFr} / {bulletinConfig.labelEn}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {getFormatDescription(bulletinConfig.format, language === 'en' ? 'en' : 'fr')}
                  </p>
                </div>
              )}

              {canProceedToCreation && (
                <Button 
                  onClick={() => setActiveTab('creation')} 
                  className="w-full"
                  data-testid="button-proceed-creation"
                >
                  {language === 'fr' ? 'Procéder à la création' : 'Proceed to creation'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creation Tab */}
        <TabsContent value="creation" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Data Entry */}
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {t.studentInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom / Name</Label>
                      <Input 
                        value={student.name} 
                        onChange={(e) => setStudent({...student, name: e.target.value})}
                        data-testid="input-student-name"
                      />
                    </div>
                    <div>
                      <Label>Matricule / ID</Label>
                      <Input 
                        value={student.id} 
                        onChange={(e) => setStudent({...student, id: e.target.value})}
                        data-testid="input-student-id"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Grades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.subjectGrades}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subjects.map((subject, index) => (
                    <div key={subject.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder={language === 'fr' ? 'Nom de la matière' : 'Subject name'}
                          value={subject.name}
                          onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                          data-testid={`input-subject-name-${index}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSubject(index)}
                          data-testid={`button-remove-subject-${index}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label>Note/20</Label>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={subject.grade}
                            onChange={(e) => handleSubjectChange(index, 'grade', Number(e.target.value))}
                            data-testid={`input-subject-grade-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Coefficient</Label>
                          <Input
                            type="number"
                            min="1"
                            value={subject.coefficient}
                            onChange={(e) => handleSubjectChange(index, 'coefficient', Number(e.target.value))}
                            data-testid={`input-subject-coefficient-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Appréciation</Label>
                          <Select 
                            value={subject.competencyLevel || ''} 
                            onValueChange={(value) => handleSubjectChange(index, 'competencyLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CTBA">CTBA</SelectItem>
                              <SelectItem value="CBA">CBA</SelectItem>
                              <SelectItem value="CA">CA</SelectItem>
                              <SelectItem value="CMA">CMA</SelectItem>
                              <SelectItem value="CNA">CNA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={addSubject} 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-add-subject"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Ajouter une matière' : 'Add subject'}
                  </Button>
                </CardContent>
              </Card>

              {/* Teacher Comments */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.teacherComments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {TEACHER_COMMENTS[language as keyof typeof TEACHER_COMMENTS].map((comment) => (
                      <div key={comment.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedComments.includes(comment.id)}
                          onChange={() => handleCommentToggle(comment.id)}
                          disabled={!selectedComments.includes(comment.id) && selectedComments.length >= 3}
                          data-testid={`checkbox-comment-${comment.id}`}
                        />
                        <label className="text-sm">{comment.text}</label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    {selectedComments.length}/3 {language === 'fr' ? 'sélectionnés' : 'selected'}
                  </div>
                </CardContent>
              </Card>

              {/* Annual Summary - Third Trimester Only */}
              {isThirdTrimester && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800">{t.annualSummary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">{t.firstTrimAvg}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={annualSummary.firstTrimesterAverage}
                          onChange={(e) => setAnnualSummary(prev => ({...prev, firstTrimesterAverage: parseFloat(e.target.value) || 0}))}
                          data-testid="input-first-trim-avg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t.secondTrimAvg}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={annualSummary.secondTrimesterAverage}
                          onChange={(e) => setAnnualSummary(prev => ({...prev, secondTrimesterAverage: parseFloat(e.target.value) || 0}))}
                          data-testid="input-second-trim-avg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t.thirdTrimAvg}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={annualSummary.thirdTrimesterAverage}
                          onChange={(e) => setAnnualSummary(prev => ({...prev, thirdTrimesterAverage: parseFloat(e.target.value) || 0}))}
                          data-testid="input-third-trim-avg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold">{t.annualAvg}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.01"
                          value={annualSummary.annualAverage}
                          onChange={(e) => setAnnualSummary(prev => ({...prev, annualAverage: parseFloat(e.target.value) || 0}))}
                          className="font-bold"
                          data-testid="input-annual-avg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">{t.annualRank}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={annualSummary.annualRank}
                          onChange={(e) => setAnnualSummary(prev => ({...prev, annualRank: parseInt(e.target.value) || 0}))}
                          data-testid="input-annual-rank"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t.totalStudentsLabel}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={annualSummary.totalStudents}
                          onChange={(e) => setAnnualSummary(prev => ({...prev, totalStudents: parseInt(e.target.value) || 45}))}
                          data-testid="input-total-students"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t.passDecisionLabel}</Label>
                        <Select 
                          value={annualSummary.passDecision} 
                          onValueChange={(value) => setAnnualSummary(prev => ({...prev, passDecision: value}))}
                        >
                          <SelectTrigger data-testid="select-pass-decision">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PASSE">{t.promoted}</SelectItem>
                            <SelectItem value="REDOUBLE">{t.repeat}</SelectItem>
                            <SelectItem value="RENVOYÉ">{t.dismissed}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">{t.finalAppreciationLabel}</Label>
                      <Textarea
                        value={annualSummary.finalAppreciation}
                        onChange={(e) => setAnnualSummary(prev => ({...prev, finalAppreciation: e.target.value}))}
                        placeholder={language === 'fr' ? 'Appréciation finale du conseil de classe...' : 'Final class council appreciation...'}
                        className="h-16"
                        data-testid="textarea-final-appreciation"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t.holidayRecommendationsLabel}</Label>
                      <Textarea
                        value={annualSummary.holidayRecommendations}
                        onChange={(e) => setAnnualSummary(prev => ({...prev, holidayRecommendations: e.target.value}))}
                        placeholder={language === 'fr' ? 'Recommandations pour les vacances...' : 'Recommendations for holidays...'}
                        className="h-16"
                        data-testid="textarea-holiday-recommendations"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.actions}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSave} 
                    variant="outline"
                    className="w-full"
                    disabled={saveBulletinMutation.isPending}
                    data-testid="button-save-bulletin"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveBulletinMutation.isPending ? 
                      (language === 'fr' ? 'Sauvegarde...' : 'Saving...') : 
                      t.save
                    }
                  </Button>
                  <Button 
                    onClick={handleSignBulletin}
                    disabled={signBulletinMutation.isPending}
                    data-testid="button-sign-bulletin"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    {signBulletinMutation.isPending ? 
                      (language === 'fr' ? 'Signature...' : 'Signing...') : 
                      t.signBulletin
                    }
                  </Button>
                  <Button 
                    onClick={handleSendToSchool} 
                    variant="default"
                    disabled={sendToSchoolMutation.isPending}
                    data-testid="button-send-to-school"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendToSchoolMutation.isPending ? 
                      (language === 'fr' ? 'Envoi...' : 'Sending...') : 
                      t.sendToSchool
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview removed - Only Academic Management bulletins should have preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'fr' ? 'Bulletin supprimé' : 'Preview Removed'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' 
                      ? 'Aperçu disponible uniquement dans Gestion Académique → Créer Bulletins' 
                      : 'Preview only available in Academic Management → Create Bulletins'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Saved Bulletins Tab */}
        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.savedBulletins}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedBulletins.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {language === 'fr' ? 'Aucun bulletin sauvegardé' : 'No saved report cards'}
                </div>
              ) : (
                <div className="space-y-4">
                  {savedBulletins.map((bulletin) => (
                    <div key={bulletin.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{bulletin.studentName}</h3>
                        <p className="text-sm text-gray-600">
                          {bulletin.schoolName} - {bulletin.className} - {bulletin.term}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.lastModified}: {new Date(bulletin.lastModified).toLocaleDateString()}
                        </p>
                        <Badge variant={
                          bulletin.status === 'sent' ? 'default' : 
                          bulletin.status === 'signed' ? 'secondary' : 'outline'
                        }>
                          {bulletin.status === 'draft' ? t.draft :
                           bulletin.status === 'signed' ? t.signed : t.sent}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Load saved bulletin data
                            setActiveTab('creation');
                          }}
                          data-testid={`button-continue-${bulletin.id}`}
                        >
                          {t.continue}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherBulletinInterface;