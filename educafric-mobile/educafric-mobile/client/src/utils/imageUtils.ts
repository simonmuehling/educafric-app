/**
 * Image utilities for handling cache-busting, error handling, and refresh mechanisms
 */

/**
 * Adds cache-busting parameter to image URL to force browser reload
 * @param url - The original image URL
 * @param refreshCounter - Optional refresh counter to incorporate for cache-busting
 * @returns URL with cache-busting parameter
 */
export function addCacheBuster(url: string | null | undefined, refreshCounter?: number): string {
  if (!url) return '';
  
  // Remove any existing cache-busting parameters first
  const baseUrl = url.split('?')[0];
  const urlParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
  
  // Remove old cache-busting parameter
  urlParams.delete('cb');
  
  // Create new cache-busting parameter
  const timestamp = refreshCounter ? `${Date.now()}-${refreshCounter}` : Date.now().toString();
  urlParams.set('cb', timestamp);
  
  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Creates a cache-busted URL with a specific timestamp
 * Useful for coordinating cache-busting across multiple components
 * @param url - The original image URL
 * @param timestamp - Specific timestamp to use for cache-busting
 * @returns URL with cache-busting parameter
 */
export function addCacheBusterWithTimestamp(url: string | null | undefined, timestamp: number): string {
  if (!url) return '';
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}cb=${timestamp}`;
}

/**
 * Generates a default fallback image URL for different image types
 * @param type - Type of image (avatar, logo, signature, etc.)
 * @returns URL for fallback image (data URL or public image)
 */
export function getFallbackImageUrl(type: 'avatar' | 'logo' | 'signature' | 'stamp' | 'photo' = 'avatar'): string {
  const fallbacks = {
    avatar: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="32" fill="#e2e8f0"/>
        <circle cx="32" cy="24" r="8" fill="#94a3b8"/>
        <path d="M16 52c0-8.8 7.2-16 16-16s16 7.2 16 16" fill="#94a3b8"/>
      </svg>
    `)}`,
    logo: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="#3b82f6" rx="8"/>
        <path d="M20 20h24v4H20zm0 8h24v4H20zm0 8h16v4H20z" fill="white"/>
        <circle cx="48" cy="16" r="4" fill="#fbbf24"/>
      </svg>
    `)}`,
    signature: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="#f1f5f9" rx="4"/>
        <path d="M8 32c4-8 8-8 12 0s8 8 12 0 8-8 12 0 8 8 12 0" 
              stroke="#64748b" stroke-width="2" fill="none"/>
        <circle cx="52" cy="28" r="2" fill="#64748b"/>
      </svg>
    `)}`,
    stamp: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="30" fill="none" stroke="#7c3aed" stroke-width="4"/>
        <circle cx="32" cy="32" r="20" fill="none" stroke="#7c3aed" stroke-width="2"/>
        <text x="32" y="36" text-anchor="middle" font-family="Arial" font-size="8" fill="#7c3aed">STAMP</text>
      </svg>
    `)}`,
    photo: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="#f8fafc"/>
        <rect x="12" y="12" width="40" height="40" fill="#e2e8f0" rx="4"/>
        <circle cx="24" cy="28" r="4" fill="#94a3b8"/>
        <path d="M12 44l8-8 4 4 8-8 20 20v4a4 4 0 01-4 4H16a4 4 0 01-4-4z" fill="#94a3b8"/>
      </svg>
    `)}`
  };
  
  return fallbacks[type] || fallbacks.avatar;
}

/**
 * Creates initials from a name for use in avatar fallbacks
 * @param name - Full name or first/last name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Image loading state manager for tracking load status
 */
export class ImageLoadManager {
  private static loadStates = new Map<string, 'loading' | 'loaded' | 'error'>();
  private static callbacks = new Map<string, Set<() => void>>();

  static getLoadState(url: string): 'loading' | 'loaded' | 'error' | null {
    return this.loadStates.get(url) || null;
  }

  static setLoadState(url: string, state: 'loading' | 'loaded' | 'error'): void {
    this.loadStates.set(url, state);
    
    // Notify all callbacks for this URL
    const callbacks = this.callbacks.get(url);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  static onLoadStateChange(url: string, callback: () => void): () => void {
    if (!this.callbacks.has(url)) {
      this.callbacks.set(url, new Set());
    }
    
    this.callbacks.get(url)!.add(callback);
    
    // Return cleanup function
    return () => {
      const callbacks = this.callbacks.get(url);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.callbacks.delete(url);
        }
      }
    };
  }

  static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.setLoadState(url, 'loaded');
        resolve();
      };
      
      img.onerror = () => {
        this.setLoadState(url, 'error');
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      this.setLoadState(url, 'loading');
      img.src = url;
    });
  }

  static clearCache(): void {
    this.loadStates.clear();
    this.callbacks.clear();
  }
}

// REMOVED: Global refresh system - now using unified ImageRefreshContext
// All refresh functionality consolidated in ImageRefreshContext for consistency