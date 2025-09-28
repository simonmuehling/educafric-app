/**
 * SERVICE MTN MOBILE MONEY
 * Intégration complète avec les APIs MTN Collection et Cashout
 * Support OAuth2 et gestion automatique des tokens
 */

import axios, { AxiosResponse } from 'axios';

interface MTNToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number; // Timestamp de création
}

interface MTNCollectionRequest {
  amount: number;
  currency: 'XAF';
  externalId: string;
  payer: {
    phoneNumber: string;
  };
  payerMessage?: string;
  payeeNote?: string;
}

interface MTNCollectionResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  amount: number;
  currency: string;
  externalId: string;
  reason?: string;
}

interface MTNCashoutRequest {
  amount: number;
  currency: 'XAF';
  externalId: string;
  payee: {
    phoneNumber: string;
  };
  payerMessage?: string;
  payeeNote?: string;
}

export class MTNMobileMoneyService {
  private static instance: MTNMobileMoneyService;
  private token: MTNToken | null = null;
  private readonly baseUrl = 'https://omapi-token.ynote.africa';
  private readonly clientId: string;
  private readonly clientSecret: string;

  private constructor() {
    this.clientId = process.env.MTN_CLIENT_ID || '';
    this.clientSecret = process.env.MTN_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.error('[MTN] ❌ MTN credentials not found in environment variables');
      throw new Error('MTN credentials not configured');
    }
    
    console.log('[MTN] ✅ MTN Mobile Money service initialized');
  }

  public static getInstance(): MTNMobileMoneyService {
    if (!MTNMobileMoneyService.instance) {
      MTNMobileMoneyService.instance = new MTNMobileMoneyService();
    }
    return MTNMobileMoneyService.instance;
  }

  /**
   * Étape 1: Récupération de l'Access Token via OAuth2
   */
  private async getAccessToken(): Promise<string> {
    try {
      console.log('[MTN] 🔑 Requesting access token...');
      
      // Créer l'authentification Basic Auth (base64 encode)
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response: AxiosResponse<MTNToken> = await axios.post(
        `${this.baseUrl}/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      const tokenData = response.data;
      
      // Stocker le token avec timestamp
      this.token = {
        ...tokenData,
        created_at: Date.now()
      };
      
      console.log('[MTN] ✅ Access token obtained successfully');
      console.log(`[MTN] 📅 Token expires in: ${tokenData.expires_in} seconds`);
      
      return tokenData.access_token;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to get access token:', error.response?.data || error.message);
      throw new Error(`MTN authentication failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Vérifier si le token est valide ou le renouveler
   */
  private async ensureValidToken(): Promise<string> {
    const now = Date.now();
    const tokenExpiryBuffer = 300; // 5 minutes avant expiration
    
    if (!this.token || 
        (now - this.token.created_at) / 1000 > (this.token.expires_in - tokenExpiryBuffer)) {
      console.log('[MTN] 🔄 Token expired or missing, refreshing...');
      return await this.getAccessToken();
    }
    
    return this.token.access_token;
  }

  /**
   * Collection API - Demander un paiement (paiement entrant)
   */
  public async requestPayment(request: MTNCollectionRequest): Promise<MTNCollectionResponse> {
    try {
      const token = await this.ensureValidToken();
      
      console.log('[MTN] 💰 Requesting payment collection...');
      console.log(`[MTN] 📱 Phone: ${request.payer.phoneNumber}`);
      console.log(`[MTN] 💵 Amount: ${request.amount} ${request.currency}`);
      
      const response: AxiosResponse<MTNCollectionResponse> = await axios.post(
        `${this.baseUrl}/v1/requesttopay`,
        {
          ...request,
          payerMessage: request.payerMessage || `Paiement EDUCAFRIC - ${request.externalId}`,
          payeeNote: request.payeeNote || 'Abonnement EDUCAFRIC'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Reference-Id': request.externalId,
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 30000
        }
      );
      
      console.log('[MTN] ✅ Payment request initiated successfully');
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Payment request failed:', error.response?.data || error.message);
      throw new Error(`MTN payment request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  public async checkPaymentStatus(referenceId: string): Promise<MTNCollectionResponse> {
    try {
      const token = await this.ensureValidToken();
      
      console.log(`[MTN] 🔍 Checking payment status for: ${referenceId}`);
      
      const response: AxiosResponse<MTNCollectionResponse> = await axios.get(
        `${this.baseUrl}/v1/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 10000
        }
      );
      
      console.log(`[MTN] 📊 Payment status: ${response.data.status}`);
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to check payment status:', error.response?.data || error.message);
      throw new Error(`MTN status check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Cashout API - Effectuer un paiement (paiement sortant)
   */
  public async sendPayment(request: MTNCashoutRequest): Promise<MTNCollectionResponse> {
    try {
      const token = await this.ensureValidToken();
      
      console.log('[MTN] 💸 Sending payment (cashout)...');
      console.log(`[MTN] 📱 To: ${request.payee.phoneNumber}`);
      console.log(`[MTN] 💵 Amount: ${request.amount} ${request.currency}`);
      
      const response: AxiosResponse<MTNCollectionResponse> = await axios.post(
        `${this.baseUrl}/v1/transfer`,
        {
          ...request,
          payerMessage: request.payerMessage || `Paiement EDUCAFRIC vers ${request.payee.phoneNumber}`,
          payeeNote: request.payeeNote || 'Paiement EDUCAFRIC'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Reference-Id': request.externalId,
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 30000
        }
      );
      
      console.log('[MTN] ✅ Payment sent successfully');
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Payment send failed:', error.response?.data || error.message);
      throw new Error(`MTN payment send failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtenir le solde du compte (si supporté par l'API)
   */
  public async getAccountBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const token = await this.ensureValidToken();
      
      console.log('[MTN] 💰 Checking account balance...');
      
      const response = await axios.get(
        `${this.baseUrl}/v1/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          timeout: 10000
        }
      );
      
      console.log(`[MTN] 💰 Balance: ${response.data.balance} ${response.data.currency}`);
      return response.data;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to get balance:', error.response?.data || error.message);
      throw new Error(`MTN balance check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Valider un numéro de téléphone MTN
   */
  public validateMTNNumber(phoneNumber: string): boolean {
    // Numéros MTN Cameroun: 67X XXX XXX, 65X XXX XXX, 68X XXX XXX
    const mtnPrefixes = ['67', '65', '68'];
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.startsWith('237')) {
      return mtnPrefixes.some(prefix => cleanNumber.startsWith(`237${prefix}`));
    }
    
    return mtnPrefixes.some(prefix => cleanNumber.startsWith(prefix));
  }

  /**
   * Formater un numéro de téléphone pour l'API MTN
   */
  public formatPhoneNumber(phoneNumber: string): string {
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Ajouter l'indicatif pays si manquant
    if (!cleanNumber.startsWith('237')) {
      cleanNumber = '237' + cleanNumber;
    }
    
    return cleanNumber;
  }

  /**
   * Générer un ID externe unique pour les transactions
   */
  public generateExternalId(prefix: string = 'EDU'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Test de connectivité avec l'API MTN
   */
  public async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      console.log('[MTN] ✅ Connection test successful');
      return true;
    } catch (error) {
      console.error('[MTN] ❌ Connection test failed:', error);
      return false;
    }
  }
}

// Exporter l'instance singleton
export const mtnService = MTNMobileMoneyService.getInstance();