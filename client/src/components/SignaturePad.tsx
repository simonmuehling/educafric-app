import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Download, Save, Upload } from "lucide-react";
import { ObjectUploader } from "./ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SignaturePadProps {
  onSignatureSave?: (signature: string) => void;
  title?: string;
  userType: "director" | "teacher" | "admin";
  userId: number;
  existingSignature?: string;
  className?: string;
}

export function SignaturePad({
  onSignatureSave,
  title = "Signature Électronique",
  userType,
  userId,
  existingSignature,
  className = "",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [currentSignature, setCurrentSignature] = useState(existingSignature);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 200;

    // Set drawing styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    try {
      const signatureDataUrl = canvas.toDataURL("image/png");
      
      // Save to server
      const response = await fetch(`/api/users/${userId}/signature`, {
        method: "POST",
        body: JSON.stringify({
          signature: signatureDataUrl,
          userType
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setCurrentSignature(signatureDataUrl);
        onSignatureSave?.(signatureDataUrl);
        toast({
          title: "Signature sauvegardée",
          description: "Votre signature a été enregistrée avec succès",
        });
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la signature",
        variant: "destructive",
      });
    }
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const link = document.createElement("a");
    link.download = `signature-${userType}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;

      try {
        // Update user signature URL
        const response = await fetch(`/api/users/${userId}/signature-upload`, {
          method: "POST",
          body: JSON.stringify({
            signatureUrl: uploadURL,
            userType
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentSignature(data.signatureUrl);
          toast({
            title: "Signature téléchargée",
            description: "Votre signature a été téléchargée avec succès",
          });
        }
      } catch (error) {
        console.error("Error updating signature URL:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la signature",
          variant: "destructive",
        });
      }
    }
  };

  const getUploadParameters = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST"
      });
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      throw error;
    }
  };

  return (
    <Card className={`w-full max-w-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {currentSignature && (
            <span className="text-sm text-green-600 font-normal">
              ✓ Signature enregistrée
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas for drawing signature */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded cursor-crosshair w-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            data-testid="signature-canvas"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Signez avec votre souris ou votre doigt
          </p>
        </div>

        {/* Current signature preview */}
        {currentSignature && (
          <div className="border rounded-lg p-2">
            <p className="text-xs text-gray-600 mb-2">Signature actuelle:</p>
            <img 
              src={currentSignature} 
              alt="Signature actuelle" 
              className="max-h-20 border rounded"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={clearCanvas}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            data-testid="button-clear-signature"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </Button>

          <Button
            onClick={downloadSignature}
            variant="outline"
            size="sm"
            disabled={isEmpty}
            className="flex items-center gap-1"
            data-testid="button-download-signature"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </Button>

          <Button
            onClick={saveSignature}
            size="sm"
            disabled={isEmpty}
            className="flex items-center gap-1"
            data-testid="button-save-signature"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </Button>

          <ObjectUploader
            onGetUploadParameters={getUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="flex items-center gap-1"
            maxNumberOfFiles={1}
            maxFileSize={5 * 1024 * 1024} // 5MB
          >
            <Upload className="w-4 h-4" />
            Télécharger fichier
          </ObjectUploader>
        </div>
      </CardContent>
    </Card>
  );
}