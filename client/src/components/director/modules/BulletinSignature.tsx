import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Signature, Upload, Send, Trash2, Save, Eye } from 'lucide-react';

interface BulletinSignatureProps {
  bulletinId: number;
  studentName: string;
  onSignAndSend: (signatureData: string, signerInfo: any) => void;
}

const BulletinSignature: React.FC<BulletinSignatureProps> = ({ 
  bulletinId, 
  studentName, 
  onSignAndSend 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string>('');
  const [signerName, setSignerName] = useState('');
  const [signerPosition, setSignerPosition] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();

  // Fonctions de dessin sur canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redessiner le fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Upload de fichier signature
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' ? 
            'Le fichier est trop volumineux (max 2MB)' : 
            'File too large (max 2MB)',
          variant: 'destructive'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarder et envoyer
  const handleSignAndSend = async () => {
    if (!signerName.trim() || !signerPosition) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 
          'Veuillez remplir toutes les informations' : 
          'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    let signatureData = '';
    
    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        signatureData = canvas.toDataURL('image/png');
      }
    } else {
      signatureData = uploadedSignature;
    }

    if (!signatureData) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 
          'Veuillez créer ou télécharger une signature' : 
          'Please create or upload a signature',
        variant: 'destructive'
      });
      return;
    }

    const signerInfo = {
      name: signerName,
      position: signerPosition,
      signatureType: signatureMode,
      signedAt: new Date().toISOString()
    };

    try {
      await onSignAndSend(signatureData, signerInfo);
      setIsModalOpen(false);
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' ? 
          'Bulletin signé et envoyé avec succès!' : 
          'Bulletin signed and sent successfully!',
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 
          'Erreur lors de l\'envoi' : 
          'Error sending bulletin',
        variant: 'destructive'
      });
    }
  };

  // Initialiser le canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isModalOpen]);

  const translations = {
    fr: {
      signAndSend: 'Signer & Envoyer',
      digitalSignature: 'Signature Numérique',
      signatureFor: 'Signature pour',
      drawMode: 'Dessiner',
      uploadMode: 'Télécharger',
      signerName: 'Nom du signataire',
      signerPosition: 'Poste',
      director: 'Directeur',
      principalTeacher: 'Instituteur Principal',
      teacher: 'Enseignant',
      drawHere: 'Dessinez votre signature ici',
      uploadSignature: 'Télécharger signature',
      clear: 'Effacer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      preview: 'Aperçu',
      signerInfo: 'Informations du signataire',
      signatureMode: 'Mode de signature',
      required: 'requis',
      selectPosition: 'Sélectionner...',
      changeSignature: 'Changer',
      fileRequirements: 'PNG, JPG (max 2MB)',
      errorTitle: 'Erreur',
      successTitle: 'Succès',
      signatureSentSuccess: 'Bulletin signé et envoyé avec succès!',
      fillAllFields: 'Veuillez remplir toutes les informations',
      createOrUploadSignature: 'Veuillez créer ou télécharger une signature',
      sendingError: 'Erreur lors de l\'envoi',
      fileTooLarge: 'Le fichier est trop volumineux (max 2MB)'
    },
    en: {
      signAndSend: 'Sign & Send',
      digitalSignature: 'Digital Signature',
      signatureFor: 'Signature for',
      drawMode: 'Draw',
      uploadMode: 'Upload',
      signerName: 'Signer name',
      signerPosition: 'Position',
      director: 'Director',
      principalTeacher: 'Principal Teacher',
      teacher: 'Teacher',
      drawHere: 'Draw your signature here',
      uploadSignature: 'Upload signature',
      clear: 'Clear',
      cancel: 'Cancel',
      save: 'Save',
      preview: 'Preview',
      signerInfo: 'Signer Information',
      signatureMode: 'Signature Mode',
      required: 'required',
      selectPosition: 'Select...',
      changeSignature: 'Change',
      fileRequirements: 'PNG, JPG (max 2MB)',
      errorTitle: 'Error',
      successTitle: 'Success',
      signatureSentSuccess: 'Bulletin signed and sent successfully!',
      fillAllFields: 'Please fill all required fields',
      createOrUploadSignature: 'Please create or upload a signature',
      sendingError: 'Error sending bulletin',
      fileTooLarge: 'File too large (max 2MB)'
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          data-testid="button-open-signature"
        >
          <Signature className="w-4 h-4 mr-2" />
          {t.signAndSend}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t.digitalSignature}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {t.signatureFor}: <span className="font-semibold">{studentName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du signataire */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations du signataire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signer-name">{t.signerName} *</Label>
                  <Input
                    id="signer-name"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Ex: Dr. Jean Dupont"
                  />
                </div>
                <div>
                  <Label htmlFor="signer-position">{t.signerPosition} *</Label>
                  <Select value={signerPosition} onValueChange={setSignerPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">{t.director}</SelectItem>
                      <SelectItem value="principal_teacher">{t.principalTeacher}</SelectItem>
                      <SelectItem value="teacher">{t.teacher}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mode de signature */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mode de signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button
                  variant={signatureMode === 'draw' ? 'default' : 'outline'}
                  onClick={() => setSignatureMode('draw')}
                >
                  <Signature className="w-4 h-4 mr-2" />
                  {t.drawMode}
                </Button>
                <Button
                  variant={signatureMode === 'upload' ? 'default' : 'outline'}
                  onClick={() => setSignatureMode('upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t.uploadMode}
                </Button>
              </div>

              {/* Zone de signature */}
              {signatureMode === 'draw' ? (
                <div className="space-y-2">
                  <Label>{t.drawHere}</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="border border-gray-300 rounded cursor-crosshair w-full bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearCanvas}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.clear}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>{t.uploadSignature}</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploadedSignature ? (
                      <div className="text-center">
                        <img 
                          src={uploadedSignature} 
                          alt="Signature" 
                          className="max-h-32 mx-auto border rounded"
                        />
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Changer
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {t.uploadSignature}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG (max 2MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={handleSignAndSend}
              className="bg-green-600 hover:bg-green-700"
              disabled={!signerName.trim() || !signerPosition}
            >
              <Send className="w-4 h-4 mr-2" />
              {t.signAndSend}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulletinSignature;