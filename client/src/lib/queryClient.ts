import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { csrfFetch } from "./csrf";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = await res.text();
      let errorMessage = '';
      
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || text;
      } catch {
        errorMessage = text;
      }
      
      // Return user-friendly error message without technical details
      throw new Error(errorMessage || 'Request failed');
    } catch (parseError) {
      // Generic user-friendly error for network issues
      throw new Error('Network error. Please check your connection.');
    }
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
      staleTime: 15 * 60 * 1000, // 15 minutes cache - optimized for 3500+ users
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection - enterprise scale
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
