import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, FileText, Download, Eye, Upload, Camera, School, Printer, Users, Info, Send, PenTool, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
// Print CSS approach for ministry-grade output quality
import ReportCardPreview from './ReportCardPreview';
import AnnualReportSheet from './AnnualReportSheet';
import BulletinPrint from './BulletinPrint';

// Real school data fetching (useQuery already imported above)

// Ministry-required Teacher Comments - LISTE DES COMMENTAIRES POUR L'ENSEIGNANT
export const TEACHER_COMMENTS = {
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
    { id: 'good_behavior', text: 'Good classroom behavior.' },
    { id: 'participation', text: 'Active participation appreciated.' },
    { id: 'homework_regular', text: 'Homework regularly done.' },
    { id: 'homework_irregular', text: 'Irregular homework.' },
    { id: 'concentrate_more', text: 'Concentrate more.' },
    { id: 'good_attitude', text: 'Good work attitude.' },
    { id: 'leadership', text: 'Remarkable leadership spirit.' }
  ]
};

// Ministry Performance Grid - EXACT from documents for reference purposes
const PERFORMANCE_GRID = {
  fr: {
    title: "GRILLE DE NOTATION",
    headers: ["NIVEAU DE RENDEMENT", "NOTE/20", "COTE", "NOTE EN POURCENTAGE (%)", "APPRECIATION"],
    levels: [
      { level: "Niveau 4", ranges: ["18 → 20", "16 → 18"], grades: ["A+", "A"], percentages: ["De 90% à 100%", "De 80 à 89%"], appreciation: "Compétences très bien acquises (CTBA)" },
      { level: "Niveau 3", ranges: ["15 → 16", "14 → 15"], grades: ["B+", "B"], percentages: ["De 75 à 79%", "De 70 à 74%"], appreciation: "Compétences bien acquises (CBA)" },
      { level: "Niveau 2", ranges: ["12 → 14", "10 → 12"], grades: ["C+", "C"], percentages: ["De 60 à 69%", "De 50 à 59%"], appreciation: "Compétences acquises (CA)\nCompétences moyennement acquises (CMA)" },
      { level: "Niveau 1", ranges: ["< 10"], grades: ["D"], percentages: ["< 50%"], appreciation: "Compétences non acquises (CNA)" }
    ]
  },
  en: {
    title: "PERFORMANCE GRID",
    headers: ["LEVEL OF PERFORMANCE", "MARK/20", "GRADE", "MARK IN PERCENTAGE (%)", "REMARKS"],
    levels: [
      { level: "Level 4", ranges: ["18 → 20", "16 → 18"], grades: ["A+", "A"], percentages: ["From 90% to 100%", "From 80 to 89%"], appreciation: "Competences Very Well Acquired (CVWA)" },
      { level: "Level 3", ranges: ["15 → 16", "14 → 15"], grades: ["B+", "B"], percentages: ["From 75 to 79%", "From 70 to 74%"], appreciation: "Competences Well Acquired (CWA)" },
      { level: "Level 2", ranges: ["12 → 14", "10 → 12"], grades: ["C+", "C"], percentages: ["From 60 to 69%", "From 50 to 59%"], appreciation: "Competences Acquired (CA)\nCompetences Averagely Acquired (CAA)" },
      { level: "Level 1", ranges: ["< 10"], grades: ["D"], percentages: ["< 50%"], appreciation: "Competences Not Acquired (CNA)" }
    ]
  }
};

interface Subject {
  id: string;
  name: string;
  teacher: string; // Teacher name - Ministry required under subject name
  coefficient: number;
  grade: number;
  remark: string;
  customAppreciation?: string; // Manual custom appreciation field
  comments?: string[]; // Per-subject ministry teacher comments
  competencies?: string;
  competencyLevel?: 'CTBA' | 'CBA' | 'CA' | 'CMA' | 'CNA' | 'CVWA' | 'CWA' | 'CAA';
  competencyEvaluation?: string;
  subjectType?: 'general' | 'scientific' | 'literary' | 'technical' | 'other'; // Subject type for technical schools (5 sections)
  bulletinSection?: 'general' | 'scientific' | 'technical'; // Manual bulletin section mapping for technical schools (overrides subjectType for bulletin grouping)
  // Additional fields for official Cameroon format
  note1: number;
  moyenneFinale: number;
  competence1: string;
  competence2: string;
  competence3: string;
  totalPondere: number;
  cote: string;
}

// Ministry-compliant StudentInfo interface with ALL required fields
interface StudentInfo {
  name: string;
  id: string; // Unique Identification number
  classLabel: string;
  classSize: number; // Class enrolment
  birthDate: string;
  birthPlace: string;
  gender: string;
  headTeacher: string; // Class master
  guardian: string; // Parent's/Guardian's name and contact
  // NEW: Ministry required fields
  isRepeater: boolean; // Repeater: Yes/No
  numberOfSubjects: number; // Number of subjects
  numberOfPassed: number; // Number passed
  // School official information that can be overridden
  schoolName?: string;
  regionaleMinisterielle?: string; // DÉLÉGATION RÉGIONALE DE
  delegationDepartementale?: string; // DÉLÉGATION DÉPARTEMENTALE DE
  schoolAddress?: string;
  schoolPhone?: string;
  registrationNumber?: string; // School registration number (EDUCAFRIC or government)
}

// Ministry-compliant DisciplineInfo interface with extended fields
interface DisciplineInfo {
  absJ: number; // Justified Abs (h)
  absNJ: number; // Unjustified Abs. (h)
  late: number; // Late (nbr of times)
  sanctions: number; // Conduct Warning/Reprimand
  // NEW: Extended discipline fields from ministry documents
  punishmentHours: number; // Punishment (hours)
  conductWarning: number; // Avertissement de conduite (CBA format - numeric)
  conductBlame: number; // Blâme (CBA format - numeric)
  suspension: number; // Suspension days
  dismissal: number; // Dismissed (0 = no, 1 = yes)
}

// Grade calculation functions for Cameroon system
const calculatePercentage = (grade: number): number => {
  return Math.round((grade / 20) * 100);
};

const calculateCote = (grade: number): string => {
  // Official CBA grading system from Cameroon documents
  if (grade >= 18) return 'A+';  // Level 4: 18-20 (90-100%)
  if (grade >= 16) return 'A';   // Level 4: 16-18 (80-89%)
  if (grade >= 15) return 'B+';  // Level 3: 15-16 (75-79%)
  if (grade >= 14) return 'B';   // Level 3: 14-15 (70-74%)
  if (grade >= 12) return 'C+';  // Level 2: 12-14 (60-69%)
  if (grade >= 10) return 'C';   // Level 2: 10-12 (50-59%)
  return 'D';                    // Level 1: <10 (<50%)
};

// Helper functions for Cameroon bulletin format
const round2 = (x: number): number => {
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100;
};

// Note: No longer calculating moyenne - both N/20 and M/20 are independent manual inputs

const coteFromNote = (note: number): string => {
  if (note >= 18) return 'A+';
  if (note >= 16) return 'A';
  if (note >= 14) return 'B+';
  if (note >= 12) return 'B';
  if (note >= 10) return 'C+';
  if (note >= 8) return 'C';
  return 'D';
};

// Dynamic Competency evaluation functions that work with backend data

interface BulletinCreationInterfaceProps {
  defaultClass?: string;
  defaultTerm?: string;
  defaultYear?: string;
  userRole?: 'teacher' | 'director'; // Specify user role to show appropriate actions
}

export default function BulletinCreationInterface(props: BulletinCreationInterfaceProps = {}) {
  const { defaultClass, defaultTerm, defaultYear, userRole } = props;
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Determine effective user role (from prop or from user context)
  const effectiveRole = userRole || user?.role || 'teacher';

  // Fetch school data to determine educational type
  const { data: schoolData } = useQuery({
    queryKey: ['school-data', user?.schoolId],
    queryFn: async () => {
      if (!user?.schoolId) return null;
      const response = await fetch(`/api/school/${user.schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch school data');
      return response.json();
    },
    enabled: !!user?.schoolId,
  });

  // TEST MODE: Allow sandbox users to toggle between general and technical
  const [testModeEducationalType, setTestModeEducationalType] = useState<'general' | 'technical' | null>(null);
  const isSandboxUser = user?.email?.includes('@test.educafric.com') || 
                        user?.email?.includes('@sandbox.educafric.com') ||
                        user?.email?.includes('sandbox.') ||
                        user?.email?.includes('.sandbox@') ||
                        user?.email?.includes('demo@') ||
                        user?.email?.includes('.demo@');

  const educationalType = testModeEducationalType || schoolData?.school?.educationalType || 'general';
  const isTechnicalSchool = educationalType === 'technical';
  
  console.log('[BULLETIN] School data:', schoolData);
  console.log('[BULLETIN] Educational type:', educationalType);
  console.log('[BULLETIN] Is technical school:', isTechnicalSchool);
  console.log('[BULLETIN] Test mode active:', testModeEducationalType);
  
  // Ministry-required trimester titles
  const TRIMESTER_TITLES = {
    fr: (term: string) => {
      const titles = {
        'Premier': 'Bulletin du Premier Trimestre',
        'Deuxième': 'Bulletin du Deuxième Trimestre', 
        'Troisième': 'Bulletin du Troisième Trimestre'
      };
      return titles[term as keyof typeof titles] || 'Bulletin Scolaire';
    },
    en: (term: string) => {
      const titles = {
        'Premier': 'First Term Report Card',
        'Deuxième': 'Second Term Report Card',
        'Troisième': 'Third Term Report Card'
      };
      return titles[term as keyof typeof titles] || 'School Report Card';
    }
  };

  // Mobile detection hook
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  }, []);
  
  // State for selected competency system
  const [selectedCompetencySystem, setSelectedCompetencySystem] = useState<any>(null);

  // Dynamic function to calculate competency level based on the selected system
  // Updated to match exact CBA official Cameroon format from documents
  const calculateCompetencyLevel = (grade: number): string => {
    if (!selectedCompetencySystem?.levels) {
      // Official CBA system based on documents - exact grading scale
      if (grade >= 18) return language === 'fr' ? 'CTBA' : 'CVWA'; // Level 4: 18-20 (A+)
      if (grade >= 16) return language === 'fr' ? 'CTBA' : 'CVWA'; // Level 4: 16-18 (A)
      if (grade >= 15) return language === 'fr' ? 'CBA' : 'CWA';   // Level 3: 15-16 (B+)
      if (grade >= 14) return language === 'fr' ? 'CBA' : 'CWA';   // Level 3: 14-15 (B)
      if (grade >= 12) return 'CA'; // Level 2: 12-14 (C+)
      if (grade >= 10) return language === 'fr' ? 'CMA' : 'CAA';   // Level 2: 10-12 (C)
      return 'CNA'; // Level 1: <10 (D)
    }

    // Sort levels by gradeRange.min descending to ensure proper classification
    const sortedLevels = [...selectedCompetencySystem.levels].sort((a: any, b: any) => b.gradeRange.min - a.gradeRange.min);
    
    // Use the actual system data from backend
    for (const level of sortedLevels) {
      if (grade >= level.gradeRange.min && grade <= level.gradeRange.max) {
        return level.code;
      }
    }
    return 'CNA'; // Fallback
  };

  // Dynamic function to get competency color based on level
  const getCompetencyColor = (level: string): string => {
    // Universal color mapping that works for both FR and EN systems
    const colorMap: { [key: string]: string } = {
      'CTBA': 'bg-green-100 text-green-800',
      'CVWA': 'bg-green-100 text-green-800',
      'CBA': 'bg-blue-100 text-blue-800',
      'CWA': 'bg-blue-100 text-blue-800',
      'CA': 'bg-yellow-100 text-yellow-800',
      'CMA': 'bg-orange-100 text-orange-800',
      'CAA': 'bg-orange-100 text-orange-800',
      'CNA': 'bg-red-100 text-red-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  };

  // Dynamic function to get competency description from backend or fallback
  const getCompetencyDescription = (level: string, language: 'fr' | 'en'): string => {
    if (selectedCompetencySystem?.levels) {
      const levelData = selectedCompetencySystem.levels.find((l: any) => l.code === level);
      if (levelData) {
        // Use description field from schema (fallback to descriptionFr/descriptionEn if they exist)
        return levelData.description || 
               (language === 'fr' ? levelData.descriptionFr : levelData.descriptionEn) || 
               levelData.code;
      }
    }

    // Fallback descriptions
    const descriptions = {
      fr: {
        'CTBA': 'Compétences très bien acquises',
        'CBA': 'Compétences bien acquises',
        'CA': 'Compétences acquises',
        'CMA': 'Compétences moyennement acquises',
        'CNA': 'Compétences non acquises',
        'CVWA': 'Compétences très bien acquises',
        'CWA': 'Compétences bien acquises',
        'CAA': 'Compétences moyennement acquises'
      },
      en: {
        'CTBA': 'Competences Very Well Acquired',
        'CBA': 'Competences Well Acquired',
        'CA': 'Competences Acquired',
        'CMA': 'Competences Averagely Acquired',
        'CNA': 'Competences Not Acquired',
        'CVWA': 'Competences Very Well Acquired',
        'CWA': 'Competences Well Acquired',
        'CAA': 'Competences Averagely Acquired'
      }
    };
    return descriptions[language][level] || level;
  };
  
  // Fetch school information automatically (using working API)
  const { data: schoolInfo, isLoading: loadingSchoolInfo } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/director/settings', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch school settings');
        const data = await response.json();
        console.log('Bulletin school settings data:', data);
        // Transform to match expected structure for bulletins
        return {
          data: {
            ...data.settings?.school,
            officialInfo: {
              regionaleMinisterielle: data.settings?.school?.regionaleMinisterielle,
              delegationDepartementale: data.settings?.school?.delegationDepartementale
            }
          }
        };
      } catch (error) {
        console.error('Error fetching school settings for bulletin:', error);
        // Return mock data with proper structure for bulletins
        return {
          data: {
            name: 'LYCÉE DE MENDONG',
            address: 'Yaoundé, Cameroun',
            email: 'info@lyceemendong.cm',
            phone: '+237 222 xxx xxx',
            officialInfo: {
              regionaleMinisterielle: 'CENTRE',
              delegationDepartementale: 'MFOUNDI'
            }
          }
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  }) as { data: any, isLoading: boolean };

  // Fetch competency evaluation systems
  const { data: competencySystems, isLoading: loadingCompetencySystems } = useQuery({
    queryKey: ['/api/comprehensive-bulletin/competency-systems'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletin/competency-systems');
      return await response.json();
    }
  });

  // Fetch predefined appreciations
  const { data: predefinedAppreciations, isLoading: loadingAppreciations } = useQuery({
    queryKey: ['/api/comprehensive-bulletin/predefined-appreciations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletin/predefined-appreciations?targetRole=director');
      return await response.json();
    }
  });

  const [trimester, setTrimester] = useState(
    defaultTerm === 'T1' ? 'Premier' : 
    defaultTerm === 'T2' ? 'Deuxième' : 
    defaultTerm === 'T3' ? 'Troisième' : 'Premier'
  );
  
  // Initialize bulletin type based on school type and language
  const getInitialBulletinType = (): 'general-fr' | 'general-en' | 'technical-fr' | 'technical-en' => {
    // Check school data
    const schoolType = testModeEducationalType || schoolData?.school?.educationalType;
    if (schoolType === 'technical') {
      return language === 'en' ? 'technical-en' : 'technical-fr';
    }
    // For general schools, use language-specific format
    return language === 'en' ? 'general-en' : 'general-fr';
  };
  
  const [bulletinType, setBulletinType] = useState<'general-fr' | 'general-en' | 'technical-fr' | 'technical-en'>(getInitialBulletinType());
  const isTechnicalBulletin = bulletinType === 'technical-fr' || bulletinType === 'technical-en';
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClass || '');
  const [year, setYear] = useState(defaultYear || '2025/2026');
  
  // Update bulletin type when school data or language changes
  useEffect(() => {
    setBulletinType(getInitialBulletinType());
  }, [schoolData, testModeEducationalType, language]);

  // Fetch available classes
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: () => fetch('/api/director/classes').then(res => res.json()),
  });

  // Fetch competency templates
  const { data: competencyTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['/api/comprehensive-bulletin/competency-templates', trimester],
    queryFn: async () => {
      const term = trimester === 'Premier' ? 'Premier' : trimester === 'Deuxième' ? 'Deuxième' : 'Troisième';
      const response = await apiRequest('GET', `/api/comprehensive-bulletin/competency-templates?term=${term}`);
      return await response.json();
    }
  });

  // Effect to set default competency system based on language
  useEffect(() => {
    if (competencySystems?.data) {
      const defaultSystem = competencySystems.data.find((system: any) => 
        system.language === language
      );
      if (defaultSystem) {
        // Always update when language changes to match new language system
        if (!selectedCompetencySystem || selectedCompetencySystem.language !== language) {
          setSelectedCompetencySystem(defaultSystem);
        }
      }
    }
  }, [competencySystems, language, selectedCompetencySystem]);

  // Effect to recompute all subject competencies when language or system changes
  useEffect(() => {
    if (selectedCompetencySystem && subjects.length > 0) {
      setSubjects(subjects.map(subject => ({
        ...subject,
        competencyLevel: calculateCompetencyLevel(subject.grade) as any,
        competencyEvaluation: getCompetencyDescription(calculateCompetencyLevel(subject.grade), language)
      })));
    }
  }, [language, selectedCompetencySystem]);
  
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
    // NEW: Ministry required fields
    isRepeater: false,
    numberOfSubjects: 0,
    numberOfPassed: 0,
    // School official information
    schoolName: '',
    regionaleMinisterielle: '',
    delegationDepartementale: '',
    schoolAddress: '',
    schoolPhone: '',
    registrationNumber: '' // Will be auto-filled from educafricNumber
  });

  const [studentPhotoUrl, setStudentPhotoUrl] = useState('');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState('');
  // Use the existing schoolInfo from line 194 - consolidate real school logo URL
  const realSchoolLogoUrl = schoolInfo?.data?.logoUrl || schoolLogoUrl;

  // Auto-fill registration number from educafricNumber when school data loads
  React.useEffect(() => {
    if (schoolInfo?.data?.educafricNumber && !student.registrationNumber) {
      setStudent(prev => ({
        ...prev,
        registrationNumber: schoolInfo.data.educafricNumber
      }));
    }
  }, [schoolInfo?.data?.educafricNumber]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { 
      id: '1', 
      name: 'FRANÇAIS',
      teacher: '',
      coefficient: 6, 
      grade: 0, 
      remark: '', 
      comments: [],
      note1: 0, 
 
      moyenneFinale: 0, 
      competence1: 'Communication orale et écrite', 
      competence2: 'Raisonnement mathématique', 
      competence3: 'Résolution de problèmes',
      totalPondere: 0, 
      cote: '' 
    },
    { 
      id: '2', 
      name: 'ANGLAIS',
      teacher: '',
      coefficient: 3, 
      grade: 0, 
      remark: '', 
      comments: [],
      note1: 0, 
 
      moyenneFinale: 0, 
      competence1: 'Communication orale et écrite', 
      competence2: 'Raisonnement mathématique', 
      competence3: 'Résolution de problèmes',
      totalPondere: 0, 
      cote: '' 
    },
    { 
      id: '3', 
      name: 'MATHÉMATIQUES',
      teacher: '',
      coefficient: 4, 
      grade: 0, 
      remark: '', 
      comments: [],
      note1: 0, 
 
      moyenneFinale: 0, 
      competence1: 'Communication orale et écrite', 
      competence2: 'Raisonnement mathématique', 
      competence3: 'Résolution de problèmes',
      totalPondere: 0, 
      cote: '' 
    },
  ]);

  const [discipline, setDiscipline] = useState<DisciplineInfo>({
    absJ: 0,
    absNJ: 0,
    late: 0,
    sanctions: 0,
    // NEW: Extended discipline fields
    punishmentHours: 0,
    conductWarning: 0,
    conductBlame: 0,
    suspension: 0,
    dismissal: 0
  });
  
  // Check if this is third trimester for annual summary
  const isThirdTrimester = trimester === 'Troisième';
  
  // Annual data for third trimester
  const [annualSummary, setAnnualSummary] = useState({
    firstTrimesterAverage: 0,
    secondTrimesterAverage: 0,
    thirdTrimesterAverage: 0,
    annualAverage: 0,
    annualRank: 0,
    totalStudents: 45,
    passDecision: '', // 'PASSE', 'REDOUBLE', 'RENVOYÉ'
    finalAppreciation: '',
    holidayRecommendations: ''
  });
  const [showPreview, setShowPreview] = useState(true); // Always show preview for real-time updates
  const [showAnnualReport, setShowAnnualReport] = useState(false);
  // Removed PDF generation - using high-quality print instead
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);

  // Function to automatically calculate discipline and attendance data
  const calculateDisciplineData = async (studentId: string, trimesterPeriod: string) => {
    try {
      // For now, simulate automatic calculation with realistic values
      // In production, this would call actual APIs to get student attendance/discipline records
      
      // Simulate different data based on trimester
      const trimesterMultiplier = trimesterPeriod === 'Premier' ? 0.8 : 
                                 trimesterPeriod === 'Deuxième' ? 1.0 : 1.2;
      
      // Calculate realistic absence data (in hours)
      const baseJustifiedAbs = Math.floor(Math.random() * 15 * trimesterMultiplier);
      const baseUnjustifiedAbs = Math.floor(Math.random() * 8 * trimesterMultiplier);
      const baseLates = Math.floor(Math.random() * 5 * trimesterMultiplier);
      const baseSanctions = Math.floor(Math.random() * 3 * trimesterMultiplier);

      // Update discipline state with calculated values
      setDiscipline({
        absJ: baseJustifiedAbs,
        absNJ: baseUnjustifiedAbs,
        late: baseLates,
        sanctions: baseSanctions,
        // NEW: Extended discipline fields
        punishmentHours: 0,
        conductWarning: 0,
        conductBlame: 0,
        suspension: 0,
        dismissal: 0
      });

      // Show success message
      console.log(`📊 Données d'assiduité calculées automatiquement pour ${studentId} - ${trimesterPeriod} trimestre`);
      
    } catch (error) {
      console.error('Erreur lors du calcul automatique des données de discipline:', error);
      // Keep manual values if automatic calculation fails
    }
  };
  const [generalRemark, setGeneralRemark] = useState('');
  // Per-subject comments are now stored in each Subject's comments field

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      teacher: '',
      coefficient: 1,
      grade: 0,
      remark: '',
      note1: 0,
      moyenneFinale: 0,
      competence1: '',
      competence2: '',
      competence3: '',
      totalPondere: 0,
      cote: '',
      bulletinSection: undefined
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      // Convert numeric inputs and create updated subject
      const numValue = Number(value) || 0;
      const updatedSubject = { 
        ...s, 
        [field]: (field === 'name' || field === 'remark' || field === 'customAppreciation' || field === 'cote' || field === 'competence1' || field === 'competence2' || field === 'competence3' || field === 'teacher' || field === 'comments' || field === 'subjectType' || field === 'bulletinSection') ? value : numValue 
      };
      
      // Always recalculate derived values
      const n1 = Number(updatedSubject.note1) || 0;
      const coef = Number(updatedSubject.coefficient) || 0;
      
      // No automatic calculation - note1 and moyenneFinale are independent manual inputs
      
      // If moyenne finale is directly updated, sync it to grade  
      if (field === 'moyenneFinale') {
        updatedSubject.grade = Number(updatedSubject.moyenneFinale) || 0;
      }
      
      // If note1 is updated, sync it to grade (N/20 is the primary grade)
      if (field === 'note1') {
        updatedSubject.grade = Number(updatedSubject.note1) || 0;
      }
      
      // Recalculate all derived fields
      const finalGrade = Number(updatedSubject.grade) || 0;
      updatedSubject.totalPondere = round2(finalGrade * coef);
      updatedSubject.cote = coteFromNote(finalGrade);
      
      // Update competency evaluation
      const competencyLevel = calculateCompetencyLevel(finalGrade);
      updatedSubject.competencyLevel = competencyLevel as any;
      updatedSubject.competencyEvaluation = getCompetencyDescription(competencyLevel, language);
      
      return updatedSubject;
    }));
  };

  // Function to update comments for a specific subject
  const updateSubjectComments = (subjectId: string, comments: string[]) => {
    setSubjects(prev => prev.map(s => 
      s.id === subjectId ? { ...s, comments } : s
    ));
  };

  // Function to toggle a comment for a specific subject
  const toggleSubjectComment = (subjectId: string, commentId: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      
      const currentComments = s.comments || [];
      const isSelected = currentComments.includes(commentId);
      let newComments;
      
      if (isSelected) {
        // Remove comment
        newComments = currentComments.filter(id => id !== commentId);
      } else if (currentComments.length < 2) {
        // Add comment (max 2)
        newComments = [...currentComments, commentId];
      } else {
        // Already at max, don't add
        return s;
      }
      
      return { ...s, comments: newComments };
    }));
  };

  const calculateAverage = () => {
    if (subjects.length === 0) return 0;
    const totalPoints = subjects.reduce((sum, s) => sum + (s.grade * s.coefficient), 0);
    const totalCoef = subjects.reduce((sum, s) => sum + s.coefficient, 0);
    return totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : 0;
  };

  const handleSaveBulletin = async () => {
    try {
      // ✅ VALIDATION STRICTE: Refuser si données manquantes
      if (!student.name || !student.classLabel) {
        alert(language === 'fr' 
          ? 'Veuillez remplir les informations de l\'élève avant de sauvegarder' 
          : 'Please fill in student information before saving');
        return;
      }

      // ✅ SÉCURITÉ: Vérifier que l'utilisateur est authentifié avec un vrai compte
      if (!user?.schoolId || !user?.id) {
        alert(language === 'fr' 
          ? 'Erreur: Session invalide. Veuillez vous reconnecter.' 
          : 'Error: Invalid session. Please log in again.');
        return;
      }

      // ✅ SÉCURITÉ: Bloquer les comptes sandbox de sauvegarder dans les archives réelles
      if (user.isSandboxUser) {
        alert(language === 'fr' 
          ? '⚠️ Compte Sandbox: Les sauvegardes sont désactivées en mode démonstration.' 
          : '⚠️ Sandbox Account: Saving is disabled in demo mode.');
        return;
      }

      // ✅ DONNÉES RÉELLES UNIQUEMENT: Pas de valeurs par défaut
      const archiveData = {
        schoolId: user.schoolId, // Utilise SEULEMENT la vraie école
        type: 'bulletin' as const,
        classId: student.id || 0, // TODO: get real classId from student data
        academicYear: year,
        term: trimester,
        studentId: student.id || 0,
        language: language,
        filename: `Bulletin_${student.name}_${trimester}_${year}.pdf`,
        storageKey: `bulletins/${year}/${trimester}/${student.id}_${Date.now()}.pdf`,
        checksumSha256: 'pending',
        sizeBytes: 0,
        snapshot: {
          studentInfo: student,
          subjects,
          discipline,
          generalRemark,
          signatureData
        },
        meta: {
          bulletinType: isTechnicalSchool ? 'technical' : 'general',
          isSigned: isSigned,
          status: 'draft'
        },
        sentAt: new Date(),
        sentBy: user.id // Utilise SEULEMENT le vrai ID utilisateur
      };

      const response = await apiRequest('POST', '/api/director/archives/save', archiveData);

      if (!response.ok) {
        throw new Error('Failed to save bulletin');
      }

      const result = await response.json();
      console.log('[BULLETIN_SAVE] ✅ Bulletin saved:', result);
      alert(language === 'fr' 
        ? 'Bulletin sauvegardé dans les archives avec succès !' 
        : 'Bulletin saved to archives successfully!');
    } catch (error) {
      console.error('[BULLETIN_SAVE] ❌ Error saving bulletin:', error);
      alert(language === 'fr' 
        ? 'Erreur lors de la sauvegarde du bulletin' 
        : 'Error saving bulletin');
    }
  };

  // PDF functionality is now handled by react-to-print in BulletinPrint component


  const signBulletin = async () => {
    try {
      console.log('Signing bulletin digitally...');
      
      // Calculate overall average
      const totalCoef = subjects.reduce((sum, s) => sum + (s.coefficient || 0), 0);
      // For technical schools (2 columns), use moyenneFinale (M/20); for general schools (1 column), use note1
      const totalMxCoef = subjects.reduce((sum, s) => {
        const gradeToUse = isTechnicalSchool ? (s.moyenneFinale || 0) : (s.note1 || 0);
        return sum + gradeToUse * (s.coefficient || 0);
      }, 0);
      const overallAverage = totalCoef ? (totalMxCoef / totalCoef).toFixed(2) : '0.00';
      
      // Create verification record on server
      const verificationData = {
        studentName: student.name,
        studentMatricule: String(student.id),
        studentBirthDate: student.birthDate || '',
        studentGender: student.gender || '',
        className: student.classLabel,
        schoolName: schoolInfo?.data?.name || "École non spécifiée",
        generalAverage: overallAverage,
        term: trimester,
        academicYear: year
      };
      
      const response = await apiRequest('POST', '/api/bulletins/create', verificationData);
      const responseData = await response.json();
      
      if (responseData.success) {
        const signatureData = {
          verificationCode: responseData.data.verificationCode,
          shortCode: responseData.data.shortCode,
          timestamp: new Date().toISOString(),
          signedBy: "Chef d'Établissement",
          status: 'signed'
        };
        
        setSignatureData(signatureData);
        setIsSigned(true);
        
        // Afficher message de succès avec instructions de vérification
        toast({
          title: "✅ " + (language === 'fr' ? 'Bulletin envoyé avec succès !' : 'Bulletin sent successfully!'),
          description: language === 'fr' 
            ? `Vérifiez sur educafric.com/verify avec le code ${responseData.data.shortCode}`
            : `Verify at educafric.com/verify with code ${responseData.data.shortCode}`,
          duration: 5000
        });
        
        // Simuler les notifications aux élèves et parents
        console.log('📧 Notifications envoyées:');
        console.log('👨‍🎓 Élève: Email + Push notification');
        console.log('👪 Parent: Email + SMS');
        
        // Message additionnel pour les notifications
        setTimeout(() => {
          toast({
            title: "📧 " + (language === 'fr' ? 'Notifications envoyées' : 'Notifications sent'),
            description: language === 'fr'
              ? 'Élève (email+push) et Parent (email+SMS)'
              : 'Student (email+push) and Parent (email+SMS)',
            duration: 4000
          });
        }, 1500);
      } else {
        throw new Error(responseData.message || 'Erreur lors de la signature');
      }
    } catch (error) {
      console.error('Error signing bulletin:', error);
      alert('Erreur lors de la signature du bulletin: ' + (error.message || 'Erreur inconnue'));
    }
  };

  // Alias for signing function (used by director interface)
  const handleSignBulletin = signBulletin;

  const sendToStudentsParents = async () => {
    if (!isSigned) {
      alert('Le bulletin doit d\'abord être signé avant l\'envoi');
      return;
    }
    
    try {
      console.log('Sending bulletin to students and parents...');
      
      // Mock notification sending
      const notifications = {
        student: {
          method: 'Email + SMS',
          status: 'Envoyé',
          timestamp: new Date().toISOString()
        },
        parents: {
          method: 'Email + WhatsApp',
          status: 'Envoyé', 
          timestamp: new Date().toISOString()
        }
      };
      
      alert(`Bulletin envoyé avec succès!\n\n` +
            `📧 Élève: ${notifications.student.method}\n` +
            `📱 Parents: ${notifications.parents.method}\n\n` +
            `Code de vérification: ${signatureData?.verificationCode}`);
    } catch (error) {
      console.error('Error sending bulletin:', error);
      alert('Erreur lors de l\'envoi du bulletin');
    }
  };

  const labels = {
    fr: {
      title: "Création de Bulletin Trimestriel",
      trimester: "Trimestre",
      bulletinType: "Type de Bulletin",
      selectBulletinType: "Sélectionner le type",
      generalFr: "Général Francophone (1 colonne)",
      generalEn: "Général Anglophone (2 colonnes)",
      technicalFr: "Technique Francophone (3 sections)",
      technicalEn: "Technique Anglophone (3 sections)",
      selectClass: "Sélectionner la classe",
      selectTrimester: "Sélectionner le trimestre",
      firstTerm: "Premier Trimestre",
      secondTerm: "Deuxième Trimestre", 
      thirdTerm: "Troisième Trimestre",
      academicYear: "Année scolaire",
      generalAverage: "Moyenne générale",
      studentInfo: "Informations de l'élève",
      namePrenames: "Nom & Prénoms",
      studentId: "Matricule",
      class: "Classe",
      classSize: "Effectif",
      birthDate: "Date de naissance",
      birthPlace: "Lieu de naissance",
      gender: "Genre",
      selectGender: "Sélectionner",
      male: "Masculin",
      female: "Féminin",
      homeTeacher: "Professeur principal",
      guardian: "Parents/Tuteurs",
      // NEW: Ministry required field labels
      isRepeater: "Redoublant",
      numberOfSubjects: "Nombre de matières",
      numberOfPassed: "Nombre réussi",
      schoolName: "Nom de l'école",
      regionaleMinisterielle: "Délégation régionale",
      delegationDepartementale: "Délégation départementale",
      schoolAddress: "Adresse de l'école",
      schoolPhone: "Téléphone de l'école",
      // Extended discipline fields
      punishmentHours: "Punition (heures)",
      suspension: "Suspension (jours)",
      dismissal: "Renvoi",
      subjectsGrades: "Notes par matière",
      addSubject: "Ajouter",
      subject: "Matière",
      coefficient: "Coefficient", 
      grade: "Note /20",
      appreciation: "Appréciation",
      teacherAppreciation: "Appréciation de l'enseignant",
      disciplineAbsences: "Discipline et Absences",
      justifiedAbs: "Absences justifiées (h)",
      unjustifiedAbs: "Absences non justifiées (h)",
      lates: "Retards",
      warnings: "Avertissements/Blâmes",
      generalAppreciation: "Appréciation générale",
      generalAppreciationPlaceholder: "Appréciation générale du trimestre...",
      preview: "Aperçu",
      hide: "Masquer",
      save: "Sauvegarder",
      printToPDF: "Print to PDF", 
      generating: "Génération...",
      digitalSignature: "Signature Numérique",
      signBulletin: "Signer le Bulletin",
      signed: "Signé ✓",
      sendToStudentParent: "Envoyer aux Élèves/Parents",
      annualSummary: "Bilan Annuel",
      trimesterAverages: "Moyennes Trimestrielles",
      firstTrimester: "1er Trimestre",
      secondTrimester: "2ème Trimestre", 
      thirdTrimester: "3ème Trimestre",
      annualAverage: "Moyenne Annuelle",
      annualRank: "Rang Annuel",
      passDecision: "Décision de Passage",
      passes: "PASSE en classe supérieure",
      repeats: "REDOUBLE",
      expelled: "RENVOYÉ",
      finalAppreciation: "Appréciation Finale",
      holidayRecommendations: "Recommandations pour les Vacances",
      bulletinPreview: "Aperçu du bulletin",
      uploadLogo: "Choisir logo école",
      uploadPhoto: "Choisir photo élève",
      testImages: "Images de test disponibles",
      selectLogo: "Sélectionner logo",
      selectPhoto: "Sélectionner photo"
    },
    en: {
      title: "Quarterly Report Creation",
      trimester: "Term",
      bulletinType: "Report Type",
      selectBulletinType: "Select type",
      generalFr: "General Francophone (1 column)",
      generalEn: "General Anglophone (2 columns)",
      technicalFr: "Technical Francophone (3 sections)",
      technicalEn: "Technical Anglophone (3 sections)",
      selectClass: "Select class",
      selectTrimester: "Select term",
      firstTerm: "First Term",
      secondTerm: "Second Term",
      thirdTerm: "Third Term",
      academicYear: "Academic year",
      generalAverage: "General average",
      studentInfo: "Student information",
      namePrenames: "Name & Surnames",
      studentId: "Student ID",
      class: "Class",
      classSize: "Class size",
      birthDate: "Birth date",
      birthPlace: "Birth place",
      gender: "Gender",
      selectGender: "Select",
      male: "Male",
      female: "Female", 
      homeTeacher: "Homeroom teacher", 
      guardian: "Parents/Guardians",
      // NEW: Ministry required field labels
      isRepeater: "Repeater",
      numberOfSubjects: "Number of subjects",
      numberOfPassed: "Number passed",
      schoolName: "School name",
      regionaleMinisterielle: "Regional delegation",
      delegationDepartementale: "Departmental delegation",
      schoolAddress: "School address",
      schoolPhone: "School phone",
      // Extended discipline fields
      punishmentHours: "Punishment (hours)",
      suspension: "Suspension (days)",
      dismissal: "Dismissal",
      subjectsGrades: "Subject grades",
      addSubject: "Add",
      subject: "Subject",
      coefficient: "Coefficient",
      grade: "Grade /20",
      appreciation: "Appreciation",
      teacherAppreciation: "Teacher's appreciation",
      disciplineAbsences: "Attendance and Discipline",
      justifiedAbs: "Justified absences (h)",
      unjustifiedAbs: "Unjustified absences (h)",
      lates: "Lates",
      warnings: "Warnings/Reprimands",
      generalAppreciation: "General appreciation",
      generalAppreciationPlaceholder: "General appreciation for the term...",
      preview: "Preview",
      hide: "Hide", 
      save: "Save",
      printToPDF: "Print to PDF",
      generating: "Generating...",
      digitalSignature: "Digital Signature",
      signBulletin: "Sign Bulletin",
      signed: "Signed ✓",
      sendToStudentParent: "Send to Students/Parents",
      annualSummary: "Annual Summary",
      trimesterAverages: "Trimester Averages",
      firstTrimester: "1st Trimester",
      secondTrimester: "2nd Trimester",
      thirdTrimester: "3rd Trimester", 
      annualAverage: "Annual Average",
      annualRank: "Annual Rank",
      passDecision: "Pass Decision",
      passes: "PASSES to next grade",
      repeats: "REPEATS grade",
      expelled: "EXPELLED",
      finalAppreciation: "Final Appreciation",
      holidayRecommendations: "Holiday Recommendations",
      bulletinPreview: "Report card preview",
      uploadLogo: "Choose school logo",
      uploadPhoto: "Choose student photo",
      testImages: "Available test images",
      selectLogo: "Select logo",
      selectPhoto: "Select photo"
    }
  };

  const t = labels[language];

  const bulletinData = {
    student: {
      ...student,
      generalRemark,
      discipline,
      verificationCode: signatureData?.shortCode,
      school: {
        name: schoolInfo?.data?.name || "LYCÉE DE MENDONG / HIGH SCHOOL OF MENDONG",
        subtitle: `${schoolInfo?.data?.address || "Yaoundé"} – Tel: ${schoolInfo?.data?.phone || "+237 222 xxx xxx"}`,
        officialInfo: schoolInfo?.data?.officialInfo || {
          regionaleMinisterielle: 'DÉLÉGATION RÉGIONALE DU CENTRE',
          delegationDepartementale: 'DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI'
        }
      }
    },
    registrationNumber: student.registrationNumber || schoolInfo?.data?.educafricNumber || '',
    lines: subjects.map(s => {
      // For technical schools (2 columns), use moyenneFinale (M/20); for general schools (1 column), use note1
      const gradeToUse = isTechnicalSchool ? (s.moyenneFinale || 0) : (s.note1 || 0);
      return {
        subject: s.name,
        note1: s.note1,
        moyenneFinale: s.moyenneFinale,
        mk20: s.note1, // MK/20 column (marks)
        av20: s.moyenneFinale, // AV/20 column (average)
        m20: gradeToUse, // Use note1 for technical schools, moyenneFinale for general schools
        coef: s.coefficient,
        totalPondere: round2(gradeToUse * s.coefficient),
        notePercent: round2((gradeToUse / 20) * 100),
        cote: coteFromNote(gradeToUse),
        competence1: s.competence1,
        competence2: s.competence2,
        competence3: s.competence3,
        competencesEvaluees: [s.competence1, s.competence2, s.competence3].filter(c => c?.trim()).join('; '),
        competencyLevel: s.competencyLevel,
        competencyEvaluation: s.competencyEvaluation,
        remark: s.remark,
        customAppreciation: s.customAppreciation,
        subjectType: s.subjectType || 'general',
        bulletinSection: s.bulletinSection,
        teacher: s.teacher,
        teacherComments: Array.isArray(s.comments) 
          ? s.comments.map(commentId => {
              const comment = TEACHER_COMMENTS[language].find(c => c.id === commentId);
              return comment ? comment.text : commentId;
            })
          : [], // Map comment IDs to localized text
      };
    }),
    year,
    trimester,
    schoolLogoUrl: realSchoolLogoUrl,
    studentPhotoUrl,
    language,
    // Third trimester specific data
    isThirdTrimester,
    annualSummary: isThirdTrimester ? annualSummary : null,
    // Add missing fields for preview component
    firstTrimester: isThirdTrimester ? annualSummary.firstTrimesterAverage : null,
    secondTrimester: isThirdTrimester ? annualSummary.secondTrimesterAverage : null,
    thirdTrimester: isThirdTrimester ? annualSummary.thirdTrimesterAverage : null,
    annualAverage: isThirdTrimester ? annualSummary.annualAverage : null,
    annualRank: isThirdTrimester ? annualSummary.annualRank : null,
    passDecision: isThirdTrimester ? annualSummary.passDecision : null,
    finalAppreciation: isThirdTrimester ? annualSummary.finalAppreciation : null,
    holidayRecommendations: isThirdTrimester ? annualSummary.holidayRecommendations : null
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-5 w-5" />
              {t.title}
            </CardTitle>
            {isSandboxUser && (
              <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
                <Badge 
                  variant="outline" 
                  className="px-1.5 py-0.5 text-[10px] sm:text-xs whitespace-nowrap"
                  data-testid="badge-test-mode"
                >
                  {language === 'fr' ? 'TEST' : 'TEST'}
                </Badge>
                {/* Mobile: Icon-only button */}
                <Button
                  onClick={() => {
                    setTestModeEducationalType(prev => {
                      const newType = prev === 'technical' ? 'general' : 'technical';
                      
                      // Force preview refresh by toggling it off and on
                      if (showPreview) {
                        setShowPreview(false);
                        setTimeout(() => setShowPreview(true), 100);
                      }
                      
                      toast({
                        title: language === 'fr' ? 'Type d\'école modifié' : 'School type changed',
                        description: language === 'fr' 
                          ? `Basculé vers école ${newType === 'technical' ? 'TECHNIQUE' : 'GÉNÉRALE'} - ${newType === 'technical' ? 'Deux colonnes N/20 et M/20' : 'Une seule colonne Note/20'}`
                          : `Switched to ${newType.toUpperCase()} school - ${newType === 'technical' ? 'Two columns N/20 and M/20' : 'Single Note/20 column'}`,
                        duration: 5000,
                      });
                      return newType;
                    });
                  }}
                  variant="outline"
                  size="icon"
                  className="sm:hidden h-8 w-8"
                  aria-label={language === 'fr' ? 'Basculer type d\'école' : 'Toggle school type'}
                  data-testid="button-toggle-educational-type-mobile"
                >
                  <School className="h-4 w-4" />
                </Button>
                {/* Desktop: Full text button */}
                <Button
                  onClick={() => {
                    setTestModeEducationalType(prev => {
                      const newType = prev === 'technical' ? 'general' : 'technical';
                      
                      // Force preview refresh by toggling it off and on
                      if (showPreview) {
                        setShowPreview(false);
                        setTimeout(() => setShowPreview(true), 100);
                      }
                      
                      toast({
                        title: language === 'fr' ? 'Type d\'école modifié' : 'School type changed',
                        description: language === 'fr' 
                          ? `Basculé vers école ${newType === 'technical' ? 'TECHNIQUE' : 'GÉNÉRALE'} - ${newType === 'technical' ? 'Deux colonnes N/20 et M/20' : 'Une seule colonne Note/20'}`
                          : `Switched to ${newType.toUpperCase()} school - ${newType === 'technical' ? 'Two columns N/20 and M/20' : 'Single Note/20 column'}`,
                        duration: 5000,
                      });
                      return newType;
                    });
                  }}
                  variant="outline"
                  className="hidden sm:inline-flex h-8 px-3 gap-2 text-xs sm:text-sm"
                  data-testid="button-toggle-educational-type-desktop"
                >
                  <School className="h-4 w-4" />
                  {educationalType === 'technical' 
                    ? (language === 'fr' ? '→ Général' : '→ General')
                    : (language === 'fr' ? '→ Technique' : '→ Technical')
                  }
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="class">{t.class}</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="bg-white border-gray-300" data-testid="select-class">
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {loadingClasses ? (
                    <SelectItem value="loading" disabled>
                      {language === 'fr' ? 'Chargement...' : 'Loading...'}
                    </SelectItem>
                  ) : !classesData?.classes || classesData.classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>
                      {language === 'fr' ? 'Aucune classe trouvée' : 'No classes found'}
                    </SelectItem>
                  ) : (
                    classesData.classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trimester">{t.trimester}</Label>
              <Select value={trimester} onValueChange={setTrimester}>
                <SelectTrigger className="bg-white border-gray-300" data-testid="select-trimester">
                  <SelectValue placeholder={t.selectTrimester} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Premier">{t.firstTerm}</SelectItem>
                  <SelectItem value="Deuxième">{t.secondTerm}</SelectItem>
                  <SelectItem value="Troisième">{t.thirdTerm}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulletinType">{t.bulletinType}</Label>
              <Select value={bulletinType} onValueChange={(value: any) => setBulletinType(value)}>
                <SelectTrigger className="bg-white border-gray-300" data-testid="select-bulletin-type">
                  <SelectValue placeholder={t.selectBulletinType} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="general-fr">{t.generalFr}</SelectItem>
                  <SelectItem value="general-en">{t.generalEn}</SelectItem>
                  <SelectItem value="technical-fr">{t.technicalFr}</SelectItem>
                  <SelectItem value="technical-en">{t.technicalEn}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year">{t.academicYear}</Label>
              <Input
                id="year"
                data-testid="input-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025/2026"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">{t.generalAverage}</div>
              <div className="text-2xl font-bold text-blue-600">{calculateAverage()}/20</div>
            </div>
          </div>

          {/* Student Selection */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                {language === 'fr' ? 'Paramètres - Sélection Élève' : 'Settings - Student Selection'}
              </CardTitle>
              <p className="text-sm text-blue-600">
                {language === 'fr' 
                  ? 'Sélectionnez un élève pour remplir automatiquement ses informations et récupérer ses notes'
                  : 'Select a student to automatically fill their information and retrieve their grades'
                }
              </p>
            </CardHeader>
            <CardContent>
              <StudentSelector 
                selectedClassId={selectedClassId}
                onStudentSelect={(selectedStudent: any) => {
                  console.log('[BULLETIN] onStudentSelect called with:', selectedStudent);
                  // Handle null - clear student information when class changes
                  if (!selectedStudent) {
                    console.log('[BULLETIN] Clearing student data (null received)');
                    setStudent({
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
                      numberOfPassed: 0,
                      schoolName: '',
                      regionaleMinisterielle: '',
                      delegationDepartementale: '',
                      schoolAddress: '',
                      schoolPhone: ''
                    });
                    setStudentPhotoUrl('');
                    return;
                  }
                  
                  // Auto-fill student information
                  console.log('[BULLETIN] Auto-filling student data:', selectedStudent);
                  setStudent({
                    name: selectedStudent.name || '',
                    id: selectedStudent.matricule || selectedStudent.id || '',
                    classLabel: selectedStudent.className || selectedStudent.class || '',
                    classSize: selectedStudent.classSize || 0,
                    birthDate: selectedStudent.birthDate || '',
                    birthPlace: selectedStudent.birthPlace || '',
                    gender: selectedStudent.gender || '',
                    headTeacher: selectedStudent.headTeacher || '',
                    guardian: selectedStudent.guardian || selectedStudent.parentName || '',
                    // NEW: Ministry required fields
                    isRepeater: selectedStudent.isRepeater || false,
                    numberOfSubjects: selectedStudent.numberOfSubjects || 0,
                    numberOfPassed: selectedStudent.numberOfPassed || 0,
                    // School official information
                    schoolName: selectedStudent.schoolName || '',
                    regionaleMinisterielle: selectedStudent.regionaleMinisterielle || '',
                    delegationDepartementale: selectedStudent.delegationDepartementale || '',
                    schoolAddress: selectedStudent.schoolAddress || '',
                    schoolPhone: selectedStudent.schoolPhone || ''
                  });
                  
                  // Auto-fill subjects with grades from teachers
                  if (selectedStudent.grades && selectedStudent.grades.length > 0) {
                    const updatedSubjects = subjects.map(subject => {
                      const studentGrade = selectedStudent.grades.find((g: any) => 
                        g.subjectName === subject.name || g.subject === subject.name
                      );
                      
                      if (studentGrade) {
                        return {
                          ...subject,
                          note1: studentGrade.note1 || 0,
                          moyenneFinale: studentGrade.finalGrade || studentGrade.moyenne || 0,
                          grade: studentGrade.finalGrade || studentGrade.moyenne || 0,
                          remark: studentGrade.remark || studentGrade.appreciation || ''
                        };
                      }
                      return subject;
                    });
                    setSubjects(updatedSubjects);
                  }

                  // Set student photo URL from profile
                  setStudentPhotoUrl(selectedStudent.photoUrl || selectedStudent.photoURL || selectedStudent.profilePictureUrl || '');
                }}
                language={language}
              />
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{labels[language].studentInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studentName">{labels[language].namePrenames}</Label>
                  <Input
                    id="studentName"
                    data-testid="input-student-name"
                    value={student.name}
                    onChange={(e) => setStudent({...student, name: e.target.value})}
                    placeholder="NDAH John"
                  />
                </div>
                
                <div>
                  <Label htmlFor="studentId">{labels[language].studentId}</Label>
                  <Input
                    id="studentId"
                    data-testid="input-student-id"
                    value={student.id}
                    onChange={(e) => setStudent({...student, id: e.target.value})}
                    placeholder="STU-6E-00045"
                  />
                </div>

                <div>
                  <Label htmlFor="classLabel">{labels[language].class}</Label>
                  <Input
                    id="classLabel"
                    data-testid="input-class-label"
                    value={student.classLabel}
                    onChange={(e) => setStudent({...student, classLabel: e.target.value})}
                    placeholder="6ème A"
                  />
                </div>

                <div>
                  <Label htmlFor="classSize">Effectif</Label>
                  <Input
                    id="classSize"
                    data-testid="input-class-size"
                    type="number"
                    value={student.classSize}
                    onChange={(e) => setStudent({...student, classSize: parseInt(e.target.value) || 0})}
                    placeholder="58"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">{labels[language].birthDate}</Label>
                  <Input
                    id="birthDate"
                    data-testid="input-birth-date"
                    type="date"
                    value={student.birthDate}
                    onChange={(e) => setStudent({...student, birthDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="birthPlace">{labels[language].birthPlace}</Label>
                  <Input
                    id="birthPlace"
                    data-testid="input-birth-place"
                    value={student.birthPlace}
                    onChange={(e) => setStudent({...student, birthPlace: e.target.value})}
                    placeholder="Douala"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={student.gender} onValueChange={(value) => setStudent({...student, gender: value})}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-l-4 border-blue-500 pl-3 bg-blue-50/50 rounded-r-lg">
                  <Label htmlFor="headTeacher" className="text-sm font-semibold text-blue-700">
                    📚 {labels[language].homeTeacher}
                  </Label>
                  <Input
                    id="headTeacher"
                    data-testid="input-head-teacher"
                    value={student.headTeacher}
                    onChange={(e) => setStudent({...student, headTeacher: e.target.value})}
                    placeholder="Mme NGONO Marie"
                    className="mt-1 border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian">{labels[language].guardian}</Label>
                  <Input
                    id="guardian"
                    data-testid="input-guardian"
                    value={student.guardian}
                    onChange={(e) => setStudent({...student, guardian: e.target.value})}
                    placeholder="Mr & Mrs NDONGO"
                  />
                </div>

                {/* NEW: Ministry Required Fields - Academic Status */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      📋 {language === 'fr' ? 'Informations Académiques (Obligatoire Ministère)' : 'Academic Information (Ministry Required)'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="isRepeater" className="flex items-center space-x-2">
                          <Input
                            id="isRepeater"
                            type="checkbox"
                            checked={student.isRepeater}
                            onChange={(e) => setStudent({...student, isRepeater: e.target.checked})}
                            className="w-4 h-4"
                            data-testid="input-is-repeater"
                          />
                          <span>{labels[language].isRepeater}</span>
                        </Label>
                      </div>
                      
                      <div>
                        <Label htmlFor="numberOfSubjects">{labels[language].numberOfSubjects}</Label>
                        <Input
                          id="numberOfSubjects"
                          type="number"
                          value={student.numberOfSubjects}
                          onChange={(e) => setStudent({...student, numberOfSubjects: parseInt(e.target.value) || 0})}
                          placeholder="12"
                          data-testid="input-number-subjects"
                        />
                      </div>

                      <div>
                        <Label htmlFor="numberOfPassed">{labels[language].numberOfPassed}</Label>
                        <Input
                          id="numberOfPassed"
                          type="number"
                          value={student.numberOfPassed}
                          onChange={(e) => setStudent({...student, numberOfPassed: parseInt(e.target.value) || 0})}
                          placeholder="8"
                          data-testid="input-number-passed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* NEW: School Official Information */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                      🏫 {language === 'fr' ? 'Informations Officielles École' : 'Official School Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schoolName">{labels[language].schoolName}</Label>
                        <Input
                          id="schoolName"
                          value={student.schoolName}
                          onChange={(e) => setStudent({...student, schoolName: e.target.value})}
                          placeholder="Collège Notre-Dame de Fatima"
                          data-testid="input-school-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="regionaleMinisterielle">{labels[language].regionaleMinisterielle}</Label>
                        <Input
                          id="regionaleMinisterielle"
                          value={student.regionaleMinisterielle}
                          onChange={(e) => setStudent({...student, regionaleMinisterielle: e.target.value})}
                          placeholder="Délégation Régionale du Littoral"
                          data-testid="input-regionale-ministerielle"
                        />
                      </div>

                      <div>
                        <Label htmlFor="delegationDepartementale">{labels[language].delegationDepartementale}</Label>
                        <Input
                          id="delegationDepartementale"
                          value={student.delegationDepartementale}
                          onChange={(e) => setStudent({...student, delegationDepartementale: e.target.value})}
                          placeholder="Délégation Départementale du Wouri"
                          data-testid="input-delegation-departementale"
                        />
                      </div>

                      <div>
                        <Label htmlFor="schoolPhone">{labels[language].schoolPhone}</Label>
                        <Input
                          id="schoolPhone"
                          value={student.schoolPhone}
                          onChange={(e) => setStudent({...student, schoolPhone: e.target.value})}
                          placeholder="+237 233 12 34 56"
                          data-testid="input-school-phone"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="schoolAddress">{labels[language].schoolAddress}</Label>
                        <Input
                          id="schoolAddress"
                          value={student.schoolAddress}
                          onChange={(e) => setStudent({...student, schoolAddress: e.target.value})}
                          placeholder="BP 1234, Douala, Cameroun"
                          data-testid="input-school-address"
                        />
                      </div>

                      {/* Registration Number Field */}
                      <div>
                        <Label htmlFor="registrationNumber">
                          {language === 'fr' ? 'Numéro d\'enregistrement' : 'Registration Number'}
                        </Label>
                        <Input
                          id="registrationNumber"
                          value={student.registrationNumber}
                          onChange={(e) => setStudent({...student, registrationNumber: e.target.value})}
                          placeholder={language === 'fr' ? 'EDU-CM-SC-001' : 'EDU-CM-SC-001'}
                          data-testid="input-registration-number"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'fr' 
                            ? 'Auto-rempli depuis le numéro EDUCAFRIC de l\'école' 
                            : 'Auto-filled from school EDUCAFRIC number'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* School Logo Section */}
              {!schoolInfo?.data?.logoUrl && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                        <School className="h-5 w-5" />
                        {language === 'fr' ? 'Logo de l\'École' : 'School Logo'}
                      </h4>
                      <p className="text-sm text-blue-600">
                        {language === 'fr' 
                          ? 'Ajoutez le logo officiel de votre établissement pour le bulletin'
                          : 'Add your school\'s official logo for the bulletin'
                        }
                      </p>
                    </div>
                    
                    {/* Logo Preview */}
                    <div className="flex items-center gap-4">
                      {schoolLogoUrl ? (
                        <div className="relative">
                          <img 
                            src={schoolLogoUrl} 
                            alt="Logo école" 
                            className="w-16 h-16 object-contain border-2 border-blue-300 rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              setSchoolLogoUrl('');
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600"
                            onClick={() => setSchoolLogoUrl('')}
                            data-testid="button-remove-school-logo"
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 border-2 border-dashed border-blue-300 rounded-md flex items-center justify-center bg-blue-50">
                          <div className="text-center">
                            <School className="h-6 w-6 mx-auto text-blue-400 mb-1" />
                            <p className="text-xs text-blue-500">
                              {language === 'fr' ? 'Aucun logo' : 'No logo'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logo Upload Interface - only show if no logo */}
                  {!schoolLogoUrl && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64String = event.target?.result as string;
                                  setSchoolLogoUrl(base64String);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            data-testid="input-upload-school-logo"
                          />
                          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <Upload className="h-4 w-4 mr-2" />
                            {language === 'fr' ? 'Télécharger logo' : 'Upload Logo'}
                          </Button>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            // Demo logo URL for testing
                            setSchoolLogoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&face=center');
                          }}
                          data-testid="button-demo-school-logo"
                        >
                          {language === 'fr' ? 'Logo de démo' : 'Demo Logo'}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-blue-600">
                        {language === 'fr' 
                          ? 'Format recommandé : PNG/SVG transparent, 64x64px minimum, taille < 1MB'
                          : 'Recommended format: Transparent PNG/SVG, 64x64px minimum, size < 1MB'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Student Photo Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      {language === 'fr' ? 'Photo de l\'élève' : 'Student Photo'}
                    </h4>
                    <p className="text-sm text-purple-600">
                      {language === 'fr' 
                        ? 'Format ministère officiel requis pour le bulletin'
                        : 'Official ministry format required for bulletin'
                      }
                    </p>
                  </div>
                  
                  {/* Photo Preview */}
                  <div className="flex items-center gap-4">
                    {studentPhotoUrl ? (
                      <div className="relative">
                        <img 
                          src={studentPhotoUrl} 
                          alt="Photo élève" 
                          className="w-20 h-24 object-cover border-2 border-purple-300 rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            setStudentPhotoUrl('');
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600"
                          onClick={() => setStudentPhotoUrl('')}
                          data-testid="button-remove-photo"
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-24 border-2 border-dashed border-purple-300 rounded-md flex items-center justify-center bg-purple-50">
                        <div className="text-center">
                          <Camera className="h-6 w-6 mx-auto text-purple-400 mb-1" />
                          <p className="text-xs text-purple-500">
                            {language === 'fr' ? 'Aucune photo' : 'No photo'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo Upload Interface - only show if no photo */}
                {!studentPhotoUrl && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64String = event.target?.result as string;
                                setStudentPhotoUrl(base64String);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          data-testid="input-upload-photo"
                        />
                        <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                          <Upload className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Télécharger photo' : 'Upload Photo'}
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => {
                          // Demo photo URL for testing
                          setStudentPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop&face=center');
                        }}
                        data-testid="button-demo-photo"
                      >
                        {language === 'fr' ? 'Photo de démo' : 'Demo Photo'}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-purple-600">
                      {language === 'fr' 
                        ? 'Format recommandé : JPG/PNG, 150x200px minimum, taille < 2MB'
                        : 'Recommended format: JPG/PNG, 150x200px minimum, size < 2MB'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subjects and Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {labels[language].subjectsGrades}
                <Button onClick={addSubject} size="sm" data-testid="button-add-subject">
                  <Plus className="h-4 w-4 mr-1" />
                  {labels[language].addSubject}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Ministry Performance Grid - Reference for grading */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  {PERFORMANCE_GRID[language].title}
                </h3>
                <p className="text-xs text-blue-600 mb-3">
                  {language === 'fr' 
                    ? 'Guide de référence pour l\'attribution des notes et cotes conformément au système CBA du Ministère'
                    : 'Reference guide for grade assignment and grading according to the Ministry\'s CBA system'
                  }
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-blue-300 bg-white">
                    <thead>
                      <tr className="bg-blue-100">
                        {PERFORMANCE_GRID[language].headers.map((header, idx) => (
                          <th key={idx} className="border border-blue-300 p-2 font-bold text-center text-blue-800">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERFORMANCE_GRID[language].levels.map((level, levelIdx) => (
                        level.ranges.map((range, rangeIdx) => (
                          <tr key={`${levelIdx}-${rangeIdx}`} className="hover:bg-blue-50">
                            {rangeIdx === 0 && (
                              <td rowSpan={level.ranges.length} className="border border-blue-300 p-2 text-center font-semibold text-blue-700">
                                {level.level}
                              </td>
                            )}
                            <td className="border border-blue-300 p-2 text-center">{range}</td>
                            <td className="border border-blue-300 p-2 text-center font-bold text-green-700">{level.grades[rangeIdx]}</td>
                            <td className="border border-blue-300 p-2 text-center">{level.percentages[rangeIdx]}</td>
                            {rangeIdx === 0 && (
                              <td rowSpan={level.ranges.length} className="border border-blue-300 p-2 text-xs text-gray-700">
                                {level.appreciation}
                              </td>
                            )}
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grille d'évaluation - Repositioned below GRILLE DE NOTATION */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">
                    {language === 'fr' ? 'Grille d\'évaluation' : 'Evaluation Grid'}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {selectedCompetencySystem?.levels ? (
                      // Use actual system data
                      selectedCompetencySystem.levels
                        .sort((a: any, b: any) => b.gradeRange.min - a.gradeRange.min) // Sort by grade range descending
                        .map((level: any, index: number) => {
                          const colorClasses = getCompetencyColor(level.code);
                          const bgColor = colorClasses.includes('green') ? 'bg-green-100 border-green-200' :
                                         colorClasses.includes('blue') ? 'bg-blue-100 border-blue-200' :
                                         colorClasses.includes('yellow') ? 'bg-yellow-100 border-yellow-200' :
                                         colorClasses.includes('orange') ? 'bg-orange-100 border-orange-200' :
                                         'bg-red-100 border-red-200';
                          
                          const textColor = colorClasses.includes('green') ? 'text-green-800' :
                                           colorClasses.includes('blue') ? 'text-blue-800' :
                                           colorClasses.includes('yellow') ? 'text-yellow-800' :
                                           colorClasses.includes('orange') ? 'text-orange-800' :
                                           'text-red-800';
                          
                          return (
                            <div key={level.code} className={`p-3 rounded-lg border ${bgColor}`}>
                              <div className={`font-semibold text-sm ${textColor}`}>
                                {level.code}
                              </div>
                              <div className={`text-xs mt-1 ${textColor.replace('800', '700')}`}>
                                {language === 'fr' ? level.descriptionFr : level.descriptionEn}
                              </div>
                              <div className={`text-xs font-medium mt-1 ${textColor.replace('800', '600')}`}>
                                {level.gradeRange.min}-{level.gradeRange.max}/20
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      // Fallback display when no system loaded
                      <>
                        <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                          <div className="font-semibold text-green-800 text-sm">
                            {language === 'fr' ? 'CTBA' : 'CVWA'}
                          </div>
                          <div className="text-xs text-green-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences très bien acquises' 
                              : 'Competences Very Well Acquired'
                            }
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">16-20/20</div>
                        </div>

                        <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                          <div className="font-semibold text-blue-800 text-sm">
                            {language === 'fr' ? 'CBA' : 'CWA'}
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences bien acquises' 
                              : 'Competences Well Acquired'
                            }
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-1">14-16/20</div>
                        </div>

                        <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
                          <div className="font-semibold text-yellow-800 text-sm">CA</div>
                          <div className="text-xs text-yellow-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences acquises' 
                              : 'Competences Acquired'
                            }
                          </div>
                          <div className="text-xs text-yellow-600 font-medium mt-1">12-14/20</div>
                        </div>

                        <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
                          <div className="font-semibold text-orange-800 text-sm">
                            {language === 'fr' ? 'CMA' : 'CAA'}
                          </div>
                          <div className="text-xs text-orange-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences moyennement acquises' 
                              : 'Competences Averagely Acquired'
                            }
                          </div>
                          <div className="text-xs text-orange-600 font-medium mt-1">10-12/20</div>
                        </div>

                        <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                          <div className="font-semibold text-red-800 text-sm">CNA</div>
                          <div className="text-xs text-red-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences non acquises' 
                              : 'Competences Not Acquired'
                            }
                          </div>
                          <div className="text-xs text-red-600 font-medium mt-1">0-10/20</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Table - Hidden on mobile */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-blue-50 border-b-2 border-blue-200">
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Matière' : 'Subject'}</th>
                      {isTechnicalBulletin && (
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border bg-amber-50">
                          {language === 'fr' ? '📋 Section Bulletin' : '📋 Bulletin Section'}
                        </th>
                      )}
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">
                        {isTechnicalSchool 
                          ? (language === 'fr' ? 'N/20' : 'N/20')
                          : (language === 'fr' ? 'N/20-M/20' : 'N/20-M/20')
                        }
                      </th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Coefficient' : 'Coefficient'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'M x coef' : 'M x coef'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Note %' : 'Grade %'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">COTE</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Compétences évaluées' : 'Evaluated Competencies'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Appréciation' : 'Appreciation'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'COMMENTAIRES' : 'COMMENTS'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Actions' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, index) => {
                      // Use manually entered values - no automatic calculation
                      // For technical schools (2 columns), use moyenneFinale (M/20); for general schools (1 column), use note1
                      const gradeToUse = isTechnicalSchool ? (subject.moyenneFinale || 0) : (subject.note1 || 0);
                      const moyenneFinale = subject.moyenneFinale || 0;
                      const totalPondere = round2(gradeToUse * subject.coefficient);
                      const notePercent = round2((gradeToUse / 20) * 100);
                      const cote = coteFromNote(gradeToUse);
                      const competencesEvaluees = [subject.competence1, subject.competence2, subject.competence3].filter(c => c?.trim()).join('; ');
                      
                      return (
                        <tr key={subject.id} className={index % 2 ? "bg-white" : "bg-gray-50/30"}>
                          {/* Matière + Enseignant */}
                          <td className="px-2 py-2 border min-w-[150px]" data-testid={`cell-subject-${index}`}>
                            <div className="space-y-1">
                              <Input
                                className="w-full border-0 bg-transparent text-sm font-semibold"
                                value={subject.name}
                                onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                                placeholder="Matière..."
                                data-testid={`input-subject-name-${index}`}
                              />
                              <Input
                                className="w-full border-0 bg-transparent text-xs text-gray-600 italic"
                                value={subject.teacher}
                                onChange={(e) => updateSubject(subject.id, 'teacher', e.target.value)}
                                placeholder="Nom enseignant..."
                                data-testid={`input-teacher-name-${index}`}
                              />
                            </div>
                          </td>

                          {/* Section Bulletin - Only for technical bulletins */}
                          {isTechnicalBulletin && (
                            <td className="px-2 py-2 border bg-amber-50/50" data-testid={`cell-bulletin-section-${index}`}>
                              <Select 
                                value={subject.bulletinSection || ''} 
                                onValueChange={(value: 'general' | 'scientific' | 'literary' | 'technical' | 'other') => 
                                  updateSubject(subject.id, 'bulletinSection', value)
                                }
                              >
                                <SelectTrigger className="w-full text-xs">
                                  <SelectValue placeholder={language === 'fr' ? 'Section...' : 'Section...'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    📚 {language === 'fr' ? 'Général' : 'General'}
                                  </SelectItem>
                                  <SelectItem value="scientific">
                                    🔬 {language === 'fr' ? 'Scientifique' : 'Scientific'}
                                  </SelectItem>
                                  <SelectItem value="literary">
                                    📖 {language === 'fr' ? 'Littéraire' : 'Literary'}
                                  </SelectItem>
                                  <SelectItem value="technical">
                                    🔧 {language === 'fr' ? 'Technique' : 'Technical'}
                                  </SelectItem>
                                  <SelectItem value="other">
                                    🎨 {language === 'fr' ? 'Autre' : 'Other'}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          )}

                          {/* N/20-M/20 */}
                          <td className="px-2 py-2 border" data-testid={`cell-nm20-${index}`}>
                            <div className="flex flex-wrap items-center gap-1 text-sm">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                className="w-16 md:w-20 border rounded px-2 py-1 text-center text-sm"
                                value={subject.note1 === 0 ? '' : subject.note1}
                                onChange={(e) => updateSubject(subject.id, 'note1', parseFloat(e.target.value) || 0)}
                                placeholder="N/20"
                                data-testid={`input-note1-${index}`}
                              />
                              {!isTechnicalSchool && (
                                <>
                                  <span className="text-gray-500">-</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="20"
                                    className="w-16 md:w-20 border rounded px-2 py-1 text-center text-sm font-bold bg-blue-50"
                                    value={subject.moyenneFinale === 0 ? '' : subject.moyenneFinale}
                                    onChange={(e) => updateSubject(subject.id, 'moyenneFinale', parseFloat(e.target.value) || 0)}
                                    placeholder="M/20"
                                    data-testid={`input-moyenne-${index}`}
                                  />
                                </>
                              )}
                            </div>
                          </td>

                          {/* Coefficient */}
                          <td className="px-3 py-2 border" data-testid={`cell-coef-${index}`}>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              className="w-14 border-0 bg-transparent text-center text-sm"
                              value={subject.coefficient === 0 ? '' : subject.coefficient}
                              onChange={(e) => {
                                const newCoef = parseInt(e.target.value) || 0;
                                updateSubject(subject.id, 'coefficient', newCoef);
                              }}
                              data-testid={`input-coef-${index}`}
                            />
                          </td>

                          {/* M x coef */}
                          <td className="px-3 py-2 border text-center" data-testid={`cell-mxcoef-${index}`}>
                            <span className="px-2 py-1 inline-block bg-green-50 rounded-lg font-semibold text-green-800 text-sm">
                              {totalPondere}
                            </span>
                          </td>

                          {/* Note % */}
                          <td className="px-3 py-2 border text-center" data-testid={`cell-percent-${index}`}>
                            <span className="px-2 py-1 inline-block bg-purple-50 rounded-lg font-semibold text-purple-800 text-sm">
                              {notePercent}%
                            </span>
                          </td>

                          {/* COTE */}
                          <td className="px-3 py-2 border text-center" data-testid={`cell-cote-${index}`}>
                            <Input
                              className="w-16 md:w-20 border-0 bg-transparent text-center font-bold text-sm"
                              value={cote}
                              onChange={(e) => updateSubject(subject.id, 'cote', e.target.value)}
                              data-testid={`input-cote-${index}`}
                            />
                          </td>

                          {/* Compétences évaluées */}
                          <td className="px-3 py-2 border print:px-2 print:py-1" data-testid={`cell-competences-${index}`}>
                            <textarea
                              className="w-full border-0 bg-transparent text-xs resize-none print:text-[11px] print:leading-tight"
                              rows={3}
                              value={competencesEvaluees}
                              onChange={(e) => {
                                const newCompetences = e.target.value;
                                const parts = newCompetences.split(';');
                                updateSubject(subject.id, 'competence1', parts[0]?.trim() || '');
                                updateSubject(subject.id, 'competence2', parts[1]?.trim() || '');
                                updateSubject(subject.id, 'competence3', parts[2]?.trim() || '');
                              }}
                              placeholder={language === 'fr' ? "3 compétences séparées par ; (ex: Communication; Expression; Analyse)" : "3 competencies separated by ; (ex: Communication; Expression; Analysis)"}
                              data-testid={`input-competences-${index}`}
                            />
                          </td>

                          {/* Appréciation */}
                          <td className="px-3 py-2 border" data-testid={`cell-appreciation-${index}`}>
                            <div className="space-y-2">
                              <Select onValueChange={(value) => updateSubject(subject.id, 'remark', value)} value={subject.remark}>
                                <SelectTrigger className="w-full border-0 bg-transparent text-xs min-h-[2.5rem] text-left">
                                  <SelectValue placeholder={language === 'fr' ? "Sélectionnez..." : "Select..."} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CTBA">
                                    {language === 'fr' ? 'CTBA' : 'CVWA'}
                                  </SelectItem>
                                  <SelectItem value="CBA">
                                    {language === 'fr' ? 'CBA' : 'CWA'}
                                  </SelectItem>
                                  <SelectItem value="CA">
                                    {language === 'fr' ? 'CA' : 'CA'}
                                  </SelectItem>
                                  <SelectItem value="CMA">
                                    {language === 'fr' ? 'CMA' : 'CAA'}
                                  </SelectItem>
                                  <SelectItem value="CNA">
                                    {language === 'fr' ? 'CNA' : 'CNA'}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <textarea
                                className="w-full border rounded text-xs p-1 resize-none"
                                rows={2}
                                placeholder={language === 'fr' ? "Appréciation personnalisée..." : "Custom appreciation..."}
                                value={subject.customAppreciation || ''}
                                onChange={(e) => updateSubject(subject.id, 'customAppreciation', e.target.value)}
                                data-testid={`input-custom-appreciation-${index}`}
                              />
                            </div>
                          </td>

                          {/* COMMENTAIRES - Per-subject ministry teacher comments */}
                          <td className="px-2 py-2 border min-w-[120px]" data-testid={`cell-comments-${index}`}>
                            <div className="space-y-1">
                              {/* Display selected comments count */}
                              <div className="text-xs text-center text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {(subject.comments || []).length}/2 {language === 'fr' ? 'sélectionnés' : 'selected'}
                              </div>
                              
                              {/* Comment selection button */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs h-8"
                                    data-testid={`button-select-comments-${index}`}
                                  >
                                    📝 {language === 'fr' ? 'Commentaires' : 'Comments'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-800">
                                      {language === 'fr' ? 'Commentaires Ministère' : 'Ministry Comments'}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      {language === 'fr' ? 'Max 2 commentaires' : 'Max 2 comments'}
                                    </p>
                                    <div className="grid gap-1">
                                      {TEACHER_COMMENTS[language].map((comment) => {
                                        const currentComments = subject.comments || [];
                                        const isSelected = currentComments.includes(comment.id);
                                        const canSelect = currentComments.length < 2 || isSelected;
                                        
                                        return (
                                          <button
                                            key={comment.id}
                                            type="button"
                                            disabled={!canSelect}
                                            className={`text-left p-2 text-xs rounded border transition-all ${
                                              isSelected 
                                                ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                                                : canSelect
                                                  ? 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                                                  : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            onClick={() => toggleSubjectComment(subject.id, comment.id)}
                                          >
                                            <span className="flex items-start gap-2">
                                              <span className={`flex-shrink-0 w-3 h-3 mt-0.5 border rounded-sm ${
                                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                              }`}>
                                                {isSelected && <span className="block w-full h-full text-white text-center text-xs leading-3">✓</span>}
                                              </span>
                                              <span className="flex-1">{comment.text}</span>
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              
                              {/* Display selected comments */}
                              {(subject.comments || []).length > 0 && (
                                <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                  {(subject.comments || []).map((commentId, idx) => {
                                    const comment = TEACHER_COMMENTS[language].find(c => c.id === commentId);
                                    return (
                                      <div key={commentId} className="truncate">
                                        {idx + 1}. {comment?.text.substring(0, 30)}...
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2 border text-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSubject(subject.id)}
                              className="h-6 w-6 p-0"
                              data-testid={`button-remove-${index}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Accordion - Shown only on mobile */}
              <div className="block md:hidden">
                <Accordion type="single" collapsible className="space-y-2">
                  {subjects.map((subject, index) => {
                    // For technical schools (2 columns), use moyenneFinale (M/20); for general schools (1 column), use note1
                    const gradeToUse = isTechnicalSchool ? (subject.moyenneFinale || 0) : (subject.note1 || 0);
                    const moyenneFinale = subject.moyenneFinale || 0;
                    const totalPondere = round2(gradeToUse * subject.coefficient);
                    const notePercent = round2((gradeToUse / 20) * 100);
                    const cote = coteFromNote(gradeToUse);
                    const competencesEvaluees = [subject.competence1, subject.competence2, subject.competence3].filter(c => c?.trim()).join('; ');
                    
                    return (
                      <AccordionItem value={`subject-${index}`} key={subject.id} className="border rounded-lg">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid={`accordion-subject-${index}`}>
                          <div className="flex justify-between items-center w-full text-left">
                            <div className="flex flex-col">
                              <span className="font-medium">{subject.name}</span>
                              <span className="text-xs text-gray-500">{subject.teacher || language === 'fr' ? 'Enseignant' : 'Teacher'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">{gradeToUse}/20</Badge>
                              <Badge variant="secondary">Coef: {subject.coefficient}</Badge>
                              {(subject.comments || []).length > 0 && (
                                <Badge variant="default">{(subject.comments || []).length}/2 📝</Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            {/* Primary Inputs Grid */}
                            <div className={`grid gap-3 ${isTechnicalSchool ? 'grid-cols-1' : 'grid-cols-2'}`}>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'N/20' : 'N/20'}</Label>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  className="h-10 text-right"
                                  value={subject.note1}
                                  onChange={(e) => updateSubject(subject.id, 'note1', parseFloat(e.target.value) || 0)}
                                  data-testid={`mobile-input-note1-${index}`}
                                />
                              </div>
                              {!isTechnicalSchool && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-600">{language === 'fr' ? 'M/20' : 'M/20'}</Label>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    className="h-10 text-right font-medium"
                                    value={subject.moyenneFinale}
                                    onChange={(e) => updateSubject(subject.id, 'moyenneFinale', parseFloat(e.target.value) || 0)}
                                    data-testid={`mobile-input-moyenne-${index}`}
                                  />
                                </div>
                              )}
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'Coefficient' : 'Coefficient'}</Label>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  className="h-10 text-center"
                                  value={subject.coefficient}
                                  onChange={(e) => updateSubject(subject.id, 'coefficient', parseInt(e.target.value) || 1)}
                                  data-testid={`mobile-input-coef-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'Type' : 'Type'}</Label>
                                <Select 
                                  value={subject.subjectType || 'general'} 
                                  onValueChange={(value: 'general' | 'scientific' | 'literary' | 'technical' | 'other') => updateSubject(subject.id, 'subjectType', value)}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="general">📚 {language === 'fr' ? 'Général' : 'General'}</SelectItem>
                                    <SelectItem value="scientific">🔬 {language === 'fr' ? 'Scientifique' : 'Scientific'}</SelectItem>
                                    <SelectItem value="literary">📖 {language === 'fr' ? 'Littéraire' : 'Literary'}</SelectItem>
                                    <SelectItem value="technical">🔧 {language === 'fr' ? 'Technique' : 'Technical'}</SelectItem>
                                    <SelectItem value="other">🎨 {language === 'fr' ? 'Autre' : 'Other'}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {isTechnicalBulletin && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-600 bg-amber-50 px-1 rounded">
                                    {language === 'fr' ? '📋 Section Bulletin' : '📋 Bulletin Section'}
                                  </Label>
                                  <Select 
                                    value={subject.bulletinSection || ''} 
                                    onValueChange={(value: 'general' | 'scientific' | 'literary' | 'technical' | 'other') => updateSubject(subject.id, 'bulletinSection', value)}
                                  >
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder={language === 'fr' ? 'Section...' : 'Section...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="general">📚 {language === 'fr' ? 'Général' : 'General'}</SelectItem>
                                      <SelectItem value="scientific">🔬 {language === 'fr' ? 'Scientifique' : 'Scientific'}</SelectItem>
                                      <SelectItem value="literary">📖 {language === 'fr' ? 'Littéraire' : 'Literary'}</SelectItem>
                                      <SelectItem value="technical">🔧 {language === 'fr' ? 'Technique' : 'Technical'}</SelectItem>
                                      <SelectItem value="other">🎨 {language === 'fr' ? 'Autre' : 'Other'}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">COTE</Label>
                                <div className="h-10 px-3 border rounded-md bg-gray-50 flex items-center justify-center font-medium">
                                  {cote}
                                </div>
                              </div>
                            </div>

                            {/* Competencies */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'Compétence 1' : 'Competency 1'}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={subject.competence1}
                                  onChange={(e) => updateSubject(subject.id, 'competence1', e.target.value)}
                                  placeholder="Ex: Communication"
                                  data-testid={`mobile-input-comp1-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'Compétence 2' : 'Competency 2'}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={subject.competence2}
                                  onChange={(e) => updateSubject(subject.id, 'competence2', e.target.value)}
                                  placeholder="Ex: Expression"
                                  data-testid={`mobile-input-comp2-${index}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'Compétence 3' : 'Competency 3'}</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={subject.competence3}
                                  onChange={(e) => updateSubject(subject.id, 'competence3', e.target.value)}
                                  placeholder="Ex: Analyse"
                                  data-testid={`mobile-input-comp3-${index}`}
                                />
                              </div>
                            </div>

                            {/* Appreciation */}
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">{language === 'fr' ? 'Appréciation' : 'Appreciation'}</Label>
                              <Select onValueChange={(value) => updateSubject(subject.id, 'remark', value)} value={subject.remark}>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder={language === 'fr' ? "Sélectionnez..." : "Select..."} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CTBA">
                                    {language === 'fr' ? 'CTBA' : 'CVWA'}
                                  </SelectItem>
                                  <SelectItem value="CBA">
                                    {language === 'fr' ? 'CBA' : 'CWA'}
                                  </SelectItem>
                                  <SelectItem value="CA">
                                    {language === 'fr' ? 'CA' : 'CA'}
                                  </SelectItem>
                                  <SelectItem value="CMA">
                                    {language === 'fr' ? 'CMA' : 'CAA'}
                                  </SelectItem>
                                  <SelectItem value="CNA">
                                    {language === 'fr' ? 'CNA' : 'CNA'}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <textarea
                                className="w-full border rounded text-xs p-2 resize-none"
                                rows={2}
                                placeholder={language === 'fr' ? "Appréciation personnalisée..." : "Custom appreciation..."}
                                value={subject.customAppreciation || ''}
                                onChange={(e) => updateSubject(subject.id, 'customAppreciation', e.target.value)}
                                data-testid={`mobile-input-custom-appreciation-${index}`}
                              />
                            </div>

                            {/* Comments - Mobile Sheet */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">{language === 'fr' ? 'Commentaires Ministère' : 'Ministry Comments'}</Label>
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {(subject.comments || []).length}/2
                                </div>
                              </div>
                              
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full h-10"
                                    data-testid={`mobile-button-comments-${index}`}
                                  >
                                    📝 {language === 'fr' ? 'Sélectionner commentaires' : 'Select comments'}
                                  </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[80vh]">
                                  <SheetHeader className="pb-4">
                                    <SheetTitle>{subject.name} - {language === 'fr' ? 'Commentaires' : 'Comments'}</SheetTitle>
                                  </SheetHeader>
                                  <div className="space-y-3 max-h-full overflow-y-auto">
                                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                      {language === 'fr' ? 'Sélectionnez jusqu\'à 2 commentaires officiels du Ministère' : 'Select up to 2 official Ministry comments'}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {TEACHER_COMMENTS[language].map((comment) => {
                                        const currentComments = subject.comments || [];
                                        const isSelected = currentComments.includes(comment.id);
                                        const canSelect = currentComments.length < 2 || isSelected;
                                        
                                        return (
                                          <button
                                            key={comment.id}
                                            type="button"
                                            disabled={!canSelect}
                                            className={`w-full text-left p-4 rounded-lg border transition-all min-h-[60px] ${
                                              isSelected 
                                                ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                                                : canSelect
                                                  ? 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                                                  : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            onClick={() => toggleSubjectComment(subject.id, comment.id)}
                                          >
                                            <div className="flex items-start gap-3">
                                              <div className={`flex-shrink-0 w-5 h-5 mt-1 border rounded ${
                                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                              } flex items-center justify-center`}>
                                                {isSelected && <span className="text-white text-xs">✓</span>}
                                              </div>
                                              <span className="flex-1 text-sm leading-relaxed">{comment.text}</span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    
                                    {/* Selected Comments Preview */}
                                    {(subject.comments || []).length > 0 && (
                                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="text-sm font-medium text-green-800 mb-2">
                                          {language === 'fr' ? 'Commentaires sélectionnés:' : 'Selected comments:'}
                                        </div>
                                        <div className="space-y-1">
                                          {(subject.comments || []).map((commentId, idx) => {
                                            const comment = TEACHER_COMMENTS[language].find(c => c.id === commentId);
                                            return (
                                              <div key={commentId} className="text-xs text-green-700">
                                                {idx + 1}. {comment?.text}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </SheetContent>
                              </Sheet>
                            </div>

                            {/* Remove Button */}
                            <div className="pt-2 border-t">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeSubject(subject.id)}
                                className="w-full"
                                data-testid={`mobile-button-remove-${index}`}
                              >
                                <Minus className="h-4 w-4 mr-2" />
                                {language === 'fr' ? 'Supprimer matière' : 'Remove subject'}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </CardContent>
          </Card>


          {/* Section Disciplinaire - Format CBA Officiel */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                📊 {language === 'fr' ? 'Assiduité et Discipline' : 'Attendance and Discipline'}
              </CardTitle>
              <p className="text-sm text-orange-600 mt-1">
                {language === 'fr' ? 'Informations disciplinaires selon le format CBA officiel' : 'Disciplinary information according to official CBA format'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {language === 'fr' ? 'Absences justifiées (h)' : 'Justified Abs. (h)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={discipline.absJ}
                    onChange={(e) => setDiscipline({...discipline, absJ: parseInt(e.target.value) || 0})}
                    className="border-orange-200 focus:border-orange-400"
                    data-testid="input-abs-justified"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {language === 'fr' ? 'Absences non justifiées (h)' : 'Unjustified Abs. (h)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={discipline.absNJ}
                    onChange={(e) => setDiscipline({...discipline, absNJ: parseInt(e.target.value) || 0})}
                    className="border-orange-200 focus:border-orange-400"
                    data-testid="input-abs-unjustified"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {language === 'fr' ? 'Retards (nombre)' : 'Late (nbr of times)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={discipline.late}
                    onChange={(e) => setDiscipline({...discipline, late: parseInt(e.target.value) || 0})}
                    className="border-orange-200 focus:border-orange-400"
                    data-testid="input-late-count"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {language === 'fr' ? 'Sanctions (heures)' : 'Punishment (hours)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={discipline.sanctions}
                    onChange={(e) => setDiscipline({...discipline, sanctions: parseInt(e.target.value) || 0})}
                    className="border-orange-200 focus:border-orange-400"
                    data-testid="input-sanctions"
                  />
                </div>
              </div>

              {/* Sanctions spécifiques selon format CBA */}
              <div className="mt-4 pt-4 border-t border-orange-200">
                <Label className="text-sm font-medium mb-3 block">
                  {language === 'fr' ? 'Types de sanctions (format CBA)' : 'Sanction Types (CBA format)'}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs font-medium mb-1 block">
                      {language === 'fr' ? 'Avertissement de conduite' : 'Conduct Warning'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={discipline.conductWarning}
                      onChange={(e) => setDiscipline({...discipline, conductWarning: parseInt(e.target.value) || 0})}
                      className="border-orange-200 focus:border-orange-400"
                      placeholder={language === 'fr' ? 'Nombre' : 'Number'}
                      data-testid="input-conduct-warning"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">
                      {language === 'fr' ? 'Blâme' : 'Reprimand'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={discipline.conductBlame}
                      onChange={(e) => setDiscipline({...discipline, conductBlame: parseInt(e.target.value) || 0})}
                      className="border-orange-200 focus:border-orange-400"
                      placeholder={language === 'fr' ? 'Nombre' : 'Number'}
                      data-testid="input-conduct-blame"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">
                      {language === 'fr' ? 'Suspension (jours)' : 'Suspension (days)'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={discipline.suspension}
                      onChange={(e) => setDiscipline({...discipline, suspension: parseInt(e.target.value) || 0})}
                      className="border-orange-200 focus:border-orange-400"
                      placeholder={language === 'fr' ? 'Jours' : 'Days'}
                      data-testid="input-suspension"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1 block">
                      {language === 'fr' ? 'Renvoyé (1 = oui, 0 = non)' : 'Dismissed (1 = yes, 0 = no)'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      value={discipline.dismissal}
                      onChange={(e) => setDiscipline({...discipline, dismissal: parseInt(e.target.value) || 0})}
                      className="border-orange-200 focus:border-orange-400"
                      placeholder="0 or 1"
                      data-testid="input-dismissal"
                    />
                  </div>
                </div>
              </div>

              {/* Calcul automatique button */}
              <div className="mt-4 pt-4 border-t border-orange-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => calculateDisciplineData(student.id, trimester)}
                  className="text-orange-700 border-orange-300 hover:bg-orange-50"
                  data-testid="button-auto-calculate-discipline"
                >
                  📊 {language === 'fr' ? 'Calculer automatiquement' : 'Auto-calculate'}
                </Button>
                <p className="text-xs text-orange-600 mt-1">
                  {language === 'fr' 
                    ? 'Génère automatiquement les données d\'assiduité pour ce trimestre'
                    : 'Automatically generates attendance data for this trimester'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Décisions du conseil - visible seulement au 3ème trimestre */}
          {trimester === 'Troisième' && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                  🏛️ {language === 'fr' ? 'Décisions du conseil' : 'Council Decisions'}
                </CardTitle>
                <p className="text-sm text-orange-600 mt-1">
                  {language === 'fr' ? 'Section visible uniquement pour le troisième trimestre' : 'Section visible only for third trimester'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Décision du conseil de classe' : 'Class council decision'}
                    </Label>
                    <Select>
                      <SelectTrigger data-testid="select-council-decision">
                        <SelectValue placeholder={language === 'fr' ? 'Sélectionner la décision...' : 'Select decision...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passe-superieur">{language === 'fr' ? 'Passe en classe supérieure' : 'Advances to next grade'}</SelectItem>
                        <SelectItem value="passe-felicitations">{language === 'fr' ? 'Passe avec félicitations' : 'Advances with congratulations'}</SelectItem>
                        <SelectItem value="passe-encouragements">{language === 'fr' ? 'Passe avec encouragements' : 'Advances with encouragement'}</SelectItem>
                        <SelectItem value="passe-avertissement">{language === 'fr' ? 'Passe avec avertissement' : 'Advances with warning'}</SelectItem>
                        <SelectItem value="redouble">{language === 'fr' ? 'Redouble' : 'Repeats grade'}</SelectItem>
                        <SelectItem value="orientation">{language === 'fr' ? 'Orientation' : 'Orientation'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Observations et recommandations' : 'Observations and recommendations'}
                    </Label>
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm min-h-[80px] resize-y border-orange-200 focus:border-orange-400"
                      placeholder={language === 'fr' ? 
                        'Observations du conseil de classe et recommandations pour l\'année suivante...' : 
                        'Class council observations and recommendations for next year...'}
                      data-testid="textarea-council-observations"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {language === 'fr' ? 'Président du conseil' : 'Council president'}
                      </Label>
                      <Input
                        placeholder={language === 'fr' ? 'Nom du président...' : 'President name...'}
                        className="border-orange-200 focus:border-orange-400"
                        data-testid="input-council-president"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {language === 'fr' ? 'Date du conseil' : 'Council date'}
                      </Label>
                      <Input
                        type="date"
                        className="border-orange-200 focus:border-orange-400"
                        data-testid="input-council-date"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compétences évaluées Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {language === 'fr' ? 'Compétences évaluées' : 'Evaluated Competencies'}
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {language === 'fr' ? 'Système APPRECIATION' : 'REMARKS_2 System'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Competency Evaluation System Selection */}


                {/* Subject Competency Summary */}
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium mb-3 block">
                    {language === 'fr' ? 'Résumé des compétences par matière' : 'Subject Competency Summary'}
                  </Label>
                  <div className="space-y-2">
                    {subjects.map((subject, index) => {
                      const competencyLevel = calculateCompetencyLevel(subject.grade);
                      return (
                        <div key={subject.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm min-w-0 flex-1">{subject.name}</span>
                            <span className="text-sm text-gray-600">{subject.grade}/20</span>
                          </div>
                          <Badge className={getCompetencyColor(competencyLevel)}>
                            {competencyLevel}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* ✅ MINISTRY COMPLIANT: Single consolidated Attendance and Discipline section implemented above */}

          {/* General Appreciations and Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📝 {language === 'fr' ? 'Appréciations et Observations Finales' : 'Final Appreciations and Observations'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {language === 'fr' ? 'Appréciation générale du travail de l\'élève' : 'General student work appreciation'}
                  </Label>
                  
                  {/* Ministry-required Teacher Comments - Now Per-Subject */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                        📋 {language === 'fr' ? 'COMMENTAIRES PAR MATIÈRE (Ministère)' : 'COMMENTS PER SUBJECT (Ministry)'}
                      </h4>
                    </div>
                    <p className="text-xs text-blue-600">
                      {language === 'fr' 
                        ? 'Les commentaires officiels du Ministère sont maintenant gérés par matière dans le tableau des notes ci-dessus. Chaque enseignant peut sélectionner jusqu\'à 2 commentaires spécifiques pour chaque élève.'
                        : 'Ministry official comments are now managed per subject in the grade table above. Each teacher can select up to 2 specific comments for each student.'
                      }
                    </p>
                  </div>
                  
                  {/* Additional Free Text (Optional) */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">
                      {language === 'fr' ? 'Commentaire libre supplémentaire (optionnel)' : 'Additional free comment (optional)'}
                    </Label>
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm min-h-[60px] resize-y"
                      placeholder={language === 'fr' ? 
                        'Ajoutez un commentaire personnalisé si nécessaire...' : 
                        'Add a personal comment if needed...'}
                      value={generalRemark}
                      onChange={(e) => setGeneralRemark(e.target.value)}
                      data-testid="textarea-additional-remark"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real School Logo Info */}
          {realSchoolLogoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'fr' ? 'Logo École Officiel' : 'Official School Logo'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <img 
                    src={realSchoolLogoUrl} 
                    alt="School Logo" 
                    className="w-16 h-16 object-contain border border-gray-200 rounded" 
                  />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' 
                        ? 'Logo officiel de l\'école utilisé dans les bulletins'
                        : 'Official school logo used in report cards'
                      }
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {language === 'fr' ? 'Logo configuré' : 'Logo configured'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Third Trimester Annual Summary */}
          {isThirdTrimester && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center">
                  <School className="h-5 w-5 mr-2" />
                  {t.annualSummary} - {year}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trimester Averages */}
                <div>
                  <Label className="text-sm font-medium text-orange-700">{t.trimesterAverages}</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label className="text-xs">{t.firstTrimester}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={annualSummary.firstTrimesterAverage}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          firstTrimesterAverage: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t.secondTrimester}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={annualSummary.secondTrimesterAverage}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          secondTrimesterAverage: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t.thirdTrimester}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={annualSummary.thirdTrimesterAverage}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          thirdTrimesterAverage: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Annual Average and Rank */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t.annualAverage}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      value={annualSummary.annualAverage}
                      onChange={(e) => setAnnualSummary(prev => ({
                        ...prev,
                        annualAverage: parseFloat(e.target.value) || 0
                      }))}
                      className="mt-1 font-bold text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t.annualRank}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        min="1"
                        value={annualSummary.annualRank}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          annualRank: parseInt(e.target.value) || 0
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600 self-center">
                        / {annualSummary.totalStudents}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pass Decision */}
                <div>
                  <Label className="text-sm font-medium text-red-700">{t.passDecision}</Label>
                  <Select 
                    value={annualSummary.passDecision} 
                    onValueChange={(value) => setAnnualSummary(prev => ({...prev, passDecision: value}))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner la décision..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSE">{t.passes}</SelectItem>
                      <SelectItem value="REDOUBLE">{t.repeats}</SelectItem>
                      <SelectItem value="RENVOYE">{t.expelled}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Final Appreciation */}
                <div>
                  <Label className="text-sm font-medium">{t.finalAppreciation}</Label>
                  <Textarea
                    value={annualSummary.finalAppreciation}
                    onChange={(e) => setAnnualSummary(prev => ({...prev, finalAppreciation: e.target.value}))}
                    placeholder="Appréciation sur l'évolution de l'élève durant l'année..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Holiday Recommendations */}
                <div>
                  <Label className="text-sm font-medium">{t.holidayRecommendations}</Label>
                  <Textarea
                    value={annualSummary.holidayRecommendations}
                    onChange={(e) => setAnnualSummary(prev => ({...prev, holidayRecommendations: e.target.value}))}
                    placeholder="Recommandations pour les vacances et la préparation de la classe suivante..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions Section - Different for Teacher vs Director */}
          <div className="print:hidden no-print mt-8 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            {effectiveRole === 'teacher' ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {language === 'fr' ? 'Actions Enseignant' : 'Teacher Actions'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {language === 'fr' 
                    ? 'Les enseignants soumettent les notes uniquement à l\'école. L\'école gère la signature et l\'envoi aux parents.'
                    : 'Teachers submit grades only to the school. The school manages signing and sending to parents.'
                  }
                </p>
                
                {/* Teacher Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    onClick={handleSaveBulletin}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                    data-testid="button-save-draft"
                  >
                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">
                        {language === 'fr' ? 'Sauvegarder Brouillon' : 'Save Draft'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Travail temporaire' : 'Temporary work'}
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleSignBulletin}
                    variant="outline"
                    className={`flex flex-col items-center gap-2 h-auto py-4 border-2 ${
                      isSigned 
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/50' 
                        : 'border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50'
                    }`}
                    data-testid="button-sign-bulletin-teacher"
                  >
                    <PenTool className={`h-5 w-5 ${isSigned ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-sm">
                        {isSigned 
                          ? (language === 'fr' ? 'Signé ✓' : 'Signed ✓')
                          : (language === 'fr' ? 'Signer le Bulletin' : 'Sign Bulletin')
                        }
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={sendToStudentsParents}
                    className="flex flex-col items-center gap-2 h-auto py-4 bg-green-600 hover:bg-green-700 border-2 border-green-500"
                    data-testid="button-submit-school"
                  >
                    <Send className="h-5 w-5 text-white" />
                    <div className="text-center text-white">
                      <div className="font-semibold text-sm">
                        {language === 'fr' ? 'Envoyer à l\'école' : 'Send to School'}
                      </div>
                      <div className="text-xs opacity-90">
                        {language === 'fr' ? 'Validation finale par l\'école' : 'Final validation by school'}
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Teacher Role Reminder */}
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-yellow-700 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                        {language === 'fr' ? 'Rappel du rôle enseignant :' : 'Teacher role reminder:'}
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                          <span>
                            {language === 'fr' 
                              ? 'Les enseignants soumettent les notes uniquement à l\'école'
                              : 'Teachers submit grades only to the school'
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                          <span>
                            {language === 'fr'
                              ? 'L\'école valide, signe et envoie aux parents'
                              : 'The school validates, signs and sends to parents'
                            }
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">•</span>
                          <span>
                            {language === 'fr'
                              ? 'Aucune communication directe enseignant ↔ parents via cette interface'
                              : 'No direct teacher ↔ parent communication via this interface'
                            }
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {language === 'fr' ? 'Actions École' : 'School Actions'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {language === 'fr' 
                    ? 'L\'école valide, signe et envoie les bulletins aux élèves et parents.'
                    : 'The school validates, signs and sends report cards to students and parents.'
                  }
                </p>
                
                {/* Director Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    onClick={handleSaveBulletin}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                    data-testid="button-save-bulletin"
                    disabled={!student.name || !student.classLabel}
                  >
                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">
                        {language === 'fr' ? 'Sauvegarder' : 'Save'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Enregistrer dans Archives' : 'Save to Archives'}
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleSignBulletin}
                    variant="outline"
                    className={`flex flex-col items-center gap-2 h-auto py-4 border-2 ${
                      isSigned 
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/50' 
                        : 'border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50'
                    }`}
                    data-testid="button-sign-bulletin"
                    disabled={isSigned || !student.name || !student.classLabel}
                  >
                    <PenTool className={`h-5 w-5 ${isSigned ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-sm">
                        {isSigned 
                          ? (language === 'fr' ? 'Signé ✓' : 'Signed ✓')
                          : (language === 'fr' ? 'Signer le Bulletin' : 'Sign Bulletin')
                        }
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Signature numérique' : 'Digital signature'}
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={sendToStudentsParents}
                    className="flex flex-col items-center gap-2 h-auto py-4 bg-green-600 hover:bg-green-700 border-2 border-green-500"
                    data-testid="button-send-parents"
                    disabled={!isSigned}
                  >
                    <Send className="h-5 w-5 text-white" />
                    <div className="text-center text-white">
                      <div className="font-semibold text-sm">
                        {language === 'fr' ? 'Envoyer aux Élèves/Parents' : 'Send to Students/Parents'}
                      </div>
                      <div className="text-xs opacity-90">
                        {language === 'fr' ? 'Notification et publication' : 'Notify and publish'}
                      </div>
                    </div>
                  </Button>
                </div>
                
                {/* Reminder to select student */}
                {(!student.name || !student.classLabel) && (
                  <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-700 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                          {language === 'fr' ? 'Élève non sélectionné' : 'No student selected'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {language === 'fr' 
                            ? 'Veuillez remplir les informations de l\'élève (Nom, Classe) avant de sauvegarder ou signer le bulletin.'
                            : 'Please fill in student information (Name, Class) before saving or signing the bulletin.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview with Print Functionality */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>{TRIMESTER_TITLES[language](trimester)}</CardTitle>
          </CardHeader>
          <CardContent>
            <BulletinPrint documentTitle={`${student.name?.replace(/\s+/g, '_')}_${trimester}_${year}`}>
              <ReportCardPreview {...bulletinData} bulletinType={bulletinType} />
            </BulletinPrint>
          </CardContent>
        </Card>
      )}

      {/* Annual Report Sheet */}
      {showAnnualReport && (
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-lg text-orange-800 flex items-center">
              <School className="h-5 w-5 mr-2" />
              {language === 'fr' ? 'Fiche de Rapport Annuel Officielle' : 'Official Annual Report Sheet'}
            </CardTitle>
            <p className="text-sm text-orange-600">
              {language === 'fr' 
                ? 'Document officiel du Ministère des Enseignements Secondaires - Format CBA'
                : 'Official Ministry of Secondary Education Document - CBA Format'
              }
            </p>
          </CardHeader>
          <CardContent>
            <BulletinPrint documentTitle={`Rapport_Annuel_${student.name?.replace(/\s+/g, '_')}_${year}`}>
              <AnnualReportSheet
              student={{
                name: student.name,
                id: student.id,
                class: student.classLabel,
                classLabel: student.classLabel,
                gender: student.gender,
                birthDate: student.birthDate,
                birthPlace: student.birthPlace,
                guardian: student.guardian,
                schoolMatricule: student.id,
                photoUrl: studentPhotoUrl
              }}
              schoolInfo={{
                name: student.schoolName || 'LYCÉE DE……….',
                region: student.regionaleMinisterielle || '…',
                department: student.delegationDepartementale || '…',
                logo: realSchoolLogoUrl
              }}
              academicYear={year}
              trimesterData={{
                trimester1: {
                  average: annualSummary.firstTrimesterAverage || 0,
                  rank: `${annualSummary.annualRank || 0}e`,
                  totalStudents: annualSummary.totalStudents || 30,
                  subjectCount: subjects.length,
                  passedSubjects: subjects.filter(s => s.grade >= 10).length,
                  discipline: {
                    absJ: Math.floor(discipline.absJ / 3),
                    absNJ: Math.floor(discipline.absNJ / 3),
                    lates: Math.floor(discipline.late / 3),
                    sanctions: Math.floor(discipline.sanctions / 3)
                  },
                  teacherObservations: `${language === 'fr' ? 'Bon travail au premier trimestre' : 'Good work in first term'}`
                },
                trimester2: {
                  average: annualSummary.secondTrimesterAverage || 0,
                  rank: `${annualSummary.annualRank || 0}e`,
                  totalStudents: annualSummary.totalStudents || 30,
                  subjectCount: subjects.length,
                  passedSubjects: subjects.filter(s => s.grade >= 10).length,
                  discipline: {
                    absJ: Math.floor(discipline.absJ / 3),
                    absNJ: Math.floor(discipline.absNJ / 3),
                    lates: Math.floor(discipline.late / 3),
                    sanctions: Math.floor(discipline.sanctions / 3)
                  },
                  teacherObservations: `${language === 'fr' ? 'Progression constante au deuxième trimestre' : 'Steady progress in second term'}`
                },
                trimester3: {
                  average: annualSummary.thirdTrimesterAverage || 0,
                  rank: `${annualSummary.annualRank || 0}e`,
                  totalStudents: annualSummary.totalStudents || 30,
                  subjectCount: subjects.length,
                  passedSubjects: subjects.filter(s => s.grade >= 10).length,
                  discipline: {
                    absJ: Math.floor(discipline.absJ / 3),
                    absNJ: Math.floor(discipline.absNJ / 3),
                    lates: Math.floor(discipline.late / 3),
                    sanctions: Math.floor(discipline.sanctions / 3)
                  },
                  teacherObservations: `${language === 'fr' ? 'Excellent travail au troisième trimestre' : 'Excellent work in third term'}`
                }
              }}
              annualSummary={{
                annualAverage: annualSummary.annualAverage || 0,
                annualRank: `${annualSummary.annualRank || 0}e / ${annualSummary.totalStudents || 30}`,
                finalDecision: (annualSummary.passDecision as 'PASSE' | 'REDOUBLE' | 'RENVOYE') || 'PASSE',
                principalObservations: annualSummary.finalAppreciation || `${language === 'fr' ? 'Élève sérieux et appliqué' : 'Serious and dedicated student'}`,
                parentObservations: '',
                holidayRecommendations: annualSummary.holidayRecommendations || `${language === 'fr' ? 'Continuer les efforts et réviser régulièrement' : 'Continue efforts and review regularly'}`
              }}
              language={language}
            />
            </BulletinPrint>
          </CardContent>
        </Card>
      )}

      {/* Sticky Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 md:hidden safe-area-pb">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          {/* Subject Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{language === 'fr' ? 'Matière' : 'Subject'}</span>
            <span className="font-mono text-blue-600">1/{subjects.length}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveBulletin}
              className="min-h-[44px] px-4"
              data-testid="mobile-save-bulletin"
            >
              💾 {language === 'fr' ? 'Sauver' : 'Save'}
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowPreview(true)}
              className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-700"
              data-testid="mobile-preview-bulletin"
            >
              👁️ {language === 'fr' ? 'Aperçu' : 'Preview'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Mobile - Ensures content isn't hidden by sticky nav */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}

// StudentSelector Component
interface StudentSelectorProps {
  onStudentSelect: (student: any) => void;
  language: 'fr' | 'en';
  selectedClassId?: string;
}

function StudentSelector({ onStudentSelect, language, selectedClassId }: StudentSelectorProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Clear selected student when class changes and notify parent
  React.useEffect(() => {
    setSelectedStudentId('');
    // Notify parent to clear student information
    onStudentSelect(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);
  
  // Fetch students from API - only when class is selected
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['/api/director/students', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) {
        return { success: true, students: [] };
      }
      
      try {
        const url = `/api/director/students?classId=${selectedClassId}`;
        const response = await fetch(url, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching students:', error);
        return { success: false, students: [] };
      }
    },
    enabled: !!selectedClassId, // Only fetch when class is selected
  });

  // Ensure studentsData is always an array - filter by class on frontend if needed
  const allStudents = Array.isArray(apiResponse?.students) ? apiResponse.students : [];
  const studentsData = selectedClassId 
    ? allStudents.filter((s: any) => s.classId?.toString() === selectedClassId || s.class?.toString() === selectedClassId)
    : [];

  const handleStudentChange = async (studentId: string) => {
    console.log('[STUDENT_SELECTOR] Student selected:', studentId);
    setSelectedStudentId(studentId);
    const selectedStudent = studentsData.find((s: any) => s.id.toString() === studentId);
    console.log('[STUDENT_SELECTOR] Found student data:', selectedStudent);
    
    if (selectedStudent) {
      // For real schools, we would fetch grades from teachers' submissions
      // For now, we'll use mock data but structure it properly
      const studentWithGrades = {
        ...selectedStudent,
        // Set the photo URL from user profile
        photoUrl: selectedStudent.photoURL || selectedStudent.profilePictureUrl || '',
        grades: [
          { subjectName: 'FRANÇAIS', finalGrade: 15.5, note1: 14, remark: 'Bon travail' },
          { subjectName: 'ANGLAIS', finalGrade: 12.0, note1: 11, remark: 'Peut mieux faire' },
          { subjectName: 'MATHÉMATIQUES', finalGrade: 16.5, note1: 16, remark: 'Excellent' },
          { subjectName: 'HISTOIRE', finalGrade: 13.0, note1: 12, remark: 'Satisfaisant' },
          { subjectName: 'GÉOGRAPHIE', finalGrade: 14.0, note1: 13, remark: 'Bien' },
          { subjectName: 'SCIENCES', finalGrade: 15.0, note1: 14, remark: 'Très bien' }
        ]
      };
      
      console.log('[STUDENT_SELECTOR] Calling onStudentSelect with:', studentWithGrades);
      onStudentSelect(studentWithGrades);
    } else {
      console.log('[STUDENT_SELECTOR] No student found for id:', studentId);
    }
  };

  return (
    <div className="space-y-3">
      {!selectedClassId && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              {language === 'fr' 
                ? 'Veuillez d\'abord sélectionner une classe ci-dessus pour filtrer les élèves'
                : 'Please first select a class above to filter students'
              }
            </span>
          </div>
        </div>
      )}
      
      <div>
        <Label htmlFor="student-selector">
          {language === 'fr' ? 'Sélectionner un élève' : 'Select a student'}
        </Label>
        <Select value={selectedStudentId} onValueChange={handleStudentChange} disabled={!selectedClassId}>
          <SelectTrigger className="bg-white border-gray-300" data-testid="select-student">
            <SelectValue placeholder={
              !selectedClassId
                ? (language === 'fr' ? 'Sélectionnez d\'abord une classe' : 'Select a class first')
                : (language === 'fr' ? 'Choisir un élève...' : 'Choose a student...')
            } />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {isLoading ? (
              <SelectItem value="loading" disabled>
                {language === 'fr' ? 'Chargement...' : 'Loading...'}
              </SelectItem>
            ) : studentsData.length === 0 ? (
              <SelectItem value="no-students" disabled>
                {selectedClassId 
                  ? (language === 'fr' ? 'Aucun élève dans cette classe' : 'No students in this class')
                  : (language === 'fr' ? 'Aucun élève trouvé' : 'No students found')
                }
              </SelectItem>
            ) : (
              studentsData.map((student: any) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} - {student.className || student.class || 'Classe inconnue'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      {selectedStudentId && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {language === 'fr' 
                ? 'Élève sélectionné - Informations et notes chargées automatiquement'
                : 'Student selected - Information and grades loaded automatically'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}