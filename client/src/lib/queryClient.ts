import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { csrfFetch } from "./csrf";

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
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
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
      queryFn: getQueryFn({ on401: "returnNull" }), // Return null instead of throwing on 401
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 30 * 1000, // 30 seconds - balance between performance and freshness
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error.message?.includes('401')) return false;
        return failureCount < 1; // Réduit de 2 à 1
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error.message?.includes('401')) return false;
        return failureCount < 1;
      },
    },
  },
});
