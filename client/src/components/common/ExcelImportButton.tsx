import { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface ExcelImportButtonProps {
  importType: 'classes' | 'timetables' | 'teachers' | 'students' | 'parents';
  schoolId?: number;
  onImportSuccess?: () => void;
  invalidateQueries?: string[];
  buttonText?: {
    fr: string;
    en: string;
  };
}

export function ExcelImportButton({
  importType,
  schoolId,
  onImportSuccess,
  invalidateQueries = [],
  buttonText
}: ExcelImportButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    created: number;
    errors?: any[];
    warnings?: any[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const defaultButtonText = {
    classes: { fr: 'Importer Classes (Excel)', en: 'Import Classes (Excel)' },
    timetables: { fr: 'Importer Emploi du Temps (Excel)', en: 'Import Timetable (Excel)' },
    teachers: { fr: 'Importer Enseignants (Excel)', en: 'Import Teachers (Excel)' },
    students: { fr: 'Importer Élèves (Excel)', en: 'Import Students (Excel)' },
    parents: { fr: 'Importer Parents (Excel)', en: 'Import Parents (Excel)' }
  };

  const displayText = buttonText || defaultButtonText[importType];
  const currentLang = (localStorage.getItem('language') || 'fr') as 'fr' | 'en';

  const handleDownloadTemplate = async () => {
    const lang = localStorage.getItem('language') || 'fr';
    try {
      const response = await fetch(`/api/bulk-import/template/${importType}?lang=${lang}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorMsg = lang === 'fr' ? 'Échec du téléchargement du modèle' : 'Failed to download template';
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${importType}_${lang}_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: lang === 'fr' ? 'Modèle téléchargé' : 'Template downloaded',
        description: lang === 'fr' ? 'Remplissez le modèle Excel et importez-le' : 'Fill the Excel template and import it'
      });
    } catch (error) {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description: error instanceof Error ? error.message : (lang === 'fr' ? 'Erreur de téléchargement' : 'Download error'),
        variant: 'destructive'
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const lang = localStorage.getItem('language') || 'fr';

    // Reset state
    setResult(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      
      // Step 1: Validate and parse the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userType', importType);
      formData.append('lang', lang);
      if (schoolId) formData.append('schoolId', schoolId.toString());

      setUploadProgress(30);

      const validateResponse = await fetch('/api/bulk-import/validate', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!validateResponse.ok) {
        const errorMsg = lang === 'fr' ? 'Erreur de validation du fichier' : 'File validation error';
        throw new Error(errorMsg);
      }

      const validatedData = await validateResponse.json();
      setUploadProgress(60);

      // Step 2: Import the validated data
      const importPayload = {
        userType: importType,
        schoolId: schoolId,
        data: validatedData,
        lang: lang
      };

      const importResponse = await fetch('/api/bulk-import/import', {
        method: 'POST',
        body: JSON.stringify(importPayload),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      setUploadProgress(100);

      const importResult = await importResponse.json();
      setResult(importResult);

      // Invalidate queries
      if (invalidateQueries.length > 0) {
        await Promise.all(
          invalidateQueries.map(key => queryClient.invalidateQueries({ queryKey: [key] }))
        );
      }

      if (importResult.success) {
        toast({
          title: lang === 'fr' ? 'Import réussi' : 'Import successful',
          description: importResult.message || `${importResult.created} ${lang === 'fr' ? 'entrées créées' : 'entries created'}`
        });
        onImportSuccess?.();
      } else {
        toast({
          title: lang === 'fr' ? 'Import terminé avec des erreurs' : 'Import completed with errors',
          description: importResult.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: lang === 'fr' ? 'Erreur d\'import' : 'Import error',
        description: error instanceof Error ? error.message : (lang === 'fr' ? 'Erreur inconnue' : 'Unknown error'),
        variant: 'destructive'
      });
      setResult({
        success: false,
        message: error instanceof Error ? error.message : (lang === 'fr' ? 'Erreur inconnue' : 'Unknown error'),
        created: 0
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          data-testid={`button-download-template-${importType}`}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {currentLang === 'fr' ? 'Télécharger Modèle' : 'Download Template'}
        </Button>

        <Button
          variant="default"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          data-testid={`button-import-${importType}`}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {currentLang === 'fr' ? displayText.fr : displayText.en}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
          data-testid={`input-file-${importType}`}
        />
      </div>

      {isUploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentLang === 'fr' ? 'Import en cours...' : 'Importing...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} data-testid={`progress-upload-${importType}`} />
          </div>
        </Card>
      )}

      {result && (
        <Card className="p-4">
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <AlertDescription>
                  <div className="font-semibold">{result.message}</div>
                  <div className="mt-2 text-sm">
                    <div>✓ {currentLang === 'fr' ? 'Créées' : 'Created'}: {result.created}</div>
                    {result.errors && result.errors.length > 0 && (
                      <div className="text-red-600">✗ {currentLang === 'fr' ? 'Erreurs' : 'Errors'}: {result.errors.length}</div>
                    )}
                    {result.warnings && result.warnings.length > 0 && (
                      <div className="text-yellow-600">⚠ {currentLang === 'fr' ? 'Avertissements' : 'Warnings'}: {result.warnings.length}</div>
                    )}
                  </div>
                </AlertDescription>

                {result.errors && result.errors.length > 0 && (
                  <details className="text-sm mt-2">
                    <summary className="cursor-pointer font-medium">
                      {currentLang === 'fr' ? `Voir les erreurs (${result.errors.length})` : `View errors (${result.errors.length})`}
                    </summary>
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {result.errors.slice(0, 10).map((err, idx) => (
                        <div key={idx} className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          {currentLang === 'fr' ? 'Ligne' : 'Row'} {err.row}: {err.message} ({err.field})
                        </div>
                      ))}
                      {result.errors.length > 10 && (
                        <div className="text-xs text-muted-foreground">
                          {currentLang === 'fr' 
                            ? `...et ${result.errors.length - 10} autres erreurs`
                            : `...and ${result.errors.length - 10} more errors`}
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </Alert>
        </Card>
      )}
    </div>
  );
}
