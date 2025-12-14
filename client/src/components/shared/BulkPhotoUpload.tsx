import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileArchive, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkPhotoUploadProps {
  lang?: 'fr' | 'en';
  onComplete?: () => void;
}

interface UploadResult {
  success: boolean;
  matched: number;
  notMatched: number;
  errors: Array<{ filename: string; message: string }>;
  matchedStudents: Array<{ filename: string; studentName: string; matricule: string; photoUrl: string }>;
  unmatchedFiles: string[];
  message: string;
}

export function BulkPhotoUpload({ lang = 'fr', onComplete }: BulkPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const t = {
    fr: {
      title: 'Import de photos en lot',
      description: 'Téléversez un fichier ZIP contenant les photos des élèves nommées par leur matricule',
      instructions: 'Instructions:',
      step1: '1. Créez un fichier ZIP contenant les photos des élèves',
      step2: '2. Nommez chaque photo avec le matricule de l\'élève (ex: STU-2025-001.jpg)',
      step3: '3. Formats acceptés: JPG, PNG, GIF, WEBP (max 5MB par image)',
      selectFile: 'Sélectionner un fichier ZIP',
      uploading: 'Traitement en cours...',
      success: 'Import réussi',
      matched: 'photos associées aux élèves',
      notMatched: 'fichiers non correspondus',
      errors: 'Erreurs',
      matchedList: 'Photos associées',
      unmatchedList: 'Fichiers non correspondus',
      retry: 'Nouvel import',
      downloadTemplate: 'Télécharger la liste des matricules'
    },
    en: {
      title: 'Bulk Photo Upload',
      description: 'Upload a ZIP file containing student photos named by their student ID',
      instructions: 'Instructions:',
      step1: '1. Create a ZIP file containing student photos',
      step2: '2. Name each photo with the student ID (e.g., STU-2025-001.jpg)',
      step3: '3. Accepted formats: JPG, PNG, GIF, WEBP (max 5MB per image)',
      selectFile: 'Select ZIP file',
      uploading: 'Processing...',
      success: 'Upload successful',
      matched: 'photos matched to students',
      notMatched: 'unmatched files',
      errors: 'Errors',
      matchedList: 'Matched photos',
      unmatchedList: 'Unmatched files',
      retry: 'New upload',
      downloadTemplate: 'Download student ID list'
    }
  }[lang];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: lang === 'fr' ? 'Format invalide' : 'Invalid format',
        description: lang === 'fr' ? 'Veuillez sélectionner un fichier ZIP' : 'Please select a ZIP file',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setProgress(10);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);

      const response = await fetch(`/api/bulk-import/photos/upload-zip?lang=${lang}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      setProgress(80);

      const data = await response.json();
      setResult(data);
      setProgress(100);

      if (data.success && data.matched > 0) {
        toast({
          title: t.success,
          description: `${data.matched} ${t.matched}`,
        });
        onComplete?.();
      } else if (data.matched === 0) {
        toast({
          title: lang === 'fr' ? 'Aucune correspondance' : 'No matches',
          description: lang === 'fr' 
            ? 'Aucune photo n\'a pu être associée. Vérifiez les noms de fichiers.'
            : 'No photos could be matched. Check the file names.',
          variant: 'destructive'
        });
      }

    } catch (error) {
      toast({
        title: lang === 'fr' ? 'Erreur' : 'Error',
        description: lang === 'fr' ? 'Erreur lors du téléversement' : 'Upload error',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const resetUpload = () => {
    setResult(null);
    setProgress(0);
  };

  return (
    <Card data-testid="bulk-photo-upload-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t.instructions}</AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <p>{t.step1}</p>
                <p>{t.step2}</p>
                <p>{t.step3}</p>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
              {isUploading ? (
                <div className="w-full space-y-2">
                  <p className="text-center text-sm text-muted-foreground">{t.uploading}</p>
                  <Progress value={progress} className="w-full" />
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <label htmlFor="zip-upload">
                    <Button asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {t.selectFile}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileSelect}
                    data-testid="input-zip-upload"
                  />
                </>
              )}
            </div>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {result.matched > 0 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="font-semibold">
                  {result.matched} {t.matched}
                </p>
                {result.notMatched > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {result.notMatched} {t.notMatched}
                  </p>
                )}
              </div>
            </div>

            {result.matchedStudents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t.matchedList}:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1 text-sm bg-muted/50 p-2 rounded">
                  {result.matchedStudents.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{item.studentName}</span>
                      <span className="text-muted-foreground">({item.matricule})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.unmatchedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-orange-600">{t.unmatchedList}:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1 text-sm bg-orange-50 p-2 rounded">
                  {result.unmatchedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600">{t.errors}:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1 text-sm bg-red-50 p-2 rounded">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span>{err.filename}: {err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={resetUpload} variant="outline" data-testid="button-retry-upload">
              {t.retry}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
