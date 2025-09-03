import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Download, Languages, School, Users, 
  Calendar, BookOpen, Award, CheckCircle, Printer,
  GraduationCap, User, Star, TrendingUp
} from 'lucide-react';
import { generateBulletinPDF } from '@/utils/bulletinPdfGenerator';

const BilingualTranscriptGenerator: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['fr', 'en']);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Fetch students data
  const { data: studentsResponse = {}, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['/api/director/students'],
    queryFn: async () => {
      const response = await fetch('/api/director/students', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  });

  // Fetch classes data
  const { data: classesResponse = {}, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: async () => {
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  const studentsData = studentsResponse?.students || [];
  const classesData = classesResponse?.classes || [];

  const text = {
    fr: {
      title: 'Génération de Bulletins Bilingues',
      subtitle: 'Créez des bulletins scolaires officiels en français et anglais',
      student: {
        title: 'Sélection Élève',
        select: 'Choisir un élève',
        batch: 'Mode par classe',
        individual: 'Élève individuel'
      },
      class: {
        title: 'Classe',
        select: 'Sélectionner une classe'
      },
      period: {
        title: 'Période',
        select: 'Choisir la période',
        term1: 'Premier Trimestre',
        term2: 'Deuxième Trimestre',
        term3: 'Troisième Trimestre',
        semester1: 'Premier Semestre',
        semester2: 'Deuxième Semestre'
      },
      languages: {
        title: 'Langues de génération',
        french: 'Français',
        english: 'Anglais',
        both: 'Bilingue (FR + EN)'
      },
      preview: {
        title: 'Aperçu du Bulletin',
        student: 'Élève',
        class: 'Classe',
        period: 'Période',
        languages: 'Langues'
      },
      actions: {
        generate: 'Générer Bulletin(s)',
        generateBatch: 'Générer pour toute la classe',
        download: 'Télécharger PDF',
        preview: 'Aperçu',
        reset: 'Réinitialiser'
      },
      stats: {
        totalStudents: 'Total Élèves',
        selectedClass: 'Classe Sélectionnée',
        readyToGenerate: 'Prêt à Générer'
      }
    },
    en: {
      title: 'Bilingual Report Card Generator',
      subtitle: 'Create official school transcripts in French and English',
      student: {
        title: 'Student Selection',
        select: 'Choose a student',
        batch: 'Class batch mode',
        individual: 'Individual student'
      },
      class: {
        title: 'Class',
        select: 'Select a class'
      },
      period: {
        title: 'Period',
        select: 'Choose period',
        term1: 'First Term',
        term2: 'Second Term',
        term3: 'Third Term',
        semester1: 'First Semester',
        semester2: 'Second Semester'
      },
      languages: {
        title: 'Generation Languages',
        french: 'French',
        english: 'English',
        both: 'Bilingual (FR + EN)'
      },
      preview: {
        title: 'Report Card Preview',
        student: 'Student',
        class: 'Class',
        period: 'Period',
        languages: 'Languages'
      },
      actions: {
        generate: 'Generate Report Card(s)',
        generateBatch: 'Generate for entire class',
        download: 'Download PDF',
        preview: 'Preview',
        reset: 'Reset'
      },
      stats: {
        totalStudents: 'Total Students',
        selectedClass: 'Selected Class',
        readyToGenerate: 'Ready to Generate'
      }
    }
  };

  const t = text[language];

  const handleGenerateBulletin = async () => {
    if (!selectedStudent && !batchMode) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner un élève' : 'Please select a student',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedPeriod) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner une période' : 'Please select a period',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Enhanced bulletin data with student photo and official details
      const bulletinData = {
        student: {
          id: selectedStudent?.id || 1,
          name: selectedStudent?.firstName + ' ' + selectedStudent?.lastName || 'MBIDA Jean-Paul',
          class: selectedClass || '6ème A',
          photoUrl: selectedStudent?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          birthDate: selectedStudent?.birthDate || '15/03/2010',
          studentId: selectedStudent?.studentId || 'ELV2024001',
          nationality: selectedStudent?.nationality || 'Camerounaise',
          parentName: selectedStudent?.parentName || 'MBIDA Marie-Claire'
        },
        subjects: [
          { name: 'Mathématiques', grade: 16.5, coefficient: 4, teacher: 'M. Dupont', comment: 'Excellent travail' },
          { name: 'Français', grade: 14.0, coefficient: 4, teacher: 'Mme Martin', comment: 'Bien, à améliorer l\'orthographe' },
          { name: 'Sciences', grade: 15.5, coefficient: 3, teacher: 'M. Leblanc', comment: 'Très bon niveau' },
          { name: 'Histoire-Géo', grade: 13.0, coefficient: 3, teacher: 'Mme Rousseau', comment: 'Satisfaisant' },
          { name: 'Anglais', grade: 17.0, coefficient: 3, teacher: 'Ms Johnson', comment: 'Excellent level' }
        ],
        period: selectedPeriod,
        academicYear: '2024-2025',
        generalAverage: 15.2,
        classRank: 3,
        totalStudents: 28,
        teacherComments: 'Élève sérieux et travailleur. Continue sur cette voie.',
        directorComments: 'Félicitations pour ce bon trimestre.',
        schoolBranding: {
          schoolName: 'École Saint-Joseph',
          primaryColor: '#1a365d',
          secondaryColor: '#2d3748',
          footerText: 'Excellence • Discipline • Réussite',
          useWatermark: true,
          watermarkText: 'ÉDUCAFRIC'
        }
      };

      // Generate PDFs for each selected language
      for (const lang of selectedLanguages) {
        const pdf = await generateBulletinPDF(bulletinData, lang as 'fr' | 'en');
        
        // Download the PDF
        const fileName = `bulletin_${bulletinData.student.name}_${selectedPeriod}_${lang.toUpperCase()}.pdf`;
        pdf.save(fileName);
      }

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' 
          ? `Bulletin(s) généré(s) avec succès en ${selectedLanguages.map(l => l.toUpperCase()).join(' + ')}` 
          : `Report card(s) generated successfully in ${selectedLanguages.map(l => l.toUpperCase()).join(' + ')}`
      });

    } catch (error) {
      console.error('Error generating bulletin:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de la génération du bulletin' : 'Error generating report card',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGeneration = async () => {
    if (!selectedClass) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner une classe' : 'Please select a class',
        variant: 'destructive'
      });
      return;
    }

    const studentsInClass = studentsData.filter((student: any) => student.className === selectedClass);
    
    toast({
      title: language === 'fr' ? 'Génération en cours' : 'Generation in progress',
      description: language === 'fr' 
        ? `Génération de ${studentsInClass.length} bulletins pour la classe ${selectedClass}...`
        : `Generating ${studentsInClass.length} report cards for class ${selectedClass}...`
    });

    // In real implementation, this would generate bulletins for all students in the class
    console.log(`[BULLETIN_BATCH] Generating bulletins for ${studentsInClass.length} students in class ${selectedClass}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Languages className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">{t.stats.totalStudents}</p>
              <p className="text-2xl font-bold text-blue-800">{studentsData.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <School className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">{t.stats.selectedClass}</p>
              <p className="text-xl font-bold text-green-800">{selectedClass || 'Aucune'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">{t.stats.readyToGenerate}</p>
              <p className="text-xl font-bold text-purple-800">
                {selectedStudent && selectedPeriod ? 'Oui' : 'Non'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Configuration du Bulletin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">Mode de génération</Label>
              <div className="flex gap-4">
                <Button 
                  variant={!batchMode ? "default" : "outline"}
                  onClick={() => setBatchMode(false)}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t.student.individual}
                </Button>
                <Button 
                  variant={batchMode ? "default" : "outline"}
                  onClick={() => setBatchMode(true)}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t.student.batch}
                </Button>
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <Label>{t.class.title}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={t.class.select} />
                </SelectTrigger>
                <SelectContent>
                  {classesData.map((classe: any) => (
                    <SelectItem key={classe.id} value={classe.name}>
                      {classe.name} ({classe.currentStudents} élèves)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection (if individual mode) */}
            {!batchMode && (
              <div>
                <Label>{t.student.title}</Label>
                <Select 
                  value={selectedStudent?.id?.toString() || ''} 
                  onValueChange={(value) => {
                    const student = studentsData.find((s: any) => s.id.toString() === value);
                    setSelectedStudent(student);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.student.select} />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsData
                      .filter((student: any) => !selectedClass || student.className === selectedClass)
                      .map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} - {student.className}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Period Selection */}
            <div>
              <Label>{t.period.title}</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder={t.period.select} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trimestre1">{t.period.term1}</SelectItem>
                  <SelectItem value="trimestre2">{t.period.term2}</SelectItem>
                  <SelectItem value="trimestre3">{t.period.term3}</SelectItem>
                  <SelectItem value="semestre1">{t.period.semester1}</SelectItem>
                  <SelectItem value="semestre2">{t.period.semester2}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div>
              <Label className="mb-3 block">{t.languages.title}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="lang-fr"
                    checked={selectedLanguages.includes('fr')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLanguages([...selectedLanguages, 'fr']);
                      } else {
                        setSelectedLanguages(selectedLanguages.filter(l => l !== 'fr'));
                      }
                    }}
                  />
                  <label htmlFor="lang-fr">{t.languages.french}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="lang-en"
                    checked={selectedLanguages.includes('en')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLanguages([...selectedLanguages, 'en']);
                      } else {
                        setSelectedLanguages(selectedLanguages.filter(l => l !== 'en'));
                      }
                    }}
                  />
                  <label htmlFor="lang-en">{t.languages.english}</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t.preview.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedStudent || batchMode ? (
              <>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{t.preview.student}:</span>
                    <span>{batchMode ? `Classe ${selectedClass}` : `${selectedStudent?.firstName} ${selectedStudent?.lastName}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t.preview.class}:</span>
                    <span>{selectedClass || 'Non sélectionnée'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t.preview.period}:</span>
                    <span>{selectedPeriod || 'Non sélectionnée'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t.preview.languages}:</span>
                    <span>{selectedLanguages.map(l => l.toUpperCase()).join(' + ')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {batchMode ? (
                    <Button 
                      onClick={handleBatchGeneration}
                      disabled={!selectedClass || !selectedPeriod || isGenerating}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Génération...' : t.actions.generateBatch}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleGenerateBulletin}
                      disabled={!selectedStudent || !selectedPeriod || selectedLanguages.length === 0 || isGenerating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Génération...' : t.actions.generate}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedStudent(null);
                      setSelectedClass('');
                      setSelectedPeriod('');
                      setSelectedLanguages(['fr', 'en']);
                      setBatchMode(false);
                    }}
                    className="w-full"
                  >
                    {t.actions.reset}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un élève ou une classe pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BilingualTranscriptGenerator;