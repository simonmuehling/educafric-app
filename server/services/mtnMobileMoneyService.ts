/**
 * SERVICE MTN MOBILE MONEY - API OFFICIELLE COLLECTIONS
 * 
 * Fonctionnalités:
 * - API MTN MoMo Collections officielle (RequestToPay)
 * - Support sandbox et production
 * - Authentification Basic auth (USER_ID:API_KEY)
 * - Webhooks pour notifications
 * - Validation des numéros MTN Cameroun
 * 
 * Documentation: https://momodeveloper.mtn.com/docs/services/collection/
 */

import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';

interface MTNAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number; // Timestamp de création
}

interface MTNRequestToPayRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'msisdn';
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
}

interface MTNRequestToPayResponse {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
  reason?: string;
}

interface MTNEnvironmentConfig {
  SUBSCRIPTION_KEY: string;
  USER_ID: string;
  API_KEY: string;
  TARGET_ENV: string;
  BASE_URL: string;
}

export class MTNMobileMoneyService {
  private static instance: MTNMobileMoneyService;
  private token: MTNAccessToken | null = null;
  private readonly environment: string;
  private readonly config: MTNEnvironmentConfig;
  private readonly callbackBase: string;

  private constructor() {
    // Déterminer l'environnement (sandbox par défaut)
    this.environment = process.env.MOMO_ENV || 'sandbox';
    this.callbackBase = process.env.BASE_URL || 'https://your-replit-app.replit.dev';
    
    // Configuration selon l'environnement
    if (this.environment === 'production') {
      this.config = {
        SUBSCRIPTION_KEY: process.env.MOMO_SUBSCRIPTION_KEY_PROD || '',
        USER_ID: process.env.MOMO_USER_ID_PROD || '',
        API_KEY: process.env.MOMO_API_KEY_PROD || '',
        TARGET_ENV: process.env.MOMO_TARGET_ENV_PROD || 'mtncameroon',
        BASE_URL: process.env.MOMO_BASE_PROD || 'https://proxy.momodeveloper.mtn.com'
      };
    } else {
      this.config = {
        SUBSCRIPTION_KEY: process.env.MOMO_SUBSCRIPTION_KEY || process.env.MTN_CUSTOMER_KEY || '',
        USER_ID: process.env.MOMO_USER_ID || process.env.MTN_CLIENT_ID || '',
        API_KEY: process.env.MOMO_API_KEY || process.env.MTN_CLIENT_SECRET || '',
        TARGET_ENV: process.env.MOMO_TARGET_ENV || 'sandbox',
        BASE_URL: process.env.MOMO_BASE || 'https://sandbox.momodeveloper.mtn.com'
      };
    }
    
    // Validation des credentials
    if (!this.config.SUBSCRIPTION_KEY || !this.config.USER_ID || !this.config.API_KEY) {
      console.error('[MTN] ❌ MTN MoMo credentials not found for environment:', this.environment);
      console.error('[MTN] 🔍 Expected variables:');
      if (this.environment === 'production') {
        console.error('[MTN] - MOMO_SUBSCRIPTION_KEY_PROD');
        console.error('[MTN] - MOMO_USER_ID_PROD');
        console.error('[MTN] - MOMO_API_KEY_PROD');
      } else {
        console.error('[MTN] - MOMO_SUBSCRIPTION_KEY (or MTN_CUSTOMER_KEY)');
        console.error('[MTN] - MOMO_USER_ID (or MTN_CLIENT_ID)');
        console.error('[MTN] - MOMO_API_KEY (or MTN_CLIENT_SECRET)');
      }
      throw new Error(`MTN MoMo credentials not configured for ${this.environment}`);
    }
    
    console.log(`[MTN] ✅ MTN MoMo Collections API initialized (${this.environment})`);
    console.log(`[MTN] 🌍 Target Environment: ${this.config.TARGET_ENV}`);
    console.log(`[MTN] 🔗 Base URL: ${this.config.BASE_URL}`);
    console.log(`[MTN] 🔑 User ID: ${this.config.USER_ID.substring(0, 8)}...`);
  }

  public static getInstance(): MTNMobileMoneyService {
    if (!MTNMobileMoneyService.instance) {
      MTNMobileMoneyService.instance = new MTNMobileMoneyService();
    }
    return MTNMobileMoneyService.instance;
  }

  /**
   * Récupération de l'Access Token via l'API Collections MTN
   * Utilise Basic Auth avec USER_ID:API_KEY
   */
  private async getAccessToken(): Promise<string> {
    try {
      console.log('[MTN] 🔑 Requesting Collections access token...');
      
      // Créer l'authentification Basic Auth (USER_ID:API_KEY)
      const credentials = Buffer.from(`${this.config.USER_ID}:${this.config.API_KEY}`).toString('base64');
      
      const response: AxiosResponse<MTNAccessToken> = await axios.post(
        `${this.config.BASE_URL}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Ocp-Apim-Subscription-Key': this.config.SUBSCRIPTION_KEY,
            'Content-Type': 'application/json'
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
      
      console.log('[MTN] ✅ Collections access token obtained successfully');
      console.log(`[MTN] 📅 Token expires in: ${tokenData.expires_in} seconds`);
      
      return tokenData.access_token;
    } catch (error: any) {
      console.error('[MTN] ❌ Failed to get Collections access token:', error.response?.data || error.message);
      throw new Error(`MTN Collections authentication failed: ${error.response?.data || error.message}`);
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
   * Valider un numéro de téléphone MTN Cameroun
   */
  public validateMTNNumber(phoneNumber: string): boolean {
    // Nettoyer le numéro
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Patterns MTN Cameroun (avec et sans indicatif +237)
    const mtnPatterns = [
      /^237(677|678|679|650|651|652|653|654|680|681|682|683)\d{6}$/, // Avec indicatif
      /^(677|678|679|650|651|652|653|654|680|681|682|683)\d{6}$/     // Sans indicatif
    ];
    
    return mtnPatterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Formater un numéro de téléphone pour l'API MTN
   */
  public formatPhoneNumber(phoneNumber: string): string {
    // Nettoyer et standardiser le format
    let cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Ajouter l'indicatif si manquant
    if (!cleaned.startsWith('237') && cleaned.length === 9) {
      cleaned = '237' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Générer un ID externe unique pour les transactions
   */
  private generateExternalId(prefix: string = 'PAY'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Créer un paiement d'abonnement via MTN Collections RequestToPay
   * Déclenche un popup USSD officiel sur le téléphone MTN du client
   */
  public async createSubscriptionPayment(params: {
    amount: number;
    currency: string;
    planName: string;
    phoneNumber: string;
    callbackUrl: string;
    returnUrl: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    txRef?: string;
    instructions?: string;
    error?: string;
  }> {
    try {
      console.log('[MTN] 🚀 Creating MTN Collections RequestToPay:', {
        amount: params.amount,
        currency: params.currency,
        planName: params.planName,
        phoneNumber: params.phoneNumber,
        environment: this.environment
      });

      // Valider le numéro MTN
      if (!this.validateMTNNumber(params.phoneNumber)) {
        throw new Error('Numéro de téléphone MTN invalide');
      }

      // Formater le numéro (sans indicatif pour l'API MTN)
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber).replace(/^237/, '');
      
      // Générer un ID externe et une référence de transaction unique
      const externalId = this.generateExternalId('SUB');
      const txRef = crypto.randomUUID();
      
      // Obtenir un token valide
      const accessToken = await this.ensureValidToken();

      // Créer la demande RequestToPay officielle MTN
      const requestToPayBody: MTNRequestToPayRequest = {
        amount: params.amount.toString(),
        currency: params.currency,
        externalId: externalId,
        payer: {
          partyIdType: 'msisdn',
          partyId: formattedPhone
        },
        payerMessage: `Abonnement EDUCAFRIC - ${params.planName}`,
        payeeNote: `Paiement ${params.planName} - ${params.amount} ${params.currency}`
      };

      console.log('[MTN] 📤 Sending RequestToPay to MTN Collections API...');
      
      const response = await axios.post(
        `${this.config.BASE_URL}/collection/v1_0/requesttopay`,
        requestToPayBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': txRef,
            'X-Target-Environment': this.config.TARGET_ENV,
            'Ocp-Apim-Subscription-Key': this.config.SUBSCRIPTION_KEY,
            'Content-Type': 'application/json',
            ...(params.callbackUrl ? { 'X-Callback-Url': params.callbackUrl } : {})
          },
          timeout: 30000
        }
      );

      if (response.status === 202) {
        console.log('[MTN] ✅ RequestToPay accepted by MTN');
        console.log(`[MTN] 📱 Official USSD prompt sent to: ${params.phoneNumber}`);
        console.log(`[MTN] 🆔 Transaction Reference: ${txRef}`);
        console.log(`[MTN] 🔗 External ID: ${externalId}`);

        return {
          success: true,
          transactionId: externalId,
          txRef: txRef,
          instructions: `Un popup USSD officiel MTN a été envoyé sur votre téléphone (${params.phoneNumber}). Suivez les instructions à l'écran pour confirmer le paiement de ${params.amount} ${params.currency} avec votre code PIN MTN.`
        };
      } else {
        const errorDetail = await response.data;
        throw new Error(`MTN RequestToPay failed (${response.status}): ${JSON.stringify(errorDetail)}`);
      }
    } catch (error: any) {
      console.error('[MTN] ❌ Error creating MTN RequestToPay:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du RequestToPay MTN'
      };
    }
  }

  /**
   * Vérifier le statut d'une transaction MTN Collections
   */
  public async getTransactionStatus(txRef: string): Promise<{
    success: boolean;
    status?: string;
    transaction?: MTNRequestToPayResponse;
    error?: string;
  }> {
    try {
      console.log(`[MTN] 🔍 Checking transaction status: ${txRef}`);
      
      const accessToken = await this.ensureValidToken();
      
      const response = await axios.get<MTNRequestToPayResponse>(
        `${this.config.BASE_URL}/collection/v1_0/requesttopay/${txRef}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': this.config.TARGET_ENV,
            'Ocp-Apim-Subscription-Key': this.config.SUBSCRIPTION_KEY
          },
          timeout: 10000
        }
      );

      const transaction = response.data;
      
      console.log(`[MTN] 📊 Transaction status: ${transaction.status}`);
      
      return {
        success: true,
        status: transaction.status,
        transaction: transaction
      };
    } catch (error: any) {
      console.error('[MTN] ❌ Error checking transaction status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification du statut'
      };
    }
  }

  /**
   * Test de connectivité avec l'API MTN Collections
   */
  public async testConnection(): Promise<boolean> {
    try {
      console.log('[MTN] 🧪 Testing MTN Collections API connection...');
      
      // Tenter d'obtenir un token pour valider la connectivité
      const token = await this.getAccessToken();
      
      if (token) {
        console.log('[MTN] ✅ Connection test successful');
        return true;
      } else {
        console.log('[MTN] ❌ Connection test failed - no token received');
        return false;
      }
    } catch (error: any) {
      console.error('[MTN] ❌ Connection test failed:', error.message);
      return false;
    }
  }
}

// Export du service singleton
export const mtnService = MTNMobileMoneyService.getInstance();