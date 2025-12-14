import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileArchive, HelpCircle, FolderArchive, Image, UserCheck } from 'lucide-react';
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
      downloadTemplate: 'Télécharger la liste des matricules',
      helpTitle: 'Comment utiliser l\'import de photos en lot ?',
      helpBtn: 'Aide',
      helpStep1Title: 'Étape 1: Préparez vos photos',
      helpStep1Desc: 'Rassemblez toutes les photos des élèves dans un dossier. Chaque photo doit être au format JPG, PNG, GIF ou WEBP (max 5MB).',
      helpStep2Title: 'Étape 2: Renommez les fichiers',
      helpStep2Desc: 'Renommez chaque photo avec le matricule de l\'élève. Exemples: STU-2025-001.jpg, EDU-CM-ST-ABC123.png',
      helpStep3Title: 'Étape 3: Créez le fichier ZIP',
      helpStep3Desc: 'Sélectionnez toutes les photos, clic droit → "Compresser" ou "Envoyer vers → Dossier compressé" pour créer un fichier .zip',
      helpStep4Title: 'Étape 4: Téléversez le ZIP',
      helpStep4Desc: 'Cliquez sur "Sélectionner un fichier ZIP" et choisissez votre fichier. Le système associera automatiquement chaque photo à l\'élève correspondant.',
      helpTip: 'Astuce: Les matricules sont insensibles à la casse. STU-2025-001.jpg et stu-2025-001.jpg fonctionnent tous les deux.'
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
      downloadTemplate: 'Download student ID list',
      helpTitle: 'How to use bulk photo upload?',
      helpBtn: 'Help',
      helpStep1Title: 'Step 1: Prepare your photos',
      helpStep1Desc: 'Gather all student photos in a folder. Each photo must be in JPG, PNG, GIF or WEBP format (max 5MB).',
      helpStep2Title: 'Step 2: Rename the files',
      helpStep2Desc: 'Rename each photo with the student ID. Examples: STU-2025-001.jpg, EDU-CM-ST-ABC123.png',
      helpStep3Title: 'Step 3: Create the ZIP file',
      helpStep3Desc: 'Select all photos, right-click → "Compress" or "Send to → Compressed folder" to create a .zip file',
      helpStep4Title: 'Step 4: Upload the ZIP',
      helpStep4Desc: 'Click "Select ZIP file" and choose your file. The system will automatically match each photo to the corresponding student.',
      helpTip: 'Tip: Student IDs are case-insensitive. STU-2025-001.jpg and stu-2025-001.jpg both work.'
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-help-bulk-photo">
                <HelpCircle className="h-4 w-4 mr-1" />
                {t.helpBtn}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {t.helpTitle}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.helpStep1Title}</h4>
                    <p className="text-sm text-muted-foreground">{t.helpStep1Desc}</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.helpStep2Title}</h4>
                    <p className="text-sm text-muted-foreground">{t.helpStep2Desc}</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.helpStep3Title}</h4>
                    <p className="text-sm text-muted-foreground">{t.helpStep3Desc}</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.helpStep4Title}</h4>
                    <p className="text-sm text-muted-foreground">{t.helpStep4Desc}</p>
                  </div>
                </div>
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm">{t.helpTip}</AlertDescription>
                </Alert>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
