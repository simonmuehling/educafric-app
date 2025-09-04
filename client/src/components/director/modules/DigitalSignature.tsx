import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PenTool, 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  FileText,
  Send,
  Users,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DigitalSignatureProps {
  userRole: 'director' | 'principal_teacher';
  language: string;
  onSignatureComplete: (signatureData: string, userRole: string) => void;
}

export const DigitalSignature: React.FC<DigitalSignatureProps> = ({ 
  userRole, 
  language, 
  onSignatureComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setUploadedSignature(result);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: language === 'fr' ? 'Format invalide' : 'Invalid format',
          description: language === 'fr' ? 'Veuillez sélectionner un fichier image' : 'Please select an image file',
          variant: 'destructive',
        });
      }
    }
  };

  const saveSignature = async () => {
    const finalSignature = signature || uploadedSignature;
    if (!finalSignature) {
      toast({
        title: language === 'fr' ? 'Signature manquante' : 'Missing signature',
        description: language === 'fr' ? 'Veuillez créer ou télécharger une signature' : 'Please create or upload a signature',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/signatures/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureData: finalSignature,
          userRole: userRole,
          signatureType: signature ? 'drawn' : 'uploaded'
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Signature sauvegardée' : 'Signature saved',
          description: language === 'fr' ? 'Votre signature a été enregistrée avec succès' : 'Your signature has been saved successfully',
        });
        onSignatureComplete(finalSignature, userRole);
      } else {
        throw new Error('Failed to save signature');
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur de sauvegarde' : 'Save error',
        description: language === 'fr' ? 'Impossible de sauvegarder la signature' : 'Unable to save signature',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sendBulletins = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/bulletins/send-signed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRole: userRole
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: language === 'fr' ? 'Bulletins envoyés ✅' : 'Reports sent ✅',
          description: language === 'fr' 
            ? `${result.sentCount} bulletins envoyés aux élèves et parents`
            : `${result.sentCount} reports sent to students and parents`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur d\'envoi' : 'Sending error',
        description: language === 'fr' ? 'Impossible d\'envoyer les bulletins' : 'Unable to send reports',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const roleTitle = userRole === 'director' 
    ? (language === 'fr' ? 'Signature du Directeur' : 'Director\'s Signature')
    : (language === 'fr' ? 'Signature du Professeur Principal' : 'Principal Teacher\'s Signature');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <PenTool className="w-4 h-4 mr-2" />
          {language === 'fr' ? 'Signer & Envoyer' : 'Sign & Send'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {roleTitle}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="draw" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">
              <PenTool className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Dessiner' : 'Draw'}
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Télécharger' : 'Upload'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {language === 'fr' ? 'Dessinez votre signature ci-dessous:' : 'Draw your signature below:'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="border border-gray-200 rounded cursor-crosshair bg-white w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={clearSignature}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Effacer' : 'Clear'}
                  </Button>
                  {signature && (
                    <Button variant="outline" onClick={() => {
                      const link = document.createElement('a');
                      link.download = `signature-${userRole}.png`;
                      link.href = signature;
                      link.click();
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Télécharger' : 'Download'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {language === 'fr' ? 'Téléchargez votre signature:' : 'Upload your signature:'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'fr' 
                      ? 'Cliquez ou glissez votre fichier de signature ici' 
                      : 'Click or drag your signature file here'
                    }
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    PNG, JPG, GIF {language === 'fr' ? 'supportés' : 'supported'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedSignature && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <img 
                      src={uploadedSignature} 
                      alt="Uploaded signature" 
                      className="max-h-32 mx-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            onClick={saveSignature} 
            disabled={!signature && !uploadedSignature || isSaving}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            {isSaving 
              ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') 
              : (language === 'fr' ? 'Sauvegarder Signature' : 'Save Signature')
            }
          </Button>
          
          <Button 
            onClick={sendBulletins}
            disabled={!signature && !uploadedSignature || isSending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending 
              ? (language === 'fr' ? 'Envoi...' : 'Sending...') 
              : (language === 'fr' ? 'Envoyer Bulletins' : 'Send Reports')
            }
          </Button>
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">
              {language === 'fr' ? 'Envoi Automatique:' : 'Automatic Sending:'}
            </span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {language === 'fr' 
                ? 'Bulletins signés envoyés aux élèves par email/SMS' 
                : 'Signed reports sent to students via email/SMS'
              }
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {language === 'fr' 
                ? 'Notifications automatiques aux parents' 
                : 'Automatic notifications to parents'
              }
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {language === 'fr' 
                ? 'Historique des envois sauvegardé' 
                : 'Sending history saved'
              }
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};