import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addCacheBuster, getInitials } from '@/utils/imageUtils';
import { useImageRefreshState } from '@/contexts/ImageRefreshContext';
import { cn } from '@/lib/utils';

interface EnhancedAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  enableCacheBusting?: boolean;
  fallbackClassName?: string;
  imageClassName?: string;
  onImageLoad?: (success: boolean) => void;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const fallbackTextSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base', 
  xl: 'text-lg'
};

/**
 * Enhanced Avatar component with cache-busting and better fallback handling
 */
export const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  enableCacheBusting = true,
  fallbackClassName,
  imageClassName,
  onImageLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const { refreshCounter } = useImageRefreshState(src || undefined);

  // Update image src when props change or refresh is triggered  
  useEffect(() => {
    if (src) {
      const cacheBustedSrc = enableCacheBusting ? addCacheBuster(src, refreshCounter) : src;
      setImageSrc(cacheBustedSrc);
      setImageLoaded(false);
    } else {
      setImageSrc('');
      setImageLoaded(false);
    }
  }, [src, enableCacheBusting, refreshCounter]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad?.(true);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    onImageLoad?.(false);
  };

  const initials = getInitials(name);

  return (
    <Avatar className={cn(sizeClasses[size], className)} data-testid="avatar-enhanced">
      {imageSrc && (
        <AvatarImage 
          src={imageSrc}
          alt={name || 'Avatar'}
          className={cn(imageClassName)}
          onLoad={handleImageLoad}
          onError={handleImageError}
          data-testid="avatar-image"
        />
      )}
      <AvatarFallback 
        className={cn(
          'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium',
          fallbackTextSizes[size],
          fallbackClassName
        )}
        data-testid="avatar-fallback"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

/**
 * Avatar with upload indicator - shows a small upload icon when uploading
 */
interface UploadableAvatarProps extends EnhancedAvatarProps {
  isUploading?: boolean;
  uploadProgress?: number;
}

export const UploadableAvatar: React.FC<UploadableAvatarProps> = ({
  isUploading = false,
  uploadProgress,
  className,
  ...props
}) => {
  return (
    <div className="relative inline-block">
      <EnhancedAvatar 
        className={cn(
          isUploading && 'opacity-60',
          className
        )}
        {...props}
      />
      
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-2">
            {uploadProgress !== undefined ? (
              <div className="text-white text-xs font-medium">
                {Math.round(uploadProgress)}%
              </div>
            ) : (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};