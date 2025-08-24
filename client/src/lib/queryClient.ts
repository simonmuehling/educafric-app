import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText || 'Unknown error'}`);
    } catch (parseError) {
      // If response parsing fails, throw original status error
      throw new Error(`${res.status}: ${res.statusText || 'Request failed'}`);
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
      throw new Error('Invalid HTTP method provided');
    }
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }
    
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Enhance error with context for better debugging
    if (error instanceof Error) {
      error.message = `API Request failed (${method} ${url}): ${error.message}`;
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
// Fixed default queryFn to handle proper URL formatting
async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }) {
  // Convention: queryKey = [url, params?]
  const [url, params] = queryKey as [string, Record<string, any>?];
  
  // Build URL with params if provided
  let finalUrl = url;
  if (params) {
    const urlObj = new URL(url, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.set(key, String(value));
      }
    });
    finalUrl = urlObj.toString();
  }

  const res = await fetch(finalUrl, {
    method: 'GET',
    credentials: 'include',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // Handle 401 gracefully
  if (res.status === 401) {
    return null;
  }

  // Handle 401 gracefully - don't try to parse HTML as JSON
  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} :: ${text.slice(0, 120)}`);
  }

  // Check content type before trying to parse JSON
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const sample = (await res.text().catch(() => '')).slice(0, 120);
    throw new Error(`Expected JSON from ${res.url}, got "${contentType}". Sample: ${sample}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

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
      queryFn: defaultQueryFn, // Use the improved default queryFn
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
