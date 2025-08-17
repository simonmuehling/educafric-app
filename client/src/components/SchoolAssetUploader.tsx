import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "./ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { School, Stamp, PenTool, Upload, Check } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface SchoolAssetUploaderProps {
  schoolId: number;
  onAssetUploaded?: (assetType: string, assetUrl: string) => void;
  className?: string;
}

interface AssetStatus {
  logo: string | null;
  stamp: string | null;
  directorSignature: string | null;
}

/**
 * Composant pour gérer l'upload des assets d'école :
 * - Logo de l'établissement
 * - Tampon officiel
 * - Signature du directeur
 */
export function SchoolAssetUploader({ 
  schoolId, 
  onAssetUploaded, 
  className = "" 
}: SchoolAssetUploaderProps) {
  const { toast } = useToast();
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const [assetStatus, setAssetStatus] = useState<AssetStatus>({
    logo: null,
    stamp: null,
    directorSignature: null
  });

  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST"
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload parameters');
      }
      
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

  const handleUploadComplete = async (
    assetType: string, 
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;

      try {
        // Update school asset in backend
        const assetData: any = { assetType };
        if (assetType === 'logo') assetData.logoUrl = uploadURL;
        if (assetType === 'stamp') assetData.stampUrl = uploadURL;
        if (assetType === 'director_signature') assetData.directorSignatureUrl = uploadURL;
        
        const response = await fetch(`/api/schools/${schoolId}/assets`, {
          method: "POST",
          body: JSON.stringify(assetData),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          setAssetStatus(prev => ({
            ...prev,
            [assetType as keyof AssetStatus]: uploadURL || ""
          }));
          
          onAssetUploaded?.(assetType, uploadURL);
          
          toast({
            title: "Asset téléchargé",
            description: `${getAssetLabel(assetType)} a été téléchargé avec succès`,
          });
        } else {
          throw new Error('Failed to update asset');
        }
      } catch (error) {
        console.error("Error updating school asset:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'asset",
          variant: "destructive",
        });
      }
    }
    
    setUploadingAsset(null);
  };

  const getAssetLabel = (assetType: string): string => {
    switch (assetType) {
      case 'logo': return 'Logo de l\'établissement';
      case 'stamp': return 'Tampon officiel';
      case 'director_signature': return 'Signature du directeur';
      default: return 'Asset';
    }
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'logo': return <School className="w-5 h-5" />;
      case 'stamp': return <Stamp className="w-5 h-5" />;
      case 'director_signature': return <PenTool className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  const AssetCard = ({ 
    assetType, 
    title, 
    description, 
    color 
  }: { 
    assetType: string; 
    title: string; 
    description: string; 
    color: string;
  }) => {
    const isUploaded = assetStatus[assetType as keyof AssetStatus];
    const isUploading = uploadingAsset === assetType;

    return (
      <Card className={`border-2 ${isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${color}`}>
                {getAssetIcon(assetType)}
              </div>
              <span className="text-sm font-medium">{title}</span>
            </div>
            {isUploaded && <Check className="w-5 h-5 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{description}</p>
          
          {isUploaded && (
            <div className="p-2 border rounded-lg bg-white">
              <img 
                src={isUploaded} 
                alt={title}
                className="max-h-16 max-w-full object-contain mx-auto"
              />
            </div>
          )}

          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={5242880} // 5MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={(result) => handleUploadComplete(assetType, result)}
            buttonClassName="w-full"
          >
            <div className="flex items-center gap-2">
              {isUploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Téléchargement...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isUploaded ? 'Remplacer' : 'Télécharger'}</span>
                </>
              )}
            </div>
          </ObjectUploader>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Assets de l'Établissement
        </h2>
        <p className="text-gray-600">
          Téléchargez les éléments visuels officiels de votre établissement
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline">PNG recommandé</Badge>
          <Badge variant="outline">Max 5MB</Badge>
          <Badge variant="outline">Transparent si possible</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AssetCard
          assetType="logo"
          title="Logo École"
          description="Logo officiel de l'établissement utilisé sur les bulletins et documents"
          color="bg-blue-100 text-blue-600"
        />
        
        <AssetCard
          assetType="stamp"
          title="Tampon Officiel"
          description="Tampon administratif pour authentifier les documents officiels"
          color="bg-purple-100 text-purple-600"
        />
        
        <AssetCard
          assetType="director_signature"
          title="Signature Directeur"
          description="Signature numérisée du directeur pour les bulletins et certificats"
          color="bg-green-100 text-green-600"
        />
      </div>

      <Card className="border-dashed border-2 border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-orange-800 mb-2">
            Conseils pour de meilleurs résultats
          </h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Utilisez des images haute résolution (300 DPI minimum)</li>
            <li>• Format PNG avec transparence pour une meilleure intégration</li>
            <li>• Évitez les arrière-plans colorés</li>
            <li>• Scannez les signatures à 600 DPI minimum</li>
            <li>• Vérifiez que les tampons sont bien lisibles</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}