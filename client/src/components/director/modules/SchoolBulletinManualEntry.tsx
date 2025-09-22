import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  School, 
  User, 
  BookOpen, 
  GraduationCap, 
  Calculator, 
  Save,
  FileText,
  Star,
  Settings,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface SchoolBulletinManualEntryProps {
  selectedClass?: string;
  selectedStudent?: string;
  selectedTerm?: string;
  academicYear?: string;
}

// Grille des compétences évaluées selon le système éducatif africain
const COMPETENCY_GRID = [
  { min: 18, max: 20.0001, grade: "A+", label: "CTBA", remark: "Compétences très bien acquises", remarkEn: "Competences Very Well Acquired" },
  { min: 16, max: 18, grade: "A", label: "CTBA", remark: "Compétences très bien acquises", remarkEn: "Competences Very Well Acquired" },
  { min: 15, max: 16, grade: "B+", label: "CBA", remark: "Compétences bien acquises", remarkEn: "Competences Well Acquired" },
  { min: 14, max: 15, grade: "B", label: "CBA", remark: "Compétences bien acquises", remarkEn: "Competences Well Acquired" },
  { min: 12, max: 14, grade: "C+", label: "CA", remark: "Compétences acquises", remarkEn: "Competences Acquired" },
  { min: 10, max: 12, grade: "C", label: "CMA", remark: "Compétences moyennement acquises", remarkEn: "Competences Averagely Acquired" },
  { min: 0, max: 10, grade: "D", label: "CNA", remark: "Compétences non acquises", remarkEn: "Competences Not Acquired" },
];

// Matières avec coefficients par défaut (référentiel africain)
const DEFAULT_SUBJECTS = [
  { subject: "ANGLAIS", coefficient: 3 },
  { subject: "INFORMATIQUE", coefficient: 2 },
  { subject: "CULTURES NATIONALES", coefficient: 1 },
  { subject: "ÉDUCATION ARTISTIQUE ET CULTURELLE", coefficient: 1 },
  { subject: "FRANÇAIS", coefficient: 6 },
  { subject: "LANGUES NATIONALES", coefficient: 1 },
  { subject: "LETTRES CLASSIQUES (LATIN)", coefficient: 2 },
  { subject: "ÉDUCATION À LA CITOYENNETÉ ET À LA MORALE", coefficient: 2 },
  { subject: "GÉOGRAPHIE", coefficient: 2 },
  { subject: "HISTOIRE", coefficient: 2 },
  { subject: "MATHÉMATIQUES", coefficient: 4 },
  { subject: "SCIENCES", coefficient: 2 },
  { subject: "ÉCONOMIE SOCIALE ET FAMILIALE (ESF)", coefficient: 1 },
  { subject: "ÉDUCATION PHYSIQUE ET SPORTIVE (EPS)", coefficient: 2 },
  { subject: "TRAVAIL MANUEL (TM)", coefficient: 1 },
];

// Templates de compétences par trimestre (référentiel africain)
const COMPETENCY_TEMPLATES = {
  Premier: {
    ANGLAIS: "Se présenter, parler de la famille et de l'école\nAcheter/vendre, découvrir les métiers",
    INFORMATIQUE: "Identifier matériel/logiciel d'un micro-ordinateur\nConnaitre les règles en salle info",
    FRANÇAIS: "Orthographier et comprendre un dialogue\nÉcrire une lettre privée (structure et politesse)",
    MATHÉMATIQUES: "Résoudre des opérations de base (addition, soustraction)\nComprendre les notions de géométrie plane",
    SCIENCES: "Observer et décrire les phénomènes naturels\nIdentifier les organes du corps humain",
    GÉOGRAPHIE: "Se situer dans l'espace et le temps\nIdentifier les continents et océans",
    HISTOIRE: "Comprendre les périodes historiques de base\nIdentifier les personnages historiques importants",
  },
  Deuxième: {
    ANGLAIS: "Décrire son quotidien, loisirs et habitudes (Present Simple)\nDonner/recevoir des indications (directions, lieux)",
    INFORMATIQUE: "Gestion des fichiers et dossiers (créer, renommer, organiser)\nTraitement de texte : mise en forme de base",
    FRANÇAIS: "Compréhension et résumé d'un récit\nProduction d'un paragraphe argumentatif simple",
    MATHÉMATIQUES: "Résoudre des problèmes avec multiplication et division\nComprendre les fractions et pourcentages",
    SCIENCES: "Expérimenter et analyser des réactions simples\nComprendre les cycles de la vie",
    GÉOGRAPHIE: "Analyser les climats et reliefs\nComprendre l'organisation territoriale",
    HISTOIRE: "Analyser les causes et conséquences d'événements\nComprendre l'évolution des sociétés",
  },
  Troisième: {
    ANGLAIS: "Parler de projets et d'événements passés (Past Simple)\nExprimer des intentions et plans (Futur proche)",
    INFORMATIQUE: "Présentation : diaporama (insertion d'images/tableaux)\nSensibilisation sécurité numérique (mots de passe, phishing)",
    FRANÇAIS: "Analyse grammaticale (accords essentiels)\nÉcriture d'un récit cohérent (début, développement, fin)",
    MATHÉMATIQUES: "Résoudre des équations du premier degré\nMaîtriser les propriétés géométriques avancées",
    SCIENCES: "Comprendre les lois physiques fondamentales\nAnalyser les écosystèmes et biodiversité",
    GÉOGRAPHIE: "Synthèse des connaissances géographiques\nAnalyser les enjeux du développement durable",
    HISTOIRE: "Synthèse historique et perspectives d'avenir\nComprendre les enjeux contemporains",
  },
};

const SchoolBulletinManualEntry: React.FC<SchoolBulletinManualEntryProps> = ({
  selectedClass,
  selectedStudent,
  selectedTerm = 'T1',
  academicYear = '2024-2025'
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // État local pour la saisie des notes
  const [subjectGrades, setSubjectGrades] = useState<any[]>([]);
  const [disciplineData, setDisciplineData] = useState({
    absJust: 0,
    absNonJust: 0,
    retards: 0,
    avertissements: 0,
    blames: 0,
    exclusions: 0,
    consignes: 0
  });
  const [generalAppreciation, setGeneralAppreciation] = useState('');
  const [parentVisa, setParentVisa] = useState('');

  // Récupération des classes de l'école
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/director/classes'],
    enabled: !!user
  });

  // Récupération des élèves de la classe sélectionnée
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['/api/director/students', selectedClass],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/director/students?classId=${selectedClass}`);
      return await response.json();
    },
    enabled: !!selectedClass
  });

  // Récupération du profil de l'élève sélectionné
  const { data: studentProfile } = useQuery({
    queryKey: ['/api/director/student-profile', selectedStudent],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/director/students/${selectedStudent}`);
      return await response.json();
    },
    enabled: !!selectedStudent
  });

  // Fonctions utilitaires
  const getCompetencyFromGrade = (grade: number) => {
    const competency = COMPETENCY_GRID.find(c => grade >= c.min && grade < c.max);
    return competency || COMPETENCY_GRID[COMPETENCY_GRID.length - 1];
  };

  const calculateTermGrade = (grade1: number, grade2: number | null = null) => {
    if (grade2 !== null) {
      return Math.round(((grade1 + grade2) / 2) * 100) / 100;
    }
    return grade1;
  };

  // Initialisation des matières avec templates de compétences
  useEffect(() => {
    if (DEFAULT_SUBJECTS.length > 0 && subjectGrades.length === 0) {
      const termKey = selectedTerm === 'T1' ? 'Premier' : selectedTerm === 'T2' ? 'Deuxième' : 'Troisième';
      const initialGrades = DEFAULT_SUBJECTS.map(subject => ({
        subjectName: subject.subject,
        teacherName: '',
        competencies: COMPETENCY_TEMPLATES[termKey as keyof typeof COMPETENCY_TEMPLATES]?.[subject.subject] || '',
        grade1: 0,
        grade2: null,
        termAverage: 0,
        coefficient: subject.coefficient,
        total: 0,
        competencyLabel: 'CNA',
        comment: 'Compétences non acquises'
      }));
      setSubjectGrades(initialGrades);
    }
  }, [selectedTerm, subjectGrades.length]);

  // Mise à jour automatique des notes et compétences
  const updateSubjectGrade = (index: number, field: string, value: any) => {
    const newGrades = [...subjectGrades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    
    // Recalcul automatique si c'est une note
    if (field === 'grade1' || field === 'grade2') {
      const termAverage = calculateTermGrade(
        Number(newGrades[index].grade1) || 0,
        newGrades[index].grade2 ? Number(newGrades[index].grade2) : null
      );
      const competency = getCompetencyFromGrade(termAverage);
      
      newGrades[index].termAverage = termAverage;
      newGrades[index].total = termAverage * newGrades[index].coefficient;
      newGrades[index].competencyLabel = competency.label;
      newGrades[index].comment = language === 'fr' ? competency.remark : competency.remarkEn;
    }
    
    setSubjectGrades(newGrades);
  };

  // Préremplir les compétences selon le trimestre sélectionné
  const prefillCompetencies = () => {
    const termKey = selectedTerm === 'T1' ? 'Premier' : selectedTerm === 'T2' ? 'Deuxième' : 'Troisième';
    const newGrades = subjectGrades.map(subject => ({
      ...subject,
      competencies: COMPETENCY_TEMPLATES[termKey as keyof typeof COMPETENCY_TEMPLATES]?.[subject.subjectName] || subject.competencies
    }));
    setSubjectGrades(newGrades);
    
    toast({
      title: language === 'fr' ? 'Compétences mises à jour' : 'Competencies updated',
      description: language === 'fr' ? 
        `Compétences du ${termKey} trimestre appliquées` : 
        `${termKey} term competencies applied`
    });
  };

  // Sauvegarder le bulletin
  const saveBulletinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/comprehensive-bulletins/school-entry', {
        studentId: selectedStudent,
        classId: selectedClass,
        term: selectedTerm,
        academicYear,
        manualData: {
          subjectGrades,
          discipline: disciplineData,
          generalAppreciation,
          parentVisa
        },
        enteredBy: user?.id,
        entryMethod: 'school_manual'
      });
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? '✅ Bulletin sauvegardé' : '✅ Report card saved',
        description: language === 'fr' ? 
          'Les données ont été enregistrées avec succès' : 
          'Data has been successfully saved'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins'] });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? '❌ Erreur de sauvegarde' : '❌ Save error',
        description: language === 'fr' ? 
          'Impossible de sauvegarder le bulletin' : 
          'Unable to save the report card',
        variant: 'destructive'
      });
    }
  });

  const classes = Array.isArray(classesData) ? classesData : classesData?.classes || [];
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.students || [];

  return (
    <div className="space-y-6" data-testid="school-bulletin-manual-entry">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            {language === 'fr' ? 'Saisie Manuelle des Bulletins - École' : 'Manual Bulletin Entry - School'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Sélection Classe/Élève/Trimestre */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>{language === 'fr' ? 'Classe' : 'Class'}</Label>
              <Select value={selectedClass} onValueChange={() => {}}>
                <SelectTrigger data-testid="select-class">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner une classe' : 'Select a class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === 'fr' ? 'Élève' : 'Student'}</Label>
              <Select value={selectedStudent} onValueChange={() => {}}>
                <SelectTrigger data-testid="select-student">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner un élève' : 'Select a student'} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === 'fr' ? 'Trimestre' : 'Term'}</Label>
              <Select value={selectedTerm} onValueChange={() => {}}>
                <SelectTrigger data-testid="select-term">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1">{language === 'fr' ? 'Premier Trimestre' : 'First Term'}</SelectItem>
                  <SelectItem value="T2">{language === 'fr' ? 'Deuxième Trimestre' : 'Second Term'}</SelectItem>
                  <SelectItem value="T3">{language === 'fr' ? 'Troisième Trimestre' : 'Third Term'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedStudent && (
            <>
              {/* Informations élève */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {language === 'fr' ? 'Informations Élève' : 'Student Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>{language === 'fr' ? 'Nom complet' : 'Full name'}:</strong>
                      <p>{studentProfile?.firstName} {studentProfile?.lastName}</p>
                    </div>
                    <div>
                      <strong>{language === 'fr' ? 'Matricule' : 'Student ID'}:</strong>
                      <p>{studentProfile?.matricule || selectedStudent}</p>
                    </div>
                    <div>
                      <strong>{language === 'fr' ? 'Classe' : 'Class'}:</strong>
                      <p>{studentProfile?.className}</p>
                    </div>
                    <div>
                      <strong>{language === 'fr' ? 'Année scolaire' : 'Academic year'}:</strong>
                      <p>{academicYear}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Outils et paramètres */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {language === 'fr' ? 'Outils de Saisie' : 'Entry Tools'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={prefillCompetencies}
                      variant="outline"
                      data-testid="button-prefill-competencies"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Préremplir les compétences' : 'Prefill competencies'}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {language === 'fr' ? 'Référentiel africain' : 'African curriculum'}
                      </Badge>
                      <Badge variant="outline">
                        CTBA/CBA/CA/CMA/CNA
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tableau de saisie des notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {language === 'fr' ? 'Saisie des Notes et Compétences' : 'Grades and Competencies Entry'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">
                            {language === 'fr' ? 'MATIÈRE' : 'SUBJECT'}
                          </th>
                          <th className="border border-gray-300 p-2 text-left">
                            {language === 'fr' ? 'Enseignant' : 'Teacher'}
                          </th>
                          <th className="border border-gray-300 p-2 text-left">
                            {language === 'fr' ? 'Compétences évaluées' : 'Skills assessed'}
                          </th>
                          <th className="border border-gray-300 p-2 text-center">N/20</th>
                          <th className="border border-gray-300 p-2 text-center">M/20</th>
                          <th className="border border-gray-300 p-2 text-center">Coef</th>
                          <th className="border border-gray-300 p-2 text-center">Total</th>
                          <th className="border border-gray-300 p-2 text-center">
                            {language === 'fr' ? 'COTE' : 'GRADE'}
                          </th>
                          <th className="border border-gray-300 p-2 text-left">
                            {language === 'fr' ? 'Appréciations' : 'Comments'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectGrades.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 font-medium">
                              {subject.subjectName}
                            </td>
                            <td className="border border-gray-300 p-2">
                              <Input
                                value={subject.teacherName}
                                onChange={(e) => updateSubjectGrade(index, 'teacherName', e.target.value)}
                                placeholder={language === 'fr' ? 'Nom enseignant' : 'Teacher name'}
                                className="min-w-[120px]"
                                data-testid={`input-teacher-${index}`}
                              />
                            </td>
                            <td className="border border-gray-300 p-2">
                              <Textarea
                                value={subject.competencies}
                                onChange={(e) => updateSubjectGrade(index, 'competencies', e.target.value)}
                                className="min-w-[200px] min-h-[60px]"
                                data-testid={`textarea-competencies-${index}`}
                              />
                            </td>
                            <td className="border border-gray-300 p-2">
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={subject.grade1}
                                onChange={(e) => updateSubjectGrade(index, 'grade1', Number(e.target.value))}
                                className="w-16 text-center"
                                data-testid={`input-grade1-${index}`}
                              />
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="w-16 text-center font-medium">
                                {subject.termAverage.toFixed(2)}
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="w-12 text-center font-medium">
                                {subject.coefficient}
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="w-16 text-center font-medium">
                                {subject.total.toFixed(2)}
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <Badge 
                                variant={subject.competencyLabel === 'CTBA' ? 'default' : 
                                       subject.competencyLabel === 'CBA' ? 'secondary' : 
                                       subject.competencyLabel === 'CA' ? 'outline' : 'destructive'}
                                className="font-bold"
                              >
                                {subject.competencyLabel}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="text-xs text-gray-600">
                                {subject.comment}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Discipline et appréciations */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {language === 'fr' ? 'Discipline' : 'Discipline'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(disciplineData).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label className="text-xs">
                              {key === 'absJust' ? (language === 'fr' ? 'Abs. justifiées' : 'Justified abs.') :
                               key === 'absNonJust' ? (language === 'fr' ? 'Abs. non justifiées' : 'Unjustified abs.') :
                               key === 'retards' ? (language === 'fr' ? 'Retards' : 'Late arrivals') :
                               key === 'avertissements' ? (language === 'fr' ? 'Avertissements' : 'Warnings') :
                               key === 'blames' ? (language === 'fr' ? 'Blâmes' : 'Reprimands') :
                               key === 'exclusions' ? (language === 'fr' ? 'Exclusions' : 'Exclusions') :
                               key === 'consignes' ? (language === 'fr' ? 'Consignes' : 'Detentions') : key}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={value}
                              onChange={(e) => setDisciplineData(prev => ({ 
                                ...prev, 
                                [key]: Number(e.target.value) 
                              }))}
                              className="w-16 text-center"
                              data-testid={`input-discipline-${key}`}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {language === 'fr' ? 'Appréciations' : 'Comments'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-xs">
                            {language === 'fr' ? 'Appréciation générale' : 'General comment'}
                          </Label>
                          <Textarea
                            value={generalAppreciation}
                            onChange={(e) => setGeneralAppreciation(e.target.value)}
                            className="mt-1"
                            data-testid="textarea-general-appreciation"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {language === 'fr' ? 'Visa des parents' : 'Parent visa'}
                          </Label>
                          <Input
                            value={parentVisa}
                            onChange={(e) => setParentVisa(e.target.value)}
                            className="mt-1"
                            data-testid="input-parent-visa"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4 mt-6">
                    <Button 
                      onClick={() => saveBulletinMutation.mutate()}
                      disabled={saveBulletinMutation.isPending}
                      data-testid="button-save-bulletin"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveBulletinMutation.isPending ? 
                        (language === 'fr' ? 'Sauvegarde...' : 'Saving...') :
                        (language === 'fr' ? 'Sauvegarder' : 'Save')
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolBulletinManualEntry;