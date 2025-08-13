import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Debug simplifié en mode développement seulement
    if (import.meta.env.DEV && url.includes('/api/auth/')) {
      console.log(`[QUERY_REQUEST] GET ${url}`);
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (import.meta.env.DEV && (!res.ok || url.includes('/api/auth/'))) {
      console.log(`[QUERY_RESPONSE] ${res.status} ${url}`);
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      if (import.meta.env.DEV) {
        console.log(`[QUERY_401] Returning null for ${url}`);
      }
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
      staleTime: 10 * 60 * 1000, // 10 minutes cache (augmenté)
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
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
