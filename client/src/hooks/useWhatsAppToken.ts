/**
 * Hook to generate WhatsApp Click-to-Chat tokens
 */

import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface TokenParams {
  recipientId: number;
  templateId: string;
  templateData?: Record<string, any>;
  lang?: 'fr' | 'en';
}

interface TokenResponse {
  success: boolean;
  token?: string;
  link?: string;
  fullUrl?: string;
  error?: string;
}

export function useWhatsAppToken() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = async (params: TokenParams): Promise<TokenResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/api/wa/mint', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }) as TokenResponse;

      setLoading(false);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate WhatsApp token';
      setError(errorMsg);
      setLoading(false);
      return null;
    }
  };

  return {
    generateToken,
    loading,
    error
  };
}
