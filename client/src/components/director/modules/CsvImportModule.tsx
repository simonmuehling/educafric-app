import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  GraduationCap, 
  BookOpen,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: number;
}

const CsvImportModule: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const importTypes = [
    {
      id: 'students',
      name: 'Élèves',
      icon: <GraduationCap className="w-5 h-5" />,
      template: 'eleves-template.csv',
      description: 'Importer les données des élèves avec informations parents'
    },
    {
      id: 'teachers',
      name: 'Enseignants',
      icon: <Users className="w-5 h-5" />,
      template: 'enseignants-template.csv',
      description: 'Importer les données des enseignants'
    },
    {
      id: 'grades',
      name: 'Notes',
      icon: <BookOpen className="w-5 h-5" />,
      template: 'notes-template.csv',
      description: 'Importer les notes et évaluations'
    },
    {
      id: 'attendance',
      name: 'Présences',
      icon: <ClipboardList className="w-5 h-5" />,
      template: 'presences-template.csv',
      description: 'Importer les données de présence'
    }
  ];

  const text = {
    fr: {
      title: 'Import CSV',
      subtitle: 'Importez vos données en masse via fichiers CSV',
      selectType: 'Sélectionnez le type de données',
      downloadTemplate: 'Télécharger le template',
      selectFile: 'Sélectionner fichier CSV',
      import: 'Importer',
      importing: 'Importation en cours...',
      success: 'Import réussi',
      error: 'Erreurs d\'import',
      results: 'Résultats de l\'import',
      imported: 'Enregistrements importés',
      duplicates: 'Doublons ignorés',
      errors: 'Erreurs',
      instructions: 'Instructions',
      instructionsList: [
        '1. Sélectionnez le type de données à importer',
        '2. Téléchargez le template CSV correspondant',
        '3. Remplissez le template avec vos données',
        '4. Sélectionnez votre fichier CSV complété',
        '5. Cliquez sur "Importer" pour lancer l\'import'
      ],
      tips: [
        'Respectez exactement le format du template',
        'Les emails doivent être uniques',
        'Les numéros de téléphone avec indicatif (+237)',
        'Dates au format YYYY-MM-DD',
        'Utilisez ; pour séparer plusieurs valeurs'
      ]
    },
    en: {
      title: 'CSV Import',
      subtitle: 'Import your data in bulk via CSV files',
      selectType: 'Select data type',
      downloadTemplate: 'Download template',
      selectFile: 'Select CSV file',
      import: 'Import',
      importing: 'Importing...',
      success: 'Import successful',
      error: 'Import errors',
      results: 'Import results',
      imported: 'Records imported',
      duplicates: 'Duplicates ignored',
      errors: 'Errors',
      instructions: 'Instructions',
      instructionsList: [
        '1. Select the type of data to import',
        '2. Download the corresponding CSV template',
        '3. Fill the template with your data',
        '4. Select your completed CSV file',
        '5. Click "Import" to start the import'
      ],
      tips: [
        'Follow the template format exactly',
        'Emails must be unique',
        'Phone numbers with country code (+237)',
        'Dates in YYYY-MM-DD format',
        'Use ; to separate multiple values'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  const handleDownloadTemplate = (templateName: string) => {
    const url = `/templates/csv/${templateName}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = templateName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template téléchargé",
      description: `Le template ${templateName} a été téléchargé avec succès.`
    });
  };

  const handleFileSelect = () => {
    if (!selectedType) {
      toast({
        title: "Sélection requise",
        description: "Veuillez d'abord sélectionner le type de données à importer.",
        variant: "destructive"
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV.",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      // Simuler l'import - remplacer par vraie API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Résultat simulé
      const result: ImportResult = {
        success: true,
        imported: Math.floor(Math.random() * 50) + 10,
        errors: [],
        duplicates: Math.floor(Math.random() * 5)
      };

      setImportResult(result);

      toast({
        title: "Import terminé",
        description: `${result.imported} enregistrements importés avec succès.`
      });

    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const selectedImportType = importTypes.find(type => type.id === selectedType);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Import Process */}
        <div className="space-y-6">
          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Info className="w-5 h-5 mr-2" />
                {t.instructions}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ul className="space-y-2">
                {t.instructionsList.map((instruction, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="inline-block w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {instruction.substring(2)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t.selectType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {importTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {type.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      {selectedType === type.id && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {selectedImportType && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadTemplate(selectedImportType.template)}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t.downloadTemplate}
                  </Button>
                )}

                <Button
                  onClick={handleFileSelect}
                  disabled={!selectedType || importing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t.selectFile}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {importing && (
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">{t.importing}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tips and Results */}
        <div className="space-y-6">
          {/* Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-900">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Conseils Important
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-800">
              <ul className="list-disc list-inside space-y-1">
                {t.tips.map((tip, index) => (
                  <li key={index} className="text-sm">{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResult && (
            <Card className={importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 mr-2" />
                  )}
                  {t.results}
                </CardTitle>
              </CardHeader>
              <CardContent className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t.imported}:</span>
                    <Badge variant="outline">{importResult.imported}</Badge>
                  </div>
                  {importResult.duplicates > 0 && (
                    <div className="flex justify-between">
                      <span>{t.duplicates}:</span>
                      <Badge variant="outline">{importResult.duplicates}</Badge>
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">{t.errors}:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Format Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Format de Fichier
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <ul className="space-y-1">
                <li>• Format: CSV (UTF-8)</li>
                <li>• Séparateur: virgule (,)</li>
                <li>• Encodage: UTF-8</li>
                <li>• En-têtes: obligatoires</li>
                <li>• Taille max: 10 MB</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModule;