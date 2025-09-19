import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ImageRefreshContextType {
  refreshCounter: number;
  refreshImages: () => void;
  refreshSpecificImage: (imageKey: string) => void;
  getImageKey: (url: string) => string;
  isImageRefreshing: (imageKey: string) => boolean;
}

const ImageRefreshContext = createContext<ImageRefreshContextType | undefined>(undefined);

interface ImageRefreshProviderProps {
  children: ReactNode;
}

/**
 * Context provider for managing global image refresh state
 * Allows components to trigger image refreshes and coordinate cache-busting
 */
export const ImageRefreshProvider: React.FC<ImageRefreshProviderProps> = ({ children }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [refreshingImages, setRefreshingImages] = useState<Set<string>>(new Set());

  const refreshImages = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
    console.log('[ImageRefresh] Global image refresh triggered');
  }, []);

  const refreshSpecificImage = useCallback((imageKey: string) => {
    setRefreshingImages(prev => new Set(prev).add(imageKey));
    setRefreshCounter(prev => prev + 1);
    
    // Clear refreshing state after a short delay
    setTimeout(() => {
      setRefreshingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageKey);
        return newSet;
      });
    }, 1000);
    
    console.log(`[ImageRefresh] Specific image refresh triggered: ${imageKey}`);
  }, []);

  const getImageKey = useCallback((url: string): string => {
    // Extract a unique key from the URL for tracking purposes
    if (!url) return '';
    
    // Remove cache-busting parameters and domain to get a clean key
    const cleanUrl = url.split('?')[0].split('#')[0];
    const urlParts = cleanUrl.split('/');
    return urlParts[urlParts.length - 1] || cleanUrl;
  }, []);

  const isImageRefreshing = useCallback((imageKey: string): boolean => {
    return refreshingImages.has(imageKey);
  }, [refreshingImages]);

  const value: ImageRefreshContextType = {
    refreshCounter,
    refreshImages,
    refreshSpecificImage,
    getImageKey,
    isImageRefreshing
  };

  return (
    <ImageRefreshContext.Provider value={value}>
      {children}
    </ImageRefreshContext.Provider>
  );
};

/**
 * Hook for accessing image refresh functionality
 */
export const useImageRefreshContext = (): ImageRefreshContextType => {
  const context = useContext(ImageRefreshContext);
  if (!context) {
    throw new Error('useImageRefreshContext must be used within an ImageRefreshProvider');
  }
  return context;
};

/**
 * Hook for image refresh with automatic cleanup
 * @param imageUrl - URL of the image to track
 * @returns Object with refresh functions and state
 */
export const useImageRefreshState = (imageUrl?: string) => {
  const {
    refreshCounter,
    refreshImages,
    refreshSpecificImage,
    getImageKey,
    isImageRefreshing
  } = useImageRefreshContext();

  const imageKey = imageUrl ? getImageKey(imageUrl) : '';
  const isRefreshing = imageUrl ? isImageRefreshing(imageKey) : false;

  const refreshThisImage = useCallback(() => {
    if (imageKey) {
      refreshSpecificImage(imageKey);
    } else {
      refreshImages();
    }
  }, [imageKey, refreshSpecificImage, refreshImages]);

  return {
    refreshCounter,
    refreshImages,
    refreshThisImage,
    isRefreshing,
    imageKey
  };
};