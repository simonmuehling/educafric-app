import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Eye, Plus, Trash2, Download, Settings, School, User, BookOpen, Languages, Upload, Camera } from 'lucide-react';

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

interface ModularBulletinGeneratorAdvancedProps {
  onGenerate?: (data: any) => void;
}

const ModularBulletinGeneratorAdvanced: React.FC<ModularBulletinGeneratorAdvancedProps> = ({ onGenerate }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // États pour les données importées
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    // Informations officielles Cameroun
    regionalDelegation: 'DU CENTRE',
    departmentalDelegation: 'DU MFOUNDI',
    
    // Informations école (vont être importées automatiquement)
    schoolName: '',
    schoolAddress: '',
    schoolCity: '',
    schoolPhone: '',
    schoolEmail: '',
    directorName: '',
    academicYear: '2024-2025',
    
    // Informations élève (vont être importées automatiquement)
    studentFirstName: '',
    studentLastName: '',
    studentBirthDate: '',
    studentBirthPlace: '',
    studentGender: '',
    className: '',
    studentNumber: '',
    studentPhoto: '', // URL photo élève
    isRepeater: false,
    enrollment: 0,
    
    // Période et évaluations
    period: '1er Trimestre 2024-2025',
    termNumber: 'T3', // T1, T2, T3
    generalAverage: 15.43,
    classRank: 3,
    totalStudents: 42,
    conduct: 'Très bien',
    conductGrade: 18,
    absences: 2,
    teacherComments: 'Élève sérieuse et appliquée. Très bon travail.',
    directorComments: 'Excellent trimestre. Continuez ainsi !',
    verificationCode: '', // Sera généré automatiquement
    
    // Performance académique
    firstTermAverage: 12.58,
    secondTermAverage: 13.49,
    thirdTermAverage: 14.67,
    annualAverage: 13.58,
    annualPosition: 8,
    totalEnrolment: 80,
    appreciation: 'Good',
    
    // Discipline
    punishment: 'Dismissed',
    sanctions: 'warning',
    finalRemark: '',
    classPerformance: 'Class Avg: 10.99',
    highestAvg: 14.67,
    lowestAvg: 2.14,
    councilDecision: 'Promoted',
    
    // Matières générales
    subjectsGeneral: [
      { 
        name: 'French language', 
        t1Grade: 10.00, 
        t2Grade: 11.00, 
        t3Grade: 8.00, 
        coefficient: 3, 
        total: 24.00,
        position: 61,
        averageMark: 9.9,
        remark: 'Competence Not Acquired(CNA)',
        teacherName: 'MIAFO GUEGUIM',
        comments: '' 
      },
      { 
        name: 'English language', 
        t1Grade: 10.00, 
        t2Grade: 12.00, 
        t3Grade: 14.00, 
        coefficient: 3, 
        total: 42.00,
        position: 6,
        averageMark: 10.19,
        remark: 'Competence Well Acquired(CWA)',
        teacherName: 'MBAH CLAER',
        comments: '' 
      },
      { 
        name: 'Mathematics', 
        t1Grade: 19.00, 
        t2Grade: 16.00, 
        t3Grade: 16.00, 
        coefficient: 2, 
        total: 32.00,
        position: 20,
        averageMark: 13.16,
        remark: 'Competence Well Acquired(CWA)',
        teacherName: 'DORIS MAMOR',
        comments: '' 
      }
    ],
    
    // Matières professionnelles
    subjectsProfessional: [
      { 
        name: 'TECHNICAL DRAWING', 
        t1Grade: 12.00, 
        t2Grade: 13.00, 
        t3Grade: 18.00, 
        coefficient: 2, 
        total: 36.00,
        position: 2,
        averageMark: 9.62,
        remark: 'Competence Very Well Acquired(CVWA)',
        teacherName: 'NICOLINE LEMNUI',
        comments: '' 
      },
      { 
        name: 'SEWING', 
        t1Grade: 16.50, 
        t2Grade: 15.00, 
        t3Grade: 14.00, 
        coefficient: 5, 
        total: 70.00,
        position: 13,
        averageMark: 12.7,
        remark: 'Competence Well Acquired(CWA)',
        teacherName: 'APANG ROSA',
        comments: '' 
      }
    ],
    
    // Autres matières
    subjectsOthers: []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<'fr' | 'en'>('fr');
  const [activeSection, setActiveSection] = useState<'general' | 'professional' | 'others'>('general');

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadInitialData();
  }, []);

  // Charger données existantes
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Charger classes, enseignants, informations école
      const [classesRes, teachersRes, settingsRes] = await Promise.all([
        fetch('/api/director/classes'),
        fetch('/api/director/teachers'),
        fetch('/api/director/settings')
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.teachers || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const school = settingsData.settings?.school;
        if (school) {
          setFormData(prev => ({
            ...prev,
            schoolName: school.name || '',
            schoolAddress: school.address || '',
            schoolCity: school.city || '',
            schoolPhone: school.phone || '',
            schoolEmail: school.email || '',
            directorName: school.directorName || ''
          }));
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger élèves d'une classe
  const loadStudentsByClass = async (classId: string) => {
    if (!classId) return;
    
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

  // Générer code de vérification unique
  const generateVerificationCode = () => {
    const prefix = 'EDU2024';
    const initials = formData.studentFirstName.charAt(0) + formData.studentLastName.charAt(0);
    const term = formData.termNumber || 'T1';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${initials}-${term}-${random}`;
  };

  // Pré-remplir matières avec enseignants
  const loadSubjectsForClass = (className: string) => {
    // Matières communes avec affectation automatique d'enseignants
    const commonSubjects = [
      { name: 'Français', type: 'general', coefficient: 4 },
      { name: 'Anglais', type: 'general', coefficient: 3 },
      { name: 'Mathématiques', type: 'general', coefficient: 4 },
      { name: 'Sciences Physiques', type: 'general', coefficient: 3 },
      { name: 'Sciences Naturelles', type: 'general', coefficient: 3 },
      { name: 'Histoire-Géographie', type: 'general', coefficient: 3 },
      { name: 'EPS', type: 'general', coefficient: 1 },
      { name: 'Arts', type: 'general', coefficient: 1 }
    ];

    // Affecter automatiquement des enseignants aux matières
    const subjectsWithTeachers = commonSubjects.map(subject => {
      const teacher = teachers.find(t => 
        t.subject?.toLowerCase().includes(subject.name.toLowerCase()) ||
        t.specialization?.toLowerCase().includes(subject.name.toLowerCase())
      );
      
      return {
        name: subject.name,
        t1Grade: 0,
        t2Grade: 0,
        t3Grade: 0,
        coefficient: subject.coefficient,
        total: 0,
        position: 1,
        averageMark: 0,
        remark: 'Competence Well Acquired(CWA)',
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Non assigné',
        comments: ''
      };
    });

    setFormData(prev => ({
      ...prev,
      subjectsGeneral: subjectsWithTeachers,
      subjectsProfessional: [],
      subjectsOthers: []
    }));
  };

  // Sélection classe
  const handleClassSelection = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId('');
    
    const selectedClass = classes.find(c => c.id.toString() === classId);
    if (selectedClass) {
      setFormData(prev => ({
        ...prev,
        className: selectedClass.name,
        enrollment: selectedClass.studentCount || 0
      }));
      
      // Charger élèves et matières automatiquement
      await loadStudentsByClass(classId);
      loadSubjectsForClass(selectedClass.name);
    }
  };

  // Sélection élève
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentId(studentId);
    
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
        verificationCode: generateVerificationCode()
      }));
    }
  };

  // Upload photo élève
  const uploadStudentPhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      // 1. Obtenir l'URL de téléchargement
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de la préparation du téléchargement');
      }

      const { uploadURL } = await uploadResponse.json();

      // 2. Télécharger le fichier directement vers le stockage cloud
      const fileUploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!fileUploadResponse.ok) {
        throw new Error('Erreur lors du téléchargement de la photo');
      }

      // 3. Mettre à jour l'URL de la photo dans le formulaire
      const photoURL = uploadURL.split('?')[0]; // Enlever les paramètres de signature
      setFormData(prev => ({
        ...prev,
        studentPhoto: photoURL
      }));

      toast({
        title: "Succès",
        description: "Photo téléchargée avec succès",
      });

    } catch (error) {
      console.error('Erreur upload photo:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement de la photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Gestionnaire de sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur", 
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }

      uploadStudentPhoto(file);
    }
  };

  const text = {
    fr: {
      title: 'Générateur de Bulletins Modulables EDUCAFRIC - Format Cameroun',
      subtitle: 'Système complet avec en-tête officiel camerounais',
      classSelection: 'Étape 1: Sélection de Classe et Élève',
      selectClass: 'Choisir une classe',
      selectStudent: 'Choisir un élève',
      loadData: 'Charger les données',
      cameroonHeader: 'En-tête Officiel Cameroun',
      schoolInfo: 'Informations École',
      studentInfo: 'Informations Élève',
      academicInfo: 'Évaluations Académiques',
      subjects: 'Matières et Notes',
      generalSubjects: 'Matières Générales',
      professionalSubjects: 'Matières Professionnelles',
      otherSubjects: 'Autres Matières',
      actions: 'Actions',
      preview: 'Aperçu',
      generate: 'Générer Bulletin',
      download: 'Télécharger',
      addSubject: 'Ajouter Matière',
      deleteSubject: 'Supprimer',
      language: 'Langue du bulletin',
      generating: 'Génération...',
      success: 'Succès',
      error: 'Erreur',
      bulletinGenerated: 'Bulletin généré avec succès',
      generationError: 'Erreur lors de la génération du bulletin'
    },
    en: {
      title: 'EDUCAFRIC Modular Bulletin Generator - Cameroon Format',
      subtitle: 'Complete system with official Cameroon header',
      classSelection: 'Step 1: Class and Student Selection',
      selectClass: 'Select a class',
      selectStudent: 'Select a student',
      loadData: 'Load data',
      cameroonHeader: 'Official Cameroon Header',
      schoolInfo: 'School Information',
      studentInfo: 'Student Information',
      academicInfo: 'Academic Evaluations',
      subjects: 'Subjects and Grades',
      generalSubjects: 'General Subjects',
      professionalSubjects: 'Professional Subjects',
      otherSubjects: 'Other Subjects',
      actions: 'Actions',
      preview: 'Preview',
      generate: 'Generate Bulletin',
      download: 'Download',
      addSubject: 'Add Subject',
      deleteSubject: 'Delete',
      language: 'Bulletin Language',
      generating: 'Generating...',
      success: 'Success',
      error: 'Error',
      bulletinGenerated: 'Bulletin generated successfully',
      generationError: 'Error generating bulletin'
    }
  };

  const t = text[language as keyof typeof text];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (section: 'subjectsGeneral' | 'subjectsProfessional' | 'subjectsOthers', index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const addSubject = (section: 'subjectsGeneral' | 'subjectsProfessional' | 'subjectsOthers') => {
    const newSubject: Subject = {
      name: '',
      t1Grade: 0,
      t2Grade: 0,
      t3Grade: 0,
      coefficient: 1,
      total: 0,
      position: 1,
      averageMark: 0,
      remark: 'Competence Well Acquired(CWA)',
      teacherName: '',
      comments: ''
    };
    
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newSubject]
    }));
  };

  const deleteSubject = (section: 'subjectsGeneral' | 'subjectsProfessional' | 'subjectsOthers', index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const generateBulletin = async () => {
    setIsGenerating(true);
    
    try {
      // Générer automatiquement le code de vérification si pas déjà fait
      let verificationCode = formData.verificationCode;
      if (!verificationCode) {
        verificationCode = generateVerificationCode();
        setFormData(prev => ({ ...prev, verificationCode }));
      }

      const bulletinData = {
        schoolInfo: {
          schoolName: formData.schoolName,
          address: formData.schoolAddress,
          city: formData.schoolCity,
          phoneNumber: formData.schoolPhone,
          email: formData.schoolEmail,
          directorName: formData.directorName,
          academicYear: formData.academicYear,
          regionalDelegation: formData.regionalDelegation,
          departmentalDelegation: formData.departmentalDelegation
        },
        student: {
          firstName: formData.studentFirstName,
          lastName: formData.studentLastName,
          birthDate: formData.studentBirthDate,
          birthPlace: formData.studentBirthPlace,
          gender: formData.studentGender === 'M' ? 'Masculin' : 'Féminin',
          className: formData.className,
          studentNumber: formData.studentNumber,
          photo: formData.studentPhoto
        },
        period: formData.period,
        subjects: [
          ...formData.subjectsGeneral,
          ...formData.subjectsProfessional,
          ...formData.subjectsOthers
        ],
        generalAverage: formData.generalAverage,
        classRank: formData.classRank,
        totalStudents: formData.totalStudents,
        conduct: formData.conduct,
        conductGrade: formData.conductGrade,
        absences: formData.absences,
        teacherComments: formData.teacherComments,
        directorComments: formData.directorComments,
        verificationCode: verificationCode,
        language: previewLanguage
      };

      const response = await fetch('/api/templates/bulletin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulletinData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du template');
      }

      const htmlTemplate = await response.text();
      
      // Ouvrir dans un nouvel onglet pour affichage/impression
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlTemplate);
        newWindow.document.close();
      }
      
      toast({
        title: t.success,
        description: t.bulletinGenerated,
      });

      if (onGenerate) {
        onGenerate(bulletinData);
      }
      
    } catch (error) {
      console.error('Erreur génération bulletin modulable:', error);
      toast({
        title: t.error,
        description: t.generationError,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewTemplate = async () => {
    try {
      const url = `/api/templates/bulletin/preview?language=${previewLanguage}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur aperçu template:', error);
      toast({
        title: t.error,
        description: t.generationError,
        variant: "destructive",
      });
    }
  };

  const renderSubjectTable = (subjects: Subject[], section: 'subjectsGeneral' | 'subjectsProfessional' | 'subjectsOthers') => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-xs">Matière</th>
              <th className="border border-gray-300 p-2 text-xs">T1/20</th>
              <th className="border border-gray-300 p-2 text-xs">T2/20</th>
              <th className="border border-gray-300 p-2 text-xs">T3/20</th>
              <th className="border border-gray-300 p-2 text-xs">Coef</th>
              <th className="border border-gray-300 p-2 text-xs">Total</th>
              <th className="border border-gray-300 p-2 text-xs">Position</th>
              <th className="border border-gray-300 p-2 text-xs">Average Mark</th>
              <th className="border border-gray-300 p-2 text-xs">Remark</th>
              <th className="border border-gray-300 p-2 text-xs">Teacher's Name</th>
              <th className="border border-gray-300 p-2 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(section, index, 'name', e.target.value)}
                    className="text-xs h-8"
                    placeholder="Nom matière"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={subject.t1Grade}
                    onChange={(e) => handleSubjectChange(section, index, 't1Grade', parseFloat(e.target.value) || 0)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={subject.t2Grade}
                    onChange={(e) => handleSubjectChange(section, index, 't2Grade', parseFloat(e.target.value) || 0)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={subject.t3Grade}
                    onChange={(e) => handleSubjectChange(section, index, 't3Grade', parseFloat(e.target.value) || 0)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    value={subject.coefficient}
                    onChange={(e) => handleSubjectChange(section, index, 'coefficient', parseInt(e.target.value) || 1)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={subject.total}
                    onChange={(e) => handleSubjectChange(section, index, 'total', parseFloat(e.target.value) || 0)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    value={subject.position}
                    onChange={(e) => handleSubjectChange(section, index, 'position', parseInt(e.target.value) || 1)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={subject.averageMark}
                    onChange={(e) => handleSubjectChange(section, index, 'averageMark', parseFloat(e.target.value) || 0)}
                    className="text-xs h-8 w-16"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={subject.remark}
                    onChange={(e) => handleSubjectChange(section, index, 'remark', e.target.value)}
                    className="text-xs h-8 w-full border rounded"
                  >
                    <option value="Competence Very Well Acquired(CVWA)">CVWA</option>
                    <option value="Competence Well Acquired(CWA)">CWA</option>
                    <option value="Competence Averagely Acquired(CAA)">CAA</option>
                    <option value="Competence Not Acquired(CNA)">CNA</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={subject.teacherName}
                    onChange={(e) => handleSubjectChange(section, index, 'teacherName', e.target.value)}
                    className="text-xs h-8"
                    placeholder="Nom enseignant"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Button
                    onClick={() => deleteSubject(section, index)}
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={() => addSubject(section)} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        {t.addSubject}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-green-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Actions et langue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              {t.actions}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Label>{t.language}:</Label>
              <Select value={previewLanguage} onValueChange={(value: 'fr' | 'en') => setPreviewLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={previewTemplate} variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                {t.preview}
              </Button>
              <Button 
                onClick={generateBulletin} 
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>{t.generating}</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {t.generate}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sélection Classe et Élève - PRIORITÉ */}
      <Card className="mb-6 border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <School className="w-6 h-6" />
            {t.classSelection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Chargement des données...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{t.selectClass}</Label>
                <Select value={selectedClassId} onValueChange={handleClassSelection}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner une classe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classe) => (
                      <SelectItem key={classe.id} value={classe.id.toString()}>
                        {classe.name} ({classe.studentCount || 0} élèves)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">{t.selectStudent}</Label>
                <Select 
                  value={selectedStudentId} 
                  onValueChange={handleStudentSelection}
                  disabled={!selectedClassId || students.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un élève..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName} ({student.studentNumber || student.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En-tête Officiel Cameroun */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🇨🇲
              {t.cameroonHeader}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Délégation Régionale</Label>
              <Select value={formData.regionalDelegation} onValueChange={(value) => handleInputChange('regionalDelegation', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DU CENTRE">DU CENTRE</SelectItem>
                  <SelectItem value="DU LITTORAL">DU LITTORAL</SelectItem>
                  <SelectItem value="DE L'OUEST">DE L'OUEST</SelectItem>
                  <SelectItem value="DU NORD-OUEST">DU NORD-OUEST</SelectItem>
                  <SelectItem value="DU SUD-OUEST">DU SUD-OUEST</SelectItem>
                  <SelectItem value="DE L'ADAMAOUA">DE L'ADAMAOUA</SelectItem>
                  <SelectItem value="DE L'EST">DE L'EST</SelectItem>
                  <SelectItem value="DE L'EXTREME-NORD">DE L'EXTREME-NORD</SelectItem>
                  <SelectItem value="DU NORD">DU NORD</SelectItem>
                  <SelectItem value="DU SUD">DU SUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Délégation Départementale</Label>
              <Input 
                value={formData.departmentalDelegation}
                onChange={(e) => handleInputChange('departmentalDelegation', e.target.value)}
                placeholder="Ex: DU MFOUNDI"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations École */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              {t.schoolInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'École</Label>
              <Input 
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="Collège Excellence Africaine"
              />
            </div>
            <div>
              <Label>Adresse (B.P.)</Label>
              <Input 
                value={formData.schoolAddress}
                onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                placeholder="B.P. 1234 Yaoundé"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Ville</Label>
                <Input 
                  value={formData.schoolCity}
                  onChange={(e) => handleInputChange('schoolCity', e.target.value)}
                  placeholder="Yaoundé"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input 
                  value={formData.schoolPhone}
                  onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                  placeholder="+237 222 345 678"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={formData.schoolEmail}
                onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                placeholder="contact@ecole.com"
              />
            </div>
            <div>
              <Label>Nom du Directeur</Label>
              <Input 
                value={formData.directorName}
                onChange={(e) => handleInputChange('directorName', e.target.value)}
                placeholder="Dr. Ngozi Adichie Emmanuel"
              />
            </div>
            <div>
              <Label>Année Académique</Label>
              <Input 
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                placeholder="2024-2025"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations Élève */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.studentInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Prénom</Label>
                <Input 
                  value={formData.studentFirstName}
                  onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
                  placeholder="Amina"
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input 
                  value={formData.studentLastName}
                  onChange={(e) => handleInputChange('studentLastName', e.target.value)}
                  placeholder="Kouakou"
                />
              </div>
            </div>
            <div>
              <Label>Date de naissance</Label>
              <Input 
                value={formData.studentBirthDate}
                onChange={(e) => handleInputChange('studentBirthDate', e.target.value)}
                placeholder="15 Mars 2010"
              />
            </div>
            <div>
              <Label>Lieu de naissance</Label>
              <Input 
                value={formData.studentBirthPlace}
                onChange={(e) => handleInputChange('studentBirthPlace', e.target.value)}
                placeholder="Abidjan, Côte d'Ivoire"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Sexe</Label>
                <Select value={formData.studentGender} onValueChange={(value) => handleInputChange('studentGender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Classe</Label>
                <Input 
                  value={formData.className}
                  onChange={(e) => handleInputChange('className', e.target.value)}
                  placeholder="3ème A"
                />
              </div>
            </div>
            <div>
              <Label>Matricule</Label>
              <Input 
                value={formData.studentNumber}
                onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                placeholder="CEA-2024-0157"
              />
            </div>
            <div>
              <Label>Photo Élève (optionnel)</Label>
              <div className="mt-2 space-y-3">
                {/* Prévisualisation de la photo */}
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
                
                {/* URL manuelle ou upload */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-sm">URL de la photo</Label>
                    <Input 
                      value={formData.studentPhoto}
                      onChange={(e) => handleInputChange('studentPhoto', e.target.value)}
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
                      onChange={handleFileSelect}
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

        {/* Évaluations Académiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t.academicInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Période</Label>
              <Input 
                value={formData.period}
                onChange={(e) => handleInputChange('period', e.target.value)}
                placeholder="1er Trimestre 2024-2025"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Moyenne Générale</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.generalAverage}
                  onChange={(e) => handleInputChange('generalAverage', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Rang</Label>
                <Input 
                  type="number"
                  value={formData.classRank}
                  onChange={(e) => handleInputChange('classRank', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Total Élèves</Label>
                <Input 
                  type="number"
                  value={formData.totalStudents}
                  onChange={(e) => handleInputChange('totalStudents', parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Conduite</Label>
                <Input 
                  value={formData.conduct}
                  onChange={(e) => handleInputChange('conduct', e.target.value)}
                  placeholder="Très bien"
                />
              </div>
              <div>
                <Label>Note Conduite /20</Label>
                <Input 
                  type="number"
                  value={formData.conductGrade}
                  onChange={(e) => handleInputChange('conductGrade', parseInt(e.target.value) || 18)}
                />
              </div>
            </div>
            <div>
              <Label>Absences</Label>
              <Input 
                type="number"
                value={formData.absences}
                onChange={(e) => handleInputChange('absences', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Code de Vérification (généré automatiquement)</Label>
              <Input 
                value={formData.verificationCode || 'Sera généré lors de la création du bulletin'}
                disabled
                className="bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <Label>Observations Professeur</Label>
              <Textarea 
                value={formData.teacherComments}
                onChange={(e) => handleInputChange('teacherComments', e.target.value)}
                placeholder="Observations du conseil de classe..."
                rows={2}
              />
            </div>
            <div>
              <Label>Décision Direction</Label>
              <Textarea 
                value={formData.directorComments}
                onChange={(e) => handleInputChange('directorComments', e.target.value)}
                placeholder="Décision de la direction..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matières Modulables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t.subjects}
          </CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setActiveSection('general')}
              variant={activeSection === 'general' ? 'default' : 'outline'}
              size="sm"
            >
              {t.generalSubjects}
            </Button>
            <Button
              onClick={() => setActiveSection('professional')}
              variant={activeSection === 'professional' ? 'default' : 'outline'}
              size="sm"
            >
              {t.professionalSubjects}
            </Button>
            <Button
              onClick={() => setActiveSection('others')}
              variant={activeSection === 'others' ? 'default' : 'outline'}
              size="sm"
            >
              {t.otherSubjects}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeSection === 'general' && renderSubjectTable(formData.subjectsGeneral, 'subjectsGeneral')}
          {activeSection === 'professional' && renderSubjectTable(formData.subjectsProfessional, 'subjectsProfessional')}
          {activeSection === 'others' && renderSubjectTable(formData.subjectsOthers, 'subjectsOthers')}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModularBulletinGeneratorAdvanced;