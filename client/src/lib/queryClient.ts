import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { csrfFetch } from "./csrf";
import { networkMonitor, isNetworkError, shouldRetryRequest } from "@/utils/networkMonitor";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = 'Request failed';
    
    try {
      const text = await res.text();
      
      if (text) {
        try {
          const json = JSON.parse(text);
          // Support bilingual error messages from backend
          errorMessage = json.messageFr || json.message || json.messageEn || json.error || text;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // If we can't read the response body, use status text
      errorMessage = res.statusText || 'Network error. Please check your connection.';
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Validate inputs
    if (!method || typeof method !== 'string') {
      throw new Error('Invalid request');
    }
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid request');
    }
    
    // Use csrfFetch for automatic CSRF token handling
    const res = await csrfFetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Keep error message user-friendly - no technical details
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

// FIXED: Properly serialize query keys to avoid cache collisions
// Previous implementation used join("/") which caused [object Object] issues
function serializeQueryKey(queryKey: readonly unknown[]): string {
  const parts: string[] = [];
  
  for (const segment of queryKey) {
    if (typeof segment === 'string') {
      parts.push(segment);
    } else if (typeof segment === 'number') {
      parts.push(String(segment));
    } else if (segment && typeof segment === 'object') {
      // Convert objects to URL query params to preserve uniqueness
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(segment)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
      const paramString = params.toString();
      if (paramString) {
        // Append as query string if we already have a base URL
        const hasBase = parts.length > 0 && parts[0].startsWith('/');
        if (hasBase && !parts[parts.length - 1].includes('?')) {
          parts[parts.length - 1] += '?' + paramString;
        } else if (hasBase) {
          parts[parts.length - 1] += '&' + paramString;
        } else {
          parts.push(paramString);
        }
      }
    }
  }
  
  // Join with "/" but avoid double slashes
  return parts.join('/').replace(/\/+/g, '/');
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Use proper serialization to avoid cache collisions
    const url = serializeQueryKey(queryKey);
    
    // Minimal logging to improve performance
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 15 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error: unknown) => {
        if (!networkMonitor.getStatus()) {
          console.log('[QueryClient] Offline - skipping retry');
          return false;
        }
        
        if (error instanceof Error) {
          if (error.message?.includes('401') || error.message?.includes('403')) {
            return false;
          }
          if (error.message?.includes('404') || error.message?.includes('400')) {
            return false;
          }
        }
        
        if (isNetworkError(error) && failureCount < 2) {
          console.log(`[QueryClient] Network error - retry ${failureCount + 1}/2`);
          return true;
        }
        
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        if (!networkMonitor.getStatus()) {
          return false;
        }
        
        return shouldRetryRequest(error, failureCount);
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});
