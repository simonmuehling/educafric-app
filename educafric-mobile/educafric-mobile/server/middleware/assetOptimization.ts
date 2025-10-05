import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Minimal asset optimization for maximum performance
export const assetOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Fast path - only handle core asset types to reduce processing
  const assetMatch = req.url.match(/\.(css|js|png|jpg|ico|woff2?)$/);
  if (!assetMatch) {
    return next();
  }

  // Minimal caching headers only
  if (req.url.includes('?v=')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
  
  next();
};

// Minimal CSS optimization
export const cssOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.url.endsWith('.css')) {
    return next();
  }

  res.setHeader('Content-Type', 'text/css; charset=utf-8');
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

// Minimal image optimization
export const imageOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const match = req.url.match(/\.(png|jpg|ico)$/);
  if (!match) {
    return next();
  }

  // Just basic MIME type for critical images
  const ext = match[1];
  if (ext === 'png') res.setHeader('Content-Type', 'image/png');
  else if (ext === 'jpg') res.setHeader('Content-Type', 'image/jpeg');
  else if (ext === 'ico') res.setHeader('Content-Type', 'image/x-icon');
  
  next();
};

// Bundle size optimization with preload injection
export const bundleOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only inject preload hints for critical resources in production HTML responses
  // Skip in development to avoid incorrect /assets paths that don't exist in Vite dev mode
  if ((req.url === '/' || req.url.endsWith('.html')) && process.env.NODE_ENV === 'production') {
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