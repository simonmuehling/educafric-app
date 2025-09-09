import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Asset optimization middleware with aggressive caching and preload hints
export const assetOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip if not a static asset request
  if (!req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Add performance headers for assets
  res.setHeader('X-Asset-Optimized', 'true');
  
  // AGGRESSIVE caching for maximum performance
  const isVersioned = req.url.includes('?v=') || req.url.includes('&v=');
  if (isVersioned) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for versioned assets
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800'); // 1 day with stale serving for 1 week
  }

  // Add preload hints for critical resources
  if (req.url.match(/\.(css|js)$/)) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Add resource hints for better loading performance
    if (req.url.includes('main') || req.url.includes('vendor') || req.url.includes('index')) {
      // Note: Preload hints removed as /api/preload-hints endpoint doesn't exist
      res.setHeader('X-Critical-Resource', 'true');
    }
  }

  // Add CORS headers for fonts with preload optimization
  if (req.url.match(/\.(woff|woff2|ttf|eot)$/)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', req.url.endsWith('.woff2') ? 'font/woff2' : 'font/woff');
  }

  // Add compression hints
  res.setHeader('Vary', 'Accept-Encoding');
  
  next();
};

// CSS optimization for development
export const cssOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.url.endsWith('.css')) {
    return next();
  }

  // Add CSS optimization headers
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('X-CSS-Optimized', 'true');

  // Enable compression for CSS
  if (!res.getHeader('Content-Encoding')) {
    res.setHeader('Vary', 'Accept-Encoding');
  }

  next();
};

// JavaScript optimization for development with CRITICAL MIME type fix
export const jsOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.url.match(/\.(js|jsx|ts|tsx)$/)) {
    return next();
  }

  // 🚫 CRITICAL FIX: Set correct MIME type for ES modules to prevent HTML responses
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  
  // Add JS optimization headers
  res.setHeader('X-JS-Optimized', 'true');
  
  // Enable source maps in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-SourceMap', req.url + '.map');
  }

  next();
};

// Image optimization middleware
export const imageOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    return next();
  }

  // Add image optimization headers
  res.setHeader('X-Image-Optimized', 'true');
  
  // Add appropriate MIME types
  const ext = path.extname(req.url).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };

  const mimeType = mimeTypes[ext];
  if (mimeType) {
    res.setHeader('Content-Type', mimeType);
  }

  // Enable long-term caching for images
  res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days

  next();
};

// Bundle size optimization with preload injection
export const bundleOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Inject preload hints for critical resources in HTML responses
  if (req.url === '/' || req.url.endsWith('.html')) {
    const originalSend = res.send;
    res.send = function(body: any) {
      if (body && typeof body === 'string' && body.includes('<head>')) {
        // Inject critical resource preloads to speed up loading
        const preloadHints = `
          <link rel="preload" href="/assets/main.css" as="style">
          <link rel="preload" href="/assets/vendor.js" as="script">
          <link rel="preload" href="/assets/main.js" as="script">
          <link rel="dns-prefetch" href="//fonts.googleapis.com">
          <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
        `;
        body = body.replace('<head>', `<head>${preloadHints}`);
      }
      
      const size = Buffer.byteLength(body, 'utf8');
      
      // Log large responses (>50KB for tighter monitoring)
      if (size > 50 * 1024) {
        console.warn(`[BUNDLE_SIZE] Large response: ${req.method} ${req.url} - ${(size / 1024).toFixed(1)}KB`);
      }

      // Add size header
      res.setHeader('X-Response-Size', `${(size / 1024).toFixed(1)}KB`);
      return originalSend.call(this, body);
    };
  }

  next();
};

export default {
  assetOptimizationMiddleware,
  cssOptimizationMiddleware,
  jsOptimizationMiddleware,
  imageOptimizationMiddleware,
  bundleOptimizationMiddleware
};