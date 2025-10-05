import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedAvatar, UploadableAvatar } from '@/components/ui/enhanced-avatar';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { ObjectUploader } from '@/components/ObjectUploader';
import { useImageRefreshContext } from '@/contexts/ImageRefreshContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Trash2, RefreshCw } from 'lucide-react';
import type { UploadResult } from '@uppy/core';

interface ImageUploadWithPreviewProps {
  currentImageUrl?: string | null;
  imageType?: 'avatar' | 'logo' | 'signature' | 'stamp' | 'photo';
  uploadEndpoint?: string;
  onImageUploaded?: (imageUrl: string) => void;
  onImageDeleted?: () => void;
  title?: string;
  description?: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  showDeleteButton?: boolean;
  showRefreshButton?: boolean;
  userName?: string; // For avatar initials
  className?: string;
}

/**
 * Comprehensive image upload component with preview, error handling, and cache-busting
 */
export const ImageUploadWithPreview: React.FC<ImageUploadWithPreviewProps> = ({
  currentImageUrl,
  imageType = 'photo',
  uploadEndpoint = '/api/objects/upload',
  onImageUploaded,
  onImageDeleted,
  title,
  description,
  maxFileSize = 5242880, // 5MB
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showDeleteButton = true,
  showRefreshButton = true,
  userName,
  className = ''
}) => {
  const { toast } = useToast();
  const { refreshImages, refreshSpecificImage, getImageKey } = useImageRefreshContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const handleGetUploadParameters = useCallback(async () => {
    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload parameters');
      }
      
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  }, [uploadEndpoint]);

  const handleUploadComplete = useCallback(async (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => {
    setIsUploading(false);
    setUploadProgress(undefined);

    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;

      if (uploadURL) {
        // Trigger image refresh to force cache-busting
        if (currentImageUrl) {
          refreshSpecificImage(getImageKey(currentImageUrl));
        } else {
          refreshImages();
        }
        
        onImageUploaded?.(uploadURL);
        
        toast({
          title: 'Image téléchargée',
          description: 'L\'image a été téléchargée avec succès',
        });
      }
    } else {
      toast({
        title: 'Erreur de téléchargement',
        description: 'Impossible de télécharger l\'image',
        variant: 'destructive',
      });
    }
  }, [currentImageUrl, getImageKey, refreshSpecificImage, refreshImages, onImageUploaded, toast]);

  const handleDeleteImage = useCallback(async () => {
    try {
      if (currentImageUrl) {
        refreshSpecificImage(getImageKey(currentImageUrl));
      }
      
      onImageDeleted?.();
      
      toast({
        title: 'Image supprimée',
        description: 'L\'image a été supprimée avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'image',
        variant: 'destructive',
      });
    }
  }, [currentImageUrl, getImageKey, refreshSpecificImage, onImageDeleted, toast]);

  const handleRefreshImage = useCallback(() => {
    if (currentImageUrl) {
      refreshSpecificImage(getImageKey(currentImageUrl));
    } else {
      refreshImages();
    }
  }, [currentImageUrl, getImageKey, refreshSpecificImage, refreshImages]);

  const renderImagePreview = () => {
    if (imageType === 'avatar') {
      return (
        <div className="flex justify-center mb-4">
          <UploadableAvatar
            src={currentImageUrl}
            name={userName}
            size="xl"
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onImageLoad={(success) => {
              if (!success) {
                console.warn('Failed to load avatar image:', currentImageUrl);
              }
            }}
          />
        </div>
      );
    }

    return currentImageUrl ? (
      <div className="relative mb-4">
        <EnhancedImage
          src={currentImageUrl}
          alt={title || `${imageType} image`}
          fallbackType={imageType}
          className="w-full max-h-48 object-contain rounded-lg border"
          enableCacheBusting={true}
          showLoadingSpinner={true}
          onImageLoad={(success) => {
            if (!success) {
              console.warn(`Failed to load ${imageType} image:`, currentImageUrl);
            }
          }}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-white">
              {uploadProgress !== undefined ? `${Math.round(uploadProgress)}%` : 'Uploading...'}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 mb-4">
        <div className="text-center text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-2" />
          <p>Aucune image</p>
        </div>
      </div>
    );
  };

  return (
    <Card className={`${className}`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {renderImagePreview()}

        <div className="flex flex-wrap gap-2">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={maxFileSize}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="flex-1"
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
                  <span>{currentImageUrl ? 'Remplacer' : 'Télécharger'}</span>
                </>
              )}
            </div>
          </ObjectUploader>

          {showRefreshButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshImage}
              disabled={isUploading}
              data-testid="button-refresh-image"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {showDeleteButton && currentImageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteImage}
              disabled={isUploading}
              data-testid="button-delete-image"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {acceptedFormats.length > 0 && (
          <p className="text-xs text-gray-500">
            Formats acceptés: {acceptedFormats.join(', ')} • Max: {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
        )}
      </CardContent>
    </Card>
  );
};