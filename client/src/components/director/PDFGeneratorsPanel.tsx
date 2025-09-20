import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  FileSpreadsheet, 
  Calendar, 
  Download, 
  Eye, 
  Settings, 
  Loader2,
  BookOpen,
  GraduationCap,
  Clock
} from 'lucide-react';
import SimpleBulletinEntry from '@/components/director/modules/SimpleBulletinEntry';
import { apiRequest } from '@/lib/queryClient';

interface PDFGeneratorOptions {
  language: 'fr' | 'en';
  format: 'A4' | 'Letter';
  colorScheme: string;
  [key: string]: any;
}

interface ClassData {
  id: number;
  name: string;
}

interface ClassesResponse {
  success: boolean;
  classes: ClassData[];
}

interface PDFGeneratorConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
  endpoint: string;
  demoEndpoint: string;
  sampleFiles: { fr: string; en: string };
  defaultOptions: PDFGeneratorOptions;
  colorSchemes: Array<{ value: string; label: string; description: string }>;
  specificOptions?: Array<{ key: string; label: string; type: 'boolean' | 'select'; options?: string[] }>;
}

const PDF_GENERATORS: PDFGeneratorConfig[] = [
  {
    id: 'comprehensive-bulletin',
    title: 'Bulletin Complet avec Saisie Manuelle',
    description: 'Interface complète pour saisir manuellement toutes les données de bulletin (absences, sanctions, appréciations, coefficients)',
    icon: BookOpen,
    endpoint: '/api/optimized-bulletins/generate',
    demoEndpoint: '/api/optimized-bulletins/sample',
    sampleFiles: {
      fr: '/samples/optimized-bulletin-t3-fr.pdf',
      en: '/samples/optimized-bulletin-t3-en.pdf'
    },
    defaultOptions: {
      language: 'fr',
      format: 'A4',
      colorScheme: 'standard',
      includeAbsences: true,
      includeLateness: true,
      includeSanctions: true,
      includeAppreciations: true,
      includeComments: true,
      includeStatistics: true,
      term: 'T1'
    },
    colorSchemes: [
      { value: 'standard', label: 'Standard', description: 'Couleurs académiques camerounaises' },
      { value: 'official', label: 'Officiel', description: 'Style gouvernemental Cameroun' },
      { value: 'modern', label: 'Moderne', description: 'Design contemporain' }
    ],
    specificOptions: [
      { key: 'includeAbsences', label: 'Inclure absences/retards', type: 'boolean' },
      { key: 'includeSanctions', label: 'Inclure sanctions disciplinaires', type: 'boolean' },
      { key: 'includeAppreciations', label: 'Inclure appréciations détaillées', type: 'boolean' },
      { key: 'includeComments', label: 'Inclure commentaires', type: 'boolean' },
      { key: 'includeStatistics', label: 'Inclure statistiques de classe', type: 'boolean' },
      { key: 'term', label: 'Trimestre', type: 'select', options: ['T1', 'T2', 'T3'] }
    ]
  },
  {
    id: 'master-sheet',
    title: 'Feuille de Synthèse',
    description: 'Document central regroupant les informations importantes des élèves par classe (notes, absences, données administratives)',
    icon: FileSpreadsheet,
    endpoint: '/api/master-sheets/generate',
    demoEndpoint: '/api/master-sheets/demo',
    sampleFiles: {
      fr: '/samples/master-sheet-sample-fr.pdf',
      en: '/samples/master-sheet-sample-en.pdf'
    },
    defaultOptions: {
      language: 'fr',
      format: 'A4',
      colorScheme: 'standard',
      orientation: 'landscape',
      includeStatistics: true,
      includeAbsences: true,
      showRankings: true
    },
    colorSchemes: [
      { value: 'standard', label: 'Standard', description: 'Couleurs académiques classiques' },
      { value: 'green', label: 'Vert', description: 'Thème vert nature' },
      { value: 'blue', label: 'Bleu', description: 'Thème bleu professionnel' }
    ],
    specificOptions: [
      { key: 'classId', label: 'Classe', type: 'select', options: [] }, // Will be populated with classes
      { key: 'includeStatistics', label: 'Inclure statistiques', type: 'boolean' },
      { key: 'includeAbsences', label: 'Inclure absences', type: 'boolean' },
      { key: 'showRankings', label: 'Afficher classements', type: 'boolean' }
    ]
  },
  {
    id: 'transcript',
    title: 'Relevé de Résultats',
    description: 'Document officiel présentant l\'ensemble du parcours scolaire avec validation officielle (pour inscriptions, bourses)',
    icon: GraduationCap,
    endpoint: '/api/transcripts/generate',
    demoEndpoint: '/api/transcripts/demo',
    sampleFiles: {
      fr: '/samples/transcript-sample-fr.pdf',
      en: '/samples/transcript-sample-en.pdf'
    },
    defaultOptions: {
      language: 'fr',
      format: 'A4',
      colorScheme: 'official',
      includePhoto: true,
      includeCertifications: true,
      includeStatistics: true,
      officialSeal: true
    },
    colorSchemes: [
      { value: 'official', label: 'Officiel', description: 'Style gouvernemental officiel' },
      { value: 'modern', label: 'Moderne', description: 'Design contemporain épuré' },
      { value: 'classic', label: 'Classique', description: 'Style académique traditionnel' }
    ],
    specificOptions: [
      { key: 'includePhoto', label: 'Inclure photo', type: 'boolean' },
      { key: 'includeCertifications', label: 'Inclure certifications', type: 'boolean' },
      { key: 'includeStatistics', label: 'Inclure statistiques', type: 'boolean' },
      { key: 'officialSeal', label: 'Cachet officiel', type: 'boolean' }
    ]
  },
  {
    id: 'timetable',
    title: 'Emploi du Temps',
    description: 'Planning hebdomadaire complet avec professeurs et salles',
    icon: Clock,
    endpoint: '/api/timetables/generate',
    demoEndpoint: '/api/timetables/demo',
    sampleFiles: {
      fr: '/samples/timetable-sample-fr.pdf',
      en: '/samples/timetable-sample-en.pdf'
    },
    defaultOptions: {
      language: 'fr',
      format: 'A4',
      colorScheme: 'standard',
      orientation: 'landscape',
      showTeacherNames: true,
      showRooms: true,
      includeBreaks: true,
      includeSaturday: false,
      showTimeOnly: true
    },
    colorSchemes: [
      { value: 'standard', label: 'Standard', description: 'Couleurs académiques professionnelles' },
      { value: 'colorful', label: 'Coloré', description: 'Couleurs vives pour meilleure visibilité' },
      { value: 'minimal', label: 'Minimal', description: 'Design épuré noir et blanc' }
    ],
    specificOptions: [
      { key: 'classId', label: 'Classe', type: 'select', options: [] }, // Will be populated with classes
      { key: 'showTeacherNames', label: 'Afficher noms enseignants', type: 'boolean' },
      { key: 'showRooms', label: 'Afficher salles', type: 'boolean' },
      { key: 'includeBreaks', label: 'Inclure pauses', type: 'boolean' },
      { key: 'includeSaturday', label: 'Inclure samedi', type: 'boolean' }
    ]
  }
];

export function PDFGeneratorsPanel() {
  const { toast } = useToast();
  const [selectedGenerator, setSelectedGenerator] = useState<string>('master-sheet');
  const [options, setOptions] = useState<Record<string, PDFGeneratorOptions>>(() => {
    const initialOptions: Record<string, PDFGeneratorOptions> = {};
    PDF_GENERATORS.forEach(gen => {
      initialOptions[gen.id] = { ...gen.defaultOptions };
    });
    return initialOptions;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Récupération des classes de l'école pour la feuille de synthèse et l'emploi du temps
  const { data: classesData } = useQuery<ClassesResponse>({
    queryKey: ['/api/director/classes'],
    enabled: selectedGenerator === 'master-sheet' || selectedGenerator === 'timetable' || showAdvanced
  });

  // Helper function to check if classesData is valid
  const isValidClassesData = (data: unknown): data is ClassesResponse => {
    return data !== null && 
           data !== undefined && 
           typeof data === 'object' && 
           'success' in data && 
           'classes' in data &&
           typeof (data as ClassesResponse).success === 'boolean' &&
           Array.isArray((data as ClassesResponse).classes);
  };

  // Créer une copie modifiée du générateur avec les classes disponibles
  const currentGenerator = (() => {
    const generator = PDF_GENERATORS.find(g => g.id === selectedGenerator)!;
    if ((generator.id === 'master-sheet' || generator.id === 'timetable') && isValidClassesData(classesData) && classesData.success) {
      const classes = classesData.classes || [];
      const classOptions = classes.map((cls: ClassData) => `${cls.id}:${cls.name}`);
      
      return {
        ...generator,
        specificOptions: generator.specificOptions?.map(option => 
          option.key === 'classId' 
            ? { ...option, options: classOptions }
            : option
        ) || []
      };
    }
    return generator;
  })();
  const currentOptions = options[selectedGenerator];

  const updateOption = (key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [selectedGenerator]: {
        ...prev[selectedGenerator],
        [key]: value
      }
    }));
  };

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    try {
      // Runtime guards for validation
      if (!currentGenerator) {
        throw new Error('No generator selected');
      }
      
      if (!currentOptions) {
        throw new Error('No options configured');
      }

      console.log('[PDF_GENERATORS] 🚀 Generating demo for:', selectedGenerator);
      
      // Use fetch directly for better PDF handling
      const response = await fetch(currentGenerator.demoEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: currentOptions.language,
          colorScheme: currentOptions.colorScheme,
          ...(selectedGenerator === 'timetable' && { includeSaturday: currentOptions.includeSaturday })
        }),
        credentials: 'include', // Include cookies for authentication
      });

      // Enhanced error handling with runtime guards
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[PDF_GENERATORS] ❌ HTTP Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication requise - veuillez vous connecter');
        } else if (response.status === 403) {
          throw new Error('Accès refusé - vérifiez vos permissions');
        } else if (response.status === 500) {
          throw new Error(`Erreur serveur: ${errorText}`);
        } else {
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        console.warn('[PDF_GENERATORS] ⚠️ Response is not a PDF, content-type:', contentType);
      }

      // Create blob and download
      const blob = await response.blob();
      
      // Runtime guard for blob size
      if (blob.size === 0) {
        throw new Error('Le PDF généré est vide');
      }
      
      console.log('[PDF_GENERATORS] ✅ PDF blob created:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedGenerator}-demo-${currentOptions.language}.pdf`;
      
      // Ensure element is properly attached
      document.body.appendChild(a);
      a.click();
      
      // Clean up resources
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: "PDF Généré",
        description: `${currentGenerator.title} de démonstration téléchargé avec succès (${(blob.size / 1024).toFixed(1)} KB)`,
      });
      
      console.log('[PDF_GENERATORS] ✅ Demo generated successfully for:', selectedGenerator);
      
    } catch (error: any) {
      console.error('[PDF_GENERATORS] ❌ Error generating demo PDF:', error);
      
      // Enhanced error reporting
      const errorMessage = error?.message || 'Erreur inconnue lors de la génération du PDF';
      
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewSample = (language: 'fr' | 'en') => {
    try {
      const sampleUrl = currentGenerator.sampleFiles[language];
      
      // Enhanced logging for debugging
      console.log('[PDF_SAMPLE] 🔍 Attempting to open sample:', { 
        generator: selectedGenerator, 
        language, 
        url: sampleUrl 
      });

      // Open window immediately to preserve user activation (no await before this!)
      const newWindow = window.open(sampleUrl, '_blank', 'noopener,noreferrer');
      
      // Check if the window was successfully opened
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Pop-up was likely blocked, try alternative method immediately (still synchronous)
        console.log('[PDF_SAMPLE] ⚠️ Pop-up blocked, trying alternative method');
        
        // Create a temporary link and click it immediately
        const link = document.createElement('a');
        link.href = sampleUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Add to DOM temporarily and click immediately
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Aperçu ouvert",
          description: `Aperçu ${language.toUpperCase()} de "${currentGenerator.title}" ouvert dans un nouvel onglet.`,
        });
      } else {
        // Success message for successful pop-up
        toast({
          title: "Aperçu ouvert",
          description: `Aperçu ${language.toUpperCase()} de "${currentGenerator.title}" ouvert avec succès.`,
        });
      }
      
      console.log('[PDF_SAMPLE] ✅ Sample opened successfully');
      
    } catch (error: any) {
      console.error('[PDF_SAMPLE] ❌ Error opening sample:', error);
      
      const errorMessage = error?.message || 'Erreur inconnue lors de l\'ouverture de l\'aperçu';
      
      toast({
        title: "Erreur d'aperçu",
        description: `Impossible d'ouvrir l'aperçu: ${errorMessage}. Vérifiez que votre navigateur autorise les pop-ups.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="pdf-generators-panel">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Générateurs PDF Professionnels
          </CardTitle>
          <CardDescription>
            Créez des documents académiques professionnels avec en-têtes officiels camerounais
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Generator Selection */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Types de Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PDF_GENERATORS.map(generator => {
                const Icon = generator.icon;
                return (
                  <Button
                    key={generator.id}
                    variant={selectedGenerator === generator.id ? "default" : "outline"}
                    className="w-full justify-start h-auto p-2 sm:p-3 min-h-[70px] sm:min-h-[80px]"
                    onClick={() => setSelectedGenerator(generator.id)}
                    data-testid={`select-generator-${generator.id}`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 text-left w-full">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base leading-tight mb-1 break-words">
                          {generator.title}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground leading-tight break-words hyphens-auto overflow-hidden">
                          <span className="line-clamp-2 sm:line-clamp-3">
                            {generator.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {selectedGenerator === 'comprehensive-bulletin' ? (
            /* Manual Data Entry Interface for Comprehensive Bulletins */
            <SimpleBulletinEntry />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration - {currentGenerator.title}
                </CardTitle>
                <CardDescription>
                  {currentGenerator.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select
                      value={currentOptions.language}
                      onValueChange={(value) => updateOption('language', value)}
                    >
                      <SelectTrigger data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select
                      value={currentOptions.format}
                      onValueChange={(value) => updateOption('format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                        <SelectItem value="Letter">Letter (8.5×11in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colorScheme">Thème</Label>
                    <Select
                      value={currentOptions.colorScheme}
                      onValueChange={(value) => updateOption('colorScheme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentGenerator.colorSchemes.map(scheme => (
                          <SelectItem key={scheme.value} value={scheme.value}>
                            {scheme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Options Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-options"
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                  <Label htmlFor="advanced-options">Options avancées</Label>
                </div>

                {/* Advanced Options */}
                {showAdvanced && currentGenerator.specificOptions && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {currentGenerator.specificOptions.map(option => {
                        if (option.type === 'select' && option.options) {
                          return (
                            <div key={option.key} className="space-y-2">
                              <Label htmlFor={option.key}>{option.label}</Label>
                              <Select
                                value={currentOptions[option.key] || (option.options.length > 0 ? option.options[0] : '')}
                                onValueChange={(value) => updateOption(option.key, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={option.key === 'classId' ? 'Sélectionner une classe...' : 'Sélectionner...'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {option.options.map(opt => {
                                    if (option.key === 'classId') {
                                      // Pour les classes, afficher seulement le nom (après les ":")
                                      const [id, name] = opt.split(':');
                                      return (
                                        <SelectItem key={opt} value={opt}>
                                          {name || opt}
                                        </SelectItem>
                                      );
                                    }
                                    return (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        }
                        return (
                          <div key={option.key} className="flex items-center space-x-2 col-span-1 sm:col-span-2">
                            <Switch
                              id={option.key}
                              checked={currentOptions[option.key] || false}
                              onCheckedChange={(checked) => updateOption(option.key, checked)}
                            />
                            <Label htmlFor={option.key} className="text-sm">
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <Separator />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleGenerateDemo}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 flex-1"
                    data-testid="button-generate-demo"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Générer Démo PDF</span>
                    <span className="sm:hidden">Générer PDF</span>
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewSample('fr')}
                      className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                      data-testid="button-view-sample-fr"
                    >
                      <Eye className="h-4 w-4" />
                      Aperçu FR
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleViewSample('en')}
                      className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                      data-testid="button-view-sample-en"
                    >
                      <Eye className="h-4 w-4" />
                      Aperçu EN
                    </Button>
                  </div>
                </div>

                {/* Color Scheme Info */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">
                    Thème sélectionné : {currentGenerator.colorSchemes.find(s => s.value === currentOptions.colorScheme)?.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentGenerator.colorSchemes.find(s => s.value === currentOptions.colorScheme)?.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités Incluses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">En-têtes Officiels</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                En-têtes officiels camerounais conformes aux standards du Ministère
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Bilingue FR/EN</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Support complet français et anglais avec traductions automatiques
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Qualité Professionnelle</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Documents PDF haute résolution prêts pour impression officielle
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}