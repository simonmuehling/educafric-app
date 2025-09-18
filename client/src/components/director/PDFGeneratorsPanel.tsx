import { useState } from 'react';
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
    title: 'Feuille de Maître',
    description: 'Vue d\'ensemble complète des notes de classe pour les enseignants',
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
      { key: 'includeStatistics', label: 'Inclure statistiques', type: 'boolean' },
      { key: 'includeAbsences', label: 'Inclure absences', type: 'boolean' },
      { key: 'showRankings', label: 'Afficher classements', type: 'boolean' }
    ]
  },
  {
    id: 'transcript',
    title: 'Relevé de Notes',
    description: 'Transcription académique complète multi-trimestres',
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

  const currentGenerator = PDF_GENERATORS.find(g => g.id === selectedGenerator)!;
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
    const sampleUrl = currentGenerator.sampleFiles[language];
    window.open(sampleUrl, '_blank');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Selection */}
        <div className="lg:col-span-1">
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
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedGenerator(generator.id)}
                    data-testid={`select-generator-${generator.id}`}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{generator.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {generator.description}
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
        <div className="lg:col-span-2">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentGenerator.specificOptions.map(option => {
                        if (option.type === 'select' && option.options) {
                          return (
                            <div key={option.key} className="space-y-2">
                              <Label htmlFor={option.key}>{option.label}</Label>
                              <Select
                                value={currentOptions[option.key] || option.options[0]}
                                onValueChange={(value) => updateOption(option.key, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {option.options.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        }
                        return (
                          <div key={option.key} className="flex items-center space-x-2">
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
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleGenerateDemo}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                    data-testid="button-generate-demo"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Générer Démo
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleViewSample('fr')}
                    className="flex items-center gap-2"
                    data-testid="button-view-sample-fr"
                  >
                    <Eye className="h-4 w-4" />
                    Aperçu FR
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleViewSample('en')}
                    className="flex items-center gap-2"
                    data-testid="button-view-sample-en"
                  >
                    <Eye className="h-4 w-4" />
                    Aperçu EN
                  </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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