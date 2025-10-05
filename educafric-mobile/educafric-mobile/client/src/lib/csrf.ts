/**
 * CSRF Token Management for Educafric
 * Handles CSRF token fetching and validation
 */

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Fetch CSRF token from server
 * Tokens are cached for 5 minutes to reduce server requests
 */
export async function getCsrfToken(): Promise<string | null> {
  try {
    // Return cached token if still valid
    if (cachedToken && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('[CSRF] Failed to fetch token:', response.status);
      return null;
    }

    const data = await response.json();
    cachedToken = data.csrfToken || null;
    tokenExpiry = Date.now() + (5 * 60 * 1000); // Cache for 5 minutes

    return cachedToken;
  } catch (error) {
    console.error('[CSRF] Error fetching token:', error);
    return null;
  }
}

/**
 * Clear cached CSRF token (use after logout or token errors)
 */
export function clearCsrfToken() {
  cachedToken = null;
  tokenExpiry = 0;
}

/**
 * Enhanced fetch with automatic CSRF token handling
 * Exempts WhatsApp Click-to-Chat and public endpoints
 */
export async function csrfFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Exemptions: WhatsApp Click-to-Chat and other public endpoints
  const isExempt = 
    url === '/api/wa/mint' ||
    url.startsWith('/wa/') ||
    url.startsWith('/api/auth/login') ||
    url.startsWith('/api/auth/register');

  const headers = new Headers(options.headers || {});
  
  // Add CSRF token for state-changing requests (except exempted routes)
  if (needsCsrf && !isExempt) {
    const token = await getCsrfToken();
    if (token) {
      headers.set('x-csrf-token', token);
    } else {
      console.warn('[CSRF] No token available for request:', url);
    }
  }

  // Always include credentials for session cookies
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}

/**
 * JSON helper for CSRF-protected requests
 */
export async function csrfFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const response = await csrfFetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Clear token on 403 (CSRF failure) to force refresh
    if (response.status === 403) {
      clearCsrfToken();
    }
    
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }

  return response.json();
}
