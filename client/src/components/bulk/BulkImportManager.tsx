import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet, Users, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface BulkImportManagerProps {
  userType: 'teachers' | 'students';
  schoolId: number;
  onImportComplete?: (results: any) => void;
}

export function BulkImportManager({ userType, schoolId, onImportComplete }: BulkImportManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();

  const downloadTemplate = useCallback(async () => {
    try {
      const response = await fetch(`/api/bulk/template/${userType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template_${userType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Modèle téléchargé",
          description: `Le modèle pour ${userType} a été téléchargé avec succès.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le modèle.",
        variant: "destructive",
      });
    }
  }, [userType, toast]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Format de fichier invalide",
          description: "Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV (.csv).",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setValidationResults(null);
      setPreviewData([]);
    }
  }, [toast]);

  const validateAndPreview = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userType', userType);
      formData.append('schoolId', schoolId.toString());

      const response = await fetch('/api/bulk/validate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResults(result);
        setPreviewData(result.validData || []);
        
        toast({
          title: "Validation terminée",
          description: `${result.validCount} enregistrements valides, ${result.errorCount} erreurs détectées.`,
        });
      } else {
        toast({
          title: "Erreur de validation",
          description: result.message || "Une erreur est survenue lors de la validation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider le fichier.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [file, userType, schoolId, toast]);

  const confirmImport = useCallback(async () => {
    if (!validationResults?.validData) return;

    setIsUploading(true);

    try {
      const response = await fetch('/api/bulk/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType,
          schoolId,
          data: validationResults.validData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Import réussi",
          description: `${result.successCount} ${userType} importés avec succès.`,
        });
        
        onImportComplete?.(result);
        
        // Reset state
        setFile(null);
        setValidationResults(null);
        setPreviewData([]);
      } else {
        toast({
          title: "Erreur d'import",
          description: result.message || "Une erreur est survenue lors de l'import.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les données.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [validationResults, userType, schoolId, onImportComplete, toast]);

  const userTypeDisplay = userType === 'teachers' ? 'enseignants' : 'élèves';
  const UserIcon = userType === 'teachers' ? UserCheck : Users;

  return (
    <Card className="w-full max-w-4xl mx-auto" data-testid="bulk-import-manager">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Import en masse - {userTypeDisplay}</CardTitle>
            <CardDescription>
              Importez plusieurs {userTypeDisplay} à la fois via fichier Excel ou CSV
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">1. Modèle</TabsTrigger>
            <TabsTrigger value="upload">2. Import</TabsTrigger>
            <TabsTrigger value="preview">3. Validation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-4">
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                Téléchargez le modèle Excel avec les colonnes pré-définies pour {userTypeDisplay}.
                Remplissez-le avec vos données et importez-le à l'étape suivante.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={downloadTemplate}
              className="w-full"
              data-testid={`download-template-${userType}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le modèle {userTypeDisplay}
            </Button>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Colonnes requises pour {userTypeDisplay}:</strong></p>
              {userType === 'teachers' ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>Nom complet (obligatoire)</li>
                  <li>Email (obligatoire, unique)</li>
                  <li>Téléphone (obligatoire, unique)</li>
                  <li>Matières enseignées (séparées par des virgules)</li>
                  <li>Classes assignées (séparées par des virgules)</li>
                  <li>Années d'expérience (nombre)</li>
                  <li>Diplôme/Qualification</li>
                  <li>Département (optionnel)</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>Nom complet (obligatoire)</li>
                  <li>Email (obligatoire, unique)</li>
                  <li>Téléphone (obligatoire, unique)</li>
                  <li>Classe (obligatoire)</li>
                  <li>Date de naissance (format: JJ/MM/AAAA)</li>
                  <li>Adresse (optionnel)</li>
                  <li>Contact parent 1 (nom et téléphone)</li>
                  <li>Contact parent 2 (nom et téléphone - optionnel)</li>
                  <li>Contact d'urgence (nom et téléphone)</li>
                </ul>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="file-upload">Sélectionnez votre fichier rempli</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                data-testid="file-upload-input"
              />
              
              {file && (
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    Fichier sélectionné: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={validateAndPreview}
                disabled={!file || isUploading}
                className="w-full"
                data-testid="validate-file-button"
              >
                {isUploading ? 'Validation en cours...' : 'Valider et prévisualiser'}
              </Button>
              
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center">{uploadProgress}% terminé</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            {validationResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {validationResults.validCount}
                      </div>
                      <p className="text-sm text-gray-600">Enregistrements valides</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">
                        {validationResults.errorCount}
                      </div>
                      <p className="text-sm text-gray-600">Erreurs détectées</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {validationResults.duplicateCount || 0}
                      </div>
                      <p className="text-sm text-gray-600">Doublons détectés</p>
                    </CardContent>
                  </Card>
                </div>
                
                {validationResults.errors && validationResults.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Erreurs détectées:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {validationResults.errors.slice(0, 5).map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                        {validationResults.errors.length > 5 && (
                          <li>... et {validationResults.errors.length - 5} autres erreurs</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationResults.validCount > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Aperçu des données valides (5 premiers):</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            {userType === 'teachers' ? (
                              <>
                                <th className="border border-gray-300 p-2">Nom</th>
                                <th className="border border-gray-300 p-2">Email</th>
                                <th className="border border-gray-300 p-2">Téléphone</th>
                                <th className="border border-gray-300 p-2">Matières</th>
                                <th className="border border-gray-300 p-2">Classes</th>
                              </>
                            ) : (
                              <>
                                <th className="border border-gray-300 p-2">Nom</th>
                                <th className="border border-gray-300 p-2">Email</th>
                                <th className="border border-gray-300 p-2">Classe</th>
                                <th className="border border-gray-300 p-2">Contact Parent</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 5).map((item, index) => (
                            <tr key={index}>
                              {userType === 'teachers' ? (
                                <>
                                  <td className="border border-gray-300 p-2">{item.name}</td>
                                  <td className="border border-gray-300 p-2">{item.email}</td>
                                  <td className="border border-gray-300 p-2">{item.phone}</td>
                                  <td className="border border-gray-300 p-2">{item.subjects?.join(', ')}</td>
                                  <td className="border border-gray-300 p-2">{item.classes?.join(', ')}</td>
                                </>
                              ) : (
                                <>
                                  <td className="border border-gray-300 p-2">{item.name}</td>
                                  <td className="border border-gray-300 p-2">{item.email}</td>
                                  <td className="border border-gray-300 p-2">{item.class}</td>
                                  <td className="border border-gray-300 p-2">{item.parentContact}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <Button 
                      onClick={confirmImport}
                      disabled={isUploading || validationResults.validCount === 0}
                      className="w-full"
                      data-testid="confirm-import-button"
                    >
                      {isUploading ? 'Import en cours...' : `Confirmer l'import de ${validationResults.validCount} ${userTypeDisplay}`}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Aucune donnée à prévisualiser. Veuillez d'abord valider un fichier à l'étape précédente.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}