import React, { useState, useEffect, useCallback } from 'react';
import { addCacheBuster, getFallbackImageUrl, ImageLoadManager } from '@/utils/imageUtils';
import { useImageRefreshState } from '@/contexts/ImageRefreshContext';
import { cn } from '@/lib/utils';

interface EnhancedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'onLoad'> {
  src: string | null | undefined;
  fallbackType?: 'avatar' | 'logo' | 'signature' | 'stamp' | 'photo';
  enableCacheBusting?: boolean;
  showLoadingSpinner?: boolean;
  fallbackClassName?: string;
  onImageLoad?: (success: boolean) => void;
}

/**
 * Enhanced image component with cache-busting, error handling, and loading states
 */
export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  fallbackType = 'photo',
  enableCacheBusting = true,
  showLoadingSpinner = false,
  fallbackClassName,
  onImageLoad,
  className,
  alt = '',
  ...props
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const { refreshCounter } = useImageRefreshState(src || undefined);

  // Update current src when props change or refresh is triggered
  useEffect(() => {
    if (src) {
      const cacheBustedSrc = enableCacheBusting ? addCacheBuster(src, refreshCounter) : src;
      setCurrentSrc(cacheBustedSrc);
      setImageState('loading');
    } else {
      setCurrentSrc('');
      setImageState('error');
    }
  }, [src, enableCacheBusting, refreshCounter]);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onImageLoad?.(true);
    if (currentSrc) {
      ImageLoadManager.setLoadState(currentSrc, 'loaded');
    }
  }, [currentSrc, onImageLoad]);

  const handleError = useCallback(() => {
    setImageState('error');
    onImageLoad?.(false);
    if (currentSrc) {
      ImageLoadManager.setLoadState(currentSrc, 'error');
    }
  }, [currentSrc, onImageLoad]);

  // Show loading spinner if enabled and image is loading
  if (showLoadingSpinner && imageState === 'loading' && currentSrc) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100', className)} {...props}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  // Show fallback if no src or error occurred
  if (!currentSrc || imageState === 'error') {
    const fallbackSrc = getFallbackImageUrl(fallbackType);
    return (
      <img
        src={fallbackSrc}
        alt={alt || `${fallbackType} fallback`}
        className={cn(className, fallbackClassName)}
        data-testid={`img-fallback-${fallbackType}`}
        {...props}
      />
    );
  }

  // Show actual image
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(className, imageState === 'loading' && 'opacity-75')}
      onLoad={handleLoad}
      onError={handleError}
      data-testid="img-enhanced"
      {...props}
    />
  );
};

interface ResponsiveImageProps extends Omit<EnhancedImageProps, 'sizes'> {
  responsiveSizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

/**
 * Responsive enhanced image component
 */
export const ResponsiveEnhancedImage: React.FC<ResponsiveImageProps> = ({
  responsiveSizes,
  className,
  ...props
}) => {
  const responsiveClassName = cn(
    responsiveSizes?.mobile && `max-w-[${responsiveSizes.mobile}]`,
    responsiveSizes?.tablet && `md:max-w-[${responsiveSizes.tablet}]`,
    responsiveSizes?.desktop && `lg:max-w-[${responsiveSizes.desktop}]`,
    className
  );

  return (
    <EnhancedImage
      className={responsiveClassName}
      {...props}
    />
  );
};