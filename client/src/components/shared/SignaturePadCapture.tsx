import { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eraser, Save, RotateCcw, Download, Upload, Pen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SignatureResponse {
  signatureData?: string;
  signatureName?: string;
  signatureFunction?: string;
}

interface SignaturePadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (signatureData: string, signatureType: string) => void;
  signatureFor?: 'principal' | 'admin' | 'student' | 'parent' | 'teacher';
  title?: string;
}

export function SignaturePadCapture({ 
  isOpen, 
  onClose, 
  onSave,
  signatureFor = 'principal',
  title 
}: SignaturePadCaptureProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [signatureName, setSignatureName] = useState('');
  const [signatureFunction, setSignatureFunction] = useState('');
  const [penColor, setPenColor] = useState('#000080');
  const [penWidth, setPenWidth] = useState(2);

  const { data: existingSignature } = useQuery<SignatureResponse>({
    queryKey: ['/api/signatures', signatureFor],
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
      
      signaturePadRef.current = new SignaturePad(canvas, {
        penColor: penColor,
        minWidth: penWidth * 0.5,
        maxWidth: penWidth * 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0)'
      });

      signaturePadRef.current.addEventListener('endStroke', () => {
        setIsEmpty(signaturePadRef.current?.isEmpty() ?? true);
      });

      if (existingSignature?.signatureData) {
        signaturePadRef.current.fromDataURL(existingSignature.signatureData);
        setIsEmpty(false);
        setSignatureName(existingSignature.signatureName || '');
        setSignatureFunction(existingSignature.signatureFunction || '');
      }

      return () => {
        signaturePadRef.current?.off();
      };
    }
  }, [isOpen, penColor, penWidth, existingSignature]);

  const updatePenSettings = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.penColor = penColor;
      signaturePadRef.current.minWidth = penWidth * 0.5;
      signaturePadRef.current.maxWidth = penWidth * 1.5;
    }
  };

  useEffect(() => {
    updatePenSettings();
  }, [penColor, penWidth]);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data.length > 0) {
        data.pop();
        signaturePadRef.current.fromData(data);
        setIsEmpty(signaturePadRef.current.isEmpty());
      }
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { signatureData: string; signatureName: string; signatureFunction: string; signatureFor: string }) => {
      return apiRequest('POST', '/api/signatures', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/signatures'] });
      toast({
        title: language === 'fr' ? 'Signature sauvegardée' : 'Signature saved',
        description: language === 'fr' 
          ? 'Votre signature a été enregistrée avec succès' 
          : 'Your signature has been saved successfully'
      });
      onClose();
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de sauvegarder la signature' 
          : 'Failed to save signature',
        variant: 'destructive'
      });
    }
  });

  const handleSave = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      toast({
        title: language === 'fr' ? 'Signature requise' : 'Signature required',
        description: language === 'fr' 
          ? 'Veuillez signer avant de sauvegarder' 
          : 'Please sign before saving',
        variant: 'destructive'
      });
      return;
    }

    const signatureData = signaturePadRef.current.toDataURL('image/png');
    
    if (onSave) {
      onSave(signatureData, 'drawn');
      onClose();
    } else {
      saveMutation.mutate({
        signatureData,
        signatureName: signatureName || getDefaultName(),
        signatureFunction: signatureFunction || getDefaultFunction(),
        signatureFor
      });
    }
  };

  const handleDownload = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return;
    
    const link = document.createElement('a');
    link.download = `signature-${signatureFor}-${Date.now()}.png`;
    link.href = signaturePadRef.current.toDataURL('image/png');
    link.click();
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (signaturePadRef.current) {
        signaturePadRef.current.fromDataURL(dataUrl);
        setIsEmpty(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getDefaultName = () => {
    switch (signatureFor) {
      case 'principal': return language === 'fr' ? 'Directeur' : 'Principal';
      case 'admin': return language === 'fr' ? 'Administrateur' : 'Administrator';
      case 'student': return language === 'fr' ? 'Élève' : 'Student';
      case 'parent': return language === 'fr' ? 'Parent' : 'Parent';
      case 'teacher': return language === 'fr' ? 'Enseignant' : 'Teacher';
      default: return '';
    }
  };

  const getDefaultFunction = () => {
    switch (signatureFor) {
      case 'principal': return language === 'fr' ? 'Directeur d\'École' : 'School Principal';
      case 'admin': return language === 'fr' ? 'Administrateur' : 'Administrator';
      case 'student': return language === 'fr' ? 'Élève' : 'Student';
      case 'parent': return language === 'fr' ? 'Parent/Tuteur' : 'Parent/Guardian';
      case 'teacher': return language === 'fr' ? 'Enseignant' : 'Teacher';
      default: return '';
    }
  };

  const text = language === 'fr' ? {
    title: title || 'Capture de Signature Numérique',
    subtitle: 'Signez dans la zone ci-dessous avec votre souris ou doigt',
    signatureName: 'Nom du signataire',
    signatureFunction: 'Fonction',
    penColor: 'Couleur du stylo',
    penWidth: 'Épaisseur',
    clear: 'Effacer',
    undo: 'Annuler',
    download: 'Télécharger',
    upload: 'Importer',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    signHere: 'Signez ici...',
    saving: 'Sauvegarde...',
    thin: 'Fin',
    medium: 'Moyen',
    thick: 'Épais'
  } : {
    title: title || 'Digital Signature Capture',
    subtitle: 'Sign in the area below using your mouse or finger',
    signatureName: 'Signer name',
    signatureFunction: 'Function/Title',
    penColor: 'Pen color',
    penWidth: 'Thickness',
    clear: 'Clear',
    undo: 'Undo',
    download: 'Download',
    upload: 'Upload',
    save: 'Save',
    cancel: 'Cancel',
    signHere: 'Sign here...',
    saving: 'Saving...',
    thin: 'Thin',
    medium: 'Medium',
    thick: 'Thick'
  };

  const penColors = [
    { value: '#000080', label: language === 'fr' ? 'Bleu marine' : 'Navy Blue' },
    { value: '#000000', label: language === 'fr' ? 'Noir' : 'Black' },
    { value: '#1a365d', label: language === 'fr' ? 'Bleu foncé' : 'Dark Blue' },
    { value: '#2d3748', label: language === 'fr' ? 'Gris foncé' : 'Dark Gray' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Pen className="w-5 h-5 text-blue-600" />
            {text.title}
          </DialogTitle>
          <p className="text-sm text-gray-500">{text.subtitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signatureName">{text.signatureName}</Label>
              <Input
                id="signatureName"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={getDefaultName()}
                data-testid="input-signature-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatureFunction">{text.signatureFunction}</Label>
              <Input
                id="signatureFunction"
                value={signatureFunction}
                onChange={(e) => setSignatureFunction(e.target.value)}
                placeholder={getDefaultFunction()}
                data-testid="input-signature-function"
              />
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>{text.penColor}</Label>
              <Select value={penColor} onValueChange={setPenColor}>
                <SelectTrigger data-testid="select-pen-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {penColors.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.value }} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label>{text.penWidth}</Label>
              <Select value={String(penWidth)} onValueChange={(v) => setPenWidth(Number(v))}>
                <SelectTrigger data-testid="select-pen-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{text.thin}</SelectItem>
                  <SelectItem value="2">{text.medium}</SelectItem>
                  <SelectItem value="3">{text.thick}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-0">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 cursor-crosshair bg-white rounded-lg"
                  style={{ touchAction: 'none' }}
                  data-testid="canvas-signature"
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-400 text-lg italic">{text.signHere}</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 border-b-2 border-gray-300" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isEmpty}
                data-testid="button-clear-signature"
              >
                <Eraser className="w-4 h-4 mr-1" />
                {text.clear}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={isEmpty}
                data-testid="button-undo-signature"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {text.undo}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isEmpty}
                data-testid="button-download-signature"
              >
                <Download className="w-4 h-4 mr-1" />
                {text.download}
              </Button>
              <label>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="button-upload-signature"
                >
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    {text.upload}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel-signature"
          >
            {text.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isEmpty || saveMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-save-signature"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? text.saving : text.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SignaturePadCapture;
