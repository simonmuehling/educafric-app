import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Upload, 
  Eye, 
  Save,
  Trash2,
  CheckCircle
} from 'lucide-react';

interface DigitalSignatureCanvasProps {
  onSignatureChange: (signatureData: string | null) => void;
  onSavedSignatureChange?: (signatureUrl: string | null) => void;
  existingSignature?: string | null;
  userName?: string;
  showSaveOption?: boolean;
  className?: string;
}

const DigitalSignatureCanvas: React.FC<DigitalSignatureCanvasProps> = ({
  onSignatureChange,
  onSavedSignatureChange,
  existingSignature,
  userName = "Directeur",
  showSaveOption = true,
  className = ""
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('draw');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [savedSignatures, setSavedSignatures] = useState<Array<{id: string, url: string, name: string, date: string}>>([]);

  const text = {
    fr: {
      title: 'Signature Numérique',
      drawSignature: 'Dessiner Signature',
      uploadSignature: 'Importer Signature',
      savedSignatures: 'Signatures Sauvegardées',
      signHere: 'Signez ici...',
      clear: 'Effacer',
      undo: 'Annuler',
      preview: 'Aperçu',
      save: 'Sauvegarder',
      saveSignature: 'Sauvegarder cette signature',
      uploadImage: 'Importer une image',
      dragDrop: 'Glisser-déposer une image ou cliquer pour sélectionner',
      maxSize: 'Taille max: 2MB • PNG, JPG, GIF',
      signatureName: 'Nom de la signature',
      selectSaved: 'Sélectionner une signature sauvegardée',
      noSavedSignatures: 'Aucune signature sauvegardée',
      signaturePreview: 'Aperçu de la signature',
      currentSignature: 'Signature actuelle',
      removeSignature: 'Supprimer la signature',
      signatureEmpty: 'Veuillez créer ou sélectionner une signature',
      signatureSaved: 'Signature sauvegardée avec succès',
      signatureUploaded: 'Signature importée avec succès',
      errorSaving: 'Erreur lors de la sauvegarde',
      errorUploading: 'Erreur lors de l\'import'
    },
    en: {
      title: 'Digital Signature',
      drawSignature: 'Draw Signature',
      uploadSignature: 'Upload Signature',
      savedSignatures: 'Saved Signatures',
      signHere: 'Sign here...',
      clear: 'Clear',
      undo: 'Undo',
      preview: 'Preview',
      save: 'Save',
      saveSignature: 'Save this signature',
      uploadImage: 'Upload Image',
      dragDrop: 'Drag & drop an image or click to select',
      maxSize: 'Max size: 2MB • PNG, JPG, GIF',
      signatureName: 'Signature name',
      selectSaved: 'Select a saved signature',
      noSavedSignatures: 'No saved signatures',
      signaturePreview: 'Signature Preview',
      currentSignature: 'Current signature',
      removeSignature: 'Remove signature',
      signatureEmpty: 'Please create or select a signature',
      signatureSaved: 'Signature saved successfully',
      signatureUploaded: 'Signature uploaded successfully',
      errorSaving: 'Error saving signature',
      errorUploading: 'Error uploading signature'
    }
  };

  const t = text[language as keyof typeof text] || text.fr;

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 200;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add signature placeholder text
    ctx.fillStyle = '#e5e5e5';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.signHere, canvas.width / 2, canvas.height / 2);
  }, [t.signHere]);

  // Load existing signature if provided
  useEffect(() => {
    if (existingSignature && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          setIsEmpty(false);
        }
      };
      img.src = existingSignature;
    }
  }, [existingSignature]);

  // Load saved signatures from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('educafric_saved_signatures');
      if (saved) {
        setSavedSignatures(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved signatures:', error);
    }
  }, []);

  // Mouse event handlers for drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Update parent component with signature data
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add placeholder text
    ctx.fillStyle = '#e5e5e5';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.signHere, canvas.width / 2, canvas.height / 2);

    setIsEmpty(true);
    setUploadedImageUrl(null);
    onSignatureChange(null);
  };

  // Save signature to localStorage
  const saveSignature = () => {
    if (isEmpty) {
      toast({
        title: t.errorSaving,
        description: t.signatureEmpty,
        variant: 'destructive'
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    const signatureId = `signature_${Date.now()}`;
    const newSignature = {
      id: signatureId,
      url: signatureData,
      name: `${userName} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString()
    };

    const updatedSignatures = [...savedSignatures, newSignature];
    setSavedSignatures(updatedSignatures);

    try {
      localStorage.setItem('educafric_saved_signatures', JSON.stringify(updatedSignatures));
      toast({
        title: t.signatureSaved,
        description: `Signature sauvegardée pour ${userName}`,
      });
    } catch (error) {
      toast({
        title: t.errorSaving,
        description: 'Impossible de sauvegarder la signature',
        variant: 'destructive'
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t.errorUploading,
        description: 'Le fichier doit faire moins de 2MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t.errorUploading,
        description: 'Veuillez sélectionner une image valide',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setUploadedImageUrl(imageUrl);
      
      // Draw image on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate dimensions to fit image in canvas while maintaining aspect ratio
            const aspectRatio = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            
            if (aspectRatio > canvas.width / canvas.height) {
              drawHeight = canvas.width / aspectRatio;
            } else {
              drawWidth = canvas.height * aspectRatio;
            }
            
            const x = (canvas.width - drawWidth) / 2;
            const y = (canvas.height - drawHeight) / 2;
            
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            setIsEmpty(false);
            onSignatureChange(canvas.toDataURL('image/png'));
          }
        };
        img.src = imageUrl;
      }

      toast({
        title: t.signatureUploaded,
        description: 'Image importée avec succès',
      });
    };
    reader.readAsDataURL(file);
  };

  // Select saved signature
  const selectSavedSignature = (signature: {id: string, url: string, name: string, date: string}) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setIsEmpty(false);
        onSignatureChange(signature.url);
        if (onSavedSignatureChange) {
          onSavedSignatureChange(signature.url);
        }
      }
    };
    img.src = signature.url;

    toast({
      title: 'Signature sélectionnée',
      description: signature.name,
    });
  };

  return (
    <Card className={`w-full max-w-2xl ${className}`} data-testid="digital-signature-canvas">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" data-testid="tab-draw-signature">
              <PenTool className="h-4 w-4 mr-2" />
              {t.drawSignature}
            </TabsTrigger>
            <TabsTrigger value="upload" data-testid="tab-upload-signature">
              <Upload className="h-4 w-4 mr-2" />
              {t.uploadSignature}
            </TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved-signatures">
              <Save className="h-4 w-4 mr-2" />
              {t.savedSignatures}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-300 rounded bg-white cursor-crosshair w-full"
                style={{ maxWidth: '400px', height: '200px' }}
                data-testid="signature-canvas"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCanvas}
                data-testid="button-clear-signature"
              >
                <Eraser className="h-4 w-4 mr-2" />
                {t.clear}
              </Button>
              
              {showSaveOption && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveSignature}
                  disabled={isEmpty}
                  data-testid="button-save-signature"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t.saveSignature}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="signature-upload"
                data-testid="input-upload-signature"
              />
              <Label
                htmlFor="signature-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  {t.dragDrop}
                </div>
                <div className="text-xs text-gray-400">
                  {t.maxSize}
                </div>
              </Label>
            </div>

            {uploadedImageUrl && (
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm font-medium mb-2">{t.signaturePreview}:</div>
                <img 
                  src={uploadedImageUrl} 
                  alt="Uploaded signature" 
                  className="max-w-full max-h-32 object-contain border rounded"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedSignatures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Save className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>{t.noSavedSignatures}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSignatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectSavedSignature(signature)}
                    data-testid={`saved-signature-${signature.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={signature.url} 
                        alt={signature.name}
                        className="w-16 h-8 object-contain border rounded bg-white"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{signature.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(signature.date).toLocaleDateString()}
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Current signature preview */}
        {!isEmpty && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">{t.currentSignature}:</div>
            <div className="border rounded-lg p-2 bg-white">
              <canvas
                width="200"
                height="100"
                className="border border-gray-200 rounded"
                ref={(canvas) => {
                  if (canvas && canvasRef.current) {
                    const ctx = canvas.getContext('2d');
                    const sourceCtx = canvasRef.current.getContext('2d');
                    if (ctx && sourceCtx) {
                      ctx.fillStyle = '#ffffff';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(canvasRef.current, 0, 0, canvas.width, canvas.height);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DigitalSignatureCanvas;